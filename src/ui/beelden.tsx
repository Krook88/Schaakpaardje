/**
 * De eigen illustraties (public/illustraties/), die de emoji vervangen: Pip in zeven
 * stemmingen, een wapen en een kaartstrook per wereld. Gemaakt door de illustrator-
 * agent na goedkeuring van Kaj (4 nov 2026); Pip komt uit scripts/pip-tekenen.py.
 *
 * Eén plek voor de paden. tests/illustraties.test.ts controleert dat er voor elke wereld
 * een wapen en twee kaartstroken zijn, en voor elke stemming twee Pips.
 */
import type { PipStemming } from './Pip'

const BASIS = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export const pipBeeld = (stemming: PipStemming, knop = false) =>
  `${BASIS}/illustraties/pip/pip-${knop ? 'knop-' : ''}${stemming}.svg`
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
