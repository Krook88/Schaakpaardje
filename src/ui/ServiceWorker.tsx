'use client'

import { useEffect } from 'react'

/**
 * Meldt de service worker aan, zodat de app na het eerste bezoek offline werkt.
 * Bewust stil: mislukt het (oude browser, privémodus), dan werkt de app gewoon door
 * met internet en merkt niemand er iets van.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') return
    const basis = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
    const meldAan = () =>
      navigator.serviceWorker.register(`${basis}/sw.js`).catch(() => {
        // stil falen: offline spelen is een extraatje, geen voorwaarde
      })
    // Pas als de pagina geladen en rustig is: de installatie haalt wereld 0–2 vooraf op
    // (1,3 MB), en dat mag op 4G niet strijden met de les die het kind nu opent.
    const rustig = () =>
      'requestIdleCallback' in window
        ? (window as Window & { requestIdleCallback: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback(meldAan, { timeout: 4000 })
        : setTimeout(meldAan, 1500)
    if (document.readyState === 'complete') rustig()
    else window.addEventListener('load', rustig, { once: true })
  }, [])
  return null
}
