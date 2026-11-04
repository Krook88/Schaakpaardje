'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { Icoon, WereldWapen, icoonBeeld, kaartBeeld, lesIcoon, pipBeeld, pipLos } from '@/ui/beelden'
import Link from 'next/link'
import { Kop } from '@/ui/Kop'
import { Sterren } from '@/ui/Sterren'
import { WERELDEN } from '@/content'
import { DIPLOMAS } from '@/content/diplomas'
import {
  diplomaBehaald,
  useProfiel,
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
  const profiel = useProfiel()
  const modus = useModus()
  const geladen = useToestandGeladen()
  // Waar het kind gebleven is: de enige plek op de hele kaart waar Pip staat.
  const hier = volgendeOpenLes(voortgang, modus).id
  const [wiebel, setWiebel] = useState<string | null>(null)
  const wiebelTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const tikDicht = (id: string) => {
    setWiebel(id)
    clearTimeout(wiebelTimer.current)
    wiebelTimer.current = setTimeout(() => setWiebel(null), 1800)
  }
  useEffect(() => () => clearTimeout(wiebelTimer.current), [])

  // Meteen naar de plek waar Pip staat: met drie afgeronde werelden erboven moest een
  // kind eerst ver scrollen om de volgende les te vinden.
  useEffect(() => {
    if (!geladen) return
    const el = document.querySelector('[data-hier]')
    if (el && el.getBoundingClientRect().top > window.innerHeight * 0.6) {
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      // Past de plank samen met de les van vandaag in beeld, dan begint het beeld bij de
      // plank; anders gaat de les voor (40e review).
      const plank = document.getElementById('plank-kop')?.closest('section')
      const past = plank && el.getBoundingClientRect().bottom - plank.getBoundingClientRect().top <= window.innerHeight - 4
      if (plank && past) plank.scrollIntoView({ block: 'start', behavior })
      else el.scrollIntoView({ block: 'center', behavior })
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
  const hierNaam = WERELDEN.find((w) => w.id === hierWereld)?.naam
  const gewonnen = WERELDEN.filter((w) => wereldIsAf(w.id, voortgang))

  return (
    <main className="page">
      <Kop titel="De kaart" terug="/" />
      {/* Jouw reis in één oogopslag: alle wereldwapens op een rij (gehaald in kleur,
          waar Pip staat omcirkeld), de sterren en de hoefijzers. Op de kaart zag je
          eerst alleen de wereld waar je nu was, en daaronder veertien grijze stroken
          (27e review: "meer een lijst dan een kaart"). */}
      <section className={`card ${styles.reis}`} aria-label="Jouw reis">
        {/* De trofeeënplank: wat dit kind al gehaald heeft, groot en in één beeld. Bij
            drie werelden af stond dat ingeklapt onder elkaar en zag je het nergens in één
            keer (39e review: kaart met 3 af een 6). */}
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
                <WereldWapen id={w.id} maat={28} />
              </span>
            )
          })}
        </div>
        {/* Geen tellers op nul: "0 sterren, nog geen hoefijzer" zei een nieuwe ouder
            alleen "je hebt nog niks" (30e review). */}
        {sterrenTotaal(voortgang) > 0 && (
          <p className={styles.reisTotaal}>
            <span><Icoon naam="ster-vol" maat={22} /> {sterrenTotaal(voortgang)} sterren</span>
            {hoefijzers.length > 0 && (
              <span role="img" aria-label={`${hoefijzers.length} hoefijzers`} aria-hidden={gewonnen.length > 0 || undefined}>{hoefijzers.map((d) => <Icoon key={d.soort} naam={`medaille-${d.soort}`} maat={28} />)}</span>
            )}
          </p>
        )}
      </section>
      <div className="stack">
        {/* De trofeeënplank staat vlak boven de wereld van vandaag: de kaart scrolt naar
            Pip, en bovenaan zag niemand hem (40e review). */}
        {WERELDEN.filter(isOpen).map((wereld) => {
          const af = wereldIsAf(wereld.id, voortgang)
          // De halteplaatsen van deze wereld: eerst de lessen, dan het minispel als
          // laatste stop. Het minispel stond eronder als losse knop en werd daardoor
          // met geen mogelijkheid gevonden; op het pad is het gewoon de volgende halte.
          const haltes: Halte[] = [
            ...wereld.lessen.map((les) => ({
              id: les.id,
              icoon: lesIcoon(les.id),
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
                    icoon: icoonBeeld('minispel'),
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

          const plankHier = wereld.id === hierWereld
          return (
            <Fragment key={wereld.id}>
            {plankHier && gewonnen.length > 0 && (

          <section className={`card ${styles.plank}`}>
            <h2 id="plank-kop" className={styles.plankKop}>{profiel ? `Wat ${profiel.naam} al kan` : 'Wat je al kunt'}</h2>
            <ul className={styles.plankRij} aria-labelledby="plank-kop">
              {gewonnen.map((w) => (
                <li key={w.id} className={styles.plankWapen} title={w.naam}>
                  <WereldWapen id={w.id} maat={64} />
                  <span>{w.naam}</span>
                </li>
              ))}
              {hoefijzers.map((d) => (
                <li key={d.soort} className={styles.plankWapen} title={d.wat}>
                  <Icoon naam={`medaille-${d.soort}`} maat={64} />
                  <span>{d.wat}</span>
                </li>
              ))}
            </ul>
            {/* Wat al gehaald is, als telling: geen reeks, geen opdracht (conversie, ronde 18). */}
            <p className={styles.plankTel}>
              <span className={styles.plankDeel}><Icoon naam="ster-vol" maat={20} /> {sterrenTotaal(voortgang)} sterren</span>
              <span className={styles.plankDeel}>{gewonnen.length} van de {WERELDEN.length} werelden af</span>
            </p>
          </section>
            )}
            <section
              className={`card ${styles.wereld}`}
              style={{ '--toon': wereld.toon } as React.CSSProperties}
            >
              <div className={styles.band}>
                <span className={styles.wapen} aria-hidden="true">
                  <WereldWapen id={wereld.id} maat={46} />
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
                  <span role="img" aria-label="Deze wereld is uit" title="Deze wereld is uit" style={{ flexShrink: 0 }}>
                    <Icoon naam="beker" maat={30} />
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
                  <Icoon naam="ster-vol" maat={18} /> {sterrenNu}/{sterrenMax}
                </span>
              </div>

              {/* Een wereld die af is en waar Pip niet meer staat, klapt dicht: anders
                  stonden er drie volle paden vol sterren boven de les van vandaag. Tik
                  op de regel en hij gaat weer open, om een les over te doen. */}
              <Uitklap ingeklapt={af && wereld.id !== hierWereld} toon={af}>
              <summary className={styles.uitklapKnop}>
                <span className={styles.dicht_}>Lessen bekijken</span>
                <span className={styles.open_}>Dichtklappen</span>
                <span className={styles.chevron} aria-hidden="true">⌄</span>
              </summary>
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
                          {/* eslint-disable-next-line @next/next/no-img-element -- statische export, SVG */}
                          <img src={pipLos('blij')} alt="" width={44} height={44} style={{ display: 'block' }} />
                        </span>
                      )}
                      <span className={pad.icoon} aria-hidden="true">
                        <Icoon src={halte.icoon} maat={44} style={{ display: 'block' }} />
                      </span>
                      {!halte.open && (
                        <span className={pad.slot} aria-hidden="true">
                          <Icoon naam="slot" maat={22} style={{ display: 'block' }} />
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
                        {/* Het enige open rondje zag er niet uit als iets om op te tikken
                            (30e review). Een woord erbij, voor de ouder die meekijkt. */}
                        {halte.jij && <span className={styles.beginHier}>▶ Begin hier</span>}
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
                  <Icoon naam="sticker" maat={26} /> Bekijk je hoefijzer {wereld.diploma}
                </Link>
              )}
              </div>
              </Uitklap>
              {/* De kaartstrook van deze wereld (getekend), in plaats van drie CSS-heuvels:
                  de kaart als landschap, niet als stapel kaarten (36e review). */}
              {/* Volgt het thema van het besturingssysteem; een handmatige keuze
                  (data-theme) wordt nergens gezet, dus dat is hier gelijk. */}
              <picture className={styles.strook} aria-hidden="true">
                <source media="(prefers-color-scheme: dark)" srcSet={kaartBeeld(wereld.id, true)} />
                {/* eslint-disable-next-line @next/next/no-img-element -- statische export, SVG */}
                <img src={kaartBeeld(wereld.id)} alt="" loading="lazy" decoding="async" />
              </picture>
            </section>
            </Fragment>
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
              <li key={w.id} style={{ '--toon': w.toon } as React.CSSProperties}>
                {/* Een knop die niets opent maar wel antwoord geeft: een kind van vier
                    tikte op een vrolijke tegel en er gebeurde niets (30e review). */}
                <button
                  type="button"
                  className={`${styles.tegel} ${wiebel === w.id ? styles.wiebelt : ''}`}
                  onClick={() => tikDicht(w.id)}
                  aria-label={`${w.nummer}. ${w.naam}, nog op slot. ${w.belofte}`}
                >
                <span className={styles.tegelWapen} aria-hidden="true">
                  <WereldWapen id={w.id} maat={48} />
                </span>
                <strong className={styles.tegelNaam}>
                  {w.nummer}. {w.naam}
                </strong>
                <span className={styles.tegelBelofte}>{w.belofte}</span>
                <span className={styles.tegelSlot} aria-hidden="true">
                  <Icoon naam="slot" maat={18} />
                </span>
                {wiebel === w.id && hierNaam && (
                  <span className={styles.tegelEerst} role="status">
                    Eerst {hierNaam}!
                  </span>
                )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Wie tot onderaan scrolde, liep dood op een tegel op slot. */}
      <Link href={`/les/${hier}/`} className="btn btn--primary btn--big" style={{ marginTop: 22, width: '100%', justifyContent: 'center' }}>
        ▶ Verder met de les
      </Link>
    </main>
  )
}

/**
 * Een afgeronde wereld kan dichtklappen (met de knop als eerste kind, de summary); een
 * wereld die nog bezig is, toont gewoon zijn pad zonder knop ervoor.
 * Ongecontroleerd (`defaultOpen` via de eerste render): React zet `open` niet terug als
 * het kind zelf heeft uit- of ingeklapt.
 */
function Uitklap({ ingeklapt, toon, children }: { ingeklapt: boolean; toon: boolean; children: React.ReactNode }) {
  if (!toon) {
    const [, ...rest] = Array.isArray(children) ? children : [children]
    return <>{rest}</>
  }
  return (
    <details className={styles.uitklap} open={!ingeklapt ? true : undefined}>
      {children}
    </details>
  )
}
