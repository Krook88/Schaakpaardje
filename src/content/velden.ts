import { fileIndex, square, type Square } from '@/engine/board'

/**
 * Kleine hulpjes om een weg over het bord op te schrijven.
 *
 * Ze bestaan voor de aanwijzingen in de kijkfase. Die zijn een lijst velden in de
 * volgorde waarin ze oplichten, en zo'n lijst met de hand overtypen is precies het
 * soort werk waar fouten in sluipen — `['e1','e2','e3','e4','e5','e6','e7','e8']` leest
 * niemand meer na. `lijn('e')` wel.
 *
 * Ze rekenen alleen met de meetkunde van het bord: welk stuk er staat en of een zet mag
 * doet er niet toe. Dat is hier ook niet de vraag; dit is uitleg, geen opgave.
 */

/** Een hele lijn, van beneden naar boven: `lijn('e')` is e1 tot en met e8. */
export function lijn(file: string): Square[] {
  const f = fileIndex(`${file}1` as Square)
  return [1, 2, 3, 4, 5, 6, 7, 8].map((r) => square(f, r))
}

/** Een hele rij, van links naar rechts: `rij(4)` is a4 tot en met h4. */
export function rij(rank: number): Square[] {
  return [0, 1, 2, 3, 4, 5, 6, 7].map((f) => square(f, rank))
}

/**
 * De weg van `van` naar `naar`, zonder het beginveld.
 *
 * Recht of schuin; iets anders is geen weg over het bord en levert een lege lijst op
 * in plaats van een half pad, zodat een vergissing meteen opvalt in plaats van stilletjes
 * een verkeerde pijl te tekenen.
 */
export function pad(van: Square, naar: Square): Square[] {
  const vf = fileIndex(van)
  const vr = Number(van[1])
  const nf = fileIndex(naar)
  const nr = Number(naar[1])
  const df = Math.sign(nf - vf)
  const dr = Math.sign(nr - vr)
  const stappen = Math.max(Math.abs(nf - vf), Math.abs(nr - vr))
  if (!stappen) return []
  const recht = df === 0 || dr === 0
  const schuin = Math.abs(nf - vf) === Math.abs(nr - vr)
  if (!recht && !schuin) return []
  const uit: Square[] = []
  for (let i = 1; i <= stappen; i++) uit.push(square(vf + df * i, vr + dr * i))
  return uit
}

/** Meerdere wegen achter elkaar, als één spoor. */
export function wegen(...delen: Square[][]): Square[] {
  return delen.flat()
}
