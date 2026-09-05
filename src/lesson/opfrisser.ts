/**
 * Pips opfrisser: wat is er aan het wegzakken?
 *
 * Een kind doet wereld 1, leert hoe de toren loopt, en ziet daarna nooit meer een
 * torenopgave tot het toevallig terugklikt. Over drie weken is het weg. Dat is het
 * grootste gat in de app, en het is didactiek — geen bediening en geen vormgeving.
 *
 * De remedie is bekend: een paar oude opgaven terugzien, en het liefst juist die dingen
 * die destijds moeite kostten. Alles wat daarvoor nodig is lag er al. Elke afgeronde les
 * bewaart wanneer hij voor het laatst gedaan is, plus hoeveel fouten en hints het kostte.
 *
 * Wat dit expres NIET is: een dagelijkse verplichting. Geen reeks die je moet volhouden,
 * geen straf voor een dag overslaan, geen sterren te verliezen. Het is twee minuten
 * opwarmen, en wie het overslaat mist niets.
 */
import { ALLE_LESSEN } from '@/content'
import type { Exercise, Lesson } from '@/content/types'

export type Opfrisopgave = {
  lesId: string
  lesTitel: string
  icoon: string
  opgave: Exercise
}

/** Zo lang moet een les met rust gelaten zijn voor hij weer langskomt. */
export const RIJPINGSDAGEN = 5

/** Hoeveel opgaven één opfrisronde telt. Kort houden: dit is opwarmen, geen les. */
export const RONDE = 3

const DAG = 24 * 60 * 60 * 1000

export type Voortgang = Record<
  string,
  { sterren: number; fouten: number; hints: number; laatst: string }
>

/**
 * Hoe hard schreeuwt deze les om herhaling?
 *
 * Twee dingen tellen mee: hoe lang geleden, en hoeveel moeite het kostte. Een les die
 * vlekkeloos ging mag langer wegblijven dan eentje waar het kind vijf keer misgreep —
 * dat is de hele gedachte achter herhalen op afstand.
 */
export function urgentie(
  resultaat: { fouten: number; hints: number; laatst: string },
  nu: number,
): number {
  const dagen = (nu - Date.parse(resultaat.laatst)) / DAG
  if (!Number.isFinite(dagen) || dagen < RIJPINGSDAGEN) return 0
  const moeite = resultaat.fouten + resultaat.hints
  return dagen + moeite * 2
}

/**
 * Eén opgave uit een les, altijd dezelfde binnen dezelfde dag.
 *
 * Niet willekeurig per keer: dan kan een kind net zo lang verversen tot er een makkelijke
 * langskomt, en dan klopt de voorgerenderde HTML ook niet meer met wat de browser tekent.
 * Het zaad is de les plus de dag, dus morgen is het een andere.
 */
function kiesOpgave(les: Lesson, dagsleutel: number): Exercise | null {
  // Bij voorkeur uit de oefenfase: de meedoen-opgaven zijn voorgedaan en de toets is
  // het zwaarst. 'Zelf doen' zit daar precies tussenin.
  const bron = les.zelf.length ? les.zelf : les.toets.length ? les.toets : les.meedoen
  if (!bron.length) return null
  let h = dagsleutel
  for (let i = 0; i < les.id.length; i++) h = ((h << 5) + h + les.id.charCodeAt(i)) >>> 0
  return bron[h % bron.length]
}

/**
 * De opfrisronde van vandaag. Leeg als er nog niets rijp is — dan hoort de knop ook
 * niet op de stal te staan.
 */
export function kiesOpfrisopgaven(
  voortgang: Voortgang,
  nu: number = Date.now(),
  aantal: number = RONDE,
): Opfrisopgave[] {
  const dagsleutel = Math.floor(nu / DAG)
  const kandidaten = ALLE_LESSEN.map((les) => {
    const resultaat = voortgang[les.id]
    if (!resultaat) return null
    const score = urgentie(resultaat, nu)
    return score > 0 ? { les, score } : null
  }).filter((k): k is { les: Lesson; score: number } => k !== null)

  // Hoogste urgentie eerst; bij gelijke stand op les-id, zodat de volgorde vastligt.
  kandidaten.sort((a, b) => b.score - a.score || a.les.id.localeCompare(b.les.id))

  const uit: Opfrisopgave[] = []
  for (const { les } of kandidaten) {
    if (uit.length >= aantal) break
    const opgave = kiesOpgave(les, dagsleutel)
    // Eén opgave per les: drie keer dezelfde toren is geen opfrisser.
    if (opgave) uit.push({ lesId: les.id, lesTitel: les.titel, icoon: les.icoon, opgave })
  }
  return uit
}
