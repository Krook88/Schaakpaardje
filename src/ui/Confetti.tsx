import styles from './Confetti.module.css'

/**
 * Confetti voor het beloningsscherm.
 *
 * Vaste posities, geen Math.random: dat scheelt een hydratieverschil tussen wat er
 * voorgerenderd is en wat de browser tekent, en het maakt geen enkel verschil voor
 * hoe het eruitziet.
 *
 * Puur decoratie, dus aria-hidden en pointer-events uit — een schermlezer heeft er
 * niets aan en het mag nooit een tik van een kind opvangen.
 */
const SNIPPERS = [
  { links: 6, vertraging: 0, kleur: 'var(--accent)', duur: 2.1 },
  { links: 15, vertraging: 0.35, kleur: 'var(--grass)', duur: 2.6 },
  { links: 23, vertraging: 0.12, kleur: 'var(--sky)', duur: 2.3 },
  { links: 31, vertraging: 0.6, kleur: 'var(--sel)', duur: 2.0 },
  { links: 39, vertraging: 0.22, kleur: 'var(--berry)', duur: 2.5 },
  { links: 47, vertraging: 0.48, kleur: 'var(--accent)', duur: 2.2 },
  { links: 55, vertraging: 0.05, kleur: 'var(--grass)', duur: 2.4 },
  { links: 63, vertraging: 0.55, kleur: 'var(--sel)', duur: 2.1 },
  { links: 71, vertraging: 0.28, kleur: 'var(--sky)', duur: 2.6 },
  { links: 79, vertraging: 0.42, kleur: 'var(--accent)', duur: 2.0 },
  { links: 87, vertraging: 0.18, kleur: 'var(--berry)', duur: 2.45 },
  { links: 94, vertraging: 0.62, kleur: 'var(--grass)', duur: 2.25 },
]

export function Confetti() {
  return (
    <span className={styles.wolk} aria-hidden="true">
      {SNIPPERS.map((s, i) => (
        <span
          key={i}
          className={styles.snipper}
          style={{
            left: `${s.links}%`,
            background: s.kleur,
            animationDelay: `${s.vertraging}s`,
            animationDuration: `${s.duur}s`,
          }}
        />
      ))}
    </span>
  )
}
