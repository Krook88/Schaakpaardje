import type { MetadataRoute } from 'next'
import { SITE } from '@/seo'
import { allePaginas } from '@/vindbaar'

/**
 * De sitemap. Zonder deze moet een zoekmachine elke pagina zelf zien te vinden via
 * links, en die links staan hier allemaal achter een scherm dat pas na het laden van
 * een profiel verschijnt. Met een sitemap weet hij ze meteen allemaal.
 *
 * Geen `priority` en geen `changefreq`: Google negeert ze allebei, dus ze maakten het
 * bestand alleen langer. De lijst zelf komt uit `src/vindbaar.ts`, dezelfde als die van
 * de pagina /sitemap/, zodat een nieuwe pagina nooit in maar één van de twee staat.
 */
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  // Geen lastModified. Hier stond de bouwtijd, dus na elke build zei de sitemap dat
  // alle pagina's net gewijzigd waren. Google leert daarvan dat de datum niets
  // betekent en negeert hem daarna ook als hij wél klopt. Geen datum is eerlijker.
  //
  // Alleen pagina's die ook echt iets te lezen hebben. Hier stonden ook /kaart/, /stal/,
  // /opfrissen/, de minispellen en de bots. Die schermen zijn leeg zonder profiel en
  // staan op noindex; ze horen hier niet.
  return allePaginas().map((p) => ({ url: `${SITE}${p.pad}` }))
}
