import { describe, expect, it } from 'vitest'
import type { Square } from '@/engine/board'
import { Game } from '@/engine/game'
import { nabespreking } from '@/engine/nabespreking'

/** Speel zetten vanaf een stelling en geef het verloop, zoals het partijscherm het heeft. */
function partij(fen: string, ...zetten: string[]) {
  const game = new Game(fen)
  for (const z of zetten) {
    const [van, naar] = z.split('-') as [Square, Square]
    expect(game.move(van, naar), z).not.toBeNull()
  }
  return game.verloop
}

describe('Pip kijkt terug', () => {
  it('wijst een gemiste gratis slag aan', () => {
    // De toren kan het paard op a5 pakken; niemand pakt terug. Het kind zet de koning.
    const m = nabespreking(partij('7k/8/8/n7/8/8/8/R6K w - - 0 1', 'h1-g2'))
    expect(m).toMatchObject({ soort: 'gemist', van: 'a1', naar: 'a5', stuk: 'r', buit: 'n', zetNr: 1 })
    expect(m?.gespeeld).toMatchObject({ van: 'h1', naar: 'g2' })
  })

  it('noemt een gedekt stuk niet gratis', () => {
    // Het paard op a5 is gedekt door de pion op b6: toren voor paard is verlies.
    expect(nabespreking(partij('7k/8/1p6/n7/8/8/8/R6K w - - 0 1', 'h1-g2'))).toBeNull()
  })

  it('wijst geen slag aan die een mat kost', () => {
    // Het paard kan de loper op a3 pakken, maar dan zet de toren op e1 mat. Het kind
    // maakte juist luchtgat h3. Dat is een goede zet, geen gemiste kans.
    expect(nabespreking(partij('4r1k1/8/8/8/8/b7/5PPP/1N4K1 w - - 0 1', 'h2-h3'))).toBeNull()
  })

  it('prijst een slag die een stuk wint', () => {
    // Toren pakt dame, koning pakt toren terug: vier pionnen erbij.
    const m = nabespreking(partij('3qk3/8/8/8/8/8/8/3RK3 w - - 0 1', 'd1-d8'))
    expect(m).toMatchObject({ soort: 'mooi', van: 'd1', naar: 'd8', stuk: 'r', buit: 'q' })
  })

  it('een gemiste kans gaat voor een mooie slag', () => {
    // Zet 1: het kind pakt de dame (mooi). Zet 2: het laat de loper de gratis toren op a4
    // niet pakken. (Met pionnen: zonder is loper tegen kale koning direct remise.)
    const m = nabespreking(
      partij('3qk3/7p/8/8/r7/8/2B4P/3RK3 w - - 0 1', 'd1-d8', 'e8-d8', 'e1-f1'),
    )
    expect(m).toMatchObject({ soort: 'gemist', van: 'c2', naar: 'a4', buit: 'r', zetNr: 2 })
  })

  it('kijkt alleen naar de zetten van het kind', () => {
    // Zwart laat een gratis toren staan; dat is niet de fout van het kind.
    expect(nabespreking(partij('7k/8/8/8/8/8/8/r6K b - - 0 1', 'h8-g8'))).toBeNull()
  })

  it('zegt niets over mat: een gemist mat zonder slag is geen moment', () => {
    // Wit kan mat zetten met Ta8, maar er valt niets te slaan.
    expect(nabespreking(partij('7k/6pp/8/8/8/8/8/R5K1 w - - 0 1', 'g1-f2'))).toBeNull()
  })

  it('een gewone partij zonder winst of verlies van stukken geeft niets', () => {
    expect(nabespreking(partij('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 'e2-e4', 'e7-e5', 'g1-f3'))).toBeNull()
  })
})

describe('de stappen onder het bord', () => {
  it('kloppen met het bord: de laatste stap speelt de slag', async () => {
    const { terugblikStappen } = await import('@/engine/nabespreking')
    const { bouwBeelden } = await import('@/uitleg/beelden')
    const m = nabespreking(partij('7k/8/8/n7/8/8/8/R6K w - - 0 1', 'h1-g2'))!
    const stappen = terugblikStappen(m)
    expect(stappen.map((s) => s.tekst)).toEqual([
      'Zet 1. Jij was aan zet.',
      'Je toren kon het paard op a5 pakken.',
      'Zo. Niemand kon terugpakken.',
    ])
    // Het bord speelt het na met chess.js: na de laatste stap staat de toren op a5.
    const beelden = bouwBeelden({ id: 't', titel: '', beschrijving: '', fen: m.fen, regels: 'echt', stappen })
    expect(beelden.at(-1)!.stukken.find((s) => s.veld === 'a5')).toMatchObject({ stuk: 'r', kleur: 'w' })
  })
})
