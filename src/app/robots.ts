import type { MetadataRoute } from 'next'
import { SITE } from '@/seo'

/**
 * Next genereert hier een echte robots.txt bij het bouwen (ook bij `output: 'export'`).
 *
 * Alles mag geïndexeerd worden: er staat niets op deze site wat geheim is, en er is
 * geen serverkant waar een kruiper kwaad kan. Het ouderscherm zit achter een rekenslot
 * maar bevat evenmin iets gevoeligs — alle gegevens staan in de browser van het kind
 * zelf, niet hier.
 */
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE}/sitemap.xml`,
  }
}
