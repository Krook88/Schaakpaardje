# Zevenentwintigste review, 25 oktober 2026

**Oordeel: GO.** Vóór de release moet nog `npm run audio:render` draaien. Kaj doet dat. Geen van de reviewers vond iets blokkerends. De belangrijke punten
zijn opgelost of hieronder met een reden afgehandeld.

## Scope

Branch `claude/feedback-kind-van-vijf` bovenop `main` (`736eedf`). Vorige review:
`2026-10-23-zesentwintigste-review.md`.

Aanleiding: een ouder van een vijfjarige meldde vijf dingen.

1. Het bord staat te laag en "Verder" valt soms buiten beeld.
2. Niemand legt uit wanneer je op "Verder" mag tikken.
3. "Dat was de laatste" klinkt als de laatste opgave, terwijl het het laatste vinkje is.
4. Toetsvragen (quiz) kan ze niet lezen.
5. Ze vindt niet terug welke stickers ze heeft verdiend.

| Commit | Wat |
|---|---|
| `f4205d1` | Punt 1 t/m 4: het lesscherm past in het scherm, "Verder" wiebelt met een handje, nieuwe prijszinnen, de quiz wordt voorgelezen, doorloopregel `verderInBeeld` |
| `c8c9236` | Punt 5 (stickers) en de bevindingen van schaakmeester en codebase-reviewer |
| `c19b512` | Bevindingen van de layout-reviewer, eerste ronde |
| `34d894c` en de commit daarna | Bevindingen van de tweede ronde (stickers) |

## Reviewers

De coördinator kon zelf geen reviewers starten (geen Agent-tool in zijn sessie). Daarom zijn
schaakmeester, layout-reviewer en codebase-reviewer rechtstreeks gestart, alle drie op
`f4205d1`. De conversie-reviewer is niet gedraaid: er is geen pagina voor ouders veranderd.

- **Schaakmeester:** niets blokkerends. Het voorlezen verraadt het antwoord niet: de volgorde
  is geschud en elk antwoord wordt op dezelfde manier voorgelezen. Het maakt de toets eerlijker
  voor een kind dat niet leest.
- **Codebase:** niets blokkerends. Wel drie races rond spraak.
- **Layout:** niets blokkerends. Wel problemen op kleine telefoons en met reduced motion.

## Bevindingen

