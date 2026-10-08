import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ALLE_LESSEN, WERELDEN } from '@/content'
import { LessonPlayer } from '@/lesson/LessonPlayer'
import { LesUitleg } from '@/lesson/LesUitleg'
import { SITE, deelkaart } from '@/seo'

export function generateStaticParams() {
  return ALLE_LESSEN.map((les) => ({ lesId: les.id }))
}

function zoek(lesId: string) {
  const les = ALLE_LESSEN.find((l) => l.id === lesId)
  const wereld = WERELDEN.find((w) => w.id === les?.wereldId)
  if (!les || !wereld) return null
  const lessen = wereld.lessen
  return { les, wereld, nummer: lessen.findIndex((l) => l.id === les.id) + 1, aantal: lessen.length }
}

/**
 * Een eigen titel en omschrijving per les.
 *
 * Hiervoor hadden negenenveertig lespagina's dezelfde titel en dezelfde omschrijving
 * als de startpagina, en ze verwezen via de canonical uit layout.tsx ook nog eens naar
 * die startpagina. Voor een zoekmachine waren het dus negenenveertig kopieën van iets
 * anders. Nu is elke les een pagina over zijn eigen onderwerp.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lesId: string }>
}): Promise<Metadata> {
  const { lesId } = await params
  const gevonden = zoek(lesId)
  if (!gevonden) return {}
  const { les, wereld } = gevonden
  return {
    title: `${les.titel}: schaakles voor kinderen`,
    description: `${les.doel} Gratis schaakles uit ${wereld.naam}, met Pip het schaakpaardje. Voor kinderen van 3 tot 10 jaar.`,
    alternates: { canonical: `${SITE}/les/${les.id}/` },
    ...deelkaart({
      titel: `${les.titel} | Schaakmaatje`,
      omschrijving: les.doel,
      url: `${SITE}/les/${les.id}/`,
    }),
  }
}

export default async function LesPagina({ params }: { params: Promise<{ lesId: string }> }) {
  const { lesId } = await params
  const gevonden = zoek(lesId)
  if (!gevonden) notFound()
  const { les, wereld, nummer, aantal } = gevonden
  return (
    <LessonPlayer
      les={les}
      wereld={wereld}
      uitleg={<LesUitleg les={les} wereld={wereld} nummer={nummer} aantal={aantal} />}
    />
  )
}
