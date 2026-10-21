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
| C1 | Geen test voor het nieuwe gedrag. Niets legt vast dat `Opgave lastig` één keer per opgave telt, dat een hint vóór de missers gaat, of dat `Les gestopt` na een tabwissel niet opnieuw telt. `teller-php.test.ts` raakt `Profiel gemaakt` (geen props) en de nieuwe tabel niet. De doorloop ziet het niet, want daar wordt niet geteld. | Open |
| L1 | Op 375 px is de nieuwe tabel 629 px breed in een sectie van 341 px. Je ziet alleen de kolom "Les"; de getallen staan rechts buiten beeld. | Open |
| S1 | De tabel lastige opgaven toont absolute aantallen. Lessen uit vroege werelden, die veel meer kinderen spelen, staan daardoor altijd bovenaan. | Open |

## Klein

| | Bevinding | Status |
|---|---|---|
| C2 / S3 / S4 | "3 missers" is niet precies. De knop Opnieuw zet `fouten` terug op 0, zodat een kind met 2 + 2 missers nooit wordt geteld. Andersom telt de uitkomst `opnieuw` (maxZetten, pion vast) en `stukVast` wél als fout. | Open |
| S2 | Een quiz met 2 of 3 opties haalt bijna nooit 3 missers. Quizzen staan daardoor structureel te laag. | Open |
| C3 | `Les gestopt` noemt de fase van de eerste keer dat de tab verborgen werd, niet die van het echte stoppen. | Open |
| C4 | `lastigGemeld` en `gestoptGemeld` vertrouwen erop dat de component opnieuw opstart bij een andere les. Nu klopt dat (de app-router mount opnieuw), maar de deps `[les.id]` suggereren iets anders. | Open |
| C5 / S5 | Opgavenummers (`zelf-2`) hangen aan de volgorde in de content. Wordt een opgave verschoven, dan lopen oude en nieuwe tellingen door elkaar. | Open |
| S6 | Een kind dat eerst 3 keer mis tikt en dan een hint vraagt, telt alleen als "missers". | Open |
| L2 | Zeven kaartjes in het cijferblok laten er één alleen op een rij staan. | Open |
| L3 | De nieuwe uitleg bij de lessentabel is op de telefoon zes regels lang. De datum tussen haakjes heeft over een paar maanden geen zin meer. | Open |
| L4 | "zelf-2" is technische taal; "zelf, opgave 2" leest beter. | Open |

Niet bij deze commit: de eerste `next build` van de codebase-reviewer faalde met
`PageNotFoundError: /_document`, en de tweede ging goed zonder wijziging. Waarschijnlijk een
wisselvallige fout in Next 15. Komt hij terug, dan apart uitzoeken.
