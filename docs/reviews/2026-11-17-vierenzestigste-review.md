# Vierenzestigste review: teller "Waar verbeteren?" en meting van Pips stem (2026-11-17)

**Oordeel: NO-GO — de review is niet gedaan.** Geen van de vier reviewers heeft gekeken.
Dit is geen oordeel over de inhoud van de wijziging, maar over het ontbreken van een review.

## Scope
- Branch `claude/great-einstein-ywbbgk`, commit `37b17dc` "Teller: 'Waar verbeteren?' bovenaan en meting van Pips stem".
- Diff: `git diff 89e6111 37b17dc`, 11 bestanden, +433 / -8:
  `public/teller/dashboard.php`, `public/teller/opslag.php`, `src/app/ouders/page.tsx`,
  `src/audio/voice.ts`, `src/lesson/LessonPlayer.tsx`, `src/lesson/lesTellingen.ts`,
  `src/ui/GeluidKnop.tsx`, `src/ui/Tellingen.tsx`, `tests/les-tellingen.test.ts`,
  `tests/tellen.test.ts`, `tests/teller-php.test.ts`.
- Doel: het tellerdashboard laten tonen waar de app beter moet, en meten of kinderen in de
  uitleg afhaken door Pips stem. Drie nieuwe anonieme tellingen: `Stem`, `Uitleg`, `Geluid`.
  Schaakinhoud niet gewijzigd (volgens de aanvrager).

## Reviewers
In deze sessie had de coördinator geen gereedschap om de reviewers (subagents) te starten.
Daarom:

| reviewer | uitslag |
|---|---|
| schaakmeester | niet gestart, geen uitslag |
| layout-reviewer | niet gestart, geen uitslag (ouderscherm-tekst en dashboard gewijzigd) |
| codebase-reviewer | niet gestart, geen uitslag |
| conversie-reviewer | niet gestart, geen uitslag (ouderscherm gewijzigd, dus hoort erbij) |

Er zijn geen bevindingen, omdat er niet gekeken is. De coördinator vult die niet zelf in.

## Wat de reviewers in elk geval moeten bekijken (vraag van de aanvrager)
- **Privacy (CLAUDE.md):** voegen `Stem`, `Uitleg` en `Geluid` alleen losse tellingen toe,
  zonder iets over een kind, zonder ID, en staan ze in beide vaste lijsten? Maakt de
  combinatie van velden in `Uitleg` (les, zin, einde, doorgetikt, stem) een bezoek niet
  herleidbaar?
- **Juistheid van de metingen:** dubbel of verkeerd tellen bij terugkijken (kijkTerug),
  een hervatte les, het laden van de pagina, en `Stem` "één keer per paginabezoek".
- **Dashboard:** zijn de conclusies in "Waar verbeteren?" en "Pips stem" niet misleidend
  (kleine aantallen, oorzaak en gevolg, weging)?
- **Ouderscherm:** klopt de aangevulde uitleg over wat er geteld wordt, en is de
  spraak-schakelaar nog duidelijk?

## Gebundelde bevindingen
Geen — er is geen reviewuitslag.

## Oordeel
**NO-GO** tot de vier reviewers gekeken hebben. Daarna een nieuwe ronde van dit rapport.
