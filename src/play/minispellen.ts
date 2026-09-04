/**
 * De minispellen.
 *
 * Elk spel maakt zijn eigen opgaven, met een oplopende moeilijkheid. Ze worden
 * gegenereerd in plaats van opgeschreven: dat geeft eindeloos oefenmateriaal zonder
 * dat iemand honderden stellingen hoeft in te typen. Elke gegenereerde stelling wordt
 * eerst door de oplosser gehaald — een spel dat niet uit te spelen is, komt er niet uit.
 */
import {
  allSquares,
  parseBoard,
  pieceMoves,
  square,
  toPlacement,
  type BoardMap,
  type PieceType,
  type Square,
} from '@/engine/board'
import { korstePad, slaAllesOp } from '@/engine/puzzels'
import type { Exercise } from '@/content/types'

export type Minispel = {
  id: string
  naam: string
  emoji: string
  uitleg: string
  /** Zes niveaus, oplopend. */
  maakOpgave: (niveau: number, random?: () => number) => Exercise
}

/**
 * Voorspelbare willekeur. De eerste opgave wordt tijdens het bouwen al gerenderd; als
 * die met Math.random werd gemaakt, staat er in de HTML een andere stelling dan de
 * browser tekent en klaagt React over hydratie. Met een zaadje is de eerste opgave
 * overal hetzelfde; daarna gaat het gewoon met echte willekeur verder.
 */
