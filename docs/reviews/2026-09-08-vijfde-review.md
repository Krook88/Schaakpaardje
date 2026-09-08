# Vijfde review — is dit goed genoeg voor kinderen die ik niet ken?

**Datum** 8 september 2026 · **Commit** `5aed8eb` (`d1a25aa` als laatste inhoudelijke wijziging)
**Vorige review** `docs/reviews/2026-09-05-vierde-review-kinderapp.md`, commit `6fddeeb`
**Scope** 31 commits, 89 bestanden, +6238/−435 sinds `6fddeeb`

## Oordeel

**GO MITS** — twee blokkerende punten eerst, allebei klein te repareren.

1. **B1** Het minispel *Tactiekduel* beloont in ongeveer één op de vijfenveertig stellingen
   een **illegale zet** als enige goede antwoord.
2. **B2** Het minispel van wereld 0 vraagt een driejarige om torens, dames en paarden bij
   naam, terwijl `weide-3` die namen sinds deze ronde niet meer noemt.

Beide zijn schaakinhoudelijk. B1 leert een kind een zet die bij de club wordt teruggenomen;
B2 zet een kind van drie stil bij een woord dat het nooit gehoord heeft. Al het andere —
build, 175 tests, contentcontrole, doorloop — is groen, en de rest van deze release is
degelijk werk.

---

## Hoe deze review tot stand kwam — lees dit eerst

**De drie reviewers zijn niet als aparte agents gedraaid.** In deze omgeving is er geen
Agent-tool beschikbaar, dus de schaakmeester, de layout-reviewer en de codebase-reviewer
konden niet parallel gestart worden. Ik heb hun opdrachtomschrijvingen
(`.claude/agents/*.md`) als checklist afgelopen en de drie invalshoeken zelf nagelopen.

Dat betekent: **er is hier geen tweede paar ogen geweest.** Alles hieronder is nagemeten,
niet beredeneerd — elke bevinding heeft een bestand, een regel of een commando erbij — maar
de onafhankelijkheid die het driereviewersmodel hoort te leveren ontbreekt in deze ronde.
Draai de review opnieuw met de echte agents zodra dat kan, en hecht meer waarde aan die
uitslag dan aan deze.

### Wat er wél gedraaid heeft

| Controle | Uitkomst |
|---|---|
| `npm run typecheck` | groen |
| `npm test` | **175 tests, 13 bestanden, allemaal groen** |
| `npm run validate:content` | groen · 591 zinnen · 54 opgaven zonder `bedoeling` · 28 zachte volgordemeldingen |
| `npm run build` | groen, statische export compleet |
| `npm run doorloop` | **5 van de 5** |
| `npm run audio:dekking` | groen — maar zie **A3**, die groene uitslag is niets waard |
| Schermafbeeldingen | 32 stuks, telefoon (430×930) en tablet (820×1180), licht en donker, in `/tmp/review-2026-09-08/` |
| Eigen legaliteitscontrole op de minispellen | 4794 stellingen per spel, zie **B1** |

---

## Per invalshoek, kort

**Schaakinhoud en didactiek.** De grote schoonmaak van deze ronde deugt: `weide-3` is
teruggebracht tot pure bordkennis en het opstellen is verhuisd naar het eind van
Pionnenveld, waar alle zes de stukken bekend zijn. In die nieuwe les klopt het schaken:
h1 is licht, de witte dame staat op d1 en dat is inderdaad haar eigen kleur. Mat komt
nergens vóór wereld 10 aan bod — niet in de lesteksten, niet in de partijen tegen de bots
(die zeggen "gewonnen"/"verloren", niet "mat"). Maar de twee zetmotoren lopen op één plek
wél door elkaar (**B1**), en de nieuwe volgorderegel laat een paar echte gevallen door
(**B2**, **A1**).

