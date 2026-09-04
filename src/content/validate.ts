/**
 * Contentcontrole. Draait als test én als script (npm run validate:content).
 *
 * Dit is de belangrijkste vangrail van het project: alle lessen zijn data, en een
 * verkeerd overgetypte stelling is precies het soort fout dat je pas ontdekt als een
 * kind vastloopt. Geen enkele opgave komt in main als hij hier niet doorheen komt.
 */
import { parseBoard, pieceMoves, type Square } from '@/engine/board'
import { Game } from '@/engine/game'
import { goedeZetten } from '@/lesson/runner'
import { geldigVeld, korstePad, slaAllesOp } from '@/engine/puzzels'
import { WERELDEN } from './index'
import type { Exercise, Lesson, World } from './types'

export type Bevinding = { waar: string; probleem: string }

function controleerOpgave(waar: string, o: Exercise): Bevinding[] {
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
