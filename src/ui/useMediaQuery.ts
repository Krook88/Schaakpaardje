'use client'

import { useEffect, useState } from 'react'

/**
 * Of een media query nu klopt. Eerst `false`, zodat de voorgerenderde HTML en de eerste
 * tekening in de browser gelijk zijn; daarna volgt hij het scherm (draaien, venster).
 * Gevolg, en geaccepteerd: wat ervan afhangt (Pip groot liggend) springt één keer om
 * na het laden. Pip staat in een eigen kolom, het bord verschuift er niet door.
 */
export function useMediaQuery(query: string): boolean {
  const [klopt, setKlopt] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const bij = () => setKlopt(mq.matches)
    bij()
    mq.addEventListener('change', bij)
    return () => mq.removeEventListener('change', bij)
  }, [query])
  return klopt
}
