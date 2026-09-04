/**
 * De lesmotor. Bewust zonder React: alle regels van een opgave staan hier, en zijn
 * daardoor te testen zonder een browser. Het lesscherm doet niets anders dan deze
 * toestand tekenen en tikken doorgeven.
 */
import {
  applyMove,
  parseBoard,
  pieceMoves,
  type BoardMap,
  type Square,
} from '@/engine/board'
import { korstePad, slaAllesOp } from '@/engine/puzzels'
import type { Exercise } from '@/content/types'

export type OpgaveStand = {
  opgave: Exercise
  board: BoardMap
  /** Velden die het kind goed heeft aangetikt. */
  gevonden: Square[]
  /** Velden die het kind fout heeft aangetikt (blijven kort staan). */
  misser: Square | null
  geselecteerd: Square | null
  /** Waar staat het stuk waarmee we bezig zijn (verandert bij reach/captureAll). */
  actiefStuk: Square | null
  zetten: number
  fouten: number
  hints: number
  klaar: boolean
  laatsteZet: [Square, Square] | null
}

export type TikUitkomst =
  | 'genegeerd'
  | 'geselecteerd'
  | 'goed'
  | 'fout'
  | 'zet'
  | 'sla'
  | 'klaar'
  | 'opnieuw'

/** De velden die bij deze opgave aangetikt moeten worden (voor de tik-opgaven). */
export function doelVelden(opgave: Exercise): Square[] {
  if (opgave.kind === 'tapSquares') return opgave.correct
  if (opgave.kind === 'tapMoves') {
    const board = parseBoard(opgave.fen)
    return pieceMoves(board, opgave.from, { ignoreOwnPieces: opgave.negeerEigen }).all
  }
  return []
}

export function startOpgave(opgave: Exercise): OpgaveStand {
  const board = opgave.kind === 'quiz' ? {} : parseBoard(opgave.fen)
  const actiefStuk =
    opgave.kind === 'reach' || opgave.kind === 'captureAll'
      ? opgave.from
      : opgave.kind === 'move'
        ? (opgave.from ?? null)
        : null
  return {
    opgave,
    board,
    gevonden: [],
    misser: null,
    geselecteerd: null,
    actiefStuk,
    zetten: 0,
    fouten: 0,
    hints: 0,
    klaar: false,
    laatsteZet: null,
  }
}

function vijandenOver(board: BoardMap, kleur: 'w' | 'b'): number {
  return Object.values(board).filter((p) => p.color !== kleur).length
}

/**
 * Eén tik van het kind. Geeft de nieuwe stand terug plus wat er gebeurde, zodat het
 * scherm het juiste geluid en de juiste zin van Pip kan kiezen.
 */
