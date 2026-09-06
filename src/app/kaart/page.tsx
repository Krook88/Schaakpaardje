'use client'

import Link from 'next/link'
import { Kop } from '@/ui/Kop'
import { Sterren } from '@/ui/Sterren'
import { WERELDEN } from '@/content'
import { isOntgrendeld, useModus, useToestandGeladen, useVoortgang, wereldIsAf } from '@/progress/store'
import styles from './Kaart.module.css'

/**
 * Het pad. Bewust één lijn van boven naar beneden: een vertakte kaart is voor een
 * vijfjarige niet te lezen. Wat af is krijgt kleur, wat nog dicht zit een slotje.
 */
export default function Kaart() {
  const voortgang = useVoortgang()
  const modus = useModus()
  const geladen = useToestandGeladen()

  // Zonder deze pauze toont de voorgerenderde HTML alle lessen op slot, en flitst dat
  // even in beeld voordat de echte voortgang er is.
  if (!geladen) {
    return (
      <main className="page">
        <Kop titel="De kaart" terug="/" />
      </main>
    )
  }

  return (
    <main className="page">
      <Kop titel="De kaart" terug="/" />
      <div className="stack">
        {WERELDEN.map((wereld) => {
          const af = wereldIsAf(wereld.id, voortgang)
          // Een wereld waarvan nog geen enkele les open is, krijgt één regel in plaats
          // van een uitgeklapte kaart met vier lessen erin.
          //
          // De kaart was 6.300 pixels lang: zeven en een half telefoonscherm scrollen
          // langs zesenvijftig hangslotjes om bij les twee te komen. Voor een kind is
          // dat geen kaart maar een muur van alles wat het nog niet mag. Wat komen gaat
          // blijft zichtbaar — het wapen, de naam, de belofte — maar het neemt geen
          // halve pagina meer in beslag. Zodra er één les opengaat, klapt de wereld
          // vanzelf helemaal open.
          const open = wereld.lessen.some((les) => isOntgrendeld(les.id, voortgang, modus))
          if (!open) {
            return (
              <section
                key={wereld.id}
                className={`card ${styles.wereld} ${styles.dicht}`}
                style={{ '--toon': wereld.toon } as React.CSSProperties}
              >
                <div className={styles.band}>
                  <span className={styles.wapen} aria-hidden="true">
                    {wereld.emoji}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h2 style={{ fontSize: '1.05rem' }}>
                      {wereld.nummer}. {wereld.naam}
                    </h2>
                    <p className="muted" style={{ fontSize: '0.85rem' }}>
                      {wereld.belofte}
                    </p>
                  </div>
                  <span aria-label="Nog op slot" style={{ fontSize: 24, flexShrink: 0 }}>
                    🔒
                  </span>
                </div>
              </section>
            )
          }
          return (
            <section
              key={wereld.id}
              className={`card ${styles.wereld}`}
              style={{ '--toon': wereld.toon } as React.CSSProperties}
            >
              <div className={styles.band}>
                <span className={styles.wapen} aria-hidden="true">
                  {wereld.emoji}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h2 style={{ fontSize: '1.15rem' }}>
                    {wereld.nummer}. {wereld.naam}
                  </h2>
                  <p className="muted" style={{ fontSize: '0.9rem' }}>
                    {wereld.belofte}
                  </p>
                </div>
                {af && (
                  <span title="Deze wereld is uit" style={{ fontSize: 28, flexShrink: 0 }}>
                    🏆
                  </span>
                )}
              </div>

              <div className={styles.binnen}>
              <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                {wereld.lessen.map((les) => {
                  const resultaat = voortgang[les.id]
                  const open = isOntgrendeld(les.id, voortgang, modus)
                  const inhoud = (
                    <>
                      {/* Het beeld eerst: dat is waar een kind van vier de les aan
                          herkent. De titel staat ernaast voor wie al leest. */}
                      {/* Ook een gesloten les toont haar eigen beeld — grijs, met het
                          slotje ernaast. Een kind ziet dan wat er nog komt, en de
                          gestippelde rand en de vlakke achtergrond zeggen nog steeds
                          dat er niets te tikken valt. */}
                      <span
                        aria-hidden="true"
                        style={{
                          fontSize: 30, width: 40, textAlign: 'center', flexShrink: 0,
                          filter: open ? 'none' : 'grayscale(1)',
                          opacity: open ? 1 : 0.5,
                        }}
                      >
                        {les.icoon}
                      </span>
                      <span style={{ flex: 1, textAlign: 'left' }}>{les.titel}</span>
                      {open ? (
                        <Sterren aantal={resultaat?.sterren ?? 0} />
                      ) : (
                        // "nog dicht" was tekst, en dat is precies wat de doelgroep
                        // niet leest. Het slotje zegt hetzelfde zonder woorden.
                        <span aria-label="Nog op slot" style={{ fontSize: 26 }}>
                          🔒
                        </span>
                      )}
                    </>
                  )
                  return (
                    <li key={les.id}>
                      {open ? (
                        <Link
                          href={`/les/${les.id}/`}
                          className="btn"
                          style={{ width: '100%', justifyContent: 'space-between' }}
                        >
                          {inhoud}
                        </Link>
                      ) : (
                        <span
                          className="btn"
                          aria-disabled="true"
                          style={{
                            width: '100%',
                            justifyContent: 'space-between',
                            // Gedempte kleur in plaats van doorzichtigheid: op 0,5 haalde
                            // deze tekst het contrast van 4,5:1 in het lichte thema niet.
                            color: 'var(--muted)',
                            // En verder: geen knop meer. Geen schaduw, een gestippelde
                            // rand en een vlakkere achtergrond, zodat je zonder te lezen
                            // ziet dat hier niets te tikken valt.
                            background: 'var(--surface-2)',
                            border: '2px dashed var(--line)',
                            boxShadow: 'none',
                            cursor: 'default',
                          }}
                        >
                          {inhoud}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ol>

              {wereld.minispel && (
                <Link href={`/spel/${wereld.minispel}/`} className="btn btn--ghost">
                  <span aria-hidden="true" style={{ fontSize: 26 }}>
                    🎲
                  </span>{' '}
                  Minispel: {wereld.minispel.replaceAll('-', ' ')}
                </Link>
              )}

              {wereld.diploma && af && (
                <Link href={`/diploma/${wereld.diploma}/`} className="btn btn--primary">
                  🏅 Bekijk je hoefijzer {wereld.diploma}
                </Link>
              )}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}
