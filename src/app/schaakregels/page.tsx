import type { Metadata } from 'next'
import Link from 'next/link'
import { ALLE_LESSEN } from '@/content'
import { SCHAAKREGELS, onderwerpMet } from '@/content/schaakregels'
import { SITE, deelkaart, kruimels } from '@/seo'
import { Gegevens } from '@/ui/Gegevens'
import { Animatiebord } from '@/uitleg/Animatiebord'
import { bouwBeelden } from '@/uitleg/beelden'
import { Beeldmerk } from './Beeldmerk'
import s from './Schaakregels.module.css'

const OMSCHRIJVING =
  'De schaakregels voor kinderen, met bewegende borden: hoe de stukken lopen, rokade, en passant, schaak, mat en pat. Gratis, in het Nederlands.'

export const metadata: Metadata = {
  title: 'Schaakregels voor kinderen, uitgelegd met bewegende borden',
  description: OMSCHRIJVING,
  alternates: { canonical: `${SITE}/schaakregels/` },
  ...deelkaart({ titel: 'Schaakregels voor kinderen', omschrijving: OMSCHRIJVING, url: `${SITE}/schaakregels/` }),
}

/**
 * Het overzicht van de schaakregels. Bovenaan één bord dat al iets voordoet, zodat je
 * meteen ziet wat je op de pagina's erachter krijgt.
 */
export default function Schaakregels() {
  const paard = onderwerpMet('paard')!.delen[0].animatie!
  const gegevens = {
    '@context': 'https://schema.org',
    '@graph': [
      kruimels([
        { naam: 'Schaakmaatje', url: `${SITE}/` },
        { naam: 'Schaakregels', url: `${SITE}/schaakregels/` },
      ]),
      {
        '@type': 'ItemList',
        name: 'Schaakregels voor kinderen',
        itemListElement: SCHAAKREGELS.map((o, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: o.vraag,
          url: `${SITE}/schaakregels/${o.slug}/`,
        })),
      },
    ],
  }

  return (
    <main className={s.pagina}>
      <Gegevens data={gegevens} />
      <nav className={s.kruimels} aria-label="Kruimelpad">
        <Link href="/">Schaakmaatje</Link> › <span aria-current="page">Schaakregels</span>
      </nav>

      <header className={s.held}>
        <div className={s.heldTekst}>
          <h1>Schaakregels voor kinderen</h1>
          <p className={s.antwoord}>
            Alle regels van het schaken, elk op een bord dat het voordoet. Voor ouders die het
            zelf even willen opfrissen, en om samen met je kind naar te kijken.
          </p>
        </div>
      </header>

      <section className={s.deel}>
        <div className={s.bordvak}>
          <Animatiebord
            id="voorproef"
            titel="Zo ziet het eruit: het paard springt in een L"
            beschrijving={paard.beschrijving}
            beelden={bouwBeelden(paard)}
          />
        </div>
      </section>

      <section className={s.deel}>
        <h2>Alle regels</h2>
        <ul className={s.tegels}>
          {SCHAAKREGELS.map((o) => (
            <li key={o.slug}>
              <Link href={`/schaakregels/${o.slug}/`} className={s.tegel}>
                <Beeldmerk onderwerp={o} />
                <span>
                  <strong>{o.vraag}</strong>
                  <span className={s.doel}>{o.kort}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={s.thuis}>
        <h2>In welke volgorde leer je een kind schaken?</h2>
        <p>
          Eén ding tegelijk. Begin bij het bord, dan de toren en de loper: de toren recht, de
          loper schuin, allebei in lange lijnen, en daarom het makkelijkst. Dan de dame, het
          paard, de koning en als laatste de pion, die de meeste regels heeft. Daarna komt
          wat de stukken waard zijn, aanvallen en verdedigen, en schaak.
        </p>
        <p>
          Schaakmat komt pas als dat allemaal zit. Mat zien vraagt dat je van alle stukken
          tegelijk overziet waar ze heen kunnen, en een kind dat nog nadenkt over hoe de loper
          loopt, heeft daar weinig aan. In Schaakmaatje is dat de volgorde van de{' '}
          <Link href="/lessen/">{ALLE_LESSEN.length} lessen</Link>, en meer over de aanpak staat
          op <Link href="/over/">de pagina voor ouders</Link>.
        </p>
        <p>
          <Link href={`/les/${ALLE_LESSEN[0].id}/`} className="btn btn--primary btn--big">
            Probeer de eerste les →
          </Link>
        </p>
      </section>
    </main>
  )
}
