# 8. Privacy, veiligheid en juridisch

Kinder-apps worden strenger beoordeeld dan welke andere categorie ook. Dit is geen
bijzaak maar een ontwerpuitgangspunt.

## 8.1 Uitgangspunten
- **Geen persoonsgegevens van het kind.** Alleen een voornaam of bijnaam en een
  leeftijdsgroep, lokaal opgeslagen. Geen e-mail, geboortedatum, foto of locatie.
- **Lokaal tenzij.** Fase 1 draait 100% op het apparaat. Cloudsync is fase 3, optioneel,
  op initiatief van de ouder, met EU-hosting (Supabase EU / eigen VPS).
- **Geen advertenties, geen third-party trackers, geen SDK's van sociale media.**
- **Geen chat, geen open multiplayer.** Alleen bots en samen-op-één-tablet. Dit sluit
  de grootste veiligheidsrisico's structureel uit.
- **Cookieloze, geaggregeerde analytics** (Plausible/PostHog EU), zonder id per kind.

## 8.2 Regelgeving om aan te voldoen
- **AVG/GDPR** + het Nederlandse **Code voor Kinderrechten** en de Britse **Age
  Appropriate Design Code** (leidend, ook buiten VK).
- **COPPA** zodra de app in de VS beschikbaar is (< 13 jaar: ouderlijke toestemming).
- **Apple App Store Kids Category** en **Google Play Families**: verplichte ouderpoort,
  geen gedragsadvertenties, privacyverklaring in kindertaal + volwassen versie.
- **DSA/EAA**: vanaf juni 2025 gelden Europese toegankelijkheidseisen voor
  consumentendiensten — zie hoofdstuk 7.

## 8.3 Auteursrecht en content
- Alle lesteksten, opgaven, posities en illustraties **zelf maken**. Geen materiaal uit
  de Stappenmethode-werkboeken overnemen.
- Naam en merk: de app heet **Schaakpaardje** en refereert aan "de Nederlandse
  stappen-didactiek", niet aan het merk Stappenmethode.
- Puzzels uit de **Lichess-puzzeldatabase (CC0)** mogen vrij gebruikt worden — controleer
  de licentie bij download en vermeld de bron netjes.
- **Stockfish is GPLv3.** Dat betekent: als we de engine meeleveren, moeten we de
  Stockfish-broncode + licentie beschikbaar stellen en mag onze eigen code niet met de
  engine tot één werk versmelten. **Oplossing:** Stockfish draait als losstaande
  WASM-worker (aparte bundel, aparte licentievermelding, downloadlink naar de bron).
  Dit is de gangbare praktijk, maar laat het vóór commerciële release juridisch toetsen.
- Stemlicentie: bij TTS de commerciële voorwaarden vastleggen; bij een stemacteur een
  buy-out voor app + marketing.

## 8.4 Verdienmodel (privacyvriendelijke opties)
1. **Gratis werelden 0–4**, eenmalige aankoop (~€19,99) of abonnement (~€4,99/mnd)
   voor de rest. Eenmalig verkoopt bij ouders beter dan een abonnement.
2. **Gezinslicentie** (tot 4 profielen) en **schoollicentie** per klas (€/leerling/jaar).
3. Nooit: advertenties, in-game valuta, of "koop een hint".
