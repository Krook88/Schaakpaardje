# Zevenendertigste review: eigen illustraties in plaats van emoji (2026-11-04)

Fase: "volgende niveau", ronde 12. De beeldtaal is door Kaj gekozen (1b) en de proef is goedgekeurd. Branch `volgende-niveau`. De reviewers zijn rechtstreeks gestart.

**Oordeel na verwerking: GO voor deze fase.** `check` en de doorloop zijn groen. De doorloop controleert nu ook offline dat er geen kapotte plaatjes zijn. Een nieuwe test (`tests/illustraties.test.ts`) bewaakt dat elk wapen, elke strook en elke Pip bestaat.

## Wat er gebouwd is
- De illustrator-agent maakte 59 SVG's (166 kB) met twee generatoren: `scripts/pip-tekenen.py` en `scripts/werelden-tekenen.py`. Pip heeft 7 stemmingen, elk ook als versie voor de knop. Er zijn 15 wapens en 30 kaartstroken (licht en donker).
- Pip in de knop, de wapens op alle wereldplekken, de kaartstroken onder de open werelden en Pip in de held, op de kaart, de foutpagina's, /over, /spelen en het diploma zijn nu tekeningen. De speldjes (🎉 💭) zijn weg.
- Delen met een vast plaatje (besluit Kaj): bij wereld af het wapen, bij het diploma `og.png`.

## Schaakmeester
- **Bijna blokkerend: het bordje in alle 15 wapens had rechtsonder een donker veld.** Dat is het omgekeerde van wat wereld 0 leert. *Opgelost:* het patroon is omgedraaid, en de generator weigert nu een bordje met een donker veld rechtsvoor (assert).
- **Klein: Paardenstal heeft geen paard in het wapen.** *Niet opgelost:* dat gaat mee in de volgende illustratieronde.
- Pip is herkenbaar als paard. Er staat niets vóór zijn wereld: de vlag hoort bij Matklif, de koning bij Eindspelduinen.

## Conversie (startpagina 7,5 · les 7,5 · wereld af 8 · kaart 8)
- **Belangrijk: de schermafbeeldingen op de startpagina toonden de oude emoji-Pip.** *Opgelost:* ze zijn opnieuw opgenomen (`scripts/schermen.mjs`), en `og.png` is ook vernieuwd.
- **Belangrijk voor het cijfer: twee stijlen door elkaar** (fase-, halte- en knop-iconen zijn nog emoji). *Volgende fase,* zie het scorebord.
- **Klein: de wapenrij stond 7+7+1.** *Opgelost:* nu 8+7, en de wapens die nog niet af zijn, zijn minder vervaagd.
- **Klein: de kaartstrook was bovenaan afgekapt.** *Opgelost:* 120 px hoog en een uitsnede op 70%.
- **Klein: LCP 2,3–2,6 s.** *Opgelost:* de schermafbeeldingen op de startpagina laden nu lui, zonder fetchPriority high. Dat was de waarschijnlijke concurrent; de illustraties zijn nergens het LCP-element.

## Layout (startpagina 7 · les 6,5 · wereld af 7,5 · kaart 7/8)
- **Belangrijk: verouderde schermafbeeldingen.** *Opgelost,* zie Conversie.
- **Belangrijk: de wapenrij stond op desktop links.** *Opgelost:* gecentreerd.
- **Belangrijk: nog veel emoji, waaronder losse 🐴 als tweede Pip.** *Gedeeltelijk:* alle 🐴 die voor Pip staan zijn vervangen. De rest gaat naar de volgende illustratieronde: halte-iconen, 🔒, 🏆, fase-iconen, 🔔 ⚙️ 💡 🔊, 🏅 💌, de startpunten en de 🐴 als avatar.
- **Klein: Pip op een plankje dat niet leest, de knop knipt oortjes af, een wit vlekje bij juicht, de kaartstrook schaalt mee op brede schermen, kleine wapens tonen weinig.** *Volgende illustratieronde.*
- **Klein: Pip "denkt" bij een opdracht.** *Opgelost:* bij de start van een opgave is hij nu "blij". "Denkt" blijft voor de hint.

## Codebase
- De generatoren zijn reproduceerbaar (byte voor byte gelijk). Ook de SVG-veiligheid, basePath en bundel zijn in orde.
- **Belangrijk: de illustraties zaten niet in de offlinevoorraad, waardoor Pip offline een lege cirkel was.** *Opgelost:* alle Pips, wapens en de stroken van wereld 0–2 staan in VOORAF, `/illustraties/` is cache-first, en de offlineregel in de doorloop controleert op kapotte plaatjes.
- **Belangrijk: het commentaar beloofde een controle die niet bestond.** *Opgelost* met `tests/illustraties.test.ts` (22 gevallen).
- **Klein: Pip flitste even leeg bij een nieuwe stemming.** *Opgelost:* de 7 knopvarianten worden vooraf geladen.
- **Klein: dode CSS (`.badge`, `.heuvels`).** *Weggehaald.*
- **Klein: de donkere strook volgt alleen het systeemthema.** *Gedocumenteerd:* `data-theme` wordt nergens gezet.
- **Klein: de generator is broos bij een nieuwe wereld.** *Gedekt:* de test faalt luid als er een tekening ontbreekt.

## Wow-cijfers (ronde 12)
| scherm | layout | conversie | ronde 11 |
|---|---|---|---|
| Startpagina | 7 | 7,5 | 7,5 / 7,5 |
| Eerste les | 6,5 | 7,5 | 6,5 / 7 |
| Wereld af | 7,5 | 8 | 7 / 7 |
| Wereldkaart | 7 / 8 | 8 | 7 / 7,5 |

De cijfers zijn gegeven vóór de verwerking (oude schermafbeeldingen, emoji-Pip). Beide reviewers noemen hetzelfde: eerst één tekenstijl tot in het kleinste icoon.
