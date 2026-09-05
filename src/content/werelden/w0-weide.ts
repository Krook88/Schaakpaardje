import { LEEG, type World } from '../types'

/**
 * Wereld 0 — De Weide.
 * Nog geen schaken: dit is bordkennis. Vanaf 3 jaar te doen, want er komt geen
 * enkele regel bij kijken. Alles is kijken, tellen en aanwijzen.
 */
export const wereld0: World = {
  id: 'weide',
  nummer: 0,
  naam: 'De Weide',
  emoji: '🌾',
  toon: 80,
  belofte: 'Hier leer je het bord kennen.',
  minLeeftijd: 3,
  minispel: 'vind-het-veld',
  lessen: [
    {
      id: 'weide-1',
      wereldId: 'weide',
      titel: 'Licht en donker',
      icoon: '🌗',
      doel: 'Je kind ziet dat het bord om en om licht en donker is.',
      geleerd: 'Nu zie je meteen welk veld licht is en welk veld donker.',
      vertel: [
        'Hoi! Ik ben Pip. Dit is een schaakbord.',
        'Kijk eens: een licht veld, een donker veld, een licht veld. Steeds om en om.',
        'Zullen we samen wat velden aantikken?',
      ],
      vertelFen: LEEG,
      meedoen: [
        {
          kind: 'tapSquares',
          fen: LEEG,
          correct: ['a1', 'c1', 'e1', 'g1'],
          vraag: 'Tik de vier donkere velden op de onderste rij aan.',
          foutTip: 'Die is licht. De donkere zijn de groene.',
        },
      ],
      zelf: [
        {
          kind: 'tapSquares',
          fen: LEEG,
          correct: ['b1', 'd1', 'f1', 'h1'],
          vraag: 'En nu de vier lichte velden op de onderste rij.',
        },
        {
          kind: 'tapSquares',
          fen: LEEG,
          correct: ['a8', 'c8', 'e8', 'g8'],
          vraag: 'Tik de lichte velden op de bovenste rij aan.',
          foutTip: 'Kijk goed: bovenaan begint de rij juist met een licht veld.',
        },
      ],
      toets: [
        {
          kind: 'tapSquares',
          fen: LEEG,
          correct: ['d4', 'e5'],
          vraag: 'Tik de twee donkere velden in het midden aan.',
        },
        {
          kind: 'tapSquares',
          fen: LEEG,
          correct: ['d5', 'e4'],
          vraag: 'En nu de twee lichte velden ernaast, in het midden.',
          foutTip: 'Die is donker. De lichte zijn de zandkleurige.',
        },
      ],
      themas: ['bord', 'veldkleur'],
    },
    {
      id: 'weide-2',
      wereldId: 'weide',
      titel: 'Rijen en lijnen',
      icoon: '➡️',
      doel: 'Je kind herkent een rij (opzij) en een lijn (omhoog).',
      geleerd: 'Nu weet je wat een rij is, wat een lijn is en wat een diagonaal is.',
      vertel: [
        'Het bord heeft acht rijen van acht velden. Samen vierenzestig.',
        'Een rij loopt van links naar rechts. Zo, opzij.',
        'Een lijn loopt van beneden naar boven. Zo, omhoog.',
        'Rijen liggen plat, lijnen staan rechtop.',
      ],
      vertelFen: LEEG,
      meedoen: [
        {
          kind: 'tapSquares',
          fen: LEEG,
          correct: ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'],
          vraag: 'Tik de hele onderste rij aan. Acht velden opzij.',
        },
      ],
      zelf: [
        {
          kind: 'tapSquares',
          fen: LEEG,
          correct: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'],
          vraag: 'Nu een lijn: tik alles aan van beneden naar boven.',
          foutTip: 'Een lijn gaat recht omhoog, niet opzij.',
        },
        {
          kind: 'tapSquares',
          fen: LEEG,
          correct: ['a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4'],
          vraag: 'Tik de rij in het midden aan, de vierde van onderen.',
        },
        {
          kind: 'tapSquares',
          fen: LEEG,
          correct: ['a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8'],
          vraag: 'En dit is een diagonaal: schuin van hoek tot hoek. Tik hem aan.',
          foutTip: 'Schuin! Steeds eentje opzij en eentje omhoog.',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Een rij loopt...',
          opties: [
            { label: 'opzij', emoji: '↔️', goed: true },
            { label: 'omhoog', emoji: '↕️' },
            { label: 'schuin', emoji: '↗️' },
          ],
        },
        {
          // Hier stond een quiz met "64 / 32 / 100". Voor een kind dat niet leest is
          // dat geen keuze maar gokken: het getal ís het antwoord, dus welk plaatje je
          // er ook bij zet, het verklapt of het misleidt — 💯 was het best leesbare
          // beeld en stond op een fout antwoord. Vierenzestig staat nu in wat Pip
          // vertelt; de toets vraagt iets wat je kunt aanwijzen.
          kind: 'tapSquares',
          fen: LEEG,
          correct: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'],
          vraag: 'Nog één lijn. Tik alles aan wat recht boven het derde vakje ligt.',
          foutTip: 'Een lijn gaat recht omhoog. Begin onderaan en klim naar boven.',
        },
      ],
      themas: ['bord', 'rij', 'lijn', 'diagonaal'],
    },
    {
      id: 'weide-3',
      wereldId: 'weide',
      titel: 'Wit rechtsonder',
      icoon: '🧩',
      doel: 'Je kind legt het bord goed neer en zet de stukken op hun plek.',
      geleerd: 'Nu leg jij het bord goed neer en zet je alle stukken op hun plek.',
      vertel: [
        'Voor je gaat schaken leg je het bord goed neer.',
        'Onthoud dit: wit rechts. Het veld rechtsonder is altijd licht.',
        'En de dame? Die staat op haar eigen kleur. De witte dame op een licht veld.',
      ],
      vertelFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
      meedoen: [
        {
          kind: 'tapSquares',
          fen: LEEG,
          correct: ['h1'],
          vraag: 'Tik het veld rechtsonder aan. Dat hoort licht te zijn.',
        },
      ],
      zelf: [
        {
          kind: 'tapSquares',
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
          correct: ['d1'],
          vraag: 'Waar staat de witte dame? Tik haar aan.',
          foutTip: 'De dame staat naast de koning, op haar eigen kleur.',
        },
        {
          kind: 'tapSquares',
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
          correct: ['a1', 'h1'],
          vraag: 'Tik de twee witte torens aan. Die staan in de hoeken.',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Welk veld is rechtsonder?',
          opties: [
            { label: 'een licht veld', emoji: '⬜', goed: true },
            { label: 'een donker veld', emoji: '🟩' },
          ],
          foutTip: 'Wit rechts! Rechtsonder is licht.',
        },
        {
          kind: 'tapSquares',
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
          correct: ['b1', 'g1'],
          vraag: 'Tik de twee witte paarden aan. Die staan naast de torens.',
        },
      ],
      themas: ['bord', 'opstelling'],
    },
  ],
}
