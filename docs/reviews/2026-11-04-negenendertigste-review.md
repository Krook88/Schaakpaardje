# Negenendertigste review: Pip groot in de juichmomenten (2026-11-04)

Fase: "volgende niveau", ronde 14. Branch `volgende-niveau`. De reviewers zijn rechtstreeks gestart.

**Oordeel na verwerking: GO voor deze fase.** `check` en de doorloop zijn groen. De doorloop heeft twee nieuwe regels:
- In de kijkfase staat "Verder" in beeld op 360×740 en 375×667.
- Bij wereld af staan de wapens als 8 + 7 en staat "Volgende les" in beeld, op 320, 393 en 1024 breed.

Er zijn geen te kleine raakvlakken.

## Wat er gebouwd is
- Bij wereld af juicht een grote Pip naast het wapen. Hij springt twee keer, behalve bij reduced-motion.
- In de kijkfase is Pip bij de eerste zin groot, met de nieuwe prop `groot`.

## Schaakmeester
- Er is niets veranderd in engine of content. Pip bedekt het bord en de vertelzin niet. Geen bevindingen.

## Conversie (start 7 · les 6,5 · wereld af 8 · kaart 7,5)
- **Belangrijk: door de grotere Pip zakte "Verder" in de kijkfase onder de vouw.** *Opgelost:* onder 780 px schermhoogte heeft Pip weer zijn gewone maat. Op lage staande schermen staat de knoppenrij boven het bord. Dit is met een doorloopregel bewezen.
- **Belangrijk: bij wereld af bleef de pagina staan waar het bord stond.** *Opgelost:* de beloning begint bovenaan.
- **Klein: de wapenrij op 360 en twee Pips op het feestscherm.** *Opgelost:* zie Codebase. Bovenin staat nu een kleine Pip.

## Layout (start 7 · kijk 6 · opgave 6 · wereld af 8 · kaart 7 / 6)
- **Belangrijk: "Volgende les" viel bij wereld af op bijna alle formaten onder de vouw.** *Opgelost:* bij wereld af staan de knoppen direct onder de feestkaart (CSS-volgorde). De doorloop meet de onderkant op 623, 636 en 605 px.
- **Klein: Pip kromp met een schok.** *Opgelost:* er is nu een overgang van 250 ms (uit bij reduced-motion).
- **Klein: de achtergrond stopte op schermhoogte.** *Opgelost:* `min-height: 100dvh`.
- **Klein: de grote kennismakings-Pip zie je alleen op hoge schermen.** *Bewust zo:* "Verder" in beeld gaat voor.

## Codebase
- **Belangrijk: de wapenrij was alleen op 390 breed 8 + 7** (op 320 7+7+1, op 393 9+6). *Opgelost:* de maat van een wapen volgt nu de breedte, en de rij is precies 8 wapens breed. De doorloop bewijst dat op 320, 393 en 1024.
- **Klein: geen doorloopregel voor wereld af.** *Opgelost:* zie boven.
- **Klein: het bord springt na de eerste zin.** *Verzacht* met de overgang.

## Wow (ronde 14, vóór verwerking)
| scherm | layout | conversie |
|---|---|---|
| Startpagina | 7 | 7 |
| Eerste les | 6 / 6 | 6,5 |
| Wereld af | 8 | 8 |
| Kaart | 7 / 6 (3 af) | 7,5 |

Wat naar een 9 ontbreekt:
- **Kaart:** in één beeld laten zien wat het kind al gehaald heeft, met een plank van gewonnen wapens bovenaan.
- **Kijkfase:** het bord laten vertellen, met een stuk of oplichtende velden.
- **Startpagina:** Pip groot boven de vouw.
- **Wereld af:** Pip en wapen nog groter.
