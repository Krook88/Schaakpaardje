import { describe, expect, it } from 'vitest'
import { WERELDEN } from '@/content'
import type { Exercise } from '@/content/types'
import { Game } from '@/engine/game'
import { MINISPELLEN, zaad } from '@/play/minispellen'
import { antwoordQuiz, hint, mogelijkeVelden, startOpgave, tik, type OpgaveStand } from '@/lesson/runner'
import { korstePad } from '@/engine/puzzels'
import { parseBoard } from '@/engine/board'

/**
 * Het kind dat alleen doet wat Pip aanwijst.
 *
 * Pip belooft dat zijn hint altijd bij het antwoord eindigt: eerst een duwtje, daarna
 * het antwoord. Dat is de reden dat deze app geen overslaanknop heeft. Een kind dat
 * vastloopt drukt op "Help me even", en dan moet dat werken.
 *
 * Die belofte hield niet. In de zesde review bleek:
 *
 * - En passant (`pion-5`) kon niet: Pip wees de goede pion aan, het kind deed de goede
 *   zet en kreeg een kruisje. Les 24 van 49, en daarachter ging niets meer open.
 * - In het pionnenspel kon één op de zes rondjes nooit: een eigen pion in de lijn.
 * - In schaak-alarm wees de hint een promotie tot paard aan, terwijl de app altijd een
 *   dame maakt. Kruisje voor wat Pip net voordeed.
 * - In `toren-3` stuurde de hint de toren eindeloos tussen g1 en h1 heen en weer.
 *
 * Geen van vieren werd door de bestaande tests gezien, en om dezelfde reden: die
 * controleerden of er een antwoord bestaat (`goedeZetten`, de oplossers), niet of het
 * kind dat antwoord ook kan geven (`tik`). Dit bestand speelt elke opgave via precies
 * de functies die het scherm aanroept. Ook de minispellen, met veel zaden, want die
 * maken hun opgave zelf en de fout zit dan in één op de zoveel rondjes.
 */

type Uitslag = { ok: true } | { ok: false; reden: string }

export function volgPip(ruwe: Exercise): Uitslag {
  let s: OpgaveStand = startOpgave(ruwe)
  const o = s.opgave

  if (o.kind === 'quiz') {
    const goed = o.opties.filter((x) => x.goed).length
    if (goed !== 1) return { ok: false, reden: `quiz met ${goed} goede antwoorden` }
    const i = o.opties.findIndex((x) => x.goed)
    return antwoordQuiz(s, i).goed ? { ok: true } : { ok: false, reden: 'goede knop rekent fout' }
  }

  const doe = (veld: string, mag: string[]) => {
    const r = tik(s, veld)
    s = r.stand
    if (!mag.includes(r.uit)) throw new Error(`tik op ${veld} gaf '${r.uit}'`)
  }

  try {
    if (o.kind === 'tapSquares' || o.kind === 'tapMoves') {
      for (let n = 0; n < 80 && !s.klaar; n++) {
        const h = hint(s)
        s = h.stand
        if (!h.velden.length) return { ok: false, reden: 'het tipje wijst niets aan' }
        doe(h.velden[0], ['goed', 'klaar'])
      }
    } else if (o.kind === 'move' || o.kind === 'regelZet') {
      // Eerste hint: het stuk. Tweede hint: waar het heen moet.
      const een = hint(s)
      s = een.stand
      if (!een.velden.length) return { ok: false, reden: 'het tipje wijst geen stuk aan' }
      doe(een.velden[0], ['geselecteerd'])
      const twee = hint(s)
      s = twee.stand
      const doel = twee.velden.at(-1)
      if (!doel) return { ok: false, reden: 'het tweede tipje wijst geen veld aan' }
      doe(doel, ['klaar'])
    } else if (o.kind === 'reach' || o.kind === 'captureAll') {
      for (let n = 0; n < 40 && !s.klaar; n++) {
        const h = hint(s)
        s = h.stand
        if (!h.velden.length) return { ok: false, reden: `het tipje wijst niets aan na ${s.zetten} zetten` }
        if (!s.geselecteerd) doe(s.actiefStuk!, ['geselecteerd'])
        doe(h.velden[0], ['zet', 'sla', 'klaar'])
      }
    }
  } catch (e) {
    return { ok: false, reden: (e as Error).message }
  }
  return s.klaar ? { ok: true } : { ok: false, reden: 'nooit klaar' }
}

/**
 * Kan deze stelling in een echte partij voorkomen?
 *
 * Niet als de partij die níét aan zet is schaak staat: die had dan de vorige zet zijn
 * eigen koning in schaak laten staan. chess.js laat zo'n FEN gewoon door, want het
 * kijkt alleen naar wie er aan zet is. Zo kwamen er twee onmogelijke stellingen in de
 * matles terecht, en maakte mat-in-1-regen er in een derde van de rondjes een.
 *
 * Een stelling zonder "wie is aan zet" (de meeste lessen tekenen alleen de stukken)
 * is pas onmogelijk als beide koningen schaak staan. Staat er één schaak, dan is die
 * gewoon aan zet: zo laat `schaak-1` het kind zien wat schaak ís.
 */
export function onmogelijkeStelling(fen: string): boolean {
  const [plaatsing, aanZet] = fen.split(' ')
  if (!/k/.test(plaatsing) || !/K/.test(plaatsing)) return false
  const staatSchaak = (kleur: 'w' | 'b') => {
    try {
      return new Game(`${plaatsing} ${kleur} - - 0 1`).inCheck
    } catch {
      return false
    }
  }
  if (aanZet === 'w') return staatSchaak('b')
  if (aanZet === 'b') return staatSchaak('w')
  return staatSchaak('w') && staatSchaak('b')
}