**Vormgeving en bruikbaarheid.** Het pad is een duidelijke verbetering op de lijst die er
stond: één recht spoor, halteplaatsen van 76 px (62 px op smalle telefoons — nog steeds ruim
boven de 44 die de richtlijn vraagt), het slotje aan de rand zodat het beeld van de les heel
blijft, en `prefers-reduced-motion` overal netjes afgehandeld. Het donkere thema is warm
gehouden. Op de schermafbeeldingen zie ik geen contrast- of overlapprobleem op de nieuwe
schermen. Twee kleinere dingen: de rondleiding schuift zich tussen Pips opdracht en de knop
die hij noemt, en de teller "0 van de 147 sterren" is het eerste wat een nieuw kind leest.

**Code.** Netjes en goed uitgelegd; het commentaar legt consequent uit *waarom* iets zo is
en welke echte fout eraan voorafging. De doorloop is een goede aanvulling en de vijf
assertions zijn stuk voor stuk aan een echte fout opgehangen. Twee zorgen: een controle die
niets kan vinden en dat toch groen meldt (**A3**), en commentaar dat na de contentwijziging
niet meer waar is (**B2**).

---

## Blokkerend

### B1 · Tactiekduel beloont illegale zetten

**Plaats** `src/play/minispellen.ts`, `tactiekduel` (regel 606–654), wereld 13.

De vork wordt meetkundig gezocht met `pieceMoves()` en `applyMove()`. Die motor kent geen
penning. `stellingKlopt()` haalt alleen de **beginstelling** door chess.js — niet de zet
zelf. Staat het witte paard gepend tegen de eigen koning, dan is de "enige goede vork" een
zet die de eigen koning in schaak zet.

Nagemeten over 4794 gegenereerde stellingen (799 zaden × 6 niveaus):

```
weegschaal    move-opgaven 4794 | illegaal   0
red-je-stuk   move-opgaven 4794 | illegaal   0
tactiekduel   move-opgaven 4794 | illegaal 112   (2,3%)
```

Een uitgewerkt voorbeeld: `3r4/8/3N4/r7/3K4/7k/8/8`, opgave "Val met je paard twee stukken
tegelijk aan", enige goede antwoord `d6–b7`. De witte koning staat op d4, de zwarte toren op
d8, en het paard op d6 staat daartussen. Na `Nb7` staat wit schaak. Het kind tikt, het paard
springt, en Pip zegt "Hoppa! Precies goed."

`weegschaal` en `red-je-stuk` zijn schoon: die zetten geen koningen op het bord, dus daar
kan geen penning bestaan. `koningsloop` en `laatste-pion` gebruiken alleen eigen pionnen als
blokkade — ook schoon. Het is dus precies dit ene spel.

**Voorstel** Alles wat een koning op het bord heeft hoort volgens `CLAUDE.md` een `regelZet`
te zijn. Óf `tactiekduel` omzetten naar `regelZet`, óf — als de vork-eis daar niet in past —
elke kandidaatzet vóór aanbieding door chess.js halen:
`new Game(fen + ' w - - 0 1').legalMoves()`. En er een test bij, in dezelfde vorm als
`tests/minispelzinnen.test.ts`: honderden zaden × zes niveaus, en omvallen zodra één `goed`
antwoord illegaal is. Dat vangt ook de volgende variant hiervan.

### B2 · Het minispel van wereld 0 vraagt naar stukken die wereld 0 niet meer uitlegt

**Plaats** `src/play/minispellen.ts`, `vind-het-veld` (regel 179–214), gekoppeld aan wereld 0
in `src/content/werelden/w0-weide.ts:17`. Wereld 0 is vanaf drie jaar.

Het spel stelt drie vragen: "Tik alle torens aan.", "Tik alle dames aan.", "Tik alle paarden
aan." Het commentaar erboven rechtvaardigt dat zo:

> Alleen toren, dame en paard: dat zijn de stukken die wereld 0 bij naam noemt (weide-3).

