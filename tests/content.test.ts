import { describe, expect, it } from 'vitest'
import { controleerContent, alleZinnen } from '@/content/validate'
import { ALLE_LESSEN, WERELDEN } from '@/content'

describe('de content', () => {
  it('bevat geen enkele fout', () => {
    const bevindingen = controleerContent()
    if (bevindingen.length) {
      console.error(bevindingen.map((b) => `- ${b.waar}: ${b.probleem}`).join('\n'))
    }
    expect(bevindingen).toEqual([])
  })

  it('heeft werelden op volgorde en met oplopende leeftijd', () => {
    const nummers = WERELDEN.map((w) => w.nummer)
    expect(nummers).toEqual([...nummers].sort((a, b) => a - b))
    const leeftijden = WERELDEN.map((w) => w.minLeeftijd)
    expect(leeftijden).toEqual([...leeftijden].sort((a, b) => a - b))
  })

  it('heeft genoeg lesstof voor de MVP', () => {
    expect(WERELDEN).toHaveLength(7)
    expect(ALLE_LESSEN.length).toBeGreaterThanOrEqual(20)
  })

  it('levert een lijst zinnen op om in te spreken', () => {
    const zinnen = alleZinnen()
    expect(zinnen.length).toBeGreaterThan(100)
    expect(zinnen.every((z) => z.trim().length > 0)).toBe(true)
  })
})
