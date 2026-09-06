'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Board, type BoardMarks } from '@/board/Board'
import { Kop } from '@/ui/Kop'
import { Pip, type PipStemming } from '@/ui/Pip'
import { Confetti } from '@/ui/Confetti'
import { Sterren } from '@/ui/Sterren'
import { Teller } from '@/ui/Teller'
import { sfx } from '@/audio/sfx'
import { kies, speak, stopSpeaking, wachtTotUitgesproken } from '@/audio/voice'
import { HINT_GEGEVEN, OPNIEUW_PROBEREN, pipZinnen } from '@/content/voice'
import { volgendeLes, wereldMet, type Lesson, type World } from '@/content'
import { vertelTekst, vertelWijzers } from '@/content/types'
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
  useHervatpunt,
  useModus,
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

/** Dezelfde vier fasen, maar dan zonder woorden. De volgorde is altijd deze. */
const FASE_BEELD: Record<Fase, string> = {
  kijken: '👀',
  meedoen: '🤝',
  zelf: '🙋',
  toets: '⭐',
  beloning: '🎉',
}
const FASE_VOLGORDE: Fase[] = ['kijken', 'meedoen', 'zelf', 'toets']

export function LessonPlayer({ les, wereld }: { les: Lesson; wereld: World }) {
  const [fase, setFase] = useState<Fase>('kijken')
  const [vertelIndex, setVertelIndex] = useState(0)
  const [opgaveIndex, setOpgaveIndex] = useState(0)
  const [stand, setStand] = useState<OpgaveStand | null>(null)
  const [zin, setZin] = useState<string>(les.vertel[0] ? vertelTekst(les.vertel[0]) : '')
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
  const bewaarHervatpunt = useProfielStore((s) => s.bewaarHervatpunt)
  const hervat = useHervatpunt(les.id)
  const geefSticker = useProfielStore((s) => s.geefSticker)
  const instellingen = useInstellingen()
  const modus = useModus()
  // Dezelfde categorieën, maar in de toon die bij deze speler past. "Hoppa! Precies
  // goed" is voor een vierjarige precies raak en voor een tienjarige precies mis.
  const zinnen = useMemo(() => pipZinnen(modus === 'schaker'), [modus])
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
    doorschakeling.current++
  }, [])

  /**
   * Doorschakelen zodra Pip is uitgesproken.
   *
   * Eerst een korte adempauze zodat het goed-geluid en het vinkje landen, en dan
   * wachten tot de zin echt af is. Met een vaste wachttijd werd Pip midden in "Hoppa!
   * Precies goed" afgekapt, want de volgende opgave vraagt meteen om een nieuwe zin.
   */
  const doorschakeling = useRef(0)
  const naHetPraten = useCallback(
    (doe: () => void) => {
      const mijn = ++doorschakeling.current
      later(() => {
        void wachtTotUitgesproken().then(() => {
          if (mijn === doorschakeling.current) doe()
        })
      }, 700)
    },
    [later],
  )

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

  /**
   * De opgave zoals hij in de content staat. Alleen om een opgave te stárten.
   *
   * Alles wat het scherm tekent, hoort uit `stand.opgave` te komen: dat is dezelfde
   * opgave, maar dan zoals de lesmotor hem kent — met de antwoorden van een quiz al
   * geschud. Hier stond één keer `opgave.opties` in de JSX, en toen kreeg een kind dat
   * het goede plaatje aantikte te horen dat het fout was: het scherm tekende de ene
   * volgorde en `antwoordQuiz` keek de andere na. De naam is nu lelijk genoeg om die
   * verwisseling niet nog eens per ongeluk te maken.
   */
  const ruweOpgave = opgaven[opgaveIndex]

  /* ---------- fase- en opgavewissels ---------- */

  const startFase = useCallback(
    (nieuw: Fase) => {
      setFase(nieuw)
      // Onthouden waar we zijn, zodat een kind dat halverwege stopt niet helemaal
      // vooraan hoeft te beginnen. Alleen de fase, niet de losse opgave: dan pak je
      // de draad op bij iets wat je herkent in plaats van midden in een vraag.
      bewaarHervatpunt(les.id, nieuw === 'kijken' ? null : nieuw)
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
    [les, bewaarHervatpunt],
  )
  // Verder waar het kind gebleven was. Pas na het inlezen van localStorage, en één
  // keer: daarna bepaalt het kind zelf waar het is.
  const hervatGedaan = useRef(false)
  useEffect(() => {
    if (!geladen || hervatGedaan.current) return
    hervatGedaan.current = true
    if (hervat && VOLGORDE.includes(hervat as Fase)) startFase(hervat as Fase)
  }, [geladen, hervat, startFase])

  const volgendeFase = useCallback(() => {
    const i = VOLGORDE.indexOf(fase)
    const volgende = VOLGORDE[i + 1] ?? 'beloning'
    if (volgende === 'beloning') {
      const behaald = sterrenVoor(toetsFouten, toetsHints)
      setSterren(behaald)
      setFase('beloning')
      bewaarLes(les.id, { sterren: behaald, fouten: toetsFouten, hints: toetsHints })
      bewaarHervatpunt(les.id, null)
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
          ? kies(zinnen.WERELD_AF, 'wereld')
          : kies(behaald === 3 ? zinnen.STER3 : behaald === 2 ? zinnen.STER2 : zinnen.STER1, 'sterren'),
      )
      return
    }
    startFase(volgende)
  }, [
    fase, toetsFouten, toetsHints, bewaarLes, bewaarHervatpunt, geefSticker, les.id,
    startFase, voortgang, wereld.id, zinnen,
  ])

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
        // 'juicht' in plaats van 'blij': dat is ook de stemming waarin Pip staat als
        // er niets gebeurt, dus een goed antwoord veranderde visueel helemaal niets.
        setStemming('juicht')
        setZin(kies(klaar ? zinnen.PRIJS_LAATSTE : zinnen.PRIJS, 'prijs'))
        if (klaar) naHetPraten(volgendeOpgave)
      } else {
        if (instellingen.effecten) sfx.fout()
        setStemming('moedigt')
        setZin(tip ?? kies(zinnen.BIJNA, 'bijna'))
      }
    },
    [instellingen.effecten, naHetPraten, volgendeOpgave, zinnen],
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
          setZin(kies(zinnen.PRIJS, 'prijs'))
          break
        case 'zet':
          if (instellingen.effecten) sfx.zet()
          break
        case 'opnieuw':
          if (instellingen.effecten) sfx.fout()
          setStemming('moedigt')
          setZin(kies(OPNIEUW_PROBEREN, 'opnieuw'))
          if (fase === 'toets') setToetsFouten((n) => n + 1)
          break
      }
    },
    [stand, instellingen.effecten, reageer, fase, zinnen],
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
    // HINT_GEGEVEN en niet dezelfde zin nog eens overgetypt: een letterlijke zin hier
    // ontsnapt aan `npm run audio:dekking` en wordt dus stilletjes niet ingesproken.
    setZin(r.velden.length ? HINT_GEGEVEN : kies(zinnen.AANMOEDIGING, 'moed'))
    if (fase === 'toets') setToetsHints((n) => n + 1)
  }, [stand, fase, zinnen])

  /* ---------- wat er op het bord te zien is ---------- */

  const marks: BoardMarks = useMemo(() => {
    if (!stand) return { glow: les.vertelWijs }
    // De hint gaat vóór het gegeven: wie om hulp vraagt moet zien wat de hint aanwijst,
    // niet het veld dat er toch al oplichtte.
    const gegeven = stand.opgave.kind === 'tapSquares' ? (stand.opgave.wijs ?? []) : []
    const m: BoardMarks = {
      good: stand.gevonden,
      glow: hintVelden.length ? hintVelden : gegeven,
      last: stand.laatsteZet ?? undefined,
    }
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
      <div className={`page ${styles.wereldpagina}`} style={{ '--toon': wereld.toon } as React.CSSProperties}>
        <Kop titel={les.titel} terug="/kaart/" />
      </div>
    )
  }

  if (fase === 'kijken') {
    const laatste = vertelIndex >= les.vertel.length - 1
    const dezeZin = les.vertel[vertelIndex]
    const spoor = dezeZin ? vertelWijzers(dezeZin) : []
    return (
      <div className={`page ${styles.wereldpagina}`} style={{ '--toon': wereld.toon } as React.CSSProperties}>
        <Kop titel={les.titel} terug="/kaart/" />
        <WereldBand wereld={wereld} />
        <FaseBalk nu="kijken" />
        <div className="stack">
          <Pip
            zegt={dezeZin ? vertelTekst(dezeZin) : ''}
            stemming={vertelIndex === 0 ? 'blij' : 'denkt'}
          />
          {les.vertelFen && (
            <div className={styles.bord}>
              {/* De sleutel is de zin, niet het bord: bij elke nieuwe zin begint het
                  spoor opnieuw te lopen in plaats van te blijven staan waar het stond. */}
              <Board
                key={vertelIndex}
                position={les.vertelFen}
                marks={{ glow: les.vertelWijs, spoor }}
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
              <span aria-hidden="true" style={{ fontSize: 30, lineHeight: 1 }}>
                {laatste ? '🤝' : '▶︎'}
              </span>{' '}
              {laatste ? 'Ik ga het proberen' : 'Verder'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (fase === 'beloning') {
    const volgende = volgendeLes(les.id)
    const wereldKlaar = wereldIsAf(wereld.id, { ...voortgang, [les.id]: { sterren, fouten: 0, hints: 0, laatst: '' } })
    // Ging er met deze les een héle nieuwe wereld open? Dat gebeurde tot nu toe
    // stilzwijgend: je maakte Torenburcht af, drukte op "volgende les" en stond
    // ineens in Loperbos zonder dat er iets gevierd was. Terwijl dit precies het
    // moment is waar een kind vier lessen lang naartoe heeft gewerkt.
    const nieuweWereld =
      volgende && volgende.wereldId !== wereld.id ? (wereldMet(volgende.wereldId) ?? null) : null
    return (
      <div className={`page ${styles.wereldpagina}`} style={{ '--toon': wereld.toon } as React.CSSProperties}>
        <Kop titel="Klaar!" terug="/kaart/" />
        <div className="stack center">
          <Pip zegt={zin} stemming="trots" />
          {/* Het moment waar een kind een hele les voor heeft gewerkt. Dat mag je niet
              stilzwijgend voorbij laten gaan: de sterren vliegen één voor één binnen,
              er valt confetti en Pip springt. Wie beweging heeft uitgezet krijgt
              gewoon het eindbeeld. */}
          <div className="card stack center" style={{ position: 'relative', overflow: 'hidden' }}>
            <Confetti />
            <Sterren aantal={sterren} groot vier />
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

          {nieuweWereld && (
            <div
              className={`card ${styles.poort}`}
              style={{ '--toon': nieuweWereld.toon } as React.CSSProperties}
            >
              <span className={styles.poortWapen} aria-hidden="true">
                {nieuweWereld.emoji}
              </span>
              <div>
                <p className={styles.poortKop}>Een nieuwe wereld gaat open!</p>
                <strong className={styles.poortNaam}>{nieuweWereld.naam}</strong>
                <p className="muted" style={{ margin: '2px 0 0', fontSize: '0.9rem' }}>
                  {nieuweWereld.belofte}
                </p>
              </div>
            </div>
          )}
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
  if (!stand || !ruweOpgave) return null
  const opgave = stand.opgave

  return (
    <div className={`page ${styles.wereldpagina}`} style={{ '--toon': wereld.toon } as React.CSSProperties}>
      <Kop titel={`${les.titel} · ${FASE_NAAM[fase]}`} terug="/kaart/" />
      <WereldBand wereld={wereld} />
      <FaseBalk nu={fase} />

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
                {/* Het plaatje is het antwoord, niet de versiering ernaast: een kind
                    van vier leest het label niet. Vandaar groot, en links, waar het
                    oog begint. */}
                {optie.veld ? (
                  <span
                    className={`${styles.quizVeld} ${optie.veld === 'donker' ? styles.quizVeldDonker : ''}`}
                    aria-hidden="true"
                  />
                ) : (
                  optie.emoji && (
                    <span className={styles.quizBeeld} aria-hidden="true">
                      {optie.emoji}
                    </span>
                  )
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
              onSquare={opVeld}
              disabled={stand.klaar}
              shake={shake}
              showCoordinates={instellingen.coordinaten || Boolean(les.toonCoordinaten)}
              label={'vraag' in opgave ? opgave.vraag : les.titel}
            />
          </div>
        )}

        {/* Hoe ver je bent, vlak onder het bord waar je kijkt — niet weggestopt naast
            de knoppen, want daar viel het buiten beeld zodra "Opnieuw" een regel
            omlaag ging. */}
        {totaalTeVinden > 0 && (
          <div className={`row ${styles.kolom}`} style={{ justifyContent: 'center' }}>
            <Teller gevonden={stand.gevonden.length} totaal={totaalTeVinden} />
          </div>
        )}

        <div className={`row ${styles.kolom}`} style={{ justifyContent: 'space-between' }}>
          {opgave.kind !== 'quiz' && (
            // Bij een quiz gaf hint() geen enkel veld terug: het kind zag niets
            // gebeuren en raakte stilzwijgend een ster kwijt. Dan hoort de knop er
            // niet te staan.
            <button
              type="button"
              className="btn"
              onClick={vraagHint}
              disabled={stand.klaar}
              style={{ minHeight: 60 }}
            >
              <span aria-hidden="true" style={{ fontSize: 28, lineHeight: 1 }}>
                💡
              </span>{' '}
              Help me even
            </button>
          )}
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              // Eerst de geplande doorschakeling afbreken: zonder dat sprong de app
              // 1300 ms later alsnog naar de volgende opgave.
              stopTimers()
              // Vanaf de ruwe opgave, niet vanaf de geschudde: startOpgave schudt zelf,
              // en twee keer schudden geeft een andere volgorde dan één keer. Dan zou
              // "Opnieuw" de antwoorden onder het kind vandaan schuiven.
              setStand(startOpgave(ruweOpgave))
              setHintVelden([])
              setShake(null)
              setQuizFout(null)
              setQuizGoed(null)
              setZin('vraag' in opgave ? opgave.vraag : '')
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 28, lineHeight: 1 }}>
              ↺
            </span>{' '}
            Opnieuw
          </button>
        </div>
      </div>
    </div>
  )
}


/**
 * Waar zijn we in de les? Vier plaatjes, altijd in dezelfde volgorde: kijken,
 * meedoen, zelf doen, laten zien. Voor een kind van vier is dit de enige aanwijzing
 * dat er een begin en een eind aan zit — "Rijen en lijnen · Laat maar zien" in de
 * bovenbalk leest het niet.
 */
function FaseBalk({ nu }: { nu: Fase }) {
  const hier = FASE_VOLGORDE.indexOf(nu)
  return (
    <div
      className="row"
      style={{ justifyContent: 'center', gap: 10, marginBottom: 8, flexWrap: 'nowrap' }}
      aria-label={`Stap ${hier + 1} van 4: ${FASE_NAAM[nu]}`}
    >
      {FASE_VOLGORDE.map((f, i) => (
        <span
          key={f}
          aria-hidden="true"
          title={FASE_NAAM[f]}
          style={{
            fontSize: i === hier ? 28 : 22,
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: i === hier ? 'var(--accent-soft)' : 'transparent',
            border: i === hier ? '2px solid var(--accent)' : '2px solid transparent',
            filter: i <= hier ? 'none' : 'grayscale(1)',
            opacity: i <= hier ? 1 : 0.45,
          }}
        >
          {FASE_BEELD[f]}
        </span>
      ))}
    </div>
  )
}


/** Waar ben ik? Het wapen en de kleur van de wereld, boven elke les. */
function WereldBand({ wereld }: { wereld: World }) {
  return (
    <div className={styles.wereldband} style={{ '--toon': wereld.toon } as React.CSSProperties}>
      <span aria-hidden="true" style={{ fontSize: 22 }}>
        {wereld.emoji}
      </span>
      {wereld.naam}
    </div>
  )
}
