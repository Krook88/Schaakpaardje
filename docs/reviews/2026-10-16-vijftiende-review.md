# Vijftiende review, 16 oktober 2026

Scope: `4f23b8f` en de herstelronde erna. Live spelen met een vriendje: `public/live/index.php`,
`src/play/live.ts`, `src/play/LiveScherm.tsx`, route `/spelen/live/`, de doorloopstap
`liveMetEenVriendje()`, de privacyteksten. In de herstelronde is ook long polling
toegevoegd (op verzoek van Kaj: zetten moeten direct overkomen).

Reviewers: schaakmeester, layout-reviewer en codebase-reviewer. De releasecoördinator
kon in deze sessie zelf geen reviewers starten; ze zijn daarom rechtstreeks gestart en
dit rapport is daarna gebundeld.

Na de herstelronde: `npm run check` groen (306 tests), doorloop 14/14.

## Oordeel

- **Schaakmeester:** GO. Niets blokkerends; S1 en S2 wilde de schaakmeester vóór de release opgelost hebben.
- **Codebase:** GO. Niets blokkerends; vier belangrijke punten.
- **Layout:** NO-GO vanwege L1 (wie wegloopt, vindt zijn partij niet terug).

*Bijgewerkt na de herstelronde: alles opgelost, behalve wat hieronder met een reden open
staat. Oordeel nu: **GO**, nadat Kaj de privacy-uitzondering in de PR bevestigt (C12).*

## Blokkerend

| | Bevinding | Status |
|---|---|---|
| L1 | Wie halverwege via "Terug" weggaat en via de kaart terugkomt, kwam op het startscherm. De partij was niet meer terug te vinden; het vriendje bleef "even weg" zien. | **Opgelost**: het apparaat onthoudt de laatste partij met een sleutel. Het startscherm biedt dan als eerste knop "▶️ Verder spelen tegen 🦊" aan. Doorloopregel: weglopen naar /spelen/, via de kaart terug, verder spelen. |

## Belangrijk

