# Zeventiende review, 17 oktober 2026

Scope: `1822d7d..654a281` op `claude/vindbaarheid-uitleg`. Het gaat om vindbaarheid en de
schaakregelpagina's:
- **Nieuwe pagina's:** `/schaakregels/` met twaalf uitlegpagina's met bewegende borden (`src/content/schaakregels.ts`, `src/uitleg/`, `src/app/schaakregels/`).
- **Startpagina:** een bewegend bord.
- **Les- en regelpagina's:** JSON-LD.
- **Sitemap:** zonder `lastModified`.
- **Lespagina's:** links naar de vorige en volgende les.
- **Doorloop:** nieuwe regel `uitlegbordSpeelt()`.

Reviewers: schaakmeester, layout-reviewer en codebase-reviewer. De releasecoördinator kon in
deze sessie geen reviewers starten. Ze zijn daarom rechtstreeks gestart en dit rapport is
daarna gebundeld.

Vóór de review:
- `npm run check` groen (403 tests).
- Doorloop 15/16. Live spelen faalde: "zwart sprong naar de nieuwe partij zonder de mat te zien". Bij de codebase-reviewer slaagde dezelfde regel wel, en na de herstelronde 16/16.

## Oordeel

- **Schaakmeester:** nog niet. Eén blokkerend punt (S1). De schaakinhoud van de twaalf pagina's klopt, ook en passant, de vier rokadevoorwaarden en mat tegenover pat.
- **Codebase:** niet vrijgeven tot C1 is opgelost en met een test vastgelegd. C2 en C3 in dezelfde ronde.
- **Layout:** niets blokkerend. L1 tot en met L4 opgelost vóór de release.

**Samen (vóór de herstelronde): NO-GO.** De promotie-animatie liet een dame zien waar een
pion hoort te staan. De enige animatie over deze regel liet de regel dus juist niet zien.

*Bijgewerkt na de herstelronde: alles opgelost, behalve wat hieronder met een reden open
staat. `npm run check` groen (429 tests), doorloop 16/16. Oordeel nu: **GO**.*

## Blokkerend

| | Bevinding | Status |
|---|---|---|
| S1 / C1 | `beelden.ts` hield het stuktype bij per id, voor de hele film. Daardoor stond er in `pion-promotie` al in beeld 1 een dame op e7, bij "De pion is bijna aan de overkant". Die dame "werd" daarna een dame. Gevonden door twee reviewers. | **Opgelost**: elk beeld haalt het type uit het bord van dat moment. Nieuwe test "tekent bij elke stap het echte bord": per stap wordt het getekende bord vergeleken met een naspeling door alleen de engine, voor alle 24 animaties, plus een gerichte test voor de promotie. Zo vergelijkt de test de bouwer niet met zichzelf, en daarom had hij deze fout gevangen. |

## Belangrijk

| | Bevinding | Status |
|---|---|---|
| S2 | Het overzicht zei dat de toren en de loper "in rechte lijnen" lopen. Op de hele site is recht van de toren en schuin van de loper. | **Opgelost**: "de toren recht, de loper schuin, allebei in lange lijnen". |
| C2 | Bij `regels: 'echt'` kon het getekende type uit de pas lopen met chess.js. Dat gebeurde bij een promotie zonder `wordt`, en bij `wordt` op een zet die geen promotie is. | **Opgelost**: het type komt uit het bord, dus de eerste vorm bestaat niet meer. `wordt` bij een zet die geen promotie is, geeft nu een fout, net als in de losse motor. |
| C3 | `suggestedMinAge` en `suggestedMaxAge` op een `EducationalAudience`: die velden horen bij `PeopleAudience`, dus 61 pagina's gaven een leeftijd die genegeerd wordt. | **Opgelost**: `typicalAgeRange: '3-10'` op de LearningResource, met een test op `VOOR_KINDEREN`. |
| L1 | De kruisjes ("mag niet") haalden in het donkere thema 1,5 tot 1,7:1. | **Opgelost**: een eigen donkere kleur `#8c2340` met een lichte rand, in beide thema's. Op lichte velden geeft de vulling het contrast (ruim 3:1), op donkere velden de rand. Nagekeken op een schermafbeelding in het donkere thema. |
| L2 | De coördinaten waren 9 tot 12 px groot met opacity 0,65 (1,7 tot 2,6:1), terwijl de stappen naar d4 en e6 verwijzen. | **Opgelost**: ze staan nu naast en onder het bord, in `--muted` op de paginakleur, zonder opacity. Lost ook L6 op. |
| L3 | De nieuwe sectie op de startpagina was op een telefoon 1782 px hoog. Het naamveld zakte naar y=3556. | **Opgelost**: het bord toont daar alleen de huidige zin (prop `kort`), en de twaalf links zijn zes chips voor de stukken plus "Alle schaakregels →". Het naamveld staat nu op y=2844 (390 breed). |
| L4 | Bij `mat-achterste-rij` stap 2 stond "De toren gaat naar a8: schaak." naast een groot "Schaakmat!". | **Opgelost**: de tekst is nu "De toren gaat naar a8 en valt de koning aan." en spreekt het label niet meer tegen. Bij `pat` en `mat-met-dame` noemt stap 2 het label niet, dus daar is geen tegenspraak. Het label blijft berekend. |

