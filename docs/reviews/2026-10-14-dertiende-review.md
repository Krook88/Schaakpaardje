# Dertiende review, 14 oktober 2026

Scope: `0101d54`, anoniem tellen naar Plausible (Events API, geen script van buiten),
met de schakelaar op het ouderscherm en aangepaste privacyteksten. Besloten door Kaj:
anonieme tellingen mogen, niets óver een kind. Reviewers: codebase-reviewer,
layout-reviewer. Geen schaakinhoud gewijzigd, dus geen schaakmeester. `npm run check`
en `npm run doorloop` (12/12) groen.

## Oordeel

Codebase: **GO**, niets lekt (geen hekje, geen querystring, alleen op schaakmaatje.nl,
service worker laat het ongemoeid). Layout: **GO**. *Bijgewerkt: de belangrijke punten
zijn opgelost; zie de statuskolom.*

## Belangrijk

| | Bevinding | Status |
|---|---|---|
| I1 | "Les gestopt" ging alleen bij navigeren binnen de app, niet als de tab dichtgaat of de tablet op slot gaat, en zo stopt een kind meestal. | **Opgelost**: ook bij `visibilitychange` naar verborgen, één keer per wegloopmoment. Komt het kind terug, dan mag hij later opnieuw. Gevolg, bewust: een kind dat terugkomt en de les afmaakt, telt als gestopt én af. |
| I2 | "Les begonnen" telde ook bij hervatten, zodat begonnen/af/gestopt niet klopte. | **Opgelost**: geteld na het hervatten, met `hervat: ja/nee`. |
| I3 | `geoefend` (dagen geoefend op dit apparaat) en sterren/uitslag zijn prestatie; de oudertekst noemde alleen "les 3 is begonnen". | **Opgelost** in de tekst: de oudertekst somt nu alles op wat meegaat. `geoefend` blijft, want "wie komt terug" kan Plausible zonder cookie niet zelf; voorgelegd aan Kaj. |

## Klein

| | Bevinding | Status |
|---|---|---|
| K1 | Speelduur, Bezoek en Les gestopt telden als interactie, en dan zegt het bouncepercentage niets. | **Opgelost**: `interactive: false`. |
| K2 | Speelduur per zichtbaar stuk: even van tab wisselen splitst een sessie. | Open: zonder verzenden na het sluiten is dit niet beter te meten. In het dashboard lezen als "aaneengesloten speeltijd". |
| K3 | Fase in "Les gestopt" was 'kijken' na het oogje "kijk terug". | **Opgelost**: de fase waar het kind vandaan kwam. |
| K4 | Een zelf ingetypt pad ging als pageview mee. | **Opgelost**: alleen de schermen van de app; de rest wordt `/onbekend/`. Test erbij. |
| K5 | Tests misten dagenKlasse, de padregel en een vaste lijst van tellingen. | **Opgelost**: een test zoekt elke `tel(` in de code op en houdt naam en eigenschappen tegen een vaste lijst. De referrer-alleen-bij-eerste-scherm heeft geen eigen test: hangt aan moduletoestand; klein. |
| K6 | Custom events verschijnen in Plausible pas als ze daar als goal staan. | Ter kennisname voor Kaj, in de PR. |
| L1 | Layout: wis-zin stond ver van de wisknop. | **Opgelost**: vlak boven de knop. |
| L2 | Layout: schermlezer las de hele uitleg als naam van het vinkvakje. | **Opgelost**: korte `aria-label`, uitleg via `aria-describedby`, ook bij de andere schakelaars. |
| L3 | Layout: blauw browservinkje past niet bij de app. | Open: geldt voor alle schakelaars; één keer `accent-color` in een stijlronde. |
| L4 | Layout: welkomstpagina noemt het tellen niet. | Open, bewust: "niets over je kind" klopt letterlijk; het staat op /over/ en het ouderscherm. |
