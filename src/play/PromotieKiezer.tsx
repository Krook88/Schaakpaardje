'use client'

import type { PieceType } from '@/engine/board'
import { GLYPH } from '@/board/pieces'

const KEUZES: { stuk: PieceType; naam: string }[] = [
  { stuk: 'q', naam: 'Dame' },
  { stuk: 'r', naam: 'Toren' },
  { stuk: 'b', naam: 'Loper' },
  { stuk: 'n', naam: 'Paard' },
]

/**
 * Waar wordt je pion in?
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
  return (
    <div className="card stack" role="dialog" aria-label="Waar wordt je pion in?">
      <p style={{ margin: 0 }}>Waar wordt je pion in?</p>
      <div className="row" style={{ gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {KEUZES.map(({ stuk, naam }) => (
          <button
            key={stuk}
            type="button"
            className="btn btn--big"
            onClick={() => onKies(stuk)}
            aria-label={naam}
            style={{ minWidth: 72, minHeight: 72, flexDirection: 'column', gap: 2, padding: '6px 10px' }}
          >
            <span
              aria-hidden="true"
              style={{
                fontFamily: "'Schaakstukken', sans-serif",
                fontVariantEmoji: 'text',
                fontSize: 40,
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
      <button type="button" className="btn btn--ghost" onClick={onAnnuleer}>
        Toch een andere zet
      </button>
    </div>
  )
}
