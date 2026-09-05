/**
 * Contentcontrole. Draait als test én als script (npm run validate:content).
 *
 * Dit is de belangrijkste vangrail van het project: alle lessen zijn data, en een
 * verkeerd overgetypte stelling is precies het soort fout dat je pas ontdekt als een
 * kind vastloopt. Geen enkele opgave komt in main als hij hier niet doorheen komt.
 */
import {
  aanvallersVan,
  bedreigdeStukken,
  parseBoard,
  pieceMoves,
  veiligeVelden,
  PIECE_VALUE,
  type BoardMap,
  type Color,
  type Square,
} from '@/engine/board'
import { Game } from '@/engine/game'
import { goedeZetten } from '@/lesson/runner'
import { geldigVeld, korstePad, slaAllesOp } from '@/engine/puzzels'
import { WERELDEN } from './index'
import type { Exercise, Lesson, World } from './types'

export type Bevinding = { waar: string; probleem: string }

export function controleerOpgave(waar: string, o: Exercise): Bevinding[] {
  const uit: Bevinding[] = []
  const fout = (probleem: string) => uit.push({ waar, probleem })

  if (o.kind !== 'quiz') {
    try {
      parseBoard(o.fen)
    } catch (e) {
      fout(`stelling is ongeldig: ${(e as Error).message}`)
      return uit
    }
  }

  switch (o.kind) {
    case 'tapMoves': {
      const board = parseBoard(o.fen)
      if (!board[o.from]) return [{ waar, probleem: `geen stuk op ${o.from}` }]
      const zetten = pieceMoves(board, o.from, { ignoreOwnPieces: o.negeerEigen })
      if (!zetten.all.length) fout(`het stuk op ${o.from} kan nergens heen`)
      break
    }
    case 'tapSquares': {
      if (!o.correct.length) fout('geen goede velden opgegeven')
      for (const sq of o.correct) if (!geldigVeld(sq)) fout(`onbekend veld ${sq}`)
      if (o.bedoeling) {
        const verwacht = tapAntwoord(parseBoard(o.fen), o.bedoeling)
        const verschil = vergelijk(o.correct, verwacht)
        if (verschil) fout(`het antwoord klopt niet met de stelling: ${verschil}`)
        // Tweede motor erbij halen: zie schaakVolgensRegels.
        if (o.bedoeling.soort === 'schaak' || o.bedoeling.soort === 'geenSchaak') {
          const hoort = o.bedoeling.soort === 'schaak'
          for (const sq of o.correct) {
            const volgensRegels = schaakVolgensRegels(o.fen, sq)
            if (volgensRegels !== null && volgensRegels !== hoort) {
              fout(`chess.js zegt iets anders over ${sq}: schaak=${volgensRegels}`)
            }
          }
        }
      }
      break
    }
    case 'move': {
      const board = parseBoard(o.fen)
      const from: Square | undefined =
        o.from ?? Object.keys(board).find((sq) => board[sq].color === 'w')
      if (!from || !board[from]) return [{ waar, probleem: 'geen stuk om mee te zetten' }]
      const mogelijk = pieceMoves(board, from).all
      if (!o.goed.length) fout('geen goede zet opgegeven')
      for (const doel of o.goed) {
        if (!geldigVeld(doel)) fout(`onbekend veld ${doel}`)
        else if (!mogelijk.includes(doel)) fout(`${from} kan niet naar ${doel}`)
      }
      if (o.bedoeling) {
        const verwacht = zetAntwoord(board, from, o.bedoeling)
        const verschil = vergelijk(o.goed, verwacht)
        if (verschil) fout(`het antwoord klopt niet met de stelling: ${verschil}`)
      }
      break
    }
    case 'reach': {
      const board = parseBoard(o.fen)
      if (!board[o.from]) return [{ waar, probleem: `geen stuk op ${o.from}` }]
      if (!geldigVeld(o.doel)) return [{ waar, probleem: `onbekend doelveld ${o.doel}` }]
      if (o.doel === o.from) fout('doelveld is het startveld')
      const pad = korstePad(board, o.from, o.doel, o.maxZetten ?? 8)
      if (!pad) fout(`${o.from} kan ${o.doel} niet bereiken`)
      else if (o.maxZetten && pad.length > o.maxZetten) {
        fout(`kortste route is ${pad.length} zetten, maar er staat maximaal ${o.maxZetten}`)
      }
      break
    }
    case 'captureAll': {
      const board = parseBoard(o.fen)
      const stuk = board[o.from]
      if (!stuk) return [{ waar, probleem: `geen stuk op ${o.from}` }]
      const vijanden = Object.values(board).filter((p) => p.color !== stuk.color).length
      if (!vijanden) fout('er valt niets te slaan')
      const oplossing = slaAllesOp(board, o.from, o.elkeZetRaak)
      if (!oplossing) fout('deze opgave is niet op te lossen')
      break
    }
    case 'regelZet': {
      let game: Game
      try {
        game = new Game(o.fen)
      } catch (e) {
        return [{ waar, probleem: `chess.js weigert deze stelling: ${(e as Error).message}` }]
      }
      const status = game.status()
      if (status.over) {
        fout(`de partij is hier al afgelopen (${status.reason}), dus er valt niets te zetten`)
        break
      }
      if (o.eis === 'uitSchaak' && !status.check) {
        fout('de eis is uit schaak gaan, maar er staat helemaal geen schaak')
      }
      if (o.eis === 'rokeer' && !game.legalMoves().some((z) => z.san.startsWith('O-O'))) {
        fout('rokeren kan hier helemaal niet')
      }
      if (o.eis !== 'uitSchaak' && status.check) {
        fout('de speler staat zelf schaak; dan gaat de opgave over iets anders')
      }
      const opties = goedeZetten(game, o.eis)
      if (!opties.length) fout(`geen enkele zet voldoet aan de eis '${o.eis}'`)
      if (o.eis === 'geefSchaak' && opties.length === game.legalMoves().length) {
        fout('elke zet geeft schaak; dan valt er niets te zoeken')
      }
      break
    }
    case 'quiz': {
      if (o.opties.length < 2) fout('een quiz heeft minstens twee opties nodig')
      const goede = o.opties.filter((op) => op.goed).length
      if (goede !== 1) fout(`quiz heeft ${goede} goede antwoorden, dat moet er precies één zijn`)
      break
    }
  }
  return uit
}

