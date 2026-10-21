# 11. Het releaseproces

Elke release van Schaakmaatje gaat langs vier reviewers, gecoördineerd door een vijfde.
Dat is geen bureaucratie: bij een leer-app voor kinderen zijn dit vier heel verschillende
soorten fout, en niemand ziet ze alle vier tegelijk.

## De reviewers

| Agent | Kijkt naar | Zegt niets over |
|---|---|---|
| **schaakmeester** | Kloppen de regels, de stellingen en de opbouw? Deugt de didactiek? | kleur, code |
| **layout-reviewer** | Ziet het er goed uit, kan een kind van vijf het bedienen? Contrast, raakvlakken, licht en donker | schaakregels, code |
| **codebase-reviewer** | Correctheid, tests, onderhoudbaarheid, risico's | schaakregels, vormgeving |
| **conversie-reviewer** | Komt een ouder die via Google of een link binnenkomt bij de eerste les? Zoektitels, koppen, de hoofdknop van elke pagina | schaakregels, kleur, code |
| **release-coordinator** | Bundelt de vier, weegt, schrijft het rapport, geeft één oordeel | doet zelf geen review |

De conversie-reviewer kwam erbij in oktober 2026. De pagina `/schaakclub/` had als
hoofdknop een link naar de schaakbond: bezoekers gingen weg voordat ze de app gezien
hadden. De andere drie reviewers keken ernaar en vonden de tekst juist, de knop mooi en
de code netjes. Niemand vroeg waar de bezoeker heen ging.

De definities staan in `.claude/agents/`. Ze zijn met opzet smal gehouden: een reviewer
die overal iets van vindt, wordt niet meer serieus genomen.

## Wanneer: na elke fase, niet aan het eind

Een review hoort bij het afronden van een fase, niet bij het afronden van het project.
Een fase is een samenhangend brok: een paar werelden, een nieuw opgavetype, een nieuw
scherm, of een technische laag zoals de zoeker of de offline-modus.

Waarom zo strikt: bij het bouwen van de werelden 7 tot en met 14 zijn vier fasen op
elkaar gestapeld voordat er één keer gereviewd werd. Dat maakt van een review een
archeologische opgraving in plaats van een correctie, en de kans dat er dan nog iets mee
gebeurt is klein. Fouten die je meteen na een fase vindt, kosten tien minuten; dezelfde
fout drie fasen later zit inmiddels in de content, de tests en de teksten van Pip.

## En dan: de feedback verwerken

Een rapport dat in `docs/reviews/` blijft liggen is weggegooid werk. Na elke review:

1. Bevindingen afwerken van **blokkerend** naar **klein**.
2. Wat je niet oplost, krijgt een regel in het rapport met de reden. Stilzwijgend
   overslaan mag niet — de volgende review moet kunnen zien wat er bewust is blijven liggen.
3. Achter elke afgehandelde bevinding zetten wat je gedaan hebt.
4. Pas daarna begint de volgende fase.

## Hoe je hem draait

```
/release-review
```

Of rechtstreeks: start de agent `release-coordinator` en geef mee wat er veranderd is.

De coördinator:
1. bepaalt de scope (`git log` sinds de vorige review in `docs/reviews/`),
2. laat de vier reviewers parallel kijken,
3. bundelt en ontdubbelt de bevindingen,
4. schrijft `docs/reviews/JJJJ-MM-DD-<naam>.md`,
5. geeft één oordeel: **GO**, **GO MITS** of **NO-GO**.

## De weegvolgorde
Bij tegenstrijdig advies:

1. **Klopt het schaken?** Een fout in de regels is altijd blokkerend. Wat een kind hier
   verkeerd leert, moet het bij de club weer afleren.
2. **Kan een kind van de doelgroep het bedienen?**
3. **Komt een nieuwe bezoeker bij de eerste les?** Nooit ten koste van de privacy, de
   didactiek of door een kind onder druk te zetten.
4. **Is het mooi?**
5. **Is de code netjes?**

## Wat een release tegenhoudt
- Een falende typecheck, test, contentcontrole of build.
- Een blokkerende bevinding van de schaakmeester.
- Een scherm dat op telefoonformaat of in het donkere thema onbruikbaar is.
- Iets dat gegevens van een kind naar buiten stuurt.

Al het andere mag met een aantekening mee naar de volgende release.
