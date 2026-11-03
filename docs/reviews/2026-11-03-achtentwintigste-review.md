# Achtentwintigste review: het trotse moment (2026-11-03)

Fase: "volgende niveau", ronde 3. Wat er nieuw is: de deelknop voor ouders, de voorproef op het vergrendelde diploma en "wereld af" als het grote moment.
Branch `volgende-niveau`. De reviewers zijn rechtstreeks gestart, want de coördinator kan in deze sessie geen subagents starten.

**Oordeel na verwerking: GO voor deze fase.** Er is niets blokkerend, en alle grote punten zijn opgelost. `check` is groen, en de doorloop ook, met 3 nieuwe regels over delen.

| reviewer | blokkerend | groot/belangrijk | middel | klein |
|---|---|---|---|---|
| schaakmeester | 0 | 0 | 0 | 2 |
| layout | 0 | 3 | 3 | 4 |
| conversie | 0 | 1 | 0 | 4 |
| codebase | 0 | 1 | 0 | 4 |

## Groot / belangrijk
- **L1. Pip zei na De Weide "Hoefijzer verdiend!".** Een hoefijzer krijg je pas na wereld 6, 12 en 14. *Opgelost:* die zin is weg uit `WERELD_AF` en `WERELD_AF_OUDER`. Er blijft één kloppende zin over met de bestaande opname. Een nieuwe zin vraagt een nieuwe opname (ElevenLabs), en daarvoor is geen sleutel in deze sessie.
- **L2. Het feest voor "wereld af" stond op de tweede plek.** *Opgelost:* de wereld staat nu bovenaan, met een wapen van 128 px, confetti en de kop "De Weide is af!". Daaronder staat "Noor heeft alle lessen… uitgespeeld" (de naam alleen lokaal in beeld) en een rij met alle wereldwapens, de gehaalde in kleur. De lesuitslag is één compacte regel.
- **L3. Label "Stuur naar een ouder" (wie het toestel vasthoudt ís de ouder).** *Opgelost:* het label is nu "Vertel een andere ouder". Een plaatje meesturen is *niet gedaan*: de opdracht zegt "alleen een link en een vaste tekst". Voor een vast plaatje zonder naam moet Kaj eerst kiezen; het staat als vraag op het scorebord.
- **C1. Delen wordt niet geteld.** *Opgelost:* er is een losse telling `Gedeeld` met `hoe` (gedeeld/gekopieerd) en `waar` (wereld/diploma). Die staat in beide vaste lijsten (`tests/tellen.test.ts`, `public/teller/opslag.php`). Er gaat geen kind, profiel of wereld mee.
- **CB1. De doorloop testte de kopieerroute niet.** *Opgelost:* er is een tweede context zonder `navigator.share` en met een nep-klembord. Die controleert de link, dat de naam ontbreekt en de statustekst.

## Middel
- **L4/C3. Lege voortgangsbalk op het vergrendelde diploma.** *Opgelost:* de balk is vervangen door de wereldwapens, de gehaalde in kleur.
- **L5. Het slotpaneel dekte de oorkonde af.** *Opgelost:* het paneel is smaller en staat lager, zodat de medaille en de titel zichtbaar zijn. De naam blijft half bedekt, en dat is bewust: het slot moet duidelijk blijven (schaakmeester: een jong kind mag niet denken "ik heb hem al").
- **L6. "Naar de kaart" stond boven de hoofdknop.** *Opgelost:* "Volgende les" komt nu eerst.

## Klein
- **L7. Ongelijke knoppen bij het diploma.** *Opgelost* met een raster van even brede knoppen.
- **L8. Te kleine medaille.** *Opgelost:* van 58 naar 88 px.
- **L9. Lege statusregel onder de deelknop.** *Niet opgelost:* die ruimte is nodig voor de melding, zodat de pagina niet verspringt.
- **L10. Grijze kop "Wereld uitgespeeld!" in het donker.** *Vervallen:* de kop is nu de grote "… is af!".
- **C2. De link gaat naar `/` en niet naar de eerste les.** *Niet opgelost, bewust:* de startpagina legt eerst uit wat dit is, en daarna volgt de eerste les met 1 tik.
- **C4. "Bedankt" verschijnt ook als de ouder in het deelvenster afbreekt.** *Niet opgelost:* het toestel meldt dan toch succes. Het is onschuldig.
- **CB2. Safari en klembord na een mislukte share.** *Opgelost* met commentaar. De terugval toont de link zichtbaar.
- **CB3/SM1. "Mijn kind…" past niet als het kind zelf tikt.** *Niet opgelost:* de knop is voor de ouder en staat onder de knoppen van het kind. Een kind dat tikt opent alleen het deelvenster van het toestel.
- **CB4. NaN bij een diploma zonder werelden.** *Vervallen:* de balk is weg.
- **CB5. Les-id's uit `out/les`.** *Niet opgelost:* als dat misgaat, faalt de regel zichtbaar.
- **SM2. "Alle stukken en hun zetten" is iets ruim.** *Niet opgelost:* het is geen onwaarheid, en de content valt buiten deze fase.

## Wow ("zou een ouder hier een screenshot van doorsturen?")
| scherm | layout | conversie | vóór (27e) |
|---|---|---|---|
| Wereld af | 5 (vóór de verbouwing na deze review) | 7 | – |
| Diploma behaald | 7,5 | 8 | 3 (alleen het slot gezien) |
| Diploma vergrendeld | 6 | – | 3 |

De cijfers zijn gegeven vóór de verwerking. Wereld af is daarna flink veranderd (zie L2), dus de volgende ronde meet opnieuw.
Naar een 9: Pip die het wapen of diploma uitreikt als illustratie, een staande opmaak die als plaatje werkt, en een stempel- of glans-animatie bij het wapen.
