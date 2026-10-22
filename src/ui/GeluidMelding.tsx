'use client'

import { useInstellingen, useProfielStore, useToestandGeladen } from '@/progress/store'

/**
 * "Het geluid staat uit", voor wie zonder profiel binnenkomt.
 *
 * Een gast begint stil (zie GAST_INSTELLINGEN): Pip die ongevraagd begon te praten
 * liet ouders schrikken. Maar stil zonder te zeggen dat het kan, betekent dat niemand
 * ontdekt dat Pip alles voorleest, en dat is voor een kind dat nog niet leest de halve
 * app. Dus één regel met één knop. Staat het geluid aan, of is er een profiel, dan is
 * hij weg; de bel in de bovenbalk blijft.
 */
export function GeluidMelding() {
  const { spraak, effecten } = useInstellingen()
  const zetInstelling = useProfielStore((s) => s.zetInstelling)
  const gast = useProfielStore((s) => !s.actiefId)
  // Pas na het inlezen: anders flitst hij in beeld bij een kind mét profiel.
  const geladen = useToestandGeladen()
  if (!geladen || !gast || spraak || effecten) return null
  return (
    <div
      className="card row"
      role="status"
      style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}
    >
      <span>
        <span aria-hidden="true">🔕</span> Het geluid staat uit. Pip kan alles voorlezen.
      </span>
      <button
        type="button"
        className="btn btn--primary"
        onClick={() => {
          zetInstelling('spraak', true)
          zetInstelling('effecten', true)
        }}
      >
        <span aria-hidden="true">🔔</span> Geluid aan
      </button>
    </div>
  )
}
