'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Board, type BoardMarks } from '@/board/Board'
import { Kop } from '@/ui/Kop'
import { Pip, type PipStemming } from '@/ui/Pip'
import { Sterren } from '@/ui/Sterren'
import { sfx } from '@/audio/sfx'
import { kies } from '@/audio/voice'
import { BIJNA, PRIJS, PRIJS_LAATSTE } from '@/content/voice'
import { type Square } from '@/engine/board'
import {
  doelVelden,
  hint as geefHint,
  mogelijkeVelden,
  startOpgave,
  tik,
  type OpgaveStand,
} from '@/lesson/runner'
import { useInstellingen } from '@/progress/store'
import { minispelMet, zaad, type Minispel } from './minispellen'

const NIVEAUS = 6

export function MinispelScherm({ spelId }: { spelId: string }) {
  const spel = useMemo(() => minispelMet(spelId) as Minispel, [spelId])
  const instellingen = useInstellingen()
  const [niveau, setNiveau] = useState(1)
  const [stand, setStand] = useState<OpgaveStand>(() => startOpgave(minispelMet(spelId)!.maakOpgave(1, zaad(1))))
  const [zin, setZin] = useState(() => minispelMet(spelId)!.uitleg)
  const [stemming, setStemming] = useState<PipStemming>('blij')
  const [hintVelden, setHintVelden] = useState<Square[]>([])
  const [shake, setShake] = useState<Square | null>(null)
  const [gehaald, setGehaald] = useState(0)

  const nieuwRondje = useCallback(
    (volgendNiveau: number) => {
      setNiveau(volgendNiveau)
      const opgave = spel.maakOpgave(volgendNiveau)
      setStand(startOpgave(opgave))
      setZin('vraag' in opgave ? opgave.vraag : spel.uitleg)
      setStemming('denkt')
      setHintVelden([])
    },
    [spel],
  )

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
          setZin(kies(PRIJS, 'prijs'))
          setStemming('blij')
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
          setZin(kies(PRIJS_LAATSTE, 'prijs'))
          setStemming('trots')
          const volgend = Math.min(niveau + 1, NIVEAUS)
          setTimeout(() => nieuwRondje(niveau >= NIVEAUS ? NIVEAUS : volgend), 1400)
          break
        }
        case 'fout':
          if (instellingen.effecten) sfx.fout()
          setShake(veld)
          setZin(kies(BIJNA, 'bijna'))
          setStemming('moedigt')
          break
        case 'opnieuw':
          if (instellingen.effecten) sfx.fout()
          setZin('Net niet binnen de zetten. We proberen het nog een keer.')
          break
      }
    },
    [stand, instellingen.effecten, niveau, nieuwRondje],
  )

  const marks: BoardMarks = useMemo(() => {
    const m: BoardMarks = { good: stand.gevonden, glow: hintVelden, last: stand.laatsteZet ?? undefined }
    if (stand.misser) m.bad = [stand.misser]
    if (stand.geselecteerd) m.targets = mogelijkeVelden(stand, stand.geselecteerd)
    if (stand.opgave.kind === 'reach') m.goals = [stand.opgave.doel]
    return m
  }, [stand, hintVelden])

  const teVinden = stand.opgave.kind === 'tapSquares' ? doelVelden(stand.opgave).length : 0

  return (
    <main className="page">
      <Kop titel={`${spel.emoji} ${spel.naam}`} terug="/kaart/" />
      <div className="stack">
        <Pip zegt={zin} stemming={stemming} klein />

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="muted">
            Niveau {niveau} van {NIVEAUS}
          </span>
          <span aria-label={`${gehaald} rondjes gehaald`}>
            <Sterren aantal={Math.min(3, gehaald)} /> {gehaald}
          </span>
        </div>

        <div style={{ maxWidth: 460, margin: '0 auto', width: '100%' }}>
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
              setZin('Kijk eens naar het veld dat oplicht.')
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
