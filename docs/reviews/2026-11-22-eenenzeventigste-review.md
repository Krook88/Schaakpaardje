# Eenenzeventigste review: zoektitels van de zes stukpagina's en een linkverzoek

**Datum:** 22 november 2026
**Scope:** commit `be42f02`. Daarin staan de `zoektitel` en `omschrijving` van toren, loper, dame, paard, koning en pion, plus het nieuwe document `docs/linkverzoek-schaakclubs.md`.
**Aanleiding:** Search Console (28 dagen). Deze zes pagina's samen: ruim 900 vertoningen, 3 klikken.
**Werkwijze:** de vier reviewers zijn rechtstreeks gestart, net als bij de 70e review. De coördinator kan ze in deze omgeving niet zelf starten.

## Oordeel: GO

Niets blokkeert. Er staat geen schaakfout in. Elke vraag die een omschrijving stelt, wordt op de pagina beantwoord. Op de telefoon staat de oefenknop boven de vouw.

## Belangrijk
1. Het linkverzoek suggereerde dat clubs mat ook pas laat doen. In Stap 1 komt mat halverwege (schaakmeester 1).
2. "Gratis" stond in een linktekst die jaren blijft staan, terwijl /over/ zegt dat gratis "iets van nu" is (schaakmeester 2).
3. Het linkverzoek vroeg een link naar `/`, maar de zwakke posities zitten bij de regelpagina's (conversie 1).
4. De mail was te lang voor een jeugdleider: ongeveer 250 woorden, en "geen kosten" stond er twee keer in (conversie 2).
5. Er was geen plek om het bericht persoonlijk te maken (conversie 3).

## Klein
6. Het linkverzoek noemde de anonieme tellingen niet (schaakmeester 3, codebase 2).
7. Bij het paard wisselde het lidwoord: "hij" tegenover "het" op de pagina (schaakmeester 4).
8. Bij de loper beloofde de omschrijving een "waarom", maar de pagina gaf alleen de regel (schaakmeester 5).
9. Geen enkele omschrijving bevatte het woord "schaken", terwijl "dame schaken" (34 zoekopdrachten) de grootste zoekvraag is (conversie 5).
10. Bij de toren stond "je kind" twee keer (conversie 6).
11. De onderwerpregel klonk als reclame (conversie 10). "Stappenaanpak" moest concreter (conversie 9).
12. Met " | Schaakmaatje" erachter worden de titels 72 à 74 tekens (conversie 4).
13. Pion (plek 52) en paardensprong (plek 56): een betere omschrijving helpt daar pas als de positie stijgt (conversie 7).
14. De omschrijvingen zitten met 149 tot 154 tekens vlak onder de grens van 155 (codebase 1).

## Per reviewer
- **Schaakmeester:** schaakkundig juist, en alle beloftes worden waargemaakt. De bezwaren gingen over het linkverzoek.
- **Conversie:** GO. Koning en dame: 1 tik naar een les zonder profiel. De herkomst van bezoekers staat al op het dashboard, dus voor het linkverzoek hoeft er geen telling bij.
- **Codebase:** `npm run check` is groen. De teksten komen goed in de title, meta, og, twitter en JSON-LD.
- **Layout:** de velden komen niet op het scherm. Niets te beoordelen.

## Afhandeling
1. *Opgelost:* "Eerst komen het bord en de stukken. Mat komt bewust later dan bij Stap 1, pas als een kind slaan en schaak goed kent."
2. *Opgelost:* "gratis" is uit de linktekst en de mail gehaald. In het bericht voor de oudergroep staat "Het is nu gratis".
3. *Opgelost:* de voorgestelde link is "Schaakregels voor kinderen, met bewegende borden" en gaat naar /schaakregels/.
4. *Opgelost:* de mail is ingekort tot ongeveer 120 woorden in drie alinea's. De dubbele zin over de kosten is weg.
5. *Opgelost:* er staat een plek voor de clubnaam en een persoonlijke eerste zin. Bovenaan het document staat "Pas de eerste zin altijd aan".
6. *Opgelost:* er is een losse alinea bijgekomen voor als iemand vraagt wat de app bijhoudt. Die noemt de anonieme tellingen en dat je ze uit kunt zetten.
7. *Opgelost:* "waarom staat het liever niet aan de rand".
8. *Opgelost:* het tweede deel van de loperpagina legt nu uit dat een schuine stap naar een veld gaat dat met een hoekje aan het vorige vastzit, en dat zulke velden dezelfde kleur hebben.
9. *Opgelost:* de dame-omschrijving begint met "Bij schaken loopt de dame…". Bij de andere vijf stukken niet: de ruimte is op en de titels bevatten "bij schaken" al.
10. *Opgelost:* bij de toren staat nu "met tips voor thuis".
11. *Opgelost:* de onderwerpregel is "Tip voor ouders die vragen hoe hun kind thuis kan oefenen". De didactiek staat concreet beschreven (zie 1).
12. *Niet gedaan:* Google kapt de merknaam af, niet de vraag. De huisregel blijft zoektitel ≤ 65, in lijn met de 67e en 70e review.
13. *Niet gedaan:* hier helpt alleen een betere positie. Na 4 weken alleen koning, dame, loper en toren vergelijken, bij gelijke positie.
14. *Niet gedaan:* de test bewaakt de grens. Wie een woord toevoegt, ziet het meteen.
