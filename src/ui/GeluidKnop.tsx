'use client'

import { useEffect } from 'react'
import { speak, wachtTotUitgesproken } from '@/audio/voice'
import { EVEN_STIL, WEER_GELUID } from '@/content/voice'
import { useInstellingen, useProfielStore } from '@/progress/store'

/** Staat het geluid uit via de bel, en niet via het ouderscherm? Alleen op dit toestel. */
const STIL_VIA_BEL = 'schaakmaatje-stil-via-bel'
/** In deze sessie al gezien: dan blijft het stil tot het kind zelf weer tikt. */
const DEZE_KEER = 'schaakmaatje-stil-deze-keer'

function lees(opslag: () => Storage, sleutel: string): string | null {
  try {
    return opslag().getItem(sleutel)
  } catch {
    return null
  }
}
function schrijf(opslag: () => Storage, sleutel: string, waarde: string | null) {
  try {
    if (waarde === null) opslag().removeItem(sleutel)
    else opslag().setItem(sleutel, waarde)
  } catch {
    // Geen opslag (privévenster): dan gewoon niet onthouden.
  }
}

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
 * Een kleuter die uit nieuwsgierigheid op de bel tikte, had daarna een app zonder stem
 * en wist niet waarom — ook de volgende dag nog (spelontwerper). Nu zegt Pip eerst dat
 * hij stil wordt, en begint een nieuw bezoek weer met geluid. Wat de ouder in het
 * ouderscherm uitzet, blijft wel uit: dat loopt niet via deze knop.
 *
 * Een bel en geen luidspreker: de luidspreker staat al in Pips ballon en betekent daar
 * "zeg het nog eens", bijna het omgekeerde. Twee keer hetzelfde plaatje met een
 * tegengestelde betekenis, en een kind dat Pip wil horen zet alles uit.
 */
export function GeluidKnop({ className = '' }: { className?: string }) {
  const { spraak, effecten } = useInstellingen()
  const zetInstelling = useProfielStore((s) => s.zetInstelling)
  const actief = useProfielStore((s) => s.actiefId)
  const aan = spraak || effecten

  // Een nieuw bezoek: stond het geluid uit via de bel, dan gaat het weer aan.
  useEffect(() => {
    if (!actief) return
    if (lees(() => sessionStorage, DEZE_KEER)) return
    if (lees(() => localStorage, STIL_VIA_BEL)) {
      zetInstelling('spraak', true)
      zetInstelling('effecten', true)
      schrijf(() => localStorage, STIL_VIA_BEL, null)
    }
    schrijf(() => sessionStorage, DEZE_KEER, '1')
  }, [actief, zetInstelling])

  if (!actief) return null
  return (
    <button
      type="button"
      className={`btn btn--ghost ${className}`}
      aria-pressed={aan}
      aria-label={aan ? 'Geluid uitzetten' : 'Geluid aanzetten'}
      title={aan ? 'Geluid uitzetten' : 'Geluid aanzetten'}
      onClick={() => {
        if (aan) {
          // Eerst zeggen, dan pas stil: anders gebeurt er voor het kind gewoon niets.
          schrijf(() => localStorage, STIL_VIA_BEL, '1')
          void speak(EVEN_STIL, true).then(async () => {
            await wachtTotUitgesproken()
            zetInstelling('spraak', false)
            zetInstelling('effecten', false)
          })
        } else {
          schrijf(() => localStorage, STIL_VIA_BEL, null)
          zetInstelling('spraak', true)
          zetInstelling('effecten', true)
          void speak(WEER_GELUID, true)
        }
      }}
      style={{ minWidth: 56 }}
    >
      <span aria-hidden="true">{aan ? '🔔' : '🔕'}</span>
    </button>
  )
}
