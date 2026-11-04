# Vijfendertigste review: gevoel, tik-reactie en minder beweging (2026-11-04)

Fase: "volgende niveau", ronde 10. Branch `volgende-niveau`.

**Reviewers:** codebase en layout. De schaakmeester en de conversie-reviewer zijn deze ronde niet gestart: de wijziging raakt geen content, geen pagina en geen tekst, alleen de globale reduced-motion-regel en de doorloop.

**Oordeel na verwerking: GO voor deze fase.** `check` is groen, en de doorloop haalt 35 van 35.

## Wat er veranderd is
- Bij minder beweging stopt elke animatie nu na één keer (`animation-iteration-count: 1`). Eerst liep bijvoorbeeld Pips ademhaling eindeloos door in stappen van 0,01 ms. Bewezen: zonder de fix vindt de doorloop `Pip_adem` op / en op de les, met de fix niets.
- **Nieuwe doorloopregel:** een tik moet binnen 100 ms zichtbaar reageren. Gemeten: een goed veld 31 ms, een fout veld 31 ms, de hulpknop 13 ms.
- **Nieuwe doorloopregel:** bij minder beweging draait er geen eindeloze animatie op /, de les, de kaart en het minispel.

## Layout
- Elk eindbeeld klopt. De hintring blijft zichtbaar (`pulse` eindigt op opacity 1, en `.glow` heeft al `animation: none`). Pip staat in rusthouding. Vonk en confetti zijn weg, golf en wapen hebben hun volle maat.
- **Klein: een toekomstige animatie met een eindframe op opacity 0 zou verdwijnen.** *Afspraak:* een nieuwe animatie krijgt altijd een eigen reduced-motion-regel en leunt niet alleen op de globale.

## Codebase
- Nergens wordt op `animationend` gewacht, dus iteration-count 1 breekt niets.
- **Belangrijk: de meting zag de eerste DOM-mutatie, niet wat het kind ziet.** *Opgelost:* bij een veld wordt nu gewacht tot de klasse op dát veld verandert, bij de hulpknop tot er een veld met hintgloed is. De tijd loopt tot ná de verf (rAF + setTimeout 0).
- **Belangrijk: de regel faalde onduidelijk als een veld er niet was.** *Opgelost:* hij geeft nu een eigen melding ("geen b1 gevonden").
- **Klein: geen mediaan van drie metingen.** *Niet gedaan:* de waarden liggen rond 13–31 ms, ver onder de 100. Komen er uitschieters op een volle machine, dan alsnog.
- **Klein: het minispel werd niet gecontroleerd.** *Opgelost:* `/spel/torenjacht/` staat nu in de regel.
- **Klein: smooth `scrollIntoView` in JS.** *Was al geregeld:* de kaart kiest bij minder beweging zelf `auto` (ronde 5).
