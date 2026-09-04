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
  SCHAAK,
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

  const kidBot = useMemo(() => (bot ? new KidBot(bot, 2) : null), [bot])
  const samen = !bot

  const eindig = useCallback(
    (nieuw: Uitslag, tekst: string) => {
      setUitslag(nieuw)
      setZin(tekst)
      setStemming(nieuw === 'gewonnen' ? 'trots' : 'moedigt')
      if (nieuw) bewaarPartij(nieuw)
      if (instellingen.effecten) sfx.diploma()
    },
    [bewaarPartij, instellingen.effecten],
  )

  /** Kijkt of de partij voorbij is en vertelt dat. */
  const controleerEinde = useCallback(
    (game: Game): boolean => {
      const status = game.status()
      if (!status.over) {
        if (status.check) {
          if (instellingen.effecten) sfx.schaak()
          setZin(kies(SCHAAK, 'schaak'))
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
    [eindig, instellingen.effecten],
  )

  /** Hoeveel kan de tegenstander na deze zet gratis pakken? */
  const blunderVerlies = useCallback((game: Game, van: Square, naar: Square): number => {
    const proef = game.clone()
    if (!proef.move(van, naar)) return 0
    const voor = Math.abs(materialBalance(proef.fen))
    let ergste = 0
    for (const reactie of proef.legalMoves()) {
      if (!reactie.isCapture) continue
      const na = proef.clone()
      na.move(reactie.from, reactie.to)
      const verschil = Math.abs(materialBalance(na.fen)) - voor
      // Voor wit is een negatievere balans slechter; we kijken naar het verlies.
      const verlies = materialBalance(proef.fen) - materialBalance(na.fen)
      if (verlies > ergste) ergste = verlies
      void verschil
    }
    return ergste
  }, [])

  const botAanZet = useCallback(() => {
    if (!kidBot || !bot) return
    setBotDenkt(true)
    const wacht = setTimeout(() => {
      const game = gameRef.current
      const zet = kidBot.kies(game)
      if (zet) {
        const gedaan = game.move(zet.from, zet.to)
        if (gedaan && instellingen.effecten) (gedaan.isCapture ? sfx.slaan : sfx.zet)()
        setLaatsteZet([zet.from, zet.to])
        setFen(game.fen)
      }
      setBotDenkt(false)
      controleerEinde(game)
    }, bot.denktijd)
    return () => clearTimeout(wacht)
  }, [kidBot, bot, controleerEinde, instellingen.effecten])

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
    const game = gameRef.current
    game.undo()
    if (!samen) game.undo()
    setFen(game.fen)
    setLaatsteZet(null)
    setGeselecteerd(null)
    setUitslag(null)
    setZin('Geeft niet, we doen die zet gewoon nog een keer.')
    setStemming('moedigt')
  }, [samen])

  const opnieuw = useCallback(() => {
    gameRef.current = new Game(opzet?.fen)
    setFen(gameRef.current.fen)
    setGeselecteerd(null)
    setLaatsteZet(null)
    setUitslag(null)
    setZetten(0)
    setZin(kies(PARTIJ_START, 'start'))
    setStemming('blij')
  }, [opzet?.fen])

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

        <div style={{ maxWidth: 460, margin: '0 auto', width: '100%' }}>
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
                : `Jij bent aan zet · zet ${Math.floor(zetten / 2) + 1}`}
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
              Je deed {Math.ceil(zetten / 2)} zetten. {laatsteZet && `De laatste ging naar ${laatsteZet[1]}.`}
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
