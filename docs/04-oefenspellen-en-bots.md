# 4. Oefenen met "echte spelletjes" op verschillende niveaus

Naast het modulepad is er een tweede ingang: **Spelen**. Hier gaat het niet om leren
maar om ervaring opdoen. Drie soorten tegenstanders: bots, minispellen, en samen
(pass-and-play op één tablet).

## 4.1 De niveauladder (10 treden)
Elke trede is een **diertje met een eigen gezicht en speelstijl**, niet een Elo-getal —
kinderen kiezen een vriendje, geen moeilijkheidsgraad. Het Elo-getal staat wél in de
ouderweergave.

| # | Bot | Materiaal / bord | Motor | ~Elo | Ontgrendeld na |
|---|---|---|---|---|---|
| 1 | 🐭 Mila de Muis | Pionnenspel (alleen pionnen) | random-legal | – | Wereld 6 |
| 2 | 🐣 Kip Kiki | koning + 3 pionnen | greedy (slaat gratis stukken) | ~150 | 5 partijen |
| 3 | 🐰 Rens het Konijn | koning + toren + pionnen | greedy + 1-ply blunder-check | ~350 | – |
| 4 | 🐶 Bas de Hond | volledige set | Stockfish skill 0, 50 ms | ~600 | Wereld 9 |
| 5 | 🦊 Fien de Vos | volledig | Stockfish skill 3 | ~900 | – |
| 6 | 🦉 Oscar de Uil | volledig | Stockfish skill 6 | ~1200 | Wereld 12 |
| 7 | 🐻 Bram de Beer | volledig | Stockfish skill 10 | ~1500 | – |
| 8 | 🐉 Draak Duco | volledig | Stockfish skill 14 | ~1900 | Hoefijzer Goud |
| 9 | 👑 Pip zelf | volledig, geeft uitleg bij elke zet | Stockfish + commentaar | variabel | altijd |
| 10 | 👨‍👩‍👧 Samen spelen | volledig, 2 spelers 1 tablet | – | – | altijd |

**Belangrijk ontwerpbesluit:** de laagste treden gebruiken **géén Stockfish**. Een sterke
engine die "zwak speelt" speelt onmenselijk (rare, willekeurig-slechte zetten). Een
eigen simpele bot (random → greedy → 1-ply) voelt voor een 5-jarige veel natuurlijker
en scheelt bovendien laadtijd op oude tablets.

## 4.2 Kindvriendelijke bot-laag
Boven elke motor zit dezelfde `KidBot`-wrapper met:
- **Blunder-budget** — de bot mag bewust N keer per partij een stuk laten staan,
  passend bij het niveau, maar zet nooit "onmogelijk dom" terug op zet 1.
- **Genadeplafond** — bij +9 materiaalvoorsprong speelt de bot rustiger door in plaats
  van te matten; bij een hopeloze stand voor het kind biedt Pip "zullen we terugnemen?".
- **Terugnemen (undo)** — altijd toegestaan t/m niveau 6, met een vriendelijke opmerking.
- **Hints** — 2 niveaus: "kijk eens naar je toren" → "je toren kan gratis iets pakken".
- **Waarschuwing vóór blunder** (uitzetbaar, standaard aan t/m niveau 4):
  *"Weet je het zeker? Je paardje staat dan te pakken."*
- **Nabespreking** — na de partij 1 scherm: je beste zet, je moeilijkste moment,
  1 puzzel uit je eigen partij.

## 4.3 Minispellen (los speelbaar en als lesonderdeel)
Pionnenspel · Vang de vlag · Torenjacht · Hongerig paardje · Paardensprong-parcours ·
Dame-doolhof · Koningsloop · Red je stuk · Mat in 1-regen · Schrijf de zet ·
Slagveld (alleen slaan telt) · Weegschaal (welke ruil is goed?).

Elk minispel heeft 6 niveaus en een eigen sterrenscore. Ze zijn tegelijk het
**motortje van de adaptiviteit**: fouten per thema worden geteld.

## 4.4 Puzzels
- Eigen puzzelbank, opgeslagen als `{fen, oplossing[], thema, moeilijkheid}`.
- Bron: zelf genereren uit gespeelde partijen + handmatig samengesteld per thema, en/of
  een **open-licentie set (Lichess puzzle database, CC0)** filteren op thema en
  moeilijkheid — dat scheelt maanden contentwerk en is juridisch veilig.
- **Dagelijkse puzzel** van Pip (1 per dag, kort, altijd haalbaar).

## 4.5 Adaptiviteit
- Per kind een **thema-profiel**: voor elk van ~25 thema's een beheersingsscore 0–1
  (exponentieel voortschrijdend gemiddelde over de laatste pogingen).
- Puzzel-/opgavekeuze mikt op **~80% succeskans** (flow-zone).
- Zwakke thema's komen terug met spreiding (1 dag → 3 → 7 → 21).
- Botniveau-advies: bij 3 winstpartijen op rij stelt Pip voor om een sterker vriendje te
  proberen; het kind kiest zelf (autonomie > automatische escalatie).
