import { describe, expect, it } from 'vitest'
import { alleZinnen, controleerContent, controleerOpgave } from '@/content/validate'
import { ALLE_LESSEN, WERELDEN } from '@/content'
import { Game } from '@/engine/game'
import { parseBoard } from '@/engine/board'
import { goedeZetten } from '@/lesson/runner'

describe('de content', () => {
  it('bevat geen enkele fout', () => {
    const bevindingen = controleerContent()
    if (bevindingen.length) {
      console.error(bevindingen.map((b) => `- ${b.waar}: ${b.probleem}`).join('\n'))
    }
    expect(bevindingen).toEqual([])
  })

  it('heeft werelden op volgorde en met oplopende leeftijd', () => {
    const nummers = WERELDEN.map((w) => w.nummer)
    expect(nummers).toEqual([...nummers].sort((a, b) => a - b))
    const leeftijden = WERELDEN.map((w) => w.minLeeftijd)
    expect(leeftijden).toEqual([...leeftijden].sort((a, b) => a - b))
  })

  it('heeft genoeg lesstof', () => {
    // Ondergrenzen, geen exacte tellingen: dan hoeft deze test niet mee te groeien.
    // Het exacte pad wordt in wereld10-14.test.ts gecontroleerd.
    expect(WERELDEN.length).toBeGreaterThanOrEqual(10)
    expect(ALLE_LESSEN.length).toBeGreaterThanOrEqual(30)
  })

  it('levert een lijst zinnen op om in te spreken', () => {
    const zinnen = alleZinnen()
    expect(zinnen.length).toBeGreaterThan(100)
    expect(zinnen.every((z) => z.trim().length > 0)).toBe(true)
  })
})

/**
 * De vangrail zelf testen. De eerste review vond drie opgaven waarin het opgeschreven
 * antwoord niet klopte met de stelling, en alle drie kwamen ze ongehinderd door de
 * contentcontrole heen. Sinds die uitbreiding rekent de controle het antwoord na — en
 * deze tests bewaken dat die controle blijft werken.
 */
describe('de contentcontrole vangt verkeerde antwoorden', () => {
  it('ziet een aangewezen veld waar geen bedreigd stuk staat', () => {
    const bevindingen = controleerOpgave('test', {
      kind: 'tapSquares',
      fen: '8/8/8/3r4/8/3R4/8/6N1',
      correct: ['d5'], // dit is het zwarte stuk, niet het bedreigde witte
      bedoeling: { soort: 'bedreigd', kleur: 'w' },
      vraag: 'test',
    })
    expect(bevindingen).toHaveLength(1)
    expect(bevindingen[0].probleem).toContain('d3')
  })

  it('ziet dat een aangewezen koning helemaal geen koning is', () => {
    const bevindingen = controleerOpgave('test', {
      kind: 'tapSquares',
      fen: '4k3/8/8/8/8/8/8/4R1K1',
      correct: ['e1'], // daar staat de toren; de koning staat op g1
      bedoeling: { soort: 'geenSchaak' },
      vraag: 'test',
    })
    expect(bevindingen).toHaveLength(1)
    expect(bevindingen[0].probleem).toContain('g1')
  })

  it('ziet een "veilig" veld dat juist wordt aangevallen', () => {
    const bevindingen = controleerOpgave('test', {
      kind: 'move',
      fen: '8/8/8/3Q4/8/2n5/8/8',
      from: 'd5',
      goed: ['b5', 'd1', 'e4'], // precies de velden die het paard bestrijkt
      bedoeling: 'veilig',
      vraag: 'test',
    })
    expect(bevindingen).toHaveLength(1)
    expect(bevindingen[0].probleem).toContain('hoort er niet bij')
  })

  it('ziet dat er niet het duurste stuk gepakt wordt', () => {
    const bevindingen = controleerOpgave('test', {
      kind: 'move',
      fen: '8/8/3p4/8/r2Q4/8/8/8',
      from: 'd4',
      goed: ['d6'], // de pion, terwijl de toren op a4 meer waard is
      bedoeling: 'duurste',
      vraag: 'test',
    })
    expect(bevindingen).toHaveLength(1)
  })

  it('laat een kloppend antwoord met rust', () => {
    expect(
      controleerOpgave('test', {
        kind: 'tapSquares',
        fen: '8/8/8/3r4/8/3R4/8/6N1',
        correct: ['d3'],
        bedoeling: { soort: 'bedreigd', kleur: 'w' },
        vraag: 'test',
      }),
    ).toEqual([])
  })
})

