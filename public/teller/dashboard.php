<?php
/**
 * Het dashboard van de teller: hoeveel er gespeeld wordt, hoe lang, en waar kinderen
 * afhaken. Alleen voor Kaj, achter een wachtwoord.
 *
 * Het wachtwoord staat niet in git. Bij het publiceren maakt de workflow er een hash van
 * (geheim TELLER_WACHTWOORD) en zet die in wachtwoord.php, dat van buiten dicht zit.
 * Het sessiekoekje hieronder is alleen voor wie inlogt, nooit voor een kind in de app.
 */
define('TELLER', true);
require __DIR__ . '/opslag.php';

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'");

$hashBestand = __DIR__ . '/wachtwoord.php';
$hash = is_file($hashBestand) ? (include $hashBestand) : '';

// Alleen een sessie als er al een is of als iemand inlogt: anders maakt elke bezoeker
// (of elk script) een sessiebestand aan. Het koekje geldt alleen voor /teller/.
session_set_cookie_params(['path' => '/teller/', 'httponly' => true, 'secure' => true, 'samesite' => 'Strict']);
session_name('teller');
if (isset($_COOKIE['teller']) || isset($_POST['wachtwoord'])) session_start();

if (isset($_POST['uit']) && session_status() === PHP_SESSION_ACTIVE) {
    $_SESSION = [];
    session_destroy();
    header('Location: dashboard.php');
    exit;
}
$teVaak = false;
if (isset($_POST['wachtwoord']) && is_string($hash) && $hash !== '') {
    $teVaak = pogingenOp();
    if (!$teVaak && password_verify((string) $_POST['wachtwoord'], $hash)) {
        session_regenerate_id(true);
        $_SESSION['binnen'] = true;
        header('Location: dashboard.php');
        exit;
    }
    if (!$teVaak) telPoging();
    sleep(2);
}

function e($s): string
{
    return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');
}

function pagina(string $titel, string $inhoud): void
{
    echo '<!doctype html><html lang="nl"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<meta name="robots" content="noindex, nofollow"><title>' . e($titel) . '</title><style>'
        . ':root{--bg:#f5f0e6;--kaart:#fffdf8;--tekst:#22201b;--zacht:#6b6357;--rand:#e3d9c6;--accent:#b45c16;--groen:#5f8a5c}'
        . '@media (prefers-color-scheme:dark){:root{--bg:#1a1611;--kaart:#221d16;--tekst:#f3ece0;--zacht:#b3a692;--rand:#3a3226;--accent:#e08a3c;--groen:#8fb98a}}'
        . 'body{margin:0;background:var(--bg);color:var(--tekst);font:16px/1.45 system-ui,sans-serif}'
        . 'main{max-width:960px;margin:0 auto;padding:16px}h1{font-size:1.5rem;margin:8px 0 16px}'
        . 'h2{font-size:1.1rem;margin:0 0 10px}section{background:var(--kaart);border:1px solid var(--rand);border-radius:14px;padding:14px 16px;margin:0 0 14px;overflow-x:auto}'
        . '.cijfers{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px}'
        . '.cijfer b{display:block;font-size:1.7rem}.cijfer span,.zacht{color:var(--zacht);font-size:.9rem}'
        . 'table{border-collapse:collapse;width:100%;font-size:.92rem}th,td{text-align:left;padding:5px 8px;border-bottom:1px solid var(--rand);white-space:nowrap}'
        . 'th{color:var(--zacht);font-weight:600}td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}th.midden{text-align:center}'
        . 'table.lessen th,table.lessen td{padding:5px 6px}table.lessen td:first-child{white-space:normal;min-width:9em;overflow-wrap:anywhere}'
        . '.balk{height:10px;background:var(--groen);border-radius:5px;min-width:2px}.rood{background:var(--accent)}'
        . 'form.rij{display:flex;gap:8px;flex-wrap:wrap;align-items:center}button,input{font:inherit;padding:8px 12px;border-radius:10px;border:1px solid var(--rand);background:var(--kaart);color:var(--tekst)}'
        . 'button[aria-pressed=true]{border-color:var(--accent);font-weight:700}'
        . '.raster{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}'
        . '.grafiek h3{font-size:.95rem;margin:0 0 6px}.grafiek svg{width:100%;height:auto;display:block;overflow:visible}'
        . '.s-balk{fill:var(--groen)}.s-dag:hover .s-balk{fill:var(--accent)}.s-raak{fill:transparent}'
        . '.s-as{stroke:var(--zacht);stroke-width:1}.s-raster{stroke:var(--rand);stroke-width:1}'
        . '.s-tekst{fill:var(--zacht);font-size:11px}.s-waarde{fill:var(--tekst);font-size:11px;font-weight:600}'
        . '.s-lijn{fill:none;stroke:var(--groen);stroke-width:2;stroke-linejoin:round}'
        . '.s-stip{fill:var(--groen);stroke:var(--kaart);stroke-width:2}.s-dag:hover .s-stip{fill:var(--accent)}'
        . 'details{margin-top:12px}summary{cursor:pointer}'
        . '.bericht{border-top:1px solid var(--rand);padding:10px 0}.bericht a{color:var(--accent)}'
        . '</style></head><body><main>' . $inhoud . '</main></body></html>';
}

