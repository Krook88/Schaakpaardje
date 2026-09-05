import type { Color, PieceType, Square } from '@/engine/board'

export type Fen = string

/**
 * Een opgave. Alle varianten zijn zo gekozen dat een kind ze met één handeling kan
 * oplossen: tikken op velden, of een stuk verplaatsen. De juiste antwoorden worden waar
 * mogelijk door de engine berekend in plaats van in de content opgeschreven — dat kan
 * niet fout gaan bij het overtypen.
 */
export type Exercise =
  /** Tik alle velden aan waar dit stuk heen kan. */
  | { kind: 'tapMoves'; fen: Fen; from: Square; vraag: string; negeerEigen?: boolean }
  /** Tik de genoemde velden aan (bordkennis, kleuren, rijen, lijnen). */
  | {
      kind: 'tapSquares'
      fen: Fen
      correct: Square[]
      vraag: string
      foutTip?: string
      /** Zie TapBedoeling: laat de contentcontrole het antwoord narekenen. */
      bedoeling?: TapBedoeling
      /**
       * Andere antwoorden die net zo goed zijn.
       *
       * "Tik een hele lijn aan" heeft acht goede antwoorden, niet één. Stond er dan
       * alleen de e-lijn in `correct`, dan kreeg een kind dat keurig de c-lijn koos
       * acht keer een kruisje voor een goed antwoord — precies wat deze app niet mag
       * doen. Met varianten kiest de eerste tik welk antwoord het wordt: alle
       * verzamelingen waar dat veld niet in zit vallen af, de rest blijft open.
       *
       * `correct` is de eerste variant; alle varianten zijn even groot, zodat "3 van
       * de 8 gevonden" blijft kloppen welke je ook kiest.
       */
      varianten?: Square[][]
      /**
       * Velden die vanaf het begin oplichten: een gegeven, geen antwoord.
       *
       * Voor een kind dat niet leest is "de vierde rij van onderen" geen aanwijzing
       * maar een raadsel. Eén veld dat oplicht is dat wel: begin hier.
       */
      wijs?: Square[]
    }
  /** Verplaats een stuk naar een van de goede velden. */
  | {
      kind: 'move'
      fen: Fen
      from?: Square
      goed: Square[]
      vraag: string
      foutTip?: string
      /** Zie ZetBedoeling: laat de contentcontrole het antwoord narekenen. */
      bedoeling?: ZetBedoeling
    }
  /** Loop met een stuk naar een doelveld, eventueel in een maximaal aantal zetten. */
  | { kind: 'reach'; fen: Fen; from: Square; doel: Square; maxZetten?: number; vraag: string }
  /** Sla alle vijandelijke stukken; eventueel moet elke zet raak zijn. */
  | { kind: 'captureAll'; fen: Fen; from: Square; elkeZetRaak?: boolean; vraag: string }
  /**
   * Een zet volgens de échte schaakregels (chess.js), beoordeeld op wat hij bereikt
   * in plaats van op één goed veld. Vanaf wereld 9 kan dat niet anders: uit schaak
   * gaan kan op drie manieren, en die zijn alle drie goed. Een lijstje met "het" goede
   * veld zou hier dus fout onderwijs zijn.
   */
  | {
      kind: 'regelZet'
      /** Volledige FEN, inclusief wie er aan zet is. */
      fen: Fen
      eis: 'geefSchaak' | 'uitSchaak' | 'matIn1' | 'rokeer' | 'enPassant'
      vraag: string
      foutTip?: string
    }
  /** Meerkeuze met grote knoppen, voor begrip in plaats van uitvoering. */
  | {
      kind: 'quiz'
      vraag: string
      opties: {
        label: string
        emoji?: string
        /**
         * Een echt veldje in de kleur van het bord, in plaats van een emoji.
         *
         * ⬜ en 🟩 leken de veldkleuren goed te vangen, maar een emoji ziet er op elk
         * toestel anders uit: op Windows is ⬜ lichtpaars. Een kind kreeg dus een
         * paars vlakje te zien bij "een licht veld" terwijl het bord ernaast crème
         * en groen is. Dit vakje krijgt letterlijk dezelfde kleur als het bord.
         */
        veld?: 'licht' | 'donker'
        goed?: boolean
      }[]
      foutTip?: string
    }

/**
 * Wat een opgave bedóelt.
 *
 * Aanleiding: de eerste review vond drie opgaven waarin het opgeschreven antwoord niet
 * klopte met de stelling — een koning aanwijzen waar een toren stond, een "schaak" dat
 * geen schaak was, en veilige velden die juist door het paard bestreken werden. Alle
 * drie kwamen ongehinderd door de contentcontrole én door 73 tests, want die keken
 * alleen of de velden bestónden.
 *
 * Met een bedoeling erbij rekent de controle het antwoord zelf uit en vergelijkt het.
 * Wie de stelling aanpast zonder het antwoord bij te werken, loopt meteen vast.
 */
