'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Board } from '@/board/Board'
import { applyMove, parseBoard, pieceMoves, type Square } from '@/engine/board'
import { sfx } from '@/audio/sfx'
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
const BEGIN = '8/8/8/8/3N4/8/8/8'
const ZINNEN = ['Hop! Dat is een L.', 'Nog een L! Twee recht, één opzij.', 'Jij kunt het al!']

export function HeldSpel({ eersteLes }: { eersteLes: string }) {
  const [bord, setBord] = useState(() => parseBoard(BEGIN))
  const [sprongen, setSprongen] = useState(0)
  const [bericht, setBericht] = useState('Tik op een stip: daar mag ik heen!')
  const [schud, setSchud] = useState<Square | null>(null)
  const plek = useMemo(() => (Object.keys(bord) as Square[]).find((v) => bord[v]) ?? ('d4' as Square), [bord])
  const doelen = useMemo(() => pieceMoves(bord, plek).all, [bord, plek])

  const tik = (veld: Square) => {
    if (veld === plek) return setBericht('Dat ben ik! Tik op een stip.')
    if (!doelen.includes(veld)) {
      sfx.fout()
      setSchud(veld)
      setTimeout(() => setSchud(null), 450)
      return setBericht('Daar kan ik niet heen. Kijk naar de stippen.')
    }
    sfx.zet()
    setBord(applyMove(bord, plek, veld))
    setBericht(ZINNEN[Math.min(sprongen, ZINNEN.length - 1)])
    setSprongen((n) => n + 1)
  }

  return (
    <div className="stack" style={{ gap: 10 }}>
      <p className={styles.heldPip} aria-live="polite">
        <span aria-hidden="true" className={`${styles.heldPipGezicht} ${styles.pip}`} key={sprongen}>
          🐴
        </span>
        <span className={styles.heldBallon}>{bericht}</span>
      </p>
      <Board
        position={bord}
        marks={{ targets: doelen, last: undefined }}
        onSquare={tik}
        shake={schud}
        showCoordinates
        label="Probeer het zelf: tik waar het paard heen mag"
      />
      {sprongen >= 3 && (
        <Link href={`/les/${eersteLes}/`} className="btn btn--primary" style={{ alignSelf: 'center' }}>
          <span aria-hidden="true">▶︎</span> Leer het met Pip, stap voor stap
        </Link>
      )}
    </div>
  )
}
