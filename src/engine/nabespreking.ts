/**
 * Pip kijkt terug: één moment uit een partij, om van te leren.
 *
 * Een kind dat net een partij heeft gespeeld, heeft niets aan een foutenlijst. Een
 * trainer op de club wijst één ding aan: "kijk, hier kon je toren dat paard pakken".
 * Dat doet deze module, en niets meer.
 *
 * Twee soorten moment, in deze volgorde:
 *   - gemist: het kind kon een stuk winnen, en deed iets anders;
 *   - mooi:   het kind won zelf een stuk. Dan is er ook iets om trots op te zijn.
 *
 * Bewust níét: "hier kon je mat zetten". Mat komt pas in wereld 10 (CLAUDE.md), en een
 * kind van vijf dat tegen Kip Kiki speelt, hoort hier niets over mat. Een gemiste slag
 * is wereld 7 en 8 (wat is een stuk waard, staat het te pakken), en dat herkent elk kind
 * dat een partij speelt.
 *
 * Hoe zeker is "kon een stuk winnen"? Eerst de snelle maat van de blunderwaarschuwing
 * (`blunderVerlies`: wat pakt de ander terug, en wat pak jij daarna terug). Die kijkt
 * alleen naar slagen. Daarom moet elk gemist moment daarna ook langs de zoeker: is de
 * slag na zijn beste antwoord nog steeds minstens twee pionnen beter dan wat het kind
 * speelde? Zo wijst Pip nooit een "gratis" stuk aan dat in werkelijkheid een mat of een
 * vork kost. Een fout in de nabespreking leert een kind iets verkeerds aan.
 */
import { blunderVerlies, Game } from './game'
import { PIECE_NAME, type Color, type PieceType, type Square } from './board'
import { waardeer, zoek } from './zoeker'

const PIONNEN: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }

export type Moment = {
  soort: 'gemist' | 'mooi'
  /** Het zetnummer zoals op een notatieformulier: zet 1 is wit en zwart samen. */
  zetNr: number
  /** De stelling vóór de zet, met het kind aan zet. */
  fen: string
  /** De slag die kon (gemist) of die het kind deed (mooi). */
  van: Square
  naar: Square
  stuk: PieceType
  buit: PieceType
  /** Kon de ander niets terugpakken? Anders hield het kind na het terugslaan meer over. */
  gratis: boolean
  /** Wat het kind in plaats daarvan speelde, bij een gemist moment. */
  gespeeld?: { van: Square; naar: Square; promotie?: PieceType }
}

type Zet = { voor: string; from: Square; to: Square; color: Color; promotion?: PieceType }

/** Wat deze zet netto oplevert in pionnen, na de beste slag terug en de herovering. */
function netto(game: Game, van: Square, naar: Square, promotie?: PieceType): { winst: number; verlies: number } {
  const zet = game.legalMoves(van).find((z) => z.to === naar && (!promotie || z.promotion === promotie))
  if (!zet) return { winst: 0, verlies: 0 }
  const buit = zet.captured ? PIONNEN[zet.captured] : 0
  const verlies = blunderVerlies(game, van, naar, promotie ?? 'q')
  return { winst: buit - verlies, verlies }
}

/** De stelling na deze zet, zoals de zoeker hem ziet, vanuit het kind (in centipionnen). */
function naZoeken(fen: string, van: Square, naar: Square, promotie?: PieceType): number | null {
  const game = new Game(fen)
  if (!game.move(van, naar, promotie ?? 'q')) return null
  // Mat of pat na de zet: daar valt niets te vergelijken.
  if (game.status().over) return null
  // De zoeker geeft zijn score vanuit wie er aan zet is: de tegenstander.
  return -zoek(game, 2, 6000).score
}

