'use client'

import { useEffect } from 'react'
import { zegLaatsteZinNogEens } from '@/audio/voice'
import { useInstellingen, useProfielStore, useToestandGeladen } from '@/progress/store'

/**
 * Is het geluid deze keer al eens aangezet? Dan komt de melding niet meer terug.
 * Een kind dat daarna bewust de bel uitzet, kreeg anders de melding weer in beeld
 * en het bord 160 px omlaag geschoven: dat voelt als straf voor een keuze.
 */
let alAangezet = false

/**
 * "Het geluid staat uit", voor wie zonder profiel binnenkomt.
 *
 * Een gast begint stil (zie GAST_INSTELLINGEN): Pip die ongevraagd begon te praten
 * liet ouders schrikken. Maar stil zonder te zeggen dat het kan, betekent dat niemand
 * ontdekt dat Pip alles voorleest, en dat is voor een kind dat nog niet leest de halve
 * app. Dus één regel met één knop, met opzet klein en niet in de kleur van "Verder":
 * de les is de hoofdzaak, het geluid de bijzaak. De bel in de bovenbalk blijft.
 */
export function GeluidMelding() {
  const { spraak, effecten } = useInstellingen()
  const zetInstelling = useProfielStore((s) => s.zetInstelling)
  const gast = useProfielStore((s) => !s.actiefId)
  // Pas na het inlezen: anders flitst hij in beeld bij een kind mét profiel.
  const geladen = useToestandGeladen()
  const aan = spraak || effecten
  useEffect(() => {
    if (geladen && aan) alAangezet = true
  }, [geladen, aan])
  if (!geladen || !gast || aan || alAangezet) return null
  return (
    <div
      className="card row"
      role="status"
      style={{ flexWrap: 'nowrap', gap: 10, padding: '6px 6px 6px 14px', marginBottom: 14 }}
    >
      <span style={{ flex: 1, fontSize: '0.95rem', lineHeight: 1.3 }}>
        <span aria-hidden="true">🔕</span> Pip leest alles voor, als je het geluid aanzet.
      </span>
      <button
        type="button"
        className="btn"
        style={{ flexShrink: 0, padding: '0 14px' }}
        onClick={() => {
          zetInstelling('spraak', true)
          zetInstelling('effecten', true)
          zegLaatsteZinNogEens()
        }}
      >
        <span aria-hidden="true">🔔</span> Geluid aan
      </button>
    </div>
  )
}
