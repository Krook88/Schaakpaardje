# Zevenenzestigste review: drie nieuwe schaakregelpagina's en de bovenbalk als h1 (2026-11-18)

Scope: 723b831..16ee94a. c559844 (bovenbalk-titel van h2 naar h1, `kop="p"` op het diploma,
doorloopregel "precies één hoofdkop", raakvlak "Bekijk alle lessen" op /over), 25462f5 (pagina's
`schaaknotatie`, `vork` en `penning`, met tests en deelplaatjes; vork en penning onder "En dan slim
spelen"), 16ee94a ('gepend' uitgelegd). Doel: meer bezoekers via Google. Reviewers: alle vier. De
coördinator kon in zijn run zelf geen reviewers starten; ze zijn vanuit de hoofdsessie gestart en
hier gebundeld.

`npm run check` groen (646 tests). Doorloop 83/83 los gedraaid; in de review 82/83, met de live-regel
rood door een poortconflict tussen gelijktijdige runs (codebase 3), niet door deze diff.

**Oordeel: NO-GO** tot het blokkerende punt is opgelost. Daarna GO; de belangrijke punten in dezelfde
ronde.

## Blokkerend
- **Vork: "een koning die schaak staat, moet eerst zelf weg"** (schaakmeester 1, `schaakregels.ts:845`). Fout: uit schaak kan ook door slaan of ertussen zetten, en wereld 9 leert die drie manieren. Ook "het andere stuk blijft onbeschermd achter" is niet altijd waar. Voorstel: "moet eerst uit het schaak. Dan is er geen tijd om het andere stuk te redden."

## Belangrijk
- **Penning: "mag helemaal niet weg" is te sterk** (schaakmeester 2, `:886`, `:892`). Een gepend stuk mag niet van de lijn af, maar wel langs de lijn schuiven of de aanvaller slaan. Voor het paard in de animatie klopt het toevallig.
- **Een jong kind komt via vork of penning in wereld 13 terecht** (conversie B1). De hoofdknop en de eindknop "Begin met Schaakmaatje" gaan naar tactiek-1/2 (`minLeeftijd: 9`). Voorstel: een tweede regel "Nog nooit geschaakt? Begin bij les 1", en de eindknop naar weide-1 of hernoemd.
- **Elke lespagina heeft in de statische HTML twee h1's** (codebase 1, conversie K1; `LessonPlayer.tsx:507` + `LesUitleg.tsx:45`). Komt door deze release. De doorloop telt na het laden en ziet het niet. Voorstel: `kop="p"` in de `!geladen`-tak, en een controle op `out/**/index.html`.

## Klein
- "Lijn" betekent op de penningpagina ook diagonaal, op de notatiepagina a–h (schaakmeester 3).
- Opheffen van een penning: alleen "koning opzij" genoemd; ook ertussen zetten en de aanvaller slaan (schaakmeester 4).
- notatie-3 gaat over de opening, niet over notatie (schaakmeester 5).
- Twee gelijke stukken naar hetzelfde veld (Tad1) ontbreekt (schaakmeester 6, optioneel).
- H1 van de notatiepagina mist het zoekwoord "Schaaknotatie" (conversie K2).
- /schaakregels/ heeft boven de vouw geen knop naar de app (conversie K3, bestond al).
- Titels van vork en penning zijn 71 tekens met het achtervoegsel (conversie K4, in lijn met de rest).
- /stal/ en /opfrissen/ hebben in de statische HTML geen h1 (codebase 2).
- Doorloop: PHP voor live spelen staat vast op poort 4176 (codebase 3).
- Vorktest bewijst de aanval op a8 via een omweg (codebase 4, optioneel).
- Lichte beeldmerktegel: tekst 2,41:1 op groen, het meest zichtbaar bij 'e4' (layout).
- "Hierna" op de laatste pagina springt terug naar het opzetten; "Meer schaakregels" dekt vork en penning niet (layout).
- Focusrand van "Bekijk alle lessen" zit strak om de tekst (layout).

## In orde volgens de reviewers
- Notatie, vork- en penninganimaties schaakkundig juist en dezelfde stellingen als de lessen; termen 'gepend' en 'pennen' zijn gangbaar; geen `oefenEerst` nodig.
- De kopwissel is onzichtbaar: in 90 combinaties van scherm, formaat en thema gemeten gelijk.
- Titels, omschrijvingen, canonicals, sitemap, interne links in beide richtingen, hoofdknop boven de vouw.
- Geen nieuwe afhankelijkheden, geen netwerkverkeer, geen tracking; de nieuwe pagina's worden per pad geteld.
