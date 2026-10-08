import { describe, expect, it } from 'vitest'
import { antwoordQuiz, doelVelden, hint, startOpgave, sterrenVoor, tik } from '@/lesson/runner'
import type { Exercise } from '@/content/types'
import { lijn } from '@/content/velden'

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

describe('van gedachten veranderen', () => {
  // Uit de tweede review: een ander eigen stuk aantikken werd als fout geteld, en drie
  // van die misgrepen in de toetsfase houden de volgende les op slot. Precies het
  // tegenovergestelde van wat de app belooft.
  it('een ander eigen stuk aantikken wisselt de selectie in plaats van fout te rekenen', () => {
    const opgave: Exercise = {
      kind: 'move',
      fen: '8/8/8/8/8/8/8/R3K2R',
      from: 'a1',
      goed: ['a8'],
      vraag: 'Zet je toren naar boven.',
    }
    let stand = startOpgave(opgave)
    stand = tik(stand, 'a1').stand
    const gewisseld = tik(stand, 'e1') // de koning: ander eigen stuk
    expect(gewisseld.uit).toBe('geselecteerd')
    expect(gewisseld.stand.geselecteerd).toBe('e1')
    expect(gewisseld.stand.fouten).toBe(0)
  })

  it('werkt ook bij een opgave met de echte schaakregels', () => {
    const opgave: Exercise = {
      kind: 'regelZet',
      fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
      eis: 'rokeer',
      vraag: 'Rokeer.',
    }
    let stand = startOpgave(opgave)
    stand = tik(stand, 'a1').stand
    const gewisseld = tik(stand, 'e1')
    expect(gewisseld.uit).toBe('geselecteerd')
    expect(gewisseld.stand.fouten).toBe(0)
    // en daarna kan de rokade gewoon
    const gerokeerd = tik(gewisseld.stand, 'c1')
    expect(gerokeerd.uit).toBe('klaar')
  })

  it('een vijandelijk stuk aantikken blijft gewoon een zetpoging', () => {
    const opgave: Exercise = {
      kind: 'move',
      fen: '8/8/8/8/8/8/8/R2rK3',
      from: 'a1',
      goed: ['d1'],
      vraag: 'Sla de zwarte toren.',
    }
    let stand = startOpgave(opgave)
    stand = tik(stand, 'a1').stand
    expect(tik(stand, 'd1').uit).toBe('klaar')
  })
})

/**
 * Bevindingen uit de kinder-app-review.
 *
 * Allebei gaan ze over hetzelfde: een kind van vijf mag nooit klem komen te zitten.
 * Wie vastloopt en niet verder kan, legt de tablet weg en komt niet terug — en dat is
 * een ernstiger fout dan een verkeerd getekend vakje.
 */
describe('een kind kan nooit vastlopen', () => {
  it('wijst bij een zetopgave na de tweede hint het doelveld aan', () => {
    const opgave: Exercise = {
      kind: 'move',
      fen: '8/8/8/8/3R4/8/8/8',
      from: 'd4',
      goed: ['d8'],
      vraag: 'Zet de toren naar boven.',
    }
    let stand = startOpgave(opgave)
    const eerste = hint(stand)
    expect(eerste.velden).toEqual(['d4']) // eerst het stuk
    stand = eerste.stand
    const tweede = hint(stand)
    expect(tweede.velden).toEqual(['d8']) // daarna waar het heen moet
  })

  it('wijst bij een regelZet na de tweede hint ook het doelveld aan', () => {
    const opgave: Exercise = {
      kind: 'regelZet',
      fen: '4k3/8/8/8/8/8/8/R5K1 w - - 0 1',
      eis: 'geefSchaak',
      vraag: 'Geef schaak.',
    }
    let stand = startOpgave(opgave)
    const eerste = hint(stand)
    expect(eerste.velden).toHaveLength(1)
    stand = eerste.stand
    const tweede = hint(stand)
    expect(tweede.velden).toHaveLength(2)
    expect(tweede.velden[0]).toBe(eerste.velden[0])
  })

  it('geeft bij een tik-opgave elke hint een nieuw veld, tot ze op zijn', () => {
    const opgave: Exercise = {
      kind: 'tapSquares',
      fen: '8/8/8/8/8/8/8/8',
      correct: ['a1', 'b2', 'c3'],
      vraag: 'Tik de diagonaal aan.',
    }
    let stand = startOpgave(opgave)
    const gezien: string[] = []
    for (let i = 0; i < 3; i++) {
      const r = hint(stand)
      gezien.push(...r.velden)
      // het kind tikt het aangewezen veld ook echt aan
      stand = tik(r.stand, r.velden[0]).stand
    }
    expect(gezien).toEqual(['a1', 'b2', 'c3'])
  })
})

describe('opgaven met meer dan één goed antwoord', () => {
  const eenLijn: Exercise = {
    kind: 'tapSquares',
    fen: '8/8/8/8/8/8/8/8',
    correct: lijn('e'),
    varianten: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(lijn),
    vraag: 'Tik een lijn aan, van beneden naar boven.',
  }

  it('laat het kind zelf kiezen welke lijn het wordt', () => {
    // De c-lijn staat niet in `correct`, en was daarvoor dus acht keer fout.
    let stand = startOpgave(eenLijn)
    for (const veld of lijn('c')) {
      const r = tik(stand, veld)
      expect(r.uit).not.toBe('fout')
      stand = r.stand
    }
    expect(stand.klaar).toBe(true)
    expect(stand.fouten).toBe(0)
  })

  it('legt na de eerste tik vast welke lijn het is', () => {
    let stand = startOpgave(eenLijn)
    stand = tik(stand, 'c1').stand
    // b2 hoort bij geen enkele lijn die nog open staat.
    const r = tik(stand, 'b2')
    expect(r.uit).toBe('fout')
    expect(r.stand.fouten).toBe(1)
  })

  it('is pas klaar als de hele lijn er is, niet eerder', () => {
    let stand = startOpgave(eenLijn)
    for (const veld of lijn('h').slice(0, 7)) stand = tik(stand, veld).stand
    expect(stand.klaar).toBe(false)
    stand = tik(stand, 'h8').stand
    expect(stand.klaar).toBe(true)
  })

  it('wijst met een hint een veld aan dat nog open staat', () => {
    let stand = startOpgave(eenLijn)
    stand = tik(stand, 'g1').stand
    const r = hint(stand)
    expect(lijn('g')).toContain(r.velden[0])
    expect(r.velden[0]).not.toBe('g1')
  })

  it('houdt het aantal te vinden velden gelijk, welk antwoord je ook kiest', () => {
    // Anders klopt "3 van de 8 gevonden" niet meer zodra een kind de c-lijn pakt.
    for (const variant of eenLijn.kind === 'tapSquares' ? (eenLijn.varianten ?? []) : []) {
      expect(variant).toHaveLength(doelVelden(eenLijn).length)
    }
  })

  it('werkt gewoon als een opgave één antwoord heeft', () => {
    let stand = startOpgave(paardOpE5)
    expect(stand.varianten).toBeNull()
    const r = tik(stand, 'a1')
    expect(r.uit).toBe('fout')
  })
})