Dat klopte, en klopt sinds deze ronde niet meer. `weide-3` is juist herschreven om die
namen kwijt te raken — de commit-boodschap zegt het zelf: "wereld 0 bevat met opzet géén
enkele schaakregel, alleen kijken, tellen en aanwijzen." Toren komt nu pas in wereld 1, dame
in wereld 3, paard in wereld 4.

Op de kaart is het minispel de laatste halte van wereld 0 en staat het **altijd open**
(`src/app/kaart/page.tsx:117`, `open: true`). Een kind van drie dat netjes bij het begin
begint loopt er dus vanzelf tegenaan, en krijgt drie woorden die het nooit gehoord heeft.
De naam ís hier de hele opdracht — precies het geval dat `stukkenVroegGenoemd()` in de
lessen hard weigert. De regel kijkt alleen niet naar minispellen.

**Voorstel** Vraag in dit spel naar iets wat wereld 0 wél leert — "tik alle velden aan waar
een stuk op staat", "tik het stuk aan dat op een donker veld staat", "tik het stuk in de
onderste rij aan". Werk het commentaar bij, en trek `stukkenVroegGenoemd()` door over
`MINISPELLEN` heen (zie **A1**), zodat dit niet stilzwijgend kan terugkomen.

---

## Belangrijk

### A1 · De nieuwe volgorderegel vangt te weinig, en op één plek te makkelijk

De regel is een goede toevoeging en hij heeft echt werk verzet. Kritisch bekeken zit er
vier keer een gat in.

1. **Alleen `vraag`, en alleen `tapSquares` hard.** Bij `move`, `reach` en `captureAll` is de
   naam net zo goed de opdracht zodra er meer dan één vijandelijk stuk op het bord staat.
   Concreet: `src/content/werelden/w2-loper.ts:156-164`, Loperbos, "Pak het zwarte paard met
   je loper" — op `8/8/p7/8/2n5/8/8/5B2` staan een zwart paard én een zwarte pion, dus het
   kind moet "paard" van "pion" onderscheiden op naam, in wereld 2, waar geen van beide is
   uitgelegd. Nu een zachte melding.
2. **`foutTip` wordt niet gelezen.** `src/content/werelden/w3-dame.ts:178-188`, Damepaleis,
   "Zet je dame ergens neer waar het paard haar niet kan pakken", met
   `foutTip: 'Het paard springt in een L. Tel even na waar hij bij kan.'` Daarmee wordt de
   paardsprong in wereld 3 uitgelegd, terwijl Paardenstal wereld 4 is. Het antwoord wordt
   correct berekend (`bedoeling: 'veilig'`), dus schaaktechnisch is er niets mis — maar het
   kind kan het niet beredeneren, alleen uitproberen.
3. **`vertel`-zinnen en quiz-labels worden niet gelezen.** Daardoor staat er in
   `src/content/werelden/w9-schaak.ts:84` een quiz-optie `mat` in wereld 9. Zie **A6**.
4. **De ontsnappingsclausule is losser dan het commentaar zegt.** `verteldMetWijzer()`
   (`src/content/validate.ts`) keurt een les goed zodra ergens in een vertelzin het woord
   staat én diezelfde zin *enige* `wijs`-velden heeft. Er wordt niet gecontroleerd of op dat
   aangewezen veld ook echt dat stuk staat. Een les die "de toren" zegt terwijl er drie lege
   velden oplichten komt er dus doorheen.

**Voorstel** Scan ook `foutTip`, de vertelzinnen en de quiz-labels; laat de hard/zacht-keuze
niet van `kind` afhangen maar van de vraag of de naam het enige onderscheid is (bijvoorbeeld:
hard zodra er meer dan één vijandelijk stuk op het bord staat); laat `verteldMetWijzer()`
tegen `vertelFen` controleren dat het aangewezen veld dat stuk draagt; en laat de regel ook
over `MINISPELLEN` lopen. Dat laatste vangt **B2**.

