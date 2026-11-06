'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Icoon, WereldWapen, kaartBeeld, pipLos, type IcoonNaam } from '@/ui/beelden'
import Link from 'next/link'
import { Board, type BoardMarks } from '@/board/Board'
import { Kop } from '@/ui/Kop'
import { Pip, type PipStemming } from '@/ui/Pip'
import { Confetti } from '@/ui/Confetti'
import { DeelKnop } from '@/ui/DeelKnop'
import { Sterren } from '@/ui/Sterren'
import { Teller } from '@/ui/Teller'
import { gebruikTip } from '@/ui/gebruikTip'
import { sfx } from '@/audio/sfx'
import { kies, speak, stopSpeaking, wachtTotUitgesproken } from '@/audio/voice'
import {
  EERSTE_GOED, HINT_GEGEVEN, OPNIEUW_PROBEREN, pipZinnen } from '@/content/voice'
import { WERELDEN, volgendeLes, wereldMet, type Lesson, type World } from '@/content'
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
  foutZin,
} from './runner'
import {
  useInstellingen,
  useHervatpunt,
  useModus,
  useProfiel,
  useProfielStore,
  useToestandGeladen,
  useVoortgang,
  volgendeOpenLes,
  wereldIsAf,
} from '@/progress/store'
import { eenKeer, maakLastigMelder, maakStopMelder } from './lesTellingen'
import { tel } from '@/progress/tellen'
import { useMediaQuery } from '@/ui/useMediaQuery'
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
const FASE_BEELD: Record<Fase, IcoonNaam> = {
  kijken: 'fase-kijken',
  meedoen: 'fase-meedoen',
  zelf: 'fase-zelf',
  toets: 'fase-toets',
  beloning: 'beker',
}
const FASE_VOLGORDE: Fase[] = ['kijken', 'meedoen', 'zelf', 'toets']

