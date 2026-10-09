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
  /** Welk stuk er loopt. */
  stuk: PieceType
  captured?: PieceType
  promotion?: PieceType
  isCapture: boolean
  isCheck: boolean
  /** En passant: schuin slaan op een leeg veld. De enige zet die dat kan. */
  isEnPassant: boolean
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
      stuk: m.piece as PieceType,
      captured: m.captured as PieceType | undefined,
      promotion: m.promotion as PieceType | undefined,
      isCapture: Boolean(m.captured),
      isCheck: m.san.includes('+') || m.san.includes('#'),
      isEnPassant: m.flags.includes('e'),
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
        stuk: m.piece as PieceType,
        captured: m.captured as PieceType | undefined,
        promotion: m.promotion as PieceType | undefined,
        isCapture: Boolean(m.captured),
        isCheck: this.chess.inCheck(),
        isEnPassant: m.flags.includes('e'),
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

  /**
   * Waar de stukken staan die de koning van wie aan zet is schaak geven. Leeg als hij
   * niet schaak staat. Nodig om "de aanvaller slaan" te onderscheiden van een ander
   * stuk slaan terwijl je koning wegloopt.
   */
  schaakgevers(): Square[] {
    const kleur = this.chess.turn()
    const koning = this.chess.findPiece({ type: 'k', color: kleur })[0]
    if (!koning) return []
    return this.chess.attackers(koning, kleur === 'w' ? 'b' : 'w') as Square[]
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

/**
 * Hoeveel kost deze zet netto, als de tegenstander het beste slaat en wij daarna het
 * beste terugslaan? Gerekend vanuit wie er zet, in pionnen.
 *
 * Alleen kijken naar wat de ander kan pakken is niet genoeg: dan gaat een waarschuwing
 * ook af bij een eerlijke ruil (paard voor paard), en leert een kind dat ruilen eng is.
 * Daarom telt de herovering mee, precies zoals wereld 7 het uitlegt.
 *
 * Vanuit wie er zet, want `materialBalance` kijkt altijd vanuit wit. Daardoor stond de
 * blunderwaarschuwing bij samen spelen voor zwart verkeerd om: een weggegeven dame
 * telde als winst (zesde review, I5). Hij woonde in het partijscherm, waar geen test
 * bij kon; hier wel.
 */
export function blunderVerlies(game: Game, van: string, naar: string): number {
  const kant = game.turn === 'w' ? 1 : -1
  const balans = (f: string) => kant * materialBalance(f)
  const proef = game.clone()
  if (!proef.move(van as never, naar as never)) return 0
  const balansNa = balans(proef.fen)
  let ergste = 0
  for (const reactie of proef.legalMoves()) {
    if (!reactie.isCapture) continue
    const na = proef.clone()
    na.move(reactie.from, reactie.to)
    let besteHerovering = balans(na.fen)
    for (const terug of na.legalMoves()) {
      if (!terug.isCapture) continue
      const daarna = na.clone()
      daarna.move(terug.from, terug.to)
      besteHerovering = Math.max(besteHerovering, balans(daarna.fen))
    }
    const verlies = balansNa - besteHerovering
    if (verlies > ergste) ergste = verlies
  }
  return ergste
}

/** Is dit een pionzet naar de overkant, waarbij gekozen moet worden waarin hij verandert? */
export function isPromotie(game: Game, van: string, naar: string): boolean {
  return game.legalMoves(van as never).some((z) => z.to === naar && Boolean(z.promotion))
}
