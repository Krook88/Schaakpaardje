# Negenenzestigste review: Pip leeft in zijn eigen tekening (2026-11-19)

Scope: 2cce95e (gemaakt door een animator-agent in een eigen werkkopie) en de merge 538c580.
Pip knippert, flapt af en toe met een oor, de hele Pip zwiept met zijn staart, en zolang hij
praat beweegt zijn mond (een praatvariant per stemming, over de gewone gelegd). Bij minder
beweging staat alles stil. Ook gerepareerd: `pratend` ging altijd binnen een tik weer uit.
Reviewers: layout en codebase. Schaakmeester en conversie niet: er veranderde niets aan het
schaken of aan de weg naar de eerste les.

**Oordeel na verwerking: GO.** `npm run check` groen (770 tests), doorloop 89/89.

## Blokkerend
Geen.

## Belangrijk
- **De mond bewoog niet bij "zeg het nog eens", een tik op Pip, of een zin die op de eerste tik wachtte** (codebase B1, layout B1). *Opgelost:* `audio/voice.ts` meldt zelf wanneer Pip hoorbaar praat (`pipKlinkt`, `luisterOfPipKlinkt`), op het moment dat het geluid echt klinkt; Pip luistert via `useSyncExternalStore`. Doorloopregel "ook bij 'zeg het nog eens' beweegt Pips mond".
- **Bij lange zinnen stopte de mond na 6 s** (layout B2, codebase K1). *Opgelost* door hetzelfde: de mond volgt het echte einde van het geluid, niet `wachtTotUitgesproken()` met zijn plafond. Een apparaatstem die nooit "klaar" meldt, wordt elke halve seconde nagekeken.

## Klein
- De mond bewoog al tijdens het laden van de mp3 (codebase K2). *Opgelost:* zie B1, de mond begint bij `playing`.
- Zonder `:has()` kwamen de twee tekeningen onder elkaar (codebase K3). *Opgelost:* ze liggen op elkaar via `position: absolute`.
- Praattekeningen werden ook op de startpagina meteen opgehaald (codebase K4). *Opgelost:* pas als de browser niets te doen heeft.
- Geen unittest op de praatlogica (codebase K5). *Zo gelaten:* er is geen React-testbibliotheek in het project; de drie doorloopregels dekken gewoon praten, herhalen en minder beweging.
- De zichtbaarheidscontrole telde alleen (codebase K6). *Opgelost:* de doorloop eist ook dat de zichtbare tekening de gewone is zolang Pip zwijgt.
- Pip sprong één beeldje bij begin en eind van elke zin (layout K1). *Opgelost:* de praatwiebel zit op een eigen laag binnen de knop, zodat de adem doorloopt, en begint en eindigt in de rustpositie.
- Oog en oren konden verspringen bij de wissel tussen gewone en praattekening (layout K2). *Opgelost:* `pip-tekenen.py` geeft beide varianten van een stemming dezelfde tempo's.
- Eén leeg rondje van één frame bij de fasewissel in de les (layout K3). *Zo gelaten:* bestond al en is met deze commit minder geworden (van vijf naar één leeg frame per run); apart oppakken.
- De doorloop testte minder beweging alleen via emulatie, die een SVG in een `<img>` niet bereikt (layout K4). *Opgelost:* nieuwe doorloopregel met een eigen browser met `--force-prefers-reduced-motion`: Pips knop in de les geeft één beeld in 6 s.
- `pip-heel-*` beweegt maar wordt nergens gebruikt, en zit wel in de offline-voorraad (layout K5). *Zo gelaten:* die bestanden stonden er al vóór deze commit; of ze gebruikt worden is een ontwerpvraag voor later.
- Pip als stuk op het bord knippert ook (layout K6). *Zo gelaten:* de reviewer vond het "eerder lief dan storend"; meekijken bij de kindertest.

## In orde volgens de reviewers
- Tempo en maat: knipper ±166 ms om de 4–6 s, oren zelden en klein, juicht/trots knipperen terecht niet; levendig zonder af te leiden.
- De mond is leesbaar op 76 px en zelfs 44 px, licht en donker; geen flits bij de praatwissel.
- Het script is reproduceerbaar (byte voor byte), zonder SMIL, met de media query in elk bewegend bestand.
- Bytes: Pip-map 73 → 123 kB, elk bestand onder 8 kB; JS-bundel niet merkbaar groter.
