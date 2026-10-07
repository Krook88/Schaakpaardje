# Zesde review: kan een kind dat Pip volgt er altijd uit?

**Datum** 7 oktober 2026 · **Beoordeeld op** `df075dd` · **Verwerkt in** `94d4e8c` t/m `c7ba081`
**Vorige review** `docs/reviews/2026-09-08-vijfde-review.md`, commit `2a8c334`

## Oordeel

**GO voor deze zip. NO-GO voor de volgende fase** tot de vier didactische blokkerende
punten onderaan besloten zijn.

De zip is op elk punt beter dan wat er nu live staat, en hij haalt een muur weg: sinds
5 september kon geen kind voorbij les 24 van 49 (en passant). Alle blokkerende punten
over schaakregels, vastlopen, vormgeving en vindbaarheid zijn opgelost. Wat blokkerend
openstaat is didactiek: een zin die niet waar is, een les die niet toetst, en twee
woorden die gebruikt worden voor ze uitgelegd zijn. Die staan er live ook, en ze vragen
keuzes van Kaj, geen haastwerk.

## Hoe deze review tot stand kwam

Dit keer wel met echte, parallelle reviewers, zes in totaal: de schaakmeester, de
layout-reviewer, de codebase-reviewer, en drie die Kaj er voor deze ronde bij vroeg: een
leer-reviewer (didactiek, vergeleken met Stap 1), een leerling (speelt de app als
beginner) en een SEO-reviewer. Twee bouwden in een eigen worktree, zodat ze elkaars
`out/` niet overschreven.

Daarnaast een eigen controle, en die vond het meeste: **het kind dat alleen doet wat Pip
aanwijst**. Pip belooft dat zijn hint altijd bij het antwoord eindigt; daarom heeft de
app geen overslaanknop. Die belofte is nagespeeld voor alle 264 lesopgaven en 13.500
minispelrondjes, via dezelfde `tik()` die het scherm gebruikt. Hij hield op vier
plekken niet. Dat is nu `tests/pip-volgen.test.ts`.

Een les uit deze ronde: de leerling-reviewer speelde `pion-5` en noemde het "de best
gemaakte les die ik tegenkwam". Hij was onoplosbaar. Twee reviewers vonden het wel
(de schaakmeester en de leer-reviewer), allebei door de zet door de lesmotor te halen in
plaats van naar het scherm te kijken.

| Controle | Uitkomst na verwerking |
|---|---|
| `npm run check` | groen: 206 tests (was 182), content in orde, build |
| `npm run doorloop` | 5 van 5 |
| Pip volgen, alle lesopgaven en 3600 minispelrondjes | 0 vast (was 4 soorten) |
| Onmogelijke stellingen | 0 (was 2 in de lessen, 36% van mat-in-1-regen) |
| og:image op indexeerbare pagina's | 52 van 52 (was 1) |
| Na "Beginnen" op 390×664 | scrollY 0, naam in beeld (was 1785) |

---

## Eigen controle: Pip volgen

| | Ernst | Bevinding | Status |
|---|---|---|---|
| P1 | blokkerend | `pion-5`: de goede en-passantzet wordt fout gerekend. `tikRegelZet` had geen tak voor de eis; `goedeZetten` wel. Les 24 van 49, daarna niets meer open in de modi pip en leerling. | **Opgelost** `94d4e8c`: één `voldoetAanEis()` voor kind, hint en contentcontrole. |
| P2 | blokkerend | Pionnenspel: 16% van de rondjes kan nooit (eigen pion in de lijn), tipje wijst niets aan. | **Opgelost** `94d4e8c`: hele lijn vrij. |
| P3 | belangrijk | Schaak-alarm: hint wijst promotie tot paard aan, bord maakt een dame, kruisje. | **Opgelost** `94d4e8c`: alleen damepromoties. |
| P4 | belangrijk | `toren-3` toets: na de eerste slag stuurt de hint de toren eindeloos tussen g1 en h1. Diepte-eerst zoeken gaf elke keer een andere route. | **Opgelost** `94d4e8c`: breedte-eerst, met compacte toestand (de eerste versie was 240× trager; nu 1,3 ms per stelling). |

## Schaakmeester

