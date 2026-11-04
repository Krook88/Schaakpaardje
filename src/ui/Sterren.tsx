import styles from './Sterren.module.css'
import { icoonBeeld } from './beelden'

export function Sterren({
  aantal,
  van = 3,
  groot = false,
  vier = false,
}: {
  aantal: number
  van?: number
  groot?: boolean
  /** Laat de sterren één voor één binnenvliegen. Alleen op het beloningsscherm. */
  vier?: boolean
}) {
  return (
    <span
      aria-label={`${aantal} van de ${van} sterren`}
      className={`${styles.rij} ${vier ? styles.vier : ''}`}
      style={{ display: 'inline-flex', gap: groot ? 6 : 2 }}
    >
      {Array.from({ length: van }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={styles.ster}
        >
          {/* Getekend in plaats van ⭐: een lege ster is een omtrek, geen grijze ster. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- statische export, SVG */}
          <img src={icoonBeeld(i < aantal ? 'ster-vol' : 'ster-leeg')} alt="" width={groot ? 44 : 18} height={groot ? 44 : 18} style={{ display: 'block' }} />
        </span>
      ))}
    </span>
  )
}
