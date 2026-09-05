import { type World } from '../types'

/**
 * Wereld 4 — Paardenstal. De thuiswereld van Pip.
 * Het paard komt bewust pas als vierde stuk: de L-sprong is voor kinderen veruit het
 * moeilijkst. Wie eerst toren, loper en dame kent, heeft genoeg bordvisie om hem aan te
 * kunnen.
 */
export const wereld4: World = {
  id: 'paard',
  nummer: 4,
  naam: 'Paardenstal',
  emoji: '🐴',
  belofte: 'Mijn eigen wereld! Ik spring in een L.',
  minLeeftijd: 5,
  minispel: 'hongerig-paardje',
  lessen: [
    {
      id: 'paard-1',
      wereldId: 'paard',
      titel: 'Ik spring in een L',
      icoon: '🇱',
      doel: 'Je kind kent de L-sprong van het paard.',
      geleerd: 'Nu ken je de L-sprong van het paard.',
      vertel: [
        'Dit ben ik! Het paard. Ik loop niet, ik spring.',
        'Kijk mee: twee velden rechtdoor, en dan één opzij. Dat is een L.',
        'Zo kan ik naar acht velden tegelijk. Als ik in het midden sta tenminste.',
      ],
      vertelFen: '8/8/8/4N3/8/8/8/8',
      vertelWijs: ['d7', 'f7', 'c6', 'g6', 'c4', 'g4', 'd3', 'f3'],
      meedoen: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/4N3/8/8/8/8',
          from: 'e5',
          vraag: 'Tik alle acht velden aan waar ik heen kan springen.',
        },
      ],
      zelf: [
        {
          kind: 'move',
          fen: '8/8/8/4N3/8/8/8/8',
          from: 'e5',
          goed: ['d7', 'f7'],
          vraag: 'Spring eens naar boven. Twee omhoog en één opzij.',
          foutTip: 'Tel hardop mee: één, twee omhoog... en dan één opzij.',
        },
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/8/8/8/N7',
          from: 'a1',
          vraag: 'In de hoek kan ik veel minder. Waar kan ik nu heen?',
        },
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/8/8/8/4N3',
          from: 'e1',
          vraag: 'En aan de rand? Tik mijn velden aan.',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Hoe springt het paard?',
          opties: [
            { label: 'in een L', emoji: '🐴', goed: true },
            { label: 'kaarsrecht', emoji: '➕' },
            { label: 'schuin', emoji: '✖️' },
          ],
        },
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/2N5/8/8/8',
          from: 'c4',
          vraag: 'Tik alle velden aan waar dit paard heen kan.',
        },
      ],
      themas: ['paard', 'bordvisie'],
    },
    {
      id: 'paard-2',
      wereldId: 'paard',
      titel: 'Over de heg',
      icoon: '🌿',
      doel: 'Je kind weet dat alleen het paard over stukken heen springt.',
      geleerd: 'Nu weet je dat alleen het paard over stukken heen springt.',
      vertel: [
        'Nu iets wat alleen ik kan.',
        'Staan er stukken in de weg? Ik spring er gewoon overheen!',
        'De toren, de loper en de dame moeten er allemaal omheen. Ik niet.',
      ],
      vertelFen: '8/8/8/3PPP2/3PNP2/3PPP2/8/8',
      meedoen: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/3PPP2/3PNP2/3PPP2/8/8',
          from: 'e4',
          vraag: 'Ik sta helemaal ingesloten. Toch kan ik weg. Tik mijn velden aan.',
        },
      ],
      zelf: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/8/8/PPP5/N7',
          from: 'a1',
          vraag: 'Ik sta in de hoek achter mijn eigen pionnen. Waar kan ik heen?',
        },
        {
          kind: 'quiz',
          vraag: 'Wie kan er over stukken heen springen?',
          opties: [
            { label: 'alleen het paard', emoji: '🐴', goed: true },
            { label: 'de dame ook', emoji: '👑' },
            { label: 'iedereen', emoji: '🌈' },
          ],
        },
      ],
      toets: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/2ppp3/2pNp3/2ppp3/8/8',
          from: 'd4',
          vraag: 'Nu staan er zwarte pionnen om me heen. Waar kan ik heen?',
        },
        {
          kind: 'quiz',
          vraag: 'Het paard springt over een stuk heen. Wordt dat stuk geslagen?',
          opties: [
            { label: 'nee, het blijft gewoon staan', emoji: '🙂', goed: true },
            { label: 'ja, alles eronder gaat eraf', emoji: '💥' },
          ],
          foutTip: 'Je slaat alleen het stuk op het veld waar je landt.',
        },
      ],
      themas: ['paard', 'springen'],
    },
    {
      id: 'paard-3',
      wereldId: 'paard',
      titel: 'Hongerig paardje',
      icoon: '🥕',
      doel: 'Je kind plant meerdere paardensprongen achter elkaar.',
      geleerd: 'Nu spring jij met het paard van hapje naar hapje.',
      vertel: [
        'Ik heb honger! Er liggen wortels op het bord. Nou ja, pionnen dan.',
        'Spring van pion naar pion. Elke sprong moet raak zijn.',
        'Kijk eerst even welke volgorde werkt. Anders sta je vast.',
      ],
      vertelFen: '8/3p4/8/2p5/8/1p6/8/N7',
      meedoen: [
        {
          kind: 'captureAll',
          fen: '8/8/8/8/8/1p6/8/N7',
          from: 'a1',
          elkeZetRaak: true,
          vraag: 'Eén pion om te beginnen. Spring erop.',
        },
      ],
      zelf: [
        {
          kind: 'captureAll',
          fen: '8/8/8/2p5/8/1p6/8/N7',
          from: 'a1',
          elkeZetRaak: true,
          vraag: 'Nu twee. Elke sprong moet raak zijn!',
        },
        {
          kind: 'captureAll',
          fen: '8/3p4/8/2p5/8/1p6/8/N7',
          from: 'a1',
          elkeZetRaak: true,
          vraag: 'En nu drie op een rij. Jij kunt dit.',
        },
      ],
      toets: [
        {
          kind: 'captureAll',
          fen: '8/4p3/8/5p2/8/6p1/8/7N',
          from: 'h1',
          elkeZetRaak: true,
          vraag: 'Drie wortels. Sla ze allemaal, elke sprong raak.',
        },
      ],
      themas: ['paard', 'planning', 'slaan'],
    },
    {
      id: 'paard-4',
      wereldId: 'paard',
      titel: 'Paardensprong-parcours',
      icoon: '🏁',
      doel: 'Je kind loopt met het paard naar een doelveld.',
      geleerd: 'Nu breng jij het paard naar elk veld dat je wilt.',
      vertel: [
        'Zie je de ster? Daar moet ik heen.',
        'Soms lukt dat niet in één sprong. Dan spring je gewoon nog een keer.',
        'Denk even vooruit: welk veld pak je onderweg?',
      ],
      vertelFen: '8/8/8/8/8/8/8/N7',
      meedoen: [
        {
          kind: 'reach',
          fen: '8/8/8/8/8/8/8/N7',
          from: 'a1',
          doel: 'b3',
          maxZetten: 1,
          vraag: 'Spring naar de ster. Dat kan in één keer.',
        },
      ],
      zelf: [
        {
          kind: 'reach',
          fen: '8/8/8/8/8/8/8/N7',
          from: 'a1',
          doel: 'c5',
          maxZetten: 2,
          vraag: 'Nu naar deze ster. Dat lukt in twee sprongen.',
        },
        {
          kind: 'reach',
          fen: '8/8/8/8/8/8/8/N7',
          from: 'a1',
          doel: 'a2',
          maxZetten: 3,
          vraag: 'Het veld vlak boven me. Grappig genoeg heb ik daar drie sprongen voor nodig.',
        },
      ],
      toets: [
        {
          kind: 'reach',
          fen: '8/8/8/8/8/8/8/N7',
          from: 'a1',
          doel: 'e5',
          maxZetten: 4,
          vraag: 'Helemaal naar het midden. Neem de tijd.',
        },
        {
          kind: 'reach',
          fen: '8/8/8/3PPP2/3PNP2/3PPP2/8/8',
          from: 'e4',
          doel: 'b5',
          maxZetten: 2,
          vraag: 'Spring de stal uit, naar de ster. Dat lukt in twee sprongen.',
        },
      ],
      themas: ['paard', 'planning'],
    },
  ],
}
