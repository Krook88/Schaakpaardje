# Eenentwintigste review, 21 oktober 2026

Scope: `5f92df3` en de herstelcommits erna op `claude/wizardly-cray-9vevs8`. Alleen tekst op
`/schaakclub/`. Op verzoek van Kaj staat er nu dat Schaakmaatje aansluit op de aanpak van de
clubs.

Kaj vroeg om "Schaakmaatje volgt hetzelfde stappenplan". Dat staat er bewust niet:
- `/over/` zegt: "het is niet de Stappenmethode, en het vervangt Stap 1 niet";
- `docs/02-didactiek-en-doelgroep.md` schrijft om auteursrechtelijke redenen voor dat de app
  "gebaseerd op de Nederlandse stappen-didactiek" heet, niet "de Stappenmethode";
- mat komt hier later dan in Stap 1.

Reviewers: schaakmeester (het gaat over de methode) en, voor het eerst, de
conversie-reviewer. De layout-reviewer en de codebase-reviewer zijn overgeslagen: er
veranderen alleen tekst en één tekstlink, geen opmaak of logica.

## Oordeel

**GO.** Niets blokkerends.
- **Schaakmeester:** geen schaakfout, er sluipt geen matbegrip in de leerstof, en de tekst belooft niets wat de app niet waarmaakt. "Makkelijke stukken eerst" klopt met de volgorde van de werelden (toren, loper, dame, paard, koning, pion).
- **Conversie:** de pagina stuurt niemand weg. Er staan 4 tikken tussen binnenkomst en de eerste opgave, zonder te typen, en de hoofdknop gaat naar de app.

## Bevindingen

| | Bevinding | Status |
|---|---|---|
| S1 (belangrijk) | "Alleen mat komt bij ons later" spreekt /over/ tegen: daar staan meer verschillen. | **Opgelost**: "Het grootste verschil is mat". |
| S2 | "Gebaseerd op dezelfde aanpak" klinkt sterker dan /over/. | **Opgelost**: "geïnspireerd op de aanpak van de clubs", net als op /over/. |
| S3 | "Zodat je kind eerst alle stukken goed kent" is te smal: tussen pion en mat zitten ook waarde, aanval en schaak. | **Opgelost**: "als je kind de stukken, slaan, aanvallen en schaak al goed kent". |
| K1 | Na de alinea met het sterkste argument volgt geen link naar de app; de eerstvolgende link gaat naar de schaakbond. | **Opgelost**: tekstlink "Probeer de eerste les" aan het eind van de alinea. |
| K2 | Het argument staat ver onder de vouw. | **Opgelost**: de inleiding zegt nu "geïnspireerd op de aanpak van de clubs, en een aanloop ernaartoe". |

Buiten deze scope: lokaal geven `/audio/manifest.json` en `/sfx/manifest.json` een 404, omdat
de opnames niet in git staan. Dat is bekend en hoort zo (zie de doorloop, `VERWACHTE_404`).
