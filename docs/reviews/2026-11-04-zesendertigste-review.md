# Zesendertigste review: speelbaar paard op de startpagina, en de nieuwe wow-meting (2026-11-04)

Fase: "volgende niveau", ronde 11. Branch `volgende-niveau`. De reviewers zijn rechtstreeks gestart.

**Oordeel na verwerking: GO voor deze fase.** Er is niets blokkerends. `check` is groen, de doorloop haalt 36 van 36.

## Wat er gebouwd is
- `src/app/HeldSpel.tsx`: in de held van de startpagina staat een paard dat je zelf laat springen. Tik op een stip en het springt; een veld zonder stip schudt en krijgt uitleg. Na drie sprongen verschijnen ⭐⭐⭐ en de knop "Leer het met Pip". Dit gebruikt `engine/board`, conform de regel over de twee zetmotoren.
- Het Animatiebord staat weer in de uitlegsectie.
- Nieuwe anonieme telling `Held naar les`, zonder eigenschappen. Hij staat in beide vaste lijsten.

## Schaakmeester
- De zetten kloppen, ook in de hoeken en langs de rand. "Twee recht, één opzij" is waar en sluit aan op wereld 4. Een paard als lokker vóór de leerlijn is in orde, en de knop gaat naar weide-1.

## Conversie
- De hoofdknop staat op 360, 375 en 390 breed boven de vouw, en het spel trekt naar de les.
- **Belangrijk: op een kleine telefoon stond het paard (d4) onder de vouw.** *Opgelost:* het paard begint op d5 en staat op 360×740 in beeld.
- **Klein: na sprong 3 was de ballon uit beeld.** *Opgelost:* de uitnodiging schuift in beeld en de ballon zegt "Jij kunt het al! Zullen we echt beginnen?".
- **Klein: geen telling.** *Opgelost:* `Held naar les`.

## Layout
- **Belangrijk: de knop na sprong 3 viel onder de vouw.** *Opgelost* met `scrollIntoView` (nearest; bij minder beweging zonder animatie).
- **Belangrijk: er stonden twee gelijke oranje hoofdknoppen naast elkaar.** *Opgelost:* de nieuwe knop is secundair.
- **Belangrijk: het bord liep tot de rand, waardoor een duim per ongeluk een zet deed.** *Opgelost:* Board heeft een nieuwe prop `randTotRand`; op de startpagina staat die uit.
- **Klein: de L was achteraf niet te zien.** *Opgelost:* het vertrek- en doelveld zijn gemarkeerd.
- **Klein: coördinaten.** *Opgelost:* hier staan ze uit.
- **Klein: Pip spreekt hier niet.** *Bewust:* er is geen opname, en de stippen wijzen zichzelf. Er staat commentaar in de code. Een opname van "Tik op een stip" is iets voor later.

## Codebase
- De held staat in de gebouwde HTML. First Load JS op `/` ging van 146 naar 150 kB, ruim binnen het budget. chess.js zit niet in de bundel.
- **Klein: een tweede misser op hetzelfde veld schudde niet.** *Opgelost:* de waarde wordt eerst losgelaten en dan opnieuw gezet; het terugzetten doet Board.
- **Klein: aria-live las een herhaalde zin niet opnieuw voor.** *Opgelost* met een `key` per tik.
- **Klein: de terugvalwaarde `'d4'` klopte niet meer.** *Opgelost:* nu `'d5'`.
- **Klein: de live-regel van de doorloop faalde één keer.** *Genoteerd:* hij lijkt wisselvallig en staat los van deze wijziging. Hij is in alle latere runs groen.

## Wow-meting (opnieuw, alle vier de schermen)

| scherm | layout | conversie |
|---|---|---|
| Startpagina | 7,5 | 7,5 |
| Eerste les | 6,5 | 7 |
| Wereld af | 7 | 7 |
| Wereldkaart | 7 / 6,5 (nieuw / 3 af) | 7,5 |

**Waar het blijft hangen.** Beide reviewers noemen steeds hetzelfde wat nog naar een 9 ontbreekt:
1. **Beeldtaal.** Een getekende Pip met mimiek in plaats van de emoji 🐴, en echte illustraties voor de werelden en de kaart (één doorlopend landschap) in plaats van emoji als 🧱 🍽️ ➕.
2. **Juichmomenten met een personage.** Pip die huppelt of danst, groot in beeld, bij wereld af en na een opgave.
3. **Warmte.** Een kind of illustratie op de startpagina, niet alleen borden.

Punt 1 is een keuze over de beeldtaal van de hele app en mogelijk een kostenpost: een illustrator, of zelf getekende SVG's. Daarom ligt die keuze bij Kaj. Zie de vraag bovenaan `docs/volgende-niveau.md`.
