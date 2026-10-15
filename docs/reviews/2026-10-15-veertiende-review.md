# Veertiende review, 15 oktober 2026

Scope: `ddff2ca`, het contactformulier op het ouderscherm (`src/app/ouders/
ContactFormulier.tsx`, `public/teller/bericht.php`, berichten op het dashboard).
Reviewers: codebase-reviewer en layout-reviewer; geen schaakinhoud, dus geen
schaakmeester. `npm run check` groen.

## Oordeel

Codebase: **GO** op voorwaarde van B1 en B2. Layout: **GO**. *Bijgewerkt: alle
belangrijke punten opgelost; doorloop 13/13.*

## Belangrijk

| | Bevinding | Status |
|---|---|---|
| B1 | Zonder PHP gaf de server 200 met de broncode, en zei het formulier "verstuurd" terwijl het bericht nergens heen ging. Beide reviewers. | **Opgelost**: alleen 204 telt als gelukt. Doorloopregel 13 verstuurt het formulier zonder PHP en eist de foutmelding. |
| B2 | Eén script kon met 20 berichten per uur het formulier voor alle ouders dichtzetten. | **Opgelost**: hoogstens 3 per uur per afzender (hash van IP met een dagelijks nieuw zout, na twee uur weg; het IP-adres wordt niet bewaard), 60 per uur als vangnet. De "druk"-melding noemt info@. Tests erbij. |
| B3 | Mailtekst in 8bit kon regels boven 998 bytes krijgen. | **Opgelost**: base64 met `chunk_split`. |
| B4 | Envelope-afzender niet op het eigen domein, dus SPF/DMARC kon de mail in de spam zetten. | **Opgelost** in code: `-f info@schaakmaatje.nl`. Of SPF/DKIM bij TransIP goed staan, blijkt pas met een echte mail na publicatie. |
| B5a | Het formulier stuurt vrije tekst van een ouder: een uitbreiding van de privacyafspraak. | **Opgelost**: door Kaj gevraagd; vastgelegd in CLAUDE.md en docs/08. Het formulier vraagt geen naam van het kind te noemen. |
| B5b | "Na een jaar gewist" gebeurde alleen bij een nieuw bericht, en kon 13 maanden worden; de mailbox stond niet in docs/08. | **Opgelost**: opruimen ook bij elk dashboardbezoek, grens op 11 maanden terug (dus hoogstens een jaar). De mailbox staat in docs/08. Test erbij. |

## Klein

| | Bevinding | Status |
|---|---|---|
| K1 | Verborgen veld heette `website`: een browser kon het invullen, dan was het bericht stil weg. | **Opgelost**: heet `extra_veld`; zo'n bericht wordt gemarkeerd bewaard ("waarschijnlijk een robot"), alleen niet gemaild. |
| K2 | Mislukte mail niet te zien. | **Opgelost**: dashboard toont "niet gemaild". |
| K3 | Zonder datamap ook geen mail. | **Opgelost** als commentaar: bewust, anders is er geen limiet. |
| K4 | Tests misten opruimen, 503, mailkoppen, het formulier. | Deels: opruimen en de limieten getest, het formulier in de doorloop. Mailkoppen en 503 open: vragen een nagebootste sendmail; de echte mail na publicatie is de proef. |
| L2 | Layout: veldranden te zwak (1,4:1). | **Opgelost**: rand in `--muted`, vlak in `--surface`. |
| L3 | Placeholder onder de norm. | **Opgelost**: `--muted`. |
| L4 | Grijze knop zonder uitleg. | **Opgelost**: knop altijd aan; te kort geeft "Schrijf iets meer". |
| L5 | Een ongeldig adres gaf "probeer het later". | **Opgelost**: "Klopt je e-mailadres?". |
| L6 | Bedanktekst noemde "als het een vraag is" bij elke soort. | **Opgelost**. |
| L7 | Foutmelding viel weinig op. | **Opgelost**: in `--berry`, vet. |
| L8 | Enter in het rekenslot doet niets. | Open: buiten deze wijziging; volgende ronde. |

## Na de review: eigen pagina /contact/

Op verzoek van Kaj staat het formulier niet meer op het ouderscherm maar op een eigen
pagina **/contact/**, gelinkt onderaan beide startschermen naast "hoe Schaakmaatje werkt"
en "alle lessen" (groter en niet meer grijs), en vanaf /lessen/, /over/ (FAQ) en het
ouderscherm. Niet meer achter het rekenslot: bewust, het moet makkelijk te vinden zijn;
de tekst vraagt geen naam van het kind te noemen. CLAUDE.md en docs/08 zijn bijgewerkt.
Doorloopregel 13 loopt nu via de link op de startpagina naar /contact/. `npm run check`
en `npm run doorloop` (13/13) groen. Geen nieuwe review: dezelfde component, alleen
verplaatst; de layout is op 390 licht en donker bekeken.
