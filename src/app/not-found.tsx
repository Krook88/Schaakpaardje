import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Deze pagina bestaat niet',
  robots: { index: false, follow: true },
}

/**
 * Wie een typefout in het adres maakt, of een oude link volgt.
 *
 * Hier stond de standaardpagina van Next.js: "404: This page could not be found." Een
 * Engelse systeemzin in een Nederlandse kinderapp, zonder één link, dus wie hier
 * belandde was weg. En met twee robots-regels in de kop die elkaar tegenspraken: de
 * eigen "noindex" van Next en de "index" uit onze layout.
 *
 * `public/.htaccess` stuurt elke onbekende URL hierheen.
 */
export default function NietGevonden() {
  return (
    <main className="page">
      <div className="stack" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', alignItems: 'center', gap: 18 }}>
        <span aria-hidden="true" style={{ fontSize: 64, lineHeight: 1 }}>
          🐴
        </span>
        <h1 style={{ fontSize: '1.7rem', margin: 0 }}>Deze pagina bestaat niet</h1>
        <p style={{ margin: 0 }}>
          Pip heeft overal gezocht, maar hier staat niets. Misschien zit er een typefout in
          het adres, of is de pagina verhuisd.
        </p>
        <Link href="/" className="btn btn--primary btn--big">
          Naar Schaakmaatje
        </Link>
        <p className="muted" style={{ margin: 0 }}>
          Of bekijk <Link href="/lessen/">alle lessen</Link> en{' '}
          <Link href="/over/">de uitleg voor ouders</Link>.
        </p>
      </div>
    </main>
  )
}
