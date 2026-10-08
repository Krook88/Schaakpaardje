# Vierde review — door de bril van een kinder-app-ontwikkelaar

**Datum** 5 september 2026 · **Tak** `claude/chess-learning-app-kids-fertg2` · **Beoordeeld op** commit `27368ed`

De drie vorige rondes keken elk naar hun eigen plak: klopt het schaken, is het leesbaar,
deugt de code. Deze ronde stelt de vraag die daar tussendoor valt: **houdt een kind van
vijf dit vol, en komt het morgen terug?**

Dat is geen kwestie van smaak. Het zijn meetbare dingen: hoeveel handelingen tot het
eerste succes, hoe lang een sessie duurt, wat er gebeurt als een kind vastloopt, en wat
het kwijtraakt als het halverwege stopt. Alles hieronder is nagemeten in de gebouwde app,
niet beredeneerd.

## Oordeel

**Twee blokkerende bevindingen, allebei van hetzelfde type: het kind kan klem komen te
zitten en verliest dan werk.** Die zijn hieronder verwerkt. Daarnaast één product­vraag
die niet aan mij is om te beslissen, en een handvol dingen die het verschil maken tussen
"een cursus met een spel-jasje" en "een spel".

Wat een kinder-app-ontwikkelaar bovenaan zet: een kind van vijf dat vastloopt legt de
tablet weg en komt niet terug. Dat is ernstiger dan een verkeerd getekend vakje, want je
krijgt geen tweede kans. Beide blokkerende punten zaten precies daar.

## Wat er gemeten is

| Maat | Uitkomst | Wat een kinder-app-ontwikkelaar ervan vindt |
|---|---|---|
| Handelingen tot de eerste eigen actie | **6** (Beginnen → Verder leren → 3× vertelscherm → tikken) | Aan de hoge kant maar acceptabel |
| Tijd tot dat punt, zonder voorlezen | 4,4 s | Prima |
| Idem mét Pips stem aan | ± 20–25 s luisteren | Lang voor een vierjarige die de app nog niet kent |
| Stappen per les | 7 tot 10, gemiddeld 8,4 | Goed: ± 4–6 minuten, past bij de spanningsboog |
| Stappen in de hele app | 404 | Ruim voldoende inhoud |
| Typen vereist bij de start | **ja, één veld** | Zie A3 |

---

## Blokkerend

### K1. De hint werd nooit concreter, dus een kind kon definitief vastlopen

`src/lesson/runner.ts`, `hint()`. Bij een `move`- of `regelZet`-opgave wees de hint
altijd het stuk aan waarmee gezet moet worden — hoe vaak je ook op "Help me even" drukte.
Bij een mat-in-1 in wereld 10, of bij "pak het duurste stuk", betekent dat: een kind dat
de zet niet ziet, komt er **nooit** uit. De enige uitweg was de les verlaten.

Het commentaar in de code verdedigde dat ("dan blijft er iets te denken over"), en dat is
een verdedigbare gedachte — maar niet als er geen tweede trede is. De norm in kinder-apps
is: hint 1 is een duwtje, hint 2 versmalt, hint 3 laat het zien. Nooit doodlopen.

**Gedaan:** de hint escaleert nu. Eerste keer het stuk, tweede keer het doelveld (bij
`regelZet` beide velden tegelijk). De tik-opgaven deden dit al goed: die geven elke keer
een veld dat nog niet gevonden is. Vastgelegd in drie tests in `tests/runner.test.ts`.

### K2. Voortgang binnen een les verdampte

`src/lesson/LessonPlayer.tsx`. `bewaarLes` werd alleen aangeroepen bij het bereiken van de
beloningsfase. Een les is acht à tien stappen; wie bij stap zeven ophield — omdat het eten
is, of omdat "← Terug" linksboven verleidelijk dichtbij zit — begon de volgende keer weer
helemaal vooraan. Zonder waarschuwing, zonder bevestiging.

Gecombineerd met K1 was dat het klassieke afhaakmoment: vastlopen én alles kwijt. Precies
één keer, en daarna nooit meer.

**Gedaan:** de app onthoudt in welke fase het kind was (`hervatpunt` in de store) en pakt
daar de draad weer op. Niet de losse opgave maar de fase, zodat je terugkomt bij iets wat
je herkent in plaats van midden in een vraag. Het punt wordt gewist zodra de les af is.
Nagemeten in de browser: kind loopt weg tijdens "Zelf doen", komt terug in "Zelf doen".

---

## Belangrijk — maar dit is een productbeslissing, geen fout

### K3. De leeftijd wordt gevraagd en vervolgens genegeerd

`src/progress/store.ts` berekent `modusVoorLeeftijd()` bij het aanmaken van een profiel —
`pip` tot 5 jaar, `ontdekker` tot 7, `schaker` daarboven — slaat dat op, en **leest het
nergens meer**. Nagezocht: `modus` komt in geen enkel scherm voor. Ook `minLeeftijd` op de
werelden wordt nergens gebruikt om iets te tonen of te verbergen.

Gevolg: een driejarige en een tienjarige krijgen exact dezelfde app. Dezelfde eerste les,
dezelfde volgorde, hetzelfde tempo. Een negenjarige die begint met "tik de vier donkere
velden aan" is binnen anderhalve minuut verveeld en komt niet terug — en dat is nou net
het kind dat het snelst zou kunnen doorstromen.

Een vraag stellen die je niet gebruikt is bovendien op zichzelf een fout: het wekt de
verwachting dat het uitmaakt.

