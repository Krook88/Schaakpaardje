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

  it('een promotie komt heen en terug goed over, ook tot paard', () => {
    // Wit loopt met de h-pion door naar h8 (gxh7 slaat de pion op h7).
    const zetten = ['h2h4', 'g7g5', 'h4g5', 'h7h6', 'g5h6', 'g8f6', 'h6h7', 'f6g8', 'h7g8n']
    const terug = leesIn(codeer({ zetten, wit: '🐴', zwart: '🦊' }))!
    expect(terug).not.toBeNull()
    expect(terug.game.fen.split(' ')[0]).toContain('N')
    expect(terug.game.fen.startsWith('rnbqkbN')).toBe(true)
  })

  it('alleen plaatjes uit de app, geen ander teken', () => {
    expect(leesIn(codeer({ zetten: [], wit: '💩', zwart: null }))).toBeNull()
    expect(leesIn(codeer({ zetten: [], wit: '\u202e', zwart: null }))).toBeNull()
  })

  it('één partij heeft één link: een overbodig promotieteken wordt geweigerd', () => {
    expect(leesIn(codeer({ zetten: ['e2e4q'], wit: '🐴', zwart: null }))).toBeNull()
  })

  it('een enorme link wordt niet eens geprobeerd', () => {
    expect(leesIn('A'.repeat(7000))).toBeNull()
  })

  it('rommel levert null op, geen fout', () => {
    expect(leesIn('dit-is-geen-partij')).toBeNull()
    expect(leesIn('')).toBeNull()
  })
})
