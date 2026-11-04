# Eenendertigste review: de startpagina (2026-11-03)

Fase: "volgende niveau", ronde 6. Wat er nieuw is:
- een held met het bewegende paardbord naast de kop (op de telefoon eronder);
- de beloftes als vier labels;
- Pip die bij het bord zwaait en spreekt.

De reviewers zijn rechtstreeks gestart.

**Oordeel na verwerking: GO voor deze fase.** Er is niets blokkerends. `check` en `doorloop` zijn groen. Lighthouse op mobiel geeft 99 / 95 / 96 / 100, met LCP 2,0 s en CLS 0. Toegankelijkheid scoort 95 alleen door de bewuste `maximum-scale`; de kopvolgorde is opgelost.

## Schaakmeester
- De animatie klopt. d4-e6 is een L, en vanaf e6 zijn er acht sprongen. De kleurregel klopt ook, en wit staat onder.
- Het paard als eerste beeld is in orde: de startpagina is een etalage, en de leerweg blijft toren → … → pion.
- **Klein: de zin "Het paard dat bovenaan springt…" voegde weinig toe.** *Opgelost:* "Ook het paard dat bovenaan springt, krijgt zijn eigen wereld, na de dame."
- **Klein: de laatste stap koppelt de kleurregel aan een nieuwe sprong.** *Niet aangepast:* dit is content van de schaakregelpagina, en de schaakmeester zegt zelf "laat het zo".

## Layout
- **Belangrijk: op een stilstaand beeld was het bord leeg** (stap 1/5: alleen een paard op d4). *Opgelost:* het bord kreeg een nieuwe prop `beginStap` en begint nu bij de L-markering, zodat ook een screenshot het verhaal vertelt.
- **Belangrijk: Pip was een los kopje dat niets deed.** *Opgelost:* het kopje is weg. Pip staat nu bij het bord met de ballon "Kijk, zo spring ik!" en zwaait daar.
- **Belangrijk (conversie, punt 1): op de telefoon stond geen bordveld boven de vouw.** *Opgelost* doordat de alinea korter is en het kopje weg is. Op 390×844 staan het paard en de L nu in het eerste scherm.
- **Belangrijk: verouderde schermafbeeldingen** (het speldje van Pip over zijn gezicht). *Opgelost:* er is een nieuw script `scripts/schermen.mjs` dat ze op de gebouwde app opneemt. `og.png` en `og-vierkant.png` zijn daarna opnieuw gemaakt met `deelbeeld.mjs`.
- **Klein: 🚫 en 🔐 lazen streng.** *Opgelost:* er staat nu een groen vinkje (aria-hidden).
- **Klein: de profiellink stond een paar pixels verschoven.** *Niet opgelost:* dat komt door de padding die de link als raakvlak nodig heeft (48 px). Het verschil is 6 px.
- **Klein: "Het paard staat op d4." stond vet onder het bord.** *Vervallen:* het bord begint nu bij stap 2, met een andere zin. Het lettergewicht is van het Animatiebord, dat ook op de schaakregelpagina's staat.

## Conversie
- De CTA staat ruim boven de vouw en gaat met 1 tik naar de eerste opgave. SEO is in orde: de h1 bevat de zoekterm en de held staat in de gebouwde HTML.
- **Klein: de belofte stond twee keer** ("Een gratis…" en het label "Gratis"). *Opgelost:* het woord "gratis" is uit de alinea gehaald. De metabeschrijving noemt het nog wel.
- **Klein: de emoji lazen streng.** *Opgelost,* zie Layout.
- **Klein: geen extra telling.** *Eens:* "Les begonnen" ten opzichte van de bezoeken aan de startpagina is genoeg.
- **Naar een 9: een tikbaar paard in de held.** *Niet in deze fase:* het staat op het scorebord.

## Codebase
- De held staat in `out/index.html` en het id is uniek.
- **Klein: emoji niet aria-hidden.** *Opgelost:* de vinkjes zijn aria-hidden.
- **Klein: gekopieerde h2- en h3-tak.** *Opgelost* met `const Kop = kopNiveau === 2 ? 'h2' : 'h3'`.
- **Klein: inspringen.** *Niet opgelost:* het is cosmetisch, en de repo heeft geen Prettier in `check`.

## Bijvangst
- **De console-404 van `/sfx/manifest.json` (uit de nulmeting) is lokaal en bewust.** `hosting-klaar` haalt een leeg manifest weg zodat de opnames op de server niet overschreven worden. Op schaakmaatje.nl bestaat het manifest. Er is niets veranderd.

## Wow: startpagina
| layout | conversie | vorige ronde (27e) |
|---|---|---|
| 7 | 8 | 6 / 7 |

De cijfers zijn gegeven vóór de verwerking (leeg bord, los kopje). Naar een 9:
- een tikbaar paard in de held ("tik waar het paard heen mag" → les);
- een echt kindmoment in beeld, zoals een ster of de ballon.
