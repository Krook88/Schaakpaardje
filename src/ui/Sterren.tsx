import styles from './Sterren.module.css'

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
      style={{ fontSize: groot ? '2.6rem' : '1rem' }}
    >
      {Array.from({ length: van }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={styles.ster}
          style={{
            opacity: i < aantal ? 1 : 0.4,
            filter: i < aantal ? 'none' : 'grayscale(1)',
          }}
        >
          ⭐
        </span>
      ))}
    </span>
  )
}
