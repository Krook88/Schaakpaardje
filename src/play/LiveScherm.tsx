'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Board, type BoardMarks } from '@/board/Board'
import { Kop } from '@/ui/Kop'
import { Pip, type PipStemming } from '@/ui/Pip'
import { Rekenslot } from '@/ui/Rekenslot'
import { sfx } from '@/audio/sfx'
import {
  AFSTAND_JOUW_BEURT,
  AFSTAND_ONDERPROMOTIE,
  AFSTAND_VRIENDJE_WINT,
  LIVE_BEGIN,
  LIVE_DENKT_NA,
  LIVE_DRUK,
  LIVE_GEEN_INTERNET,
  LIVE_GEEN_VERBINDING,
  LIVE_GEWONNEN,
  LIVE_JIJ_ZWART,
  LIVE_KAPOT,
  LIVE_KIJK_NIEUW,
  LIVE_LINK_MISLUKT,
  LIVE_OPNIEUW,
  LIVE_VERDER,
  LIVE_VOL,
  LIVE_VRIENDJE_BEGINT_OPNIEUW,
  LIVE_VRIENDJE_ER,
  LIVE_WACHT_OP_VRIENDJE,
  LIVE_WEG,
  ONDERPROMOTIE_SCHAAK,
  PARTIJ_REMISE,
  PROMOTIE_ANDERS,
  PROMOTIE_GEKOZEN,
  PROMOTIE_KIES,
  SAMEN_WIT_WINT,
  SAMEN_ZWART_WINT,
  SCHAAK_TEGEN_JOU,
  SCHAAK_VAN_JOU,
} from '@/content/voice'
import { kies } from '@/audio/voice'
import { type PieceType, type Square } from '@/engine/board'
import { isPromotie } from '@/engine/game'
import { AVATARS, useInstellingen, useModus, useProfiel, useProfielStore, useToestandGeladen } from '@/progress/store'
import { tel } from '@/progress/tellen'
import { zetCode } from './afstand'
import {
  bewaarSleutel,
  isKamer,
  isNieuwer,
  laatsteKamer,
  leesStand,
  live,
  mijnSleutel,
  nieuweSleutel,
  type Antwoord,
  type LivePartij,
} from './live'
import { PromotieKiezer } from './PromotieKiezer'

/** Zo lang wacht het scherm als de server meteen antwoordde zonder iets nieuws. */
const RUST = 1500

/** Welke afgelopen partijen dit apparaat al heeft meegeteld (per kind, per partij en ronde). */
const GETELD = 'schaakmaatje-live-geteld'
/** Ook in het geheugen: zonder opslag telde elke herhaalde stand anders opnieuw mee. */
const alGeteld = new Set<string>()
function eenKeer(sleutel: string): boolean {
  if (alGeteld.has(sleutel)) return false
  alGeteld.add(sleutel)
  try {
    const lijst = JSON.parse(localStorage.getItem(GETELD) ?? '[]') as string[]
    if (lijst.includes(sleutel)) return false
    localStorage.setItem(GETELD, JSON.stringify([...lijst.slice(-49), sleutel]))
  } catch {
    /* geen opslag: dan telt het geheugen */
  }
  return true
}

/** Wat Pip zegt als het vriendje net gezet heeft (of als je terugkomt en aan zet bent). */
function zinVoorJouwBeurt(p: LivePartij): string {
  const laatste = p.zetten.at(-1)
  const onder = laatste?.[4] ? 'rbn'.indexOf(laatste[4]) : -1
  // Wie schaak staat en het niet hoort, ziet alleen dat de stukken niet willen. En een
  // paard met schaak is juist de reden om geen dame te nemen: dan beide zeggen.
  const st = p.game.status()
  if (!st.over && st.check) return onder >= 0 ? ONDERPROMOTIE_SCHAAK[onder] : kies(SCHAAK_TEGEN_JOU, 'schaak')
  return onder >= 0 ? AFSTAND_ONDERPROMOTIE[onder] : AFSTAND_JOUW_BEURT
}

/** De zinnen die bij elke zet terugkomen: die staan in de ballon, maar Pip zegt ze niet hardop. */
const GEWOON = new Set<string>([AFSTAND_JOUW_BEURT, LIVE_DENKT_NA])

type Fase = 'laden' | 'start' | 'spel' | 'vol' | 'kapot'

/**
 * Live spelen: ieder op een eigen scherm, de zetten komen vanzelf over. Zie ./live.ts.
 *
 * Een ouder maakt de speellink (achter het rekenslot) en deelt hem één keer. Wie de link
 * opent, speelt zwart. Daarna wacht het scherm op de server tot er iets verandert (long
 * polling), zolang het in beeld is.
 */