if (!is_string($hash) || $hash === '') {
    pagina('Teller', '<h1>Teller</h1><section><p>Er is nog geen wachtwoord ingesteld. Zet in GitHub het geheim '
        . '<code>TELLER_WACHTWOORD</code> en publiceer opnieuw.</p></section>');
    exit;
}
if (empty($_SESSION['binnen'])) {
    pagina('Teller', '<h1>Teller van Schaakmaatje</h1><section>'
        . ($teVaak ? '<p>Te veel mislukte pogingen dit uur. Probeer het straks opnieuw.</p>' : '')
        . '<form method="post" class="rij">'
        . '<label for="w">Wachtwoord</label><input id="w" type="password" name="wachtwoord" autocomplete="current-password" autofocus>'
        . '<button type="submit">Inloggen</button></form></section>');
    exit;
}

/* ---------- tellen ---------- */

/**
 * Vanaf deze dag tellen zoekmachines niet meer mee (index.php weigert ze). Eerdere dagen
 * laat het dashboard weg: daarin opende Googlebot elke les uit de sitemap één keer, en dat
 * drukte "Af %" en "lessen afgemaakt" nog weken. De dagbestanden blijven gewoon bestaan.
 */
const SCHOON_VANAF = '2026-10-23';

/**
 * Vanaf deze dag stuurt de app 'Eerste opgave'. Af % (af gedeeld door speelde) telt alleen
 * "af" van vanaf deze dag, anders deelt hij oude "af" door nieuwe "speelde" en komt hij te hoog uit.
 */
const SPEELDE_VANAF = '2026-10-24';

$periode = isset($_GET['dagen']) ? (int) $_GET['dagen'] : 30;
if (!in_array($periode, [7, 30, 90], true)) $periode = 30;

$totaal = ['Bezoek' => 0, 'pageview' => 0, 'Profiel gemaakt' => 0, 'Les begonnen' => 0, 'Les af' => 0, 'Partij' => 0, 'Minispel rondje' => 0];
$lessen = [];
$duur = [];
$geoefend = [];
$partijen = [];
$spellen = [];
$lastig = [];
$binnenkomst = [];
$profielNa = [];
$schermen = [];
$verwijzers = [];
$uren = array_fill(0, 24, 0);
/** Per dag de cijfers voor het verloop. */
$dagen = [];
$leeg = ['bezoek' => 0, 'terug' => 0, 'begonnen' => 0, 'speelde' => 0, 'af' => 0, 'partij' => 0, 'rondje' => 0, 'stukken' => 0, 'lang' => 0];

