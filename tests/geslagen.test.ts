import { describe, expect, it } from 'vitest'
import { Game } from '../src/engine/game'

describe('Game.geslagen', () => {
  it('telt een gewone slag', () => {
    const g = new Game()
    g.move('e2', 'e4'); g.move('d7', 'd5'); g.move('e4', 'd5')
    expect(g.geslagen).toEqual({ w: [], b: ['p'] })
  })
  it('telt promotie niet als slag', () => {
    const g = new Game('8/P7/8/8/8/8/8/k6K w - - 0 1')
    g.move('a7', 'a8', 'q')
    expect(g.geslagen).toEqual({ w: [], b: [] })
  })
  it('telt en passant als pion', () => {
    const g = new Game('k7/8/8/3pP3/8/8/8/7K w - d6 0 1')
    g.move('e5', 'd6')
    expect(g.geslagen).toEqual({ w: [], b: ['p'] })
  })
})
