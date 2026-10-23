# Vijfentwintigste review, 23 oktober 2026

Scope: `41328cc` en de herstelcommits erna op `claude/wizardly-cray-9vevs8`. Twee tellingen,
op verzoek van Kaj:
- `Eerste opgave` {les}: de eerste tik op een opgave;
- `Profiel gemaakt` {na}: hoeveel lessen er als gast al af waren.

Op het dashboard komen een kolom "Speelde" en de trechter.

Reviewers: codebase-reviewer (twee keer, ook op de herstelcommits) en conversie-reviewer.
Schaakmeester en layout zijn overgeslagen: geen schaakinhoud, geen schermen voor kinderen.

## Oordeel

**GO.** Niets blokkerends.
- **Privacy:** in orde. Er gaan alleen een les-id en een vaste klasse mee, beide in de vaste lijsten.
- **Werking:** "Eerste opgave" kan niet vuren tijdens de uitleg of vóór het hervatten.
- **Controles:** `npm run check` groen (504 tests). Bij de codebase-reviewer gaf de doorloop 17/17.

## Bevindingen

| | Bevinding | Status |
|---|---|---|
| B1 / C1 (belangrijk) | "Speelde" telde ook hervatte lessen, waardoor Speelde boven Opende kon uitkomen en Af % te laag werd. | **Opgelost**: geen `Eerste opgave` bij een hervatte les (een ref die in het hervat-effect gezet wordt). |
| K2 / C5 | "geen les" telde ook een tweede kind. | **Opgelost**: de klasse `al een profiel`. Die telt niet mee in de trechter. |
| K1 / C2 / 4b | De verlooplijn en Af % deelden oude "af" door nieuwe "speelde". | **Opgelost**: `SPEELDE_VANAF` (2026-10-24). Beide rekenen alleen met "af" vanaf die dag. |
| K3 | De labels sloten niet op elkaar aan; de uitleg stond alleen in een `title`. | **Opgelost**: de kolom heet "Opende", met een zichtbare uitleg onder de kop. |
| K4 | De zin over profielen las stroef. | **Opgelost**: "Van de profielen: 3 meteen (nog geen les), …". |
| C3 | Profielen zonder `na` vielen weg uit de zin. | **Opgelost**: "van vóór deze meting", en de zin vervalt als er niets te melden is. |
| C4 | Oude tabbladen sturen `Profiel gemaakt` zonder eigenschappen en werden geweigerd. | **Opgelost**: de server neemt die ene telling zonder eigenschappen nog aan, met test. |
| C6 | Geen doorloopregel voor het moment waarop `Eerste opgave` vuurt. | **Niet gedaan, met reden**: op localhost verstuurt de app bewust niets, dus de doorloop kan het niet zien. Het gedrag van `eenKeer` is getest, en de codebase-reviewer heeft de volgorde (uitleg, hervatten) nagelopen. |
