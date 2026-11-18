# Zesenzestigste review: 'Les begonnen' met apparaat en binnen (2026-11-18)

Scope: f77e5dc. Twee extra anonieme eigenschappen op 'Les begonnen': `apparaat: nieuw|bekend` en
`binnen: ja|nee`, goedgekeurd door Kaj en voorgesteld door de conversie-reviewer in de vierenzestigste
review. Het dashboard gebruikt ze in de trechter, bij "Waar verbeteren?" en bij "Geopend". Reviewers:
codebase en conversie. Schaakmeester en layout niet: er veranderde geen les en geen kinderscherm; het
ouderscherm kreeg één zin, die de conversie-reviewer bekeek.

**Oordeel na verwerking: GO.** `npm run check` groen (630 tests), doorloop 82/82.

## Blokkerend
- **Doorloop: de regel voor live spelen faalde** (codebase 1). *Geen fout in deze wijziging:* de drie mislukte runs draaiden tegelijk met een andere doorloop, en elk start een eigen PHP-server voor live spelen; die zaten elkaar in de weg. Los gedraaid slaagt de regel vier van de vier keer, de hele doorloop 81/81 en met deze ronde 82/82. De oorzaak verschilde per run, wat daarbij past.

## Belangrijk
- **Trechter en regel 5 vergeleken een paar gemeten dagen met een hele periode** (conversie 1). *Opgelost:* ze gebruiken `apparaat` pas als de periode ervóór het al bevatte, dus als de hele periode na de publicatie valt. Uit de gegevens en niet uit een datum (codebase 8): publiceren gaat met de hand en kan later zijn.
- **Regel 1 vergeleek starts met stops, en "direct binnen" draaide het advies om** (conversie 2). *Opgelost:* geen voorwaarde meer, alleen een vermelding met de gemeten starts als noemer, en alleen "direct binnen op een nieuw apparaat": op een bekend apparaat is direct binnen bijna altijd een tabblad dat opnieuw laadde.
- **De trechter mengde nieuwe en alle apparaten** (conversie 3). *Opgelost:* "Eerste les geopend" telt na de meting ook alleen nieuwe apparaten.
- **`binnen` was "zelfde pad als bij het laden", niet "eerste scherm"** (codebase 2). *Opgelost:* `telScherm()` onthoudt dat het bezoek het binnenkomstscherm verliet, en daarna is de les niet meer "binnen". Een herladen pagina (`performance`-navigatie `reload`) telt ook niet.
- **Geen test voor `binnen: nee`** (codebase 3). *Opgelost:* unittests voor verlaten en herladen, en een doorloopstap die via de app naar de les gaat en `binnen: nee` verwacht.

## Klein
- Het ouderscherm noemde `binnen` niet (conversie 4). *Opgelost:* "of er op dit apparaat al eens geoefend is, en of de les het eerste scherm was".
- Tooltip niet te zien op een telefoon (conversie 5). *Opgelost:* "3 direct" klein onder het getal, uitgelegd in de legenda.
- Starts als bezoeken (conversie 6). *Opgelost:* "Keer een les geopend", en de uitleg zegt dat één bezoek meer lessen kan openen.
- Gemengde noemer in de extra zin (conversie 7). *Opgelost:* `gemeten`.
- `binnenPad` hangt af van vroeg inlezen (codebase 4). *Zo gelaten:* in `telScherm()` hangt het af van de volgorde van de effecten. Het lesscherm kan tellen vóór de layout zijn pageview telt, en dan kreeg de eerste les ten onrechte "nee". `tellen.ts` wordt nu statisch vanuit de layout geladen; dat staat in het commentaar.
- Hoogste aantal oefendagen op twee plekken (codebase 5). *Opgelost:* `hoogsteOefendagen()` in `tellen.ts`, op beide plekken gebruikt.
- De teller nam elke waarde aan (codebase 6). *Opgelost:* `VASTE_WAARDEN` in `opslag.php` voor de eigenschappen van november 2026, met een test.
- De overgangsregel had geen einddatum (codebase 7). *Opgelost:* het commentaar zegt dat hij een maand na de publicatie weg mag.

## In orde volgens de reviewers
- Privacy: twee losse ja/nee-waarden, geen ID, niets wat een kind intypt, en beide vaste lijsten bijgewerkt.
- De sleutelvolgorde in de overgangsregel.
- Slash aan het eind, service worker, offline en prerenderen.
- Alle drie de binnenkomstwegen meten in de browser goed.
