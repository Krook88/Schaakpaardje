import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { WERELDEN } from '../src/content'
import { botBeeld, icoonBeeld, kaartBeeld, lesIcoon, pipBeeld, pipLos, wapenBeeld, type IcoonNaam } from '../src/ui/beelden'
import type { PipStemming } from '../src/ui/Pip'
import { BOTS } from '../src/engine/bots'

/**
 * Elke wereld een wapen en twee kaartstroken, elke stemming twee Pips. Komt er een
 * wereld bij of wordt er een id hernoemd zonder te tekenen, dan staat er anders overal
 * een kapot plaatje (37e review). Tekenen: scripts/werelden-tekenen.py, pip-tekenen.py.
 */
const bestaat = (url: string) => existsSync(join(process.cwd(), 'public', url.replace(/^\//, '')))
const STEMMINGEN: PipStemming[] = ['blij', 'juicht', 'verrast', 'denkt', 'moedigt', 'trots', 'slaapt']

describe('illustraties', () => {
  // Een bot zonder tekening gaf stil een kapot plaatje met alt="" (codebase-review).
  it.each(BOTS.map((b) => b.id))('bot %s heeft een tekening (scripts/bots-tekenen.py)', (id) => {
    expect(bestaat(botBeeld(id)), botBeeld(id)).toBe(true)
  })

  it.each(WERELDEN.map((w) => w.id))('wereld %s heeft een wapen en twee kaartstroken', (id) => {
    expect(bestaat(wapenBeeld(id)), wapenBeeld(id)).toBe(true)
    expect(bestaat(kaartBeeld(id)), kaartBeeld(id)).toBe(true)
    expect(bestaat(kaartBeeld(id, true)), kaartBeeld(id, true)).toBe(true)
  })
  it.each(STEMMINGEN)('Pip %s bestaat, met voetstuk, als knop en los', (s) => {
    expect(bestaat(pipBeeld(s))).toBe(true)
    expect(bestaat(pipBeeld(s, true))).toBe(true)
    expect(bestaat(pipLos(s))).toBe(true)
  })
  it.each(WERELDEN.flatMap((w) => w.lessen.map((l) => l.id)))('les %s heeft een icoon', (id) => {
    expect(bestaat(lesIcoon(id)), lesIcoon(id)).toBe(true)
  })
  const VAST: IcoonNaam[] = ['minispel', 'slot', 'beker', 'sticker', 'deel', 'hint', 'geluid', 'instellingen', 'bel', 'bel-uit', 'ster-vol', 'ster-leeg', 'medaille-brons', 'medaille-zilver', 'medaille-goud',
    'fase-kijken', 'fase-meedoen', 'fase-zelf', 'fase-toets', 'punt-voorlezen', 'punt-begint-bij-nul', 'punt-niet-verliezen']
  it.each(VAST)('icoon %s bestaat', (n) => {
    expect(bestaat(icoonBeeld(n))).toBe(true)
  })
})
