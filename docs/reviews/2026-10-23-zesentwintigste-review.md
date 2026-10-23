# Zesentwintigste review, 23 oktober 2026

Scope: `7c31b54` en de herstelcommits erna op `claude/wizardly-cray-9vevs8`. Onderzoek naar de
doorloopregel "live: … zwart sprong naar de nieuwe partij zonder de mat te zien". Die faalde
wisselend, sinds de zeventiende review.

## Oorzaak (gemeten)

Het was een fout in de app, niet in de test.

1. Zwart had nog een kijkverzoek openstaan. Dat bracht de mat binnen terwijl zwart al offline
   was, dus op het scherm stond "📡 Geen verbinding" in plaats van de uitslag.
2. Toen zwart weer online kwam, kwam de nieuwe ronde binnen. `toon` zag dat het einde "al
   bekend" was en sprong meteen door.
3. Hetzelfde gebeurde gewoon online als het vriendje meteen op "Nog een keer" tikte: het kind
   zag de mat dan maar heel even.

Of de test faalde, hing af van het moment waarop dat laatste kijkverzoek terugkwam. Gemeten met
tijdelijke logregels; die zijn weer weg.

## Reparatie

- **Het einde blijft staan.** Komt er een nieuwe ronde binnen terwijl hier het einde van de vorige staat (en het kind die ronde niet zelf startte), dan blijft het einde in beeld met de knop "Naar de nieuwe partij".
- **Doorloop:** `DOORLOOP_ALLEEN=<regex>` draait één regel apart.

Live-regel 15 van de 15 goed, zonder andere processen ernaast. Daarvoor ging het in mijn
metingen 3 van de 8 keer mis.

## Reviewers

Schaakmeester en codebase-reviewer, de codebase-reviewer daarna nog eens op de herstelcommits.

- **Schaakmeester:** niets blokkerends. Didactisch "precies goed": een kind moet de afloop van zijn eigen partij zien.
- **Codebase:** niets blokkerends na de herstelronde. Let op: zijn eerste meting liep tegelijk met de mijne op dezelfde poort en telde daarom niet. De nacontrole is schoon gedraaid.

| | Bevinding | Status |
|---|---|---|
| S1 / C1 (belangrijk) | Na een storing bleef Pip "Ik kan je vriendje niet bereiken" zeggen, terwijl eronder "Jij wint!" stond. | **Opgelost**: de `wasWeg`-tak zegt de uitslag (`uitslagZin`, op moduleniveau). De doorloop controleert Pips zin. |
| C2 (belangrijk) | Wie zelf op "Nog een keer" tikte, kreeg soms toch "Naar de nieuwe partij": het kijkverzoek was eerder terug dan het antwoord op de eigen tik. | **Opgelost**: `bezig` staat aan rond `live.opnieuw`. De doorloop controleert dat wit direct doorgaat. |
| C3 | Na "Naar de nieuwe partij" zei Pip "je vriendje begint", terwijl het kind al aan zet was. | **Opgelost**: Pip noemt dan de beurt, met de juiste stemming bij schaak. |
| C4 | `DOORLOOP_ALLEEN` eindigde groen als er geen regel paste, en `nieuwProfiel` viel weg. | **Opgelost**: exit 1 (na het sluiten van de browser), en `nieuwProfiel` draait altijd mee. |
| C5 | `bezig` telt niet: een zet en "Nog een keer" vlak na elkaar konden elkaars vlag uitzetten. | **Opgelost**: "Nog een keer" wacht als er al iets loopt. |
| S2 | Pip zegt "Nog een keer?", terwijl de knop dan "Naar de nieuwe partij" heet. | **Opgelost na de review, op verzoek van Kaj**: Pip zegt nu "Gewonnen! Mooi gespeeld." (`PARTIJ_GEWONNEN[0]`), zonder vraag erachter, zodat het bij beide knoppen past. Die zin bestond al en is al ingesproken: geen nieuwe credits. |

`npm run check` groen (504 tests), doorloop 17/17.
