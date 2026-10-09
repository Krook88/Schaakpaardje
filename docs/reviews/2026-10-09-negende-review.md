# Negende review, 9 oktober 2026

Scope: samen spelen (commit `2e6cf07`, in PR #10 naast "dagen geoefend"). Reviewers:
schaakmeester (GO), codebase-reviewer (GO), layout-reviewer (**NO-GO**).

## Oordeel

**NO-GO** door de layout-reviewer: het bord draaide direct na een zet, en een kind
dat nog eens tikte deed zo de zet van het andere kind. Dat en alle belangrijke punten
zijn opgelost (`zie statuskolom`); de layout-reviewer kijkt opnieuw.

## Layout

| | Bevinding | Status |
|---|---|---|
| B1 | blokkerend: het bord draaide direct; een herhaalde tik deed de zet van de ander. | **Opgelost**: de zet blijft 0,9 s staan met het bord op slot, daarna draait het. Doorloopregel 10 tikt direct na de zet nog eens en faalt aantoonbaar op de oude code. |
| I1 | belangrijk: de gast kreeg standaard hetzelfde plaatje als het profielkind; plaatjes van andere profielen waren kiesbaar. | **Opgelost**: plaatjes van iedereen op het apparaat zijn niet kiesbaar, en de standaard is een vrij plaatje. |
| I2 | belangrijk: na "andersom" heette de gast "Zwart" terwijl hij wit speelde. | **Opgelost**: de gast heet naar zijn plaatje ("Vos", "Beer"), nooit naar een kleur. |
| K1 | klein: terugnemen na mat telde de partij dubbel. | **Opgelost**: één keer bewaren per partij. In doorloopregel 10. |
| K2 | klein: "Gelijk" (materiaal) naast de winnaar. | **Opgelost**: de materiaalstand verdwijnt bij een uitslag. |
| K3 | klein: twee knoppen om opnieuw te beginnen; "Andere tegenstander" bij samen. | **Opgelost**: na een samen-partij alleen "andersom"; de link heet "Terug naar spelen". |
| K4 | klein: bordvelden op 360 px 40,5 px. | Open: bestaand punt (zevende review K12), eigen ronde. |
| K5 | klein: uitslagkaart onder de vouw op een korte telefoon. | Open: de regel "🏆 ... wint!" staat altijd in beeld, direct onder het bord. |
| K6 | klein: Pip zegt de hele partij "Wit begint". | Open: een beurtzin met naam kan niet ingesproken worden; de regel onder het bord noemt plaatje en naam. |

## Codebase

| | Bevinding | Status |
|---|---|---|
| B1 | belangrijk: terugnemen na mat telde dubbel, voor twee kinderen. | **Opgelost**, zie layout K1. |
| B2 | belangrijk: `blunderVerlies` in een component, zonder test; `bewaarPartij` met profiel ongetest. | **Opgelost**: `blunderVerlies` staat in `src/engine/game.ts` met tests voor wit en zwart (`tests/samen.test.ts`); storetest voor een partij voor een ander profiel. |
| K1 | klein: commentaar over de oriëntatie klopte niet. | **Opgelost**: na de laatste zet draait het bord niet meer (de winnaar ziet zijn matbeeld). |
| K2 | klein: kiezer wachtte niet op de geladen toestand. | **Opgelost**. |
| K3 | klein: na "andersom" geen beurtzin. | **Opgelost**: Pip zegt weer "Samen spelen! Wit begint." |
| K4 | klein: drie nieuwe zinnen nog niet ingesproken. | Bij publiceren. |

## Schaakmeester

| | Bevinding | Status |
|---|---|---|
| 1 | klein: bord sprong bij de uitslag weg van de winnaar. | **Opgelost**, zie codebase K1. |
| 2 | klein: noem "Mat!" en geef pat een eigen zin. | Open, bewust: samen spelen staat open vóór wereld 10, en mat eerder noemen dan wereld 10 mag niet (CLAUDE.md). Kaj beslist of samen spelen pas na wereld 10 open moet; dan kan het wel. |
| 3 | klein: "N zetten" telde halve zetten. | **Opgelost**: geen aantal meer op de uitslagkaart. |
| 4 | klein: "daar kan hij hem slaan" bij samen spelen. | **Opgelost**: bij samen alleen de eerste zin, zonder "hij". |
| 5 | klein: blunderreparatie zonder test. | **Opgelost**, zie codebase B2. |
