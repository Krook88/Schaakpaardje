# Schaakmaatje — werkafspraken

Nederlandse schaakleer-app voor kinderen van 3 tot 10, met Pip het schaakpaardje.
Lees `PLAN.md` voor het waarom, `docs/` voor de uitwerking.

## De belangrijkste afspraak: review na elke fase

**Elke afgeronde fase gaat langs de review vóór er aan de volgende begonnen wordt.**
Niet aan het eind van de dag, niet "als het uitkomt", en niet pas als er drie fasen op
elkaar gestapeld liggen — dan is het geen review meer maar een archeologische opgraving,
en is de kans dat er iets mee gebeurt klein.

Een fase is afgerond zodra een samenhangend brok af is: een paar werelden, een nieuw
opgavetype, een nieuw scherm, of een technische laag zoals de zoeker of de offline-modus.

```
/release-review
```

Dat start de coördinator, die de schaakmeester, de layout-reviewer en de
codebase-reviewer laat kijken en er één oordeel van maakt. Zie `docs/11-releaseproces.md`.

### En dan de feedback verwerken

Een review die in `docs/reviews/` blijft liggen is weggegooid werk. Na elk rapport:

1. Werk de bevindingen af van **blokkerend** naar **klein**.
2. Wat je niet oplost, krijgt een regel in het rapport met de reden. Stilzwijgend
   overslaan mag niet.
3. Zet achter elke afgehandelde bevinding wat je gedaan hebt.
4. Pas daarna begint de volgende fase.

Bij tegenstrijdig advies weegt: **klopt het schaken** > kan een kind het bedienen >
is het mooi > is de code netjes. Een fout in de schaakregels is altijd blokkerend: wat
een kind hier verkeerd leert, moet het bij de club weer afleren.

## Commando's

```bash
npm run dev              # ontwikkelserver
npm run check            # typecheck + tests + content + build (draai dit vóór je pusht)
npm run doorloop         # de app spelen als kind (vereist een draaiende `npx serve out`)
npm run validate:content # alle stellingen en opgaven controleren
npm run audio:render     # Pip inspreken (vereist ELEVENLABS_API_KEY)
```

### Waarom er twee controles zijn

`npm run check` kijkt naar types, content en losse functies. Dat vangt veel — de
contentcontrole heeft echte fouten in stellingen en antwoorden gevonden — maar het
mist een hele soort fouten: die welke pas ontstaan als je de app gebruikt.

Vijf voorbeelden, allemaal echt gebeurd en allemaal ongehinderd door `check` heen:

| wat er misging | waarom `check` het niet zag |
|---|---|
| Het goede antwoord op een quiz werd fout gerekend | Het scherm tekende de antwoorden in een andere volgorde dan de lesmotor ze nakeek. Beide lijsten bestonden en waren geldig; het verschil zat in één woord in de JSX. |
| De opdracht verdween bij de eerste misser | Pas zichtbaar nadat je expres een fout maakt. |
| Een minispel had geen einde | Pas zichtbaar als je zes rondjes uitspeelt. |
| Pip ging schuil achter zijn eigen speldje | Alleen te zien, niet te meten. |
| Er werd naar een toren gevraagd voor die was uitgelegd | De stelling klopte, het antwoord klopte, alleen de didactische volgorde niet. |

`npm run doorloop` speelt de app daarom echt: het maakt expres een fout, speelt een
minispel uit, tikt een quizantwoord aan. Elke regel erin is geleerd van een van
bovenstaande fouten. **Gaat er iets stuk in dit soort gedrag, voeg dan een regel toe
aan de doorloop in plaats van alleen de fout te repareren** — anders komt hij terug.

Voor de laatste soort (didactische volgorde) is er wél een mechanische regel: de
contentcontrole weigert een aanwijsopgave die naar een stuk vraagt dat pas in een
latere wereld wordt uitgelegd. Zie `stukkenVroegGenoemd()` in `src/content/validate.ts`.

En wat geen van beide vangt: of een kind het leuk vindt. Daar is een kind voor nodig.

## Hoe het in elkaar zit

| Map | Verantwoordelijk voor |
|---|---|
| `src/engine` | Schaakregels en de zoeker. De rest van de app kent géén schaakregels. |
| `src/content` | Werelden, lessen en opgaven als data, plus de contentcontrole. |
| `src/lesson` | De lesmotor (vier fasen, hints, sterren) en het lesscherm. |
| `src/board` | Het bord: tik-tik, markeringen, toegankelijkheid. |
| `src/audio` | Pips stem en de bordgeluiden. |
| `src/play` | Partijen tegen de bots en de minispellen. |
| `src/progress` | Profielen, instellingen en voortgang (lokaal). |

### Twee zetmotoren, met opzet
- `engine/board.ts` rekent **meetkundig** waar een los stuk heen kan. Nodig voor de
  lessen: één paard op een leeg bord is volgens de officiële regels een ongeldige
  stelling, en chess.js weigert hem dus.
- `engine/game.ts` draait op **chess.js** en kent alle regels. Voor echte partijen en
  voor alles vanaf wereld 9 (schaak, mat, rokade).

Meng ze niet. Een opgave die met schaak te maken heeft, hoort een `regelZet` te zijn.

## Regels voor de content
- Alle lessen zijn **data**, geen code. Een nieuwe wereld hoeft de app niet te raken.
- **Antwoorden worden berekend, niet overgetypt.** Waar een antwoord uit de stelling
  volgt (veilige velden, het duurste stuk, de aanvaller, de matzet), laat je de engine
  het uitrekenen en leg je het in een test vast. Dat is niet uit netheid: de
  contentcontrole vond bij wereld 0 tot en met 6 negen echte fouten in mijn eigen werk,
  waaronder twee lopers die naar een veldkleur moesten waar ze nooit kunnen komen.
- Geen enkele opgave komt binnen als `npm run validate:content` klaagt.
- Domeincode en content zijn in het Nederlands. Dat is een keuze, niet een slordigheid:
  het scheelt vertaalfouten in een app die zelf over Nederlandse schaaktaal gaat.

## Wat je nooit doet
- Een release naar `main` zonder review (`main` publiceert naar schaakmaatje.nl).
- Mat of matbegrip eerder introduceren dan wereld 10. Het late uitstel ís de methode.
- Een opgave met één "juist" veld waar er meerdere goede zetten zijn.
- Een kind straffen: geen levens, geen game-over, geen nul sterren.
- Iets van een kind naar internet sturen.
