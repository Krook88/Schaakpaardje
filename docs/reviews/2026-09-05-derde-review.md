# Release-review ronde 3 — de app voor een kind dat niet leest

**Datum** 5 september 2026 · **Tak** `claude/chess-learning-app-kids-fertg2` · **Beoordeeld op** commit `5008645`
**Scope** commit `5008645` "Maak de app bruikbaar voor een kind dat nog niet leest", bovenop `2e8a197`
(de verwerking van ronde 2). 27 bestanden, +343/−26.

**Centrale vraag** Kan een kind van vier of vijf, dat geen enkel woord leest, elk scherm bedienen
op beeld en geluid alleen? Doelgroep: wereld 0 tot en met 6 (minLeeftijd 3 tot 6).

## Oordeel

**GO MITS** — de twee blokkerende punten (B1 en B2) zijn opgelost.

De richting klopt en het grootste deel werkt. De quizknoppen met het beeld groot en links zijn een
duidelijke verbetering, de fasebalk geeft een niet-lezend kind voor het eerst een begin en een eind,
en de race waardoor Pip praatte terwijl de ouder hem had uitgezet is echt weg en staat vast in vijf
tests. Maar er zijn twee dingen die eerst moeten. De luidsprekerknop — de knop waar deze hele commit
om draait — is als knop onzichtbaar: 1,16:1 in het lichte thema, 1,06:1 in het donkere. Dat is
dezelfde fout als de zetstippen uit ronde 2 (L2, 1,24:1), op de opvolger van diezelfde knop. En in
wereld 0 staat nu een plaatje dat een ander getal noemt dan het antwoord eronder.

Daarnaast is er één bevinding die geen van beide is maar wel de moeite waard: door het plaatje het
antwoord te máken, is een deel van de toetsen op het plaatje op te lossen zónder schaken. Zie A1.

---

## Hoe deze review tot stand kwam — lees dit eerst

De opzet is dat de coördinator drie losse reviewers (`schaakmeester`, `layout-reviewer`,
`codebase-reviewer`) parallel laat kijken en hun oordelen weegt. **Dat is niet gelukt: in deze sessie
is er geen Agent-tool beschikbaar, dus de drie reviewers konden niet gestart worden.** Precies
hetzelfde gebeurde in ronde 1; ronde 2 lukte wel.

Ik heb de drie invalshoeken daarom zelf nagelopen. Wat dat betekent:

- Er is **geen tweede paar ogen** en **geen tegenspraak** om te wegen. Alles hieronder komt van één
  beoordelaar, en er staan dus ook geen drie samenvattingen in eigen woorden — die zouden verzonnen
  zijn.
- De bevindingen zelf zijn wél echt en nagemeten. Elk contrastgetal komt uit de gebouwde app in de
  browser, elke telling uit een scriptje over de echte content. De schermafbeeldingen en scriptjes
  staan in de sessie-scratchpad onder `review3/`.
- Wat een echte layout-reviewer wél had gedaan en ik niet: kijken op tablet- en chromebookformaat.
  Ik heb alleen 420×900 en 900×1200 bekeken. De bordmaat en het horizontaal scrollen op die formaten
  zijn in ronde 2 gemeten en er is deze commit niets aan het bord veranderd, maar het is niet
  opnieuw gecontroleerd.

Zie *Wat jij moet beslissen*.

## Wat er nu staat

Zelf gedraaid, en de opgegeven uitkomsten kloppen alle vier:

| Commando | Uitkomst |
|---|---|
| `npm run typecheck` | schoon |
| `npm test` | 92 tests, 6 bestanden, alle groen |
| `npm run validate:content` | in orde, 542 zinnen, 53 opgaven zonder `bedoeling` |
| `npm run build` | schoon |

### Reparaties uit ronde 2 — steekproef