loopDagen($periode, function (string $dag, ?array $r) use (
    &$totaal, &$lessen, &$duur, &$geoefend, &$partijen, &$spellen, &$lastig, &$binnenkomst, &$profielNa, &$schermen, &$verwijzers, &$uren,
    &$dagen, $leeg
) {
    if ($r === null) {
        $dagen[$dag] = $leeg;
        return;
    }
    if ($dag < SCHOON_VANAF) return;
    $n = $r['n'] ?? '';
    $e = $r['e'] ?? [];
    if (isset($totaal[$n])) $totaal[$n]++;
    switch ($n) {
        case 'Bezoek':
            $uren[(int) ($r['u'] ?? 0)]++;
            $k = $e['geoefend'] ?? '?';
            $geoefend[$k] = ($geoefend[$k] ?? 0) + 1;
            $dagen[$dag]['bezoek']++;
            if (!in_array($k, ['nog niet', '1 dag', '?'], true)) $dagen[$dag]['terug']++;
            // Waar komt een nieuw apparaat binnen? Het pad van het eerste scherm, in groepen.
            if ($k === 'nog niet') {
                $p = $r['p'] ?? '';
                $groep = $p === '/' ? 'startpagina' : (preg_match('#^/(les|schaakregels|schaakclub|over|sitemap|lessen)/#', $p, $m) ? $m[1] : 'overig');
                $binnenkomst[$groep] = ($binnenkomst[$groep] ?? 0) + 1;
            }
            break;
        case 'pageview':
            $p = $r['p'] ?? '?';
            $schermen[$p] = ($schermen[$p] ?? 0) + 1;
            if (isset($r['v'])) $verwijzers[$r['v']] = ($verwijzers[$r['v']] ?? 0) + 1;
            break;
        case 'Speelduur':
            $k = $e['duur'] ?? '?';
            $duur[$k] = ($duur[$k] ?? 0) + 1;
            $dagen[$dag]['stukken']++;
            if (in_array($k, ['5 tot 15 min', '15 tot 30 min', '30 min of meer'], true)) $dagen[$dag]['lang']++;
            break;
        case 'Profiel gemaakt':
            $k = $e['na'] ?? '?';
            $profielNa[$k] = ($profielNa[$k] ?? 0) + 1;
            break;
        case 'Les begonnen':
        case 'Les af':
        case 'Les gestopt':
        case 'Eerste opgave':
            $id = $e['les'] ?? '?';
            $l = $lessen[$id] ?? ['nieuw' => 0, 'hervat' => 0, 'speelde' => 0, 'af' => 0, 'afGemeten' => 0, 'sterren' => 0, 'gestopt' => []];
            if ($n === 'Eerste opgave') {
                $l['speelde']++;
                $dagen[$dag]['speelde']++;
            } elseif ($n === 'Les begonnen') {
                $nieuw = ($e['hervat'] ?? 'nee') !== 'ja';
                $l[$nieuw ? 'nieuw' : 'hervat']++;
                if ($nieuw) $dagen[$dag]['begonnen']++;
            } elseif ($n === 'Les af') {
                $l['af']++;
                if ($dag >= SPEELDE_VANAF) $l['afGemeten']++;
                $dagen[$dag]['af']++;
                $l['sterren'] += (int) ($e['sterren'] ?? 0);
            } else {
                $f = $e['fase'] ?? '?';
                $l['gestopt'][$f] = ($l['gestopt'][$f] ?? 0) + 1;
            }
            $lessen[$id] = $l;
            break;
        case 'Partij':
            $t = $e['tegen'] ?? '?';
            $u = $e['uitslag'] ?? '?';
            $partijen[$t][$u] = ($partijen[$t][$u] ?? 0) + 1;
            $dagen[$dag]['partij']++;
            break;
        case 'Minispel rondje':
            $s = $e['spel'] ?? '?';
            $spellen[$s] = ($spellen[$s] ?? 0) + 1;
            $dagen[$dag]['rondje']++;
            break;
        case 'Opgave lastig':
            $sleutel = ($e['les'] ?? '?') . '|' . ($e['opgave'] ?? '?');
            $hulp = ($e['hulp'] ?? '') === 'hint' ? 'hint' : 'missers';
            $o = $lastig[$sleutel] ?? ['hint' => 0, 'missers' => 0];
            $o[$hulp]++;
            $lastig[$sleutel] = $o;
            break;
    }
});

/** Lessen in de volgorde van de app, als lessen.json er is (gemaakt bij het bouwen). */
$volgorde = [];
$titels = [];
$lijst = @json_decode((string) @file_get_contents(__DIR__ . '/lessen.json'), true);
if (is_array($lijst)) {
    foreach ($lijst as $i => $les) {
        if (!isset($les['id'])) continue;
        $volgorde[$les['id']] = $i;
        $titels[$les['id']] = ($les['wereld'] ?? '') . ' · ' . ($les['titel'] ?? '');
    }
}
uksort($lessen, function ($a, $b) use ($volgorde) {
    return ($volgorde[$a] ?? 9999) <=> ($volgorde[$b] ?? 9999) ?: strcmp($a, $b);
});

function balk(int $n, int $max, bool $rood = false): string
{
    $w = $max > 0 ? max(1, (int) round($n / $max * 160)) : 0;
    return '<div class="balk' . ($rood ? ' rood' : '') . '" style="width:' . $w . 'px"></div>';
}

function verdeling(string $titel, array $tellen, array $volgorde, string $uitleg): string
{
    $max = $tellen ? max($tellen) : 0;
    $som = array_sum($tellen);
    $rijen = '';
    $sleutels = array_unique(array_merge(array_intersect($volgorde, array_keys($tellen)), array_keys($tellen)));
    foreach ($sleutels as $k) {
        $n = $tellen[$k];
        $rijen .= '<tr><td>' . e($k) . '</td><td class="n">' . $n . '</td><td class="n">'
            . ($som ? round($n / $som * 100) : 0) . '%</td><td>' . balk($n, $max) . '</td></tr>';
    }
    return '<section><h2>' . e($titel) . '</h2><p class="zacht">' . e($uitleg) . '</p>'
        . ($rijen ? '<table>' . $rijen . '</table>' : '<p class="zacht">Nog niets.</p>') . '</section>';
}

