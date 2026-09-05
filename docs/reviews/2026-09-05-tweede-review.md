# Release-review ronde 2

**Datum** 5 september 2026 · **Tak** `claude/chess-learning-app-kids-fertg2` · **Beoordeeld op** commit `e928023`
**Reviewers** schaakmeester, layout-reviewer, codebase-reviewer

Deze ronde ging over alles wat er na de eerste review bij is gekomen: de werelden 7 tot en met 14,
de sterkere tegenstanders, de offline-modus, de diploma's en de minispellen.

## Oordeel

**Geen go op het moment van de review.** Vier blokkerende bevindingen: twee op schaakinhoud
(C1, C2) en twee op vormgeving (L1, L2). Alle vier zijn hieronder verwerkt.

De rode draad van de schaakmeester: de fouten zijn **verhuisd**. Ze zitten niet meer in de
wereldbestanden — daar doet de contentcontrole zijn werk — maar op de plekken die die controle
per definitie niet ziet: de generatoren in `minispellen.ts`, de foutTips (die nergens tegen de
stelling worden gehouden) en de schermteksten. De rode draad van de layout-reviewer was een
andere: de vorm klopt, maar **de app praat te zacht terug**. Een fout quizantwoord deed niets,
een fout in het rekenslot deed niets, een gevonden veld verschilde 1,29:1 van een niet-gevonden
veld. Voor een app die zegt dat ze een kind nooit straft, was de keerzijde dat ze het kind ook
nauwelijks nog vertelde dát het iets gedaan had.

## Wat er nu staat

| Commando | Uitkomst na verwerking |
|---|---|
| `npm run typecheck` | schoon |
| `npm test` | 87 tests, 5 bestanden |
| `npm run validate:content` | in orde, 542 zinnen, 53 opgaven zonder `bedoeling` |
| `npm run build` | schoon |
| `npm audit --omit=dev` | 0 kwetsbaarheden |

---

## Schaakinhoud en didactiek

### Blokkerend

| # | Bevinding | Wat er gedaan is |
|---|---|---|
| C1 | `tactiek-1/zelf1`: de witte koning stond schaak op a1 terwijl het kind Pc6 moest spelen — een zet die volgens de regels niet mag, vier werelden nadat wereld 9 heeft geleerd dat schaak altijd voorgaat. | Koning naar g1 (`1N5k/8/8/r3r3/8/8/8/6K1`). Nagerekend: wit staat niet meer schaak en c6 blijft de enige vork. Nieuwe test `tests/content.test.ts` legt vast dat géén enkele `regelZet` vanaf wereld 9 de speler zelf schaak zet. |
| C2 | `mat-3/zelf2`: "tik de twee velden aan die hij zou willen" met `correct: ['g8','h7']`, terwijl de koning op h8 drie buurvelden heeft. Een kind dat g7 aanwees kreeg fout. | `correct: ['g7','g8','h7']`, vraag naar "de drie velden", en een nieuwe `bedoeling: { soort: 'buurvelden', van: 'h8' }` zodat de contentcontrole zulke lijstjes voortaan narekent. |

### Belangrijk

