# Zevende review, 8 oktober 2026

Scope: PR #7 (`319b7c4`, uit schaak per manier, nog niet gemerged), PR #6 (`4419149`,
vier schermpunten) en PR #5 (`2476d1c`, `44853e9`, Pip zwijgt bij binnenkomst,
geluidsknop), plus de doorloopregel uit `4c8679c`. Reviewers: schaakmeester,
codebase-reviewer, layout-reviewer. `npm run check` en `npm run doorloop` waren groen.

## Oordeel

**NO-GO voor PR #7** tot B1 is opgelost. De opzet klopt (een manier per opgave,
stellingen mogelijk, goede antwoorden berekend, dubbelschaak afgevangen), maar de
fouttips gaan ervan uit dat elke foute zet legaal is. In deze les is dat juist zelden
zo, en dan zegt Pip "Je koning is veilig" terwijl hij schaak staat.

PR #5 en #6 staan al live. Daarin niets blokkerends, wel punten hieronder.

## Blokkerend

| | Bevinding | Status |
|---|---|---|
| B1 | `tikRegelZet` geeft `'fout'` voor drie dingen: een onwettige zet, een stuk zonder zetten, en een wettige zet op de verkeerde manier. Het scherm toont in alle drie de foutTip van de opgave. Bij schaak-3 levert dat onware zinnen op: Kd1/Kf1 in meedoen geeft "Dat was er iets tussen zetten", Ke2 in zelf 1 geeft "Je koning is veilig". Alle drie de reviewers vonden dit. | Open |

Voorstel: de runner geeft een reden mee (`kanNiet` of `andereManier`). De foutTip
alleen bij `andereManier`; bij `kanNiet` een vaste zin ("Dan sta je nog steeds
schaak. Dat mag niet."). Een doorloopregel die in schaak-3 een onwettige koningszet
tikt. Een test die per opgave een wettige zet op de verkeerde manier via `tik()`
speelt en `'fout'` verwacht.

## Belangrijk

| | Bevinding | Status |
|---|---|---|
| I1 | En passant die de schaakgevende pion slaat telt als `ertussen`, niet als `slaAanvaller` (`zet.to` is het lege veld). Nu nog geen opgave die het raakt. | Open |
| I2 | Nergens geoefend dat de koning niet weg kan langs de lijn of rij van de aanvaller. | Open |
| I3 | Doel is "alle drie de manieren", de toets toetst er een. | Open |
| I4 | Vind het veld: na Tipje verdwijnt de opdracht voor de rest van de ronde, en Pip zegt "Helemaal goed" bij 1 van de 3. | Open |
| I5 | Kop op 360 px te vol sinds de geluidsknop: "Terug" breekt, lestitel tot 5 regels, bord 60 px lager. | Open |
| I6 | Geluidsknop 50×48 (norm 64), en hetzelfde 🔊 als Pips praatknop terwijl hij het tegenovergestelde doet. | Open |

## Klein

| | Bevinding | Status |
|---|---|---|
| K1 | Validate vergelijkt `goedeZetten` (alleen damepromotie) met alle `legalMoves`. | Open |
| K2 | De vier uit-schaak-eisen staan op drie plekken; een constante `UIT_SCHAAK_EISEN`. | Open |
| K3 | Alleen torens geven schaak in schaak-3; ook eens loper, dame of paard. | Open |
| K4 | Zelf 3 vraagt opnieuw slaan; ertussen komt in zelf maar een keer voor. | Open |
| K5 | Vertelzin "een koning mag nooit geslagen worden" kan klinken als "schaak is ongevaarlijk". | Open |
| K6 | `alGeladen`: dubbele JSDoc, en een zin dat het niet samengaat met later hydraterende delen. | Open |
| K7 | `allesAf` herhaalt de twee-sterrendrempel; naar een functie naast `wereldIsAf`. | Open |
| K8 | Geluidsknop overschrijft "Pip uit, geluidjes aan" van de ouder. | Open |
| K9 | Doorloopregel controleert niet dat Pip na een les wel vanzelf praat; vaste wachttijden. | Open |
| K10 | Lege naam: na de eerste tik staat Beginnen 700 px uit beeld. | Open |
| K11 | Alles af: wereldrij omcirkelt nog wereld 0, Pip zegt "Zullen we verder?". | Open |
| K12 | Bordvelden op 360 px 40,5 px (onder 44). | Open |
| K13 | Hintring in de bordhoek: donkere binnenrand volgt de ronde hoek niet. | Open |

## Wat goed is

- Alle stellingen van schaak-3 mogelijk; goede zetten kloppen; koning die slaat telt als slaan.
- Dubbelschaak en promotie-ertussen goed ingedeeld.
- Welkomstpagina: Pip zegt niets, in alle vier de combinaties nagemeten.
- Hintring in donker duidelijk zichtbaar. Geen horizontaal scrollen, geen consolefouten, geen netwerkverkeer naar buiten.
