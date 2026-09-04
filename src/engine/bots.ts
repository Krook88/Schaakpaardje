/**
 * De tegenstanders.
 *
 * Bewuste keuze: de laagste niveaus gebruiken géén sterke engine. Stockfish op
 * "skill 0" speelt onmenselijk — hij zet willekeurig iets weg op een manier die geen
 * beginner herkent. Een bot die simpelweg gulzig slaat voelt voor een vijfjarige veel
 * logischer, en scheelt bovendien een megabyte WebAssembly op een oude tablet.
 *
 * Stockfish komt erbij vanaf niveau 4 (fase 2 van de roadmap); de interface hieronder
 * is er al op voorbereid: een bot is niets meer dan (fen) => zet.
 */
import { Game, materialBalance } from './game'
import type { Square } from './board'

export type BotMove = { from: Square; to: Square }
export type Bot = {
  id: string
  naam: string
  emoji: string
  /** Korte omschrijving voor het kind, wordt ingesproken. */
  tagline: string
  /** Schatting voor het ouderscherm; null als een getal niet zinvol is. */
  elo: number | null
  /** Denktijd in ms — direct antwoorden voelt kil, dus de bot "denkt" even na. */
  denktijd: number
  kies: (game: Game, random?: () => number) => BotMove | null
}

function pick<T>(items: T[], random: () => number): T | null {
  if (!items.length) return null
  return items[Math.floor(random() * items.length)]
}

/** Speelt een willekeurige legale zet. */
function randomChoice(game: Game, random: () => number): BotMove | null {
  const moves = game.legalMoves()
  const m = pick(moves, random)
  return m ? { from: m.from, to: m.to } : null
}

/**
 * Kijkt één zet vooruit: pak de grootste buit, anders willekeurig.
 * `blunderCheck` laat de bot ook nog even kijken of hij zijn stuk niet weggeeft.
 */
function greedyChoice(game: Game, random: () => number, blunderCheck: boolean): BotMove | null {
  const moves = game.legalMoves()
  if (!moves.length) return null
  const kleur = game.turn
  const teken = kleur === 'w' ? 1 : -1

  let best: { move: BotMove; score: number }[] = []
  for (const m of moves) {
    const next = game.clone()
    next.move(m.from, m.to)
    const status = next.status()
    let score = teken * materialBalance(next.fen)
    if (status.over && status.reason === 'mat' && status.winner === kleur) score += 100
    if (status.over && status.reason === 'pat') score -= 5
    if (blunderCheck) {
      // Wat is het duurste stuk dat de tegenstander hierna gratis kan pakken?
      let ergste = 0
      for (const reply of next.legalMoves()) {
        if (!reply.isCapture) continue
        const after = next.clone()
        after.move(reply.from, reply.to)
        const verlies = teken * (materialBalance(next.fen) - materialBalance(after.fen))
        ergste = Math.max(ergste, verlies)
      }
      score -= ergste * 0.9
    }
    const entry = { move: { from: m.from, to: m.to }, score }
    if (!best.length || score > best[0].score) best = [entry]
    else if (score === best[0].score) best.push(entry)
  }
  const chosen = pick(best, random)
  return chosen ? chosen.move : null
}

export const BOTS: Bot[] = [
  {
    id: 'mila',
    naam: 'Mila de Muis',
    emoji: '🐭',
    tagline: 'Mila doet maar wat. Met haar kun je alles proberen.',
    elo: null,
    denktijd: 500,
    kies: (game, random = Math.random) => randomChoice(game, random),
  },
  {
    id: 'kiki',
    naam: 'Kip Kiki',
    emoji: '🐣',
    tagline: 'Kiki pakt alles wat ze gratis kan pakken. Pas op je stukken!',
    elo: 150,
    denktijd: 700,
    kies: (game, random = Math.random) => greedyChoice(game, random, false),
  },
  {
    id: 'rens',
    naam: 'Rens het Konijn',
    emoji: '🐰',
    tagline: 'Rens kijkt ook of hij zelf niets weggeeft.',
    elo: 350,
    denktijd: 900,
    kies: (game, random = Math.random) => greedyChoice(game, random, true),
  },
]

export function getBot(id: string): Bot | undefined {
  return BOTS.find((b) => b.id === id)
}

/**
 * De kindvriendelijke laag boven elke motor.
 * `blunderBudget` = hoe vaak de bot in deze partij bewust een cadeautje mag geven.
 */
export class KidBot {
  private budget: number
  constructor(
    private bot: Bot,
    blunderBudget = 0,
    private random: () => number = Math.random,
  ) {
    this.budget = blunderBudget
  }

  kies(game: Game): BotMove | null {
    const moves = game.legalMoves()
    if (!moves.length) return null

    // Genadeplafond: bij een grote voorsprong niet doorstoten naar mat, maar rustig
    // doorspelen. Behalve als het kind zelf bijna wint — dan gewoon eerlijk spelen.
    const teken = game.turn === 'w' ? 1 : -1
    const voorsprong = teken * materialBalance(game.fen)

    if (this.budget > 0 && voorsprong > 3 && this.random() < 0.35) {
      this.budget--
      const zacht = moves.filter((m) => !m.isCapture)
      const m = pick(zacht.length ? zacht : moves, this.random)
      return m ? { from: m.from, to: m.to } : null
    }
    return this.bot.kies(game, this.random)
  }
}
