/**
 * De minispellen.
 *
 * Elk spel maakt zijn eigen opgaven, met een oplopende moeilijkheid. Ze worden
 * gegenereerd in plaats van opgeschreven: dat geeft eindeloos oefenmateriaal zonder
 * dat iemand honderden stellingen hoeft in te typen. Elke gegenereerde stelling wordt
 * eerst door de oplosser gehaald — een spel dat niet uit te spelen is, komt er niet uit.
 */
import {
  aanvallersVan,
  allSquares,
  applyMove,
  controleVelden,
  fileIndex,
  isLightSquare,
  rankOf,
  parseBoard,
  pieceMoves,
  PIECE_VALUE,
  square,
  toPlacement,
  veiligeVelden,
  type BoardMap,
  type PieceType,
  type Square,
} from '@/engine/board'
import { korstePad, slaAllesOp } from '@/engine/puzzels'
import { Game } from '@/engine/game'
import { goedeZetten } from '@/lesson/runner'
import type { Exercise } from '@/content/types'

export type Minispel = {
  id: string
  naam: string
  emoji: string
  uitleg: string
  /** Zes niveaus, oplopend. */
  maakOpgave: (niveau: number, random?: () => number) => Exercise
  /** Toon altijd de veldnamen, ongeacht de instelling. */
  toonCoordinaten?: boolean
}

/**
 * Voorspelbare willekeur. De eerste opgave wordt tijdens het bouwen al gerenderd; als
 * die met Math.random werd gemaakt, staat er in de HTML een andere stelling dan de
 * browser tekent en klaagt React over hydratie. Met een zaadje is de eerste opgave
 * overal hetzelfde; daarna gaat het gewoon met echte willekeur verder.
 */
