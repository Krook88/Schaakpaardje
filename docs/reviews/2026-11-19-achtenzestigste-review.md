# Achtenzestigste review: Pip kijkt terug na een partij (2026-11-19)

Scope: 7de07dd. Na een partij tegen een bot staat bij de uitslag "Wat zag Pip?": Pip toont één
moment (een gemiste slag of een eigen mooie slag) op het bewegende bord. Nieuwe telling
'Terugblik' {soort}. Ook nieuw: `docs/12-kindertest.md`. Reviewers: alle vier, vanuit de
hoofdsessie gestart (de coördinator kan zelf geen agents starten) en hier gebundeld. De
layout-reviewer stopte na zijn rapport door een gebruikslimiet; zijn rapport was compleet.

**Oordeel bij de review: NO-GO** (schaakmeester: Pip prees een slag die tot mat leidde, en
noemde een goede verdedigende zet een gemiste kans; layout: dwars op een telefoon bleef het
bord stilstaan). **Na verwerking: GO.** `npm run check` groen (663 tests), doorloop 84/84.

## Blokkerend
- **De controle keek twee halve zetten vooruit en miste mat en vork** (schaakmeester 1). *Opgelost:* `engine/nabespreking.ts` heeft een eigen zoeker die alleen materiaal telt, mat op elke diepte herkent (ook de laatste) en daarna slagen doorrekent (rustzoeken), diepte 3. "Mooi" wordt daarnaast getoetst aan de echte partij: winst drie halve zetten later nog aanwezig, en het kind niet mat. Raakt het budget op, dan zegt Pip niets. De drie stellingen van de schaakmeester (onderste rij, vork, mat na axb4) staan als test.
- **Een minder slechte slag telde als kans** (schaakmeester 2). *Opgelost:* een gemiste slag moet ook twee pionnen beter zijn dan de stand vóór de zet. Stelling met b1=D+ als test.
- **Dwars (844×390) paste het bord niet en speelde het nooit af, ook niet op ▶** (layout 1). *Opgelost:* het Animatiebord kreeg een `kind`-variant met een kleiner bord als het scherm laag en dwars is; ▶ speelt nu altijd af na een tik, ook half in beeld; en de knop toont ▶ zolang het bord stilstaat (hij stond op ❚❚, zodat een tik juist pauzeerde). Nieuwe doorloopregel "uitlegbord half in beeld: knop toont ▶ en een tik speelt af".

## Belangrijk
- **Terugslaan telde als "mooi"** (schaakmeester 3). *Opgelost:* de winst wordt gemeten vanaf vóór de laatste zet van de ander. Test "terugslaan is geen winst".
- **"Kon terugpakken" ging soms over een ander stuk** (schaakmeester 4, codebase 1). *Opgelost:* `gratis` kijkt alleen of de ander op hetzelfde veld kan slaan. Test met de dame op a5.
- **De berekening bevroor het scherm tot 1,6 s na de uitslag** (codebase 2). *Opgelost:* de zoeker gebruikt de interne zetgenerator van chess.js (44 µs in plaats van 1,5 ms per stelling; een test valt om als chess.js die verandert), en het partijscherm rekent na elke zet van het kind al vooruit in `requestIdleCallback`, terwijl de bot "nadenkt". De motor onthoudt wat hij rekende. Gemeten over 15 lange partijen: bij de uitslag hooguit 14 ms.
- **"Nog een partijtje" viel na de tik onder de vouw** (layout 2, conversie 4). *Opgelost:* het terugblikbord toont één zin (`kort`) in plaats van drie, en de kaart scrolt na de tik zo dat de knop in beeld komt.
- **Knoppen van het bewegende bord kleiner dan 64 px** (layout 3). *Opgelost:* in de `kind`-variant 64 px (▶ 80 px breed).
- **'Terugblik' stond niet op het dashboard** (conversie 1). *Opgelost:* in "Partijen" staat nu "Wat zag Pip? bekeken: N (kans gemist, zelf gepakt), bij M partijen tegen Rens en sterker", met `TERUGBLIK_VANAF`. Daarbij bleek dat 'Gedeeld' en 'Held naar les' ook al weken bewaard werden zonder getoond te worden; die staan er nu ook. Nieuwe test: elke telling uit de vaste lijst moet op het dashboard voorkomen.
- **De kindertest kwam niet bij de nieuwe functie** (conversie 2). *Opgelost:* het protocol vraagt een kind van 8+ tegen Rens te spelen, en de invullijst heeft vier regels over "Wat zag Pip?" (ook "begreep het kind het", schaakmeester-tip).

