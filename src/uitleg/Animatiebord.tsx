'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { GLYPH } from '@/board/pieces'
import { allSquares, fileIndex, isLightSquare, rankOf, type Square } from '@/engine/board'
import type { Beeld } from './beelden'
import s from './Animatiebord.module.css'

/**
 * Een bord dat zichzelf uitlegt: de stukken schuiven, de velden lichten op, en onder het
 * bord staat wat er gebeurt.
 *
 * Voor de uitlegpagina's, dus voor een ouder die net "hoe loopt het paard" heeft
 * gezocht. Eén bewegend bord legt een L-sprong beter uit dan drie alinea's, en dat is
 * het hele idee van deze pagina's.
 *
 * Wat ervoor zorgt dat het ook werkt voor wie het niet ziet bewegen:
 *   - Alle stappen staan als genummerde tekst onder het bord, ook in de gebouwde HTML.
 *     Een zoekmachine en een schermlezer lezen de uitleg, niet het plaatje.
 *   - Er is een pauzeknop, en het bord speelt alleen als het in beeld is.
 *   - Wie beweging uit heeft staan, krijgt geen automatisch afspelen en geen glijdende
 *     stukken, maar kan wel zelf stap voor stap door de uitleg.
 */

/** Hoe lang een stap blijft staan: genoeg om de zin te lezen, niet zo lang dat je wacht. */
function duur(tekst: string): number {
  return Math.min(6500, Math.max(2600, 1400 + tekst.length * 42))
}

