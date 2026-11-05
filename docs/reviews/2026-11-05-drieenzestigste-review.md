# Drieënzestigste review: beginscherm-knop, app-icoon, getekende maatjes (2026-11-05)

Ronde 49–50. Layout-reviewer en codebase-reviewer. **Oordeel na verwerking: GO.**

## Beginscherm en icoon
- **Middel (codebase): de installatievraag werd gemist als hij kwam vóór het ouderscherm open was.** *Opgelost:* hij wordt op moduleniveau opgevangen, en die module laadt op elke pagina mee via ServiceWorker.
- **Klein (codebase): de iconen ontbraken in de offline-kern.** *Opgelost:* icon-192 en apple-touch staan nu in `KERN`.
- **Klein (codebase): dubbele tik gaf InvalidStateError.** *Opgelost:* de vraag wordt eerst geleegd, daarna volgt `prompt()` in een try.
- **Klein (codebase): Chrome op iOS in desktopmodus.** *Bewust:* sinds iOS 16.4 klopt de uitleg daar ook. Het staat als commentaar in de code.
- **Klein (codebase): de pixelmaat van de png's wordt niet getest.** *Op het scorebord.*
- **Middel (layout): "Tik onderaan op Deel" klopt niet op de iPad.** *Opgelost:* "op de iPhone onderaan, op de iPad bovenaan".
- **Middel (layout): Pip staat iets uit het midden in het icoon.** *Zo gelaten:* als cirkel valt er niets weg, en de reviewer noemt het optioneel.
- **Klein (layout): de uitleg stond in grijs.** *Opgelost:* gewone tekstkleur.
- **Klein: knoptekst en menunaam lijken op elkaar.** *Zo gelaten:* de uitleg verschijnt direct eronder.
- In orde volgens de reviewers: SSR en hydratie, opruimen van listeners, privacy, het verwijderen van de staande stand, iPhone-Safari, de desktop-simulatie en de vouw van de startpagina.

## Maatjes (gevraagd door Kaj: "de maatjes zitten nog niet in dezelfde stijl")
- Acht getekende maatjes (`scripts/maatjes-tekenen.py`, `public/illustraties/maatjes/`), herkenbaar anders dan de bots. Het paard is bruin met een bles, niet oranje zoals Pip. Op elke plek waar een maatje staat (kiezen, kop, ouderscherm, samen spelen, uitslag) staat nu de tekening. Het profiel bewaart nog steeds de emoji, dus bestaande profielen houden hun maatje.
- In de doorloop zochten twee regels op de emoji. Ze zoeken nu op "Kies vos" en op de tekening in de uitslag.
- Kanttekeningen van de illustrator voor een volgende ronde (het strikje van het konijn is klein, de uil heeft weinig contrast tussen kop en lijf, de schildpad heeft geen hals): *op het scorebord.*