| | Bevinding | Status |
|---|---|---|
| S1 | Tikte de winnaar snel op "Nog een keer", dan sprong het scherm van de verliezer van de stand vóór de mat meteen naar de nieuwe ronde: geen mat gezien, de nederlaag niet geteld. | **Opgelost**: de server bewaart de zetten van de vorige ronde (`vorige`). Was die ronde op dit scherm nog niet af, dan speelt het scherm haar na, laat de uitslag zien, telt één keer en toont "▶️ Naar de nieuwe partij". Doorloopregel: zwart offline, wit zet mat en tikt meteen "Nog een keer"; zwart moet daarna "wint" zien. |
| S2 | Een partij kon alleen door mat, pat of remise eindigen. Een kind dat nog niet kan matzetten, kwam er niet uit. | **Opgelost**: knop "↺ Nieuwe partij" met een bevestiging ("Je vriendje begint dan ook een nieuwe partij"). Er telt niets. Het vriendje hoort "Je vriendje begint een nieuwe partij. Nu speel jij …". Doorloopregel erbij. |
| C1 | Een verouderd kijkantwoord kon een nieuwere stand overschrijven: een eigen zet verdween even van het bord. | **Opgelost**: `isNieuwer()` in `live.ts` gooit oudere standen weg, met unittests. Er loopt nu één kijkverzoek tegelijk (long polling), en tijdens een zet worden kijkantwoorden genegeerd. |
| C2 | `fetch` had geen time-out; een hangend verzoek zette het bord minutenlang op slot. | **Opgelost**: 8 s voor gewone verzoeken, 30 s voor kijken (de server wacht hooguit 20 s). |
| C3 | 300 verzoeken per uur waren genoeg om voor iedereen het maken van speellinks te blokkeren, en de app noemde dat "geen verbinding". | **Opgelost**: per afzender hoogstens 20 per uur (hash van het IP-adres met een dagelijks nieuw zout, zoals bij het contactformulier; na twee uur weg), 300 voor iedereen samen blijft als vangnet. 429 en 503 heten in de app nu `druk`, met een eigen zin. PHP-tests voor 429 per afzender, 429 voor iedereen samen en 503 bij 5000 partijen. |
| C4 | Na publiceren controleerde niets of live draait of `live/data/` dicht zit. | **Opgelost**: de stap in `publiceren.yml` eist 400 van `/live/index.php` en 403/404 van `/live/data/.htaccess`. |
| L2 | Kwam de verbinding terug, dan bleef Pip "Ik kan je vriendje nu niet bereiken" zeggen. | **Opgelost**: bij herstel zet Pip de beurtzin terug. Het eerste verzoek na een storing wacht niet op de server, anders duurde dat tot 20 s. Doorloopregel: offline, online, de ballon mag die zin niet meer tonen. |
| L3 | "Ik blijf het proberen" terwijl er niets meer geprobeerd werd; bij het maken van de link ging het over een vriendje dat er nog niet was, en de som moest opnieuw. | **Opgelost**: eigen zinnen (`LIVE_GEEN_INTERNET`, `LIVE_LINK_MISLUKT`). "Opnieuw proberen" maakt de link zonder nieuwe som. "Nieuwe partij beginnen" verschijnt niet zonder verbinding. |
| L4 | De statusregel leunde op plaatjes: "🐴 wint!" las een kind als "ik" of "Pip". | **Opgelost**: de statusregel zegt "Jij wint!", "Je vriendje wint!", "Je vriendje denkt na…". Boven en onder het bord staan de spelers met plaatje, "Jij" of "Je vriendje" en de kleur. Een meekijker ziet Wit en Zwart. |
| L5 | De deelkaart stond onder het bord, buiten beeld op een kleine telefoon en op de Chromebook; de code viel rechts weg. | **Opgelost**: zolang het vriendje er niet is, staat de kaart boven het bord. Delen is de grote knop, of Kopieer als delen niet kan. De link staat in een tekstvak van twee regels. Gecontroleerd op 375×667. |
| L6 | Op 1280×800 viel "Nog een keer" onder de rand. | **Opgelost**: bordmaat `min(100%, max(100dvh − 420px, 340px), 620px)`. Gemeten op 1280×800: de onderste knop eindigt op 787 px. Op telefoons blijft het bord schermbreed. |
| L7 | "Jij bent aan zet" viel het minst op. | **Opgelost**: groot, vet en in de accentkleur. "· zet 1" is weg. |
| L8 | Was het vriendje weg, dan kon het kind niets doen. | **Opgelost**: knop "📤 Stuur de link nog eens". *Niet gedaan*: "ondertussen tegen een bot spelen". De partij blijft wel bewaard en is via "Verder spelen" terug te vinden (L1), dus wegklikken naar een bot kan al. |

## Klein

