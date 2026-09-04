import { describe, expect, it } from 'vitest'
import {
  aanvallersVan,
  applyMove,
  bedreigdeStukken,
  parseBoard,
  pieceMoves,
  PIECE_VALUE,
  veiligeVelden,
} from '@/engine/board'
import { Game } from '@/engine/game'
import { goedeZetten } from '@/lesson/runner'
import { lesMet } from '@/content'
import type { Exercise } from '@/content/types'
import { minispelMet, zaad } from '@/play/minispellen'

/**
 * Wereld 7 en 8 draaien om antwoorden die je niet kunt overtypen zonder fouten te
 * maken: welke velden zijn veilig, welk stuk is het duurst, wie valt er aan. Deze
 * tests rekenen dat opnieuw uit met de engine en vergelijken het met wat er in de
 * content staat. Wijzigt iemand een stelling, dan valt de bijbehorende opgave hier om.
 */

const zetOpgaven = (id: string): Exercise[] => {
  const les = lesMet(id)
  if (!les) throw new Error(`les ${id} bestaat niet`)
  return [...les.meedoen, ...les.zelf, ...les.toets]
}
const sorteer = (a: string[]) => [...a].sort()

describe('wereld 8 — aanval en verdediging', () => {
  it('les 1: de aangewezen velden zijn precies de bedreigde witte stukken', () => {
    for (const o of zetOpgaven('aanval-1')) {
      if (o.kind !== 'tapSquares') continue
      const board = parseBoard(o.fen)
      expect(sorteer(o.correct), `stelling ${o.fen}`).toEqual(sorteer(bedreigdeStukken(board, 'w')))
    }
  })

  it('les 2: de goede zetten zijn precies de velden waar het stuk veilig staat', () => {
    for (const o of zetOpgaven('aanval-2')) {
      if (o.kind !== 'move' || !o.from) continue
      const board = parseBoard(o.fen)
      expect(sorteer(o.goed), `stelling ${o.fen}`).toEqual(sorteer(veiligeVelden(board, o.from)))
    }
  })

  it('les 2: het stuk dat gered moet worden, staat ook echt onder vuur', () => {
    for (const o of zetOpgaven('aanval-2')) {
      if (o.kind !== 'move' || !o.from) continue
      const board = parseBoard(o.fen)
      expect(aanvallersVan(board, o.from, 'b').length, `stelling ${o.fen}`).toBeGreaterThan(0)
    }
  })

  it('les 3: de goede zet slaat precies de aanvaller', () => {
    for (const o of zetOpgaven('aanval-3')) {
      if (o.kind !== 'move' || !o.from) continue
      const board = parseBoard(o.fen)
      const aanvallers = aanvallersVan(board, o.from, 'b')
      expect(sorteer(o.goed), `stelling ${o.fen}`).toEqual(sorteer(aanvallers))
      expect(pieceMoves(board, o.from).captures).toEqual(expect.arrayContaining(o.goed))
    }
  })

  it('les 4: na de goede zet is het aangevallen stuk gedekt', () => {
    for (const o of zetOpgaven('aanval-4')) {
      if (o.kind !== 'move' || !o.from) continue
      const board = parseBoard(o.fen)
      const bedreigd = bedreigdeStukken(board, 'w').filter((sq) => sq !== o.from)
      expect(bedreigd.length, `stelling ${o.fen}`).toBe(1)
      for (const naar of o.goed) {
        const na = applyMove(board, o.from, naar)
        expect(aanvallersVan(na, bedreigd[0], 'w').length, `${o.from}-${naar}`).toBeGreaterThan(0)
      }
    }
  })
})

describe('wereld 7 — waarde', () => {
  it('les 2: de goede zet pakt het duurste stuk dat te pakken is', () => {
    for (const o of zetOpgaven('waarde-2')) {
      if (o.kind !== 'move' || !o.from) continue
      const board = parseBoard(o.fen)
      const slag = pieceMoves(board, o.from).captures
      expect(slag.length, `stelling ${o.fen} heeft niets te kiezen`).toBeGreaterThan(0)
      const hoogste = Math.max(...slag.map((sq) => PIECE_VALUE[board[sq].type]))
      const beste = slag.filter((sq) => PIECE_VALUE[board[sq].type] === hoogste)
      expect(sorteer(o.goed), `stelling ${o.fen}`).toEqual(sorteer(beste))
    }
  })
})

