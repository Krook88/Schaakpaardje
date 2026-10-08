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
    navigator.serviceWorker.register(`${basis}/sw.js`).catch(() => {
      // stil falen: offline spelen is een extraatje, geen voorwaarde
    })
  }, [])
  return null
}
