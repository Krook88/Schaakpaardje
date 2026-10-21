# Twintigste review, 21 oktober 2026

Scope: `e127295` en `7f8620b` op `claude/wizardly-cray-9vevs8`. Alleen `/schaakclub/`:
- "▶ Probeer eerst Schaakmaatje, gratis" is de hoofdknop, de clubzoeker van de KNSB de tweede knop.
- Onderaan staat een extra knop "Probeer de eerste les".

Reviewers: layout-reviewer en codebase-reviewer. De schaakmeester is overgeslagen, want er is
geen schaakinhoud gewijzigd. De coördinator kan in deze sessie geen reviewers starten, dus ze
zijn rechtstreeks gestart.

Vóór de review: typecheck, 490 tests en build groen.

## Oordeel

**GO.** Niets blokkerends en niets belangrijks.
- **Contrast:** de oranje knop is 4,71:1 in licht en 7,32:1 in donker; de tweede knop 16:1 in licht en 14,3:1 in donker.
- **Raakvlakken:** alle drie de knoppen zijn 64 px hoog.
- **Breedte:** op 375 px scrolt de pagina niet horizontaal.

## Klein

| | Bevinding | Status |
|---|---|---|
| C1 | De href naar de eerste les stond twee keer in de code. | **Opgelost**: één constante, `EERSTE_LES` (7f8620b). |
| C2 | Een schermlezer las "↗" voor en hoorde niet dat de link een nieuw tabblad opent. | **Opgelost**: het teken heeft nu `aria-hidden`, en er staat een verborgen "(opent in een nieuw tabblad)" bij. |
| L1 | Op 375 px breekt de tekst van de hoofdknop af over twee regels, en dan staat het ▶-teken los links. | **Bewust zo gelaten.** Kaj vroeg om een knop die duidelijk zegt dat je eerst Schaakmaatje probeert; met een kortere tekst valt die naam weg. Cosmetisch. |
| L2 | Op 375 px zijn beide knoppen even groot, zodat de hiërarchie alleen op kleur rust. | **Bewust zo gelaten.** Het kleurverschil is groot genoeg (volgens de reviewer zelf ook). |
| L3 | In licht steekt de rand van de tweede knop zwak af. | **Niet aangepast.** De schaduw en de tekst maken duidelijk dat het een knop is; het is de gewone stijl van `.btn` in de hele app. |
| L4 | Er zijn nu drie links naar hetzelfde doel. | **Bewust zo gelaten**: op een lange pagina is dat prima, zoals de reviewer ook zegt. |
