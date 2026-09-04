# 1. Wat is schaken precies? (domeinanalyse)

Doel van dit hoofdstuk: het spel opdelen in **leerbare brokjes**, zodat het curriculum
en de datamodellen van de app hierop 1-op-1 aansluiten.

## 1.1 Het spel in één alinea
Schaken is een tweepersoons-bordspel op 8×8 velden (64 velden), met 16 stukken per
speler. Wit begint, daarna om de beurt één zet. Doel: de vijandelijke koning
**schaakmat** zetten — hij staat aangevallen en er is geen enkele legale zet meer om
dat op te heffen. Er is geen geluk in het spel: alle informatie is zichtbaar.

## 1.2 Onderdelen (elk = een leerobject in de app)

### A. Het bord
- 64 velden, om en om licht/donker.
- **Wit rechtsonder** (het veld h1 is licht) — klassieke opzetfout bij kinderen.
- **Rijen** (1–8, horizontaal), **lijnen** (a–h, verticaal), **diagonalen**.
- Veldnamen = lijn + rij (`e4`). Basis voor notatie én voor puzzel-data (FEN).
- Beginopstelling: pionnen op rij 2/7; achterste rij: toren, paard, loper, dame,
  koning, loper, paard, toren. Ezelsbruggetje: **"de dame op haar eigen kleur"**.

### B. De stukken en hun gang
| Stuk | Beweging | Waarde | Moeilijkheid voor kind |
|---|---|---|---|
| Toren | recht, onbeperkt | 5 | makkelijk |
| Loper | diagonaal, onbeperkt | 3 | makkelijk |
| Dame | recht + diagonaal | 9 | makkelijk (combinatie) |
| Paard | L-sprong (2+1), **springt over stukken** | 3 | moeilijkst |
| Koning | 1 veld alle richtingen | ∞ | makkelijk, maar regels rondom schaak zijn lastig |
| Pion | 1 vooruit (2 vanaf start), **slaat schuin**, promoveert | 1 | verwarrend: lopen ≠ slaan |

### C. Bijzondere regels
- **Promotie** (pion bereikt overkant → wordt dame/toren/loper/paard).
- **Rokade** (kort/lang) met vier voorwaarden: koning en toren nog niet gezet, velden
  ertussen leeg, koning staat niet schaak, gaat niet door/naar aangevallen veld.
- **En passant** (slaan in het voorbijgaan).
- **Aanraken = zetten** (clubregel; in de app als "netjes schaken"-badge).

### D. Einde van de partij
- **Schaak** → drie manieren om eruit te komen: **slaan, ertussen zetten, weglopen**.
- **Mat** → gewonnen.
- **Pat** (geen legale zet, niet schaak) → **remise**; klassieke valkuil bij kinderen.
- Overige remises: zetherhaling (3×), 50-zettenregel, onvoldoende materiaal, afspraak.

### E. Vaardigheden (dit is waar het echte leren zit, niet in de regels)
1. **Bordvisie** — zien welke velden een stuk bestrijkt, wat "aangevallen" betekent.
2. **Aanvallen & verdedigen** — dreiging zien, stuk redden (wegzetten, dekken,
   tegenaanval, tussenzetten, aanvaller slaan).
3. **Materiaal & ruilen** — tellen, gelijkwaardig ruilen, "gratis stuk pakken".
4. **Mat-patronen** — mat in 1, herderemat, mat met dame+koning, mat met toren+koning.
5. **Tactiek** — dubbele aanval, penning, aftrekaanval, spies, aftrekschaak, lokken.
6. **Openingsprincipes** — centrum bezetten, stukken ontwikkelen, rokeren, niet 10×
   met hetzelfde stuk, dame niet te vroeg.
7. **Eindspel** — pion promoveren, oppositie, koning is een sterk stuk.
8. **Spelhouding** — nadenken vóór de zet, controleren "wat dreigt de tegenstander?",
   verliezen kunnen, netjes handen schudden.

## 1.3 Wat betekent dit technisch?
Elk leerobject hierboven is in de app representeerbaar als:
- **positie** → FEN-string,
- **opdracht** → doelconditie (bereik veld, sla stuk, geef mat in 1, overleef N zetten),
- **feedback** → legale-zet-check + didactische hint,
- **audio** → één of meer gesproken regels.

Dat maakt het curriculum volledig **data-gedreven** (zie hoofdstuk 6).
