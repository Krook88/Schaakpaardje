'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './Board.module.css'
import { GLYPH } from './pieces'
import {
  FILES,
  PIECE_NAME,
  isLightSquare,
  parseBoard,
  square as toSquare,
  type BoardMap,
  type Square,
} from '@/engine/board'

export type BoardMarks = {
  /** Velden waar je heen kunt: stip op leeg veld, ring om een stuk. */
  targets?: Square[]
  /** Aangewezen door de hint van Pip. */
  glow?: Square[]
  /** Doelveld van een opdracht ("kom hier"). */
  goals?: Square[]
  /** Aangetikte velden die goed waren. */
  good?: Square[]
  /** Aangetikte velden die fout waren. */
  bad?: Square[]
  /** Laatste zet, blijft even staan. */
  last?: [Square, Square]
}

type Props = {
  /** FEN (volledig of alleen de stukken) of een kant-en-klare bordmap. */
  position: string | BoardMap
  orientation?: 'w' | 'b'
  selected?: Square | null
  marks?: BoardMarks
  /** Wordt aangeroepen bij elke tik. Geef false terug om te laten schudden. */
  onSquare?: (sq: Square) => void
  disabled?: boolean
  /** Coördinaten a-h en 1-8 eromheen. Uit voor de jongste kinderen. */
  showCoordinates?: boolean
  /** Veld dat net fout was; schudt één keer. */
  shake?: Square | null
  label?: string
}

export function Board({
  position,
  orientation = 'w',
  selected = null,
  marks = {},
  onSquare,
  disabled = false,
  showCoordinates = false,
  shake = null,
  label = 'Schaakbord',
}: Props) {
  const board: BoardMap = useMemo(
    () => (typeof position === 'string' ? parseBoard(position) : position),
    [position],
  )

  const [shaking, setShaking] = useState<Square | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!shake) return
    setShaking(shake)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setShaking(null), 420)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [shake])

  const ranks = orientation === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8]
  const files = orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0]

  const has = (list: Square[] | undefined, sq: Square) => Boolean(list?.includes(sq))

  return (
    <div className={styles.wrap}>
      <div className={styles.frame} role="group" aria-label={label}>
        <div className={styles.grid}>
          {ranks.map((rank) =>
            files.map((file) => {
              const sq = toSquare(file, rank)
              const piece = board[sq]
              const light = isLightSquare(sq)
              const isTarget = has(marks.targets, sq)
              const classes = [styles.square]
              if (!light) classes.push(styles.dark)
              if (selected === sq) classes.push(styles.selected)
              if (has(marks.glow, sq)) classes.push(styles.glow)
              if (has(marks.goals, sq)) classes.push(styles.goal)
              if (marks.last?.includes(sq)) classes.push(styles.last)
              if (shaking === sq) classes.push(styles.wrong)

              const naam = piece
                ? `${piece.color === 'w' ? 'witte' : 'zwarte'} ${PIECE_NAME[piece.type]}`
                : 'leeg'

              return (
                <button
                  key={sq}
                  type="button"
                  className={classes.join(' ')}
                  onClick={() => onSquare?.(sq)}
                  disabled={disabled || !onSquare}
                  aria-label={`${sq}, ${naam}${isTarget ? ', hier kun je heen' : ''}`}
                  aria-pressed={selected === sq}
                  data-square={sq}
                >
                  {piece && (
                    <span
                      className={`${styles.piece} ${piece.color === 'w' ? styles.white : styles.black}`}
                      aria-hidden="true"
                    >
                      {GLYPH[piece.type]}
                    </span>
                  )}
                  {isTarget && !piece && <span className={styles.dot} aria-hidden="true" />}
                  {isTarget && piece && <span className={styles.ring} aria-hidden="true" />}
                  {has(marks.good, sq) && (
                    <span className={styles.tick} aria-hidden="true">
                      ✅
                    </span>
                  )}
                  {has(marks.bad, sq) && (
                    <span className={styles.cross} aria-hidden="true">
                      🚫
                    </span>
                  )}
                </button>
              )
            }),
          )}
        </div>
      </div>

      {showCoordinates && (
        <div className={styles.coords} aria-hidden="true">
          {files.map((f) => (
            <span key={f} className={styles.coord}>
              {FILES[f]}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
