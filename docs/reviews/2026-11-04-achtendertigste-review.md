# Achtendertigste review: één tekenstijl, illustratieronde 2 (2026-11-04)

Fase: "volgende niveau", ronde 13. Branch `volgende-niveau`. De reviewers zijn rechtstreeks gestart.

**Oordeel na verwerking: GO voor deze fase.** `check` en de doorloop zijn groen. De offlineregel keurt nu kapotte plaatjes echt af, en is groen. Er zijn 0 te kleine raakvlakken. Lighthouse mobiel geeft 99/99/99, met LCP 2,1–2,3 s (eerst 2,3–2,6). De test op illustraties telt 93 gevallen.

## Wat er gebouwd is
- De illustrator-agent maakte 71 iconen (`scripts/iconen-tekenen.py`):
  - 49 lesiconen;
  - fasen, slot, beker, sticker, minispel, hint, geluid, instellingen, bel en bel-uit, deel;
  - de drie punten op de startpagina;
  - ster vol en leeg, en medailles in brons, zilver en goud.
- Daarnaast: Pip zonder plankje, de knopvariant van Pip met marge bovenin, en een paard in het wapen van Paardenstal. De kaartstroken hebben een rustig midden.
- Op alle vier de wow-schermen en op /lessen, de schaakregelpagina's, het opfrisscherm, het minispel, het thuisscherm en het diploma staan nu iconen in plaats van emoji.

## Schaakmeester
- **Belangrijk: de L in `les-paard-1` had twee even lange armen.** *Opgelost:* de verhouding is nu 2:1 (60 tegen 30).
- **Belangrijk: het bordje in de wapens werd door de cirkel afgesneden, waardoor rechtsonder donker leek.** *Opgelost:* het bordje staat hoger en is smaller. Een nieuwe assert eist dat het hele veld rechtsvoor binnen de cirkel valt en licht is.
- **Belangrijk: `les-pion-2` wees opzij.** *Opgelost:* twee pijlen omhoog.
- **Klein:** loper-2, tactiek-1, weide-2, notatie-1, waarde-1, eindspel-2 en rokade-1 zijn opnieuw getekend volgens zijn voorstellen. *Opgelost.*
- **Klein: "Dan roep je: schaak!" (w9-schaak).** *Niet aangepast:* dit is een ingesproken vertelzin, en een nieuwe opname vraagt een ElevenLabs-sleutel. Dat staat als vraag aan Kaj bovenaan het scorebord.

## Conversie (startpagina 7,5 · les 7 · wereld af 7,5 · kaart 8)
- **Belangrijk: LCP 2,6 s.** *Opgelost:* nu 2,1–2,3 s.
- **Belangrijk: nog emoji op plekken voor screenshots** (⭐, 🥉🥈🥇, 🔊). *Opgelost:* er zijn getekende sterren, medailles en een luidspreker.
- **Klein: "Volgende les" na wereld af wees naar een les die al af was.** *Opgelost:* hij wijst nu naar de eerste les die nog open is.
- **Klein: toren-1 leek op een EHBO-kruis.** *Opgelost:* er staat nu een toren met vier pijlen.
- **Klein: na wereld af scrolde Pips ballon buiten beeld.** *Niet opgelost:* dat staat op de lijst voor "Pip groot in de viering" (volgende ronde).

## Codebase
- **Blokkerend: de iconen waren offline niet beschikbaar.** *Opgelost:* `iconen/` zit nu in de voorraad.
- **Blokkerend: de offlineregel keurde "nee (kapot: …)" goed.** *Opgelost:* de controle gebruikt nu `includes(':nee')`.
- **Belangrijk: de test dekte de iconen niet.** *Opgelost:* lesiconen, vaste iconen en Pip-los zitten erin (93 gevallen).
- **Klein:**
  - `Icoon` accepteerde geen van beide props. *Opgelost* met een strikte union.
  - De beker werd niet voorgelezen. *Opgelost:* `role="img"` met een aria-label.
  - Bel-uit was alleen doorzichtig. *Opgelost:* er is een eigen icoon met een streep.
  - Het luisterfilter had geen uitleg. *Opgelost:* er staat nu commentaar bij.
  - Op een paar plekken stond nog `les.icoon` als emoji. *Opgelost:* daar staan nu lesiconen.

## Layout (startpagina 7 · les kijkfase 6 · opgave 7 · wereld af 8 · kaart 7 / 8)
- **Belangrijk: de witte luidspreker op donker oranje haalde maar 2,53:1.** *Opgelost:* in donker is hij nu donker, zoals `--accent-ink`.
- **Belangrijk: de schermafbeeldingen op de startpagina waren verouderd.** *Opgelost:* ze zijn opnieuw opgenomen na deze build.
- **Klein:**
  - 🔊 in de tekst op het thuisscherm. *Opgelost:* daar staat nu het icoon.
  - Komende fasen waren in donker slecht zichtbaar. *Opgelost:* opacity van 0,45 naar 0,6.
  - "Volgende les" op 1024×768 viel onder de vouw. *Opgelost:* het wapen is kleiner op lage schermen.
  - Slothaltes in donker zijn schimmig. *Bewust zo gelaten:* het slot zelf is goed zichtbaar.

## Wow (ronde 13, vóór verwerking)
| scherm | layout | conversie |
|---|---|---|
| Startpagina | 7 | 7,5 |
| Eerste les | 6 (kijken) / 7 (opgave) | 7 |
| Wereld af | 8 | 7,5 |
| Kaart | 7 / 8 | 8 |

**Naar een 9** noemen beide reviewers vooral:
- Pip groot en levend in de juichmomenten: bij wereld af, en bij de kennismaking in de kijkfase.
- Het bord in de kijkfase laten vertellen.
- Het pad doorgetrokken over het landschap.
