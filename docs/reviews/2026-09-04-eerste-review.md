# Release-review Schaakmaatje — nulmeting

- **Datum:** 2026-09-04
- **Commit:** `1b9425c` — "Leg vast dat elke fase langs de review gaat, en de feedback verwerkt wordt"
- **Tak:** `claude/chess-learning-app-kids-fertg2`
- **Scope:** de hele app. Er lag nog niets in `docs/reviews/`, dus dit is de nulmeting: 15 werelden, 47 lessen, beide zetmotoren, de zoeker, de bots, de minispellen, de schermen en de service worker.

## Oordeel

**GO MITS** — de vier punten onder "Wat eerst moet" zijn opgelost.

De app staat er als geheel goed bij: build, typecheck, 73 tests en de contentcontrole zijn groen, de schermen zijn schoon op alle drie de formaten in licht en donker, en het overgrote deel van de schaakinhoud klopt. Maar er zitten drie fouten in de lesinhoud waarbij een kind iets verkeerds leert, en twee daarvan staan in de les die uitlegt wát schaak is. Dat is precies de fout die deze app zich niet kan permitteren, dus dit gaat niet mee zoals het nu is.

---

## Hoe deze review tot stand kwam — lees dit eerst

De opzet is dat de coördinator drie losse reviewers (`schaakmeester`, `layout-reviewer`, `codebase-reviewer`) parallel laat kijken en hun oordelen weegt. **Dat is niet gelukt: in deze sessie is er geen Agent-tool beschikbaar, dus de drie reviewers konden niet gestart worden.**

Om je niet met lege handen te laten zitten heb ik de drie invalshoeken zelf nagelopen. Dat is een afwijking van het proces en je moet weten wat dat betekent:

- Er is **geen tweede paar ogen**. Alles hieronder komt van één beoordelaar.
- Er is **geen onafhankelijk oordeel** per invalshoek en dus ook geen tegenspraak om te wegen.
- De bevindingen zelf zijn wél echt: elke schaakbevinding is met de engine of met chess.js nagerekend (de scriptjes staan onder de bevinding), en elke layoutbevinding komt uit een echte schermafbeelding of een meting in de browser.

Wat hieronder staat is dus betrouwbaar als *bevinding*, maar het is geen volwaardige drievoudige review. Zie "Wat jij moet beslissen".

---

## Per invalshoek

### Schaakinhoud en didactiek

Ik heb alle 15 wereldbestanden gelezen en de stellingen nagerekend. Het meeste klopt, en op sommige plekken klopt het opvallend goed: de antwoordlijsten in wereld 7 (waarde), wereld 8 (aanval en verdediging) en wereld 11 (rokade) heb ik stuk voor stuk tegen de engine gelegd en ze komen exact uit. De rokadestellingen, de matstellingen en de patstelling zijn allemaal echt wat ze beweren te zijn. De opbouw is verstandig: toren → loper → dame → paard → koning → pion, mat pas in wereld 10, en de drie manieren om een aangevallen stuk te redden komen in wereld 8 terug als de drie manieren om uit schaak te gaan. Dat is netjes gedacht.

Maar er zijn drie stellingen waar het misgaat, en het patroon is steeds hetzelfde: een antwoordlijst die met de hand is ingetypt in plaats van door de engine berekend. De werelden die in hun kop vermelden "met de engine nagerekend" (7, 8, 10, 11) zijn schoon; de werelden zonder die notitie (3, 9, 13) zijn dat niet.

### Vormgeving en bruikbaarheid

Ik heb de gebouwde app bekeken op 430×930, 820×1180 en 1280×800, in licht én donker — 42 schermafbeeldingen in `/tmp/review-2026-09-04/`, van de stal, de kaart, een lesscherm, een minispel, een partij, het tegenstanderoverzicht en het ouderscherm.

Dit ziet er goed uit en het is af. Geen enkel scherm scrollt horizontaal, op geen enkel formaat. Bordvelden zijn 49 px op de telefoon en 58 px op tablet en chromebook, dus ruim boven de 44 die je minimaal wilt, en er is geen enkele knop of link kleiner dan 44 px. Het donkere thema is een écht donker thema en niet licht met omgekeerde tekst. De focusring is 3 px en goed zichtbaar, `prefers-reduced-motion` wordt netjes afgevangen in `globals.css`, en elk bordveld heeft een zinnig label voor de schermlezer ("e8, zwarte koning").

