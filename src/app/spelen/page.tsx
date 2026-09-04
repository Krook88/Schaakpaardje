'use client'

import Link from 'next/link'
import { Kop } from '@/ui/Kop'
import { Pip } from '@/ui/Pip'
import { BOTS } from '@/engine/bots'
import { OPSTELLING } from '@/play/opstellingen'
import { useGespeeld } from '@/progress/store'

export default function Spelen() {
  const gespeeld = useGespeeld()

  return (
    <main className="page">
      <Kop titel="Een partijtje" terug="/" />
      <div className="stack">
        <Pip zegt="Tegen wie wil je spelen? Begin gerust makkelijk hoor." stemming="blij" />

        {gespeeld && (
          <p className="muted">
            Je won er {gespeeld.gewonnen}, verloor er {gespeeld.verloren} en speelde {gespeeld.remise}{' '}
            keer gelijk.
          </p>
        )}

        <div style={{ display: 'grid', gap: 12 }}>
          {BOTS.map((bot) => (
            <Link
              key={bot.id}
              href={`/spelen/${bot.id}/`}
              className="btn btn--big"
              style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '14px 18px', height: 'auto', minHeight: 78 }}
            >
              <span style={{ fontSize: 32 }} aria-hidden="true">
                {bot.emoji}
              </span>
              <span style={{ display: 'grid', gap: 2 }}>
                <strong>{bot.naam}</strong>
                <small className="muted" style={{ fontWeight: 400 }}>
                  {OPSTELLING[bot.id]?.uitleg ?? bot.tagline}
                </small>
              </span>
            </Link>
          ))}

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
          De sterkere tegenstanders (vanaf Bas de Hond) komen erbij in fase 2, samen met de
          schaakmotor.
        </p>
      </div>
    </main>
  )
}
