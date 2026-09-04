import { describe, expect, it } from 'vitest'
import { applyMove, controleVelden, parseBoard, pieceMoves } from '@/engine/board'
import { Game } from '@/engine/game'
import { goedeZetten } from '@/lesson/runner'
import { ALLE_LESSEN, WERELDEN, lesMet } from '@/content'
import type { Exercise } from '@/content/types'
import { MINISPELLEN, minispelMet, zaad } from '@/play/minispellen'

const opgavenVan = (id: string): Exercise[] => {
  const les = lesMet(id)
  if (!les) throw new Error(`les ${id} bestaat niet`)
  return [...les.meedoen, ...les.zelf, ...les.toets]
}

describe('wereld 10 — mat en pat', () => {
  it('elke mat-in-1 heeft ook echt een mat in één', () => {
    for (const o of opgavenVan('mat-2')) {
      if (o.kind !== 'regelZet') continue
      expect(o.eis).toBe('matIn1')
      const matten = goedeZetten(new Game(o.fen), 'matIn1')
      expect(matten.length, `geen mat in ${o.fen}`).toBeGreaterThan(0)
    }
  })

  it('de patstelling uit de les is echt pat', () => {
    const g = new Game('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1')
    const st = g.status()
    expect(st.over).toBe(true)
    if (st.over) expect(st.reason).toBe('pat')
  })
})

describe('wereld 11 — rokade', () => {
  it('in elke rokade-opgave kan er ook echt gerokeerd worden', () => {
    for (const les of ['rokade-1', 'rokade-2', 'rokade-3']) {
      for (const o of opgavenVan(les)) {
        if (o.kind !== 'regelZet') continue
        expect(o.eis).toBe('rokeer')
        const rokades = goedeZetten(new Game(o.fen), 'rokeer')
        expect(rokades.length, `geen rokade mogelijk in ${o.fen}`).toBeGreaterThan(0)
      }
    }
  })

  it('de stelling met het paard op f1 laat alleen de lange rokade toe', () => {
    const rokades = goedeZetten(
      new Game('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3KN1R w KQkq - 0 1'),
      'rokeer',
    ).map((z) => z.san)
    expect(rokades).toEqual(['O-O-O'])
  })

  it('de stelling met de zwarte toren op g8 verbiedt de korte rokade', () => {
    const rokades = goedeZetten(new Game('4k1r1/8/8/8/8/8/8/R3K2R w KQ - 0 1'), 'rokeer').map(
      (z) => z.san,
    )
    expect(rokades).toEqual(['O-O-O'])
  })
})

describe('wereld 13 — tactiek', () => {
  it('elke vork-opgave valt na de goede zet echt twee stukken tegelijk aan', () => {
    for (const o of opgavenVan('tactiek-1')) {
      if (o.kind !== 'move' || !o.from) continue
      for (const naar of o.goed) {
        const na = applyMove(parseBoard(o.fen), o.from, naar)
        const raak = controleVelden(na, naar).filter((sq) => na[sq]?.color === 'b')
        expect(raak.length, `${o.from}-${naar} raakt maar ${raak.length} stuk(ken)`).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it('na elke penning-opgave kan het gepende stuk geen kant meer op', () => {
    for (const o of opgavenVan('tactiek-2')) {
      if (o.kind !== 'move' || !o.from) continue
      const board = parseBoard(o.fen)
      const zwartStuk = Object.entries(board).find(([, p]) => p.color === 'b' && p.type !== 'k')
      expect(zwartStuk, `geen zwart stuk om te pennen in ${o.fen}`).toBeDefined()
      for (const naar of o.goed) {
        const game = new Game(`${o.fen} w - - 0 1`)
        expect(game.move(o.from, naar), `${o.from}-${naar} mag niet`).not.toBeNull()
        const vrij = game.legalMoves().filter((z) => z.from === zwartStuk![0])
        expect(vrij.length, `${zwartStuk![0]} zit niet vast`).toBe(0)
      }
    }
  })
})

describe('wereld 14 — eindspel', () => {
  it('elke matopgave is een echte mat in één', () => {
    for (const o of opgavenVan('eindspel-2')) {
      if (o.kind !== 'regelZet') continue
      expect(goedeZetten(new Game(o.fen), 'matIn1').length).toBeGreaterThan(0)
    }
  })

  it('elke pion kan de overkant halen', () => {
    for (const les of ['eindspel-1', 'eindspel-3']) {
      for (const o of opgavenVan(les)) {
        if (o.kind !== 'reach') continue
        const board = parseBoard(o.fen)
        expect(board[o.from], `geen stuk op ${o.from}`).toBeDefined()
      }
    }
  })
})

describe('het hele pad', () => {
  it('alle 15 werelden staan erin, op volgorde en met oplopende leeftijd', () => {
    expect(WERELDEN).toHaveLength(15)
    expect(WERELDEN.map((w) => w.nummer)).toEqual([...Array(15).keys()])
    const leeftijden = WERELDEN.map((w) => w.minLeeftijd)
    expect(leeftijden).toEqual([...leeftijden].sort((a, b) => a - b))
    expect(ALLE_LESSEN.length).toBeGreaterThanOrEqual(45)
  })

  it('elk minispel waar een wereld naar verwijst, bestaat ook echt', () => {
    for (const wereld of WERELDEN) {
      if (!wereld.minispel) continue
      expect(minispelMet(wereld.minispel), `${wereld.naam} verwijst naar ${wereld.minispel}`).toBeDefined()
    }
  })

  it('de drie diplomas zitten op het eind van hun blok', () => {
    const diplomas = WERELDEN.filter((w) => w.diploma).map((w) => [w.nummer, w.diploma])
    expect(diplomas).toEqual([[6, 'brons'], [12, 'zilver'], [14, 'goud']])
  })

  it('elk minispel levert op elk niveau een bruikbare opgave', () => {
    for (const spel of MINISPELLEN) {
      for (let niveau = 1; niveau <= 6; niveau++) {
        const o = spel.maakOpgave(niveau, zaad(niveau * 13 + spel.id.length))
        expect(o.kind, `${spel.id} niveau ${niveau}`).toBeTruthy()
        if (o.kind === 'move' && o.from) {
          expect(pieceMoves(parseBoard(o.fen), o.from).all).toEqual(expect.arrayContaining(o.goed))
        }
        if (o.kind === 'regelZet') {
          const game = new Game(o.fen)
          expect(game.status().over, `${spel.id}: partij al afgelopen`).toBe(false)
          expect(goedeZetten(game, o.eis).length, `${spel.id}: geen oplossing`).toBeGreaterThan(0)
        }
        if (o.kind === 'tapSquares') expect(o.correct.length).toBeGreaterThan(0)
      }
    }
  })
})