Het bord klopt ook, wat voor een schaakapp niet vanzelf spreekt: a1 is donker, h1 is licht, wit staat onderaan. De stukken zijn lichte of donkere glyphs met een contrasterende rand eromheen, waardoor ze op beide veldkleuren leesbaar blijven — een slimme oplossing zolang de getekende stukken er nog niet zijn.

Twee kleinere dingen vielen op, en één daarvan gaat over eerlijk zijn tegen het kind (de sterrenrij, zie bevinding 9).

### Code

`npm run typecheck`, `npm test` (73 tests), `npm run validate:content` en `npm run build` zijn alle vier groen. De tests zijn echte tests: ze rekenen uitkomsten na in plaats van de implementatie te bevestigen — het herderemat, pat, de matstellingen per wereld, of de bots legale zetten spelen, of de ladder oploopt in speelsterkte.

De indeling is helder en de keuze voor twee zetmotoren is goed uitgelegd en goed uitgevoerd: de meetkundige motor kent bewust geen schaakregels, de echte lessen vanaf wereld 9 gaan door chess.js, en de grens tussen die twee wordt nergens overschreden. De zoeker is een correcte negamax met alfa-bèta; ik heb het vensterbeheer en de kleurentekens nagelopen en die kloppen. Er gaat niets naar buiten: de enige netwerkaanroep in de hele app is `fetch('/audio/manifest.json')` naar het eigen domein.

De belangrijkste codebevinding is niet een bug maar een gat: **de contentcontrole kan de drie fouten hierboven principieel niet zien.** Dat is voor een app waarin alle lessen data zijn de gevaarlijkste plek om een gat te hebben.

---

## Bevindingen

### Blokkerend

**1. De les die schaak uitlegt, wijst het verkeerde stuk aan**
*Plaats:* `src/content/werelden/w9-schaak.ts`, les `schaak-1`, fase `toets`, opgave 2
Stelling `4k3/8/8/8/8/8/8/4R1K1`, vraag "Tik nu de koning aan die juist géén schaak staat", `correct: ['e1']`. Op e1 staat de **toren**; de witte koning staat op **g1**. Een kind dat de koning correct aanwijst, krijgt te horen dat het fout is, en leert bij de tweede poging dat een toren een koning is.
*Voorstel:* `correct: ['g1']`.

**2. Een stelling zonder schaak wordt gepresenteerd als schaak**
*Plaats:* `src/content/werelden/w9-schaak.ts`, les `schaak-1`, fase `zelf`, opgave 3
Stelling `7k/8/8/8/8/8/6q1/4K3`, vraag "Tik de koning aan die schaak staat", `correct: ['e1']`. De zwarte dame op g2 valt e1 helemaal niet aan — g2 en e1 liggen niet op één lijn, rij of diagonaal. Er staat in deze stelling géén enkele koning schaak. De foutTip ("volg haar diagonaal naar linksonder") wijst naar f1, niet naar e1.
Nagerekend: dame g2 bestrijkt `f1 f3 h1 h3 a2 b2 c2 d2 e2 f2 h2 g1 g3 g4 g5 g6 g7 g8` — e1 zit er niet bij.
*Voorstel:* zet de dame op een veld dat e1 wél aanvalt (bijvoorbeeld `g3`, `e5` of `a5`) of verplaats de koning. Reken de stelling daarna na met chess.js.