| | Bevinding | Status |
|---|---|---|
| S1 (belangrijk) | Een vroege tik stopt het voorlezen; na een fout heeft het kind de andere antwoorden nooit gehoord en gaat het gokken. | **Opgelost**: na tip en vraag leest Pip de antwoorden die nog over zijn opnieuw voor (`fouteKeuzes`, `zegTip(..., daarna)`). |
| S2 / L5 (belangrijk) | Oplichten in de accentkleur met vergroting leest als hint. | **Opgelost**: een luidsprekertje bij het antwoord en een neutrale `--ink`-rand, geen vergroting. |
| S3 (klein) | Notatie-antwoorden ("Pd4", "P") zijn uitgesproken een brij. | **Opgelost**: nieuw veld `uitspraak` op quizantwoorden, ingevuld in `w12-notatie.ts`. Dit veld wordt ook ingesproken. |
| S4 (klein) | "Klaar! En alles goed." en de schakerzinnen "Alles gevonden" en "Compleet" kloppen niet na een quiz of na een fout. | **Opgelost**: zinnen herschreven. |
| S5 / L3 (klein/belangrijk) | Pip zegt "de knop die wiebelt", maar met reduced motion wiebelt er niets en is de vervangende ring onzichtbaar (1,05:1). | **Opgelost**: de zin is nu "Tik dan op de grote knop onderaan"; de ring is `--ink`. |
| C1 (belangrijk) | Het voorlezen praat over de luidsprekerknop heen, en `stopSpeaking()` aan het eind kapt een herhaalde vraag af. | **Opgelost**: `spreekBeurt()` in `voice.ts`. De rij stopt zodra er een andere zin begint, en wist de ondertitel alleen als de laatste zin nog van de rij is (`wisOndertitel()`). |
| C2 (belangrijk) | Bij een vers geladen les houdt de browser geluid tegen. `VERDER_UITLEG` verdringt dan de eerste uitlegzin bij de eerste tik. | **Opgelost** voor de zin: alleen na `alGetikt()` en met de stem aan. **Niet opgelost**: vóór de eerste tik kan "Verder" al wiebelen terwijl er nog niets klonk. Voor de apparaatstem is niet betrouwbaar te meten of hij echt praat. Na de eerste tik klopt het wel. |
| C3 / L4 (belangrijk) | `VERDER_UITLEG` blijft in de ballon staan; met de stem uit vervangt hij de uitleg door een stille zin. | **Opgelost**: de ondertitel wordt gewist als de zin klaar is, en de zin wordt overgeslagen als de stem uit staat. |
| C4 (klein) | Een vaste wachtgrens van 15 s laat een kind bij een stem die nooit "klaar" meldt lang wachten. | **Opgelost**: de grens hangt af van de zinslengte en het tempo. |
| C5 (klein) | Het voorlezen kan op de vraag vooruitlopen, en bij geblokkeerd geluid flitsen de knoppen voorbij. | **Deels**: de instellingen worden pas na 700 ms gelezen, en zonder eerste tik wordt niet voorgelezen. Een manifest dat langer dan 700 ms laadt kan de vraag nog afkappen. Dat is zeldzaam (alleen bij hervatten midden in een quiz op een trage verbinding) en is niet gerepareerd. |
| C6 | Na een fout wordt niet opnieuw voorgelezen. | **Opgelost**, zie S1. |
| C7 (klein) | "Opnieuw" zegt de vraag niet als die al in de ballon stond. | **Opgelost**: dan spreekt "Opnieuw" de vraag zelf uit. |
| C8 (klein) | Eén frame wiebelen als Pip verschijnt. | **Opgelost**: Pip meldt `pratend` pas na de eerste keer praten; "Nog eens kijken" zet het terug. |
| C9 / L11 (klein) | De doorloopregel was te zwak. | **Opgelost**: per maat wachten op het handje, 360×640 erbij, een overlapcontrole voor Verder over het bord, en het opgavescherm wordt gemeten. Nieuwe regel `quizWordtVoorgelezen`: een tik halverwege telt goed en het luidsprekertje verdwijnt. |
| C10 | De nieuwe zinnen zijn nog niet ingesproken. | **Open, voor Kaj**: `npm run audio:render` (kost credits). Tot dan spreekt de apparaatstem ze uit. |
| L1 (belangrijk) | Op 360/375 werd het bord kleiner dan voorheen (ondergrens 300 px) en scrolde de pagina toch. | **Opgelost**: de ondergrens is de schermbreedte (tot 340 px), en onder 700 px schermhoogte verdwijnt de wereldband (de achtergrondkleur blijft). De uitleg past nu op 360×640. In de opgave valt "Opnieuw" op 360×640 nog onder de vouw. Dat is bewust zo gelaten: "Help me even" staat in beeld en een opgave schakelt vanzelf door. |
| L2 (belangrijk) | De sticky Verder-rij viel over de onderste rij van het bord. | **Opgelost** met L1. De doorloop controleert nu op overlap. |
| L6 (klein) | Het handje schoof over de knop. | **Opgelost**: 14 px marge. |
| L7 (klein) | Wiebelen en handje liepen eindeloos naast elkaar. | **Opgelost**: de knop wiebelt vier keer, daarna wijst alleen het handje. |
| L8 (klein) | Groot leeg vlak tussen bord en Verder op lange telefoons. | **Opgelost**: het bord staat in het midden van het vlak. |
| L9 (klein) | Liggend is de knoppenrij breder dan het bord. | **Niet opgelost**: de bordmaat komt uit een container query die de rij erbuiten niet kan lezen. Het is cosmetisch en de knop blijft in beeld. |
| L10 (klein) | De bolletjes van de teller braken af op één losse bol. | **Opgelost**: kleiner en dichter op elkaar onder 420 px (`Teller.module.css`). |

## Tweede ronde: stickers (`c8c9236`) en de layoutfixes (`c19b512`)

Aanleiding punt 5: de stickers bestonden alleen als getal ("Plus 5 stickers"). Wat er gebouwd is:
- **Stal:** bovenaan een stickerplank per begonnen wereld.
- **Beginscherm:** de nieuwste stickers.
- **Beloning:** de sticker zelf.

