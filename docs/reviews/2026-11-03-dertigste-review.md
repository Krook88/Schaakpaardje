# Dertigste review: de wereldkaart (2026-11-03)

Fase: "volgende niveau", ronde 5. Wat er nieuw is:
- een reis-strook bovenaan;
- heuvels onder de open werelden;
- de dichte werelden als gekleurde tegels "Nog te ontdekken";
- afgeronde werelden die je kunt inklappen;
- de kaart scrolt vanzelf naar Pip.

De reviewers zijn rechtstreeks gestart.

**Oordeel na verwerking: GO voor deze fase.** Er is niets blokkerends. `check` en de doorloop zijn groen; de doorloop heeft er een regel bij die het scrollen bewijst.

## Schaakmeester
- **Hoofdvraag: zijn de tegels "Matklif: Schaakmat!" en "Schaakmeer" voor een kind in wereld 0 een te vroege introductie van mat?** Nee. Een vooruitzicht is geen uitleg: er wordt niets van het kind gevraagd, en dezelfde teksten stonden al op de kaart.
- **Klein: beloftes van w10, w6 en w11 zijn wat ruim versimpeld.** *Niet aangepast:* het zijn versimpelingen, geen onwaarheden, en de content valt buiten deze fase.

## Layout
- **Belangrijk: "Lessen bekijken" was 48 px en kon niet terug dicht.** *Opgelost:* het is nu een echte knop van 64 px met een chevron, en hij wisselt naar "Dichtklappen".
- **Belangrijk: reis-wapens die op knoppen leken.** *Opgelost:* ze zijn nu duidelijk passief: 30 px, zonder rondje.
- **Belangrijk: dichte tegels zagen er even open uit als open werelden, en een tik deed niets.** *Opgelost:* het wapen is half grijs. Een tik laat de tegel wiebelen en toont "Eerst De Weide!". Bij reduced-motion wiebelt hij niet.
- **Klein: contrast van de belofte op lichte tegels zat op de grens.** *Opgelost:* de belofte staat nu in `--ink` met 85% dekking.
- **Klein: de heuvels misten een regel voor `data-theme=dark`.** *Opgelost.*
- **Klein: op de telefoon stond het laatste wapen alleen op een regel (7/7/1).** *Opgelost* met een strook van maximaal 290 px, dus 8/7.
- **Klein: "0 sterren" en "nog geen hoefijzer" op aparte regels.** *Opgelost:* tellers op nul verdwijnen.
- **Klein: twee paardjes in beeld.** *Niet opgelost:* het wapen van Paardenstal is content. Pip staat op het pad met "Begin hier" ernaast, en dat onderscheidt hem genoeg.

## Conversie
- **Belangrijk: de reis-strook nam de plek boven de vouw in.** *Opgelost:* de strook is compact en heeft geen tellers op nul. De eerste les begint nu rond y 300.
- **Belangrijk: het open rondje zag er niet uit als een knop.** *Opgelost* met een label "▶ Begin hier".
- **Klein: drie ingeklapte werelden vóór de open wereld.** *Gedeeltelijk:* de kaart scrolt naar Pip, en de doorloop bewijst dat. De volgorde blijft gelijk, want de reis loopt van boven naar beneden.
- **Klein: de pagina eindigde doodlopend.** *Opgelost* met een knop "Verder met de les" onderaan.
- **Klein: een tik op een tegel gaf geen uitleg.** *Opgelost* met "Eerst …!" (zie Layout). Meer uitleg dan dat niet: de belofte staat er al.
- **Klein: geen telling "les gestart vanaf de kaart".** *Niet toegevoegd:* "Les begonnen" bestaat al. De bron van een start erbij tellen is een keuze voor Kaj; dat komt eventueel later.

## Codebase
- **Belangrijk: de doorloop testte het scrollen niet.** *Opgelost:* de test draait nu op een scherm van 390×500 en controleert ook `scrollY > 0`. Uitkomst: scrollY 935, de les in beeld.
- **Klein: React-gecontroleerd `open`.** *Geaccepteerd:* een tik van de gebruiker blijft staan, en de randgevallen (af worden op de kaart zelf, wisselen van profiel) gebeuren niet op dit scherm.
- **Klein: alles af → Pip valt terug op wereld 0.** *Niet opgelost:* dat bestond al vóór deze fase. Het staat op het scorebord.
- **Klein: `aria-label` op spans zonder rol.** *Opgelost:* het hoefijzer heeft `role="img"` en het slotje op de tegels is `aria-hidden`, met de hele uitleg in de `aria-label` van de knop.
- **Klein: verouderd commentaar.** *Weggehaald.*

## Wow: wereldkaart
| layout | conversie | vorige ronde (27e) |
|---|---|---|
| 6,5 | 7,5 | 5 / 6,5 |

De cijfers zijn gegeven vóór de verwerking. Naar een 9:
- één doorlopend landschap met een slingerend pad;
- Pip die op de halte stuitert;
- een "Bijna!"-glimp op de volgende wereld.
