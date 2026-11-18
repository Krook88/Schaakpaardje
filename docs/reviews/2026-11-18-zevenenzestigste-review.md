# Zevenenzestigste review: drie nieuwe schaakregelpagina's en de bovenbalk als h1 (2026-11-18)

Scope: 723b831..16ee94a. c559844 (bovenbalk-titel van h2 naar h1, `kop="p"` op het diploma,
doorloopregel "precies één hoofdkop", raakvlak "Bekijk alle lessen" op /over), 25462f5 (pagina's
`schaaknotatie`, `vork` en `penning`, met tests en deelplaatjes; vork en penning onder "En dan slim
spelen"), 16ee94a ('gepend' uitgelegd). Doel: meer bezoekers via Google. Reviewers: alle vier. De
coördinator kon in zijn run zelf geen reviewers starten; ze zijn vanuit de hoofdsessie gestart en
hier gebundeld.

**Oordeel bij de review: NO-GO** (één schaakfout). **Na verwerking: GO.** `npm run check` groen
(646 tests, nieuw: elke geëxporteerde pagina precies één h1), doorloop 83/83.

## Blokkerend
- **Vork: "een koning die schaak staat, moet eerst zelf weg"** (schaakmeester 1). *Opgelost:* "moet eerst uit het schaak. Dan is er geen tijd om het andere stuk te redden." Ook de beschrijving van de animatie zegt nu "uit het schaak" in plaats van "weg".

## Belangrijk
- **Penning: "mag helemaal niet weg" is te sterk** (schaakmeester 2). *Opgelost:* het antwoord zegt "mag niet opzij", en het eerste deel: "mag niet van die lijn af … Kan het gepende stuk zelf over die lijn lopen, zoals een loper op een diagonaal of een toren op een rij, dan mag het wel langs de lijn schuiven, en de aanvaller slaan. Een paard kan dat nooit."
- **Een jong kind komt via vork of penning in wereld 13 terecht** (conversie B1). *Opgelost:* is de oefenles uit een wereld met `minLeeftijd` ≥ 8, dan staat onder de hoofdknop én onder de eindknop "Voor kinderen die de stukken al kennen. Nog nooit geschaakt? Begin bij de eerste les". De eindknop heet daar "Oefen dit met Pip" in plaats van "Begin met Schaakmaatje". Geldt ook voor pat, rokade en notatie. De leerlijn verandert niet.
- **Elke lespagina had in de statische HTML twee h1's** (codebase 1, conversie K1). *Opgelost:* de bovenbalk krijgt `kop="p"` zolang de tekstversie (met eigen h1) staat. Vastgelegd in `scripts/hosting-klaar.ts`: `hoofdkopFouten()` laat de build falen als een `index.html` in `out/` niet precies één h1 heeft. Die controle vond ook de offlinepagina (nul h1's); die kreeg een verborgen h1 "Even geen internet".

## Klein
- "Lijn" ook voor een diagonaal (schaakmeester 3). *Opgelost:* "een rij, een lijn of een diagonaal" in het antwoord, het eerste deel, de animatie, het oefenen thuis en de vraag "Welke stukken kunnen pennen?".
- Opheffen van een penning (schaakmeester 4). *Opgelost:* "de koning opzij zetten, iets ertussen zetten of de aanvaller slaan".
- notatie-3 is een openingsles (schaakmeester 5). *Opgelost:* uit `lessen`, met de reden in een commentaar.
- Twee gelijke stukken naar hetzelfde veld (schaakmeester 6). *Opgelost:* één zin met Tad1 en Pbd2.
- H1 van de notatiepagina zonder "Schaaknotatie" (conversie K2). *Opgelost:* "Schaaknotatie: hoe schrijf je zetten op?"; deelplaatje opnieuw gemaakt.
- /schaakregels/ zonder knop boven de vouw (conversie K3). *Opgelost:* "Probeer de eerste les, gratis" onder de inleiding.
- Titels van 71 tekens (conversie K4). *Zo gelaten:* in lijn met de bestaande pagina's (66–77), en het zoekwoord staat vooraan.
- /stal/ en /opfrissen/ zonder h1 in de statische HTML (codebase 2). *Opgelost:* tot het laden tekenen ze alvast de bovenbalk in plaats van een lege pagina; de nieuwe bouwcontrole houdt het vast.
- PHP voor live spelen vast op poort 4176 (codebase 3). *Opgelost:* `vrijePoort()` in de doorloop vraagt het systeem om een vrije poort.
- Vorktest via een omweg (codebase 4). *Opgelost:* de test vraagt `destinations('c7')` rechtstreeks en verwacht a8.
- Lichte beeldmerktegel 2,41:1 (layout). *Opgelost:* tekens krijgen dezelfde donkere rand en schaduw als de stukken.
- "Hierna" op het laatste onderwerp sprong terug; kop "Meer schaakregels" (layout). *Opgelost:* op het laatste onderwerp een link naar het overzicht; de kop heet "Meer over schaken".
- Focusrand van "Bekijk alle lessen" strak om de tekst (layout). *Opgelost:* 6 px padding met gelijke negatieve marge, en dezelfde focusrand als de knoppen (3 px, offset 3 px).

## In orde volgens de reviewers
- Notatie, vork- en penninganimaties schaakkundig juist en dezelfde stellingen als de lessen; termen 'gepend' en 'pennen' zijn gangbaar; geen `oefenEerst` nodig.
- De kopwissel is onzichtbaar: in 90 combinaties van scherm, formaat en thema gemeten gelijk.
- Titels, omschrijvingen, canonicals, sitemap, interne links in beide richtingen, hoofdknop boven de vouw.
- Geen nieuwe afhankelijkheden, geen netwerkverkeer, geen tracking; de nieuwe pagina's worden per pad geteld.
