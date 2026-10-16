<?php
/**
 * Live spelen met een vriendje: twee schermen, één partij (src/play/LiveScherm.tsx).
 *
 * Draait op de eigen webhosting, naast de teller: geen dienst van buiten, geen kosten.
 * De server is alleen een brievenbus. Hij bewaart per partij de zetten, de twee plaatjes
 * en twee sleutels, onder een willekeurige code die in de speellink staat. Geen naam,
 * geen profiel, geen IP-adres, geen cookie. Een partij waar 24 uur niets mee gebeurde,
 * wordt gewist. Besloten door Kaj, oktober 2026.
 *
 * De schaakregels kent de server niet: die zitten in de app, en beide schermen spelen
 * elke zet na met chess.js. De server bewaakt alleen wie er aan zet is (met de sleutel
 * van die kant) en dat een zet de vorm "e2e4" heeft. Wie zijn eigen sleutel misbruikt,
 * maakt alleen zijn eigen partij kapot; een derde met de link kan alleen meekijken.
 *
 * Alles gaat met POST en JSON: { "doe": "nieuw" | "meedoen" | "kijk" | "zet" | "opnieuw", ... }
 *
 * Geschreven voor PHP 7.4 en nieuwer, net als de teller.
 */

/** Dezelfde lijst als AVATARS in src/progress/store.ts (tests/live-php.test.ts let erop). */
const PLAATJES = ['🐴', '🦊', '🐻', '🐰', '🦉', '🐢', '🐝', '🦄'];
/** Zoveel zetten heeft geen echte partij. Daarboven is het rommel. */
const MAX_ZETTEN = 600;
/** Na zoveel uur zonder zet of bezoek is een partij weg. */
const BEWAAR_UREN = 24;
/** Zoveel partijen tegelijk, hoogstens: zo kan niemand de schijf vullen. */
const MAX_PARTIJEN = 5000;
/** Zoveel nieuwe partijen per uur, voor iedereen samen. */
const NIEUW_PER_UUR = 300;
/** Wie zo lang niet keek, is "even weg". De app kijkt elke anderhalve seconde. */
const WEG_NA = 20;

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

function klaar(int $status, ?array $uit = null): void
{
    http_response_code($status);
    if ($uit !== null) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($uit, JSON_UNESCAPED_UNICODE);
    }
    exit;
}

/**
 * Waar de partijen staan. Liefst naast de webmap, waar de webserver niets van laat zien;
 * lukt dat niet, dan in data/ hier, die met .htaccess dicht zit. LIVE_DATA is voor de
 * tests en de doorloop.
 */
function dataMap(): ?string
{
    $kandidaten = [dirname(__DIR__, 2) . '/live-data', __DIR__ . '/data'];
    $env = getenv('LIVE_DATA');
    if (is_string($env) && $env !== '') $kandidaten = [$env];
    foreach ($kandidaten as $map) {
        if (!is_dir($map)) @mkdir($map, 0700, true);
        if (is_dir($map) && is_writable($map)) return $map;
    }
    return null;
}

/** Een code van tien tekens zonder letters die op elkaar lijken (geen 0/o, 1/l/i). */
function nieuweCode(int $lengte): string
{
    $tekens = 'abcdefghjkmnpqrstuvwxyz23456789';
    $uit = '';
    foreach (str_split(random_bytes($lengte)) as $b) $uit .= $tekens[ord($b) % strlen($tekens)];
    return $uit;
}

function isCode($c): bool
{
    return is_string($c) && preg_match('/^[a-z2-9]{10}$/', $c) === 1;
}

function isSleutel($s): bool
{
    return is_string($s) && preg_match('/^[a-z2-9]{24}$/', $s) === 1;
}

/** Wie er aan zet is: wit bij een even aantal zetten. */
function aanZet(array $p): string
{
    return count($p['zetten']) % 2 === 0 ? 'w' : 'b';
}

/** Welke kant hoort bij deze sleutel, of null. */
function kantVan(array $p, $sleutel): ?string
{
    if (!isSleutel($sleutel)) return null;
    foreach (['w', 'b'] as $k) {
        if (isset($p['sleutels'][$k]) && hash_equals($p['sleutels'][$k], $sleutel)) return $k;
    }
    return null;
}

