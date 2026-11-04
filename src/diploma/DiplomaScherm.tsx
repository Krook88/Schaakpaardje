'use client'

import { useEffect, useState } from 'react'
import { WereldWapen, pipBeeld } from '@/ui/beelden'
import Link from 'next/link'
import { Confetti } from '@/ui/Confetti'
import { DeelKnop } from '@/ui/DeelKnop'
import { Kop } from '@/ui/Kop'
import { WERELDEN } from '@/content'
import { DIPLOMAS, type DiplomaSoort } from '@/content/diplomas'
import {
  diplomaBehaald,
  sterrenTotaal,
  useProfiel,
  useToestandGeladen,
  useVoortgang,
  wereldIsAf,
} from '@/progress/store'
import styles from './Diploma.module.css'

const KLEUR: Record<DiplomaSoort, string> = { brons: '🥉', zilver: '🥈', goud: '🥇' }

/**
 * Het certificaat. Bewust iets om uit te printen en op te hangen: een diploma dat alleen
 * in een app bestaat, voelt voor een kind van zeven als niets. Bij het printen vallen de
 * knoppen en de achtergrond weg, zodat er een schone oorkonde uit de printer komt.
 */
export function DiplomaScherm({ soort }: { soort: DiplomaSoort }) {
  const profiel = useProfiel()
  const voortgang = useVoortgang()
  const geladen = useToestandGeladen()
  const diploma = DIPLOMAS.find((d) => d.soort === soort)!
  const behaald = diplomaBehaald(soort, voortgang)
  const werelden = WERELDEN.filter((w) => w.nummer <= diploma.tot)
  const laatste = werelden[werelden.length - 1]
  const nogOpen = werelden.filter((w) => !wereldIsAf(w.id, voortgang)).length
  const sterren = sterrenTotaal(voortgang)

  // De datum hoort bij het moment van kijken, niet bij het moment van bouwen: in de
  // voorgerenderde HTML zou de dag van de uitrol staan.
  const [datum, setDatum] = useState('')
  useEffect(() => {
    setDatum(new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }))
  }, [])

  // Wachten tot de voortgang is ingelezen, anders krijgt een kind dat het diploma net
  // verdiend heeft eerst het slotje te zien.
  if (!geladen) {
    return (
      <main className="page">
        <Kop titel={diploma.naam} terug="/kaart/" />
      </main>
    )
  }

  if (!behaald) {
    const af = werelden.length - nogOpen
    return (
      <main className="page">
        <Kop titel={diploma.naam} terug="/kaart/" />
        {/* Een slotje op een leeg scherm zei niets (27e review: 3 van 10). Nu zie je het
            diploma waar je naartoe werkt, vaag achter glas, en hoe ver je al bent. */}
        <div className={styles.voorproef}>
          <article className={`${styles.oorkonde} ${styles[soort]} ${styles.wazig}`} aria-hidden="true">
            <p className={styles.klein}>Schaakmaatje</p>
            <p className={styles.medaille}>{KLEUR[soort]}</p>
            <p className={styles.titel}>{diploma.naam}</p>
            <p className={styles.uitgereikt}>is uitgereikt aan</p>
            <p className={styles.naam}>{profiel?.naam ?? 'een dappere schaker'}</p>
            <div className={styles.werelden}>
              {werelden.map((w) => (
                <span key={w.id} className={styles.wereld}>
                  <WereldWapen id={w.id} maat={22} /> {w.naam}
                </span>
              ))}
            </div>
          </article>
          <div className={`card stack center ${styles.slot}`}>
            <p style={{ fontSize: 46, margin: 0 }} aria-hidden="true">
              🔒
            </p>
            <h2>Nog even doorzetten</h2>
            {/* Geen gladde balk: bij 0 van 7 was dat een lege grijze streep (28e review).
                De werelden zelf, gehaalde in kleur, de rest vaag: dat leest ook een
                kind dat nog niet leest. */}
            <div className={styles.stappen} aria-label={`${af} van ${werelden.length} werelden uitgespeeld`}>
              {werelden.map((w) => (
                <span key={w.id} className={`${styles.stap} ${wereldIsAf(w.id, voortgang) ? styles.stapAf : ''}`} aria-hidden="true">
                  <WereldWapen id={w.id} maat={30} />
                </span>
              ))}
            </div>
            <p className="muted" style={{ margin: 0 }}>
              {/* Een wereldnummer zegt een kind niets; de naam en het aantal dat nog
                  open staat wel. */}
              Dit hoefijzer krijg je als je klaar bent tot en met <strong>{laatste?.naam}</strong>
              {nogOpen > 0 ? `. Nog ${nogOpen} ${nogOpen === 1 ? 'wereld' : 'werelden'} te gaan!` : '.'}
            </p>
            <Link href="/kaart/" className="btn btn--primary btn--big">
              Naar de kaart
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className={styles.verbergBijPrinten}>
        <Kop titel={diploma.naam} terug="/kaart/" />
      </div>

      <article className={`${styles.oorkonde} ${styles[soort]}`} style={{ position: 'relative' }}>
        {/* Alleen op het scherm: @media print laat de wolk vallen, dus op papier
            blijft de oorkonde een oorkonde. */}
        <Confetti />
        <p className={styles.klein}>Schaakmaatje</p>
        <p className={styles.medaille} aria-hidden="true">
          {KLEUR[soort]}
        </p>
        <h1 className={styles.titel}>{diploma.naam}</h1>
        <p className={styles.uitgereikt}>is uitgereikt aan</p>
        <p className={styles.naam}>{profiel?.naam ?? 'een dappere schaker'}</p>
        <p className={styles.wat}>
          {diploma.wat}. {werelden.length} werelden uitgespeeld, {sterren} sterren verdiend.
        </p>
        <div className={styles.werelden}>
          {werelden.map((w) => (
            <span key={w.id} className={styles.wereld}>
              <WereldWapen id={w.id} maat={22} /> {w.naam}
            </span>
          ))}
        </div>
        <p className={styles.datum}>{datum}</p>
        <p className={styles.handtekening}>
          {/* eslint-disable-next-line @next/next/no-img-element -- statische export, SVG */}
          <img src={pipBeeld('trots')} alt="" width={40} height={40} style={{ verticalAlign: 'middle' }} /> Pip het schaakpaardje
        </p>
      </article>

      <div className={`${styles.knoppen} ${styles.verbergBijPrinten}`}>
        <button type="button" className="btn btn--primary btn--big" onClick={() => window.print()}>
          🖨️ Printen
        </button>
        <Link href="/kaart/" className="btn">
          Terug naar de kaart
        </Link>
      </div>
      <div className={styles.verbergBijPrinten} style={{ marginTop: 18 }}>
        <DeelKnop waar="diploma" plaatje="/og.png" />
      </div>
    </main>
  )
}
