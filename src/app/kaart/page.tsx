'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Kop } from '@/ui/Kop'
import { Sterren } from '@/ui/Sterren'
import { WERELDEN } from '@/content'
import { DIPLOMAS } from '@/content/diplomas'
import {
  diplomaBehaald,
  isOntgrendeld,
  sterrenTotaal,
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

  // Meteen naar de plek waar Pip staat: met drie afgeronde werelden erboven moest een
  // kind eerst ver scrollen om de volgende les te vinden.
  useEffect(() => {
    if (!geladen) return
    const el = document.querySelector('[data-hier]')
    if (el && el.getBoundingClientRect().top > window.innerHeight * 0.6) {
      el.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    }
  }, [geladen, hier])

  // Zonder deze pauze toont de voorgerenderde HTML alle lessen op slot, en flitst dat
  // even in beeld voordat de echte voortgang er is.
  if (!geladen) {
    return (
      <main className="page">
        <Kop titel="De kaart" terug="/" />
      </main>
    )
  }

  const isOpen = (w: (typeof WERELDEN)[number]) => w.lessen.some((les) => isOntgrendeld(les.id, voortgang, modus))
  const dichte = WERELDEN.filter((w) => !isOpen(w))
  const hierWereld = WERELDEN.find((w) => w.lessen.some((l) => l.id === hier))?.id
  const hoefijzers = DIPLOMAS.filter((d) => diplomaBehaald(d.soort, voortgang))
  const KLEUR = { brons: '🥉', zilver: '🥈', goud: '🥇' } as const

  return (
    <main className="page">
      <Kop titel="De kaart" terug="/" />
      {/* Jouw reis in één oogopslag: alle wereldwapens op een rij (gehaald in kleur,
          waar Pip staat omcirkeld), de sterren en de hoefijzers. Op de kaart zag je
          eerst alleen de wereld waar je nu was, en daaronder veertien grijze stroken
          (27e review: "meer een lijst dan een kaart"). */}
      <section className={`card ${styles.reis}`} aria-label="Jouw reis">
        <div className={styles.reisWapens}>
          {WERELDEN.map((w) => {
            const af = wereldIsAf(w.id, voortgang)
            return (
              <span
                key={w.id}
                className={`${styles.reisWapen} ${af ? styles.reisAf : ''} ${w.id === hierWereld ? styles.reisHier : ''}`}
                style={{ '--toon': w.toon } as React.CSSProperties}
                aria-label={`${w.naam}${af ? ', af' : w.id === hierWereld ? ', hier ben je' : ''}`}
                role="img"
              >
                {w.emoji}
              </span>
            )
          })}
        </div>
        <p className={styles.reisTotaal}>
          <span>⭐ {sterrenTotaal(voortgang)} sterren</span>
          <span aria-label={`${hoefijzers.length} hoefijzers`}>
            {hoefijzers.length ? hoefijzers.map((d) => KLEUR[d.soort]).join(' ') : '🐴 nog geen hoefijzer'}
          </span>
        </p>
      </section>
      <div className="stack">
        {WERELDEN.filter(isOpen).map((wereld) => {
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

              {/* Een wereld die af is en waar Pip niet meer staat, klapt dicht: anders
                  stonden er drie volle paden vol sterren boven de les van vandaag. Tik
                  op de regel en hij gaat weer open, om een les over te doen. */}
              <details className={styles.uitklap} open={!af || wereld.id === hierWereld}>
              <summary className={styles.uitklapKnop}>{af ? 'Lessen bekijken' : 'Lessen'}</summary>
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
                      data-hier={halte.jij ? '' : undefined}
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
              </details>
              <div className={styles.heuvels} aria-hidden="true" />
            </section>
          )
        })}
      </div>

      {/* Wat nog komt: als tegels in de kleur van hun wereld, niet als grijze muur van
          slotjes. Wat komt gaat moet lonken. Op een telefoon twee naast elkaar, op een
          computer drie of vier, zodat de kaart niet 6.000 pixels lang wordt. */}
      {dichte.length > 0 && (
        <section aria-labelledby="komt-nog" style={{ marginTop: 22 }}>
          <h2 id="komt-nog" className={styles.komtNogKop}>
            Nog te ontdekken
          </h2>
          <ul className={styles.tegels}>
            {dichte.map((w) => (
              <li key={w.id} className={styles.tegel} style={{ '--toon': w.toon } as React.CSSProperties}>
                <span className={styles.tegelWapen} aria-hidden="true">
                  {w.emoji}
                </span>
                <strong className={styles.tegelNaam}>
                  {w.nummer}. {w.naam}
                </strong>
                <span className={styles.tegelBelofte}>{w.belofte}</span>
                <span className={styles.tegelSlot} aria-label="Nog op slot">
                  🔒
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