export function Animatiebord({
  id,
  titel,
  beschrijving,
  beelden,
  kort,
}: {
  id: string
  titel: string
  beschrijving: string
  beelden: Beeld[]
  /**
   * Alleen de zin van nu onder het bord, geen hele stappenlijst. Voor de startpagina,
   * waar het bord een voorproefje is en het aanmeldformulier niet ver weg mag raken.
   */
  kort?: boolean
}) {
  const [stap, setStap] = useState(0)
  const [speelt, setSpeelt] = useState(false)
  const [inBeeld, setInBeeld] = useState(false)
  /** Bij het terugspringen naar het begin glijden de stukken niet terug, ze staan er gewoon. */
  const [direct, setDirect] = useState(false)
  /** Wat een schermlezer hoort. Alleen bij zelf bladeren: tijdens het afspelen zou het door alles heen praten. */
  const [melding, setMelding] = useState('')
  const bordRef = useRef<HTMLDivElement>(null)

  // Pas na het laden beslissen we of het bord vanzelf gaat spelen. Zonder JavaScript,
  // en in de gebouwde HTML, staat het dus stil op de eerste stap.
  useEffect(() => {
    const rustig = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!rustig.matches) setSpeelt(true)
    // Zet iemand beweging halverwege uit, dan stopt het bord ook.
    const wissel = () => {
      if (rustig.matches) setSpeelt(false)
    }
    rustig.addEventListener('change', wissel)
    // We kijken naar het bord zelf, niet naar het hele blok: dat is met de stappenlijst
    // erbij op een telefoon hoger dan het scherm, en zou dan nooit genoeg in beeld zijn.
    const el = bordRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInBeeld(true)
      return () => rustig.removeEventListener('change', wissel)
    }
    const kijker = new IntersectionObserver(([e]) => setInBeeld(e.isIntersecting), {
      // Ruim in beeld, zodat er op een groot scherm niet twee borden tegelijk spelen.
      threshold: 0.6,
    })
    kijker.observe(el)
    return () => {
      kijker.disconnect()
      rustig.removeEventListener('change', wissel)
    }
  }, [])

  /** Terug naar het begin, zonder dat de stukken achteruit over het bord glijden. */
  const naarBegin = () => {
    setDirect(true)
    setStap(0)
  }

  useEffect(() => {
    if (!speelt || !inBeeld) return
    const laatste = stap === beelden.length - 1
    const t = window.setTimeout(
      () => {
        if (laatste) {
          naarBegin()
        } else {
          setStap(stap + 1)
        }
      },
      duur(beelden[stap].tekst) + (laatste ? 1800 : 0),
    )
    return () => window.clearTimeout(t)
  }, [speelt, inBeeld, stap, beelden])

  useEffect(() => {
    if (!direct) return
    let binnen = 0
    const buiten = requestAnimationFrame(() => {
      binnen = requestAnimationFrame(() => setDirect(false))
    })
    return () => {
      cancelAnimationFrame(buiten)
      cancelAnimationFrame(binnen)
    }
  }, [direct])

  /**
   * Waar een stuk staat dat (nog) niet op het bord is: op de plek waar het straks
   * verschijnt of waar het verdween. Zo faden het in en uit op de goede plek, in plaats
   * van vanuit de hoek aan te komen vliegen.
   */
  const plekken = useMemo(
    () =>
      beelden.map((b, i) =>
        b.stukken.map((st) => {
          if (st.veld) return st.veld
          for (let j = i - 1; j >= 0; j--) {
            const v = beelden[j].stukken.find((x) => x.id === st.id)?.veld
            if (v) return v
          }
          for (let j = i + 1; j < beelden.length; j++) {
            const v = beelden[j].stukken.find((x) => x.id === st.id)?.veld
            if (v) return v
          }
          return 'a1'
        }),
      ),
    [beelden],
  )

  const beeld = beelden[stap]
  const klasse = (v: Square) => {
    const k = [s.veld, isLightSquare(v) ? s.licht : s.donker]
    if (beeld.zet.includes(v)) k.push(s.zet)
    if (beeld.markeer.includes(v)) k.push(s.markeer)
    if (beeld.schaak.includes(v)) k.push(s.schaak)
    return k.join(' ')
  }

  const ga = (n: number) => {
    setSpeelt(false)
    setDirect(false)
    const naar = Math.max(0, Math.min(beelden.length - 1, n))
    setStap(naar)
    setMelding(`Stap ${naar + 1} van ${beelden.length}: ${beelden[naar].tekst}`)
  }

  return (
    <figure className={s.figuur} id={id} aria-labelledby={`${id}-kop`}>
      <h3 id={`${id}-kop`} className={s.kop}>
        {titel}
      </h3>
      <div className={s.opstelling}>
        <div className={s.bordkant}>
          {/* De coördinaten staan naast het bord in plaats van in de hoek van een veld:
              daar vielen ze over de stukken en waren ze te klein om d4 te vinden, terwijl
              de stappen er wel naar verwijzen. */}
          <div className={s.rand}>
          <div className={s.rijen} aria-hidden="true">
            {[8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
              <span key={r}>{r}</span>
            ))}
          </div>
          <div ref={bordRef} className={`${s.bord} ${direct ? s.direct : ''}`} role="img" aria-label={beschrijving}>
            {allSquares().map((v) => (
              <span key={v} className={klasse(v)}>
                {beeld.stippen.includes(v) && (
                  <i className={s.stip} style={{ animationDelay: `${beeld.stippen.indexOf(v) * 40}ms` }} />
                )}
                {beeld.ringen.includes(v) && <i className={s.ring} />}
                {beeld.verboden.includes(v) && <i className={s.kruis} />}
              </span>
            ))}
            {beeld.stukken.map((st, i) => {
              const plek = plekken[stap][i]
              return (
                <span
                  key={st.id}
                  aria-hidden="true"
                  className={`${s.stuk} ${st.kleur === 'w' ? s.wit : s.zwart} ${st.veld ? '' : s.weg}`}
                  style={{
                    transform: `translate(${fileIndex(plek) * 100}%, ${(8 - rankOf(plek)) * 100}%)`,
                  }}
                >
                  {GLYPH[st.stuk]}
                </span>
              )
            })}
            {beeld.label && (
              <span key={`${stap}-${beeld.label}`} className={s.label}>
                {beeld.label}
              </span>
            )}
          </div>
          <div className={s.lijnen} aria-hidden="true">
            {'abcdefgh'.split('').map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          </div>
          <div className={s.knoppen}>
            <button type="button" className={s.knop} onClick={() => ga(stap - 1)} disabled={stap === 0} aria-label="Vorige stap">
              ‹
            </button>
            <button
              type="button"
              className={`${s.knop} ${s.speel}`}
              onClick={() => {
                if (!speelt && stap === beelden.length - 1) naarBegin()
                setSpeelt(!speelt)
              }}
              aria-label={speelt ? 'Pauze' : 'Afspelen'}
            >
              {speelt ? '❚❚' : '▶'}
            </button>
            <button
              type="button"
              className={s.knop}
              onClick={() => ga(stap + 1)}
              disabled={stap === beelden.length - 1}
              aria-label="Volgende stap"
            >
              ›
            </button>
            <span className={s.teller} aria-hidden="true">
              {stap + 1}/{beelden.length}
            </span>
          </div>
        </div>
        {kort ? (
          <p className={s.onderschrift}>{beeld.tekst}</p>
        ) : (
          <ol className={s.stappen}>
            {beelden.map((b, i) => (
              <li key={i} aria-current={i === stap ? 'step' : undefined}>
                <button type="button" onClick={() => ga(i)} className={s.stapknop}>
                  {b.tekst}
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
      <p className={s.verborgen} aria-live="polite">
        {melding}
      </p>
    </figure>
  )
}
