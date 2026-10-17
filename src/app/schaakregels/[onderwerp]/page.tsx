import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { lesMet } from '@/content'
import { SCHAAKREGELS, onderwerpMet } from '@/content/schaakregels'
import { SITE, VOOR_KINDEREN, deelkaart, kruimels } from '@/seo'
import { Gegevens } from '@/ui/Gegevens'
import { Animatiebord } from '@/uitleg/Animatiebord'
import { bouwBeelden } from '@/uitleg/beelden'
import { Beeldmerk } from '../Beeldmerk'
import s from '../Schaakregels.module.css'

/**
 * Eén schaakregel, uitgelegd met een bord dat het voordoet.
 *
 * Een server-component: de tekst, de vragen en alle stappen van de animaties staan in de
 * gebouwde HTML. Alleen het bord zelf wordt in de browser levend.
 */

export function generateStaticParams() {
  return SCHAAKREGELS.map((o) => ({ onderwerp: o.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ onderwerp: string }>
}): Promise<Metadata> {
  const o = onderwerpMet((await params).onderwerp)
  if (!o) return {}
  const url = `${SITE}/schaakregels/${o.slug}/`
  return {
    title: o.zoektitel,
    description: o.omschrijving,
    alternates: { canonical: url },
    ...deelkaart({ titel: o.vraag, omschrijving: o.omschrijving, url }),
  }
}

export default async function Onderwerp({ params }: { params: Promise<{ onderwerp: string }> }) {
  const o = onderwerpMet((await params).onderwerp)
  if (!o) notFound()
  const url = `${SITE}/schaakregels/${o.slug}/`
  const lessen = o.lessen.flatMap((id) => lesMet(id) ?? [])
  const i = SCHAAKREGELS.indexOf(o)
  const volgende = SCHAAKREGELS[(i + 1) % SCHAAKREGELS.length]

  const gegevens = {
    '@context': 'https://schema.org',
    '@graph': [
      kruimels([
        { naam: 'Schaakmaatje', url: `${SITE}/` },
        { naam: 'Schaakregels', url: `${SITE}/schaakregels/` },
        { naam: o.vraag, url },
      ]),
      {
        '@type': 'LearningResource',
        '@id': `${url}#uitleg`,
        name: o.vraag,
        headline: o.vraag,
        description: o.omschrijving,
        url,
        learningResourceType: 'Uitleg',
        ...VOOR_KINDEREN,
      },
      {
        '@type': 'FAQPage',
        mainEntity: o.vragen.map(([vraag, antwoord]) => ({
          '@type': 'Question',
          name: vraag,
          acceptedAnswer: { '@type': 'Answer', text: antwoord },
        })),
      },
    ],
  }

  return (
    <main className={s.pagina}>
      <Gegevens data={gegevens} />
      <nav className={s.kruimels} aria-label="Kruimelpad">
        <Link href="/">Schaakmaatje</Link> › <Link href="/schaakregels/">Schaakregels</Link> ›{' '}
        <span aria-current="page">{o.vraag}</span>
      </nav>

      <header className={s.held}>
        <Beeldmerk onderwerp={o} groot />
        <div className={s.heldTekst}>
          <h1>{o.vraag}</h1>
          <p className={s.antwoord}>{o.antwoord}</p>
        </div>
      </header>

      {o.delen.map((d) => (
        <section key={d.kop} className={s.deel}>
          <h2>{d.kop}</h2>
          <div className={s.tekst}>
            {d.tekst.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
          {d.animatie && (
            <div className={s.bordvak}>
              <Animatiebord
                id={d.animatie.id}
                titel={d.animatie.titel}
                beschrijving={d.animatie.beschrijving}
                beelden={bouwBeelden(d.animatie)}
              />
            </div>
          )}
        </section>
      ))}

      <section className={s.thuis}>
        <h2>Thuis oefenen, aan een echt bord</h2>
        <p>{o.thuis}</p>
      </section>

      <section className={s.deel}>
        <h2>Vaak gevraagd</h2>
        <div className={s.vragen}>
          {o.vragen.map(([vraag, antwoord]) => (
            <details key={vraag}>
              <summary>{vraag}</summary>
              <p>{antwoord}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={s.deel}>
        <h2>Zelf oefenen met Pip</h2>
        <p className={s.tekst}>
          In Schaakmaatje oefent je kind dit in korte lessen. Pip leest alles voor, dus lezen
          hoeft nog niet. Gratis en zonder account.
        </p>
        <ul className={s.lessen}>
          {lessen.map((les) => (
            <li key={les.id}>
              <Link href={`/les/${les.id}/`}>
                <span aria-hidden="true" className={s.icoon}>
                  {les.icoon}
                </span>
                <span>
                  <strong>{les.titel}</strong>
                  <span className={s.doel}>{les.doel}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p>
          <Link href="/" className="btn btn--primary btn--big">
            Begin met Schaakmaatje →
          </Link>
        </p>
      </section>

      <section className={s.deel}>
        <h2>Meer schaakregels</h2>
        <p>
          Hierna: <Link href={`/schaakregels/${volgende.slug}/`}>{volgende.vraag}</Link>
        </p>
        <ul className={s.chips}>
          {SCHAAKREGELS.filter((x) => x !== o).map((x) => (
            <li key={x.slug}>
              <Link href={`/schaakregels/${x.slug}/`}>{x.vraag}</Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
