/**
 * Pip kijkt terug: één moment uit een partij, om van te leren.
 *
 * Een kind dat net een partij heeft gespeeld, heeft niets aan een foutenlijst. Een
 * trainer op de club wijst één ding aan: "kijk, hier kon je toren dat paard pakken".
 * Dat doet deze module, en niets meer.
 *
 * Twee soorten moment, in deze volgorde:
 *   - gemist: het kind kon met een slag een stuk winnen, en deed iets anders;
 *   - mooi:   het kind won zelf een stuk met een slag.
 *
 * Bewust níét: "hier kon je mat zetten". Mat komt pas in wereld 10 (CLAUDE.md). Een
 * gemiste slag is wereld 7 en 8 (wat is een stuk waard, staat het te pakken).
 *
 * Wat Pip zegt, moet kloppen. Een fout hier leert een kind iets verkeerds aan, en de
 * eerste versie deed dat ook (achtenzestigste review, schaakmeester): hij keek twee
 * halve zetten vooruit, prees een slag die tot mat leidde ("Knap!") en noemde een goede
 * verdedigende zet een gemiste kans. Daarom nu:
 *   - "mooi" wordt getoetst aan de echte partij: had het kind de winst drie halve zetten
 *     later nog, en ging het niet mat? En de zoeker hieronder moet het ermee eens zijn.
 *   - "gemist" moet bij de zoeker hieronder minstens twee pionnen beter zijn dan wat het
 *     kind speelde én dan de stand vóór de zet. Een minder slechte slag is geen kans.
 *   - De zoeker hier is niet die van de bots: hij telt alleen materiaal, herkent mat op
 *     elke diepte, en rekent na de laatste zet alle slagen door. Raakt zijn budget op,
 *     dan zegt Pip niets. Liever stil dan fout.
 */
import { Chess } from 'chess.js'
import { Game, materialBalance } from './game'
import type { Color, PieceType, Square } from './board'

const PIONNEN: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }

export type Moment = {
  soort: 'gemist' | 'mooi'
  /** De stelling vóór de zet, met het kind aan zet. */
  fen: string
  /** De slag die kon (gemist) of die het kind deed (mooi). */
  van: Square
  naar: Square
  stuk: PieceType
  buit: PieceType
  /** Kon de ander op dat veld niets terugslaan? */
  gratis: boolean
  /** Een mooie slag die ook een promotie was: waarin de pion veranderde. */
  promotie?: PieceType
  /** Wat het kind in plaats daarvan speelde, bij een gemist moment. */
  gespeeld?: { van: Square; naar: Square; promotie?: PieceType }
}

type Zet = { voor: string; na: string; from: Square; to: Square; color: Color; promotion?: PieceType }

/* ---------------------------------------------------------------- de zoeker */

const MAT = 100000
const DIEPTE = 3
const BUDGET = 10000
class Op extends Error {}
const CENTI: Record<string, number> = { p: 100, n: 300, b: 300, r: 500, q: 900, k: 0 }

/**
 * De zetgenerator van chess.js zonder notatie. `moves({ verbose: true })` schrijft voor
 * elke zet de notatie uit, inclusief "staat hij schaak?", en kostte 1,5 ms per stelling;
 * deze interne kost 44 µs. Met de openbare versie duurde één controle drie seconden.
 * Het is geen openbare API: tests/nabespreking.test.ts ("de snelle zetgenerator")
 * valt om als een nieuwe versie van chess.js hem verandert.
 */
type InterneZet = { from: number; to: number; captured?: string; promotion?: string }
type Intern = {
  _moves(o: { legal: boolean }): InterneZet[]
  _makeMove(z: InterneZet): void
  _undoMove(): void
  inCheck(): boolean
  turn(): 'w' | 'b'
}

/**
 * Hoeveel materiaal houdt wie er aan zet is over, bij het beste spel van beide kanten?
 * Mat telt overal, ook op de laatste diepte; daarna alleen nog slagen (rustzoeken), zodat
 * een vork of een terugslag niet net buiten beeld valt. Null als het budget op is.
 */
