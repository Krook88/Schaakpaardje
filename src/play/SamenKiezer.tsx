'use client'

import { useState } from 'react'
import { AVATARS, useProfiel, useProfielStore, useToestandGeladen } from '@/progress/store'

/** Wie er aan het bord zit bij samen spelen. `profielId` alleen als het een kind van dit apparaat is. */
export type Speler = { naam: string; avatar: string; profielId?: string }

/**
 * De naam van een plaatje, voor wie geen profiel heeft. Nooit "Wit" of "Zwart": na
 * "andersom" stond er anders "Zwart is aan zet (wit)".
 */
const PLAATJE_NAAM: Record<string, string> = {
  '🐴': 'Paard', '🦊': 'Vos', '🐻': 'Beer', '🐰': 'Konijn',
  '🦉': 'Uil', '🐢': 'Schildpad', '🐝': 'Bij', '🦄': 'Eenhoorn',
}

/**
 * Met wie speel je?
 *
 * Samen spelen was eerst "wit" en "zwart" zonder namen: aan het eind zei de app
 * "verloren" tegen het kind van dit profiel als zwart won, ook als dat kind zelf zwart
 * speelde. Nu kiest het tweede kind wie het is: een ander profiel op dit apparaat, of
 * iemand anders met alleen een plaatje. Een naam typen hoeft niet; dat kan een
 * kleuter niet, en een plaatje is genoeg om te weten wie er aan zet is.
 *
 * Er gaat niets naar internet: de ander bestaat alleen in dit potje.
 */
export function SamenKiezer({ onKies }: { onKies: (wit: Speler, zwart: Speler) => void }) {
  const ik = useProfiel()
  const anderen = useProfielStore((s) => s.profielen).filter((p) => p.id !== ik?.id)
  const [gastAvatar, setGastAvatar] = useState<string>(
    AVATARS.find((a) => a !== ik?.avatar) ?? AVATARS[1],
  )
  // Wacht op de opgeslagen profielen: anders stond in de voorgerenderde HTML "Wit" met
  // een paardje, en sprong dat daarna om naar de echte naam.
  const geladen = useToestandGeladen()
  const wit: Speler = ik
    ? { naam: ik.naam, avatar: ik.avatar, profielId: ik.id }
    : { naam: PLAATJE_NAAM[AVATARS[0]], avatar: AVATARS[0] }

  if (!geladen) return <div className="stack" aria-busy="true" />
  // Plaatjes die al van iemand op dit apparaat zijn, kan de gast niet kiezen: het plaatje
  // is voor een kind dat niet leest het enige teken van wie er aan zet is.
  const bezet = new Set([wit.avatar, ...anderen.map((p) => p.avatar)])
  const vrij = AVATARS.filter((a) => !bezet.has(a))
  const keuzes = vrij.length ? vrij : AVATARS.filter((a) => a !== wit.avatar)
  // De begin-keuze werd gemaakt voor de profielen er waren; pas hem aan als hij bezet is.
  const gekozen = keuzes.includes(gastAvatar as (typeof AVATARS)[number]) ? gastAvatar : keuzes[0]

  return (
    <div className="stack">
      <p style={{ margin: 0 }}>
        <span aria-hidden="true">{wit.avatar}</span> <strong>{wit.naam}</strong> speelt met wit en
        begint. Wie speelt er met zwart?
      </p>

      {anderen.length > 0 && (
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          {anderen.map((p) => (
            <button
              key={p.id}
              type="button"
              className="btn btn--big"
              onClick={() => onKies(wit, { naam: p.naam, avatar: p.avatar, profielId: p.id })}
            >
              <span aria-hidden="true" style={{ fontSize: 28 }}>
                {p.avatar}
              </span>{' '}
              {p.naam}
            </button>
          ))}
        </div>
      )}

      <div className="card stack">
        <p style={{ margin: 0 }}>{anderen.length ? 'Of iemand anders. Kies een plaatje:' : 'Kies een plaatje voor zwart:'}</p>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          {keuzes.map((a) => (
            <button
              key={a}
              type="button"
              className="btn"
              onClick={() => setGastAvatar(a)}
              aria-pressed={gekozen === a}
              aria-label={`Kies ${a}`}
              style={{
                fontSize: 26,
                minWidth: 58,
                borderColor: gekozen === a ? 'var(--accent)' : undefined,
                background: gekozen === a ? 'var(--accent-soft)' : undefined,
              }}
            >
              {a}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn btn--primary btn--big"
          onClick={() => onKies(wit, { naam: PLAATJE_NAAM[gekozen] ?? 'Gast', avatar: gekozen })}
        >
          Beginnen
        </button>
      </div>
    </div>
  )
}
