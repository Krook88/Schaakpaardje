import type { Metadata, Viewport } from 'next'
import '@/ui/globals.css'
import { Instellingen } from '@/ui/Instellingen'
import { ServiceWorker } from '@/ui/ServiceWorker'
import { NAAM, OMSCHRIJVING, SITE, SLOGAN } from '@/seo'

/** Zelfde afspraak als in voice.ts en ServiceWorker.tsx: leeg = domeinwortel. */
const BASIS = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export const metadata: Metadata = {
  // metadataBase maakt van elk relatief pad hieronder een volledige URL. Zonder dit
  // levert og:image een relatief pad op, en dat weigeren WhatsApp en Facebook: dan zie
  // je bij het delen van de link een grijs vlak in plaats van een voorproefje.
  metadataBase: new URL(SITE),
  title: {
    default: 'Schaakmaatje — gratis leren schaken voor kinderen van 3 tot 10',
    // Elke andere pagina zet zijn eigen titel hierin, zodat de merknaam altijd
    // meekomt zonder dat je hem overal moet overtypen.
    template: '%s | Schaakmaatje',
  },
  description: OMSCHRIJVING,
  applicationName: NAAM,
  alternates: { canonical: '/' },
  manifest: `${BASIS}/manifest.webmanifest`,
  icons: { icon: `${BASIS}/icon.svg`, apple: `${BASIS}/icon.svg` },
  appleWebApp: { capable: true, title: 'Schaakmaatje', statusBarStyle: 'default' },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    siteName: NAAM,
    title: 'Schaakmaatje — leer schaken met Pip het schaakpaardje',
    description: OMSCHRIJVING,
    url: '/',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: `${NAAM} — ${SLOGAN}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Schaakmaatje — leer schaken met Pip het schaakpaardje',
    description: OMSCHRIJVING,
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4e7a54',
}

/**
 * Wat deze site ís, in de taal die zoekmachines lezen (schema.org).
 *
 * Twee dingen tegelijk: een WebSite met een naam, en een SoftwareApplication die gratis
 * is en voor kinderen bedoeld. Dat laatste is het belangrijkste stukje — "gratis" en
 * "3 tot 10 jaar" zijn precies waar een ouder op filtert, en dit is de enige manier om
 * dat als feit door te geven in plaats van als zin in een alinea.
 */
const GEGEVENS = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#site`,
      name: NAAM,
      url: SITE,
      inLanguage: 'nl-NL',
      description: OMSCHRIJVING,
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE}/#app`,
      name: NAAM,
      alternateName: SLOGAN,
      url: SITE,
      applicationCategory: 'EducationalApplication',
      applicationSubCategory: 'Schaken',
      operatingSystem: 'Web, iOS, Android',
      inLanguage: 'nl-NL',
      description: OMSCHRIJVING,
      image: `${SITE}/og.png`,
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      audience: {
        '@type': 'PeopleAudience',
        suggestedMinAge: 3,
        suggestedMaxAge: 10,
      },
      educationalUse: 'Schaakles',
      teaches: 'Schaken: het bord, de stukken, schaak, mat, rokade, notatie en eindspel',
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        {/*
          Gestructureerde gegevens: hiermee weet een zoekmachine wát dit is in plaats van
          alleen wélke woorden erop staan. Dat levert de rijkere weergave in de
          resultaten op — de naam, dat het gratis is, en de leeftijd waarvoor het bedoeld
          is. Het staat in de HTML zelf en heeft dus geen JavaScript nodig, wat hier het
          hele punt is: de rest van de app rendert pas ná het laden.
        */}
        <script
          type="application/ld+json"
          // De inhoud is een vaste constante uit onze eigen code, geen invoer van buiten.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(GEGEVENS) }}
        />
        <Instellingen />
        {children}
        <ServiceWorker />
      </body>
    </html>
  )
}
