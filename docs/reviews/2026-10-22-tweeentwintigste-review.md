# Tweeëntwintigste review, 22 oktober 2026

Scope: `330fdb9` en de herstelcommits erna op `claude/wizardly-cray-9vevs8`. Vraag van Kaj:
Google moet alle pagina's goed kunnen vinden.
- `src/vindbaar.ts`: één lijst met de vindbare pagina's.
- `sitemap.xml` zonder `priority` en `changefreq`.
- Een leesbare pagina `/sitemap/` ("Alle pagina's"), gelinkt vanaf de startpagina en het thuisscherm.
- Een controle na elke build (`sitemapFouten` in `scripts/hosting-klaar.ts`).

Reviewers: conversie-reviewer, layout-reviewer en codebase-reviewer. De schaakmeester is
overgeslagen, want er is geen schaakinhoud gewijzigd. De coördinator kan in deze sessie
geen reviewers starten, dus ze zijn rechtstreeks gestart.

Vóór de review: `npm run check` groen (495 tests).

## Oordeel

**GO.** Niets blokkerends.

- **Conversie:** Google kan alles vinden. Er zijn 68 indexeerbare pagina's en ze staan alle 68 in de sitemap. De app-schermen staan op noindex, en elke pagina is vanaf `/` in hoogstens twee klikken bereikbaar. `/sitemap/` stuurt in één tik naar de eerste les.
- **Layout:** één belangrijk punt: de lessenlinks stonden 6 px van elkaar.
- **Codebase:** geen routeconflict tussen `/sitemap.xml` en `/sitemap/`. De build faalt echt bij een fout, en de doorloop gaf 17/17.

## Bevindingen

| | Bevinding | Status |
|---|---|---|
| L1 (belangrijk) | Lessenlinks op /sitemap/ 6 px uit elkaar: mis-tikken met een duim. | **Opgelost**: raakvlak ~44 px per link, overal hetzelfde ritme. |
| L2 | Wereldkoppen vielen weg. | **Opgelost**: 1,15rem, "Wereld N" erboven in grijs. |
| L3 | Op desktop één smalle kolom van 3400 px. | **Opgelost**: werelden in een raster vanaf 760 px. |
| L4 | Dunne focusring. | **Opgelost**: 3 px in de accentkleur. |
| L5 / K1 | Onderaan geen weg terug naar de app. | **Opgelost**: knop "Probeer de eerste les" onderaan. |
| K3 | H1 "Alle pagina's" zonder zoekwoorden. | **Opgelost**: "Alle pagina's: schaakregels en schaaklessen voor kinderen". |
| K4 | Geen kruimelpad in de structured data. | **Opgelost**: BreadcrumbList. |
| K5 | De controle werkte maar één kant op. | **Opgelost**: ook elke pagina die gevonden wil worden (canonical naar zichzelf, geen noindex) moet in de sitemap staan, op elke diepte. |
| K6 | Omschrijving van de startpagina was 159 tekens. | **Opgelost**: 154. |
| K2 | Losse lessen openen meteen voor een nieuwe bezoeker. | **Bewust zo**: een ouder mag een latere les bekijken; de leerlijn op de kaart blijft heel. |
| — | /over/ kostte twee tikken tot de les. | **Opgelost**: de knoppen gaan direct naar de eerste les. |
| C1 | De test "komen uit dezelfde lijst" kon niet falen. | **Opgelost**: test weg; de controle na de build eist nu dat /sitemap/ elke pagina uit sitemap.xml linkt. |
| C2 | De noindex-controle hing af van de volgorde van de attributen. | **Opgelost**: hele meta-tag zoeken, dan noindex erin; idem voor de canonical. |
| C3 | `export` zonder nut, en een afgekapte foutenlijst zonder telling. | **Opgelost**: `sitemapFouten()` geeft de fouten terug en wordt getest in `tests/hosting.test.ts` op een nagemaakt out/; de melding zegt "… en N meer". |
| C4 | Het wereldnummer kwam uit de positie in de lijst. | **Opgelost**: `nummer` uit de content. |
| C5 | Geen test die BEKEND in tellen.ts en opslag.php gelijk houdt. | **Opgelost**: test in `tests/tellen.test.ts`. |

Na de herstelronde: `npm run check` groen (499 tests), sitemap gecontroleerd (68 pagina's).
Doorloop 16/17: alleen "live: zwart sprong naar de nieuwe partij zonder de mat te zien" faalde.
Dat is dezelfde wisselvallige regel als in de zeventiende en negentiende review. Live spelen is
in deze ronde niet aangeraakt, en bij de codebase-reviewer was het 17/17. Hij verdient nog
steeds een eigen onderzoek.

Voor Kaj: dien na de publicatie in Google Search Console de sitemap in:
`https://schaakmaatje.nl/sitemap.xml`.
