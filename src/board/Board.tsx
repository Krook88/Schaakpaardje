'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './Board.module.css'
import { GLYPH } from './pieces'
import {
  FILES,
  fileIndex,
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
  /**
   * Een spoor: velden die één voor één oplichten, in deze volgorde.
   *
   * Voor de uitleg. Pip zegt "een lijn loopt van beneden naar boven" en het bord laat
   * hem intussen omhoog klimmen, veld voor veld. Dat is het verschil tussen een kind
   * dat woorden hoort en een kind dat ziet wat er bedoeld wordt.
   */
  spoor?: Square[]
}

type Props = {
  /** FEN (volledig of alleen de stukken) of een kant-en-klare bordmap. */
  position: string | BoardMap
  orientation?: 'w' | 'b'
  selected?: Square | null
  marks?: BoardMarks
  onSquare?: (sq: Square) => void
  disabled?: boolean
  /** Coördinaten a-h en 1-8 in de randvelden. Uit voor de jongste kinderen. */
  showCoordinates?: boolean
  /** Veld dat net fout was; schudt één keer. */
  shake?: Square | null
  label?: string
}

/** Vinkje en kruisje zijn getekend, niet als emoji: die zien er op elk toestel anders uit. */
function Vinkje() {
  return (
    <svg viewBox="0 0 24 24" className={`${styles.merk} ${styles.merkGoed}`} aria-hidden="true">
      <path
        d="M4 13l5.2 5.2L20 6.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Kruisje() {
  return (
    <svg viewBox="0 0 24 24" className={`${styles.merk} ${styles.merkFout}`} aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Ster() {
  return (
    <svg viewBox="0 0 24 24" className={styles.ster} aria-hidden="true">
      <path
        d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9z"
        fill="currentColor"
      />
    </svg>
  )
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
  /**
   * Eén tabstop voor het hele bord.
   *
   * Elk veld was een losse knop in de tabvolgorde: 64 keer Tab om van het bord bij
   * "Terugnemen" te komen, en na elke zet opnieuw. Dit is het gebruikelijke
   * rasterpatroon — tab erin, pijltjes erbinnen — en het scheelt 63 tabstops zonder
   * dat er iets verdwijnt.
   */
  const [focusVeld, setFocusVeld] = useState<Square | null>(null)
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
  const onderste = ranks[ranks.length - 1]
  const linkse = files[0]

  const has = (list: Square[] | undefined, sq: Square) => Boolean(list?.includes(sq))

  // Waar de tabstop staat: op het geselecteerde veld, anders op waar de focus laatst
  // was, anders linksonder — zodat er altijd precies één is.
  const tabVeld = selected ?? focusVeld ?? toSquare(linkse, onderste)

  const verplaats = (sq: Square, dFile: number, dRank: number): Square | null => {
    const file = fileIndex(sq)
    const rank = Number(sq[1])
    // De pijltjes volgen wat het kind ziet, niet de coördinaten: bij een omgedraaid
    // bord is "naar rechts" de andere kant op.
    const richting = orientation === 'w' ? 1 : -1
    const nf = file + dFile * richting
    const nr = rank + dRank * richting
    if (nf < 0 || nf > 7 || nr < 1 || nr > 8) return null
    return toSquare(nf, nr)
  }

  const opToets = (e: React.KeyboardEvent<HTMLButtonElement>, sq: Square) => {
    const stap: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1],
    }
    const richting = stap[e.key]
    if (!richting) return
    const doel = verplaats(sq, richting[0], richting[1])
    if (!doel) return
    e.preventDefault()
    setFocusVeld(doel)
    const knop = e.currentTarget.parentElement?.querySelector<HTMLButtonElement>(
      `[data-square="${doel}"]`,
    )
    knop?.focus()
  }

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
              const goed = has(marks.good, sq)
              const fout = has(marks.bad, sq)

              const classes = [styles.square]
              if (!light) classes.push(styles.dark)
              if (goed) classes.push(styles.goedVeld)
              if (fout) classes.push(styles.foutVeld)
              if (selected === sq) classes.push(styles.selected)
              if (has(marks.glow, sq)) classes.push(styles.glow)
              const stap = marks.spoor?.indexOf(sq) ?? -1
              if (stap >= 0) classes.push(styles.spoor)
              if (marks.last?.includes(sq)) classes.push(styles.last)
              if (shaking === sq) classes.push(styles.wrong)

              const naam = piece
                ? `${piece.color === 'w' ? 'witte' : 'zwarte'} ${PIECE_NAME[piece.type]}`
                : 'leeg'
              const kleurKlasse = light ? styles.opLicht : styles.opDonker

              return (
                <button
                  key={sq}
                  type="button"
                  className={classes.join(' ')}
                  onClick={() => {
                    setFocusVeld(sq)
                    onSquare?.(sq)
                  }}
                  onKeyDown={(e) => opToets(e, sq)}
                  onFocus={() => setFocusVeld(sq)}
                  tabIndex={sq === tabVeld ? 0 : -1}
                  disabled={disabled || !onSquare}
                  aria-label={`${sq}, ${naam}${isTarget ? ', hier kun je heen' : ''}`}
                  aria-pressed={selected === sq}
                  data-square={sq}
                  style={stap >= 0 ? ({ '--stap': stap } as React.CSSProperties) : undefined}
                >
                  {has(marks.goals, sq) && <Ster />}
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
                  {goed && <Vinkje />}
                  {fout && <Kruisje />}
                  {showCoordinates && rank === onderste && (
                    <span className={`${styles.coordLijn} ${kleurKlasse}`} aria-hidden="true">
                      {FILES[file]}
                    </span>
                  )}
                  {showCoordinates && file === linkse && (
                    <span className={`${styles.coordRij} ${kleurKlasse}`} aria-hidden="true">
                      {rank}
                    </span>
                  )}
                </button>
              )
            }),
          )}
        </div>
      </div>
    </div>
  )
}