| | Ernst | Bevinding | Status |
|---|---|---|---|
| B1 | blokkerend | En passant onoplosbaar. | **Opgelost**, zie P1. |
| B2 | blokkerend | Twee onmogelijke stellingen in `mat-2`: zwart staat al schaak, wit aan zet. | **Opgelost** `94d4e8c`: vervangen door nagerekende stellingen; contentcontrole weigert ze nu. |
| B3 | blokkerend | Minispellen maken onmogelijke stellingen: mat-in-1-regen 32 tot 36%, tactiekduel 3%, schaak-alarm 0,5%. | **Opgelost** `94d4e8c`: `wachtendeStaatSchaak()` in alle generatoren met twee koningen. |
| B4 | blokkerend | Pionnenspel onoplosbaar. | **Opgelost**, zie P2. |
| I1 | belangrijk | De lesmotor keurt elk schaak goed, ook een dat je dame weggeeft; `goedeZetten` verbiedt dat juist. | **Open, bewust.** De les leert nergens dat een schaakstuk veilig moet staan. Strenger nakijken zonder die uitleg geeft een kruisje voor precies wat Pip vroeg. Hoort in de didactiekfase: vertelzin, fouttip en nakijken samen. |
| I2 | belangrijk | `goedeZetten` rekende elke promotie als dame na ("g8=N is mat"). | **Opgelost** `94d4e8c`. |
| I3 | belangrijk | Botladder omgekeerd: Rens wint 12-0 van Bas, die erna komt. | Open: volgende ronde. Ladder opnieuw uitspelen en een test die hem vasthoudt. |
| I4 | belangrijk | Oscar belooft drie zetten vooruit, zoekt er twee. | Open: met I3. |
| I5 | belangrijk | Blunderwaarschuwing in samen-modus staat voor zwart omgekeerd. | Open: in deze ronde niet nagemeten. Eerst naspelen, dan repareren. |
| I6 | belangrijk | "Breng hem in veiligheid": 75 tot 86% van alle zetten is goed. | Open: didactiekfase. |
| I7 | belangrijk | `eindspel-1` leert de koning, toetst de oppositie. | Open: didactiekfase. |
| I8 | belangrijk | `laatste-pion`: een schuine slag kan de pion laten vastlopen, zonder uitweg. | **Opgelost** `94d4e8c`: een pion die het doel niet meer haalt begint opnieuw. |
| K1 | klein | `mat-2` fouttip "zorg dat je dame gedekt staat" is onwaar. | **Opgelost** met B2. |
| K2 | klein | Bram "speelt altijd zijn beste zet", maar het genadeplafond geldt ook voor hem. | Open: met I3. |
| K3 | klein | Eindspel: "laat je koning meelopen als schild", maar de koning is niet bespeelbaar. | Open: didactiekfase. |
| K4 | klein | Notatie zonder `x`, `+`, `O-O`. | Open: didactiekfase (= L9). |
| K5 | klein | Pionnenspel tegen Mila kan op mat eindigen, uitleg zegt "wie de overkant haalt". | Open: volgende ronde. |
| K6 | klein | "Vastzitten" betekent een geblokkeerde pion én een gepend stuk. | Open: tekst, didactiekfase. |
| K7 | klein | Bij `move` met `from` kost de eerste tik op een ander stuk al een fout. | Open: volgende ronde. |

## Leer-reviewer (didactiek, vergeleken met Stap 1)

| | Ernst | Bevinding | Status |
|---|---|---|---|
| L1 | blokkerend | En passant onoplosbaar. | **Opgelost**, zie P1. |
| L2 | **blokkerend** | Wereld 9: "precies dezelfde drie als op de Aanvalsberg". Niet waar: dekken helpt een koning nooit, en ertussen zetten is in wereld 8 nooit geoefend. | **Open: Kaj beslist.** Een zin die Pip uitspreekt, dus nieuwe opname; en de echte oplossing is een les "er tussen" in wereld 8. |
| L3 | **blokkerend** | "Uit schaak: drie manieren" kan niet fout: 100% van de zetten die het bord aanbiedt is goed. | **Open: Kaj beslist.** Vraagt een nieuwe eis per manier. |
| L4 | belangrijk | `dame-3` laat paardsprongen narekenen, één wereld te vroeg. | Open: didactiekfase. |
| L5 | belangrijk | Rokadevoorwaarden alleen met woorden getoetst. | Open: nieuw opgavetype `magHet`. |
| L6 | belangrijk | Ruilen nergens aan een bord; minispel "weegschaal" heeft geen weegschaal. | Open: didactiekfase. |
| L7 | belangrijk | Pat en remise alleen gepraat. | Open: didactiekfase. |
| L8 | belangrijk | Oppositie op een bord zonder tegenstander. | Open: didactiekfase. |
| L9 | belangrijk | Notatie gelezen, nooit geschreven; "schrijf-de-zet" heet in de app "Zoek het veld". | Open: didactiekfase. |
| L10 | belangrijk | `/over/` belooft "elke wereld eindigt met de opdracht om het met papa, mama of de juf te spelen". Die opdracht bestaat niet. | Open: **een publieke belofte die niet klopt**, eerst in de didactiekfase. Vijftien zinnen. |
| L11 | belangrijk | Voor een echte partij mist: wie begint, de koning stapt nooit in gevaar, een gepend stuk mag niet weg. | Open: didactiekfase. |
| L12 | belangrijk | Wereld 3 te dik, wereld 13 te dun; zilver mist twee Stap 1-lessen. | Open: didactiekfase. |
| L13 | belangrijk | Een negenjarige begint op "tik de vier donkere velden". | Open: didactiekfase. |
| L14 | belangrijk | Tiklast omgekeerd met leeftijd: `dame-1` 48 tikken, 27 in één opgave. | Open: didactiekfase. |
| L15 | klein | 35 van 96 quizzen zijn een muntworp. | Open: als regel in `validate.ts`. |
| L16 | klein | Quizafleiders met woorden uit latere werelden. | Open: hoort bij A1. |
| L17 | klein | De beginstelling komt pas in les 25. | Open: didactiekfase. |
| L18 | klein | Wereld 7 vraagt aftrekken vanaf 6 jaar. | Open: didactiekfase. |
| L19 | klein | Toetsopgaven die de oefenopgave letterlijk herhalen. | Open: als regel in `validate.ts`. |
| L20 | klein | De opfrisser is goed en onvindbaar. | Open: didactiekfase. |
| L21 | klein | `docs/03` loopt achter op de app. | Open: met de didactiekfase bijwerken. |

