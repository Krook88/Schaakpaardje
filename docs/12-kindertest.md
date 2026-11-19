# 12. De kindertest

Zesenzestig reviews hebben de app strak gemaakt, maar de "wow"-score van de reviewers blijft
rond de 7 hangen (zie `volgende-niveau.md`). Een reviewer kan niet zeggen of een kind van vier
het leuk vindt. Een kind wel.

Dit document heeft twee delen. **Deel 1** is voor wie de test afneemt: een ouder, opa of
juf, zonder technische kennis. **Deel 2** is voor Kaj, daarna.

---

## Deel 1 — Voor wie de test afneemt

Twintig minuten per kind. Je kijkt en schrijft op; je helpt niet.

### Wie
- **Vijf kinderen**: twee van 4–5 jaar, twee van 6–8, één van 9–10. Liefst kinderen die nog
  nooit geschaakt hebben, plus één die het al een beetje kan.
- **Jij** bent niet de ouder van het kind. Ouders helpen te snel.

### Toestemming
Vraag de ouder vooraf. Je kunt dit voorlezen of doorsturen:

> "Ik test een schaakspelletje voor kinderen. Je kind speelt twintig minuten en ik schrijf op
> wat het doet. Ik maak geen foto's of filmpjes en ik schrijf de naam niet op."

### Voorbereiding
- Een tablet of telefoon met **een privévenster**, zodat de app niet weet dat er al eens
  iemand geoefend heeft:
  - Safari (iPhone/iPad): tik op het tabbladen-icoon, dan op **Privé**.
  - Chrome: tik op de drie puntjes **⋮**, dan op **Nieuw incognitotabblad**.
- Geluid aan, niet te zacht. Pip praat; dat is de helft van de les.
- Ga naar **schaakmaatje.nl** en geef het apparaat aan het kind. Verder niets.
- Schrijf de **datum en de tijd** op waarop je begint.

### De regels
- **Niet helpen.** Ook niet als het kind vastloopt. Tel rustig tot tien.
- Raakt het kind echt vast of wordt het verdrietig, dan mag je één zin zeggen: *"Wat zou Pip
  bedoelen?"* Schrijf op dát je het zei, en waar.
- **Wil het kind stoppen, dan stop je.** Ook dat is een uitkomst; schrijf op waar het was.

### Wat het kind doet

| Tijd | Wat je zegt | Waar je op let |
|---|---|---|
| 0–2 min | "Dit is een spelletje. Kijk maar wat je kunt doen." | Vindt het zelf de eerste les? |
| 2–10 min | (niets) | Snapt het wat Pip vraagt? Waar twijfelt het? Waar tikt het zomaar wat? |
| 10–15 min | Na een les: "Wil je er nog een?" | Wil het door? Kiest het zelf de volgende? |
| 15–20 min | Alleen bij een kind van 8 of ouder, of een kind dat al kan schaken: "Speel eens tegen **Rens het Konijn**." | Snapt het de partij? Tikt het na afloop op **"Wat zag Pip?"**? |
| na afloop | "Wat vond je het leukst? En het stomst?" | Letterlijk opschrijven. |

### De invullijst (één per kind)

```
Kind: A / B / C / D / E     leeftijd: __     al eens geschaakt: ja / nee
Datum en begintijd: ____________
Apparaat: tablet / telefoon,  rechtop / gekanteld

Tikken tot Pip voor het eerst vroeg iets op het bord aan te tikken: __
Lessen afgemaakt: __        sterren: __
Wilde na de eerste les door:   ja / nee / twijfel

Vastgelopen (welk scherm, wat deed het kind, hoe lang):
  1.
  2.
  3.

Zomaar getikt (waar):
Pip niet begrepen (welke zin):
Gelachen of "yes!" (waar):
Wilde stoppen (waar, waarom):
Ik heb geholpen (waar, wat ik zei):

Alleen als het kind een partij speelde:
  Tikte op "Wat zag Pip?":                  ja / nee
  Keek het tot het eind:                    ja / nee
  Begreep het wat Pip liet zien:            ja / nee / twijfel
  Speelde daarna nog een partijtje:         ja / nee

Leukst (letterlijk):
Stomst (letterlijk):
```

Lever de vijf lijsten in bij Kaj. Klaar.

---

## Deel 2 — Voor Kaj, daarna

1. Leg de vijf lijsten naast elkaar. Een punt waar **twee of meer kinderen** vastliepen, is
   een blokkerende bevinding. Eén kind is een aanwijzing.
2. Kijk in het dashboard van de teller (`/teller/dashboard.php`) of hetzelfde afhaakpunt daar
   ook zichtbaar is. Klopt het met de echte bezoekers, dan heeft het voorrang. De vijf
   testkinderen staan er zelf ook in, als nieuwe bezoekers: herken ze aan datum en tijd.
3. Zet de bevindingen als review in `docs/reviews/` (`JJJJ-MM-DD-kindertest.md`), net als bij
   de andere reviews: van blokkerend naar klein, met per punt wat er gedaan is.
4. Een fout die een kind laat vastlopen en die te automatiseren is, krijgt ook een regel in
   `npm run doorloop` (zie CLAUDE.md).

### Waar we op sturen
Uit `10-risicos-en-kpis.md`, te volgen in het dashboard:
- meer dan 70% van de kinderen die een wereld beginnen, maakt hem af;
- een op de drie komt binnen een week terug;
- bij de kindertest: geen enkel kind loopt vast vóór de eerste ster.

"Wat zag Pip?" verschijnt alleen tegen Rens en sterker: bij Mila en Kiki (het pionnenspel)
staat er nooit een stuk op het bord om te pakken. Of een kind ná de terugblik nog een partij
speelt, laat het dashboard bewust niet zien (daar is een ID voor nodig); dat komt uit de
invullijst hierboven.
