import type { Metadata, Viewport } from 'next'
import '@/ui/globals.css'
import { Instellingen } from '@/ui/Instellingen'
import { ServiceWorker } from '@/ui/ServiceWorker'

/** Zelfde afspraak als in voice.ts en ServiceWorker.tsx: leeg = domeinwortel. */
const BASIS = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export const metadata: Metadata = {
  title: 'Schaakmaatje — leer schaken met Pip',
  description:
    'Leer schaken op z’n Nederlands. Voor kinderen van 3 tot 10 jaar, met Pip het schaakpaardje die alles voorleest.',
  manifest: `${BASIS}/manifest.webmanifest`,
  icons: { icon: `${BASIS}/icon.svg`, apple: `${BASIS}/icon.svg` },
  appleWebApp: { capable: true, title: 'Schaakmaatje', statusBarStyle: 'default' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4e7a54',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        {children}
        <Instellingen />
        <ServiceWorker />
      </body>
    </html>
  )
}
