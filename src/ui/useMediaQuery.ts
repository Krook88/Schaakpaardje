'use client'

import { useEffect, useState } from 'react'

/**
 * Of een media query nu klopt. Eerst `false`, zodat de voorgerenderde HTML en de eerste
 * tekening in de browser gelijk zijn; daarna volgt hij het scherm (draaien, venster).
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
