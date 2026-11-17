# Vierenzestigste review: teller "Waar verbeteren?" en meting van Pips stem (2026-11-17)

Scope: commit 37b17dc (diff 89e6111..37b17dc, 11 bestanden). Vier reviewers: schaakmeester, layout,
codebase, conversie. (De coördinator kon in zijn sessie geen reviewers starten; ze zijn vanuit de
hoofdsessie gestart en hier gebundeld.)

**Oordeel: GO voor kinderen, nog niet voor het dashboard.** Niets is blokkerend: aan de regels, de
lessen en het gedrag van de app verandert niets (`npm run check` groen, doorloop 79/79, privacy in
orde). Maar meerdere metingen tellen verkeerd, en de adviezen op het dashboard trekken conclusies die de
gegevens niet dragen. Wie ze nu opvolgt, kan een uitleg inkorten of de stem aanpassen om de verkeerde
reden. Daarom eerst de belangrijke punten hieronder verwerken, dan pas mergen.

## Belangrijk: metingen die verkeerd tellen
- **Doorgetikt telt de eerste, ontgrendelende tik mee** (conversie 4, codebase B2). Bij een direct geopende les wacht zin 1 op de eerste aanraking; die tik start Pip en telt dan als "doorgetikt terwijl Pip praatte". `praatNu()` staat ook al aan tijdens het laden van de mp3, en blijft aan op toestellen waar de robotstem geen `onend` geeft. *Open.* Voorstel: `praatNu` = audio speelt echt (`!paused && !ended`) of `speechSynthesis.speaking`, en de tik die het geluid ontgrendelt niet meetellen. Doorloopregel: rustig tikken op een direct geopende les geeft "geen".
- **Doortik-tabel mengt 'weg' en 'verder'** (codebase B3). Een kind dat bij zin 1 weggaat staat onder "luisterde elke zin uit". *Open.* Voorstel: `door` alleen tellen bij `einde === 'verder'`.
- **Onterecht 'apparaat' na een AbortError** (codebase B1). Op Terug tikken terwijl de mp3 laadt laat de robot de oude zin alsnog zeggen, en telt als robotstem. Bestaande fout, maar vervuilt nu de meting. *Open.* Voorstel: `AbortError` als stoppen behandelen, doorloopregel erbij.
- **Stem aan tegenover uit is geen eerlijke vergelijking** (conversie 2, codebase klein 1 en 7, schaakmeester klein). Wie direct binnenkomt en weggaat zonder te tikken, hoorde Pip nooit maar telt als "weg met stem aan"; "stem uit" zijn vooral terugkerende gebruikers. *Open.* Voorstel: "weg bij zin 1" (nooit getikt) apart als "weg vóór de eerste tik", buiten de vergelijking; stand vastleggen bij de eerste zin; advies "kán wijzen op".
- **Binnenkomst-regel telt bezoeken, geen apparaten, en schaakregellezers als afhakers** (conversie 1, codebase klein 4). *Open.* Voorstel: "bezoeken zonder geoefende dag", elke nieuw begonnen les meetellen, regel overslaan zonder `lessen.json`, advies over de startpagina alleen als die de grootste binnenkomst is.
- **Eerste les: kijkers tellen als afhakers** (conversie 3). *Open.* Voorstel: "weg bij zin 1" benoemen als waarschijnlijk kijken; inkorten alleen adviseren bij weg bij zin 2 of 3.

## Belangrijk: adviezen die de didactiek de verkeerde kant op duwen (schaakmeester)
- **"Uitleg inkorten" kan een regel laten verdwijnen.** De laatste zin draagt vaak de grens van de regel ("Maar nooit schuin."). *Open.* Voorstel: "Schrap geen regel of uitzondering; verplaats liever een zin naar meedoen of maak de wijs-animatie sterker; kort alleen begroeting en overgangszinnen." Bij wereld 9 en later: afhaken in de uitleg is daar normaal.
- **"Spreektempo hoger" gaat tegen het tempo per modus in** (pip 0,8 / ontdekker 1 / schaker 1,2) en raakt de kleuters. *Open.* Voorstel: weghalen; advies "zinnen korter zonder regel te schrappen; kijk of de animatie af is als het kind doortikt".
- **Alle adviezen duwen naar korter en sneller; niets meet wat inkorten kost.** *Open.* Voorstel: regel 1 en 3 per les koppelen ("uitleg mist misschien iets" als de eerste opgave veel vastlopers heeft), en bij elk inkortadvies "controleer daarna of het vastlopen niet stijgt".

## Belangrijk: layout
- **Tabel "Per les" in Pips stem verbergt op 390 px een hele kolom** zonder zichtbare schuifbalk. *Open.* Voorstel: alleen de tabel laten scrollen (omhulsel), "Weg bij zin" laten afbreken, kortere kop.
- **Kolom "Waar" in Geluid wordt midden in een pad afgekapt.** *Open.* Voorstel: elk pad op een eigen regel.

## Belangrijk: tests (codebase B4)
- De koppeling in LessonPlayer (geen melding bij kijkTerug of hervatten, 'weg' bij unmount, één 'verder') en de rekenregels van `bevindingen()` zijn niet getest. *Open.* Voorstel: PHP-test met gemaakt dagbestand per regel, inclusief randen; doorloopregel kijken → opgave → nog eens kijken → precies één 'Uitleg'.

## Klein
- Herhaalde (al afgemaakte) lessen tellen mee als doortikken (schaakmeester). *Open.*
- "Speel hem als kind van 5" past niet bij latere werelden; "te moeilijk?" kan het leerpunt weghalen (schaakmeester). *Open.*
- Geluid-regel vuurt al bij 3 keer, zonder noemer (conversie 6). *Open.*
- Even weg (tablet op slot) telt als 'weg'; dat staat niet in de toelichting (conversie 7, codebase klein 2). *Open.*
- Geen startdatum `STEM_VANAF` voor de nieuwe metingen (conversie 8). *Open.*
- 'Les gestopt' in kijken tijdens het laden, waardoor regel 1 en "Weg bij zin" iets uiteenlopen (codebase). *Open.*
- Melder in `useMemo` in plaats van in het effect, zoals `maakStopMelder` (codebase klein 3). *Open.*
- "Gewicht" mengt eenheden en dezelfde afhakers staan dubbel; dubbele optellingen in dashboard.php (codebase klein 5, 6). *Open.*
- Balken in "Hoe klonk Pip?" lopen buiten beeld; labels per soort niet te onderscheiden; regels te lang op breed scherm; kopregels en hoofdletters in tabellen (layout 3–6). *Open.*
- Tekst op het ouderscherm: geruststelling vooraan, "niet per kind", "stem van het apparaat" in plaats van "robot", in twee alinea's (layout 7, conversie 5). *Open.*

## In orde volgens de reviewers
Schaakregels, stellingen en didactische volgorde ongewijzigd; kijkTerug en hervatten correct afgevangen;
geen notices onder PHP 8.3 met E_ALL op vreemde invoer, niets wat PHP 7.4 mist; privacy: alleen les-id,
vaste keuzewaarden, `zin` begrensd, in beide vaste lijsten, ouderscherm bijgewerkt; contrast overal
ruim voldoende, geen horizontaal scrollen van de pagina.
