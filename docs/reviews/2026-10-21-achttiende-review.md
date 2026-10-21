# Achttiende review, 21 oktober 2026

Scope: `dd74f8f` op `claude/wizardly-cray-9vevs8`. Een technische laag: de anonieme teller.
- **Meetfout:** `/schaakregels/` telde als `/onbekend/` (`tellen.ts`, `opslag.php`).
- **Les gestopt:** één keer per keer dat de les open is, niet meer bij elke tabwissel.
- **Nieuw:** `Profiel gemaakt` (zonder eigenschappen) en `Opgave lastig` (`les`, `opgave`, `hulp`).
- **Dashboard:** kaartje "profielen gemaakt" en tabel "Opgaven: waar lopen kinderen vast?".

Aanleiding: de dashboardcijfers van de eerste weken (56 bezoeken, 24 lessen begonnen, 2 af).

Reviewers: schaakmeester, layout-reviewer en codebase-reviewer. De releasecoördinator kon in
deze sessie weer geen reviewers starten. Ze zijn rechtstreeks gestart en dit rapport is
daarna gebundeld.

Vóór de review: `npm run check` groen (429 tests). De codebase-reviewer draaide ook de
doorloop (16/16) en testte de PHP met de hand.

## Oordeel

- **Schaakmeester:** niets blokkerends. Er is geen lesinhoud geraakt. De telling meet bij bordopgaven iets zinnigs.
- **Codebase:** niets blokkerends. Privacy en PHP 7.4 zijn in orde. Het nieuwe gedrag is niet met tests vastgelegd.
- **Layout:** niets blokkerends. Op de telefoon vallen de getallen van de nieuwe tabel buiten beeld.

**Samen: GO onder voorwaarde.** Er wordt niets fout geleerd en er gaat niets over een kind naar
buiten. Wel eerst C1 (tests) en L1 (tabel op de telefoon), want zonder test komt de dubbele
telling ongemerkt terug.

## Blokkerend

Geen.

## Belangrijk

| | Bevinding | Status |
|---|---|---|
| C1 | Geen test voor het nieuwe gedrag. Niets legt vast dat `Opgave lastig` één keer per opgave telt, dat een hint vóór de missers gaat, of dat `Les gestopt` na een tabwissel niet opnieuw telt. `teller-php.test.ts` raakt `Profiel gemaakt` (geen props) en de nieuwe tabel niet. De doorloop ziet het niet, want daar wordt niet geteld. | **Opgelost**: de beslissingen staan nu in `src/lesson/lesTellingen.ts` (`maakLastigMelder`, `maakStopMelder`), getest in `tests/les-tellingen.test.ts`. `teller-php.test.ts` stuurt nu `Profiel gemaakt` (met en zonder props), `Opgave lastig` en een `/schaakregels/`-pad, en controleert de nieuwe tabel. |
| L1 | Op 375 px is de nieuwe tabel 629 px breed in een sectie van 341 px. Je ziet alleen de kolom "Les"; de getallen staan rechts buiten beeld. | **Opgelost**: de tabel gebruikt `class="lessen"` (lestitel breekt af), plus `overflow-wrap:anywhere` voor lange id's. Niet opnieuw gefotografeerd; dat doet de volgende review. |
| S1 | De tabel lastige opgaven toont absolute aantallen. Lessen uit vroege werelden, die veel meer kinderen spelen, staan daardoor altijd bovenaan. | **Opgelost**: kolommen "Begon" en "Vast" (hoogste van hint en missers, gedeeld door hoe vaak de les begon), gesorteerd op dat percentage. |

## Klein