Een sticker is overal hetzelfde ronde plaatje als dat van de les, in de kleur van zijn wereld.
Gereviewd door schaakmeester, codebase-reviewer en layout-reviewer. Geen van de drie vond iets
blokkerends.

| | Bevinding | Status |
|---|---|---|
| S6 (belangrijk) | `STICKER_HOE` ("Haal drie sterren") was een opdracht om perfect te zijn, de enige in de stal. Hints tellen mee in de sterren, dus een kind kon leren dat je beter geen hulp vraagt. De zin klopte ook niet voor een les die nog dicht zat. | **Opgelost**: de zin is nu een uitnodiging ("…als de toets in één keer lukt. Dat mag ook later nog.") en er is een eigen zin voor een dichte les (`STICKER_NOG_DICHT`). |
| S7 (belangrijk, zat er al) | In notatie-2 gaf een 🐴 naast de P het antwoord weg. | **Opgelost**: neutrale bolletjes. |
| S8 (klein) | "Wat is schaakmat?. Die heb je!" | **Opgelost**: `STICKER_HEB_JE` noemt geen titel. |
| S9 (klein) | "Helemaal goed gedaan" komt ook na een fout. | **Opgelost**: "Top! Goed gedaan." |
| S10 (klein) | Klinkt "d vier" goed? | **Open**: luisteren na `audio:render`. Klinkt het verkeerd, dan wordt het "dee vier" in `uitspraak`. |
| S11 / C-K4 (klein) | Een sticker van een les die niet bestaat telde mee. | **Opgelost**: `geldigeStickers()` met test. |
| C-B1 (belangrijk) | Met "Pip praat" uit bleef een tik op een sticker of een vak in de stal meestal stil, omdat twee sprekers elkaar afbraken. | **Opgelost**: één spreker per tik (`tikOp`, `spreekNaTik`). |
| C-K1 (klein) | Het beurtnummer werd pas na de `await` vastgelegd. | **Opgelost**, ook bij `VERDER_UITLEG`. |
| C-K2 (klein) | Na twee fouten las Pip alleen het goede antwoord voor, en dat is aanwijzen. | **Opgelost**: met nog één antwoord over leest Pip niets voor. |
| C-K3 (klein) | De uitspraak werd op twee plekken berekend. | **Opgelost**: `uitspraakVan()` in `types.ts`. |
| C-K5 (klein) | De doorloop testte opnieuw voorlezen na een fout niet. | **Opgelost**: de doorloop tikt nu eerst fout en controleert dat het foute antwoord niet meer voorgelezen wordt. Dat een tik op de luidspreker het voorlezen stopt, zit er niet in: in de testbrowser is het voorlezen te snel voorbij om daar betrouwbaar tussen te tikken. |
| C-K6 (klein) | Weinig dekking op `stickerPlanken`. | **Opgelost**: twee gevallen erbij. |
| L-B1 (belangrijk) | Lange titels liepen tot 15 px over het stickervak. | **Opgelost**: het vak groeit mee, de naam is hooguit drie regels. Gemeten op 360×640: 0 van 15 lopen eroverheen. |
| L-B2 (belangrijk) | Op het beginscherm stonden losse plaatjes in plaats van stickers. | **Opgelost**: dezelfde ronde sticker als in de stal, maar kleiner. |
| L-K1 (klein) | `aria-label` op een `div` zonder rol werd genegeerd. | **Opgelost**: `role="img"`. |
| L-K2 (klein) | Op 360/375 zijn de bordvelden 41–42 px, net onder 44. | **Niet opgelost**: met een kleinere zijmarge wijkt het lesscherm af van de rest van de app, en het verschil is 2 px. Het was 37,5 px. |
| L-K3, L-K4 | L9 en "Opnieuw" onder de vouw op 360/375. | Bewust zo gelaten, zie de eerste ronde. |
| L-K5 (klein) | Van de beloning was geen weg naar de stal. | **Opgelost**: de sticker is een link naar `/stal/#stickers`. |

Daarna: `npm run check` groen (508 tests), `npm run doorloop` 20 van 20.

## Derde ronde: spelontwerper (nieuwe reviewer)

