'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Kop } from '@/ui/Kop'
import { Pip } from '@/ui/Pip'
import { TEGEN_WIE, TEGEN_WIE_OUDER } from '@/content/voice'
import { BOTS } from '@/engine/bots'
import { OPSTELLING } from '@/play/opstellingen'
import { useGespeeld, useModus, type Modus } from '@/progress/store'

/** Eén tot drie paardjes, afgeleid uit de volgorde: BOTS staat op sterkte gesorteerd. */
function sterkte(index: number): 1 | 2 | 3 {
  return (Math.min(3, 1 + Math.floor(index / 3)) as 1 | 2 | 3)
}

/**
 * Hoeveel tegenstanders er meteen op het scherm staan, per modus.
 *
 * Alle zeven stonden op één rij, van Mila de Muis tot Bram de Beer die altijd zijn
 * beste zet speelt. Voor een vierjarige is die laatste geen keuze maar frustratie: hij
 * ziet zeven even grote knoppen en tikt net zo goed de onderste. De rest verdwijnt niet
 * — hij staat een tik verderop, en wie hem zoekt vindt hem meteen.
 */
const METEEN_ZICHTBAAR: Record<Modus, number> = { pip: 3, ontdekker: 5, schaker: 7 }

export default function Spelen() {
  const gespeeld = useGespeeld()
  const modus = useModus()
  const [alles, setAlles] = useState(false)
  const grens = METEEN_ZICHTBAAR[modus]
  const zichtbaar = alles ? BOTS : BOTS.slice(0, grens)
  const verborgen = BOTS.length - zichtbaar.length

  return (
    <main className="page">
      <Kop titel="Een partijtje" terug="/" />
      <div className="stack">
        <Pip zegt={modus === 'schaker' ? TEGEN_WIE_OUDER : TEGEN_WIE} stemming="blij" />

        {gespeeld && (
          <p className="muted">
            Je won er {gespeeld.gewonnen}, verloor er {gespeeld.verloren} en speelde {gespeeld.remise}{' '}
            keer gelijk.
          </p>
        )}

        <div style={{ display: 'grid', gap: 12 }}>
          {zichtbaar.map((bot, i) => (
            <Link
              key={bot.id}
              href={`/spelen/${bot.id}/`}
              className="btn btn--big"
              style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '14px 18px', height: 'auto', minHeight: 78 }}
            >
              <span style={{ fontSize: 32 }} aria-hidden="true">
                {bot.emoji}
              </span>
              <span style={{ display: 'grid', gap: 2, flex: 1 }}>
                <strong>{bot.naam}</strong>
                <small className="muted" style={{ fontWeight: 400 }}>
                  {OPSTELLING[bot.id]?.uitleg ?? bot.tagline}
                </small>
              </span>
              {/* De acht kaarten verschilden alleen in het dier. Een kind dat nog niet
                  leest kon niet zien welke makkelijk was. De hoefijzers wel. */}
              <span aria-label={`sterkte ${sterkte(i)} van 3`} style={{ letterSpacing: 2 }}>
                {Array.from({ length: 3 }, (_, n) => (
                  <span key={n} aria-hidden="true" style={{ opacity: n < sterkte(i) ? 1 : 0.25 }}>
                    🐴
                  </span>
                ))}
              </span>
            </Link>
          ))}

          {verborgen > 0 && (
            <button
              type="button"
              className="btn btn--big"
              onClick={() => setAlles(true)}
              style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '14px 18px', minHeight: 66 }}
            >
              <span style={{ fontSize: 30 }} aria-hidden="true">
                🐴
              </span>
              <span style={{ flex: 1 }}>Nog {verborgen} tegenstanders — die denken beter na</span>
            </button>
          )}

          <Link
            href="/spelen/samen/"
            className="btn btn--big"
            style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '14px 18px', height: 'auto', minHeight: 78 }}
          >
            <span style={{ fontSize: 32 }} aria-hidden="true">
              👨‍👩‍👧
            </span>
            <span style={{ display: 'grid', gap: 2 }}>
              <strong>Samen spelen</strong>
              <small className="muted" style={{ fontWeight: 400 }}>
                Met z’n tweeën op één tablet.
              </small>
            </span>
          </Link>
        </div>

        <p className="muted" style={{ fontSize: '0.88rem' }}>
          Eén paardje is heel makkelijk, drie paardjes denkt echt na. Begin gerust onderaan.
        </p>
      </div>
    </main>
  )
}
