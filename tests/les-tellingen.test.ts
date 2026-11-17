import { describe, expect, it } from 'vitest'
import { doorgetiktKlasse, eenKeer, maakLastigMelder, maakStopMelder, maakUitlegMelder } from '@/lesson/lesTellingen'

/**
 * Wanneer het lesscherm "Opgave lastig" en "Les gestopt" telt. Achttiende review, C1:
 * niets legde vast dat er niet dubbel geteld wordt, en een dubbele telling zie je pas
 * weken later op het dashboard.
 */
describe('opgave lastig', () => {
  const opname = () => {
    const gemeld: string[] = []
    const m = maakLastigMelder((l, o, h) => gemeld.push(`${l} ${o} ${h}`))
    return { m, gemeld }
  }

  it('drie missers op het bord tellen één keer, ook bij een vierde en vijfde', () => {
    const { m, gemeld } = opname()
    for (let i = 0; i < 5; i++) m.misser('weide-1', 'zelf-1', 'tapSquares')
    expect(gemeld).toEqual(['weide-1 zelf-1 missers'])
  })

  it('twee missers zijn nog niet lastig, bij een quiz wel', () => {
    const { m, gemeld } = opname()
    m.misser('weide-1', 'zelf-1', 'tapSquares')
    m.misser('weide-1', 'zelf-1', 'tapSquares')
    expect(gemeld).toEqual([])
    m.misser('weide-2', 'toets-1', 'quiz')
    m.misser('weide-2', 'toets-1', 'quiz')
    expect(gemeld).toEqual(['weide-2 toets-1 missers'])
  })

  it('missers tellen per opgave, en een volgende opgave begint weer bij nul', () => {
    const { m, gemeld } = opname()
    m.misser('weide-1', 'zelf-1', 'tapSquares')
    m.misser('weide-1', 'zelf-1', 'tapSquares')
    m.misser('weide-1', 'zelf-2', 'tapSquares')
    expect(gemeld).toEqual([])
  })

  it('een hint telt één keer, en mag naast de missers van dezelfde opgave', () => {
    const { m, gemeld } = opname()
    for (let i = 0; i < 3; i++) m.misser('weide-1', 'zelf-1', 'tapSquares')
    m.hint('weide-1', 'zelf-1')
    m.hint('weide-1', 'zelf-1')
    expect(gemeld).toEqual(['weide-1 zelf-1 missers', 'weide-1 zelf-1 hint'])
  })

  it('dezelfde plek in een andere les is een andere opgave', () => {
    const { m, gemeld } = opname()
    m.hint('weide-1', 'meedoen-1')
    m.hint('weide-2', 'meedoen-1')
    expect(gemeld).toHaveLength(2)
  })
})

describe('les gestopt', () => {
  it('één keer, ook als een kind zeven keer van tab wisselt', () => {
    const gemeld: string[] = []
    const meld = maakStopMelder((f) => gemeld.push(f))
    for (let i = 0; i < 7; i++) meld('zelf')
    meld('toets')
    expect(gemeld).toEqual(['zelf'])
  })

  it('niet in de beloning: dan is de les af', () => {
    const gemeld: string[] = []
    maakStopMelder((f) => gemeld.push(f))('beloning')
    expect(gemeld).toEqual([])
  })
})

describe('eerste opgave', () => {
  it('telt één keer, ook bij elke volgende tik', () => {
    let keer = 0
    const tik = eenKeer(() => keer++)
    for (let i = 0; i < 5; i++) tik()
    expect(keer).toBe(1)
  })
})

/**
 * De uitleg (fase kijken): of afhaken aan Pips stem ligt. Eén melding per les, en
 * doortikken telt alleen als Pip echt hoorbaar praatte.
 */
describe('uitleg', () => {
  const opname = () => {
    const gemeld: string[] = []
    const m = maakUitlegMelder((e, z, d, s) => gemeld.push(`${e} ${z} ${d} ${s}`))
    return { m, gemeld }
  }

  it('uitgeluisterd tot het eind: één melding, ook als het kind daarna weggaat', () => {
    const { m, gemeld } = opname()
    m.verder(false)
    m.verder(false)
    m.klaar('verder', 3, true)
    m.klaar('weg', 3, true)
    expect(gemeld).toEqual(['verder 3 geen aan'])
  })

  it('weg bij zin 2 nadat het kind Pip onderbrak', () => {
    const { m, gemeld } = opname()
    m.verder(true)
    m.klaar('weg', 2, true)
    expect(gemeld).toEqual(['weg 2 meestal aan'])
  })

  it('doortikken in klassen', () => {
    expect(doorgetiktKlasse(0, 5)).toBe('geen')
    expect(doorgetiktKlasse(2, 5)).toBe('soms')
    expect(doorgetiktKlasse(3, 5)).toBe('meestal')
  })
})
