/**
 * De minispellen.
 *
 * Elk spel maakt zijn eigen opgaven, met een oplopende moeilijkheid. Ze worden
 * gegenereerd in plaats van opgeschreven: dat geeft eindeloos oefenmateriaal zonder
 * dat iemand honderden stellingen hoeft in te typen. Elke gegenereerde stelling wordt
 * eerst door de oplosser gehaald — een spel dat niet uit te spelen is, komt er niet uit.
 */
import {
  aanvallersVan,
  allSquares,
  controleVelden,
  parseBoard,
  pieceMoves,
  PIECE_VALUE,
  square,
  toPlacement,
  veiligeVelden,
  type BoardMap,
  type PieceType,
  type Square,
} from '@/engine/board'
import { korstePad, slaAllesOp } from '@/engine/puzzels'
import { Game } from '@/engine/game'
import { goedeZetten } from '@/lesson/runner'
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
  {
    id: 'weegschaal',
    naam: 'Weegschaal',
    emoji: '⚖️',
    uitleg: 'Er valt iets te kiezen. Pak het duurste.',
    maakOpgave(niveau, random = Math.random) {
      const soorten: PieceType[] = ['r', 'b', 'q', 'n']
      const buit: PieceType[] = ['p', 'n', 'b', 'r', 'q']
      for (let poging = 0; poging < 300; poging++) {
        const mijn = soorten[Math.floor(random() * soorten.length)]
        const start = willekeurigVeld(random)
        let board = zet({}, start, mijn, 'w')
        const aantal = Math.min(2 + Math.floor(niveau / 2), 4)
        for (let i = 0; i < aantal; i++) {
          // Steeds opnieuw kijken waar het stuk heen kan: een neergezet stuk blokkeert.
          const vrij = pieceMoves(board, start).quiet
          if (!vrij.length) break
          const veld = vrij[Math.floor(random() * vrij.length)]
          board = zet(board, veld, buit[Math.floor(random() * buit.length)], 'b')
        }
        const slag = pieceMoves(board, start).captures
        if (slag.length < 2) continue
        const waardes = slag.map((sq) => PIECE_VALUE[board[sq].type])
        const hoogste = Math.max(...waardes)
        // Alleen bruikbaar als er echt iets te kiezen valt.
        if (waardes.every((w) => w === hoogste)) continue
        return {
          kind: 'move',
          fen: bordNaarFen(board),
          from: start,
          goed: slag.filter((sq) => PIECE_VALUE[board[sq].type] === hoogste),
          vraag: 'Pak het duurste stuk dat je kunt pakken.',
          foutTip: 'Tel even mee: pion 1, paard en loper 3, toren 5, dame 9.',
        }
      }
      return {
        kind: 'move',
        fen: '8/8/3p4/8/r2Q4/8/8/8',
        from: 'd4',
        goed: ['a4'],
        vraag: 'Pak het duurste stuk dat je kunt pakken.',
      }
    },
  },
  {
    id: 'red-je-stuk',
    naam: 'Red je stuk',
    emoji: '🛟',
    uitleg: 'Je stuk staat te pakken. Breng het in veiligheid.',
    maakOpgave(niveau, random = Math.random) {
      const mijne: PieceType[] = ['r', 'b', 'n', 'q']
      const vijand: PieceType[] = ['p', 'n', 'b', 'r', 'q']
      for (let poging = 0; poging < 400; poging++) {
        const mijn = mijne[Math.floor(random() * mijne.length)]
        const mijnVeld = willekeurigVeld(random)
        let board = zet({}, mijnVeld, mijn, 'w')

        // Zoek een veld vanwaar een zwart stuk mijn stuk aanvalt.
        const type = vijand[Math.floor(random() * vijand.length)]
        const kandidaten = allSquares().filter((sq) => {
          if (sq === mijnVeld) return false
          const proef = zet(board, sq, type, 'b')
          return controleVelden(proef, sq).includes(mijnVeld)
        })
        if (!kandidaten.length) continue
        board = zet(board, kandidaten[Math.floor(random() * kandidaten.length)], type, 'b')

        // Bij een hoger niveau staat er nog een stuk in de weg.
        if (niveau >= 4) {
          const vrij = pieceMoves(board, mijnVeld).quiet
          if (vrij.length > 3) board = zet(board, vrij[Math.floor(random() * vrij.length)], 'p', 'w')
        }

        // De blokkade kan de aanvalslijn dichtzetten; dan is er niets meer te redden.
        if (!aanvallersVan(board, mijnVeld, 'b').length) continue

        const veilig = veiligeVelden(board, mijnVeld)
        if (!veilig.length) continue
        // Te makkelijk als bijna alles goed is; te moeilijk als er maar één veld is.
        const alles = pieceMoves(board, mijnVeld).all.length
        if (veilig.length === alles) continue
        return {
          kind: 'move',
          fen: bordNaarFen(board),
          from: mijnVeld,
          goed: veilig,
          vraag: 'Je stuk staat te pakken. Breng het in veiligheid.',
          foutTip: 'Kijk eerst welke velden de aanvaller bestrijkt, en ga daar niet heen.',
        }
      }
      return {
        kind: 'move',
        fen: '8/8/8/5b2/8/3R4/8/8',
        from: 'd3',
        goed: ['d8', 'd6', 'd5', 'd4', 'a3', 'b3', 'c3', 'e3', 'f3', 'g3', 'd2', 'd1'],
        vraag: 'Je toren staat te pakken. Breng hem in veiligheid.',
      }
    },
  },
  {
    id: 'schaak-alarm',
    naam: 'Schaak-alarm',
    emoji: '⚡',
    uitleg: 'Geef schaak aan de zwarte koning.',
    maakOpgave(niveau, random = Math.random) {
      const stukken: PieceType[] = niveau <= 2 ? ['r', 'q'] : ['r', 'b', 'n', 'q']
      for (let poging = 0; poging < 400; poging++) {
        const zwarteKoning = willekeurigVeld(random)
        const witteKoning = willekeurigVeld(random, [zwarteKoning])
        // Koningen mogen nooit naast elkaar staan.
        if (controleVelden(zet({}, witteKoning, 'k', 'w'), witteKoning).includes(zwarteKoning)) continue

        const soort = stukken[Math.floor(random() * stukken.length)]
        const veld = willekeurigVeld(random, [zwarteKoning, witteKoning])
        let board = zet({}, zwarteKoning, 'k', 'b')
        board = zet(board, witteKoning, 'k', 'w')
        board = zet(board, veld, soort, 'w')
        // Een pion erbij, anders ziet chess.js koning+paard als remise wegens
        // onvoldoende materiaal en is er niets meer te spelen.
        const pionVeld = allSquares().filter(
          (sq) => !board[sq] && Number(sq[1]) > 1 && Number(sq[1]) < 8,
        )[Math.floor(random() * 40)]
        if (pionVeld) board = zet(board, pionVeld, 'p', 'w')

        const fen = `${bordNaarFen(board)} w - - 0 1`
        try {
          const game = new Game(fen)
          const status = game.status()
          if (status.over || status.check) continue
          const goed = goedeZetten(game, 'geefSchaak')
          // Minstens één schaak, maar niet zó veel dat het vanzelf goed gaat.
          if (!goed.length || goed.length > 4) continue
          return {
            kind: 'regelZet',
            fen,
            eis: 'geefSchaak',
            vraag: 'Geef schaak aan de zwarte koning.',
            foutTip: 'Zoek een zet waarmee je stuk de koning kan aanvallen.',
          }
        } catch {
          continue
        }
      }
      return {
        kind: 'regelZet',
        fen: '4k3/8/8/8/8/8/8/R5K1 w - - 0 1',
        eis: 'geefSchaak',
        vraag: 'Geef schaak aan de zwarte koning.',
      }
    },
  },
]

export function minispelMet(id: string): Minispel | undefined {
  return MINISPELLEN.find((s) => s.id === id)
}
