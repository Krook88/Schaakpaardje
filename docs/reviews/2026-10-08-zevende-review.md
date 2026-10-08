# Zevende review, 8 oktober 2026

Scope: PR #7 (`319b7c4`, uit schaak per manier, nog niet gemerged), PR #6 (`4419149`,
vier schermpunten) en PR #5 (`2476d1c`, `44853e9`, Pip zwijgt bij binnenkomst,
geluidsknop), plus de doorloopregel uit `4c8679c`. Reviewers: schaakmeester,
codebase-reviewer, layout-reviewer. `npm run check` en `npm run doorloop` waren groen.

## Oordeel

**NO-GO voor PR #7** tot B1 is opgelost. *Bijgewerkt: B1 en alle belangrijke punten zijn opgelost; zie de statuskolom. De overige kleine punten blijven open met reden: ze raken het kind niet direct en horen bij een volgende ronde.* De opzet klopt (een manier per opgave,
stellingen mogelijk, goede antwoorden berekend, dubbelschaak afgevangen), maar de
fouttips gaan ervan uit dat elke foute zet legaal is. In deze les is dat juist zelden
zo, en dan zegt Pip "Je koning is veilig" terwijl hij schaak staat.

PR #5 en #6 staan al live. Daarin niets blokkerends, wel punten hieronder.

## Blokkerend

| | Bevinding | Status |
|---|---|---|
| B1 | `tikRegelZet` geeft `'fout'` voor drie dingen: een onwettige zet, een stuk zonder zetten, en een wettige zet op de verkeerde manier. Het scherm toont in alle drie de foutTip van de opgave. Bij schaak-3 levert dat onware zinnen op: Kd1/Kf1 in meedoen geeft "Dat was er iets tussen zetten", Ke2 in zelf 1 geeft "Je koning is veilig". Alle drie de reviewers vonden dit. | **Opgelost**: `tik()` geeft bij een onmogelijke zet `reden: 'magNiet'`; `foutZin()` kiest dan een vaste zin ("Dan sta je nog steeds schaak...") en nooit de fouttip. Lesscherm en opfrisser gebruiken `foutZin`. Test per opgave in `tests/uit-schaak.test.ts` (verkeerde manier via `tik()` is fout met de fouttip, onmogelijke koningszet krijgt de regelzin) en doorloopregel 7. |

Voorstel: de runner geeft een reden mee (`kanNiet` of `andereManier`). De foutTip
alleen bij `andereManier`; bij `kanNiet` een vaste zin ("Dan sta je nog steeds
schaak. Dat mag niet."). Een doorloopregel die in schaak-3 een onwettige koningszet
tikt. Een test die per opgave een wettige zet op de verkeerde manier via `tik()`
speelt en `'fout'` verwacht.

## Belangrijk

| | Bevinding | Status |
|---|---|---|
| I1 | En passant die de schaakgevende pion slaat telt als `ertussen`, niet als `slaAanvaller` (`zet.to` is het lege veld). Nu nog geen opgave die het raakt. | **Opgelost**: bij en passant wordt het veld van de geslagen pion vergeleken. Test erbij. |
| I2 | Nergens geoefend dat de koning niet weg kan langs de lijn of rij van de aanvaller. | **Opgelost**: vertelzin "blijf je op de lijn van de toren, dan kan hij je nog steeds raken", en de onmogelijke koningszet krijgt nu de regelzin. |
| I3 | Doel is "alle drie de manieren", de toets toetst er een. | **Opgelost**: de toets heeft drie bordopgaven, een per manier. |
| I4 | Vind het veld: na Tipje verdwijnt de opdracht voor de rest van de ronde, en Pip zegt "Helemaal goed" bij 1 van de 3. | **Opgelost**: tipje en een goede tik gaan via `zegTip`, dus de opdracht komt terug. Doorloopregel 8. |
| I5 | Kop op 360 px te vol sinds de geluidsknop: "Terug" breekt, lestitel tot 5 regels, bord 60 px lager. | **Opgelost**: "· Meedoen" uit de lestitel, Terug onder 400 px alleen een pijl (woord voor de schermlezer). Gemeten op 360: titel 2 regels, knoppen 56×56. |
| I6 | Geluidsknop 50×48 (norm 64), en hetzelfde 🔊 als Pips praatknop terwijl hij het tegenovergestelde doet. | **Opgelost**: 56×56 en gelijk aan ⚙️; een bel 🔔/🔕 in plaats van de luidspreker, die blijft voor "zeg het nog eens". |

## Klein

| | Bevinding | Status |
|---|---|---|
| K1 | Validate vergelijkt `goedeZetten` (alleen damepromotie) met alle `legalMoves`. | **Opgelost**: dezelfde damepromotie-filter. |
| K2 | De vier uit-schaak-eisen staan op drie plekken; een constante `UIT_SCHAAK_EISEN`. | Open: netheid, geen gedrag. Bij een vijfde eis meenemen. |
| K3 | Alleen torens geven schaak in schaak-3; ook eens loper, dame of paard. | **Opgelost**: in de toets geven een paard en een loper schaak. |
| K4 | Zelf 3 vraagt opnieuw slaan; ertussen komt in zelf maar een keer voor. | **Opgelost**: zelf 3 vraagt nu ertussen. |
| K5 | Vertelzin "een koning mag nooit geslagen worden" kan klinken als "schaak is ongevaarlijk". | **Opgelost**: "je koning mag nooit aangevallen blijven staan". |
| K6 | `alGeladen`: dubbele JSDoc, en een zin dat het niet samengaat met later hydraterende delen. | Open: alleen commentaar; geen later hydraterende delen in `src`. |
| K7 | `allesAf` herhaalt de twee-sterrendrempel; naar een functie naast `wereldIsAf`. | Open: netheid; het pad is lineair, dus het antwoord klopt. |
| K8 | Geluidsknop overschrijft "Pip uit, geluidjes aan" van de ouder. | Open: bewuste keuze "stil is stil". Kaj beslist of de stand van de ouder terug moet. |
| K9 | Doorloopregel controleert niet dat Pip na een les wel vanzelf praat; vaste wachttijden. | Open: volgende ronde, samen met wachten op `__gezegd` in plaats van vaste tijden. |
| K10 | Lege naam: na de eerste tik staat Beginnen 700 px uit beeld. | Open: volgende ronde. Het gedrag klopt, alleen het scrollen niet. |
| K11 | Alles af: wereldrij omcirkelt nog wereld 0, Pip zegt "Zullen we verder?". | Open: vraagt een eigen ingesproken Pip-zin; volgende ronde. |
| K12 | Bordvelden op 360 px 40,5 px (onder 44). | Open: vraagt een andere paginapadding op alle borden; eerst in een eigen ronde nameten. |
| K13 | Hintring in de bordhoek: donkere binnenrand volgt de ronde hoek niet. | Open: cosmetisch, alleen op a1/h1/a8/h8. |

## Wat goed is

- Alle stellingen van schaak-3 mogelijk; goede zetten kloppen; koning die slaat telt als slaan.
- Dubbelschaak en promotie-ertussen goed ingedeeld.
- Welkomstpagina: Pip zegt niets, in alle vier de combinaties nagemeten.
- Hintring in donker duidelijk zichtbaar. Geen horizontaal scrollen, geen consolefouten, geen netwerkverkeer naar buiten.
