'use client'

import { useEffect, useRef, useState } from 'react'
import { Kop } from '@/ui/Kop'
import { Pip } from '@/ui/Pip'
import { Confetti } from '@/ui/Confetti'
import { getVoiceConfig, speak } from '@/audio/voice'
import { SOORTNAAM, type StalSoort } from '@/content/stal'
import { STAL_VOL, STICKER_HEB_JE, STICKER_HOE, STICKER_NOG_DICHT } from '@/content/voice'
import { aantalBezit, geldigeStickers, perSoort, stickerPlanken, verzameling } from './verzameling'
import {
  isOntgrendeld,
  useModus,
  useProfiel,
  useStickers,
  useToestandGeladen,
  useVerslagen,
  useVoortgang,
} from './store'
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
  const stickers = geldigeStickers(useStickers())
  const modus = useModus()
  /** Waar het kind net op tikte: een stuk in de stal of een sticker. */
  const [uitgelicht, setUitgelicht] = useState<{ zin: string; bezit: boolean } | null>(null)

  /*
   * Eén spreker per tik. Hier stond speak() in de onClick én de nieuwe zin in Pips
   * ballon, en Pip breekt bij een nieuwe zin eerst af wat er klonk. Met "Pip praat" uit
   * was een tik daardoor meestal stil, en de volgende keer op hetzelfde vak weer niet —
   * juist voor het kind dat op een vak tikt om het te hóren (codebase-review). Nu: een
   * nieuwe zin zegt Pip zelf; met de stem uit, of bij dezelfde zin nog eens, spreken
   * we hem hier, en dan pas na het tekenen, zodat Pip hem niet meteen weer afbreekt.
   */
  const spreekNaTik = useRef(false)
  useEffect(() => {
    if (!spreekNaTik.current || !uitgelicht) return
    spreekNaTik.current = false
    void speak(uitgelicht.zin, true)
  }, [uitgelicht])
  const tikOp = (zegt: string, bezit: boolean) => {
    if (uitgelicht?.zin === zegt) return void speak(zegt, true)
    spreekNaTik.current = !getVoiceConfig().spraak
    setUitgelicht({ zin: zegt, bezit })
  }

  if (!geladen) return <main className="page" />

  const alles = verzameling(voortgang, verslagen)
  const planken = perSoort(alles)
  const heeft = aantalBezit(alles)
  const compleet = heeft === alles.length
  const stickerRijen = stickerPlanken(stickers, voortgang)

  const zin = uitgelicht
    ? uitgelicht.zin
    : compleet
      ? STAL_VOL
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

        {/* De stickers: per wereld, met het plaatje van de les. Tik je erop, dan zegt
            Pip welke les het is, of wat je moet doen om hem te krijgen. Bovenaan: voor
            een jong kind zijn dit de eerste dingen die het verdient, en onder zestien
            nog lege vakken waren ze niet terug te vinden. */}
        {stickerRijen.length > 0 && (
          <section id="stickers" className="card stack" style={{ gap: 12 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.05rem' }}>🏅 Stickers</h2>
              <span className="muted" style={{ fontSize: '0.85rem' }}>
                {stickers.length} verdiend
              </span>
            </div>
            {stickerRijen.map(({ wereld, vakken }) => (
              <div key={wereld.id} className="stack" style={{ gap: 6 }}>
                <span className="muted" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  <span aria-hidden="true">{wereld.emoji}</span> {wereld.naam}
                </span>
                <div className={styles.plank}>
                  {vakken.map((vak) => (
                    <button
                      key={vak.id}
                      type="button"
                      className={`${styles.vak} ${styles.sticker} ${vak.bezit ? styles.heeft : styles.mist}`}
                      style={{ '--toon': vak.toon } as React.CSSProperties}
                      onClick={() => {
                        const zegt = vak.bezit
                          ? STICKER_HEB_JE
                          : isOntgrendeld(vak.id, voortgang, modus)
                            ? STICKER_HOE
                            : STICKER_NOG_DICHT
                        tikOp(zegt, vak.bezit)
                      }}
                      aria-label={vak.bezit ? `Sticker ${vak.naam}, verdiend` : `Sticker ${vak.naam}, nog niet`}
                    >
                      <span className={styles.stickerTeken} aria-hidden="true">
                        {vak.teken}
                      </span>
                      <span className={styles.naam}>{vak.naam}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

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
                    const zegt = vak.bezit ? `${vak.naam}. Die heb je!` : `${vak.naam}. ${vak.hoe}`
                    tikOp(zegt, vak.bezit)
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
