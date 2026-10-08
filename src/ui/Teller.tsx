import styles from './Teller.module.css'

/**
 * Hoeveel er nog te vinden zijn, zonder cijfers.
 *
 * Hier stond "0 van de 4 gevonden" in klein grijs onder het bord. Dat is het antwoord
 * op precies de vraag die een kind midden in een opgave heeft — ben ik er al bijna? —
 * en het stond er in de enige vorm die de doelgroep niet kan lezen. Nu lopen er
 * bolletjes vol: bij elk goed veld gaat er eentje aan. Het getal blijft bestaan voor
 * wie het scherm laat voorlezen.
 */
export function Teller({ gevonden, totaal }: { gevonden: number; totaal: number }) {
  return (
    <span className={styles.teller} role="img" aria-label={`${gevonden} van de ${totaal} gevonden`}>
      {Array.from({ length: totaal }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`${styles.bol} ${i < gevonden ? styles.vol : ''}`}
        />
      ))}
    </span>
  )
}
