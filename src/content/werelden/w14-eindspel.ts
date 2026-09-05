import { type World } from '../types'

/**
 * Wereld 14 — Eindspelduinen.
 * De laatste wereld: er staan bijna geen stukken meer op het bord, en juist dan moet je
 * weten wat je doet. Mat met dame, mat met toren, en een pion naar de overkant brengen.
 * Hier wordt de koning ineens een sterk stuk in plaats van iets om te beschermen.
 */
export const wereld14: World = {
  id: 'eindspel',
  nummer: 14,
  naam: 'Eindspelduinen',
  emoji: '🏜️',
  belofte: 'Bijna niets meer op het bord. Nu moet je het afmaken.',
  minLeeftijd: 9,
  minispel: 'laatste-pion',
  diploma: 'goud',
  lessen: [
    {
      id: 'eindspel-1',
      wereldId: 'eindspel',
      titel: 'De koning doet mee',
      icoon: '🤴',
      doel: 'Je kind weet dat de koning in het eindspel een sterk stuk is.',
      geleerd: 'Nu laat jij je koning meespelen aan het eind.',
      vertel: [
        'Aan het eind van de partij is het bord bijna leeg. En dan verandert er iets.',
        'De koning hoeft zich niet meer te verstoppen. Hij mag naar voren, want er is bijna niemand meer die hem aanvalt.',
        'Een koning in het midden is in het eindspel juist heel sterk.',
        'Staan de twee koningen recht tegenover elkaar met één veld ertussen? Dat heet de oppositie. Wie dan moet zetten, moet opzij.',
      ],
      vertelFen: '8/8/8/3K4/8/8/8/7k',
      meedoen: [
        {
          kind: 'quiz',
          vraag: 'Waar staat je koning in het eindspel het liefst?',
          opties: [
            { label: 'in het midden, waar hij meedoet', emoji: '🎯', goed: true },
            { label: 'veilig in de hoek', emoji: '🧱' },
            { label: 'achter zijn pionnen', emoji: '🛡️' },
          ],
          foutTip: 'In het begin verstop je hem. Aan het eind laat je hem juist meespelen.',
        },
      ],
      zelf: [
        {
          // Zonder zwarte koning op het bord: de meetkundige motor kent de regel
          // "koningen nooit naast elkaar" niet, en liet wit anders vrolijk naar h1
          // wandelen om hem op te eten. Dat spreekt koning-3 tegen.
          kind: 'reach',
          fen: '8/8/8/8/8/8/8/K7',
          from: 'a1',
          doel: 'd4',
          vraag: 'Breng je koning naar het midden.',
        },
        {
          kind: 'quiz',
          vraag: 'Twee koningen staan tegenover elkaar met één veld ertussen. Wie moet er wijken?',
          opties: [
            { label: 'degene die aan zet is', emoji: '👣', goed: true },
            { label: 'de zwarte koning', emoji: '♚' },
            { label: 'niemand', emoji: '🤝' },
          ],
          foutTip: 'Dat heet de oppositie: wie moet zetten, moet opzij. Handig om te weten.',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Hoe heet het als de koningen recht tegenover elkaar staan met één veld ertussen?',
          opties: [
            { label: 'de oppositie', emoji: '🤺', goed: true },
            { label: 'de rokade', emoji: '🏯' },
            { label: 'de penning', emoji: '📌' },
          ],
        },
        {
          kind: 'reach',
          fen: '8/8/8/8/8/8/8/K7',
          from: 'a1',
          doel: 'e5',
          vraag: 'Loop met je koning naar e5.',
        },
      ],
      themas: ['eindspel', 'koning', 'oppositie'],
    },
    {
      id: 'eindspel-2',
      wereldId: 'eindspel',
      titel: 'Mat met dame en met toren',
      icoon: '👸',
      doel: 'Je kind zet mat met koning plus dame, en met koning plus toren.',
      geleerd: 'Nu zet jij mat met je dame én met je toren.',
      vertel: [
        'Met alleen een dame of een toren erbij kun je mat zetten. Maar je koning moet helpen.',
        'Het idee is altijd hetzelfde: je duwt zijn koning naar de rand, en dan naar de hoek.',
        'Je eigen koning bewaakt de velden waar hij heen zou willen.',
      ],
      vertelFen: '5K2/7k/8/Q7/8/8/8/8',
      meedoen: [
        {
          kind: 'regelZet',
          fen: '5K2/7k/8/Q7/8/8/8/8 w - - 0 1',
          eis: 'matIn1',
          vraag: 'Zet mat met je dame. Je koning dekt de vluchtvelden al.',
          foutTip: 'Zijn koning kan nog naar boven en naar beneden. Kom op zijn lijn, dan dek je ook g6.',
        },
      ],
      zelf: [
        {
          kind: 'regelZet',
          fen: '5R2/8/8/8/8/8/8/k1K5 w - - 0 1',
          eis: 'matIn1',
          vraag: 'En nu met de toren. Zet mat in één.',
          foutTip: 'Jouw koning bewaakt b1 en b2. Geef schaak op de lijn waar zijn koning staat.',
        },
        {
          kind: 'quiz',
          vraag: 'Waar duw je de vijandelijke koning naartoe om mat te zetten?',
          opties: [
            { label: 'naar de rand en dan de hoek', emoji: '📐', goed: true },
            { label: 'naar het midden', emoji: '🎯' },
            { label: 'dat maakt niet uit', emoji: '🤔' },
          ],
        },
      ],
      toets: [
        {
          kind: 'regelZet',
          fen: '2Q5/8/8/8/8/6K1/8/6k1 w - - 0 1',
          eis: 'matIn1',
          vraag: 'Maak het af: mat in één.',
          foutTip: 'Jouw koning dekt de velden erboven al. Geef schaak op de onderste rij.',
        },
        {
          kind: 'quiz',
          vraag: 'Kun je mat zetten met alleen je koning?',
          opties: [
            { label: 'nee, je hebt hulp nodig', emoji: '🚫', goed: true },
            { label: 'ja, als je goed loopt', emoji: '🚶' },
          ],
          foutTip: 'Alleen met je koning lukt het nooit. Je hebt er minstens één stuk of pion bij nodig.',
        },
      ],
      themas: ['eindspel', 'mat'],
    },
    {
      id: 'eindspel-3',
      wereldId: 'eindspel',
      titel: 'De laatste pion',
      icoon: '🌱',
      doel: 'Je kind brengt een pion naar de overkant en maakt er een dame van.',
      geleerd: 'Nu breng jij die laatste pion naar de overkant.',
      vertel: [
        'Eén pion kan een hele partij winnen. Als hij de overkant haalt tenminste.',
        'Loop hem naar boven, stap voor stap. En laat je koning meelopen als schild.',
        'Op de laatste rij wordt hij dame. En met een dame erbij win je bijna altijd.',
      ],
      vertelFen: '4k3/8/8/8/8/8/1P6/4K3',
      vertelWijs: ['b8'],
      meedoen: [
        {
          kind: 'reach',
          fen: '4k3/8/8/8/8/8/1P6/4K3',
          from: 'b2',
          doel: 'b8',
          vraag: 'Breng je pion naar de overkant.',
        },
      ],
      zelf: [
        {
          kind: 'reach',
          fen: '4k3/8/8/8/8/8/6P1/4K3',
          from: 'g2',
          doel: 'g8',
          vraag: 'Nog een pion naar de overkant. Denk aan de dubbelstap!',
        },
        {
          kind: 'quiz',
          vraag: 'Waarom is een pion in het eindspel zo belangrijk?',
          opties: [
            { label: 'omdat hij dame kan worden', emoji: '👑', goed: true },
            { label: 'omdat hij zo snel is', emoji: '💨' },
            { label: 'dat is hij niet', emoji: '🙃' },
          ],
        },
      ],
      toets: [
        {
          kind: 'reach',
          fen: '4k3/8/8/8/8/8/3P4/4K3',
          from: 'd2',
          doel: 'd8',
          vraag: 'Laatste opdracht van de reis: breng deze pion naar de overkant.',
        },
        {
          kind: 'quiz',
          vraag: 'Je pion bereikt de laatste rij. Wat kies je meestal?',
          opties: [
            { label: 'een dame', emoji: '👑', goed: true },
            { label: 'een paard', emoji: '🐴' },
            { label: 'niets, hij blijft pion', emoji: '♟️' },
          ],
          foutTip: 'De dame is het sterkste stuk. Kies er bijna altijd eentje.',
        },
      ],
      themas: ['eindspel', 'promotie'],
    },
  ],
}
