# Zeventigste review — zoektitels van vier regelpagina's

**Datum:** 22 november 2026
**Scope:** commit `8de9d5f` op `claude/beautiful-cerf-tonh0i`: alleen `zoektitel` en `omschrijving` van schaakbord-opzetten, waarde-van-de-stukken, schaak-en-mat en pat (`src/content/schaakregels.ts`).
**Aanleiding:** Search Console, 28 dagen: 3.541 vertoningen, 17 klikken (CTR 0,5%), positie ~10. Deze vier pagina's: ruim 2.200 vertoningen, 3 klikken. De oude titels gaven het antwoord weg.
**Werkwijze:** de coördinator kon in deze omgeving geen reviewers starten; de vier reviewers zijn rechtstreeks gestart en hun bevindingen hier gebundeld.

## Oordeel: GO, na de drie belangrijke punten

Niets blokkerends. Schaakkundig klopt alles en er komt geen matbegrip naar het kind. Maar drie omschrijvingen beloven iets wat de pagina niet laat zien. Dat eerst rechtzetten.

## Belangrijk
1. **Schaak-en-mat belooft "de drie uitwegen op een bewegend bord"**, maar het bord laat alleen weglopen zien (schaakmeester 1).
2. **Waarde belooft "een bewegend bord over slim ruilen"**, maar het bord laat het duurste stuk kiezen zien, geen ruil (schaakmeester 2).
3. **Pat belooft "waarom het gelijkspel is"**, maar de pagina zegt alleen dát het remise is (schaakmeester 3).
4. **Waarde: het zoekwoord ontbreekt.** 277 + 17 zoekopdrachten gaan over "minste waarde", en het woord "waarde" staat nergens meer in titel of omschrijving. Voorstel: "Welk schaakstuk heeft de minste waarde? Alle punten op een rij" (conversie 1).
5. **Schaakbord-opzetten: "opzetten" valt weg** (H1, slug, 18 zoekopdrachten). Voorstel: "Hoe zet je een schaakbord klaar? Stap voor stap uitgelegd", met "Schaakbord opzetten:" vooraan de omschrijving (conversie 2).

## Klein
6. "Gratis oefenen met Pip": een nieuwe ouder weet niet wie Pip is. Beter overal "gratis oefenen voor je kind" (conversie 3).
7. "Bewegend bord" staat in alle vier de titels. Dat herhaalt zich en zegt een ouder weinig (conversie 4).
8. Opzetten: "staat de dame links of rechts" wordt alleen omgekeerd beantwoord (via de koning). "Zet het bord klaar" klopt niet, want het bord doet het voor (schaakmeester 4).
9. Opzetten: de oefenknop gaat naar `weide-1` ("Licht en donker"). `weide-3` ("Wit rechtsonder") sluit beter aan (schaakmeester 5).
10. Waarde: zeg "de pion is het minst waard" met zoveel woorden. "De koning heeft geen waarde" kan gelezen worden als "minst waard" (schaakmeester 6).
11. Al bestaand: schaak-en-mat oefent in `schaak-1` (wereld 9, minLeeftijd 7) zonder de verwijzing "Begin bij de eerste les", want die drempel ligt op 8 (schaakmeester 7).
12. Al bestaand: `tests/schaakregels.test.ts:43` laat 160 tekens toe, terwijl `MAX_OMSCHRIJVING` 155 is (codebase).
13. "dame schaken" (34 zoekopdrachten) dekt geen van de titels. Iets voor later (conversie 5).

## Per reviewer
- **Schaakmeester:** schaakkundig juist. Punten 1–3 belangrijk, 8–11 klein.
- **Conversie:** beter dan de oude titels. Op 375×667 staat de knop "Oefen dit met Pip, gratis" boven de vouw, en na één tik volgt een les zonder profiel. Over 4 weken de CTR per pagina vergelijken bij gelijke positie.
- **Codebase:** `npm run check` is groen. De teksten komen goed in de title, meta, og, twitter en JSON-LD, de escaping is goed, en niets verwacht nog de oude tekst.
- **Layout:** de velden komen nergens op het scherm. Niets te beoordelen.

## Afhandeling
_(in te vullen na verwerking)_
