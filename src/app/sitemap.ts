import type { MetadataRoute } from 'next'
import { ALLE_LESSEN, WERELDEN } from '@/content'
import { BOTS } from '@/engine/bots'
import { SITE } from '@/seo'

/**
 * De sitemap. Zonder deze moet een zoekmachine elke pagina zelf zien te vinden via
 * links, en die links staan hier allemaal achter een scherm dat pas na het laden van
 * een profiel verschijnt. Met een sitemap weet hij ze meteen allemaal.
 *
 * De prioriteiten zijn geen magische knoppen — Google doet er tegenwoordig weinig mee —
 * maar ze zeggen wel iets over de bedoeling: de twee tekstpagina's en de startpagina
 * zijn waar iemand binnenkomt, de lespagina's zijn de app zelf.
 */
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const nu = new Date()
  const pad = (p: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE}${p}`,
    lastModified: nu,
    changeFrequency: 'monthly',
    priority,
  })

  return [
    pad('/', 1),
    pad('/over/', 0.9),
    pad('/lessen/', 0.9),
    pad('/kaart/', 0.7),
    pad('/spelen/', 0.6),
    pad('/stal/', 0.4),
    pad('/opfrissen/', 0.4),
    ...ALLE_LESSEN.map((les) => pad(`/les/${les.id}/`, 0.5)),
    ...WERELDEN.filter((w) => w.minispel).map((w) => pad(`/spel/${w.minispel}/`, 0.4)),
    ...BOTS.map((bot) => pad(`/spelen/${bot.id}/`, 0.3)),
  ]
}