export function nabespreking(verloop: Zet[], kind: Color = 'w'): Moment | null {
  const gemist: (Moment & { verschil: number })[] = []
  let mooi: (Moment & { winst: number }) | null = null

  const teken = kind === 'w' ? 1 : -1
  for (const gespeeld of verloop) {
    if (gespeeld.color !== kind) continue
    const game = new Game(gespeeld.voor)
    const zetNr = Number(gespeeld.voor.split(' ')[5] ?? 1)
    const slagen = game.legalMoves().filter((z) => z.isCapture && !z.promotion && z.captured)

    // Wat het kind speelde.
    const { winst: eigen, verlies: eigenVerlies } = netto(game, gespeeld.from, gespeeld.to, gespeeld.promotion)
    const eigenZet = game.legalMoves(gespeeld.from).find((z) => z.to === gespeeld.to)
    // Ook een mooie slag gaat langs de zoeker: een dame pakken die in een mat loopt,
    // prijst Pip niet.
    const nuWaard = teken * waardeer(gespeeld.voor)
    const naWaard = eigenZet?.captured && eigen >= 3 ? naZoeken(gespeeld.voor, gespeeld.from, gespeeld.to, gespeeld.promotion) : null
    if (eigenZet?.captured && naWaard !== null && naWaard - nuWaard >= 200 && (!mooi || eigen > mooi.winst)) {
      mooi = {
        soort: 'mooi', zetNr, fen: gespeeld.voor,
        van: gespeeld.from, naar: gespeeld.to, stuk: eigenZet.stuk, buit: eigenZet.captured,
        gratis: eigenVerlies === 0, winst: eigen,
      }
    }

    // De beste slag die er was.
    let beste: { zet: (typeof slagen)[number]; winst: number; verlies: number } | null = null
    for (const zet of slagen) {
      const uit = netto(game, zet.from, zet.to)
      if (!beste || uit.winst > beste.winst) beste = { zet, ...uit }
    }
    if (!beste || beste.winst < 3 || beste.winst - eigen < 3) continue
    if (beste.zet.from === gespeeld.from && beste.zet.to === gespeeld.to) continue
    gemist.push({
      soort: 'gemist', zetNr, fen: gespeeld.voor,
      van: beste.zet.from, naar: beste.zet.to, stuk: beste.zet.stuk, buit: beste.zet.captured as PieceType,
      gratis: beste.verlies === 0,
      gespeeld: { van: gespeeld.from, naar: gespeeld.to, promotie: gespeeld.promotion },
      verschil: beste.winst - eigen,
    })
  }

  // De grootste gemiste kans eerst; de zoeker beslist of hij echt was. Hooguit drie
  // keer zoeken, zodat het op een oude tablet niet merkbaar duurt.
  gemist.sort((a, b) => b.verschil - a.verschil)
  for (const kans of gemist.slice(0, 3)) {
    const metSlag = naZoeken(kans.fen, kans.van, kans.naar)
    const { van, naar, promotie } = kans.gespeeld!
    const zonder = naZoeken(kans.fen, van, naar, promotie)
    if (metSlag === null || zonder === null) continue
    if (metSlag - zonder < 200) continue
    const { verschil: _, ...moment } = kans
    return moment
  }
  if (!mooi) return null
  const { winst: _, ...moment } = mooi as Moment & { winst: number }
  return moment
}

const HET = new Set<PieceType>(['n'])
const metLidwoord = (stuk: PieceType) => `${HET.has(stuk) ? 'het' : 'de'} ${PIECE_NAME[stuk]}`

/**
 * Het moment als stappen voor het bewegende bord. De zinnen staan onder het bord; Pip
 * zegt er één vaste, ingesproken zin bij (zie content/voice.ts), want "je toren kon het
 * paard op a5 pakken" kan niet vooraf ingesproken worden.
 */
export function terugblikStappen(m: Moment): { tekst: string; markeer?: Square[]; zet?: string }[] {
  const stuk = PIECE_NAME[m.stuk]
  const buit = metLidwoord(m.buit)
  const daarna = m.gratis ? 'Niemand kon terugpakken.' : 'De ander kon wel terugpakken, maar jij hield meer over.'
  if (m.soort === 'gemist') {
    return [
      { tekst: `Zet ${m.zetNr}. Jij was aan zet.`, markeer: [m.van] },
      { tekst: `Je ${stuk} kon ${buit} op ${m.naar} pakken.`, markeer: [m.van, m.naar] },
      { tekst: `Zo. ${daarna}`, zet: `${m.van}-${m.naar}` },
    ]
  }
  return [
    { tekst: `Zet ${m.zetNr}. Jij was aan zet.`, markeer: [m.van, m.naar] },
    { tekst: `Je ${stuk} pakte ${buit}. ${daarna}`, zet: `${m.van}-${m.naar}` },
  ]
}
