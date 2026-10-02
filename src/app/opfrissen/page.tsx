import { OpfrisScherm } from '@/lesson/OpfrisScherm'

/*
 * Een scherm van de app zelf: zonder profiel staat hier niets te lezen.
 *
 * Daarom noindex. Hij stond in de sitemap én zei tegelijk dat de startpagina de
 * echte pagina was; nu zegt hij gewoon dat hij niet geïndexeerd hoeft te worden.
 *
 * De titel had ook twee keer de merknaam ("Opfrissen | Schaakmaatje | Schaakmaatje"),
 * want layout.tsx plakt die er via een sjabloon al achter.
 */
export const metadata = { title: 'Opfrissen', robots: { index: false, follow: true } }

export default function Opfrissen() {
  return <OpfrisScherm />
}