| # | Bevinding | Wat er gedaan is |
|---|---|---|
| C3 | `tactiekduel` bouwde onmogelijke stellingen: 96 van 200 met wit in schaak, 19 met koningen naast elkaar. Als enige generator ging hij niet langs chess.js. | Nieuwe `stellingKlopt()` haalt het bord door chess.js en gooit alles weg wat `over` of `check` is, of dat chess.js weigert. Gemeten over 200 opgaven per spel: alle vijftien generatoren nu schoon. |
| C4 | De foutTip bij de eerste mat-in-1 van `eindspel-2` wees naar een zet die geen mat is, en verwisselde rij met lijn — in een app die dat verschil zelf in wereld 0 uitlegt. | Herschreven: "Zijn koning kan nog naar boven en naar beneden. Kom op zijn lijn, dan dek je ook g6." (De enige mat is Dh5#.) |
| C5 | Pip riep "je koning wordt aangevallen" als het kind zélf schaak gaf. | Al verwerkt vóór deze ronde: `SCHAAK_TEGEN_JOU` / `SCHAAK_VAN_JOU`, gesplitst op `status.turn`. |
| C6 | De toets van `pion-1` vroeg de regel van `pion-3` ("een stuk staat pal voor je pion"). | Vraag verplaatst naar de toets van `pion-3`; `pion-1` toetst nu alleen de looprichting. |
| C7 | Wereld 9 introduceerde én toetste mat, terwijl het project heeft vastgelegd dat dat pas in wereld 10 komt. | Toetsvraag vervangen door "welke zet mag je NIET doen"; de vooruitblik staat nog in een foutTip, waar hij hoort. Nieuwe test: vóór wereld 10 komt "mat" niet voor in een vraagtekst of een goed antwoord (als afleider mag het). |
| C8 | `geefSchaak` keurde elke schaakzet goed, ook Dd8+ waarna Kxd8 volgt. In `schaak-alarm` gaf bij 10 van 120 opgaven élk goedgekeurd antwoord het stuk weg. | `goedeZetten` rekent bij `geefSchaak` nu een kleine ruilrekening (`materieelSaldo`) en laat alleen zetten door die niets kosten — tenzij er geen enkele veilige is, dan alles, want het kind mag nooit vastlopen. `schaak-alarm` verwerpt stellingen waar niet elk goed antwoord veilig is. |
| C9 | `weegschaal` beloonde in 12 van 200 opgaven een slechte ruil: het duurste stuk stond gedekt. | Stellingen waarin het duurste doelwit gedekt is, worden verworpen. Gemeten: 0 van 200. |
| C10 | Pionnen op rij 1 en 8, in acht van de vijftien minispellen — het scherpst in `laatste-pion`, het spel dat over promotie gaat. | Nieuwe `willekeurigPionVeld()` (rij 2 t/m 7), overal gebruikt waar een pion neergezet wordt. **En:** de nieuwe test vond hetzelfde in drie echte lessen — `toren-3`, `paard-2` en `waarde-2` — die geen enkele reviewer had gezien. Alle drie hersteld. |
| C11 | `mat-1/zelf3` legde uit dat drie pionnen de koning insluiten, terwijl de pion op f7 niets blokkeert en g8 leeg is. | Opgesplitst in twee opgaven: eerst de twee insluitende pionnen (g7, h7), dan het lege veld dat de toren bewaakt (g8). |
| C12 | En passant kwam nergens voor, terwijl de bots hem gewoon spelen: het kind ziet zijn pion verdwijnen door een zet die niet kan. | Nieuwe les `pion-5` "In het voorbijgaan", met een nieuwe eis `enPassant` op chess.js (`GameMove.isEnPassant`). Wereld 6 heeft nu vijf lessen. |
| C13 | `vind-het-veld` (wereld 0, vanaf 3 jaar) vroeg naar lopers, koningen en pionnen — stukken uit wereld 2, 5 en 6. | Beperkt tot toren, dame en paard: precies de stukken die `weide-3` bij naam noemt. |
| C14 | In het pionnenspel gold de winregel alleen voor het kind. | Al verwerkt vóór deze ronde: de promotiecontrole draait nu ook na de botzet. |

### Klein

| # | Bevinding | Wat er gedaan is |
|---|---|---|
| C15 | "Oppositie" werd in de toets gevraagd maar stond alleen in een foutTip. | Term opgenomen in het `vertel` van `eindspel-1`. |
| C16 | "Je hebt minstens een toren of dame nodig" is niet waar. | Vervangen door "Je hebt er minstens één stuk of pion bij nodig." |
| C17 | De diagonaal werd in de tóets van `weide-2` geïntroduceerd in plaats van getoetst. | Naar de `zelf`-fase verplaatst. |
| C18 | `weide-1` toetste "hoeveel velden heeft een bord", maar acht-rijen-van-acht komt pas in `weide-2`. | Vraag naar de toets van `weide-2` verplaatst, en "acht rijen van acht" staat nu in het `vertel` daarvan. `weide-1` toetst in plaats daarvan nog een keer veldkleur. |
| C19 | `pion-1` toonde de pion op zijn startveld, waar juist de uitzondering geldt. | `vertelFen` naar `8/8/8/4P3/8/8/8/8`. |
| C20 | In `eindspel-1` kon de witte koning naast de zwarte lopen en hem zelfs slaan. | Zwarte koning van het bord: `8/8/8/8/8/8/8/K7`. |
| C21 | "Alleen heel soms is een paard slimmer", terwijl promoveren altijd naar dame gaat en het kind dat nergens kan proberen. | De zinsnede is eruit (de andere helft van het voorstel — een promotiekeuzescherm — is niet gebouwd; zie *Niet opgelost*). |
| C22 | `rokade-3/zelf3` vroeg "Mag het hier?" terwijl beide rokades gewoon mogen, en "nee" geen mogelijk antwoord was. | Herschreven: "Zijn toren staat op jouw toren te loeren. En toch mag het. Rokeer maar." |

---

## Vormgeving en bruikbaarheid

### Blokkerend

| # | Bevinding | Wat er gedaan is |
|---|---|---|
| L1 | Het diploma kwam blanco uit de printer in donkere modus: bijna witte tekst op wit papier, want browsers printen achtergronden niet. En alle drie de hoefijzers waren op papier even grijs. | `@media print` forceert nu wit papier, zwarte tekst en een eigen randkleur per soort. Nagemeten met `emulateMedia({ media: 'print' })`: in beide thema's `rgb(255,255,255)` / `rgb(0,0,0)` / brons `rgb(138,95,52)`. |
| L2 | De "hier mag je heen"-stippen kwamen uit `--ink` en waren in het donkere thema lichtgrijs op een lichtbeige veld: **1,24:1**. De kernaffordance van de hele bediening. | Eigen tokens `--zetstip` / `--zetstip-rand`, los van het thema, met een lichte rand. Nagemeten in de browser: licht 14,56:1 en 6,75:1, donker 9,15:1 en **3,65:1** — overal boven de 3:1. |

### Belangrijk

| # | Bevinding | Wat er gedaan is |
|---|---|---|
| L3 | Een fout antwoord op het rekenslot deed niets: het foute getal bleef staan, het scherm veranderde niet. | Melding, rode rand, veld leeg, focus terug. |
| L4 | Een fout quizantwoord gaf geen enkel visueel signaal — alleen Pips tekst, die de doelgroep niet leest. | De aangetikte knop kleurt en schudt (`.quizMis`), de goede knop kleurt groen. Gecontroleerd in de browser. |
| L5 | "Help me even" gaf bij een quiz geen hint maar kostte wél een ster. | De knop staat er bij een quiz niet meer. |
| L6 | Na het weghalen van de sterrenrij had de stal geen zichtbare voortgang meer voor een kind dat niet leest. | Een rij wereld-emoji's die van links naar rechts in kleur komt te staan. Het getal blijft ernaast, voor de ouder. |
| L7 | Vergrendelde lessen zagen eruit als knoppen: zelfde kaart, rand en schaduw. | Geen schaduw, gestippelde rand, `--surface-2`, groter slotje. |
| L8 | Het bord bleef op tablet en chromebook op 460px hangen terwijl er ruimte zat was, en de knoppen stonden over de volle paginabreedte uitgesmeerd. | Bord op `min(100%, 70vh, 620px)`, knoppenrijen in dezelfde kolombreedte. Nagemeten: veld van 57,5 naar **77,5px** (tablet) en **70px** (chromebook), geen horizontaal scrollen op geen enkel formaat. |
| L9 | Goed en fout op het bord waren te zacht (1,29:1) en het witte vinkje haalde 1,94:1 op de roze waas. | Waas van 34/40% naar 62/66%, teken van 26% naar 38% van het veld, en in een donkere versie van dezelfde kleur in plaats van wit. |
| L10 | Wit op `--accent` haalt 4,03:1 en de knoptekst is 18,4px vet — net onder "grote tekst", dus 4,5:1 is de eis. | `--accent` in het lichte thema naar `#b35c14` (4,71:1). |
| L11 | Het bord kostte 64 tabsprongen voordat je bij de knoppen was, na elke zet opnieuw. | Rasterpatroon: één tabstop op het bord, pijltjes erbinnen (die de bordoriëntatie volgen). Nagemeten op `/spelen/kiki/`: van **70 naar 5** focusbare elementen. |

### Klein

| # | Bevinding | Wat er gedaan is |
|---|---|---|
| L12 | Op de telefoon sprong de wereldbeker naar een eigen regel onder het wereld-emoji. | `flexWrap: nowrap` plus `minWidth: 0` op de titelgroep; de tekst breekt nu in plaats van de rij. |
| L13 | Op het beloningsscherm kreeg het kind de ouder-formulering te lezen: "Je kind ziet dat...". | Nieuw veld `geleerd` op elke les — dezelfde les, maar tegen het kind — voor alle 48 lessen ingevuld. `doel` is nu strikt voor het ouderscherm. |
| L14 | Een verouderde ontwikkelnotitie stond in beeld op het tegenstanderscherm ("komen erbij in fase 2"). | Weg. In plaats daarvan één tot drie paardjes per tegenstander, zodat een niet-lezend kind ziet welke makkelijk is. |
| L15 | Minispel: de tekst zei wortels, het bord toonde een pion. En de niveau-sterren stonden op 0,25. | Tekst zegt nu "zwarte pionnen"; lege sterren op 0,4 plus grijstinting. |
| L16 | Het instellingenvinkje was 28×28px — de enige plek in de app onder de 44. | 44×44. |
| L17 | Vier losse punten: één losse voortgangsstip zegt niets; de selectiering haalt 1,57:1; minispellen van gesloten werelden zijn klikbaar; het diplomaslot noemt een wereldnúmmer. | Stippenrij verdwijnt bij één opgave; donkere binnenlijn onder de gele ring; het diplomaslot noemt nu de wereldnaam en hoeveel werelden er nog te gaan zijn. De klikbare minispellen blijven met opzet — zie *Niet opgelost*. |

---

## Codebase

### Belangrijk

| # | Bevinding | Wat er gedaan is |
|---|---|---|
| B1 | De instellingen "Pip praat" en "Spreektempo" werden genegeerd zodra de app niet op de stal startte. | Al verwerkt vóór deze ronde: `src/ui/Instellingen.tsx` in de layout, dus elke route past ze toe. |
| B2 | Drie schermen renderden tijdens het prerenderen een andere toestand dan in de browser: `out/diploma/goud/index.html` bevatte "Nog even doorzetten 🔒", `out/kaart/index.html` 46× `aria-disabled`. | Al verwerkt: gedeelde `useToestandGeladen()`-hook op kaart, diploma en lesscherm; de datum in een effect. |
| B3 | De denk-timer van de bot werd nooit opgeruimd; "Nog een keer" tijdens het denken liet de bot een witte zet spelen in de verse partij. | Al verwerkt: `denkTimer`-ref, `stopDenken()`, `partijNr` waarmee de KidBot per partij opnieuw gemaakt wordt. |
| B4 | Een ander eigen stuk aantikken telde als fout, in zeven lessen — en drie zulke misgrepen houden de volgende les dicht. | Al verwerkt: in `runner.ts` wisselt de selectie nu, bij `move` en `regelZet`. |
| B5 | De blunderwaarschuwing ging af op een eerlijke ruil. | Al verwerkt: de terugslag wordt verrekend; de dode regels zijn weg. |
| B6 | 53 van de 76 antwoordlijsten hebben geen `bedoeling` en worden dus niet nagerekend — en niets meldde dat. | `nietNagerekend()` in `validate.ts`, en `npm run validate:content` zet het getal onder elke controle (`--details` voor de lijst). |
| B7 | `cache: 'force-cache'` op het manifest ondermijnde de netwerk-eerst-regel in `sw.js`. | Naar `no-cache`; de service worker doet de offlinedekking al. |

### Klein

| # | Bevinding | Wat er gedaan is |
|---|---|---|
| K1 | De sterrenrij in het minispelscherm liep na drie rondjes vol naast een getal dat doortelde. | Vervangen door "⭐ n gehaald". |
| K2 | Twee timers zonder opruiming in `MinispelScherm`. | Ref plus opruiming bij unmount en bij een nieuw rondje. |
| K3 | "Opnieuw" annuleerde de lopende doorschakeling niet, en `timers.current` groeide een hele les lang door. | Beide verholpen (`stopTimers` bij Opnieuw stond er al; afgelopen timers worden nu uit de lijst gehaald). |
| K4 | `kies()` werd tijdens de render aangeroepen. | Stond al goed: de aanroep zit in `volgendeFase`, een callback. |
| K5 | `shake` werd nooit teruggezet, dus dezelfde misser schudde maar één keer. | Verholpen in beide schermen. |
| K6 | De zettenteller van de partij klopte niet. | Al verwerkt vóór deze ronde. |
| K7 | Het genadebudget van de bot werd niet gereset. | Al verwerkt: `partijNr` in de `useMemo`. |
| K8 | Het veld heet `pogingen` maar bevat fouten. | Hernoemd naar `fouten`, overal. |
| K9 | `tapAntwoord` beantwoordde schaak/geenSchaak meetkundig, terwijl de `regelZet`-tak in hetzelfde bestand chess.js gebruikt. | Kruiscontrole toegevoegd: bij `schaak`/`geenSchaak` moet chess.js hetzelfde zeggen. |
| K10 | `sw.js`: `startsWith('/audio/')` breekt met een basispad, en `CACHE` veranderde nooit dus de opruiming ruimde niets op. | `includes` in plaats van `startsWith`, cachenaam met datum, en `layout.tsx` gebruikt nu ook het basispad voor manifest en icoon. |
| K11 | Fout antwoord op het rekenslot gaf geen terugkoppeling. | Zie L3. |
| K12 | `npm audit` niet schoon (postcss via next). | `overrides: { postcss: "^8.5.28" }`. `npm audit --omit=dev` is nu schoon. Zie *Niet opgelost* voor de rest. |
| K13 | De zoeker draait synchroon op de hoofdthread, ~800ms bij de sterkste bot. | Niet opgelost — zie hieronder. |

---

## Niet opgelost, en waarom

1. **K13 — de zoeker naar een web worker.** Dit is de enige bevinding die een echte
   architectuurwijziging vraagt: de zoeker moet in een worker, met een asynchrone
   `kies()`-interface waar `PartijScherm` en de tests op aangesloten worden. Dat is een
   eigen fase, niet iets om tussen de reviewbevindingen door te doen. `docs/05` noemt hem
   al. Bij de huidige diepte (800ms bij Bram, de sterkste) is het merkbaar maar niet stuk.

2. **K12 — de resterende `npm audit`-meldingen.** De productieafhankelijkheden zijn schoon
   (`npm audit --omit=dev`: 0). Wat overblijft is `esbuild` via `vite` via `vitest`: een
   ontwikkelserver-kwetsbaarheid die alleen speelt als je `vitest --ui` op een onvertrouwd
   netwerk draait, en die alleen op te lossen is met vitest 5 — een major upgrade. De
   opmerking in de review dat "een patch-bump van Next" het oplost klopte niet: npm wil
   voor postcss naar next@16, óók een breaking change. Vandaar de override.

3. **C21 — een promotiekeuzescherm.** De review gaf twee mogelijkheden; ik heb de
   goedkoopste genomen (de misleidende zin eruit) omdat onderpromotie voor deze doelgroep
   niet aan de orde is. Een keuzescherm zou bij élke promotie een extra tik kosten, ook bij
   de honderd keer dat het kind gewoon een dame wil.

4. **L17, derde punt — minispellen van gesloten werelden blijven klikbaar.** Dat is met
   opzet: een minispel is oefening, geen les, en er zit geen voortgang aan vast. De
   reviewer noemde dit zelf een reden om gesloten léssen duidelijker te maken, en dat is
   gebeurd (L7).

---

## Wat de reviewers zelf goed noemden

De zoeker klopt tot in het venster aan de wortel; de scheiding tussen de twee zetmotoren
houdt stand; er gaat nog steeds niets naar buiten (de enige `fetch` in de hele broncode gaat
naar het eigen domein, en in de gebouwde bundels staan geen externe hosts). Geen enkel scherm
scrolt horizontaal, op geen enkel formaat, in geen van beide thema's. Bordvelden zijn overal
ruim boven de 44px en exact vierkant. a1 is donker, h1 licht, wit onderaan — uit de pixels
gecontroleerd. Het donkere thema is een écht donker thema met eigen veldkleuren. En de
`bedoeling`-vangrail deed wat hij moest doen: de antwoordlijsten die hem hebben, zijn stuk
voor stuk narekenbaar en kwamen ook echt uit.

## Wat deze ronde heeft opgeleverd voor de vólgende

Drie nieuwe vangrails in `tests/content.test.ts`, allemaal geschreven naar aanleiding van een
bevinding die niemand automatisch kon vinden:

- geen enkele `regelZet` vanaf wereld 9 zet de speler zelf schaak;
- nergens staat een pion op rij 1 of rij 8 (**deze vond meteen drie fouten in bestaande lessen**
  die drie reviewers hadden gemist);
- vóór wereld 10 komt "mat" niet voor in een vraagtekst of een goed antwoord.

Plus: `stellingKlopt()` haalt elke gegenereerde minispelstelling door chess.js, en
`npm run validate:content` meldt voortaan hoeveel antwoorden er níet nagerekend worden.
Dat was precies de vangrail waar de schaakmeester om vroeg.