Kaj vroeg om een echte maker van kinderspellen. Daarvoor is er een nieuwe agent,
`.claude/agents/spelontwerper.md`. De eerste spelontwerper speelde de vijf oplossingen als
vijfjarige "Lot", met een nagebootste stem zodat de timing te meten was. Daarnaast speelt
een tweede, onafhankelijke spelontwerper de hele app; zijn uitslag volgt hieronder in een
eigen ronde.

Oordeel: niets blokkerends. "Zou ik aan speltesters geven", maar eerst G1 en G2.

| | Bevinding | Status |
|---|---|---|
| G1 (belangrijk) | Midden in de les zei Pip "Klaar! Goed gedaan." "Klaar!" is ook de kop van het beloningsscherm, dus het klonk weer als het einde van de les. | **Opgelost**: "Gelukt! Goed gedaan." |
| G2 (belangrijk) | Na de eerste sticker zei de stal "Je hebt er 0 van de 16", en op het beginscherm stond "Nog leeg" met de sticker eronder. | **Opgelost**: een eigen zin als er stickers zijn maar nog geen stukken (`STAL_ALLEEN_STICKERS`), en geen "Nog leeg" naast stickers. |
| G3 (belangrijk) | Via de sticker binnengekomen: Pip stond uit beeld, zei een algemene zin, en niets liet zien welke sticker nieuw was. | **Opgelost**: de link is nu `/stal/?nieuw=<les>` en scrolt niet. Pip zegt "Daar is hij!" en de nieuwe sticker springt en krijgt een gouden rand. Er is een doorloopregel voor. |
| G4 (belangrijk) | 🔊 op het voorgelezen antwoord leek "tik om te horen", maar een tik kiest dat antwoord. | **Opgelost**: een praatwolkje 💬. |
| G5 (belangrijk) | Na een tik op de luidspreker in Pips ballon kwam alleen de vraag terug, niet de antwoorden. | **Opgelost**: Pip heeft een `onHerhaal`, en daarna leest hij de antwoorden opnieuw voor. |
| G-K1 (klein) | Het handje wees ook bij schakers. | **Opgelost**: geen handje in modus schaker. |
| G-K2 (klein) | Tijdens het voorlezen verdween de vraag uit de ballon. | **Opgelost**: `speak(..., { ondertitel: false })`. |
| G-K3 (klein) | "of …?" bij het laatste antwoord. | **Niet nu**: dat zijn nieuwe zinnen voor elke quiz. Eerst horen hoe het met opnames klinkt. |
| G-K4 (klein, bestond al) | Bij opgaven met meerdere velden breekt elke tik de lof van de vorige af. | **Niet in deze PR**: dat is een ander gedrag dan waar deze PR over gaat. Het staat op de lijst voor de volgende fase. |
| G-K5 (klein, bestond al) | Pip zwijgt op het beginscherm direct na "Beginnen". | **Niet in deze PR**, staat op de lijst voor de volgende fase. |
| G-K6 (klein) | Vanuit de stal is er geen "verder spelen". | **Niet nu**: het beginscherm is één tik terug, en daar staat "Verder leren". Wordt opnieuw gewogen bij de onafhankelijke review. |

Daarna: `npm run check` groen (508 tests), `npm run doorloop` 21 van 21.

## Vierde ronde: spelervaring als geheel (`79e48a7` en verder)

Kaj vroeg om de spelontwerper onafhankelijk naar het hele spel te laten kijken. Diens
bevindingen B1–B8 en de kleine punten zijn verwerkt in `79e48a7`. Daarna keken alle vijf de
reviewers. Hieronder staan schaakmeester (S), codebase (C) en conversie (V). Layout en de
spelontwerper werden door een tijdslimiet onderbroken en zijn hervat; hun uitslag volgt.

**Wat er in `79e48a7` veranderde**
- Een les is gedaan bij één ster (`LES_GEDAAN_BIJ`), met "Nog een keer" voor de toets.
- Geen hoefijzerbelofte meer; "Nieuw in je stal!" op de beloning en na een gewonnen partij.
- Op het doel tikken en slepen werken.
- Hulp na 3 en 5 missers.
- Stille tussentikken.
- Pip reageert in partijen.
- De veilige knop bij de blunderwaarschuwing is de opvallende.
- "Schaak" pas na wereld 9.
- "Ik ken de stukken al" voor schakers.
- De bel, de eindknoppen, de verlies-telling (naar het ouderscherm) en tekstpunten.

