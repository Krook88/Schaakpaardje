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
    expect(m).toMatchObject({ soort: 'gemist', van: 'a1', naar: 'a5', stuk: 'r', buit: 'n', gratis: true })
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
    expect(m).toMatchObject({ soort: 'gemist', van: 'c2', naar: 'a4', buit: 'r' })
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
    const { terugblikStappen } = await import('@/play/terugblik')
    const { bouwBeelden } = await import('@/uitleg/beelden')
    const m = nabespreking(partij('7k/8/8/n7/8/8/8/R6K w - - 0 1', 'h1-g2'))!
    const stappen = terugblikStappen(m)
    expect(stappen.map((s) => s.tekst)).toEqual([
      'Kijk, hier was jij aan zet.',
      'Je toren kon het paard pakken.',
      'Zo. Dan kan niemand terugpakken.',
    ])
    // Het bord speelt het na met chess.js: na de laatste stap staat de toren op a5.
    const beelden = bouwBeelden({ id: 't', titel: '', beschrijving: '', fen: m.fen, regels: 'echt', stappen })
    expect(beelden.at(-1)!.stukken.find((s) => s.veld === 'a5')).toMatchObject({ stuk: 'r', kleur: 'w' })
  })
})

/**
 * Stellingen van de schaakmeester (achtenzestigste review). De eerste versie keek twee
 * halve zetten vooruit en zei hier allemaal iets wat niet klopte.
 */
describe('wat Pip niet mag zeggen', () => {
  const ONDERSTE_RIJ = '6k1/3r1ppp/3r4/8/1n6/P7/5PPP/2R3K1 w - - 0 1'

  it('geen "knap" voor een slag die tot mat leidt', () => {
    // axb4, Td1+ Txd1 Txd1#: het kind ging mat door juist die slag.
    expect(nabespreking(partij(ONDERSTE_RIJ, 'a3-b4', 'd6-d1', 'c1-d1', 'd7-d1'))).toBeNull()
  })

  it('geen gemiste kans als de slag tot mat leidt: het luchtgat was goed', () => {
    expect(nabespreking(partij(ONDERSTE_RIJ, 'h2-h3'))).toBeNull()
  })

  const VORK = 'k7/p4b2/1p6/4N3/3n4/8/5PPP/2R3K1 w - - 0 1'

  it('geen gemiste kans als de slag een vork toelaat', () => {
    // Kf1 voorkomt Pe2+ met vork op koning en toren.
    expect(nabespreking(partij(VORK, 'g1-f1'))).toBeNull()
  })

  it('geen "knap" voor een slag waarna de vork het stuk terugwint', () => {
    expect(nabespreking(partij(VORK, 'e5-f7', 'd4-e2', 'g1-f1', 'e2-c1'))).toBeNull()
  })

  it('een minder slechte slag is geen kans: de pion moest tegengehouden worden', () => {
    // Txa5 laat b1=D+ toe; Tb1 was de zet. Het kind speelde Kg1, ook slecht, maar Pip
    // mag niet zeggen dat Txa5 een kans was.
    expect(nabespreking(partij('7k/6pp/8/n7/8/8/1p6/R6K w - - 0 1', 'h1-g1'))).toBeNull()
  })

  it('terugslaan is geen winst', () => {
    // Zwart pakt het paard op e4, wit slaat terug: gelijk, niets om "knap" te noemen.
    expect(nabespreking(partij('4k3/8/5n2/8/4N3/2N5/8/4K3 b - - 0 1', 'f6-e4', 'c3-e4'))).toBeNull()
  })

  it('"terugpakken" gaat over het veld van de slag, niet over een ander stuk', () => {
    // Na Txa5 kan zwart alleen de pion op c2 slaan; de toren op a5 kan niemand pakken.
    const m = nabespreking(partij('7k/6pp/8/q7/4b3/8/2P5/R5K1 w - - 0 1', 'g1-f1'))
    expect(m).toMatchObject({ soort: 'gemist', van: 'a1', naar: 'a5', buit: 'q', gratis: true })
  })
})
