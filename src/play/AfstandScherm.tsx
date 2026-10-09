'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Board, type BoardMarks } from '@/board/Board'
import { Kop } from '@/ui/Kop'
import { Pip, type PipStemming } from '@/ui/Pip'
import { Rekenslot } from '@/ui/Rekenslot'
import { sfx } from '@/audio/sfx'
import {
  AFSTAND_BEGIN,
  AFSTAND_GEWONNEN,
  AFSTAND_JIJ_ZWART,
  AFSTAND_VRIENDJE_WINT,
  AFSTAND_JOUW_BEURT,
  AFSTAND_KAPOT,
  AFSTAND_VERSTUREN,
  PARTIJ_REMISE,
  SCHAAK_TEGEN_JOU,
  SCHAAK_VAN_JOU,
} from '@/content/voice'
import { kies } from '@/audio/voice'
import { type Square } from '@/engine/board'
import { Game } from '@/engine/game'
import { AVATARS, useInstellingen, useProfiel, useProfielStore, useToestandGeladen } from '@/progress/store'
import { codeer, leesIn, zetCode, type AfstandPartij } from './afstand'

/** Welke afgelopen partijen dit apparaat al heeft meegeteld, zodat er niets dubbel telt. */
const GETELD = 'schaakmaatje-afstand-geteld'
/** Per kind: twee broertjes op één tablet tellen elk hun eigen partij. */
function alGeteld(profielId: string, code: string): boolean {
  try {
    return (JSON.parse(localStorage.getItem(GETELD) ?? '[]') as string[]).includes(`${profielId}:${code}`)
  } catch {
    return false
  }
}
function markeerGeteld(profielId: string, code: string) {
  try {
    const lijst = JSON.parse(localStorage.getItem(GETELD) ?? '[]') as string[]
    localStorage.setItem(GETELD, JSON.stringify([...lijst.slice(-49), `${profielId}:${code}`]))
  } catch {
    /* geen opslag: dan telt hij hooguit nog eens */
  }
}

/**
 * Welke links dit apparaat zelf gemaakt heeft. Wie na zijn zet ververst of zijn eigen
 * verstuurde link nog eens opent, kreeg anders het bord van de ander en kon diens zet
 * doen, met Pip die zei "Je vriendje heeft gezet". Achtste schaakreview, punt 1.
 */
const EIGEN = 'schaakmaatje-afstand-eigen'
function isEigen(code: string): boolean {
  try {
    return (JSON.parse(localStorage.getItem(EIGEN) ?? '[]') as string[]).includes(code)
  } catch {
    return false
  }
}
function markeerEigen(code: string) {
  try {
    const lijst = JSON.parse(localStorage.getItem(EIGEN) ?? '[]') as string[]
    localStorage.setItem(EIGEN, JSON.stringify([...lijst.slice(-99), code]))
  } catch {
    /* geen opslag: dan hooguit het oude gedrag */
  }
}

/**
 * Schaken op afstand, één zet per keer.
 *
 * Het kind doet een zet, daarna zit het bord op slot tot de zet verstuurd is. Versturen
 * gaat achter het rekenslot: de app stuurt zelf niets, een ouder deelt de link. Wie de
 * link opent, speelt de kant die aan zet is.
 */
