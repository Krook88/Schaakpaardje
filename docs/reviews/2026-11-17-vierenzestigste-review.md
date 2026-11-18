# Vierenzestigste review: teller "Waar verbeteren?" en meting van Pips stem (2026-11-17)

Scope: commit 37b17dc (diff 89e6111..37b17dc, 11 bestanden). Vier reviewers: schaakmeester, layout,
codebase, conversie. (De coördinator kon in zijn sessie geen reviewers starten; ze zijn vanuit de
hoofdsessie gestart en hier gebundeld.)

**Oordeel na verwerking (ronde 2): GO.** De belangrijke punten zijn opgelost; wat bewust niet gedaan is, staat erbij met de reden.

Oordeel ronde 1: **GO voor kinderen, nog niet voor het dashboard.** Niets is blokkerend: aan de regels, de
lessen en het gedrag van de app verandert niets (`npm run check` groen, doorloop 79/79, privacy in
orde). Maar meerdere metingen tellen verkeerd, en de adviezen op het dashboard trekken conclusies die de
gegevens niet dragen. Wie ze nu opvolgt, kan een uitleg inkorten of de stem aanpassen om de verkeerde
reden. Daarom eerst de belangrijke punten hieronder verwerken, dan pas mergen.

## Belangrijk: metingen die verkeerd tellen
- **Doorgetikt telt de eerste, ontgrendelende tik mee** (conversie 4, codebase B2). Bij een direct geopende les wacht zin 1 op de eerste aanraking; die tik start Pip en telt dan als "doorgetikt terwijl Pip praatte". `praatNu()` staat ook al aan tijdens het laden van de mp3, en blijft aan op toestellen waar de robotstem geen `onend` geeft. Voorstel: `praatNu` = audio speelt echt (`!paused && !ended`) of `speechSynthesis.speaking`, en de tik die het geluid ontgrendelt niet meetellen. Doorloopregel: rustig tikken op een direct geopende les geeft "geen". *Opgelost:* `praatNu(minMs)` kijkt naar echt klinkend geluid (`playing`/`onstart`, en `!paused && !ended` of `speechSynthesis.speaking`); het lesscherm telt pas na 800 ms hoorbaar, dus de ontgrendelende tik valt erbuiten. Doorloopregel `uitlegTeltEenKeer`: rustig tikken op een direct geopende les geeft "geen".
- **Doortik-tabel mengt 'weg' en 'verder'** (codebase B3). Een kind dat bij zin 1 weggaat staat onder "luisterde elke zin uit". Voorstel: `door` alleen tellen bij `einde === 'verder'`. *Opgelost:* `door` telt alleen bij `einde === 'verder'`; de tabel heet "uitgespeelde uitleggen, stem aan".
- **Onterecht 'apparaat' na een AbortError** (codebase B1). Op Terug tikken terwijl de mp3 laadt laat de robot de oude zin alsnog zeggen, en telt als robotstem. Bestaande fout, maar vervuilt nu de meting. Voorstel: `AbortError` als stoppen behandelen, doorloopregel erbij. *Opgelost:* `AbortError` is stoppen, er volgt geen robotstem meer. *Geen doorloopregel:* een trage mp3 vraagt opnames, en de doorloop draait zonder (manifest 404); de reden staat als commentaar bij de catch.
- **Stem aan tegenover uit is geen eerlijke vergelijking** (conversie 2, codebase klein 1 en 7, schaakmeester klein). Wie direct binnenkomt en weggaat zonder te tikken, hoorde Pip nooit maar telt als "weg met stem aan"; "stem uit" zijn vooral terugkerende gebruikers. Voorstel: "weg bij zin 1" (nooit getikt) apart als "weg vóór de eerste tik", buiten de vergelijking; stand vastleggen bij de eerste zin; advies "kán wijzen op". *Opgelost:* weg bij zin 1 telt apart als "weg vóór de eerste tik" en valt buiten de vergelijking; de stand van de stem is die bij de start van de les; advies "kán wijzen op", met de kanttekening over de andere groep, ook onder de tabel.
- **Binnenkomst-regel telt bezoeken, geen apparaten, en schaakregellezers als afhakers** (conversie 1, codebase klein 4). Voorstel: "bezoeken zonder geoefende dag", elke nieuw begonnen les meetellen, regel overslaan zonder `lessen.json`, advies over de startpagina alleen als die de grootste binnenkomst is. *Opgelost:* zo gedaan, ook in de trechter ("bezoek op een apparaat zonder geoefende dag"). *Niet gedaan:* de extra eigenschappen `apparaat` en `binnen` op `Les begonnen`: dat verandert een bestaande telling, en een nieuwe eigenschap is eerst een vraag aan Kaj (privacyregel). Voorgelegd in de PR.
- **Eerste les: kijkers tellen als afhakers** (conversie 3). Voorstel: "weg bij zin 1" benoemen als waarschijnlijk kijken; inkorten alleen adviseren bij weg bij zin 2 of 3. *Opgelost:* de bevinding splitst "zonder één tik weg (zin 1)" en "later"; gaan de meesten weg vóór een tik, dan luidt het advies "vaak kijkers, inkorten helpt weinig", bij de eerste les met de opmerking dat alle ouderknoppen daarheen gaan.

