import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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
const leeg = useProfielStore.getState()

describe('dagen geoefend', () => {
  // Elke test begint schoon, zodat ze los en in elke volgorde kunnen draaien.
  beforeEach(() => {
    emmer.clear()
    useProfielStore.setState({ ...leeg, profielen: [], actiefId: null, oefendagen: {} })
    useProfielStore.getState().maakProfiel('Test', 6, '🐴')
  })
  afterEach(() => vi.useRealTimers())

  it('telt een dag één keer, hoe vaak er die dag ook geoefend wordt', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 9, 10, 0))
    expect(aantal()).toBe(0)
    useProfielStore.getState().bewaarLes('weide-1', { sterren: 3, fouten: 0, hints: 0 })
    useProfielStore.getState().bewaarPartij('gewonnen')
    useProfielStore.getState().bewaarOefendag()
    expect(aantal()).toBe(1)
  })

  it('telt een nieuwe dag erbij, ook na een week niets', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 9, 10, 0))
    useProfielStore.getState().bewaarOefendag()
    vi.setSystemTime(new Date(2026, 9, 10, 9, 0))
    useProfielStore.getState().bewaarOefendag()
    vi.setSystemTime(new Date(2026, 9, 18, 19, 0))
    useProfielStore.getState().bewaarOefendag()
    // Een week overgeslagen, en de teller is niet teruggezet.
    expect(aantal()).toBe(3)
  })

  it('een losse opfrisopgave telt niet, pas de hele ronde (in het scherm)', () => {
    useProfielStore.getState().bewaarLes('weide-1', { sterren: 3, fouten: 0, hints: 0 })
    const id = useProfielStore.getState().actiefId!
    useProfielStore.setState({ oefendagen: {} })
    useProfielStore.getState().bewaarOpfrissing('weide-1')
    expect(useProfielStore.getState().oefendagen[id]).toBeUndefined()
  })

  it('verdwijnt mee als het profiel verwijderd wordt', () => {
    useProfielStore.getState().bewaarOefendag()
    const id = useProfielStore.getState().actiefId!
    useProfielStore.getState().verwijderProfiel(id)
    expect(useProfielStore.getState().oefendagen[id]).toBeUndefined()
  })

  it('een partij voor een ander profiel raakt het actieve kind niet', () => {
    const ik = useProfielStore.getState().actiefId!
    const ander = useProfielStore.getState().maakProfiel('Daan', 7, '🦉')
    useProfielStore.getState().kiesProfiel(ik)
    useProfielStore.getState().bewaarPartij('gewonnen', ander)
    const s = useProfielStore.getState()
    expect(s.gespeeld[ander]).toEqual({ gewonnen: 1, verloren: 0, remise: 0 })
    expect(s.gespeeld[ik] ?? { gewonnen: 0, verloren: 0, remise: 0 }).toEqual({ gewonnen: 0, verloren: 0, remise: 0 })
    expect(s.oefendagen[ander]?.aantal).toBe(1)
    expect(s.oefendagen[ik]).toBeUndefined()
  })

  it('werkt ook met opslag van voor deze teller (zonder oefendagen)', () => {
    // Zo ziet de toestand eruit bij een kind dat al speelde voordat de teller bestond:
    // de sleutel ontbreekt helemaal.
    const { oefendagen: _weg, ...zonder } = useProfielStore.getState()
    useProfielStore.setState(zonder as typeof leeg, true)
    expect(useProfielStore.getState().oefendagen).toBeUndefined()
    useProfielStore.getState().bewaarOefendag()
    expect(aantal()).toBe(1)
  })
})
