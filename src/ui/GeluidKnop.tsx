'use client'

import { useInstellingen, useProfielStore } from '@/progress/store'

/**
 * Geluid aan of uit, voor het kind zelf.
 *
 * De instellingen staan achter het rekenslot, en dat is goed voor dingen als de
 * leeftijd of alles wissen. Maar "Pip even stil" is geen ouderbeslissing: een kind in
 * de wachtkamer of naast een slapend broertje moet dat zelf kunnen, met één tik en
 * zonder te lezen. Dus één knop met een plaatje, die Pip en de geluidjes samen uit
 * en aan zet. Stil betekent stil.
 *
 * De luidspreker bij Pip blijft het doen: wie toch wil horen wat er staat, tikt daar.
 * Apart instellen (Pip uit, geluidjes aan) kan in het ouderscherm.
 *
 * Een bel en geen luidspreker: de luidspreker staat al in Pips ballon en betekent daar
 * "zeg het nog eens", bijna het omgekeerde. Twee keer hetzelfde plaatje met een
 * tegengestelde betekenis, en een kind dat Pip wil horen zet alles uit.
 */
export function GeluidKnop({ className = '' }: { className?: string }) {
  const { spraak, effecten } = useInstellingen()
  const zetInstelling = useProfielStore((s) => s.zetInstelling)
  const actief = useProfielStore((s) => s.actiefId)
  if (!actief) return null
  const aan = spraak || effecten
  return (
    <button
      type="button"
      className={`btn btn--ghost ${className}`}
      aria-pressed={aan}
      aria-label={aan ? 'Geluid uitzetten' : 'Geluid aanzetten'}
      title={aan ? 'Geluid uitzetten' : 'Geluid aanzetten'}
      onClick={() => {
        zetInstelling('spraak', !aan)
        zetInstelling('effecten', !aan)
      }}
      style={{ minWidth: 56 }}
    >
      <span aria-hidden="true">{aan ? '🔔' : '🔕'}</span>
    </button>
  )
}