## Belangrijk: adviezen die de didactiek de verkeerde kant op duwen (schaakmeester)
- **"Uitleg inkorten" kan een regel laten verdwijnen.** De laatste zin draagt vaak de grens van de regel ("Maar nooit schuin."). Voorstel: "Schrap geen regel of uitzondering; verplaats liever een zin naar meedoen of maak de wijs-animatie sterker; kort alleen begroeting en overgangszinnen." Bij wereld 9 en later: afhaken in de uitleg is daar normaal. *Opgelost:* elk inkortadvies draagt die zin nu letterlijk (`NIET_SCHRAPPEN`), plus "controleer daarna of het vastlopen niet stijgt". Vanaf wereld 9 (nummer uit `lessen.json`, nu met `nr` en `leeftijd`): "afhaken in de uitleg is daar normaal". Boven de lijst staat: vragen om na te lopen, geen opdrachten.
- **"Spreektempo hoger" gaat tegen het tempo per modus in** (pip 0,8 / ontdekker 1 / schaker 1,2) en raakt de kleuters. Voorstel: weghalen; advies "zinnen korter zonder regel te schrappen; kijk of de animatie af is als het kind doortikt". *Opgelost:* weggehaald; het advies noemt juist dat kleuters bewust 0,8 krijgen en dat oudere kinderen sneller lezen dan Pip praat. De PHP-test eist dat "spreektempo standaard" niet meer voorkomt.
- **Alle adviezen duwen naar korter en sneller; niets meet wat inkorten kost.** Voorstel: regel 1 en 3 per les koppelen ("uitleg mist misschien iets" als de eerste opgave veel vastlopers heeft), en bij elk inkortadvies "controleer daarna of het vastlopen niet stijgt". *Opgelost:* regel 1 en 3 gekoppeld (`vastInBegin`: veel vastlopers in de eerste opgave → "de uitleg mist misschien iets, niet inkorten"); het opgave-advies zegt "maak hem niet makkelijker door het leerpunt eruit te halen".

## Belangrijk: layout
- **Tabel "Per les" in Pips stem verbergt op 390 px een hele kolom** zonder zichtbare schuifbalk. Voorstel: alleen de tabel laten scrollen (omhulsel), "Weg bij zin" laten afbreken, kortere kop. *Opgelost:* elke tabel op het dashboard zit nu in een eigen schuifvak, dus kop en uitleg schuiven niet meer mee; kortere koppen en afbrekende cellen.
- **Kolom "Waar" in Geluid wordt midden in een pad afgekapt.** Voorstel: elk pad op een eigen regel. *Opgelost:* elk pad op een eigen regel.

