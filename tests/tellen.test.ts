import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { BOT, apparaatKlasse, dagenKlasse, duurKlasse, naKlasse, pad, tel, telScherm, zetTellen } from '@/progress/tellen'

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

  it('lessen vóór het profiel in klassen', () => {
    expect(naKlasse(0)).toBe('geen les')
    expect(naKlasse(1)).toBe('1 les')
    expect(naKlasse(7)).toBe('2 of meer')
    expect(naKlasse(0, true)).toBe('al een profiel')
  })

  it('binnen: alleen het scherm waarop het bezoek binnenkwam, tot het dat verlaat', async () => {
    vi.resetModules()
    zetSite('schaakmaatje.nl', '/les/weide-1/')
    const t = await import('@/progress/tellen')
    expect(t.isBinnenkomst('/les/weide-1/')).toBe(true)
    expect(t.isBinnenkomst('/les/toren-1/')).toBe(false)
    // Een pageview op hetzelfde scherm verandert niets...
    t.telScherm()
    expect(t.isBinnenkomst('/les/weide-1/')).toBe(true)
    // ...maar wie naar de kaart ging en terugkomt, kwam niet meer direct binnen.
    vi.stubGlobal('window', { location: { hostname: 'schaakmaatje.nl', pathname: '/kaart/', hash: '' } })
    t.telScherm()
    expect(t.isBinnenkomst('/les/weide-1/')).toBe(false)
  })

  it('binnen: een herladen pagina is geen binnenkomst', async () => {
    vi.resetModules()
    zetSite('schaakmaatje.nl', '/les/weide-1/')
    vi.stubGlobal('performance', { getEntriesByType: () => [{ type: 'reload' }] })
    const t = await import('@/progress/tellen')
    expect(t.isBinnenkomst('/les/weide-1/')).toBe(false)
  })

  it('nieuw of bekend apparaat: alleen of er al eens geoefend is', () => {
    expect(apparaatKlasse(0)).toBe('nieuw')
    expect(apparaatKlasse(1)).toBe('bekend')
    expect(apparaatKlasse(40)).toBe('bekend')
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
    // apparaat: nieuw|bekend (al eens geoefend op dit toestel), binnen: ja|nee (de les was
    // het eerste scherm van dit bezoek). Besloten door Kaj, november 2026.
    'Les begonnen': ['les', 'hervat', 'apparaat', 'binnen'],
    'Les af': ['les', 'sterren'],
    'Les gestopt': ['les', 'fase'],
    Partij: ['tegen', 'uitslag'],
    'Minispel rondje': ['spel', 'rondje'],
    Bezoek: ['geoefend'],
    Speelduur: ['duur'],
    'Profiel gemaakt': ['na'],
    'Eerste opgave': ['les'],
    'Opgave lastig': ['les', 'opgave', 'hulp'],
    // Alleen óf de knop iets doet: gedeeld/gekopieerd, op wereld af of diploma.
    Gedeeld: ['hoe', 'waar'],
    // Alleen óf het paard op de startpagina iemand naar de les brengt.
    'Held naar les': [],
    // Hoe Pip klonk op dit apparaat: opname of de robotstem van het toestel.
    Stem: ['bron'],
    // De uitleg: uitgeluisterd, doorgetikt of weggegaan, bij welke zin, stem aan of uit.
    Uitleg: ['les', 'einde', 'zin', 'doorgetikt', 'stem'],
    // Geluid aan of uit gezet, door een kind (bel) of een ouder (ouderscherm).
    Geluid: ['aan', 'door'],
    // Of een kind na een partij op "Wat zag Pip?" tikt, en welk soort moment het zag.
    Terugblik: ['soort'],
    // Of een bezoeker van een regelpagina doorklikt naar een les, met welke link, en of
    // er op het apparaat al eens geoefend is.
    'Regel naar les': ['onderwerp', 'plek', 'apparaat'],
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

  // Een telling die wel bewaard maar nergens getoond wordt, is een verzoek naar de teller
  // waar niemand iets aan heeft. 'Gedeeld', 'Held naar les' en 'Terugblik' stonden zo
  // weken in de dagbestanden (achtenzestigste review, conversie 1).
  it('elke telling staat ook op het dashboard', () => {
    const dashboard = readFileSync('public/teller/dashboard.php', 'utf8')
    for (const naam of Object.keys(TOEGESTAAN)) {
      expect(dashboard, `"${naam}" wordt bewaard maar niet getoond`).toContain(`'${naam}'`)
    }
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
