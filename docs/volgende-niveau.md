# Volgende niveau — scorebord

Geheugen van de `/loop`. Elke ronde: lees dit, pak het hoogste rode punt, bouw, bewijs, review, werk bij.

## Open vragen voor Kaj
- (geen open vragen; proef beeldtaal volgt ter beoordeling)

## Besluiten van Kaj
- 4 nov 2026: **proef beeldtaal goedgekeurd** (Pip in profiel met voetstuk, platte warme stijl; zie docs/volgende-niveau/proef-beeldtaal.png). Nu: de hele set en inbouwen.
- 4 nov 2026: **beeldtaal 1b**. Er komen eigen SVG's, gemaakt door een illustrator-agent. Eerst een proef (Pip en één wereld) ter beoordeling, daarna de uitrol.
- 4 nov 2026: **delen mag met een vast plaatje zonder naam**, bijvoorbeeld het wereldwapen. Nooit de naam van het kind of iets anders wat het kind intypt.
- 3 nov 2026: `maximum-scale=1` blijft, bewust tegen per ongeluk zoomen door kleine kinderen. Lat voor Lighthouse Toegankelijkheid daarom: 100 op alles behalve de audit `meta-viewport`.

## Nulmeting — ronde 1 (3 nov 2026)

Gemeten op lokale build (`npx serve out`), Lighthouse 12.2.1 mobiel, `scripts/meet-niveau.mjs`.
Schermafbeeldingen: `docs/volgende-niveau/voor-*.png`.

| Punt | Meting | Status |
|---|---|---|
| Geen horizontaal scrollen (10 formaten, licht+donker) | start en eerste les: nergens | 🟢 |
| Bord past zonder scrollen | ronde 2: staand ja; liggend 1024×768, 1180×820, 1440×900, 844×390 bord én pagina passen (velden 64/70/70/47 px). Open: 667×375 velden 36 px; staande telefoon scrolt onder het bord (knoppen) | 🟢 (bewaakt in doorloop) |
| Raakvlakken ≥ 48 px (64 kind) | ronde 7: 0 te klein op 8 schermen × 360/390 breed (scripts/raakvlakken.mjs), bordveld ≥ 44; doorloop bewaakt /, les, kaart | 🟢 |
| Lighthouse Performance ≥ 90 | 98 | 🟢 |
| Lighthouse Toegankelijkheid 100 | 95; enige afwijking is `meta-viewport`, bewust (zie besluiten) | 🟢 |
| Lighthouse Best Practices ≥ 95 | 96. De console-404 op `/sfx/manifest.json` is lokaal en bewust (hosting-klaar); live bestaat het manifest | 🟢 |
| Lighthouse SEO 100 | 100 | 🟢 |
| LCP < 2,5 s / CLS < 0,05 | 2,1 s / 0 | 🟢 |
| Eerste les ≤ 2 tikken, ≤ 15 s | 1 tik, 1,4 s | 🟢 |
| Tik-reactie < 100 ms | ronde 10: goed veld 31 ms, fout veld 31 ms, hulp 13 ms (zichtbare verandering, na de verf); bewaakt in doorloop | 🟢 |
| Beloningsmoment per wereld | ronde 3: eigen held-kaart (wapen 128 px, confetti, wapenrij), diploma-voorproef | 🟢 (wow nog te meten) |
| `prefers-reduced-motion` | ronde 10: elke animatie stopt na één keer; doorloop: geen eindeloze animaties op /, les, kaart, minispel; golf/vonk aan én uit bewaakt | 🟢 |
| Wow-toets ≥ 9 (4 schermen, 2 reviewers) | ronde 11 (alle vier opnieuw): start 7,5/7,5, les 6,5/7, wereld af 7/7, kaart 7/7,5 — vast op beeldtaal, zie vraag 1. ronde 6: start 7/8. ronde 5: kaart 6,5/7,5. ronde 4: eerste les 7/7. ronde 3: wereld af 5/7, diploma 7,5/8 (vóór verbouwing). ronde 2: start 6/7, les 6,5/6, diploma 3/–, kaart 5/6,5 (zie 27e review) | 🔴 |
| OG-afbeelding per pagina | ronde 9: 28 eigen plaatjes (werelden, schaakregels, schaakclub), lessen delen hun wereld; build controleert 206 verwijzingen. Nog te testen: vierkante uitsnede in echte WhatsApp | 🟢 |
| Deelknop op trotse momenten | ronde 3: op wereld af en diploma, alleen link + vaste zin, anonieme telling `Gedeeld`; doorloop bewaakt share én kopieer zonder naam | 🟢 |
| Installeerbaar | manifest + service worker aanwezig | 🟢 |
| Wereld 0–2 offline | ronde 8: 51 bestanden (1,3 MB) vooraf na het eerste bezoek; doorloop bewijst les, minispel, kaart, kaart→les en offlinepagina | 🟢 |
| `npm run check` + doorloop groen | ronde 2: groen (doorloop 23 regels) | 🟢 |
| `/release-review` go | 27e review: go voor deze fase, na verwerking | 🟢 |

