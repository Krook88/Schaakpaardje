import { LiveScherm } from '@/play/LiveScherm'

/* Een scherm van de app zelf: welke partij het is, staat achter het hekje van de link. */
export const metadata = { title: 'Live met een vriendje', robots: { index: false, follow: true } }

export default function LivePagina() {
  return <LiveScherm />
}
