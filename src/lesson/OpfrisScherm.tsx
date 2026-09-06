'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Board, type BoardMarks } from '@/board/Board'
import { Confetti } from '@/ui/Confetti'
import { Kop } from '@/ui/Kop'
import { pipZinnen } from '@/content/voice'
import { Teller } from '@/ui/Teller'
import { Pip, type PipStemming } from '@/ui/Pip'
import { sfx } from '@/audio/sfx'
import { kies, wachtTotUitgesproken } from '@/audio/voice'
import {
  HINT_GEGEVEN,
  OPFRISSER_KLAAR,
  OPFRISSER_LEEG,
  OPFRISSER_START,
  WEET_JE_HET_NOG,
} from '@/content/voice'
import { type Square } from '@/engine/board'
import {
  antwoordQuiz,
  doelVelden,
  hint as geefHint,
  mogelijkeVelden,
  startOpgave,
  tik,
  type OpgaveStand,
} from '@/lesson/runner'
import { kiesOpfrisopgaven, type Opfrisopgave } from '@/lesson/opfrisser'
import { useInstellingen, useModus, useProfielStore, useToestandGeladen, useVoortgang } from '@/progress/store'
import styles from './LessonPlayer.module.css'

/**
 * Pips opfrisser: drie oude opgaven, twee minuten, geen cijfer.
 *
 * Bewust géén lesscherm-met-fasen. Er zijn geen sterren te halen en geen sterren te
 * verliezen; een fout kost hier niets en de hint ook niet. Het is opwarmen. Wie
 * halverwege wegloopt heeft niets stukgemaakt — de lessen die aan de beurt kwamen
 * schuiven pas op als je ze echt gedaan hebt.
 */