| Uit ronde 2 | Nu gemeten | Oordeel |
|---|---|---|
| L2 zetstippen ≥ 3:1 | eigen tokens `--zetstip` `#1b1b17` met rand `rgba(255,255,255,.62)`, ongewijzigd | houdt stand |
| L11 bord kost één tabstop | `/spelen/kiki/` telt **7** echte tabstops, `/les/weide-1/` **6** | houdt stand |
| L8 bordveld ruim boven 44px | 48×48px op 420px breed, exact vierkant | houdt stand |
| L1 diploma print | de `@media print`-regels op `.oorkonde` staan onaangeroerd in `Diploma.module.css` | **niet hermeten** — een vers profiel heeft geen diploma, dus `.oorkonde` rendert niet. Ronde 2 heeft dit wel gemeten. |
| B6 `nietNagerekend()` | `validate:content` meldt de 53 nog steeds onderaan | houdt stand |

De bewust niet opgeloste punten uit ronde 2 (zoeker naar een web worker, `npm audit` op dev-only,
promotiekeuzescherm, klikbare minispellen van gesloten werelden) heb ik opnieuw tegen het licht
gehouden. **Alle vier de beslissingen zijn houdbaar.** Bij de zoeker is het argument sinds ronde 2
zelfs sterker geworden: die raakt de doelgroep van deze fase (wereld 0 t/m 6) helemaal niet — een
kind van vier komt niet bij Bram.

---

## Bevindingen

### Blokkerend

**B1 — De luidsprekerknop is geen knop. Voor precies het kind waar hij voor is.**
*Plaats:* `src/ui/Pip.module.css`, `.luister` · elk scherm met Pip

Nagemeten in de gebouwde app, op `/les/weide-1/`:

| | vulling vs ballon | rand vs ballon |
|---|---|---|
| licht | `rgb(251,234,215)` op `rgb(255,253,248)` → **1,16:1** | `rgb(222,211,191)` → **1,46:1** |
| donker | `rgb(44,35,24)` op `rgb(28,32,38)` → **1,06:1** | `rgb(51,58,68)` → **1,42:1** |

De eis voor de omtrek van een bedieningselement is 3:1. Er is dus geen zichtbare knop: er zweeft een
🔊 van 22px in een tekstballon. Een kind van vier weet dat het daarop moet tikken alleen als een
volwassene het één keer heeft voorgedaan — en dat is nu net het kind waarvan de commit zegt dat het
op eigen kracht verder moet kunnen.

Dit is dezelfde fout als L2 uit ronde 2 (zetstippen op 1,24:1), en dat was toen blokkerend. Het
project heeft 3:1 zelf als ondergrens vastgelegd en nagemeten; deze knop is er onderdoor geglipt
omdat hij nieuw is en niemand hem heeft nagemeten.

*Voorstel (kleinste ingreep):* geef `.luister` de bestaande accentkleur als vulling in plaats van
`--accent-soft`, of houd `--accent-soft` en zet de rand op `var(--accent)`. Beide brengen de omtrek
in één regel boven 3:1. Meet het na, zoals bij de zetstippen.

---

**B2 — Het plaatje bij het goede antwoord noemt een ander getal dan het antwoord.**
*Plaats:* `src/content/werelden/w0-weide.ts` regel 126–136, `weide-2` / toets

> Acht rijen van acht velden. Hoeveel velden heeft het bord dan?
> 6️⃣ 64 ← goed · 3️⃣ 32 · 💯 100

Deze vraag is in ronde 2 (C18) hierheen verplaatst, en in deze commit hebben de drie opties een
eigen plaatje gekregen omdat drie keer 🔢 "voor een niet-lezend kind geen keuze maar gokken" was.
Dat klopte. Maar de oplossing maakt het erger in plaats van beter, want de commit heeft van het
plaatje het antwoord gemaakt:

- Het goede antwoord (64) draagt **6️⃣**, het cijfer zes. Het plaatje noemt een ander getal dan het
  antwoord eronder.
- **💯** is van de drie het best leesbare plaatje en betekent letterlijk honderd — en staat op een
  fout antwoord.
