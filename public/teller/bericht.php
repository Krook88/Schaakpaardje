<?php
/**
 * Het contactformulier (/contact/): een bericht van een ouder naar Kaj.
 *
 * Het bericht gaat per mail naar info@schaakmaatje.nl en wordt ook bewaard, zodat het op
 * het dashboard staat als de mail niet aankomt. Een e-mailadres is niet verplicht en
 * wordt alleen bewaard als de ouder antwoord wil. Geen koekje.
 *
 * Tegen spam en tegen iemand die het formulier voor iedereen dichtgooit:
 * - een verborgen veld dat alleen robots invullen;
 * - hoogstens 3 berichten per uur per afzender. Die herkennen we aan een hash van het
 *   IP-adres met een zout dat elke dag nieuw is; het IP-adres zelf wordt nergens
 *   bewaard, en de hash is na twee uur weg;
 * - hoogstens 60 per uur voor iedereen samen, als vangnet.
 */
define('TELLER', true);
require __DIR__ . '/opslag.php';

const AAN = 'info@schaakmaatje.nl';
const SOORTEN = ['fout', 'idee', 'vraag', 'anders'];
const PER_AFZENDER = 3;
const PER_UUR = 60;

header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}
$ruw = file_get_contents('php://input', false, null, 0, 8192);
$in = json_decode($ruw ?: '', true);
if (!is_array($in)) {
    http_response_code(400);
    exit;
}

// Het verborgen veld: een mens ziet het niet, een robot vult alles in. Doe alsof het
// gelukt is, dan probeert hij het niet anders. Het bericht wordt wel bewaard, gemarkeerd
// en zonder mail: vult een browser het veld toch eens in, dan is een ouder het niet kwijt.
$robot = !empty($in['extra_veld']);

$soort = isset($in['soort']) && is_string($in['soort']) && in_array($in['soort'], SOORTEN, true) ? $in['soort'] : null;
$tekst = isset($in['bericht']) && is_string($in['bericht']) ? trim($in['bericht']) : '';
$email = isset($in['email']) && is_string($in['email']) ? trim($in['email']) : '';
$lengte = function_exists('mb_strlen') ? mb_strlen($tekst, 'UTF-8') : strlen($tekst);
if ($soort === null || $lengte < 5 || $lengte > 2000 || !preg_match('//u', $tekst)) {
    http_response_code(400);
    exit;
}
// Een adres zonder regeleinden en volgens de regels: anders kon iemand er extra
// mailkoppen in smokkelen.
if ($email !== '' && (strlen($email) > 120 || preg_match('/[\r\n]/', $email) || !filter_var($email, FILTER_VALIDATE_EMAIL))) {
    http_response_code(400);
    exit;
}

// Geen schrijfplek: dan ook geen limiet, en dus ook niet mailen (anders kon iedereen
// onbeperkt mail naar info@ laten sturen).
$map = dataMap();
if ($map === null) {
    http_response_code(503);
    exit;
}
// Tellers en zout opruimen (GLOB_BRACE bestaat niet overal, dus drie keer).
foreach (['berichten-uur', 'afzender', 'zout'] as $soortBestand) {
    foreach (glob($map . '/' . $soortBestand . '-*') ?: [] as $oud) {
        if (filemtime($oud) < time() - 7200 && basename($oud) !== 'zout-' . gmdate('Y-m-d') . '.txt') @unlink($oud);
    }
}
ruimBerichtenOp($map);

$zoutBestand = $map . '/zout-' . gmdate('Y-m-d') . '.txt';
if (!is_file($zoutBestand)) file_put_contents($zoutBestand, bin2hex(random_bytes(16)), LOCK_EX);
$zout = (string) @file_get_contents($zoutBestand);
$afzender = substr(hash('sha256', $zout . ($_SERVER['REMOTE_ADDR'] ?? '')), 0, 16);
$uur = gmdate('Y-m-d-H');

$perAfzender = $map . '/afzender-' . $afzender . '-' . $uur . '.txt';
$iedereen = $map . '/berichten-uur-' . $uur . '.txt';
if ((is_file($perAfzender) && filesize($perAfzender) >= PER_AFZENDER) || (is_file($iedereen) && filesize($iedereen) >= PER_UUR)) {
    http_response_code(429);
    exit;
}
file_put_contents($perAfzender, 'x', FILE_APPEND | LOCK_EX);
file_put_contents($iedereen, 'x', FILE_APPEND | LOCK_EX);

