# Volgende niveau — scorebord

Geheugen van de `/loop`. Elke ronde: lees dit, pak het hoogste rode punt, bouw, bewijs, review, werk bij.

## Open vragen voor Kaj
- **Opname.** De schaakmeester raadt aan om "Dan roep je: schaak!" (w9-schaak, les 2) te vervangen door "Je mag dan 'schaak' zeggen": het is geen regel, en bij de club leren kinderen dat het niet hoeft. Het is een ingesproken zin, dus er is een nieuwe opname nodig (`npm run audio:render`, met een ElevenLabs-sleutel). Zal ik de tekst aanpassen zodat jij hem opnieuw laat inspreken? De loop gaat intussen gewoon door.
- **Opname weide-1.** Pip staat nu op e5 (donker veld) in de eerste les. De schaakmeester en layout-reviewer stellen een zin voor die het paard aan Pip koppelt, bijvoorbeeld "Ik sta op een donker veld" of "Dit paard ben ik". Daarvoor is een nieuwe opname nodig. Zal ik die zin toevoegen?

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
| LCP < 2,5 s / CLS < 0,05 | ronde 13: 2,1–2,3 s / 0 (3 metingen) | 🟢 |
| Eerste les ≤ 2 tikken, ≤ 15 s | 1 tik, 1,4 s | 🟢 |
| Tik-reactie < 100 ms | ronde 10: goed veld 31 ms, fout veld 31 ms, hulp 13 ms (zichtbare verandering, na de verf); bewaakt in doorloop | 🟢 |
| Beloningsmoment per wereld | ronde 3: eigen held-kaart (wapen 128 px, confetti, wapenrij), diploma-voorproef | 🟢 (wow nog te meten) |
| `prefers-reduced-motion` | ronde 10: elke animatie stopt na één keer; doorloop: geen eindeloze animaties op /, les, kaart, minispel; golf/vonk aan én uit bewaakt | 🟢 |
| Wow-toets ≥ 9 (4 schermen, 2 reviewers) | ronde 14 (Pip groot): start 7/7, les 6/6,5, wereld af 8/8, kaart 6–7/7,5. ronde 13 (iconen): start 7/7,5, les 6–7/7, wereld af 8/7,5, kaart 7–8/8. ronde 12 (illustraties): start 7/7,5, les 6,5/7,5, wereld af 7,5/8, kaart 7–8/8. ronde 11 (alle vier opnieuw): start 7,5/7,5, les 6,5/7, wereld af 7/7, kaart 7/7,5 — vast op beeldtaal, zie vraag 1. ronde 6: start 7/8. ronde 5: kaart 6,5/7,5. ronde 4: eerste les 7/7. ronde 3: wereld af 5/7, diploma 7,5/8 (vóór verbouwing). ronde 2: start 6/7, les 6,5/6, diploma 3/–, kaart 5/6,5 (zie 27e review) | 🔴 |
| OG-afbeelding per pagina | ronde 9: 28 eigen plaatjes (werelden, schaakregels, schaakclub), lessen delen hun wereld; build controleert 206 verwijzingen. Nog te testen: vierkante uitsnede in echte WhatsApp | 🟢 |
| Deelknop op trotse momenten | ronde 3: op wereld af en diploma, alleen link + vaste zin, anonieme telling `Gedeeld`; doorloop bewaakt share én kopieer zonder naam | 🟢 |
| Installeerbaar | manifest + service worker aanwezig | 🟢 |
| Wereld 0–2 offline | ronde 8: 51 bestanden (1,3 MB) vooraf na het eerste bezoek; doorloop bewijst les, minispel, kaart, kaart→les en offlinepagina | 🟢 |
| `npm run check` + doorloop groen | ronde 2: groen (doorloop 23 regels) | 🟢 |
| `/release-review` go | 27e review: go voor deze fase, na verwerking | 🟢 |

## Rangschikking, na ronde 15

1. **Wereld af: de plank of "wat je nu kunt" tonen**, en gewonnen wapens in de kleine kaartrij dimmen. (Trofeeënplank op de kaart staat sinds ronde 15.)
2. **De kijkfase laat het bord vertellen:** velden lichten op terwijl Pip vertelt, en het stuk staat op het bord.
3. **Startpagina:** Pip groot boven de vouw.
4. Emoji in de uitslagen van partijen en live spelen. Dat zijn niet de wow-schermen, dus later.

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
- Ronde 12: eigen illustraties (Pip, wapens, kaartstroken) ingebouwd; bordje in wapens rechtsonder licht; offline en test op bestaan.
- Ronde 13: één tekenstijl (71 iconen), schaakfouten in iconen hersteld, luidspreker met contrast in donker, LCP 2,1–2,3 s.
- Ronde 14: Pip groot in de juichmomenten; Verder en Volgende les altijd in beeld (doorloop); wapenrij altijd 8+7.
- Ronde 15: trofeeënplank boven de huidige wereld en in beeld bij binnenkomst (doorloop). 40e review: GO; wow layout 6–7,5, conversie 6–7,5.
- Ronde 16: wereld af toont "3 van de 15 werelden af" (verborgen onder 720 px hoogte, zodat Volgende les in beeld blijft).
- Ronde 16: 41e review (GO, wow wereld af 7,5); telling alleen verborgen op smalle lage schermen.
- Ronde 17: lange wapennamen (Koningskasteel) breken netjes af op de plank.
- Ronde 18: wow-meting (start 7, les 6, wereld af 8, kaart 6); plank toont sterren en "3 van de 15 werelden". Volgende: Pip op het bord in de eerste kijkzin; oorkonde met naam en deelknop direct eronder.
- Ronde 18: 42e review (GO, kaart 7); telling breekt per deel, met "af".
- Ronde 19: Pip (paard) op e4 tijdens de kijkfase van weide-1, op advies van de schaakmeester. Zin "Ik sta op een licht veld" vraagt een nieuwe opname: open vraag voor Kaj.
- Ronde 19: 43e review (GO, eerste les 6,5); paard naar e5. Open: stukmaat bord (~40% van veld), wereldnaam weg op 844×390.
- Ronde 20: stukken schalen met de bordbreedte (15cqi) in plaats van het venster; groter in alle lessen.
- Ronde 20: 44e en 45e review; stukken 11cqi (was venster-gebonden), rooster minmax, doorloopregel bordmaat. Open: speelscherm liggend (velden 34 px) en knoppen onder bord op 1440×900.
- Ronde 21: speelscherm — bord past met knoppen op 1440×900 en 1366×650. Open: liggende telefoon (bord 273 px) en staande telefoon (knoppen onder de vouw).