/** Wat een scherm te zien krijgt. Nooit de sleutels. */
function stand(array $p, ?string $jij): array
{
    $ander = null;
    if ($jij !== null) {
        $k = $jij === 'w' ? 'b' : 'w';
        if (empty($p['sleutels'][$k])) $ander = 'nog-niet';
        else $ander = ($p['gezien'][$k] ?? 0) >= time() - WEG_NA ? 'er' : 'weg';
    }
    return [
        'wit' => $p['wit'],
        'zwart' => $p['zwart'],
        'zetten' => $p['zetten'],
        'ronde' => $p['ronde'],
        'jij' => $jij,
        'ander' => $ander,
    ];
}

/** Lopende partijen ouder dan BEWAAR_UREN weggooien, en tellen wat er over is. */
function ruimOp(string $map): int
{
    $over = 0;
    foreach (glob($map . '/partij-*.json') ?: [] as $f) {
        if (filemtime($f) < time() - BEWAAR_UREN * 3600) @unlink($f);
        else $over++;
    }
    foreach (glob($map . '/nieuw-*.txt') ?: [] as $f) {
        if (filemtime($f) < time() - 7200) @unlink($f);
    }
    return $over;
}

/**
 * Een partij openen, op slot, en $doe laten beslissen. Geeft $doe een array terug, dan
 * wordt dat de nieuwe partij. Zo kunnen twee schermen nooit tegelijk een zet wegschrijven.
 */
function metPartij(string $map, string $code, callable $doe): void
{
    $bestand = $map . '/partij-' . $code . '.json';
    if (!is_file($bestand)) klaar(404);
    $f = fopen($bestand, 'r+');
    if ($f === false) klaar(503);
    flock($f, LOCK_EX);
    $p = json_decode((string) stream_get_contents($f), true);
    if (!is_array($p)) {
        flock($f, LOCK_UN);
        fclose($f);
        klaar(404);
    }
    $nieuw = $doe($p);
    if (is_array($nieuw)) {
        ftruncate($f, 0);
        rewind($f);
        fwrite($f, json_encode($nieuw, JSON_UNESCAPED_UNICODE));
        fflush($f);
    }
    flock($f, LOCK_UN);
    fclose($f);
}