**Drie mogelijke antwoorden, en de keuze is aan jou:**
1. **Gebruiken.** Vanaf 8 jaar in wereld 1 beginnen in plaats van wereld 0, of wereld 0
   aanbieden als "wil je eerst het bord leren kennen?". Meeste werk, meeste winst.
2. **Weghalen.** Geen leeftijdsvraag meer. Eerlijk, en één scherm korter bij de start.
3. **Laten staan voor de ouder.** De leeftijd alleen tonen op het ouderscherm, en de
   modus schrappen.

Niet gedaan, omdat het geen defect is maar een ontwerpkeuze over wat de app wil zijn.

---

## Belangrijk

### K4. Het eerste wat de app aan een kind vraagt, is iets typen

`src/app/page.tsx`. Het openingsscherm toont "Hoe heet je?" met een tekstveld. Een kind
van vier kan dat niet, en ziet dus meteen een muur. Je kunt doorklikken met een lege naam
(dat is goed, en getest), maar dat wéét een kind niet: het ziet een vraag en een leeg vak.

In kinder-apps voor deze leeftijd is de eerste handeling altijd een tik op een plaatje.
De avatarrij die er al staat is precies dat — die zou eerst moeten komen, en de naam pas
daarna, of alleen achter de ouderpoort.

*Voorstel:* de dierenrij bovenaan, de naam optioneel eronder met een duidelijke
"overslaan"-route. Een kind kiest de vos en heet dan gewoon "de vos" tot een ouder er iets
anders van maakt.

### K5. Er is geen goed moment om te stoppen

De app kent geen enkel punt waarop hij zegt: dit was een mooie sessie. Een kind speelt tot
het afgeleid raakt of tot een ouder ingrijpt, en dat laatste is precies het conflict dat
je in een kinder-app wilt vermijden. Het beloningsscherm na een les is de natuurlijke
plek: daar staat nu "Volgende les", en niets wat zegt "je hebt er twee gedaan vandaag,
mooi zo".

*Voorstel:* na twee of drie afgeronde lessen op één dag laat Pip weten dat het genoeg is
geweest, met de kaart als uitgang in plaats van de volgende les. Geen blokkade — een
suggestie, en een uitweg voor de ouder.

### K6. Het leukste deel zit het diepst weggestopt

Er zijn vijftien minispellen, en die zijn wat een kind een spel zou noemen. Ze zijn alleen
te vinden door op de kaart naar een wereld te scrollen en onder de lessen te kijken. Vanaf
de stal is er geen enkele route heen: daar staan "Verder leren", "De kaart" en "Een
partijtje".

Voor de doelgroep is dat de omgekeerde volgorde. Een kind dat de app opent wil spelen; de
les is de prijs voor het spelen, niet andersom.

*Voorstel:* een vierde knop op de stal ("🎲 Een spelletje") die een willekeurig ontgrendeld
minispel opent.

### K7. Het is een cursus met een spel-jasje

Vier fasen, een toets, sterren. Dat is een goede leerstructuur — en de reden dat het
schaken klopt. Maar er is geen enkel spelelement dat *van het kind* is: niets om te
verzamelen behalve stickers die alleen op de stal staan, niets om in te richten, geen
verhaal dat vordert. Pip is een verteller, geen maatje dat meegroeit.

Dit is geen bevinding die je "oplost"; het is de vraag of dit een leerapp met spelvormen
moet zijn of een spel waar je schaken van leert. Het plan noemt het laatste. Wat er nu
staat is het eerste.

---

## Klein

- **K8.** De vertelfase van de eerste les duurt drie schermen voordat een kind iets mag
  doen. Voor de állereerste les zou één scherm genoeg zijn: laat het kind tikken, vertel
  daarna.
- **K9.** "← Terug" midden in een les vraagt niets en waarschuwt niet. Met K2 opgelost is
  de schade beperkt, maar een kind kan er nog steeds per ongeluk uit vallen.
- **K10.** Sterren gaan nooit omlaag bij het opnieuw doen van een les
  (`Math.max` in `bewaarLes`). Dat is goed gedaan en het is precies de valkuil waar veel
  kinder-apps in trappen — het staat hier als compliment, niet als bevinding.

---

## Wat er goed is, vanuit deze bril

De sterren gaan nooit omlaag, er is geen game-over, geen levens, geen tijdsdruk, geen
enkele donkere trukendoos: geen streak die je moet volhouden, geen melding die je terugtrekt,
niets dat naar buiten gaat. Voor een app die kleuters als doelgroep heeft is dat geen
kleinigheid — het is de reden dat een ouder hem durft te installeren. De ouderpoort met
een rekensom is de juiste zwaarte: te doen voor een volwassene, niet voor een achtjarige.
De lessen zijn kort genoeg (4–6 minuten) en de app werkt offline, wat op een schooltablet
of in de auto het verschil maakt.

En het schaken klopt. Dat klinkt vanzelfsprekend, maar in dit genre is het dat niet: de
meeste schaakapps voor kinderen die ik ken hebben ergens een stelling die niet kan.

---

## Wat ik hierna zou doen, op volgorde

1. **Pip inspreken.** Blijft bovenaan staan; zonder stem is de app voor de doelgroep niet
   af, en alle bevindingen hierboven zijn secundair daaraan.
2. **K3 beslissen** — leeftijd gebruiken of weghalen.
3. **K4 en K6**: het openingsscherm zonder typen, en de minispellen naar voren. Samen zijn
   dat de twee ingrepen die het meest schelen voor "komt dit kind morgen terug".
4. **Eén kind van vijf en één van acht laten spelen**, met jou ernaast en zonder te
   helpen. Alles hierboven is nog steeds een aanname, ook deze review.
