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
/** De ouder zet het geluid zelf: dan vergeet de bel wat hij onthield. */
export function vergeetBel() {
  schrijf(() => localStorage, STIL_VIA_BEL, null)
}

function leesVlag(): { id: string; spraak: boolean; effecten: boolean } | null {
  try {
    const v = JSON.parse(lees(() => localStorage, STIL_VIA_BEL) ?? 'null')
    return v && typeof v.id === 'string' ? v : null
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
 * hij stil wordt, en begint een nieuw bezoek weer zoals het vóór die tik was. Wat de
 * ouder in het ouderscherm zet, blijft staan: de bel onthoudt alleen zijn eigen tik.
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

  // Een nieuw bezoek: stond het geluid uit via de bel, dan komt terug wat er vóór die
  // tik stond. Alleen voor het kind dat op de bel tikte, en alleen als er sindsdien niets
  // aan veranderd is: wat een ouder in het ouderscherm zet, wint (codebase-review).
  useEffect(() => {
    if (!actief) return
    if (lees(() => sessionStorage, DEZE_KEER)) return
    schrijf(() => sessionStorage, DEZE_KEER, '1')
    const vlag = leesVlag()
    if (!vlag || vlag.id !== actief) return
    schrijf(() => localStorage, STIL_VIA_BEL, null)
    if (!spraak && !effecten) {
      zetInstelling('spraak', vlag.spraak)
      zetInstelling('effecten', vlag.effecten)
    }
  }, [actief, zetInstelling, spraak, effecten])

  if (!actief) return null
  return (
    <button
      type="button"
      className={`btn btn--ghost ${className}`}
      aria-pressed={aan}
      aria-label={aan ? 'Geluid uitzetten' : 'Geluid aanzetten'}
      title={aan ? 'Geluid uitzetten' : 'Geluid aanzetten'}
      onClick={() => {
        if (!actief) return
        if (aan) {
          schrijf(() => localStorage, STIL_VIA_BEL, JSON.stringify({ id: actief, spraak, effecten }))
          const stil = () => {
            zetInstelling('spraak', false)
            zetInstelling('effecten', false)
          }
          // Eerst zeggen, dan pas stil: anders gebeurt er voor het kind gewoon niets. Maar
          // niet als de ouder Pip al had uitgezet.
          if (!spraak) return stil()
          void speak(EVEN_STIL).then(() => wachtTotUitgesproken()).then(stil)
        } else {
          const vlag = leesVlag()
          schrijf(() => localStorage, STIL_VIA_BEL, null)
          const terug = vlag && vlag.id === actief ? vlag : { spraak: true, effecten: true }
          zetInstelling('spraak', terug.spraak)
          zetInstelling('effecten', terug.effecten)
          if (terug.spraak) void speak(WEER_GELUID, true)
        }
      }}
      style={{ minWidth: 56 }}
    >
      <span aria-hidden="true">{aan ? '🔔' : '🔕'}</span>
    </button>
  )
}