export function LessonPlayer({
  les,
  wereld,
  uitleg,
}: {
  les: Lesson
  wereld: World
  /** Wat er in de gebouwde HTML staat, voor wie de app niet draait. Zie LesUitleg. */
  uitleg?: ReactNode
}) {
  const [fase, setFase] = useState<Fase>('kijken')
  const [vertelIndex, setVertelIndex] = useState(0)
  /**
   * Naar welke fase we terugkeren na een tussentijds kijkje in de uitleg.
   *
   * Een kind dat in "zelf doen" niet meer weet welk stuk de dame ook alweer was, kon
   * nergens heen: de uitleg was drie schermen terug en er was geen weg terug behalve de
   * hele les opnieuw. Nu is het oogje in de fasebalk aan te tikken. Dit onthoudt waar
   * het kind vandaan kwam, zodat het daarna verdergaat waar het gebleven was in plaats
   * van opnieuw te beginnen.
   */
  const [kijkTerug, setKijkTerug] = useState<Fase | null>(null)
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
  // Geen profiel: het kind speelt als gast (via "Probeer de eerste les" of Google). De
  // sterren zijn al bewaard; bij de beloning vragen we of het ze onder een naam wil houden.
  const profiel = useProfiel()
  const voortgang = useVoortgang()
  const ruimNaast = useMediaQuery('(orientation: landscape) and (min-width: 640px) and (min-height: 521px)')
  // Naar boven bij de beloning: de pagina bleef staan waar het bord stond, en dan viel
  // "Volgende les" onder de vouw (39e review). Zonder animatie: het is een nieuw scherm.
  useEffect(() => {
    if (fase === 'beloning') window.scrollTo({ top: 0, behavior: 'auto' })
  }, [fase])
  const geladen = useToestandGeladen()
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const { zegTip, afbreken: tipAfbreken } = gebruikTip(setZin)

  // Bij welke opgave loopt een kind vast? Zie `maakLastigMelder`. Het nummer is de plek
  // in de fase ("zelf-2"); verschuift er een opgave, dan schuift het nummer mee.
  const lastig = useMemo(
    () => maakLastigMelder((l, o, h) => tel('Opgave lastig', { les: l, opgave: o, hulp: h })),
    [],
  )
  const opgaveNu = `${fase}-${opgaveIndex + 1}`
  // De eerste tik op een opgave: het kind speelt echt, en kijkt niet alleen rond. Niet bij
  // een hervatte les: die telde al als gespeeld toen hij nieuw begon, en anders werd één
  // kind dat morgen verdergaat twee keer "speelde" en de les maar half zo vaak "af".
  const hervatteLes = useRef(false)
  const eersteOpgave = useMemo(
    () => eenKeer(() => {
      if (!hervatteLes.current) tel('Eerste opgave', { les: les.id })
    }),
    [les.id],
  )

  // Tellen waar kinderen afhaken. "Les begonnen" pas na het hervatten (zie hieronder),
  // zodat te zien is of het een nieuwe les is of een halve. "Les gestopt" bij weggaan
  // vóór de beloning: via terug, maar ook als de tab dichtgaat of de tablet op slot
  // gaat, want zo stopt een kind meestal. Eén keer per les (zie `maakStopMelder`); de
  // fase is die van de eerste keer weggaan. Een nieuwe les krijgt een nieuwe melder.
  const faseNu = useRef<Fase>(fase)
  faseNu.current = kijkTerug ?? fase
  useEffect(() => {
    const meld = maakStopMelder((f) => tel('Les gestopt', { les: les.id, fase: f }))
    const meldGestopt = () => meld(faseNu.current)
    const wissel = () => {
      if (document.visibilityState === 'hidden') meldGestopt()
    }
    document.addEventListener('visibilitychange', wissel)
    return () => {
      document.removeEventListener('visibilitychange', wissel)
      meldGestopt()
    }
  }, [les.id])

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
    tipAfbreken()
  }, [tipAfbreken])

  /**
   * Doorschakelen zodra Pip is uitgesproken.
   *
   * Eerst een korte adempauze zodat het goed-geluid en het vinkje landen, en dan
   * wachten tot de zin echt af is. Met een vaste wachttijd werd Pip midden in "Hoppa!
   * Precies goed" afgekapt, want de volgende opgave vraagt meteen om een nieuwe zin.
   */
  const doorschakeling = useRef(0)
  const naHetPraten = useCallback(
    (doe: () => void, pauze = 1300) => {
      const mijn = ++doorschakeling.current
      later(() => {
        void wachtTotUitgesproken().then(() => {
          if (mijn === doorschakeling.current) doe()
        })
        // 1300 en niet 700: het eerste succes (vinkjes, glinsters) was weg voor iemand het
        // zag (wow-meting traject 4). Een stilte na een goed antwoord mag even duren.
      }, pauze)
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
        setStemming('blij')
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
    const halfAf = Boolean(hervat && VOLGORDE.includes(hervat as Fase))
    hervatteLes.current = halfAf
    tel('Les begonnen', { les: les.id, hervat: halfAf ? 'ja' : 'nee' })
    if (halfAf) startFase(hervat as Fase)
  }, [geladen, hervat, startFase, les.id])

  const volgendeFase = useCallback(() => {
    const i = VOLGORDE.indexOf(fase)
    const volgende = VOLGORDE[i + 1] ?? 'beloning'
    if (volgende === 'beloning') {
      const behaald = sterrenVoor(toetsFouten, toetsHints)
      setSterren(behaald)
      setFase('beloning')
      bewaarLes(les.id, { sterren: behaald, fouten: toetsFouten, hints: toetsHints })
      tel('Les af', { les: les.id, sterren: behaald })
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
      // 'blij', niet 'denkt': bij een opdracht las dat als "Pip weet het zelf niet" (37e review).
      setStemming('blij')
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
        tipAfbreken()
        setZin(klaar && fase === 'meedoen' && opgaveIndex === 0 ? EERSTE_GOED : kies(klaar ? zinnen.PRIJS_LAATSTE : zinnen.PRIJS, 'prijs'))
        // Het eerste succes van de les krijgt zijn feest (grote juichende Pip): 2,2 s.
        if (klaar) naHetPraten(volgendeOpgave, fase === 'meedoen' && opgaveIndex === 0 ? 2200 : 1300)
      } else {
        if (instellingen.effecten) sfx.fout()
        setStemming('moedigt')
        // De opdracht komt na de tip terug: zonder dat was hij voorgoed weg, en Pips
        // ballon is de enige plek waar staat wat de bedoeling was.
        zegTip(
          tip ?? kies(zinnen.BIJNA, 'bijna'),
          stand && 'vraag' in stand.opgave ? stand.opgave.vraag : '',
        )
      }
    },
    [instellingen.effecten, naHetPraten, volgendeOpgave, zinnen, zegTip, tipAfbreken, stand],
  )

  const opVeld = useCallback(
    (veld: Square) => {
      if (!stand || stand.klaar) return
      eersteOpgave()
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
          reageer(false, false, foutZin(r.stand, r.reden))
          if (fase === 'toets') setToetsFouten((n) => n + 1)
          lastig.misser(les.id, opgaveNu, r.stand.opgave.kind)
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
          zegTip(kies(OPNIEUW_PROBEREN, 'opnieuw'), 'vraag' in r.stand.opgave ? r.stand.opgave.vraag : '')
          if (fase === 'toets') setToetsFouten((n) => n + 1)
          break
      }
    },
    [stand, instellingen.effecten, reageer, fase, zinnen, lastig, les.id, opgaveNu, eersteOpgave],
  )

  const opQuiz = useCallback(
    (index: number) => {
      if (!stand) return
      eersteOpgave()
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
        // Dezelfde foute knop nog eens (een dubbeltik) is geen tweede misser.
        if (index !== quizFout) lastig.misser(les.id, opgaveNu, r.stand.opgave.kind)
      }
    },
    [stand, reageer, fase, lastig, les.id, opgaveNu, quizFout, eersteOpgave],
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
    lastig.hint(les.id, opgaveNu)
  }, [stand, fase, zinnen, lastig, les.id, opgaveNu])

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
        {/* Dit is wat er in de geëxporteerde HTML staat, en dus wat een zoekmachine
            en een gedeelde link te zien krijgen: de les in gewone tekst. Een kind ziet
            het hooguit een fractie van een seconde, tot de opgeslagen voortgang
            binnen is en het echte lesscherm hieronder het overneemt. */}
        <div className={styles.tekstversie}>{uitleg}</div>
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
        <div className={`stack ${styles.vertelStack} ${les.vertelFen ? styles.speelvlak : ''}`}>
          <div className={styles.vakPip}>
            <Pip
              // Geen 'groot' meer: groot-dan-klein sprong zichtbaar, en heel de kijkfase groot
              // duwde 'Verder' bij zin 2 op 390×844 onder de vouw (wow-meting traject 4).
              zegt={dezeZin ? vertelTekst(dezeZin) : ''}
              stemming={vertelIndex === 0 ? 'blij' : 'denkt'}
            />
          </div>
          {les.vertelFen && (
            <div className={`${styles.bord} ${styles.vakBord}`}>
              {/* De sleutel is de zin, niet het bord: bij elke nieuwe zin begint het
                  spoor opnieuw te lopen in plaats van te blijven staan waar het stond. */}
              <Board
                key={vertelIndex}
                golf={vertelIndex === 0}
                pipAlsPaard={Boolean(les.vertelPip)}
                position={les.vertelFen}
                marks={{ glow: les.vertelWijs, spoor }}
                showCoordinates={instellingen.coordinaten || Boolean(les.toonCoordinaten)}
                label={`Uitleg bij ${les.titel}`}
              />
            </div>
          )}
          <div className={`row ${styles.kolom} ${styles.vakKnoppen} ${styles.rijUiteen}`}>
            <span className="muted">
              {vertelIndex + 1} van {les.vertel.length}
            </span>
            <button
              type="button"
              className="btn btn--primary btn--big"
              onClick={() => {
                if (!laatste) return setVertelIndex((i) => i + 1)
                // Kwam het kind hier vanuit een opgave, dan gaat het daar ook weer
                // heen — met dezelfde opgave op hetzelfde punt. De les opnieuw laten
                // beginnen zou van "even terugkijken" een straf maken.
                if (kijkTerug) {
                  setFase(kijkTerug)
                  setKijkTerug(null)
                  return
                }
                startFase('meedoen')
              }}
            >
              <span aria-hidden="true" style={{ fontSize: 30, lineHeight: 1 }}>
                {!laatste ? '▶︎' : kijkTerug ? '↩︎' : <Icoon naam="fase-meedoen" maat={34} />}
              </span>{' '}
              {!laatste ? 'Verder' : kijkTerug ? 'Terug naar de opgave' : 'Ik ga het proberen'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (fase === 'beloning') {
    // Is de wereld net af, dan naar de eerste les die nog open staat: in volgorde was
    // dat soms een les die al af was, als het kind de lessen door elkaar deed (38e review).
    const naDeze = { ...voortgang, [les.id]: { sterren, fouten: 0, hints: 0, laatst: '' } }
    const volgende = wereldIsAf(wereld.id, naDeze) ? (volgendeOpenLes(naDeze, modus) ?? volgendeLes(les.id)) : volgendeLes(les.id)
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
          {/* Klein als de grote Pip hieronder bij het wapen juicht: twee grote Pips kostten hoogte. */}
          {/* Eigen klasse: de dwarsindeling zet Pip in de rechterkolom (codebase-review). */}
          <div className={styles.feestPip}>
            <Pip zegt={zin} stemming="trots" klein={wereldKlaar} />
          </div>
          {/* Een hele wereld uit is groter dan een les: vier lessen werk. Eerst stond
              het als regel tekst in de lesuitslag, daarna als tweede kaart eronder
              (28e review: "het feest staat op de tweede plek"). Nu is de wereld de held:
              groot wapen bovenaan, de naam, en alle wapens op een rij zodat je ziet
              waar je staat. De lesuitslag schuift klein eronder. */}
          {wereldKlaar && (
            <div className={`card stack center ${styles.wereldAf}`} style={{ position: 'relative', overflow: 'hidden' }}>
              <Confetti />
              {/* Pip viert mee, groot naast het wapen: op het hoogtepunt van de app was hij
                  een klein rondje bovenin (38e review). */}
              <div className={styles.wereldAfHeld} aria-hidden="true">
                <span className={styles.wereldAfWapen}>
                  <WereldWapen id={wereld.id} maat={140} />
                </span>
                <span className={styles.wereldAfPip}>
                  <Icoon src={pipLos('juicht')} maat={130} />
                </span>
              </div>
              <h2 className={styles.wereldAfKop}>{wereld.naam} is af!</h2>
              <p style={{ margin: 0 }}>
                {profiel ? <><strong>{profiel.naam}</strong> heeft</> : 'Jij hebt'} alle lessen van {wereld.naam}{' '}
                uitgespeeld.
              </p>
              <div className={styles.wapenRij} aria-label="Jouw wereldwapens">
                {WERELDEN.map((w) => {
                  const af = w.id === wereld.id || wereldIsAf(w.id, voortgang)
                  return (
                    <span
                      key={w.id}
                      className={`${styles.wapenKlein} ${af ? styles.wapenAf : ''} ${w.id === wereld.id ? styles.wapenNu : ''} ${!af && w.id === nieuweWereld?.id ? styles.wapenVolgende : ''}`}
                      // Elk wapen in zijn eigen wereldkleur: grijs las als "nog 14 te gaan",
                      // gekleurd als nog 14 avonturen (wow-plan traject 4).
                      style={{ '--toon': w.toon } as React.CSSProperties}
                      title={af ? w.naam : w.id === nieuweWereld?.id ? `${w.naam}, gaat nu open` : 'nog niet'}
                      aria-label={af ? `${w.naam}, af` : w.id === nieuweWereld?.id ? `${w.naam}, gaat nu open` : 'nog niet af'}
                    >
                      <WereldWapen id={w.id} maat={30} />
                    </span>
                  )
                })}
              </div>
              {/* Waar je staat, zonder druk: een telling, geen opdracht. Verborgen op lage
                  schermen, anders zakt "Volgende les" onder de vouw (doorloop, 320×640). */}
              {/* Eén regel: de telling, en welke wereld nu opengaat (die haak stond pas
                  onderaan, wow-plan traject 4). Verborgen op lage schermen, anders zakt
                  "Volgende les" onder de vouw (doorloop). */}
              <p className={`${styles.wereldAfTel} ${styles.wereldAfOpen}`}>
                {WERELDEN.filter((w) => w.id === wereld.id || wereldIsAf(w.id, voortgang)).length} van de {WERELDEN.length} af
                {nieuweWereld && (
                  <>
                    {' · '}
                    {/* Als één geheel: anders brak "nu" en "open:" over twee regels (wow-meting). */}
                    <span style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      nu open: <WereldWapen id={nieuweWereld.id} maat={24} /> <strong>{nieuweWereld.naam}</strong>
                    </span>
                  </>
                )}
              </p>
            </div>
          )}
          {/* Het moment waar een kind een hele les voor heeft gewerkt. Dat mag je niet
              stilzwijgend voorbij laten gaan: de sterren vliegen één voor één binnen,
              er valt confetti en Pip springt. Wie beweging heeft uitgezet krijgt
              gewoon het eindbeeld. */}
          {wereldKlaar ? (
            // Klein, één regel: anders zakte "Volgende les" op een telefoon onder de vouw.
            <div className={`card ${styles.lesKort}`}>
              <Sterren aantal={sterren} vier />
              <strong>{les.titel}</strong>
              {sterren >= 3 && <span role="img" aria-label="Sticker verdiend"><Icoon naam="sticker" maat={28} /></span>}
            </div>
          ) : (
            <div className="card stack center" style={{ position: 'relative', overflow: 'hidden' }}>
              <Confetti />
              <Sterren aantal={sterren} groot vier />
              <h2>{les.titel}</h2>
              {/* Niet les.doel: dat is de zin voor de ouder ("Je kind ziet dat...") en
                  die stond hier letterlijk, over het kind gepraat tegen het kind. */}
              <p>{les.geleerd}</p>
              {sterren >= 3 && <p><Icoon naam="sticker" maat={30} /> Sticker verdiend!</p>}
            </div>
          )}

          {nieuweWereld && (
            <div
              className={`card ${styles.poort}`}
              style={{ '--toon': nieuweWereld.toon } as React.CSSProperties}
            >
              <span className={styles.poortWapen} aria-hidden="true">
                <WereldWapen id={nieuweWereld.id} maat={56} />
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
          {/* De hoofdknop eerst: op een telefoon stond "Naar de kaart" erboven (28e review).
              Bij wereld af direct onder de feestkaart (CSS-volgorde): daaronder viel hij op
              de meeste schermen onder de vouw (39e review). */}
          <div className={`row ${wereldKlaar ? styles.naFeest : ''}`} style={{ justifyContent: 'center' }}>
            {volgende && (
              <Link href={`/les/${volgende.id}/`} className="btn btn--primary btn--big">
                Volgende les →
              </Link>
            )}
            <Link href="/kaart/" className="btn">
              Naar de kaart
            </Link>
          </div>
          {wereldKlaar && <DeelKnop waar="wereld" plaatje={`/og/wereld-${wereld.id}.png`} />}
          {/* Voor de ouder, en ónder de knoppen: als grote kaart erboven duwde hij
              "Volgende les" op een telefoon onder de vouw, en een kind dat niet leest
              tikte op het grootste vlak en stond in een formulier (negentiende review, L1).
              De sterren zijn al bewaard; dit is alleen om ze onder een naam te zetten. */}
          {geladen && !profiel && (
            <p className="muted" style={{ margin: 0, textAlign: 'center' }}>
              Bewaar je sterren onder een naam:{' '}
              <Link href="/#beginnen" style={{ display: 'inline-block', padding: '10px 4px' }}>
                kies een naam
              </Link>
            </p>
          )}
        </div>
      </div>
    )
  }

  /* ---------- opgavescherm ---------- */
  if (!stand || !ruweOpgave) return null
  const opgave = stand.opgave

  return (
    <div className={`page ${styles.wereldpagina}`} style={{ '--toon': wereld.toon } as React.CSSProperties}>
      {/* Zonder "· Meedoen": de fase staat al in de stappenrij eronder, en op een smal
          scherm duwde die toevoeging de titel naar vijf regels. */}
      <Kop titel={les.titel} terug="/kaart/" />
      <WereldBand wereld={wereld} />
      <FaseBalk
        nu={fase}
        opNogEensKijken={() => {
          stopTimers()
          stopSpeaking()
          setKijkTerug(fase)
          setVertelIndex(0)
          setFase('kijken')
        }}
      />

      <div className={`stack ${styles.speelvlak} ${stand?.klaar && fase === 'meedoen' && opgaveIndex === 0 ? styles.feest : ''}`}>
        <div className={styles.vakPip}>
          {/* Klein waar de hoogte krap is (staand: boven het bord). Liggend staat Pip in
              een eigen kolom met ruimte over; daar was hij een rondje van 52 px naast
              een leeg vlak (27e review). */}
          <Pip zegt={zin} stemming={stemming} klein={!ruimNaast} />
        </div>

        {/* Bij één opgave zei die ene losse stip niets; dan laten we hem weg. */}
        {opgaven.length > 1 && (
        <div className={`${styles.voortgang} ${styles.vakVoortgang}`} aria-label={`Opgave ${opgaveIndex + 1} van ${opgaven.length}`}>
          {opgaven.map((_, i) => (
            <span
              key={i}
              className={`${styles.stip} ${i < opgaveIndex ? styles.stipAf : ''} ${
                i === opgaveIndex ? styles.stipNu : ''
              }`}
              aria-hidden="true"
            >
              {/* Een gehaalde opgave wordt een sterretje dat even opspringt (wow-plan traject 4). */}
              {i < opgaveIndex && <Icoon naam="ster-vol" maat={18} />}
            </span>
          ))}
        </div>
        )}

        {opgave.kind === 'quiz' ? (
          <div className={`${styles.quiz} ${styles.vakBord}`}>
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
          <div className={`${styles.bord} ${styles.vakBord}`}>
            {/* De allereerste goede opgave van de les: Pip springt groot in beeld en juicht.
                Een vinkje en een vonkje waren te klein voor het moment waarop een kind voor het
                eerst iets zelf doet (wow-meting traject 4). Kort, en niet bij minder beweging. */}
            {stand?.klaar && fase === 'meedoen' && opgaveIndex === 0 && (
              // eslint-disable-next-line @next/next/no-img-element -- statische export, SVG
              <img src={pipLos('juicht')} alt="" aria-hidden="true" className={styles.eersteFeest} draggable={false} />
            )}
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
          <div className={`row ${styles.kolom} ${styles.vakTeller} ${styles.rijMidden}`}>
            <Teller gevonden={stand.gevonden.length} totaal={totaalTeVinden} />
          </div>
        )}

        <div className={`row ${styles.kolom} ${styles.vakKnoppen} ${styles.rijUiteen}`}>
          {opgave.kind !== 'quiz' && (
            // Bij een quiz gaf hint() geen enkel veld terug: het kind zag niets
            // gebeuren en raakte stilzwijgend een ster kwijt. Dan hoort de knop er
            // niet te staan.
            <button
              type="button"
              className="btn"
              onClick={vraagHint}
              disabled={stand.klaar}
            >
              <Icoon naam="hint" maat={32} />{' '}
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
/**
 * De vier fasen als beeld, en het oogje als weg terug.
 *
 * Een kind dat in "zelf doen" niet meer weet welk stuk de dame ook alweer was, kon
 * nergens heen: de uitleg lag drie schermen terug en de enige uitweg was de hele les
 * opnieuw. Het oogje is nu een knop — "laat het nog eens zien" — en brengt je daarna
 * terug naar precies de opgave waar je was.
 *
 * Alleen het oogje, niet alle vier: de andere fasen terugzetten zou voortgang
 * weggooien, en dit moet een kijkje zijn en geen valstrik.
 */
function FaseBalk({ nu, opNogEensKijken }: { nu: Fase; opNogEensKijken?: () => void }) {
  const hier = FASE_VOLGORDE.indexOf(nu)
  return (
    <div
      className={`row ${styles.faseBalk}`}
      // role="group": een aria-label op een kale div telt niet (Lighthouse aria-prohibited-attr).
      role="group"
      style={{ justifyContent: 'center', gap: 10, marginBottom: 8, flexWrap: 'nowrap' }}
      aria-label={`Stap ${hier + 1} van 4: ${FASE_NAAM[nu]}`}
    >
      {FASE_VOLGORDE.map((f, i) => {
        const terugknop = f === 'kijken' && Boolean(opNogEensKijken) && nu !== 'kijken'
        if (terugknop) {
          return (
            <button
              key={f}
              type="button"
              className={styles.nogEens}
              onClick={opNogEensKijken}
              aria-label="Laat de uitleg nog eens zien"
              title="Laat de uitleg nog eens zien"
            >
              <Icoon naam={FASE_BEELD[f]} maat={24} />
            </button>
          )
        }
        return (
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
            // 0,6 en niet 0,45: in donker werden de komende fasen schimmen (38e review).
            opacity: i <= hier ? 1 : 0.6,
          }}
        >
          <Icoon naam={FASE_BEELD[f]} maat={30} />
        </span>
        )
      })}
    </div>
  )
}


/** Waar ben ik? Het wapen en de kleur van de wereld, boven elke les. */
function WereldBand({ wereld }: { wereld: World }) {
  return (
    // De getekende strook van de kaart erachter: de les ligt in de wereld, niet onder een
    // gekleurde balk (wow-plan traject 4).
    <div className={styles.wereldband} style={{ '--toon': wereld.toon, '--strook': `url(${kaartBeeld(wereld.id)})`, '--strook-donker': `url(${kaartBeeld(wereld.id, true)})` } as React.CSSProperties}>
      <span aria-hidden="true" style={{ fontSize: 22 }}>
        <WereldWapen id={wereld.id} maat={26} />
      </span>
      {wereld.naam}
    </div>
  )
}
