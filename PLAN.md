# Schaakpaardje — volledig ontwikkelplan

Een Nederlandse leer-app waarin kinderen van **3 tot 10 jaar** leren schaken, met
**Pip het schaakpaardje** als mascotte die alles inspreekt, een **modulepad in spelvorm**
en een **oefenmodus met echte partijen op tien niveaus**.

## In het kort

| | |
|---|---|
| **Didactiek** | De Nederlandse stappen-didactiek: makkelijk stuk eerst (toren → loper → dame → paard → koning → pion), **mat bewust laat**, bordvisie eerst, veel korte oefeningen en minispellen. |
| **Structuur** | 15 werelden op een avonturenpad, elke les met dezelfde 4-fasen-lus: *kijken → meedoen → zelf doen → sterrentoets*. Drie leeftijdsmodi: Pip (3–5), Ontdekker (6–8), Schaker (8–10). |
| **Oefenen** | 10 tegenstanders, van 🐭 Mila de Muis (pionnenspel, random) tot 🐉 Draak Duco (Stockfish ~1900), plus 12 minispellen, dagelijkse puzzel en samen-op-één-tablet. |
| **Geluid** | Alles gesproken door Pip. **Vooraf gerenderde audio** (geen live TTS): offline, snel, kwaliteitscontrole vooraf. ~1.500 regels. |
| **Stack** | Next.js 15 + TypeScript PWA · chess.js · react-chessboard · stockfish.wasm in een worker · Rive (Pip) · Howler · Zustand · Dexie lokaal → Supabase EU later · Capacitor voor de stores. |
| **Privacy** | Geen account, geen persoonsgegevens, geen advertenties, geen chat, geen online multiplayer. Alles lokaal in fase 1. |
| **Planning** | Verticale plak in 3 weken · MVP (alle stukken) week 10 · publieke bèta week 18 · 1.0 in de stores week 26. |

## De documenten

1. **[Wat is schaken precies?](docs/01-onderzoek-schaken.md)** — het spel opgedeeld in
   leerbare brokjes: bord, stukken, bijzondere regels, en de acht vaardigheden waar het
   echte leren zit.
2. **[Didactiek en doelgroep](docs/02-didactiek-en-doelgroep.md)** — de Stappenmethode
   als Nederlandse standaard, de drie principes die haar bijzonder maken, en waarom
   "3–10 jaar" eigenlijk drie verschillende apps in één is.
3. **[Curriculum: de reis van Pip](docs/03-curriculum-modules.md)** — mascotte, 15
   werelden, de 4-fasen-lus, een uitgewerkt voorbeeld en de drie hoefijzer-diploma's.
4. **[Oefenspellen en bots](docs/04-oefenspellen-en-bots.md)** — de niveauladder, de
   kindvriendelijke bot-laag (blunder-budget, genadeplafond, undo), minispellen,
   puzzels en adaptiviteit.
5. **[Techstack](docs/05-techstack.md)** — de keuze voor web-first PWA met de
   onderbouwing, module-voor-module, en de audiopijplijn in detail.
6. **[Architectuur](docs/06-architectuur.md)** — monorepo-indeling, datamodel,
   engine-opbouw, lesson-runner state machine, offline & sync.
7. **[UX, geluid en toegankelijkheid](docs/07-ux-audio-toegankelijkheid.md)** — zeven
   ontwerpprincipes, geluidsontwerp, WCAG, ouderpoort.
8. **[Privacy en juridisch](docs/08-privacy-en-juridisch.md)** — AVG, Code voor
   Kinderrechten, store-eisen, auteursrecht (Stappenmethode én Stockfish GPLv3),
   verdienmodel.
9. **[Roadmap](docs/09-roadmap.md)** — vier fasen met concrete leveringen, werkwijze en
   een kostenindicatie.
10. **[Risico's en meetpunten](docs/10-risicos-en-kpis.md)** — wat er mis kan gaan, welke
    aannames we vroeg toetsen, en waarop we sturen.

## De eerste drie stappen

1. **Koop de Handleiding Stap 1 + Opstapje 1 en 2** en leg het curriculum uit hoofdstuk 3
   ernaast. De les-voor-les-nummering in dit plan is gereconstrueerd uit openbare bronnen
   en moet daartegen geverifieerd worden.
2. **Bouw de verticale plak** (fase 0): één les, één wereld, met stem — inclusief de
   audio-pijplijn. Dat is de test of het hele concept werkt.
3. **Zet die les voor twee echte kinderen neer** (één van 4, één van 8) en kijk twintig
   minuten mee zonder te helpen. Alles wat daarna volgt, is een detail.
