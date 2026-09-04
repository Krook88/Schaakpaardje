import type { Metadata, Viewport } from 'next'
import '@/ui/globals.css'
import { ServiceWorker } from '@/ui/ServiceWorker'

export const metadata: Metadata = {
  title: 'Schaakmaatje — leer schaken met Pip',
  description:
    'Leer schaken op z’n Nederlands. Voor kinderen van 3 tot 10 jaar, met Pip het schaakpaardje die alles voorleest.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
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
        <ServiceWorker />
      </body>
    </html>
  )
}
