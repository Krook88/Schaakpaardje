/**
 * Didactische zetgeneratie.
 *
 * Voor de lessen en minispellen werken we NIET met de volledige schaakregels: een
 * lespositie bestaat vaak uit één paard op een leeg bord, en dat is volgens de
 * officiele regels een ongeldige stelling (er is geen koning). Daarom heeft de app
 * twee motoren:
 *
 *   - dit bestand  -> meetkundige zetten van losse stukken, voor lessen en minispellen;
 *   - engine/game  -> chess.js met alle regels, voor echte partijen.
 *
 * Beide worden getest, en de lessen over schaak/mat/rokade (wereld 9 en verder)
 * gebruiken bewust de echte motor.
 */

export type Square = string
export type PieceType = 'k' | 'q' | 'r' | 'b' | 'n' | 'p'
export type Color = 'w' | 'b'
export type Piece = { type: PieceType; color: Color }
export type BoardMap = Record<Square, Piece>

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const
export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8] as const

export const PIECE_VALUE: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }

/** Nederlandse namen, voor de gesproken feedback. */
export const PIECE_NAME: Record<PieceType, string> = {
  k: 'koning',
  q: 'dame',
  r: 'toren',
  b: 'loper',
  n: 'paard',
  p: 'pion',
}

export function square(fileIndex: number, rank: number): Square {
  return `${FILES[fileIndex]}${rank}`
}
export function fileIndex(sq: Square): number {
  return FILES.indexOf(sq[0] as (typeof FILES)[number])
}
export function rankOf(sq: Square): number {
  return Number(sq[1])
}
export function onBoard(fileIndex: number, rank: number): boolean {
  return fileIndex >= 0 && fileIndex < 8 && rank >= 1 && rank <= 8
}
/** true = licht veld. a1 is donker, h1 is licht. */
export function isLightSquare(sq: Square): boolean {
  return (fileIndex(sq) + rankOf(sq)) % 2 === 0
}

export function allSquares(): Square[] {
  const out: Square[] = []
  for (let r = 8; r >= 1; r--) for (let f = 0; f < 8; f++) out.push(square(f, r))
  return out
}

/** Leest de stukken uit een FEN (volledig of alleen het eerste veld). */
export function parseBoard(fen: string): BoardMap {
  const placement = fen.trim().split(/\s+/)[0]
  const board: BoardMap = {}
  const rows = placement.split('/')
  if (rows.length !== 8) throw new Error(`Ongeldige FEN-stelling: ${fen}`)
  rows.forEach((row, i) => {
    const rank = 8 - i
    let file = 0
    for (const ch of row) {
      if (/[1-8]/.test(ch)) {
        file += Number(ch)
        continue
      }
      const lower = ch.toLowerCase() as PieceType
      if (!'kqrbnp'.includes(lower)) throw new Error(`Onbekend stuk '${ch}' in FEN: ${fen}`)
      if (file > 7) throw new Error(`Te veel stukken op rij ${rank} in FEN: ${fen}`)
      board[square(file, rank)] = { type: lower, color: ch === ch.toUpperCase() ? 'w' : 'b' }
      file++
    }
    if (file !== 8) throw new Error(`Rij ${rank} telt geen 8 velden in FEN: ${fen}`)
  })
  return board
}

/** Schrijft het stukkenveld van een FEN terug (zonder de velden erachter). */
export function toPlacement(board: BoardMap): string {
  const rows: string[] = []
  for (let r = 8; r >= 1; r--) {
    let row = ''
    let empty = 0
    for (let f = 0; f < 8; f++) {
      const piece = board[square(f, r)]
      if (!piece) {
        empty++
        continue
      }
      if (empty) {
        row += String(empty)
        empty = 0
      }
      row += piece.color === 'w' ? piece.type.toUpperCase() : piece.type
    }
    if (empty) row += String(empty)
    rows.push(row)
  }
  return rows.join('/')
}

const KNIGHT_STEPS = [
  [1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2],
] as const
const KING_STEPS = [
  [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1],
] as const
const ROOK_RAYS = [[0, 1], [1, 0], [0, -1], [-1, 0]] as const
const BISHOP_RAYS = [[1, 1], [1, -1], [-1, -1], [-1, 1]] as const

export type MoveSet = {
  /** Velden waar het stuk heen kan zonder te slaan. */
  quiet: Square[]
  /** Velden waar een vijandelijk stuk staat dat geslagen kan worden. */
  captures: Square[]
  /** Alles bij elkaar, in leesvolgorde. */
  all: Square[]
}

