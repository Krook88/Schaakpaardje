# 3. Curriculum: "De reis van Pip het Schaakpaardje"

## 3.1 Mascotte
**Pip** — een vrolijk, moedig schaakpaardje dat zelf nog aan het leren is (het kind is
niet de leerling van Pip, ze leren *samen*; dat verlaagt de druk). Pip:
- spreekt **alles** in, met naam van het kind waar mogelijk,
- heeft 6 emoties (blij, verrast, denkend, aanmoedigend, trots, slaperig) → Rive-animatie,
- woont in de **Paardenstal**, het thuisscherm dat groeit naarmate het kind vordert,
- geeft hints in maximaal 2 stappen, nooit meteen het antwoord.

Toon: warm, kort, Nederlands, geen verkleinwoord-overkill, nooit belerend.
Voorbeeld: *"Hoppa! De toren loopt kaarsrecht. Nooit schuin — dat kan ik wél. Doe jij 'm eens naar de andere kant?"*

## 3.2 Structuur: werelden → lessen → 4-fasen-lus
De kaart is een **avonturenpad** (zoals een bordspel): 12 werelden, elk 3–6 lessen.
Elke les volgt dezelfde vaste lus, zodat kinderen het patroon herkennen:

1. **Kijken** (30–60 s) — Pip vertelt + animatie. Overslaan mag na 1× gezien.
2. **Meedoen** (1–2 min) — begeleide opgave met glow op het goede veld.
3. **Zelf doen** (2–4 min) — 3–8 opgaven, oplopend, hint na 2 pogingen.
4. **Minispel of sterrentoets** — 1–3 sterren; 2 sterren opent de volgende les,
   3 sterren geeft een sticker. Wereld af = **hoefijzer-diploma** met naam van het kind.

Voortgang is **lineair met zijpaden**: het pad is één lijn (duidelijk voor kleuters),
maar naast elke wereld staat een optioneel "oefenveldje" met extra puzzels.

## 3.3 De werelden

| # | Wereld | Onderwerp | Modus | Minispel |
|---|---|---|---|---|
| 0 | **De Weide** | Bord, licht/donker, wit rechts, rijen & lijnen, opzetten | 3+ | *Vind het veld* |
| 1 | **Torenburcht** | Toren: recht lopen, aanvallen, slaan | 3+ | *Torenjacht* (sla alle pionnen) |
| 2 | **Loperbos** | Loper: diagonaal, veldkleur-eigenschap, 2 lopers | 3+ | *Vang de vlag* |
| 3 | **Damepaleis** | Dame = toren + loper, sterkste stuk, voorzichtig zijn | 5+ | *Dame-doolhof* |
| 4 | **Paardenstal** | Paard: L-sprong, springen over stukken (Pips eigen wereld) | 5+ | *Paardensprong-parcours* + *Hongerig paardje* |
| 5 | **Koningskasteel** | Koning: 1 veld, koningen mogen niet naast elkaar, slaan/verdedigen | 6+ | *Koningsloop* |
| 6 | **Pionnenveld** | Pion: lopen ≠ slaan, dubbelstap, promotie, en passant | 6+ | *Pionnenspel (Pawn Wars)* |
| 7 | **Waardevallei** | Waarde van stukken, tellen, ruilen, gratis stuk pakken | 6+ | *Weegschaal* |
| 8 | **Aanvalsberg** | Aanval & verdediging: dreiging zien, 5 manieren om te redden | 7+ | *Red je stuk* |
| 9 | **Schaakmeer** | Schaak geven, en de 3 manieren eruit: slaan, ertussen, weglopen | 7+ | *Schaak-alarm* |
| 10 | **Matklif** | Mat, mat in 1, pat & remise, herderemat herkennen | 8+ | *Mat in 1-regen* |
| 11 | **Rokadehaven** | Rokade kort/lang + de 4 voorwaarden, koningsveiligheid | 8+ | *Breng de koning veilig* |
| 12 | **Notatie-eiland** | Notatie lezen/schrijven, partij navertellen, openingsprincipes | 8+ | *Schrijf de zet* |
| 13 | **Tactiekgrot** | Dubbele aanval, penning, aftrekaanval, spies (Stap 2) | 9+ | *Tactiekduel* |
| 14 | **Eindspelduinen** | Mat met dame+koning, toren+koning, pion promoveren, oppositie | 9+ | *Laatste pion* |

**Volgorde-verantwoording:** identiek aan de Nederlandse stappen-didactiek — makkelijk
stuk eerst, paard laat, pion na de dame, **mat pas in wereld 10**. Werelden 0–6 zijn
speelbaar zonder te kunnen lezen; vanaf 7 mag lichte tekst.

## 3.4 Voorbeeld: Wereld 4 — Paardenstal (uitgewerkt)
- **Les 4.1 — "Ik spring!"**: Pip laat de L zien met een spoor van hoefjes. Opgave:
  tik alle 8 velden aan waar Pip heen kan (bord leeg, paard in het midden). Daarna aan
  de rand → "hé, nu kan ik minder ver!"
- **Les 4.2 — "Over de heg"**: paard springt over eigen en vreemde stukken.
  Opgave: kom bij de wortel, er staan pionnen in de weg.
- **Les 4.3 — "Hongerig paardje"**: sla alle pionnen, elke zet moet raak zijn.
  (Klassieke bordvisie-oefening, 6 niveaus.)
- **Les 4.4 — "Parcours"**: bereik het doelveld in exact N sprongen (mini knight's tour).
- **Toets**: 8 gemengde opgaven → hoefijzer-diploma "Paardenmeester".

## 3.4b Wat er nu gebouwd is

Werelden 0 t/m 8 staan in de app (`src/content/werelden/`), samen 31 lessen.

Wereld 7 en 8 zijn didactisch een breuk met de eerste zeven: daar paste een kind een
regel toe, hier moet het **kiezen**. Twee zetten mogen allebei, maar eentje is beter.
Daarom zijn de antwoorden in die werelden niet met de hand ingetypt maar door de engine
berekend — `veiligeVelden`, `bedreigdeStukken` en `aanvallersVan` in `src/engine/board.ts`
zeggen precies welke velden veilig zijn en wie er aanvalt. `tests/wereld78.test.ts`
rekent het bij elke testronde opnieuw na, dus een gewijzigde stelling met een verouderd
antwoord valt meteen om.

Wereld 8 leert drie manieren om een aangevallen stuk te redden: weglopen, de aanvaller
slaan, en dekken. Dat zijn dezelfde drie die straks bij schaak terugkomen — dat is precies
waarom deze wereld vóór wereld 9 staat.

## 3.5 Diploma's
Drie interne diploma's, met een printbaar/deelbaar certificaat met de naam van het kind:
- **Hoefijzer Brons** — werelden 0–6 (alle stukken en regels behalve mat).
- **Hoefijzer Zilver** — werelden 7–12 (mat, rokade, remise, notatie) ≈ Stap 1-niveau.
- **Hoefijzer Goud** — werelden 13–14 + 20 gewonnen partijen ≈ Stap 2-instap.

Bij een latere samenwerking met KNSB/regionale bond kunnen deze aan officiële
stappen-diploma's gekoppeld worden — nu bewust **niet** zo genoemd.
