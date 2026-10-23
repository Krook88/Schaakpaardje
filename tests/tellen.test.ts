import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { BOT, dagenKlasse, duurKlasse, pad, tel, telScherm, zetTellen } from '@/progress/tellen'

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
  it('op schaakmaatje.nl gaat er een telling naar de eigen teller, met alleen pad en eigenschappen', () => {
    zetSite('schaakmaatje.nl')
    tel('Les af', { les: 'toren-1', sterren: 3 })
    expect(verstuurd).toHaveLength(1)
    expect(verstuurd[0].url).toBe('/teller/index.php')
    expect(verstuurd[0].body).toEqual({
      name: 'Les af',
      url: '/les/toren-1/',
      props: { les: 'toren-1', sterren: 3 },
    })
  })

  it('het hekje met de partij van spelen op afstand gaat nooit mee', () => {
    zetSite('schaakmaatje.nl', '/spelen/afstand/', '#djF8...')
    telScherm()
    expect(JSON.stringify(verstuurd)).not.toContain('#')
    expect(verstuurd[0].body.url).toBe('/spelen/afstand/')
  })

  it('buiten de echte site (ontwikkeling, doorloop) gaat er niets weg', () => {
    zetSite('localhost')
    tel('Bezoek')
    telScherm()
    expect(verstuurd).toHaveLength(0)
  })

  it('een zoekmachine of geautomatiseerde browser telt niet mee', () => {
    zetSite('schaakmaatje.nl')
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' })
    tel('Les begonnen', { les: 'mat-1', hervat: 'nee' })
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 Chrome/130', webdriver: true })
    telScherm()
    expect(verstuurd).toHaveLength(0)
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Linux; Android 12; CUBOT KINGKONG 7) Chrome/130 Mobile' })
    tel('Bezoek', { geoefend: 'nog niet' })
    expect(verstuurd).toHaveLength(1)
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

  it('een zelf ingetypt adres gaat niet mee, alleen de schermen van de app', () => {
    expect(pad('/les/toren-1/')).toBe('/les/toren-1/')
    expect(pad('/')).toBe('/')
    expect(pad('/schaakregels/')).toBe('/schaakregels/')
    expect(pad('/schaakclub/')).toBe('/schaakclub/')
    expect(pad('/sitemap/')).toBe('/sitemap/')
    expect(pad('/schaakregels/en-passant/')).toBe('/schaakregels/en-passant/')
    expect(pad('/mijn-naam-is-daan/')).toBe('/onbekend/')
    expect(pad('/les/Daan Jansen/')).toBe('/onbekend/')
  })

  it('geoefende dagen in klassen', () => {
    expect(dagenKlasse(1)).toBe('1 dag')
    expect(dagenKlasse(4)).toBe('3 tot 5 dagen')
    expect(dagenKlasse(30)).toBe('meer dan 10 dagen')
  })
})

/**
 * Elke telling in de code, met de eigenschappen die meegaan, tegen een vaste lijst. Wie
 * er later iets bij zet, komt hier langs en moet zich afvragen of het iets over een kind
 * zegt. Een naam of iets wat een kind intypt hoort hier nooit bij.
 */
describe('wat er geteld wordt, ligt vast', () => {
  const TOEGESTAAN: Record<string, string[]> = {
    'Les begonnen': ['les', 'hervat'],
    'Les af': ['les', 'sterren'],
    'Les gestopt': ['les', 'fase'],
    Partij: ['tegen', 'uitslag'],
    'Minispel rondje': ['spel', 'rondje'],
    Bezoek: ['geoefend'],
    Speelduur: ['duur'],
    'Profiel gemaakt': [],
    'Opgave lastig': ['les', 'opgave', 'hulp'],
  }
  const bestanden = (map: string): string[] =>
    readdirSync(map).flatMap((n) => {
      const p = join(map, n)
      return statSync(p).isDirectory() ? bestanden(p) : /\.tsx?$/.test(n) ? [p] : []
    })

  it('alleen bekende tellingen met bekende eigenschappen', () => {
    const gevonden: string[] = []
    for (const f of bestanden('src')) {
      for (const m of readFileSync(f, 'utf8').matchAll(/\btel\('([^']+)'(?:,\s*\{([^}]*)\})?/g)) {
        const naam = m[1]
        gevonden.push(naam)
        expect(TOEGESTAAN, `onbekende telling "${naam}" in ${f}`).toHaveProperty([naam])
        const sleutels = (m[2] ?? '').split(',').map((d) => d.split(':')[0].trim()).filter(Boolean)
        for (const k of sleutels) expect(TOEGESTAAN[naam], `"${k}" bij "${naam}" in ${f}`).toContain(k)
      }
    }
    expect(gevonden.length).toBeGreaterThanOrEqual(Object.keys(TOEGESTAAN).length)
  })

  it('de app en de server herkennen dezelfde zoekmachines', () => {
    const php = readFileSync('public/teller/opslag.php', 'utf8').match(/const BOT = '#(.+)#i';/)?.[1]
    expect(php).toBe(BOT.source)
  })

  it('de app en de server kennen dezelfde schermen', () => {
    // Uit beide patronen het rijtje schermnamen halen: "les|lessen|kaart|...".
    const schermen = (tekst: string) => tekst.match(/\(\|\(([a-z|]+)\)/)?.[1].split('|').sort()
    const ts = schermen(readFileSync('src/progress/tellen.ts', 'utf8').split('const BEKEND')[1])
    const php = schermen(readFileSync('public/teller/opslag.php', 'utf8').split('const BEKEND_PAD')[1])
    expect(ts).toBeDefined()
    expect(php).toEqual(ts)
  })

  it('de teller op de server kent precies dezelfde lijst', () => {
    const php = readFileSync('public/teller/opslag.php', 'utf8')
    const blok = php.slice(php.indexOf('const TELLINGEN'), php.indexOf('];', php.indexOf('const TELLINGEN')))
    const server: Record<string, string[]> = {}
    for (const m of blok.matchAll(/'([^']+)' => \[([^\]]*)\]/g)) {
      server[m[1]] = [...m[2].matchAll(/'([^']+)'/g)].map((x) => x[1])
    }
    expect(server).toEqual({ pageview: [], ...TOEGESTAAN })
  })
})
