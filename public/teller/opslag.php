<?php
/**
 * De eigen teller van Schaakmaatje: gedeelde regels voor ontvangen en tonen.
 *
 * Draait op de eigen webhosting (TransIP), zonder dienst van buiten en zonder kosten.
 * Er wordt niets bewaard over een kind of een bezoeker: geen IP-adres, geen cookie, geen
 * ID. Alleen losse tellingen ("les toren-1 is begonnen") met het uur waarin ze binnenkwamen.
 * Wat er binnenkomt wordt hier streng gecontroleerd: een onbekende telling, eigenschap of
 * waarde wordt geweigerd, zodat er ook met een vervalst bericht geen tekst in komt.
 *
 * Geschreven voor PHP 7.4 en nieuwer: welke versie de hosting draait, weten we niet zeker.
 */

if (!defined('TELLER')) {
    http_response_code(403);
    exit;
}

/** Dezelfde lijst als in tests/tellen.test.ts. Iets nieuws tellen? Daar ook bijzetten. */
const TELLINGEN = [
    'pageview' => [],
    'Les begonnen' => ['les', 'hervat'],
    'Les af' => ['les', 'sterren'],
    'Les gestopt' => ['les', 'fase'],
    'Partij' => ['tegen', 'uitslag'],
    'Minispel rondje' => ['spel', 'rondje'],
    'Bezoek' => ['geoefend'],
    'Speelduur' => ['duur'],
    'Profiel gemaakt' => ['na'],
    'Eerste opgave' => ['les'],
    'Opgave lastig' => ['les', 'opgave', 'hulp'],
];

/**
 * Zoekmachines en meetprogramma's: dezelfde lijst als `BOT` in src/progress/tellen.ts.
 * De User-Agent wordt alleen gelezen om te weigeren, en nooit bewaard.
 */
const BOT = '#googlebot|google-inspectiontool|googleother|storebot-google|google-read-aloud|mediapartners-google|apis-google|adsbot|bingbot|bingpreview|yandexbot|yandexrender|gptbot|oai-searchbot|claudebot|amazonbot|perplexitybot|baiduspider|duckduckbot|slurp|applebot|petalbot|semrush|ahrefs|mj12bot|dotbot|facebookexternalhit|crawler|spider|headlesschrome|lighthouse|pagespeed|gtmetrix|python-requests|curl\/|wget#i';

