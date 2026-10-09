import { AfstandScherm } from '@/play/AfstandScherm'

/* Een scherm van de app zelf: de partij staat in de link, niet in de pagina. */
export const metadata = { title: 'Op afstand spelen', robots: { index: false, follow: true } }

export default function AfstandPagina() {
  return <AfstandScherm />
}