function top(string $titel, array $tellen, int $hoeveel, string $leeg): string
{
    arsort($tellen);
    $tellen = array_slice($tellen, 0, $hoeveel, true);
    $max = $tellen ? max($tellen) : 0;
    $rijen = '';
    foreach ($tellen as $k => $n) {
        $rijen .= '<tr><td>' . e($k) . '</td><td class="n">' . $n . '</td><td>' . balk($n, $max) . '</td></tr>';
    }
    return '<section><h2>' . e($titel) . '</h2>' . ($rijen ? '<table>' . $rijen . '</table>' : '<p class="zacht">' . e($leeg) . '</p>') . '</section>';
}

/**
 * Een staafdiagram per dag als SVG, zonder script (de CSP staat er geen toe). Wie over
 * een dag beweegt, ziet datum en aantal: het hele dagvak is het raakvlak, niet alleen
 * de staaf, want een dag met 1 bezoek is anders bijna niet te raken.
 */
function staven(string $titel, array $reeks): string
{
    // Ongeveer op ware grootte (een kolom is zo'n 300 px), anders krimpt de tekst mee.
    $b = 320;
    $hoog = 130;
    $boven = 16;
    $onder = 20;
    $n = max(1, count($reeks));
    $max = max(1, max($reeks ?: [0]));
    $vak = $b / $n;
    $breed = max(1.0, $vak - 1); // lucht tussen de staven
    $svg = '';
    $i = 0;
    foreach ($reeks as $dag => $waarde) {
        $x = $i * $vak;
        $hh = $waarde / $max * ($hoog - $boven - $onder);
        $y = $hoog - $onder - $hh;
        $svg .= '<g class="s-dag"><title>' . e($dag) . ': ' . $waarde . '</title>'
            . '<rect class="s-raak" x="' . round($x, 1) . '" y="0" width="' . round($vak, 1) . '" height="' . ($hoog - $onder) . '"/>'
            . ($waarde ? '<rect class="s-balk" x="' . round($x + 1, 1) . '" y="' . round($y, 1) . '" width="' . round($breed, 1)
                . '" height="' . round($hh, 1) . '" rx="' . min(2, $breed / 2) . '"/>' : '')
            . '</g>';
        $i++;
    }
    $dagenLijst = array_keys($reeks);
    $svg .= '<line class="s-as" x1="0" x2="' . $b . '" y1="' . ($hoog - $onder) . '" y2="' . ($hoog - $onder) . '"/>'
        . '<text class="s-tekst" x="0" y="' . ($hoog - 4) . '">' . e(substr((string) reset($dagenLijst), 5)) . '</text>'
        . '<text class="s-tekst" x="' . $b . '" y="' . ($hoog - 4) . '" text-anchor="end">' . e(substr((string) end($dagenLijst), 5)) . '</text>'
        . '<text class="s-tekst" x="0" y="11">hoogste: ' . $max . '</text>';
    $som = array_sum($reeks);
    return '<div class="grafiek"><h3>' . e($titel) . ' <span class="zacht">' . $som . ' in totaal</span></h3>'
        . '<svg viewBox="0 0 ' . $b . ' ' . $hoog . '" role="img" aria-label="' . e($titel) . ' per dag">' . $svg . '</svg></div>';
}

/**
 * Een percentage per week (of per dag bij 7 dagen) als lijn met punten. Elk punt draagt
 * zijn waarde: het zijn er hooguit dertien, en het getal is waar het om gaat.
 */