## Klein

| | Bevinding | Status |
|---|---|---|
| S3 | Bij de koning stond "op een veld waar hij geslagen kan worden", terwijl de FAQ zegt dat de koning nooit geslagen wordt. | **Opgelost**: "op een veld dat de tegenstander aanvalt". |
| S4 | Bij de waarde stond "Raak je hem kwijt door mat". | **Opgelost**: "Staat hij mat, dan is de partij voorbij." |
| S5 | De zin "Niet in de volgorde van deze lijst" verwarde. | **Opgelost**: de waarde van de stukken staat nu vóór en passant. De lijst volgt daarmee de leervolgorde, op rokade na, en de zin is "Eén ding tegelijk." |
| S6 | Les `rokade-3` (buiten de scope) zegt "niet door een aangevallen veld", maar de regel is "over of naar". | **Open**: de zin is door Pip ingesproken. Aanpassen kost een nieuwe opname, en dat kost geld. Dat ligt bij Kaj. De nieuwe pagina zegt het wel volledig. |
| C4 | Op ▶ drukken bij de laatste stap liet de stukken terugglijden. | **Opgelost**: `naarBegin()`, die ook de automatische terugsprong gebruikt. |
| C5 | De dubbele requestAnimationFrame werd maar half opgeruimd. | **Opgelost**: beide id's worden geannuleerd. |
| C6 | "Minder beweging" aanzetten tijdens het kijken werd niet gevolgd. | **Opgelost**: luistert naar `change` en stopt het afspelen. |
| C7 | Een animatie zonder stappen liet het scherm crashen. | **Opgelost**: de test eist minstens één stap. |
| C8 | `plaats` samen met `regels: 'echt'` liet de motoren stil uit elkaar lopen. | **Opgelost**: dat geeft nu meteen een duidelijke fout. |
| C9 | Dekking: geen test op een ongevraagd Schaak!-label, en geen test op de JSON-LD. | **Opgelost** voor het label (elk label na een zet moet `verwacht` hebben) en voor de leeftijdsvelden. Een volledige JSON-LD-validatie per pagina is niet gebouwd: de vorm is eenvoudig en nu nagekeken. |
| C10 | De HTML van een regelpagina is 68 kB, vooral door de RSC-payload met per beeld alle stukken. | **Open**, bewust: First Load blijft 110 kB, en chess.js zit niet in de client. Pas als het groeit: per beeld alleen de velden meegeven. |
| C11 | `LesUitleg` zoekt de index opnieuw. De `isPartOf`-url is `/lessen/` zonder anker. | **Open**: geen gevolg. `zoek()` garandeert dat de les bestaat, en er bestaat geen pagina per wereld om naar te verwijzen. |
| L5 | Op een groot scherm speelden twee borden tegelijk. | **Opgelost**: het bord zelf wordt bekeken (niet het hele blok) met drempel 0,6. Op een telefoon past alleen het bord wél in beeld; het blok met de stappenlijst niet. |
| L6 | De "8" stond over het stuk op a8. | **Opgelost** met L2. |
| L7 | Bij "Kort mag hier niet" verdween in stap 2 de markering op f1. | **Opgelost**: f1 blijft gemarkeerd. |
| L8 | Een schermlezer hoorde niet wat er veranderde. | **Opgelost**: een verborgen `aria-live`-regel "Stap 2 van 5: …", alleen bij zelf bladeren en niet tijdens het afspelen. |
| L9 | De links op de startpagina waren 39 px hoog. | **Opgelost** met L3: chips van 44 px. |
| L10 | De links op de lespagina (regel, vorige/volgende) ziet een ouder in de app niet. | **Zo bedoeld**: het is de tekstversie voor zoekmachines en gedeelde links. Op de regelpagina's staan de lessen wel zichtbaar. |

## Doorloop

Er is een nieuwe regel, `uitlegbordSpeelt()`: het bord speelt vanzelf, blijft staan na pauze, en
bij de korte rokade staat de toren op f1 en niet meer op h1. `/schaakregels/` en
`/schaakregels/paard/` staan in "elk scherm heeft een uitweg".

De live-regel faalde twee keer bij de layout-reviewer en één keer vóór de review. Bij de
codebase-reviewer en na de herstelronde slaagde hij. Deze fase raakt live spelen niet. Hij
blijft wisselvallig, zoals de zestiende review al meldde. Om dat op te lossen hoort er een
eigen onderzoek naar de timing in die regel te komen, los van deze fase.
