import { notFound } from 'next/navigation'
import { DiplomaScherm } from '@/diploma/DiplomaScherm'
import { DIPLOMAS, type DiplomaSoort } from '@/content/diplomas'

/* Een scherm van de app zelf: zonder profiel valt er niets te lezen, dus noindex. */
export const metadata = { title: 'Diploma', robots: { index: false, follow: true } }

export function generateStaticParams() {
  return DIPLOMAS.map((d) => ({ soort: d.soort }))
}

export default async function DiplomaPagina({ params }: { params: Promise<{ soort: string }> }) {
  const { soort } = await params
  if (!DIPLOMAS.some((d) => d.soort === soort)) notFound()
  return <DiplomaScherm soort={soort as DiplomaSoort} />
}