**3. De dame wordt "veilig" neergezet op velden waar het paard haar pakt**
*Plaats:* `src/content/werelden/w3-dame.ts`, les `dame-3`, fase `zelf`, opgave 1
Stelling `8/8/8/3Q4/8/2n5/8/8`, vraag "Zet je dame ergens neer waar het paard haar niet kan pakken". Het paard op c3 bestrijkt `a2 a4 b1 b5 d1 d5 e2 e4`. De lijst met goede antwoorden bevat **b5, d1 en e4** — precies drie velden waar de dame de volgende zet van het bord gaat. En de lijst weigert **b3, e5, f5, g5 en h5**, die wél veilig zijn.
Dit is de les waarvan het hele punt is "kijk of ze veilig staat". Het kind wordt geprezen voor het weggeven van zijn dame.
*Voorstel:* type de lijst niet over maar laat hem uitrekenen — `veiligeVelden(board, 'd5')` in `src/engine/board.ts` geeft precies het goede antwoord (`a5 a8 b3 b7 c4 c5 c6 d2 d3 d4 d6 d7 d8 e5 e6 f3 f5 f7 g2 g5 g8 h1 h5`).

### Belangrijk

**4. De contentcontrole kan deze hele klasse fouten niet zien**
*Plaats:* `src/content/validate.ts`
Bij `tapSquares` wordt alleen gecontroleerd of de velden bestaan; wát er op die velden staat en of dat klopt met de vraag, wordt nergens getoetst. Bij `move` wordt alleen gecontroleerd of het stuk er kán komen, niet of het antwoord ook het bedoelde antwoord is. Alle drie de blokkerende fouten hierboven komen ongehinderd door `npm run validate:content` én door de 73 tests. Zolang dit gat er zit, is "de controle is groen" geen bewijs dat de lessen kloppen.
*Voorstel:* voeg per opgavesoort een inhoudelijke controle toe. Minimaal: als de vraag over een koning gaat, moet er op het goede veld een koning staan; gaat de vraag over schaak, dan moet die koning ook echt schaak staan. En voor "veilig neerzetten"-opgaven: vergelijk `goed` met `veiligeVelden()` en klaag bij elk verschil.

**5. Het gepende paard staat al vast, en de goede zet is de slechtste zet**
*Plaats:* `src/content/werelden/w13-tactiek.ts`, les `tactiek-2`, fase `toets`, opgave 1
Stelling `4k3/8/2n5/1B6/8/8/8/7K`, vraag "Zet het paard vast met je loper", `goed: ['a4']`. Twee problemen: het paard op c6 staat **al** gepend door de loper op b5 (b5–c6–d7–e8 is één diagonaal), dus er valt niets vast te zetten. En de loper kan het paard gewoon **slaan** — `Lxc6` wint een heel paard, want niets dekt het. Die zet wordt als fout gerekend, terwijl wereld 7 het kind net heeft geleerd om te pakken wat gratis staat.
*Voorstel:* kies een stelling waarin de penning nog gemaakt moet worden en waarin het gepende stuk gedekt is, zodat slaan geen gratis winst is.

**6. De toets van de eerste pionles vraagt om twee dingen die pas later komen**
*Plaats:* `src/content/werelden/w6-pion.ts`, les `pion-1`, fase `toets`, opgave 1 (en `pion-2`, fase `zelf`, opgave 2)
Stelling `8/8/8/8/8/3n4/4P3/8`, `tapMoves` vanaf e2. Een `tapMoves`-opgave is pas klaar als *alle* velden gevonden zijn, en dat zijn hier e3, **e4** (de dubbelstap — die wordt pas in `pion-2` uitgelegd) en **d3** (schuin slaan — dat komt pas in `pion-3`). Les 1 gaat over "één veld vooruit, nooit terug", en de toets ervan is met die kennis niet uit te spelen. Hetzelfde gebeurt in `pion-2`, waar het schuin slaan uit `pion-3` al nodig is.
*Voorstel:* haal het paard uit de stelling van `pion-1` en zet de pion van zijn startrij af, zodat de toets alleen toetst wat les 1 leerde. Doe hetzelfde voor `pion-2`.

**7. De laatste wereld hergebruikt de matopgaven van wereld 10 letterlijk**
*Plaats:* `src/content/werelden/w14-eindspel.ts`, les `eindspel-2`
Alle drie de stellingen zijn identiek aan die van `mat-2` in `w10-mat.ts`:
`6k1/8/6K1/8/8/8/8/R7`, `k7/8/1K6/8/8/8/8/7Q` en `7k/5KP1/8/8/8/8/8/8`. Het gouden diploma wordt dus verdiend op opgaven die het kind vier werelden eerder al heeft opgelost.
*Voorstel:* nieuwe stellingen voor `eindspel-2`, of maak er bewust een herhaling van en zeg dat dan ook tegen het kind.