/**
 * Vangrails uit de tweede review. Elke test hier hoort bij een bevinding die de
 * contentcontrole zelf niet zag — niet omdat hij een veld verkeerd narekende, maar
 * omdat er helemaal geen controle op stond.
 */
describe('vangrails uit de tweede review', () => {
  it('zet geen enkele stelling vanaf wereld 9 de speler zelf schaak', () => {
    const fout: string[] = []
    for (const les of ALLE_LESSEN) {
      const wereld = WERELDEN.find((w) => w.id === les.wereldId)!
      if (wereld.nummer < 9) continue
      for (const opgave of [...les.meedoen, ...les.zelf, ...les.toets]) {
        // Alleen de zetopgaven: bij een tik-opgave ("welke koning staat schaak?") is
        // schaak juist het onderwerp, en de tik-stellingen zijn meetkundig — daar
        // staat lang niet altijd een koning op.
        if (opgave.kind !== 'regelZet') continue
        const game = new Game(opgave.fen)
        const status = game.status()
        // uitSchaak is de ene eis die schaak juist nódig heeft.
        if (!status.over && status.check && opgave.eis !== 'uitSchaak') {
          fout.push(`${les.id}: wit staat schaak in ${opgave.fen}`)
        }
      }
    }
    expect(fout).toEqual([])
  })

  it('zet nergens een pion op rij 1 of rij 8', () => {
    const fout: string[] = []
    for (const les of ALLE_LESSEN) {
      for (const opgave of [...les.meedoen, ...les.zelf, ...les.toets]) {
        const fen = 'fen' in opgave ? opgave.fen : les.vertelFen
        if (!fen) continue
        const board = parseBoard(fen.split(' ')[0])
        for (const [sq, stuk] of Object.entries(board)) {
          if (stuk.type === 'p' && (sq[1] === '1' || sq[1] === '8')) {
            fout.push(`${les.id}: pion op ${sq}`)
          }
        }
      }
    }
    expect(fout).toEqual([])
  })

  it('vraagt vóór wereld 10 nergens naar mat', () => {
    const fout: string[] = []
    for (const les of ALLE_LESSEN) {
      const wereld = WERELDEN.find((w) => w.id === les.wereldId)!
      if (wereld.nummer >= 10) continue
      for (const opgave of [...les.meedoen, ...les.zelf, ...les.toets]) {
        if (opgave.kind !== 'quiz') continue
        // Als afleider mag het woord vallen — dat noemt iets zonder het te leren.
        // Wat niet mag is ernaar vrágen of het als goed antwoord rekenen.
        const goed = opgave.opties.find((o) => o.goed)?.label ?? ''
        const tekst = `${opgave.vraag} ${goed}`.toLowerCase()
        if (/\bmat\b|schaakmat/.test(tekst)) fout.push(`${les.id}: "${opgave.vraag}"`)
      }
    }
    expect(fout).toEqual([])
  })

  it('beloont bij geefSchaak geen zet die het stuk weggeeft', () => {
    // Dd8+ pakt niets en wordt door de koning opgegeten; Dd1+ is veilig.
    const game = new Game('4k3/8/8/8/8/8/3Q4/6K1 w - - 0 1')
    const goed = goedeZetten(game, 'geefSchaak').map((z) => z.san)
    expect(goed).toContain('Qe2+')
    expect(goed).not.toContain('Qd8+')
    expect(goed).not.toContain('Qd7+')
  })

  it('laat en passant alleen de en-passantzet door', () => {
    const game = new Game('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1')
    const goed = goedeZetten(game, 'enPassant')
    expect(goed.map((z) => z.san)).toEqual(['exd6'])
  })
})
