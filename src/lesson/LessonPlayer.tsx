'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { Board, type BoardMarks } from '@/board/Board'
import { Kop } from '@/ui/Kop'
import { Pip, type PipStemming } from '@/ui/Pip'
import { Confetti } from '@/ui/Confetti'
import { Sterren } from '@/ui/Sterren'
import { Teller } from '@/ui/Teller'
import { gebruikTip } from '@/ui/gebruikTip'
import { sfx } from '@/audio/sfx'
import {
  alGetikt,
  getVoiceConfig,
  kies,
  speak,
  spreekBeurt,
  stopSpeaking,
  wachtTotUitgesproken,
  wisOndertitel,
} from '@/audio/voice'
import { HINT_GEGEVEN, OPNIEUW_PROBEREN, VERDER_UITLEG, pipZinnen } from '@/content/voice'
import { volgendeLes, wereldMet, type Lesson, type World } from '@/content'
import { uitspraakVan, vertelTekst, vertelWijzers } from '@/content/types'
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
  wereldIsAf,
} from '@/progress/store'
import { eenKeer, maakLastigMelder, maakStopMelder } from './lesTellingen'
import { tel } from '@/progress/tellen'
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
  /** Praat Pip nog in de uitleg? Zolang wel, wiebelt de knop "Verder" nog niet. */
  const [pipPraat, setPipPraat] = useState(true)
  /** Het wijzende handje naast "Verder", voor wie na Pips zin blijft wachten. */
  const [wijsVerder, setWijsVerder] = useState(false)
  const verderUitgelegd = useRef(false)
  /** Welk quizantwoord Pip nu voorleest, om het te laten oplichten. */
  const [voorgelezen, setVoorgelezen] = useState<number | null>(null)
  const voorleesBeurt = useRef(0)
  /** Telt op bij "Opnieuw", zodat Pip de antwoorden dan opnieuw voorleest. */
  const [quizPoging, setQuizPoging] = useState(0)

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

  /*
   * Wanneer mag ik op "Verder" tikken?
   *
   * Dat was nooit uitgelegd, en een kind van vijf wist het dus niet: het tikte midden in
   * Pips zin, of zat te wachten op iets wat niet kwam. Nu gaat de knop wiebelen zodra
   * Pip uitgepraat is. Blijft het kind daarna stil, dan komt er een handje bij dat naar
   * de knop wijst, en een beetje later zegt Pip het één keer per les ook hardop. Niet
   * voor de schakers: die lezen de knop zelf.
   */
  useEffect(() => {
    setWijsVerder(false)
    if (fase !== 'kijken' || pipPraat) return
    const hand = setTimeout(() => setWijsVerder(true), 2500)
    const zeg = setTimeout(() => {
      if (verderUitgelegd.current || modus === 'schaker') return
      // Alleen als Pip ook echt kan praten. Met de stem uit verving deze zin anders de
      // uitleg in de ballon, en vóór de eerste tik houdt de browser hem tegen en
      // schoof hij bij die tik vóór de uitlegzin die nog moest klinken.
      if (!getVoiceConfig().spraak || !alGetikt()) return
      verderUitgelegd.current = true
      void (async () => {
        const zin = speak(VERDER_UITLEG)
        const mijn = spreekBeurt()
        await zin
        await wachtTotUitgesproken()
        // Daarna staat de uitlegzin weer in de ballon, niet deze.
        if (mijn === spreekBeurt()) wisOndertitel()
      })()
    }, 7000)
    return () => {
      clearTimeout(hand)
      clearTimeout(zeg)
    }
  }, [fase, pipPraat, vertelIndex, modus])

  /*
   * Een quiz voorlezen aan wie nog niet leest.
   *
   * De plaatjes op de knoppen helpen, maar "👣 je gaat op zijn veld staan" begrijp je
   * niet van het plaatje alleen. Een kind van vijf zat bij de toetsvraag dus te raden.
   * Nu leest Pip na de vraag elk antwoord voor, en licht die knop op terwijl hij het
   * zegt: dan weet het kind welk plaatje bij welke woorden hoort. Tikken mag altijd,
   * ook halverwege; dan houdt Pip op.
   *
   * De antwoorden komen uit `stand.opgave`, niet uit de ruwe opgave: alleen die heeft de
   * volgorde waarin ze op het scherm staan (zie `ruweOpgave`).
   */
  const leesQuizVoor = modus !== 'schaker'
  const standNu = useRef(stand)
  standNu.current = stand
  /**
   * Antwoorden die het kind bij deze quiz al fout had. Die leest Pip bij de tweede keer
   * niet meer voor: anders tikt een kind dat op wat oplicht reageert gewoon weer hetzelfde.
   */
  const fouteKeuzes = useRef(new Set<number>())
  useEffect(() => {
    fouteKeuzes.current = new Set()
  }, [ruweOpgave])
  useEffect(() => {
    const s = standNu.current
    if (!leesQuizVoor || !s || s.opgave.kind !== 'quiz' || s.klaar) return
    if (fase === 'kijken' || fase === 'beloning') return
    const mijn = ++voorleesBeurt.current
    const nogAanDeBeurt = () => mijn === voorleesBeurt.current
    const pauze = (ms: number) => new Promise((klaar) => setTimeout(klaar, ms))
    const opties = s.opgave.opties.map((o, i) => ({ i, zeg: uitspraakVan(o) }))
    void (async () => {
      // Eerst de vraag zelf laten uitspreken; die zegt Pip vanuit zijn ballon.
      await pauze(700)
      // Pas hier de instellingen lezen: bij het openen van de pagina zijn ze er nog
      // niet. En vóór de eerste tik houdt de browser het geluid tegen; dan flitsten
      // de knoppen voorbij zonder dat er iets klonk.
      if (!getVoiceConfig().spraak || !alGetikt()) return
      await wachtTotUitgesproken(15000)
      // Begint er intussen een andere zin (het kind tikt op de luidspreker of op Pip),
      // dan houdt het voorlezen op in plaats van daar overheen te praten.
      let verwacht = spreekBeurt()
      const over = opties.filter(({ i }) => !fouteKeuzes.current.has(i))
      // Is er nog maar één antwoord over, dan zou voorlezen het aanwijzen zijn.
      if (over.length < 2) return
      for (const { i, zeg } of over) {
        if (!nogAanDeBeurt() || spreekBeurt() !== verwacht) break
        setVoorgelezen(i)
        // Het nummer meteen pakken, niet na het wachten: tikt het kind tijdens het
        // laden van het geluid op de luidspreker, dan hoort dat nummer bij zijn zin.
        const zin = speak(zeg)
        verwacht = spreekBeurt()
        await zin
        await wachtTotUitgesproken()
        await pauze(350)
      }
      if (!nogAanDeBeurt()) return
      setVoorgelezen(null)
      // De ballon toonde het antwoord; zo komt de vraag terug. Alleen als de laatste
      // zin nog van ons was, anders wissen we wat het kind net zelf liet herhalen.
      if (spreekBeurt() === verwacht) wisOndertitel()
    })()
    return () => {
      voorleesBeurt.current++
      setVoorgelezen(null)
    }
  }, [ruweOpgave, quizPoging, fase, leesQuizVoor])

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
      setStemming('denkt')
    } else {
      volgendeFase()
    }
  }, [opgaveIndex, opgaven, volgendeFase])

  /* ---------- reageren op een tik ---------- */

  const reageer = useCallback(
    (goed: boolean, klaar: boolean, tip?: string, naDeOpdracht?: () => void) => {
      if (goed) {
        if (instellingen.effecten) sfx.goed()
        // 'juicht' in plaats van 'blij': dat is ook de stemming waarin Pip staat als
        // er niets gebeurt, dus een goed antwoord veranderde visueel helemaal niets.
        setStemming('juicht')
        tipAfbreken()
        setZin(kies(klaar ? zinnen.PRIJS_LAATSTE : zinnen.PRIJS, 'prijs'))
        if (klaar) naHetPraten(volgendeOpgave)
      } else {
        if (instellingen.effecten) sfx.fout()
        setStemming('moedigt')
        // De opdracht komt na de tip terug: zonder dat was hij voorgoed weg, en Pips
        // ballon is de enige plek waar staat wat de bedoeling was.
        zegTip(
          tip ?? kies(zinnen.BIJNA, 'bijna'),
          stand && 'vraag' in stand.opgave ? stand.opgave.vraag : '',
          naDeOpdracht,
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
      // Het kind kiest: Pip houdt op met voorlezen.
      voorleesBeurt.current++
      setVoorgelezen(null)
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
        // Na de tip en de vraag leest Pip de antwoorden die nog over zijn opnieuw voor.
        // Een kind van vijf tikt vaak op wat oplicht; zonder dit had het de andere
        // antwoorden nooit gehoord en ging het daarna gokken.
        fouteKeuzes.current.add(index)
        reageer(false, false, tip, () => setQuizPoging((n) => n + 1))
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
      <div
        className={`page ${styles.wereldpagina} ${styles.lesscherm}`}
        style={{ '--toon': wereld.toon } as React.CSSProperties}
      >
        <Kop titel={les.titel} terug="/kaart/" />
        <WereldBand wereld={wereld} />
        <FaseBalk nu="kijken" />
        <div className={`stack ${styles.lesinhoud}`}>
          <Pip
            zegt={dezeZin ? vertelTekst(dezeZin) : ''}
            stemming={vertelIndex === 0 ? 'blij' : 'denkt'}
            onPratend={setPipPraat}
          />
          {les.vertelFen && (
            <div className={styles.bordvlak}><div className={styles.bordpast}>
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
            </div></div>
          )}
          <div className={`row ${styles.kolom} ${styles.knoppenOnder}`} style={{ justifyContent: 'space-between' }}>
            <span className="muted">
              {vertelIndex + 1} van {les.vertel.length}
            </span>
            <span className={styles.verderPlek}>
            {wijsVerder && (
              <span className={styles.wijsHand} aria-hidden="true">
                👉
              </span>
            )}
            <button
              type="button"
              className={`btn btn--primary btn--big ${pipPraat ? '' : styles.verderKlaar}`}
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
                {!laatste ? '▶︎' : kijkTerug ? '↩︎' : '🤝'}
              </span>{' '}
              {!laatste ? 'Verder' : kijkTerug ? 'Terug naar de opgave' : 'Ik ga het proberen'}
            </button>
            </span>
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
            {/* De sticker zelf, met het plaatje van de les: precies zoals hij straks in
                de stal staat. Alleen "Sticker verdiend!" zei een kind niet wát het
                had, en dus ook niet wat het in de stal moest zoeken. */}
            {sterren >= 3 && (
              <p className={styles.sticker}>
                <span className={styles.stickerRond} aria-hidden="true">
                  {les.icoon}
                </span>
                Sticker verdiend!
              </p>
            )}
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
    <div
      className={`page ${styles.wereldpagina} ${styles.lesscherm}`}
      style={{ '--toon': wereld.toon } as React.CSSProperties}
    >
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
          setPipPraat(true)
          setVertelIndex(0)
          setFase('kijken')
        }}
      />

      <div className={`stack ${styles.lesinhoud}`}>
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
                } ${voorgelezen === i ? styles.quizVoorgelezen : ''}`}
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
                {/* Een luidsprekertje, geen accentrand: oplichten in de accentkleur
                    betekent elders "hier moet je zijn", en dan leest een kind het
                    antwoord dat Pip toevallig voorleest als een hint. */}
                {voorgelezen === i && (
                  <span className={styles.quizSpreekt} aria-hidden="true">
                    🔊
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.bordvlak}><div className={styles.bordpast}>
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
          </div></div>
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
              fouteKeuzes.current = new Set()
              setQuizPoging((n) => n + 1)
              const vraag = 'vraag' in opgave ? opgave.vraag : ''
              // Stond de vraag al in de ballon, dan verandert er niets en zegt Pip hem
              // niet vanzelf opnieuw. "Opnieuw" hoort hem wel te laten horen.
              if (vraag && vraag === zin) void speak(vraag)
              setZin(vraag)
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
      className="row"
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
              <span aria-hidden="true">{FASE_BEELD[f]}</span>
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
            opacity: i <= hier ? 1 : 0.45,
          }}
        >
          {FASE_BEELD[f]}
        </span>
        )
      })}
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