export type MoveOptions = {
  /** Pionnen mogen normaal 2 velden vooruit vanaf hun startrij. */
  allowPawnDouble?: boolean
  /** Negeer eigen stukken (voor de allereerste lessen op een leeg bord). */
  ignoreOwnPieces?: boolean
}

/**
 * Alle velden waar het stuk op `from` naartoe kan. Kent geen schaak, pen of rokade —
 * dat is precies de bedoeling: in wereld 1 tot en met 6 bestaat de koning nog niet
 * als beperking.
 */
export function pieceMoves(board: BoardMap, from: Square, opts: MoveOptions = {}): MoveSet {
  const piece = board[from]
  const quiet: Square[] = []
  const captures: Square[] = []
  if (!piece) return { quiet, captures, all: [] }

  const f = fileIndex(from)
  const r = rankOf(from)

  const consider = (tf: number, tr: number): 'empty' | 'capture' | 'blocked' | 'off' => {
    if (!onBoard(tf, tr)) return 'off'
    const target = board[square(tf, tr)]
    if (!target) return 'empty'
    if (target.color === piece.color) return opts.ignoreOwnPieces ? 'empty' : 'blocked'
    return 'capture'
  }
  const push = (tf: number, tr: number, kind: 'empty' | 'capture') => {
    ;(kind === 'empty' ? quiet : captures).push(square(tf, tr))
  }

  const walkRays = (rays: readonly (readonly [number, number])[] | readonly number[][]) => {
    for (const [df, dr] of rays as readonly number[][]) {
      let tf = f + df
      let tr = r + dr
      for (;;) {
        const kind = consider(tf, tr)
        if (kind === 'off' || kind === 'blocked') break
        push(tf, tr, kind)
        if (kind === 'capture') break
        tf += df
        tr += dr
      }
    }
  }

  switch (piece.type) {
    case 'n':
      for (const [df, dr] of KNIGHT_STEPS) {
        const kind = consider(f + df, r + dr)
        if (kind === 'empty' || kind === 'capture') push(f + df, r + dr, kind)
      }
      break
    case 'k':
      for (const [df, dr] of KING_STEPS) {
        const kind = consider(f + df, r + dr)
        if (kind === 'empty' || kind === 'capture') push(f + df, r + dr, kind)
      }
      break
    case 'r':
      walkRays(ROOK_RAYS)
      break
    case 'b':
      walkRays(BISHOP_RAYS)
      break
    case 'q':
      walkRays([...ROOK_RAYS, ...BISHOP_RAYS])
      break
    case 'p': {
      const dir = piece.color === 'w' ? 1 : -1
      const startRank = piece.color === 'w' ? 2 : 7
      if (onBoard(f, r + dir) && !board[square(f, r + dir)]) {
        push(f, r + dir, 'empty')
        const double = opts.allowPawnDouble !== false
        if (double && r === startRank && !board[square(f, r + 2 * dir)]) {
          push(f, r + 2 * dir, 'empty')
        }
      }
      for (const df of [-1, 1]) {
        const kind = consider(f + df, r + dir)
        if (kind === 'capture') push(f + df, r + dir, 'capture')
      }
      break
    }
  }

  const all = [...quiet, ...captures].sort(
    (a, b) => rankOf(b) - rankOf(a) || fileIndex(a) - fileIndex(b),
  )
  return { quiet, captures, all }
}

/** Alle zetten van één kleur, als {from, to} paren. */
export function allMoves(
  board: BoardMap,
  color: Color,
  opts: MoveOptions = {},
): { from: Square; to: Square; capture?: Piece }[] {
  const out: { from: Square; to: Square; capture?: Piece }[] = []
  for (const [from, piece] of Object.entries(board)) {
    if (piece.color !== color) continue
    const moves = pieceMoves(board, from, opts)
    for (const to of moves.quiet) out.push({ from, to })
    for (const to of moves.captures) out.push({ from, to, capture: board[to] })
  }
  return out
}

/** Voert een zet uit en geeft een nieuw bord terug (het oude blijft ongemoeid). */
export function applyMove(board: BoardMap, from: Square, to: Square): BoardMap {
  const next: BoardMap = { ...board }
  const piece = next[from]
  if (!piece) return next
  delete next[from]
  // Promotie: in de lessen altijd naar dame, dat is wat kinderen kiezen.
  const promotes = piece.type === 'p' && (rankOf(to) === 8 || rankOf(to) === 1)
  next[to] = promotes ? { type: 'q', color: piece.color } : piece
  return next
}

