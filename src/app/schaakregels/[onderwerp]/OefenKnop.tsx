'use client'

import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { apparaatKlasse, hoogsteOefendagen, tel } from '@/progress/tellen'
import { useProfielStore } from '@/progress/store'

/**
 * Een link van een regelpagina naar een les. Een derde van de nieuwe bezoekers komt op een
 * regelpagina binnen, maar hoeveel er doorklikten naar een les was niet te zien
 * (november 2026). Alleen het onderwerp, welke link, en of er op dit apparaat al eens
 * geoefend is: dat zegt iets over het toestel, niets over het kind.
 */
export function OefenKnop({
  href,
  onderwerp,
  plek,
  className,
  style,
  children,
}: {
  href: string
  onderwerp: string
  plek: 'boven' | 'onder' | 'begin'
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className={className}
      style={style}
      onClick={() =>
        tel('Regel naar les', {
          onderwerp,
          plek,
          apparaat: apparaatKlasse(hoogsteOefendagen(useProfielStore.getState().oefendagen)),
        })
      }
    >
      {children}
    </Link>
  )
}
