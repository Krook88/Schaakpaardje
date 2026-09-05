import { type World } from '../types'

/**
 * Wereld 2 — Loperbos.
 * De loper is net zo eenvoudig als de toren, maar dan schuin. Belangrijk inzicht
 * voor later: een loper blijft zijn hele leven op dezelfde veldkleur.
 */
export const wereld2: World = {
  id: 'loper',
  nummer: 2,
  naam: 'Loperbos',
  emoji: '🌲',
  belofte: 'De loper glijdt schuin door het bos.',
  minLeeftijd: 3,
  minispel: 'vang-de-vlag',
  lessen: [
    {
      id: 'loper-1',
      wereldId: 'loper',
      titel: 'De loper gaat schuin',
      doel: 'Je kind weet dat de loper alleen schuin loopt.',
      geleerd: 'Nu weet je hoe de loper loopt: altijd schuin.',
      vertel: [
        'Dit is de loper. Hij loopt alleen schuin.',
        'Naar voren schuin, naar achteren schuin. Zo ver als hij wil.',
        'Recht vooruit? Nee. Dat is voor de toren.',
      ],
      vertelFen: '8/8/8/8/4B3/8/8/8',
      vertelWijs: ['h7', 'a8', 'b1', 'h1'],
      meedoen: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/4B3/8/8/8',
          from: 'e4',
          vraag: 'Tik alle velden aan waar de loper heen kan.',
        },
      ],
      zelf: [
        {
          kind: 'move',
          fen: '8/8/8/8/4B3/8/8/8',
          from: 'e4',
          goed: ['a8', 'b7', 'c6', 'd5'],
          vraag: 'Laat de loper schuin naar linksboven glijden.',
          foutTip: 'Linksboven: steeds eentje naar links en eentje omhoog.',
        },
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/8/8/8/2B5',
          from: 'c1',
          vraag: 'Deze loper staat op de onderste rij. Waar kan hij heen?',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Hoe loopt de loper?',
          opties: [
            { label: 'schuin', emoji: '✖️', goed: true },
            { label: 'kaarsrecht', emoji: '➕' },
            { label: 'in een L', emoji: '🐴' },
          ],
        },
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/8/8/8/B7',
          from: 'a1',
          vraag: 'Vanuit de hoek: tik alle velden van de loper aan.',
        },
      ],
      themas: ['loper', 'diagonaal', 'bordvisie'],
    },
    {
      id: 'loper-2',
      wereldId: 'loper',
      titel: 'Altijd dezelfde kleur',
      doel: 'Je kind ziet dat een loper nooit van veldkleur wisselt.',
      geleerd: 'Nu weet je dat een loper zijn kleur nooit kwijtraakt.',
      vertel: [
        'Let eens op iets grappigs.',
        'Een loper die op een donker veld staat, komt nooit op een licht veld.',
        'Daarom heb je er twee: eentje voor de lichte velden en eentje voor de donkere.',
      ],
      vertelFen: '8/8/8/8/8/8/1P6/2B5',
      meedoen: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/8/8/1P6/2B5',
          from: 'c1',
          vraag: 'Eén kant is dicht. Waar kan de loper nog heen?',
        },
      ],
      zelf: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/3B4/8/8/8',
          from: 'd4',
          vraag: 'Deze loper staat op een donker veld. Tik zijn velden aan.',
        },
        {
          kind: 'quiz',
          vraag: 'Een loper op een donker veld komt op...',
          opties: [
            { label: 'alleen donkere velden', emoji: '🟩', goed: true },
            { label: 'alle velden', emoji: '🌈' },
            { label: 'alleen lichte velden', emoji: '⬜' },
          ],
          foutTip: 'Schuin lopen betekent: altijd dezelfde kleur.',
        },
      ],
      toets: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/8/8/5P2/4B3',
          from: 'e1',
          vraag: 'Er staat een eigen pion schuin voor hem. Waar kan hij heen?',
        },
        {
          kind: 'quiz',
          vraag: 'Hoeveel lopers heeft elke speler aan het begin?',
          opties: [
            { label: 'twee', emoji: '2️⃣', goed: true },
            { label: 'één', emoji: '1️⃣' },
            { label: 'vier', emoji: '4️⃣' },
          ],
        },
      ],
      themas: ['loper', 'veldkleur'],
    },
    {
      id: 'loper-3',
      wereldId: 'loper',
      titel: 'Schuin slaan',
      doel: 'Je kind slaat met de loper over een diagonaal.',
      geleerd: 'Nu sla jij een stuk met je loper.',
      vertel: [
        'Slaan doet de loper ook schuin. Hoe kan het ook anders.',
        'Hij glijdt over de diagonaal tot hij bij het stuk is, en pakt het.',
        'Let op: hij stopt bij het eerste stuk. Wat erachter staat blijft staan.',
      ],
      vertelFen: '8/8/p7/8/2n5/8/8/5B2',
      vertelWijs: ['c4', 'a6'],
      meedoen: [
        {
          kind: 'move',
          fen: '8/8/p7/8/2n5/8/8/5B2',
          from: 'f1',
          goed: ['c4'],
          vraag: 'Pak het zwarte paard met je loper.',
          foutTip: 'Glijd schuin omhoog naar links tot je bij het paard bent.',
        },
      ],
      zelf: [
        {
          kind: 'captureAll',
          fen: '8/8/8/8/8/3p4/8/1B6',
          from: 'b1',
          vraag: 'Sla de zwarte pion.',
        },
        {
          kind: 'captureAll',
          fen: '8/8/8/p7/8/2p5/8/4B3',
          from: 'e1',
          vraag: 'Twee pionnen op één diagonaal. Sla ze allebei.',
        },
      ],
      toets: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/2p5/8/4B3/8',
          from: 'e2',
          vraag: 'Waar kan deze loper heen? De zwarte pion mag je pakken.',
        },
        {
          kind: 'quiz',
          vraag: 'Twee zwarte stukken staan achter elkaar op de diagonaal. Wat pakt de loper?',
          opties: [
            { label: 'alleen de eerste', emoji: '1️⃣', goed: true },
            { label: 'allebei tegelijk', emoji: '2️⃣' },
          ],
          foutTip: 'Je slaat er altijd maar één per zet. De loper stopt bij het eerste stuk.',
        },
      ],
      themas: ['loper', 'slaan', 'diagonaal'],
    },
  ],
}
