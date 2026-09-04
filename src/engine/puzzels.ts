/**
 * Oplossers voor de opgavetypes. De app gebruikt ze voor twee dingen:
 * de hint van Pip ("kijk eens naar dit veld") en de contentcontrole in CI —
 * een opgave die niet oplosbaar is, komt niet in main.
 */
import {
  allSquares,
  applyMove,
  pieceMoves,
  toPlacement,
  type BoardMap,
  type Square,
} from './board'

/** Kortste route van `from` naar `doel`, of null als het niet kan. */
export function korstePad(
  board: BoardMap,
  from: Square,
  doel: Square,
  maxZetten = 8,
): Square[] | null {
  if (from === doel) return []
  type Knoop = { board: BoardMap; op: Square; pad: Square[] }
  const start: Knoop = { board, op: from, pad: [] }
  const gezien = new Set<string>([`${toPlacement(board)}|${from}`])
  let rand: Knoop[] = [start]

  for (let diepte = 0; diepte < maxZetten; diepte++) {
    const volgende: Knoop[] = []
    for (const knoop of rand) {
      for (const naar of pieceMoves(knoop.board, knoop.op).all) {
        const nieuwBord = applyMove(knoop.board, knoop.op, naar)
        const pad = [...knoop.pad, naar]
        if (naar === doel) return pad
        const sleutel = `${toPlacement(nieuwBord)}|${naar}`
        if (gezien.has(sleutel)) continue
        gezien.add(sleutel)
        volgende.push({ board: nieuwBord, op: naar, pad })
      }
    }
    rand = volgende
    if (!rand.length) break
  }
  return null
}

/**
 * Volgorde waarin alle vijandelijke stukken geslagen kunnen worden.
 * Met `elkeZetRaak` moet iedere zet een slagzet zijn (het spelletje "Hongerig paardje").
 */
export function slaAllesOp(
  board: BoardMap,
  from: Square,
  elkeZetRaak = false,
): Square[] | null {
  const eigenKleur = board[from]?.color
  if (!eigenKleur) return null
  const vijanden = () => (b: BoardMap) =>
    Object.entries(b).filter(([, p]) => p.color !== eigenKleur).length

  const telVijanden = vijanden()

  type Knoop = { board: BoardMap; op: Square; pad: Square[] }
  const gezien = new Set<string>()
  const stapel: Knoop[] = [{ board, op: from, pad: [] }]
  let stappen = 0

  while (stapel.length && stappen < 200000) {
    stappen++
    const knoop = stapel.pop()!
    if (telVijanden(knoop.board) === 0) return knoop.pad
    const sleutel = `${toPlacement(knoop.board)}|${knoop.op}`
    if (gezien.has(sleutel)) continue
    gezien.add(sleutel)

    const zetten = pieceMoves(knoop.board, knoop.op)
    const kandidaten = elkeZetRaak ? zetten.captures : zetten.all
    // Slagzetten eerst: dat vindt de oplossing meestal meteen.
    const geordend = [...kandidaten].sort((a, b) => {
      const aSlag = zetten.captures.includes(a) ? 1 : 0
      const bSlag = zetten.captures.includes(b) ? 1 : 0
      return aSlag - bSlag
    })
    for (const naar of geordend) {
      stapel.push({
        board: applyMove(knoop.board, knoop.op, naar),
        op: naar,
        pad: [...knoop.pad, naar],
      })
    }
  }
  return null
}

/** Handig voor de contentcontrole: bestaat dit veld? */
export function geldigVeld(sq: string): boolean {
  return allSquares().includes(sq)
}
