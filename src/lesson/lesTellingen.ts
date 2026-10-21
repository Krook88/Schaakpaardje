/**
 * Wanneer het lesscherm iets telt, los van het scherm zodat het te testen is.
 *
 * Alleen beslissingen, geen versturen: `stuur` doet dat (in de app via `tel()`). Er gaat
 * nooit iets over het kind mee, alleen een les-id, een opgavenummer en een vaste waarde.
 */

export type Hulp = 'hint' | 'missers'

/**
 * Vanaf hoeveel missers een opgave "lastig" heet. Een quiz heeft twee of drie knoppen:
 * met drie knoppen betekenen twee missers dat het kind alles moest afgaan, met twee dat
 * het hetzelfde foute antwoord nog eens koos. Drie missers haalt een quiz bijna nooit.
 * (Foute knoppen blijven staan; een dubbeltik op dezelfde telt het lesscherm niet mee.)
 */
export function missersDrempel(kind: string): number {
  return kind === 'quiz' ? 2 : 3
}

/**
 * Meldt per opgave hooguit één keer "hint" en één keer "missers".
 *
 * De missers worden hier geteld en niet uit `stand.fouten` gelezen: de knop Opnieuw zet
 * die terug op nul (een kind met twee plus twee missers telde nooit), en een reset omdat
 * de zetten op waren telt daar als fout terwijl het kind niets verkeerd tikte.
 */
export function maakLastigMelder(stuur: (les: string, opgave: string, hulp: Hulp) => void) {
  const gemeld = new Set<string>()
  let nu = ''
  let missers = 0
  const meld = (les: string, opgave: string, hulp: Hulp) => {
    const sleutel = `${les}|${opgave}|${hulp}`
    if (gemeld.has(sleutel)) return
    gemeld.add(sleutel)
    stuur(les, opgave, hulp)
  }
  return {
    misser(les: string, opgave: string, kind: string) {
      if (nu !== `${les}|${opgave}`) {
        nu = `${les}|${opgave}`
        missers = 0
      }
      missers++
      if (missers >= missersDrempel(kind)) meld(les, opgave, 'missers')
    },
    hint(les: string, opgave: string) {
      meld(les, opgave, 'hint')
    },
  }
}

/**
 * Meldt "gestopt" hooguit één keer per keer dat een les open is, en niet in de beloning.
 * Telde hij bij elke keer dat de tab verborgen raakte, dan was één kind dat zeven keer
 * van tab wisselde zeven afhakers.
 */
export function maakStopMelder(stuur: (fase: string) => void) {
  let gemeld = false
  return (fase: string) => {
    if (fase === 'beloning' || gemeld) return
    gemeld = true
    stuur(fase)
  }
}