/** Wat het antwoord op een tik-opgave hoort te zijn, uitgerekend uit de stelling zelf. */
function tapAntwoord(board: BoardMap, bedoeling: NonNullable<Extract<Exercise, { kind: 'tapSquares' }>['bedoeling']>): Square[] {
  const stukken = Object.entries(board)
  switch (bedoeling.soort) {
    case 'stuk':
      return stukken
        .filter(([, p]) => p.type === bedoeling.type && (!bedoeling.kleur || p.color === bedoeling.kleur))
        .map(([sq]) => sq)
    case 'waarde':
      return stukken
        .filter(([, p]) => PIECE_VALUE[p.type] === bedoeling.waarde && (!bedoeling.kleur || p.color === bedoeling.kleur))
        .map(([sq]) => sq)
    case 'bedreigd':
      return bedreigdeStukken(board, bedoeling.kleur)
    case 'buurvelden': {
      const f = 'abcdefgh'.indexOf(bedoeling.van[0])
      const r = Number(bedoeling.van[1])
      const rondom: Square[] = []
      for (const df of [-1, 0, 1]) {
        for (const dr of [-1, 0, 1]) {
          if (!df && !dr) continue
          const nf = f + df
          const nr = r + dr
          if (nf < 0 || nf > 7 || nr < 1 || nr > 8) continue
          rondom.push(`${'abcdefgh'[nf]}${nr}`)
        }
      }
      const filter = bedoeling.filter ?? 'alles'
      return rondom.filter((sq) => {
        const stuk = board[sq]
        if (filter === 'bezet') return Boolean(stuk) && (!bedoeling.kleur || stuk.color === bedoeling.kleur)
        if (filter === 'leeg') return !stuk
        return true
      })
    }
    case 'schaak':
    case 'geenSchaak': {
      const koningen = stukken.filter(([, p]) => p.type === 'k')
      return koningen
        .filter(([sq, p]) => {
          const onderVuur = aanvallersVan(board, sq, p.color === 'w' ? 'b' : 'w').length > 0
          return bedoeling.soort === 'schaak' ? onderVuur : !onderVuur
        })
        .map(([sq]) => sq)
    }
  }
}

/**
 * Kruiscontrole op schaak: dezelfde vraag nog eens, maar dan door chess.js.
 *
 * tapAntwoord rekent meetkundig, en die motor kent geen beurt en geen legaliteit — een
 * stelling waarin beide koningen schaak staan komt er ongehinderd doorheen. Dit is de
 * enige plek in de contentcontrole waar de twee motoren hetzelfde moeten zeggen; zeggen
 * ze iets anders, dan deugt de stelling niet en niet het antwoord.
 */
function schaakVolgensRegels(fen: string, veld: Square): boolean | null {
  const kleur = parseBoard(fen)[veld]?.color
  if (!kleur) return null
  try {
    // De koning die we onderzoeken aan zet zetten: inCheck geldt altijd voor de beurt.
    const game = new Game(`${fen.split(' ')[0]} ${kleur} - - 0 1`)
    return game.inCheck
  } catch {
    // chess.js weigert de stelling (geen twee koningen, pion op de eindrij, ...).
    // Dat is zelf een bevinding, maar niet eentje die deze functie kan melden.
    return null
  }
}

/** Wat de goede zet(ten) horen te zijn, uitgerekend uit de stelling zelf. */
function zetAntwoord(board: BoardMap, from: Square, bedoeling: 'veilig' | 'duurste' | 'aanvaller'): Square[] {
  const kleur: Color = board[from]?.color ?? 'w'
  const vijand: Color = kleur === 'w' ? 'b' : 'w'
  if (bedoeling === 'veilig') return veiligeVelden(board, from)
  if (bedoeling === 'aanvaller') {
    const aanvallers = aanvallersVan(board, from, vijand)
    return aanvallers.filter((sq) => pieceMoves(board, from).captures.includes(sq))
  }
  const slag = pieceMoves(board, from).captures
  if (!slag.length) return []
  const hoogste = Math.max(...slag.map((sq) => PIECE_VALUE[board[sq].type]))
  return slag.filter((sq) => PIECE_VALUE[board[sq].type] === hoogste)
}

