/**
 * De zoeker: een kleine schaakmotor voor de sterkere tegenstanders.
 *
 * Het plan (docs/05) noemde hiervoor Stockfish in een WebAssembly-worker. Voor de
 * niveaus die deze app nodig heeft — tot ongeveer clubniveau van een kind — is dat
 * kanonnen op muggen: het kost een megabyte download, een worker, en een laag die de
 * engine kunstmatig dommer moet maken. Een eigen negamax met alfa-bèta doet het werk
 * in een paar kilobyte, is exact te doseren op diepte, en we kunnen hem testen.
 *
 * Wil je later toch echt hoge speelsterkte (de Draak van niveau 8), dan komt Stockfish
 * erbij als extra strategie achter dezelfde `kies(game)`-interface.
 */
import { Game, materialBalance } from './game'
import { fileIndex, rankOf, type Color, type PieceType, type Square } from './board'

/**
 * Stukwaarden in centipionnen, plus een tabel die zegt waar een stuk graag staat.
 * Zonder zo'n tabel speelt een motor materieel perfect maar positioneel als een zombie:
 * paarden aan de rand, koning in het midden. De waarden zijn de gangbare, bescheiden
 * versie — genoeg om er menselijk uit te zien.
 */
const WAARDE: Record<PieceType, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 }

// Tabellen staan vanuit wit gezien, met rij 8 bovenaan.
const TABEL: Record<PieceType, number[]> = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
   -50,-40,-30,-30,-30,-30,-40,-50,
   -40,-20,  0,  0,  0,  0,-20,-40,
   -30,  0, 10, 15, 15, 10,  0,-30,
   -30,  5, 15, 20, 20, 15,  5,-30,
   -30,  0, 15, 20, 20, 15,  0,-30,
   -30,  5, 10, 15, 15, 10,  5,-30,
   -40,-20,  0,  5,  5,  0,-20,-40,
   -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
   -20,-10,-10,-10,-10,-10,-10,-20,
   -10,  0,  0,  0,  0,  0,  0,-10,
   -10,  0,  5, 10, 10,  5,  0,-10,
   -10,  5,  5, 10, 10,  5,  5,-10,
   -10,  0, 10, 10, 10, 10,  0,-10,
   -10, 10, 10, 10, 10, 10, 10,-10,
   -10,  5,  0,  0,  0,  0,  5,-10,
   -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0,
  ],
  q: [
   -20,-10,-10, -5, -5,-10,-10,-20,
   -10,  0,  0,  0,  0,  0,  0,-10,
   -10,  0,  5,  5,  5,  5,  0,-10,
    -5,  0,  5,  5,  5,  5,  0, -5,
     0,  0,  5,  5,  5,  5,  0, -5,
   -10,  5,  5,  5,  5,  5,  0,-10,
   -10,  0,  5,  0,  0,  0,  0,-10,
   -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
   -30,-40,-40,-50,-50,-40,-40,-30,
   -30,-40,-40,-50,-50,-40,-40,-30,
   -30,-40,-40,-50,-50,-40,-40,-30,
   -30,-40,-40,-50,-50,-40,-40,-30,
   -20,-30,-30,-40,-40,-30,-30,-20,
   -10,-20,-20,-20,-20,-20,-20,-10,
    20, 20,  0,  0,  0,  0, 20, 20,
    20, 30, 10,  0,  0, 10, 30, 20,
  ],
}

function tabelIndex(sq: Square, kleur: Color): number {
  const f = fileIndex(sq)
  const r = rankOf(sq)
  // Voor zwart spiegelen we de tabel: wat voor wit vooruit is, is voor zwart achteruit.
  const rij = kleur === 'w' ? 8 - r : r - 1
  return rij * 8 + f
}

/** Stelling waarderen in centipionnen, vanuit wit gezien. */
export function waardeer(fen: string): number {
  const [plaatsing] = fen.split(' ')
  let score = 0
  let file = 0
  let rank = 8
  for (const ch of plaatsing) {
    if (ch === '/') {
      rank--
      file = 0
      continue
    }
    if (/[1-8]/.test(ch)) {
      file += Number(ch)
      continue
    }
    const type = ch.toLowerCase() as PieceType
    const kleur: Color = ch === ch.toUpperCase() ? 'w' : 'b'
    const veld = `${'abcdefgh'[file]}${rank}`
    const bijdrage = WAARDE[type] + TABEL[type][tabelIndex(veld, kleur)]
    score += kleur === 'w' ? bijdrage : -bijdrage
    file++
  }
  return score
}

export type ZoekResultaat = {
  zet: { from: Square; to: Square } | null
  score: number
  knopen: number
}

const MAT = 100000