| | Bevinding | Status |
|---|---|---|
| S1 / C1 (**blokkerend**) | In een zetopgave met een vast stuk werd een zet met een ander stuk goed gerekend. "Speel Pf3" nam de pion f2-f3 aan, ook in de toets (notatie-2, notatie-3, koning-2). | **Opgelost** (`d589491`): bij de zet telt alleen het vaste stuk; van gedachten veranderen kost geen fout. Een test speelt elke zetopgave na met elk ander eigen stuk, en die test faalt aantoonbaar zonder de reparatie. |
| S-K1 (klein) | Op Notatie-eiland koos een tik op het doel vanzelf het stuk, terwijl dat juist de lesstof is. | **Opgelost**: automatisch kiezen bij een zetopgave alleen als er één eigen stuk staat. |
| S2 (belangrijk) | "Verder leren" na de verste les kon Torenburcht overslaan. | **Opgelost**: weer de vaste volgorde. Alleen na "Ik ken de stukken al" begint het later (instelling `beginWereld`). Er is een test voor. |
| S3 (belangrijk) | Bij één ster is er geen vangnet voor mat. | **Opgelost**: de poort naar Matklif vraagt twee sterren op de laatste schaakles (`POORT_NAAR_MAT`), met een test. De beloning verbergt dan "Volgende les" en Pip zegt `MAT_POORT`. De opfrisser met voorrang voor lessen met één ster is **niet gedaan**: de opfrisser weegt de moeite al mee. |
| S4 (belangrijk) | "Ik laat het even voor", terwijl er niets werd voorgedaan. | **Opgelost**: na vijf missers wijst Pip het antwoord echt aan (bij een zet het doelveld), met de zin `VOORDOEN`. |
| S5 / C2 (belangrijk) | Slepen in een aanwijsopgave kostte een fout. | **Opgelost**: Board-prop `sleep='veld'` in lessen, opfrisser en minispel. |
| S6 (belangrijk) | "Kijk eens in je stal!" ook als er niets nieuws in stond. | **Opgelost**: `WERELD_AF_STAL` alleen als er iets nieuw is. |
| S-K (klein) | Hulpaanbod in de toets; "Goed gezien!" bij elke slagzet; "zet hem gauw veilig"; onderpromotie zei "schaak"; "bijna aan de overkant" al op de zesde rij. | **Allemaal opgelost.** |
| C3 (belangrijk) | De bel kon geluid aanzetten dat de ouder had uitgezet, ook voor een ander profiel. | **Opgelost**: de bel onthoudt per kind wat er vóór zijn tik stond en zet alleen dat terug. Het ouderscherm wist die herinnering. Als de ouder Pip al had uitgezet, zegt de bel niets. |
| C4 (klein) | Losse eindjes bij slepen. | **Opgelost**: pointer capture, een kortere klikpauze en een timer die wordt opgeruimd. De doorloop sleept nu ook met een vinger (CDP touch). |
| C5 (klein) | Een leeg veld telt nu als misser. | **Zo bedoeld**: een tik op het doel is een zet, en een zet naar een veld waar het stuk niet kan komen is een misser, net als met tik-tik. |
| C6 (klein) | "Nog een keer" telde als afhaken en als tweede "Les af". | **Opgelost**: `alAf`. |
| C7 (klein) | `'schaak-1'` stond los in de code. | **Opgelost**: `SCHAAK_LES` in `src/content/index.ts` (niet in voice.ts, want dan wordt het ingesproken), met test. Overal `schaakZinnen()`. |
| C8 / V3 (klein) | Docs en STER2 noemden nog twee sterren. | **Opgelost.** |
| V1 (klein) | "Ik ken de stukken al" niet na een gastles. | **Opgelost**: de knop verschijnt zolang er buiten De Weide nog niets gedaan is. |
| V2 (klein) | Geen zicht op het gebruik van die knop. | **Opgelost**: een losse telling `Stukken overgeslagen`, in beide vaste lijsten. |

Daarna: `npm run check` groen (516 tests), `npm run doorloop` 23 van 23.

## Wat nog moet vóór de release

`npm run audio:render`. Kaj heeft credits en draait het. Luister daarbij naar "d vier" (S10).
