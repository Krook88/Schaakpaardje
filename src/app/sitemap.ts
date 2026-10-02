import type { MetadataRoute } from 'next'
import { ALLE_LESSEN } from '@/content'
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

  // Alleen pagina's die ook echt iets te lezen hebben.
  //
  // Hier stonden ook /kaart/, /stal/, /opfrissen/, de minispellen en de bots. Die
  // schermen zijn leeg zonder profiel, en ze erfden bovendien een canonical die naar
  // de startpagina wees. Google kreeg dus "indexeer deze achtenzeventig" én "het zijn
  // allemaal kopieën van de startpagina", en deed uiteindelijk geen van beide. Nu
  // staan ze op noindex en horen ze hier niet meer thuis.
  //
  // De lespagina's staan er wél in: die hebben sinds LesUitleg een eigen titel, een
  // eigen omschrijving, een eigen canonical en de uitleg van Pip in gewone tekst.
  return [
    pad('/', 1),
    pad('/over/', 0.9),
    pad('/lessen/', 0.9),
    ...ALLE_LESSEN.map((les) => pad(`/les/${les.id}/`, 0.6)),
  ]
}
