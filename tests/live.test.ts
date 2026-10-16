import { describe, expect, it } from 'vitest'
import { isKamer, isNieuwer, lees, leesStand, nieuweSleutel, type LiveStand } from '@/play/live'

/**
 * Wat de server terugstuurt, komt bij een kind op het scherm. Dus nakijken: alleen
 * plaatjes uit de app, en alleen zetten die volgens de regels kunnen.
 */
const goed: LiveStand = { wit: '🐴', zwart: '🦊', zetten: ['e2e4', 'e7e5'], ronde: 1, vorige: [], jij: 'w', ander: 'er' }

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

  it('een sleutel van dit apparaat ziet eruit als een sleutel van de server', () => {
    expect(nieuweSleutel()).toMatch(/^[a-z2-9]{24}$/)
    expect(nieuweSleutel()).not.toBe(nieuweSleutel())
  })
})

describe('live spelen: wat een antwoord betekent', () => {
  it('te druk is iets anders dan geen verbinding', () => {
    expect(lees(429, null, 'nieuw').soort).toBe('druk')
    expect(lees(503, null, 'nieuw').soort).toBe('druk')
    expect(lees(500, null, 'kijk').soort).toBe('geen-verbinding')
  })

  it('een partij die niet kan, is kapot en niet "geen verbinding"', () => {
    expect(lees(200, { ...goed, zetten: ['e2e5'] }, 'kijk').soort).toBe('kapot')
  })

  it('vol bij meedoen, achter bij een zet', () => {
    expect(lees(409, { stand: goed }, 'meedoen').soort).toBe('vol')
    expect(lees(409, { stand: goed }, 'zet').soort).toBe('achter')
    expect(lees(404, null, 'kijk').soort).toBe('weg')
  })
})

describe('live spelen: een oud antwoord haalt geen zet van het bord', () => {
  const s = (zetten: string[], ronde = 1, ander: 'er' | 'weg' = 'er') => ({ ...goed, zetten, ronde, ander })
  it('minder zetten of een oudere ronde is ouder', () => {
    expect(isNieuwer(s(['e2e4', 'e7e5']), s(['e2e4']))).toBe(false)
    expect(isNieuwer(s(['e2e4'], 2), s(['e2e4', 'e7e5'], 1))).toBe(false)
  })
  it('meer zetten, een nieuwe ronde of een ander die weg is, is nieuw', () => {
    expect(isNieuwer(s(['e2e4']), s(['e2e4', 'e7e5']))).toBe(true)
    expect(isNieuwer(s(['e2e4', 'e7e5']), s([], 2))).toBe(true)
    expect(isNieuwer(s(['e2e4']), s(['e2e4'], 1, 'weg'))).toBe(true)
  })
  it('precies hetzelfde is niet nieuw', () => {
    expect(isNieuwer(s(['e2e4']), s(['e2e4']))).toBe(false)
  })
})
