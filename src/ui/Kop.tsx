'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { stopSpeaking } from '@/audio/voice'

/** Bovenbalk: altijd een weg terug, en altijd de knop om Pip stil te zetten. */
export function Kop({ titel, terug = '/' }: { titel: string; terug?: string }) {
  const router = useRouter()
  return (
    <header
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 0 16px', justifyContent: 'space-between',
      }}
    >
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => {
          stopSpeaking()
          router.push(terug)
        }}
        aria-label="Terug"
        style={{ minHeight: 48, padding: '0 14px' }}
      >
        ← Terug
      </button>
      <h2 style={{ fontSize: '1.15rem', textAlign: 'center', flex: 1 }}>{titel}</h2>
      <Link
        href="/ouders/"
        className="btn btn--ghost"
        aria-label="Voor ouders"
        style={{ minHeight: 48, padding: '0 14px' }}
      >
        ⚙️
      </Link>
    </header>
  )
}