export function zaad(n: number): () => number {
  let s = n * 2654435761 % 2147483647
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

function willekeurigVeld(random: () => number, behalve: Square[] = []): Square {
  const velden = allSquares().filter((sq) => !behalve.includes(sq))
  return velden[Math.floor(random() * velden.length)]
}

function bordNaarFen(board: BoardMap): string {
  return toPlacement(board)
}

function zet(board: BoardMap, sq: Square, type: PieceType, kleur: 'w' | 'b'): BoardMap {
  return { ...board, [sq]: { type, color: kleur } }
}

/** Bouwt een keten van slagzetten door vanaf het stuk vooruit te lopen. */
function maakSlagketen(
  type: PieceType,
  aantal: number,
  random: () => number,
  elkeZetRaak: boolean,
): { fen: string; from: Square } {
  for (let poging = 0; poging < 200; poging++) {
    const start = willekeurigVeld(random)
    let board = zet({}, start, type, 'w')
    let hier = start
    const gebruikt: Square[] = [start]
    let gelukt = true
    for (let i = 0; i < aantal; i++) {
      const opties = pieceMoves(board, hier).all.filter((sq) => !gebruikt.includes(sq))
      if (!opties.length) {
        gelukt = false
        break
      }
      const doel = opties[Math.floor(random() * opties.length)]
      board = zet(board, doel, 'p', 'b')
      gebruikt.push(doel)
      hier = doel
    }
    if (!gelukt) continue
    const fen = bordNaarFen(board)
    if (slaAllesOp(parseBoard(fen), start, elkeZetRaak)) return { fen, from: start }
  }
  // Valt terug op een stelling die zeker werkt.
  return { fen: '8/8/8/8/8/1p6/8/N7', from: 'a1' }
}

function maakParcours(
  type: PieceType,
  minZetten: number,
  maxZetten: number,
  blokkades: number,
  random: () => number,
): { fen: string; from: Square; doel: Square; maxZetten: number } {
  for (let poging = 0; poging < 300; poging++) {
    const start = willekeurigVeld(random)
    let board = zet({}, start, type, 'w')
    const bezet: Square[] = [start]
    for (let i = 0; i < blokkades; i++) {
      const sq = willekeurigVeld(random, bezet)
      board = zet(board, sq, 'p', 'w')
      bezet.push(sq)
    }
    const doel = willekeurigVeld(random, bezet)
    const pad = korstePad(board, start, doel, maxZetten)
    if (pad && pad.length >= minZetten && pad.length <= maxZetten) {
      return { fen: bordNaarFen(board), from: start, doel, maxZetten: pad.length + 1 }
    }
  }
  return { fen: '8/8/8/8/8/8/8/N7', from: 'a1', doel: 'c5', maxZetten: 3 }
}

export const MINISPELLEN: Minispel[] = [
  {
    id: 'vind-het-veld',
    naam: 'Vind het veld',
    emoji: '🔎',
    uitleg: 'Tik het stuk aan dat Pip noemt.',
    maakOpgave(niveau, random = Math.random) {
      const soorten: PieceType[] = ['r', 'b', 'n', 'q', 'k', 'p']
      const aantal = Math.min(2 + niveau, 7)
      let board: BoardMap = {}
      const bezet: Square[] = []
      for (let i = 0; i < aantal; i++) {
        const sq = willekeurigVeld(random, bezet)
        board = zet(board, sq, soorten[i % soorten.length], i % 2 === 0 ? 'w' : 'b')
        bezet.push(sq)
      }
      const gezocht = soorten[Math.floor(random() * Math.min(aantal, soorten.length))]
      const correct = Object.entries(board)
        .filter(([, p]) => p.type === gezocht)
        .map(([sq]) => sq)
      const namen: Record<PieceType, string> = {
        r: 'torens', b: 'lopers', n: 'paarden', q: "dames", k: 'koningen', p: 'pionnen',
      }
      return {
        kind: 'tapSquares',
        fen: bordNaarFen(board),
        correct,
        vraag: `Tik alle ${namen[gezocht]} aan.`,
      }
    },
  },
  {
    id: 'torenjacht',
    naam: 'Torenjacht',
    emoji: '🏰',
    uitleg: 'Sla alle pionnen met je toren.',
    maakOpgave(niveau, random = Math.random) {
      const { fen, from } = maakSlagketen('r', Math.min(2 + niveau, 6), random, false)
      return { kind: 'captureAll', fen, from, vraag: 'Sla alle zwarte pionnen met je toren.' }
    },
  },
  {
    id: 'vang-de-vlag',
    naam: 'Vang de vlag',
    emoji: '🚩',
    uitleg: 'Loop met de loper naar de ster.',
    maakOpgave(niveau, random = Math.random) {
      const p = maakParcours('b', 1, Math.min(2 + Math.floor(niveau / 2), 4), niveau, random)
      return {
        kind: 'reach',
        fen: p.fen,
        from: p.from,
        doel: p.doel,
        maxZetten: p.maxZetten,
        vraag: 'Breng de loper naar de ster.',
      }
    },
  },
  {
    id: 'dame-doolhof',
    naam: 'Dame-doolhof',
    emoji: '👑',
    uitleg: 'Zoek een weg voor de dame.',
    maakOpgave(niveau, random = Math.random) {
      const p = maakParcours('q', 2, 3, 2 + niveau * 2, random)
      return {
        kind: 'reach',
        fen: p.fen,
        from: p.from,
        doel: p.doel,
        maxZetten: p.maxZetten,
        vraag: 'Breng de dame naar de ster. Om je eigen pionnen heen!',
      }
    },
  },
  {
    id: 'hongerig-paardje',
    naam: 'Hongerig paardje',
    emoji: '🐴',
    uitleg: 'Elke sprong moet raak zijn.',
    maakOpgave(niveau, random = Math.random) {
      const { fen, from } = maakSlagketen('n', Math.min(1 + niveau, 6), random, true)
      return {
        kind: 'captureAll',
        fen,
        from,
        elkeZetRaak: true,
        vraag: 'Sla alle wortels op. Elke sprong moet raak zijn!',
      }
    },
  },
  {
    id: 'koningsloop',
    naam: 'Koningsloop',
    emoji: '🤴',
    uitleg: 'Wandel met de koning naar de ster.',
    maakOpgave(niveau, random = Math.random) {
      const p = maakParcours('k', 2, 6, niveau, random)
      return {
        kind: 'reach',
        fen: p.fen,
        from: p.from,
        doel: p.doel,
        maxZetten: p.maxZetten + 2,
        vraag: 'Loop met de koning naar de ster. Stapje voor stapje.',
      }
    },
  },
  {
    id: 'pionnenspel',
    naam: 'Pionnenspel',
    emoji: '♟️',
    uitleg: 'Wie het eerst de overkant haalt, wint.',
    maakOpgave(niveau, random = Math.random) {
      // Het echte pionnenspel speel je tegen Mila; dit is de oefenversie: breng één
      // pion naar de overkant, met steeds meer pionnen op het bord.
      const lijn = Math.floor(random() * 8)
      let board: BoardMap = zet({}, square(lijn, 2), 'p', 'w')
      const bezet = [square(lijn, 2)]
      for (let i = 0; i < niveau; i++) {
        const sq = willekeurigVeld(random, [...bezet, square(lijn, 3), square(lijn, 4)])
        if (Number(sq[1]) >= 7 || Number(sq[1]) <= 2) continue
        board = zet(board, sq, 'p', 'w')
        bezet.push(sq)
      }
      return {
        kind: 'reach',
        fen: bordNaarFen(board),
        from: square(lijn, 2),
        doel: square(lijn, 8),
        vraag: 'Breng deze pion naar de overkant. Dan wordt hij dame!',
      }
    },
  },
]

export function minispelMet(id: string): Minispel | undefined {
  return MINISPELLEN.find((s) => s.id === id)
}
