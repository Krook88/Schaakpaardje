'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Board, type BoardMarks } from '@/board/Board'
import { Kop } from '@/ui/Kop'
import { Pip, type PipStemming } from '@/ui/Pip'
import { Sterren } from '@/ui/Sterren'
import { sfx } from '@/audio/sfx'
import { kies, speak, stopSpeaking } from '@/audio/voice'
import {
  AANMOEDIGING,
  BIJNA,
  PRIJS,
  PRIJS_LAATSTE,
  STER1,
  STER2,
  STER3,
  WERELD_AF,
} from '@/content/voice'
import { volgendeLes, type Lesson, type World } from '@/content'
import { type Square } from '@/engine/board'
import {
  antwoordQuiz,
  doelVelden,
  hint as geefHint,
  mogelijkeVelden,
  startOpgave,
  sterrenVoor,
  tik,
  type OpgaveStand,
} from './runner'
import {
  useInstellingen,
  useProfielStore,
  useToestandGeladen,
  useVoortgang,
  wereldIsAf,
} from '@/progress/store'
import styles from './LessonPlayer.module.css'

type Fase = 'kijken' | 'meedoen' | 'zelf' | 'toets' | 'beloning'
const VOLGORDE: Fase[] = ['kijken', 'meedoen', 'zelf', 'toets', 'beloning']

const FASE_NAAM: Record<Fase, string> = {
  kijken: 'Kijken',
  meedoen: 'Meedoen',
  zelf: 'Zelf doen',
  toets: 'Laat maar zien',
  beloning: 'Klaar!',
}