- Cijfers zijn tekens, geen beelden. Een kind dat de titel "Rijen en lijnen" niet leest, leest 6️⃣ ook
  niet als "vierenzestig".

Onder de eigen regel van deze ronde — een plaatje dat het verkeerde suggereert is net zo fout als
een verkeerde stelling — is dit blokkerend.

*Voorstel:* haal de vraag weg. 8 × 8 is rekenwerk, niet schaken, en in de eerste wereld met
minLeeftijd 3 is hij met geen enkel plaatje picturaal te maken. Het aantal velden staat al in het
`vertel` van `weide-2`; daar hoort het thuis. Wil je hem houden, geef hem dan pas een plek in een
wereld waar het kind leest, en geef de opties dan gewoon geen plaatje — met een uitzondering in de
contentcontrole voor telvragen.

---

### Belangrijk

**A1 — Nu het plaatje het antwoord is, lekt het plaatjesrepertoire het antwoord.**
*Plaats:* alle 32 quizvragen in wereld 0 t/m 6

Geteld over de echte content:

| plaatje | keer | goed | fout | |
|---|---|---|---|---|
| 🌈 | 6× | 0 | 6 | **altijd fout** — loper-2, dame-2, paard-2, pion-1, pion-3, pion-5 |
| 🦘 | 3× | 0 | 3 | **altijd fout** — toren-2, toren-3, dame-2 |
| 🛑 | 4× | 4 | 0 | **altijd goed** — toren-2, dame-2, pion-3 (2×) |
| 🚫 | 6× | 5 | 1 | bijna altijd goed |
| 1️⃣ | 5× | 4 | 1 | bijna altijd goed |

Een kind dat niets leest en alleen de regel "kies 🛑 of 🚫, mijd 🌈 en 🦘" oppikt — en dat is precies
het soort regel dat een kind van vijf binnen twee werelden oppikt — haalt **9 vragen zeker goed en
1 zeker fout**, en komt over alle 32 vragen op een verwachte **56%**, tegen **38%** bij zuiver
gokken. Bij twee sterren gaat de volgende les open. Het kind leert hier niets verkeerds, maar het
komt wel verder zonder het geleerd te hebben — en de toets is de enige plek waar de app controleert
of het geland is.

Dit is het risico dat je koopt met "het plaatje is het antwoord", en het is te repareren zonder de
richting los te laten.

*Voorstel:* houd de plaatjes bij opties die een **schaakbetekenis** hebben (↔️ ↕️ ↗️ ➕ ✖️ ⬆️ 🐴 ⬜ 🟩
👑 ♟️ — die dragen echt de inhoud en werken goed). Vervang de plaatjes die alleen een **oordeel**
dragen (🌈 "alles", 🛑 "niets", 🦘 "eroverheen", 🚫 "nee") door iets dat het geval zelf toont, of
laat ze rouleren zodat geen enkel plaatje eenzijdig goed of fout is. Een test die dit vastlegt —
"geen plaatje is in meer dan driekwart van zijn voorkomens goed of fout" — is een vangrail van
hetzelfde soort als de drie uit ronde 2, en zou dit voortaan zelf vinden.

---

**A2 — Het icoon van de eerste paardles is een letter in een hokje.**
*Plaats:* `src/content/werelden/w4-paard.ts` regel 22, `paard-1` "Ik spring in een L", `icoon: '🇱'`

`🇱` is U+1F1F1, REGIONAL INDICATOR SYMBOL LETTER L — de halve helft van een vlagemoji. Los
gerenderd is er geen vlag, en het gedrag is niet vastgelegd: in Chromium komt er een **gestippeld
hokje met een hoofdletter L** uit (nagerenderd, zie `review3/shot/06-iconen.png`), op andere
platforms een leeg blokje. In de commit waarvan de hele stelling is dat het kind niets leest, is het
icoon van de eerste paardles dus een letter — en in wereld 4 (minLeeftijd 5) leest niemand die.

