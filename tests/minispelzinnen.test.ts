import { describe, expect, it } from 'vitest'
import {
  MINISPELLEN,
  MINISPEL_ZINNEN,
  MINISPEL_ZONDER_OPNAME,
} from '@/play/minispellen'
import { alleZinnen } from '@/content/validate'

/**
 * Spreekt Pip de minispellen ook echt in?
 *
 * De minispellen maken hun opgaven zelf en stonden daardoor buiten `alleZinnen()`, die
 * de werelden afloopt. Gevolg: élk minispel klonk in de apparaatstem in plaats van in
 * die van Pip. Dat hoor je meteen — het is een andere stem, en voor een kind dat niet
 * leest is de stem alles. Gemeld met "ik krijg hier de robot stem" bij "Tik alle torens
 * aan.", en dat was niet één zin maar alle vijftien spellen.
 *
 * Een lijst met zinnen lost dat op tot de dag dat iemand een spel toevoegt en de lijst
 * vergeet. Vandaar deze test: hij spéélt de spellen, met genoeg zaden om elke tak te
 * raken, en valt om zodra er een zin uitkomt die niet ingesproken wordt.
 */

/** Een voorspelbare random, zodat een omgevallen test te herhalen is. */
function zaadje(n: number) {
  let x = n * 2654435761 + 1
  return () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff
    return x / 0x7fffffff
  }
}

describe('de minispellen praten met Pips stem', () => {
  const ingesproken = new Set(alleZinnen())

  it('elke zin uit de lijst wordt ook echt ingesproken', () => {
    const ontbreekt = MINISPEL_ZINNEN.filter((z) => !ingesproken.has(z))
    expect(ontbreekt).toEqual([])
  })

  it('elk spel kondigt zich aan met een ingesproken zin', () => {
    const stil = MINISPELLEN.filter((s) => !ingesproken.has(s.uitleg)).map((s) => s.id)
    expect(stil).toEqual([])
  })

  it('geen enkel spel verzint een zin die niet is ingesproken', () => {
    const onbekend = new Map<string, string>()
    for (const spel of MINISPELLEN) {
      if (MINISPEL_ZONDER_OPNAME.includes(spel.id)) continue
      for (let niveau = 1; niveau <= 6; niveau++) {
        // Twaalf zaden per niveau: genoeg om elke tak te raken (het spel met de
        // meeste varianten heeft er drie), zonder dat de test een halve minuut duurt.
        for (let zaad = 0; zaad < 12; zaad++) {
          const opgave = spel.maakOpgave(niveau, zaadje(zaad * 97 + niveau))
          const vraag = 'vraag' in opgave ? opgave.vraag : ''
          if (vraag && !ingesproken.has(vraag)) onbekend.set(vraag, spel.id)
        }
      }
    }
    expect([...onbekend].map(([zin, spel]) => `${spel}: ${zin}`)).toEqual([])
  })

  it('de uitzondering is een echt spel, geen typefout', () => {
    for (const id of MINISPEL_ZONDER_OPNAME) {
      expect(MINISPELLEN.map((s) => s.id)).toContain(id)
    }
  })
})
