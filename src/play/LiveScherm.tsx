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
  LIVE_GEEN_VERBINDING,
  LIVE_GEWONNEN,
  LIVE_JIJ_ZWART,
  LIVE_KAPOT,
  LIVE_OPNIEUW,
  LIVE_VOL,
  LIVE_VRIENDJE_ER,
  LIVE_WACHT_OP_VRIENDJE,
  LIVE_WEG,
  PARTIJ_REMISE,
  PROMOTIE_ANDERS,
  PROMOTIE_GEKOZEN,
  PROMOTIE_KIES,
  SCHAAK_TEGEN_JOU,
  SCHAAK_VAN_JOU,
} from '@/content/voice'
import { kies } from '@/audio/voice'
import { type PieceType, type Square } from '@/engine/board'
import { isPromotie } from '@/engine/game'
import { AVATARS, useInstellingen, useModus, useProfiel, useProfielStore, useToestandGeladen } from '@/progress/store'
import { tel } from '@/progress/tellen'
import { zetCode } from './afstand'
import { bewaarSleutel, isKamer, live, mijnSleutel, type Antwoord, type LivePartij } from './live'
import { PromotieKiezer } from './PromotieKiezer'

/** Zo vaak kijkt het scherm of er een zet is. Snel genoeg voor een kind, rustig voor de server. */
const KIJK_ELKE = 1500

/** Welke afgelopen partijen dit apparaat al heeft meegeteld (per kind, per partij en ronde). */
const GETELD = 'schaakmaatje-live-geteld'
function eenKeer(sleutel: string): boolean {
  try {
    const lijst = JSON.parse(localStorage.getItem(GETELD) ?? '[]') as string[]
    if (lijst.includes(sleutel)) return false
    localStorage.setItem(GETELD, JSON.stringify([...lijst.slice(-49), sleutel]))
    return true
  } catch {
    return true
  }
}

type Fase = 'laden' | 'start' | 'spel' | 'vol' | 'kapot'

