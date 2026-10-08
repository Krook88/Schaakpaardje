import { describe, expect, it } from 'vitest'
import { kiesOpfrisopgaven, RIJPINGSDAGEN, urgentie, type Voortgang } from '@/lesson/opfrisser'
import { ALLE_LESSEN } from '@/content'

const DAG = 24 * 60 * 60 * 1000
const NU = Date.parse('2026-09-05T12:00:00Z')

/** Een les die `dagen` geleden gedaan is, met zoveel fouten en hints. */
function gedaan(dagen: number, fouten = 0, hints = 0) {
  return { sterren: 3, fouten, hints, laatst: new Date(NU - dagen * DAG).toISOString() }
}

describe('wat er opgefrist moet worden', () => {
  it('laat een les die net gedaan is met rust', () => {
    expect(urgentie(gedaan(0), NU)).toBe(0)
    expect(urgentie(gedaan(RIJPINGSDAGEN - 0.1), NU)).toBe(0)
  })

  it('vindt een les urgenter naarmate hij langer geleden is', () => {
    expect(urgentie(gedaan(30), NU)).toBeGreaterThan(urgentie(gedaan(10), NU))
  })

  it('vindt een les die moeite kostte urgenter dan een les die vlekkeloos ging', () => {
    // Even lang geleden, maar de ene ging met vallen en opstaan.
    expect(urgentie(gedaan(10, 4, 2), NU)).toBeGreaterThan(urgentie(gedaan(10, 0, 0), NU))
  })

  it('geeft niets terug als er nog niets rijp is', () => {
    const voortgang: Voortgang = { 'weide-1': gedaan(1), 'weide-2': gedaan(0) }
    expect(kiesOpfrisopgaven(voortgang, NU)).toEqual([])
  })

  it('geeft niets terug voor een kind dat nog niets heeft gedaan', () => {
    expect(kiesOpfrisopgaven({}, NU)).toEqual([])
  })

  it('pakt hoogstens drie opgaven, elk uit een andere les', () => {
    const voortgang: Voortgang = {}
    for (const les of ALLE_LESSEN.slice(0, 10)) voortgang[les.id] = gedaan(20)
    const ronde = kiesOpfrisopgaven(voortgang, NU)
    expect(ronde).toHaveLength(3)
    expect(new Set(ronde.map((o) => o.lesId)).size).toBe(3)
  })

  it('zet de lastigste les vooraan', () => {
    const voortgang: Voortgang = {
      'weide-1': gedaan(10, 0, 0),
      'weide-2': gedaan(10, 6, 3), // hier ging het mis
      'weide-3': gedaan(10, 1, 0),
    }
    expect(kiesOpfrisopgaven(voortgang, NU)[0].lesId).toBe('weide-2')
  })

  it('kiest binnen één dag steeds dezelfde opgaven', () => {
    const voortgang: Voortgang = { 'weide-1': gedaan(20), 'weide-2': gedaan(20) }
    const a = kiesOpfrisopgaven(voortgang, NU)
    const b = kiesOpfrisopgaven(voortgang, NU + 60 * 1000)
    expect(b.map((o) => o.opgave)).toEqual(a.map((o) => o.opgave))
  })

  it('kiest op een andere dag andere opgaven', () => {
    // Alle lessen even oud, zodat alleen de dag het verschil kan maken.
    const voortgang: Voortgang = {}
    for (const les of ALLE_LESSEN) voortgang[les.id] = gedaan(20)
    const vandaag = kiesOpfrisopgaven(voortgang, NU)
    let anders = false
    for (let d = 1; d <= 7 && !anders; d++) {
      const later = kiesOpfrisopgaven(voortgang, NU + d * DAG)
      if (later.some((o, i) => o.opgave !== vandaag[i]?.opgave)) anders = true
    }
    expect(anders).toBe(true)
  })

  it('levert alleen opgaven die de lesmotor aankan', () => {
    const voortgang: Voortgang = {}
    for (const les of ALLE_LESSEN) voortgang[les.id] = gedaan(20)
    // Over een jaar heen kijken: dan komt vrijwel elke les een keer langs.
    const gezien = new Set<string>()
    for (let d = 0; d < 365; d++) {
      for (const o of kiesOpfrisopgaven(voortgang, NU + d * DAG)) {
        expect(o.opgave.kind).toBeTruthy()
        expect(o.icoon.length).toBeGreaterThan(0)
        gezien.add(o.lesId)
      }
    }
    expect(gezien.size).toBeGreaterThan(0)
  })
})
