/**
 * Wat staat er al in de stal, en wat nog niet?
 *
 * Bewust een losse, zuivere functie: geen React, geen store, alleen voortgang erin en
 * een lijst eruit. Zo is precies na te rekenen wat een kind verdiend heeft — en dat is
 * bij een verzameling het enige wat telt. Niets wordt willekeurig uitgedeeld.
 */
import { STALSTUKKEN, type StalSoort, type StalStuk } from '@/content/stal'
import { DIPLOMAS } from '@/content/diplomas'
import { WERELDEN, type World } from '@/content'
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

export type StickerVak = {
  id: string
  naam: string
  teken: string
  toon: number
  bezit: boolean
  /** De les is gedaan, maar zonder drie sterren: geen leeg vak, wel nog geen sticker. */
  gedaan: boolean
}

/**
 * De stickers, per wereld.
 *
 * Een sticker (drie sterren op een les) bestond alleen als getal: "Plus 5 stickers van
 * perfecte lessen". Een kind van vijf kon dus nergens terugvinden wélke het had. Nu is
 * elke sticker het plaatje van zijn les in de kleur van zijn wereld — hetzelfde plaatje
 * als op de kaart — en staan ze per wereld bij elkaar.
 *
 * Alleen werelden waar het kind al in begonnen is: achtenveertig grijze vakjes voor wie
 * net begint is geen verzameling maar een muur. De lege vakken in een begonnen wereld
 * blijven staan, want die laten zien wat er nog te halen valt.
 */
export function stickerPlanken(
  stickers: string[],
  voortgang: Record<string, LesResultaat>,
): { wereld: World; vakken: StickerVak[] }[] {
  const heeft = new Set(stickers)
  // (Een sticker van een les die niet meer bestaat valt hier vanzelf weg: er wordt per
  // bestaande les gekeken. Zie `geldigeStickers` voor de telling.)
  return WERELDEN.filter((w) => w.lessen.some((l) => heeft.has(l.id) || voortgang[l.id])).map((wereld) => ({
    wereld,
    vakken: wereld.lessen.map((les) => ({
      id: les.id,
      naam: les.titel,
      teken: les.icoon,
      toon: wereld.toon,
      bezit: heeft.has(les.id),
      gedaan: Boolean(voortgang[les.id]),
    })),
  }))
}

/**
 * Alleen stickers van lessen die bestaan. Een les die ooit hernoemd is, liet anders op
 * het beginscherm een leeg plekje achter en een teller die niet klopte met de plank.
 */
export function geldigeStickers(stickers: string[]): string[] {
  const lessen = new Set(WERELDEN.flatMap((w) => w.lessen.map((l) => l.id)))
  return stickers.filter((id) => lessen.has(id))
}