/** Beschrijft het verschil tussen twee verzamelingen velden, of niets als ze gelijk zijn. */
function vergelijk(gegeven: Square[], verwacht: Square[]): string | null {
  const a = [...new Set(gegeven)].sort()
  const b = [...new Set(verwacht)].sort()
  if (a.join(' ') === b.join(' ')) return null
  const teveel = a.filter((sq) => !b.includes(sq))
  const tekort = b.filter((sq) => !a.includes(sq))
  const delen = []
  if (teveel.length) delen.push(`hoort er niet bij: ${teveel.join(' ')}`)
  if (tekort.length) delen.push(`ontbreekt: ${tekort.join(' ')}`)
  return delen.join('; ')
}

function controleerLes(les: Lesson, wereld: World): Bevinding[] {
  const uit: Bevinding[] = []
  const waar = `${wereld.naam} / ${les.titel}`
  if (les.wereldId !== wereld.id) uit.push({ waar, probleem: 'les hoort bij een andere wereld' })
  if (!les.vertel.length) uit.push({ waar, probleem: 'Pip vertelt niets in de kijkfase' })
  if (!les.doel.trim()) uit.push({ waar, probleem: 'geen leerdoel voor het ouderscherm' })
  for (const [fase, opgaven] of [
    ['meedoen', les.meedoen],
    ['zelf', les.zelf],
    ['toets', les.toets],
  ] as const) {
    if (!opgaven.length) uit.push({ waar, probleem: `fase '${fase}' heeft geen opgaven` })
    opgaven.forEach((o, i) => {
      uit.push(...controleerOpgave(`${waar} / ${fase} ${i + 1}`, o))
      if (o.kind !== 'quiz' && !('vraag' in o && o.vraag.trim())) {
        uit.push({ waar: `${waar} / ${fase} ${i + 1}`, probleem: 'geen vraag' })
      }
    })
  }
  if (les.vertelFen) {
    try {
      parseBoard(les.vertelFen)
    } catch (e) {
      uit.push({ waar, probleem: `vertelstelling ongeldig: ${(e as Error).message}` })
    }
  }
  for (const sq of les.vertelWijs ?? []) {
    if (!geldigVeld(sq)) uit.push({ waar, probleem: `onbekend veld in vertelWijs: ${sq}` })
  }
  return uit
}

export function controleerContent(): Bevinding[] {
  const uit: Bevinding[] = []
  const lesIds = new Set<string>()
  const wereldIds = new Set<string>()

  for (const wereld of WERELDEN) {
    if (wereldIds.has(wereld.id)) uit.push({ waar: wereld.naam, probleem: 'dubbele wereld-id' })
    wereldIds.add(wereld.id)
    if (!wereld.lessen.length) uit.push({ waar: wereld.naam, probleem: 'wereld zonder lessen' })
    for (const les of wereld.lessen) {
      if (lesIds.has(les.id)) uit.push({ waar: les.titel, probleem: `dubbele les-id ${les.id}` })
      lesIds.add(les.id)
      uit.push(...controleerLes(les, wereld))
    }
  }
  return uit
}

/**
 * Opgaven waarvan het antwoord met de hand is ingetypt.
 *
 * `bedoeling` is optioneel, en dat is met opzet: lang niet elk antwoord volgt uit de
 * stelling. Maar zolang overslaan onzichtbaar is, glipt de volgende fout er net zo
 * makkelijk doorheen als de negen die de contentcontrole bij wereld 0 tot en met 6
 * vond. Dus tellen we ze, en zetten we het getal onder elke controle.
 */
export function nietNagerekend(): string[] {
  const uit: string[] = []
  for (const wereld of WERELDEN) {
    for (const les of wereld.lessen) {
      for (const [fase, lijst] of [
        ['meedoen', les.meedoen],
        ['zelf', les.zelf],
        ['toets', les.toets],
      ] as const) {
        lijst.forEach((o, i) => {
          if ((o.kind === 'tapSquares' || o.kind === 'move') && !o.bedoeling) {
            uit.push(`${les.id}/${fase}[${i}] (${o.kind})`)
          }
        })
      }
    }
  }
  return uit
}

/** Alle zinnen die ingesproken moeten worden. Gebruikt door scripts/tts-render.ts. */
export function alleZinnen(): string[] {
  const zinnen = new Set<string>()
  for (const wereld of WERELDEN) {
    zinnen.add(wereld.belofte)
    for (const les of wereld.lessen) {
      les.vertel.forEach((z) => zinnen.add(z))
      for (const o of [...les.meedoen, ...les.zelf, ...les.toets]) {
        if ('vraag' in o) zinnen.add(o.vraag)
        if ('foutTip' in o && o.foutTip) zinnen.add(o.foutTip)
      }
    }
  }
  return [...zinnen]
}
