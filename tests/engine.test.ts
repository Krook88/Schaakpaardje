import { describe, expect, it } from 'vitest'
import {
  allMoves,
  applyMove,
  isLightSquare,
  parseBoard,
  pieceMoves,
  toPlacement,
} from '@/engine/board'
import { Game, materialBalance } from '@/engine/game'
import { BOTS, KidBot } from '@/engine/bots'
import { waardeer, zoek } from '@/engine/zoeker'

const LEEG = '8/8/8/8/8/8/8/8'

describe('bord lezen en schrijven', () => {
  it('leest de beginstelling', () => {
    const b = parseBoard('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    expect(Object.keys(b)).toHaveLength(32)
    expect(b['e1']).toEqual({ type: 'k', color: 'w' })
    expect(b['d8']).toEqual({ type: 'q', color: 'b' })
  })

  it('schrijft dezelfde stelling terug', () => {
    const fen = 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R'
    expect(toPlacement(parseBoard(fen))).toBe(fen)
  })

  it('weigert een kapotte FEN', () => {
    expect(() => parseBoard('8/8/8')).toThrow()
    expect(() => parseBoard('9/8/8/8/8/8/8/8')).toThrow()
  })

  it('kent de veldkleuren: a1 donker, h1 licht', () => {
    expect(isLightSquare('a1')).toBe(false)
    expect(isLightSquare('h1')).toBe(true)
    expect(isLightSquare('e4')).toBe(true)
    expect(isLightSquare('e5')).toBe(false)
  })
})

describe('het paard', () => {
  it('kan vanuit het midden naar acht velden', () => {
    const b = parseBoard('8/8/8/4N3/8/8/8/8')
    expect(pieceMoves(b, 'e5').all.sort()).toEqual(
      ['c4', 'c6', 'd3', 'd7', 'f3', 'f7', 'g4', 'g6'].sort(),
    )
  })

  it('kan vanuit de hoek maar naar twee velden', () => {
    const b = parseBoard('8/8/8/8/8/8/8/N7')
    expect(pieceMoves(b, 'a1').all.sort()).toEqual(['b3', 'c2'])
  })

  it('springt over stukken heen', () => {
    // Paard op e5 volledig ingesloten door eigen pionnen: springt er gewoon overheen.
    const b = parseBoard('8/8/3PPP2/3PNP2/3PPP2/8/8/8')
    expect(pieceMoves(b, 'e5').all).toHaveLength(8)
  })
})

describe('de pion', () => {
  it('loopt recht en slaat schuin', () => {
    const b = parseBoard('8/8/8/8/3p1p2/4P3/8/8')
    const m = pieceMoves(b, 'e3')
    expect(m.quiet).toEqual(['e4'])
    expect(m.captures.sort()).toEqual(['d4', 'f4'])
  })

  it('mag twee velden vanaf de startrij, maar niet door een stuk heen', () => {
    expect(pieceMoves(parseBoard('8/8/8/8/8/8/4P3/8'), 'e2').quiet.sort()).toEqual(['e3', 'e4'])
    expect(pieceMoves(parseBoard('8/8/8/8/4n3/8/4P3/8'), 'e2').quiet).toEqual(['e3'])
    expect(pieceMoves(parseBoard('8/8/8/8/8/4n3/4P3/8'), 'e2').quiet).toEqual([])
  })

  it('loopt de andere kant op als hij zwart is', () => {
    expect(pieceMoves(parseBoard('8/4p3/8/8/8/8/8/8'), 'e7').quiet.sort()).toEqual(['e5', 'e6'])
  })

  it('promoveert naar een dame', () => {
    const na = applyMove(parseBoard('8/4P3/8/8/8/8/8/8'), 'e7', 'e8')
    expect(na['e8']).toEqual({ type: 'q', color: 'w' })
  })
})

describe('de lange stukken', () => {
  it('de toren loopt recht en stopt bij een eigen stuk', () => {
    const b = parseBoard('8/8/8/8/3PR3/8/8/8')
    const m = pieceMoves(b, 'e4')
    expect(m.all).not.toContain('d4')
    expect(m.all).toContain('e8')
    expect(m.all).toContain('h4')
  })

  it('de loper slaat het eerste vijandelijke stuk op de diagonaal', () => {
    const b = parseBoard('8/8/8/8/4B3/8/8/1n6')
    const m = pieceMoves(b, 'e4')
    expect(m.captures).toContain('b1')
    expect(m.all).not.toContain('a0')
  })

  it('de dame is toren plus loper', () => {
    const q = pieceMoves(parseBoard('8/8/8/8/4Q3/8/8/8'), 'e4').all.length
    const r = pieceMoves(parseBoard('8/8/8/8/4R3/8/8/8'), 'e4').all.length
    const bi = pieceMoves(parseBoard('8/8/8/8/4B3/8/8/8'), 'e4').all.length
    expect(q).toBe(r + bi)
  })
})

describe('alle zetten van een kleur', () => {
  it('telt 20 openingszetten voor wit', () => {
    const b = parseBoard('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')
    expect(allMoves(b, 'w')).toHaveLength(20)
  })
})

describe('echte partijen (chess.js)', () => {
  it('herkent het herderemat', () => {
    const g = new Game()
    for (const [from, to] of [
      ['e2', 'e4'], ['e7', 'e5'],
      ['f1', 'c4'], ['b8', 'c6'],
      ['d1', 'h5'], ['g8', 'f6'],
      ['h5', 'f7'],
    ] as const) {
      expect(g.move(from, to)).not.toBeNull()
    }
    const s = g.status()
    expect(s.over).toBe(true)
    if (s.over) {
      expect(s.reason).toBe('mat')
      expect(s.winner).toBe('w')
    }
  })

  it('herkent pat', () => {
    const g = new Game('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1')
    const s = g.status()
    expect(s.over).toBe(true)
    if (s.over) expect(s.reason).toBe('pat')
  })

  it('weigert een illegale zet', () => {
    const g = new Game()
    expect(g.move('e2', 'e5')).toBeNull()
  })

  it('telt materiaal vanuit wit', () => {
    expect(materialBalance(new Game().fen)).toBe(0)
    expect(materialBalance('7k/8/8/8/8/8/8/Q6K w - - 0 1')).toBe(9)
  })
})

describe('de bots', () => {
  it('spelen alleen legale zetten en maken een partij af', () => {
    // Alleen de eenvoudige bots: die spelen instant. De zoekende bots hebben hun
    // eigen, kortere test verderop — een hele partij op zoekdiepte 3 duurt minuten.
    for (const bot of BOTS.filter((b) => ['mila', 'kiki', 'rens'].includes(b.id))) {
      const g = new Game()
      let zetten = 0
      while (!g.status().over && zetten < 120) {
        const zet = bot.kies(g, Math.random)
        expect(zet, `${bot.naam} vond geen zet`).not.toBeNull()
        expect(g.move(zet!.from, zet!.to), `${bot.naam} speelde iets illegaals`).not.toBeNull()
        zetten++
      }
      expect(zetten).toBeGreaterThan(2)
    }
  })

  it('Kiki pakt een gratis dame', () => {
    // Zwart aan zet, de witte dame op d5 staat ongedekt voor het paard op c3... 
    const g = new Game('4k3/8/8/3Q4/8/2n5/8/4K3 b - - 0 1')
    const kiki = BOTS.find((b) => b.id === 'kiki')!
    const zet = kiki.kies(g, () => 0)
    expect(zet).toEqual({ from: 'c3', to: 'd5' })
  })

  it('de KidBot speelt altijd iets legaals', () => {
    const g = new Game()
    const kid = new KidBot(BOTS[1], 3, () => 0.1)
    for (let i = 0; i < 10 && !g.status().over; i++) {
      if (g.turn === 'w') {
        const m = g.legalMoves()[0]
        g.move(m.from, m.to)
      } else {
        const zet = kid.kies(g)
        expect(zet).not.toBeNull()
        expect(g.move(zet!.from, zet!.to)).not.toBeNull()
      }
    }
  })
})

describe('de zoeker', () => {
  it('waardeert de beginstelling als gelijk', () => {
    expect(waardeer(new Game().fen)).toBe(0)
  })

  it('vindt mat in één', () => {
    expect(zoek(new Game('7k/5ppp/8/8/8/8/8/R5K1 w - - 0 1'), 3).zet).toEqual({
      from: 'a1',
      to: 'a8',
    })
  })

  it('pakt een stuk dat gratis staat', () => {
    expect(zoek(new Game('4k3/8/3q4/8/8/8/8/3RK3 w - - 0 1'), 2).zet).toEqual({
      from: 'd1',
      to: 'd6',
    })
  })

  it('geeft zijn dame niet zomaar weg', () => {
    // Wit kan met de dame een pion slaan, maar dan staat zij te pakken voor de toren.
    const zet = zoek(new Game('3rk3/8/8/8/8/3p4/8/3QK3 w - - 0 1'), 2).zet
    expect(zet).not.toEqual({ from: 'd1', to: 'd3' })
  })

  it('blijft binnen zijn knopenbudget', () => {
    const r = zoek(new Game('r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1'), 3, 500)
    expect(r.knopen).toBeLessThan(1200)
    expect(r.zet).not.toBeNull()
  })

  it('de sterkere bots spelen legale zetten', () => {
    // Zes zetten per bot is genoeg om te zien dat er niets illegaals uit komt. Een
    // hele partij op zoekdiepte 3 kost minuten, en die tijd is een testronde niet waard;
    // dat de zoeker goede zetten kiest, staat in de tests hierboven.
    for (const id of ['bas', 'fien', 'oscar', 'bram']) {
      const bot = BOTS.find((b) => b.id === id)!
      const g = new Game()
      let zetten = 0
      while (!g.status().over && zetten < 6) {
        const zet = bot.kies(g, Math.random)
        expect(zet, `${bot.naam} vond geen zet`).not.toBeNull()
        expect(g.move(zet!.from, zet!.to), `${bot.naam} speelde iets illegaals`).not.toBeNull()
        zetten++
      }
      expect(zetten).toBe(6)
    }
  }, 60000)

  it('de ladder loopt op in speelsterkte', () => {
    const elos = BOTS.map((b) => b.elo).filter((e): e is number => e !== null)
    expect(elos).toEqual([...elos].sort((a, b) => a - b))
    expect(BOTS).toHaveLength(7)
  })
})
