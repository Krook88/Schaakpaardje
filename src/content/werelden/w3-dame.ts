import { type World } from '../types'

/**
 * Wereld 3 — Damepaleis.
 * Bewust ná toren en loper: de dame is dan geen nieuw stuk maar een optelsom.
 * "Alles wat de toren kan, plus alles wat de loper kan."
 */
export const wereld3: World = {
  id: 'dame',
  nummer: 3,
  naam: 'Damepaleis',
  emoji: '👑',
  belofte: 'De dame kan alles. Bijna.',
  minLeeftijd: 5,
  minispel: 'dame-doolhof',
  lessen: [
    {
      id: 'dame-1',
      wereldId: 'dame',
      titel: 'Recht én schuin',
      icoon: '✳️',
      doel: 'Je kind ziet dat de dame de toren en de loper bij elkaar is.',
      geleerd: 'Nu weet je waarom de dame het sterkste stuk is.',
      vertel: [
        'Dit is de dame. Zij is het sterkste stuk van het bord.',
        'Weet je waarom? Ze kan alles wat de toren kan: kaarsrecht.',
        'En alles wat de loper kan: schuin. Samen dus alle kanten op.',
      ],
      vertelFen: '8/8/8/8/3Q4/8/8/8',
      meedoen: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/3Q4/8/8/8',
          from: 'd4',
          vraag: 'Tik alle velden aan waar de dame heen kan. Het zijn er veel!',
        },
      ],
      zelf: [
        {
          kind: 'move',
          fen: '8/8/8/8/3Q4/8/8/8',
          from: 'd4',
          goed: ['a7', 'b6', 'c5'],
          vraag: 'Laat de dame schuin naar linksboven gaan.',
        },
        {
          kind: 'move',
          fen: '8/8/8/8/3Q4/8/8/8',
          from: 'd4',
          goed: ['d8', 'd7', 'd6', 'd5'],
          vraag: 'En nu kaarsrecht omhoog.',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'De dame is...',
          opties: [
            { label: 'toren én loper samen', emoji: '👑', goed: true },
            { label: 'een groot paard', emoji: '🐴' },
            { label: 'een dubbele toren', emoji: '🏰' },
          ],
        },
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/8/8/8/Q7',
          from: 'a1',
          vraag: 'Vanuit de hoek kan de dame minder. Tik haar velden aan.',
        },
      ],
      themas: ['dame', 'bordvisie'],
    },
    {
      id: 'dame-2',
      wereldId: 'dame',
      titel: 'De dame stopt ook',
      icoon: '🚧',
      doel: 'Je kind weet dat ook de dame niet door stukken heen kan.',
      geleerd: 'Nu weet je dat ook de dame nergens doorheen kan.',
      vertel: [
        'De dame is sterk, maar toveren kan zij ook niet.',
        'Voor een eigen stuk stopt ze. Een stuk van de tegenstander mag ze pakken.',
        'En met een knik? Nee. Eerst recht en dan schuin in één zet mag niet.',
      ],
      vertelFen: '8/8/4P3/8/1p2Q3/8/8/8',
      vertelWijs: ['e6', 'b4'],
      meedoen: [
        {
          kind: 'tapMoves',
          fen: '8/8/4P3/8/1p2Q3/8/8/8',
          from: 'e4',
          vraag: 'De witte pion is van jou, de zwarte niet. Waar kan de dame heen?',
        },
      ],
      zelf: [
        {
          kind: 'move',
          fen: '8/8/4P3/8/1p2Q3/8/8/8',
          from: 'e4',
          goed: ['b4'],
          vraag: 'Pak de zwarte pion met je dame.',
        },
        {
          kind: 'quiz',
          vraag: 'Mag de dame in één zet eerst recht en dan schuin?',
          opties: [
            { label: 'nee, dat is een knik', emoji: '🚫', goed: true },
            { label: 'ja, zij mag alles', emoji: '👑' },
          ],
          foutTip: 'Eén zet is één rechte lijn. Recht óf schuin, niet allebei.',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'De dame staat helemaal ingesloten door haar eigen pionnen. Waar kan ze heen?',
          opties: [
            { label: 'nergens', emoji: '🛑', goed: true },
            { label: 'overal', emoji: '🌈' },
            { label: 'ze springt eroverheen', emoji: '🦘' },
          ],
          foutTip: 'Springen kan alleen het paard. De dame zit echt vast.',
        },
        {
          kind: 'captureAll',
          fen: '8/8/8/8/3p4/8/8/3Q4',
          from: 'd1',
          vraag: 'Sla de zwarte pion.',
        },
      ],
      themas: ['dame', 'blokkade', 'slaan'],
    },
    {
      id: 'dame-3',
      wereldId: 'dame',
      titel: 'Pas op met je dame',
      icoon: '💎',
      doel: 'Je kind begrijpt dat de dame kostbaar is en niet zomaar te grabbel ligt.',
      geleerd: 'Nu ben jij zuinig op je dame.',
      vertel: [
        'De dame is je duurste stuk. Wees er zuinig op.',
        'Als jij haar naast een stuk van de tegenstander zet, kan hij haar zomaar pakken.',
        'Kijk dus altijd even: staat ze veilig?',
      ],
      vertelFen: '8/8/8/3Q4/8/2n5/8/8',
      vertelWijs: ['d5', 'c3'],
      meedoen: [
        {
          kind: 'quiz',
          vraag: 'Het zwarte paard kan je dame pakken. Wat doe je?',
          opties: [
            { label: 'de dame wegzetten', emoji: '🏃', goed: true },
            { label: 'gewoon iets anders doen', emoji: '🤷' },
          ],
          foutTip: 'Als je niets doet ben je je dame kwijt. Zet haar in veiligheid.',
        },
      ],
      zelf: [
        {
          kind: 'move',
          fen: '8/8/8/3Q4/8/2n5/8/8',
          from: 'd5',
          goed: [
            'a5', 'a8', 'b3', 'b7', 'c4', 'c5', 'c6', 'd2', 'd3', 'd4', 'd6', 'd7', 'd8',
            'e5', 'e6', 'f3', 'f5', 'f7', 'g2', 'g5', 'g8', 'h1', 'h5',
          ],
          bedoeling: 'veilig',
          vraag: 'Zet je dame ergens neer waar het paard haar niet kan pakken.',
          foutTip: 'Het paard springt in een L. Tel even na waar hij bij kan.',
        },
        {
          kind: 'captureAll',
          fen: '8/8/8/8/8/2p5/8/2Q5',
          from: 'c1',
          vraag: 'Deze pion staat er gratis bij. Pak hem.',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Wat is de dame waard?',
          opties: [
            { label: 'het meest van allemaal', emoji: '👑', goed: true },
            { label: 'net zoveel als een pion', emoji: '♟️' },
            { label: 'minder dan een toren', emoji: '🏰' },
          ],
        },
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/8/8/8/3Q4',
          from: 'd1',
          vraag: 'Laatste keer: tik alle velden van de dame aan.',
        },
      ],
      themas: ['dame', 'veiligheid', 'waarde'],
    },
  ],
}
