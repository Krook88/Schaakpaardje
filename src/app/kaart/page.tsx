'use client'

import Link from 'next/link'
import { Kop } from '@/ui/Kop'
import { Sterren } from '@/ui/Sterren'
import { WERELDEN } from '@/content'
import {
  isOntgrendeld,
  useModus,
  useToestandGeladen,
  useVoortgang,
  volgendeOpenLes,
  wereldIsAf,
} from '@/progress/store'
import styles from './Kaart.module.css'
import pad from './Pad.module.css'

/** Eén halteplaats op het pad: een les, of het minispel aan het eind van een wereld. */
type Halte = {
  id: string
  icoon: string
  titel: string
  href: string
  open: boolean
  /** Null bij het minispel: daar zijn geen sterren te halen. */
  sterren: number | null
  af: boolean
  /** Staat Pip hier? */
  jij: boolean
}

/**
 * Het pad. Bewust één lijn van boven naar beneden: een vertakte kaart is voor een
 * vijfjarige niet te lezen. Wat af is krijgt kleur, wat nog dicht zit een slotje.
 */
export default function Kaart() {
  const voortgang = useVoortgang()
  const modus = useModus()
  const geladen = useToestandGeladen()
  // Waar het kind gebleven is: de enige plek op de hele kaart waar Pip staat.
  const hier = volgendeOpenLes(voortgang, modus).id

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
          // De halteplaatsen van deze wereld: eerst de lessen, dan het minispel als
          // laatste stop. Het minispel stond eronder als losse knop en werd daardoor
          // met geen mogelijkheid gevonden; op het pad is het gewoon de volgende halte.
          const haltes: Halte[] = [
            ...wereld.lessen.map((les) => ({
              id: les.id,
              icoon: les.icoon,
              titel: les.titel,
              href: `/les/${les.id}/`,
              open: isOntgrendeld(les.id, voortgang, modus),
              sterren: voortgang[les.id]?.sterren ?? 0,
              af: (voortgang[les.id]?.sterren ?? 0) >= 2,
              jij: les.id === hier,
            })),
            ...(wereld.minispel
              ? [
                  {
                    id: `spel-${wereld.minispel}`,
                    icoon: '🎲',
                    titel: `Minispel: ${wereld.minispel.replaceAll('-', ' ')}`,
                    href: `/spel/${wereld.minispel}/`,
                    open: true,
                    sterren: null,
                    af: false,
                    jij: false,
                  },
                ]
              : []),
          ]
          const sterrenNu = wereld.lessen.reduce((n, l) => n + (voortgang[l.id]?.sterren ?? 0), 0)
          const sterrenMax = wereld.lessen.length * 3

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

              {/* Hoeveel sterren er in deze wereld te halen zijn, en hoeveel er al
                  liggen. Een balk die voller wordt zegt dat zonder één cijfer; het
                  getal ernaast is voor wie leest, en voor de schermlezer. */}
              <div className={styles.oogst}>
                <div
                  className={styles.balk}
                  role="img"
                  aria-label={`${sterrenNu} van de ${sterrenMax} sterren in deze wereld`}
                >
                  <span
                    className={styles.vulling}
                    style={{ width: `${Math.round((sterrenNu / sterrenMax) * 100)}%` }}
                  />
                </div>
                <span className={styles.oogstGetal} aria-hidden="true">
                  ⭐ {sterrenNu}/{sterrenMax}
                </span>
              </div>

              <div className={styles.binnen}>
              {/* Het pad: één spoor met de lessen als halteplaatsen erop, en Pip op de
                  plek waar het kind gebleven is. Zie Pad.module.css voor waarom het
                  spoor kaarsrecht loopt en niet slingert. */}
              <ol className={pad.pad}>
                {haltes.map((halte, i) => {
                  const links = i % 2 === 0
                  const bol = [
                    pad.bol,
                    halte.af ? pad.af : '',
                    halte.open ? '' : pad.dicht,
                    halte.jij ? pad.jij : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
                  const binnenkant = (
                    <>
                      {halte.jij && (
                        <span className={pad.pip} aria-hidden="true">
                          🐴
                        </span>
                      )}
                      <span className={pad.icoon} aria-hidden="true">
                        {halte.icoon}
                      </span>
                      {!halte.open && (
                        <span className={pad.slot} aria-hidden="true">
                          🔒
                        </span>
                      )}
                    </>
                  )
                  return (
                    <li
                      key={halte.id}
                      className={`${pad.knoop} ${halte.af ? pad.gelopen : ''}`}
                    >
                      <div className={`${pad.bij} ${links ? pad.links : pad.rechts}`}>
                        <span className={`${pad.titel} ${halte.open ? '' : pad.dichtTekst}`}>
                          {halte.titel}
                        </span>
                        {halte.open && halte.sterren !== null && <Sterren aantal={halte.sterren} />}
                      </div>
                      {halte.open ? (
                        <Link
                          href={halte.href}
                          className={bol}
                          aria-label={
                            halte.sterren === null
                              ? halte.titel
                              : `${halte.titel}, ${halte.sterren} van de 3 sterren${halte.jij ? ', hier ben je gebleven' : ''}`
                          }
                        >
                          {binnenkant}
                        </Link>
                      ) : (
                        <span
                          className={bol}
                          aria-disabled="true"
                          aria-label={`${halte.titel}, nog op slot`}
                        >
                          {binnenkant}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ol>

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
