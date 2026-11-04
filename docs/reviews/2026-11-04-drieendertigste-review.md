# Drieëndertigste review: wereld 0–2 offline (2026-11-04)

Fase: "volgende niveau", ronde 8. Branch `volgende-niveau`. De reviewers zijn rechtstreeks gestart.

**Oordeel na verwerking: GO voor deze fase.** Er is niets blokkerends. `check` en `doorloop` zijn groen. De doorloop bewijst offline zes dingen, nadat alleen de startpagina was geopend:
- les loper-2 opent direct;
- het minispel torenjacht opent;
- de kaart opent;
- doortikken van de kaart naar een les werkt;
- een les buiten de voorraad toont de offlinepagina;
- van de offlinepagina kom je naar de kaart.

## Wat er gebouwd is
- `hosting-klaar` zet 51 bestanden (1,3 MB) in de service worker: de HTML, de RSC-bestanden en precies de gebruikte JS, CSS en lettertypen van de startpagina, de kaart, de 9 lessen van wereld 0–2 en hun 3 minispellen.
- Een RSC-verzoek met `?_rsc` vindt zijn voorraad via `ignoreSearch`.
- Nieuwe offlinepagina (`public/offline/`): Pip, de zin "Deze les heeft internet nodig", een uitspreekknop met de stem van het apparaat en één knop van 64 px naar de kaart.

## Schaakmeester
- `src/engine` en `src/content` zijn ongewijzigd. Geen bevindingen.

## Layout
- **Belangrijk: een les die niet offline was (wereld 3) gaf de startpagina voor ouders, onder de URL van de les.** *Opgelost:* de service worker stuurt dan door naar `./offline/`, zodat de adresbalk klopt. De pagina is licht en donker, en de doorloop bewijst de weg terug naar de kaart.
- **Klein: de URL klopte niet met de inhoud.** *Opgelost* met dezelfde doorverwijzing.
- **Klein: minispellen niet helemaal uitgespeeld, en internet dat halverwege uitvalt.** *Niet gedaan:* de doorloop bewijst dat het minispel offline opent. Uitspelen gaat zonder netwerk, want het minispel draait helemaal in de browser.

## Conversie
- Lighthouse A/B, 3 keer: LCP met voorraad 2,5–2,6 s, zonder 2,2–2,5 s. Dat valt binnen de ruis, maar het viel steeds dezelfde kant op.
- **Belangrijk: de belofte "na de eerste keer werkt het ook zonder internet" was te ruim.** *Opgelost:* de startpagina zegt nu "Na het eerste bezoek kun je de eerste lessen ook zonder internet spelen, bijvoorbeeld in de auto." Op /over staat: "De eerste drie werelden werken na het eerste bezoek ook zonder internet; latere lessen zodra je kind ze één keer geopend heeft."
- **Klein: het vooraf laden kan strijden met de eerste les.** *Opgelost:* de service worker wordt pas aangemeld na `load` plus `requestIdleCallback` (maximaal 4 s).
- **Klein: geen opnames van Pip in de voorraad.** *Bewust:* offline spreekt Pip met de stem van het apparaat. De mp3's zijn groot en staan niet in git.

## Codebase
- **Belangrijk: `cache.add` kon de HTML van een vorige uitrol bewaren.** *Opgelost:* overal `cache: 'reload'`.
- **Belangrijk: bij elke uitrol werd 1,3 MB opnieuw opgehaald.** *Opgelost:* gehashte bestanden (`_next/static`, `fonts`) komen uit de vorige cache als ze daar nog staan.
- **Belangrijk: wat genoemd maar niet gevonden werd, was alleen een melding.** *Opgelost:* de build faalt nu, en ook als er geen enkel JS-brokje gevonden wordt (bijvoorbeeld na een Next-upgrade).
- **Klein: de ruime match gold ook voor navigaties.** *Opgelost:* nu alleen voor verzoeken die geen navigatie zijn.
- **Klein: dode code in een ternary.** *Opgelost.* De enkele `../` in CSS-urls werkt via de normalisatie; niet aangepast.
- **Klein: geen unit-test op `vooraadOffline`.** *Niet gedaan:* de buildcontroles hierboven en de offlineregel in de doorloop dekken hetzelfde, op de echte uitvoer.
- **Klein: de doorloop wachtte op een vast getal (40).** *Opgelost:* hij leest de naam van de cache en de lengte van VOORAF uit `sw.js` en wacht precies daarop.
- **Klein: de installatie wacht op de hele voorraad.** *Geaccepteerd,* zoals de reviewer voorstelt.
