import { WERELDEN } from '@/content'
import { SCHAAKREGELS } from '@/content/schaakregels'

/**
 * Alle pagina's die gevonden mogen worden, op één plek.
 *
 * Hieruit komen zowel `sitemap.xml` (voor Google) als de pagina `/sitemap/` (voor
 * mensen, en voor Google als stel interne links). Stonden ze in twee lijsten, dan liep
 * er vroeg of laat één achter: een nieuwe pagina in de ene en niet in de andere.
 *
 * Alleen pagina's met inhoud zonder profiel. De schermen van de app zelf (kaart, stal,
 * spelen, ouders) staan op noindex en horen hier niet in; zie `sitemap.ts`.
 */
export type Vindbaar = { pad: string; naam: string }

export const VOOR_OUDERS: Vindbaar[] = [
  { pad: '/', naam: 'Schaakmaatje: schaken leren voor kinderen' },
  { pad: '/over/', naam: 'Over Schaakmaatje, voor ouders' },
  { pad: '/lessen/', naam: 'Alle lessen' },
  { pad: '/schaakclub/', naam: 'Een schaakclub voor je kind vinden' },
  { pad: '/contact/', naam: 'Contact' },
  { pad: '/sitemap/', naam: "Alle pagina's" },
]

export const REGELS: Vindbaar[] = [
  { pad: '/schaakregels/', naam: 'Alle schaakregels' },
  ...SCHAAKREGELS.map((o) => ({ pad: `/schaakregels/${o.slug}/`, naam: o.vraag })),
]

/** De lessen per wereld, in de volgorde van de app. */
export const LESSEN_PER_WERELD: { wereld: string; lessen: Vindbaar[] }[] = WERELDEN.map((w) => ({
  wereld: w.naam,
  lessen: w.lessen.map((l) => ({ pad: `/les/${l.id}/`, naam: l.titel })),
}))

export function allePaginas(): Vindbaar[] {
  return [...VOOR_OUDERS, ...REGELS, ...LESSEN_PER_WERELD.flatMap((w) => w.lessen)]
}
