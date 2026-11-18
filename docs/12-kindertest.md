# 12. De kindertest

Zesenzestig reviews hebben de app strak gemaakt, maar de "wow"-score van de reviewers blijft
rond de 7 hangen (zie `volgende-niveau.md`). Een reviewer kan niet zeggen of een kind van vier
het leuk vindt. Een kind wel. Dit protocol is daarvoor: twintig minuten per kind, en de
uitkomst bepaalt wat er daarna gebouwd wordt.

## Wie
- **Vijf kinderen**, verspreid over de drie leeftijdsgroepen: twee van 4–5, twee van 6–8,
  één van 9–10. Liefst kinderen die nog nooit geschaakt hebben, plus één die het al een
  beetje kan.
- **Eén volwassene die kijkt en schrijft**, en die niet de ouder van het kind is. Ouders
  helpen te snel.
- Toestemming van de ouder vooraf. Geen video en geen foto's van het kind; alleen
  aantekeningen, zonder naam (noteer "kind A, 5 jaar").

## Voorbereiding
- Een tablet of telefoon met **een schone browser** (privévenster), zodat het kind begint
  als een nieuwe bezoeker.
- Geluid aan, niet te zacht. Pip praat; dat is de helft van de les.
- Open `https://schaakmaatje.nl/` en geef het apparaat aan het kind. Verder niets.

## De regel
**Niet helpen.** Ook niet als het kind vastloopt. Tel tot tien. Pas als het kind echt
wil stoppen of verdrietig wordt, mag je één zin zeggen: "Wat zou Pip bedoelen?" Schrijf
op dat je dat zei, en waar.

## Wat het kind doet (20 minuten)

| Tijd | Opdracht aan het kind | Wat je wilt weten |
|---|---|---|
| 0–2 | "Dit is een spelletje. Kijk maar wat je kunt doen." | Vindt het zelf de weg naar de eerste les? Hoeveel tikken? |
| 2–10 | (niets zeggen) | Begrijpt het wat Pip vraagt? Waar twijfelt het, waar tikt het willekeurig? |
| 10–15 | Als het kind een les af heeft: "Wil je er nog een?" | Wil het door? Kiest het zelf de volgende? |
| 15–20 | Bij 6+: "Kun je tegen een dier spelen?" | Vindt het /spelen? Snapt het de partij? |
| na afloop | "Wat vond je het leukst? En het stomst?" | Letterlijk opschrijven. |

## De invullijst (per kind)

```
Kind: __  leeftijd: __  al eens geschaakt: ja / nee   datum: ____
Apparaat: tablet / telefoon, staand / liggend

Tikken tot de eerste opgave: __      tijd: __ s
Lessen afgemaakt: __                 sterren: __
Wilde na de eerste les door:         ja / nee / twijfel

Vastgelopen (scherm, wat het kind deed, hoe lang):
  1.
  2.
  3.

Willekeurig getikt (waar):
Pip niet begrepen (welke zin):
Gelachen of "yes!" (waar):
Wilde stoppen (waar, waarom):
Ik heb geholpen (waar, wat ik zei):

Leukst (letterlijk):
Stomst (letterlijk):
```

## Daarna
1. Leg de vijf lijsten naast elkaar. Een punt waar **twee of meer kinderen** vastliepen, is
   een blokkerende bevinding. Eén kind is een aanwijzing.
2. Kijk in het dashboard van de teller (`/teller/dashboard.php`) of hetzelfde afhaakpunt
   daar ook zichtbaar is. Klopt het met de echte bezoekers, dan heeft het voorrang.
3. Zet de bevindingen als review in `docs/reviews/` (`JJJJ-MM-DD-kindertest.md`), net als
   bij de andere reviews: van blokkerend naar klein, met per punt wat er gedaan is.
4. Een fout die een kind laat vastlopen en die te automatiseren is, krijgt ook een regel in
   `npm run doorloop`. Zie CLAUDE.md.

## Waar we op sturen
Uit `10-risicos-en-kpis.md`, en te volgen in het dashboard:
- meer dan 70% van de kinderen die een wereld beginnen, maakt hem af;
- een op de drie komt binnen een week terug;
- bij de kindertest: geen enkel kind loopt vast vóór de eerste ster.
