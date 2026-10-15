<?php
/**
 * Het contactformulier van het ouderscherm: een bericht van een ouder naar Kaj.
 *
 * Het bericht gaat per mail naar info@schaakmaatje.nl en wordt ook bewaard, zodat het op
 * het dashboard staat als de mail niet aankomt. Een e-mailadres is niet verplicht en
 * wordt alleen bewaard als de ouder antwoord wil. Geen IP-adres, geen koekje.
 *
 * Tegen spam: een verborgen veld dat alleen robots invullen, en hoogstens 20 berichten
 * per uur voor iedereen samen.
 */
define('TELLER', true);
require __DIR__ . '/opslag.php';

const AAN = 'info@schaakmaatje.nl';
const SOORTEN = ['fout', 'idee', 'vraag', 'anders'];
const PER_UUR = 20;

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
// gelukt is, dan probeert hij het niet anders.
if (!empty($in['website'])) {
    http_response_code(204);
    exit;
}

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

$map = dataMap();
if ($map === null) {
    http_response_code(503);
    exit;
}
$teller = $map . '/berichten-uur-' . gmdate('Y-m-d-H') . '.txt';
if (is_file($teller) && filesize($teller) >= PER_UUR) {
    http_response_code(429);
    exit;
}
file_put_contents($teller, 'x', FILE_APPEND | LOCK_EX);
foreach (glob($map . '/berichten-uur-*.txt') ?: [] as $oud) {
    if (filemtime($oud) < time() - 7200) @unlink($oud);
}

// Berichten met e-mailadressen niet langer dan een jaar bewaren.
$grens = gmdate('Y-m', strtotime('-12 months'));
foreach (glob($map . '/berichten-????-??.ndjson') ?: [] as $oud) {
    if (substr(basename($oud), 10, 7) < $grens) @unlink($oud);
}

$bericht = ['t' => gmdate('Y-m-d H:i'), 's' => $soort, 'b' => $tekst];
if ($email !== '') $bericht['e'] = $email;
$bewaard = file_put_contents(
    $map . '/berichten-' . gmdate('Y-m') . '.ndjson',
    json_encode($bericht, JSON_UNESCAPED_UNICODE) . "\n",
    FILE_APPEND | LOCK_EX
) !== false;

$onderwerp = '=?UTF-8?B?' . base64_encode('Schaakmaatje: ' . $soort . ' van een ouder') . '?=';
$koppen = "From: Schaakmaatje <" . AAN . ">\r\n"
    . "Content-Type: text/plain; charset=UTF-8\r\n"
    . "Content-Transfer-Encoding: 8bit\r\n";
if ($email !== '') $koppen .= "Reply-To: " . $email . "\r\n";
$inhoud = "Soort: " . $soort . "\n"
    . "Antwoord naar: " . ($email !== '' ? $email : '(geen adres opgegeven)') . "\n\n"
    . $tekst . "\n\n-- \nVia het contactformulier op het ouderscherm van schaakmaatje.nl\n";
$gemaild = @mail(AAN, $onderwerp, $inhoud, $koppen);

http_response_code($bewaard || $gemaild ? 204 : 503);
