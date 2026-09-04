import type { Square } from '@/engine/board'

export type Fen = string

/**
 * Een opgave. Alle varianten zijn zo gekozen dat een kind ze met één handeling kan
 * oplossen: tikken op velden, of een stuk verplaatsen. De juiste antwoorden worden waar
 * mogelijk door de engine berekend in plaats van in de content opgeschreven — dat kan
 * niet fout gaan bij het overtypen.
 */
export type Exercise =
  /** Tik alle velden aan waar dit stuk heen kan. */
  | { kind: 'tapMoves'; fen: Fen; from: Square; vraag: string; negeerEigen?: boolean }
  /** Tik de genoemde velden aan (bordkennis, kleuren, rijen, lijnen). */
  | { kind: 'tapSquares'; fen: Fen; correct: Square[]; vraag: string; foutTip?: string }
  /** Verplaats een stuk naar een van de goede velden. */
  | { kind: 'move'; fen: Fen; from?: Square; goed: Square[]; vraag: string; foutTip?: string }
  /** Loop met een stuk naar een doelveld, eventueel in een maximaal aantal zetten. */
  | { kind: 'reach'; fen: Fen; from: Square; doel: Square; maxZetten?: number; vraag: string }
  /** Sla alle vijandelijke stukken; eventueel moet elke zet raak zijn. */
  | { kind: 'captureAll'; fen: Fen; from: Square; elkeZetRaak?: boolean; vraag: string }
  /** Meerkeuze met grote knoppen, voor begrip in plaats van uitvoering. */
  | {
      kind: 'quiz'
      vraag: string
      opties: { label: string; emoji?: string; goed?: boolean }[]
      foutTip?: string
    }

export type Fase = 'kijken' | 'meedoen' | 'zelf' | 'toets'

export type Lesson = {
  id: string
  wereldId: string
  titel: string
  /** Eén zin voor het ouderscherm: wat kan mijn kind hierna? */
  doel: string
  /** Wat Pip vertelt in de kijkfase. */
  vertel: string[]
  /** Stelling die tijdens het vertellen op het bord staat. */
  vertelFen?: Fen
  /** Velden die tijdens het vertellen oplichten. */
  vertelWijs?: Square[]
  meedoen: Exercise[]
  zelf: Exercise[]
  toets: Exercise[]
  themas: string[]
}

export type World = {
  id: string
  nummer: number
  naam: string
  emoji: string
  /** Ondertitel op de kaart, wordt ingesproken. */
  belofte: string
  minLeeftijd: 3 | 5 | 6 | 7 | 8 | 9
  lessen: Lesson[]
  /** Minispel dat bij deze wereld hoort. */
  minispel?: string
  /** Diploma dat je haalt door deze wereld af te maken. */
  diploma?: 'brons' | 'zilver' | 'goud'
}

export const LEEG = '8/8/8/8/8/8/8/8'
export const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'

/** Alle opgaven van een les, in speelvolgorde. */
export function alleOpgaven(les: Lesson): Exercise[] {
  return [...les.meedoen, ...les.zelf, ...les.toets]
}
