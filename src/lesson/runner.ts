/**
 * De lesmotor. Bewust zonder React: alle regels van een opgave staan hier, en zijn
 * daardoor te testen zonder een browser. Het lesscherm doet niets anders dan deze
 * toestand tekenen en tikken doorgeven.
 */
import {
  applyMove,
  parseBoard,
  pieceMoves,
  PIECE_VALUE,
  type BoardMap,
  type Square,
} from '@/engine/board'
import { korstePad, slaAllesOp } from '@/engine/puzzels'
import { Game } from '@/engine/game'
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
  /** Alleen bij 'regelZet': de partij met alle echte schaakregels erin. */
  game?: Game
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
  const game = opgave.kind === 'regelZet' ? new Game(opgave.fen) : undefined
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
    game,
  }
}

/**
 * De velden waar het aangetikte stuk heen mag. Bij de gewone opgaven is dat meetkundig,
 * bij een regelZet vraagt hij het aan chess.js — die weet ook dat je je koning niet in
 * schaak mag laten staan.
 */
export function mogelijkeVelden(stand: OpgaveStand, veld: Square): Square[] {
  if (stand.opgave.kind === 'regelZet') return stand.game?.destinations(veld) ?? []
  return pieceMoves(stand.board, veld).all
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

  /* ---- zet volgens de echte regels ---- */
  if (o.kind === 'regelZet') return tikRegelZet(stand, veld, o)

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

  // Een ander eigen stuk aantikken is van gedachten veranderen, geen fout. Een kind dat
  // de toren pakt, zich bedenkt en de koning aantikt, deed precies wat de les vraagt —
  // dat mag geen ster kosten. Blijkt de nieuwe keuze verkeerd, dan merkt het kind dat
  // vanzelf bij de zet zelf.
  //
  // Bij 'reach' en 'captureAll' kan dat niet: daar hoort de hele opgave bij één stuk,
  // en met een ander stuk zetten zou de puzzel stukmaken.
  const eigenKleur = stand.board[van]?.color
  if (o.kind === 'move' && stuk && stuk.color === eigenKleur) {
    return { stand: { ...stand, geselecteerd: veld, misser: null }, uit: 'geselecteerd' }
  }

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

/**
 * Eén tik in een regelZet-opgave. Wat "goed" is, hangt af van wat de zet bereikt,
 * niet van welk veld het is: uit schaak gaan mag op drie manieren.
 */
function tikRegelZet(
  stand: OpgaveStand,
  veld: Square,
  o: Extract<Exercise, { kind: 'regelZet' }>,
): { stand: OpgaveStand; uit: TikUitkomst } {
  const game = stand.game
  if (!game) return { stand, uit: 'genegeerd' }

  if (!stand.geselecteerd) {
    const stuk = stand.board[veld]
    if (!stuk || stuk.color !== game.turn) return { stand, uit: 'genegeerd' }
    if (!game.destinations(veld).length) {
      // Dit stuk kan geen enkele legale zet doen — meestal omdat de koning schaak staat.
      return { stand: { ...stand, misser: veld, fouten: stand.fouten + 1 }, uit: 'fout' }
    }
    return { stand: { ...stand, geselecteerd: veld, misser: null }, uit: 'geselecteerd' }
  }

  const van = stand.geselecteerd
  if (veld === van) return { stand: { ...stand, geselecteerd: null }, uit: 'genegeerd' }

  // Ook hier: een ander eigen stuk kiezen is geen fout maar een andere gedachte.
  const ander = stand.board[veld]
  if (ander && ander.color === game.turn) {
    return { stand: { ...stand, geselecteerd: veld, misser: null }, uit: 'geselecteerd' }
  }

  const proef = game.clone()
  const gedaan = proef.move(van, veld)
  if (!gedaan) {
    // chess.js weigert alles wat niet mag. Precies daar zit de les: een zet die je
    // koning schaak laat staan, bestaat niet.
    return {
      stand: { ...stand, misser: veld, fouten: stand.fouten + 1, geselecteerd: null },
      uit: 'fout',
    }
  }

  const status = proef.status()
  const gelukt =
    o.eis === 'uitSchaak'
      ? true // elke legale zet haalt je koning uit schaak; dat is precies het punt
      : o.eis === 'rokeer'
        ? gedaan.san.startsWith('O-O')
        : o.eis === 'geefSchaak'
          ? gedaan.isCheck || (status.over && status.reason === 'mat')
          : status.over && status.reason === 'mat'

  if (!gelukt) {
    return {
      stand: { ...stand, misser: veld, fouten: stand.fouten + 1, geselecteerd: null },
      uit: 'fout',
    }
  }

  return {
    stand: {
      ...stand,
      game: proef,
      board: parseBoard(proef.fen),
      geselecteerd: null,
      zetten: stand.zetten + 1,
      laatsteZet: [van, veld],
      klaar: true,
    },
    uit: 'klaar',
  }
}

/** Alle zetten die aan de eis voldoen. Ook gebruikt door de contentcontrole. */
export function goedeZetten(
  game: Game,
  eis: 'geefSchaak' | 'uitSchaak' | 'matIn1' | 'rokeer' | 'enPassant',
) {
  const alle = game.legalMoves().filter((zet) => {
    if (eis === 'uitSchaak') return true
    if (eis === 'rokeer') return zet.san.startsWith('O-O')
    if (eis === 'enPassant') return zet.isEnPassant
    const na = game.clone()
    na.move(zet.from, zet.to)
    const status = na.status()
    const mat = status.over && status.reason === 'mat'
    return eis === 'matIn1' ? mat : zet.isCheck || mat
  })

  // Schaak geven met een stuk dat daarna gratis van het bord gaat, is geen goed
  // schaak. Twee werelden eerder is "kijk of hij kan terugslaan" juist de hele les,
  // dus zo'n zet mogen we hier niet met een sterretje belonen.
  // Blijft er niets over — dan bestaat er in deze stelling geen veilig schaak — dan
  // keuren we ze alsnog allemaal goed: het kind mag nooit vastlopen op een opgave
  // waarin geen goed antwoord bestaat.
  if (eis !== 'geefSchaak') return alle
  const veilig = alle.filter((zet) => materieelSaldo(game, zet) >= 0)
  return veilig.length ? veilig : alle
}

/**
 * Wat kost deze zet, als beide kanten daarna één keer het slaan afmaken?
 * Een miniatuur-ruilrekening: wat we pakken, min wat we kwijtraken, plus wat we
 * terugpakken. Genoeg om "dame weggeven" van "toren winnen" te onderscheiden.
 */
function materieelSaldo(game: Game, zet: { from: Square; to: Square }): number {
  const na = game.clone()
  const gedaan = na.move(zet.from, zet.to)
  if (!gedaan) return 0
  const gepakt = gedaan.captured ? PIECE_VALUE[gedaan.captured] : 0
  const onsStuk = PIECE_VALUE[gedaan.promotion ?? parseBoard(game.fen)[zet.from].type]

  const terugslagen = na.legalMoves().filter((z) => z.to === zet.to)
  if (!terugslagen.length) return gepakt

  let slechtste = Infinity
  for (const slag of terugslagen) {
    const naSlag = na.clone()
    const slagStuk = PIECE_VALUE[parseBoard(na.fen)[slag.from].type]
    naSlag.move(slag.from, slag.to)
    const heroveren = naSlag.legalMoves().some((z) => z.to === zet.to)
    slechtste = Math.min(slechtste, gepakt - onsStuk + (heroveren ? slagStuk : 0))
  }
  return slechtste
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
    // Het stuk aanwijzen, niet het doelveld: bij een zetopgave ís dat ene doelveld het
    // hele antwoord, en dan is de hint geen tip meer maar de oplossing.
    const van = o.from ?? Object.keys(stand.board).find((sq) => stand.board[sq].color === 'w')
    return { stand: nieuw, velden: van ? [van] : [] }
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
  if (o.kind === 'regelZet' && stand.game) {
    // Wijs het stuk aan waarmee het kan, niet het veld: dan blijft er iets te denken over.
    const zet = goedeZetten(stand.game, o.eis)[0]
    return { stand: nieuw, velden: zet ? [zet.from] : [] }
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