export function zaad(n: number): () => number {
  let s = n * 2654435761 % 2147483647
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

function willekeurigVeld(random: () => number, behalve: Square[] = []): Square {
  const velden = allSquares().filter((sq) => !behalve.includes(sq))
  return velden[Math.floor(random() * velden.length)]
}

/**
 * Een veld waar een pion kán staan: rij 2 tot en met 7.
 * Een pion op rij 1 of 8 bestaat niet — hij was daar allang gepromoveerd. Uitgerekend
 * in 'laatste-pion', het spel dat over promotie gaat, stond er anders soms een witte
 * pion ongepromoveerd op a8 terwijl Pip zegt dat dat niet kan.
 */
function willekeurigPionVeld(random: () => number, behalve: Square[] = []): Square {
  const velden = allSquares().filter(
    (sq) => !behalve.includes(sq) && Number(sq[1]) > 1 && Number(sq[1]) < 8,
  )
  return velden[Math.floor(random() * velden.length)]
}

/** Staat er ergens een pion op rij 1 of 8? Dan deugt de stelling niet. */
function pionOpEindrij(board: BoardMap): boolean {
  return Object.entries(board).some(
    ([sq, p]) => p.type === 'p' && (Number(sq[1]) === 1 || Number(sq[1]) === 8),
  )
}

/**
 * Kan deze stelling écht op een bord staan?
 *
 * De meetkundige motor rekent alleen waar een stuk heen mag; hij weet niet dat
 * koningen niet naast elkaar mogen staan en dat je niet aan zet bent terwijl de ander
 * schaak staat. Alles wat een koning bevat gaat daarom eerst langs chess.js.
 */
function stellingKlopt(board: BoardMap): boolean {
  if (pionOpEindrij(board)) return false
  try {
    const game = new Game(`${toPlacement(board)} w - - 0 1`)
    const status = game.status()
    return !status.over && !status.check
  } catch {
    return false
  }
}

/**
 * Welke zetten van dit stuk zijn volgens de échte regels toegestaan?
 *
 * Geeft `null` als chess.js de stelling niet eens aanneemt; de aanroeper slaat hem
 * dan over. Wit is altijd aan zet in de minispellen.
 */
function legaleZetten(fen: string, van: Square): Set<Square> | null {
  try {
    return new Set(new Game(`${fen} w - - 0 1`).legalMoves(van).map((m) => m.to))
  } catch {
    return null
  }
}

function bordNaarFen(board: BoardMap): string {
  return toPlacement(board)
}

function zet(board: BoardMap, sq: Square, type: PieceType, kleur: 'w' | 'b'): BoardMap {
  return { ...board, [sq]: { type, color: kleur } }
}

/**
 * Geeft dit schaak het stuk niet weg? We laten de lesmotor het narekenen: die keurt
 * bij 'geefSchaak' alleen veilige schaakzetten goed, tenzij er geen enkele bestaat.
 * Door hier per zet te vragen, zien we dat verschil wél.
 */
function veiligSchaak(game: Game, zet: { from: Square; to: Square }): boolean {
  const na = game.clone()
  if (!na.move(zet.from, zet.to)) return false
  return !na.legalMoves().some((z) => z.to === zet.to)
}

/** Bouwt een keten van slagzetten door vanaf het stuk vooruit te lopen. */
function maakSlagketen(
  type: PieceType,
  aantal: number,
  random: () => number,
  elkeZetRaak: boolean,
): { fen: string; from: Square } {
  for (let poging = 0; poging < 200; poging++) {
    const start = willekeurigVeld(random)
    let board = zet({}, start, type, 'w')
    let hier = start
    const gebruikt: Square[] = [start]
    let gelukt = true
    for (let i = 0; i < aantal; i++) {
      const opties = pieceMoves(board, hier).all.filter(
        (sq) => !gebruikt.includes(sq) && Number(sq[1]) > 1 && Number(sq[1]) < 8,
      )
      if (!opties.length) {
        gelukt = false
        break
      }
      const doel = opties[Math.floor(random() * opties.length)]
      board = zet(board, doel, 'p', 'b')
      gebruikt.push(doel)
      hier = doel
    }
    if (!gelukt) continue
    const fen = bordNaarFen(board)
    if (slaAllesOp(parseBoard(fen), start, elkeZetRaak)) return { fen, from: start }
  }
  // Valt terug op een stelling die zeker werkt.
  return { fen: '8/8/8/8/8/1p6/8/N7', from: 'a1' }
}

function maakParcours(
  type: PieceType,
  minZetten: number,
  maxZetten: number,
  blokkades: number,
  random: () => number,
): { fen: string; from: Square; doel: Square; maxZetten: number } {
  for (let poging = 0; poging < 300; poging++) {
    const start = willekeurigVeld(random)
    let board = zet({}, start, type, 'w')
    const bezet: Square[] = [start]
    for (let i = 0; i < blokkades; i++) {
      const sq = willekeurigPionVeld(random, bezet)
      board = zet(board, sq, 'p', 'w')
      bezet.push(sq)
    }
    const doel = willekeurigVeld(random, bezet)
    const pad = korstePad(board, start, doel, maxZetten)
    if (pad && pad.length >= minZetten && pad.length <= maxZetten) {
      return { fen: bordNaarFen(board), from: start, doel, maxZetten: pad.length + 1 }
    }
  }
  return { fen: '8/8/8/8/8/8/8/N7', from: 'a1', doel: 'c5', maxZetten: 3 }
}

export const MINISPELLEN: Minispel[] = [
  {
    id: 'vind-het-veld',
    naam: 'Vind het veld',
    emoji: '🔎',
    uitleg: 'Pip zegt welke stukken je moet aantikken.',
    maakOpgave(niveau, random = Math.random) {
      // Dit spel hoort bij wereld 0, staat altijd open, en is vanaf drie jaar.
      //
      // Er stond hier "Tik alle torens aan", met als verantwoording dat wereld 0 die
      // namen zelf noemde. Dat klopte tot weide-3 werd herschreven tot pure
      // bordkennis: toren komt nu pas in wereld 1, dame in 3, paard in 4. Een kind van
      // drie kreeg dus drie woorden die het nooit gehoord had, en de naam wás de hele
      // opdracht.
      //
      // Nu vraagt het spel naar wat wereld 0 wél leert: licht en donker, en de rij
      // onderaan. De stukken staan er nog gewoon, maar je hoeft niet te weten hoe ze
      // heten — je kijkt naar het veld waar ze op staan. Precies wat de wereld belooft.
      const aantal = Math.min(3 + niveau, 8)
      const soorten: PieceType[] = ['r', 'q', 'n', 'b', 'p']

      // Uitgeschreven zinnen, geen samengestelde: een zin die pas op het moment zelf
      // ontstaat kan niet vooraf ingesproken worden, en dan klinkt hier ineens de
      // apparaatstem in plaats van Pip.
      const soortenVraag: { vraag: string; kies: (sq: Square) => boolean }[] = [
        { vraag: 'Tik alle stukken aan die op een licht veld staan.', kies: isLightSquare },
        { vraag: 'Tik alle stukken aan die op een donker veld staan.', kies: (sq) => !isLightSquare(sq) },
        { vraag: 'Tik alle stukken aan die op de onderste rij staan.', kies: (sq) => rankOf(sq) === 1 },
        { vraag: 'Tik alle stukken aan die op de bovenste rij staan.', kies: (sq) => rankOf(sq) === 8 },
      ]
      for (let poging = 0; poging < 60; poging++) {
        let board: BoardMap = {}
        const bezet: Square[] = []
        for (let i = 0; i < aantal; i++) {
          const sq = willekeurigVeld(random, bezet)
          board = zet(board, sq, soorten[i % soorten.length], i % 2 === 0 ? 'w' : 'b')
          bezet.push(sq)
        }
        const velden = Object.keys(board) as Square[]

        // Alleen vragen waar ook echt iets op past. Nul goede velden is niet op te
        // lossen, en álle velden goed vraagt niets. Staan bij toeval alle stukken op
        // een lichte kleur en geen enkele op de boven- of onderrij, dan houden we
        // niets over — vandaar dat we het bord dan opnieuw neerzetten.
        const bruikbaar = soortenVraag
          .map((v) => ({ ...v, correct: velden.filter(v.kies) }))
          .filter((v) => v.correct.length > 0 && v.correct.length < velden.length)
        if (!bruikbaar.length) continue

        const gekozen = bruikbaar[Math.floor(random() * bruikbaar.length)]
        return {
          kind: 'tapSquares',
          fen: bordNaarFen(board),
          correct: gekozen.correct,
          vraag: gekozen.vraag,
        }
      }

      // Zestig keer achter elkaar pech is praktisch onmogelijk, maar een spel mag
      // nooit met lege handen thuiskomen. d5 is licht, c5 is donker — nagerekend met
      // isLightSquare(), niet uit het hoofd: mijn eerste poging zette het paard op c4
      // en dat is óók licht.
      return {
        kind: 'tapSquares',
        fen: '8/8/8/2Nq4/8/8/8/8',
        correct: ['d5'],
        vraag: 'Tik alle stukken aan die op een licht veld staan.',
      }
    },
  },
  {
    id: 'torenjacht',
    naam: 'Torenjacht',
    emoji: '🏰',
    uitleg: 'Sla alle pionnen met je toren.',
    maakOpgave(niveau, random = Math.random) {
      const { fen, from } = maakSlagketen('r', Math.min(2 + niveau, 6), random, false)
      return { kind: 'captureAll', fen, from, vraag: 'Sla alle zwarte pionnen met je toren.' }
    },
  },
  {
    id: 'vang-de-vlag',
    naam: 'Vang de vlag',
    emoji: '🚩',
    uitleg: 'Loop met de loper naar de ster.',
    maakOpgave(niveau, random = Math.random) {
      const p = maakParcours('b', 1, Math.min(2 + Math.floor(niveau / 2), 4), niveau, random)
      return {
        kind: 'reach',
        fen: p.fen,
        from: p.from,
        doel: p.doel,
        maxZetten: p.maxZetten,
        vraag: 'Breng de loper naar de ster.',
      }
    },
  },
  {
    id: 'dame-doolhof',
    naam: 'Dame-doolhof',
    emoji: '👑',
    uitleg: 'Zoek een weg voor de dame.',
    maakOpgave(niveau, random = Math.random) {
      const p = maakParcours('q', 2, 3, 2 + niveau * 2, random)
      return {
        kind: 'reach',
        fen: p.fen,
        from: p.from,
        doel: p.doel,
        maxZetten: p.maxZetten,
        vraag: 'Breng de dame naar de ster. Om je eigen pionnen heen!',
      }
    },
  },
  {
    id: 'hongerig-paardje',
    naam: 'Hongerig paardje',
    emoji: '🐴',
    uitleg: 'Elke sprong moet raak zijn.',
    maakOpgave(niveau, random = Math.random) {
      const { fen, from } = maakSlagketen('n', Math.min(1 + niveau, 6), random, true)
      return {
        kind: 'captureAll',
        fen,
        from,
        elkeZetRaak: true,
        vraag: 'Sla alle zwarte pionnen op. Elke sprong moet raak zijn!',
      }
    },
  },
  {
    id: 'koningsloop',
    naam: 'Koningsloop',
    emoji: '🤴',
    uitleg: 'Wandel met de koning naar de ster.',
    maakOpgave(niveau, random = Math.random) {
      const p = maakParcours('k', 2, 6, niveau, random)
      return {
        kind: 'reach',
        fen: p.fen,
        from: p.from,
        doel: p.doel,
        maxZetten: p.maxZetten + 2,
        vraag: 'Loop met de koning naar de ster. Stapje voor stapje.',
      }
    },
  },
  {
    id: 'pionnenspel',
    naam: 'Pionnenspel',
    emoji: '♟️',
    uitleg: 'Wie het eerst de overkant haalt, wint.',
    maakOpgave(niveau, random = Math.random) {
      // Het echte pionnenspel speel je tegen Mila; dit is de oefenversie: breng één
      // pion naar de overkant, met steeds meer pionnen op het bord.
      const lijn = Math.floor(random() * 8)
      let board: BoardMap = zet({}, square(lijn, 2), 'p', 'w')
      const bezet = [square(lijn, 2)]
      for (let i = 0; i < niveau; i++) {
        const sq = willekeurigPionVeld(random, [...bezet, square(lijn, 3), square(lijn, 4)])
        if (Number(sq[1]) >= 7) continue
        board = zet(board, sq, 'p', 'w')
        bezet.push(sq)
      }
      return {
        kind: 'reach',
        fen: bordNaarFen(board),
        from: square(lijn, 2),
        doel: square(lijn, 8),
        vraag: 'Breng deze pion naar de overkant. Dan wordt hij dame!',
      }
    },
  },
  {
    id: 'weegschaal',
    naam: 'Weegschaal',
    emoji: '⚖️',
    uitleg: 'Er valt iets te kiezen. Pak het duurste.',
    maakOpgave(niveau, random = Math.random) {
      const soorten: PieceType[] = ['r', 'b', 'q', 'n']
      const buit: PieceType[] = ['p', 'n', 'b', 'r', 'q']
      for (let poging = 0; poging < 300; poging++) {
        const mijn = soorten[Math.floor(random() * soorten.length)]
        const start = willekeurigVeld(random)
        let board = zet({}, start, mijn, 'w')
        const aantal = Math.min(2 + Math.floor(niveau / 2), 4)
        for (let i = 0; i < aantal; i++) {
          // Steeds opnieuw kijken waar het stuk heen kan: een neergezet stuk blokkeert.
          const vrij = pieceMoves(board, start).quiet
          if (!vrij.length) break
          const veld = vrij[Math.floor(random() * vrij.length)]
          const soort = buit[Math.floor(random() * buit.length)]
          if (soort === 'p' && (Number(veld[1]) === 1 || Number(veld[1]) === 8)) continue
          board = zet(board, veld, soort, 'b')
        }
        const slag = pieceMoves(board, start).captures
        if (slag.length < 2) continue
        const waardes = slag.map((sq) => PIECE_VALUE[board[sq].type])
        const hoogste = Math.max(...waardes)
        // Alleen bruikbaar als er echt iets te kiezen valt.
        if (waardes.every((w) => w === hoogste)) continue
        // En alleen als het duurste stuk ook echt gratis is. Stond er een tweede
        // zwart stuk achter, dan won het "goede" antwoord een toren en verloor het de
        // dame — terwijl waarde-3, de volgende les in deze wereld, letterlijk leert
        // dat je eerst kijkt of hij kan terugslaan.
        const gedekt = slag.some(
          (sq) => PIECE_VALUE[board[sq].type] === hoogste && aanvallersVan(applyMove(board, start, sq), sq, 'b').length,
        )
        if (gedekt) continue
        return {
          kind: 'move',
          fen: bordNaarFen(board),
          from: start,
          goed: slag.filter((sq) => PIECE_VALUE[board[sq].type] === hoogste),
          vraag: 'Pak het duurste stuk dat je kunt pakken.',
          foutTip: 'Tel even mee: pion 1, paard en loper 3, toren 5, dame 9.',
        }
      }
      return {
        kind: 'move',
        fen: '8/8/3p4/8/r2Q4/8/8/8',
        from: 'd4',
        goed: ['a4'],
        vraag: 'Pak het duurste stuk dat je kunt pakken.',
      }
    },
  },
  {
    id: 'red-je-stuk',
    naam: 'Red je stuk',
    emoji: '🛟',
    uitleg: 'Je stuk staat te pakken. Breng het in veiligheid.',
    maakOpgave(niveau, random = Math.random) {
      const mijne: PieceType[] = ['r', 'b', 'n', 'q']
      const vijand: PieceType[] = ['p', 'n', 'b', 'r', 'q']
      for (let poging = 0; poging < 400; poging++) {
        const mijn = mijne[Math.floor(random() * mijne.length)]
        const mijnVeld = willekeurigVeld(random)
        let board = zet({}, mijnVeld, mijn, 'w')

        // Zoek een veld vanwaar een zwart stuk mijn stuk aanvalt.
        const type = vijand[Math.floor(random() * vijand.length)]
        const kandidaten = allSquares().filter((sq) => {
          if (sq === mijnVeld) return false
          if (type === 'p' && (Number(sq[1]) === 1 || Number(sq[1]) === 8)) return false
          const proef = zet(board, sq, type, 'b')
          return controleVelden(proef, sq).includes(mijnVeld)
        })
        if (!kandidaten.length) continue
        board = zet(board, kandidaten[Math.floor(random() * kandidaten.length)], type, 'b')

        // Bij een hoger niveau staat er nog een stuk in de weg.
        if (niveau >= 4) {
          const vrij = pieceMoves(board, mijnVeld).quiet.filter(
            (sq) => Number(sq[1]) > 1 && Number(sq[1]) < 8,
          )
          if (vrij.length > 3) board = zet(board, vrij[Math.floor(random() * vrij.length)], 'p', 'w')
        }

        // De blokkade kan de aanvalslijn dichtzetten; dan is er niets meer te redden.
        if (!aanvallersVan(board, mijnVeld, 'b').length) continue

        const veilig = veiligeVelden(board, mijnVeld)
        if (!veilig.length) continue
        // Te makkelijk als bijna alles goed is; te moeilijk als er maar één veld is.
        const alles = pieceMoves(board, mijnVeld).all.length
        if (veilig.length === alles) continue
        return {
          kind: 'move',
          fen: bordNaarFen(board),
          from: mijnVeld,
          goed: veilig,
          vraag: 'Je stuk staat te pakken. Breng het in veiligheid.',
          foutTip: 'Kijk eerst welke velden de aanvaller bestrijkt, en ga daar niet heen.',
        }
      }
      return {
        kind: 'move',
        fen: '8/8/8/5b2/8/3R4/8/8',
        from: 'd3',
        goed: ['d8', 'd6', 'd5', 'd4', 'a3', 'b3', 'c3', 'e3', 'f3', 'g3', 'd2', 'd1'],
        vraag: 'Je toren staat te pakken. Breng hem in veiligheid.',
      }
    },
  },
  {
    id: 'schaak-alarm',
    naam: 'Schaak-alarm',
    emoji: '⚡',
    uitleg: 'Geef schaak aan de zwarte koning.',
    maakOpgave(niveau, random = Math.random) {
      const stukken: PieceType[] = niveau <= 2 ? ['r', 'q'] : ['r', 'b', 'n', 'q']
      for (let poging = 0; poging < 400; poging++) {
        const zwarteKoning = willekeurigVeld(random)
        const witteKoning = willekeurigVeld(random, [zwarteKoning])
        // Koningen mogen nooit naast elkaar staan.
        if (controleVelden(zet({}, witteKoning, 'k', 'w'), witteKoning).includes(zwarteKoning)) continue

        const soort = stukken[Math.floor(random() * stukken.length)]
        const veld = willekeurigVeld(random, [zwarteKoning, witteKoning])
        let board = zet({}, zwarteKoning, 'k', 'b')
        board = zet(board, witteKoning, 'k', 'w')
        board = zet(board, veld, soort, 'w')
        // Een pion erbij, anders ziet chess.js koning+paard als remise wegens
        // onvoldoende materiaal en is er niets meer te spelen.
        const pionVeld = allSquares().filter(
          (sq) => !board[sq] && Number(sq[1]) > 1 && Number(sq[1]) < 8,
        )[Math.floor(random() * 40)]
        if (pionVeld) board = zet(board, pionVeld, 'p', 'w')

        const fen = `${bordNaarFen(board)} w - - 0 1`
        try {
          const game = new Game(fen)
          const status = game.status()
          if (status.over || status.check) continue
          // goedeZetten laat bij 'geefSchaak' alleen schaakzetten door die het stuk
          // niet weggeven — behalve als die er niet zijn, dan geeft hij alles terug.
          // Zo'n stelling willen we hier juist niet, dus we rekenen het zelf na.
          const goed = goedeZetten(game, 'geefSchaak')
          if (!goed.length || goed.length > 4) continue
          if (!goed.every((z) => veiligSchaak(game, z))) continue
          return {
            kind: 'regelZet',
            fen,
            eis: 'geefSchaak',
            vraag: 'Geef schaak aan de zwarte koning.',
            foutTip: 'Zoek een zet waarmee je stuk de koning kan aanvallen.',
          }
        } catch {
          continue
        }
      }
      return {
        kind: 'regelZet',
        fen: '4k3/8/8/8/8/8/8/R5K1 w - - 0 1',
        eis: 'geefSchaak',
        vraag: 'Geef schaak aan de zwarte koning.',
      }
    },
  },
  {
    id: 'mat-in-1-regen',
    naam: 'Mat in 1-regen',
    emoji: '🏁',
    uitleg: 'Zet mat in één zet.',
    maakOpgave(niveau, random = Math.random) {
      const hulp: PieceType[] = niveau <= 3 ? ['q'] : ['q', 'r']
      // Twee filters vóór chess.js, want die is hier de dure stap. Mat met alleen
      // koning en dame (of toren) kan bijna alleen aan de rand, en alleen als je eigen
      // koning meehelpt. Willekeurig prikken kostte 600 pogingen en ruim een halve
      // seconde per opgave — dat is op een tablet een bevroren scherm.
      const rand = allSquares().filter(
        (sq) => sq[0] === 'a' || sq[0] === 'h' || sq[1] === '1' || sq[1] === '8',
      )
      for (let poging = 0; poging < 600; poging++) {
        const zwarteKoning = rand[Math.floor(random() * rand.length)]
        const dichtbij = allSquares().filter(
          (sq) =>
            sq !== zwarteKoning &&
            Math.abs(fileIndex(sq) - fileIndex(zwarteKoning)) <= 2 &&
            Math.abs(rankOf(sq) - rankOf(zwarteKoning)) <= 2,
        )
        const witteKoning = dichtbij[Math.floor(random() * dichtbij.length)]
        if (controleVelden(zet({}, witteKoning, 'k', 'w'), witteKoning).includes(zwarteKoning)) continue
        const soort = hulp[Math.floor(random() * hulp.length)]
        const veld = willekeurigVeld(random, [zwarteKoning, witteKoning])
        let board = zet({}, zwarteKoning, 'k', 'b')
        board = zet(board, witteKoning, 'k', 'w')
        board = zet(board, veld, soort, 'w')
        const fen = `${bordNaarFen(board)} w - - 0 1`
        try {
          const game = new Game(fen)
          const status = game.status()
          if (status.over || status.check) continue
          const matten = goedeZetten(game, 'matIn1')
          // Eén oplossing is een echte puzzel; bij vijf is het niet meer zoeken.
          if (!matten.length || matten.length > 2) continue
          return {
            kind: 'regelZet',
            fen,
            eis: 'matIn1',
            vraag: 'Zet mat in één zet.',
            foutTip: 'Geef schaak én zorg dat hij nergens meer heen kan. Kijk naar zijn vluchtvelden.',
          }
        } catch {
          continue
        }
      }
      return {
        kind: 'regelZet',
        fen: 'k7/8/1K6/8/8/8/8/7Q w - - 0 1',
        eis: 'matIn1',
        vraag: 'Zet mat in één zet.',
      }
    },
  },
  {
    id: 'breng-de-koning-veilig',
    naam: 'Breng de koning veilig',
    emoji: '🏯',
    uitleg: 'Rokeer, als het mag tenminste.',
    maakOpgave(niveau, random = Math.random) {
      const tussenvelden = ['b1', 'c1', 'd1', 'f1', 'g1']
      const stoorzenders: PieceType[] = ['n', 'b', 'q']
      for (let poging = 0; poging < 300; poging++) {
        let board = parseBoard('4k3/8/8/8/8/8/8/R3K2R')
        // Eén of twee eigen stukken in de weg; welke rokade overblijft, wisselt.
        const hoeveel = niveau <= 2 ? 1 : 2
        for (let i = 0; i < hoeveel; i++) {
          const veld = tussenvelden[Math.floor(random() * tussenvelden.length)]
          if (!board[veld]) board = zet(board, veld, stoorzenders[Math.floor(random() * 3)], 'w')
        }
        const fen = `${bordNaarFen(board)} w KQ - 0 1`
        try {
          const game = new Game(fen)
          if (game.status().over) continue
          const rokades = goedeZetten(game, 'rokeer')
          if (rokades.length !== 1) continue
          return {
            kind: 'regelZet',
            fen,
            eis: 'rokeer',
            vraag: 'Breng je koning in veiligheid. Rokeer!',
            foutTip: 'Tussen de koning en de toren moet alles leeg zijn. Kijk welke kant dat is.',
          }
        } catch {
          continue
        }
      }
      return {
        kind: 'regelZet',
        fen: '4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1',
        eis: 'rokeer',
        vraag: 'Breng je koning in veiligheid. Rokeer!',
      }
    },
  },
  {
    id: 'schrijf-de-zet',
    naam: 'Zoek het veld',
    emoji: '✏️',
    uitleg: 'Pip noemt een veld, jij tikt het aan.',
    toonCoordinaten: true,
    maakOpgave(niveau, random = Math.random) {
      const aantal = niveau <= 2 ? 1 : niveau <= 4 ? 2 : 3
      const velden: Square[] = []
      for (let i = 0; i < aantal; i++) velden.push(willekeurigVeld(random, velden))
      return {
        kind: 'tapSquares',
        fen: LEEG_BORD,
        correct: velden,
        vraag:
          velden.length === 1
            ? `Tik veld ${velden[0]} aan.`
            : `Tik deze velden aan: ${velden.join(', ')}.`,
        foutTip: 'Eerst de letter onderaan zoeken, dan omhoog tellen tot het cijfer.',
      }
    },
  },
  {
    id: 'tactiekduel',
    naam: 'Tactiekduel',
    emoji: '🔱',
    uitleg: 'Val met één zet twee stukken tegelijk aan.',
    maakOpgave(niveau, random = Math.random) {
      const buit: PieceType[] = niveau <= 2 ? ['r', 'q'] : ['r', 'q', 'b', 'n']
      for (let poging = 0; poging < 500; poging++) {
        const zwarteKoning = willekeurigVeld(random)
        const witteKoning = willekeurigVeld(random, [zwarteKoning])
        const doel1 = willekeurigVeld(random, [zwarteKoning, witteKoning])
        const doel2 = willekeurigVeld(random, [zwarteKoning, witteKoning, doel1])
        const paard = willekeurigVeld(random, [zwarteKoning, witteKoning, doel1, doel2])

        let board = zet({}, zwarteKoning, 'k', 'b')
        board = zet(board, witteKoning, 'k', 'w')
        board = zet(board, doel1, buit[Math.floor(random() * buit.length)], 'b')
        board = zet(board, doel2, buit[Math.floor(random() * buit.length)], 'b')
        board = zet(board, paard, 'n', 'w')

        const vork = pieceMoves(board, paard).all.filter((naar) => {
          if (board[naar]) return false
          const na = applyMove(board, paard, naar)
          // Twee zwarte stukken tegelijk raken, en zelf niet meteen te pakken staan.
          const raak = controleVelden(na, naar).filter((sq) => na[sq]?.color === 'b')
          return raak.length >= 2 && !aanvallersVan(na, naar, 'b').length
        })
        if (!vork.length) continue
        // Anders dan schaak-alarm en mat-in-1-regen haalde dit spel zijn stelling
        // nooit door chess.js: koningen naast elkaar, of wit dat een vork moet spelen
        // terwijl het zelf schaak staat. Precies wat wereld 9 verbiedt.
        if (!stellingKlopt(board)) continue

        // En dan de zet zelf ook nog langs chess.js.
        //
        // `pieceMoves` rekent meetkundig en kent geen penning. Stond het paard tussen
        // de eigen koning en een zwarte toren, dan was de "enige goede vork" een zet
        // die de eigen koning in schaak zet — en zei Pip er "precies goed" bij. Dat
        // overkwam ongeveer één op de dertig stellingen. Een kind leert hier dus een
        // zet die bij de club wordt teruggenomen.
        //
        // Dat is precies waar CLAUDE.md voor waarschuwt: de meetkundige motor is voor
        // losse stukken op een leeg bord, en zodra er een koning op het bord staat
        // gelden de echte regels.
        const fen = bordNaarFen(board)
        const echt = legaleZetten(fen, paard)
        if (!echt) continue
        const wettig = vork.filter((naar) => echt.has(naar))
        if (wettig.length !== 1) continue

        return {
          kind: 'move',
          fen,
          from: paard,
          goed: wettig,
          vraag: 'Val met je paard twee stukken tegelijk aan.',
          foutTip: 'Zoek een veld van waaruit je allebei kunt raken. En kijk of je er zelf veilig staat.',
        }
      }
      return {
        kind: 'move',
        fen: 'r3k3/8/N7/8/8/8/8/7K',
        from: 'a6',
        goed: ['c7'],
        vraag: 'Val met je paard twee stukken tegelijk aan.',
      }
    },
  },
  {
    id: 'laatste-pion',
    naam: 'Laatste pion',
    emoji: '♟️',
    uitleg: 'Breng je pion naar de overkant.',
    maakOpgave(niveau, random = Math.random) {
      for (let poging = 0; poging < 200; poging++) {
        const lijn = Math.floor(random() * 8)
        const start = square(lijn, 2)
        let board = zet({}, start, 'p', 'w')
        const verboden = [start]
        for (let r = 3; r <= 8; r++) verboden.push(square(lijn, r))
        for (let i = 0; i < niveau; i++) {
          const sq = willekeurigPionVeld(random, verboden)
          board = zet(board, sq, 'p', i % 2 === 0 ? 'b' : 'w')
          verboden.push(sq)
        }
        const doel = square(lijn, 8)
        if (!korstePad(parseBoard(bordNaarFen(board)), start, doel, 8)) continue
        return {
          kind: 'reach',
          fen: bordNaarFen(board),
          from: start,
          doel,
          vraag: 'Breng je pion naar de overkant. Dan wordt hij dame!',
          foutTip: 'Recht vooruit, stap voor stap. De eerste keer mag je er twee.',
        }
      }
      return {
        kind: 'reach',
        fen: '8/8/8/8/8/8/1P6/8',
        from: 'b2',
        doel: 'b8',
        vraag: 'Breng je pion naar de overkant. Dan wordt hij dame!',
      }
    },
  },
]

const LEEG_BORD = '8/8/8/8/8/8/8/8'

export function minispelMet(id: string): Minispel | undefined {
  return MINISPELLEN.find((s) => s.id === id)
}

/**
 * Spellen waarvan de vraag pas op het moment zelf ontstaat.
 *
 * `schrijf-de-zet` noemt echte veldnamen ("Tik deze velden aan: c4, f7, a2.") en kan
 * dus niet vooraf ingesproken worden: er zijn te veel combinaties om er opnames van te
 * maken. Daar blijft de apparaatstem klinken. Dat is hier het minst erg van alle
 * spellen — het staat met opzet aan bij de oudste groep, want het gaat juist over het
 * lezen van veldnamen.
 */
export const MINISPEL_ZONDER_OPNAME = ['schrijf-de-zet']

/**
 * Elke zin die een minispel uitspreekt.
 *
 * Dit bestaat omdat de minispellen hun opgaven zelf maken en dus buiten `alleZinnen()`
 * vielen: die loopt de werelden af, en de minispellen staan niet in een wereld. Het
 * gevolg was dat élk minispel de apparaatstem gebruikte in plaats van Pip — precies de
 * schermen waar de jongste kinderen het meest zitten.
 *
 * De lijst wordt met opzet uitgeschreven en niet uit `MINISPELLEN` afgeleid: de vragen
 * zitten binnen in `maakOpgave` en zijn daar niet uit te lezen zonder het spel te
 * spelen. Wat de lijst wél sluitend houdt is de test in `minispellen.zinnen.test.ts`:
 * die speelt elk spel op elk niveau met honderden zaden en valt om zodra er een vraag
 * uitkomt die hier niet staat. Vergeten kan dus wel, ongemerkt blijven niet.
 */
export const MINISPEL_ZINNEN: string[] = [
  // De uitleg die Pip zegt zodra een spel opent.
  'Pip zegt welke stukken je moet aantikken.',
  'Sla alle pionnen met je toren.',
  'Loop met de loper naar de ster.',
  'Zoek een weg voor de dame.',
  'Elke sprong moet raak zijn.',
  'Wandel met de koning naar de ster.',
  'Wie het eerst de overkant haalt, wint.',
  'Er valt iets te kiezen. Pak het duurste.',
  'Je stuk staat te pakken. Breng het in veiligheid.',
  'Geef schaak aan de zwarte koning.',
  'Zet mat in één zet.',
  'Rokeer, als het mag tenminste.',
  'Pip noemt een veld, jij tikt het aan.',
  'Val met één zet twee stukken tegelijk aan.',
  'Breng je pion naar de overkant.',
  // En de vragen bij de opgaven zelf.
  'Tik alle stukken aan die op een licht veld staan.',
  'Tik alle stukken aan die op een donker veld staan.',
  'Tik alle stukken aan die op de onderste rij staan.',
  'Tik alle stukken aan die op de bovenste rij staan.',
  'Sla alle zwarte pionnen met je toren.',
  'Breng de loper naar de ster.',
  'Breng de dame naar de ster. Om je eigen pionnen heen!',
  'Sla alle zwarte pionnen op. Elke sprong moet raak zijn!',
  'Loop met de koning naar de ster. Stapje voor stapje.',
  'Breng deze pion naar de overkant. Dan wordt hij dame!',
  'Pak het duurste stuk dat je kunt pakken.',
  'Je toren staat te pakken. Breng hem in veiligheid.',
  'Breng je koning in veiligheid. Rokeer!',
  'Val met je paard twee stukken tegelijk aan.',
  'Breng je pion naar de overkant. Dan wordt hij dame!',
]