### A2 · Geen enkele zin in de stal wordt door Pip uitgesproken

**Plaats** `src/progress/StalScherm.tsx:36-42` en `:79`.

Elke zin in de stal wordt ter plekke samengesteld:

```
`${uitgelicht.naam}. Die heb je!`
`${uitgelicht.naam}. ${uitgelicht.hoe}`
`Je hebt er ${heeft} van de ${alles.length}. Tik op een leeg plekje, dan vertel ik hoe je hem krijgt.`
'Je stal is helemaal vol. Alles verzameld!'
```

Samengestelde tekst kan niet vooraf ingesproken worden, dus de hele stal klinkt in de
apparaatstem. Dat is uitgerekend het scherm waar een jong kind rondtikt om te horen hoe je
iets krijgt, en het staat middenin een release waarvan het hele punt is dat Pip nu een echte
stem heeft. Het verschil tussen Pip en de robot hoor je meteen.

De namen en de "hoe krijg je hem"-teksten in `src/content/stal.ts` zijn **vaste data**. Ze
kunnen dus wél ingesproken worden. Alleen de twee tellers kunnen dat niet.

**Voorstel** Zet `naam` en `hoe` van alle zestien stalstukken in `alleZinnen()`, spreek ze
in, en splits de zin in twee stukken (een ingesproken naam-en-hoe, en een geteld deel dat
je gewoon niet uitspreekt). Zelfde ingreep als bij `MINISPEL_ZINNEN`.

Idem, kleiner: `src/play/PartijScherm.tsx:254` spreekt `'Samen spelen! Wit begint.'` uit —
een vaste zin die nergens in `src/content/voice.ts` staat en dus nooit een opname krijgt.

### A3 · `scripts/audio-dekking.ts` kan niets vinden, en meldt toch groen

**Plaats** `scripts/audio-dekking.ts:60-70`.

De uitvoer:

```
671 zinnen worden ingesproken.
0 gesproken zinnen gevonden in de schermen.
Elke vaste zin in de schermen wordt ook ingesproken.
```

Die nul is geen toeval en geen kwestie van "iets exotisch gemist". De drie patronen eisen
een letterlijke string **direct** achter `zegt=`, `setZin(` of `speak(`. In de hele codebase
staat daar nooit een letterlijke string: het is altijd `setZin(HINT_GEGEVEN)`,
`zegt={zin}`, `speak(zegt)` — variabelen. Ook de rubriek SAMENGESTELD is daardoor leeg,
terwijl er aantoonbaar samengestelde zinnen zijn (**A2**).

De controle kan dus in dit project per constructie nooit iets vinden, en het slotregeltje
"Elke vaste zin in de schermen wordt ook ingesproken" is een onterechte geruststelling. Dat
is erger dan geen controle: het commentaar boven het bestand verkoopt hem als het vangnet
dat de minispelfout had moeten vangen, en hij had die fout ook niet gevangen.

**Voorstel** Draai het om: volg de constanten in plaats van de letterlijke tekst. Verzamel
alle bezetterminologie die naar `setZin`/`speak`/`zegt` gaat via de import-namen, of — veel
simpeler en waterdicht — doe wat `tests/minispelzinnen.test.ts` doet: laat de app zelf de
zinnen produceren en vergelijk. Kan dat niet, haal het script dan weg; een controle die
altijd groen is, is een verkeerd signaal.

### A4 · De donatielink staat op een pagina waar een kind bij kan

**Plaats** `src/app/over/page.tsx:132-140`, met `KOFFIE` uit `src/seo.ts`.

Je eigen regel staat in `src/seo.ts`: *"Bewust alleen op de ouderpagina's — /over/ en het
ouderscherm — en nooit in het kindscherm. Een kind van vier tikt alles aan wat oplicht, en
dat mag nooit ergens uitkomen waar geld ligt."*