export type TapBedoeling =
  /** Alle stukken van dit soort (en eventueel deze kleur). */
  | { soort: 'stuk'; type: PieceType; kleur?: Color }
  /** Alle stukken die precies zoveel waard zijn. */
  | { soort: 'waarde'; waarde: number; kleur?: Color }
  /** Alle stukken van deze kleur die aangevallen worden. */
  | { soort: 'bedreigd'; kleur: Color }
  /** De koning(en) die schaak staan. */
  | { soort: 'schaak' }
  /** De koning(en) die juist géén schaak staan. */
  | { soort: 'geenSchaak' }
  /**
   * De velden rondom een veld — de vluchtvelden van een koning dus.
   * `filter` beperkt tot de bezette of juist de lege buurvelden.
   */
  | { soort: 'buurvelden'; van: Square; filter?: 'alles' | 'bezet' | 'leeg'; kleur?: Color }

export type ZetBedoeling =
  /** Elk veld waar het stuk na de zet niet geslagen kan worden. */
  | 'veilig'
  /** De slagzet(ten) met de hoogste buit. */
  | 'duurste'
  /** Het stuk dat jou aanvalt, slaan. */
  | 'aanvaller'

/**
 * Eén zin uit de kijkfase, met wat er ondertussen op het bord gebeurt.
 *
 * "Een lijn loopt van beneden naar boven" bij een leeg bord is voor een kind van vier
 * geen uitleg maar een raadsel: het hoort woorden en ziet niets. Met `wijs` lichten de
 * velden één voor één op in de volgorde die erin staat, dus klimt de lijn echt omhoog
 * terwijl Pip het zegt. Wie beweging uit heeft staan, ziet ze allemaal tegelijk.
 */
export type VertelZin = { tekst: string; wijs?: Square[] }

/** De tekst van een vertelzin, of hij nu kaal is opgeschreven of met aanwijzing. */
export function vertelTekst(zin: string | VertelZin): string {
  return typeof zin === 'string' ? zin : zin.tekst
}

/** De velden die bij deze zin horen; leeg als er niets aangewezen wordt. */
export function vertelWijzers(zin: string | VertelZin): Square[] {
  return typeof zin === 'string' ? [] : (zin.wijs ?? [])
}

export type Fase = 'kijken' | 'meedoen' | 'zelf' | 'toets'

export type Lesson = {
  id: string
  wereldId: string
  titel: string
  /**
   * Eén beeld dat deze les voorstelt. Op de kaart en de stal is dit voor een kind van
   * vier het énige waar het de les aan herkent — de titel leest het niet.
   */
  icoon: string
  /** Eén zin voor het ouderscherm: wat kan mijn kind hierna? Nooit aan het kind tonen. */
  doel: string
  /** Dezelfde les, maar tegen het kind zelf. Staat op het beloningsscherm. */
  geleerd: string
  /** Wat Pip vertelt in de kijkfase. Een zin, of een zin met een aanwijzing erbij. */
  vertel: (string | VertelZin)[]
  /** Stelling die tijdens het vertellen op het bord staat. */
  vertelFen?: Fen
  /** Velden die tijdens het hele vertellen oplichten, ongeacht welke zin er klinkt. */
  vertelWijs?: Square[]
  meedoen: Exercise[]
  zelf: Exercise[]
  toets: Exercise[]
  themas: string[]
  /** Toon altijd de veldnamen, ook als de ouder ze uit heeft staan (wereld 12). */
  toonCoordinaten?: boolean
}

export type World = {
  id: string
  nummer: number
  naam: string
  emoji: string
  /** Ondertitel op de kaart, wordt ingesproken. */
  belofte: string
  /**
   * De kleurtoon van deze wereld, als graden op de kleurencirkel (0-360).
   *
   * Vijftien werelden met namen als Torenburcht en Loperbos zagen er alle vijftien
   * identiek uit: een witte kaart op een beige achtergrond. Eén getal per wereld maakt
   * er vijftien plekken van. Alleen de toon, geen kant-en-klare kleur: de app rekent er
   * per thema een lichte en een donkere variant uit, zodat het contrast blijft kloppen.
   */
  toon: number
  minLeeftijd: 3 | 5 | 6 | 7 | 8 | 9
  lessen: Lesson[]
  /** Minispel dat bij deze wereld hoort. */
  minispel?: string
  /** Diploma dat je haalt door deze wereld af te maken. */
  diploma?: 'brons' | 'zilver' | 'goud'
}

export const LEEG = '8/8/8/8/8/8/8/8'
export const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'

/** Alle opgaven van een les, in speelvolgorde. */
export function alleOpgaven(les: Lesson): Exercise[] {
  return [...les.meedoen, ...les.zelf, ...les.toets]
}
