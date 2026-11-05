# Tweeënzestigste review: codebase, traject 2 (2026-11-05)

Codebase-reviewer over 5922984..b27da33. `check` groen, `doorloop` 71/71. **Oordeel na verwerking: GO.**

- **Groot: geslagen stukken uit de stelling geteld; bij promotie stond er "Kwijt ♟" zonder slag.** *Opgelost:* `Game.geslagen` in de engine haalt ze uit de zetten zelf (chess.js `captured`). Het scherm kent dus geen schaakregels meer. Een nieuwe test, `tests/geslagen.test.ts`, dekt een gewone slag, promotie en en passant.
- **Middel: het verrast gezicht bleef staan na terugnemen of opnieuw beginnen.** *Opgelost:* de timer wordt dan gewist en het gezicht teruggezet.
- **Middel: `!important` en `data-pip-gezicht` sturen de maat van Pip van buitenaf.** *Niet opgelost:* een maat-prop voor Pip raakt alle aanroepen. Op het scorebord gezet als eigen opruimronde, samen met het volgende punt.
- **Middel: overlappende breekpunten en magische getallen.** *Deels:* 325 en 380 hebben nu een uitleg van waaruit ze bestaan en dat de doorloop ze bewaakt. Breekpunten op één plek vragen PostCSS custom media of een gedeeld JS-bestand: op het scorebord.
- **Klein: geslagen stukken waren onzichtbaar voor de schermlezer.** *Opgelost:* een verborgen tekst met de stuknamen.
- **Klein: rommelige import.** *Opgelost.* Er is geen formatter in het project, dus ook geen in `check`. Dat blijft zo, want een formatter zou het hele project herschrijven.
- **Klein: zinlijst met één zin.** *Opgelost:* het zijn nu gewone strings.
- **Klein: geen unittest voor geslagen en gezichten.** *Geslagen opgelost* (zie boven). De volgorde van de gezichten is één regel code; op het scorebord.
