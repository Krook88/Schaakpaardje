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
    server = spawn('php', ['-S', `127.0.0.1:${POORT}`, '-t', www()], { stdio: 'ignore' })
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
    expect(bewaard()).toHaveLength(1)
  })

  it('een ingetypt pad wordt /onbekend/, en van een verwijzer alleen de sitenaam', async () => {
    await stuur({ name: 'pageview', url: '/ik-heet-daan/', referrer: 'https://www.google.com/search?q=daan' })
    const laatste = bewaard().at(-1)!
    expect(laatste.p).toBe('/onbekend/')
    expect(laatste.v).toBe('google.com')
  })

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
})
