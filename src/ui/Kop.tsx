'use client'

import Link from 'next/link'
import { Icoon } from '@/ui/beelden'
import { useRouter } from 'next/navigation'
import { stopSpeaking } from '@/audio/voice'
import { GeluidKnop } from './GeluidKnop'
import styles from './Kop.module.css'

/**
 * Bovenbalk: altijd een weg terug, en altijd de knop om Pip stil te zetten.
 *
 * De titel is de `h1` van het scherm: zonder kwam een schermlezer op de kaart, het
 * ouderscherm of een les geen hoofdkop tegen. Heeft het scherm zelf al een `h1` (het
 * diploma), geef dan `kop="p"` mee, zodat er niet twee zijn.
 */
export function Kop({ titel, terug = '/', kop: Titel = 'h1' }: { titel: string; terug?: string; kop?: 'h1' | 'p' }) {
  const router = useRouter()
  return (
    <header className={styles.kop}>
      <button
        type="button"
        className={`btn btn--ghost ${styles.knop}`}
        onClick={() => {
          stopSpeaking()
          router.push(terug)
        }}
      >
        <span aria-hidden="true">←</span>
        <span className={styles.woord}>Terug</span>
      </button>
      <Titel className={styles.titel}>{titel}</Titel>
      <GeluidKnop className={styles.knop} />
      <Link href="/ouders/" className={`btn btn--ghost ${styles.knop}`} aria-label="Voor ouders">
        <Icoon naam="instellingen" maat={30} />
      </Link>
    </header>
  )
}
