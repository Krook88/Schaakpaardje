# Negentiende review, 21 oktober 2026

Scope: `dd74f8f..3fef509` op `claude/wizardly-cray-9vevs8`.
- **Herstelronde van de achttiende review:** teller (`src/lesson/lesTellingen.ts`) en het dashboard.
- **Weg naar de eerste les:**
  - "Probeer de eerste les" op de startpagina.
  - Spelen zonder profiel (`GAST` in de store), met "Bewaar je sterren" bij de beloning.
  - Rondleiding onder de grote knop, en het maatje dichtgeklapt.
  - Knoppen op de schaakregelpagina's.
  - Zoektitels en -omschrijvingen.
- **Nieuwe ouderpagina** `/schaakclub/`.

Reviewers: schaakmeester, layout-reviewer en codebase-reviewer. De releasecoördinator kan in deze
sessie geen reviewers starten. Ze zijn daarom rechtstreeks gestart en dit rapport is daarna gebundeld.

Vóór de review:
- `npm run check` groen (488 tests).
- Doorloop 17/17. Bij de layout-reviewer 16/17: "live: zwart sprong naar de nieuwe partij zonder de mat te zien" faalde, net als in de zeventiende review. Dat valt buiten deze diff (zie onderaan).

## Oordeel

- **Schaakmeester:** niets blokkerends. Er wordt niets fout geleerd en de leerlijn is niet geraakt. Mat komt alleen voor in tekst voor ouders.
- **Codebase:** niets blokkerends, niets belangrijks. Privacy en de randgevallen van de gast zijn in orde.
- **Layout:** niets blokkerends, twee belangrijke punten (L1, L2).

**Samen: GO na L1.**

*Bijgewerkt na de herstelronde: alles opgelost behalve S4 (ligt bij Kaj) en S7 (bewust zo gelaten). Oordeel nu: **GO**.* L1 raakt het kind: een kind dat niet leest tikt op de grootste knop, en
komt dan in een formulier terecht in plaats van bij de volgende les. L2 gaat alleen over het
dashboard voor Kaj, maar is goedkoop.

## Blokkerend

Geen.

## Belangrijk

| | Bevinding | Status |
|---|---|---|
| L1 | Bij de beloning als gast staat de kaart "Bewaar je sterren" (ongeveer 230 px hoog, met een knop over de hele breedte) tussen de sterren en "Volgende les". Op 375×667 verdwijnt "Volgende les" onder de vouw, en "Kies een naam" is de grootste knop op het scherm. | **Opgelost**: de kaart is weg. Onder de knoppen staat nu één regel voor de ouder: "Bewaar je sterren onder een naam: kies een naam", als gewone link met een raakvlak van 44 px. "Volgende les" is weer de grootste knop. |
| L2 | Dashboard, tabel "Opgaven": op 375 px staat "Vast", de kolom waarop gesorteerd wordt, buiten beeld. | **Opgelost**: "Vast" staat nu direct na de les, en de opgave heet kort "zelf 2". |

## Klein

| | Bevinding | Status |
|---|---|---|
| S1 | /schaakclub/: "na wereld 6 weet je kind hoe alle stukken lopen" kan lezen als "klaar voor een partij". De rokade, schaak en mat komen pas later. | **Opgelost**: "…op de rokade na. Schaak en mat komen daarna, dus een hele partij spelen kan het nog niet." |
| S2 | /schaakclub/: "pionnendiploma" is waarschijnlijk niet de officiële naam. Beter: "het Stap 1-diploma (op veel clubs het pionnendiploma)". | **Opgelost**: "het Stap 1-diploma, op veel clubs het pionnendiploma genoemd". /over/ gebruikt nog "pionnendiploma"; dat is de gangbare naam en blijft zo. |
| S3 | /schaakclub/: jeugdteams worden ook op sterkte ingedeeld, niet alleen op leeftijd. | **Opgelost**: "van ongeveer dezelfde leeftijd of sterkte". |
| S4 / C7 | De link naar de clubzoeker van de KNSB is door geen enkele reviewer bereikt (DNS) en staat onder `/spelers/volwassenen/`. Kaj moet hem met de hand nakijken, ook of er een jeugdfilter is. | **Open, ligt bij Kaj**: link met de hand controleren. Het `npm run live` kijkt alleen naar de eigen site. |
| S6 | /schaakregels/pat/ stuurt naar mat-3, en die les gaat uit van schaak en mat. | **Opgelost**: nieuw veld `oefenEerst` in `Onderwerp`. Pat gaat nu eerst naar mat-1. Een les mag maar bij één onderwerp horen (test), dus mat-1 kon niet aan `lessen` worden toegevoegd. De test controleert ook `oefenEerst`. |
| S7 | Gastvoortgang uit een latere wereld gaat mee naar een profiel van een jonge kleuter. De volgende les blijft goed; alleen de voortgangsbalk klopt dan niet helemaal. | **Bewust zo gelaten.** Wat er op dit apparaat gehaald is, is gehaald. De volgende les blijft de eerste die nog niet af is, dus er wordt niets overgeslagen. Filteren op leeftijd zou sterren weggooien die een kind wél haalde. |
| S9 / C4 | Het commentaar bij `missersDrempel` suggereert dat foute quizknoppen verdwijnen; dat doen ze niet. Twee keer tikken op dezelfde foute knop telt nu als twee missers. | **Opgelost**: commentaar rechtgezet; een tweede tik op dezelfde foute quizknop telt niet als nieuwe misser. |
| C1 | `bewaarPartij`, `bewaarOverwinning` en `bewaarOpfrissing` gooien bij een gast nog steeds alles weg. | **Opgelost**: ook partijen, verslagen bots en opfrissen bewaren zonder profiel onder de gast, en het eerste profiel neemt ze over. Test erbij. |
| C2 | `verwijderProfiel` ruimt `hervatpunt` en `verslagen` niet op. Dat was al zo. | **Opgelost**: `verwijderProfiel` ruimt ook `hervatpunt` en `verslagen` op. |
| C3 | Geen test voor: laatste profiel weg, dan als gast spelen, dan nieuw profiel. | **Opgelost**: test "laatste profiel weg, dan als gast spelen, dan een nieuw profiel". |
| C5 | `kort()` knipt midden in een woord als er geen spatie staat, en het commentaar ernaast klopt niet. | **Opgelost**: zonder spatie hard afkappen, commentaar klopt nu, twee testregels erbij. |
| C6 | Doorloopregel `gastHoudtZijnSterren`: de antwoorden van weide-1 staan erin vastgezet, en de foutmelding zegt dat niet. | **Opgelost**: de foutmelding noemt de vastgezette antwoorden van weide-1. |
| L3 | De dichtgeklapte maatjeskeuze ziet er niet uit als iets om op te tikken: geen pijltje, geen knopvorm, 44 px hoog, en de gekozen naam wordt niet voorgelezen. | **Opgelost**: de summary is een knop (`.btn`) met "Ander maatje kiezen", zonder Safari-driehoekje. Het gekozen maatje wordt voorgelezen. |
| L4 | De privacyzin onder het naamveld is klein (13,6 px). | **Opgelost**: 0,95rem. |
| L5 | De link "Of maak eerst een profiel" heeft een raakvlak van 24 px. | **Opgelost**: padding, raakvlak nu 44 px. |

Buiten deze diff: de doorloopregel voor live spelen ("zwart sprong naar de nieuwe partij zonder
de mat te zien") faalde bij de layout-reviewer, en ook in de zeventiende review. Hij gaat wisselend
goed en fout. Dat moet een eigen onderzoek krijgen, geen nieuwe poging.
