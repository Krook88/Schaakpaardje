/**
 * Wat staat er al in de stal, en wat nog niet?
 *
 * Bewust een losse, zuivere functie: geen React, geen store, alleen voortgang erin en
 * een lijst eruit. Zo is precies na te rekenen wat een kind verdiend heeft — en dat is
 * bij een verzameling het enige wat telt. Niets wordt willekeurig uitgedeeld.
 */
import { STALSTUKKEN, type StalSoort, type StalStuk } from '@/content/stal'
import { DIPLOMAS } from '@/content/diplomas'
import { diplomaBehaald, wereldIsAf, type LesResultaat } from './store'

export type StalVak = StalStuk & { bezit: boolean }

export function verzameling(
  voortgang: Record<string, LesResultaat>,
  verslagen: string[],
): StalVak[] {
  return STALSTUKKEN.map((stuk) => ({ ...stuk, bezit: verdiend(stuk, voortgang, verslagen) }))
}

function verdiend(
  stuk: StalStuk,
  voortgang: Record<string, LesResultaat>,
  verslagen: string[],
): boolean {
  const [soort, sleutel] = [stuk.id.slice(0, stuk.id.indexOf('-')), stuk.id.slice(stuk.id.indexOf('-') + 1)]
  if (soort === 'stuk') return wereldIsAf(sleutel, voortgang)
  if (soort === 'maatje') return verslagen.includes(sleutel)
  if (soort === 'hoefijzer') {
    const diploma = DIPLOMAS.find((d) => d.soort === sleutel)
    return diploma ? diplomaBehaald(diploma.soort, voortgang) : false
  }
  return false
}

/** Per plank, zodat de stal drie rijen wordt in plaats van één lange sliert. */
export function perSoort(vakken: StalVak[]): Record<StalSoort, StalVak[]> {
  return {
    stuk: vakken.filter((v) => v.soort === 'stuk'),
    maatje: vakken.filter((v) => v.soort === 'maatje'),
    hoefijzer: vakken.filter((v) => v.soort === 'hoefijzer'),
  }
}

export function aantalBezit(vakken: StalVak[]): number {
  return vakken.filter((v) => v.bezit).length
}
