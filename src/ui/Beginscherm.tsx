'use client'

import { useEffect, useState } from 'react'

/**
 * "Zet Schaakmaatje op je beginscherm": de app als eigen icoon op telefoon of computer,
 * en openen zonder adresbalk (manifest: display standalone).
 *
 * - Chrome, Edge en Android geven een installatievraag (beforeinstallprompt). Die houden
 *   we vast en tonen hem pas als de ouder op de knop tikt.
 * - Safari op iPhone en iPad kent die vraag niet. Daar legt de knop in twee stappen uit
 *   hoe het moet: Deel, dan "Zet op beginscherm".
 * - Draait de app al als webapp, of kan het in deze browser niet, dan staat er niets.
 *
 * Niets hiervan gaat naar internet: geen telling, geen cookie.
 */
type InstallVraag = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

export function Beginscherm({ tekst = 'Zet op je beginscherm', kaart = false }: { tekst?: string; kaart?: boolean }) {
  const [vraag, setVraag] = useState<InstallVraag | null>(null)
  const [ios, setIos] = useState(false)
  const [uitleg, setUitleg] = useState(false)
  const [klaar, setKlaar] = useState(false)

  useEffect(() => {
    const alsApp =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    if (alsApp) {
      setKlaar(true)
      return
    }
    // iPadOS meldt zich als Mac, maar heeft een touchscherm.
    const ua = navigator.userAgent
    const isIos = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
    setIos(isIos && isSafari)
    const opVraag = (e: Event) => {
      e.preventDefault()
      setVraag(e as InstallVraag)
    }
    const opGeinstalleerd = () => setKlaar(true)
    window.addEventListener('beforeinstallprompt', opVraag)
    window.addEventListener('appinstalled', opGeinstalleerd)
    return () => {
      window.removeEventListener('beforeinstallprompt', opVraag)
      window.removeEventListener('appinstalled', opGeinstalleerd)
    }
  }, [])

  if (klaar || (!vraag && !ios)) return null

  const knop = (
    <div className="stack" style={{ gap: 8 }}>
      <button
        type="button"
        className="btn"
        style={{ minHeight: 56, gap: 10 }}
        onClick={async () => {
          if (vraag) {
            await vraag.prompt()
            const keuze = await vraag.userChoice
            if (keuze.outcome === 'accepted') setKlaar(true)
            setVraag(null)
          } else {
            setUitleg((u) => !u)
          }
        }}
        aria-expanded={ios ? uitleg : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- statische export */}
        <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/icon-192.png`} alt="" width={32} height={32} style={{ borderRadius: 8 }} />
        {tekst}
      </button>
      {ios && uitleg && (
        <ol className="muted" style={{ margin: 0, paddingLeft: 22, lineHeight: 1.5 }}>
          <li>
            Tik onderaan op <strong>Deel</strong> (het vierkantje met het pijltje omhoog).
          </li>
          <li>
            Kies <strong>Zet op beginscherm</strong> en tik op <strong>Voeg toe</strong>.
          </li>
        </ol>
      )}
    </div>
  )
  // Als kaart met kop en uitleg; staat er niets te doen, dan ook geen lege kaart.
  return kaart ? (
    <section className="card stack">
      <h2>Op je beginscherm</h2>
      <p className="muted" style={{ margin: 0 }}>Dan opent Schaakmaatje als een eigen app, met Pip als icoon.</p>
      {knop}
    </section>
  ) : (
    knop
  )
}
