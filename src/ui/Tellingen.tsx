'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useProfielStore, useToestandGeladen } from '@/progress/store'
import { dagenKlasse, duurKlasse, tel, telScherm } from '@/progress/tellen'

/**
 * Telt welke schermen geopend worden, hoe lang er gespeeld wordt en hoe vaak mensen
 * terugkomen. Anoniem: zie `src/progress/tellen.ts`.
 *
 * Speelduur: van het moment dat de app in beeld komt tot hij uit beeld gaat (tab weg,
 * telefoon op slot), in grove klassen. Terugkomen: bij het openen hoeveel dagen er op
 * dit apparaat geoefend is, ook in klassen. Samen laten die zien wanneer kinderen stoppen
 * zonder dat er een ID nodig is.
 */
export function Tellingen() {
  const pad = usePathname()
  const geladen = useToestandGeladen()
  const zichtbaarSinds = useRef<number | null>(null)

  useEffect(() => {
    telScherm()
  }, [pad])

  useEffect(() => {
    if (!geladen) return
    const dagen = Object.values(useProfielStore.getState().oefendagen ?? {}).reduce(
      (max, d) => Math.max(max, d?.aantal ?? 0),
      0,
    )
    tel('Bezoek', { geoefend: dagen ? dagenKlasse(dagen) : 'nog niet' })
  }, [geladen])

  useEffect(() => {
    if (document.visibilityState === 'visible') zichtbaarSinds.current = Date.now()
    const wissel = () => {
      if (document.visibilityState === 'visible') {
        zichtbaarSinds.current = Date.now()
      } else if (zichtbaarSinds.current !== null) {
        tel('Speelduur', { duur: duurKlasse(Date.now() - zichtbaarSinds.current) })
        zichtbaarSinds.current = null
      }
    }
    document.addEventListener('visibilitychange', wissel)
    return () => document.removeEventListener('visibilitychange', wissel)
  }, [])

  return null
}