function lijn(string $titel, array $punten, string $uitleg): string
{
    $b = 320;
    $hoog = 150;
    $boven = 22;
    $onder = 20;
    $links = 34;
    $rechts = 22;
    $geldig = array_filter($punten, function ($p) { return $p['pct'] !== null; });
    if (!$geldig) {
        return '<div class="grafiek"><h3>' . e($titel) . '</h3><p class="zacht">Nog te weinig gegevens.</p></div>';
    }
    $n = count($punten);
    $stap = $n > 1 ? ($b - $links - $rechts) / ($n - 1) : 0;
    $yVan = function ($pct) use ($hoog, $boven, $onder) { return $hoog - $onder - $pct / 100 * ($hoog - $boven - $onder); };
    $svg = '';
    foreach ([0, 50, 100] as $raster) {
        $y = round($yVan($raster), 1);
        $svg .= '<line class="s-raster" x1="' . $links . '" x2="' . ($b - $rechts) . '" y1="' . $y . '" y2="' . $y . '"/>'
            . '<text class="s-tekst" x="' . ($links - 6) . '" y="' . ($y + 4) . '" text-anchor="end">' . $raster . '%</text>';
    }
    $pad = '';
    $stippen = '';
    $i = 0;
    foreach ($punten as $p) {
        $x = round($links + $i * $stap, 1);
        if ($p['pct'] !== null) {
            $y = round($yVan($p['pct']), 1);
            $pad .= ($pad === '' ? 'M' : 'L') . $x . ' ' . $y . ' ';
            $stippen .= '<g class="s-dag"><title>' . e($p['label']) . ': ' . $p['pct'] . '% (' . $p['teller'] . ' van ' . $p['noemer'] . ')</title>'
                . '<circle class="s-raak" cx="' . $x . '" cy="' . $y . '" r="14"/>'
                . '<circle class="s-stip" cx="' . $x . '" cy="' . $y . '" r="4"/>'
                . '<text class="s-waarde" x="' . $x . '" y="' . ($y - 9) . '" text-anchor="middle">' . $p['pct'] . '%</text></g>';
        }
        $i++;
    }
    $eerste = reset($punten);
    $laatste = end($punten);
    $svg .= '<path class="s-lijn" d="' . trim($pad) . '"/>' . $stippen
        . '<text class="s-tekst" x="' . $links . '" y="' . ($hoog - 4) . '">' . e($eerste['label']) . '</text>'
        . '<text class="s-tekst" x="' . ($b - $rechts) . '" y="' . ($hoog - 4) . '" text-anchor="end">' . e($laatste['label']) . '</text>';
    return '<div class="grafiek"><h3>' . e($titel) . '</h3><p class="zacht">' . e($uitleg) . '</p>'
        . '<svg viewBox="0 0 ' . $b . ' ' . $hoog . '" role="img" aria-label="' . e($titel) . '">' . $svg . '</svg></div>';
}

/** Dagen samenvoegen tot weken (de laatste week eindigt vandaag), of per dag bij 7 dagen. */
function perStuk(array $dagen, int $periode, string $teller, string $noemer): array
{
    $stukken = $periode <= 7 ? array_chunk($dagen, 1, true) : array_reverse(array_chunk(array_reverse($dagen, true), 7, true));
    $uit = [];
    foreach ($stukken as $stuk) {
        $t = 0;
        $nn = 0;
        foreach ($stuk as $d) {
            $t += $d[$teller];
            $nn += $d[$noemer];
        }
        $sleutels = array_keys($stuk);
        sort($sleutels);
        $label = count($sleutels) > 1 ? 'week tot ' . substr(end($sleutels), 5) : substr($sleutels[0], 5);
        $uit[] = ['label' => $label, 'pct' => $nn >= 5 ? (int) round($t / $nn * 100) : null, 'teller' => $t, 'noemer' => $nn];
    }
    return $uit;
}

/* ---------- tonen ---------- */

$h = '<h1>Teller van Schaakmaatje</h1>';
$h .= '<form method="get" class="rij" style="margin-bottom:14px">';
foreach ([7 => '7 dagen', 30 => '30 dagen', 90 => '90 dagen'] as $d => $label) {
    $h .= '<button name="dagen" value="' . $d . '" aria-pressed="' . ($d === $periode ? 'true' : 'false') . '">' . $label . '</button>';
}
$h .= '</form>';

$h .= '<section><div class="cijfers">';
foreach ([
    ['Bezoek', 'keer de app geopend'],
    ['pageview', 'schermen bekeken'],
    ['Profiel gemaakt', 'profielen gemaakt'],
    ['Les begonnen', 'lessen begonnen'],
    ['Les af', 'lessen afgemaakt'],
    ['Partij', 'partijen uitgespeeld'],
    ['Minispel rondje', 'minispelrondjes'],
] as [$k, $label]) {
    $h .= '<div class="cijfer"><b>' . $totaal[$k] . '</b><span>' . e($label) . '</span></div>';
}
$h .= '</div><p class="zacht" style="margin:10px 0 0">Er zijn geen ID\'s, dus "unieke bezoekers" bestaan hier niet: '
    . 'een bezoek is één keer de app openen. Tijden in UTC. Alleen vanaf ' . e(SCHOON_VANAF) . ': daarvóór telde '
    . 'Googlebot mee, die elke les uit de sitemap één keer opende. Zoekmachines tellen nu niet meer mee.</p></section>';

$kolom = function (string $k) use ($dagen) {
    return array_map(function ($d) use ($k) { return $d[$k]; }, $dagen);
};
$h .= '<section><h2>Verloop per dag</h2><div class="raster">'
    . staven('Bezoeken', $kolom('bezoek'))
    . staven('Lessen afgemaakt', $kolom('af'))
    . staven('Partijen', $kolom('partij'))
    . staven('Minispelrondjes', $kolom('rondje'))
    . '</div>';
