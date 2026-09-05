import { LEEG, type World } from '../types'
import { pad, wegen } from '../velden'

/**
 * Wereld 1 — Torenburcht.
 * De toren is het eerste stuk, want hij is het makkelijkst: kaarsrecht, meer niet.
 * Dit is meteen de eerste kennismaking met "waar mag een stuk heen" — bordvisie.
 */
export const wereld1: World = {
  id: 'toren',
  nummer: 1,
  naam: 'Torenburcht',
  emoji: '🏰',
  toon: 12,
  belofte: 'Hier woont de toren. Die loopt kaarsrecht.',
  minLeeftijd: 3,
  minispel: 'torenjacht',
  lessen: [
    {
      id: 'toren-1',
      wereldId: 'toren',
      titel: 'De toren loopt recht',
      icoon: '➕',
      doel: 'Je kind weet dat de toren recht loopt, zo ver hij wil.',
      geleerd: 'Nu weet je precies hoe de toren loopt: kaarsrecht, zo ver hij wil.',
      vertel: [
        // Vier oplichtende hoekpunten lieten zien wáár de toren kan komen, maar niet
        // hóe hij daar komt — en dat is nu juist wat "kaarsrecht" betekent. De velden
        // lichten nu één voor één op, dus het kind ziet de toren de lijn af rijden
        // terwijl Pip het zegt.
        { tekst: 'Dit is de toren. Hij loopt kaarsrecht.', wijs: pad('e4', 'e8') },
        {
          tekst: 'Vooruit, achteruit, naar links en naar rechts. Zo ver als hij wil.',
          wijs: wegen(pad('e4', 'e8'), pad('e4', 'e1'), pad('e4', 'a4'), pad('e4', 'h4')),
        },
        // Bij "nooit schuin" wijzen we niets aan: een oplichtende diagonaal is precies
        // het beeld dat een kind onthoudt, ook al zegt de zin erbij dat het niet mag.
        'Maar nooit schuin. Schuin kan de toren echt niet.',
      ],
      vertelFen: '8/8/8/8/4R3/8/8/8',
      meedoen: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/4R3/8/8/8',
          from: 'e4',
          vraag: 'Tik alle velden aan waar de toren heen kan.',
        },
      ],
      zelf: [
        {
          kind: 'move',
          fen: '8/8/8/8/4R3/8/8/8',
          from: 'e4',
          goed: ['e8', 'e7', 'e6', 'e5'],
          vraag: 'Zet de toren eens omhoog.',
          foutTip: 'Omhoog is recht naar boven, in dezelfde lijn.',
        },
        {
          kind: 'move',
          fen: '8/8/8/8/8/8/8/R7',
          from: 'a1',
          goed: ['h1'],
          vraag: 'Laat de toren helemaal naar de andere kant van de onderste rij lopen.',
        },
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/8/8/8/R7',
          from: 'a1',
          vraag: 'Vanuit de hoek: waar kan de toren nu allemaal heen?',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Hoe loopt de toren?',
          opties: [
            { label: 'kaarsrecht', emoji: '➕', goed: true },
            { label: 'schuin', emoji: '✖️' },
            { label: 'met een sprongetje', emoji: '🐴' },
          ],
        },
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/8/8/2R5/8',
          from: 'c2',
          vraag: 'Tik alle velden aan waar deze toren heen kan.',
        },
      ],
      themas: ['toren', 'bordvisie'],
    },
    {
      id: 'toren-2',
      wereldId: 'toren',
      titel: 'Niet door stukken heen',
      icoon: '🧱',
      doel: 'Je kind ziet dat de toren stopt voor een eigen stuk.',
      geleerd: 'Nu zie je waar de toren moet stoppen.',
      vertel: [
        'De toren is sterk, maar hij kan niet toveren.',
        // Het spoor loopt tot vlák voor de eigen pion en houdt daar op. Dat is de hele
        // les, en je ziet hem stoppen in plaats van dat je het hoort.
        {
          tekst: 'Staat er een eigen stuk in de weg? Dan stopt hij ervoor.',
          wijs: wegen(pad('e4', 'e5'), pad('e4', 'd4')),
        },
        'Hij springt nergens overheen. Dat kan alleen ik!',
      ],
      vertelFen: '8/8/4P3/8/2P1R3/8/8/8',
      meedoen: [
        {
          kind: 'tapMoves',
          fen: '8/8/4P3/8/2P1R3/8/8/8',
          from: 'e4',
          vraag: 'De pionnen zijn van jou. Waar kan de toren nu nog heen?',
        },
      ],
      zelf: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/R2P4/8/8/8',
          from: 'a4',
          vraag: 'Deze toren staat achter een eigen pion. Tik zijn velden aan.',
        },
        {
          kind: 'move',
          fen: '8/8/4P3/8/2P1R3/8/8/8',
          from: 'e4',
          goed: ['e5'],
          vraag: 'Zet de toren zo dicht mogelijk naar de pion boven hem toe.',
          foutTip: 'Zo dicht mogelijk: het veld vlak vóór de pion.',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Er staat een eigen pion in de weg. Wat doet de toren?',
          opties: [
            { label: 'hij stopt ervoor', emoji: '🚧', goed: true },
            { label: 'hij springt eroverheen', emoji: '🐴' },
            { label: 'hij slaat zijn eigen pion', emoji: '😬' },
          ],
          foutTip: 'Je eigen stukken sla je nooit. De toren stopt er netjes voor.',
        },
        {
          kind: 'tapMoves',
          fen: '8/8/8/3P4/3R4/3P4/8/8',
          from: 'd4',
          vraag: 'Deze toren zit klem tussen twee eigen pionnen. Waar kan hij heen?',
        },
      ],
      themas: ['toren', 'blokkade', 'bordvisie'],
    },
    {
      id: 'toren-3',
      wereldId: 'toren',
      titel: 'Pak dat stuk',
      icoon: '🍽️',
      doel: 'Je kind slaat een vijandelijk stuk met de toren.',
      geleerd: 'Nu pak jij een stuk met je toren.',
      vertel: [
        {
          tekst: 'Staat er een stuk van de tegenstander in de weg? Dan mag je hem pakken!',
          wijs: pad('e4', 'e7'),
        },
        // Het spoor eindigt op het veld van de pion zelf, want dáár komt de toren te
        // staan. Bij het slaan is dat het enige wat je goed moet zien.
        {
          tekst: 'Je zet je toren op zijn veld, en zijn stuk gaat van het bord af.',
          wijs: ['e7'],
        },
        { tekst: 'Slaan doe je op het veld waar hij staat. Niet erlangs.', wijs: pad('e4', 'b4') },
      ],
      vertelFen: '8/4p3/8/8/1p2R3/8/8/8',
      meedoen: [
        {
          kind: 'move',
          fen: '8/4p3/8/8/1p2R3/8/8/8',
          from: 'e4',
          goed: ['e7'],
          vraag: 'Pak de zwarte pion die boven de toren staat.',
          foutTip: 'Je gaat naar het veld waar de pion staat, en hij is van het bord.',
        },
      ],
      zelf: [
        {
          kind: 'move',
          fen: '8/4p3/8/8/1p2R3/8/8/8',
          from: 'e4',
          goed: ['b4'],
          vraag: 'En nu die andere: pak de pion links van de toren.',
        },
        {
          kind: 'captureAll',
          fen: '8/8/8/8/R2p4/8/3p4/8',
          from: 'a4',
          vraag: 'Sla alle zwarte pionnen. Neem rustig de tijd.',
        },
      ],
      toets: [
        {
          kind: 'captureAll',
          fen: '8/8/2p5/8/2R2p2/8/8/8',
          from: 'c4',
          vraag: 'Twee pionnen. Sla ze allebei op.',
        },
        {
          kind: 'quiz',
          vraag: 'Hoe sla je een stuk?',
          opties: [
            { label: 'je gaat op zijn veld staan', emoji: '👣', goed: true },
            { label: 'je springt eroverheen', emoji: '🐴' },
            { label: 'je gaat ernaast staan', emoji: '↔️' },
          ],
        },
      ],
      themas: ['toren', 'slaan'],
    },
  ],
}
