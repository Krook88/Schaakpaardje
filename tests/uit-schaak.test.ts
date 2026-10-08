import { describe, expect, it } from 'vitest'
import { Game } from '@/engine/game'
import { foutZin, goedeZetten, startOpgave, tik } from '@/lesson/runner'
import { ALLE_LESSEN } from '@/content'
import { NOG_STEEDS_SCHAAK } from '@/content/voice'
import type { Exercise } from '@/content/types'
import type { Square } from '@/engine/board'

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

describe('uit schaak, aan de kant van het kind (via tik)', () => {
  const PER_MANIER = ['wegLopen', 'slaAanvaller', 'ertussen']
  const opgaven = ALLE_LESSEN.flatMap((les) =>
    [...les.meedoen, ...les.zelf, ...les.toets]
      .filter((o): o is Extract<Exercise, { kind: 'regelZet' }> => o.kind === 'regelZet' && PER_MANIER.includes(o.eis))
      .map((o) => [`${les.id} ${o.eis} ${o.fen}`, o] as const),
  )

  it('er zijn zulke opgaven', () => expect(opgaven.length).toBeGreaterThan(0))

  // Wat de les moest repareren: de verkeerde manier is fout, en Pip zegt dan de
  // fouttip van de opgave (want die zet mocht wel).
  it.each(opgaven)('%s: een zet die mag maar de verkeerde manier is, telt als fout', (_, o) => {
    const game = new Game(o.fen)
    const goed = new Set(goedeZetten(game, o.eis).map((z) => z.from + z.to))
    const verkeerd = game.legalMoves().find((z) => !goed.has(z.from + z.to))!
    expect(verkeerd).toBeDefined()
    let stand = startOpgave(o)
    stand = tik(stand, verkeerd.from).stand
    const r = tik(stand, verkeerd.to)
    expect(r.uit).toBe('fout')
    expect(r.reden).toBeUndefined()
    expect(foutZin(r.stand, r.reden)).toBe(o.foutTip)
  })

  // En wat de review vond: een zet die niet mag (je blijft schaak staan) kreeg dezelfde
  // fouttip, met zinnen als "Je koning is veilig". Nu een vaste zin over de regels.
  it.each(opgaven)('%s: een zet waarna je nog schaak staat, krijgt nooit de fouttip', (_, o) => {
    const game = new Game(o.fen)
    const koning = (['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const)
      .flatMap((f) => [1, 2, 3, 4, 5, 6, 7, 8].map((r) => `${f}${r}` as Square))
      .find((v) => startOpgave(o).board[v]?.type === 'k' && startOpgave(o).board[v]?.color === game.turn)!
    const mag = new Set(game.legalMoves().map((z) => z.to))
    const naast = [-1, 0, 1].flatMap((df) => [-1, 0, 1].map((dr) => [df, dr]))
      .filter(([df, dr]) => df || dr)
      .map(([df, dr]) => String.fromCharCode(koning.charCodeAt(0) + df) + (Number(koning[1]) + dr))
      .filter((v) => /^[a-h][1-8]$/.test(v) && !mag.has(v as Square) && !startOpgave(o).board[v as Square]) as Square[]
    for (const doel of naast) {
      let stand = startOpgave(o)
      stand = tik(stand, koning).stand
      const r = tik(stand, doel)
      expect(r.uit, `${koning}-${doel}`).toBe('fout')
      expect(r.reden).toBe('magNiet')
      expect(foutZin(r.stand, r.reden)).toBe(NOG_STEEDS_SCHAAK)
    }
  })
})

describe('en passant', () => {
  // De pion op d5 geeft schaak; exd6 e.p. slaat hem. Dat is slaan, geen ertussen.
  const fen = '7k/8/8/3pP3/4K3/8/8/8 w - d6 0 2'
  it('slaan via en passant telt als de aanvaller slaan', () => {
    expect(sans('slaAanvaller', fen)).toContain('exd6')
    expect(sans('ertussen', fen)).not.toContain('exd6')
  })
})