$h .= '<details><summary class="zacht">Als tabel</summary><table>';
foreach (array_reverse($dagen, true) as $dag => $d) {
    $h .= '<tr><td>' . e($dag) . '</td><td class="n">' . $d['bezoek'] . ' bezoeken</td><td class="n">' . $d['af']
        . ' lessen af</td><td class="n">' . $d['partij'] . ' partijen</td><td class="n">' . $d['rondje'] . ' rondjes</td></tr>';
}
$h .= '</table></details></section>';

$per = $periode <= 7 ? 'per dag' : 'per week';
$h .= '<section><h2>Wordt het beter? (' . $per . ')</h2><p class="zacht">Percentages, zodat een drukke week niet '
    . 'vanzelf beter lijkt. Een punt verschijnt pas vanaf 5 metingen.</p><div class="raster">'
    . lijn('Lessen afgemaakt', perStuk($dagen, $periode, 'af', 'speelde'), 'Van de gespeelde lessen, hoeveel er af kwamen.')
    . lijn('Komt terug', perStuk($dagen, $periode, 'terug', 'bezoek'), 'Bezoeken van een apparaat waarop al op 2 of meer dagen geoefend is.')
    . lijn('Speelt 5 minuten of langer', perStuk($dagen, $periode, 'lang', 'stukken'), 'Van de speelstukken, hoeveel 5 minuten of langer duurden.')
    . '</div></section>';

$berichten = laatsteBerichten(30);
$h .= '<section><h2>Berichten van ouders</h2><p class="zacht">Via het formulier op /contact/. Ze gaan ook '
    . 'naar info@schaakmaatje.nl; hier staan ze voor als een mail niet aankwam. Na een jaar worden ze gewist. '
    . 'Staat er vaak "niet gemaild", dan verstuurt de hosting geen mail.</p>';
if ($berichten) {
    foreach ($berichten as $b) {
        $h .= '<div class="bericht"><p class="zacht" style="margin:0">' . e($b['t'] ?? '') . ' UTC · ' . e($b['s'] ?? '')
            . (!empty($b['r']) ? ' · <strong>waarschijnlijk een robot</strong>' : '')
            . (empty($b['r']) && isset($b['m']) && !$b['m'] ? ' · <strong>niet gemaild</strong>' : '')
            . (isset($b['e']) ? ' · <a href="mailto:' . e(rawurlencode((string) $b['e'])) . '">' . e($b['e']) . '</a>' : ' · geen adres')
            . '</p><p style="margin:4px 0 0;white-space:pre-wrap">' . e($b['b'] ?? '') . '</p></div>';
    }
} else {
    $h .= '<p class="zacht">Nog geen berichten.</p>';
}
$h .= '</section>';

// De trechter: van een nieuw apparaat naar de eerste les, af, en een profiel. Zonder ID's
// zijn het losse aantallen naast elkaar, geen gevolgde paden.
$eerste = $volgorde ? (string) array_search(0, $volgorde, true) : '';
$nieuwApparaat = $geoefend['nog niet'] ?? 0;
$stappen = [
    ['Nieuw apparaat opende de app', $nieuwApparaat],
    ['Eerste les geopend' . ($eerste !== '' ? ' (' . ($titels[$eerste] ?? $eerste) . ')' : ''), $lessen[$eerste]['nieuw'] ?? 0],
    ['Eerste les gespeeld (eerste tik op een opgave)', $lessen[$eerste]['speelde'] ?? 0],
    ['Eerste les af', $lessen[$eerste]['af'] ?? 0],
    // Zonder broertjes en zusjes: die maken geen ouder die net binnenkwam.
    ['Profiel gemaakt', $totaal['Profiel gemaakt'] - ($profielNa['al een profiel'] ?? 0)],
];
$h .= '<section><h2>Van binnenkomst naar profiel</h2><p class="zacht">Losse aantallen in dezelfde periode, geen gevolgde '
    . 'bezoekers: er zijn geen ID\'s. Een kind kan ook zonder profiel spelen; de sterren gaan mee als er later een komt.</p><table>';