## Belangrijk: tests (codebase B4)
- De koppeling in LessonPlayer (geen melding bij kijkTerug of hervatten, 'weg' bij unmount, één 'verder') en de rekenregels van `bevindingen()` zijn niet getest. Voorstel: PHP-test met gemaakt dagbestand per regel, inclusief randen; doorloopregel kijken → opgave → nog eens kijken → precies één 'Uitleg'. *Opgelost:* PHP-test "Waar verbeteren? rekent goed" (precies 30%, net eronder, wereld 9, kijkers, doortikken, geen notices) en doorloopregel `uitlegTeltEenKeer`, die de echte tellingen afvangt.

## Klein
- Herhaalde (al afgemaakte) lessen tellen mee als doortikken (schaakmeester). *Opgelost:* een les met sterren telt geen uitleg.
- "Speel hem als kind van 5" past niet bij latere werelden; "te moeilijk?" kan het leerpunt weghalen (schaakmeester). *Opgelost:* de leeftijd van de wereld komt uit `lessen.json`; het opgave-advies is herschreven.
- Geluid-regel vuurt al bij 3 keer, zonder noemer (conversie 6). *Opgelost:* netto uit (uit min aan), en minstens 5% van de bezoeken.
- Even weg (tablet op slot) telt als 'weg'; dat staat niet in de toelichting (conversie 7, codebase klein 2). *Opgelost:* staat nu in de toelichting.
- Geen startdatum `STEM_VANAF` voor de nieuwe metingen (conversie 8). *Opgelost:* `STEM_VANAF`, getoond in de sectie en in de bevinding zolang er geen gegevens per zin zijn.
- 'Les gestopt' in kijken tijdens het laden, waardoor regel 1 en "Weg bij zin" iets uiteenlopen (codebase). *Opgelost:* "Les gestopt" telt pas na het laden.
- Melder in `useMemo` in plaats van in het effect, zoals `maakStopMelder` (codebase klein 3). *Opgelost:* de melder wordt in het effect gemaakt.
- "Gewicht" mengt eenheden en dezelfde afhakers staan dubbel; dubbele optellingen in dashboard.php (codebase klein 5, 6). *Opgelost:* geen vermenigvuldigers meer ("wat het vaakst voorkwam"), en de optellingen staan één keer (`somUitleg`, `$nieuwApparaat`). *Zo gelaten:* de overlap tussen regel 1 en de aan/uit-regel; die laatste telt nu alleen wie na de eerste tik wegging.
- Balken in "Hoe klonk Pip?" lopen buiten beeld; labels per soort niet te onderscheiden; regels te lang op breed scherm; kopregels en hoofdletters in tabellen (layout 3–6). *Opgelost:* de balk schaalt mee (`min(160px, 22vw)`), het label heeft een rand en is 13 px, regels zijn hoogstens 75 tekens breed, kopregels en "Stem aan/uit". *Niet gedaan:* een eigen kleur per soort; het label staat er als woord.
- Tekst op het ouderscherm: geruststelling vooraan, "niet per kind", "stem van het apparaat" in plaats van "robot", in twee alinea's (layout 7, conversie 5). *Opgelost:* "Niets over je kind: geen naam, leeftijd, cookie of ID" staat vooraan, daarna de lijst, nu ook met "waar een opgave lastig was". *Niet gedaan:* uitklapbaar; met twee alinea's is het kort genoeg.

## In orde volgens de reviewers
Schaakregels, stellingen en didactische volgorde ongewijzigd; kijkTerug en hervatten correct afgevangen;
geen notices onder PHP 8.3 met E_ALL op vreemde invoer, niets wat PHP 7.4 mist; privacy: alleen les-id,
vaste keuzewaarden, `zin` begrensd, in beide vaste lijsten, ouderscherm bijgewerkt; contrast overal
ruim voldoende, geen horizontaal scrollen van de pagina.