export function OpfrisScherm() {
  const geladen = useToestandGeladen()
  const voortgang = useVoortgang()
  const instellingen = useInstellingen()
  const zinnen = pipZinnen(useModus() === 'schaker')
  const bewaarOpfrissing = useProfielStore((s) => s.bewaarOpfrissing)

  // Eén keer kiezen, bij binnenkomst. Zou dit elke hertekening opnieuw gebeuren, dan
  // wisselde de opgave onder de handen van het kind zodra een les opschuift.
  const [ronde, setRonde] = useState<Opfrisopgave[] | null>(null)
  useEffect(() => {
    if (!geladen || ronde) return
    setRonde(kiesOpfrisopgaven(voortgang))
  }, [geladen, ronde, voortgang])

  const [index, setIndex] = useState(0)
  const [stand, setStand] = useState<OpgaveStand | null>(null)
  const [zin, setZin] = useState<string>(OPFRISSER_START)
  const [stemming, setStemming] = useState<PipStemming>('blij')
  const [hintVelden, setHintVelden] = useState<Square[]>([])
  const [shake, setShake] = useState<Square | null>(null)
  const [klaar, setKlaar] = useState(false)
  const [quizFout, setQuizFout] = useState<number | null>(null)
  const [quizGoed, setQuizGoed] = useState<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const huidig = ronde?.[index]

  useEffect(() => {
    if (!huidig) return
    setStand(startOpgave(huidig.opgave))
    setZin('vraag' in huidig.opgave ? huidig.opgave.vraag : WEET_JE_HET_NOG)
    setStemming('denkt')
    setHintVelden([])
    setQuizFout(null)
    setQuizGoed(null)
  }, [huidig])

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const verder = useCallback(() => {
    if (!ronde) return
    // De les schuift terug in de rij: hij is net weer opgehaald.
    if (ronde[index]) bewaarOpfrissing(ronde[index].lesId)
    if (index + 1 < ronde.length) setIndex(index + 1)
    else {
      setKlaar(true)
      setZin(OPFRISSER_KLAAR)
      setStemming('trots')
      if (instellingen.effecten) sfx.diploma()
    }
  }, [ronde, index, bewaarOpfrissing, instellingen.effecten])

  const gelukt = useCallback(() => {
    if (instellingen.effecten) sfx.goed()
    setStemming('blij')
    setZin(kies(zinnen.PRIJS_LAATSTE, 'prijs'))
    if (timer.current) clearTimeout(timer.current)
    // Eerst Pip laten uitpraten, dan pas de volgende opgave.
    timer.current = setTimeout(() => void wachtTotUitgesproken().then(verder), 700)
  }, [instellingen.effecten, verder])

  const opVeld = useCallback(
    (veld: Square) => {
      if (!stand || stand.klaar) return
      const r = tik(stand, veld)
      setStand(r.stand)
      setHintVelden([])
      switch (r.uit) {
        case 'geselecteerd':
          if (instellingen.effecten) sfx.tik()
          break
        case 'goed':
          if (instellingen.effecten) sfx.goed()
          setZin(kies(zinnen.PRIJS, 'prijs'))
          setStemming('juicht')
          break
        case 'zet':
          if (instellingen.effecten) sfx.zet()
          break
        case 'sla':
          if (instellingen.effecten) sfx.slaan()
          break
        case 'klaar':
          gelukt()
          break
        case 'fout': {
          if (instellingen.effecten) sfx.fout()
          setShake(null)
          setTimeout(() => setShake(veld), 0)
          const tip = 'foutTip' in r.stand.opgave ? r.stand.opgave.foutTip : undefined
          setZin(tip ?? kies(zinnen.BIJNA, 'bijna'))
          setStemming('moedigt')
          break
        }
      }
    },
    [stand, instellingen.effecten, gelukt],
  )

  const opQuiz = useCallback(
    (i: number) => {
      if (!stand) return
      const r = antwoordQuiz(stand, i)
      setStand(r.stand)
      if (r.goed) {
        setQuizGoed(i)
        setQuizFout(null)
        gelukt()
      } else {
        setQuizFout(null)
        setTimeout(() => setQuizFout(i), 0)
        if (instellingen.effecten) sfx.fout()
        const tip = 'foutTip' in r.stand.opgave ? r.stand.opgave.foutTip : undefined
        setZin(tip ?? kies(zinnen.BIJNA, 'bijna'))
        setStemming('moedigt')
      }
    },
    [stand, gelukt, instellingen.effecten],
  )

  const marks: BoardMarks = useMemo(() => {
    if (!stand) return {}
    const m: BoardMarks = { good: stand.gevonden, glow: hintVelden, last: stand.laatsteZet ?? undefined }
    if (stand.misser) m.bad = [stand.misser]
    if (stand.geselecteerd) m.targets = mogelijkeVelden(stand, stand.geselecteerd)
    if (stand.opgave.kind === 'reach') m.goals = [stand.opgave.doel]
    return m
  }, [stand, hintVelden])

  if (!geladen || !ronde) return <main className="page" />

  if (!ronde.length || klaar) {
    return (
      <main className="page">
        <Kop titel="Opfrissen" terug="/" />
        <div className="stack center">
          <Pip zegt={ronde.length ? zin : OPFRISSER_LEEG} stemming="trots" />
          <div className="card stack center" style={{ position: 'relative', overflow: 'hidden' }}>
            {ronde.length > 0 && <Confetti />}
            <span style={{ fontSize: 64 }} aria-hidden="true">
              {ronde.length ? '🎉' : '🌱'}
            </span>
            <Link href="/" className="btn btn--primary btn--big">
              <span aria-hidden="true" style={{ fontSize: 30 }}>
                🏠
              </span>{' '}
              Terug naar de stal
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (!stand || !huidig) return <main className="page" />
  const opgave = stand.opgave
  const totaalTeVinden = opgave.kind === 'tapSquares' || opgave.kind === 'tapMoves' ? doelVelden(opgave).length : 0

  return (
    <main className="page">
      <Kop titel="Opfrissen" terug="/" />
      <div className="stack">
        {/* Welke opgave van de drie, zonder te hoeven lezen. */}
        <div className="row" style={{ justifyContent: 'center', gap: 10 }} aria-label={`Opgave ${index + 1} van ${ronde.length}`}>
          {ronde.map((o, i) => (
            <span
              key={o.lesId}
              aria-hidden="true"
              style={{
                fontSize: i === index ? 28 : 22,
                width: 44, height: 44, borderRadius: '50%',
                display: 'grid', placeItems: 'center',
                background: i === index ? 'var(--accent-soft)' : 'transparent',
                border: i === index ? '2px solid var(--accent)' : '2px solid transparent',
                filter: i <= index ? 'none' : 'grayscale(1)',
                opacity: i <= index ? 1 : 0.45,
              }}
            >
              {o.icoon}
            </span>
          ))}
        </div>

        <Pip zegt={zin} stemming={stemming} klein />

        {opgave.kind === 'quiz' ? (
          <div className={styles.quiz}>
            {opgave.opties.map((optie, i) => (
              <button
                key={optie.label}
                type="button"
                className={`btn btn--big ${styles.quizKnop} ${
                  quizGoed === i ? styles.quizJuist : quizFout === i ? styles.quizMis : ''
                }`}
                onClick={() => opQuiz(i)}
                disabled={stand.klaar}
              >
                {optie.emoji && (
                  <span className={styles.quizBeeld} aria-hidden="true">
                    {optie.emoji}
                  </span>
                )}
                <span className={styles.quizTekst}>{optie.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.bord}>
            <Board
              position={stand.board}
              selected={stand.geselecteerd}
              marks={marks}
              shake={shake}
              onSquare={opVeld}
              disabled={stand.klaar}
              showCoordinates={instellingen.coordinaten}
              label={'vraag' in opgave ? opgave.vraag : huidig.lesTitel}
            />
          </div>
        )}

        <div className={`row ${styles.kolom}`} style={{ justifyContent: 'space-between' }}>
          {opgave.kind !== 'quiz' && (
            <button
              type="button"
              className="btn"
              style={{ minHeight: 60 }}
              disabled={stand.klaar}
              onClick={() => {
                const r = geefHint(stand)
                setStand(r.stand)
                setHintVelden(r.velden)
                setStemming('denkt')
                setZin(HINT_GEGEVEN)
              }}
            >
              <span aria-hidden="true" style={{ fontSize: 28 }}>
                💡
              </span>{' '}
              Help me even
            </button>
          )}
          {totaalTeVinden > 0 && <Teller gevonden={stand.gevonden.length} totaal={totaalTeVinden} />}
          {/* Overslaan mag: dit is opwarmen. Wie een opgave niet ziet zitten hoeft
              niet vast te lopen op iets wat vandaag toch geen cijfer oplevert. */}
          <button type="button" className="btn btn--ghost" onClick={verder}>
            <span aria-hidden="true" style={{ fontSize: 26 }}>
              ⏭️
            </span>{' '}
            Volgende
          </button>
        </div>
      </div>
    </main>
  )
}
