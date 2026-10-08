'use client'

import { useEffect, useState } from 'react'

/**
 * Wat een kind ziet als er iets stukgaat.
 *
 * Zonder dit bestand toont Next.js zijn eigen melding: "Application error: a
 * client-side exception has occurred". Engels, technisch, en voor een kind van vijf
 * een doodlopende weg — het kan niets anders dan de tablet dichtklappen.
 *
 * De verreweg meest voorkomende oorzaak is een halve update: de service worker heeft
 * nog bestanden van de vorige versie in de cache, of er ontbreekt er eentje op de
 * server. Daar is één remedie voor, en die zetten we hier als knop neer: alles wat
 * bewaard is weggooien en opnieuw ophalen. De voortgang van het kind staat in
 * localStorage en blijft dus gewoon staan.
 */
export default function Fout({ error, reset }: { error: Error; reset: () => void }) {
  const [bezig, setBezig] = useState(false)

  useEffect(() => {
    // Naar de console, zodat een ouder of ontwikkelaar wél iets te zien krijgt.
    console.error('Schaakmaatje liep vast:', error)
  }, [error])

  async function opnieuwOphalen() {
    setBezig(true)
    try {
      if ('caches' in window) {
        const namen = await caches.keys()
        await Promise.all(namen.map((n) => caches.delete(n)))
      }
      if ('serviceWorker' in navigator) {
        const registraties = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registraties.map((r) => r.unregister()))
      }
    } catch {
      // Niets aan te doen; herladen helpt vaak alsnog.
    }
    window.location.reload()
  }

  return (
    <main className="page">
      <div className="card stack center" style={{ maxWidth: 460, margin: '10vh auto' }}>
        <span style={{ fontSize: 64 }} aria-hidden="true">
          🐴
        </span>
        <h1 style={{ fontSize: '1.3rem' }}>Oeps, Pip struikelde even</h1>
        <p className="muted">
          Er ging iets mis. Tik op de knop, dan probeert Pip het opnieuw. Je sterren en
          stickers blijven gewoon staan.
        </p>
        <button
          type="button"
          className="btn btn--primary btn--big"
          onClick={opnieuwOphalen}
          disabled={bezig}
          style={{ minHeight: 72 }}
        >
          <span aria-hidden="true" style={{ fontSize: 30 }}>
            ↺
          </span>{' '}
          {bezig ? 'Momentje…' : 'Opnieuw proberen'}
        </button>
        <button type="button" className="btn" onClick={() => reset()}>
          Alleen dit scherm opnieuw
        </button>
        <p className="muted" style={{ fontSize: '0.8rem' }}>
          Blijft het misgaan? Laat een grote mens dit zien: {error.message || 'onbekende fout'}
        </p>
      </div>
    </main>
  )
}