function isBot(): bool
{
    $ua = isset($_SERVER['HTTP_USER_AGENT']) && is_string($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
    return preg_match(BOT, $ua) === 1;
}

/** Dezelfde regel als `pad()` in src/progress/tellen.ts: alleen schermen van de app. */
const BEKEND_PAD = '#^/(|(les|lessen|kaart|spel|spelen|stal|ouders|over|diploma|opfrissen|contact|schaakregels|schaakclub|sitemap)(/[a-z0-9-]+)?/|onbekend/)$#';

/** Grootste dagbestand. Daarboven wordt niets meer bewaard: zo kan niemand de schijf vullen. */
const MAX_DAG = 1024 * 1024; // ruim 10.000 echte tellingen

/** Een binnengekomen bericht naar een nette regel, of null als er iets niet klopt. */
function schoonmaken(array $in): ?array
{
    $naam = isset($in['name']) && is_string($in['name']) ? $in['name'] : '';
    if (!array_key_exists($naam, TELLINGEN)) return null;

    $pad = isset($in['url']) && is_string($in['url']) ? $in['url'] : '';
    if (!preg_match(BEKEND_PAD, $pad)) $pad = '/onbekend/';

    $props = [];
    $gekregen = isset($in['props']) && is_array($in['props']) ? $in['props'] : [];
    // Precies de eigenschappen van de lijst, niet meer en niet minder.
    $sleutels = array_keys($gekregen);
    sort($sleutels);
    $nodig = TELLINGEN[$naam];
    sort($nodig);
    if ($sleutels !== $nodig) return null;
    if ($gekregen) {
        foreach ($gekregen as $k => $v) {
            if (!in_array($k, TELLINGEN[$naam], true)) return null;
            if (is_int($v) && $v >= 0 && $v <= 1000) {
                $props[$k] = $v;
            } elseif (is_string($v) && preg_match('/^[a-z0-9 -]{1,40}$/', $v)) {
                $props[$k] = $v;
            } else {
                return null;
            }
        }
    }

    // Van welke site iemand kwam, alleen de naam (google.com), niet het hele adres.
    $van = null;
    if (isset($in['referrer']) && is_string($in['referrer'])) {
        $host = parse_url($in['referrer'], PHP_URL_HOST);
        if (is_string($host) && preg_match('/^[a-z0-9.-]{1,80}$/i', $host)) {
            $host = strtolower(preg_replace('/^www\./i', '', $host));
            if ($host !== 'schaakmaatje.nl') $van = $host;
        }
    }

    $regel = ['u' => gmdate('H'), 'n' => $naam, 'p' => $pad];
    if ($props) $regel['e'] = $props;
    if ($van !== null) $regel['v'] = $van;
    return $regel;
}

/**
 * Waar de tellingen staan. Liefst naast de webmap, waar de webserver niets van laat zien;
 * lukt dat niet, dan in data/ hier, die met .htaccess dicht zit.
 */
function dataMap(): ?string
{
    foreach ([dirname(__DIR__, 2) . '/teller-data', __DIR__ . '/data'] as $map) {
        if (!is_dir($map)) @mkdir($map, 0700, true);
        if (is_dir($map) && is_writable($map)) return $map;
    }
    return null;
}

function bewaar(array $regel): bool
{
    $map = dataMap();
    if ($map === null) return false;
    $bestand = $map . '/dag-' . gmdate('Y-m-d') . '.ndjson';
    if (is_file($bestand) && filesize($bestand) > MAX_DAG) return false;
    if (mt_rand(1, 500) === 1) ruimOp($map);
    return file_put_contents($bestand, json_encode($regel) . "\n", FILE_APPEND | LOCK_EX) !== false;
}

/**
 * Loopt de regels van de laatste $dagen dagen langs, één voor één, en geeft ze aan $doe
 * (dag, regel). Niet eerst alles inlezen: met volle dagbestanden liep het geheugen vol
 * en gaf het dashboard een witte pagina.
 */
function loopDagen(int $dagen, callable $doe): void
{
    $map = dataMap();
    for ($i = $dagen - 1; $i >= 0; $i--) {
        $dag = gmdate('Y-m-d', time() - $i * 86400);
        $doe($dag, null);
        if ($map === null) continue;
        $bestand = $map . '/dag-' . $dag . '.ndjson';
        if (!is_file($bestand)) continue;
        $f = fopen($bestand, 'r');
        if ($f === false) continue;
        while (($r = fgets($f, 4096)) !== false) {
            $d = json_decode($r, true);
            if (is_array($d)) $doe($dag, $d);
        }
        fclose($f);
    }
}

/** Dagbestanden ouder dan ruim een jaar opruimen. Af en toe, bij het bewaren. */
function ruimOp(string $map): void
{
    $grens = gmdate('Y-m-d', time() - 400 * 86400);
    foreach (glob($map . '/dag-*.ndjson') ?: [] as $bestand) {
        if (substr(basename($bestand), 4, 10) < $grens) @unlink($bestand);
    }
}

/**
 * Mislukte inlogpogingen, voor alle bezoekers samen: hoogstens 10 per uur. Een wachtwoord
 * raden met veel verzoeken tegelijk lukt dan niet meer.
 */
function pogingenOp(): bool
{
    $map = dataMap();
    if ($map === null) return true;
    $bestand = $map . '/pogingen-' . gmdate('Y-m-d-H') . '.txt';
    return is_file($bestand) && filesize($bestand) >= 10;
}

function telPoging(): void
{
    $map = dataMap();
    if ($map === null) return;
    file_put_contents($map . '/pogingen-' . gmdate('Y-m-d-H') . '.txt', 'x', FILE_APPEND | LOCK_EX);
    foreach (glob($map . '/pogingen-*.txt') ?: [] as $oud) {
        if (filemtime($oud) < time() - 7200) @unlink($oud);
    }
}

/**
 * Berichten van ouders (met e-mailadressen) niet langer dan een jaar bewaren: alles van
 * vóór de maand van elf maanden geleden gaat weg. Draait bij elk bericht en bij elk
 * bezoek aan het dashboard, zodat het ook gebeurt als er geen berichten meer komen.
 */
function ruimBerichtenOp(string $map): void
{
    $grens = gmdate('Y-m', strtotime('-11 months', strtotime(gmdate('Y-m-15'))));
    foreach (glob($map . '/berichten-????-??.ndjson') ?: [] as $oud) {
        if (substr(basename($oud), 10, 7) < $grens) @unlink($oud);
    }
}

/** De laatste berichten van ouders, nieuwste eerst (uit de afgelopen drie maanden). */
function laatsteBerichten(int $hoeveel): array
{
    $map = dataMap();
    if ($map === null) return [];
    ruimBerichtenOp($map);
    $uit = [];
    for ($i = 0; $i < 3 && count($uit) < $hoeveel; $i++) {
        $bestand = $map . '/berichten-' . gmdate('Y-m', strtotime("-$i months", strtotime(gmdate('Y-m-15')))) . '.ndjson';
        if (!is_file($bestand)) continue;
        $regels = file($bestand, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        foreach (array_reverse($regels) as $r) {
            $d = json_decode($r, true);
            if (is_array($d)) $uit[] = $d;
            if (count($uit) >= $hoeveel) break;
        }
    }
    return $uit;
}
