# 5. Techniek: welke stack en modules passen hierbij?

## 5.1 De hoofdkeuze: web-first PWA, later verpakt als app
**Aanbeveling: Next.js (App Router) + TypeScript als installeerbare PWA, later met
Capacitor naar iOS/Android.**

Waarom:
- **Eén codebase** voor tablet, telefoon, schoolchromebook en desktop — scholen zijn een
  reële tweede markt en draaien op Chromebooks, waar native apps niet werken.
- **Contentiteratie is de kern van dit project** (honderden lessen, audio, animaties).
  Op het web deploy je een contentfix in minuten; in de stores duurt review dagen.
- **Offline werkt prima** met een service worker + gecachete audio; kinderen spelen in de
  auto en op scholen met matige wifi.
- **Capacitor** geeft later dezelfde app in de App Store/Play Store, inclusief in-app
  aankopen, zonder herbouw.

**Alternatief: Expo / React Native.** Kies dit alleen als store-aanwezigheid en native
gevoel op dag 1 harde eisen zijn. Nadeel: rijke geanimeerde content en audio-synchronisatie
kosten er meer werk, en je verliest de school/Chromebook-markt.
**Niet aanraden:** Unity/Godot (overkill, grote downloads, moeizame tekst/audio-pipeline)
en Flutter (kleiner schaak-ecosysteem in JS/TS).

## 5.2 Modulekeuze per laag

| Laag | Keuze | Waarom / alternatief |
|---|---|---|
| Framework | **Next.js 15 + React 19 + TypeScript** | Routing, SSG voor marketingpagina's, Vercel-deploy. Alt: Vite+React SPA (simpeler, maar minder out-of-the-box). |
| Styling | **Tailwind CSS v4** + eigen design tokens | Snel, consistent, klein. |
| Schaakregels | **chess.js** | De standaard: legale zetten, FEN, PGN, schaak/mat/pat-detectie. Battle-tested. |
| Bord-UI | **react-chessboard** | React-idiomatisch, drag & drop, custom stukken/velden, kleine bundel. Alt: **chessground** (lichess-kwaliteit, premoves/pijlen) via een wrapper — pak dit als we premoves en pijl-annotaties écht willen. |
| Engine | **stockfish.wasm** in een Web Worker (single-thread NNUE-lite build) | Sterk genoeg t/m niveau 8. Lage niveaus draaien op onze **eigen JS-bot** (random/greedy/1-ply) — sneller, menselijker, geen download. |
| Animatie mascotte | **Rive** | Interactieve state machine (Pip reageert live op de zet). Alt: Lottie (goedkoper, niet interactief). |
| UI-animatie | **Motion (Framer Motion)** | Zetanimaties, sterren, overgangen. |
| Audio | **Howler.js** + vooraf gerenderde MP3/OGG | Zie 5.3. |
| State | **Zustand** (app/profiel) + kleine eigen **lesson-runner state machine** | XState is optioneel als de lesflows echt complex worden. |
| Content | **TypeScript/JSON-bestanden met Zod-validatie** in `packages/content` | Type-safe, in git, review via PR, geen CMS nodig in fase 1. Fase 3 eventueel Sanity voor niet-technische auteurs. |
| Opslag fase 1 | **IndexedDB via Dexie** | Volledig lokaal: geen account, geen persoonsgegevens, AVG-vriendelijk, werkt offline. |
| Opslag fase 3 | **Supabase** (Postgres + Auth + RLS + Storage) | Multi-device sync, ouder/klasdashboard. Alt: Firebase — maar Supabase geeft EU-hosting, wat voor kinderdata doorslaggevend is. |
| Tests | **Vitest** + Testing Library, **Playwright** e2e, plus **content-validatietests** | Elke FEN legaal, elke oplossing correct, elke audiosleutel bestaat. |
| Monorepo | **pnpm workspaces + Turborepo** | apps/web, packages/{engine,content,ui,audio,analytics}. |
| CI/CD | **GitHub Actions** → **Vercel** (preview per PR) | Reviewer kan elke PR direct op de tablet proberen. |
| i18n | **next-intl** | NL is de bron; sleutelstructuur maakt EN/DE later mogelijk. |
| Analytics | **Plausible** (self-hosted of EU) of PostHog EU, cookieloos | Geen Google Analytics, geen advertentie-SDK's. |
| Foutmonitoring | **Sentry** met scrubbing van alle profieldata | |

## 5.3 De audiopijplijn (het hart van deze app)
**Besluit: vooraf gerenderde audio, geen live TTS in de app.**
Reden: geen latency, werkt offline, kost eenmalig geld i.p.v. per gebruiker, en je hoort
elke regel vóór hij live gaat — bij kinderaudio wil je niets aan het toeval overlaten.

Pijplijn:
1. Alle gesproken regels staan als **sleutel + NL-tekst** in `packages/content/voice/*.ts`
   (bijv. `w4.l1.intro`, `feedback.illegal.knight`, `praise.random.3`).
2. Een build-script rendert nieuwe/gewijzigde sleutels via een TTS-API en schrijft
   `public/audio/<sleutel>.mp3` + een **audio-sprite manifest** met duur en hash.
   Alleen gewijzigde regels worden opnieuw gerenderd (hash-cache in git).
3. Howler speelt af; de mascotte-animatie krijgt viseem-/amplitudecues uit het manifest.
4. **CI-test:** faalt als een sleutel in code bestaat zonder audiobestand, of andersom.

**Stemkeuze:** ElevenLabs (v3) geeft de meest expressieve Nederlandse stem en is voor dit
volume goedkoop genoeg (~1.000–2.000 regels); Azure Neural NL of Google Cloud TTS zijn
ca. €16 per miljoen tekens en dus nóg goedkoper, maar vlakker. Advies: **ElevenLabs voor
Pips stem, Azure voor systeem-/telregels.** Controleer de **commerciële licentie en het
recht op de stem** vóór productie; overweeg voor de eindversie een **echte Nederlandse
stemacteur** voor Pip (ca. €1.500–3.000 voor het hele script) — dat hoor je, en het is
juridisch het schoonst. De TTS-pijplijn blijft dan bestaan voor prototypes en updates.

**Web Speech API** alleen als dev-fallback: kwaliteit en beschikbaarheid van NL-stemmen
verschillen per apparaat, dus niet in productie.

## 5.4 Prestatie-eisen (Chromebook/oude iPad = de norm)
- First load ≤ 2 s op 4G, interactief ≤ 3 s.
- Bundle app-shell ≤ 250 kB gzip; Stockfish-WASM **lazy** pas bij botniveau ≥ 4.
- 60 fps zetanimaties; audio start ≤ 100 ms na een actie.
- Volledig speelbaar offline na eerste bezoek (service worker: lessen + audio van de
  huidige en volgende wereld voorgeladen).