/**
 * Negamax met alfa-bèta.
 *
 * Er wordt op één bord gewerkt: zet doen, dieper zoeken, zet terugnemen. Het bord
 * kopiëren per zet was de eerste versie en die was ruim honderd keer trager — dat merk
 * je meteen op een tablet, want dan staat de app te wachten in plaats van het kind.
 *
 * Geen tijdslimiet maar een knopenbudget: dat maakt het gedrag op een oud toestel net
 * zo voorspelbaar als op een snelle laptop.
 */
export function zoek(game: Game, diepte: number, maxKnopen = 20000): ZoekResultaat {
  let knopen = 0
  const stand = game.clone()
  const teken = stand.turn === 'w' ? 1 : -1

  function negamax(over: number, alfa: number, beta: number, kleurTeken: number): number {
    knopen++

    // Volgorde is hier alles. Eerst kijken of we klaar zijn met zoeken, en pas daarna
    // zetten genereren: de meeste knopen zijn bladeren, en die hoeven geen zettenlijst.
    // Dat scheelde in de meting een factor vijf.
    if (over === 0 || knopen > maxKnopen) return kleurTeken * waardeer(stand.fen)

    // Eén zetgeneratie per knoop. De volledige status() opvragen kostte er vier
    // (mat, pat, remise, onvoldoende materiaal). Geen zetten meer betekent mat of pat,
    // en dat verschil zie je aan één ding: sta je schaak?
    const zetten = ordenZetten(stand)
    if (!zetten.length) {
      // Mat dichterbij is beter dan mat verderop, anders treuzelt de motor.
      return stand.inCheck ? -(MAT - (diepte - over)) : 0
    }

    let best = -Infinity
    for (const zet of zetten) {
      if (!stand.move(zet.from, zet.to)) continue
      const score = -negamax(over - 1, -beta, -alfa, -kleurTeken)
      stand.undo()
      if (score > best) best = score
      if (best > alfa) alfa = best
      if (alfa >= beta) break // deze tak hoeft niet verder
    }
    return best === -Infinity ? 0 : best
  }

  let besteZet: { from: Square; to: Square } | null = null
  let besteScore = -Infinity
  for (const zet of ordenZetten(stand)) {
    if (!stand.move(zet.from, zet.to)) continue
    const score = -negamax(diepte - 1, -Infinity, -besteScore, -teken)
    stand.undo()
    if (score > besteScore) {
      besteScore = score
      besteZet = { from: zet.from, to: zet.to }
    }
  }
  return { zet: besteZet, score: besteScore, knopen }
}

/** Slagzetten eerst, en dan de duurste buit: dat snoeit de boom het snelst. */
function ordenZetten(game: Game) {
  return [...game.legalMoves()].sort((a, b) => score(b) - score(a))

  function score(zet: { captured?: PieceType; promotion?: PieceType; isCheck: boolean }) {
    let n = 0
    if (zet.captured) n += 10 * WAARDE[zet.captured]
    if (zet.promotion) n += WAARDE[zet.promotion]
    if (zet.isCheck) n += 50
    return n
  }
}

/**
 * De zet die de motor kiest, met een instelbare slordigheid.
 *
 * Let op de diepte: drie is ongeveer het maximum dat op een tablet nog snel genoeg is
 * (bij ons rond de 800 ms; vier duurde acht seconden). Wil je echt sterker spelen, dan
 * moet de zoeker naar een web worker of moet Stockfish erbij — zie docs/05.
 * Slordigheid 0 = altijd de beste zet. 0,3 = in ongeveer drie op de tien gevallen de
 * op één na beste. Zo dose je speelsterkte zonder de motor onmenselijk te laten zetten:
 * hij speelt nog steeds redelijke zetten, alleen niet altijd de scherpste.
 */
export function kiesMetSlordigheid(
  game: Game,
  diepte: number,
  slordigheid: number,
  random: () => number = Math.random,
  maxKnopen = 20000,
): { from: Square; to: Square } | null {
  const zetten = game.legalMoves()
  if (!zetten.length) return null
  if (zetten.length === 1) return { from: zetten[0].from, to: zetten[0].to }

  if (slordigheid > 0 && random() < slordigheid) {
    // Kies uit de redelijke helft, niet uit alles: een willekeurige zet zou weer
    // onmenselijk zijn, en dat is precies wat we niet willen.
    const beoordeeld = zetten.map((zet) => {
      const na = game.clone()
      na.move(zet.from, zet.to)
      const teken = game.turn === 'w' ? 1 : -1
      return { zet, score: teken * waardeer(na.fen) }
    })
    beoordeeld.sort((a, b) => b.score - a.score)
    const helft = beoordeeld.slice(0, Math.max(2, Math.ceil(beoordeeld.length / 2)))
    const gekozen = helft[Math.floor(random() * helft.length)]
    return { from: gekozen.zet.from, to: gekozen.zet.to }
  }

  return zoek(game, diepte, maxKnopen).zet
}