## Leerling

| | Ernst | Bevinding | Status |
|---|---|---|---|
| 1 | **blokkerend** | De allereerste opdracht vraagt om "de onderste rij" voor "rij" is uitgelegd, op een leeg bord zonder aanwijzing. `weide-2` lost precies dit op met `wijs`; `weide-1` niet. | **Open: Kaj beslist.** Bovenaan de didactiekfase. `wijs` kost geen opname; de zin aanpassen wel. |
| 2 | **blokkerend** | `mat-3` toetst op "remise", een woord dat Pip nooit zegt. | **Open: Kaj beslist.** Eén zin erbij, nieuwe opname. |
| 3 | belangrijk | De algemene fouttip zegt "kijk waar het stuk heen mag" op een leeg bord. | Open: didactiekfase. |
| 4 | belangrijk | 42 quizzen zonder fouttip, en bij een quiz geen hulpknop. | Open: didactiekfase. |
| 5 | belangrijk | "Wit rechts" op een bord zonder wit veld. | Open: didactiekfase. |
| 6 | belangrijk | Dat jij wit bent wordt nergens verteld. | Open: didactiekfase. |
| 7 | belangrijk | Bij één ster: "nog eentje proberen?" zonder knop daarvoor. | Open: volgende ronde, scherm. |
| 8 | belangrijk | Fouttips in wereld 8 noemen veldnamen; de coördinaten staan daar uit. | Open: didactiekfase. |
| 9 | belangrijk | "Bestrijkt" voor het eerst in een fouttip. | Open: hoort bij A1. |
| 10 tot 19 | klein | "Spekkoper", "ontwikkelen", "vluchtvelden", "dekken" als antwoord voor het uitgelegd is, "aan zet" niet uitgesproken, "pat" als afleider, een wereld op slot zegt niets, "de belangrijkste" zonder waarom, "na elke zet van je tegenstander", "maatje" naast "tegenstander". | Open: didactiekfase. |

## Layout-reviewer

| | Ernst | Bevinding | Status |
|---|---|---|---|
| 1 | blokkerend | Na "Beginnen" blijft de scrollpositie staan; het kind begint halverwege. | **Opgelost** `52ee33c`. Nagemeten: 1785 naar 0. |
| 2 | belangrijk | Ankerlink "Beginnen" werkt pas na hydratie. | **Opgelost** `52ee33c`. Werkt nu ook zonder JavaScript. |
| 3 | belangrijk | De lesuitleg flitst 100 tot 420 ms in beeld. | Open: volgende ronde. Een lesskelet in plaats van een ander scherm. |
| 4 | belangrijk | Rondleiding tussen Pip en de knop; "0 van de 147 sterren" (A12). | Open: volgende ronde. |
| 5 | belangrijk | Hintring in het donkere thema 1,3 tot 1,9:1; `--sel` niet gezet in donker. | Open: volgende ronde, eerste kandidaat. Alleen CSS. |
| 6 | belangrijk | Minispel open op de kaart terwijl de lessen ervoor op slot zitten. | Open: volgende ronde. |
| 7 | belangrijk | Lege naam wordt stilletjes "Schaker". | Open: volgende ronde. |
| 8 tot 15 | klein | Luidsprekerknop 46 px, geen `h1`/`main`, focusring op de stalkaart, blauwe vinkjes, ongelijke knoppenrijen, `/lessen/` met tikdoelen van 19 px, de lege stal, witte schermafbeeldingen in donker thema. | Open: volgende ronde. |

## Codebase-reviewer