$gemaild = false;
if (!$robot) {
    $labels = ['fout' => 'Een fout gezien', 'idee' => 'Een idee', 'vraag' => 'Een vraag', 'anders' => 'Iets anders'];
    $onderwerp = '=?UTF-8?B?' . base64_encode('Schaakmaatje: ' . strtolower($labels[$soort]) . ' van een ouder') . '?=';
    $tekstversie = "Soort: " . $labels[$soort] . "\n"
        . "Antwoord naar: " . ($email !== '' ? $email : '(geen adres opgegeven)') . "\n\n"
        . $tekst . "\n\n-- \nVia het contactformulier op schaakmaatje.nl/contact\n";
    $htmlversie = mailHtml($labels[$soort], $tekst, $email);
    // Twee versies in één mail: HTML in de stijl van de site, en platte tekst voor wie
    // geen HTML toont. base64: een lange alinea zou anders over de 998 bytes per regel gaan.
    $grens = 'sm-' . bin2hex(random_bytes(8));
    $koppen = "From: Schaakmaatje <" . AAN . ">\r\n"
        . "MIME-Version: 1.0\r\n"
        . "Content-Type: multipart/alternative; boundary=\"" . $grens . "\"\r\n";
    if ($email !== '') $koppen .= "Reply-To: " . $email . "\r\n";
    $inhoud = "--" . $grens . "\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($tekstversie)) . "\r\n"
        . "--" . $grens . "\r\n"
        . "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($htmlversie)) . "\r\n"
        . "--" . $grens . "--\r\n";
    // -f: de envelope-afzender ook op het eigen domein, anders keurt SPF de mail af.
    $gemaild = @mail(AAN, $onderwerp, $inhoud, $koppen, '-f' . AAN);
}

$bericht = ['t' => gmdate('Y-m-d H:i'), 's' => $soort, 'b' => $tekst, 'm' => $gemaild];
if ($email !== '') $bericht['e'] = $email;
if ($robot) $bericht['r'] = true;
$bewaard = file_put_contents(
    $map . '/berichten-' . gmdate('Y-m') . '.ndjson',
    json_encode($bericht, JSON_UNESCAPED_UNICODE) . "\n",
    FILE_APPEND | LOCK_EX
) !== false;

http_response_code($robot || $bewaard || $gemaild ? 204 : 503);

/**
 * De mail als HTML, in de kleuren van de site. Tabellen en inline stijl, want daar kunnen
 * alle mailprogramma's mee overweg; het logo als PNG van de site (geen SVG, dat toont
 * Gmail niet). Alles van de ouder gaat door htmlspecialchars.
 */
function mailHtml(string $soort, string $tekst, string $email): string
{
    $h = function ($s) { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); };
    $antwoord = $email !== ''
        ? 'Antwoorden kan direct: je antwoord gaat naar <a href="mailto:' . $h($email) . '" style="color:#b45c16">' . $h($email) . '</a>.'
        : 'De ouder heeft geen e-mailadres opgegeven.';
    return '<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>'
        . '<body style="margin:0;padding:0;background:#f5f0e6">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e6;padding:24px 12px">'
        . '<tr><td align="center">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf8;border:2px solid #ded3bf;border-radius:16px;font-family:Arial,Helvetica,sans-serif;color:#22201b">'
        . '<tr><td style="padding:20px 24px 8px">'
        . '<table role="presentation" cellpadding="0" cellspacing="0"><tr>'
        . '<td style="padding-right:12px"><img src="https://schaakmaatje.nl/mail/logo.png" width="44" height="44" alt="Schaakmaatje" style="display:block;border-radius:10px"></td>'
        . '<td style="font-size:20px;font-weight:bold">Schaakmaatje</td></tr></table>'
        . '</td></tr>'
        . '<tr><td style="padding:8px 24px 0">'
        . '<span style="display:inline-block;background:#fbead7;color:#8a4410;border:1px solid #e9c9a6;border-radius:999px;padding:4px 12px;font-size:14px;font-weight:bold">' . $h($soort) . '</span>'
        . '</td></tr>'
        . '<tr><td style="padding:16px 24px;font-size:16px;line-height:1.5">' . nl2br($h($tekst)) . '</td></tr>'
        . '<tr><td style="padding:0 24px 20px;font-size:14px;color:#6b6357;line-height:1.5">' . $antwoord . '</td></tr>'
        . '<tr><td style="background:#8fa98a;height:8px;border-radius:0 0 14px 14px;font-size:0;line-height:0">&nbsp;</td></tr>'
        . '</table>'
        . '<p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b6357;margin:12px 0 0">Via het contactformulier op <a href="https://schaakmaatje.nl/contact/" style="color:#6b6357">schaakmaatje.nl/contact</a></p>'
        . '</td></tr></table></body></html>';
}
