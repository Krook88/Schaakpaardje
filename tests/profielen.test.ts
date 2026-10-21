import { beforeEach, describe, expect, it } from 'vitest'

// Zelfde emmertje als in modus.test.ts: zustand wil localStorage.
const emmer = new Map<string, string>()
globalThis.localStorage = {
  getItem: (k: string) => emmer.get(k) ?? null,
  setItem: (k: string, v: string) => void emmer.set(k, v),
  removeItem: (k: string) => void emmer.delete(k),
  clear: () => emmer.clear(),
  key: (i: number) => [...emmer.keys()][i] ?? null,
  get length() {
    return emmer.size
  },
} as Storage

const { AVATARS, eersteVrijeMaatje, useProfielStore, voortgangVan } = await import('@/progress/store')

/**
 * Twee kinderen op één apparaat. Zestiende review, C2: niets legde vast dat het eerste
 * kind zijn sterren houdt als er een tweede bij komt.
 */
const leeg = useProfielStore.getState()

describe('nog een kind', () => {
  beforeEach(() => {
    emmer.clear()
    useProfielStore.setState({ ...leeg, profielen: [], actiefId: null, voortgang: {} })
  })

  it('het eerste kind houdt zijn sterren, het tweede begint leeg', () => {
    const s = useProfielStore.getState
    const noor = s().maakProfiel('Noor', 5, '🐴')
    s().bewaarLes('weide-1', { sterren: 3, fouten: 0, hints: 0 })
    const daan = s().maakProfiel('Daan', 9, '🦊')

    expect(s().actiefId).toBe(daan)
    expect(voortgangVan(s())).toEqual({})
    expect(s().profielen.find((p) => p.id === daan)?.modus).toBe('schaker')

    s().kiesProfiel(noor)
    expect(voortgangVan(s())['weide-1']?.sterren).toBe(3)
    expect(s().profielen.find((p) => p.id === noor)?.modus).toBe('pip')
  })

  it('kiest een maatje dat nog niemand heeft', () => {
    expect(eersteVrijeMaatje([])).toBe('🐴')
    expect(eersteVrijeMaatje(['🐴'])).toBe('🦊')
    expect(eersteVrijeMaatje(['🦊', '🐴'])).toBe('🐻')
    expect(eersteVrijeMaatje([...AVATARS])).toBe('🐴')
  })
})

/**
 * Spelen zonder profiel. Een ouder die via Google op een les landt, of op "Probeer de
 * eerste les" tikt, speelt als gast. Daarvoor gooide `bewaarLes` de sterren stilletjes weg.
 */
describe('spelen als gast', () => {
  beforeEach(() => {
    emmer.clear()
    useProfielStore.setState({ ...leeg, profielen: [], actiefId: null, voortgang: {}, stickers: {}, hervatpunt: {}, oefendagen: {} })
  })

  it('de sterren van een gast blijven staan en gaan mee naar het eerste profiel', () => {
    const s = useProfielStore.getState
    s().bewaarLes('weide-1', { sterren: 3, fouten: 0, hints: 0 })
    s().geefSticker('weide-1')
    s().bewaarHervatpunt('weide-2', 'zelf')
    expect(voortgangVan(s())['weide-1']?.sterren).toBe(3)

    const noor = s().maakProfiel('Noor', 5, '🐴')
    expect(voortgangVan(s())['weide-1']?.sterren).toBe(3)
    expect(s().stickers[noor]).toEqual(['weide-1'])
    expect(s().hervatpunt[noor]).toEqual({ 'weide-2': 'zelf' })
    expect(s().oefendagen[noor]?.aantal).toBe(1)
    // En de gast is leeg: een tweede kind erft niets van het eerste.
    expect(s().voortgang.gast).toBeUndefined()
    s().maakProfiel('Daan', 9, '🦊')
    expect(voortgangVan(s())).toEqual({})
  })
})