export function veiligeWaarde(fen: string, diepte = DIEPTE): number | null {
  const bord = new Chess(fen) as unknown as Intern
  let knopen = BUDGET
  // Materiaal vanuit wie er aan zet is, bijgehouden per zet in plaats van per stelling geteld.
  const begin = (bord.turn() === 'w' ? 1 : -1) * materialBalance(fen) * 100

  function negamax(over: number, ply: number, alfa: number, beta: number, staan: number): number {
    if (--knopen < 0) throw new Op()
    const alle = bord
      ._moves({ legal: true })
      .filter((z) => !z.promotion || z.promotion === 'q')
    if (!alle.length) return bord.inCheck() ? -(MAT - ply) : 0
    const rust = over <= 0
    if (rust) {
      if (staan >= beta) return staan
      if (staan > alfa) alfa = staan
    }
    const winst = (z: InterneZet) => (z.captured ? CENTI[z.captured] : 0) + (z.promotion ? CENTI[z.promotion] - 100 : 0)
    const kandidaten = (rust ? alle.filter((z) => z.captured || z.promotion) : alle).sort((a, b) => winst(b) - winst(a))
    for (const zet of kandidaten) {
      bord._makeMove(zet)
      const score = -negamax(over - 1, ply + 1, -beta, -alfa, -(staan + winst(zet)))
      bord._undoMove()
      if (score >= beta) return score
      if (score > alfa) alfa = score
    }
    return alfa
  }
  try {
    return negamax(diepte, 0, -Infinity, Infinity, begin)
  } catch (e) {
    if (e instanceof Op) return null
    throw e
  }
}

/**
 * Wat al eens uitgerekend is. Het partijscherm roept nabespreking() na elke zet van het
 * kind al aan, terwijl de bot "nadenkt"; bij de uitslag is dan bijna alles al bekend en
 * bevriest het scherm niet (achtenzestigste review, codebase 2: tot 1,6 s op een laptop).
 */
const ONTHOUDEN = new Map<string, number | boolean | null>()
function onthoud<T extends number | boolean | null>(sleutel: string, reken: () => T): T {
  if (ONTHOUDEN.has(sleutel)) return ONTHOUDEN.get(sleutel) as T
  if (ONTHOUDEN.size > 4000) ONTHOUDEN.clear()
  const uit = reken()
  ONTHOUDEN.set(sleutel, uit)
  return uit
}

/** Na deze zet, bij het beste spel: hoeveel materiaal heeft het kind dan (centipionnen)? */
function naZet(fen: string, van: Square, naar: Square, promotie?: PieceType): number | null {
  return onthoud(`z|${fen}|${van}${naar}${promotie ?? ''}`, () => naZetRekenen(fen, van, naar, promotie))
}
function naZetRekenen(fen: string, van: Square, naar: Square, promotie?: PieceType): number | null {
  const game = new Game(fen)
  if (!game.move(van, naar, promotie ?? 'q')) return null
  // Mat of pat na de zet: daar spreekt Pip niet over.
  if (game.status().over) return null
  const tegen = veiligeWaarde(game.fen)
  return tegen === null ? null : -tegen
}

/* ---------------------------------------------------------------- de partij */

/** Kan de ander na deze slag iets terugslaan op hetzelfde veld? */
function terugTeSlaan(fen: string, van: Square, naar: Square): boolean {
  return onthoud(`t|${fen}|${van}${naar}`, () => terugTeSlaanRekenen(fen, van, naar))
}
function terugTeSlaanRekenen(fen: string, van: Square, naar: Square): boolean {
  const game = new Game(fen)
  if (!game.move(van, naar)) return false
  return game.legalMoves().some((z) => z.to === naar && z.isCapture)
}

type Kans = Moment & { buitWaarde: number }