/** Bijhouden dat deze kant er nog is. Niet bij elke blik: dan schrijft de server zich suf. */
function gezien(array $p, string $kant): ?array
{
    if (($p['gezien'][$kant] ?? 0) >= time() - 5) return null;
    $p['gezien'][$kant] = time();
    return $p;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') klaar(405);
$ruw = file_get_contents('php://input', false, null, 0, 2048);
$in = json_decode($ruw ?: '', true);
if (!is_array($in) || !isset($in['doe']) || !is_string($in['doe'])) klaar(400);
$map = dataMap();
if ($map === null) klaar(503);

switch ($in['doe']) {
    case 'nieuw':
        $plaatje = $in['plaatje'] ?? null;
        if (!in_array($plaatje, PLAATJES, true)) klaar(400);
        $uurBestand = $map . '/nieuw-' . gmdate('Y-m-d-H') . '.txt';
        if (is_file($uurBestand) && filesize($uurBestand) >= NIEUW_PER_UUR) klaar(429);
        if (ruimOp($map) >= MAX_PARTIJEN) klaar(503);
        file_put_contents($uurBestand, 'x', FILE_APPEND | LOCK_EX);
        do {
            $code = nieuweCode(10);
        } while (is_file($map . '/partij-' . $code . '.json'));
        $sleutel = nieuweCode(24);
        $p = [
            'wit' => $plaatje,
            'zwart' => null,
            'zetten' => [],
            'ronde' => 1,
            'sleutels' => ['w' => $sleutel, 'b' => null],
            'gezien' => ['w' => time(), 'b' => 0],
        ];
        if (file_put_contents($map . '/partij-' . $code . '.json', json_encode($p, JSON_UNESCAPED_UNICODE), LOCK_EX) === false) klaar(503);
        klaar(200, ['kamer' => $code, 'sleutel' => $sleutel, 'stand' => stand($p, 'w')]);

    case 'meedoen':
        $code = $in['kamer'] ?? null;
        $plaatje = $in['plaatje'] ?? null;
        if (!isCode($code) || !in_array($plaatje, PLAATJES, true)) klaar(400);
        metPartij($map, $code, function (array $p) use ($plaatje) {
            if (!empty($p['sleutels']['b'])) klaar(409, ['stand' => stand($p, null)]);
            $sleutel = nieuweCode(24);
            // Hetzelfde plaatje als wit kan niet: dan weet niemand meer wie wie is.
            if ($plaatje === $p['wit']) {
                foreach (PLAATJES as $ander) {
                    if ($ander !== $p['wit']) {
                        $plaatje = $ander;
                        break;
                    }
                }
            }
            $p['sleutels']['b'] = $sleutel;
            $p['zwart'] = $plaatje;
            $p['gezien']['b'] = time();
            // Eerst wegschrijven, dan pas de sleutel geven: metPartij schrijft na $doe.
            $GLOBALS['antwoord'] = ['sleutel' => $sleutel, 'stand' => stand($p, 'b')];
            return $p;
        });
        klaar(200, $GLOBALS['antwoord']);

    case 'kijk':
        $code = $in['kamer'] ?? null;
        if (!isCode($code)) klaar(400);
        metPartij($map, $code, function (array $p) use ($in) {
            $jij = kantVan($p, $in['sleutel'] ?? null);
            $nieuw = $jij !== null ? gezien($p, $jij) : null;
            $GLOBALS['antwoord'] = stand($nieuw ?? $p, $jij);
            return $nieuw;
        });
        klaar(200, $GLOBALS['antwoord']);

    case 'zet':
        $code = $in['kamer'] ?? null;
        $zet = $in['zet'] ?? null;
        $na = $in['na'] ?? null;
        $ronde = $in['ronde'] ?? null;
        if (!isCode($code) || !is_string($zet) || !preg_match('/^[a-h][1-8][a-h][1-8][qrbn]?$/', $zet) || !is_int($na) || !is_int($ronde)) klaar(400);
        metPartij($map, $code, function (array $p) use ($in, $zet, $na, $ronde) {
            $jij = kantVan($p, $in['sleutel'] ?? null);
            if ($jij === null) klaar(403);
            // Een zet op een stand die niet meer bestaat (het andere scherm was sneller,
            // of er is intussen opnieuw begonnen): geen zet, wel de echte stand terug.
            if ($ronde !== $p['ronde'] || $na !== count($p['zetten'])) klaar(409, ['stand' => stand($p, $jij)]);
            if (aanZet($p) !== $jij || empty($p['sleutels']['b'])) klaar(403);
            if (count($p['zetten']) >= MAX_ZETTEN) klaar(409, ['stand' => stand($p, $jij)]);
            $p['zetten'][] = $zet;
            $p['gezien'][$jij] = time();
            $GLOBALS['antwoord'] = stand($p, $jij);
            return $p;
        });
        klaar(200, $GLOBALS['antwoord']);

    case 'opnieuw':
        // Nog een partij, met dezelfde link. De kleuren wisselen: wie zwart had, begint nu.
        // Of de partij echt uit is, weet alleen de app; hier telt alleen dat de ronde klopt,
        // zodat twee kinderen die tegelijk op "Nog een keer" tikken er niet twee krijgen.
        $code = $in['kamer'] ?? null;
        $ronde = $in['ronde'] ?? null;
        if (!isCode($code) || !is_int($ronde)) klaar(400);
        metPartij($map, $code, function (array $p) use ($in, $ronde) {
            $jij = kantVan($p, $in['sleutel'] ?? null);
            if ($jij === null || empty($p['sleutels']['b'])) klaar(403);
            if ($ronde !== $p['ronde']) klaar(200, stand($p, $jij));
            $p = [
                'wit' => $p['zwart'],
                'zwart' => $p['wit'],
                'zetten' => [],
                'ronde' => $p['ronde'] + 1,
                'sleutels' => ['w' => $p['sleutels']['b'], 'b' => $p['sleutels']['w']],
                'gezien' => ['w' => $p['gezien']['b'], 'b' => $p['gezien']['w']],
            ];
            $p['gezien'][$jij === 'w' ? 'b' : 'w'] = time();
            $GLOBALS['antwoord'] = stand($p, $jij === 'w' ? 'b' : 'w');
            return $p;
        });
        klaar(200, $GLOBALS['antwoord']);

    default:
        klaar(400);
}
