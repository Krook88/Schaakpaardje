# Elfde review, 9 oktober 2026

Scope: PR #12 (`46cef66`, promotie met keuze voor modus schaker). Reviewers:
schaakmeester, codebase-reviewer, layout-reviewer. `npm run check` en `npm run doorloop`
waren groen.

## Oordeel

Schaakmeester en codebase: **GO** met voorwaarden. Layout: **NO-GO** (de kiezer stond op
een telefoon buiten beeld). *Bijgewerkt: alle blokkerende en belangrijke punten zijn
opgelost; zie de statuskolom. Herreview layout hieronder.*

## Blokkerend

| | Bevinding | Status |
|---|---|---|
| B1 | Layout: de kiezer staat onder het bord. Op 360×640 begint hij op y=626, op 390×844 vallen Paard en "Toch een andere zet" eronder. Het bord zit op slot, dus de app lijkt vast te lopen. | **Opgelost**: de kiezer staat vast onderaan het scherm (met ruimte voor de iPhone-balk), de focus gaat naar Dame. Doorloopregel 12 tikt de promotie nu op 360×640 en eist dat de kiezer helemaal in beeld staat. |

## Belangrijk

| | Bevinding | Status |
|---|---|---|
| I1 | Schaakmeester en codebase: de blunderwaarschuwing kwam vóór de keuze, en "Toch doen" gaf zonder vragen een dame. `blunderVerlies` rekende altijd met een dame. | **Opgelost**: eerst kiezen, dan waarschuwen (`probeer`). `blunderVerlies` krijgt het gekozen stuk mee, "Toch doen" ook. Test: promoveren op een gedekt veld kost 9 met een dame en 3 met een paard. Een doorloopregel voor dit pad ontbreekt: de waarschuwing staat bij schaker standaard uit en een stelling waarin het in een gespeelde partij gebeurt, is lang. De test dekt de rekensom, de volgorde staat in één functie. |
| I2 | Schaakmeester en codebase: in het pionnenspel kwam de kiezer ook, en zei Pip na een paard "Je pion is dame geworden". | **Opgelost**: geen kiezer bij `winBijPromotie`. Daar wint wie de overkant haalt, en dan zegt de keuze niets. |
| I3 | Schaakmeester: pion-4 brengt "dan wordt hij een dame" als vaste regel. | **Opgelost** in de vertelzin: "Dan mag hij een ander stuk worden. Bijna altijd kies je de dame!" De vijf minispelzinnen ("Dan wordt hij dame!") blijven: in de minispellen wordt hij ook echt altijd dame. |
| I4 | Layout: zwarte stukken in donker thema onzichtbaar in de kiezer (contrast ongeveer 1,1:1). | **Opgelost**: elk stuk staat op een vlakje in de kleur van een licht veld, net als op het bord. |
| I5 | Layout: na "Toch een andere zet" bleef Pip de vraag herhalen. | **Opgelost**: Pip zegt dan "Goed, kies maar een andere zet." (nieuwe ingesproken zin), in PartijScherm en AfstandScherm. |

## Klein

| | Bevinding | Status |
|---|---|---|
| K1 | Schaakmeester: "Waar wordt hij in?" is geen goed Nederlands; een steuntje ontbreekt. | **Opgelost**: "Je pion is aan de overkant! Wat wordt hij? Meestal kies je de dame." Kop: "Wat wordt je pion?" |
| K2 | Schaakmeester: geen uitleg als het vriendje op afstand onderpromoveert. | **Opgelost**: Pip zegt "De pion van je vriendje is een paard geworden. Dat mag ook! Nu jij." (ook voor toren en loper). |
| K3 | Schaakmeester: Mila koos een promotiezet vier keer zo vaak (q, r, b, n stonden alle vier in de lijst). | **Opgelost**: alleen de damepromotie telt mee, zoals in runner en contentcontrole. |
| K4 | Codebase: terugnemen, "Nog een keer" en een nieuwe link lieten de kiezer staan. | **Opgelost**: alle drie sluiten hem. |
| K5 | Codebase en layout: geen `aria-modal`, geen focus, geen Escape. | **Opgelost**: `aria-modal`, focus op Dame, Escape is "toch niet". |
| K6 | Codebase: `isPromotie` zonder test. | **Opgelost**: wit, zwart, met slaan, gewone zet, onmogelijke zet. |
| K7 | Layout: drie knoppen plus een wees op de tweede regel. | **Opgelost**: vier kolommen naast elkaar. |
| K8 | Layout: "Toch een andere zet" 56 px hoog. | **Opgelost**: 64 px. |
| K9 | Schaakmeester: het woord "promoveren" mag erin voor deze leeftijd. | Open: de zin is al lang genoeg voor een gesproken vraag; het woord hoort in een les over promotie, niet midden in een partij. |

## Wat goed is

- Keuze uit dame, toren, loper, paard; ook bij promotie met slaan, nooit bij een gewone zet.
- Alleen voor 8 tot 10: sluit aan op pion-4 en de clubvolgorde.
- Op afstand neemt de link het gekozen stuk mee; mat of pat na onderpromotie klopt.
- Wit en zwart, licht en donker, 360 en 390: geen paginafouten, niet horizontaal scrollen.