| | Bevinding | Status |
|---|---|---|
| S3 | Onderpromotie met schaak: Pip zei alleen "Schaak!". | **Opgelost** met `ONDERPROMOTIE_SCHAAK`, ook bij Op afstand. *Niet gedaan*: een eigen zin voor onderpromotie met mat. De matzin zegt al wie won, en het nieuwe stuk staat in beeld. |
| S4 | Na verversen of terugkomen miste Pip de schaakmelding en de onderpromotie. | **Opgelost**: dezelfde keuze als bij een binnenkomende zet (`zinVoorJouwBeurt`). |
| S5 | Geen schaakgeluid bij schaak. | **Opgelost**: `sfx.schaak()` bij een binnenkomende en een eigen schakende zet, en bij mat. |
| S6 / C11 | Zonder localStorage kon een partij dubbel tellen. | **Opgelost**: ook een `Set` in het geheugen. |
| C5 | Een stand die niet na te spelen was, gaf eindeloos "geen verbinding". | **Opgelost**: soort `kapot`, met `LIVE_KAPOT` en een uitweg. *Niet gedaan*: iets voor partijen boven 600 halve zetten. Die komen in de praktijk niet voor; de 50-zettenregel beëindigt een partij ruim eerder als er niets gebeurt. |
| C6 | Meedoen was niet te herhalen: ging het antwoord verloren, dan was het vriendje toeschouwer. | **Opgelost**: de app maakt de sleutel voor zwart zelf en bewaart hem vóór het verzoek. De server herkent dezelfde sleutel. Een sleutel die de server niet kent terwijl zwart nog vrij is, doet alsnog mee. Test erbij. |
| C7 | `exit` binnen het slot, en `$GLOBALS` als terugweg. | **Opgelost**: de callback geeft `[status, antwoord, nieuwe partij]` terug; `metPartij` schrijft, geeft het slot vrij en pas dan wordt er geantwoord. |
| C8 | Bij een volle schijf bleef een leeg partijbestand over. | **Opgelost**: lukt `fwrite` niet helemaal, dan komt de oude inhoud terug en volgt 503. |
| C9 | Het tellen per uur was niet atomair. | **Opgelost**: `telOp()` telt onder `flock`. |
| C10 | `begin()` controleerde na een `await` niet of het nog over dezelfde partij ging. | **Opgelost**. |
| C12 | De privacytekst was op één punt te stellig: toegangslogs en de sleutel per partij ontbraken. De uitzondering in CLAUDE.md is uit de code niet na te gaan. | **Opgelost** in docs/08 (logs, sleutel, hash per afzender). **Open**: Kaj bevestigt de uitzondering in de PR. |
| C13 | Ontbrekende servertests. | **Opgelost**: tests voor opnieuw door een derde of vóór het meedoen, `ander: 'weg'`, `MAX_ZETTEN`, 405 bij GET, te grote invoer, beide limieten, de 5000-grens, long polling (wacht en komt meteen terug) en herhaald meedoen. Unittests voor `lees()` (statuscode naar soort) en `isNieuwer()`. |
| C14 | `fen` stond zonder uitleg in de afhankelijkheden. | **Opgelost**: commentaar bij de state. |
| L9 | Een meekijker hoorde na mat nog de binnenkomstzin. | **Opgelost**: "Wit/Zwart heeft gewonnen" bij mat, en `LIVE_KIJK_NIEUW` bij een nieuwe ronde. |
| L10 | De laatste zet was in het donkere thema bijna onzichtbaar. | **Opgelost** voor het hele bord: een gevuld waasje met een rand. Dit raakt alle borden in de app. |
| L11 | "Zo werkt het" stond er altijd en duwde de knoppen omlaag. | **Opgelost**: alleen op het startscherm. |
| L12 | De kaart leek te veel op "Op afstand". | **Opgelost**: 🤝 "Tegelijk spelen, ieder op een eigen scherm" tegenover "Om de beurt, wanneer het uitkomt: elke zet als een link, ook voor opa of oma". |
| L13 | De luidsprekerknop stak uit een ballon van één regel. | **Opgelost** in Pip zelf: de ballon is minstens 58 px hoog. Dit raakt alle schermen. |
| L14 | "↺ Nieuwe partij" was te klein en stond te dicht bij het bord. | **Opgelost**: `btn--big`, met 16 px extra afstand. |

## Long polling (nieuw in deze ronde)

Echte push (WebSockets) kan niet op de webhosting van TransIP: daar draait PHP alleen
tijdens een verzoek. Een kijkverzoek zegt nu wat het scherm al weet, en de server houdt
het vast tot er iets verandert (hooguit 20 s, en nooit langer dan `max_execution_time`
min 5 s). Hoogstens 8 verzoeken wachten tegelijk, zodat de teller en het
contactformulier PHP-processen over houden. Daarboven antwoordt de server meteen en
vraagt de app elke 1,5 s, zoals eerst. Getest in `tests/live-php.test.ts`; de doorloop
draait PHP met meerdere werkers.

## Nog te doen buiten de code

- De nieuwe Pip-zinnen (`LIVE_*`, `ONDERPROMOTIE_SCHAAK`) inspreken met `npm run audio:render`. Tot die tijd spreekt de apparaatstem ze uit.
- Na de eerste publicatie op TransIP: kijken of de long polling daar wacht. De stap in `publiceren.yml` laat alleen zien dát het script draait.
