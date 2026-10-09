import { describe, expect, it } from 'vitest'
import { Game, blunderVerlies } from '@/engine/game'

/**
 * De blunderwaarschuwing rekent vanuit wie er zet.
 *
 * Eerst rekende hij altijd vanuit wit, en stond hij bij samen spelen voor zwart precies
 * verkeerd om: een weggegeven dame telde als winst (zesde review, I5).
 */
describe('blunderVerlies, voor wit en voor zwart', () => {
  it('wit geeft zijn dame weg: 9', () => {
    // 1.e4 e5 2.? d6: de loper op c8 kijkt nu tot g4, dus Dd1-g4 laat zich slaan.
    const g = new Game('rnbqkbnr/ppp2ppp/3p4/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3')
    expect(blunderVerlies(g, 'd1', 'g4')).toBe(9)
  })
  it('zwart geeft zijn dame weg: ook 9', () => {
    // 1.f3 e5 2.g4: na Dd8-h4 is het mat, maar hier zetten we de pion op g3,
    // zodat de dame op h4 gewoon te slaan is.
    const g = new Game('rnbqkbnr/pppp1ppp/8/4p3/8/5PP1/PPPPP2P/RNBQKBNR b KQkq - 0 2')
    expect(blunderVerlies(g, 'd8', 'h4')).toBe(9)
  })
  it('een eerlijke ruil kost niets, voor beide kleuren', () => {
    // Paard tegen paard op d5/e... : wit Pc3 en zwart Pf6 kunnen ruilen op d5/e4.
    const wit = new Game('rnbqkb1r/pppp1ppp/5n2/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 3')
    expect(blunderVerlies(wit, 'c3', 'd5')).toBe(0)
    const zwart = new Game('r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 2 3')
    expect(blunderVerlies(zwart, 'c6', 'd4')).toBe(0)
  })
})
