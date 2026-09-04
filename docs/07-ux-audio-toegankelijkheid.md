# 7. UX, geluid en toegankelijkheid

## 7.1 Ontwerpprincipes
1. **Alles wat je moet weten, hoor je.** Geen scherm vereist leesvaardigheid t/m wereld 6.
   Elke tekst heeft een luidspreker-knop; tikken op een tekst = voorlezen.
2. **Eén doel per scherm.** Maximaal één primaire actie, groot en in het midden.
3. **Grote raakvlakken.** Minimaal 64×64 px, bordvelden ≥ 44 px, ruime marges.
4. **Nooit straffen.** Geen levens, geen game-over, geen aftellende klok als default.
   Fout = "probeer nog eens" met een aanwijzing.
5. **Rustig beeld.** Beperkt palet, weinig gelijktijdige animatie, geen flitsen
   (epilepsieveilig), geen harde geluiden.
6. **Voorspelbaar.** Elke les dezelfde 4 fasen, elke wereld dezelfde kaartlogica.
7. **Stoppen mag altijd.** Voortgang wordt per opgave bewaard; afsluiten kost nooit iets.

## 7.2 Geluidsontwerp
- **Pips stem**: uitleg, aanmoediging, hints. ~1.000–2.000 regels; per categorie
  3–6 varianten zodat herhaling niet gaat irriteren (belangrijk! kinderen spelen veel).
- **Bordgeluiden**: zetklik, slaan, rokade, schaak (kort alarmpje), promotie (fanfare).
- **Sfeer**: zachte, uitschakelbare achtergrondmuziek per wereld (loops ≤ 60 s).
- **Ducking**: muziek zakt 12 dB tijdens spraak; spraak breekt af bij nieuwe interactie.
- **Instellingen**: spraak aan/uit, muziek aan/uit, effecten aan/uit, **spraaktempo
  (0.8/1.0/1.2)**, ondertiteling aan/uit (voor dove/slechthorende kinderen en
  meelezende leerlingen).

## 7.3 Toegankelijkheid
- WCAG 2.2 AA als richtlijn: contrast ≥ 4.5:1, focus zichtbaar, alles bedienbaar met
  toetsenbord (schoolgebruik), `prefers-reduced-motion` gerespecteerd.
- **Kleurenblind-veilig bordthema** + optioneel stukkencontrast-thema; nooit alleen
  kleur als informatiedrager (ook vorm/icoon).
- **Dyslexievriendelijk lettertype** (Lexend of Open Dyslexic) als optie; standaard een
  ruime, schreefloze letter met grote regelafstand.
- Schermlezer-labels op alle bordvelden ("e4, wit paard").
- **Motoriek**: tik-tik als standaard-invoer in Pip-modus; slepen is optioneel en
  vergevingsgezind (snap-to-square, geen precisie vereist).

## 7.4 Visuele stijl
Warm en tekenfilm-achtig, niet infantiel: zachte kleuren, ronde vormen, één duidelijke
accentkleur per wereld. Stukken in twee thema's: **"Pip & vrienden"** (dieren, voor
3–7) en **klassiek Staunton** (vanaf 7) — het is belangrijk dat kinderen op tijd naar de
echte stukvormen overstappen, anders herkennen ze het bord bij de club niet.

## 7.5 Ouderpoort
Instellingen, aankopen, externe links en de voortgangsrapportage zitten achter een
**ouderpoort** (een rekensom of ingedrukt-houden, conform de Apple/Google-richtlijnen
voor kinder-apps).
