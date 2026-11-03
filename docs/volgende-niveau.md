# Volgende niveau — scorebord

Geheugen van de `/loop`. Elke ronde: lees dit, pak het hoogste rode punt, bouw, bewijs, review, werk bij.

## Open vragen voor Kaj
- `maximum-scale=1` in de viewport blokkeert inzoomen (Lighthouse toegankelijkheid 95 i.p.v. 100). Was dat bewust, tegen per ongeluk zoomen door kleine kinderen? Tot je antwoord laat ik het staan.

## Nulmeting — ronde 1 (3 nov 2026)

Gemeten op lokale build (`npx serve out`), Lighthouse 12.2.1 mobiel, `scripts/meet-niveau.mjs`.
Schermafbeeldingen: `docs/volgende-niveau/voor-*.png`.

| Punt | Meting | Status |
|---|---|---|
| Geen horizontaal scrollen (10 formaten, licht+donker) | start en eerste les: nergens | 🟢 |
| Bord past zonder scrollen | staand: ja. **1024×768 en 1440×900: bord loopt 70–150 px onder de rand** | 🔴 |
| Raakvlakken ≥ 48 px | 18 links op de startpagina kleiner (stukkenlinks, voettekst, "Of maak eerst een profiel", 🔊). Les-knoppen ok | 🔴 |
| Lighthouse Performance ≥ 90 | 98 | 🟢 |
| Lighthouse Toegankelijkheid 100 | 95 (viewport-zoom, zie vraag) | 🔴 |
| Lighthouse Best Practices ≥ 95 | 96 (wel console-404 op `/sfx/manifest.json`) | 🟢 |
| Lighthouse SEO 100 | 100 | 🟢 |
| LCP < 2,5 s / CLS < 0,05 | 2,1 s / 0 | 🟢 |
| Eerste les ≤ 2 tikken, ≤ 15 s | 1 tik, 1,4 s | 🟢 |
| Tik-reactie < 100 ms | nog niet gemeten | ⚪ |
| Beloningsmoment per wereld | diploma-scherm bestaat; nog niet beoordeeld | ⚪ |
| `prefers-reduced-motion` | in 10 stijlbestanden; niet overal nagelopen | ⚪ |
| Wow-toets ≥ 9 (4 schermen, 2 reviewers) | nog niet gescoord | ⚪ |
| OG-afbeelding per pagina | één algemene `og.png` voor alle pagina's | 🔴 |
| Deelknop op trotse momenten | alleen in live spelen; niet bij wereld af / diploma | 🔴 |
| Installeerbaar | manifest + service worker aanwezig | 🟢 |
| Wereld 0–2 offline | alleen `/`, manifest, icoon voorgeladen; rest pas na bezoek | 🔴 |
| `npm run check` + doorloop groen | nog te draaien in ronde 2 | ⚪ |
| `/release-review` go | — | ⚪ |

## Rangschikking (wow per uur werk)

1. **Bord past op liggende schermen** (laptop, tablet liggend). Eerste les ziet er op een computer nu half uit. Klein werk, groot effect.
2. **Deelknop bij wereld af + diploma**, met eigen OG-plaatje van het diploma. Dit is het trotse moment dat ouders doorsturen.
3. **Wow-toets** door layout- en conversie-reviewer: geeft de echte lijst wat "wow" mist.
4. **Wereld 0–2 offline voorladen** (auto, telefoon zonder bereik).
5. **Raakvlakken startpagina** + sfx-404.
6. OG per pagina (lessen, schaakregels).

## Logboek
- Ronde 1: nulmeting. Niets aan de app veranderd.
