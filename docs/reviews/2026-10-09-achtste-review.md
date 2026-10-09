# Achtste review, 9 oktober 2026

Scope: "dagen geoefend" (commit `81f8ac6`, PR #10). Reviewers: schaakmeester,
codebase-reviewer, layout-reviewer. `npm run check` (232) en `npm run doorloop` (8/8,
vijf keer) waren groen.

## Oordeel

**GO** van alle drie. Niets blokkerends. De teller straft niet, manipuleert niet en
blijft rustig op de achtergrond. De keuze tegen een reeks die op nul springt is juist.

## Schaakmeester

| | Bevinding | Status |
|---|---|---|
| S1 | belangrijk: de drempel is ongelijk. Een les telt pas als hij af is, maar één minispelrondje (soms één tik) of één opfrisopgave liet de dag al tellen. | **Opgelost**: een minispel telt na drie gehaalde rondjes, de opfrisser pas als de hele ronde af is. Test erbij. |
| S2 | belangrijk: de teller steunt het herhalen op afstand niet. Beter: het ouderscherm laat zien welke lessen aan het wegzakken zijn. | Open: een eigen functie voor het ouderscherm, volgende fase. |
| S3 | klein: de ouder ziet niet wanneer er laatst geoefend is. | **Opgelost**: "laatst vandaag / gisteren / dinsdag 7 oktober", alleen in het ouderscherm. |
| S4 | klein: hang er nooit een beloning aan ("nog 3 dagen en..."). | **Opgelost**: vastgelegd in het commentaar bij `oefendagen` in de store. |
| S5 | klein: een partij telt ook als hij snel eindigt. | Open, bewust: een partij is echt schaken, ook als hij kort is. |

## Codebase

| | Bevinding | Status |
|---|---|---|
| C1 | klein: de tests hingen van elkaar af, en oude opslag zonder `oefendagen` werd niet getest. | **Opgelost**: elke test begint schoon (`beforeEach`), plus een test met een toestand zonder de sleutel. |
| C2 | klein: voorzichtig lezen (`?.`) bij `oefendagen` maar niet bij de rest, zonder uitleg. | **Opgelost**: een zin commentaar waarom. |
| C3 | klein: de doorloopregel voor het tipje meldt bij een gewijzigde teller iets misleidends. | **Opgelost**: de melding noemt nu ook dat "x van de N" misschien weg is. |
| C4 | klein: geen doorloopregel voor de teller. | **Opgelost**: regel 9, na een gespeeld minispel staat "📅 1 dag" op het beginscherm. |

## Layout

| | Bevinding | Status |
|---|---|---|
| L1 | belangrijk: de regel brak op een telefoon in vier losse stukjes, kalendertje los van "dagen". | **Opgelost**: twee eigen regels die niet afbreken: "⭐ 0 van de 147" en "📅 120 dagen" ("geoefend" alleen voor de schermlezer). |
| L2 | klein: een getal zegt een kind dat niet leest weinig. | Open: een beeld of Pip-zin vraagt een ontwerpkeuze en een ingesproken zin, volgende fase. Het getal is nu vooral voor de ouder, en dat mag. |
| L3 | klein: in het ouderscherm brak "· 6" los van "partijen". | **Opgelost**: een kort lijstje, elke regel apart. |
| L4 | buiten deze commit: een lange naam liep onder de knoppen door. | **Opgelost**: kleinere kop bij een naam langer dan 7 tekens, smallere knoppen voor bel en tandwiel. Nagekeken op 360 px met "Maximiliaan". |
