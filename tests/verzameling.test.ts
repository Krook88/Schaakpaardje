import { describe, expect, it } from 'vitest'
import { verzameling, perSoort, aantalBezit, geldigeStickers, stickerPlanken } from '@/progress/verzameling'
import { STALSTUKKEN } from '@/content/stal'
import { WERELDEN } from '@/content'
import type { LesResultaat } from '@/progress/store'

const af: LesResultaat = { sterren: 3, fouten: 0, hints: 0, laatst: '2026-09-01T00:00:00Z' }

/** Voortgang waarin de genoemde werelden helemaal uitgespeeld zijn. */
function metWerelden(...ids: string[]): Record<string, LesResultaat> {
  const uit: Record<string, LesResultaat> = {}
  for (const id of ids) {
    const wereld = WERELDEN.find((w) => w.id === id)!
    for (const les of wereld.lessen) uit[les.id] = af
  }
  return uit
}

describe('de verzameling in de stal', () => {
  it('geeft een leeg kind niets', () => {
    const v = verzameling({}, [])
    expect(v).toHaveLength(STALSTUKKEN.length)
    expect(aantalBezit(v)).toBe(0)
  })

  it('geeft het stuk van een wereld pas als die wereld helemaal uit is', () => {
    const bijna = metWerelden('toren')
    // één les weer weghalen
    const eerste = WERELDEN.find((w) => w.id === 'toren')!.lessen[0].id
    delete bijna[eerste]
    expect(verzameling(bijna, []).find((v) => v.id === 'stuk-toren')!.bezit).toBe(false)
    expect(verzameling(metWerelden('toren'), []).find((v) => v.id === 'stuk-toren')!.bezit).toBe(true)
  })

  it('geeft een maatje zodra je een keer van hem gewonnen hebt', () => {
    const v = verzameling({}, ['kiki'])
    expect(v.find((x) => x.id === 'maatje-kiki')!.bezit).toBe(true)
    expect(v.find((x) => x.id === 'maatje-bram')!.bezit).toBe(false)
  })

  it('geeft het bronzen hoefijzer pas als alle werelden tot en met pion uit zijn', () => {
    const tot5 = metWerelden('weide', 'toren', 'loper', 'dame', 'paard', 'koning')
    expect(verzameling(tot5, []).find((v) => v.id === 'hoefijzer-brons')!.bezit).toBe(false)
    const tot6 = metWerelden('weide', 'toren', 'loper', 'dame', 'paard', 'koning', 'pion')
    expect(verzameling(tot6, []).find((v) => v.id === 'hoefijzer-brons')!.bezit).toBe(true)
  })

  it('deelt de stal in drie planken van 6, 7 en 3', () => {
    const p = perSoort(verzameling({}, []))
    expect(p.stuk).toHaveLength(6)
    expect(p.maatje).toHaveLength(7)
    expect(p.hoefijzer).toHaveLength(3)
  })

  it('heeft nergens twee dezelfde id of hetzelfde teken', () => {
    const ids = STALSTUKKEN.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    const tekens = STALSTUKKEN.map((s) => s.teken)
    expect(new Set(tekens).size).toBe(tekens.length)
  })

  it('vertelt bij elk vak hoe je het krijgt', () => {
    for (const s of STALSTUKKEN) {
      expect(s.hoe.length).toBeGreaterThan(10)
      expect(s.naam.length).toBeGreaterThan(2)
    }
  })

  it('raakt niets kwijt: meer voortgang geeft nooit minder', () => {
    const weinig = verzameling(metWerelden('toren'), ['kiki'])
    const meer = verzameling(metWerelden('toren', 'loper'), ['kiki', 'mila'])
    expect(aantalBezit(meer)).toBeGreaterThan(aantalBezit(weinig))
    for (const v of weinig.filter((x) => x.bezit)) {
      expect(meer.find((x) => x.id === v.id)!.bezit).toBe(true)
    }
  })
})

describe('de stickers in de stal', () => {
  it('toont niets voor wie nog nergens begonnen is', () => {
    expect(stickerPlanken([], {})).toEqual([])
  })

  it('toont per begonnen wereld alle lessen, met het plaatje van de les', () => {
    const planken = stickerPlanken(['toren-1'], {
      'toren-1': { sterren: 3, fouten: 0, hints: 0, laatst: '' },
      'toren-2': { sterren: 2, fouten: 1, hints: 0, laatst: '' },
    })
    expect(planken.map((p) => p.wereld.id)).toEqual(['toren'])
    const toren = WERELDEN.find((w) => w.id === 'toren')!
    expect(planken[0].vakken.map((v) => v.id)).toEqual(toren.lessen.map((l) => l.id))
    expect(planken[0].vakken.filter((v) => v.bezit).map((v) => v.id)).toEqual(['toren-1'])
    expect(planken[0].vakken[0].teken).toBe(toren.lessen[0].icoon)
  })

  it('toont een wereld met alleen een sticker en geen voortgang, en houdt de volgorde van de reis', () => {
    const planken = stickerPlanken(['loper-1'], { 'weide-1': { sterren: 1, fouten: 4, hints: 0, laatst: '' } })
    expect(planken.map((p) => p.wereld.id)).toEqual(['weide', 'loper'])
    expect(planken[0].vakken.some((v) => v.bezit)).toBe(false)
    expect(planken[1].vakken.find((v) => v.id === 'loper-1')!.bezit).toBe(true)
  })

  it('telt geen stickers van lessen die niet bestaan', () => {
    expect(geldigeStickers(['toren-1', 'bestaat-niet'])).toEqual(['toren-1'])
  })
})
