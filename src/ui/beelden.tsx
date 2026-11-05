/**
 * De eigen illustraties (public/illustraties/), die de emoji vervangen: Pip in zeven
 * stemmingen, een wapen en een kaartstrook per wereld. Gemaakt door de illustrator-
 * agent na goedkeuring van Kaj (4 nov 2026); Pip komt uit scripts/pip-tekenen.py.
 *
 * Eén plek voor de paden. tests/illustraties.test.ts controleert dat elk wapen, elke
 * kaartstrook, elke Pip (met voetstuk, knop en los), elk lesicoon en elk vast icoon bestaat.
 */
import type { PipStemming } from './Pip'

const BASIS = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export const pipBeeld = (stemming: PipStemming, knop = false) =>
  `${BASIS}/illustraties/pip/pip-${knop ? 'knop-' : ''}${stemming}.svg`
/** Pip zonder plankje, met een zachte schaduw: op de kaarthalte en in de held. */
export const pipLos = (stemming: PipStemming) => `${BASIS}/illustraties/pip/pip-los-${stemming}.svg`
/** Pip met zijn hele lijf (scripts/pip-tekenen.py): wijst naar rechtsonder, juicht, of wacht met een vlaggetje. */
export type PipHouding = 'wijst' | 'juicht' | 'wacht'
export const pipHeel = (houding: PipHouding) => `${BASIS}/illustraties/pip/pip-heel-${houding}.svg`
export const lesIcoon = (lesId: string) => `${BASIS}/illustraties/iconen/les-${lesId}.svg`
export type IcoonNaam =
  | 'minispel' | 'slot' | 'beker' | 'sticker' | 'deel' | 'hint' | 'geluid' | 'instellingen' | 'bel' | 'bel-uit'
  | 'ster-vol' | 'ster-leeg' | 'medaille-brons' | 'medaille-zilver' | 'medaille-goud'
  | 'fase-kijken' | 'fase-meedoen' | 'fase-zelf' | 'fase-toets'
  | 'punt-voorlezen' | 'punt-begint-bij-nul' | 'punt-niet-verliezen'
export const icoonBeeld = (naam: IcoonNaam) => `${BASIS}/illustraties/iconen/${naam}.svg`
export const wapenBeeld = (wereldId: string) => `${BASIS}/illustraties/werelden/wereld-${wereldId}.svg`
export const kaartBeeld = (wereldId: string, donker = false) =>
  `${BASIS}/illustraties/kaart/kaart-${wereldId}${donker ? '-donker' : ''}.svg`

/**
 * Het wapen van een wereld. Decoratief (alt=""): de naam van de wereld staat er altijd
 * als tekst naast, en een schermlezer hoeft niet "kasteel met torens" te horen.
 */
export function WereldWapen({ id, maat, className }: { id: string; maat: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- statische export, SVG
    <img src={wapenBeeld(id)} alt="" width={maat} height={maat} className={className} draggable={false} decoding="async" />
  )
}

/** Een getekend icoon in plaats van een emoji. Decoratief: de tekst ernaast zegt het. */
type IcoonProps = ({ naam: IcoonNaam; src?: never } | { src: string; naam?: never }) & {
  maat: number
  className?: string
  style?: React.CSSProperties
}
export function Icoon({ naam, src, maat, className, style }: IcoonProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- statische export, SVG
    <img src={src ?? icoonBeeld(naam as IcoonNaam)} alt="" width={maat} height={maat} className={className} style={{ verticalAlign: 'middle', ...style }} draggable={false} decoding="async" />
  )
}

/** Het gezicht van een bot (id uit src/engine/bots.ts), uit scripts/bots-tekenen.py. */
export type BotStemming = 'blij' | 'denkt' | 'verrast'
/** De tekening van een bot; 'blij' is de gewone tekening (scripts/bots-tekenen.py). */
export const botBeeld = (id: string, stemming: BotStemming = 'blij') =>
  `${BASIS}/illustraties/bots/bot-${id}${stemming === 'blij' ? '' : `-${stemming}`}.svg`

/** Emoji uit AVATARS (src/progress/store.ts) → bestandsnaam van de tekening. */
const MAATJES: Record<string, string> = {
  '🐴': 'paard', '🦊': 'vos', '🐻': 'beer', '🐰': 'konijn',
  '🦉': 'uil', '🐢': 'schildpad', '🐝': 'bij', '🦄': 'eenhoorn',
}
/** De tekening van een maatje (scripts/maatjes-tekenen.py), of null voor een onbekende emoji. */
export const maatjeBeeld = (emoji: string): string | null =>
  Object.hasOwn(MAATJES, emoji) ? `${BASIS}/illustraties/maatjes/maatje-${MAATJES[emoji]}.svg` : null
