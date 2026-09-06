import { describe, expect, it } from 'vitest'
import {
  isOntgrendeld,
  modusVoorLeeftijd,
  standaardInstellingen,
  volgendeOpenLes,
  STANDAARD_INSTELLINGEN,
  type LesResultaat,
  type Modus,
} from '@/progress/store'
import { ALLE_LESSEN, WERELDEN } from '@/content'
import { pipZinnen } from '@/content/voice'
import * as stem from '@/content/voice'

const LEEG: Record<string, LesResultaat> = {}
const MODI: Modus[] = ['pip', 'ontdekker', 'schaker']

/** De werelden waarvan de eerste les meteen open staat. */
const openWerelden = (modus: Modus) =>
  WERELDEN.filter((w) => isOntgrendeld(w.lessen[0].id, LEEG, modus)).map((w) => w.nummer)

describe('waar een profiel mag beginnen', () => {
  it('leidt de modus af uit de leeftijd', () => {
    expect(modusVoorLeeftijd(3)).toBe('pip')
    expect(modusVoorLeeftijd(5)).toBe('pip')
    expect(modusVoorLeeftijd(6)).toBe('ontdekker')
    expect(modusVoorLeeftijd(7)).toBe('ontdekker')
    expect(modusVoorLeeftijd(8)).toBe('schaker')
    expect(modusVoorLeeftijd(10)).toBe('schaker')
  })

  it('houdt voor de jongste groep alles bij het oude: strikt één les per keer', () => {
    expect(openWerelden('pip')).toEqual([0])
    // De tweede les van wereld 0 gaat pas open na twee sterren op de eerste.
    expect(isOntgrendeld(ALLE_LESSEN[1].id, LEEG, 'pip')).toBe(false)
  })

  it('zet voor een ontdekker de eerste drie werelden open', () => {
    expect(openWerelden('ontdekker')).toEqual([0, 1, 2])
  })

  it('zet voor een schaker alles tot en met Waardevallei open', () => {
    expect(openWerelden('schaker')).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  })

  it('opent nooit iets dat in de jongste modus dicht zat te blijven', () => {
    // Een oudere modus mag alleen méér openzetten, nooit minder. Anders zou een ouder
    // die de modus verzet voortgang kunnen "afsluiten" die het kind al had.
    for (const les of ALLE_LESSEN) {
      for (const modus of MODI) {
        if (isOntgrendeld(les.id, LEEG, 'pip')) {
          expect(isOntgrendeld(les.id, LEEG, modus), `${les.id} / ${modus}`).toBe(true)
        }
      }
    }
  })

  it('laat Matklif voor niemand vooruit opengaan', () => {
    // Het late uitstel van mat ís de methode (zie CLAUDE.md). Een leeftijdsknop hoort
    // dat niet te kunnen omzeilen, ook niet voor een tienjarige.
    const laat = WERELDEN.filter((w) => w.nummer >= 10)
    expect(laat.length).toBeGreaterThan(0)
    for (const wereld of laat) {
      for (const les of wereld.lessen) {
        for (const modus of MODI) {
          expect(isOntgrendeld(les.id, LEEG, modus), `${les.id} / ${modus}`).toBe(false)
        }
      }
    }
  })

  it('blijft de grote knop naar de eerste onafgemaakte les wijzen', () => {
    // Openzetten is niet overslaan: wie gewoon op "Verder leren" drukt loopt in elke
    // modus hetzelfde pad, ook als de kaart verder openstaat.
    for (const modus of MODI) {
      expect(volgendeOpenLes(LEEG, modus).id).toBe(ALLE_LESSEN[0].id)
    }
  })

  it('slaat een les over zodra hij twee sterren heeft, in elke modus', () => {
    const eerste: Record<string, LesResultaat> = {
      [ALLE_LESSEN[0].id]: { sterren: 2, fouten: 0, hints: 0, laatst: '' },
    }
    for (const modus of MODI) {
      expect(volgendeOpenLes(eerste, modus).id).toBe(ALLE_LESSEN[1].id)
    }
  })

  it('valt zonder modus terug op het strikt lineaire pad', () => {
    // Vergeet iemand het argument, dan wordt er niets extra opengezet.
    expect(isOntgrendeld(ALLE_LESSEN[1].id, LEEG)).toBe(false)
  })
})

describe('waarmee een profiel begint', () => {
  it('geeft de jongste groep rustiger spraak en geen coördinaten', () => {
    const i = standaardInstellingen('pip')
    expect(i.tempo).toBeLessThan(1)
    expect(i.coordinaten).toBe(false)
    expect(i.blunderWaarschuwing).toBe(true)
  })

  it('laat de middelste groep op de gewone stand staan', () => {
    expect(standaardInstellingen('ontdekker')).toEqual(STANDAARD_INSTELLINGEN)
  })

  it('geeft de oudste groep veldnamen en geen blunderwaarschuwing', () => {
    const i = standaardInstellingen('schaker')
    expect(i.coordinaten).toBe(true)
    expect(i.blunderWaarschuwing).toBe(false)
    expect(i.tempo).toBeGreaterThan(1)
  })

  it('houdt Pip in elke modus aan het praten', () => {
    // Spraak uitzetten voor een niet-lezer zou de app onbruikbaar maken; dat mag alleen
    // een ouder bewust doen.
    for (const modus of MODI) expect(standaardInstellingen(modus).spraak).toBe(true)
  })
})

describe('hoe Pip praat', () => {
  it('zegt tegen de oudste groep iets anders dan tegen de jongste', () => {
    const jong = pipZinnen(false)
    const oud = pipZinnen(true)
    for (const sleutel of Object.keys(jong) as (keyof typeof jong)[]) {
      expect(oud[sleutel], sleutel).not.toEqual(jong[sleutel])
    }
  })

  it('houdt geen kleuterwoorden over in de zinnen voor de oudste groep', () => {
    // "Hoppa", "joh" en "hoor" zijn precies goed voor een vierjarige en precies mis
    // voor een tienjarige: die hoort er iemand in die hem te jong inschat.
    const oud = Object.values(pipZinnen(true)).flat().join(' ')
    expect(oud).not.toMatch(/\b(hoppa|joh)\b/i)
    expect(oud).not.toMatch(/\bhoor[.!,]/i)
  })

  it('haalt beide sets uit geëxporteerde constanten, zodat ze ook ingesproken worden', () => {
    // scripts/tts-render.ts oogst alles wat content/voice.ts exporteert. Een zin die
    // hier rechtstreeks is ingetypt in plaats van uit een constante te komen, wordt dus
    // nooit opgenomen — en klinkt in de app als de robotstem tussen Pips eigen zinnen.
    const geexporteerd = new Set<string>()
    for (const waarde of Object.values(stem)) {
      if (typeof waarde === 'string') geexporteerd.add(waarde)
      else if (Array.isArray(waarde)) waarde.forEach((z) => typeof z === 'string' && geexporteerd.add(z))
    }
    const alles = [...Object.values(pipZinnen(false)).flat(), ...Object.values(pipZinnen(true)).flat()]
    expect(alles.length).toBeGreaterThan(30)
    for (const zin of alles) {
      expect(geexporteerd.has(zin), `staat niet in een export: "${zin}"`).toBe(true)
    }
  })
})
