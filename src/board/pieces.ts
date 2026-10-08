import type { PieceType } from '@/engine/board'

/**
 * Voorlopig gebruiken we de Unicode-schaakstukken: ze zijn overal beschikbaar,
 * schalen mee en wegen niets. Bij de visuele oplevering komen hier de getekende
 * stukken van Pip en zijn vrienden voor in de plaats (twee thema's: dieren voor
 * 3 tot 7, klassiek Staunton vanaf 7 — kinderen moeten op tijd de echte vormen leren).
 *
 * Wit en zwart zijn hier hetzelfde teken: het bord kleurt ze met CSS, zodat beide op
 * een licht én een donker veld leesbaar blijven. Dat werkt alleen zolang het toestel
 * er een lettervorm van maakt en geen emoji.
 */

/**
 * De U+FE0E achter elk teken is geen sierletter maar een reparatie.
 *
 * ♟ (U+265F) heeft sinds Unicode 11 een emoji-variant, en iOS kiest die standaard. Een
 * emoji trekt zich niets aan van `color`, dus op een iPhone werden álle pionnen zwart —
 * ook die van wit. Op het bord stond dan zestien keer zwart tegenover zestien keer
 * zwart, en in de pionlessen leek je eigen pion die van de tegenstander. Precies de
 * verwarring die deze app moet wegnemen, en alleen zichtbaar op Apple-toestellen.
 *
 * U+FE0E vraagt uitdrukkelijk om de lettervorm. Hij staat achter alle zes de stukken,
 * niet alleen de pion: de andere vijf hebben vandaag geen emoji-variant, maar dat is
 * een besluit van Unicode en geen natuurwet.
 */
const ALS_LETTER = '\uFE0E'

export const GLYPH: Record<PieceType, string> = {
  k: `♚${ALS_LETTER}`,
  q: `♛${ALS_LETTER}`,
  r: `♜${ALS_LETTER}`,
  b: `♝${ALS_LETTER}`,
  n: `♞${ALS_LETTER}`,
  p: `♟${ALS_LETTER}`,
}
