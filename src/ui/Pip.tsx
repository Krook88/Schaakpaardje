'use client'

import { useEffect, useState } from 'react'
import { onSubtitle, speak, stopSpeaking, wachtTotUitgesproken } from '@/audio/voice'
import styles from './Pip.module.css'

export type PipStemming = 'blij' | 'juicht' | 'verrast' | 'denkt' | 'moedigt' | 'trots' | 'slaapt'

const GEZICHT: Record<PipStemming, string> = {
  blij: '🐴',
  juicht: '🐴',
  verrast: '🐴',
  denkt: '🐴',
  moedigt: '🐴',
  trots: '🐴',
  slaapt: '🐴',
}

const BADGE: Record<PipStemming, string> = {
  blij: '',
  juicht: '🎉',
  verrast: '❗',
  denkt: '💭',
  moedigt: '💪',
  trots: '⭐',
  slaapt: '💤',
}

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
 * Voorlopig is Pip een emoji in een cirkel. Bij de visuele oplevering komt hier een
 * Rive-animatie met echte gezichtsuitdrukkingen; de component-interface blijft gelijk,
 * dus dat is één bestand omwisselen.
 *
 * Tot die tijd doet de beweging het werk dat het gezicht nog niet kan doen. Pip was
 * zes stemmingen lang exact hetzelfde plaatje met een ander speldje ernaast — hij
 * praatte wel, maar hij deed niets. Nu knikt hij als hij aanmoedigt, kantelt hij als
 * hij nadenkt, springt hij als je het goed hebt, en wiebelt hij zachtjes zolang hij
 * aan het woord is. Dat laatste is het belangrijkste: een kind ziet daaraan dat het
 * even moet luisteren, en ziet even goed wanneer het weer aan de beurt is.
 */
export function Pip({
  zegt,
  stemming = 'blij',
  klein = false,
  onKlaar,
}: {
  zegt?: string
  stemming?: PipStemming
  klein?: boolean
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

  useEffect(() => {
    onSubtitle(setOndertitel)
    return () => onSubtitle(null)
  }, [])

  useEffect(() => {
    setPuls((p) => p + 1)
  }, [zegt, stemming])

  useEffect(() => {
    if (!zegt) return
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
  }, [zegt])

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
        <span key={puls} className={`${styles.gezicht} ${BEWEGING[stemming]}`} aria-hidden="true">
          {GEZICHT[stemming]}
        </span>
        {BADGE[stemming] && (
          <span className={styles.badge} aria-hidden="true">
            {BADGE[stemming]}
          </span>
        )}
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
