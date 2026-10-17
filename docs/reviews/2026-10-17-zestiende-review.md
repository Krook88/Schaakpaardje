# Zestiende review, 17 oktober 2026

Scope: `ceaa6dd` (PR #19). Een profiel voor nog een kind op hetzelfde apparaat:
`nieuwKind()` in `src/progress/store.ts`, het blok "Nog een kind" in
`src/app/ouders/page.tsx`, doorloopregel `tweedeKind()` in `scripts/doorloop.mjs`.

Reviewers: schaakmeester, layout-reviewer en codebase-reviewer. De releasecoördinator
kon in deze sessie zelf geen reviewers starten. Ze zijn daarom rechtstreeks gestart en
dit rapport is daarna gebundeld.

Vóór de review: `npm run check` groen (306 tests), doorloop 15/15, CI groen.

## Oordeel

- **Schaakmeester:** GO. Geen bevindingen. De voortgang van de twee kinderen blijft gescheiden en de modus volgt uit de eigen leeftijd.
- **Codebase:** GO. Niets blokkerends, maar wel een belangrijk punt (C1).
- **Layout:** geen blokkerende punten. L1 en L2 wil de layout-reviewer vóór de release opgelost hebben.

*Bijgewerkt na de herstelronde: alles opgelost, behalve wat hieronder met een reden open
staat. `npm run check` groen (308 tests), doorloop 15/15. Oordeel nu: **GO**.*

**Samen (vóór de herstelronde): NO-GO tot C1, L1 en L2 zijn opgelost.** Ze hebben dezelfde oorzaak: na de knop
is er geen kind meer actief, en dan kan een kind een les spelen zonder dat er iets wordt
bewaard. Voortgang die stil verdwijnt, voelt voor een kind als straf.

## Blokkerend

Geen.

## Belangrijk

| | Bevinding | Status |
|---|---|---|
| C1 | Na de knop is `actiefId` null terwijl er profielen bestaan. Geeft de ouder het apparaat terug zonder een profiel te kiezen, dan kan het kind via "alle lessen" (`Welkom.tsx:121`), de terugknop van de browser of een bladwijzer een les spelen. `bewaarLes`, `geefSticker` en `bewaarOefendag` bewaren dan stil niets. | **Opgelost** bij de bron: `nieuwKind()` is weg. De knop gaat naar `/#nieuw-kind` en het huidige kind blijft actief tot het nieuwe er is. Een toestand zonder actief kind terwijl er profielen zijn, bestaat niet meer. Doorloop: na de knop weglopen naar /lessen/ en terug, dan moet het eerste kind nog actief zijn. |
| L1 | Na de knop kom je bovenaan de landingspagina terecht, alsof je hier voor het eerst bent. Het formulier staat ongeveer 1600 px lager (telefoon) en er staat nergens dat het gelukt is. | **Opgelost**: met `#nieuw-kind` toont de startpagina alleen het formulier, met de kop "Nieuw profiel", zonder landingspagina, Pips welkom of links. Doorloop: de kop moet direct na de knop in beeld staan. |
| L2 | Er is geen zichtbare weg terug naar het bestaande kind: geen "← Terug naar Noor". Met de terugknop van de browser kom je op een half werkend ouderscherm: "je kind", leeftijd en instellingen doen niets, "Standaard voor" is afgekapt en "Profiel wissen" doet niets. | **Opgelost**: knop "← Terug naar 🐴 Noor" boven het formulier. Omdat het kind actief blijft, werkt de terugknop van de browser ook gewoon. Het ouderscherm zonder enig profiel (bestond al vóór deze PR) toont nu "Nog geen kind" met een knop naar de startpagina, in plaats van schuifjes die niets doen. |
| L3 | Het formulier kiest standaard `AVATARS[0]`. Twee kinderen krijgen daardoor allebei 🐴, en een kind dat niet leest kan zichzelf dan niet terugvinden bij "Wie speelt er?". | **Opgelost**: `eersteVrijeMaatje()` kiest het eerste plaatje dat nog vrij is, met een unittest. Doorloop: geen twee gelijke plaatjes bij "Wie speelt er?". |
| C2 | Er is geen unittest die vastlegt dat `nieuwKind()` alleen `actiefId` leegmaakt en de voortgang van het eerste kind laat staan. | **Opgelost**: `tests/profielen.test.ts`. Noor (5) haalt sterren, Daan (9) komt erbij en begint leeg als schaker, en Noor heeft na terugwisselen haar sterren en modus nog. |

## Klein

| | Bevinding | Status |
|---|---|---|
| C3 | De doorloop test alleen de route waarin alles goed gaat, niet het weglopen na de knop. | **Opgelost**: de doorloopregel test nu ook "terug" en weglopen. |
| C4 | `actiefId: null` blijft na herladen staan (persist). Dat is onschuldig zodra C1 is opgelost. | **Vervallen**: `actiefId` wordt niet meer null gezet door deze knop. |
| C5 | De afhandeling van het rekenslot staat nu drie keer in de doorloop (regel 431, 611, 744). Beter is één functie `openOuderscherm()`. | **Opgelost**: `losRekenslot(p)` in de doorloop, gebruikt door alle drie de stappen. |
| L4 | Het blok staat halverwege het ouderscherm, tussen de instellingen voor het actieve kind. Beter is hoger, of samen met wisselen en wissen in één blok "Profielen". | **Opgelost**: het blok heet nu "Kinderen op dit apparaat" en staat bovenaan. Het noemt ook bij welk kind de instellingen eronder horen. |
| L5 | De knoppen bij "Wie speelt er?" zijn 56 px hoog, onder de 64 px voor kindertikken. "Speel je weer verder?" gebruikt wel `btn--big`. | **Opgelost**: `btn--big` (64 px). |
| L6 | "Wie speelt er?" staat op de telefoon onder de vouw. | **Bewust zo gelaten**: bovenaan staat voor het kind "verder spelen", en dat moet de eerste tik blijven. Wie wisselt is meestal de ouder, en die wordt er nu in het ouderscherm naartoe gewezen. |

## Wat goed is

- De knop staat achter het rekenslot, dus een kind maakt geen profielen aan.
- Er gaat niets nieuws naar buiten. `tellen.ts` is niet aangeraakt.
- Zonder actief profiel crasht er nergens iets.
- Het contrast is in orde, in licht en donker. Er is geen horizontaal scrollen.

Nog open, buiten deze PR: een kind zonder enig profiel dat via "alle lessen" een les speelt, bewaart niets. Dat bestond al vóór deze PR.

In de herstelronde faalde de live-stap van de doorloop één keer ("zwart sprong naar de nieuwe partij zonder de mat te zien"). Daarna slaagde hij twee keer op rij; de live-code is niet geraakt. Om in de gaten te houden.

Schermafbeeldingen van de layout-reviewer: `/tmp/review-2026-10-17/` (niet in de repo).
