# Tweeëndertigste review: raakvlakken (2026-11-04)

Fase: "volgende niveau", ronde 7. Branch `volgende-niveau`. De reviewers zijn rechtstreeks gestart.

**Oordeel na verwerking: GO voor deze fase.** Er is niets blokkerends. `check` en de doorloop zijn groen, en `scripts/raakvlakken.mjs` meet 0 te kleine raakvlakken op 8 schermen, op 360 én 390 breed.

## Wat er veranderd is
- Kopknoppen gaan van 56 naar 64 px.
- De luisterknop van Pip heeft nu een raakvlak van 64 px (was 46). De zichtbare cirkel blijft 52 px.
- De kleine Pip (zelf een knop) gaat van 52 naar 64 px.
- `.btn` (alle knoppen) gaat van 56 naar 64 px. Daarmee halen ook partij, minispel en les de lat.
- De knop "laat de uitleg nog eens zien" in de fasebalk gaat van 44 naar 64 px.
- Haltes op de kaart van een smalle telefoon gaan van 62 naar 64 px.
- Bordvelden op 360 breed gaan van 41 naar 44 px: op smalle telefoons loopt het bord tot vlak bij de rand, in elke les, partij en elk minispel.
- Links op de startpagina gaan van 44 naar 48 px.

## Schaakmeester
- Aan engine, content en bordweergave is niets veranderd. Geen bevindingen.

## Conversie
- De CTA staat op 360, 375 en 390 breed ruim boven de vouw (255 tot 430 px speling). Vanaf `/` is het 1 tik naar de les.
- **Klein: de kop op de schaakregelpagina's is niet nagelopen.** *Gedekt:* de kop is 8 px hoger geworden, en de raakvlakkenmeting vindt niets.

## Layout
- **Belangrijk: bordvelden waren 41 px op 360 breed, en het script sloeg ze over.** *Opgelost:* het bord loopt rand tot rand op ≤ 390 staand, met velden van 44 px. Het script meet nu ook het bordveld (lat 44) en meet op 360 breed.
- **Belangrijk: de focusring van de luisterknop sneed door de ballon.** *Opgelost* met `outline-offset: -4px`. De ring ligt nu om de cirkel.
- **Klein: Pip is een knop van 52 px.** *Opgelost:* 64 px.
- **Klein: het script miste schermen en soorten raakvlakken.** *Opgelost:* het meet nu ook partij, minispel, diploma, `input`/`select`/`label`, en de lesopgave na doortikken. Daarmee vond het nog 21 te kleine raakvlakken, die hierboven zijn opgelost.
- **Klein: zinnen van drie regels in de ballon.** *Nagekeken:* op 360 breed staat de zin van weide-1 op drie regels, en het bord blijft volledig in beeld na het scrollen naar de opgave.
- Het contrast van de cirkel in het donkere thema is ongeveer 6:1. In orde.

## Codebase
- **Klein: `--boven-bord` rekent nog met een kop van 84 px.** *Opgelost:* het commentaar zegt nu 92 px. De doorloop bewijst dat het bord past: op 1024×768 eindigt het op 743 px, de pagina is 768 px.
- **Klein: het meetfilter liet elke inline-link door.** *Opgelost:* het slaat nu alleen links over die in een `<p>` staan.
- **Klein: de meetlogica staat twee keer.** *Niet opgelost:* de doorloop is bewust één los script, zonder imports van de rest. `raakvlakken.mjs` is de uitgebreide versie en de doorloop de bewaker op drie schermen.
- `:active` en de focus van de luisterknop zijn in orde.
