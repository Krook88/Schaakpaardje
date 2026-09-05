import { type World } from '../types'

/**
 * Wereld 9 — Schaakmeer.
 *
 * De eerste wereld die de échte schaakregels nodig heeft. Tot hier kon de app
 * meetkundig rekenen: waar mag dit stuk heen. Vanaf schaak telt ook wat er ná de zet
 * gebeurt, en mag een zet die je koning laat staan gewoon niet meer. Daarom gebruiken
 * deze opgaven het type 'regelZet', dat op chess.js draait.
 *
 * Belangrijk voor de didactiek: uit schaak gaan kan op drie manieren, en die zijn alle
 * drie goed. Een opgave met één "juist" veld zou hier dus fout onderwijs zijn — de eis
 * is wat de zet bereikt, niet welk veld het is.
 */
export const wereld9: World = {
  id: 'schaak',
  nummer: 9,
  naam: 'Schaakmeer',
  emoji: '⚡',
  belofte: 'Pas op de koning! Hier leer je schaak.',
  minLeeftijd: 7,
  minispel: 'schaak-alarm',
  lessen: [
    {
      id: 'schaak-1',
      wereldId: 'schaak',
      titel: 'Wat is schaak?',
      icoon: '⚡',
      doel: 'Je kind herkent wanneer een koning wordt aangevallen.',
      geleerd: 'Nu zie je meteen wanneer een koning schaak staat.',
      vertel: [
        'Nu wordt het spannend. Weet je nog van de Aanvalsberg? Een stuk kan aangevallen worden.',
        'Als dat de koning is, heeft het een eigen naam: dan staat hij schaak.',
        'En schaak mag je nooit laten staan. Je moet er meteen iets aan doen.',
      ],
      vertelFen: '4k3/8/8/8/8/8/8/4R1K1',
      vertelWijs: ['e8'],
      meedoen: [
        {
          kind: 'tapSquares',
          fen: '4k3/8/8/8/8/8/8/4R1K1',
          correct: ['e8'],
          bedoeling: { soort: 'schaak' },
          vraag: 'Welke koning staat schaak? Tik hem aan.',
          foutTip: 'Volg de lijn van de witte toren omhoog. Wie staat daar bovenaan?',
        },
      ],
      zelf: [
        {
          kind: 'quiz',
          vraag: 'Wat betekent schaak?',
          opties: [
            { label: 'de koning wordt aangevallen', emoji: '⚡', goed: true },
            { label: 'de koning is geslagen', emoji: '💀' },
            { label: 'de partij is afgelopen', emoji: '🏁' },
          ],
          foutTip: 'Een koning wordt nooit echt geslagen. Hij wordt aangevallen, en dan moet je iets doen.',
        },
        {
          kind: 'quiz',
          vraag: 'Je staat schaak. Mag je iets anders doen?',
          opties: [
            { label: 'nee, je moet het schaak oplossen', emoji: '🚫', goed: true },
            { label: 'ja, je mag elke zet doen', emoji: '🤷' },
          ],
          foutTip: 'Schaak gaat altijd voor. Alle andere zetten mogen even niet.',
        },
        {
          kind: 'tapSquares',
          fen: '7k/8/8/8/8/6q1/8/4K3',
          correct: ['e1'],
          bedoeling: { soort: 'schaak' },
          vraag: 'En hier? Tik de koning aan die schaak staat.',
          foutTip: 'De zwarte dame loopt ook schuin. Volg haar diagonaal naar linksonder.',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Hoe heet het als de koning wordt aangevallen?',
          opties: [
            { label: 'schaak', emoji: '⚡', goed: true },
            { label: 'mat', emoji: '🏁' },
            { label: 'pat', emoji: '🤝' },
          ],
        },
        {
          kind: 'tapSquares',
          fen: '4k3/8/8/8/8/8/8/4R1K1',
          correct: ['g1'],
          bedoeling: { soort: 'geenSchaak' },
          vraag: 'Tik nu de koning aan die juist géén schaak staat.',
          foutTip: 'Kijk welke koning nergens door wordt aangevallen. Let op: de toren is geen koning.',
        },
      ],
      themas: ['schaak', 'koning'],
    },
    {
      id: 'schaak-2',
      wereldId: 'schaak',
      titel: 'Geef zelf schaak',
      icoon: '📣',
      doel: 'Je kind vindt een zet die de vijandelijke koning aanvalt.',
      geleerd: 'Nu geef jij zelf schaak!',
      vertel: [
        'Nu jij! Je kunt de koning van de tegenstander ook aanvallen.',
        'Zoek een zet waarmee jouw stuk bij zijn koning kan komen.',
        'Lukt het? Dan roep je: schaak!',
      ],
      vertelFen: '4k3/8/8/8/8/8/8/R5K1',
      meedoen: [
        {
          kind: 'regelZet',
          fen: '4k3/8/8/8/8/8/8/R5K1 w - - 0 1',
          eis: 'geefSchaak',
          vraag: 'Geef schaak met je toren.',
          foutTip: 'De toren loopt recht. Zet hem op de rij of de lijn van de zwarte koning.',
        },
      ],
      zelf: [
        {
          kind: 'regelZet',
          fen: '4k3/8/8/8/4N3/8/P7/6K1 w - - 0 1',
          eis: 'geefSchaak',
          vraag: 'Geef schaak met je paard.',
          foutTip: 'Spring zo dat je vanaf je nieuwe veld bij de koning kunt. Denk aan de L.',
        },
        {
          kind: 'regelZet',
          fen: '4k3/8/8/8/2B5/8/P7/6K1 w - - 0 1',
          eis: 'geefSchaak',
          vraag: 'Geef schaak met je loper.',
          foutTip: 'De loper gaat schuin. Zoek de diagonaal die bij de koning uitkomt.',
        },
      ],
      toets: [
        {
          kind: 'regelZet',
          fen: '4k3/8/8/8/8/8/3Q4/6K1 w - - 0 1',
          eis: 'geefSchaak',
          vraag: 'Geef schaak met je dame.',
          foutTip: 'De dame mag recht én schuin. Er zijn zelfs meerdere goede zetten.',
        },
        {
          kind: 'quiz',
          vraag: 'Mag je de koning van de tegenstander opeten als hij schaak staat?',
          opties: [
            { label: 'nee, een koning wordt nooit geslagen', emoji: '🚫', goed: true },
            { label: 'ja, dan win je meteen', emoji: '🏆' },
          ],
          foutTip: 'De koning gaat nooit van het bord. Je zet hem klem, en hoe dat heet leer je hierna.',
        },
      ],
      themas: ['schaak'],
    },
    {
      id: 'schaak-3',
      wereldId: 'schaak',
      titel: 'Uit schaak: drie manieren',
      icoon: '🚪',
      doel: 'Je kind haalt de koning uit schaak, op alle drie de manieren.',
      geleerd: 'Nu ken je alle drie de manieren om uit schaak te gaan.',
      vertel: [
        'Sta jij schaak? Dan zijn er precies drie manieren om het op te lossen.',
        'Eén: weglopen met je koning. Twee: het aanvallende stuk slaan.',
        'Drie: er iets tussen zetten. Precies dezelfde drie als op de Aanvalsberg!',
      ],
      vertelFen: 'R3r3/8/8/7k/8/2B5/8/4K3',
      vertelWijs: ['e1'],
      meedoen: [
        {
          kind: 'regelZet',
          fen: '7k/8/8/8/8/8/4r3/4K3 w - - 0 1',
          eis: 'uitSchaak',
          vraag: 'Je staat schaak. Los het op.',
          foutTip: 'Die zet mag niet: dan sta je nog steeds schaak. Loop weg, of sla die toren.',
        },
      ],
      zelf: [
        {
          kind: 'regelZet',
          fen: '4r2k/8/8/8/8/8/R7/4K3 w - - 0 1',
          eis: 'uitSchaak',
          vraag: 'Schaak! Zoek een uitweg. Er is er meer dan één.',
          foutTip: 'Je kunt weglopen, maar je toren kan er ook tussen springen.',
        },
        {
          kind: 'regelZet',
          fen: 'R3r3/8/8/7k/8/2B5/8/4K3 w - - 0 1',
          eis: 'uitSchaak',
          vraag: 'Hier kunnen alle drie de manieren. Kies er eentje.',
          foutTip: 'Slaan met de toren, ertussen met de loper, of gewoon een stapje opzij.',
        },
        {
          kind: 'quiz',
          vraag: 'Welke drie manieren zijn er om uit schaak te gaan?',
          opties: [
            { label: 'weglopen, slaan, ertussen zetten', emoji: '🧠', goed: true },
            { label: 'weglopen, wachten, opgeven', emoji: '🤞' },
            { label: 'rokeren, ruilen, promoveren', emoji: '❓' },
          ],
        },
      ],
      toets: [
        {
          kind: 'regelZet',
          fen: '7k/8/8/8/8/8/4r3/4K3 w - - 0 1',
          eis: 'uitSchaak',
          vraag: 'Laatste keer: haal je koning uit het schaak.',
        },
        {
          // Deze toets vroeg eerst naar mat. Dat is de les van wereld 10, en die komt
          // hier expres pas na. Een vooruitblik in een foutTip mag; toetsen wat de les
          // niet gegeven heeft niet.
          kind: 'quiz',
          vraag: 'Je staat schaak. Welke zet mag je NIET doen?',
          opties: [
            { label: 'een zet waarna je nog steeds schaak staat', emoji: '🚫', goed: true },
            { label: 'het aanvallende stuk slaan', emoji: '⚔️' },
            { label: 'er een stuk tussen zetten', emoji: '🛡️' },
          ],
          foutTip: 'Slaan en ertussen zetten zijn juist twee van de drie manieren. Blijven staan mag nooit.',
        },
      ],
      themas: ['schaak', 'verdediging'],
    },
  ],
}
