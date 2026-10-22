# Tweeëntwintigste review — geluid uit voor gasten (22 oktober 2026)

**Fase:** wie zonder profiel "Probeer de eerste les" opent, krijgt geen geluid meer
vanzelf, maar een melding met een knop "Geluid aan". Aanleiding: Kaj meldde dat
bezoekers schrokken van Pip die ineens begon te praten.

**Gekeken door:** layout-reviewer, codebase-reviewer en conversie-reviewer. Op verzoek
van Kaj alleen de reviewers die met deze wijziging te maken hebben. De schaakmeester
is overgeslagen, omdat er geen schaakinhoud veranderd is.

**Oordeel:** go, nadat de bevindingen hieronder verwerkt zijn.

## Blokkerend

1. **Een kind mét profiel miste Pips eerste zin op schermen die het rechtstreeks
   opent** (codebase). Voorbeelden zijn /spelen/, de stal, een partij en de minispellen.
   - Oorzaak: bij de eerste render is er nog geen profiel, dus golden de
     gastinstellingen (geluid uit). Die werden meteen toegepast, waardoor de zin wegviel.
   - Voor deze fase gebeurde het omgekeerde: wie Pip had uitgezet, hoorde de eerste
     zin toch.
   - → **Opgelost.** `src/ui/Instellingen.tsx` past de instellingen pas toe nadat de
     opgeslagen toestand is ingelezen. Tot dan houdt `voice.ts` de zin vast.
   - De doorloopregel `profielHoortPipDirect` controleert beide kanten: met spraak aan
     moet Pip praten, met spraak uit moet hij stil blijven.

## Belangrijk

2. **Na "Geluid aan" werd de zin die in beeld stond niet voorgelezen** (conversie).
   Pip praatte pas bij de volgende zin.
   - → **Opgelost.** De nieuwe functie `zegLaatsteZinNogEens()` in `voice.ts` leest die
     zin alsnog voor. Zowel de knop in de melding als de bel roept haar aan bij het
     aanzetten.
   - De doorloop controleert nu dat Pip direct na de tik praat.
3. **De melding duwde het bord op een telefoon te ver omlaag** (layout en conversie).
   Op 360 px was hij 162 px hoog.
   - → **Opgelost.** De melding is nu één compacte kaart met de knop ernaast, ongeveer
     76 px hoog op 360 px.
4. **De melding kwam terug als je het geluid weer uitzette** (layout).
   - → **Opgelost.** Is het geluid één keer aangezet, dan verschijnt de melding niet
     meer zolang de app open is. De doorloop controleert dat.

## Klein

5. **Twee oranje hoofdknoppen op één scherm** (layout en conversie).
   - → **Opgelost.** "Geluid aan" gebruikt nu de gewone `btn`-stijl, niet `btn--primary`.
6. **De tekst kan concreter** (conversie).
   - → **Opgelost.** De tekst is nu "Pip leest alles voor, als je het geluid aanzet."
7. **`herstelInstellingen` deed niets voor een gast** (codebase).
   - → **Opgelost.** Voor een gast wist de knop zijn instellingen, zodat het geluid
     weer uit staat. Er is een test bij.
8. **Wie het laatste profiel verwijdert, zit weer zonder geluid** (codebase).
   - → **Bewust zo gelaten.** Wie geen profiel meer heeft, is weer gast en krijgt de
     melding. Dit is vastgelegd in een test.
9. **De melding verscheen één keer niet binnen 800 ms** (layout).
   - → **Niet opgelost.** De melding wacht met opzet tot de toestand is ingelezen,
     zodat hij niet even verschijnt bij een kind mét profiel.
   - Op het lesscherm, de eerste les van een gast, verschijnt het hele scherm pas na
     het inlezen, dus daar verspringt niets.
   - Op andere schermen kan hij een fractie later verschijnen. Dat vind ik
     aanvaardbaar. Ruimte reserveren zou ook bij kinderen mét profiel een gat geven.
10. **De focusring is niet bekeken** (layout).
    - → **Geen actie.** De knop is een gewone `.btn` en heeft dus de bestaande
      `:focus-visible`-rand uit `globals.css`.

## Buiten deze fase

- **De doorloopregel "live" faalde wisselend** ("zwart sprong naar de nieuwe partij
  zonder de mat te zien"). Ook op `main` (e3a3c62) faalde hij, 2 van de 3 keer.
  - → **Onderzocht en opgelost.** Het was een fout in de test, niet in de app.
  - De test zet zwart offline en laat wit dan meteen mat zetten. Een kijkverzoek van
    zwart dat al openstond, kwam ondanks offline gewoon terug, met de mat erin.
  - Nagemeten: in de mislukte runs stond bij zwart al "🏆 Je vriendje wint!" vóór wit
    op "Nog een keer" tikte. Zwart had de mat dus gezien en ging daarna terecht door
    naar de nieuwe partij.
  - De doorloop wacht nu tot zwart zelf merkt dat de verbinding weg is, en pas dan
    zet wit mat. Daarna 5 van de 5 keer groen.
- **Een mat die op de achtergrond binnenkwam, telde als gezien.** Dit vond ik tijdens het
  onderzoek hierboven, en Kaj vroeg het ook op te lossen.
  - Wat er gebeurde: stond de app van een kind op de achtergrond toen de mat binnenkwam,
    en tikte het vriendje snel op "Nog een keer", dan zag het kind bij terugkomen meteen
    de nieuwe partij.
  - → **Opgelost.** `src/play/LiveScherm.tsx` onthoudt nu of het einde binnenkwam terwijl
    het scherm zichtbaar was (`eindeGezien`). Zo niet, dan blijft de uitslag staan, met
    de bestaande knop "▶️ Naar de nieuwe partij" eronder.
  - De doorloopregel "live" speelt dit nu na met een derde partij. Op de oude build faalt
    die regel, met de fix slaagt hij (3 van de 3 keer los, plus de volledige doorloop).

## Controles

- `npm run check`: groen, 495 tests.
- `npm run doorloop`: 19 van de 19 in orde. De live-regel los 5 keer gedraaid: 5 van de 5 in orde.
