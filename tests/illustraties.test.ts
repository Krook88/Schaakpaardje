import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { WERELDEN } from '../src/content'
import { kaartBeeld, pipBeeld, wapenBeeld } from '../src/ui/beelden'
import type { PipStemming } from '../src/ui/Pip'

/**
 * Elke wereld een wapen en twee kaartstroken, elke stemming twee Pips. Komt er een
 * wereld bij of wordt er een id hernoemd zonder te tekenen, dan staat er anders overal
 * een kapot plaatje (37e review). Tekenen: scripts/werelden-tekenen.py, pip-tekenen.py.
 */
const bestaat = (url: string) => existsSync(join(process.cwd(), 'public', url.replace(/^\//, '')))
const STEMMINGEN: PipStemming[] = ['blij', 'juicht', 'verrast', 'denkt', 'moedigt', 'trots', 'slaapt']

describe('illustraties', () => {
  it.each(WERELDEN.map((w) => w.id))('wereld %s heeft een wapen en twee kaartstroken', (id) => {
    expect(bestaat(wapenBeeld(id)), wapenBeeld(id)).toBe(true)
    expect(bestaat(kaartBeeld(id)), kaartBeeld(id)).toBe(true)
    expect(bestaat(kaartBeeld(id, true)), kaartBeeld(id, true)).toBe(true)
  })
  it.each(STEMMINGEN)('Pip %s bestaat, met en zonder voetstuk', (s) => {
    expect(bestaat(pipBeeld(s))).toBe(true)
    expect(bestaat(pipBeeld(s, true))).toBe(true)
  })
})