*Voorstel:* neem `♞` of `🐴`. Het paard is in dezelfde wereld al de goede quizoptie bij "Hoe springt
het paard?", dus het beeld is al ingevoerd. De L-vorm zelf is met een emoji niet te tekenen; die
hoort op het bord, niet in het icoon.

---

**A3 — Drie lessen over slaan hebben drie bijna identieke plaatjes, en de controle ziet het niet.**
*Plaats:* `toren-3` 🍽️ · `koning-2` 🍽️ · `loper-3` 🍴 · `src/content/validate.ts`

- 🍽️ staat **twee keer** als lesicoon: `toren-3` "Pak dat stuk" en `koning-2` "De koning pakt ook".
  Exact hetzelfde teken.
- `loper-3` "Schuin slaan" draagt 🍴, dat op 30px nauwelijks van 🍽️ te onderscheiden is.
- 🏁 staat ook twee keer: `paard-4` en `mat-1`.

Alle 48 lessen staan op één kaartpagina onder elkaar. Voor een kind dat de titels niet leest zijn
deze lessen dus niet uit elkaar te houden — precies wat de nieuwe controle wil voorkomen. Maar de
controle kijkt alleen **binnen één wereld**, en deze paren zitten in verschillende werelden.

*Voorstel:* trek beide nieuwe controles globaal: lesiconen uniek over de héle content in plaats van
per wereld. Kies daarna nieuwe iconen voor `koning-2` (bijvoorbeeld 👑🍴 of ✋) en `paard-4`. Voor
loper-3 is de vraag inhoudelijker: 🍴 is internationaal het beeld van een *vork*, en de vork is een
tactiek die pas in wereld 13 komt (`tactiek-1`, 🔱). Kies daar iets dat schuin slaan toont.

---

**A4 — ✅ staat op een fout antwoord, terwijl de app een goed antwoord groen kleurt.**
*Plaats:* `src/content/werelden/w5-koning.ts` regel 148, `koning-3` / meedoen

> Mag de witte koning naast de zwarte koning gaan staan? 🚫 nee ← goed · ✅ ja

Sinds ronde 2 (L4) kleurt de app de goede quizknop groen en laat de foute schudden. Hier draagt het
**foute** antwoord een groen vinkje. Een kind dat niet leest ziet de vraag niet, ziet twee knoppen —
verbodsbord en groen vinkje — en kiest het vinkje, omdat elk ander scherm in deze app en daarbuiten
het zo gebruikt. En dan kleurt de goede knop alsnog groen.

Ter vergelijking: in `rokade-3` (wereld 11) draagt ✅ juist wél het goede antwoord. Hetzelfde teken,
tegengestelde rol.

*Voorstel:* laat ✅ en ❌ weg als optieplaatje. Ze horen bij de terugkoppeling van de app, niet bij
de inhoud van een antwoord. Voor deze vraag: toon twee kleine bordjes — koningen naast elkaar en
koningen met een veld ertussen — in plaats van ja/nee.

---

**A5 — Op de kaart hebben de nieuwe iconen geen enkel effect, want alles staat op slot.**
*Plaats:* `src/app/kaart/page.tsx` regel 62–65 — `{open ? les.icoon : '🔒'}`

Het lesicoon wordt **vervangen** door het slot zodra de les dicht is. Voor een kind dat vandaag
begint, staan 47 van de 48 lessen dicht: de kaart is een kolom van 47 identieke hangslotjes. De
iconen die deze commit heeft toegevoegd zijn precies dan onzichtbaar, terwijl het vooruitkijken —
"wat komt er nog?" — juist het enige is waar de kaart voor dient.

Het contrast van het nieuwe woordje "nog dicht" is trouwens prima (4,82:1 licht, 5,58:1 donker) —
het is alleen een woord, en die leest de doelgroep niet. Het slot ernaast vangt dat op.

*Voorstel:* toon het lesicoon altijd, in grijstinting en op ~45% dekking (net als de fasebalk dat
al doet voor komende fasen), met het slotje klein in de hoek erbij. Één regel, en de kaart wordt
weer een kaart.

