import { describe, expect, it } from 'vitest'
import { ALLE_LESSEN, WERELDEN } from '@/content'
import { MAX_OMSCHRIJVING, kort, lesOmschrijving, lesZoektitel } from '@/seo'

/**
 * Zoektitels en -omschrijvingen van de lessen. Google kapt een omschrijving boven de
 * 155 tekens af, en een titel als "Staat mijn stuk te pakken?: schaakles" oogt slordig.
 */
describe('zoekgegevens van de lessen', () => {
  for (const les of ALLE_LESSEN) {
    const wereld = WERELDEN.find((w) => w.id === les.wereldId)!
    it(`${les.id}: omschrijving past, titel zonder "?:"`, () => {
      expect(lesOmschrijving(les.doel, wereld.naam).length).toBeLessThanOrEqual(MAX_OMSCHRIJVING)
      expect(lesZoektitel(les.titel)).not.toMatch(/[?!]:/)
    })
  }

  it('kort op een woordgrens', () => {
    expect(kort('een twee drie', 9)).toBe('een twee…')
    expect(kort('kort', 9)).toBe('kort')
  })
})