foreach ($stappen as [$label, $n]) {
    $h .= '<tr><td>' . e($label) . '</td><td class="n">' . $n . '</td><td>' . balk((int) $n, max(1, $nieuwApparaat)) . '</td></tr>';
}
$h .= '</table>';
if ($profielNa) {
    $zinnen = [
        'geen les' => 'meteen (nog geen les)',
        '1 les' => 'na 1 les als gast',
        '2 of meer' => 'na 2 of meer lessen als gast',
        'al een profiel' => 'voor een tweede kind',
        '?' => 'van vóór deze meting',
    ];
    $delen = [];
    foreach ($zinnen as $k => $zin) {
        if (isset($profielNa[$k])) $delen[] = $profielNa[$k] . ' ' . $zin;
    }
    if ($delen) $h .= '<p class="zacht" style="margin:10px 0 0">Van de profielen: ' . e(implode(', ', $delen)) . '.</p>';
}
if ($binnenkomst) {
    arsort($binnenkomst);
    $h .= '<h3 style="font-size:.95rem;margin:14px 0 6px">Waar komt een nieuw apparaat binnen?</h3><table>';
    foreach ($binnenkomst as $g => $n) {
        $h .= '<tr><td>' . e($g === 'les' ? 'een les' : ($g === 'startpagina' || $g === 'overig' ? $g : '/' . $g . '/')) . '</td><td class="n">' . $n . '</td><td>'
            . balk($n, max($binnenkomst)) . '</td></tr>';
    }
    $h .= '</table>';
}
$h .= '</section>';

$fases = ['kijken', 'meedoen', 'zelf', 'toets'];
$h .= '<section><h2>Lessen: waar haken kinderen af?</h2><p class="zacht">Gestopt = weggegaan vóór het eind, '
    . 'ook door de tab te sluiten of de tablet op slot te doen. Eén keer per keer dat de les open was, '
    . 'in de fase van de eerste keer weggaan. Wie later terugkomt en de les afmaakt, telt ook bij af. '
    . 'Opende = de les geopend. Speelde = de eerste tik op een opgave. Af % = van wie speelde (vanaf ' . e(SPEELDE_VANAF) . ').</p>';
if ($lessen) {
    // Twee koprijen: "Gestopt in" boven vier smalle fasekolommen. Met "Gestopt in kijken"
    // als losse koppen was de tabel breder dan het scherm.
    // "Begon" is de pagina openen, "Speelde" de eerste tik op een opgave. Af % gaat over
    // wie speelde: wie alleen de uitleg las (of een zoekmachine) is niet afgehaakt.
    $h .= '<table class="lessen"><tr><th rowspan="2">Les</th><th rowspan="2" class="n">Opende</th><th rowspan="2" class="n">Speelde</th><th rowspan="2" class="n">Hervat</th>'
        . '<th rowspan="2" class="n">Af</th><th rowspan="2" class="n" title="Van wie speelde">Af %</th><th rowspan="2" class="n" title="Gemiddeld aantal sterren">★</th>'
        . '<th colspan="4" class="midden">Gestopt in</th></tr><tr>';
    foreach ($fases as $f) $h .= '<th class="n">' . e($f) . '</th>';
    $h .= '</tr>';
    foreach ($lessen as $id => $l) {
        $begonnen = $l['nieuw'];
        $speelde = $l['speelde'] ?? 0;
        $pct = $speelde ? min(100, round($l['afGemeten'] / $speelde * 100)) : null;
        $h .= '<tr><td title="' . e($id) . '">' . e($titels[$id] ?? $id) . '</td><td class="n">' . $begonnen
            . '</td><td class="n">' . $speelde . '</td><td class="n">' . $l['hervat'] . '</td><td class="n">' . $l['af'] . '</td><td class="n">'
            . ($pct === null ? '' : $pct . '%') . '</td><td class="n">'
            . ($l['af'] ? number_format($l['sterren'] / $l['af'], 1, ',', '') : '') . '</td>';
        foreach ($fases as $f) {
            $n = $l['gestopt'][$f] ?? 0;
            $h .= '<td class="n">' . ($n ?: '') . '</td>';
        }
        $h .= '</tr>';
    }
    $h .= '</table>';
} else {
    $h .= '<p class="zacht">Nog geen lessen.</p>';
}
$h .= '</section>';

// Waar lopen kinderen vast: per opgave hoe vaak er om een hint gevraagd of vaak mis
// getikt werd, als deel van hoe vaak de les begon. Absolute aantallen zetten de lessen
// uit de eerste werelden altijd bovenaan, alleen omdat daar de meeste kinderen zijn.
$h .= '<section><h2>Opgaven: waar lopen kinderen vast?</h2><p class="zacht">Per opgave: hoe vaak een kind om een hint '
    . 'vroeg, en hoe vaak het vaak mis tikte (3 keer, bij een quiz 2 keer). "Vast" is het hoogste van de twee, als deel '
    . 'van hoe vaak de les begon. De lastigste bovenaan. "zelf 2" is de tweede opgave in de fase zelf.</p>';
