'use client'

/**
 * Het vangnet onder het vangnet: fouten die de layout zelf raken, waar error.tsx niet
 * meer bij komt. Dit component vervangt het hele document, dus het draagt zijn eigen
 * html- en body-tag en mag niets uit de app importeren — de kans is groot dat juist
 * dáár het probleem zit. Vandaar losse kleuren in plaats van de tokens.
 */
export default function GlobaleFout({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="nl">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#f6f1e6',
          color: '#22201b',
          font: '18px/1.5 system-ui, sans-serif',
          padding: 24,
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: 64 }}>🐴</div>
          <h1 style={{ fontSize: '1.3rem' }}>Oeps, Pip struikelde even</h1>
          <p style={{ color: '#6b6357' }}>
            Er ging iets mis. Tik op de knop, dan proberen we het opnieuw.
          </p>
          <button
            type="button"
            onClick={() => {
              // Alles weggooien wat bewaard is en helemaal opnieuw ophalen: bij een
              // fout op dit niveau is een halve update de waarschijnlijkste oorzaak.
              const opruimen = async () => {
                try {
                  if ('caches' in window) {
                    for (const naam of await caches.keys()) await caches.delete(naam)
                  }
                  if ('serviceWorker' in navigator) {
                    for (const r of await navigator.serviceWorker.getRegistrations()) {
                      await r.unregister()
                    }
                  }
                } catch {
                  // dan maar gewoon herladen
                }
                window.location.reload()
              }
              void opruimen()
              reset()
            }}
            style={{
              font: 'inherit',
              fontWeight: 700,
              minHeight: 72,
              padding: '0 28px',
              borderRadius: 16,
              border: '2px solid #b35c14',
              background: '#b35c14',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            ↺ Opnieuw proberen
          </button>
          <p style={{ color: '#6b6357', fontSize: '0.8rem' }}>
            Voor een grote mens: {error.message || 'onbekende fout'}
          </p>
        </div>
      </body>
    </html>
  )
}
