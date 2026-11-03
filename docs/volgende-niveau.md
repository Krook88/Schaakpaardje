# Volgende niveau — scorebord

Geheugen van de `/loop`. Elke ronde: lees dit, pak het hoogste rode punt, bouw, bewijs, review, werk bij.

## Open vragen voor Kaj
- Delen stuurt nu alleen link + vaste zin. Mag er ook een **vast plaatje zonder naam** mee (bijv. het wereldwapen met Pip), zodat de ontvanger ziet wát er gevierd wordt? Tot je antwoord: alleen link + zin. (28e review, L3)

## Besluiten van Kaj
- 3 nov 2026: `maximum-scale=1` blijft, bewust tegen per ongeluk zoomen door kleine kinderen. Lat voor Lighthouse Toegankelijkheid daarom: 100 op alles behalve de audit `meta-viewport`.

## Nulmeting — ronde 1 (3 nov 2026)

Gemeten op lokale build (`npx serve out`), Lighthouse 12.2.1 mobiel, `scripts/meet-niveau.mjs`.
Schermafbeeldingen: `docs/volgende-niveau/voor-*.png`.

| Punt | Meting | Status |
|---|---|---|
| Geen horizontaal scrollen (10 formaten, licht+donker) | start en eerste les: nergens | 🟢 |
| Bord past zonder scrollen | ronde 2: staand ja; liggend 1024×768, 1180×820, 1440×900, 844×390 bord én pagina passen (velden 64/70/70/47 px). Open: 667×375 velden 36 px; staande telefoon scrolt onder het bord (knoppen) | 🟢 (bewaakt in doorloop) |
| Raakvlakken ≥ 48 px | ook: kopknoppen 44 px, fasebalk/voortgangsrondjes klein (27e review L4). 18 links op de startpagina kleiner (stukkenlinks, voettekst, "Of maak eerst een profiel", 🔊). Les-knoppen ok | 🔴 |
| Lighthouse Performance ≥ 90 | 98 | 🟢 |
| Lighthouse Toegankelijkheid 100 | 95; enige afwijking is `meta-viewport`, bewust (zie besluiten) | 🟢 |
| Lighthouse Best Practices ≥ 95 | 96 (wel console-404 op `/sfx/manifest.json`) | 🟢 |
| Lighthouse SEO 100 | 100 | 🟢 |
| LCP < 2,5 s / CLS < 0,05 | 2,1 s / 0 | 🟢 |
| Eerste les ≤ 2 tikken, ≤ 15 s | 1 tik, 1,4 s | 🟢 |
| Tik-reactie < 100 ms | nog niet gemeten | ⚪ |
| Beloningsmoment per wereld | ronde 3: eigen held-kaart (wapen 128 px, confetti, wapenrij), diploma-voorproef | 🟢 (wow nog te meten) |
| `prefers-reduced-motion` | in 10 stijlbestanden; niet overal nagelopen | ⚪ |
| Wow-toets ≥ 9 (4 schermen, 2 reviewers) | ronde 3: wereld af 5/7, diploma 7,5/8 (vóór verbouwing). ronde 2: start 6/7, les 6,5/6, diploma 3/–, kaart 5/6,5 (zie 27e review) | 🔴 |
| OG-afbeelding per pagina | één algemene `og.png` voor alle pagina's | 🔴 |
| Deelknop op trotse momenten | ronde 3: op wereld af en diploma, alleen link + vaste zin, anonieme telling `Gedeeld`; doorloop bewaakt share én kopieer zonder naam | 🟢 |
| Installeerbaar | manifest + service worker aanwezig | 🟢 |
| Wereld 0–2 offline | alleen `/`, manifest, icoon voorgeladen; rest pas na bezoek | 🔴 |
| `npm run check` + doorloop groen | ronde 2: groen (doorloop 23 regels) | 🟢 |
| `/release-review` go | 27e review: go voor deze fase, na verwerking | 🟢 |

## Rangschikking (wow per uur werk), bijgewerkt na ronde 2

1. ~~Diploma / wereld af~~ (ronde 3 gedaan). Volgende: **Eerste les levendiger** — zie 2.
0. *(oud)* **Diploma / wereld af als screenshot-magneet**: deelbaar diploma (naam blijft lokaal), confetti met reduced-motion, deelknop (Web Share + kopieer link, alleen de link), eigen OG-plaatje. Laagste wow-cijfer (3), en precies het moment dat ouders doorsturen.
2. **Eerste les levendiger**: Pip groot in de rechterkolom met stemmingen, het bord reageert bij zin 1, een kleine beloning per goed veld.
3. **Wereldkaart als landschap** in plaats van stroken; dichte werelden in kleur.
4. **Startpagina-held**: bewegende Pip + bord, belofte groot.
5. **Raakvlakken**: kop, fasebalk, startpagina-links + sfx-404.
6. **Wereld 0–2 offline voorladen.**
7. OG per pagina.

## Logboek
- Ronde 1: nulmeting. Niets aan de app veranderd.
- Ronde 2: lesscherm liggend (bord naast Pip, volle hoogte op telefoon dwars). 27e review verwerkt. Wow-cijfers gemeten.
- Ronde 3: trots moment — deelknop (link + vaste zin, telling), diploma-voorproef met wereldwapens, wereld af als held. 28e review verwerkt. Pip-zin 'Hoefijzer verdiend' weg (klopte niet na wereld 1).
