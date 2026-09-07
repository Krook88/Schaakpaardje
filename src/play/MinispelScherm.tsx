'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Board, type BoardMarks } from '@/board/Board'
import { Kop } from '@/ui/Kop'
import { Pip, type PipStemming } from '@/ui/Pip'
import { Confetti } from '@/ui/Confetti'
import { Teller } from '@/ui/Teller'
import { sfx } from '@/audio/sfx'
import { kies, wachtTotUitgesproken } from '@/audio/voice'
import { HINT_GEGEVEN, OPNIEUW_PROBEREN, SPEL_UIT, pipZinnen } from '@/content/voice'
import { type Square } from '@/engine/board'
import {
  doelVelden,
  hint as geefHint,
  mogelijkeVelden,
  startOpgave,
  tik,
  type OpgaveStand,
} from '@/lesson/runner'
import { useInstellingen, useModus } from '@/progress/store'
import { gebruikTip } from '@/ui/gebruikTip'
import { minispelMet, zaad, type Minispel } from './minispellen'

const NIVEAUS = 6

export function MinispelScherm({ spelId }: { spelId: string }) {
  const spel = useMemo(() => minispelMet(spelId) as Minispel, [spelId])
  const instellingen = useInstellingen()
  const zinnen = pipZinnen(useModus() === 'schaker')
  const [niveau, setNiveau] = useState(1)
  const [stand, setStand] = useState<OpgaveStand>(() => startOpgave(minispelMet(spelId)!.maakOpgave(1, zaad(1))))
  const [zin, setZin] = useState(() => minispelMet(spelId)!.uitleg)
  const [stemming, setStemming] = useState<PipStemming>('blij')
  const [hintVelden, setHintVelden] = useState<Square[]>([])
  const [shake, setShake] = useState<Square | null>(null)
  const [gehaald, setGehaald] = useState(0)
  /**
   * Is het spel uit?
   *
   * Dat kon eerst niet. Bij niveau zes bleef de teller op "Niveau 6 van 6" staan en
   * kwam er gewoon een volgend rondje, en nog een, eindeloos. Voor een kind is dat
   * geen spel maar een lopende band: er is geen moment waarop het klaar is, dus ook
   * geen moment om trots op te zijn. Nu zijn het zes rondjes en daarna een einde.
   */
  const [uit, setUit] = useState(false)
  // Eén timer, en die ruimen we op. Zonder ref gooide "Ander rondje" binnen 1400 ms
  // na een gehaald rondje het verse rondje meteen weer weg.
  const doorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { zegTip, afbreken } = gebruikTip(setZin)
  /** De opdracht van het huidige rondje, om na een tip weer terug te zetten. */
  const opdracht = 'vraag' in stand.opgave ? stand.opgave.vraag : spel.uitleg

  const nieuwRondje = useCallback(
    (volgendNiveau: number) => {
      if (doorTimer.current) clearTimeout(doorTimer.current)
      doorTimer.current = null
      setUit(false)
      setNiveau(volgendNiveau)
      afbreken()
      const opgave = spel.maakOpgave(volgendNiveau)
      setStand(startOpgave(opgave))
      setZin('vraag' in opgave ? opgave.vraag : spel.uitleg)
      setStemming('denkt')
      setHintVelden([])
      setShake(null)
    },
    [spel, afbreken],
  )

  useEffect(() => () => {
    if (doorTimer.current) clearTimeout(doorTimer.current)
  }, [])

  useEffect(() => {
    const opgave = spel.maakOpgave(1)
    setStand(startOpgave(opgave))
    setZin('vraag' in opgave ? opgave.vraag : spel.uitleg)
  }, [spel])

  const opVeld = useCallback(
    (veld: Square) => {
      if (stand.klaar) return
      const r = tik(stand, veld)
      setStand(r.stand)
      setHintVelden([])
      switch (r.uit) {
        case 'geselecteerd':
          if (instellingen.effecten) sfx.tik()
          break
        case 'goed':
          if (instellingen.effecten) sfx.goed()
          afbreken()
          setZin(kies(zinnen.PRIJS, 'prijs'))
          setStemming('juicht')
          break
        case 'sla':
          if (instellingen.effecten) sfx.slaan()
          break
        case 'zet':
          if (instellingen.effecten) sfx.zet()
          break
        case 'klaar': {
          if (instellingen.effecten) sfx.ster()
          setGehaald((n) => n + 1)
          afbreken()
          setZin(kies(zinnen.PRIJS_LAATSTE, 'prijs'))
          setStemming('trots')
          const laatste = niveau >= NIVEAUS
          if (laatste) setZin(SPEL_UIT)
          // Wachten tot Pip is uitgesproken, anders kapt het volgende rondje hem af.
          doorTimer.current = setTimeout(() => {
            void wachtTotUitgesproken().then(() => {
              if (laatste) setUit(true)
              else nieuwRondje(niveau + 1)
            })
          }, 700)
          break
        }
        case 'fout':
          if (instellingen.effecten) sfx.fout()
          // Eerst leegmaken: anders ziet Board dezelfde waarde en schudt het bord bij
          // twee keer dezelfde misser maar één keer.
          setShake(null)
          setTimeout(() => setShake(veld), 0)
          zegTip(kies(zinnen.BIJNA, 'bijna'), opdracht)
          setStemming('moedigt')
          break
        case 'opnieuw':
          if (instellingen.effecten) sfx.fout()
          zegTip(kies(OPNIEUW_PROBEREN, 'opnieuw'), opdracht)
          break
      }
    },
    [stand, instellingen.effecten, niveau, nieuwRondje, zegTip, afbreken, opdracht, zinnen],
  )

  const marks: BoardMarks = useMemo(() => {
    const m: BoardMarks = { good: stand.gevonden, glow: hintVelden, last: stand.laatsteZet ?? undefined }
    if (stand.misser) m.bad = [stand.misser]
    if (stand.geselecteerd) m.targets = mogelijkeVelden(stand, stand.geselecteerd)
    if (stand.opgave.kind === 'reach') m.goals = [stand.opgave.doel]
    return m
  }, [stand, hintVelden])

  const teVinden = stand.opgave.kind === 'tapSquares' ? doelVelden(stand.opgave).length : 0

  if (uit) {
    return (
      <main className="page">
        <Kop titel={`${spel.emoji} ${spel.naam}`} terug="/kaart/" />
        <div className="stack center">
          <Pip zegt={SPEL_UIT} stemming="trots" />
          <div className="card stack center" style={{ position: 'relative', overflow: 'hidden' }}>
            <Confetti />
            <span aria-hidden="true" style={{ fontSize: 64, lineHeight: 1 }}>
              {spel.emoji}
            </span>
            <h2>{spel.naam}</h2>
            <Teller gevonden={gehaald} totaal={NIVEAUS} />
            <p>Alle {NIVEAUS} rondjes gehaald!</p>
          </div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <Link href="/kaart/" className="btn">
              Naar de kaart
            </Link>
            <button
              type="button"
              className="btn btn--primary btn--big"
              onClick={() => {
                setGehaald(0)
                nieuwRondje(1)
              }}
            >
              ↺ Nog een keer
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <Kop titel={`${spel.emoji} ${spel.naam}`} terug="/kaart/" />
      <div className="stack">
        <Pip zegt={zin} stemming={stemming} klein />

        {/* Hoeveel rondjes er nog komen, in bolletjes.
            Hier stond "Niveau 6 van 6" naast "12 gehaald" — twee getallen die elkaar
            tegenspraken en samen niet vertelden wanneer het klaar is. Nu is het één
            rijtje: zes bolletjes, en je ziet ze vollopen. */}
        <div className="row" style={{ justifyContent: 'center' }}>
          <Teller gevonden={gehaald} totaal={NIVEAUS} />
        </div>

        <div style={{ maxWidth: 'min(100%, 70vh, 620px)', margin: '0 auto', width: '100%' }}>
          <Board
            position={stand.board}
            selected={stand.geselecteerd}
            marks={marks}
            onSquare={opVeld}
            disabled={stand.klaar}
            shake={shake}
            showCoordinates={instellingen.coordinaten || Boolean(spel.toonCoordinaten)}
            label={spel.naam}
          />
        </div>

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn"
            onClick={() => {
              const r = geefHint(stand)
              setStand(r.stand)
              setHintVelden(r.velden)
              setZin(HINT_GEGEVEN)
            }}
            disabled={stand.klaar}
          >
            💡 Tipje
          </button>
          {teVinden > 0 && (
            <span className="muted">
              {stand.gevonden.length} van de {teVinden}
            </span>
          )}
          <button type="button" className="btn btn--ghost" onClick={() => nieuwRondje(niveau)}>
            ↺ Ander rondje
          </button>
        </div>

        <div className="row" style={{ justifyContent: 'center' }}>
          <Link href="/kaart/" className="btn btn--ghost">
            Terug naar de kaart
          </Link>
        </div>
      </div>
    </main>
  )
}
