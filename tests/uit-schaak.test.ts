import { describe, expect, it } from 'vitest'
import { Game } from '@/engine/game'
import { goedeZetten } from '@/lesson/runner'

/**
 * De drie manieren om uit schaak te gaan, elk als eigen eis.
 *
 * Eerst bestond alleen `uitSchaak`, en die keurt elke legale zet goed. De les "drie
 * manieren" kon daardoor niet fout gaan. Hier liggen de drie vast in een stelling
 * waar ze alle drie kunnen: toren slaat, loper zet ertussen, koning loopt weg.
 */
const ALLE_DRIE = 'R3r3/8/8/7k/8/2B5/8/4K3 w - - 0 1'

const sans = (eis: Parameters<typeof goedeZetten>[1], fen = ALLE_DRIE) =>
  goedeZetten(new Game(fen), eis).map((z) => z.san).sort()

describe('uit schaak, per manier', () => {
  it('slaan: alleen het stuk dat schaak geeft pakken', () => {
    expect(sans('slaAanvaller')).toEqual(['Rxe8'])
  })
  it('ertussen: een ander stuk dan de koning in de weg', () => {
    expect(sans('ertussen')).toEqual(['Be5'])
  })
  it('weglopen: alleen koningszetten', () => {
    expect(sans('wegLopen')).toEqual(['Kd1', 'Kd2', 'Kf1', 'Kf2'])
  })
  it('een koning die de aanvaller slaat, slaat en loopt niet weg', () => {
    const fen = '7k/8/8/8/8/8/4r3/4K3 w - - 0 1'
    expect(sans('slaAanvaller', fen)).toEqual(['Kxe2'])
    expect(sans('wegLopen', fen)).not.toContain('Kxe2')
  })
  it('samen zijn het precies alle uitwegen', () => {
    const alle = new Game(ALLE_DRIE).legalMoves().length
    expect(sans('slaAanvaller').length + sans('ertussen').length + sans('wegLopen').length).toBe(alle)
  })
})
