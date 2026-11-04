# Vijfenvijftigste review: Pip op het bord, tegenstander op kleine telefoons (2026-11-04)

Ronde 33–34, layout-reviewer. **Oordeel: GO.** Wow: eerste les 8 (was 5), speelscherm 7 (was 4–5).

- **Middel: stopt de huppel, en staat hij uit bij minder beweging?** *In orde volgens de code:* `animation: huppel 520ms … 2` met 700 ms vertraging, dus na ongeveer 1,7 s stil. Bij `prefers-reduced-motion` staat hij uit (`Board.module.css`, het reduced-motion-blok). Die regel geldt ook voor Pip, want het plaatje heeft de klasse `.piece`.
- **Middel: 375×667, het bord loopt in de les onder de vouw.** *Bestond al:* in de kijkfase staat "Verder" in beeld (doorloop). Op het scorebord voor opgaven op de onderste rij.
- **Klein: statusregel speelscherm 375×667 onder de vouw.** *Bestond al*, het is niet erger geworden.
- **Klein: ballon op 1440 in drie korte regels.** *Op het scorebord.*
- **Klein: Pip op een donker veld minder zichtbaar.** *In orde:* het plaatje heeft een slagschaduw. De reviewer noemt e5 licht, maar in de DOM is e5 donker (`Board_dark`) en Pip is daar goed te zien.
