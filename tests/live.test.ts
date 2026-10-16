import { describe, expect, it } from 'vitest'
import { isKamer, leesStand } from '@/play/live'

/**
 * Wat de server terugstuurt, komt bij een kind op het scherm. Dus nakijken: alleen
 * plaatjes uit de app, en alleen zetten die volgens de regels kunnen.
 */
const goed = { wit: '🐴', zwart: '🦊', zetten: ['e2e4', 'e7e5'], ronde: 1, jij: 'w', ander: 'er' }

describe('live spelen: de stand van de server', () => {
  it('een gewone stand wordt nagespeeld', () => {
    const p = leesStand(goed)!
    expect(p.game.turn).toBe('w')
    expect(p.zetten).toEqual(['e2e4', 'e7e5'])
  })

  it('een onmogelijke zet maakt de stand ongeldig', () => {
    expect(leesStand({ ...goed, zetten: ['e2e5'] })).toBeNull()
  })

  it('tekst in plaats van een plaatje wordt geweigerd', () => {
    expect(leesStand({ ...goed, wit: 'Daan' })).toBeNull()
    expect(leesStand({ ...goed, zwart: '💩' })).toBeNull()
  })

  it('zwart mag nog leeg zijn, zolang het vriendje er niet is', () => {
    expect(leesStand({ ...goed, zwart: null, zetten: [], ander: 'nog-niet' })?.ander).toBe('nog-niet')
  })

  it('een speellink heeft een code van tien tekens, zonder tekens die op elkaar lijken', () => {
    expect(isKamer('k7f3qxab2c')).toBe(true)
    expect(isKamer('k7f3qxab2')).toBe(false)
    expect(isKamer('k7f3qxab0c')).toBe(false)
    expect(isKamer('../../etc/')).toBe(false)
  })
})
