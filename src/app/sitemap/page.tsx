import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ALLE_LESSEN } from '@/content'
import { SITE, deelkaart, kruimels } from '@/seo'
import { Gegevens } from '@/ui/Gegevens'
import { LESSEN_PER_WERELD, REGELS, VOOR_OUDERS } from '@/vindbaar'
import s from '../over/Over.module.css'
import k from './Sitemap.module.css'

/**
 * Alle pagina's op één leesbare pagina: voor een ouder die iets zoekt, en voor Google.
 *
 * `sitemap.xml` vertelt Google wélke pagina's er zijn. Deze pagina laat zien hoe ze
 * samenhangen: elke les en elke schaakregel is hier één gewone link vanaf een pagina die
 * zelf vanaf de startpagina gelinkt is. Een pagina die alleen in de sitemap staat en
 * nergens gelinkt is, vindt Google wel, maar vindt hij minder belangrijk.
 *
 * Een server-component: alles staat in de gebouwde HTML, zonder JavaScript. De lijst komt
 * uit `src/vindbaar.ts`, dezelfde als die van `sitemap.xml`.
 */

const OMSCHRIJVING =
  'Alle pagina\'s van Schaakmaatje op een rij: voor ouders, de schaakregels uitgelegd, en alle schaaklessen per wereld.'

export const metadata: Metadata = {
  title: "Alle pagina's",
  description: OMSCHRIJVING,
  alternates: { canonical: `${SITE}/sitemap/` },
  ...deelkaart({ titel: "Alle pagina's | Schaakmaatje", omschrijving: OMSCHRIJVING, url: `${SITE}/sitemap/` }),
}

/** Tekstvariant van een schaakstuk, zodat iOS er geen emoji van maakt. */
const T = '︎'

function Kop({ stuk, children }: { stuk: string; children: ReactNode }) {
  return (
    <div className={s.kop}>
      <span aria-hidden="true" className={s.stuk}>
        {stuk}
        {T}
      </span>
      <h2>{children}</h2>
    </div>
  )
}

const GEGEVENS = {
  '@context': 'https://schema.org',
  ...kruimels([
    { naam: 'Schaakmaatje', url: `${SITE}/` },
    { naam: "Alle pagina's", url: `${SITE}/sitemap/` },
  ]),
}

export default function Sitemap() {
  return (
    <main className={s.pagina}>
      <Gegevens data={GEGEVENS} />
      <p style={{ margin: 0 }}>
        <Link href="/" className={s.terug}>
          ← Naar de app
        </Link>
      </p>

      <section>
        <p className={s.oogje}>Overzicht</p>
        <h1 style={{ fontSize: 'clamp(1.9rem, 6.2vw, 3rem)', lineHeight: 1.05 }}>
          Alle pagina&apos;s: schaakregels en schaaklessen voor kinderen
        </h1>
        <div className={s.knoppen}>
          <Link href={`/les/${ALLE_LESSEN[0].id}/`} className="btn btn--primary btn--big">
            <span aria-hidden="true">▶︎</span> Probeer de eerste les
          </Link>
        </div>
      </section>

      <section>
        <Kop stuk="♔">Voor ouders</Kop>
        <ul className={k.lijst}>
          {VOOR_OUDERS.filter((p) => p.pad !== '/sitemap/').map((p) => (
            <li key={p.pad}>
              <Link href={p.pad}>{p.naam}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Kop stuk="♖">Schaakregels</Kop>
        <ul className={k.lijst}>
          {REGELS.map((p) => (
            <li key={p.pad}>
              <Link href={p.pad}>{p.naam}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Kop stuk="♘">Lessen, per wereld</Kop>
        <div className={k.werelden}>
          {LESSEN_PER_WERELD.map((w) => (
            <div key={w.wereld} className={k.wereld}>
              <h3>
                <span className={k.nummer}>Wereld {w.nummer}</span>
                {w.wereld}
              </h3>
              <ul className={k.lijst}>
                {w.lessen.map((p) => (
                  <li key={p.pad}>
                    <Link href={p.pad}>{p.naam}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Na 15 werelden scrollen nog een weg terug naar de app. */}
      <p style={{ margin: 0 }}>
        <Link href={`/les/${ALLE_LESSEN[0].id}/`} className="btn btn--primary btn--big">
          <span aria-hidden="true">▶︎</span> Probeer de eerste les
        </Link>
      </p>
    </main>
  )
}
