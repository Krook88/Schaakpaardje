# Negenentwintigste review: eerste les levendiger (2026-11-03)

Fase: "volgende niveau", ronde 4. Wat er nieuw is: het bord rolt bij de eerste vertelzin binnen in een golf, een goed veld veert op met een vonkje, en Pip is groot op liggende schermen.
Branch `volgende-niveau`. De reviewers zijn rechtstreeks gestart.

**Oordeel na verwerking: GO voor deze fase.** Niets is blokkerend. `check` en de doorloop zijn groen, de doorloop met 2 regels over beweging aan en uit.

## Schaakmeester
- Er is niets aan de content of de regels veranderd. De golf loopt langs de diagonalen, en een diagonaal heeft altijd één kleur. De golf laat dus nooit een verkeerde veldkleur zien, en het bord eindigt met rechtsonder licht.
- **Klein: een aangewezen veld was tijdens de golf onzichtbaar.** *Opgelost:* de golf schaalt nu alleen, zonder doorzichtigheid, dus elk veld is er vanaf het eerste beeld.
- **Klein: de golf speelt bij elke les, niet alleen bij de kennismaking.** *Niet veranderd, bewust:* het is een korte opening van 0,8 s en het leert niets fout. Komt er ergens bezwaar, dan beperken we hem tot wereld 0.

## Layout
- **Belangrijk: vonk en vinkje botsten.** *Opgelost:* het vonkje stijgt nu op vanuit linksonder en start 250 ms na het vinkje.
- **Belangrijk: een half bord voelde even "kapot".** *Opgelost:* de golf begint op schaal 0,6 en is nooit doorzichtig. Hij doet 30 ms per stap, waardoor het bord binnen ongeveer 0,8 s rond is.
- **Klein: de golf speelt opnieuw bij terug naar zin 1.** *Bewust,* met commentaar in de CSS.
- **Klein: Pip liggend is nog bescheiden (75 px).** *Niet opgelost:* dat hoort bij "Pip leeft mee" en staat op het scorebord.

## Conversie
- **Klein: half bord in een screenshot.** *Opgelost,* zie Layout.
- **Klein: vonk en vinkje vormen een kluitje.** *Opgelost,* zie Layout.
- De eerste tik wordt niet vertraagd. Er hoeft niets bij in `BEKEND`.

## Codebase
- **Belangrijk: de vonkcontrole bewees niets.** *Opgelost:* de regel controleert nu dat de vonk in de DOM staat, en draait mét en zonder beweging. Met beweging moeten golf en vonk er zijn, zonder beweging niet.
- **Klein: Pip verspringt bij het laden door `useMediaQuery`.** *Geaccepteerd,* met commentaar: Pip staat in een eigen kolom, dus het bord verschuift niet.
- **Klein: de golf wint van `.wrong` en `.goedVeld`.** *Opgelost* in de JSDoc: de golf is alleen voor niet-interactieve borden. Nu gebruikt alleen de vertelfase hem.
- **Klein: het bord is even onzichtbaar.** *Vervallen:* er is geen opacity meer.
- **Klein: geen test voor `useMediaQuery`.** *Niet gedaan:* de hook is klein, en de doorloop gebruikt hem al via de liggende formaten.

## Wow: eerste les
| layout | conversie | vorige ronde (27e) |
|---|---|---|
| 7 | 7 | 6,5 / 6 |

Naar een 9:
- Pip leeft mee: hij springt of knikt bij elke goede tik, en wordt groter in de zijkolom.
- Pip huppelt het bord op na de golf.
- Na het laatste goede veld van een opgave volgt een korte afsluiter.
