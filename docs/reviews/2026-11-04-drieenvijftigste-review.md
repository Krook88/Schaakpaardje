# Drieënvijftigste review: brede review rondes 16–30 (2026-11-04)

Schaakmeester en codebase-reviewer over 56c0dc7..aad7bfe. In deze rondes keken de layout- en conversie-reviewer al per ronde mee (41e–52e review). **Oordeel na verwerking: GO.** `check` groen, `doorloop` groen (nu 58 regels).

## Schaakmeester
Niets blokkerends. De wijziging in w9 haalt een fout weg ("Dan roep je: schaak!" is geen regel). Het paard op e5 in weide-1 is een begroeting, geen les over het paard.
- **Klein: het woord "schaakbord" verdween uit weide-1.** *Opgelost:* de tweede zin begint met "Dit is het schaakbord."
- **Klein: "het is geen regel" is abstract.** *Opgelost:* "Lukt het? Dan mag je 'schaak' zeggen, maar het hoeft niet."

## Codebase-reviewer
- **Groot 1: zes losse dwarsblokken in LessonPlayer.module.css.** *Opgelost:* samengevoegd tot één blok voor dwars en één voor dwars ≤ 720 px, met de herkomst in één commentaar.
- **Groot 2: dubbele mediaquery en dode regel in Welkom.module.css.** *Opgelost:* één blok. `!important` op `.kop` vervangen door een specifiekere selector.
- **Groot 3: Pip geselecteerd als `:first-child`.** *Opgelost:* eigen klasse `.feestPip`.
- **Groot 4: `display: contents` met `span 30` en `margin !important`.** *Opgelost:* het speelscherm heeft nu drie blokken in de JSX (boven, bord, onder). Dwars staat het bord over alle rijen en niet meer met een magisch getal. De pagina is dwars precies één scherm hoog. Onder 400 px hoogte scrolt hij wel, anders viel Pip eraf.
- **Middel 5: `order` gaf een andere tabvolgorde dan het beeld.** *Verbeterd:* alleen de twee blokken wisselen van rij op schermen onder 400 px hoogte. Binnen een blok blijft de DOM-volgorde. De volgorde boven/onder verschilt daar nog. Dat is bewust: de knoppen moeten op de kleinste telefoon in beeld zijn, en een kind bedient dit niet met een toetsenbord.
- **Middel 6: 410 px als vast getal.** *Opgelost:* het staat nu in `--naast-bord` met uitleg, en een nieuwe doorloopregel controleert dat de knoppen in beeld staan op 1440×900, 1366×650 en 1280×800.
- **Middel 7: geen test of elke bot een tekening heeft.** *Opgelost:* `tests/illustraties.test.ts`.
- **Middel 8: de huppel overschreef de selectievergroting.** *Opgelost:* `.golf .square:not(.selected) .piece`.
- **Klein 9: `!important` op de icoonmaat in de plank.** *Niet opgelost:* `Icoon` zet zijn maat inline. Een `maat`-prop per breakpoint vraagt JS voor iets wat CSS hier goed doet.
- **Klein 10: `.wereldAfTel` op twee plekken verborgen.** *Opgelost* in de samenvoeging. Er staat één regel per bedoeling: smal en laag, of dwars.
- **Klein 11: uitgeschakelde primaire en secundaire knoppen zien er gelijk uit.** *Zo gelaten:* uitgeschakeld is uitgeschakeld. `--muted` haalt 4,8:1 in licht en 7:1 in donker.
- **Klein 12: commentaar noemde nog een emoji.** *Opgelost.*
- **Klein 13: twee definities van "werelden af".** *Niet opgelost:* ze tellen verschillend. Op het wereld-af-scherm telt de wereld die net af is mee, ook als het opslaan nog loopt. Op de kaart telt alleen wat opgeslagen is. Eén helper zou dat verschil verbergen.
