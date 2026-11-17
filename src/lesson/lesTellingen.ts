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

/**
 * Doet iets één keer, en daarna nooit meer. Voor "Eerste opgave": de lespagina openen
 * telt al als "Les begonnen", ook voor wie alleen de uitleg leest (of voor een zoekmachine).
 * Pas de eerste tik op het bord of op een quizknop zegt dat het kind echt ging spelen.
 */
export function eenKeer(doe: () => void): () => void {
  let gedaan = false
  return () => {
    if (gedaan) return
    gedaan = true
    doe()
  }
}

/** Hoe vaak een kind op Verder tikte terwijl Pip nog praatte, in grove klassen. */
export function doorgetiktKlasse(doorgetikt: number, zinnen: number): string {
  if (doorgetikt <= 0 || zinnen <= 0) return 'geen'
  return doorgetikt * 2 >= zinnen ? 'meestal' : 'soms'
}

export type UitlegEinde = 'verder' | 'weg'

/**
 * De uitleg (fase kijken): luistert een kind Pip uit, tikt het door terwijl hij nog
 * praat, of gaat het weg? Eén keer per keer dat de les open is, alleen de eerste
 * uitleg (niet "nog eens kijken" vanuit een opgave), en alleen bij een nieuwe les.
 *
 * `zin` is de zin waar de uitleg eindigde (1 = de eerste). `doorgetikt` telt alleen
 * zinnen waarbij Pip echt hoorbaar praatte, zodat "stem uit" niet als ongeduld telt.
 */
export function maakUitlegMelder(
  stuur: (einde: UitlegEinde, zin: number, doorgetikt: string, stem: 'aan' | 'uit') => void,
) {
  let gemeld = false
  let doorgetikt = 0
  return {
    /** Het kind tikte Verder bij een zin; `praatte` = Pip was nog aan het woord. */
    verder(praatte: boolean) {
      if (praatte) doorgetikt++
    },
    klaar(einde: UitlegEinde, zin: number, stemAan: boolean) {
      if (gemeld) return
      gemeld = true
      stuur(einde, zin, doorgetiktKlasse(doorgetikt, zin), stemAan ? 'aan' : 'uit')
    },
    /** Deze uitleg telt niet mee (een hervatte les): niets meer melden. */
    negeer() {
      gemeld = true
    },
  }
}
