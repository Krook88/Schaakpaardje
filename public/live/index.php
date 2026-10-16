<?php
/**
 * Live spelen met een vriendje: twee schermen, één partij (src/play/LiveScherm.tsx).
 *
 * Draait op de eigen webhosting, naast de teller: geen dienst van buiten, geen kosten.
 * De server is alleen een brievenbus. Hij bewaart per partij de zetten, de twee plaatjes,
 * twee sleutels en wanneer elke kant voor het laatst keek, onder een willekeurige code die
 * in de speellink staat. Geen naam, geen profiel, geen IP-adres, geen cookie. Een partij
 * waar 24 uur niets mee gebeurde, wordt gewist. Besloten door Kaj, oktober 2026.
 *
 * De schaakregels kent de server niet: die zitten in de app, en beide schermen spelen
 * elke zet na met chess.js. De server bewaakt alleen wie er aan zet is (met de sleutel
 * van die kant) en dat een zet de vorm "e2e4" heeft. Wie zijn eigen sleutel misbruikt,
 * maakt alleen zijn eigen partij kapot; een derde met de link kan alleen meekijken.
 *
 * Alles gaat met POST en JSON: { "doe": "nieuw" | "meedoen" | "kijk" | "zet" | "opnieuw", ... }
 *
 * Kijken is "long polling": weet het scherm al hoe de partij stond, dan wacht de server
 * tot er iets verandert (hooguit WACHT_MAX seconden) en antwoordt dan meteen. Zo komt een
 * zet direct over. Echte push (WebSockets) kan niet op gewone webhosting. Elk wachtend
 * verzoek houdt een PHP-proces bezet, en daar zijn er op gedeelde hosting maar een paar
 * van; daarom wachten er hoogstens MAX_WACHTERS tegelijk. Daarboven antwoordt de server
 * meteen, en vraagt de app gewoon elke anderhalve seconde opnieuw.
 *
 * Geschreven voor PHP 7.4 en nieuwer, net als de teller.
 */

/** Dezelfde lijst als AVATARS in src/progress/store.ts (tests/live-php.test.ts let erop). */
const PLAATJES = ['🐴', '🦊', '🐻', '🐰', '🦉', '🐢', '🐝', '🦄'];
/** Zoveel zetten heeft geen echte partij. Daarboven is het rommel. */
const MAX_ZETTEN = 600;
/** Na zoveel uur zonder zet of bezoek is een partij weg. */
const BEWAAR_UREN = 24;
/** Zoveel partijen tegelijk, hoogstens: zo kan niemand de schijf vullen (± 30 MB). */
const MAX_PARTIJEN = 5000;
/** Zoveel nieuwe partijen per uur, voor iedereen samen. */
const NIEUW_PER_UUR = 300;
/** Zoveel nieuwe partijen per uur, per afzender: zo kan niet één persoon het voor iedereen opmaken. */
const NIEUW_PER_AFZENDER = 20;
/** Wie zo lang niet keek, is "even weg". */
const WEG_NA = 20;
/** Zo lang wacht een kijkverzoek hoogstens op een verandering. */
const WACHT_MAX = 20;
/** Zoveel kijkverzoeken mogen tegelijk wachten. */
const MAX_WACHTERS = 8;

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

/** Een code zonder letters die op elkaar lijken (geen 0/o, 1/l/i). */
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
        // De zetten van de ronde ervoor: wie de laatste zet daarvan nog niet zag (de ander
        // tikte heel snel op "Nog een keer"), kan zo toch zien hoe het afliep.
        'vorige' => $p['vorige'] ?? [],
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
    foreach (['nieuw', 'afzender', 'zout', 'wacht'] as $soort) {
        foreach (glob($map . '/' . $soort . '-*') ?: [] as $f) {
            if (filemtime($f) < time() - 7200 && basename($f) !== 'zout-' . gmdate('Y-m-d') . '.txt') @unlink($f);
        }
    }
    return $over;
}

/**
 * Eén bij een teller in een bestand optellen, als hij onder $max zit. Op slot, zodat twee
 * verzoeken tegelijk er niet samen overheen gaan.
 */
function telOp(string $bestand, int $max): bool
{
    $f = fopen($bestand, 'c+');
    if ($f === false) return false;
    flock($f, LOCK_EX);
    $n = strlen((string) stream_get_contents($f));
    $ok = $n < $max;
    if ($ok) fwrite($f, 'x');
    flock($f, LOCK_UN);
    fclose($f);
    return $ok;
}

/**
 * Wie er een partij maakt, zonder het IP-adres te bewaren: een hash met een zout dat elke
 * dag nieuw is, zoals bij het contactformulier. Na twee uur is de hash weg.
 */
