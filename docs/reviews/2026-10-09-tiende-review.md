# Tiende review, 9 oktober 2026

Scope: schaken op afstand (commits `fa0682b`, `813c5c3` en volgende, PR #11).
Reviewers: schaakmeester (GO), codebase-reviewer (GO onder voorwaarde van punt 1 en 2),
layout-reviewer (GO, na een eerste poging die door een limiet werd afgebroken).

## Schaakmeester: GO

| | Bevinding | Status |
|---|---|---|
| 1 | belangrijk: wie zijn eigen link opnieuw opent of ververst, kon de zet van de ander doen. | **Opgelost**: dit apparaat onthoudt welke links het zelf maakte; die blijven op slot en staan naar de eigen kant. Doorloopregel 11 ververst na de zet. |
| 2 | belangrijk: geen uitleg bij schaak. | **Opgelost**: wie schaak staat hoort "Schaak! Je koning wordt aangevallen."; wie schaak geeft hoort dat ook. |
| 3 | klein: altijd promotie tot dame, geen test. | Deels: zelfde als bij de bots en wat de pionles leert; test voor promotie tot paard in de link toegevoegd. Keuze in het scherm later, voor de oudere modus. |
| 4 | klein: zwart hoort niet dat hij zwart speelt. | **Opgelost**: "Je vriendje begon met wit. Jij speelt zwart. Nu jij!" |
| 5 | klein: geen remise afspreken. | Open: een ouderknop achter het rekenslot, volgende ronde. |
| 6 | klein: Pip zegt altijd "vriendje", ook bij opa. | Open: onschuldig; bij een volgende zinnenronde. |

## Codebase: GO

| | Bevinding | Status |
|---|---|---|
| 1 | belangrijk: na verversen kon het kind de zet van het vriendje doen. | **Opgelost**, zie schaakmeester 1. |
| 2 | belangrijk: overwinning kon dubbel tellen of blijven staan na terugnemen. | **Opgelost**: na een uitslag geen "Andere zet" meer. |
| 3 | klein: plaatjescontrole te ruim (elk teken, ook bidi-rommel). | **Opgelost**: alleen plaatjes uit de app. Test. |
| 4 | klein: zetcodes niet genormaliseerd ("e2e4q"). | **Opgelost**: zetten opnieuw opgeschreven; overbodig promotieteken geweigerd. Test. |
| 5 | klein: geen lengtegrens. | **Opgelost**: boven 6000 tekens niet eens geprobeerd. Test. |
| 6 | klein: geen promotiegeluid. | **Opgelost**. |
| 7 | klein: tellen per apparaat in plaats van per kind. | **Opgelost**: per profiel, en alleen met profiel. |
| 8 | klein: link negeerde de basePath. | **Opgelost**. |
| 9 | klein: tests dekten alleen het gelukkige pad. | **Opgelost**: promotie, plaatjes, normalisatie, lengte; doorloop ververst. |

## Layout: GO

| | Bevinding | Status |
|---|---|---|
| 1 | belangrijk: na versturen geen wachtstand; het scherm bleef "versturen" roepen. | **Opgelost**: Pip zegt "Verstuurd! Nu is je vriendje aan de beurt. Even wachten maar.", de regel zegt "⏳ Wachten op ...", de knop heet dan "Nog een keer versturen". Een eigen link opent in die wachtstand. Na versturen geen "Andere zet" meer. |
| 2 | klein: de beurtregel zei niet "jij". | **Opgelost**: "🦊 Jij bent aan zet (zwart)". |
| 3 | klein: in het rekenslot geen weg terug. | **Opgelost**: knop "Toch niet". |
| 4 | klein: onduidelijk of de link gedeeld of gekopieerd is. | **Opgelost**: de kaart zegt precies wat er gebeurde, met een knop "📋 Kopieer". |
| 5 | klein: raakvlakken onder 64 px; bordvelden op 360 px. | Deels: "Andere zet", "Kopieer" en het linkveld zijn 64 px. Bordvelden: bestaand punt (zevende review K12). |
