'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Board } from '@/board/Board'
import { applyMove, parseBoard, pieceMoves, type Square } from '@/engine/board'
import { sfx } from '@/audio/sfx'
import { tel } from '@/progress/tellen'
import { Icoon, pipLos } from '@/ui/beelden'
import styles from './Welkom.module.css'

/**
 * Het paard in de held, om zelf mee te spelen. Eerst stond hier een animatie: een
 * bezoeker keek, maar deed niets (31e review: "een tikbaar paard in de held, dan
 * voel je de app al vóór de eerste les"). Nu tikt een kind (of de ouder die meekijkt)
 * een veld met een stip aan en springt het paard erheen. Na drie sprongen nodigt Pip
 * uit voor de echte eerste les.
 *
 * De ballon wordt niet uitgesproken: er zijn geen opnames van, en de stippen wijzen
 * zichzelf. Een kind dat niet leest ziet wat het moet doen.
 *
 * Geometrisch, met engine/board: één paard op een leeg bord is geen geldige partij,
 * dus chess.js zou hem weigeren (zie CLAUDE.md, twee zetmotoren).
 */
// d5 en niet d4: op een telefoon van 360×740 viel het paard op d4 net onder de vouw
// (36e review), en dan zag een ouder alleen stippen.
const BEGIN = '8/8/8/3N4/8/8/8/8'
const ZINNEN = ['Hop! Dat is een L.', 'Nog een L! Twee recht, één opzij.', 'Jij kunt het al! Zullen we echt beginnen?']

export function HeldSpel({ eersteLes }: { eersteLes: string }) {
  const [bord, setBord] = useState(() => parseBoard(BEGIN))
  const [sprongen, setSprongen] = useState(0)
  // Telt elke tik: als sleutel op de ballon leest een schermlezer ook een herhaalde zin
  // opnieuw voor.
  const [tikken, setTikken] = useState(0)
  const [bericht, setBericht] = useState('Tik op een stip: daar mag ik heen!')
  const [schud, setSchud] = useState<Square | null>(null)
  const [vorige, setVorige] = useState<[Square, Square] | undefined>(undefined)
  const uitnodiging = useRef<HTMLDivElement>(null)
  const schudTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(schudTimer.current), [])
  // De uitnodiging schuift in beeld: op een telefoon viel hij onder de vouw, en dan
  // zag het kind "Jij kunt het al!" en daarna niets (36e review).
  useEffect(() => {
    if (sprongen === 3) uitnodiging.current?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [sprongen])
  const plek = useMemo(() => (Object.keys(bord) as Square[]).find((v) => bord[v]) ?? ('d5' as Square), [bord])
  const doelen = useMemo(() => pieceMoves(bord, plek).all, [bord, plek])

  const tik = (veld: Square) => {
    setTikken((n) => n + 1)
    if (veld === plek) return setBericht('Dat ben ik! Tik op een stip.')
    if (!doelen.includes(veld)) {
      sfx.fout()
      // Eerst los, dan weer vast: zo schudt ook een tweede misser op hetzelfde veld.
      // Het terugzetten na het schudden doet Board zelf.
      setSchud(null)
      clearTimeout(schudTimer.current)
      schudTimer.current = setTimeout(() => setSchud(veld), 0)
      return setBericht('Daar kan ik niet heen. Kijk naar de stippen.')
    }
    sfx.zet()
    setBord(applyMove(bord, plek, veld))
    // Waar het vandaan kwam blijft zichtbaar: zo zie je de L achteraf.
    setVorige([plek, veld])
    setBericht(ZINNEN[Math.min(sprongen, ZINNEN.length - 1)])
    setSprongen((n) => n + 1)
  }

  return (
    <div className="stack" style={{ gap: 10 }}>
      <p className={styles.heldPip} aria-live="polite">
        <span aria-hidden="true" className={`${styles.heldPipGezicht} ${styles.pip}`} key={`pip-${sprongen}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- statische export, SVG */}
          <img src={pipLos(sprongen > 0 ? 'juicht' : 'moedigt')} alt="" width={64} height={64} />
        </span>
        {/* Eigen voorvoegsels: met kale getallen kregen gezicht en ballon na een tik dezelfde
            sleutel, en bleef het oude gezicht naast het nieuwe staan (wow-meting). */}
        <span className={styles.heldBallon} key={`ballon-${tikken}`}>{bericht}</span>
      </p>
      <Board
        position={bord}
        marks={{ targets: doelen, last: vorige }}
        onSquare={tik}
        shake={schud}
        // Het paard is Pip, net als in de eerste les: wat de ouder hier ziet, ziet het kind straks.
        pipAlsPaard
        label="Probeer het zelf: tik waar het paard heen mag"
      />
      {/* Secundair, niet nog een oranje hoofdknop naast "Probeer de eerste les": twee
          gelijke knoppen naar dezelfde les deden een ouder twijfelen (36e review). */}
      {sprongen >= 3 && (
        <div ref={uitnodiging} className={styles.uitnodiging}>
          <span aria-hidden="true" className={styles.sterren}>{[0, 1, 2].map((i) => <Icoon key={i} naam="ster-vol" maat={36} />)}</span>
          <Link href={`/les/${eersteLes}/`} className="btn" onClick={() => tel('Held naar les')}>
            <span aria-hidden="true">▶︎</span> Leer het met Pip, stap voor stap
          </Link>
        </div>
      )}
    </div>
  )
}
