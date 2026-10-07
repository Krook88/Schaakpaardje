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
  type PieceType,
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
 * De kortste volgorde waarin alle vijandelijke stukken geslagen kunnen worden.
 * Met `elkeZetRaak` moet iedere zet een slagzet zijn (het spelletje "Hongerig paardje").
 *
 * Kortste, en dat is geen netheid. De hint van Pip vraagt dit na elke zet opnieuw en
 * wijst dan de eerste stap aan. Zocht hij diepte-eerst, zoals hier eerst stond, dan
 * kreeg hij wel een oplossing maar een willekeurige, en na de volgende zet weer een
 * andere. In `toren-3` stuurde hij de toren zo eindeloos tussen g1 en h1 heen en weer:
 * een kind dat op "Help me even" bleef drukken, kwam er nooit uit. Een kortste route
 * wordt na elke stap op die route één korter, dus wie Pip volgt is altijd klaar.
 */
export function slaAllesOp(
  board: BoardMap,
  from: Square,
  elkeZetRaak = false,
): Square[] | null {
  const stuk = board[from]
  if (!stuk) return null
  const vijanden = Object.keys(board).filter((sq) => board[sq].color !== stuk.color)
  if (!vijanden.length) return []

  // Er beweegt maar één stuk, en vijanden verdwijnen alleen. De hele toestand is dus:
  // waar staat mijn stuk, wat is het (een pion kan dame worden), en wie staat er nog.
  // Dat laatste als bitmasker. Eerst kopieerde elke stap het hele bord en maakte er
  // een tekst van; breedte-eerst was zo 240 keer trager dan diepte-eerst, en dat
  // merk je op een goedkope tablet bij elk tipje.
  const vast: BoardMap = {}
  for (const [sq, p] of Object.entries(board)) if (sq !== from && p.color === stuk.color) vast[sq] = p
  const bordVoor = (op: Square, soort: PieceType, over: number): BoardMap => {
    const b: BoardMap = { ...vast }
    vijanden.forEach((sq, i) => {
      if (over & (1 << i)) b[sq] = board[sq]
    })
    b[op] = { type: soort, color: stuk.color }
    return b
  }

  type Knoop = { op: Square; soort: PieceType; over: number; pad: Square[] }
  const alle = (1 << vijanden.length) - 1
  const gezien = new Set<string>([`${from}${stuk.type}${alle}`])
  let rand: Knoop[] = [{ op: from, soort: stuk.type, over: alle, pad: [] }]
  let stappen = 0

  while (rand.length && stappen < 200000) {
    const volgende: Knoop[] = []
    for (const k of rand) {
      stappen++
      const zetten = pieceMoves(bordVoor(k.op, k.soort, k.over), k.op)
      for (const naar of elkeZetRaak ? zetten.captures : zetten.all) {
        const i = vijanden.indexOf(naar)
        const over = i >= 0 ? k.over & ~(1 << i) : k.over
        const pad = [...k.pad, naar]
        if (over === 0) return pad
        // Zelfde regel als applyMove: een pion op de eindrij wordt dame.
        const eindrij = naar[1] === '8' || naar[1] === '1'
        const soort: PieceType = k.soort === 'p' && eindrij ? 'q' : k.soort
        const sleutel = `${naar}${soort}${over}`
        if (gezien.has(sleutel)) continue
        gezien.add(sleutel)
        volgende.push({ op: naar, soort, over, pad })
      }
    }
    rand = volgende
  }
  return null
}

/** Handig voor de contentcontrole: bestaat dit veld? */
export function geldigVeld(sq: string): boolean {
  return allSquares().includes(sq)
}