export function LessonPlayer({ les, wereld }: { les: Lesson; wereld: World }) {
  const [fase, setFase] = useState<Fase>('kijken')
  const [vertelIndex, setVertelIndex] = useState(0)
  const [opgaveIndex, setOpgaveIndex] = useState(0)
  const [stand, setStand] = useState<OpgaveStand | null>(null)
  const [zin, setZin] = useState<string>(les.vertel[0] ?? '')
  const [stemming, setStemming] = useState<PipStemming>('blij')
  const [hintVelden, setHintVelden] = useState<Square[]>([])
  const [shake, setShake] = useState<Square | null>(null)
  /** Welke quizknop net fout was, en welke net goed. Alleen om het te laten zien. */
  const [quizFout, setQuizFout] = useState<number | null>(null)
  const [quizGoed, setQuizGoed] = useState<number | null>(null)
  const [toetsFouten, setToetsFouten] = useState(0)
  const [toetsHints, setToetsHints] = useState(0)
  const [sterren, setSterren] = useState<0 | 1 | 2 | 3>(0)

  const bewaarLes = useProfielStore((s) => s.bewaarLes)
  const geefSticker = useProfielStore((s) => s.geefSticker)
  const instellingen = useInstellingen()
  const voortgang = useVoortgang()
  const geladen = useToestandGeladen()
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const later = useCallback((fn: () => void, ms: number) => {
    // Afgelopen timers eruit: anders groeit deze lijst een hele les lang door.
    const id = setTimeout(() => {
      timers.current = timers.current.filter((t) => t !== id)
      fn()
    }, ms)
    timers.current.push(id)
  }, [])

  /** Alle geplande doorschakelingen afbreken. */
  const stopTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  useEffect(
    () => () => {
      stopTimers()
      stopSpeaking()
    },
    [stopTimers],
  )

  const opgaven = useMemo(() => {
    if (fase === 'meedoen') return les.meedoen
    if (fase === 'zelf') return les.zelf
    if (fase === 'toets') return les.toets
    return []
  }, [fase, les])

  const opgave = opgaven[opgaveIndex]

  /* ---------- fase- en opgavewissels ---------- */

  const startFase = useCallback(
    (nieuw: Fase) => {
      setFase(nieuw)
      setOpgaveIndex(0)
      setHintVelden([])
      const lijst =
        nieuw === 'meedoen' ? les.meedoen : nieuw === 'zelf' ? les.zelf : nieuw === 'toets' ? les.toets : []
      if (lijst.length) {
        const eerste = startOpgave(lijst[0])
        setStand(eerste)
        setZin('vraag' in lijst[0] ? lijst[0].vraag : '')
        setStemming('denkt')
      }
    },
    [les],
  )

  const volgendeFase = useCallback(() => {
    const i = VOLGORDE.indexOf(fase)
    const volgende = VOLGORDE[i + 1] ?? 'beloning'
    if (volgende === 'beloning') {
      const behaald = sterrenVoor(toetsFouten, toetsHints)
      setSterren(behaald)
      setFase('beloning')
      bewaarLes(les.id, { sterren: behaald, fouten: toetsFouten, hints: toetsHints })
      if (behaald === 3) geefSticker(`${les.id}`)
      sfx.diploma()
      setStemming('trots')
      // De zin één keer kiezen, hier. Stond dit in de render, dan koos Pip bij elke
      // hertekening opnieuw en begon hij spontaan een andere zin uit te spreken.
      const wereldKlaar = wereldIsAf(wereld.id, {
        ...voortgang,
        [les.id]: { sterren: behaald, fouten: toetsFouten, hints: toetsHints, laatst: '' },
      })
      setZin(
        wereldKlaar
          ? kies(WERELD_AF, 'wereld')
          : kies(behaald === 3 ? STER3 : behaald === 2 ? STER2 : STER1, 'sterren'),
      )
      return
    }
    startFase(volgende)
  }, [fase, toetsFouten, toetsHints, bewaarLes, geefSticker, les.id, startFase, voortgang, wereld.id])

  const volgendeOpgave = useCallback(() => {
    setHintVelden([])
    setQuizFout(null)
    setQuizGoed(null)
    if (opgaveIndex + 1 < opgaven.length) {
      const nieuw = opgaven[opgaveIndex + 1]
      setOpgaveIndex(opgaveIndex + 1)
      setStand(startOpgave(nieuw))
      setZin('vraag' in nieuw ? nieuw.vraag : '')
      setStemming('denkt')
    } else {
      volgendeFase()
    }
  }, [opgaveIndex, opgaven, volgendeFase])

  /* ---------- reageren op een tik ---------- */

  const reageer = useCallback(
    (goed: boolean, klaar: boolean, tip?: string) => {
      if (goed) {
        if (instellingen.effecten) sfx.goed()
        setStemming('blij')
        setZin(kies(klaar ? PRIJS_LAATSTE : PRIJS, 'prijs'))
        if (klaar) later(volgendeOpgave, 1300)
      } else {
        if (instellingen.effecten) sfx.fout()
        setStemming('moedigt')
        setZin(tip ?? kies(BIJNA, 'bijna'))
      }
    },
    [instellingen.effecten, later, volgendeOpgave],
  )

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
          reageer(true, false)
          break
        case 'klaar':
          reageer(true, true)
          break
        case 'fout': {
          // Even op null zetten, anders ziet het bord dezelfde waarde en schudt het niet
          // opnieuw als het kind twee keer hetzelfde verkeerde veld aantikt.
          setShake(null)
          setTimeout(() => setShake(veld), 0)
          const tip = 'foutTip' in r.stand.opgave ? r.stand.opgave.foutTip : undefined
          reageer(false, false, tip)
          if (fase === 'toets') setToetsFouten((n) => n + 1)
          break
        }
        case 'sla':
          if (instellingen.effecten) sfx.slaan()
          setZin(kies(PRIJS, 'prijs'))
          break
        case 'zet':
          if (instellingen.effecten) sfx.zet()
          break
        case 'opnieuw':
          if (instellingen.effecten) sfx.fout()
          setStemming('moedigt')
          setZin('Dat lukte net niet binnen de zetten. We beginnen gewoon opnieuw.')
          if (fase === 'toets') setToetsFouten((n) => n + 1)
          break
      }
    },
    [stand, instellingen.effecten, reageer, fase],
  )

  const opQuiz = useCallback(
    (index: number) => {
      if (!stand) return
      const r = antwoordQuiz(stand, index)
      setStand(r.stand)
      if (r.goed) {
        setQuizGoed(index)
        setQuizFout(null)
        reageer(true, true)
      } else {
        setQuizFout(null)
        setTimeout(() => setQuizFout(index), 0)
        const tip = 'foutTip' in r.stand.opgave ? r.stand.opgave.foutTip : undefined
        reageer(false, false, tip)
        if (fase === 'toets') setToetsFouten((n) => n + 1)
      }
    },
    [stand, reageer, fase],
  )

  const vraagHint = useCallback(() => {
    if (!stand) return
    const r = geefHint(stand)
    setStand(r.stand)
    setHintVelden(r.velden)
    setStemming('denkt')
    setZin(r.velden.length ? 'Kijk eens naar het veld dat oplicht.' : kies(AANMOEDIGING, 'moed'))
    if (fase === 'toets') setToetsHints((n) => n + 1)
  }, [stand, fase])

  /* ---------- wat er op het bord te zien is ---------- */

  const marks: BoardMarks = useMemo(() => {
    if (!stand) return { glow: les.vertelWijs }
    const m: BoardMarks = { good: stand.gevonden, glow: hintVelden, last: stand.laatsteZet ?? undefined }
    if (stand.misser) m.bad = [stand.misser]
    if (stand.geselecteerd) {
      m.targets = mogelijkeVelden(stand, stand.geselecteerd)
    }
    if (stand.opgave.kind === 'reach') m.goals = [stand.opgave.doel]
    return m
  }, [stand, hintVelden, les.vertelWijs])

  const totaalTeVinden = stand && !stand.klaar ? doelVelden(stand.opgave).length : 0

  /* ---------- schermen ---------- */

  // Het lesscherm leest de instellingen (coördinaten, geluid) uit de opgeslagen
  // toestand; wachten tot die er is, scheelt een omklappend scherm bij het openen.
  if (!geladen) {
    return (
      <div className="page">
        <Kop titel={les.titel} terug="/kaart/" />
      </div>
    )
  }

  if (fase === 'kijken') {
    const laatste = vertelIndex >= les.vertel.length - 1
    return (
      <div className="page">
        <Kop titel={les.titel} terug="/kaart/" />
        <div className="stack">
          <Pip zegt={les.vertel[vertelIndex]} stemming={vertelIndex === 0 ? 'blij' : 'denkt'} />
          {les.vertelFen && (
            <div className={styles.bord}>
              <Board
                position={les.vertelFen}
                marks={{ glow: les.vertelWijs }}
                showCoordinates={instellingen.coordinaten || Boolean(les.toonCoordinaten)}
                label={`Uitleg bij ${les.titel}`}
              />
            </div>
          )}
          <div className={`row ${styles.kolom}`} style={{ justifyContent: 'space-between' }}>
            <span className="muted">
              {vertelIndex + 1} van {les.vertel.length}
            </span>
            <button
              type="button"
              className="btn btn--primary btn--big"
              onClick={() => {
                if (laatste) startFase('meedoen')
                else setVertelIndex((i) => i + 1)
              }}
            >
              {laatste ? 'Ik ga het proberen →' : 'Verder →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (fase === 'beloning') {
    const volgende = volgendeLes(les.id)
    const wereldKlaar = wereldIsAf(wereld.id, { ...voortgang, [les.id]: { sterren, fouten: 0, hints: 0, laatst: '' } })
    return (
      <div className="page">
        <Kop titel="Klaar!" terug="/kaart/" />
        <div className="stack center">
          <Pip zegt={zin} stemming="trots" />
          <div className="card stack center">
            <Sterren aantal={sterren} groot />
            <h2>{les.titel}</h2>
            {/* Niet les.doel: dat is de zin voor de ouder ("Je kind ziet dat...") en
                die stond hier letterlijk, over het kind gepraat tegen het kind. */}
            <p>{les.geleerd}</p>
            {sterren >= 3 && <p>🏅 Sticker verdiend!</p>}
            {wereldKlaar && (
              <p>
                🐴 <strong>{wereld.naam}</strong> is helemaal uit!
              </p>
            )}
          </div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <Link href="/kaart/" className="btn">
              Naar de kaart
            </Link>
            {volgende && (
              <Link href={`/les/${volgende.id}/`} className="btn btn--primary btn--big">
                Volgende les →
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* ---------- opgavescherm ---------- */
  if (!stand || !opgave) return null

  return (
    <div className="page">
      <Kop titel={`${les.titel} · ${FASE_NAAM[fase]}`} terug="/kaart/" />

      <div className="stack">
        <Pip zegt={zin} stemming={stemming} klein />

        {/* Bij één opgave zei die ene losse stip niets; dan laten we hem weg. */}
        {opgaven.length > 1 && (
        <div className={styles.voortgang} aria-label={`Opgave ${opgaveIndex + 1} van ${opgaven.length}`}>
          {opgaven.map((_, i) => (
            <span
              key={i}
              className={`${styles.stip} ${i < opgaveIndex ? styles.stipAf : ''} ${
                i === opgaveIndex ? styles.stipNu : ''
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
        )}

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
                {optie.emoji && <span aria-hidden="true">{optie.emoji}</span>} {optie.label}
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.bord}>
            <Board
              position={stand.board}
              selected={stand.geselecteerd}
              marks={marks}
              onSquare={opVeld}
              disabled={stand.klaar}
              shake={shake}
              showCoordinates={instellingen.coordinaten || Boolean(les.toonCoordinaten)}
              label={'vraag' in opgave ? opgave.vraag : les.titel}
            />
          </div>
        )}

        <div className={`row ${styles.kolom}`} style={{ justifyContent: 'space-between' }}>
          {opgave.kind !== 'quiz' && (
            // Bij een quiz gaf hint() geen enkel veld terug: het kind zag niets
            // gebeuren en raakte stilzwijgend een ster kwijt. Dan hoort de knop er
            // niet te staan.
            <button type="button" className="btn" onClick={vraagHint} disabled={stand.klaar}>
              💡 Help me even
            </button>
          )}
          {totaalTeVinden > 0 && (
            <span className="muted" aria-live="polite">
              {stand.gevonden.length} van de {totaalTeVinden} gevonden
            </span>
          )}
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              // Eerst de geplande doorschakeling afbreken: zonder dat sprong de app
              // 1300 ms later alsnog naar de volgende opgave.
              stopTimers()
              setStand(startOpgave(opgave))
              setHintVelden([])
              setShake(null)
              setQuizFout(null)
              setQuizGoed(null)
              setZin('vraag' in opgave ? opgave.vraag : '')
            }}
          >
            ↺ Opnieuw
          </button>
        </div>
      </div>
    </div>
  )
}