export function AfstandScherm() {
  const geladen = useToestandGeladen()
  const profiel = useProfiel()
  const instellingen = useInstellingen()
  const bewaarPartij = useProfielStore((s) => s.bewaarPartij)
  const bewaarOefendag = useProfielStore((s) => s.bewaarOefendag)
  const mijnPlaatje = profiel?.avatar ?? AVATARS[0]

  const gameRef = useRef(new Game())
  const [partij, setPartij] = useState<AfstandPartij | null>(null)
  const [fen, setFen] = useState(gameRef.current.fen)
  const [kapot, setKapot] = useState(false)
  const [geselecteerd, setGeselecteerd] = useState<Square | null>(null)
  const [laatsteZet, setLaatsteZet] = useState<[Square, Square] | null>(null)
  /** Mijn zet staat klaar en wacht op versturen. Dan zit het bord op slot. */
  const [gezet, setGezet] = useState(false)
  const [kantInBeeld, setKantInBeeld] = useState<'w' | 'b'>('w')
  const [zin, setZin] = useState(AFSTAND_BEGIN)
  const [stemming, setStemming] = useState<PipStemming>('blij')
  const [slot, setSlot] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  /** De partij van voor mijn zet, om hem terug te kunnen nemen. */
  const [vorige, setVorige] = useState<AfstandPartij | null>(null)

  /** De link uit de adresbalk inlezen: bij openen, en als hij verandert. */
  const leesLink = useCallback(() => {
    const code = window.location.hash.slice(1)
    setGezet(false)
    setSlot(false)
    setLink(null)
    setGeselecteerd(null)
    if (!code) {
      gameRef.current = new Game()
      setPartij({ zetten: [], wit: mijnPlaatje, zwart: null })
      setKantInBeeld('w')
      setLaatsteZet(null)
      setZin(AFSTAND_BEGIN)
      setKapot(false)
    } else {
      const gelezen = leesIn(code)
      if (!gelezen) {
        setPartij(null)
        setKapot(true)
        setZin(AFSTAND_KAPOT)
        setStemming('moedigt')
        return
      }
      gameRef.current = gelezen.game
      setPartij(gelezen.partij)
      setVorige(null)
      const eigen = isEigen(code)
      // Mijn eigen link: het bord blijft op slot en staat naar mijn kant.
      setKantInBeeld(eigen ? (gelezen.game.turn === 'w' ? 'b' : 'w') : gelezen.game.turn)
      const laatste = gelezen.partij.zetten.at(-1)
      setLaatsteZet(laatste ? [laatste.slice(0, 2) as Square, laatste.slice(2, 4) as Square] : null)
      setKapot(false)
      const status = gelezen.game.status()
      if (eigen) {
        setGezet(true)
        setZin(status.over && status.reason === 'mat' ? AFSTAND_GEWONNEN : status.over ? PARTIJ_REMISE[0] : AFSTAND_VERSTUREN)
        setStemming('trots')
      } else if (status.over) {
        // Een afgelopen partij: wie de link opent, deed de laatste zet niet. Bij mat is
        // dat de verliezer; tel hem één keer mee.
        if (profiel && !alGeteld(profiel.id, code)) {
          bewaarPartij(status.reason === 'mat' ? 'verloren' : 'remise')
          markeerGeteld(profiel.id, code)
        }
        setZin(status.reason === 'mat' ? AFSTAND_VRIENDJE_WINT : PARTIJ_REMISE[0])
      } else if (!status.over && status.check) {
        // Wie schaak staat en het niet hoort, ziet alleen dat de stukken niet willen.
        setZin(kies(SCHAAK_TEGEN_JOU, 'schaak'))
        setStemming('verrast')
      } else {
        setZin(
          gelezen.partij.zetten.length === 1
            ? AFSTAND_JIJ_ZWART
            : gelezen.partij.zetten.length
              ? AFSTAND_JOUW_BEURT
              : AFSTAND_BEGIN,
        )
        setStemming('blij')
      }
    }
    setFen(gameRef.current.fen)
  }, [bewaarPartij, mijnPlaatje, profiel])

  useEffect(() => {
    if (!geladen) return
    leesLink()
    window.addEventListener('hashchange', leesLink)
    return () => window.removeEventListener('hashchange', leesLink)
  }, [geladen, leesLink])

  const status = useMemo(() => gameRef.current.status(), [fen])
  const aanZet = gameRef.current.turn

  const opVeld = useCallback(
    (veld: Square) => {
      if (!partij || gezet || status.over || kapot) return
      const game = gameRef.current
      if (geselecteerd && geselecteerd !== veld && game.destinations(geselecteerd).includes(veld)) {
        const kant = game.turn
        const gedaan = game.move(geselecteerd, veld)
        if (!gedaan) return
        if (instellingen.effecten) (gedaan.isCapture ? sfx.slaan : sfx.zet)()
        if (gedaan.promotion && instellingen.effecten) sfx.promotie()
        // Zwart krijgt zijn plaatje bij zijn eerste zet. Hetzelfde plaatje als wit kan
        // niet: dan weet niemand meer wie wie is.
        const zwart =
          partij.zwart ?? (kant === 'b' ? (mijnPlaatje !== partij.wit ? mijnPlaatje : AVATARS.find((a) => a !== partij.wit)!) : null)
        const nieuw: AfstandPartij = {
          ...partij,
          zwart,
          zetten: [...partij.zetten, zetCode(geselecteerd, veld, gedaan.promotion)],
        }
        const code = codeer(nieuw)
        // De adresbalk bijwerken zonder te herladen: zo is de zet niet weg als de
        // pagina ververst wordt. `replaceState` geeft geen hashchange.
        history.replaceState(null, '', `#${code}`)
        markeerEigen(code)
        setVorige(partij)
        setPartij(nieuw)
        setLaatsteZet([geselecteerd, veld])
        setGeselecteerd(null)
        setFen(game.fen)
        setGezet(true)
        bewaarOefendag()
        const na = game.status()
        if (na.over) {
          if (profiel && !alGeteld(profiel.id, code)) {
            bewaarPartij(na.reason === 'mat' ? 'gewonnen' : 'remise')
            markeerGeteld(profiel.id, code)
          }
          setZin(na.reason === 'mat' ? AFSTAND_GEWONNEN : PARTIJ_REMISE[0])
          setStemming('trots')
        } else {
          // Eén ingesproken zin per keer; de knop "Zet versturen" staat er toch al.
          setZin(na.check ? kies(SCHAAK_VAN_JOU, 'schaak') : AFSTAND_VERSTUREN)
          setStemming('trots')
        }
        return
      }
      if (game.destinations(veld).length) {
        setGeselecteerd(veld)
        if (instellingen.effecten) sfx.tik()
      } else setGeselecteerd(null)
    },
    [partij, gezet, status.over, kapot, geselecteerd, instellingen.effecten, mijnPlaatje, bewaarOefendag, bewaarPartij, profiel],
  )

  const neemTerug = () => {
    if (!vorige || !gezet) return
    gameRef.current.undo()
    history.replaceState(null, '', vorige.zetten.length ? `#${codeer(vorige)}` : location.pathname)
    setPartij(vorige)
    setVorige(null)
    setFen(gameRef.current.fen)
    setGezet(false)
    setLaatsteZet(null)
    setSlot(false)
    setLink(null)
  }

  const verstuur = async () => {
    if (!partij) return
    const url = `${location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/spelen/afstand/#${codeer(partij)}`
    setLink(url)
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Schaakmaatje', text: 'Jouw beurt! ♟️', url })
        return
      }
      await navigator.clipboard?.writeText(url)
    } catch {
      /* geannuleerd of geen klembord: de link staat hieronder om over te nemen */
    }
  }

  const marks: BoardMarks = useMemo(() => {
    const m: BoardMarks = { last: laatsteZet ?? undefined }
    if (geselecteerd) m.targets = gameRef.current.destinations(geselecteerd)
    return m
  }, [geselecteerd, laatsteZet, fen])

  if (!geladen || !partij) {
    return (
      <main className="page">
        <Kop titel="📨 Op afstand" terug="/spelen/" />
        <div className="stack">
          <Pip zegt={zin} stemming={stemming} klein />
          {kapot && (
            <Link href="/spelen/afstand/" className="btn btn--primary btn--big">
              Een nieuwe partij beginnen
            </Link>
          )}
        </div>
      </main>
    )
  }

  // Zwart heeft pas een plaatje na zijn eerste zet. Daarvoor: wie de link open heeft en
  // zwart gaat spelen, ziet zijn eigen plaatje; wit ziet "je vriendje".
  const zwartPlaatje = partij.zwart ?? (aanZet === 'b' && !gezet ? (mijnPlaatje !== partij.wit ? mijnPlaatje : AVATARS.find((a) => a !== partij.wit)!) : null)
  const plaatje = (kleur: 'w' | 'b') => (kleur === 'w' ? partij.wit : (zwartPlaatje ?? 'je vriendje'))

  return (
    <main className="page">
      <Kop titel="📨 Op afstand" terug="/spelen/" />
      <div className="stack">
        <Pip zegt={zin} stemming={stemming} klein />

        <div style={{ maxWidth: 'min(100%, 70vh, 620px)', margin: '0 auto', width: '100%' }}>
          <Board
            position={fen}
            orientation={kantInBeeld}
            selected={geselecteerd}
            marks={marks}
            onSquare={opVeld}
            disabled={gezet || status.over}
            showCoordinates={instellingen.coordinaten}
            label="Partij op afstand"
          />
        </div>

        <p className="muted" aria-live="polite" style={{ margin: 0 }}>
          {status.over
            ? status.reason === 'mat'
              ? `🏆 ${plaatje(aanZet === 'w' ? 'b' : 'w')} wint!`
              : 'Gelijkspel'
            : gezet
              ? `Je zet staat klaar. Daarna is ${plaatje(aanZet)} aan de beurt.`
              : `${plaatje(aanZet)} is aan zet (${aanZet === 'w' ? 'wit' : 'zwart'}) · zet ${Math.floor(partij.zetten.length / 2) + 1}`}
        </p>

        {gezet && !slot && (
          <div className="row" style={{ justifyContent: 'center' }}>
            <button type="button" className="btn btn--primary btn--big" onClick={() => setSlot(true)}>
              📨 Zet versturen
            </button>
            {/* Na een uitslag geen andere zet meer: dan kon een overwinning blijven staan
                of dubbel tellen. */}
            {vorige && !status.over && (
              <button type="button" className="btn" onClick={neemTerug}>
                ↩︎ Andere zet
              </button>
            )}
          </div>
        )}

        {gezet && slot && !link && (
          <Rekenslot
            titel="Zet versturen"
            uitleg="De zet gaat als link naar het vriendje, bijvoorbeeld via WhatsApp. In de link staan alleen de zetten en twee plaatjes, geen naam."
            onOpen={() => void verstuur()}
          />
        )}

        {link && (
          <div className="card stack">
            <p style={{ margin: 0 }}>
              Gedeeld of gekopieerd. Lukte dat niet? Kopieer dan deze link en stuur hem zelf:
            </p>
            <input
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Link met de zet"
              style={{ font: 'inherit', padding: '12px 14px', borderRadius: 12, border: '2px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', width: '100%' }}
            />
            <button type="button" className="btn" onClick={() => void verstuur()}>
              Nog een keer delen
            </button>
          </div>
        )}

        <p className="muted" style={{ fontSize: '0.88rem' }}>
          Zo werkt het: na elke zet stuurt een ouder de link naar het vriendje. Het vriendje
          opent hem, zet terug en stuurt hem weer terug. Er gaat niets via onze site.
        </p>
      </div>
    </main>
  )
}
