/**
 * De woorden bij "Pip kijkt terug". De motor (engine/nabespreking.ts) kiest het moment;
 * hier staat wat het kind leest. Kindertekst hoort niet in de motor (achtenzestigste
 * review, codebase 5).
 */
import { PIECE_NAME, type PieceType } from '@/engine/board'
import type { Moment } from '@/engine/nabespreking'
import type { Stap } from '@/uitleg/beelden'

const HET = new Set<PieceType>(['n'])
const metLidwoord = (stuk: PieceType) => `${HET.has(stuk) ? 'het' : 'de'} ${PIECE_NAME[stuk]}`
const hoofdletter = (t: string) => `${t[0].toUpperCase()}${t.slice(1)}`

/**
 * Het moment als stappen voor het bewegende bord. De zinnen staan onder het bord; Pip
 * zegt er één vaste, ingesproken zin bij (zie content/voice.ts).
 *
 * Geen veldnamen en geen zetnummers: die horen bij wereld 12 (notatie), en bij jongere
 * kinderen staan de veldnamen op het bord uit. De markering wijst het al aan. Bij een
 * gemist moment de tegenwoordige tijd: die slag is nooit gespeeld.
 */
export function terugblikStappen(m: Moment, tegenstander = 'de ander'): Stap[] {
  const stuk = PIECE_NAME[m.stuk]
  const buit = metLidwoord(m.buit)
  if (m.soort === 'gemist') {
    const dan = m.gratis
      ? 'Dan kan niemand terugpakken.'
      : `Dan kan ${tegenstander} wel terugpakken, maar hou jij meer over.`
    return [
      { tekst: 'Kijk, hier was jij aan zet.', markeer: [m.van] },
      { tekst: `Je ${stuk} kon ${buit} pakken.`, markeer: [m.van, m.naar] },
      { tekst: `Zo. ${dan}`, zet: `${m.van}-${m.naar}` },
    ]
  }
  const toen = m.gratis ? 'Niemand kon terugpakken.' : `${hoofdletter(tegenstander)} kon wel terugpakken, maar jij hield meer over.`
  return [
    { tekst: 'Kijk, hier was jij aan zet.', markeer: [m.van, m.naar] },
    { tekst: `Je ${stuk} pakte ${buit}. ${toen}`, zet: `${m.van}-${m.naar}`, wordt: m.promotie },
  ]
}
