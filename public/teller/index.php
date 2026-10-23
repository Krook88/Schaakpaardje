<?php
/**
 * Ontvangt een anonieme telling van de app (src/progress/tellen.ts) en bewaart hem.
 * Zie opslag.php voor wat er wel en niet bewaard wordt.
 */
define('TELLER', true);
require __DIR__ . '/opslag.php';

header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}
// Een zoekmachine die de app doorloopt is geen bezoeker. Wel "gelukt" antwoorden: een
// foutcode laat hem alleen opnieuw proberen.
// Wie zelf met curl test: geef -A 'Mozilla/5.0' mee, anders telt het niet. De kop zegt
// dat, zodat een 204 zonder tellingen niet op een kapotte teller lijkt.
if (isBot()) {
    header('X-Teller: genegeerd');
    http_response_code(204);
    exit;
}
// Een telling is klein. Wat langer is, is geen telling.
$ruw = file_get_contents('php://input', false, null, 0, 2048);
$in = json_decode($ruw ?: '', true);
$regel = is_array($in) ? schoonmaken($in) : null;
if ($regel === null) {
    http_response_code(400);
    exit;
}
http_response_code(bewaar($regel) ? 204 : 507);