if ($lastig) {
    $rijen = [];
    foreach ($lastig as $sleutel => $o) {
        [$id, $opgave] = explode('|', $sleutel, 2);
        $begon = isset($lessen[$id]) ? $lessen[$id]['nieuw'] + $lessen[$id]['hervat'] : 0;
        $vast = max($o['hint'], $o['missers']);
        $rijen[] = ['id' => $id, 'opgave' => $opgave, 'o' => $o, 'begon' => $begon,
            'pct' => $begon ? min(100, (int) round($vast / $begon * 100)) : null, 'vast' => $vast];
    }
    usort($rijen, function ($a, $b) {
        return ($b['pct'] ?? -1) <=> ($a['pct'] ?? -1) ?: $b['vast'] <=> $a['vast'];
    });
    // "Vast" direct na de les: daarop staat de tabel gesorteerd, en op een telefoon viel
    // hij als laatste kolom buiten beeld (negentiende review, L2).
    $h .= '<table class="lessen"><tr><th>Les</th><th class="n">Vast</th><th>Opgave</th><th class="n">Begon</th>'
        . '<th class="n">Hint</th><th class="n">Vaak mis</th></tr>';
    foreach (array_slice($rijen, 0, 30) as $r) {
        // "zelf-2" is de plek in de fase; voor het lezen "zelf 2" (kort, past op een telefoon).
        $plek = preg_replace('/^([a-z]+)-(\d+)$/', '$1 $2', $r['opgave']);
        $h .= '<tr><td title="' . e($r['id']) . '">' . e($titels[$r['id']] ?? $r['id']) . '</td><td class="n">'
            . ($r['pct'] === null ? '' : $r['pct'] . '%') . '</td><td>' . e($plek) . '</td><td class="n">' . $r['begon']
            . '</td><td class="n">' . ($r['o']['hint'] ?: '') . '</td><td class="n">' . ($r['o']['missers'] ?: '') . '</td></tr>';
    }
    $h .= '</table><p class="zacht">Het opgavenummer is de plek in de fase: wordt er in een les een opgave verschoven, '
        . 'dan tellen oude en nieuwe tellingen onder hetzelfde nummer.</p>';
} else {
    $h .= '<p class="zacht">Nog geen opgaven waar een kind vastliep.</p>';
}
$h .= '</section>';

$h .= verdeling('Hoe lang wordt er gespeeld?', $duur,
    ['minder dan 1 min', '1 tot 5 min', '5 tot 15 min', '15 tot 30 min', '30 min of meer'],
    'Aaneengesloten tijd dat de app in beeld was. Even van tab wisselen begint een nieuw stuk.');
$h .= verdeling('Komen ze terug?', $geoefend,
    ['nog niet', '1 dag', '2 dagen', '3 tot 5 dagen', '6 tot 10 dagen', 'meer dan 10 dagen'],
    'Bij elk bezoek: op hoeveel verschillende dagen er op dat apparaat al geoefend is.');

$h .= '<section><h2>Partijen</h2>';
if ($partijen) {
    $h .= '<table><tr><th>Tegen</th><th>Gewonnen</th><th>Verloren</th><th>Remise</th></tr>';
    ksort($partijen);
    foreach ($partijen as $t => $u) {
        $h .= '<tr><td>' . e($t) . '</td><td class="n">' . ($u['gewonnen'] ?? 0) . '</td><td class="n">'
            . ($u['verloren'] ?? 0) . '</td><td class="n">' . ($u['remise'] ?? 0) . '</td></tr>';
    }
    $h .= '</table><p class="zacht">Bij samen spelen staat "gewonnen" voor een uitgespeelde partij met een winnaar.</p>';
} else {
    $h .= '<p class="zacht">Nog geen partijen.</p>';
}
$h .= '</section>';

$h .= top('Minispellen (gehaalde rondjes)', $spellen, 20, 'Nog geen rondjes.');
$h .= top('Meest bekeken schermen', $schermen, 20, 'Nog niets.');
$h .= top('Waar komen bezoekers vandaan?', $verwijzers, 10, 'Nog geen verwijzingen: bezoekers typten het adres zelf of kwamen via een app.');

$piek = max($uren);
$h .= '<section><h2>Hoe laat? (UTC)</h2><table>';
foreach ($uren as $u => $n) {
    if (!$n) continue;
    $h .= '<tr><td>' . sprintf('%02d:00', $u) . '</td><td class="n">' . $n . '</td><td>' . balk($n, $piek) . '</td></tr>';
}
$h .= '</table></section>';

$h .= '<form method="post"><button name="uit" value="1">Uitloggen</button></form>';

pagina('Teller van Schaakmaatje', $h);
