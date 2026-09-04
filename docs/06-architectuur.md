# 6. Architectuur en datamodel

## 6.1 Repostructuur (pnpm monorepo)
```
schaakpaardje/
├─ apps/
│  ├─ web/                 # Next.js PWA (het product)
│  └─ studio/              # interne contenttool: lessen previewen, FEN's bouwen
├─ packages/
│  ├─ engine/              # chess.js-wrapper, KidBot, Stockfish-worker, evaluatie
│  ├─ board/               # <Bord>-component (react-chessboard + kindthema)
│  ├─ content/             # werelden, lessen, opgaven, puzzels, voice-teksten (Zod)
│  ├─ lesson-runner/       # state machine: fasen, pogingen, hints, sterren
│  ├─ audio/               # Howler-laag, sprite-manifest, ducking, ondertiteling
│  ├─ ui/                  # design system: knoppen, sterren, dialogen, Pip-slots
│  ├─ progress/            # profielen, Dexie-opslag, thema-beheersing, spaced repetition
│  └─ analytics/           # cookieloze events, privacy-filter
├─ scripts/
│  ├─ tts-render.ts        # audio genereren voor gewijzigde sleutels
│  └─ validate-content.ts  # FEN's, oplossingen, audiosleutels, leeftijdslabels
└─ docs/                   # dit plan
```

## 6.2 Datamodel (kern)
```ts
type World = { id: string; title: string; minAge: 3|5|6|7|8|9; lessons: LessonId[] }

type Lesson = {
  id: string
  worldId: string
  goal: string                    // leerdoel in één zin (ouder/leerkracht)
  phases: {
    watch:   { voice: VoiceKey[]; animation: RiveKey; fen?: Fen }
    guided:  Exercise[]           // met glow/hint aan
    solo:    Exercise[]           // oplopend
    test:    Exercise[]           // sterrenscore
  }
  minigame?: MinigameId
  themes: ThemeId[]               // voor adaptiviteit
}

type Exercise =
  | { kind: 'tapSquares'; fen: Fen; correct: Square[]; prompt: VoiceKey }
  | { kind: 'makeMove';   fen: Fen; solution: San[]; allowAlt?: boolean }
  | { kind: 'reachGoal';  fen: Fen; target: Square; maxMoves?: number }
  | { kind: 'captureAll'; fen: Fen; everyMoveCaptures?: boolean }
  | { kind: 'mateIn';     fen: Fen; n: 1|2 }
  | { kind: 'survive';    fen: Fen; plies: number }
  | { kind: 'quiz';       options: VoiceKey[]; correct: number }

type Attempt = { exerciseId: string; ok: boolean; ms: number; hintsUsed: number; at: Date }
type Mastery = { themeId: ThemeId; score: number; lastSeen: Date; nextDue: Date }
type Profile = { id: string; name: string; age: number; mode: 'pip'|'ontdekker'|'schaker'
                 avatar: string; settings: Settings; unlocked: string[] }
```
Alle content is **data**, geen code — daardoor kan een nieuwe wereld erbij zonder de app
aan te raken, en kan `apps/studio` lessen renderen en valideren.

## 6.3 Engine-architectuur
```
UI (react)  ──►  useGame() (Zustand)  ──►  RulesEngine (chess.js)
                                  │
                                  └──►  KidBot ──► StrategyAdapter
                                                    ├─ RandomBot     (niv. 1)
                                                    ├─ GreedyBot     (niv. 2–3)
                                                    └─ StockfishWorker(niv. 4–9, WASM)
```
- Alle zetvalidatie gebeurt in `RulesEngine`; de UI kent geen schaakregels.
- `KidBot` past blunder-budget, genadeplafond en denkvertraging toe (bewust 400–900 ms,
  zodat het lijkt alsof de bot nadenkt — direct antwoorden voelt kil).
- De Stockfish-worker wordt lui geladen en na 60 s inactiviteit weer opgeruimd.

## 6.4 Lesson runner (state machine)
`idle → watch → guided → solo → test → reward → next`
met per opgave: `present → awaitInput → validate → (correctFeedback | wrongFeedback →
hint1 → hint2 → showSolution) → advance`.
Regels: nooit meer dan 2 fouten zonder hulp; na "toon oplossing" komt dezelfde opgave
later terug; audio wordt bij een nieuwe actie altijd netjes afgebroken (ducking).

## 6.5 Offline & sync
- Fase 1: alles lokaal (Dexie). Export/import van een profiel als JSON-bestand
  ("verhuizen naar een nieuwe tablet") — geen server nodig.
- Fase 3: optionele koppeling met een **ouderaccount** (alleen de ouder heeft een
  e-mailadres; het kind heeft een naam + avatar, geen persoonsgegevens). Sync via
  Supabase met row-level security per ouder.
