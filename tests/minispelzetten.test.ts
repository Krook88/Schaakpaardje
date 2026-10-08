import { describe, expect, it } from 'vitest'
import { MINISPELLEN } from '@/play/minispellen'
import { Game } from '@/engine/game'
import { isLightSquare, parseBoard } from '@/engine/board'

/**
 * Is elke zet die een minispel goedkeurt ook volgens de echte regels toegestaan?
 *
 * `tactiekduel` zocht zijn vork met de meetkundige motor, en die kent geen penning.
 * Stond het witte paard tussen de eigen koning en een zwarte toren, dan was het enige
 * goede antwoord een zet die de eigen koning in schaak zet — en zei Pip er "precies
 * goed" bij. Ongeveer één op de dertig stellingen. Gevonden in de vijfde review.
 *
 * Voorbeeld: 8/8/8/8/8/2r5/7k/K1N3r1 met "val met je paard twee stukken tegelijk aan"
 * en Nc1–e2 als enige goede zet. De toren op g1 pent het paard tegen a1.
 *
 * Dit is het ergste soort fout die deze app kan maken: een kind leert iets wat het bij
 * de club weer moet afleren. Vandaar dat de test niet één spel controleert maar alle
 * spellen die een zet vragen — ook de spellen die vandaag schoon zijn, want de volgende
 * variant hiervan komt uit een spel dat er nu nog niet is.
 */

/** Voorspelbare random, zodat een omgevallen test te herhalen is. */
function zaadje(n: number) {
  let x = n * 2654435761 + 1
  return () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff
    return x / 0x7fffffff
  }
}

describe('elke goedgekeurde zet mag ook echt', () => {
  it('geen enkel minispel biedt een illegale zet aan', () => {
    const klachten: string[] = []
    let bekeken = 0
    for (const spel of MINISPELLEN) {
      for (let niveau = 1; niveau <= 6; niveau++) {
        // Veertig zaden per niveau. Tactiekduel faalde op 3% van de stellingen, dus
        // een terugval geeft hier zo'n zeven treffers — ruim genoeg om op te vallen.
        for (let zaad = 0; zaad < 40; zaad++) {
          const opgave = spel.maakOpgave(niveau, zaadje(zaad * 131 + niveau))
          if (opgave.kind !== 'move' || !('goed' in opgave) || !opgave.goed) continue

          // Zonder witte koning kán er geen penning zijn, en dan is de meetkundige
          // motor gewoon goed. Dat is geen mazen zoeken maar precies de afspraak uit
          // CLAUDE.md: `weegschaal` en `red-je-stuk` zetten met opzet geen koningen
          // neer, en chess.js weigert zo'n stelling terecht. Waar wél een koning
          // staat, gelden de echte regels — en dáár ging het mis.
          if (!/K/.test(opgave.fen)) continue
          bekeken++

          let spelregels: Game
          try {
            spelregels = new Game(`${opgave.fen} w - - 0 1`)
          } catch {
            klachten.push(`${spel.id}: chess.js neemt de stelling niet aan — ${opgave.fen}`)
            continue
          }
          const mag = new Set(spelregels.legalMoves(opgave.from).map((m) => m.to))
          const niet = opgave.goed.filter((naar) => !mag.has(naar))
          if (niet.length) {
            klachten.push(
              `${spel.id}: ${opgave.from}→${niet.join(',')} mag niet — ${opgave.fen}`,
            )
          }
        }
      }
    }
    // Zou het genereren ooit stilvallen, dan is een lege lijst geen goed nieuws.
    expect(bekeken).toBeGreaterThan(200)
    expect(klachten.slice(0, 5)).toEqual([])
  })
})

/**
 * En het aanwijsspel van wereld 0: klopt het antwoord bij de vraag?
 *
 * Dit spel vroeg tot de vijfde review om "alle torens", "alle dames" en "alle paarden"
 * — drie woorden die wereld 0 sinds de herschrijving van weide-3 nergens meer uitlegt,
 * in een spel dat vanaf drie jaar altijd openstaat. Het vraagt nu naar licht, donker en
 * de boven- en onderrij: precies wat die wereld wél behandelt.
 *
 * De vraag en het antwoord worden op twee verschillende plekken bepaald, dus rekenen we
 * het antwoord hier zelf na in plaats van het te geloven. Dat is niet overdreven: mijn
 * eigen noodgeval zette een stuk op c4 als "donker veld", en c4 is licht.
 */
describe('het aanwijsspel van wereld 0', () => {
  const proef = (n: number) => {
    let x = n * 2654435761 + 1
    return () => {
      x = (x * 1103515245 + 12345) & 0x7fffffff
      return x / 0x7fffffff
    }
  }
  const bijVraag: Record<string, (sq: string) => boolean> = {
    'Tik alle stukken aan die op een licht veld staan.': (sq) => isLightSquare(sq as never),
    'Tik alle stukken aan die op een donker veld staan.': (sq) => !isLightSquare(sq as never),
    'Tik alle stukken aan die op de onderste rij staan.': (sq) => sq[1] === '1',
    'Tik alle stukken aan die op de bovenste rij staan.': (sq) => sq[1] === '8',
  }

  it('het antwoord hoort altijd bij de vraag, en is nooit leeg of alles', () => {
    const spel = MINISPELLEN.find((s) => s.id === 'vind-het-veld')!
    const klachten: string[] = []
    for (let niveau = 1; niveau <= 6; niveau++) {
      for (let zaad = 0; zaad < 120; zaad++) {
        const o = spel.maakOpgave(niveau, proef(zaad * 31 + niveau))
        if (o.kind !== 'tapSquares') {
          klachten.push(`onverwacht opgavetype ${o.kind}`)
          continue
        }
        const past = bijVraag[o.vraag]
        if (!past) {
          klachten.push(`onbekende vraag: ${o.vraag}`)
          continue
        }
        const bezet = Object.keys(parseBoard(o.fen))
        const hoort = bezet.filter(past).sort()
        const gegeven = [...o.correct].sort()
        if (hoort.join() !== gegeven.join()) {
          klachten.push(`${o.vraag} op ${o.fen}: ${gegeven.join(',')} ipv ${hoort.join(',')}`)
        }
        if (!gegeven.length) klachten.push(`geen enkel goed veld op ${o.fen}`)
        if (gegeven.length === bezet.length) klachten.push(`alles goed op ${o.fen} — dat vraagt niets`)
      }
    }
    expect(klachten.slice(0, 5)).toEqual([])
  })
})
