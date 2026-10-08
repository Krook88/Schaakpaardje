import type { ReactNode } from 'react'

/*
 * Een scherm van de app zelf: zonder profiel staat er niets te lezen.
 *
 * Daarom noindex. Deze schermen stonden in de sitemap én zeiden tegelijk, via de
 * canonical die ze uit layout.tsx erfden, dat de startpagina de echte pagina was.
 * Twee tegengestelde instructies, met als uitkomst dat Google niets indexeerde.
 *
 * Een eigen layout en geen metadata in de pagina zelf, want die is 'use client' en
 * daar mag geen metadata uit geëxporteerd worden.
 */
export const metadata = { title: 'Een partijtje', robots: { index: false, follow: true } }

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
