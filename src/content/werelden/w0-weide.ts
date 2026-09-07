import { LEEG, type World } from '../types'
import { lijn, rij } from '../velden'

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
        {
          tekst: 'Kijk eens: een licht veld, een donker veld, een licht veld. Steeds om en om.',
          // Precies drie velden, in de volgorde die de zin noemt: licht, donker, licht.
          // Ze lichten één voor één op, dus een kind dat de woorden niet kent ziet het
          // om-en-om vanzelf gebeuren.
          wijs: ['b1', 'c1', 'd1'],
        },
        'Zullen we samen wat velden aantikken?',
      ],
      vertelFen: LEEG,
      meedoen: [
        {
          kind: 'tapSquares',
          fen: LEEG,
          correct: ['a1', 'c1', 'e1', 'g1'],
          vraag: 'Tik de vier donkere velden op de onderste rij aan.',
          // Niet zeggen wát het kind aantikte: dat weet de content niet. Wie een
          // donker veld op de verkeerde rij koos, kreeg hier te horen dat het licht
          // was — en dat is gewoon onwaar.
          foutTip: 'Zoek de groene velden, en alleen die op de onderste rij.',
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
          foutTip: 'Zoek de zandkleurige velden, en alleen die twee in het midden.',
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
        // Het woord "rij" en het woord "lijn" klinken voor een kind van vier hetzelfde.
        // Het verschil zit in de beweging, niet in de klank: hier loopt de rij écht
        // opzij en klimt de lijn écht omhoog, veld voor veld, terwijl Pip het zegt.
        { tekst: 'Een rij loopt van links naar rechts. Zo, opzij.', wijs: rij(4) },
        { tekst: 'Een lijn loopt van beneden naar boven. Zo, omhoog.', wijs: lijn('d') },
        // Eerst de rij plat over de bodem, dan de lijn die daar rechtop uit omhoog
        // klimt. Samen vormen ze de L die het verschil laat zien.
        {
          tekst: 'Rijen liggen plat, lijnen staan rechtop.',
          wijs: [...rij(1), ...lijn('d').slice(1)],
        },
      ],
      vertelFen: LEEG,
      meedoen: [
        {
          kind: 'tapSquares',
          fen: LEEG,
          correct: rij(1),
          // De onderste rij is voor wie leest meteen duidelijk. Voor een kind van vier
          // niet: het hoort acht woorden en ziet een leeg bord. Linksonder licht op,
          // dan weet het waar het beginnen moet.
          wijs: ['a1'],
          vraag: 'Tik de hele onderste rij aan. Acht velden opzij.',
        },
      ],
      zelf: [
        {
          // "Tik een lijn aan" heeft acht goede antwoorden. Hier stond alleen de
          // e-lijn, dus een kind dat netjes onderaan de c-lijn begon kreeg acht keer
          // een kruisje voor een goed antwoord — en had geen enkele manier om te weten
          // wélke lijn bedoeld werd, want de vraag zegt het niet en het kind leest niet.
          // Nu kiest de eerste tik de lijn en is elke lijn goed.
          kind: 'tapSquares',
          fen: LEEG,
          correct: lijn('e'),
          varianten: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(lijn),
          vraag: 'Nu een lijn: tik alles aan van beneden naar boven.',
          foutTip: 'Een lijn gaat recht omhoog, niet opzij.',
        },
        {
          kind: 'tapSquares',
          fen: LEEG,
          correct: rij(4),
          // "De vierde van onderen" moet je kunnen tellen én lezen. Eén veld dat
          // oplicht zegt hetzelfde tegen een kind van vier: begin hier.
          wijs: ['a4'],
          vraag: 'Tik de rij in het midden aan, de vierde van onderen.',
        },
        {
          // Van hoek tot hoek zijn er twee diagonalen, en allebei zijn ze goed.
          kind: 'tapSquares',
          fen: LEEG,
          correct: ['a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8'],
          varianten: [
            ['a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8'],
            ['h1', 'g2', 'f3', 'e4', 'd5', 'c6', 'b7', 'a8'],
          ],
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
          correct: lijn('c'),
          // Het derde vakje licht op. Anders is dit een telopdracht in plaats van een
          // lijnopdracht, en tellen tot drie in een rij van acht is voor een kind van
          // vier een andere les dan deze.
          wijs: ['c1'],
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
      icoon: '🧭',
      doel: 'Je kind legt het bord goed neer: rechtsonder hoort een licht veld.',
      geleerd: 'Nu leg jij het bord altijd goed neer. Wit rechts!',
      /*
       * Deze les ging over het bord én over de stukken, en dat laatste hoorde hier niet.
       *
       * Drie van de vijf opgaven vroegen om de dame, de torens en de paarden — stukken
       * die pas in wereld 3, 1 en 4 worden uitgelegd. Een kind dat netjes bij het begin
       * begint zag hier een vol bord en een opdracht over iets waarvan het het woord
       * nog nooit gehoord had. Ik heb dat eerst geprobeerd op te lossen door Pip de
       * stukken vooraf te laten aanwijzen, maar dat is pleisterwerk: wereld 0 is er
       * volgens docs/02 juist voor kinderen van drie, en bevat met opzet géén enkele
       * schaakregel — alleen kijken, tellen en aanwijzen.
       *
       * Het opstellen is verhuisd naar het eind van Pionnenveld, waar alle zes de
       * stukken bekend zijn. Wat hier overblijft is waar de les eigenlijk over gaat:
       * hoe je het bord neerlegt. Dat kan op een leeg bord, en dat is precies goed.
       */
      vertel: [
        'Voor je gaat schaken leg je het bord goed neer.',
        { tekst: 'Onthoud dit: wit rechts. Het veld rechtsonder is altijd licht.', wijs: ['h1'] },
        { tekst: 'Een bord heeft vier hoeken. Twee lichte en twee donkere.', wijs: ['a1', 'h1', 'h8', 'a8'] },
      ],
      vertelFen: LEEG,
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
          fen: LEEG,
          correct: ['a1', 'h1', 'a8', 'h8'],
          vraag: 'Tik alle vier de hoeken van het bord aan.',
          foutTip: 'Een hoek is een veld waar twee randen samenkomen.',
        },
        {
          kind: 'tapSquares',
          fen: LEEG,
          // h1 en a8 zijn de lichte hoeken; a1 en h8 de donkere. Dat is geen toeval
          // maar de reden dat "wit rechtsonder" werkt.
          correct: ['h1', 'a8'],
          vraag: 'Twee hoeken zijn licht. Tik die twee aan.',
          foutTip: 'Zoek de zandkleurige hoeken, niet de groene.',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Welk veld is rechtsonder?',
          opties: [
            { label: 'een licht veld', veld: 'licht', goed: true },
            { label: 'een donker veld', veld: 'donker' },
          ],
          foutTip: 'Wit rechts! Rechtsonder is licht.',
        },
        {
          kind: 'tapSquares',
          fen: LEEG,
          correct: ['a1'],
          vraag: 'En het veld linksonder? Tik dat aan.',
          foutTip: 'Helemaal onderaan, aan de andere kant.',
        },
      ],
      themas: ['bord', 'opstelling'],
    },
  ],
}