export function tik(stand: OpgaveStand, veld: Square): { stand: OpgaveStand; uit: TikUitkomst } {
  const o = stand.opgave
  if (stand.klaar || o.kind === 'quiz') return { stand, uit: 'genegeerd' }

  /* ---- tik-opgaven: velden aanwijzen ---- */
  if (o.kind === 'tapSquares' || o.kind === 'tapMoves') {
    const doelen = doelVelden(o)
    if (stand.gevonden.includes(veld)) return { stand, uit: 'genegeerd' }
    if (doelen.includes(veld)) {
      const gevonden = [...stand.gevonden, veld]
      const klaar = gevonden.length === doelen.length
      return {
        stand: { ...stand, gevonden, misser: null, klaar },
        uit: klaar ? 'klaar' : 'goed',
      }
    }
    return {
      stand: { ...stand, misser: veld, fouten: stand.fouten + 1 },
      uit: 'fout',
    }
  }

  /* ---- zet-opgaven: eerst een stuk kiezen, dan een veld ---- */
  const stuk = stand.board[veld]

  if (!stand.geselecteerd) {
    const teKiezen = stand.actiefStuk ?? null
    if (teKiezen && veld !== teKiezen) {
      // Bij reach en captureAll speel je met één vast stuk.
      if (stuk) return { stand: { ...stand, misser: veld, fouten: stand.fouten + 1 }, uit: 'fout' }
      return { stand, uit: 'genegeerd' }
    }
    if (!stuk) return { stand, uit: 'genegeerd' }
    return { stand: { ...stand, geselecteerd: veld, misser: null }, uit: 'geselecteerd' }
  }

  const van = stand.geselecteerd
  if (veld === van) return { stand: { ...stand, geselecteerd: null }, uit: 'genegeerd' }

  const mogelijk = pieceMoves(stand.board, van)
  if (!mogelijk.all.includes(veld)) {
    return { stand: { ...stand, misser: veld, fouten: stand.fouten + 1, geselecteerd: null }, uit: 'fout' }
  }

  const slaat = mogelijk.captures.includes(veld)

  if (o.kind === 'move') {
    if (!o.goed.includes(veld)) {
      return {
        stand: { ...stand, misser: veld, fouten: stand.fouten + 1, geselecteerd: null },
        uit: 'fout',
      }
    }
    const board = applyMove(stand.board, van, veld)
    return {
      stand: {
        ...stand,
        board,
        geselecteerd: null,
        actiefStuk: veld,
        zetten: stand.zetten + 1,
        laatsteZet: [van, veld],
        klaar: true,
      },
      uit: 'klaar',
    }
  }

  if (o.kind === 'reach') {
    const board = applyMove(stand.board, van, veld)
    const zetten = stand.zetten + 1
    const klaar = veld === o.doel
    const teVeel = !klaar && o.maxZetten !== undefined && zetten >= o.maxZetten
    if (teVeel) {
      // Niet "fout", maar gewoon opnieuw beginnen: het kind heeft niets verkeerd gedaan,
      // het lukte alleen niet binnen het aantal zetten.
      return {
        stand: { ...startOpgave(o), fouten: stand.fouten + 1, hints: stand.hints },
        uit: 'opnieuw',
      }
    }
    return {
      stand: {
        ...stand,
        board,
        geselecteerd: null,
        actiefStuk: veld,
        zetten,
        laatsteZet: [van, veld],
        klaar,
      },
      uit: klaar ? 'klaar' : 'zet',
    }
  }

  if (o.kind === 'captureAll') {
    if (o.elkeZetRaak && !slaat) {
      return {
        stand: { ...stand, misser: veld, fouten: stand.fouten + 1, geselecteerd: null },
        uit: 'fout',
      }
    }
    const board = applyMove(stand.board, van, veld)
    const kleur = stand.board[van].color
    const klaar = vijandenOver(board, kleur) === 0
    return {
      stand: {
        ...stand,
        board,
        geselecteerd: null,
        actiefStuk: veld,
        zetten: stand.zetten + 1,
        laatsteZet: [van, veld],
        klaar,
      },
      uit: klaar ? 'klaar' : slaat ? 'sla' : 'zet',
    }
  }

  return { stand, uit: 'genegeerd' }
}

/** Antwoord op een meerkeuzevraag. */
export function antwoordQuiz(stand: OpgaveStand, index: number): { stand: OpgaveStand; goed: boolean } {
  const o = stand.opgave
  if (o.kind !== 'quiz') return { stand, goed: false }
  const goed = Boolean(o.opties[index]?.goed)
  return {
    stand: goed ? { ...stand, klaar: true } : { ...stand, fouten: stand.fouten + 1 },
    goed,
  }
}

/**
 * De hint van Pip: één veld, nooit het hele antwoord. Bij zetopgaven wijst hij het
 * volgende veld van de route aan, bij tik-opgaven een veld dat nog niet gevonden is.
 */
export function hint(stand: OpgaveStand): { stand: OpgaveStand; velden: Square[] } {
  const o = stand.opgave
  const nieuw = { ...stand, hints: stand.hints + 1 }

  if (o.kind === 'tapSquares' || o.kind === 'tapMoves') {
    const rest = doelVelden(o).filter((sq) => !stand.gevonden.includes(sq))
    return { stand: nieuw, velden: rest.slice(0, 1) }
  }
  if (o.kind === 'move') {
    return { stand: nieuw, velden: o.goed.slice(0, 1) }
  }
  if (o.kind === 'reach') {
    const van = stand.actiefStuk ?? o.from
    const pad = korstePad(stand.board, van, o.doel, o.maxZetten ?? 8)
    return { stand: nieuw, velden: pad?.slice(0, 1) ?? [] }
  }
  if (o.kind === 'captureAll') {
    const van = stand.actiefStuk ?? o.from
    const pad = slaAllesOp(stand.board, van, o.elkeZetRaak)
    return { stand: nieuw, velden: pad?.slice(0, 1) ?? [] }
  }
  return { stand: nieuw, velden: [] }
}

/**
 * Sterren voor een hele les. Alleen de toetsfase telt mee — in de oefenfases mag je
 * zoveel fouten maken als je wilt, dat is juist waar ze voor zijn.
 */
export function sterrenVoor(fouten: number, hints: number): 0 | 1 | 2 | 3 {
  if (fouten === 0 && hints === 0) return 3
  if (fouten <= 2 && hints <= 1) return 2
  // Nul sterren bestaat niet: wie de toets uitspeelt heeft iets geleerd, en een lege
  // score voelt voor een kind als straf. Eén ster betekent gewoon: nog een keertje.
  return 1
}
