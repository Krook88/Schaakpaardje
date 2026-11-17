# Vijfenzestigste review: teller duidelijker (2026-11-17)

Scope: commit eb07e96, alleen `public/teller/dashboard.php` (dashboard voor Kaj, achter wachtwoord) en
de PHP-test. Kaj vroeg: "ik wil dat de tellerpagina duidelijker wordt". Nieuw: "In het kort" met
pijltjes tegenover de vorige periode, vijf hoofdstukken met inhoudsopgave, ingeklapte achtergrond, en
een lessentabel met legenda en kleur.

Reviewers: layout en codebase. Schaakmeester en conversie niet: er is geen les, stelling of pagina voor
bezoekers veranderd.

**Oordeel na verwerking: GO.** Niets blokkerends; alle punten hieronder afgehandeld of met reden gelaten.
`npm run check` groen, ook onder 180 volle dagbestanden met 32 MB geheugen (90 dagen: ongeveer 2 s).

## Belangrijk
- **Berichtenlink in donker thema browserblauw, 1,8:1** (layout 1). *Opgelost:* `a{color:var(--accent)}` voor de hele pagina.
- **Groen als tekst haalt in licht 3,9:1** (layout 2). *Opgelost:* `--groen-tekst` (#4a7247) voor de tekst; de balken houden `--groen`.
- **Op de telefoon vallen Af % en "Gestopt in" buiten beeld** (layout 3). *Opgelost:* de lesnaam blijft staan bij opzij schuiven (sticky), Af % staat direct na de les, Hervat en ★ verdwijnen onder 600 px. *Niet gedaan:* een vervagende rand; de legenda zegt nu dat je opzij kunt schuiven.
- **Warmtekleur het felst bij de minste metingen** (layout 4). *Opgelost:* pas kleur vanaf 3 keer open, en dat staat in de legenda.
- **"Daarvan" klopt niet: Gespeeld kan groter zijn dan Geopend** (layout 5). *Opgelost:* andere omschrijving.
- **Pijltjes tegen een half meegetelde vorige periode** (codebase 1, layout 12). *Opgelost:* pijltjes alleen als de hele vorige periode na de opschoning valt; anders zegt de introzin één keer waarom er nog geen zijn.
- **Samenvouwen verborg lessen waarin wel iets gebeurde** (codebase 2). *Opgelost:* alleen bij precies één keer geopend, niet hervat, hooguit één keer gestopt.
- **De vergelijking werd niet getest** (codebase 3). *Opgelost:* een test met data in de vorige periode (telt niet in de periode zelf, wel voor de pijl), een test voor het samenvouwen en de kopstructuur, en "volgeschreven" leest nu 180 dagen bij `dagen=90`.

## Klein
- Platte kopstructuur, kop in `<summary>` (layout 6, 7). *Opgelost:* hoofdstukken h2, secties eronder h3. *Zo gelaten:* de kop binnen `<summary>`; werkt in de browsers die Kaj gebruikt, laag risico.
- Focus mager (layout 8). *Opgelost:* eigen `:focus-visible`.
- "Donker vakje" klopt alleen in licht (layout 9). *Opgelost:* "fel gekleurd".
- heet1 nauwelijks te zien (layout 10). *Opgelost:* 18%.
- "Nog niets om mee te vergelijken" vier keer (layout 11). *Opgelost:* één keer in de introzin.
- "↑ 3 punt" kaal (layout 13). *Opgelost:* "procentpunt".
- Inklappen niet overal gelijk (layout 14). *Opgelost:* in hoofdstuk 5 staan alleen de berichten open.
- `time()` per dag in `loopDagen` (codebase 4). *Opgelost:* één `$nu` voor de hele pagina.
- Geen pijl bij een vorig percentage van 0% (codebase 5). *Opgelost.*
- Pijl rekende met een onbegrensd percentage (codebase 6). *Opgelost:* begrensd vóór het vergelijken.
- Berichtenteller plafond 30 (codebase 7). *Opgelost:* "30 of meer", en "in deze periode" in plaats van "nieuw".
- `inklap()` ontleedt eigen HTML (codebase 8). *Zo gelaten:* bij een afwijkende sectie klapt hij niet in maar breekt er niets, en de PHP-test controleert de koppen. Een ombouw naar losse strings is meer werk dan het waard is voor een pagina van één lezer.
- Noemer van de warmtekleur (codebase 9). *Opgelost:* geopend plus hervat, begrensd op 100%, geen kleur bij minder dan 3.

## In orde volgens de reviewers
Geen horizontaal scrollen van de pagina, de inhoudsopgave springt goed, de pagina is met Tab en Enter te
bedienen, de escaping is in orde (CSP ongewijzigd), er zijn geen notices bij randgevallen en geen syntaxis
die PHP 7.4 mist. Hoofdstuk 4 ingeklapt maakt de pagina een stuk korter.
