# Zevenentwintigste review, 25 oktober 2026

**Oordeel: GO voor de code. Vóór de release moet nog `npm run audio:render` draaien, en Kaj
beslist of dat eerst moet.** Geen van de reviewers vond iets blokkerends. De belangrijke punten
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
| volgende commit | Bevindingen van de layout-reviewer |

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

## Na de review gebouwd, nog niet gereviewd

Stickers (punt 5, `c8c9236`):
- **Stal:** bovenaan een stickerplank per begonnen wereld, met het plaatje van de les. Tikken
  op een sticker laat Pip zeggen welke les het is of hoe je hem krijgt (`STICKER_HOE`).
- **Beginscherm:** de nieuwste stickers als plaatjes.
- **Beloning:** de sticker zelf.

Er is een unittest voor `stickerPlanken`. Dit gaat mee in de volgende review.
