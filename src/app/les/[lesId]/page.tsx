import { notFound } from 'next/navigation'
import { ALLE_LESSEN, WERELDEN } from '@/content'
import { LessonPlayer } from '@/lesson/LessonPlayer'

export function generateStaticParams() {
  return ALLE_LESSEN.map((les) => ({ lesId: les.id }))
}

export default async function LesPagina({ params }: { params: Promise<{ lesId: string }> }) {
  const { lesId } = await params
  const les = ALLE_LESSEN.find((l) => l.id === lesId)
  const wereld = WERELDEN.find((w) => w.id === les?.wereldId)
  if (!les || !wereld) notFound()
  return <LessonPlayer les={les} wereld={wereld} />
}
