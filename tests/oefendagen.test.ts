import { afterEach, describe, expect, it, vi } from 'vitest'

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

const { useProfielStore } = await import('@/progress/store')

const aantal = () => {
  const s = useProfielStore.getState()
  return s.oefendagen[s.actiefId!]?.aantal ?? 0
}

/**
 * Dagen geoefend: een teller die alleen omhooggaat.
 *
 * Bewust geen reeks die op nul springt als je een dag overslaat; dat is straffen.
 */
describe('dagen geoefend', () => {
  afterEach(() => vi.useRealTimers())

  it('telt een dag één keer, hoe vaak er die dag ook geoefend wordt', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 9, 10, 0))
    useProfielStore.getState().maakProfiel('Test', 6, '🐴')
    expect(aantal()).toBe(0)
    useProfielStore.getState().bewaarLes('weide-1', { sterren: 3, fouten: 0, hints: 0 })
    useProfielStore.getState().bewaarPartij('gewonnen')
    useProfielStore.getState().bewaarOefendag()
    expect(aantal()).toBe(1)
  })

  it('telt een nieuwe dag erbij, ook na een week niets', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 10, 9, 0))
    useProfielStore.getState().bewaarOefendag()
    expect(aantal()).toBe(2)
    vi.setSystemTime(new Date(2026, 9, 18, 19, 0))
    useProfielStore.getState().bewaarOefendag()
    // Een week overgeslagen, en de teller is niet teruggezet.
    expect(aantal()).toBe(3)
  })

  it('verdwijnt mee als het profiel verwijderd wordt', () => {
    const id = useProfielStore.getState().actiefId!
    useProfielStore.getState().verwijderProfiel(id)
    expect(useProfielStore.getState().oefendagen[id]).toBeUndefined()
  })
})