function afzender(string $map): string
{
    $zoutBestand = $map . '/zout-' . gmdate('Y-m-d') . '.txt';
    if (!is_file($zoutBestand)) file_put_contents($zoutBestand, bin2hex(random_bytes(16)), LOCK_EX);
    $zout = (string) @file_get_contents($zoutBestand);
    return substr(hash('sha256', $zout . ($_SERVER['REMOTE_ADDR'] ?? '')), 0, 16);
}

/**
 * Een partij openen, op slot, en $doe laten beslissen. $doe geeft [status, antwoord,
 * nieuwe partij of null] terug. Eerst wegschrijven en het slot eraf, dan pas antwoorden:
 * zo kunnen twee schermen nooit tegelijk een zet wegschrijven, en krijgt niemand een
 * sleutel voor een partij die niet bewaard is.
 *
 * @return array{0:int,1:?array}
 */
function metPartij(string $map, string $code, callable $doe): array
{
    $bestand = $map . '/partij-' . $code . '.json';
    if (!is_file($bestand)) return [404, null];
    $f = @fopen($bestand, 'r+');
    if ($f === false) return [404, null];
    flock($f, LOCK_EX);
    $ruw = (string) stream_get_contents($f);
    $p = json_decode($ruw, true);
    if (!is_array($p)) {
        flock($f, LOCK_UN);
        fclose($f);
        return [404, null];
    }
    [$status, $uit, $nieuw] = $doe($p);
    if (is_array($nieuw)) {
        $tekst = json_encode($nieuw, JSON_UNESCAPED_UNICODE);
        ftruncate($f, 0);
        rewind($f);
        // Een volle schijf: dan de oude partij terugzetten in plaats van een leeg bestand.
        if (fwrite($f, $tekst) !== strlen($tekst)) {
            ftruncate($f, 0);
            rewind($f);
            fwrite($f, $ruw);
            [$status, $uit] = [503, null];
        }
        fflush($f);
    }
    flock($f, LOCK_UN);
    fclose($f);
    return [$status, $uit];
}

/** Bijhouden dat deze kant er nog is. Niet bij elke blik: dan schrijft de server zich suf. */
function gezien(array $p, string $kant): ?array
{
    if (($p['gezien'][$kant] ?? 0) >= time() - 5) return null;
    $p['gezien'][$kant] = time();
    return $p;
}

/** Is de stand anders dan wat het scherm al had? */
function veranderd(array $stand, array $bekend): bool
{
    return $stand['ronde'] !== ($bekend['ronde'] ?? null)
        || count($stand['zetten']) !== ($bekend['na'] ?? null)
        || ($stand['zwart'] !== null) !== ($bekend['zwart'] ?? null)
        || $stand['ander'] !== ($bekend['ander'] ?? null);
}

/**
 * Mag dit verzoek wachten, en zo ja hoe lang? Een plekje is een leeg bestand dat weggaat
 * als het verzoek klaar is (ook bij een afgebroken verbinding).
 */
