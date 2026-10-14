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

## Herreview: eigen teller in plaats van Plausible (`aa24c3a`)

Kaj wil geen extra kosten. Plausible is vervangen door een eigen teller op de eigen
hosting (`public/teller/`, PHP) met een eigen dashboard achter een wachtwoord.
Codebase-reviewer: **GO**, niets blokkerends. Geen geheim zichtbaar, geen tekst of HTML in
opslag of dashboard, geen IP, geen koekje voor kinderen.

| | Bevinding | Status |
|---|---|---|
| T1 | belangrijk: het dashboard las alle regels eerst in; met volgeschreven dagbestanden liep het geheugen vol (1 dag = 113 MB) en bleef het 30 tot 90 dagen wit. | **Opgelost**: regel voor regel tellen (`loopDagen`), dagbestand hoogstens 1 MB. Test met 30 volle dagen bij 32 MB geheugen. |
| T2 | belangrijk: de controle na het publiceren keek alleen of PHP draait en waarschuwde alleen. | **Opgelost**: ook `opslag.php`, `wachtwoord.php` en `data/` moeten 403 of 404 geven; anders faalt de stap. |
| T3 | klein: raden van het wachtwoord nauwelijks afgeremd. | **Opgelost**: hoogstens 10 mislukte pogingen per uur voor iedereen samen; de workflow weigert een wachtwoord korter dan 16 tekens. Test erbij. |
| T4 | klein: elke bezoeker maakte een sessiebestand; koekje gold voor de hele site. | **Opgelost**: sessie alleen bij inloggen of een bestaand koekje; koekje alleen voor `/teller/`. |
| T5 | klein: dashboard in een frame te tonen. | **Opgelost**: `frame-ancestors 'none'`. |
| T6 | klein: oude tellingen nooit opgeruimd. | **Opgelost**: dagbestanden ouder dan 400 dagen worden af en toe weggehaald. |
| T7 | klein: telling zonder verplichte eigenschap werd aangenomen ("les ?"). | **Opgelost**: precies de eigenschappen van de lijst. Test erbij. |
| T8 | klein: verwijzerspam kan op het dashboard komen. | Open, geaccepteerd: alleen een sitenaam, ge-escaped; een vervalste verwijzer schaadt niemand. |
| T9 | klein: de test bewijst niet dat `.htaccess` werkt (`php -S` leest hem niet). | **Opgelost** als opmerking bij de test; de workflow controleert het op de echte site (T2). |
| T10 | klein: docs noemden nog Plausible; TransIP houdt zelf toegangslogs met IP. | **Opgelost** in `docs/05-techstack.md` en `docs/08-privacy-en-juridisch.md`. |