## Klein
- Jonge kinderen (Mila, Kiki) zien de terugblik nooit (conversie 3). *Zo gelaten, met reden:* in het pionnenspel staat er geen stuk om te pakken; didactisch klopt dat. Staat nu in het protocol en in de noemer op het dashboard.
- Veldnaam en zetnummer horen bij wereld 12 (schaakmeester 5). *Opgelost:* "Kijk, hier was jij aan zet." en "Je loper kon de dame pakken.", zonder veld en zetnummer.
- Verleden tijd bij iets wat niet gebeurde (schaakmeester 6). *Opgelost:* bij een gemist moment "Dan kan niemand terugpakken." / "Dan kan Bas wel terugpakken, maar hou jij meer over."
- Promotie bij een slag (schaakmeester 7, codebase 4). *Deels:* een mooie slag met promotie toont nu het gekozen stuk (`wordt`). Een gemiste slag met promotie blijft buiten beschouwing, zoals de schaakmeester als mogelijkheid noemde.
- "De ander" is afstandelijk (schaakmeester 8). *Opgelost:* de roepnaam van de bot ("Bas"); `roepnaam` staat nu bij elke bot.
- Commentaar over het aantal zoekopdrachten klopte niet (codebase 3). *Opgelost.*
- Kindertekst in de motor (codebase 5). *Opgelost:* `terugblikStappen` staat in `src/play/terugblik.ts`.
- De doorloop dekt de terugblik zelf niet (codebase 6, layout 1c). *Deels:* de fout uit de layout-review (bord half in beeld) heeft een doorloopregel. Een hele partij uitspelen tot er een moment is, duurt minuten en hangt af van toevalszetten van de bot; dat is met een script nagespeeld (390×844 en 844×390) maar niet in de doorloop gezet.
- Tests voor terugpakken met winst, promotie en rekentijd (codebase 7). *Opgelost voor terugpakken; rekentijd gemeten (zie boven) maar niet als test, omdat de snelheid per machine verschilt.*
- Pip staat dwars op 667×375 ver onder het bord (layout 4). *Zo gelaten:* de zin wordt uitgesproken; meekijken bij de kindertest.
- Twee borden naast elkaar (layout 5). *Opgelost:* het grote bord wijkt terug (opacity 0,55) zolang de terugblik open is.
- Focus raakt kwijt na de tik (layout 6). *Opgelost:* de focus gaat naar het terugblikbord.
- Weinig houvast voor een kind dat niet leest (layout 7). *Zo gelaten:* Pip zegt een vaste zin bij het openen; een uitnodiging vóór de tik vraagt een nieuwe opname. Kindertest.
- Nieuwe zinnen niet te horen in de testomgeving (layout 8). *Geen actie:* ze worden ingesproken bij het publiceren (ongeveer 100 tekens).
- "Zelf proberen" na de terugblik (conversie 5). *Zo gelaten:* goed idee voor een volgende fase.
- Ouderscherm klonk alsof er per kind gemeten wordt (conversie 6). *Opgelost:* "(en of er daarna op 'Wat zag Pip?' getikt werd)".
- Protocol niet geschikt voor een ouder zonder technische kennis (conversie 7). *Opgelost:* twee delen (afnemer / Kaj), uitleg privévenster per browser, toestemmingstekst, "wil het kind stoppen, dan stop je", "tikken tot de eerste opgave" uitgelegd, datum en tijd noteren.

## In orde volgens de reviewers
- Nergens iets over mat; één moment; geen druk; geen terugblik bij samen spelen.
- Privacy: één eigenschap met twee vaste waarden, in beide vaste lijsten.
- Terugnemen en "Nog een keer" ruimen de terugblik netjes op; eigen opstellingen kloppen.