Op `/ouders/` is dat waargemaakt: de link staat achter het rekenslot. Op `/over/` niet. En
`/over/` is vanaf het allereerste scherm dat een kind ziet in twee tikken te bereiken:

- `src/app/page.tsx:410` — "Lees eerst meer", op het scherm waar Pip "Hoi! Ik ben Pip, het
  schaakpaardje. Hoe heet jij?" zegt;
- `src/app/page.tsx:510` — "Over Schaakmaatje", in de voettekst van datzelfde scherm.

Daarna is het scrollen en één tik naar `bunq.me`. Gemeten aan je eigen norm haalt dit het
niet. Gemeten aan de werkelijke schade valt het mee: het is kleine grijze tekst, er staat
een muur ouderproza tussen, en een kind kan geen betaling afronden. **Dit is de knoop die
jij moet doorhakken, niet ik** — zie de laatste paragraaf.

**Voorstel** Kies er één: (a) de koffieregel van `/over/` af en alleen achter het rekenslot
laten staan; (b) op `/over/` een tussenstap ("dit is voor volwassenen") vóór de link; of (c)
je eigen norm bijstellen naar "nooit in het spelgedeelte" en dat in `src/seo.ts` opschrijven,
zodat de volgende review niet weer op deze regel valt.

### A5 · `/lessen/` omzeilt het hele slot

**Plaats** `src/app/lessen/page.tsx:71-92`.

De pagina linkt rechtstreeks naar alle 49 lessen en alle 15 minispellen, en
`src/app/les/[lesId]/page.tsx` controleert `isOntgrendeld()` niet. Via `/lessen/` is dus elke
les direct speelbaar, mat inbegrepen. De pagina is voor ouders en zoekmachines bedoeld, en
staat alleen op de schermen vóór het profiel — maar dat zijn wél schermen waar een kind
zit. Voor een gedeelde tablet is dat een reële route.

Ik zet dit niet op blokkerend omdat het geen fout aanlerende weg is: een kind dat per
ongeluk in Matklif belandt begrijpt er niets van en gaat terug. Maar de belofte "mat blijft
achter de hele reis zitten, dat late uitstel ís de methode" heeft hier een achterdeur.

