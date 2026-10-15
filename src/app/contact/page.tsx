import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE, deelkaart } from '@/seo'
import { ContactFormulier } from './ContactFormulier'

/**
 * Contact: een bericht aan de maker. Voor ouders, maar bewust niet achter het rekenslot:
 * Kaj wil dat het makkelijk te vinden is, onderaan elke startpagina naast "hoe
 * Schaakmaatje werkt" en "alle lessen". Een kind dat hier toch komt, kan niet lezen of
 * typen genoeg om iets te versturen; en er staat niets wat een kind uitnodigt.
 */
export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Een fout gezien, een idee of een vraag over Schaakmaatje? Stuur een bericht aan de maker.',
  alternates: { canonical: `${SITE}/contact/` },
  ...deelkaart({
    titel: 'Contact met Schaakmaatje',
    omschrijving: 'Een fout gezien, een idee of een vraag? Stuur een bericht aan de maker.',
    url: `${SITE}/contact/`,
  }),
}

export default function Contact() {
  return (
    <main className="page">
      <article className="stack" style={{ maxWidth: 640, margin: '0 auto' }}>
        <header className="stack" style={{ gap: 8 }}>
          <p className="muted" style={{ margin: 0 }}>
            <Link href="/">← Naar de app</Link> · <Link href="/over/">Over Schaakmaatje</Link> ·{' '}
            <Link href="/lessen/">Alle lessen</Link>
          </p>
          <h1 style={{ fontSize: '1.9rem', margin: 0 }}>Contact</h1>
          <p style={{ fontSize: '1.05rem', margin: 0 }}>
            Een fout gezien, een idee, of loopt je kind ergens vast? Laat het weten. Schaakmaatje
            wordt door één persoon gemaakt, en elk bericht wordt gelezen.
          </p>
        </header>
        <section className="card stack">
          <ContactFormulier />
        </section>
      </article>
    </main>
  )
}