export function LiveScherm() {
  const geladen = useToestandGeladen()
  const profiel = useProfiel()
  const instellingen = useInstellingen()
  const modus = useModus()
  const bewaarPartij = useProfielStore((s) => s.bewaarPartij)
  const bewaarOefendag = useProfielStore((s) => s.bewaarOefendag)
  const mijnPlaatje = profiel?.avatar ?? AVATARS[0]

  const [fase, setFase] = useState<Fase>('laden')
  const [partij, setPartij] = useState<LivePartij | null>(null)
  const partijRef = useRef<LivePartij | null>(null)
  const kamerRef = useRef<string | null>(null)
  const sleutelRef = useRef<string | undefined>(undefined)
  /** Een zet is onderweg: dan geen kijkantwoord verwerken, anders flitst hij even weg. */
  const bezig = useRef(false)
  /**
   * Een nieuwe ronde die al klaarstaat, terwijl dit scherm nog het einde van de vorige
   * laat zien. Tikte het vriendje heel snel op "Nog een keer", dan zag dit kind anders
   * nooit hoe het afliep. Schaakreview van 16 oktober, punt 1.
   */
  const volgendeRef = useRef<LivePartij | null>(null)
  const [volgende, setVolgende] = useState(false)
  /**
   * Is het einde van de partij die nu staat ook echt in beeld geweest? Kwam de mat binnen
   * terwijl de app op de achtergrond stond, en tikte het vriendje daarna snel op "Nog
   * een keer", dan zag dit kind bij terugkomen meteen de nieuwe partij. Het einde stond
   * wel op het scherm, alleen keek er niemand. Alleen een zichtbaar scherm telt.
   */
  const eindeGezien = useRef(false)
  // `fen` staat apart van `partij`, omdat een eigen zet `partij.game` ter plekke wijzigt:
  // dan verandert het object niet en zou React het bord niet opnieuw tekenen.
  const [fen, setFen] = useState<string | null>(null)
  const [geselecteerd, setGeselecteerd] = useState<Square | null>(null)
  const [promotieVraag, setPromotieVraag] = useState<{ van: Square; naar: Square } | null>(null)
  const [zin, setZin] = useState(LIVE_BEGIN)
  /**
   * Of Pip de zin hardop zegt. Bij een partij tegen elkaar praat Pip niet na elke zet:
   * "Nu jij!" en "Nu denkt je vriendje na" staan alleen in de ballon. Hardop alleen bij
   * wat ertoe doet: het vriendje is er, schaak, een ander stuk dan een dame, de uitslag,
   * een nieuwe partij, geen verbinding. Gevraagd door Kaj, 16 oktober.
   */
  const [spreek, setSpreek] = useState(true)
  const zeg = useCallback((z: string, stil = GEWOON.has(z)) => {
    setZin(z)
    setSpreek(!stil)
  }, [])
  const [stemming, setStemming] = useState<PipStemming>('blij')
  const [verbinding, setVerbinding] = useState(true)
  const [slot, setSlot] = useState(false)
  const [zeker, setZeker] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [hoe, setHoe] = useState<'gedeeld' | 'gekopieerd' | 'zelf' | null>(null)
  /** Na weglopen: de partij die er nog is, met het plaatje van het vriendje. */
  const [hervat, setHervat] = useState<{ kamer: string; plaatje: string } | null>(null)
  /** Het maken van de link mislukte: opnieuw proberen kan zonder nieuwe som. */
  const [linkMislukt, setLinkMislukt] = useState(false)
  const verbindingRef = useRef(true)

  /** Een stand tonen, en Pip laten zeggen wat er veranderd is. */
  const toonStand = useCallback(
    (nieuw: LivePartij, oud: LivePartij | null, stopte = false) => {
      partijRef.current = nieuw
      setPartij(nieuw)
      setFen(nieuw.game.fen)
      const jij = nieuw.jij
      const status = nieuw.game.status()
      eindeGezien.current = status.over && document.visibilityState === 'visible'
      const ikDeedLaatste = jij !== null && nieuw.zetten.length > 0 && (nieuw.zetten.length % 2 === 1 ? 'w' : 'b') === jij

      // Een afgelopen partij één keer meetellen. De telling naar de teller gaat alleen
      // van wie de laatste zet deed, anders telt elke partij dubbel.
      if (status.over && jij !== null && kamerRef.current) {
        if (eenKeer(`${profiel?.id ?? '-'}:${kamerRef.current}:${nieuw.ronde}`)) {
          const uitslag = status.reason !== 'mat' ? 'remise' : ikDeedLaatste ? 'gewonnen' : 'verloren'
          if (profiel) bewaarPartij(uitslag)
          if (ikDeedLaatste) tel('Partij', { tegen: 'live', uitslag })
        }
      }

      if (jij === null) {
        // Een meekijker hoort ook hoe het afloopt, en dat er opnieuw begonnen wordt.
        if (oud && oud.ronde !== nieuw.ronde) zeg(LIVE_KIJK_NIEUW)
        else if (status.over && oud && !oud.game.status().over)
          zeg(status.reason === 'mat' ? (status.winner === 'w' ? SAMEN_WIT_WINT : SAMEN_ZWART_WINT) : PARTIJ_REMISE[0])
        return
      }
      const nieuweRonde = oud !== null && oud.ronde !== nieuw.ronde
      const nieuweZet = oud !== null && !nieuweRonde && nieuw.zetten.length > oud.zetten.length
      if (nieuweRonde) {
        setGeselecteerd(null)
        zeg((stopte ? LIVE_VRIENDJE_BEGINT_OPNIEUW : LIVE_OPNIEUW)[jij === 'w' ? 0 : 1])
        setStemming('blij')
      } else if (status.over) {
        if (!nieuweZet && oud !== null) return
        zeg(status.reason === 'mat' ? (ikDeedLaatste ? LIVE_GEWONNEN : AFSTAND_VRIENDJE_WINT) : PARTIJ_REMISE[0])
        setStemming('trots')
        if (nieuweZet && !ikDeedLaatste && instellingen.effecten) (status.reason === 'mat' ? sfx.schaak : sfx.zet)()
      } else if (nieuweZet && !ikDeedLaatste) {
        zeg(zinVoorJouwBeurt(nieuw))
        setStemming(status.check ? 'verrast' : 'blij')
        if (instellingen.effecten) (status.check ? sfx.schaak : sfx.zet)()
      } else if (oud?.ander === 'nog-niet' && nieuw.ander !== 'nog-niet') {
        zeg(jij === 'w' ? LIVE_VRIENDJE_ER : LIVE_JIJ_ZWART)
        setStemming('blij')
        setLink(null)
      } else if (oud?.ander !== 'weg' && nieuw.ander === 'weg' && nieuw.game.turn !== jij) {
        zeg(LIVE_WEG)
        setStemming('moedigt')
      } else if (oud === null) {
        // Binnenkomen, of terugkomen na verversen: net zo goed schaak en onderpromotie melden.
        zeg(
          nieuw.ander === 'nog-niet'
            ? LIVE_WACHT_OP_VRIENDJE
            : nieuw.zetten.length === 0
              ? jij === 'w'
                ? LIVE_VRIENDJE_ER
                : LIVE_JIJ_ZWART
              : nieuw.game.turn === jij
                ? zinVoorJouwBeurt(nieuw)
                : LIVE_DENKT_NA,
        )
        setStemming(nieuw.game.turn === jij && status.check ? 'verrast' : 'blij')
      }
    },
    [bewaarPartij, instellingen.effecten, profiel],
  )

  /**
   * Een stand van de server verwerken. Oudere standen dan wat er al staat, worden
   * weggegooid; een nieuwe ronde terwijl de vorige hier nog niet af was, laat eerst het
   * einde van die vorige zien.
   */
  const toon = useCallback(
    (nieuw: LivePartij, zelf = false) => {
      if (volgendeRef.current) {
        if (isNieuwer(volgendeRef.current, nieuw)) volgendeRef.current = nieuw
        return
      }
      const oud = partijRef.current
      if (!isNieuwer(oud, nieuw)) return
      // Het einde staat al op het scherm, maar is nog niet gezien: laten staan, met de
      // knop naar de nieuwe partij eronder.
      if (oud && !zelf && oud.jij && nieuw.ronde > oud.ronde && oud.game.status().over && !eindeGezien.current) {
        volgendeRef.current = nieuw
        setVolgende(true)
        return
      }
      if (oud && !zelf && oud.jij && nieuw.ronde > oud.ronde && !oud.game.status().over) {
        const vorig = leesStand({ ...nieuw, ronde: oud.ronde, zetten: nieuw.vorige, vorige: [], jij: oud.jij, wit: oud.wit, zwart: oud.zwart, ander: oud.ander })
        if (vorig?.game.status().over) {
          volgendeRef.current = nieuw
          setVolgende(true)
          toonStand(vorig, oud)
          return
        }
        // Halverwege opnieuw begonnen door het vriendje: niemand heeft verloren.
        toonStand(nieuw, oud, true)
        return
      }
      toonStand(nieuw, oud)
    },
    [toonStand],
  )

  /** Wat er na een verzoek moet gebeuren, voor alle soorten antwoorden samen. */
  const verwerk = useCallback(
    (a: Antwoord, zelf = false) => {
      if (a.soort === 'geen-verbinding') {
        if (verbindingRef.current) {
          zeg(LIVE_GEEN_VERBINDING)
          setStemming('moedigt')
        }
        verbindingRef.current = false
        setVerbinding(false)
        return
      }
      const wasWeg = !verbindingRef.current
      verbindingRef.current = true
      setVerbinding(true)
      // De verbinding is terug: Pip mag niet blijven zeggen dat hij niemand bereikt.
      // Layoutreview van 16 oktober, punt 2.
      if (wasWeg && a.soort === 'goed') {
        const p = isNieuwer(partijRef.current, a.stand) ? a.stand : partijRef.current
        if (p && p.jij && !p.game.status().over) {
          zeg(p.ander === 'nog-niet' ? LIVE_WACHT_OP_VRIENDJE : p.game.turn === p.jij ? zinVoorJouwBeurt(p) : LIVE_DENKT_NA)
          setStemming('blij')
        } else if (p && !p.jij) zeg(LIVE_VOL)
      }
      if (a.soort === 'druk') {
        zeg(LIVE_DRUK)
        setStemming('moedigt')
        return
      }
      if (a.soort === 'weg' || a.soort === 'kapot') {
        partijRef.current = null
        volgendeRef.current = null
        setVolgende(false)
        setPartij(null)
        setFase('kapot')
        zeg(LIVE_KAPOT)
        setStemming('moedigt')
        return
      }
      if (a.stand) toon(a.stand, zelf)
    },
    [toon],
  )

  /** Meedoen als zwart, met een sleutel die dit apparaat zelf maakt (en dus kan herhalen). */
  const doeMee = useCallback(
    async (code: string, sleutel: string) => {
      bewaarSleutel(code, sleutel)
      sleutelRef.current = sleutel
      const a = await live.meedoen(code, mijnPlaatje, sleutel)
      if (kamerRef.current !== code) return
      if (a.soort === 'goed') setFase('spel')
      else if (a.soort === 'vol') {
        setFase('vol')
        zeg(LIVE_VOL)
        setStemming('blij')
      } else if (a.soort === 'geen-verbinding' || a.soort === 'druk') setFase('kapot')
      verwerk(a)
      if (a.soort === 'geen-verbinding') zeg(LIVE_GEEN_INTERNET)
    },
    [mijnPlaatje, verwerk],
  )

  /** Beginnen bij de link in de adresbalk: een nieuwe partij, meedoen, of verder. */
  const begin = useCallback(async () => {
    const code = window.location.hash.slice(1)
    partijRef.current = null
    volgendeRef.current = null
    setVolgende(false)
    setPartij(null)
    setGeselecteerd(null)
    setPromotieVraag(null)
    setSlot(false)
    setZeker(false)
    setLink(null)
    setHoe(null)
    setHervat(null)
    setLinkMislukt(false)
    if (!code) {
      kamerRef.current = null
      setFase('start')
      zeg(LIVE_BEGIN)
      setStemming('blij')
      // Weggelopen en via de kaart teruggekomen: de partij is er nog. Layoutreview van
      // 16 oktober, punt 1 (blokkerend).
      const laatste = laatsteKamer()
      if (!laatste) return
      const a = await live.kijk(laatste.kamer, laatste.sleutel)
      if (kamerRef.current !== null || window.location.hash || a.soort !== 'goed' || !a.stand.jij) return
      const ander = a.stand.jij === 'w' ? a.stand.zwart : a.stand.wit
      setHervat({ kamer: laatste.kamer, plaatje: ander ?? '' })
      zeg(LIVE_VERDER)
      return
    }
    if (!isKamer(code)) {
      kamerRef.current = null
      setFase('kapot')
      zeg(LIVE_KAPOT)
      setStemming('moedigt')
      return
    }
    kamerRef.current = code
    const sleutel = mijnSleutel(code)
    sleutelRef.current = sleutel
    setFase('laden')
    if (!sleutel) return doeMee(code, nieuweSleutel())
    const a = await live.kijk(code, sleutel)
    // Intussen een andere link geopend: dit antwoord hoort daar niet meer bij.
    if (kamerRef.current !== code) return
    // Een sleutel die de server niet kent terwijl zwart nog vrij is: het meedoen kwam
    // vorige keer niet aan. Dan nu nog eens, met dezelfde sleutel.
    if (a.soort === 'goed' && !a.stand.jij && a.stand.zwart === null) return doeMee(code, sleutel)
    if (a.soort === 'goed') {
      setFase(a.stand.jij ? 'spel' : 'vol')
      verwerk(a)
      if (!a.stand.jij) zeg(LIVE_VOL)
      return
    }
    setFase(a.soort === 'geen-verbinding' ? 'spel' : 'kapot')
    verwerk(a)
  }, [doeMee, verwerk])

  /** Het adres van de speellink van deze partij, om (nog eens) te delen. */
  const speellink = (kamer: string) => `${location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/spelen/live/#${kamer}`

  useEffect(() => {
    if (!geladen) return
    void begin()
    const opnieuw = () => void begin()
    window.addEventListener('hashchange', opnieuw)
    return () => window.removeEventListener('hashchange', opnieuw)
  }, [geladen, begin])

  /**
   * Kijken of er iets nieuws is, zolang het scherm in beeld is. De server houdt het
   * verzoek vast tot er iets verandert, dus meteen daarna opnieuw vragen is goed. Antwoordt
   * hij direct zonder nieuws (hij had geen plekje om te wachten), dan eerst even rust.
   */
  useEffect(() => {
    if (fase !== 'spel' && fase !== 'vol') return
    const stopper = new AbortController()
    const rust = (ms: number) =>
      new Promise<void>((klaar) => {
        const t = setTimeout(klaar, ms)
        stopper.signal.addEventListener('abort', () => {
          clearTimeout(t)
          klaar()
        })
      })
    const zichtbaar = () =>
      new Promise<void>((klaar) => {
        const kijk = () => {
          if (document.hidden && !stopper.signal.aborted) return
          document.removeEventListener('visibilitychange', kijk)
          klaar()
        }
        document.addEventListener('visibilitychange', kijk)
        stopper.signal.addEventListener('abort', kijk)
      })
    void (async () => {
      while (!stopper.signal.aborted) {
        if (document.hidden) {
          await zichtbaar()
          continue
        }
        const kamer = kamerRef.current
        if (!kamer) {
          await rust(RUST)
          continue
        }
        const begon = Date.now()
        const voor = partijRef.current
        // Na een storing eerst meteen antwoord, zonder wachten: anders zegt Pip nog twintig
        // seconden dat hij niemand bereikt terwijl de verbinding al terug is.
        const bekend =
          bezig.current || !verbindingRef.current ? undefined : (volgendeRef.current ?? partijRef.current ?? undefined)
        const a = await live.kijk(kamer, sleutelRef.current, bekend, stopper.signal)
        if (stopper.signal.aborted) return
        if (!bezig.current && kamer === kamerRef.current) verwerk(a)
        if (a.soort !== 'goed') await rust(RUST * 2)
        else if (Date.now() - begon < 1000 && partijRef.current === voor) await rust(RUST)
      }
    })()
    return () => stopper.abort()
  }, [fase, verwerk])

  const status = useMemo(() => partij?.game.status() ?? null, [partij, fen])
  const jij = partij?.jij ?? null
  const mijnBeurt =
    fase === 'spel' &&
    !volgende &&
    partij !== null &&
    jij !== null &&
    partij.ander !== 'nog-niet' &&
    !status?.over &&
    partij.game.turn === jij

  const doeZet = useCallback(
    async (van: Square, naar: Square, promotie: PieceType = 'q') => {
      const p = partijRef.current
      const kamer = kamerRef.current
      const sleutel = sleutelRef.current
      if (!p || !kamer || !sleutel || bezig.current) return
      const na = p.zetten.length
      const gedaan = p.game.move(van, naar, promotie)
      if (!gedaan) return
      bezig.current = true
      const na1 = p.game.status()
      const schaak = na1.over ? na1.reason === 'mat' : na1.check
      if (instellingen.effecten) (schaak ? sfx.schaak : gedaan.isCapture ? sfx.slaan : sfx.zet)()
      if (gedaan.promotion && instellingen.effecten) sfx.promotie()
      setGeselecteerd(null)
      setFen(p.game.fen)
      bewaarOefendag()
      const a = await live.zet(kamer, sleutel, p.ronde, na, zetCode(van, naar, gedaan.promotion))
      bezig.current = false
      if (a.soort === 'goed') {
        const na2 = a.stand.game.status()
        verwerk(a)
        if (!na2.over) {
          zeg(na2.check ? kies(SCHAAK_VAN_JOU, 'schaak') : LIVE_DENKT_NA)
          setStemming('trots')
        }
        return
      }
      // Niet aangekomen: de zet terug, en de echte stand laten zien zodra die er is.
      p.game.undo()
      setFen(p.game.fen)
      verwerk(a)
    },
    [bewaarOefendag, instellingen.effecten, verwerk],
  )

  const opVeld = useCallback(
    (veld: Square) => {
      const p = partijRef.current
      if (!p || !mijnBeurt || promotieVraag || bezig.current) return
      if (geselecteerd && geselecteerd !== veld && p.game.destinations(geselecteerd).includes(veld)) {
        // De oudste groep kiest zelf waar de pion in verandert; de rest krijgt een dame.
        if (modus === 'schaker' && isPromotie(p.game, geselecteerd, veld)) {
          setPromotieVraag({ van: geselecteerd, naar: veld })
          zeg(PROMOTIE_KIES)
          return
        }
        void doeZet(geselecteerd, veld)
        return
      }
      if (p.game.destinations(veld).length && p.game.turn === jij) {
        setGeselecteerd(veld)
        if (instellingen.effecten) sfx.tik()
      } else setGeselecteerd(null)
    },
    [mijnBeurt, promotieVraag, geselecteerd, modus, doeZet, jij, instellingen.effecten],
  )

  const deel = async (url: string) => {
    let gelukt: 'gedeeld' | 'gekopieerd' | 'zelf' = 'zelf'
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Schaakmaatje', text: 'Kom je schaken? ♟️', url })
        gelukt = 'gedeeld'
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        gelukt = 'gekopieerd'
      }
    } catch {
      /* geannuleerd of geen klembord: de link staat in beeld om over te nemen */
    }
    setHoe(gelukt)
  }

  /** Na het rekenslot: de partij aanmaken en de link delen. */
  const maakLink = async () => {
    setSlot(false)
    setLinkMislukt(false)
    const a = await live.nieuw(mijnPlaatje)
    if (a.soort !== 'goed' || !a.kamer || !a.sleutel) {
      // Er is nog geen vriendje, dus niet "ik kan je vriendje niet bereiken". En de ouder
      // hoeft de som niet nog eens te maken. Layoutreview van 16 oktober, punt 3.
      verwerk(a.soort === 'druk' ? a : { soort: 'geen-verbinding' })
      if (a.soort !== 'druk') zeg(LIVE_LINK_MISLUKT)
      setStemming('moedigt')
      setFase('start')
      setLinkMislukt(true)
      return
    }
    kamerRef.current = a.kamer
    sleutelRef.current = a.sleutel
    bewaarSleutel(a.kamer, a.sleutel)
    // replaceState geeft geen hashchange: de partij loopt gewoon door.
    history.replaceState(null, '', `#${a.kamer}`)
    partijRef.current = null
    setFase('spel')
    verwerk(a)
    const url = speellink(a.kamer)
    setLink(url)
    await deel(url)
  }

  const kopieer = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setHoe('gekopieerd')
    } catch {
      setHoe('zelf')
    }
  }

  /** Een nieuwe partij met dezelfde link: na de uitslag, of halverwege (dan telt er niets). */
  const nogEenKeer = async () => {
    const p = partijRef.current
    setZeker(false)
    if (!p || !kamerRef.current || !sleutelRef.current) return
    verwerk(await live.opnieuw(kamerRef.current, sleutelRef.current, p.ronde), true)
  }

  /** Het einde van de vorige ronde is gezien: door naar de ronde die al klaarstond. */
  const naarVolgende = () => {
    const n = volgendeRef.current
    volgendeRef.current = null
    setVolgende(false)
    if (n) toonStand(n, partijRef.current)
  }

  const zelfBeginnen = () => {
    history.replaceState(null, '', location.pathname)
    void begin()
  }

  const marks: BoardMarks = useMemo(() => {
    const laatste = partij?.zetten.at(-1)
    const m: BoardMarks = { last: laatste ? [laatste.slice(0, 2) as Square, laatste.slice(2, 4) as Square] : undefined }
    if (geselecteerd && partij) m.targets = partij.game.destinations(geselecteerd)
    return m
  }, [geselecteerd, partij, fen])

  /**
   * De statusregel, vanuit het kind gezegd: "jij" en "je vriendje", niet de plaatjes. Het
   * standaardplaatje is 🐴, net als Pip, en de server geeft zwart een ander plaatje als
   * het vriendje hetzelfde had. "🐴 wint!" las een kind als "ik" of "Pip". Layoutreview
   * van 16 oktober, punt 4.
   */
  const regel = (() => {
    if (!partij || !status) return ''
    if (!verbinding) return '📡 Geen verbinding. Ik probeer het steeds opnieuw.'
    const kleurNaam = (k: 'w' | 'b') => (k === 'w' ? 'Wit' : 'Zwart')
    if (status.over) {
      if (status.reason !== 'mat') return '🤝 Gelijkspel'
      const winnaar = partij.game.turn === 'w' ? 'b' : 'w'
      if (fase === 'vol') return `🏆 ${kleurNaam(winnaar)} wint!`
      return winnaar === jij ? '🏆 Jij wint!' : '🏆 Je vriendje wint!'
    }
    if (fase === 'vol') return `👀 Je kijkt mee. ${kleurNaam(partij.game.turn)} is aan zet.`
    if (partij.ander === 'nog-niet') return '⏳ Wachten tot je vriendje er is.'
    if (mijnBeurt) return `👉 Jij bent aan zet!`
    if (partij.ander === 'weg') return '💤 Je vriendje is even weg.'
    return '⏳ Je vriendje denkt na…'
  })()

  /** Wie er speelt, boven en onder het bord: het eigen plaatje met "jij" erbij. */
  const speler = (kleur: 'w' | 'b') => {
    if (!partij) return null
    const pl = (kleur === 'w' ? partij.wit : partij.zwart) ?? '❔'
    const wie = fase === 'vol' ? (kleur === 'w' ? 'Wit' : 'Zwart') : kleur === jij ? 'Jij' : 'Je vriendje'
    const aanZet = !status?.over && partij.game.turn === kleur
    return (
      <div
        className="row"
        style={{ gap: 8, alignItems: 'center', justifyContent: 'flex-start', fontWeight: aanZet ? 800 : 400, opacity: aanZet ? 1 : 0.75 }}
      >
        <span style={{ fontSize: 26 }} aria-hidden="true">
          {pl}
        </span>
        <span>
          {wie} <span className="muted">({kleur === 'w' ? 'wit' : 'zwart'})</span>
        </span>
      </div>
    )
  }

  /**
   * De link om te delen, zolang het vriendje er niet is. Onder het bord, zodat je bij
   * binnenkomst eerst het bord ziet (gevraagd door Kaj). En ook na verversen: de link
   * volgt uit de partij, niet uit het moment dat hij gemaakt werd.
   */
  const deelLink = link ?? (fase === 'spel' && partij?.jij === 'w' && kamerRef.current ? speellink(kamerRef.current) : null)
  const deelKaart = deelLink && (
    <div className="card stack">
      <p style={{ margin: 0 }}>
        {hoe === 'gedeeld'
          ? 'Gedeeld. Lukte het toch niet? Kopieer de link en stuur hem zelf:'
          : hoe === 'gekopieerd'
            ? 'De link is gekopieerd. Plak hem in WhatsApp of een mail aan het vriendje:'
            : 'Stuur deze link naar het vriendje:'}
      </p>
      {/* Een tekstvak van twee regels: in een invoerveld viel de code rechts weg. */}
      <textarea
        readOnly
        rows={2}
        value={deelLink}
        onFocus={(e) => e.currentTarget.select()}
        aria-label="Speellink"
        style={{ font: 'inherit', padding: '12px 14px', borderRadius: 12, border: '2px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', width: '100%', resize: 'none', wordBreak: 'break-all' }}
      />
      <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button type="button" className="btn btn--primary btn--big" onClick={() => void deel(deelLink)}>
            📤 Delen
          </button>
        )}
        <button
          type="button"
          className={typeof navigator !== 'undefined' && 'share' in navigator ? 'btn btn--big' : 'btn btn--primary btn--big'}
          onClick={() => void kopieer(deelLink)}
        >
          📋 Kopieer
        </button>
      </div>
    </div>
  )

  return (
    <main className="page">
      <Kop titel="🤝 Live met een vriendje" terug="/spelen/" />
      <div className="stack">
        <Pip zegt={zin} stemming={stemming} klein vanzelf={spreek} />

        {fase === 'start' && !slot && (
          <div className="stack" style={{ alignItems: 'center' }}>
            {hervat && (
              <button type="button" className="btn btn--primary btn--big" onClick={() => (location.hash = hervat.kamer)}>
                ▶️ Verder spelen{hervat.plaatje ? ` tegen ${hervat.plaatje}` : ''}
              </button>
            )}
            {linkMislukt && (
              <button type="button" className="btn btn--primary btn--big" onClick={() => void maakLink()}>
                🔄 Opnieuw proberen
              </button>
            )}
            {!linkMislukt && (
              <button type="button" className={hervat ? 'btn btn--big' : 'btn btn--primary btn--big'} onClick={() => setSlot(true)}>
                🔗 {hervat ? 'Nieuwe speellink maken' : 'Speellink maken'}
              </button>
            )}
          </div>
        )}

        {fase === 'start' && slot && (
          <Rekenslot
            onAnnuleer={() => setSlot(false)}
            titel="Speellink maken"
            uitleg="Je krijgt één link om naar het vriendje te sturen, bijvoorbeeld via WhatsApp. Daarna komen de zetten vanzelf over. Op onze server staan alleen de zetten en twee plaatjes, geen naam. Na een dag is de partij weg."
            onOpen={() => void maakLink()}
          />
        )}

        {fase === 'kapot' && (
          <div className="row" style={{ justifyContent: 'center' }}>
            {!verbinding && (
              <button type="button" className="btn btn--primary btn--big" onClick={() => void begin()}>
                🔄 Opnieuw proberen
              </button>
            )}
            {verbinding && (
              <button type="button" className="btn btn--primary btn--big" onClick={zelfBeginnen}>
                Een nieuwe partij beginnen
              </button>
            )}
          </div>
        )}

        {partij && (fase === 'spel' || fase === 'vol') && (
          <>
            {/* Het bord laat ruimte voor de kop, Pip en de knoppen eronder: met 70vh viel
                "Nog een keer" op een Chromebook (1280×800) onder de rand. Layoutreview, punt 6. */}
            <div className="stack" style={{ maxWidth: 'min(100%, max(calc(100dvh - 420px), 340px), 620px)', margin: '0 auto', width: '100%', gap: 6 }}>
              {speler(jij === 'b' ? 'w' : 'b')}
              <Board
                position={fen ?? partij.game.fen}
                orientation={jij ?? 'w'}
                selected={geselecteerd}
                marks={marks}
                onSquare={opVeld}
                disabled={!mijnBeurt || Boolean(promotieVraag)}
                showCoordinates={instellingen.coordinaten}
                label="Live partij"
              />
              {speler(jij === 'b' ? 'b' : 'w')}
            </div>

            {promotieVraag && (
              <PromotieKiezer
                kleur={partij.game.turn}
                onKies={(stuk) => {
                  const v = promotieVraag
                  setPromotieVraag(null)
                  zeg(PROMOTIE_GEKOZEN)
                  setStemming('blij')
                  void doeZet(v.van, v.naar, stuk)
                }}
                onAnnuleer={() => {
                  setPromotieVraag(null)
                  setGeselecteerd(null)
                  zeg(PROMOTIE_ANDERS)
                  setStemming('moedigt')
                }}
              />
            )}

            {/* Aan zet zijn is het belangrijkste wat een kind hier moet weten: dan groot en
                in de accentkleur. Wachten mag gedempt. Layoutreview, punt 7. */}
            <p
              className={mijnBeurt ? undefined : 'muted'}
              aria-live="polite"
              style={mijnBeurt ? { margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)', textAlign: 'center' } : { margin: 0, textAlign: 'center' }}
            >
              {regel}
            </p>

            {/* Het vriendje is weg: dan de link nog eens kunnen sturen. Layoutreview, punt 8. */}
            {fase === 'spel' && partij.ander === 'weg' && !status?.over && kamerRef.current && (
              <div className="row" style={{ justifyContent: 'center' }}>
                <button type="button" className="btn btn--big" onClick={() => void deel(speellink(kamerRef.current!))}>
                  📤 Stuur de link nog eens
                </button>
              </div>
            )}

            {partij.ander === 'nog-niet' && deelKaart}

            {volgende && (
              <div className="row" style={{ justifyContent: 'center' }}>
                <button type="button" className="btn btn--primary btn--big" onClick={naarVolgende}>
                  ▶️ Naar de nieuwe partij
                </button>
              </div>
            )}

            {status?.over && fase === 'spel' && !volgende && (
              <div className="row" style={{ justifyContent: 'center' }}>
                <button type="button" className="btn btn--primary btn--big" onClick={() => void nogEenKeer()}>
                  🔁 Nog een keer
                </button>
              </div>
            )}

            {/* Halverwege stoppen: een kind dat nog niet kan matzetten, moet er ook uit
                kunnen. Er telt niets, dus niemand verliest. Schaakreview 16 oktober, punt 2. */}
            {fase === 'spel' && !status?.over && !volgende && partij.ander !== 'nog-niet' && !zeker && (
              <div className="row" style={{ justifyContent: 'center', marginTop: 16 }}>
                <button type="button" className="btn btn--big" onClick={() => setZeker(true)}>
                  ↺ Nieuwe partij
                </button>
              </div>
            )}

            {zeker && !status?.over && (
              <div className="card stack">
                <p style={{ margin: 0 }}>Opnieuw beginnen? Je vriendje begint dan ook een nieuwe partij.</p>
                <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn--primary btn--big" onClick={() => void nogEenKeer()}>
                    Ja, opnieuw
                  </button>
                  <button type="button" className="btn btn--big" onClick={() => setZeker(false)}>
                    Nee, verder spelen
                  </button>
                </div>
              </div>
            )}

            {fase === 'vol' && (
              <div className="row" style={{ justifyContent: 'center' }}>
                <button type="button" className="btn btn--big" onClick={zelfBeginnen}>
                  Zelf een partij beginnen
                </button>
              </div>
            )}
          </>
        )}

        {fase === 'start' && (
        <p className="muted" style={{ fontSize: '0.88rem' }}>
          Zo werkt het: een ouder maakt één speellink en stuurt die naar het vriendje. Daarna
          spelen jullie live, ieder op je eigen scherm. Op onze eigen server staan zolang
          alleen de zetten en twee plaatjes; na een dag zonder zet is de partij weg.
        </p>
        )}
      </div>
    </main>
  )
}
