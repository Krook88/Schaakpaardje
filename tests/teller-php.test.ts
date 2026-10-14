import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * De teller op de server (public/teller/), echt gedraaid met PHP's eigen webserver.
 *
 * Wat hier vastligt: alleen tellingen van de vaste lijst komen binnen, er staat geen
 * IP-adres of tekst van buiten in wat bewaard wordt, en het dashboard zit achter een
 * wachtwoord. Zonder PHP op de machine slaat deze test zich over; op GitHub staat PHP er.
 */
const heeftPhp = spawnSync('php', ['-v']).status === 0
const POORT = 8765
const BASIS = `http://127.0.0.1:${POORT}`

let server: ChildProcess
let map: string
const www = () => join(map, 'www')
const dataMap = () => join(map, 'teller-data')

const stuur = (body: unknown) =>
  fetch(`${BASIS}/teller/index.php`, { method: 'POST', body: JSON.stringify(body) })

function bewaard(): Record<string, unknown>[] {
  return readdirSync(dataMap()).flatMap((f) =>
    readFileSync(join(dataMap(), f), 'utf8').trim().split('\n').filter(Boolean).map((r) => JSON.parse(r)),
  )
}

describe.skipIf(!heeftPhp)('de teller op de server', () => {
  beforeAll(async () => {
    map = mkdtempSync(join(tmpdir(), 'teller-'))
    cpSync('public/teller', join(www(), 'teller'), { recursive: true })
    // Krap geheugen, zoals op goedkope hosting: het dashboard moet volle dagbestanden aankunnen.
    server = spawn('php', ['-d', 'memory_limit=32M', '-S', `127.0.0.1:${POORT}`, '-t', www()], { stdio: 'ignore' })
    for (let i = 0; i < 50; i++) {
      try {
        await fetch(`${BASIS}/teller/index.php`)
        return
      } catch {
        await new Promise((r) => setTimeout(r, 100))
      }
    }
  })
  afterAll(() => {
    server?.kill()
    rmSync(map, { recursive: true, force: true })
  })

  it('een geldige telling wordt bewaard, zonder IP-adres en met alleen het uur', async () => {
    const r = await stuur({ name: 'Les af', url: '/les/toren-1/', props: { les: 'toren-1', sterren: 3 } })
    expect(r.status).toBe(204)
    const regels = bewaard()
    expect(regels).toHaveLength(1)
    expect(Object.keys(regels[0]).sort()).toEqual(['e', 'n', 'p', 'u'])
    expect(regels[0]).toMatchObject({ n: 'Les af', p: '/les/toren-1/', e: { les: 'toren-1', sterren: 3 } })
    expect(JSON.stringify(regels)).not.toContain('127.0.0.1')
  })

  it('weigert een onbekende telling, eigenschap of waarde met tekst erin', async () => {
    expect((await stuur({ name: 'Naam', url: '/' })).status).toBe(400)
    expect((await stuur({ name: 'Les af', url: '/', props: { naam: 'daan' } })).status).toBe(400)
    expect((await stuur({ name: 'Les af', url: '/', props: { les: 'Daan Jansen' } })).status).toBe(400)
    expect((await stuur({ name: 'Les af', url: '/', props: { les: { x: 1 } } })).status).toBe(400)
    // Precies de eigenschappen van de lijst: niet minder, anders vervuilt een "les ?" de tabel.
    expect((await stuur({ name: 'Les af', url: '/' })).status).toBe(400)
    expect((await stuur({ name: 'Les af', url: '/', props: { les: 'toren-1' } })).status).toBe(400)
    expect(bewaard()).toHaveLength(1)
  })

  it('een ingetypt pad wordt /onbekend/, en van een verwijzer alleen de sitenaam', async () => {
    await stuur({ name: 'pageview', url: '/ik-heet-daan/', referrer: 'https://www.google.com/search?q=daan' })
    const laatste = bewaard().at(-1)!
    expect(laatste.p).toBe('/onbekend/')
    expect(laatste.v).toBe('google.com')
  })

  // Let op: `php -S` leest geen .htaccess. De 403 hieronder komt van de eigen controle in
  // opslag.php; of Apache de map dichthoudt, controleert de publiceer-workflow op de echte site.
  it('alleen POST, en opslag.php is niet los te openen', async () => {
    expect((await fetch(`${BASIS}/teller/index.php`)).status).toBe(405)
    expect((await fetch(`${BASIS}/teller/opslag.php`)).status).toBe(403)
  })

  it('het dashboard vraagt een wachtwoord en toont dan de tellingen', async () => {
    const zonder = await (await fetch(`${BASIS}/teller/dashboard.php`)).text()
    expect(zonder).toContain('nog geen wachtwoord')

    const hash = spawnSync('php', ['-r', 'echo password_hash("proef-wachtwoord", PASSWORD_DEFAULT);']).stdout.toString()
    writeFileSync(join(www(), 'teller', 'wachtwoord.php'), `<?php return '${hash}';\n`)

    const dicht = await (await fetch(`${BASIS}/teller/dashboard.php`)).text()
    expect(dicht).toContain('type="password"')
    expect(dicht).not.toContain('toren-1')

    const inloggen = await fetch(`${BASIS}/teller/dashboard.php`, {
      method: 'POST',
      body: new URLSearchParams({ wachtwoord: 'proef-wachtwoord' }),
      redirect: 'manual',
    })
    const koekje = (inloggen.headers.get('set-cookie') ?? '').split(';')[0]
    expect(koekje).toMatch(/^teller=/)
    const open = await (await fetch(`${BASIS}/teller/dashboard.php`, { headers: { cookie: koekje } })).text()
    expect(open).toContain('Lessen: waar haken kinderen af?')
    expect(open).toContain('toren-1')
  })

  it('raden wordt afgeremd: na 10 mislukte pogingen in een uur gaat niemand er meer in', async () => {
    const pogingen = join(dataMap(), `pogingen-${new Date().toISOString().slice(0, 13).replace('T', '-')}.txt`)
    writeFileSync(pogingen, 'x'.repeat(10))
    const r = await fetch(`${BASIS}/teller/dashboard.php`, {
      method: 'POST',
      body: new URLSearchParams({ wachtwoord: 'proef-wachtwoord' }),
      redirect: 'manual',
    })
    expect(await r.text()).toContain('Te veel mislukte pogingen')
    rmSync(pogingen)
  })

  it('het dashboard werkt ook als iemand de dagbestanden heeft volgeschreven', async () => {
    const regel = JSON.stringify({ u: '08', n: 'Bezoek', p: '/', e: { geoefend: '1 dag' } }) + '\n'
    const vol = regel.repeat(Math.ceil((1024 * 1024) / regel.length))
    for (let i = 0; i < 30; i++) {
      const dag = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      writeFileSync(join(dataMap(), `dag-${dag}.ndjson`), vol)
    }
    const inloggen = await fetch(`${BASIS}/teller/dashboard.php`, {
      method: 'POST',
      body: new URLSearchParams({ wachtwoord: 'proef-wachtwoord' }),
      redirect: 'manual',
    })
    const koekje = (inloggen.headers.get('set-cookie') ?? '').split(';')[0]
    const r = await fetch(`${BASIS}/teller/dashboard.php?dagen=30`, { headers: { cookie: koekje } })
    expect(r.status).toBe(200)
    expect(await r.text()).toContain('Verloop per dag')
    // En een vol dagbestand neemt niets meer aan.
    expect((await stuur({ name: 'Bezoek', url: '/', props: { geoefend: '1 dag' } })).status).toBe(507)
  }, 30000)
})
