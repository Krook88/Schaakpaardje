# Vierendertigste review: deelplaatjes per pagina (2026-11-04)

Fase: "volgende niveau", ronde 9. Branch `volgende-niveau`. De reviewers zijn rechtstreeks gestart.

**Oordeel na verwerking: GO voor deze fase.** Er is niets blokkerends. `check` en `doorloop` zijn groen. De build controleert nu 206 verwijzingen (`og:image` en `twitter:image`), ook met een basePath.

## Wat er gebouwd is
- `npm run deelbeelden` (`scripts/deelbeelden.ts`) maakt 28 plaatjes van 1200×630 in `public/og/`: 15 werelden, 12 schaakregels en schaakclub. Elk plaatje is 51–83 kB.
- Lespagina's delen het plaatje van hun wereld, schaakregelpagina's hun eigen plaatje, en /schaakclub ook.
- De overige pagina's houden `og.png`.

## Schaakmeester
- Bij elke regelpagina staat het goede stuk, en de uitleg en termen kloppen. Mat wordt niet vóór wereld 10 genoemd. Het plaatje van wereld 10 hoort alleen bij de lessen van die wereld, en dat is in orde.
- **Klein: bij pat stond "geen zet meer".** *Opgelost* in de content: "Niet schaak, maar geen geldige zet meer: remise." De contentcontrole is groen.
- **Klein: het raster bij "schaakbord opzetten" was 5×5.** *Opgelost:* er staat nu een bordje van 8×8 met rechtsonder een licht veld.
- **Klein: "En hij kan dame worden!" (wereld 6) en de dubbele stap van de pion.** *Niet aangepast:* dat is een versimpeling en geen onwaarheid, en de regelpagina zegt het volledig.

## Layout
- **Belangrijk: de voettekst op de balk had te weinig contrast** (Weide 2,94, Schaak 2,93). *Opgelost:* de balk heeft nu overal `hsl(toon 45% 30%)`.
- **Belangrijk: ⚡ (Schaakmeer) tekende als een lijntje.** *Opgelost* met U+FE0F: hij staat nu in kleur.
- **Belangrijk: koppen liepen tot ±15 px van de rand.** *Opgelost:* lange koppen krijgen een kleinere letter, en de tekstkolom is maximaal 600 px breed.
- **Klein: "L-" / "sprong" en weesjes.** *Opgelost* met een koppelteken dat niet afbreekt en een harde spatie voor het laatste woord.
- **Klein: volle kaartjes en een kop van 4 regels.** *Opgelost* door de kleinere letter: nu maximaal 2 regels.
- **Klein: de pijl bij en passant zei weinig.** *Opgelost:* er staat nu een pion.

## Conversie
- Afmeting en grootte zijn in orde. Titel en plaatje kloppen per pagina.
- **/schaakclub verdient een eigen plaatje.** *Opgelost.*
- **Klein: de leeftijd ontbrak.** *Opgelost:* de voetbalk zegt nu "· 3–10 jaar".
- **Klein: WhatsApp snijdt soms een vierkant uit.** *Niet getest:* daarvoor is een echte telefoon nodig. Het staat als testpunt op het scorebord.
- **/lessen en het diploma.** *Niet gedaan:* het diploma kan alleen een algemeen plaatje krijgen en is geen deelbare URL. Dat hangt samen met de open vraag aan Kaj.

## Codebase
- **Belangrijk: met een basePath meldde de controle ten onrechte dat alles bestond.** *Opgelost:* `deelkaart` zet de basePath voor het pad, en de controle eist dat prefix. Met `NEXT_PUBLIC_BASE_PATH=/proef` bewezen.
- **Klein: alleen `og:image`, afhankelijk van de attribuutvolgorde, en geen fout bij 0 gevonden.** *Opgelost:* de controle kijkt nu ook naar `twitter:image`, de volgorde maakt niet meer uit, en 0 gevonden is een fout.
- **Klein: een relatief pad liet de controle crashen.** *Opgelost:* `new URL(inhoud, basis)`.
- **Klein: plaatjes kunnen stil verouderen.** *Gedocumenteerd* in de kop van het script: opnieuw draaien bij een tekstwijziging.
- **Klein: geen escaping.** *Opgelost.*
- **Klein: plaatjes hangen af van de machine, en elke generatie is 2 MB in git.** *Geaccepteerd,* met de afspraak om alleen opnieuw te maken als de tekst verandert.
