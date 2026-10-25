'use client'

import Link from 'next/link'
import type { StalStuk } from '@/content/stal'
import styles from './Stal.module.css'

/**
 * "Nieuw in je stal!", op het moment dat het gebeurt.
 *
 * Na Torenburcht kwam de toren in de stal, en na een winst op Mila stond Mila erin —
 * maar op het scherm waar het kind het verdiende stond daar niets over. Het grootste
 * cadeau ging zo ongemerkt voorbij (spelontwerper). Dit laat het zien, met hetzelfde
 * plaatje als in de stal, en een tik brengt je erheen met dat vak uitgelicht.
 */
export function NieuwInStal({ stukken }: { stukken: StalStuk[] }) {
  if (!stukken.length) return null
  return (
    <div className="stack" style={{ gap: 8 }}>
      {stukken.map((stuk) => (
        <Link
          key={stuk.id}
          href={`/stal/?nieuw=${stuk.id}`}
          className={`card ${styles.nieuwKaart}`}
          style={{ '--toon': stuk.toon } as React.CSSProperties}
        >
          <span
            className={`${styles.teken} ${styles.nieuwTeken} ${stuk.soort === 'stuk' ? '' : styles.inKleur}`}
            aria-hidden="true"
          >
            {stuk.teken}
          </span>
          <span>
            <span className="muted" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700 }}>
              Nieuw in je stal!
            </span>
            <strong>{stuk.naam}</strong>
          </span>
          {/* Een pijltje: het is een knop naar de stal, en dat zag je er niet aan. */}
          <span className={styles.nieuwPijl} aria-hidden="true">
            ›
          </span>
        </Link>
      ))}
    </div>
  )
}
