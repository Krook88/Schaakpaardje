'use client'

import { useState } from 'react'
import { Kop } from '@/ui/Kop'
import { Pip } from '@/ui/Pip'
import { Confetti } from '@/ui/Confetti'
import { speak } from '@/audio/voice'
import { SOORTNAAM, type StalSoort } from '@/content/stal'
import { aantalBezit, perSoort, verzameling, type StalVak } from './verzameling'
import { useProfiel, useToestandGeladen, useVerslagen, useVoortgang } from './store'
import styles from './Stal.module.css'

const VOLGORDE: StalSoort[] = ['stuk', 'maatje', 'hoefijzer']

/**
 * Pips stal: alles wat het kind verzameld heeft, op één plek.
 *
 * De lege vakken zijn hier net zo belangrijk als de volle. Een silhouet laat zien wát er
 * nog komt, en tikken erop laat Pip vertellen hoe je het krijgt — zodat ook een kind dat
 * niet leest weet wat het moet doen. Een leeg vakje met een vraagteken zou dat niet doen.
 */
export function StalScherm() {
  const geladen = useToestandGeladen()
  const voortgang = useVoortgang()
  const verslagen = useVerslagen()
  const profiel = useProfiel()
  const [uitgelicht, setUitgelicht] = useState<StalVak | null>(null)

  if (!geladen) return <main className="page" />

  const alles = verzameling(voortgang, verslagen)
  const planken = perSoort(alles)
  const heeft = aantalBezit(alles)
  const compleet = heeft === alles.length

  const zin = uitgelicht
    ? uitgelicht.bezit
      ? `${uitgelicht.naam}. Die heb je!`
      : `${uitgelicht.naam}. ${uitgelicht.hoe}`
    : compleet
      ? 'Je stal is helemaal vol. Alles verzameld!'
      : `Je hebt er ${heeft} van de ${alles.length}. Tik op een leeg plekje, dan vertel ik hoe je hem krijgt.`

  return (
    <main className="page">
      <Kop titel="Mijn stal" terug="/" />
      <div className="stack">
        <Pip zegt={zin} stemming={uitgelicht?.bezit || compleet ? 'trots' : 'blij'} klein />

        <div className="card stack" style={{ position: 'relative', overflow: 'hidden' }}>
          {compleet && <Confetti />}
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong>
              {profiel ? `De stal van ${profiel.naam}` : 'Mijn stal'}
            </strong>
            <span aria-label={`${heeft} van de ${alles.length} verzameld`}>
              {heeft} / {alles.length}
            </span>
          </div>
        </div>

        {VOLGORDE.map((soort) => (
          <section key={soort} className="card stack" style={{ gap: 12 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.05rem' }}>{SOORTNAAM[soort]}</h2>
              <span className="muted" style={{ fontSize: '0.85rem' }}>
                {aantalBezit(planken[soort])} van de {planken[soort].length}
              </span>
            </div>
            <div className={styles.plank}>
              {planken[soort].map((vak) => (
                <button
                  key={vak.id}
                  type="button"
                  className={`${styles.vak} ${vak.bezit ? styles.heeft : styles.mist}`}
                  style={{ '--toon': vak.toon } as React.CSSProperties}
                  onClick={() => {
                    setUitgelicht(vak)
                    void speak(vak.bezit ? `${vak.naam}. Die heb je!` : `${vak.naam}. ${vak.hoe}`, true)
                  }}
                  aria-label={vak.bezit ? `${vak.naam}, verzameld` : `${vak.naam}, nog niet. ${vak.hoe}`}
                >
                  <span className={styles.teken} aria-hidden="true">
                    {vak.teken}
                  </span>
                  <span className={styles.naam}>{vak.naam}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
