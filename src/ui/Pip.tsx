'use client'

import { useEffect, useState } from 'react'
import { onSubtitle, speak, stopSpeaking, wachtTotUitgesproken } from '@/audio/voice'
import styles from './Pip.module.css'
import { pipBeeld } from './beelden'

export type PipStemming = 'blij' | 'juicht' | 'verrast' | 'denkt' | 'moedigt' | 'trots' | 'slaapt'

/** Wat Pip met zijn hoofd doet bij elke stemming. Zie Pip.module.css. */
const BEWEGING: Record<PipStemming, string> = {
  blij: '',
  juicht: styles.juicht,
  verrast: styles.verrast,
  denkt: styles.denkt,
  moedigt: styles.moedigt,
  trots: styles.trots,
  slaapt: styles.slaapt,
}

/**
 * De mascotte met zijn tekstballon.
 *
 * Pip is een eigen tekening in zeven stemmingen (scripts/pip-tekenen.py, goedgekeurd
 * door Kaj op 4 nov 2026), geen emoji meer. De beweging blijft het werk doen dat een
 * stilstaand gezicht niet kan. Pip was
 * zes stemmingen lang exact hetzelfde plaatje met een ander speldje ernaast — hij
 * praatte wel, maar hij deed niets. Nu knikt hij als hij aanmoedigt, kantelt hij als
 * hij nadenkt, springt hij als je het goed hebt, en wiebelt hij zachtjes zolang hij
 * aan het woord is. Dat laatste is het belangrijkste: een kind ziet daaraan dat het
 * even moet luisteren, en ziet even goed wanneer het weer aan de beurt is.
 */
// Alle stemmingen één keer vooraf ophalen: anders was de cirkel bij de eerste keer
// "juicht" heel even leeg terwijl het plaatje binnenkwam (37e review).
let vooraf = false
function haalPipsOp() {
  if (vooraf || typeof window === 'undefined') return
  vooraf = true
  for (const s of ['blij', 'juicht', 'verrast', 'denkt', 'moedigt', 'trots', 'slaapt'] as PipStemming[]) {
    new Image().src = pipBeeld(s, true)
  }
}

export function Pip({
  zegt,
  stemming = 'blij',
  klein = false,
  vanzelf = true,
  onKlaar,
}: {
  zegt?: string
  stemming?: PipStemming
  klein?: boolean
  /**
   * Zegt Pip zijn zin zodra hij in beeld komt? Op de welkomstpagina niet: daar komt
   * een ouder voor het eerst binnen, en een paardje dat ineens begint te praten (of,
   * omdat de browser geluid tegenhoudt, bij de eerste tik op wat dan ook) laat
   * schrikken. Daar staat de zin in de ballon en spreekt Pip pas als je op hem of op
   * de luidspreker tikt.
   */
  vanzelf?: boolean
  onKlaar?: () => void
}) {
  const [ondertitel, setOndertitel] = useState<string | null>(null)
  const [pratend, setPratend] = useState(false)
  /**
   * Een teller die bij elke nieuwe zin of stemming omhoog gaat, als sleutel op het
   * gezicht. Zonder dat blijft een CSS-animatie staan waar hij stond: twee goede
   * antwoorden achter elkaar zijn allebei 'juicht', en dan springt Pip alleen de
   * eerste keer. Alleen het gezicht krijgt een nieuwe sleutel, niet de knop eromheen —
   * anders raakt de toetsenbordfocus kwijt midden in een les.
   */
  const [puls, setPuls] = useState(0)

  useEffect(haalPipsOp, [])
  useEffect(() => {
    onSubtitle(setOndertitel)
    return () => onSubtitle(null)
  }, [])

  useEffect(() => {
    setPuls((p) => p + 1)
  }, [zegt, stemming])

  useEffect(() => {
    if (!zegt || !vanzelf) return
    let actueel = true
    setPratend(true)
    void speak(zegt)
    void wachtTotUitgesproken().then(() => {
      if (actueel) setPratend(false)
    })
    return () => {
      actueel = false
      setPratend(false)
      stopSpeaking()
    }
  }, [zegt, vanzelf])

  const tekst = ondertitel ?? zegt ?? null

  return (
    <div className={`${styles.wrap} ${klein ? styles.klein : ''}`}>
      <button
        type="button"
        className={`${styles.pip} ${pratend ? styles.pratend : ''}`}
        onClick={() => {
          if (zegt) void speak(zegt, true)
          onKlaar?.()
        }}
        aria-label={zegt ? `Pip zegt: ${zegt}. Tik om het nog eens te horen.` : 'Pip'}
      >
        {/* De getekende Pip (public/illustraties/pip/) in plaats van één emoji met een
            speldje ernaast: de stemming zit nu in zijn gezicht. De beweging blijft. */}
        <span key={puls} className={`${styles.gezicht} ${BEWEGING[stemming]}`} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- statische export, SVG */}
          <img src={pipBeeld(stemming, true)} alt="" className={styles.tekening} draggable={false} />
        </span>
      </button>
      {tekst && (
        <p className={styles.ballon} aria-live="polite">
          {tekst}
          {zegt && (
            // Een kind van vier leest deze ballon niet. Het hoort hem, en als het even
            // niet oplette moet het hem opnieuw kunnen horen zonder te weten dat Pip
            // zelf ook aanklikbaar is. Vandaar een luidspreker die eruitziet als een
            // knop: één beeld, geen woord.
            <button
              type="button"
              className={styles.luister}
              onClick={() => void speak(zegt, true)}
              aria-label="Zeg het nog eens"
              title="Zeg het nog eens"
            >
              <span aria-hidden="true">🔊</span>
            </button>
          )}
        </p>
      )}
    </div>
  )
}
