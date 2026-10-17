import {
  applyMove,
  parseBoard,
  pieceMoves,
  rankOf,
  type BoardMap,
  type Color,
  type PieceType,
  type Square,
} from '@/engine/board'
import { Game } from '@/engine/game'

/**
 * Een bewegend bord voor de uitlegpagina's: een stelling en een rijtje stappen.
 *
 * Het belangrijkste wat hier gebeurt is wat er níét in de content staat. Een stap zegt
 * "laat zien waar het stuk op d4 heen kan" (`bereik`), en dit bestand vraagt de engine
 * welke velden dat zijn. Een stap zegt "speel e1-g1", en bij een echte stelling speelt
 * chess.js die zet, inclusief de toren die bij de rokade meeverhuist. Of de koning schaak
 * staat, rekent hij ook zelf uit. Zo kan een uitlegpagina geen veld aanwijzen waar het
 * stuk niet kan komen; dezelfde afspraak als bij de lessen.
 *
 * Twee motoren, net als in de rest van de app:
 *   - zonder `regels` loopt een los stuk meetkundig over een leeg bord (engine/board);
 *   - met `regels: 'echt'` gelden alle schaakregels (engine/game). Nodig voor schaak,
 *     mat, pat, rokade en en passant, want die bestaan alleen met koningen erbij.
 */

export type Stap = {
  /** Wat er bij deze stap gezegd wordt. Staat ook als gewone tekst onder het bord. */
  tekst: string
  /** Een zet, als 'e2-e4'. Bij een echte stelling speelt chess.js hem. */
  zet?: string
  /** Bij een pion op de overkant: wat hij wordt. */
  wordt?: PieceType
  /** Laat zien waar het stuk op dit veld heen kan. Berekend, nooit overgetypt. */
  bereik?: Square
  /** Velden waar het stuk op `bereik` uitdrukkelijk níét heen mag. Gecontroleerd in de test. */
  verboden?: Square[]
  /** Velden die even oplichten om iets aan te wijzen. */
  markeer?: Square[]
  /** Stukken die erbij komen, als { a1: 'R' }. Voor het opzetten van het bord. */
  plaats?: Record<Square, string>
  /**
   * Wat er na deze stap op het bord hoort te staan. Alleen bij `regels: 'echt'`; de
   * test speelt het na en weigert de pagina als het niet klopt.
   */
  verwacht?: 'schaak' | 'mat' | 'pat'
}

export type Animatie = {
  /** Uniek binnen de site; ook het anker op de pagina. */
  id: string
  /** Kop boven het bord. */
  titel: string
  /** Wat er in één zin te zien is, voor wie het bord niet kan zien. */
  beschrijving: string
  /** Stelling bij de start. Bij `regels: 'echt'` een volledige FEN met wie er aan zet is. */
  fen: string
  regels?: 'echt'
  stappen: Stap[]
}

export type BeeldStuk = { id: string; stuk: PieceType; kleur: Color; veld: Square | null }

/** Eén beeld van de film: zo staat het bord bij één stap. */
export type Beeld = {
  tekst: string
  /** Alle stukken die ooit in deze animatie voorkomen; `veld: null` is (nog) niet op het bord. */
  stukken: BeeldStuk[]
  /** Lege velden waar het aangewezen stuk heen kan. */
  stippen: Square[]
  /** Stukken die het aangewezen stuk kan slaan. */
  ringen: Square[]
  verboden: Square[]
  markeer: Square[]
  /** De koning die schaak staat. */
  schaak: Square[]
  /** De zet die net gedaan is. */
  zet: Square[]
  label?: 'Schaak!' | 'Schaakmat!' | 'Pat'
}

const PROMOTIERIJ = { w: 8, b: 1 } as const

function letter(stuk: string): { type: PieceType; color: Color } {
  return { type: stuk.toLowerCase() as PieceType, color: stuk === stuk.toUpperCase() ? 'w' : 'b' }
}

/**
 * Houdt bij welk stuk welk is, zodat het scherm het ene stuk ziet verschuiven in plaats
 * van het ene te laten verdwijnen en een ander te laten verschijnen.
 *
 * Werkt op het verschil tussen twee borden, dus het hoeft de schaakregels niet te
 * kennen: bij een rokade staat er een toren minder op h1 en een toren meer op f1, en
 * dan is dat dezelfde toren. Bij en passant verdwijnt er een pion van een veld waar
 * niemand heen ging, en dan is hij geslagen.
 */
function volg(
  ids: Map<Square, string>,
  oud: BoardMap,
  nieuw: BoardMap,
  van: Square,
  naar: Square,
): Map<Square, string> {
  const uit = new Map(ids)
  const loper = uit.get(van)
  uit.delete(naar)
  uit.delete(van)
  if (loper) uit.set(naar, loper)

  const weg = [...uit.keys()].filter((v) => !nieuw[v])
  const erbij = Object.keys(nieuw).filter((v) => !uit.has(v))
  for (const v of weg) {
    const id = uit.get(v)!
    uit.delete(v)
    const zelfde = erbij.find(
      (e) => !uit.has(e) && nieuw[e].type === oud[v].type && nieuw[e].color === oud[v].color,
    )
    if (zelfde) uit.set(zelfde, id)
  }
  return uit
}

