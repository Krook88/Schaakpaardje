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
      doel: 'Je kind weet dat de koning in het eindspel een sterk stuk is.',
      vertel: [
        'Aan het eind van de partij is het bord bijna leeg. En dan verandert er iets.',
        'De koning hoeft zich niet meer te verstoppen. Hij mag naar voren, want er is bijna niemand meer die hem aanvalt.',
        'Een koning in het midden is in het eindspel juist heel sterk.',
      ],
      vertelFen: '8/8/8/3K4/8/8/8/7k',
      meedoen: [
        {
          kind: 'quiz',
          vraag: 'Waar staat je koning in het eindspel het liefst?',
          opties: [
            { label: 'in het midden, waar hij meedoet', emoji: '🎯', goed: true },
            { label: 'veilig in de hoek', emoji: '🏯' },
            { label: 'achter zijn pionnen', emoji: '🛡️' },
          ],
          foutTip: 'In het begin verstop je hem. Aan het eind laat je hem juist meespelen.',
        },
      ],
      zelf: [
        {
          kind: 'reach',
          fen: '8/8/8/8/8/8/8/K6k',
          from: 'a1',
          doel: 'd4',
          vraag: 'Breng je koning naar het midden.',
        },
        {
          kind: 'quiz',
          vraag: 'Twee koningen staan tegenover elkaar met één veld ertussen. Wie moet er wijken?',
          opties: [
            { label: 'degene die aan zet is', emoji: '👣', goed: true },
            { label: 'de zwarte koning', emoji: '🖤' },
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
          fen: '8/8/8/8/8/8/8/K6k',
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
      doel: 'Je kind zet mat met koning plus dame, en met koning plus toren.',
      vertel: [
        'Met alleen een dame of een toren erbij kun je mat zetten. Maar je koning moet helpen.',
        'Het idee is altijd hetzelfde: je duwt zijn koning naar de rand, en dan naar de hoek.',
        'Je eigen koning bewaakt de velden waar hij heen zou willen.',
      ],
      vertelFen: 'k7/8/1K6/8/8/8/8/7Q',
      meedoen: [
        {
          kind: 'regelZet',
          fen: 'k7/8/1K6/8/8/8/8/7Q w - - 0 1',
          eis: 'matIn1',
          vraag: 'Zet mat met je dame. Je koning dekt al mee.',
          foutTip: 'Zet je dame vlak naast zijn koning, op een veld dat jouw koning bewaakt.',
        },
      ],
      zelf: [
        {
          kind: 'regelZet',
          fen: '6k1/8/6K1/8/8/8/8/R7 w - - 0 1',
          eis: 'matIn1',
          vraag: 'En nu met de toren. Zet mat in één.',
          foutTip: 'Jouw koning bewaakt f7, g7 en h7. Geef schaak op de achterste rij.',
        },
        {
          kind: 'quiz',
          vraag: 'Waar duw je de vijandelijke koning naartoe om mat te zetten?',
          opties: [
            { label: 'naar de rand en dan de hoek', emoji: '📐', goed: true },
            { label: 'naar het midden', emoji: '🎯' },
            { label: 'dat maakt niet uit', emoji: '🤷' },
          ],
        },
      ],
      toets: [
        {
          kind: 'regelZet',
          fen: '7k/5KP1/8/8/8/8/8/8 w - - 0 1',
          eis: 'matIn1',
          vraag: 'Maak het af: mat in één.',
          foutTip: 'Promoveer je pion. Als dame geeft ze meteen mat.',
        },
        {
          kind: 'quiz',
          vraag: 'Kun je mat zetten met alleen je koning?',
          opties: [
            { label: 'nee, je hebt hulp nodig', emoji: '🚫', goed: true },
            { label: 'ja, als je goed loopt', emoji: '🚶' },
          ],
          foutTip: 'Twee koningen alleen is altijd remise. Je hebt minstens een toren of dame nodig.',
        },
      ],
      themas: ['eindspel', 'mat'],
    },
    {
      id: 'eindspel-3',
      wereldId: 'eindspel',
      titel: 'De laatste pion',
      doel: 'Je kind brengt een pion naar de overkant en maakt er een dame van.',
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
            { label: 'dat is hij niet', emoji: '🤷' },
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
          foutTip: 'De dame is het sterkst. Alleen heel soms is een paard slimmer.',
        },
      ],
      themas: ['eindspel', 'promotie'],
    },
  ],
}
