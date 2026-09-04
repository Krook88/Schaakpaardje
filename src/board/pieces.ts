import type { PieceType } from '@/engine/board'

/**
 * Voorlopig gebruiken we de Unicode-schaakstukken: ze zijn overal beschikbaar,
 * schalen mee en wegen niets. Bij de visuele oplevering komen hier de getekende
 * stukken van Pip en zijn vrienden voor in de plaats (twee thema's: dieren voor
 * 3 tot 7, klassiek Staunton vanaf 7 — kinderen moeten op tijd de echte vormen leren).
 */
export const GLYPH: Record<PieceType, string> = {
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
}
