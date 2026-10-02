import { notFound } from 'next/navigation'
import { BOTS, getBot } from '@/engine/bots'
import { PartijScherm } from '@/play/PartijScherm'

/* Een scherm van de app zelf: zonder profiel valt er niets te lezen, dus noindex. */
export const metadata = { title: 'Een partijtje', robots: { index: false, follow: true } }

export function generateStaticParams() {
  return [...BOTS.map((b) => ({ botId: b.id })), { botId: 'samen' }]
}

export default async function PartijPagina({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = await params
  if (botId !== 'samen' && !getBot(botId)) notFound()
  return <PartijScherm botId={botId} />
}