| | Bevinding | Status |
|---|---|---|
| C2 / S3 / S4 | "3 missers" is niet precies. De knop Opnieuw zet `fouten` terug op 0, zodat een kind met 2 + 2 missers nooit wordt geteld. Andersom telt de uitkomst `opnieuw` (maxZetten, pion vast) en `stukVast` wél als fout. | **Opgelost**: de melder telt zelf, alleen bij uitkomst `fout` en een fout quizantwoord; Opnieuw zet dat niet terug en `opnieuw` telt niet mee. `stukVast` (een stuk aantikken dat vastzit) telt bewust wél: het kind tikte iets wat niet kan. Waarde heet nu `missers`. |
| S2 | Een quiz met 2 of 3 opties haalt bijna nooit 3 missers. Quizzen staan daardoor structureel te laag. | **Opgelost**: drempel 2 bij een quiz (`missersDrempel`), met test. |
| C3 | `Les gestopt` noemt de fase van de eerste keer dat de tab verborgen werd, niet die van het echte stoppen. | **Bewust zo gelaten, in de dashboardtekst gezet.** Bij een tablet die op slot gaat is de pagina vaak weg zonder nieuw bericht; versturen bij de eerste keer weggaan is het enige moment dat zeker aankomt. |
| C4 | `lastigGemeld` en `gestoptGemeld` vertrouwen erop dat de component opnieuw opstart bij een andere les. Nu klopt dat (de app-router mount opnieuw), maar de deps `[les.id]` suggereren iets anders. | **Opgelost**: de stopmelder wordt per les-id nieuw gemaakt in het effect; de sleutel van de lastig-melder bevat de les-id. |
| C5 / S5 | Opgavenummers (`zelf-2`) hangen aan de volgorde in de content. Wordt een opgave verschoven, dan lopen oude en nieuwe tellingen door elkaar. | **Niet opgelost, vermeld op het dashboard.** Opgaven hebben geen eigen id; die toevoegen raakt alle 49 lessen en is te groot voor deze ronde. |
| S6 | Een kind dat eerst 3 keer mis tikt en dan een hint vraagt, telt alleen als "missers". | **Opgelost**: hint en missers tellen elk één keer per opgave, onafhankelijk van elkaar. |
| L2 | Zeven kaartjes in het cijferblok laten er één alleen op een rij staan. | **Deels**: kolommen vanaf 110 px, dus op desktop één rij van zeven. Op 375 px blijft het 3 + 3 + 1; een achtste getal verzinnen alleen voor de vorm doen we niet. |
| L3 | De nieuwe uitleg bij de lessentabel is op de telefoon zes regels lang. De datum tussen haakjes heeft over een paar maanden geen zin meer. | **Opgelost**: datum weg, uitleg korter (en noemt nu C3). |
| L4 | "zelf-2" is technische taal; "zelf, opgave 2" leest beter. | **Opgelost** in het dashboard; de telling zelf blijft `zelf-2`. |

Niet bij deze commit: de eerste `next build` van de codebase-reviewer faalde met
`PageNotFoundError: /_document`, en de tweede ging goed zonder wijziging. Waarschijnlijk een
wisselvallige fout in Next 15. Komt hij terug, dan apart uitzoeken.

## SEO en conversie (extra reviewer, buiten de scope van deze commit)

Op verzoek van Kaj keek een vierde reviewer naar vindbaarheid en naar de weg van bezoeker
naar eerste les. De SEO-basis klopt: canonicals, sitemap, noindex op app-schermen, JSON-LD,
og-afbeelding en 1.534 tekens statische tekst op "/". De winst zit in conversie (45 views op
"/" → 24 lessen begonnen → 2 af). Op verzoek van Kaj direct in dezelfde ronde meegenomen; samen met de herstelronde gaat dit
langs de negentiende review.