**8. De service worker zal de ingesproken stem van Pip straks bevriezen**
*Plaats:* `public/sw.js`, regel ~44
`const isBlijvend = url.pathname.includes('/_next/static/') || url.pathname.startsWith('/audio/')` — alles onder `/audio/` gaat cache-first, met als motivering "bestanden met een hash in hun naam veranderen nooit". Dat klopt voor de mp3's, maar **`/audio/manifest.json` heeft geen hash in zijn naam**. Zodra Pip is ingesproken en het manifest één keer in de cache zit, krijgt een kind na een nieuwe opname nooit meer een bijgewerkt manifest, en vallen alle nieuwe zinnen stil terug op de apparaatstem. Nu is dit nog onzichtbaar omdat het bestand 404't en 404's niet gecached worden (`bewaar()` weigert alles wat geen 200 is) — het slaat toe op het moment dat de stem er wél is.
*Voorstel:* sluit `manifest.json` uit van de cache-first-tak en behandel hem als een pagina (netwerk eerst, cache als vangnet).

### Klein

**9. De sterrenrij op de stal staat altijd vol**
*Plaats:* `src/app/page.tsx` — `<Sterren aantal={Math.min(3, totaal)} van={3} />`
Naast de tekst "5 van de 141 sterren" staan drie volle sterren, want zodra een kind er drie heeft, is de rij vol. Het beeld zegt "helemaal klaar", de tekst zegt "net begonnen". Voor een kind dat nog niet leest, is alleen dat beeld er.
*Voorstel:* toon de voortgang over het geheel, of laat de rij weg naast een getal dat hetzelfde al zegt.

**10. Namen van vergrendelde lessen halen het contrast net niet**
*Plaats:* `src/app/kaart/page.tsx` regel 73 — `opacity: 0.5`
Gemeten: 3,18:1 in het lichte thema (18 px vet). Voor tekst van dat formaat is 4,5:1 de eis; als grote tekst zou tellen was 3:1 genoeg, maar 18 px vet valt daar net onder. In het donkere thema is het 4,54:1 en dus in orde.
*Voorstel:* `opacity` naar ongeveer 0,65, of gebruik `var(--muted)` in plaats van doorzichtigheid.

**11. Elke pagina laadt een bestand dat niet bestaat**
*Plaats:* `src/audio/voice.ts`, `laadManifest()`
`/audio/manifest.json` geeft 404 op elke paginalading, met een consolefout tot gevolg. De terugval op de apparaatstem werkt verder prima — dit is ruis, geen storing, maar het maakt echte fouten in de console moeilijker te zien.
*Voorstel:* laat het 404-geval stil zijn, of zet er een leeg `manifest.json` neer tot de opnames er zijn.

**12. De hint bij een zetopgave geeft het hele antwoord weg**
*Plaats:* `src/lesson/runner.ts`, `hint()` — `if (o.kind === 'move') return { stand: nieuw, velden: o.goed.slice(0, 1) }`
De functie belooft in haar eigen documentatie "één veld, nooit het hele antwoord", maar bij een `move`-opgave ís dat ene veld het hele antwoord. Bij `regelZet` is het wel goed opgelost (daar wordt het stuk aangewezen, niet het doelveld).
*Voorstel:* wijs ook hier het stuk aan waarmee het moet, niet het veld waar het heen moet.

**13. Het rekenslot is te doen voor de oudste kinderen uit de doelgroep**
*Plaats:* `src/app/ouders/page.tsx` regels 28-30
De som is `a × b` met a in 3..8 en b in 2..8. Een kind van 9 of 10 — de bovenkant van de doelgroep van deze app — rekent dat uit. De code noemt het zelf "geen beveiliging maar een drempel", dus dit is bewust; het is aan jou of die drempel hoog genoeg is.
*Voorstel:* als je hem hoger wilt: twee sommen achter elkaar, of getallen boven de tafel van tien.

