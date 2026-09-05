'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Board, type BoardMarks } from '@/board/Board'
import { Kop } from '@/ui/Kop'
import { Pip, type PipStemming } from '@/ui/Pip'
import { sfx } from '@/audio/sfx'
import { kies, speak } from '@/audio/voice'
import {
  BLUNDER_WAARSCHUWING,
  PARTIJ_GEWONNEN,
  PARTIJ_REMISE,
  PARTIJ_START,
  PARTIJ_VERLOREN,
  SCHAAK_TEGEN_JOU,
  SCHAAK_VAN_JOU,
} from '@/content/voice'
import { PIECE_NAME, type Square } from '@/engine/board'
import { Game, materialBalance } from '@/engine/game'
import { getBot, KidBot } from '@/engine/bots'
import { useInstellingen, useProfielStore } from '@/progress/store'
import { OPSTELLING } from './opstellingen'

type Uitslag = 'gewonnen' | 'verloren' | 'remise' | null

export function PartijScherm({ botId }: { botId: string }) {
  const bot = useMemo(() => (botId === 'samen' ? null : (getBot(botId) ?? null)), [botId])
  const opzet = OPSTELLING[bot?.id ?? 'samen']
  const instellingen = useInstellingen()
  const bewaarPartij = useProfielStore((s) => s.bewaarPartij)
  const bewaarOverwinning = useProfielStore((s) => s.bewaarOverwinning)

  const gameRef = useRef(new Game(opzet?.fen))
  const [fen, setFen] = useState(gameRef.current.fen)
  const [geselecteerd, setGeselecteerd] = useState<Square | null>(null)
  const [laatsteZet, setLaatsteZet] = useState<[Square, Square] | null>(null)
  // Geen willekeurige zin in de eerste render: dat verschilt tussen de
  // voorgerenderde HTML en de browser, en dan klaagt React over hydratie.
  const [zin, setZin] = useState<string>(PARTIJ_START[0])
  const [stemming, setStemming] = useState<PipStemming>('blij')
  const [uitslag, setUitslag] = useState<Uitslag>(null)
  const [botDenkt, setBotDenkt] = useState(false)
  const [twijfel, setTwijfel] = useState<{ van: Square; naar: Square; verlies: number } | null>(null)
  const [zetten, setZetten] = useState(0)

  // Nieuwe KidBot per partij: het genadebudget hoort bij één partij, niet bij de sessie.
  const [partijNr, setPartijNr] = useState(0)
  const kidBot = useMemo(() => (bot ? new KidBot(bot, 2) : null), [bot, partijNr])
  const samen = !bot
  const denkTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopDenken = useCallback(() => {
    if (denkTimer.current) clearTimeout(denkTimer.current)
    denkTimer.current = null
    setBotDenkt(false)
  }, [])

  useEffect(() => () => stopDenken(), [stopDenken])

  const eindig = useCallback(
    (nieuw: Uitslag, tekst: string) => {
      setUitslag(nieuw)
      setZin(tekst)
      setStemming(nieuw === 'gewonnen' ? 'trots' : 'moedigt')
      if (nieuw) bewaarPartij(nieuw)
      // Winnen van een tegenstander levert zijn maatje op voor de stal. Eén keer is
      // genoeg: het is een verzameling, geen scorebord, dus je kunt hem niet kwijtraken
      // door daarna te verliezen.
      if (nieuw === 'gewonnen' && bot) bewaarOverwinning(bot.id)
      if (instellingen.effecten) sfx.diploma()
    },
    [bewaarPartij, bewaarOverwinning, bot, instellingen.effecten],
  )

  /** Kijkt of de partij voorbij is en vertelt dat. */
  const controleerEinde = useCallback(
    (game: Game): boolean => {
      const status = game.status()
      if (!status.over) {
        if (status.check) {
          if (instellingen.effecten) sfx.schaak()
          // Wie aan zet is, staat schaak. Is dat het kind zelf, dan is het een
          // waarschuwing; is het de tegenstander, dan is het juist goed nieuws. Eén
          // zin voor allebei zou de helft van de meldingen omdraaien — precies het
          // begrip dat wereld 9 net heeft aangeleerd.
          const tegenHetKind = samen || status.turn === 'w'
          setZin(kies(tegenHetKind ? SCHAAK_TEGEN_JOU : SCHAAK_VAN_JOU, 'schaak'))
          setStemming('verrast')
        }
        return false
      }
      if (status.reason === 'mat') {
        const jijWint = status.winner === 'w'
        eindig(jijWint ? 'gewonnen' : 'verloren', kies(jijWint ? PARTIJ_GEWONNEN : PARTIJ_VERLOREN, 'einde'))
      } else {
        eindig('remise', kies(PARTIJ_REMISE, 'einde'))
      }
      return true
    },
    [eindig, instellingen.effecten, samen],
  )

  /**
   * Hoeveel kost deze zet netto, als de tegenstander het beste antwoord speelt?
   *
   * Alleen kijken naar wat hij kan pakken is niet genoeg: dan gaat de waarschuwing ook
   * af bij een eerlijke ruil (paard voor paard) en leert een kind dat ruilen eng is.
   * Daarom telt de herovering mee — precies zoals wereld 7 het uitlegt.
   */
  const blunderVerlies = useCallback((game: Game, van: Square, naar: Square): number => {
    const proef = game.clone()
    if (!proef.move(van, naar)) return 0
    const balansNa = materialBalance(proef.fen)
    let ergste = 0
    for (const reactie of proef.legalMoves()) {
      if (!reactie.isCapture) continue
      const na = proef.clone()
      na.move(reactie.from, reactie.to)
      // Wat blijft er van dat verlies over nadat wij terugslaan?
      let besteHerovering = materialBalance(na.fen)
      for (const terug of na.legalMoves()) {
        if (!terug.isCapture) continue
        const daarna = na.clone()
        daarna.move(terug.from, terug.to)
        besteHerovering = Math.max(besteHerovering, materialBalance(daarna.fen))
      }
      const verlies = balansNa - besteHerovering
      if (verlies > ergste) ergste = verlies
    }
    return ergste
  }, [])

  const botAanZet = useCallback(() => {
    if (!kidBot || !bot) return
    setBotDenkt(true)
    if (denkTimer.current) clearTimeout(denkTimer.current)
    denkTimer.current = setTimeout(() => {
      const game = gameRef.current
      const zet = kidBot.kies(game)
      let gedaanDoorBot: ReturnType<Game['move']> = null
      if (zet) {
        gedaanDoorBot = game.move(zet.from, zet.to)
        if (gedaanDoorBot && instellingen.effecten) {
          ;(gedaanDoorBot.isCapture ? sfx.slaan : sfx.zet)()
        }
        setLaatsteZet([zet.from, zet.to])
        setFen(game.fen)
      }
      denkTimer.current = null
      setBotDenkt(false)
      if (controleerEinde(game)) return
      // Het pionnenspel geldt beide kanten op: haalt de bot als eerste de overkant,
      // dan heeft hij gewonnen. Zonder dit werkte de winregel maar één kant op.
      if (opzet?.winBijPromotie && gedaanDoorBot?.promotion) {
        eindig('verloren', 'Zijn pion is dame geworden. Deze keer wint hij.')
      }
    }, bot.denktijd)
  }, [kidBot, bot, controleerEinde, eindig, instellingen.effecten, opzet?.winBijPromotie])

  const voerUit = useCallback(
    (van: Square, naar: Square) => {
      const game = gameRef.current
      const gedaan = game.move(van, naar)
      if (!gedaan) return
      if (instellingen.effecten) (gedaan.isCapture ? sfx.slaan : sfx.zet)()
      if (gedaan.promotion && instellingen.effecten) sfx.promotie()
      setLaatsteZet([van, naar])
      setFen(game.fen)
      setGeselecteerd(null)
      setZetten((n) => n + 1)

      // Pionnenspel: wie het eerst promoveert, wint.
      if (opzet?.winBijPromotie && gedaan.promotion) {
        eindig('gewonnen', 'Je pion is dame geworden. Gewonnen!')
        return
      }
      if (controleerEinde(game)) return
      if (!samen) botAanZet()
    },
    [botAanZet, controleerEinde, eindig, instellingen.effecten, opzet?.winBijPromotie, samen],
  )

  const opVeld = useCallback(
    (veld: Square) => {
      if (uitslag || botDenkt || twijfel) return
      const game = gameRef.current
      const aanZet = game.turn
      if (!samen && aanZet !== 'w') return

      if (geselecteerd) {
        if (veld === geselecteerd) {
          setGeselecteerd(null)
          return
        }
        const kan = game.destinations(geselecteerd).includes(veld)
        if (kan) {
          const verlies = instellingen.blunderWaarschuwing ? blunderVerlies(game, geselecteerd, veld) : 0
          if (verlies >= 3) {
            setTwijfel({ van: geselecteerd, naar: veld, verlies })
            setZin(kies(BLUNDER_WAARSCHUWING, 'blunder'))
            setStemming('verrast')
            return
          }
          voerUit(geselecteerd, veld)
          return
        }
      }
      // Nieuw stuk kiezen.
      if (game.destinations(veld).length) {
        setGeselecteerd(veld)
        if (instellingen.effecten) sfx.tik()
      } else {
        setGeselecteerd(null)
      }
    },
    [blunderVerlies, botDenkt, geselecteerd, instellingen, samen, twijfel, uitslag, voerUit],
  )

  const neemTerug = useCallback(() => {
    stopDenken()
    const game = gameRef.current
    game.undo()
    if (!samen) game.undo()
    setFen(game.fen)
    setLaatsteZet(null)
    setGeselecteerd(null)
    setUitslag(null)
    setZetten((n) => Math.max(0, n - 1))
    setZin('Geeft niet, we doen die zet gewoon nog een keer.')
    setStemming('moedigt')
  }, [samen, stopDenken])

  const opnieuw = useCallback(() => {
    // Zonder dit bleef de oude denk-timer lopen: die deed daarna een zet op de nieuwe
    // partij, en dan begint een kind zijn potje met een zet die de app deed.
    stopDenken()
    setPartijNr((n) => n + 1)
    gameRef.current = new Game(opzet?.fen)
    setFen(gameRef.current.fen)
    setGeselecteerd(null)
    setLaatsteZet(null)
    setUitslag(null)
    setZetten(0)
    setZin(kies(PARTIJ_START, 'start'))
    setStemming('blij')
  }, [opzet?.fen, stopDenken])

  useEffect(() => {
    setZin(kies(PARTIJ_START, 'start'))
    void speak(bot ? `Je speelt tegen ${bot.naam}. ${bot.tagline}` : 'Samen spelen! Wit begint.')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const marks: BoardMarks = useMemo(() => {
    const m: BoardMarks = { last: laatsteZet ?? undefined }
    if (geselecteerd) m.targets = gameRef.current.destinations(geselecteerd)
    return m
  }, [geselecteerd, laatsteZet, fen])

  const balans = materialBalance(fen)

  return (
    <main className="page">
      <Kop titel={bot ? `${bot.emoji} ${bot.naam}` : '👨‍👩‍👧 Samen spelen'} terug="/spelen/" />
      <div className="stack">
        <Pip zegt={zin} stemming={stemming} klein />

        <div style={{ maxWidth: 'min(100%, 70vh, 620px)', margin: '0 auto', width: '100%' }}>
          <Board
            position={fen}
            selected={geselecteerd}
            marks={marks}
            onSquare={opVeld}
            disabled={Boolean(uitslag) || botDenkt}
            showCoordinates={instellingen.coordinaten}
            label="Partij"
          />
        </div>

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="muted" aria-live="polite">
            {uitslag
              ? uitslag === 'gewonnen'
                ? '🏆 Gewonnen!'
                : uitslag === 'verloren'
                  ? 'Verloren'
                  : 'Gelijkspel'
              : botDenkt
                ? `${bot?.naam ?? 'De ander'} denkt na…`
                : `Jij bent aan zet · zet ${zetten + 1}`}
          </span>
          <span className="muted">
            {balans > 0 ? `Jij staat ${balans} voor` : balans < 0 ? `Je staat ${-balans} achter` : 'Gelijk'}
          </span>
        </div>

        {twijfel && (
          <div className="card stack" role="alertdialog" aria-label="Weet je het zeker?">
            <p>
              Als je dat doet, kan {bot?.naam ?? 'de ander'} je{' '}
              {twijfel.verlies >= 9 ? 'dame' : twijfel.verlies >= 5 ? 'toren' : 'stuk'} pakken.
            </p>
            <div className="row">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  const t = twijfel
                  setTwijfel(null)
                  voerUit(t.van, t.naar)
                }}
              >
                Toch doen
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setTwijfel(null)
                  setGeselecteerd(null)
                  setZin('Goed gekeken. Zoek maar een andere zet.')
                  setStemming('blij')
                }}
              >
                Andere zet zoeken
              </button>
            </div>
          </div>
        )}

        <div className="row" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn" onClick={neemTerug} disabled={zetten === 0}>
            ↩︎ Terugnemen
          </button>
          <button type="button" className="btn" onClick={opnieuw}>
            ↺ Nog een keer
          </button>
          <Link href="/spelen/" className="btn btn--ghost">
            Andere tegenstander
          </Link>
        </div>

        {uitslag && (
          <div className="card stack center">
            <h2>{uitslag === 'gewonnen' ? 'Gewonnen! 🏆' : uitslag === 'verloren' ? 'Deze ging verloren' : 'Gelijkspel'}</h2>
            <p className="muted">
              Je deed {zetten} zetten. {laatsteZet && `De laatste ging naar ${laatsteZet[1]}.`}
            </p>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button type="button" className="btn btn--primary btn--big" onClick={opnieuw}>
                Nog een partijtje
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

/** Kleine hulp voor de schermlezer: "wit paard" in plaats van "N". */
export function stukNaam(letter: keyof typeof PIECE_NAME) {
  return PIECE_NAME[letter]
}