---

**A6 — De ondertiteling ontsnapt nog aan de race die deze commit repareert.**
*Plaats:* `src/audio/voice.ts`, `speak()`

```ts
stopSpeaking()
if (config.ondertiteling) ondertitelListener?.(tekst)   // <- vóór de poort
if (typeof window === 'undefined') return
if (!opVerzoek) {
  if (!configToegepast) { wachtendeZin = tekst; return }
  ...
```

De ondertitelregel staat vóór de `configToegepast`-poort. De instelling `ondertiteling` komt uit
dezelfde localStorage en op hetzelfde moment als `spraak`, met dezelfde standaard "aan". Een ouder
die de ondertiteling heeft uitgezet, ziet de eerste zin dus alsnog verschijnen — precies de bug die
voor de spraak is opgelost. En als de vastgehouden zin daarna via `setVoiceConfig` alsnog wordt
uitgesproken, vuurt de ondertitel er een **tweede** keer overheen.

*Voorstel:* zet de ondertitelregel ná de poort, en laat de vastgehouden zin ook de ondertitel
dragen. Dat is dezelfde vorm als de spraakoplossing en past in de bestaande `tests/stem.test.ts`.

---

### Klein

| # | Bevinding | Plaats | Voorstel |
|---|---|---|---|
| K1 | De fasebalk is voor een schermlezer onzichtbaar: `aria-label` op een kale `<div>` zonder rol wordt niet voorgelezen, en alle vier de plaatjes zijn `aria-hidden`. | `LessonPlayer.tsx`, `FaseBalk` | `role="img"` op de div, of `role="group"`. |
| K2 | `title={FASE_NAAM[f]}` op de fase-plaatjes doet niets op een tablet — een tooltip vergt een muis, en dit is een app voor vingers. | idem | Weg, of vervang door zichtbare tekst voor de meelezende ouder. |
| K3 | De luidsprekerknop staat in een `<p aria-live="polite">`. Bij elke nieuwe zin van Pip leest een schermlezer de zin én "Zeg het nog eens" opnieuw voor. | `Pip.tsx` | Knop buiten het live-gebied zetten, naast de `<p>` in plaats van erin. |
| K4 | De nieuwe beelden staan als inline `style={{ fontSize: 30, … }}` verspreid door `LessonPlayer.tsx`, `page.tsx` en `kaart/page.tsx`, terwijl de rest van dezelfde bestanden module-CSS gebruikt. Zes plekken met hetzelfde getal. | vier bestanden | Eén klasse, bijvoorbeeld `.knopBeeld`, in de bestaande module-CSS. |
| K5 | "0 van de 4 gevonden" en "1 van 3" zijn tekst zonder beeld. Een niet-lezend kind weet niet hoeveel er nog te gaan is. Ronde 2 (L17) haalde de stippenrij weg bij één opgave; hier is niets voor teruggekomen. | `LessonPlayer.tsx` | Vier stipjes die vollopen. Geen blokkade — het kind kan gewoon doortikken. |
| K6 | 🐴 is de goede optie in `paard-1` en de foute in `toren-1` en `loper-1`. Dat is inhoudelijk juist, maar het is het enige plaatje dat van rol wisselt binnen dezelfde drie vragen. | w1, w2, w4 | Laten staan; alleen noemen omdat het bij A1 hoort. |

---

## Wat er goed is

- **De race is écht opgelost, en vastgelegd.** `configToegepast`/`wachtendeZin` doen wat ze beloven,
  en `<Instellingen />` staat nu vóór `{children}` zodat zijn effect als eerste draait. De vijf
  tests in `tests/stem.test.ts` toetsen de vier gevallen die ertoe doen, inclusief het geval dat de
  luidsprekerknop moet blijven werken met spraak uit. Dit is precies de vorm waar `CLAUDE.md` om
  vraagt: geen netheid, maar een vangrail.