**14. Een verwijzing naar een test die niet bestaat**
*Plaats:* `src/content/werelden/w13-tactiek.ts`, kopcommentaar — "tests/tactiek rekent dat na"
Dat bestand is er niet; de betreffende tests staan in `tests/wereld10-14.test.ts`. Die tests bestaan wél en draaien, alleen de verwijzing klopt niet. (Ze zijn overigens ook net te zwak om bevinding 5 te vangen: ze controleren of het paard ná de zet vastzit, niet of het dat daarvoor al deed.)
*Voorstel:* verwijzing rechtzetten en de penningtest uitbreiden.

**15. Promotiezetten worden vier keer doorzocht**
*Plaats:* `src/engine/zoeker.ts`, `ordenZetten()` / `zoek()`
`legalMoves()` levert per promotie vier zetten (dame, toren, loper, paard), maar `Game.move()` promoveert altijd naar dame. In een eindspel met pionnen doorzoekt de motor dus vier keer dezelfde zet. Geen verkeerde uitkomst, wel verspilde knopen uit het budget van 20.000, precies in het soort stelling waar wereld 14 over gaat.
*Voorstel:* filter dubbele `from→to`-paren weg in `ordenZetten`.

**16. Een reden die net niet klopt**
*Plaats:* `src/content/werelden/w7-waarde.ts`, les `waarde-2`, fase `zelf`, opgave 2
Stelling `8/8/3p4/2b5/4N3/8/8/8`, foutTip "De loper is drie waard, de pion één". `Pxc5` is inderdaad de beste zet, maar niet om die reden: de zwarte pion op d6 slaat terug, dus het is een gelijke ruil (paard voor loper) en geen winst van drie. De volgende les (`waarde-3`) leert het kind juist "kijk eerst of hij kan terugslaan".
*Voorstel:* pas de foutTip aan, of haal de pion op d6 weg zodat de loper echt gratis staat.

---

## Wat eerst moet (de "mits")

1. Bevinding 1 — `schaak-1/toets2`: `correct` naar `g1`.
2. Bevinding 2 — `schaak-1/zelf3`: stelling vervangen door een stelling waarin de koning écht schaak staat.
3. Bevinding 3 — `dame-3/zelf1`: antwoordlijst laten uitrekenen door `veiligeVelden()`.
4. Bevinding 4 — de contentcontrole uitbreiden, zodat deze klasse fouten niet opnieuw ongemerkt door CI komt.

Punt 4 hoort in dit lijstje omdat 1 tot en met 3 met de hand gevonden zijn. Zonder die controle weet niemand of dit alle drie de fouten waren.

## Wat prima kan wachten

Bevindingen 5, 6 en 7 zijn didactisch de moeite waard maar leren een kind niets onwaars — die kunnen mee in de volgende release. Bevinding 8 moet er zijn vóórdat Pip wordt ingesproken, niet vóór deze release. Alle kleine punten (9 tot en met 16) kunnen wachten; 9 en 10 zou ik als eerste oppakken omdat ze het kind rechtstreeks raken.

## Wat goed is

Het verdient vermelding, want het is veel: de bordweergave klopt tot in de details (a1 donker, h1 licht, wit onderaan, velden ruim boven de 44 px, zinnige schermlezerlabels), er is geen horizontale scroll op geen enkel formaat, het donkere thema is echt donker, `prefers-reduced-motion` wordt gerespecteerd en de focusring is duidelijk. De scheiding tussen de twee zetmotoren is goed doordacht en wordt nergens overtreden. De zoeker is correct. De app stuurt niets naar internet. De 73 tests zijn echte tests. En twaalf van de vijftien werelden zijn schaaktechnisch in orde — de werelden waarvan de kop zegt dat ze met de engine zijn nagerekend, zijn dat ook echt.

## Verantwoording

