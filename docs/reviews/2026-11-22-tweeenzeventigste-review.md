# Tweeënzeventigste review: telling "Regel naar les"

**Datum:** 22 november 2026
**Scope:** commit `966eaff`. Een nieuwe anonieme telling `Regel naar les` op de oefenknoppen van de schaakregelpagina's. De telling staat in `opslag.php`, in `tests/tellen.test.ts` en `tests/teller-php.test.ts`, op het dashboard en op het ouderscherm.
**Aanleiding:** het dashboard over de laatste 30 dagen. Ongeveer 65 bezoeken kwamen van nieuwe apparaten; daarvan 22 binnen op een regelpagina. De eerste les is maar 23 keer geopend. Of bezoekers van een regelpagina doorklikken, was niet te zien.
**Werkwijze:** de vier reviewers zijn rechtstreeks gestart.

## Oordeel: GO

Niets blokkerends. Op het scherm verandert niets: dezelfde links en dezelfde stijl, 64 px hoog. Ook zonder JavaScript is het een gewone link. Per klik gaat er precies één telling uit, en die bevat niets over het kind.

## Belangrijk
1. "Begin bij de eerste les" op de pagina's voor gevorderden werd niet geteld, terwijl juist dat de weg van een nieuwe bezoeker is (conversie 1).
2. Niet te zien of de klik van een nieuw of een bekend apparaat kwam (conversie 2).
3. De noemer stond niet bij de telling. Het waren twee losse ingeklapte blokken in hoofdstuk 4, en de regelpagina's vielen buiten de top 20 schermen (conversie 3).

## Klein
4. `Les begonnen` zou een eigenschap `van` kunnen krijgen, zodat elke weg naar een les meetelt, ook vanaf de startpagina (conversie 4).
5. Geen test die controleert dat elke slug door de waarderegel van de teller komt (conversie 5, codebase 2).
6. "Geteld sinds november 2026" zonder datum: bij 0 is niet te zien of de telling al loopt (conversie 6).
7. `React.CSSProperties` werd gebruikt zonder `React` te importeren (codebase 1, layout 2).
8. De server controleert `onderwerp` niet tegen de bekende slugs (codebase 3).
9. Lokaal geven de manifesten van audio en sfx een 404 (layout 1).

## Per reviewer
- **Schaakmeester:** de knoppen gaan naar dezelfde bestemming en hebben dezelfde teksten. Didactisch verandert er niets.
- **Codebase:** `check` is groen en de doorloop gaf 89 van de 89. De pagina is nog steeds statisch (SSG). Beide vaste lijsten zijn gelijk.
- **Layout:** in licht en donker, op 375×667, staat er dezelfde `<a>`. Na 1 tik volgt de les, met één telling per klik.
- **Conversie:** de telling mag erin, maar is pas nuttig met de punten 1–3.

## Afhandeling
1. *Opgelost:* "Begin bij de eerste les" telt nu mee, met `plek: 'begin'`.
2. *Opgelost:* de telling stuurt nu `apparaat: 'nieuw' | 'bekend'` mee, op dezelfde manier als `Les begonnen`. De waarde staat ook in VASTE_WAARDEN.
3. *Opgelost:* in hoofdstuk 3, onder de binnenkomst, staat nu één tabel per onderwerp: bezoeken, naar les, waarvan nieuw apparaat, en een percentage. Erbij staat dat het percentage eerder te laag dan te hoog is.
4. *Niet gedaan:* dit is een grotere wijziging aan een bestaande telling, met overgangsregels in `opslag.php`. Eerst zien wat deze telling oplevert; dit kan in een volgende fase.
5. *Opgelost:* `tests/schaakregels.test.ts` heeft nu de test "slugs passen in de teller".
6. *Opgelost:* het dashboard gebruikt nu de constante `REGEL_NAAR_LES_VANAF` (2026-11-23). Vóór die dag staat er "Wordt geteld vanaf …". De tabel is getest met een vroegere datum en toonde de telling uit de PHP-test.
7. *Opgelost:* er staat nu `import type { CSSProperties, ReactNode }`.
8. *Niet gedaan:* er komt geen persoonsgegeven mee, en `les` werkt al net zo. Met een vervalst verzoek kom je hooguit aan een rij onzin.
9. *Niet gedaan:* dit bestond al. De opnames staan alleen op de server, niet in git.

`npm run check` is groen (771 tests). `php -l` vindt geen fouten.
