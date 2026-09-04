import { describe, expect, it } from 'vitest'
import { antwoordQuiz, doelVelden, hint, startOpgave, sterrenVoor, tik } from '@/lesson/runner'
import type { Exercise } from '@/content/types'

const paardOpE5: Exercise = {
  kind: 'tapMoves',
  fen: '8/8/8/4N3/8/8/8/8',
  from: 'e5',
  vraag: 'Waar kan het paard heen?',
}

describe('tik-opgaven', () => {
  it('rekent de goede velden uit de stelling uit', () => {
    expect(doelVelden(paardOpE5).sort()).toEqual(
      ['c4', 'c6', 'd3', 'd7', 'f3', 'f7', 'g4', 'g6'].sort(),
    )
  })

  it('telt goede tikken en sluit af als alles gevonden is', () => {
    let stand = startOpgave(paardOpE5)
    const doelen = doelVelden(paardOpE5)
    for (const [i, veld] of doelen.entries()) {
      const r = tik(stand, veld)
      stand = r.stand
      expect(r.uit).toBe(i === doelen.length - 1 ? 'klaar' : 'goed')
    }
    expect(stand.klaar).toBe(true)
    expect(stand.fouten).toBe(0)
  })

  it('telt een fout veld als fout, maar blokkeert niets', () => {
    const r = tik(startOpgave(paardOpE5), 'e6')
    expect(r.uit).toBe('fout')
    expect(r.stand.fouten).toBe(1)
    expect(r.stand.klaar).toBe(false)
  })

  it('negeert een veld dat al gevonden is', () => {
    const eerste = tik(startOpgave(paardOpE5), 'd7')
    const tweede = tik(eerste.stand, 'd7')
    expect(tweede.uit).toBe('genegeerd')
    expect(tweede.stand.fouten).toBe(0)
  })
})

describe('zet-opgaven', () => {
  const zet: Exercise = {
    kind: 'move',
    fen: '8/8/8/8/4R3/8/8/8',
    from: 'e4',
    goed: ['e8', 'e7', 'e6', 'e5'],
    vraag: 'Zet de toren omhoog.',
  }

  it('kiest eerst het stuk en dan het veld', () => {
    const gekozen = tik(startOpgave(zet), 'e4')
    expect(gekozen.uit).toBe('geselecteerd')
    const gezet = tik(gekozen.stand, 'e6')
    expect(gezet.uit).toBe('klaar')
    expect(gezet.stand.board['e6']).toEqual({ type: 'r', color: 'w' })
    expect(gezet.stand.board['e4']).toBeUndefined()
  })

  it('noemt een legale maar verkeerde zet fout', () => {
    const gekozen = tik(startOpgave(zet), 'e4')
    const fout = tik(gekozen.stand, 'a4')
    expect(fout.uit).toBe('fout')
    expect(fout.stand.klaar).toBe(false)
  })

  it('laat een onmogelijke zet niet toe', () => {
    const gekozen = tik(startOpgave(zet), 'e4')
    const fout = tik(gekozen.stand, 'd5') // schuin: dat kan de toren niet
    expect(fout.uit).toBe('fout')
  })
})

describe('loop naar de ster', () => {
  const parcours: Exercise = {
    kind: 'reach',
    fen: '8/8/8/8/8/8/8/N7',
    from: 'a1',
    doel: 'c5',
    maxZetten: 2,
    vraag: 'Spring naar de ster.',
  }

  it('is klaar zodra het stuk op de ster staat', () => {
    let stand = startOpgave(parcours)
    stand = tik(stand, 'a1').stand
    stand = tik(stand, 'b3').stand
    stand = tik(stand, 'b3').stand
    const laatste = tik(stand, 'c5')
    expect(laatste.uit).toBe('klaar')
  })

  it('begint opnieuw als het niet binnen het aantal zetten lukt', () => {
    let stand = startOpgave(parcours)
    stand = tik(stand, 'a1').stand
    stand = tik(stand, 'c2').stand
    stand = tik(stand, 'c2').stand
    const r = tik(stand, 'a3') // tweede zet, en nog niet op de ster
    expect(r.uit).toBe('opnieuw')
    expect(r.stand.board['a1']).toBeDefined()
    expect(r.stand.zetten).toBe(0)
  })
})

describe('hongerig paardje', () => {
  const happen: Exercise = {
    kind: 'captureAll',
    fen: '8/3p4/8/2p5/8/1p6/8/N7',
    from: 'a1',
    elkeZetRaak: true,
    vraag: 'Sla alle pionnen.',
  }

  it('eist dat elke zet raak is', () => {
    let stand = startOpgave(happen)
    stand = tik(stand, 'a1').stand
    const mis = tik(stand, 'c2') // legaal, maar slaat niets
    expect(mis.uit).toBe('fout')
  })

  it('is klaar als alle pionnen weg zijn', () => {
    let stand = startOpgave(happen)
    for (const [van, naar] of [['a1', 'b3'], ['b3', 'c5'], ['c5', 'd7']] as const) {
      stand = tik(stand, van).stand
      const r = tik(stand, naar)
      stand = r.stand
    }
    expect(stand.klaar).toBe(true)
  })
})

describe('hints en sterren', () => {
  it('geeft één veld tegelijk, niet het hele antwoord', () => {
    const h = hint(startOpgave(paardOpE5))
    expect(h.velden).toHaveLength(1)
    expect(doelVelden(paardOpE5)).toContain(h.velden[0])
    expect(h.stand.hints).toBe(1)
  })

  it('wijst bij een parcours het eerste veld van de route aan', () => {
    const h = hint(
      startOpgave({
        kind: 'reach',
        fen: '8/8/8/8/8/8/8/N7',
        from: 'a1',
        doel: 'c5',
        maxZetten: 2,
        vraag: '',
      }),
    )
    expect(['b3', 'c2']).toContain(h.velden[0])
  })

  it('geeft drie sterren voor foutloos en nooit nul', () => {
    expect(sterrenVoor(0, 0)).toBe(3)
    expect(sterrenVoor(2, 1)).toBe(2)
    expect(sterrenVoor(9, 9)).toBe(1)
  })

  it('rekent een quiz na', () => {
    const quiz: Exercise = {
      kind: 'quiz',
      vraag: 'Hoe loopt de toren?',
      opties: [{ label: 'recht', goed: true }, { label: 'schuin' }],
    }
    const goed = antwoordQuiz(startOpgave(quiz), 0)
    expect(goed.goed).toBe(true)
    expect(goed.stand.klaar).toBe(true)
    const fout = antwoordQuiz(startOpgave(quiz), 1)
    expect(fout.goed).toBe(false)
    expect(fout.stand.fouten).toBe(1)
  })
})
