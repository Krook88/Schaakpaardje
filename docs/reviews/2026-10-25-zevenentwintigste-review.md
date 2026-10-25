# Zevenentwintigste review, 25 oktober 2026

**Oordeel: NO-GO, omdat de review niet heeft plaatsgevonden.** Dit is geen inhoudelijk oordeel
over de wijzigingen. Geen van de vier reviewers heeft gekeken (zie hieronder).

## Scope

- Branch `claude/feedback-kind-van-vijf`, één commit `f4205d1` bovenop `main` (`736eedf`).
- Vorige review: `docs/reviews/2026-10-23-zesentwintigste-review.md`.
- Doel: feedback van een ouder van een vijfjarige verwerken.

| Bestand | Wijziging |
|---|---|
| `src/lesson/LessonPlayer.tsx` | +120 / -? : lesscherm 100dvh, bord in `.bordvlak`/`.bordpast`, Verder-wiebel, handje na 2,5 s, `VERDER_UITLEG` na 7 s, quizantwoorden voorgelezen |
| `src/lesson/LessonPlayer.module.css` | +71: `.lesscherm`, `.bordvlak`, `.bordpast` (container-type: size), sticky knoppenrij, `.verderKlaar`, `.quizVoorgelezen` |
| `src/ui/Pip.tsx` | nieuwe prop `onPratend`; wachten pas na `speak()` |
| `src/content/voice.ts` | `VERDER_UITLEG`, nieuwe `PRIJS_LAATSTE` en `_OUDER` |
| `src/content/validate.ts` | quizlabels in `alleZinnen()` |
| `scripts/doorloop.mjs` | nieuwe regel `verderInBeeld` (vier schermmaten) |

Totaal 6 bestanden, +259 / -16.

Volgens de ontwikkelaar: `npm run check` groen (504 tests, content, audio:dekking, build),
`npm run doorloop` 19 van 19 groen. Dat heeft de coördinator niet zelf nagelopen.

## Reviewers

De coördinator kon de reviewers niet starten. In deze sessie was geen Agent-tool beschikbaar,
dus `schaakmeester`, `layout-reviewer`, `codebase-reviewer` en `conversie-reviewer` konden
niet worden gestart. Er is ook niet op een andere manier een uitslag verkregen.

| Reviewer | Uitslag |
|---|---|
| schaakmeester | **Niet gedraaid.** Geen uitslag. |
| layout-reviewer | **Niet gedraaid.** Geen uitslag. |
| codebase-reviewer | **Niet gedraaid.** Geen uitslag. |
| conversie-reviewer | **Niet gedraaid.** Geen uitslag. Wel minder relevant: er is geen pagina voor ouders gewijzigd. |

## Bevindingen

Geen. Er heeft niemand gekeken, dus er zijn ook geen bevindingen. Dat betekent **niet** dat de
wijziging in orde is.

## Waar de reviewers straks in elk geval naar moeten kijken

Dit zijn vragen, geen bevindingen:

- **Schaakmeester:** klopt de nieuwe tekst van `PRIJS_LAATSTE`/`_OUDER` en `VERDER_UITLEG`
  didactisch? Wordt een kind niet te veel gestuurd doordat een quizknop oplicht tijdens het
  voorlezen?
- **Layout:** past het bord met de Verder-knop in beeld op een kleine telefoon en een liggende
  tablet? Leidt het wiebelen of het handje 👉 af, of zet het een kind onder druk?
- **Codebase:** `container-type: size` met een absolute meetlat, de timers (2,5 s en 7 s) bij
  van les wisselen of de les verlaten, de prop `onPratend` en de wijziging in de wachtlogica
  van `Pip.tsx`.
- **Conversie:** waarschijnlijk niet nodig. Er is geen ouderpagina gewijzigd.

## Wat eerst moet

1. Start de vier reviewers (of in elk geval schaakmeester, layout en codebase) op `f4205d1`.
   Doe dat vanuit een sessie die de Agent-tool heeft, bijvoorbeeld met `/release-review`.
2. Schrijf hun uitslagen in dit rapport en vervang het oordeel.
3. Los daarnaast `npm run audio:render` op voor de nieuwe zinnen: `VERDER_UITLEG`,
   `PRIJS_LAATSTE` en de quizlabels. Tot dan valt de app terug op de apparaatstem. De eigenaar
   moet zelf beslissen of dat mag voor een release.