/** Per zet van het kind: wat het speelde, en welke slagen er waren. Ook onthouden. */
const PER_ZET = new Map<string, { eigen: { stuk: PieceType; captured?: PieceType } | null; kansen: Kans[] }>()
function bekijk(gespeeld: Zet) {
  const sleutel = `${gespeeld.voor}|${gespeeld.from}${gespeeld.to}${gespeeld.promotion ?? ''}`
  const al = PER_ZET.get(sleutel)
  if (al) return al
  if (PER_ZET.size > 2000) PER_ZET.clear()
  const zetten = new Game(gespeeld.voor).legalMoves()
  const eigen = zetten.find((z) => z.from === gespeeld.from && z.to === gespeeld.to) ?? null
  const kansen: Kans[] = []
  // Gemist: slagen naar een stuk van minstens drie pionnen, anders dan wat het kind deed.
  for (const zet of zetten) {
    if (!zet.captured || zet.promotion || PIONNEN[zet.captured] < 3) continue
    if (zet.from === gespeeld.from && zet.to === gespeeld.to) continue
    const terug = terugTeSlaan(gespeeld.voor, zet.from, zet.to)
    kansen.push({
      soort: 'gemist', fen: gespeeld.voor, van: zet.from, naar: zet.to, stuk: zet.stuk, buit: zet.captured,
      gratis: !terug,
      gespeeld: { van: gespeeld.from, naar: gespeeld.to, promotie: gespeeld.promotion },
      buitWaarde: PIONNEN[zet.captured] - (terug ? PIONNEN[zet.stuk] : 0),
    })
  }
  const uit = { eigen: eigen && { stuk: eigen.stuk, captured: eigen.captured }, kansen }
  PER_ZET.set(sleutel, uit)
  return uit
}

export function nabespreking(verloop: Zet[], kind: Color = 'w'): Moment | null {
  const teken = kind === 'w' ? 1 : -1
  const stand = (fen: string) => teken * materialBalance(fen) * 100
  const kansen: Kans[] = []
  let mooi: (Moment & { winst: number }) | null = null

  verloop.forEach((gespeeld, i) => {
    if (gespeeld.color !== kind) return
    const { eigen, kansen: hier } = bekijk(gespeeld)
    kansen.push(...hier)

    // Mooi: een slag die het kind deed en die in de echte partij een stuk opleverde.
    if (eigen?.captured && PIONNEN[eigen.captured] >= 3) {
      // Gemeten vanaf vóór de laatste zet van de ander: terugslaan is geen winst.
      const vorige = verloop[i - 1]
      const vanaf = stand(vorige && vorige.color !== kind ? vorige.voor : gespeeld.voor)
      const later = verloop[Math.min(i + 3, verloop.length - 1)]
      const einde = new Game(later.na).status()
      const kindMat = einde.over && einde.reason === 'mat' && einde.winner !== kind
      const echt = stand(later.na) - vanaf
      const volgensZoeker = naZet(gespeeld.voor, gespeeld.from, gespeeld.to, gespeeld.promotion)
      if (!kindMat && echt >= 300 && volgensZoeker !== null && volgensZoeker - vanaf >= 200 && (!mooi || echt > mooi.winst)) {
        mooi = {
          soort: 'mooi', fen: gespeeld.voor, van: gespeeld.from, naar: gespeeld.to,
          stuk: eigen.stuk, buit: eigen.captured, gratis: !terugTeSlaan(gespeeld.voor, gespeeld.from, gespeeld.to),
          promotie: gespeeld.promotion, winst: echt,
        }
      }
    }
  })

  // De dikste buit eerst; de zoeker beslist. Hooguit zes kansen (twee zoekopdrachten
  // elk), plus één zoekopdracht per mooie slag van het kind hierboven.
  kansen.sort((a, b) => b.buitWaarde - a.buitWaarde)
  for (const kans of kansen.slice(0, 6)) {
    const { van, naar, promotie } = kans.gespeeld!
    const metSlag = naZet(kans.fen, kans.van, kans.naar)
    const zonder = naZet(kans.fen, van, naar, promotie)
    if (metSlag === null || zonder === null) continue
    if (metSlag - zonder < 200 || metSlag - stand(kans.fen) < 200) continue
    const { buitWaarde: _, ...moment } = kans
    return moment
  }
  if (!mooi) return null
  const { winst: _, ...moment } = mooi as Moment & { winst: number }
  return moment
}
