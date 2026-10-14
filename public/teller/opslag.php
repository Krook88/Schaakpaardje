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
];

/** Dezelfde regel als `pad()` in src/progress/tellen.ts: alleen schermen van de app. */
const BEKEND_PAD = '#^/(|(les|lessen|kaart|spel|spelen|stal|ouders|over|diploma|opfrissen)(/[a-z0-9-]+)?/|onbekend/)$#';

/** Grootste dagbestand. Daarboven wordt niets meer bewaard: zo kan niemand de schijf vullen. */
const MAX_DAG = 5 * 1024 * 1024;

/** Een binnengekomen bericht naar een nette regel, of null als er iets niet klopt. */
function schoonmaken(array $in): ?array
{
    $naam = isset($in['name']) && is_string($in['name']) ? $in['name'] : '';
    if (!array_key_exists($naam, TELLINGEN)) return null;

    $pad = isset($in['url']) && is_string($in['url']) ? $in['url'] : '';
    if (!preg_match(BEKEND_PAD, $pad)) $pad = '/onbekend/';

    $props = [];
    if (isset($in['props']) && is_array($in['props'])) {
        foreach ($in['props'] as $k => $v) {
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
    return file_put_contents($bestand, json_encode($regel) . "\n", FILE_APPEND | LOCK_EX) !== false;
}

/** De regels van de laatste $dagen dagen, per dag. */
function leesDagen(int $dagen): array
{
    $map = dataMap();
    $uit = [];
    if ($map === null) return $uit;
    for ($i = $dagen - 1; $i >= 0; $i--) {
        $dag = gmdate('Y-m-d', time() - $i * 86400);
        $bestand = $map . '/dag-' . $dag . '.ndjson';
        $regels = [];
        if (is_file($bestand)) {
            foreach (file($bestand, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $r) {
                $d = json_decode($r, true);
                if (is_array($d)) $regels[] = $d;
            }
        }
        $uit[$dag] = $regels;
    }
    return $uit;
}