**Voorstel** Laat `/lessen/` naar de kaart linken in plaats van naar de lessen zelf, of
schrijf op de pagina dat het overzicht voor volwassenen is. Alternatief: laat
`LessonPlayer` een les op slot met een vriendelijk scherm afhandelen ("die komt later, kom
je mee terug naar de kaart?") in plaats van hem gewoon te spelen.

---

## Klein — kan een volgende release halen

**A6** `src/content/werelden/w9-schaak.ts:80-86`. De toetsvraag "Hoe heet het als de koning
wordt aangevallen?" heeft als afleiders `mat` en `pat`. Geen van beide is op dat moment
uitgelegd. Een kind kan dus goed antwoorden zonder iets te weten (één bekend woord, twee
onbekende), en dat maakt het een zwakke toets van precies de les die eraan voorafging. Het
woord "mat" verschijnt bovendien één wereld te vroeg in beeld, zij het als afleider en niet
als leerstof. *Voorstel:* afleiders kiezen uit wat het kind kent — "slaan", "schuin",
"rokade" is ook nog niet aan de beurt, maar "aanvallen" en "dekken" wél.

**A7** `src/content/werelden/w6-pion.ts`, les `opstelling`. Titel "Zet het bord op",
`geleerd`: "Nu zet jij het hele bord zelf op." Maar geen enkele van de zes opgaven laat het
kind een stuk **plaatsen** — het zijn allemaal aanwijsopgaven op een bord dat al staat. De
les toetst herkennen en belooft opstellen. *Voorstel:* óf de belofte bijstellen, óf er een
opgavetype bij waarin het kind een stuk neerzet.

**A8** `src/content/voice.ts:93`, `MAT_VOOR_JOU` wordt nergens gebruikt (`PartijScherm`
zegt bij mat "gewonnen"/"verloren"). Hij wordt wél ingesproken, want `scripts/tts-render.ts`
loopt alle exports van `src/content/voice.ts` af. Betaalde credits voor een zin die niemand
hoort. *Voorstel:* weghalen, of alsnog gebruiken vanaf wereld 10.

**A9** `src/content/validate.ts`, `STUK_WERELD`. De sleutels zijn wereld-id's. Hernoemt
iemand ooit een wereld-id, dan is `thuis === undefined` en slaat de regel dat stuk **stil**
over — geen fout, geen melding. *Voorstel:* een test die vastlegt dat elke sleutel in
`STUK_WERELD` een bestaande wereld-id is.

**A10** `src/ui/gebruikTip.ts:43-50`. De `setTimeout` in de `.then()` wordt bij unmount niet
opgeruimd; `setZin` kan dan op een verdwenen component landen. De `beurt`-teller vangt de
meeste gevallen af, dus in de praktijk onschuldig. *Voorstel:* een `useEffect`-opruiming, of
de timer-id in de ref bewaren.

**A11** `src/lesson/runner.ts`, `husselOpties()`. De volgorde hangt af van de vraagtekst en
is dus voor een gegeven vraag altijd dezelfde. Een kind dat een les vaker speelt leert de
plek van het goede antwoord in plaats van het antwoord. Dat is nog altijd veel beter dan het
oude "altijd bovenaan", en een echt willekeurige volgorde botst met de hydratie. *Voorstel:*
het zaad mengen met het aantal keren dat de les gespeeld is; dat staat al in de voortgang en
is bij het tekenen bekend.

**A12** Startpagina, `src/app/page.tsx`. Twee kleinigheden op het eerste scherm na
"Beginnen" (zie `/tmp/review-2026-09-08/tel-light-02-stal-rondleiding.png`): Pip zegt "Druk
op de grote oranje knop", waarna de rondleiding met drie regels tekst tússen die zin en die
knop komt te staan; en boven in beeld staat "⭐ 0 van de 147 sterren", wat voor een nieuw
kind hetzelfde lege-kast-gevoel geeft dat je elders juist hebt weggehaald. *Voorstel:* de
rondleiding ónder de oranje knop, en de sterrenteller pas tonen zodra er één ster is.

---

## Open punten die deze review niet kan sluiten

- **De iOS-fix is nooit op een Apple-toestel gezien.** `src/board/pieces.ts` zet U+FE0E
  achter alle zes de tekens. De redenering klopt en het is de juiste ingreep, maar of iOS
  hem daadwerkelijk honoreert is niet aangetoond — niet door een test, en niet door mij:
  hier is geen iPhone. Zolang dat zo is staat er een niet-geverifieerde reparatie in een
  release die live gaat, voor een fout waarbij **alle** witte pionnen zwart werden. Laat het
  op één echte iPhone zien voor je dit als opgelost afvinkt.
- **Er heeft nog geen kind gespeeld.** `npm run check` en `npm run doorloop` samen dekken
  veel, maar geen van beide beantwoordt de vraag die op de eerste pagina van dit rapport
  staat. Of een kind van vijf dit leuk vindt, weet je pas als er een kind van vijf is
  geweest — bij voorkeur niet je eigen.
- **De review zelf is niet onafhankelijk.** Zie de tweede paragraaf.

---

## Wat er nu moet gebeuren

| # | Ernst | Wat | Afgehandeld |
|---|---|---|---|
| B1 | blokkerend | Tactiekduel: illegale zetten | **opgelost** — zie hieronder |
| B2 | blokkerend | Wereld-0 minispel vraagt onbekende stukken | **opgelost** — zie hieronder |
| A1 | belangrijk | Volgorderegel uitbreiden | **deels** — het minispel-deel is met B2 verdwenen; de rest staat open |
| A2 | belangrijk | Stal spreekt in de apparaatstem | **deels** — twee vaste zinnen opgelost, de samengestelde staan open |
| A3 | belangrijk | `audio-dekking` is een lege controle | **opgelost** |
| A4 | belangrijk | Donatielink op `/over/` | **open** — ligt bij Kaj |
| A5 | belangrijk | `/lessen/` omzeilt het slot | **open** |
| A6–A12 | klein | zie hierboven | **open** |

## Wat er met de bevindingen gedaan is

Bijgewerkt op 8 september, commits `5aed8eb`..`HEAD`.

**B1 · opgelost.** `tactiekduel` haalt elke kandidaatzet nu door chess.js
(`legaleZetten()` in `src/play/minispellen.ts`) vóór hij hem aanbiedt, en houdt de
stelling alleen als er dán nog precies één vork overblijft. Zelf nagemeten vóór de
reparatie: 57 van 1800 stellingen (3,2%), voorbeeld `8/8/8/8/8/2r5/7k/K1N3r1` met
`Nc1–e2`, waar de toren op g1 het paard tegen a1 pent. `tests/minispelzetten.test.ts`
legt het vast over alle spellen die een zet vragen, en valt om zodra één goedgekeurd
antwoord illegaal is — nagelopen door de filterregel weg te halen: hij noemt dan drie
stellingen met naam. Stellingen zonder witte koning worden overgeslagen: daar kán geen
penning zijn, en dat is precies waar de meetkundige motor voor bedoeld is.

**B2 · opgelost.** `vind-het-veld` vraagt niet meer naar torens, dames en paarden maar
naar licht, donker, de onderste rij en de bovenste rij — wat wereld 0 wél behandelt. De
stukken staan er nog, je hoeft alleen niet te weten hoe ze heten. Een tweede test in
`tests/minispelzetten.test.ts` rekent bij elke gegenereerde opgave na of het antwoord
bij de vraag past en of het niet leeg of juist alles is. Dat bleek meteen nodig: het
noodgeval dat ik erbij schreef zette een stuk op c4 als "donker veld", en c4 is licht.

**A3 · opgelost.** De bewering klopte: de drie patronen eisten een letterlijke string
direct achter `setZin(`/`speak(`/`zegt=`, en de zes treffers in de codebase waren
allemaal het woord `'vraag'` uit `setZin('vraag' in opgave ? ...)` — vijf tekens, onder
de ondergrens van zes. Het script leest nu de hele uitdrukking achter die drie ingangen
uit, volgt een kale variabele één stap terug naar zijn `const`, en haalt daar zowel
letterlijke als samengestelde zinnen uit. Het vindt daarmee precies wat de review met de
hand vond.

**A2 · deels.** De twee vaste zinnen die de herstelde controle vond — `'Samen spelen!
Wit begint.'` in `PartijScherm` en `'Je stal is helemaal vol. Alles verzameld!'` in
`StalScherm` — staan nu in `src/content/voice.ts` en worden dus ingesproken. De
samengestelde zinnen van de stal (`${vak.naam}. ${vak.hoe}`) staan er nog: die splitsen
kost een renderronde over de zestien stalnamen en hun "hoe krijg je hem"-teksten, en dat
is een uitgave die Kaj moet willen doen. De controle noemt ze nu bij elke draai op, dus
ze kunnen niet meer stilzwijgend blijven staan.

**A4 · open, en met opzet.** Dit is een norm-kwestie, geen fout. Ligt bij Kaj.

**Nog open:** A1 (de volgorderegel over `foutTip`, vertelzinnen en quiz-labels, en
`verteldMetWijzer()` laten controleren dat het aangewezen veld het stuk ook draagt), A5,
en A6 tot en met A12.

Als B1, B2 en A3 gedaan zijn, is dit wat mij betreft goed genoeg om aan kinderen te geven
die je niet kent — met de kanttekening dat de iPhone-fix nog door een echt toestel moet.
