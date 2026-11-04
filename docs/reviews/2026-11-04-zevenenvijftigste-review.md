# Zevenenvijftigste review: bots die meekijken, Pip na de botzet (2026-11-04)

Traject 2, rondes 38–40, layout-reviewer. **Oordeel na verwerking: GO.** Wow speelscherm 7,5 (was 4–5).

- **Groot: "Hij heeft gezet" bij Mila, Kiki en Fien.** *Opgelost:* de botzinnen hebben geen voornaamwoord meer. "Jouw beurt!", "Schaak! Jij valt de koning aan.", "Mooi, schaak! Nu moet de koning gered worden." (eerst "weg": onjuist, tussenzetten of slaan mag ook) en "Pas op, daar staat je stuk niet veilig." De nieuwe opnames komen bij de volgende publicatie.
- **Middel: Pip lacht als de bot net een stuk sloeg.** *Opgelost:* dan zegt hij "Er is een stuk van je weg. Jouw beurt!" met de stemming bemoedigend.
- **Middel: 667×375, Pip onder de knoppen.** *Bewuste keuze* (47e en 54e review): op de kleinste telefoon gaan de knoppen voor. Het geluid speelt de zin af.
- **Klein: het denkwolkje van Fien en Mila ligt deels op het oor.** *Op het scorebord* voor de illustrator.
- De stemmingen zelf en commit 40 dwars: in orde.
- Schaak en mat zijn niet live uitgespeeld. Volgens de code schrijft `controleerEinde` er na de botzin overheen.

## Schaakmeester over de nieuwe zinnen
Niets blokkerends, geen matbegrip.
- **Middel: "Pas op, daar staat je stuk niet veilig." wijst naar het verkeerde stuk.** `blunderVerlies` kijkt naar elk stuk dat geslagen kan worden, ook bij een weggehaalde dekker. *Opgelost:* "Kijk nog eens: kan de ander nu iets van je slaan?" Zo zoekt het kind zelf.
- **Klein: "Nu moet de koning gered worden" klinkt als een opdracht aan het kind, en ligt dicht bij mat.** *Opgelost:* "Mooi, schaak! De ander moet nu iets doen."
- **Klein: "Er is een stuk van je weg" bij een eerlijke ruil.** *Zo gelaten:* de zin is waar en bemoedigend. Een balanscheck per zet staat op het scorebord.
