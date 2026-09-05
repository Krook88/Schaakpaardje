import { type World } from '../types'

/**
 * Wereld 5 — Koningskasteel.
 * De gang van de koning is simpel; wat lastig is, zijn de regels eromheen. Die komen
 * pas in wereld 9 en 10. Hier leren kinderen alleen: één stapje, en twee koningen
 * blijven van elkaar af.
 */
export const wereld5: World = {
  id: 'koning',
  nummer: 5,
  naam: 'Koningskasteel',
  emoji: '🤴',
  belofte: 'De koning is de baas, maar hij loopt langzaam.',
  minLeeftijd: 6,
  minispel: 'koningsloop',
  lessen: [
    {
      id: 'koning-1',
      wereldId: 'koning',
      titel: 'Eén stapje tegelijk',
      icoon: '👣',
      doel: 'Je kind weet dat de koning één veld per zet gaat, alle kanten op.',
      geleerd: 'Nu weet je hoe de koning loopt: één stapje, alle kanten op.',
      vertel: [
        'Dit is de koning. Hij is de belangrijkste van allemaal.',
        'Maar hij is ook een beetje traag: één stapje per zet.',
        'Wel alle kanten op: recht, schuin, vooruit en achteruit.',
      ],
      vertelFen: '8/8/8/8/4K3/8/8/8',
      meedoen: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/4K3/8/8/8',
          from: 'e4',
          vraag: 'Tik alle velden aan waar de koning heen kan. Het zijn er acht.',
        },
      ],
      zelf: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/8/8/8/7K',
          from: 'h1',
          vraag: 'In de hoek kan hij veel minder. Waar kan hij heen?',
        },
        {
          kind: 'move',
          fen: '8/8/8/8/4K3/8/8/8',
          from: 'e4',
          goed: ['e5'],
          vraag: 'Zet de koning één stapje recht omhoog.',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Hoe ver loopt de koning?',
          opties: [
            { label: 'één veld', emoji: '1️⃣', goed: true },
            { label: 'zo ver hij wil', emoji: '🏃' },
            { label: 'twee velden', emoji: '2️⃣' },
          ],
        },
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/8/8/3K4/8',
          from: 'd2',
          vraag: 'Tik alle velden van deze koning aan.',
        },
        {
          // 🌈 stond zes keer in de app en was zes keer het foute antwoord ("alle
          // kanten op", "overal", "iedereen"). Een kind dat niet leest, leerde daar
          // "de regenboog is nooit goed" van in plaats van schaken. Bij de koning ís
          // alle kanten op het juiste antwoord, dus hier hoort de vraag thuis.
          kind: 'quiz',
          vraag: 'Welke kanten op mag de koning?',
          opties: [
            { label: 'alle kanten op', emoji: '🌈', goed: true },
            { label: 'alleen recht', emoji: '➕' },
            { label: 'alleen schuin', emoji: '↗️' },
          ],
          foutTip: 'De koning mag recht én schuin. Alleen niet ver: één stapje.',
        },
      ],
      themas: ['koning', 'bordvisie'],
    },
    {
      id: 'koning-2',
      wereldId: 'koning',
      titel: 'De koning pakt ook',
      icoon: '😋',
      doel: 'Je kind slaat met de koning een stuk dat ernaast staat.',
      geleerd: 'Nu pakt jouw koning zelf een stuk.',
      vertel: [
        'De koning is niet bang. Staat er een stuk vlak naast hem? Dan pakt hij het.',
        'Wel alleen op de velden waar hij bij kan. Dus vlak ernaast.',
        'En zijn eigen stukken laat hij natuurlijk staan.',
      ],
      vertelFen: '8/8/8/3p4/2PK4/8/8/8',
      vertelWijs: ['d5'],
      meedoen: [
        {
          kind: 'move',
          fen: '8/8/8/3p4/2PK4/8/8/8',
          from: 'd4',
          goed: ['d5'],
          vraag: 'Pak de zwarte pion die vlak boven de koning staat.',
        },
      ],
      zelf: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/3p4/2PK4/8/8/8',
          from: 'd4',
          vraag: 'Waar kan deze koning allemaal heen? De witte pion is van jou.',
        },
        {
          kind: 'captureAll',
          fen: '8/8/8/8/8/8/1p6/K7',
          from: 'a1',
          vraag: 'Sla de zwarte pion met je koning.',
        },
      ],
      toets: [
        {
          kind: 'captureAll',
          fen: '8/8/8/8/8/1p6/1K6/8',
          from: 'b2',
          vraag: 'Pak deze pion op.',
        },
        {
          kind: 'quiz',
          vraag: 'Mag de koning zijn eigen pion slaan?',
          opties: [
            { label: 'nee, nooit', emoji: '🚫', goed: true },
            { label: 'ja, als hij in de weg staat', emoji: '😅' },
          ],
          foutTip: 'Je eigen stukken sla je nooit. Van niemand.',
        },
      ],
      themas: ['koning', 'slaan'],
    },
    {
      id: 'koning-3',
      wereldId: 'koning',
      titel: 'Koningen blijven van elkaar af',
      icoon: '↔️',
      doel: 'Je kind weet dat twee koningen nooit naast elkaar mogen staan.',
      geleerd: 'Nu weet je dat twee koningen altijd een veld tussen zich houden.',
      vertel: [
        'Nog één regel over de koning. Een grappige.',
        'Twee koningen mogen nooit naast elkaar staan. Er blijft altijd een veld tussen.',
        'Ze kunnen elkaar dus nooit pakken. Handig om te weten.',
      ],
      vertelFen: '8/8/8/3k4/8/3K4/8/8',
      meedoen: [
        {
          kind: 'quiz',
          vraag: 'Mag de witte koning naast de zwarte koning gaan staan?',
          opties: [
            { label: 'nee', emoji: '🚫', goed: true },
            { label: 'ja', emoji: '🤝' },
          ],
          foutTip: 'Er blijft altijd minstens één veld tussen de twee koningen.',
        },
      ],
      zelf: [
        {
          kind: 'move',
          fen: '8/8/8/3k4/8/3K4/8/8',
          from: 'd3',
          goed: ['c2', 'd2', 'e2', 'c3', 'e3'],
          vraag: 'Zet de witte koning ergens waar hij niet naast de zwarte komt.',
          foutTip: 'De velden rondom de zwarte koning zijn verboden. Blijf op afstand.',
        },
        {
          kind: 'quiz',
          vraag: 'Kan een koning een andere koning slaan?',
          opties: [
            { label: 'nee, nooit', emoji: '🚫', goed: true },
            { label: 'ja, dan win je', emoji: '👑' },
          ],
        },
      ],
      toets: [
        {
          kind: 'move',
          fen: '8/8/8/8/2k5/8/2K5/8',
          from: 'c2',
          goed: ['b1', 'c1', 'd1', 'b2', 'd2'],
          vraag: 'Zet de witte koning weg bij de zwarte koning.',
        },
        {
          kind: 'quiz',
          vraag: 'Hoeveel velden blijven er minstens tussen twee koningen?',
          opties: [
            { label: 'één', emoji: '1️⃣', goed: true },
            { label: 'geen', emoji: '0️⃣' },
            { label: 'drie', emoji: '3️⃣' },
          ],
        },
      ],
      themas: ['koning', 'regels'],
    },
  ],
}