## Rangschikking (wow per uur werk), bijgewerkt na ronde 4

Gedaan: bord liggend (r2), trots moment + delen (r3), eerste les levendiger (r4), wereldkaart (r5).

1. ~~Wereldkaart~~ (r5). Rest: één doorlopend landschap met slingerpad, Pip stuitert op de halte, alles-af-toestand.
2. ~~Startpagina-held~~ (r6). Rest: tikbaar paard in de held.
3. ~~Raakvlakken~~ (r7).
4. ~~Wereld 0–2 offline~~ (r8).
5. ~~OG per pagina~~ (r9).
6. ~~Tik-reactie~~ (r10).
7. Pip leeft mee in de les (springt bij goed veld, groter in zijkolom, huppelt het bord op) — 29e review.

## Logboek
- Ronde 1: nulmeting. Niets aan de app veranderd.
- Ronde 2: lesscherm liggend (bord naast Pip, volle hoogte op telefoon dwars). 27e review verwerkt. Wow-cijfers gemeten.
- Ronde 3: trots moment — deelknop (link + vaste zin, telling), diploma-voorproef met wereldwapens, wereld af als held. 28e review verwerkt. Pip-zin 'Hoefijzer verdiend' weg (klopte niet na wereld 1).
- Ronde 4: eerste les levendiger — bord rolt in een golf binnen bij de eerste zin, goed veld veert op met een vonkje, Pip groot op liggende schermen. Reduced-motion bewaakt in doorloop.
- Ronde 5: wereldkaart — reis-strook, heuvels, tegels 'Nog te ontdekken' (tik geeft antwoord), afgeronde werelden inklapbaar (64 px), 'Begin hier', scroll naar Pip (bewezen in doorloop).
- Ronde 6: startpagina — held met paardbord (begint bij de L), Pip met ballon bij het bord, beloftes als labels, verse schermafbeeldingen en deelkaart (scripts/schermen.mjs).
- Ronde 7: raakvlakken — alle knoppen 64 px, Pip en luisterknop 64, bord rand-tot-rand op smalle telefoons (veld 44), meetscript raakvlakken.mjs.
- Ronde 8: wereld 0–2 offline na het eerste bezoek, kindvriendelijke offlinepagina, belofte op startpagina en /over preciezer.
- Ronde 9: deelplaatjes per wereld, schaakregel en schaakclub; pat-uitleg aangescherpt; basePath-correcte og:image met buildcontrole.
- Ronde 10: gevoel — tik-reactie gemeten en bewaakt, minder beweging zonder eindeloze animaties.
- Ronde 11: speelbaar paard in de held; alle vier wow-schermen opnieuw gemeten. Loop gestopt: beeldtaal is een keuze voor Kaj (vraag 1).
