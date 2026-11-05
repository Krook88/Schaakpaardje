# Volgende niveau — scorebord

Geheugen van de `/loop`. Elke ronde: lees dit, pak het hoogste rode punt, bouw, bewijs, review, werk bij.

## Open vragen voor Kaj
- ~~Traject 2 live zetten?~~ Gedaan op 5 nov (PR #33, publicatie groen).
- **Traject 2 (oud):** Rondes 36–48 staan op `volgende-niveau` (bots met gezichten, geslagen stukken, korte telefoons, vijf nieuwe Pip-zinnen die bij publiceren worden ingesproken). De wow-cijfers schommelen weer rond 5–8 per reviewer; de voorstellen herhalen zich. Loop gepauzeerd.
- **Doorgaan of afronden?** Na 35 rondes schommelen de wow-cijfers per meting (eerste les: layout 8, conversie 5 op hetzelfde scherm). Laatste meting staand/dwars: start 7/8, les 5–8, wereld af 8/7, kaart 7/5, spel 6–7. De ideeën die nog openstaan zijn groter (bots met reacties per zet, de kaart dwars naast het pad). Loop gepauzeerd tot je besluit.

## Besluiten van Kaj
- Beide opnamezinnen aangepast (w9 "schaak zeggen mag", weide-1 "daar sta ik op het bord"). De opname gebeurt bij de merge via ElevenLabs (4 nov).
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
- Traject 2 (na merge #32), ronde 36: wereld af dwars — juichende Pip terug naast het wapen, rechts alleen de ballon.
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
- Ronde 22: speelscherm dwars — bord links (velden 47 px), kop/Pip/knoppen rechts; doorloopregel. Open: 667×375 knoppen net onder de rand.
- Ronde 22: 47e review verwerkt (geen leeg scrollen, sticky bord, knoppen boven op 667×375).
- Wow-meting na ronde 22 (375 / 844 dwars): start 6/4, les 5/5, wereld af 8/5, kaart 7/5, bot 4/4. Rangschikking: dwars is overal het zwakst; bot een eigen gezicht; Pip zichtbaar op de startpagina dwars.
- Ronde 23: wereld af dwars — wapen en Pip links, de rest rechts, Pip-ballon verborgen, Volgende les in beeld (doorloop 844×390).
- Ronde 23: 48e review verwerkt (Pip naast de kaart dwars, 667×375 in doorloop).
- Ronde 24: startpagina dwars — tekst en knop links, Pip met proefbord rechts (doorloop 844/667). Open: proefbord-velden dwars 33–35 px.
- Ronde 24: 49e review verwerkt. Open: proefbord dwars < 44 px.
- Ronde 25: kaart dwars — plank als smalle strook (wapens 44 px, geen namen), plank en les samen in beeld (doorloop 844×390).
- Ronde 25: 50e review verwerkt (667×375 in doorloop, title op wapens, namen sr-only).
- Ronde 26: speelscherm — tegenstander met gezicht en naam boven het bord (verborgen onder 700 px hoogte, daar staat hij in de kop).
- Wow-meting na ronde 26 (staand/dwars): start 6/7, les 5/5, wereld af 8/6, kaart 7/5, spel 4/4. Volgende: bots als eigen getekende figuren (illustrator), dan Pip groot in de eerste kijkzin.
- Ronde 27: zeven getekende bots (scripts/bots-tekenen.py, illustrator), tegenstander boven het bord als tekening.
- Ronde 27: 51e review verwerkt (keuzescherm met tekeningen, kop zonder emoji). Open: bots bij uitslag/stal, Oscars borstveertjes.
- Ronde 28: tekening van de bot op de uitslagkaart.
- Ronde 29: eerste les — het paard huppelt twee keer na de golf (niet bij minder beweging).
- Ronde 29: 52e review verwerkt. Open: uitslagkaart dwars onder de vouw; uitgeschakelde knoppen in donker.
- Ronde 30: uitgeschakelde knoppen met stippelrand en gedempte tekst, geen doorzichtigheid (leesbaar in donker).
- Ronde 31: 53e review (schaakmeester + codebase over 16–30) verwerkt: dwars-CSS samengevoegd, speelscherm in drie blokken, test op bot-tekeningen, laptopregel in doorloop.
- Ronde 32: 54e review verwerkt (kop dwars alleen pijl, blokwissel alleen smal, doorloopregel 667×375).
- Wow-meting na ronde 32 (375/844): start 7/8, les 5/5, wereld af 8/7, kaart 7/6, spel 4/5. De eerste les blijft het laagst.
- Ronde 33: tegenstander-tekening ook op staande telefoons onder 700 px hoogte (44 px).
- Ronde 34: eerste les — Pip als getekend paardje op e5 in plaats van het schaakteken (vertelPip, alleen begroeting).
- Ronde 34: 55e review (GO, eerste les 8, spel 7).
- Ronde 35: kaart dwars — plank op één rij (kop en telling links, wapens 52 px rechts).
- Wow-meting na ronde 35 (375/844): start 7/8, les 5/6, wereld af 8/7, kaart 7/5, spel 6/6. Loop gepauzeerd: cijfers schommelen tussen reviewers, vraag aan Kaj.
- Ronde 37: bots in drie stemmingen (blij, denkt, verrast), het gezicht volgt de partij.
- Ronde 37: 56e review verwerkt (Pip op 667 dwars terug, verrast 1,4 s, doorloopregel "er juicht een Pip").
- Ronde 38: botstemmingen duidelijker (denkwolkje, wenkbrauwen, grotere o), bredere crème rand voor donker.
- Wow-meting traject 2 (375/844): start 7/8, les 6/7, wereld af 7/6, kaart 7/6, bot 4/5. Fout gevonden: oude Pip-zin na de botzet.
- Ronde 39: Pip zegt na elke botzet "Hij heeft gezet. Nu jij!" (nieuwe opname bij publiceren), doorloopregel.
- Ronde 40: tegenstander dwars naast Pip in beeld (52 px).
- Ronde 40: 57e review verwerkt (geen "hij" voor bots, bemoedigende zin bij slaan).
- Ronde 41: denkwolkjes van Mila en Fien van het oor af.
- Ronde 42: geslagen stukken naast de stand in de partij.
- Ronde 42: 58e review verwerkt (geslagen stukken op eigen regel met "Jij pakte"/"Kwijt" en schijfjes).
- Ronde 43: startpagina staand compacter, paard met stippen boven de vouw (doorloop 375/390).
- Ronde 43: 59e review verwerkt (paard heel boven de vouw op 375×667, doorloop meet hele veld).
- Ronde 44: eerste les op korte telefoons — wereldband weg, kop en fasebalk compacter, hele bord in beeld (doorloop 375×667).
- Ronde 44: 60e review verwerkt (bord heel in beeld bij elke zin en de eerste opgave op 320/360/375, doorloop).
- Ronde 45: speelscherm op korte telefoons — Pip-ballon en tegenstander op één rij, hele bord in beeld (doorloop 320/375).
- Ronde 46: het oogje in de fasebalk als klaar-knop (groen, doorgetrokken) in plaats van gestippeld.
- Ronde 46: 61e review verwerkt (Pip klein in beeld in plaats van weg; 320 breed zonder tegenstander).
- Ronde 47: 62e review (codebase traject 2) verwerkt: Game.geslagen in de engine met test, verrast reset, schermlezertekst.
- Ronde 48: Pip-maat via --pip-maat in plaats van !important van buitenaf.
- Wow-meting na ronde 48 (375/844): start 7/8, les 5–6, kaart 7/6, spel 5/6, wereld af niet gezien. Loop gepauzeerd voor Kaj.
- Traject 2 live (PR #33, 5 nov). Afwegingen voor de open punten:
  - "Help me even" onder de vouw op korte telefoons: bewust zo. De knoppen boven het bord zetten duwt de onderste rij weg, en daar vraagt de eerste opgave om. Het bord gaat voor de knop: na een misser verschijnt de hulp vanzelf.
  - Breekpunten in de CSS op één plek: uitgesteld. Zonder PostCSS custom media is dat een herschrijving van vier modules zonder zichtbare winst voor het kind. De doorloop bewaakt de formaten.
- Ronde 49: knop "Zet op je beginscherm" (startpagina onder de beloftes, ouderscherm), app-iconen van Pip (192, 512, maskable, apple-touch), manifest zonder vaste staande stand.
- Ronde 50: maatjes getekend en overal in plaats van emoji; 63e review verwerkt.
- Traject 4 (5 nov, "probeer nog eens"): Lighthouse opnieuw gemeten (was van ronde 13). Start 99 perf, LCP 2,2 s, CLS 0. Les: perf 93–95, a11y 90→94 (fasebalk-label zonder rol hersteld; enige afwijking nu meta-viewport, bewust), best practices 79→96 (Pip sprak vanzelf zonder tik: afgeschafte speechSynthesis-aanroep, nu klaargezet voor de eerste tik; resterend: lokale 404 op audio-manifest). Kaart SEO 66 is bewust (noindex, app-scherm).
- Ronde 51: startpagina — Pip als stuk op het demobord; wereld af — dichte wapens in eigen wereldkleur, volgende met stippelring, "nu open: Torenburcht" in de feestkaart; Pip met hele lijf getekend (wijst, juicht, wacht).
- Ronde 52: kaart — trofeeënplank als houten lat onder de wapens (72 px), lucht boven de plank.
- Ronde 53: eerste les — wereldband met de getekende kaartstrook (licht en donker), gehaalde opgaven worden sterretjes die even opspringen.