function wachtTijd(string $map): int
{
    $max = (int) ini_get('max_execution_time');
    $tijd = $max > 0 ? min(WACHT_MAX, $max - 5) : WACHT_MAX;
    if ($tijd <= 0) return 0;
    $wachters = 0;
    foreach (glob($map . '/wacht-*') ?: [] as $f) {
        // Een plekje van een proces dat hard is afgebroken, telt na een minuut niet meer.
        if (filemtime($f) < time() - 60) @unlink($f);
        else $wachters++;
    }
    if ($wachters >= MAX_WACHTERS) return 0;
    $plek = $map . '/wacht-' . nieuweCode(12);
    if (@file_put_contents($plek, '') === false) return 0;
    register_shutdown_function(function () use ($plek) {
        @unlink($plek);
    });
    return $tijd;
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
        if (ruimOp($map) >= MAX_PARTIJEN) klaar(503);
        $uur = gmdate('Y-m-d-H');
        if (!telOp($map . '/afzender-' . afzender($map) . '-' . $uur . '.txt', NIEUW_PER_AFZENDER)) klaar(429);
        if (!telOp($map . '/nieuw-' . $uur . '.txt', NIEUW_PER_UUR)) klaar(429);
        do {
            $code = nieuweCode(10);
        } while (is_file($map . '/partij-' . $code . '.json'));
        $sleutel = nieuweCode(24);
        $p = [
            'wit' => $plaatje,
            'zwart' => null,
            'zetten' => [],
            'ronde' => 1,
            'vorige' => [],
            'sleutels' => ['w' => $sleutel, 'b' => null],
            'gezien' => ['w' => time(), 'b' => 0],
        ];
        if (file_put_contents($map . '/partij-' . $code . '.json', json_encode($p, JSON_UNESCAPED_UNICODE), LOCK_EX) === false) klaar(503);
        klaar(200, ['kamer' => $code, 'sleutel' => $sleutel, 'stand' => stand($p, 'w')]);

    case 'meedoen':
        // De app maakt zelf de sleutel voor zwart. Komt het antwoord niet aan en probeert
        // het vriendje het nog eens, dan herkent de server dezelfde sleutel, in plaats van
        // dat het vriendje ineens alleen nog mag meekijken.
        $code = $in['kamer'] ?? null;
        $plaatje = $in['plaatje'] ?? null;
        $sleutel = $in['sleutel'] ?? null;
        if (!isCode($code) || !in_array($plaatje, PLAATJES, true) || !isSleutel($sleutel)) klaar(400);
        [$status, $uit] = metPartij($map, $code, function (array $p) use ($plaatje, $sleutel) {
            if (!empty($p['sleutels']['b'])) {
                if (hash_equals($p['sleutels']['b'], $sleutel)) return [200, ['stand' => stand($p, 'b')], null];
                return [409, ['stand' => stand($p, null)], null];
            }
            if (hash_equals($p['sleutels']['w'], $sleutel)) return [400, null, null];
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
            return [200, ['stand' => stand($p, 'b')], $p];
        });
        klaar($status, $uit);

    case 'kijk':
        $code = $in['kamer'] ?? null;
        if (!isCode($code)) klaar(400);
        $bekend = isset($in['bekend']) && is_array($in['bekend']) ? $in['bekend'] : null;
        $eind = time() + ($bekend !== null ? wachtTijd($map) : 0);
        $sleutel = $in['sleutel'] ?? null;
        while (true) {
            [$status, $uit] = metPartij($map, $code, function (array $p) use ($sleutel) {
                $jij = kantVan($p, $sleutel);
                $nieuw = $jij !== null ? gezien($p, $jij) : null;
                return [200, stand($nieuw ?? $p, $jij), $nieuw];
            });
            if ($status !== 200 || $bekend === null || veranderd($uit, $bekend) || time() >= $eind) break;
            usleep(300000);
            clearstatcache();
        }
        klaar($status, $uit);

    case 'zet':
        $code = $in['kamer'] ?? null;
        $zet = $in['zet'] ?? null;
        $na = $in['na'] ?? null;
        $ronde = $in['ronde'] ?? null;
        if (!isCode($code) || !is_string($zet) || !preg_match('/^[a-h][1-8][a-h][1-8][qrbn]?$/', $zet) || !is_int($na) || !is_int($ronde)) klaar(400);
        [$status, $uit] = metPartij($map, $code, function (array $p) use ($in, $zet, $na, $ronde) {
            $jij = kantVan($p, $in['sleutel'] ?? null);
            if ($jij === null) return [403, null, null];
            // Een zet op een stand die niet meer bestaat (het andere scherm was sneller,
            // of er is intussen opnieuw begonnen): geen zet, wel de echte stand terug.
            if ($ronde !== $p['ronde'] || $na !== count($p['zetten'])) return [409, ['stand' => stand($p, $jij)], null];
            if (aanZet($p) !== $jij || empty($p['sleutels']['b'])) return [403, null, null];
            if (count($p['zetten']) >= MAX_ZETTEN) return [409, ['stand' => stand($p, $jij)], null];
            $p['zetten'][] = $zet;
            $p['gezien'][$jij] = time();
            return [200, stand($p, $jij), $p];
        });
        klaar($status, $uit);

    case 'opnieuw':
        // Een nieuwe partij, met dezelfde link: na de uitslag, of halverwege als een kind
        // niet verder wil. De kleuren wisselen: wie zwart had, begint nu. Of de partij uit
        // is, weet alleen de app; hier telt alleen dat de ronde klopt, zodat twee kinderen
        // die tegelijk tikken er niet twee krijgen.
        $code = $in['kamer'] ?? null;
        $ronde = $in['ronde'] ?? null;
        if (!isCode($code) || !is_int($ronde)) klaar(400);
        [$status, $uit] = metPartij($map, $code, function (array $p) use ($in, $ronde) {
            $jij = kantVan($p, $in['sleutel'] ?? null);
            if ($jij === null || empty($p['sleutels']['b'])) return [403, null, null];
            if ($ronde !== $p['ronde']) return [200, stand($p, $jij), null];
            $nieuw = [
                'wit' => $p['zwart'],
                'zwart' => $p['wit'],
                'zetten' => [],
                'ronde' => $p['ronde'] + 1,
                'vorige' => $p['zetten'],
                'sleutels' => ['w' => $p['sleutels']['b'], 'b' => $p['sleutels']['w']],
                'gezien' => ['w' => $p['gezien']['b'], 'b' => $p['gezien']['w']],
            ];
            $ik = $jij === 'w' ? 'b' : 'w';
            $nieuw['gezien'][$ik] = time();
            return [200, stand($nieuw, $ik), $nieuw];
        });
        klaar($status, $uit);

    default:
        klaar(400);
}
