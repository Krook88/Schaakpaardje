'use client'

import { useEffect, useState } from 'react'
import { onSubtitle, speak, stopSpeaking } from '@/audio/voice'
import styles from './Pip.module.css'

export type PipStemming = 'blij' | 'verrast' | 'denkt' | 'moedigt' | 'trots' | 'slaapt'

const GEZICHT: Record<PipStemming, string> = {
  blij: '🐴',
  verrast: '🐴',
  denkt: '🐴',
  moedigt: '🐴',
  trots: '🐴',
  slaapt: '🐴',
}

const BADGE: Record<PipStemming, string> = {
  blij: '',
  verrast: '❗',
  denkt: '💭',
  moedigt: '💪',
  trots: '⭐',
  slaapt: '💤',
}

/**
 * De mascotte met zijn tekstballon.
 *
 * Voorlopig is Pip een emoji in een cirkel. Bij de visuele oplevering komt hier een
 * Rive-animatie met echte gezichtsuitdrukkingen; de component-interface blijft gelijk,
 * dus dat is één bestand omwisselen.
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

  useEffect(() => {
    onSubtitle(setOndertitel)
    return () => onSubtitle(null)
  }, [])

  useEffect(() => {
    if (!zegt) return
    void speak(zegt)
    return () => stopSpeaking()
  }, [zegt])

  const tekst = ondertitel ?? zegt ?? null

  return (
    <div className={`${styles.wrap} ${klein ? styles.klein : ''}`}>
      <button
        type="button"
        className={`${styles.pip} ${stemming === 'trots' ? styles.trots : ''}`}
        onClick={() => {
          if (zegt) void speak(zegt, true)
          onKlaar?.()
        }}
        aria-label={zegt ? `Pip zegt: ${zegt}. Tik om het nog eens te horen.` : 'Pip'}
      >
        <span className={styles.gezicht} aria-hidden="true">
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
