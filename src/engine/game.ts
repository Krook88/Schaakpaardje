/**
 * Echte partijen: hier gelden alle schaakregels. Draait op chess.js.
 * De rest van de app kent geen schaakregels en praat alleen met deze laag.
 */
import { Chess } from 'chess.js'
import type { Color, PieceType, Square } from './board'

export type GameMove = {
  from: Square
  to: Square
  san: string
  captured?: PieceType
  promotion?: PieceType
  isCapture: boolean
  isCheck: boolean
}

export type GameStatus =
  | { over: false; check: boolean; turn: Color }
  | { over: true; reason: 'mat' | 'pat' | 'remise'; winner?: Color }

export class Game {
  private chess: Chess

  constructor(fen?: string) {
    this.chess = fen ? new Chess(fen) : new Chess()
  }

  get fen(): string {
    return this.chess.fen()
  }
  get turn(): Color {
    return this.chess.turn()
  }
  get history(): string[] {
    return this.chess.history()
  }
  /** Staat de speler die aan zet is schaak? Goedkoper dan de volledige status(). */
  get inCheck(): boolean {
    return this.chess.inCheck()
  }

  /** Alle legale zetten, eventueel alleen die van één veld af. */
  legalMoves(from?: Square): GameMove[] {
    const raw = from
      ? this.chess.moves({ square: from as never, verbose: true })
      : this.chess.moves({ verbose: true })
    return raw.map((m) => ({
      from: m.from,
      to: m.to,
      san: m.san,
      captured: m.captured as PieceType | undefined,
      promotion: m.promotion as PieceType | undefined,
      isCapture: Boolean(m.captured),
      isCheck: m.san.includes('+') || m.san.includes('#'),
    }))
  }

  /** Velden waar het stuk op `from` legaal heen kan. */
  destinations(from: Square): Square[] {
    return this.legalMoves(from).map((m) => m.to)
  }

  move(from: Square, to: Square, promotion: PieceType = 'q'): GameMove | null {
    try {
      const m = this.chess.move({ from, to, promotion })
      if (!m) return null
      return {
        from: m.from,
        to: m.to,
        san: m.san,
        captured: m.captured as PieceType | undefined,
        promotion: m.promotion as PieceType | undefined,
        isCapture: Boolean(m.captured),
        isCheck: this.chess.inCheck(),
      }
    } catch {
      return null
    }
  }

  undo(): void {
    this.chess.undo()
  }

  status(): GameStatus {
    if (this.chess.isCheckmate()) {
      // Wie aan zet is, staat mat; de ander wint.
      return { over: true, reason: 'mat', winner: this.chess.turn() === 'w' ? 'b' : 'w' }
    }
    if (this.chess.isStalemate()) return { over: true, reason: 'pat' }
    if (this.chess.isDraw() || this.chess.isInsufficientMaterial()) {
      return { over: true, reason: 'remise' }
    }
    return { over: false, check: this.chess.inCheck(), turn: this.chess.turn() }
  }

  clone(): Game {
    return new Game(this.fen)
  }
}

/** Materiaalbalans vanuit wit gezien, in pionnen. */
export function materialBalance(fen: string): number {
  const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
  let score = 0
  for (const ch of fen.split(' ')[0]) {
    const lower = ch.toLowerCase()
    if (!(lower in values)) continue
    score += ch === ch.toUpperCase() ? values[lower] : -values[lower]
  }
  return score
}