/** Rekent een animatie uit tot losse beelden. Gooit bij een zet die niet kan. */
export function bouwBeelden(a: Animatie): Beeld[] {
  const echt = a.regels === 'echt'
  const spel = echt ? new Game(a.fen) : null
  let bord: BoardMap = parseBoard(a.fen)

  let teller = 0
  const soorten = new Map<string, { stuk: PieceType; kleur: Color }>()
  let ids = new Map<Square, string>()
  const nieuwId = (veld: Square, p: { type: PieceType; color: Color }) => {
    const id = `s${teller++}`
    soorten.set(id, { stuk: p.type, kleur: p.color })
    ids.set(veld, id)
  }
  for (const [veld, p] of Object.entries(bord)) nieuwId(veld, p)

  const ruw = a.stappen.map((stap) => {
    let zet: Square[] = []
    if (stap.plaats) {
      for (const [veld, s] of Object.entries(stap.plaats)) {
        if (bord[veld]) throw new Error(`${a.id}: ${veld} is al bezet`)
        const p = letter(s)
        bord = { ...bord, [veld]: p }
        nieuwId(veld, p)
      }
    }
    if (stap.zet) {
      const [van, naar] = stap.zet.split('-') as [Square, Square]
      const oud = bord
      if (spel) {
        const m = spel.move(van, naar, stap.wordt ?? 'q')
        if (!m) throw new Error(`${a.id}: ${stap.zet} is geen geldige zet in ${spel.fen}`)
        bord = parseBoard(spel.fen)
      } else {
        const stuk = bord[van]
        if (!stuk) throw new Error(`${a.id}: er staat niets op ${van}`)
        if (!pieceMoves(bord, van).all.includes(naar)) {
          throw new Error(`${a.id}: ${PIECE_LABEL[stuk.type]} op ${van} kan niet naar ${naar}`)
        }
        bord = applyMove(bord, van, naar)
        if (stap.wordt) {
          if (stuk.type !== 'p' || rankOf(naar) !== PROMOTIERIJ[stuk.color]) {
            throw new Error(`${a.id}: alleen een pion op de overkant kan promoveren`)
          }
          bord = { ...bord, [naar]: { type: stap.wordt, color: stuk.color } }
        }
      }
      ids = volg(ids, oud, bord, van, naar)
      if (stap.wordt) soorten.set(ids.get(naar)!, { stuk: stap.wordt, kleur: bord[naar].color })
      zet = [van, naar]
    }

    let stippen: Square[] = []
    let ringen: Square[] = []
    if (stap.bereik) {
      if (!bord[stap.bereik]) throw new Error(`${a.id}: bereik ${stap.bereik} is een leeg veld`)
      const naar = spel ? spel.destinations(stap.bereik) : pieceMoves(bord, stap.bereik).all
      // Bij en passant is het doelveld leeg, maar er wordt wel geslagen. Die zet krijgt
      // een ring, want een kind ziet anders een gewone stap.
      const slaan = spel
        ? spel.legalMoves(stap.bereik).filter((m) => m.isCapture).map((m) => m.to)
        : pieceMoves(bord, stap.bereik).captures
      ringen = naar.filter((v) => slaan.includes(v))
      stippen = naar.filter((v) => !slaan.includes(v))
    }

    let schaak: Square[] = []
    let label: Beeld['label']
    if (spel) {
      const status = spel.status()
      if (status.over && status.reason === 'pat') label = 'Pat'
      if (spel.inCheck) {
        const kleur = spel.turn
        schaak = Object.keys(bord).filter((v) => bord[v].type === 'k' && bord[v].color === kleur)
        label = status.over && status.reason === 'mat' ? 'Schaakmat!' : 'Schaak!'
      }
    }

    return {
      tekst: stap.tekst,
      plek: new Map(ids),
      stippen,
      ringen,
      verboden: stap.verboden ?? [],
      markeer: stap.markeer ?? [],
      schaak,
      zet,
      label,
    }
  })

  // Pas aan het eind is bekend welke stukken er allemaal meedoen; elk beeld krijgt ze
  // allemaal, zodat een stuk dat erbij komt of verdwijnt kan in- en uitfaden.
  return ruw.map(({ plek, ...rest }) => {
    const waar = new Map([...plek].map(([veld, id]) => [id, veld]))
    return {
      ...rest,
      stukken: [...soorten].map(([id, s]) => ({ id, ...s, veld: waar.get(id) ?? null })),
    }
  })
}

const PIECE_LABEL: Record<PieceType, string> = {
  k: 'de koning',
  q: 'de dame',
  r: 'de toren',
  b: 'de loper',
  n: 'het paard',
  p: 'de pion',
}
