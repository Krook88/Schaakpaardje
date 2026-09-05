import { type World } from '../types'

/**
 * Wereld 8 — Aanvalsberg.
 * Het hart van de bordvisie: zien dat een stuk van jou te pakken staat, en er iets
 * aan doen. In de stappen-didactiek komt dit vóór schaak en mat, want een koning die
 * wordt aangevallen is precies hetzelfde probleem — alleen dan mag je hem niet laten staan.
 *
 * De drie manieren die hier aan bod komen (weglopen, de aanvaller slaan, dekken) zijn
 * dezelfde drie die straks bij schaak terugkomen. Alle antwoorden zijn met de engine
 * nagerekend: 'goed' bevat precies de velden die na de zet niet meer onder vuur liggen.
 */
export const wereld8: World = {
  id: 'aanval',
  nummer: 8,
  naam: 'Aanvalsberg',
  emoji: '⚔️',
  belofte: 'Hier leer je zien wanneer je stuk gevaar loopt.',
  minLeeftijd: 7,
  minispel: 'red-je-stuk',
  lessen: [
    {
      id: 'aanval-1',
      wereldId: 'aanval',
      titel: 'Staat mijn stuk te pakken?',
      doel: 'Je kind ziet welk van zijn stukken door de tegenstander wordt aangevallen.',
      geleerd: 'Nu zie je zelf welk stuk van jou te pakken staat.',
      vertel: [
        'Kijk na elke zet van je tegenstander even rond.',
        'Vraag je af: kan hij nu iets van mij pakken?',
        'Een stuk dat hij kan slaan, noemen we aangevallen. Zoek jij ze even?',
      ],
      vertelFen: '8/8/8/3r4/8/3R4/8/6N1',
      vertelWijs: ['d3'],
      meedoen: [
        {
          kind: 'tapSquares',
          fen: '8/8/8/3r4/8/3R4/8/6N1',
          correct: ['d3'],
          bedoeling: { soort: 'bedreigd', kleur: 'w' },
          vraag: 'Welk wit stuk staat te pakken? Tik het aan.',
          foutTip: 'Kijk welke lijnen de zwarte toren bestrijkt. Wat staat daarop?',
        },
      ],
      zelf: [
        {
          kind: 'tapSquares',
          fen: '8/8/5b2/8/8/2N5/8/4R3',
          correct: ['c3'],
          bedoeling: { soort: 'bedreigd', kleur: 'w' },
          vraag: 'De zwarte loper loert. Welk stuk van jou is in gevaar?',
          foutTip: 'De loper gaat schuin. Volg zijn diagonaal maar eens naar beneden.',
        },
        {
          kind: 'tapSquares',
          fen: '8/8/8/3p4/2B5/8/6R1/8',
          correct: ['c4'],
          bedoeling: { soort: 'bedreigd', kleur: 'w' },
          vraag: 'Zelfs een pion kan aanvallen. Welk stuk staat te pakken?',
          foutTip: 'Denk eraan: een pion slaat schuin, niet recht vooruit.',
        },
        {
          kind: 'quiz',
          vraag: 'Wat doe je als je merkt dat een stuk van jou aangevallen wordt?',
          opties: [
            { label: 'er iets aan doen', emoji: '🛟', goed: true },
            { label: 'gewoon doorspelen', emoji: '🤷' },
          ],
          foutTip: 'Doe je niets, dan ben je je stuk kwijt. Er is bijna altijd iets aan te doen.',
        },
      ],
      toets: [
        {
          kind: 'tapSquares',
          fen: '8/3q4/8/8/3N4/8/5B2/8',
          correct: ['d4'],
          bedoeling: { soort: 'bedreigd', kleur: 'w' },
          vraag: 'De zwarte dame kijkt rond. Welk stuk van jou staat te pakken?',
          foutTip: 'De dame loopt recht én schuin. Kijk eens recht naar beneden.',
        },
        {
          kind: 'quiz',
          vraag: 'Hoeveel manieren zijn er om een aangevallen stuk te redden?',
          opties: [
            { label: 'meerdere: weglopen, slaan of dekken', emoji: '🧠', goed: true },
            { label: 'eentje: weglopen', emoji: '🏃' },
            { label: 'geen enkele', emoji: '😱' },
          ],
        },
      ],
      themas: ['aanval', 'bordvisie'],
    },
    {
      id: 'aanval-2',
      wereldId: 'aanval',
      titel: 'Manier één: weglopen',
      doel: 'Je kind zet een aangevallen stuk op een veilig veld.',
      geleerd: 'Nu breng jij je stuk in veiligheid.',
      vertel: [
        'De makkelijkste redding: gewoon weglopen.',
        'Maar niet zomaar ergens heen! Kijk waar hij níet bij kan.',
        'Zet je stuk dus op een veld dat hij niet bestrijkt.',
      ],
      vertelFen: '8/8/8/5b2/8/3R4/8/8',
      vertelWijs: ['d3'],
      meedoen: [
        {
          kind: 'move',
          fen: '8/8/8/5b2/8/3R4/8/8',
          from: 'd3',
          goed: ['d8', 'd6', 'd5', 'd4', 'a3', 'b3', 'c3', 'e3', 'f3', 'g3', 'd2', 'd1'],
          bedoeling: 'veilig',
          vraag: 'De loper valt je toren aan. Breng hem in veiligheid.',
          foutTip: 'Volg de diagonaal van de loper. Kies een veld dat daar niet op ligt.',
        },
      ],
      zelf: [
        {
          kind: 'move',
          fen: '8/8/8/8/8/3n4/8/4R3',
          from: 'e1',
          goed: ['e8', 'e7', 'e6', 'e4', 'e3', 'e2', 'a1', 'b1', 'd1', 'f1', 'g1', 'h1'],
          bedoeling: 'veilig',
          vraag: 'Het paard valt je toren aan. Zet hem weg.',
          foutTip: 'Het paard springt in een L. Tel na waar hij bij kan.',
        },
        {
          kind: 'quiz',
          vraag: 'Je stuk loopt weg naar een veld waar hij het weer kan pakken. Goed idee?',
          opties: [
            { label: 'nee, kijk eerst goed', emoji: '👀', goed: true },
            { label: 'ja, weglopen is weglopen', emoji: '🏃' },
          ],
          foutTip: 'Weglopen helpt alleen als het nieuwe veld echt veilig is.',
        },
      ],
      toets: [
        {
          kind: 'move',
          fen: '8/8/8/8/8/8/5n2/3B4',
          from: 'd1',
          goed: ['h5', 'a4', 'b3', 'f3', 'c2', 'e2'],
          bedoeling: 'veilig',
          vraag: 'Je loper wordt aangevallen door het paard. Red hem.',
          foutTip: 'Het paard op f2 bestrijkt d1, d3, e4, g4, h3 en h1. Vermijd die velden.',
        },
      ],
      themas: ['aanval', 'verdediging'],
    },
    {
      id: 'aanval-3',
      wereldId: 'aanval',
      titel: 'Manier twee: sla de aanvaller',
      doel: 'Je kind lost een dreiging op door het aanvallende stuk te slaan.',
      geleerd: 'Nu sla jij de aanvaller gewoon van het bord.',
      vertel: [
        'Soms hoef je helemaal niet weg te lopen.',
        'Kun je het stuk pakken dat jou aanvalt? Doe dat dan gewoon!',
        'Weg aanvaller, weg probleem. En je hebt er nog een stuk bij ook.',
      ],
      vertelFen: '8/8/3n4/8/4N3/8/8/8',
      vertelWijs: ['d6'],
      meedoen: [
        {
          kind: 'move',
          fen: '8/8/3n4/8/4N3/8/8/8',
          from: 'e4',
          goed: ['d6'],
          bedoeling: 'aanvaller',
          vraag: 'Dat zwarte paard valt jou aan. Pak hem eerst!',
          foutTip: 'Jouw paard kan er precies bij: twee omhoog en één opzij.',
        },
      ],
      zelf: [
        {
          kind: 'move',
          fen: '8/6b1/8/8/3Q4/8/8/8',
          from: 'd4',
          goed: ['g7'],
          bedoeling: 'aanvaller',
          vraag: 'De loper valt je dame aan. Sla hem.',
          foutTip: 'Je dame mag ook schuin. Volg de diagonaal naar rechtsboven.',
        },
        {
          kind: 'quiz',
          vraag: 'Wanneer is de aanvaller slaan een goed idee?',
          opties: [
            { label: 'als je er zelf niets duurs voor teruggeeft', emoji: '⚖️', goed: true },
            { label: 'altijd, zonder nadenken', emoji: '⚔️' },
          ],
          foutTip: 'Kijk of hij kan terugslaan, en wat dat jou kost. Wereld 7, weet je nog?',
        },
      ],
      toets: [
        {
          kind: 'move',
          fen: '8/2r5/8/8/8/8/2R5/8',
          from: 'c2',
          goed: ['c7'],
          bedoeling: 'aanvaller',
          vraag: 'Twee torens tegenover elkaar. Sla die van hem.',
        },
        {
          kind: 'quiz',
          vraag: 'Je paard wordt aangevallen door een pion die jij kunt slaan. Wat doe je?',
          opties: [
            { label: 'de pion slaan', emoji: '⚔️', goed: true },
            { label: 'het paard laten staan', emoji: '😴' },
          ],
        },
      ],
      themas: ['aanval', 'verdediging', 'slaan'],
    },
    {
      id: 'aanval-4',
      wereldId: 'aanval',
      titel: 'Manier drie: dekken',
      doel: 'Je kind zet er een tweede stuk achter, zodat slaan een ruil wordt.',
      geleerd: 'Nu dek jij je eigen stukken.',
      vertel: [
        'Er is nog een manier: je stuk dekken.',
        'Dekken betekent: als hij slaat, sla jij meteen terug.',
        'Dan wordt het geen cadeautje meer, maar een ruil. En daar denkt hij nog even over na.',
      ],
      vertelFen: '7b/8/8/4N3/8/8/8/R7',
      vertelWijs: ['e5'],
      meedoen: [
        {
          kind: 'move',
          fen: '7b/8/8/4N3/8/8/8/R7',
          from: 'a1',
          goed: ['a5', 'e1'],
          vraag: 'De loper valt je paard aan. Dek het met je toren.',
          foutTip: 'Zet je toren zo neer dat hij het paard op e5 kan bereiken: op dezelfde rij of lijn.',
        },
      ],
      zelf: [
        {
          kind: 'quiz',
          vraag: 'Wat betekent dekken?',
          opties: [
            { label: 'als hij slaat, sla jij terug', emoji: '🔁', goed: true },
            { label: 'je stuk verstoppen', emoji: '🙈' },
            { label: 'je stuk wegzetten', emoji: '🏃' },
          ],
        },
        {
          kind: 'quiz',
          vraag: 'Je pion wordt aangevallen en jij dekt hem met je toren. Wat gebeurt er als hij toch slaat?',
          opties: [
            { label: 'jij slaat terug en wint zijn stuk', emoji: '🎉', goed: true },
            { label: 'je bent je pion kwijt en verder niets', emoji: '😬' },
          ],
          foutTip: 'Daarom dek je: hij verliest er ook eentje.',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Noem de drie manieren om een aangevallen stuk te redden.',
          opties: [
            { label: 'weglopen, de aanvaller slaan, dekken', emoji: '🧠', goed: true },
            { label: 'weglopen, wachten, hopen', emoji: '🤞' },
            { label: 'slaan, rokeren, promoveren', emoji: '❓' },
          ],
        },
        {
          kind: 'move',
          fen: '7b/8/8/4N3/8/8/8/R7',
          from: 'a1',
          goed: ['a5', 'e1'],
          vraag: 'Nog één keer: dek dat paard met je toren.',
        },
      ],
      themas: ['aanval', 'verdediging', 'dekken'],
    },
  ],
}
