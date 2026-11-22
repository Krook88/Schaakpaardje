'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { tel } from '@/progress/tellen'

/**
 * De knop van een regelpagina naar de les. Een derde van de nieuwe bezoekers komt op een
 * regelpagina binnen, maar hoeveel er doorklikken naar een les was niet te zien
 * (november 2026). Alleen het onderwerp en welke knop: niets over het kind.
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
  plek: 'boven' | 'onder'
  className: string
  style?: React.CSSProperties
  children: ReactNode
}) {
  return (
    <Link href={href} className={className} style={style} onClick={() => tel('Regel naar les', { onderwerp, plek })}>
      {children}
    </Link>
  )
}
