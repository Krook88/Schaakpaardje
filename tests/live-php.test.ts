import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { AVATARS } from '@/progress/store'

/**
 * De brievenbus voor live spelen (public/live/), echt gedraaid met PHP's eigen webserver.
 *
 * Wat hier vastligt: alleen wie aan zet is mag zetten, een derde met de link kan alleen
 * kijken, er komt geen tekst van buiten in wat bewaard wordt, en oude partijen gaan weg.
 * Zonder PHP op de machine slaat deze test zich over; op GitHub staat PHP er.
 */
const heeftPhp = spawnSync('php', ['-v']).status === 0
const POORT = 8766
const BASIS = `http://127.0.0.1:${POORT}`

let server: ChildProcess
let map: string
const data = () => join(map, 'live-data')

const post = (body: unknown) =>
  fetch(`${BASIS}/live/index.php`, { method: 'POST', body: JSON.stringify(body) })
const json = async (body: unknown) => {
  const r = await post(body)
  return { status: r.status, body: r.status === 204 ? null : await r.json().catch(() => null) }
}

/** Een sleutel zoals de app hem maakt: 24 tekens uit dezelfde reeks als de server. */
const sleutel = (teken: string) => teken.repeat(24)
let volgnummer = 0
const nieuweSleutel = () => {
  const tekens = 'abcdefghjkmnpqrstuvwxyz23456789'
  volgnummer++
  return Array.from({ length: 24 }, (_, i) => tekens[(volgnummer * 7 + i * 13) % tekens.length]).join('')
}

async function nieuwePartij() {
  const a = await json({ doe: 'nieuw', plaatje: '🐴' })
  const zwart = nieuweSleutel()
  await json({ doe: 'meedoen', kamer: a.body.kamer, plaatje: '🦊', sleutel: zwart })
  return { kamer: a.body.kamer as string, wit: a.body.sleutel as string, zwart }
}

const bestand = (kamer: string) => join(data(), `partij-${kamer}.json`)
const leesPartij = (kamer: string) => JSON.parse(readFileSync(bestand(kamer), 'utf8'))
const schrijfPartij = (kamer: string, p: unknown) => writeFileSync(bestand(kamer), JSON.stringify(p))