describe('de nieuwe minispellen', () => {
  it('de weegschaal laat altijd echt iets te kiezen', () => {
    const spel = minispelMet('weegschaal')!
    for (let niveau = 1; niveau <= 6; niveau++) {
      for (let n = 0; n < 15; n++) {
        const o = spel.maakOpgave(niveau, zaad(niveau * 100 + n))
        expect(o.kind).toBe('move')
        if (o.kind !== 'move' || !o.from) continue
        const board = parseBoard(o.fen)
        const slag = pieceMoves(board, o.from).captures
        const hoogste = Math.max(...slag.map((sq) => PIECE_VALUE[board[sq].type]))
        expect(sorteer(o.goed)).toEqual(sorteer(slag.filter((sq) => PIECE_VALUE[board[sq].type] === hoogste)))
      }
    }
  })

  it('red je stuk geeft altijd een bedreigd stuk met minstens één uitweg', () => {
    const spel = minispelMet('red-je-stuk')!
    for (let niveau = 1; niveau <= 6; niveau++) {
      for (let n = 0; n < 15; n++) {
        const o = spel.maakOpgave(niveau, zaad(niveau * 7 + n))
        expect(o.kind).toBe('move')
        if (o.kind !== 'move' || !o.from) continue
        const board = parseBoard(o.fen)
        expect(aanvallersVan(board, o.from, 'b').length).toBeGreaterThan(0)
        expect(o.goed.length).toBeGreaterThan(0)
        expect(sorteer(o.goed)).toEqual(sorteer(veiligeVelden(board, o.from)))
      }
    }
  })
})

describe('wereld 9 — schaak', () => {
  it('elke regelZet-opgave is oplosbaar en klopt met zijn eis', () => {
    for (const les of ['schaak-1', 'schaak-2', 'schaak-3']) {
      for (const o of zetOpgaven(les)) {
        if (o.kind !== 'regelZet') continue
        const game = new Game(o.fen)
        const status = game.status()
        expect(status.over, `${o.fen} is al afgelopen`).toBe(false)
        if (!status.over && o.eis === 'uitSchaak') {
          expect(status.check, `${o.fen} zou schaak moeten staan`).toBe(true)
        }
        if (!status.over && o.eis === 'geefSchaak') {
          expect(status.check, `${o.fen} staat zelf schaak`).toBe(false)
        }
        const goed = goedeZetten(game, o.eis)
        expect(goed.length, `geen oplossing voor ${o.fen}`).toBeGreaterThan(0)
      }
    }
  })

  it('de opgave met drie manieren biedt ook echt alle drie', () => {
    const game = new Game('R3r3/8/8/7k/8/2B5/8/4K3 w - - 0 1')
    const zetten = game.legalMoves()
    expect(zetten.some((z) => z.isCapture), 'de aanvaller slaan moet kunnen').toBe(true)
    expect(zetten.some((z) => z.from === 'c3'), 'ertussen zetten moet kunnen').toBe(true)
    expect(zetten.some((z) => z.from === 'e1'), 'weglopen moet kunnen').toBe(true)
  })

  it('een zet die het schaak niet oplost, bestaat niet', () => {
    // Dit is precies wat een kind hier leert: chess.js laat zo'n zet niet toe.
    const game = new Game('7k/8/8/8/8/8/4r3/4K3 w - - 0 1')
    expect(game.move('e1', 'e2')).not.toBeNull() // de toren slaan mag wel
    const anders = new Game('7k/8/8/8/8/8/4r3/4K3 w - - 0 1')
    expect(anders.move('e1', 'f2')).toBeNull() // f2 blijft door de toren bestreken
  })

  it('schaak-alarm geeft altijd een stelling waarin schaak te geven is', () => {
    const spel = minispelMet('schaak-alarm')!
    for (let niveau = 1; niveau <= 6; niveau++) {
      for (let n = 0; n < 10; n++) {
        const o = spel.maakOpgave(niveau, zaad(niveau * 31 + n))
        expect(o.kind).toBe('regelZet')
        if (o.kind !== 'regelZet') continue
        const game = new Game(o.fen)
        expect(game.status().over).toBe(false)
        expect(goedeZetten(game, 'geefSchaak').length).toBeGreaterThan(0)
      }
    }
  })
})
