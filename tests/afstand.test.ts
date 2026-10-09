import { describe, expect, it } from 'vitest'
import { codeer, leesIn } from '@/play/afstand'

describe('schaken op afstand: de partij in een link', () => {
  it('heen en terug geeft dezelfde partij en stelling', () => {
    const code = codeer({ zetten: ['e2e4', 'e7e5', 'g1f3'], wit: '🐴', zwart: '🦊' })
    const terug = leesIn(code)!
    expect(terug.partij).toEqual({ zetten: ['e2e4', 'e7e5', 'g1f3'], wit: '🐴', zwart: '🦊' })
    expect(terug.game.turn).toBe('b')
  })

  it('zwart mag nog onbekend zijn', () => {
    const terug = leesIn(codeer({ zetten: ['d2d4'], wit: '🐻', zwart: null }))!
    expect(terug.partij.zwart).toBeNull()
  })

  it('alleen tekens die in een link mogen', () => {
    const code = codeer({ zetten: ['e2e4', 'e7e5'], wit: '🐴', zwart: '🦊' })
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('een onmogelijke zet maakt de link ongeldig', () => {
    expect(leesIn(codeer({ zetten: ['e2e5'], wit: '🐴', zwart: null }))).toBeNull()
  })

  it('een naam of tekst in plaats van een plaatje wordt geweigerd', () => {
    expect(leesIn(codeer({ zetten: [], wit: 'Daan', zwart: null }))).toBeNull()
  })

  it('rommel levert null op, geen fout', () => {
    expect(leesIn('dit-is-geen-partij')).toBeNull()
    expect(leesIn('')).toBeNull()
  })
})