- **De quizknop is een echte verbetering.** Beeld 40px, links, knop 78px hoog, tekst ernaast. Op het
  scherm is meteen zichtbaar dat je op het plaatje kiest en niet op het woord.
- **De fasebalk werkt.** Vier plaatjes, de huidige met een oranje ring, de komende in grijstinting.
  Voor het eerst kan een kind van vier zien dat een les een begin en een eind heeft.
- **De contentcontrole is op de goede plek uitgebreid.** Een plaatje verplicht bij elke quizoptie en
  geen twee dezelfde binnen een vraag: dat vond de telvraag van `weide-2` en dat is de reden dat A3
  en A1 überhaupt te vinden waren. De grens is alleen te krap getrokken (zie A3).
- **De ouderuitleg is eerlijk geworden.** "Pip praat vanzelf" plus de zin dat de luidsprekerknop
  blijft werken is precies wat een ouder moet weten om die schakelaar durven om te zetten.
- Alle vier de controles zijn zelf gedraaid en groen, en de gecontroleerde reparaties uit ronde 2
  houden stand.

---

## Wat jij moet beslissen

1. **Ga je akkoord met een review van één beoordelaar?** De drie reviewers zijn niet gestart, want
   er is geen Agent-tool in deze sessie. De bevindingen hierboven zijn nagemeten, maar er is geen
   tegenspraak geweest en er is niet op tablet- en chromebookformaat gekeken. Wil je de volle
   drievoudige review, laat deze ronde dan overdoen in een sessie waar de Agent-tool wél beschikbaar
   is, en behandel dit rapport als een voorschot.

2. **B2 — schrappen of verplaatsen?** Ik stel voor de telvraag "hoeveel velden heeft het bord" uit
   `weide-2` te halen. Dat is inhoud weggooien die twee rondes geleden bewust is verplaatst; dat is
   jouw keuze, niet die van een reviewer.

3. **A1 — hoe ver ga je met de plaatjesregel?** Het plaatjesrepertoire evenwichtig maken raakt zo'n
   tien opgaven in wereld 0 t/m 6 en vraagt om een nieuwe test. Dat kan nu, of het kan een eigen
   fase worden. Als je het uitstelt, zet dan hier vast wat de reden is — stilzwijgend overslaan mag
   niet.

4. **A5 — wat is de kaart voor?** Iconen tonen bij gesloten lessen betekent dat een kind ziet wat er
   komt. Dat is aanmoedigend, maar het maakt gesloten lessen ook aantrekkelijker om op te tikken.
   Ronde 2 (L7) heeft ze juist duidelijker dicht gemaakt. Dit is een ontwerpkeuze, geen fout.

---

# Verwerkt op 5 september 2026

Alles hieronder is uitgevoerd in commit na `5008645`. De vier beslispunten zijn beantwoord
onderaan.

| # | Bevinding | Wat er gedaan is |
|---|---|---|
| B1 | De luidsprekerknop haalde 1,16:1 (licht) en 1,06:1 (donker) tegen de ballon — geen zichtbare knop, op de knop waar deze hele fase om draait. | `.luister` gevuld met `var(--accent)` in plaats van `--accent-soft`. Hermeten in de gebouwde app: **4,63:1 licht, 6,46:1 donker**, knop 46×46. |
| B2 | `weide-2`/toets: het plaatje noemde een ander getal dan het antwoord (💯 op "100", 6️⃣ op het goede "64"). | De telvraag is vervangen door een `tapSquares` (een lijn aanwijzen). Zie beslissing 2. |
| A1 | Het plaatjesrepertoire verklapte het antwoord. | 19 opties hebben een plaatje gekregen dat de inhoud van het antwoord toont in plaats van de toon ervan. Zie hieronder: dit bleek maar de helft van het probleem. |
| A2 | `paard-1` had `🇱` als icoon, dat als een hokje rendert. | Nu `🔀`. |
| A3 | 🍽️ stond twee keer als lesicoon; de controle keek alleen bínnen een wereld. | `koning-2` → `😋`, `mat-1` → `🔚` (botste met `paard-4`). De controle kijkt nog steeds per wereld; over werelden heen zijn ze nu handmatig uniek. |
| A4 | ✅ stond op het foute antwoord in `koning-3`. | Vervangen door 🤝 (twee koningen die elkaar raken) — een beeld van de situatie, niet van goed/fout. |
| A5 | Gesloten lessen verborgen hun nieuwe icoon. | Ze tonen het nu grijs, met het slotje ernaast. Zie beslissing 4. |
| A6 | De ondertiteling ontsnapte nog aan de race die voor de stem gerepareerd was. | `speak()` stelt de ondertitel nu ook uit tot de instellingen bekend zijn, en `setVoiceConfig` biedt de vastgehouden zin altijd opnieuw aan — die kan dan te horen zijn, alleen te lezen, of geen van beide. Vastgelegd in `tests/stem.test.ts`. |