describe('de plaatjes op de server zijn die van de app', () => {
  it('PLAATJES in index.php is AVATARS', () => {
    const php = readFileSync('public/live/index.php', 'utf8')
    const lijst = php.match(/const PLAATJES = \[(.*)\];/)![1]
    expect([...lijst.matchAll(/'([^']+)'/g)].map((m) => m[1])).toEqual([...AVATARS])
  })
})

describe.skipIf(!heeftPhp)('live spelen op de server', () => {
  beforeAll(async () => {
    map = mkdtempSync(join(tmpdir(), 'live-'))
    mkdirSync(data())
    cpSync('public/live', join(map, 'www', 'live'), { recursive: true })
    // Meer dan één werker: een kijkverzoek blijft wachten, en intussen moet een zet erdoor.
    server = spawn('php', ['-S', `127.0.0.1:${POORT}`, '-t', join(map, 'www')], {
      stdio: 'ignore',
      env: { ...process.env, LIVE_DATA: data(), PHP_CLI_SERVER_WORKERS: '6' },
    })
    for (let i = 0; i < 50; i++) {
      try {
        await fetch(`${BASIS}/live/index.php`)
        return
      } catch {
        await new Promise((r) => setTimeout(r, 100))
      }
    }
  })
  // De grens per afzender geldt hier voor alle tests samen (alles komt van 127.0.0.1).
  beforeEach(() => {
    for (const f of readdirSync(data(), { withFileTypes: true }).map((d) => d.name)) {
      if (/^(afzender|nieuw)-/.test(f)) rmSync(join(data(), f))
    }
  })
  afterAll(() => {
    server?.kill()
    rmSync(map, { recursive: true, force: true })
  })

  it('een partij beginnen, meedoen en om de beurt zetten', async () => {
    const { kamer, wit, zwart } = await nieuwePartij()
    expect(kamer).toMatch(/^[a-z2-9]{10}$/)
    expect((await json({ doe: 'zet', kamer, sleutel: wit, ronde: 1, na: 0, zet: 'e2e4' })).status).toBe(200)
    const z = await json({ doe: 'zet', kamer, sleutel: zwart, ronde: 1, na: 1, zet: 'e7e5' })
    expect(z.body).toMatchObject({ zetten: ['e2e4', 'e7e5'], wit: '🐴', zwart: '🦊', jij: 'b', ander: 'er' })
  })

  it('niet aan zet, of een zet op een oude stand: geen zet', async () => {
    const { kamer, wit, zwart } = await nieuwePartij()
    expect((await json({ doe: 'zet', kamer, sleutel: zwart, ronde: 1, na: 0, zet: 'e7e5' })).status).toBe(403)
    await json({ doe: 'zet', kamer, sleutel: wit, ronde: 1, na: 0, zet: 'e2e4' })
    // Twee keer dezelfde zet (een tweede tik, een herhaald verzoek) telt één keer.
    const dubbel = await json({ doe: 'zet', kamer, sleutel: wit, ronde: 1, na: 0, zet: 'e2e4' })
    expect(dubbel.status).toBe(409)
    expect(dubbel.body.stand.zetten).toEqual(['e2e4'])
  })

  it('wit kan niet zetten zolang er nog geen vriendje is', async () => {
    const a = await json({ doe: 'nieuw', plaatje: '🐴' })
    const r = await json({ doe: 'zet', kamer: a.body.kamer, sleutel: a.body.sleutel, ronde: 1, na: 0, zet: 'e2e4' })
    expect(r.status).toBe(403)
    expect((await json({ doe: 'kijk', kamer: a.body.kamer, sleutel: a.body.sleutel })).body.ander).toBe('nog-niet')
  })

  it('een derde met de link kan alleen kijken', async () => {
    const { kamer } = await nieuwePartij()
    const derde = await json({ doe: 'meedoen', kamer, plaatje: '🐻', sleutel: sleutel('k') })
    expect(derde.status).toBe(409)
    expect(derde.body.stand).toMatchObject({ jij: null, wit: '🐴', zwart: '🦊' })
    expect((await json({ doe: 'zet', kamer, sleutel: sleutel('k'), ronde: 1, na: 0, zet: 'e2e4' })).status).toBe(403)
    expect((await json({ doe: 'opnieuw', kamer, sleutel: sleutel('k'), ronde: 1 })).status).toBe(403)
  })

  it('hetzelfde plaatje als wit wordt een ander plaatje', async () => {
    const a = await json({ doe: 'nieuw', plaatje: '🐴' })
    const b = await json({ doe: 'meedoen', kamer: a.body.kamer, plaatje: '🐴', sleutel: nieuweSleutel() })
    expect(b.body.stand.zwart).not.toBe('🐴')
    expect(AVATARS).toContain(b.body.stand.zwart)
  })

  it('geen naam, tekst of rommel: alleen plaatjes en zetten', async () => {
    expect((await json({ doe: 'nieuw', plaatje: 'Daan' })).status).toBe(400)
    const { kamer, wit } = await nieuwePartij()
    expect((await json({ doe: 'zet', kamer, sleutel: wit, ronde: 1, na: 0, zet: 'Daan' })).status).toBe(400)
    expect((await json({ doe: 'kijk', kamer: '../../etc' })).status).toBe(400)
    expect((await json({ doe: 'kijk', kamer: 'abcdefghjk' })).status).toBe(404)
    // Wat er bewaard staat: plaatjes, zetten, sleutels, tijden. Geen IP-adres.
    const bestanden = readdirSync(data()).filter((f) => f.startsWith('partij-'))
    for (const f of bestanden) {
      const p = JSON.parse(readFileSync(join(data(), f), 'utf8'))
      expect(Object.keys(p).sort()).toEqual(['gezien', 'ronde', 'sleutels', 'vorige', 'wit', 'zetten', 'zwart'])
      expect(JSON.stringify(p)).not.toContain('127.0.0.1')
    }
  })

  it('nog een keer: zelfde link, kleuren gewisseld, en maar één nieuwe partij', async () => {
    const { kamer, wit, zwart } = await nieuwePartij()
    await json({ doe: 'zet', kamer, sleutel: wit, ronde: 1, na: 0, zet: 'e2e4' })
    const a = await json({ doe: 'opnieuw', kamer, sleutel: wit, ronde: 1 })
    const b = await json({ doe: 'opnieuw', kamer, sleutel: zwart, ronde: 1 })
    expect(a.body).toMatchObject({ ronde: 2, zetten: [], vorige: ['e2e4'], jij: 'b', wit: '🦊', zwart: '🐴' })
    expect(b.body).toMatchObject({ ronde: 2, zetten: [], jij: 'w' })
    // Wie zwart had, begint nu.
    expect((await json({ doe: 'zet', kamer, sleutel: zwart, ronde: 2, na: 0, zet: 'd2d4' })).status).toBe(200)
  })

  it('een partij waar een dag niets mee gebeurde, is weg', async () => {
    const { kamer } = await nieuwePartij()
    const oud = (Date.now() - 25 * 3600 * 1000) / 1000
    utimesSync(join(data(), `partij-${kamer}.json`), oud, oud)
    await json({ doe: 'nieuw', plaatje: '🐻' })
    expect((await json({ doe: 'kijk', kamer })).status).toBe(404)
  })

  it('meedoen is te herhalen: dezelfde sleutel nog eens geeft gewoon de stand', async () => {
    const a = await json({ doe: 'nieuw', plaatje: '🐴' })
    const z = nieuweSleutel()
    expect((await json({ doe: 'meedoen', kamer: a.body.kamer, plaatje: '🦊', sleutel: z })).status).toBe(200)
    const nogEens = await json({ doe: 'meedoen', kamer: a.body.kamer, plaatje: '🦊', sleutel: z })
    expect(nogEens.status).toBe(200)
    expect(nogEens.body.stand.jij).toBe('b')
    // Met de sleutel van wit meedoen als zwart kan niet.
    const b = await json({ doe: 'nieuw', plaatje: '🐴' })
    expect((await json({ doe: 'meedoen', kamer: b.body.kamer, plaatje: '🦊', sleutel: b.body.sleutel })).status).toBe(400)
  })

  it('opnieuw kan pas als er een vriendje is', async () => {
    const a = await json({ doe: 'nieuw', plaatje: '🐴' })
    expect((await json({ doe: 'opnieuw', kamer: a.body.kamer, sleutel: a.body.sleutel, ronde: 1 })).status).toBe(403)
  })

  it('wie twintig seconden niet keek, is even weg', async () => {
    const { kamer, wit } = await nieuwePartij()
    const p = leesPartij(kamer)
    p.gezien.b = Math.floor(Date.now() / 1000) - 30
    schrijfPartij(kamer, p)
    expect((await json({ doe: 'kijk', kamer, sleutel: wit })).body.ander).toBe('weg')
  })

  it('na zeshonderd zetten is het rommel: geen zet meer', async () => {
    const { kamer, wit } = await nieuwePartij()
    const p = leesPartij(kamer)
    p.zetten = Array.from({ length: 600 }, (_, i) => (i % 2 ? 'g8f6' : 'g1f3'))
    schrijfPartij(kamer, p)
    expect((await json({ doe: 'zet', kamer, sleutel: wit, ronde: 1, na: 600, zet: 'e2e4' })).status).toBe(409)
  })

  it('alleen POST, en niets groots', async () => {
    expect((await fetch(`${BASIS}/live/index.php`)).status).toBe(405)
    expect((await json({ doe: 'nieuw', plaatje: '🐴', rommel: 'x'.repeat(5000) })).status).toBe(400)
  })

  it('één afzender kan niet voor iedereen alle nieuwe partijen opmaken', async () => {
    for (let i = 0; i < 20; i++) expect((await json({ doe: 'nieuw', plaatje: '🐴' })).status).toBe(200)
    expect((await json({ doe: 'nieuw', plaatje: '🐴' })).status).toBe(429)
    // Wat er van de afzender bewaard wordt, is een hash: geen IP-adres.
    const namen = readdirSync(data()).filter((f) => f.startsWith('afzender-'))
    expect(namen.length).toBeGreaterThan(0)
    expect(namen.join()).not.toContain('127')
    for (const f of namen) expect(readFileSync(join(data(), f), 'utf8')).not.toContain('127')
  })

  it('voor iedereen samen hoogstens driehonderd nieuwe partijen per uur', async () => {
    const uur = new Date().toISOString().slice(0, 13).replace('T', '-')
    writeFileSync(join(data(), `nieuw-${uur}.txt`), 'x'.repeat(300))
    expect((await json({ doe: 'nieuw', plaatje: '🐴' })).status).toBe(429)
  })

  it('hoogstens vijfduizend partijen tegelijk', async () => {
    const nep = Array.from({ length: 5000 }, (_, i) => join(data(), `partij-nep${String(i).padStart(6, '0')}.json`))
    for (const f of nep) writeFileSync(f, '{}')
    try {
      expect((await json({ doe: 'nieuw', plaatje: '🐴' })).status).toBe(503)
    } finally {
      for (const f of nep) rmSync(f)
    }
  })

  it('long polling: een kijkverzoek wacht, en komt meteen terug zodra er gezet is', async () => {
    const { kamer, wit, zwart } = await nieuwePartij()
    const bekend = { ronde: 1, na: 0, zwart: true, ander: 'er' }
    const begon = Date.now()
    const wachten = json({ doe: 'kijk', kamer, sleutel: zwart, bekend })
    await new Promise((r) => setTimeout(r, 800))
    await json({ doe: 'zet', kamer, sleutel: wit, ronde: 1, na: 0, zet: 'e2e4' })
    const r = await wachten
    const duur = Date.now() - begon
    expect(r.body.zetten).toEqual(['e2e4'])
    expect(duur).toBeGreaterThanOrEqual(700)
    expect(duur).toBeLessThan(3000)
  })

  it('zonder "bekend" antwoordt kijken meteen', async () => {
    const { kamer, zwart } = await nieuwePartij()
    const begon = Date.now()
    await json({ doe: 'kijk', kamer, sleutel: zwart })
    expect(Date.now() - begon).toBeLessThan(500)
  })
})