/**
 * Live spelen: ieder op een eigen scherm, de zetten komen vanzelf over. Zie ./live.ts.
 *
 * Een ouder maakt de speellink (achter het rekenslot) en deelt hem één keer. Wie de link
 * opent, speelt zwart. Daarna kijkt het scherm elke anderhalve seconde of er iets nieuws
 * is, zolang het in beeld is.
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
  /** Een zet is onderweg: dan niet tegelijk kijken, anders flitst hij even weg. */
  const bezig = useRef(false)
  const [fen, setFen] = useState<string | null>(null)
  const [geselecteerd, setGeselecteerd] = useState<Square | null>(null)
  const [promotieVraag, setPromotieVraag] = useState<{ van: Square; naar: Square } | null>(null)
  const [zin, setZin] = useState(LIVE_BEGIN)
  const [stemming, setStemming] = useState<PipStemming>('blij')
  const [verbinding, setVerbinding] = useState(true)
  const [slot, setSlot] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [hoe, setHoe] = useState<'gedeeld' | 'gekopieerd' | 'zelf' | null>(null)

  /** Een partij tonen, en Pip laten zeggen wat er veranderd is. */
  const toon = useCallback(
    (nieuw: LivePartij) => {
      const oud = partijRef.current
      partijRef.current = nieuw
      setPartij(nieuw)
      setFen(nieuw.game.fen)
      const jij = nieuw.jij
      const status = nieuw.game.status()
      const laatste = nieuw.zetten.at(-1)
      const ikDeedLaatste = jij !== null && nieuw.zetten.length > 0 && (nieuw.zetten.length % 2 === 1 ? 'w' : 'b') === jij

      // Een afgelopen partij één keer meetellen. De telling naar de teller gaat alleen
      // van wie de laatste zet deed, anders telt elke partij dubbel.
      if (status.over && jij !== null && kamerRef.current) {
        const sleutel = `${profiel?.id ?? '-'}:${kamerRef.current}:${nieuw.ronde}`
        if (eenKeer(sleutel)) {
          const uitslag = status.reason !== 'mat' ? 'remise' : ikDeedLaatste ? 'gewonnen' : 'verloren'
          if (profiel) bewaarPartij(uitslag)
          if (ikDeedLaatste) tel('Partij', { tegen: 'live', uitslag })
        }
      }

      if (jij === null) return
      const nieuweRonde = oud !== null && oud.ronde !== nieuw.ronde
      const nieuweZet = oud !== null && !nieuweRonde && nieuw.zetten.length > oud.zetten.length
      if (nieuweRonde) {
        setGeselecteerd(null)
        setZin(LIVE_OPNIEUW[jij === 'w' ? 0 : 1])
        setStemming('blij')
      } else if (status.over) {
        if (oud && oud.zetten.length === nieuw.zetten.length && oud.ronde === nieuw.ronde) return
        setZin(status.reason === 'mat' ? (ikDeedLaatste ? LIVE_GEWONNEN : AFSTAND_VRIENDJE_WINT) : PARTIJ_REMISE[0])
        setStemming('trots')
      } else if (nieuweZet && !ikDeedLaatste) {
        const onder = laatste?.[4] ? 'rbn'.indexOf(laatste[4]) : -1
        setZin(status.check ? kies(SCHAAK_TEGEN_JOU, 'schaak') : onder >= 0 ? AFSTAND_ONDERPROMOTIE[onder] : AFSTAND_JOUW_BEURT)
        setStemming(status.check ? 'verrast' : 'blij')
        if (instellingen.effecten) sfx.zet()
      } else if (oud?.ander === 'nog-niet' && nieuw.ander !== 'nog-niet') {
        setZin(jij === 'w' ? LIVE_VRIENDJE_ER : LIVE_JIJ_ZWART)
        setStemming('blij')
        setLink(null)
      } else if (oud?.ander !== 'weg' && nieuw.ander === 'weg') {
        setZin(LIVE_WEG)
        setStemming('moedigt')
      } else if (oud === null) {
        // Binnenkomen, of terugkomen na verversen.
        setZin(
          nieuw.ander === 'nog-niet'
            ? LIVE_WACHT_OP_VRIENDJE
            : nieuw.zetten.length === 0
              ? jij === 'w'
                ? LIVE_VRIENDJE_ER
                : LIVE_JIJ_ZWART
              : nieuw.game.turn === jij
                ? AFSTAND_JOUW_BEURT
                : LIVE_DENKT_NA,
        )
        setStemming('blij')
      }
    },
    [bewaarPartij, instellingen.effecten, profiel],
  )

  /** Wat er na een verzoek moet gebeuren, voor alle soorten antwoorden samen. */
  const verwerk = useCallback(
    (a: Antwoord) => {
      if (a.soort === 'geen-verbinding') {
        setVerbinding((was) => {
          if (was) {
            setZin(LIVE_GEEN_VERBINDING)
            setStemming('moedigt')
          }
          return false
        })
        return
      }
      setVerbinding(true)
      if (a.soort === 'weg') {
        partijRef.current = null
        setPartij(null)
        setFase('kapot')
        setZin(LIVE_KAPOT)
        setStemming('moedigt')
        return
      }
      if (a.stand) toon(a.stand)
    },
    [toon],
  )

  /** Beginnen bij de link in de adresbalk: een nieuwe partij, meedoen, of verder. */
  const begin = useCallback(async () => {
    const code = window.location.hash.slice(1)
    partijRef.current = null
    setPartij(null)
    setGeselecteerd(null)
    setPromotieVraag(null)
    setSlot(false)
    setLink(null)
    setHoe(null)
    if (!code) {
      kamerRef.current = null
      setFase('start')
      setZin(LIVE_BEGIN)
      setStemming('blij')
      return
    }
    if (!isKamer(code)) {
      setFase('kapot')
      setZin(LIVE_KAPOT)
      setStemming('moedigt')
      return
    }
    kamerRef.current = code
    sleutelRef.current = mijnSleutel(code)
    setFase('laden')
    if (sleutelRef.current) {
      const a = await live.kijk(code, sleutelRef.current)
      // Een sleutel die de server niet (meer) kent: dan gewoon meekijken.
      if (a.soort === 'goed') setFase(a.stand.jij ? 'spel' : 'vol')
      verwerk(a)
      if (a.soort === 'goed' && !a.stand.jij) setZin(LIVE_VOL)
      if (a.soort === 'geen-verbinding') setFase('spel')
      return
    }
    const a = await live.meedoen(code, mijnPlaatje)
    if (a.soort === 'goed' && a.sleutel) {
      sleutelRef.current = a.sleutel
      bewaarSleutel(code, a.sleutel)
      setFase('spel')
    } else if (a.soort === 'vol') {
      setFase('vol')
      setZin(LIVE_VOL)
      setStemming('blij')
    } else if (a.soort === 'geen-verbinding') {
      setFase('kapot')
    }
    verwerk(a)
  }, [mijnPlaatje, verwerk])

  useEffect(() => {
    if (!geladen) return
    void begin()
    const opnieuw = () => void begin()
    window.addEventListener('hashchange', opnieuw)
    return () => window.removeEventListener('hashchange', opnieuw)
  }, [geladen, begin])

  /** Kijken of er iets nieuws is, zolang het scherm in beeld is. */
  useEffect(() => {
    if (fase !== 'spel' && fase !== 'vol') return
    let stop = false
    const kijk = async () => {
      const kamer = kamerRef.current
      if (stop || !kamer || bezig.current || document.hidden) return
      const a = await live.kijk(kamer, sleutelRef.current)
      if (stop || bezig.current || kamer !== kamerRef.current) return
      const oud = partijRef.current
      // Alleen iets doen als er echt iets veranderd is.
      if (
        a.soort === 'goed' &&
        oud &&
        oud.ronde === a.stand.ronde &&
        oud.zetten.length === a.stand.zetten.length &&
        oud.ander === a.stand.ander &&
        oud.zwart === a.stand.zwart
      ) {
        setVerbinding(true)
        return
      }
      verwerk(a)
    }
    const klok = window.setInterval(() => void kijk(), KIJK_ELKE)
    const zichtbaar = () => void kijk()
    document.addEventListener('visibilitychange', zichtbaar)
    return () => {
      stop = true
      window.clearInterval(klok)
      document.removeEventListener('visibilitychange', zichtbaar)
    }
  }, [fase, verwerk])

  const status = useMemo(() => partij?.game.status() ?? null, [partij, fen])
  const jij = partij?.jij ?? null
  const mijnBeurt =
    fase === 'spel' && partij !== null && jij !== null && partij.ander !== 'nog-niet' && !status?.over && partij.game.turn === jij

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
      if (instellingen.effecten) (gedaan.isCapture ? sfx.slaan : sfx.zet)()
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
          setZin(na2.check ? kies(SCHAAK_VAN_JOU, 'schaak') : LIVE_DENKT_NA)
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
          setZin(PROMOTIE_KIES)
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
    const a = await live.nieuw(mijnPlaatje)
    if (a.soort !== 'goed' || !a.kamer || !a.sleutel) {
      verwerk(a.soort === 'goed' ? { soort: 'geen-verbinding' } : a)
      if (a.soort !== 'weg') setFase('start')
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
    const url = `${location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/spelen/live/#${a.kamer}`
    setLink(url)
    await deel(url)
  }

  const kopieer = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setHoe('gekopieerd')
    } catch {
      setHoe('zelf')
    }
  }

  const nogEenKeer = async () => {
    const p = partijRef.current
    if (!p || !kamerRef.current || !sleutelRef.current) return
    verwerk(await live.opnieuw(kamerRef.current, sleutelRef.current, p.ronde))
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

  const plaatje = (kleur: 'w' | 'b') => (kleur === 'w' ? partij?.wit : partij?.zwart) ?? 'je vriendje'

  const regel = (() => {
    if (!partij || !status) return ''
    if (!verbinding) return '📡 Geen verbinding. Ik probeer het steeds opnieuw.'
    if (status.over) {
      if (status.reason !== 'mat') return 'Gelijkspel'
      return `🏆 ${plaatje(partij.game.turn === 'w' ? 'b' : 'w')} wint!`
    }
    if (fase === 'vol') return `👀 Je kijkt mee. ${plaatje(partij.game.turn)} is aan zet.`
    if (partij.ander === 'nog-niet') return '⏳ Wachten tot je vriendje er is.'
    if (mijnBeurt) return `${plaatje(jij!)} Jij bent aan zet (${jij === 'w' ? 'wit' : 'zwart'}) · zet ${Math.floor(partij.zetten.length / 2) + 1}`
    if (partij.ander === 'weg') return `💤 ${plaatje(partij.game.turn)} is even weg.`
    return `⏳ ${plaatje(partij.game.turn)} denkt na…`
  })()

  return (
    <main className="page">
      <Kop titel="📡 Live met een vriendje" terug="/spelen/" />
      <div className="stack">
        <Pip zegt={zin} stemming={stemming} klein />

        {fase === 'start' && !slot && (
          <div className="row" style={{ justifyContent: 'center' }}>
            <button type="button" className="btn btn--primary btn--big" onClick={() => setSlot(true)}>
              🔗 Speellink maken
            </button>
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
            <button type="button" className={verbinding ? 'btn btn--primary btn--big' : 'btn btn--big'} onClick={zelfBeginnen}>
              Een nieuwe partij beginnen
            </button>
          </div>
        )}

        {partij && (fase === 'spel' || fase === 'vol') && (
          <>
            <div style={{ maxWidth: 'min(100%, 70vh, 620px)', margin: '0 auto', width: '100%' }}>
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
            </div>

            {promotieVraag && (
              <PromotieKiezer
                kleur={partij.game.turn}
                onKies={(stuk) => {
                  const v = promotieVraag
                  setPromotieVraag(null)
                  setZin(PROMOTIE_GEKOZEN)
                  setStemming('blij')
                  void doeZet(v.van, v.naar, stuk)
                }}
                onAnnuleer={() => {
                  setPromotieVraag(null)
                  setGeselecteerd(null)
                  setZin(PROMOTIE_ANDERS)
                  setStemming('moedigt')
                }}
              />
            )}

            <p className="muted" aria-live="polite" style={{ margin: 0 }}>
              {regel}
            </p>

            {status?.over && fase === 'spel' && (
              <div className="row" style={{ justifyContent: 'center' }}>
                <button type="button" className="btn btn--primary btn--big" onClick={() => void nogEenKeer()}>
                  🔁 Nog een keer
                </button>
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

        {link && partij?.ander === 'nog-niet' && (
          <div className="card stack">
            <p style={{ margin: 0 }}>
              {hoe === 'gedeeld'
                ? 'Gedeeld. Lukte het toch niet? Kopieer de link en stuur hem zelf:'
                : hoe === 'gekopieerd'
                  ? 'De link is gekopieerd. Plak hem in WhatsApp of een mail aan het vriendje:'
                  : 'Kopieer deze link en stuur hem naar het vriendje:'}
            </p>
            <input
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Speellink"
              style={{ font: 'inherit', padding: '12px 14px', borderRadius: 12, border: '2px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', width: '100%', minHeight: 64 }}
            />
            <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn--big" onClick={() => void kopieer()}>
                📋 Kopieer
              </button>
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button type="button" className="btn btn--big" onClick={() => void deel(link)}>
                  📤 Delen
                </button>
              )}
            </div>
          </div>
        )}

        <p className="muted" style={{ fontSize: '0.88rem' }}>
          Zo werkt het: een ouder maakt één speellink en stuurt die naar het vriendje. Daarna
          spelen jullie live, ieder op je eigen scherm. Op onze eigen server staan zolang
          alleen de zetten en twee plaatjes; na een dag zonder zet is de partij weg.
        </p>
      </div>
    </main>
  )
}
