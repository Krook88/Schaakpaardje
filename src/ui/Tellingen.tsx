'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useProfielStore, useToestandGeladen } from '@/progress/store'
import { dagenKlasse, duurKlasse, hoogsteOefendagen, tel, telScherm } from '@/progress/tellen'
import { onStemBron } from '@/audio/voice'

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
    const dagen = hoogsteOefendagen(useProfielStore.getState().oefendagen)
    tel('Bezoek', { geoefend: dagen ? dagenKlasse(dagen) : 'nog niet' })
  }, [geladen])

  // Hoe klinkt Pip op dit apparaat: opname of robotstem? Eén keer per bezoek, bij het
  // eerste geluid. Zegt iets over het toestel, niets over het kind.
  useEffect(() => {
    let gemeld = false
    onStemBron((bron) => {
      if (gemeld) return
      gemeld = true
      tel('Stem', { bron })
    })
    return () => onStemBron(null)
  }, [])

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
