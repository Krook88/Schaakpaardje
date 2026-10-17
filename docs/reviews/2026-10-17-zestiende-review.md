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

**Samen: NO-GO tot C1, L1 en L2 zijn opgelost.** Ze hebben dezelfde oorzaak: na de knop
is er geen kind meer actief, en dan kan een kind een les spelen zonder dat er iets wordt
bewaard. Voortgang die stil verdwijnt, voelt voor een kind als straf.

## Blokkerend

Geen.

## Belangrijk

| | Bevinding | Status |
|---|---|---|
| C1 | Na de knop is `actiefId` null terwijl er profielen bestaan. Geeft de ouder het apparaat terug zonder een profiel te kiezen, dan kan het kind via "alle lessen" (`Welkom.tsx:121`), de terugknop van de browser of een bladwijzer een les spelen. `bewaarLes`, `geefSticker` en `bewaarOefendag` bewaren dan stil niets. | Open |
| L1 | Na de knop kom je bovenaan de landingspagina terecht, alsof je hier voor het eerst bent. Het formulier staat ongeveer 1600 px lager (telefoon) en er staat nergens dat het gelukt is. | Open |
| L2 | Er is geen zichtbare weg terug naar het bestaande kind: geen "← Terug naar Noor". Met de terugknop van de browser kom je op een half werkend ouderscherm: "je kind", leeftijd en instellingen doen niets, "Standaard voor" is afgekapt en "Profiel wissen" doet niets. | Open |
| L3 | Het formulier kiest standaard `AVATARS[0]`. Twee kinderen krijgen daardoor allebei 🐴, en een kind dat niet leest kan zichzelf dan niet terugvinden bij "Wie speelt er?". | Open |
| C2 | Er is geen unittest die vastlegt dat `nieuwKind()` alleen `actiefId` leegmaakt en de voortgang van het eerste kind laat staan. | Open |

## Klein

| | Bevinding | Status |
|---|---|---|
| C3 | De doorloop test alleen de route waarin alles goed gaat, niet het weglopen na de knop. | Open |
| C4 | `actiefId: null` blijft na herladen staan (persist). Dat is onschuldig zodra C1 is opgelost. | Open |
| C5 | De afhandeling van het rekenslot staat nu drie keer in de doorloop (regel 431, 611, 744). Beter is één functie `openOuderscherm()`. | Open |
| L4 | Het blok staat halverwege het ouderscherm, tussen de instellingen voor het actieve kind. Beter is hoger, of samen met wisselen en wissen in één blok "Profielen". | Open |
| L5 | De knoppen bij "Wie speelt er?" zijn 56 px hoog, onder de 64 px voor kindertikken. "Speel je weer verder?" gebruikt wel `btn--big`. | Open |
| L6 | "Wie speelt er?" staat op de telefoon onder de vouw. | Open |

## Wat goed is

- De knop staat achter het rekenslot, dus een kind maakt geen profielen aan.
- Er gaat niets nieuws naar buiten. `tellen.ts` is niet aangeraakt.
- Zonder actief profiel crasht er nergens iets.
- Het contrast is in orde, in licht en donker. Er is geen horizontaal scrollen.

Schermafbeeldingen van de layout-reviewer: `/tmp/review-2026-10-17/` (niet in de repo).