- Nagerekend met de eigen engine en met chess.js; de scripts staan in de scratchpad van deze sessie en zijn opnieuw uit te voeren tegen de commit hierboven.
- 42 schermafbeeldingen in `/tmp/review-2026-09-04/`, opgebouwd als `<formaat>-<thema>-<scherm>.png` voor 430×930, 820×1180 en 1280×800 in licht en donker.
- Contrast, raakvlakken, focus en overloop zijn in de browser gemeten, niet uit de CSS afgeleid.
- Niet bekeken: het scherm ná een fout antwoord in een les, het diplomascherm, en de minispellen anders dan `hongerig-paardje`. Van de 15 minispellen is alleen gecontroleerd dat de bestaande test ze op elk niveau een bruikbare opgave laat opleveren.
- Buiten beschouwing gelaten zoals afgesproken: dat Pip nog niet is ingesproken, dat de stukken nog Unicode-glyphs zijn, en dat er nog geen tegenstanders boven ~1500 zijn.

---

## Verwerkt op 4 september 2026

Alle zestien bevindingen zijn afgewerkt, van blokkerend naar klein. Per punt wat er
gebeurd is:

| # | Bevinding | Wat er gedaan is |
|---|---|---|
| 1 | Koning aanwijzen waar een toren staat | Antwoord `e1` → `g1`, plus een `bedoeling` zodat de controle het narekent |
| 2 | "Schaak" dat geen schaak was | Dame van g2 naar g3; nu valt zij e1 echt aan |
| 3 | "Veilige" velden die juist bestreken werden | `goed` vervangen door de 23 velden die `veiligeVelden()` teruggeeft |
| 4 | Contentcontrole zag deze klasse niet | Opgaven kunnen nu hun **bedoeling** declareren; de controle rekent het antwoord na |
| 5 | Paard stond al vast, en slaan was gratis | Nieuwe stelling: loper op d3 (buiten de penningdiagonaal), paard gedekt door de pion op b7 |
| 6 | Pionles toetste kennis van latere lessen | Nieuwe stellingen zonder dubbelstap of slagzet in les 1, en zonder slagzet in les 2 |
| 7 | Eindspel hergebruikte de matopgaven van wereld 10 | Drie nieuwe matstellingen gezocht en nagerekend |
| 8 | Service worker zou Pips stem bevriezen | `audio/manifest.json` uitgezonderd van cache-first |
| 9 | Sterrenrij stond altijd vol | Rij weg, alleen nog het getal |
| 10 | Contrast van vergrendelde lessen | `opacity: 0.5` → `color: var(--muted)` |
| 11 | 404 op elke paginalading | Leeg `manifest.json` meegeleverd tot de opnames er zijn |
| 12 | Hint gaf het hele antwoord weg | Wijst nu het stuk aan in plaats van het doelveld |
| 13 | Rekenslot te makkelijk | Van `6 × 7` naar twee cijfers maal één (bijvoorbeeld `27 × 8`) |
| 14 | Verwijzing naar een test die niet bestaat | Verwijzing rechtgezet en de penningtest aangescherpt |
| 15 | Promotiezetten vier keer doorzocht | Dubbele van-naar-paren gaan eruit in `ordenZetten` |
| 16 | Foutuitleg klopte niet | Pion verplaatst zodat de loper echt gratis staat |

### De vangrail is nagemeten

Bevinding 4 is de belangrijkste, want zonder die uitbreiding zegt "de controle is groen"
niets over de inhoud. Een opgave kan nu declareren wát ze bedoelt — het bedreigde stuk,
de koning die schaak staat, het duurste stuk, de veilige velden — en `validate.ts` rekent
dat uit de stelling na. Getest door de drie oorspronkelijke fouten er expres weer in te
zetten:

```
✗ Aanvalsberg / Staat mijn stuk te pakken? / meedoen 1:
  het antwoord klopt niet met de stelling: hoort er niet bij: d5; ontbreekt: d3
```

`tests/content.test.ts` bewaakt nu dat die controle blijft werken, met vijf gevallen die
elk een van de gevonden fouttypes nabootsen.

### Wat er níet is gedaan

Niets van de zestien is blijven liggen. Wel staat er één ding open dat deze review zelf
niet kon leveren: de drie reviewers zijn niet als aparte agents gedraaid, dus alle
bevindingen komen van één paar ogen. Een tweede ronde met `schaakmeester`,
`layout-reviewer` en `codebase-reviewer` apart blijft aan te raden — juist omdat de drie
blokkerende fouten met de hand gevonden zijn en niet door de controle.

**Stand na verwerking:** 79 tests, contentcontrole en build groen.
