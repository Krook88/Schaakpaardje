'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { stopSpeaking } from '@/audio/voice'
import { GeluidKnop } from './GeluidKnop'
import styles from './Kop.module.css'

/** Bovenbalk: altijd een weg terug, en altijd de knop om Pip stil te zetten. */
export function Kop({ titel, terug = '/' }: { titel: string; terug?: string }) {
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
      <h2 className={styles.titel}>{titel}</h2>
      <GeluidKnop className={styles.knop} />
      <Link href="/ouders/" className={`btn btn--ghost ${styles.knop}`} aria-label="Voor ouders">
        ⚙️
      </Link>
    </header>
  )
}
