import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { duurKlasse, tel, telScherm, zetTellen } from '@/progress/tellen'

/**
 * Wat er naar buiten gaat, ligt hier vast. De belofte aan ouders is: niets óver een
 * kind, alleen losse tellingen. Dus: geen hekje (daar staat bij spelen op afstand de
 * partij in), niets buiten schaakmaatje.nl, en niets als een ouder het uitzette.
 */
const verstuurd: { url: string; body: Record<string, unknown> }[] = []

function zetSite(hostname: string, pathname = '/les/toren-1/', hash = '') {
  const opslag = new Map<string, string>()
  vi.stubGlobal('window', { location: { hostname, pathname, hash } })
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => opslag.get(k) ?? null,
    setItem: (k: string, v: string) => void opslag.set(k, v),
    removeItem: (k: string) => void opslag.delete(k),
  })
}

beforeEach(() => {
  verstuurd.length = 0
  vi.stubGlobal('fetch', (url: string, init: { body: string }) => {
    verstuurd.push({ url, body: JSON.parse(init.body) })
    return Promise.resolve(new Response(null, { status: 202 }))
  })
})
afterEach(() => vi.unstubAllGlobals())

describe('anoniem tellen', () => {
  it('op schaakmaatje.nl gaat er een telling naar Plausible, met alleen pad en eigenschappen', () => {
    zetSite('schaakmaatje.nl')
    tel('Les af', { les: 'toren-1', sterren: 3 })
    expect(verstuurd).toHaveLength(1)
    expect(verstuurd[0].url).toBe('https://plausible.io/api/event')
    expect(verstuurd[0].body).toEqual({
      name: 'Les af',
      url: 'https://schaakmaatje.nl/les/toren-1/',
      domain: 'schaakmaatje.nl',
      props: { les: 'toren-1', sterren: 3 },
    })
  })

  it('het hekje met de partij van spelen op afstand gaat nooit mee', () => {
    zetSite('schaakmaatje.nl', '/spelen/afstand/', '#djF8...')
    telScherm()
    expect(JSON.stringify(verstuurd)).not.toContain('#')
    expect(verstuurd[0].body.url).toBe('https://schaakmaatje.nl/spelen/afstand/')
  })

  it('buiten de echte site (ontwikkeling, doorloop) gaat er niets weg', () => {
    zetSite('localhost')
    tel('Bezoek')
    telScherm()
    expect(verstuurd).toHaveLength(0)
  })

  it('als een ouder het uitzet, gaat er niets weg; weer aan, dan wel', () => {
    zetSite('schaakmaatje.nl')
    zetTellen(false)
    tel('Bezoek')
    expect(verstuurd).toHaveLength(0)
    zetTellen(true)
    tel('Bezoek')
    expect(verstuurd).toHaveLength(1)
  })

  it('speelduur in grove klassen, niet in seconden', () => {
    expect(duurKlasse(30_000)).toBe('minder dan 1 min')
    expect(duurKlasse(4 * 60_000)).toBe('1 tot 5 min')
    expect(duurKlasse(40 * 60_000)).toBe('30 min of meer')
  })
})
