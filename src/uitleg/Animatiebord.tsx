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
}: {
  id: string
  titel: string
  beschrijving: string
  beelden: Beeld[]
}) {
  const [stap, setStap] = useState(0)
  const [speelt, setSpeelt] = useState(false)
  const [inBeeld, setInBeeld] = useState(false)
  /** Bij het terugspringen naar het begin glijden de stukken niet terug, ze staan er gewoon. */
  const [direct, setDirect] = useState(false)
  const wortel = useRef<HTMLElement>(null)

  // Pas na het laden beslissen we of het bord vanzelf gaat spelen. Zonder JavaScript,
  // en in de gebouwde HTML, staat het dus stil op de eerste stap.
  useEffect(() => {
    const rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!rustig) setSpeelt(true)
    const el = wortel.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInBeeld(true)
      return
    }
    const kijker = new IntersectionObserver(([e]) => setInBeeld(e.isIntersecting), {
      threshold: 0.35,
    })
    kijker.observe(el)
    return () => kijker.disconnect()
  }, [])

  useEffect(() => {
    if (!speelt || !inBeeld) return
    const laatste = stap === beelden.length - 1
    const t = window.setTimeout(
      () => {
        if (laatste) {
          setDirect(true)
          setStap(0)
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
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setDirect(false)))
    return () => cancelAnimationFrame(r)
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
    setStap(Math.max(0, Math.min(beelden.length - 1, n)))
  }

  return (
    <figure ref={wortel} className={s.figuur} id={id} aria-labelledby={`${id}-kop`}>
      <h3 id={`${id}-kop`} className={s.kop}>
        {titel}
      </h3>
      <div className={s.opstelling}>
        <div className={s.bordkant}>
          <div className={`${s.bord} ${direct ? s.direct : ''}`} role="img" aria-label={beschrijving}>
            {allSquares().map((v) => (
              <span key={v} className={klasse(v)}>
                {beeld.stippen.includes(v) && (
                  <i className={s.stip} style={{ animationDelay: `${beeld.stippen.indexOf(v) * 40}ms` }} />
                )}
                {beeld.ringen.includes(v) && <i className={s.ring} />}
                {beeld.verboden.includes(v) && <i className={s.kruis} />}
                {rankOf(v) === 1 && <b className={s.lijn}>{v[0]}</b>}
                {fileIndex(v) === 0 && <b className={s.rij}>{v[1]}</b>}
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
          <div className={s.knoppen}>
            <button type="button" className={s.knop} onClick={() => ga(stap - 1)} disabled={stap === 0} aria-label="Vorige stap">
              ‹
            </button>
            <button
              type="button"
              className={`${s.knop} ${s.speel}`}
              onClick={() => {
                if (!speelt && stap === beelden.length - 1) setStap(0)
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
        <ol className={s.stappen}>
          {beelden.map((b, i) => (
            <li key={i} aria-current={i === stap ? 'step' : undefined}>
              <button type="button" onClick={() => ga(i)} className={s.stapknop}>
                {b.tekst}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </figure>
  )
}