| | Bevinding | Status |
|---|---|---|
| SEO1 | Van "/" naar de eerste les: vier stappen plus typen, en de knop "Beginnen" springt 2500 px naar beneden. Voorstel: "▶ Probeer de eerste les" rechtstreeks naar de les, naam pas ná de eerste beloning. | **Opgelost**: op "/" is "▶ Probeer de eerste les" de hoofdknop, rechtstreeks naar de les; "Of maak eerst een profiel" eronder. |
| SEO2 | Een les zonder profiel bewaart niets (`store.ts`, `bewaarLes`: `if (!id) return`). Bezoekers via /schaakregels/ en /les/ raken zo stil hun sterren kwijt. Voorstel: gastvoortgang lokaal, overzetten bij `maakProfiel`, en een doorloopregel. | **Opgelost**: `GAST` in de store. `bewaarLes`, hervatpunt, stickers en oefendag bewaren zonder profiel onder de gast; het eerste profiel neemt alles over. Bij de beloning zonder profiel: "Bewaar je sterren" → "Kies een naam". Test in `profielen.test.ts`, doorloopregel `gastHoudtZijnSterren`. |
| SEO3 | Na het profiel staat de grote knop op 375×667 net onder de vouw (Rondleiding staat ervoor), terwijl Pip zegt "Druk op de grote knop". | **Opgelost**: de rondleiding staat nu onder de grote knop en de knoppen voor kaart en partij. |
| SEO4 | /schaakregels/-pagina's leiden pas onderaan (y≈4683) naar de app, en dan naar "/". Voorstel: knop "Oefen dit met Pip" onder het antwoord, naar de bijbehorende les. | **Opgelost**: "▶ Oefen dit met Pip, gratis" direct onder het antwoord, naar de eerste bijbehorende les. De onderste knop en die op /schaakregels/ gaan ook naar een les in plaats van naar "/". |
| SEO5 | Het profielformulier vraagt naam, leeftijd en maatje vóór de eerste les. Voorstel: alleen naam (of overslaan), rest met standaardwaarden. | **Deels**: het maatje staat dichtgeklapt (met een vrij maatje al gekozen) en de privacyzin staat direct onder het naamveld. De leeftijd blijft open: die bepaalt de modus (hoe Pip praat, wat er openstaat), en een negenjarige stilletjes als zesjarige laten beginnen is erger dan één rij knoppen. Met SEO1 is het formulier bovendien niet meer nodig om te beginnen. |
| SEO6 | H1 op "/" ("Leer schaken met Pip") mist de zoekterm "schaken leren voor kinderen". | **Opgelost**: H1 "Schaken leren voor kinderen", met "Met Pip het schaakpaardje" erboven. |
| SEO7 | Eerste schermplaatje op "/" is het LCP-element maar laadt lazy. Knoptekst "Beginnen →" zegt een ouder weinig. | **Opgelost**: eerste plaatje `eager` en `fetchPriority="high"`; de knoptekst is nu "Probeer de eerste les". |
| SEO8 | Lestitels met dubbel leesteken ("?:"), omschrijvingen van 168 tekens, merknaam dubbel in de titel van /over/. | **Opgelost**: `lesZoektitel` (geen "?:" meer) en `lesOmschrijving` (≤ 155 tekens) in `src/seo.ts`, vastgelegd voor alle 49 lessen in `tests/seo-lessen.test.ts`; /over/ met `title.absolute`. De titels van de schaakregelpagina's (69–73 tekens) niet aangepakt: Google kapt rond 60 af, maar de vraag staat vooraan en blijft leesbaar. |
| SEO9 | Elke gedeelde pagina toont in WhatsApp hetzelfde og.png. Voorstel: deelkaart per schaakregel, gemaakt bij het bouwen. | **Niet gedaan.** Een deelkaart per schaakregel vraagt een nieuw bouwscript voor afbeeldingen; dat is een eigen klus. Volgende fase. |
| SEO10 | Het tikken op "Beginnen" en "les zonder profiel" worden niet geteld, dus de afhakers zijn niet te splitsen. | **Niet gedaan, met reden.** `Les begonnen` een eigenschap `profiel` geven laat de server elke telling weigeren van apparaten die de oude app nog in de cache hebben (de server eist precies de vaste eigenschappen). Met `Profiel gemaakt` en de schermtellingen van `/` en `/les/weide-1/` is de afhaker nu al te splitsen. |
