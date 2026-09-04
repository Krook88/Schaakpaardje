# 11. Het releaseproces

Elke release van Schaakmaatje gaat langs drie reviewers, gecoördineerd door een vierde.
Dat is geen bureaucratie: bij een leer-app voor kinderen zijn dit drie heel verschillende
soorten fout, en niemand ziet ze alle drie tegelijk.

## De reviewers

| Agent | Kijkt naar | Zegt niets over |
|---|---|---|
| **schaakmeester** | Kloppen de regels, de stellingen en de opbouw? Deugt de didactiek? | kleur, code |
| **layout-reviewer** | Ziet het er goed uit, kan een kind van vijf het bedienen? Contrast, raakvlakken, licht en donker | schaakregels, code |
| **codebase-reviewer** | Correctheid, tests, onderhoudbaarheid, risico's | schaakregels, vormgeving |
| **release-coordinator** | Bundelt de drie, weegt, schrijft het rapport, geeft één oordeel | doet zelf geen review |

De definities staan in `.claude/agents/`. Ze zijn met opzet smal gehouden: een reviewer
die overal iets van vindt, wordt niet meer serieus genomen.

## Hoe je hem draait

```
/release-review
```

Of rechtstreeks: start de agent `release-coordinator` en geef mee wat er veranderd is.

De coördinator:
1. bepaalt de scope (`git log` sinds de vorige review in `docs/reviews/`),
2. laat de drie reviewers parallel kijken,
3. bundelt en ontdubbelt de bevindingen,
4. schrijft `docs/reviews/JJJJ-MM-DD-<naam>.md`,
5. geeft één oordeel: **GO**, **GO MITS** of **NO-GO**.

## De weegvolgorde
Bij tegenstrijdig advies:

1. **Klopt het schaken?** Een fout in de regels is altijd blokkerend. Wat een kind hier
   verkeerd leert, moet het bij de club weer afleren.
2. **Kan een kind van de doelgroep het bedienen?**
3. **Is het mooi?**
4. **Is de code netjes?**

## Wat een release tegenhoudt
- Een falende typecheck, test, contentcontrole of build.
- Een blokkerende bevinding van de schaakmeester.
- Een scherm dat op telefoonformaat of in het donkere thema onbruikbaar is.
- Iets dat gegevens van een kind naar buiten stuurt.

Al het andere mag met een aantekening mee naar de volgende release.
