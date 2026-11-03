# Zevenentwintigste review: lesscherm liggende indeling (2026-11-03)

Fase: "volgende niveau", ronde 2. Branch `volgende-niveau` tegen `main`.

## Werkwijze
De release-coordinator had in deze sessie geen Agent-tool en kon de reviewers dus niet zelf starten. Daarom zijn de vier reviewers rechtstreeks gestart, en zijn hun bevindingen hieronder gebundeld.

| reviewer | oordeel |
|---|---|
| schaakmeester | in orde; aan de didactiek verandert niets (wit onder, coördinaten, volgorde ongewijzigd) |
| layout-reviewer | 1 groot, 3 middel, 2 klein |
| codebase-reviewer | 2 middel, 4 klein; `check` en `doorloop` groen |
| conversie-reviewer | 2 middel, 1 klein |

**Oordeel na verwerking: GO voor deze fase.** De blokkerende en grote punten zijn opgelost (zie hieronder). Het "wow"-oordeel is nog onvoldoende, maar dat is werk voor de volgende rondes. Het telt niet als blokkade voor deze fase.

## Bevindingen en wat ermee gedaan is

### Groot
- **L1. Telefoon dwars (844×390): bordvelden van 28 px, en de pagina scrolt.** *Opgelost.* Op lage liggende schermen doet nu de hele pagina mee aan het raster. Het bord staat links over de volle hoogte; kop, fasen, Pip en knoppen staan rechts. Velden 47 px, pagina 390 px. De doorloop eist nu velden van minstens 44 px.

### Middel
- **L2/C2. Zijkolom te smal op 1440 en 1180; Pip-ballon brak per woord af.** *Opgelost.* Zijkolom tot 400 px. Daarbij kwam een fout boven: het bord schoof over Pip heen, omdat bord en zijkolom samen niet in de kolom van 940 px pasten. Nu is er een vaste bordkolom (`--bordmaat`), en de doorloop controleert dat het bord niet over Pip ligt. Die regel faalde eerst terecht en is daarna groen.
- **L3/C1. Pagina 20–120 px te hoog, met een scrollbalk.** *Opgelost voor liggende schermen.* De onderrand van 96 px gaat op het liggende lesscherm naar 16 px. Pagina's: 768/768, 820/820, 900/900. De doorloop controleert de paginahoogte. Staande telefoons scrollen nog onder het bord (de knoppen staan eronder). Het bord zelf past daar wel. Dat valt buiten deze fase en staat op het scorebord.
- **L4. Bovenknoppen 44 px, onder de 64 px voor de jongsten; voortgangsrondjes klein.** *Niet in deze fase.* Dit gaat over de kop en de fasebalk in de hele app, niet over de liggende indeling. Het staat op het scorebord als "raakvlakken".
- **CB1. De doorloopregel mat alleen de kijkfase.** *Opgelost.* De regel meet nu de kijkfase én de eerste opgave, op 3 formaten.
- **CB2. Een kind van `.speelvlak` zonder vak zou een eigen kolom maken.** *Opgelost.* Standaard krijgt het `grid-column: 1 / -1`.

### Klein
- **CB3. `!important` tegen inline justify.** *Opgelost.* De inline-stijlen zijn nu de klassen `.rijMidden` en `.rijUiteen`.
- **CB4. Getallen in de calc.** *Opgelost.* Ze staan nu in `--boven-bord`, `--naast-bord` en `--bordmaat`, met de herkomst als commentaar. De doorloop vangt het op als de kop hoger wordt.
- **CB5. `meet-niveau.mjs` met vaste paden, op poort 3000, schreef naar docs.** *Opgelost.* De URL en de map komen uit env, de poort is 4173 en de uitvoer gaat naar een tijdelijke map.
- **CB6. 48 PNG's, deels dubbel.** *Opgelost.* De dubbele na-beelden zijn weg. Er zijn vier na-beelden bewaard die het verschil laten zien.
- **L5. "1 van 3" en "Verder" zweven los in de kijkfase op 1440.** *Niet opgelost.* Het oogt minder slecht nu de kolom breder is. Het hoort bij "Pip groter in de lege kolom" (wow-punt, volgende ronde).
- **C3. 667×375 (kleinste telefoon dwars): velden 36 px.** *Niet opgelost.* Het scherm is te smal voor bord en zijkolom samen. Dat is een zeldzaam formaat, en het bord past wel zonder scrollen. Het staat als open punt op het scorebord.
- **Schaakmeester: 28 px op telefoon dwars.** *Opgelost via L1.*

## Wow-tabel ("zou een ouder hier een screenshot van doorsturen?")

| scherm | layout | conversie | wat het naar een 9 tilt |
|---|---|---|---|
| Startpagina | 6 | 7 | grote zwaaiende Pip met een bord waarop het paard een L springt; "Gratis. Geen reclame. Geen account." groot; één ouderquote |
| Eerste les | 6,5 | 6 | Pip groot in de rechterkolom, met bewegende stemmingen; het bord bij zin 1 laten oplichten; kleine beloning per goed veld |
| Wereld af / diploma | 3 (alleen het slotscherm gezien) | niet gezien | een deelbaar diploma dat op het toestel gemaakt wordt; confetti (met reduced-motion); een vergrendeld scherm met een voorproef |
| Wereldkaart | 5 | 6,5 | een geïllustreerd landschap in plaats van 14 grijze stroken; het pad van Pip doorlopend; dichte werelden in kleur "komt nog" |

Ter vergelijking: Duolingo ABC ±9, Khan Academy Kids 9, ChessKid 7.