export function countMaterial(board: BoardMap, color: Color): number {
  return Object.values(board)
    .filter((p) => p.color === color)
    .reduce((sum, p) => sum + PIECE_VALUE[p.type], 0)
}

export function findPieces(board: BoardMap, type: PieceType, color?: Color): Square[] {
  return Object.entries(board)
    .filter(([, p]) => p.type === type && (!color || p.color === color))
    .map(([sq]) => sq)
}

/* ------------------------------------------------------------------------- *
 * Aanval en verdediging (wereld 8)
 *
 * "Waar kan een stuk heen" is iets anders dan "welke velden bestrijkt het".
 * Een toren die achter zijn eigen pion staat kán niet naar dat veld, maar hij
 * dekt het wel. En een pion bestrijkt juist de twee velden schuin voor zich,
 * ook als daar niets staat. Vandaar deze aparte berekening.
 * ------------------------------------------------------------------------- */

/** De velden die dit stuk bestrijkt: waar het zou kunnen slaan. */
export function controleVelden(board: BoardMap, from: Square): Square[] {
  const piece = board[from]
  if (!piece) return []
  const f = fileIndex(from)
  const r = rankOf(from)
  const uit: Square[] = []

  const stap = (df: number, dr: number) => {
    if (onBoard(f + df, r + dr)) uit.push(square(f + df, r + dr))
  }
  const straal = (rays: readonly (readonly number[])[]) => {
    for (const [df, dr] of rays) {
      let tf = f + df
      let tr = r + dr
      while (onBoard(tf, tr)) {
        uit.push(square(tf, tr))
        // Een stuk in de weg stopt de straal, maar het veld zelf wordt wél bestreken.
        if (board[square(tf, tr)]) break
        tf += df
        tr += dr
      }
    }
  }

  switch (piece.type) {
    case 'n':
      for (const [df, dr] of KNIGHT_STEPS) stap(df, dr)
      break
    case 'k':
      for (const [df, dr] of KING_STEPS) stap(df, dr)
      break
    case 'r':
      straal(ROOK_RAYS)
      break
    case 'b':
      straal(BISHOP_RAYS)
      break
    case 'q':
      straal([...ROOK_RAYS, ...BISHOP_RAYS])
      break
    case 'p': {
      const dir = piece.color === 'w' ? 1 : -1
      stap(-1, dir)
      stap(1, dir)
      break
    }
  }
  return uit
}

/** Alle velden die één kleur bestrijkt. */
export function aangevallenVelden(board: BoardMap, doorKleur: Color): Set<Square> {
  const uit = new Set<Square>()
  for (const [sq, p] of Object.entries(board)) {
    if (p.color !== doorKleur) continue
    for (const veld of controleVelden(board, sq)) uit.add(veld)
  }
  return uit
}

/** Staat dit veld onder vuur van de opgegeven kleur? */
export function wordtAangevallen(board: BoardMap, veld: Square, doorKleur: Color): boolean {
  return aangevallenVelden(board, doorKleur).has(veld)
}

/** Welke van mijn stukken staan te pakken? */
export function bedreigdeStukken(board: BoardMap, kleur: Color): Square[] {
  const vuur = aangevallenVelden(board, kleur === 'w' ? 'b' : 'w')
  return Object.entries(board)
    .filter(([sq, p]) => p.color === kleur && vuur.has(sq))
    .map(([sq]) => sq)
}

/**
 * Waar kan dit stuk heen zonder daar geslagen te worden?
 * De stelling wordt per zet echt uitgevoerd: door weg te lopen verandert het bord,
 * en een veld dat eerst veilig leek kan dat daarna niet meer zijn.
 */
export function veiligeVelden(board: BoardMap, from: Square): Square[] {
  const piece = board[from]
  if (!piece) return []
  const vijand = piece.color === 'w' ? 'b' : 'w'
  return pieceMoves(board, from).all.filter((naar) => {
    const na = applyMove(board, from, naar)
    return !aangevallenVelden(na, vijand).has(naar)
  })
}

/** Welke vijandelijke stukken vallen dit veld aan? */
export function aanvallersVan(board: BoardMap, veld: Square, doorKleur: Color): Square[] {
  return Object.entries(board)
    .filter(([sq, p]) => p.color === doorKleur && controleVelden(board, sq).includes(veld))
    .map(([sq]) => sq)
}
