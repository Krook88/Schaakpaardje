# 10. Risico's, aannames en meetpunten

## 10.1 Grootste risico's en hoe we ze afdekken
| Risico | Impact | Aanpak |
|---|---|---|
| **Contentvolume wordt onderschat** (~60 lessen, ~600 opgaven, ~1.500 audioregels) | hoog | Data-gedreven content + `apps/studio` authoring tool; per wereld afronden i.p.v. alles tegelijk. |
| **3-jarigen kunnen de app niet bedienen** | hoog | Pip-modus met tik-tik, geen tekst; test met échte kleuters in fase 1, niet aan het eind. |
| Stockfish speelt onmenselijk zwak op lage niveaus | midden | Eigen random/greedy-bots voor niveau 1–3; Stockfish pas vanaf niveau 4. |
| Herhaling van dezelfde stemregels gaat vervelen | midden | 3–6 varianten per feedbackcategorie; variatie-selectie zonder directe herhaling. |
| Prestaties op oude schooltablets | midden | Budget van 250 kB app-shell, lazy WASM, meten op een echte oude iPad/Chromebook in CI-checklist. |
| Stappenmethode-auteursrecht | hoog (juridisch) | Alleen de didactische volgorde, alle content zelf; merknaam vermijden. |
| Stockfish GPLv3 in een betaalde app | midden | Losse WASM-worker + licentievermelding + bronlink; vóór release laten toetsen. |
| Ouders vertrouwen een onbekende kinder-app niet | midden | Privacy als verkoopargument: geen account, geen advertenties, geen chat, lokaal. |
| Scope creep richting "compleet schaakplatform" | hoog | Werelden 0–6 zijn de MVP. Alles daarbuiten staat op de roadmap, niet in de sprint. |

## 10.2 Aannames die we vroeg moeten toetsen
1. Kinderen van 3–5 blijven ≥ 4 minuten bij een gesproken schaakles. *(test in fase 1)*
2. Ouders betalen eenmalig €20 voor een NL-schaakapp zonder abonnement. *(landingspagina + wachtlijst in fase 2)*
3. Scholen willen dit naast/als vervanging van een schaakclubles. *(3 gesprekken in fase 2)*
4. De stappen-volgorde werkt óók digitaal, zonder trainer erbij. *(meten via foutpercentages per les)*

## 10.3 Meetpunten (privacyvriendelijk, geaggregeerd)
**Leren**
- % kinderen dat een wereld afmaakt na starten (doel > 70%).
- Gemiddeld aantal pogingen per opgave (doel 1,4–2,0 — lager = te makkelijk).
- % opgaven waarbij de oplossing getoond moest worden (doel < 15%).
- Beheersingsgroei per thema over 4 weken.

**Betrokkenheid**
- Sessies per week per profiel (doel ≥ 3), mediane sessieduur per leeftijdsmodus.
- Terugkeer na 7 en 28 dagen.
- Aandeel "speel met papa/mama"-opdrachten dat wordt afgevinkt.

**Kwaliteit**
- Crashvrije sessies > 99,5%; laadtijd p75 < 3 s; audio-startlatentie p95 < 150 ms.
- Aantal contentfouten gevonden ná release (doel: 0 per wereld — CI vangt ze).

## 10.4 Wat dit plan bewust níet doet
Geen online multiplayer met vreemden, geen chat, geen ranglijst met andere kinderen,
geen advertenties, geen AI-chatbot die vrij tegen kinderen praat. Elk van die vier
brengt veiligheids- en compliancerisico's die niet opwegen tegen de leerwinst.
