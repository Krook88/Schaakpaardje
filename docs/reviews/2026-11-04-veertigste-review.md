# Veertigste review: trofeeënplank op de kaart (2026-11-04)

Fase: "volgende niveau", ronde 15. Reviewers rechtstreeks gestart (de coördinator heeft geen Agent-tool).

| reviewer | oordeel |
|---|---|
| layout-reviewer | plank niet in beeld bij binnenkomst; wow: start 6, les 6,5, wereld af 7,5, kaart nieuw 6, kaart 3af 6,5 |
| conversie-reviewer | zelfde punt; wow: 7 / 7 / 7,5 / 6 / 6,5 |
| codebase-reviewer | niets blokkerends; `check` en `doorloop` groen; 4 klein |

**Oordeel: GO voor deze fase.** Wow blijft het enige rode lat-punt.

## Bevindingen en wat ermee gedaan is
- **L/C. Plank niet in beeld, de kaart scrolt naar Pip.** *Opgelost.* De plank staat direct boven de wereld van vandaag; past plank plus les in beeld, dan scrolt de kaart naar de plank. Nieuwe doorloopregel (390×500, drie werelden af): plank in beeld. Faalde eerst (top −82), nu groen.
- **CB1. Lijst zonder naam.** *Opgelost.* Kop is een `h2` met id, de `ul` heeft `aria-labelledby`.
- **CB2. Hoefijzers dubbel voorgelezen.** *Opgelost.* `aria-hidden` op de hoefijzers in de reisregel zodra de plank er is. De dubbele wapens in de kleine rij blijven: die tonen ook de werelden die nog niet af zijn.
- **CB3. Overbodige `--toon` op de plank.** *Opgelost*, weggehaald.
- **CB4. Plank niet getest.** *Opgelost* via de nieuwe doorloopregel (bestaan + in beeld). Verborgen bij nul af: niet apart getest, de voorwaarde is `gewonnen.length > 0`, laag risico.
- **Wapens in de kleine rij dimmen, plank op wereld-af-scherm, "3 van de 15".** *Niet in deze fase*: volgende wow-ronde.
- **"Koningskasteel" krap in 76 px.** *Niet opgelost*, breekt netjes af op twee regels; volgende ronde bekijken.