| | Ernst | Bevinding | Status |
|---|---|---|---|
| 1 | belangrijk | Afgebroken zin galmt na op het volgende scherm. | **Opgelost** `c7ba081`, met test. |
| 2 | belangrijk | De SEO-constructie heeft geen vangrail. | Open: volgende ronde, regel in de doorloop. |
| 3 | belangrijk | Wie alles af heeft, wordt naar les 1 gestuurd. | Open: vraagt een afgerond-scherm, dus een ontwerpkeuze. |
| 4 | belangrijk | "Welke zinnen worden ingesproken" op drie plekken, drie getallen. | Open: volgende ronde. |
| 5 | belangrijk | `audio-dekking` kan uit 3 van de 52 aanroepen een zin halen. | Open: volgende ronde. |
| 6 | belangrijk | FAQ met de hand dubbel bijgehouden. | Open: volgende ronde. |
| 7 | belangrijk | `opgave` gebruikt voor hij bestaat. | **Opgelost** `c7ba081`. |
| K1 | klein | Punt kwijt op `/over/`. | **Opgelost** `fcced97`. |
| K2 | klein | Dubbel commentaar in `Thuis`. | **Opgelost** `52ee33c`. |
| K3 | klein | `#beginnen` niet in de HTML. | **Opgelost** `52ee33c`. |
| K4 tot K13 | klein | `noindex` op zeven plekken, `BASIS` vijf keer, `sfx.ts` met het patroon dat `voice.ts` afraadt, fragiele hoofdscriptdetectie, geen linter, `kies([])`, `live-check` en `/404/`, ongememoïseerde `pipZinnen`, hervatpunt tegen de verkeerde lijst, reactielus drie keer. | Open: volgende ronde. |

## SEO-reviewer

| | Ernst | Bevinding | Status |
|---|---|---|---|
| B1 | blokkerend | 51 van 52 pagina's zonder deelplaatje. | **Opgelost** `fcced97`. Nagemeten: 0 van 52. |
| B2 | blokkerend | 22 van 49 lestitels bevatten geen woord dat een ouder intypt. | Open: inhoudsfase, een veld `zoekvraag` per les. 49 zinnen handwerk. |
| B3 | belangrijk | Lespagina's te dun (mediaan 533 tekens). | Open: inhoudsfase. |
| B4 | belangrijk | Lespagina's linken niet naar elkaar. | Open: inhoudsfase. |
| B5 | belangrijk | 404 Engels, tegenstrijdige robots. | **Opgelost** `fcced97`. |
| B6 | belangrijk | Geen redirect naar https en zonder www. | **Open, bewust.** Alleen live te testen, en verkeerd ingesteld geeft het een redirectlus die de hele site platlegt. Eerst de `curl`-regels uit het SEO-rapport. |
| B7 | belangrijk | `/` en `/over/` dezelfde omschrijving. | **Opgelost** `fcced97`. |
| B8 | belangrijk | `/lessen/` twee keer de merknaam. | **Opgelost** `fcced97`. |
| B9 | belangrijk | Geen PNG-icoon voor iOS. | Open: volgende ronde. |
| K1 tot K9 | klein | `lastmod` bij elke build nieuw, `h2` voor `h1`, te lange omschrijvingen, `h1`, `og.png` zonder beeld, compressie mogelijk niet op `text/javascript`, `sw.js` een jaar in de cache, `index.txt` crawlbaar, README zegt 47 lessen. | Open: volgende ronde; de twee `.htaccess`-punten pas na een live controle. |
| G1 tot G5 | | Geen wereldpagina's, geen pagina over leeftijd, Stappenmethode of scholen. | Open: inhoudsfase. |
| | | `docs/05` en `docs/08` noemen Plausible en Matomo nog als analytics. Dat stuurt iets van het kind naar internet. | Open: docs bijwerken, anders bouwt iemand het later alsnog in. |

---

## Wat Kaj moet beslissen voor de volgende fase

Vier blokkerende didactische punten, en ze raken allemaal ingesproken zinnen:

1. **`weide-1`, de allereerste opdracht**: aanwijzen waar "onderaan" is (`wijs`, geen
   opname), en eventueel de zin zonder "rij" (wel opname).
2. **`mat-3`**: één zin erbij die "remise" uitlegt.
3. **Wereld 9, "precies dezelfde drie"**: de zin eerlijk maken, of een les "er tussen" in
   wereld 8 toevoegen zodat hij waar wordt.
4. **"Uit schaak" kan niet fout**: per manier een eigen opdracht.

En één publieke belofte op `/over/` die de app niet waarmaakt (L10).

## Opname nodig na deze zip

Eén nieuwe zin, in `mat-2`:
"Er zijn twee goede zetten. Geef schaak op de bovenste rij, dan kan hij nergens heen."
Tot die is ingesproken klinkt hij in de apparaatstem. `npm run live` noemt hem.