## Wat deze ronde niet vond, en wat wél de grootste vondst was

Bij het narekenen van A1 bleek de gokstrategie op plaatjes niet 56% te halen maar **100%**.
De oorzaak lag niet bij de plaatjes: **in alle 94 quizzen van de app stond het goede antwoord
op de eerste plek.** Een kind dat niet leest — de hele doelgroep van de eerste werelden —
haalde daarmee drie sterren op élke quiz door steeds de bovenste knop te tikken, zonder één
schaakregel te kennen. Sterren ontgrendelen de volgende les, dus dat is niet cosmetisch.

Geen van de drie reviewrondes had dit gezien, en ik zelf ook niet toen ik de quizknoppen in
deze fase juist opnieuw vormgaf.

Opgelost met `husselOpties()` in `src/lesson/runner.ts`: de volgorde wordt bepaald door een
hash van de vraagtekst zelf, dus hij is stabiel tussen serveren en tekenen (geen
hydratieklacht) en identiek voor elk kind, maar verschilt per vraag. Gemeten: de bovenste
knop is nu **41%** goed in plaats van 100%; blind gokken zou 39% zijn.

Twee tests in `tests/content.test.ts` houden het vast:
- het goede antwoord staat op minder dan 55% van de vragen bovenaan;
- geen plaatje dat vijf keer of vaker voorkomt staat altijd aan dezelfde kant.

Die tweede test viel meteen om op 🌈, dat zes keer voorkwam en zes keer fout was ("alle kanten
op", "overal", "iedereen"). Daar leert een kind "de regenboog is nooit goed" van. Opgelost door
in `koning-1` de vraag te stellen waar het wél het goede antwoord is: welke kanten mag de
koning op.

## De vier beslissingen

1. **Review van één beoordelaar.** Aangenomen als voorschot, niet als volwaardige ronde. De
   coördinator kon de drie reviewers niet starten. Er is niet op tablet- en chromebookformaat
   gekeken en er is geen tegenspraak geweest. De volgende ronde hoort weer drievoudig te zijn.
2. **De telvraag is geschrapt, niet verplaatst.** "64 / 32 / 100" is met plaatjes niet te
   beantwoorden: het getal ís het antwoord, dus elk beeld erbij verklapt het of misleidt.
   Vierenzestig staat nog steeds in wat Pip vertelt; de toets vraagt nu iets wat je kunt
   aanwijzen.
3. **De plaatjesbalans is nu gedaan**, niet uitgesteld — juist omdat het narekenen ervan de
   veel grotere fout hierboven aan het licht bracht.
4. **Gesloten lessen tonen hun icoon.** Grijs, met het slotje ernaast, en de gestippelde rand
   en vlakke achtergrond uit L7 blijven. Dat botst niet met L7: die ging erover dat een gesloten
   les er niet als een knop uit mag zien, en dat is nog steeds zo. Meegenomen: er stond
   "nog dicht" als tekst — precies wat de doelgroep niet leest — en dat is nu het slotje.
