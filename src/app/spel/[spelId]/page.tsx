import { notFound } from 'next/navigation'
import { MINISPELLEN, minispelMet } from '@/play/minispellen'
import { MinispelScherm } from '@/play/MinispelScherm'

/* Een scherm van de app zelf: zonder profiel valt er niets te lezen, dus noindex. */
export const metadata = { title: 'Een minispel', robots: { index: false, follow: true } }

export function generateStaticParams() {
  return MINISPELLEN.map((s) => ({ spelId: s.id }))
}

export default async function MinispelPagina({ params }: { params: Promise<{ spelId: string }> }) {
  const { spelId } = await params
  if (!minispelMet(spelId)) notFound()
  return <MinispelScherm spelId={spelId} />
}