const LESOPGAVEN = WERELDEN.flatMap((w) =>
  w.lessen.flatMap((les) =>
    (['meedoen', 'zelf', 'toets'] as const).flatMap((fase) =>
      les[fase].map((o, i) => ({ naam: `${les.id} ${fase}[${i}]`, o })),
    ),
  ),
)

/** Zaden per niveau. Genoeg om een fout van één op de honderd vrijwel zeker te zien. */
const ZADEN = 40

/**
 * Alle minispelrondjes, één keer gemaakt. Een paar spellen zoeken lang naar een goede
 * stelling (mat-in-1-regen rekent elke kandidaat door), en drie controles over
 * dezelfde rondjes zouden dat drie keer doen.
 */
const RONDJES = MINISPELLEN.flatMap((spel) =>
  [1, 2, 3, 4, 5, 6].flatMap((niveau) =>
    Array.from({ length: ZADEN }, (_, i) => ({
      spel: spel.id,
      naam: `${spel.id} niveau ${niveau} zaad ${i + 1}`,
      o: spel.maakOpgave(niveau, zaad(i + 1)),
    })),
  ),
)
const fen = (o: Exercise) => ('fen' in o ? o.fen : '')

describe('wie Pip volgt, komt er altijd uit', () => {
  it('in elke lesopgave', () => {
    const vast = LESOPGAVEN.map(({ naam, o }) => ({ naam, u: volgPip(o) }))
      .filter(({ u }) => !u.ok)
      .map(({ naam, u }) => `${naam}: ${(u as { reden: string }).reden}`)
    expect(vast).toEqual([])
  })

  it('in het schaak-alarm-rondje waar de hint een promotie tot paard aanwees', () => {
    // De app promoveert altijd tot dame. Wees Pip b8=N+ aan, dan werd het b8=Q, en dat
    // is in deze stelling geen schaak.
    const spel = MINISPELLEN.find((m) => m.id === 'schaak-alarm')!
    expect(volgPip(spel.maakOpgave(1, zaad(105)))).toEqual({ ok: true })
  })

  for (const spel of MINISPELLEN) {
    it(`in elk rondje ${spel.id}`, () => {
      const vast = RONDJES.filter((r) => r.spel === spel.id)
        .map((r) => ({ r, u: volgPip(r.o) }))
        .filter(({ u }) => !u.ok)
        .map(({ r, u }) => `${r.naam}: ${(u as { reden: string }).reden}  ${fen(r.o)}`)
      expect(vast.slice(0, 5)).toEqual([])
    })
  }
})

describe('elke stelling kan echt bestaan', () => {
  it('in de lessen', () => {
    const fout = LESOPGAVEN.filter(({ o }) => onmogelijkeStelling(fen(o))).map(
      ({ naam, o }) => `${naam}: ${fen(o)}`,
    )
    expect(fout).toEqual([])
  })

  it('in de minispellen', () => {
    const fout = RONDJES.filter(({ o }) => onmogelijkeStelling(fen(o))).map(
      ({ naam, o }) => `${naam}: ${fen(o)}`,
    )
    expect(fout.slice(0, 5)).toEqual([])
  })
})

/**
 * Een kind dat niet doet wat Pip zegt, mag ook niet vastlopen.
 *
 * De test hierboven volgt de hint en neemt dus nooit een omweg. Maar in `laatste-pion`
 * kon een pion schuin slaan, van zijn lijn raken en achter een eigen pion vast komen
 * te staan. Daarna: geen zet meer mogelijk, en een tipje dat niets aanwees. Hier wordt
 * bij elke loop-opgave elke zetreeks geprobeerd. Daarna moet het doel nog te halen
 * zijn, of de lesmotor moet zelf opnieuw beginnen.
 *
 * Met een pion vijf zetten diep, want die loopt maar één kant op en heeft weinig
 * keus. Met een ander stuk één zet: dat kan altijd dezelfde weg terug, dus vastlopen
 * kan daar alleen als er iets anders stuk is, en dat zie je dan bij de eerste zet al.
 */
describe('een omweg loopt nooit dood', () => {
  const doodlopend = (o: Exercise): string | null => {
    if (o.kind !== 'reach') return null
    const diepte = parseBoard(o.fen)[o.from]?.type === 'p' ? 5 : 1
    const zoek = (s: OpgaveStand, d: number, spoor: string[]): string | null => {
      const van = s.actiefStuk!
      for (const naar of mogelijkeVelden(s, van)) {
        const r = tik(tik(s, van).stand, naar)
        if (r.uit === 'klaar' || r.uit === 'opnieuw') continue
        const pad = [...spoor, `${van}-${naar}`]
        if (!korstePad(r.stand.board, naar, o.doel, 16)) return pad.join(' ')
        if (d > 1) {
          const dieper = zoek(r.stand, d - 1, pad)
          if (dieper) return dieper
        }
      }
      return null
    }
    return zoek(startOpgave(o), diepte, [])
  }

  it('in de lessen', () => {
    const fout = LESOPGAVEN.map(({ naam, o }) => [naam, doodlopend(o)] as const)
      .filter(([, d]) => d)
      .map(([naam, d]) => `${naam}: na ${d}`)
    expect(fout).toEqual([])
  })

  it('in de minispellen', () => {
    const fout = RONDJES.map((r) => ({ r, d: doodlopend(r.o) }))
      .filter(({ d }) => d)
      .map(({ r, d }) => `${r.naam}: na ${d}  ${fen(r.o)}`)
    expect(fout.slice(0, 5)).toEqual([])
  })
})
