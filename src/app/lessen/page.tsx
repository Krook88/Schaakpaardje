import type { Metadata } from 'next'
import Link from 'next/link'
import { ALLE_LESSEN, WERELDEN } from '@/content'
import { SITE } from '@/seo'

/**
 * Alle lessen op één statische pagina.
 *
 * Ook deze staat expres buiten de app: geen 'use client', geen wachten op een profiel,
 * dus alles staat gewoon in de HTML. Dat is voor een zoekmachine het verschil tussen
 * een lege pagina en achtenveertig regels Nederlandse schaakuitleg.
 *
 * De omschrijving per les is `doel` — de zin die ook op het ouderscherm staat, in de
 * vorm "Je kind weet dat de toren recht loopt". Dat is precies het soort zin dat een
 * ouder intikt, en hij bestond al; hier wordt hij alleen eindelijk ergens getoond waar
 * je hem zonder de app kunt lezen.
 */
export const metadata: Metadata = {
  title: 'Alle schaaklessen — van het bord tot het eindspel | Schaakmaatje',
  description:
    'Alle 48 schaaklessen van Schaakmaatje op een rij, van licht en donker tot het eindspel. Per les wat je kind erna kan. Gratis, Nederlands, voor 3 tot 10 jaar.',
  alternates: { canonical: `${SITE}/lessen/` },
  openGraph: {
    title: 'Alle schaaklessen van Schaakmaatje',
    description:
      'Alle 48 lessen op een rij, van het bord leren kennen tot het eindspel. Per les wat je kind erna kan.',
    url: `${SITE}/lessen/`,
  },
}

const LEEFTIJD: Record<number, string> = {
  3: 'vanaf 3 jaar',
  5: 'vanaf 5 jaar',
  6: 'vanaf 6 jaar',
  7: 'vanaf 7 jaar',
  8: 'vanaf 8 jaar',
  9: 'vanaf 9 jaar',
}

export default function Lessen() {
  return (
    <main className="page">
      <article className="stack" style={{ maxWidth: 760, margin: '0 auto' }}>
        <header className="stack" style={{ gap: 8 }}>
          <p className="muted" style={{ margin: 0 }}>
            <Link href="/">← Naar de app</Link> · <Link href="/over/">Over Schaakmaatje</Link>
          </p>
          <h1 style={{ fontSize: '1.9rem', margin: 0 }}>Alle schaaklessen</h1>
          <p style={{ fontSize: '1.05rem', margin: 0 }}>
            {ALLE_LESSEN.length} lessen in {WERELDEN.length} werelden, in de volgorde waarin
            een kind ze tegenkomt. Bij elke les staat wat je kind erna kan. Van het bord leren
            kennen tot het eindspel — en schaakmat komt pas in wereld tien, want daarvoor moet
            je eerst weten hoe de stukken lopen.
          </p>
        </header>

        {WERELDEN.map((wereld) => (
          <section
            key={wereld.id}
            className="card stack"
            style={{ '--toon': wereld.toon } as React.CSSProperties}
          >
            <h2 style={{ margin: 0 }}>
              <span aria-hidden="true">{wereld.emoji}</span> Wereld {wereld.nummer}:{' '}
              {wereld.naam}
            </h2>
            <p className="muted" style={{ margin: 0 }}>
              {wereld.belofte} · {LEEFTIJD[wereld.minLeeftijd] ?? `vanaf ${wereld.minLeeftijd} jaar`}
            </p>
            <ol style={{ margin: 0, paddingLeft: 22, display: 'grid', gap: 10 }}>
              {wereld.lessen.map((les) => (
                <li key={les.id}>
                  <h3 style={{ margin: 0, fontSize: '1.02rem' }}>
                    <Link href={`/les/${les.id}/`}>
                      <span aria-hidden="true">{les.icoon}</span> {les.titel}
                    </Link>
                  </h3>
                  <p className="muted" style={{ margin: '2px 0 0' }}>
                    {les.doel}
                  </p>
                </li>
              ))}
            </ol>
            {wereld.minispel && (
              <p style={{ margin: 0 }}>
                <strong>Minispel:</strong>{' '}
                <Link href={`/spel/${wereld.minispel}/`}>
                  {wereld.minispel.replaceAll('-', ' ')}
                </Link>
              </p>
            )}
          </section>
        ))}

        <section className="card stack">
          <h2>Beginnen?</h2>
          <p>
            De lessen zijn gratis en er is geen account voor nodig. Pip leest alles voor, dus
            je kind hoeft nog niet te kunnen lezen.
          </p>
          <p>
            <Link href="/" className="btn btn--primary btn--big">
              Naar de eerste les →
            </Link>
          </p>
        </section>
      </article>
    </main>
  )
}
