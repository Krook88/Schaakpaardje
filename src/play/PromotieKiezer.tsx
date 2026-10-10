'use client'

import { useEffect, useRef } from 'react'
import type { PieceType } from '@/engine/board'
import { GLYPH } from '@/board/pieces'

const KEUZES: { stuk: PieceType; naam: string }[] = [
  { stuk: 'q', naam: 'Dame' },
  { stuk: 'r', naam: 'Toren' },
  { stuk: 'b', naam: 'Loper' },
  { stuk: 'n', naam: 'Paard' },
]

/**
 * Wat wordt je pion?
 *
 * Alleen voor de oudste groep (modus schaker). Jongere kinderen krijgen altijd een
 * dame: dat leert de pionles ("bijna iedereen kiest de dame"), en een keuzescherm
 * midden in een partij is voor een kind van vijf vooral een onderbreking. Wie ouder
 * is, komt het moment tegen waarop een dame pat geeft en een toren wint; dan moet je
 * kunnen kiezen.
 */
export function PromotieKiezer({
  kleur,
  onKies,
  onAnnuleer,
}: {
  kleur: 'w' | 'b'
  onKies: (stuk: PieceType) => void
  onAnnuleer: () => void
}) {
  const wit = kleur === 'w'
  const eerste = useRef<HTMLButtonElement>(null)
  const annuleer = useRef(onAnnuleer)
  annuleer.current = onAnnuleer
  // Het aangetikte veld gaat op slot en verliest de focus; zet hem op de dame, zodat
  // wie met toetsenbord of schermlezer speelt niet hoeft te zoeken. Escape is "toch niet".
  useEffect(() => {
    eerste.current?.focus()
    const opToets = (e: KeyboardEvent) => e.key === 'Escape' && annuleer.current()
    window.addEventListener('keydown', opToets)
    return () => window.removeEventListener('keydown', opToets)
  }, [])
  // Vast onderaan het scherm: onder het bord stond hij op een telefoon buiten beeld,
  // en met het bord op slot leek de app vast te lopen (layout-review).
  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        padding: '0 12px calc(12px + env(safe-area-inset-bottom))',
      }}
    >
      <div
        className="card stack"
        role="dialog"
        aria-modal="true"
        aria-label="Wat wordt je pion?"
        style={{ maxWidth: 520, margin: '0 auto', boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.25)' }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>Wat wordt je pion?</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
          {KEUZES.map(({ stuk, naam }, i) => (
            <button
              key={stuk}
              ref={i === 0 ? eerste : undefined}
              type="button"
              className="btn"
              onClick={() => onKies(stuk)}
              aria-label={naam}
              style={{ minHeight: 84, flexDirection: 'column', gap: 4, padding: '6px 2px' }}
            >
              {/* Op een vlakje in de kleur van een licht veld: zo zien de stukken er in
                  beide thema's uit als op het bord. Zonder vlakje verdween zwart in donker. */}
              <span
                aria-hidden="true"
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: 'var(--light-sq)',
                  fontFamily: "'Schaakstukken', sans-serif",
                  fontVariantEmoji: 'text',
                  fontSize: 38,
                  lineHeight: 1,
                  color: wit ? '#fcf8ef' : '#2b2823',
                  WebkitTextStroke: wit ? '1.5px #33302a' : '1.2px #efe7d6',
                  paintOrder: 'stroke fill',
                } as React.CSSProperties}
              >
                {GLYPH[stuk]}
              </span>
              <small style={{ fontWeight: 600 }}>{naam}</small>
            </button>
          ))}
        </div>
        <button type="button" className="btn btn--ghost" onClick={onAnnuleer} style={{ minHeight: 64 }}>
          Toch een andere zet
        </button>
      </div>
    </div>
  )
}
