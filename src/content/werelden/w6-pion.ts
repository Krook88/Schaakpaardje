import { type World } from '../types'

/**
 * Wereld 6 — Pionnenveld.
 * De pion staat expres achteraan: hij is het zwakste stuk maar heeft de meeste
 * uitzonderingen. "Lopen is niet slaan" is voor kinderen echt lastig.
 * Deze wereld sluit af met het bronzen hoefijzer: alle stukken kennen.
 */
export const wereld6: World = {
  id: 'pion',
  nummer: 6,
  naam: 'Pionnenveld',
  emoji: '🌱',
  belofte: 'Klein maar dapper. En hij kan dame worden!',
  minLeeftijd: 6,
  minispel: 'pionnenspel',
  diploma: 'brons',
  lessen: [
    {
      id: 'pion-1',
      wereldId: 'pion',
      titel: 'Altijd vooruit',
      doel: 'Je kind weet dat de pion één veld vooruit loopt en nooit terug.',
      vertel: [
        'Dit is de pion. Het kleinste stukje, maar wel dapper.',
        'Hij loopt één veld vooruit. Nooit opzij, nooit achteruit.',
        'Een pion gaat altijd door. Terug kan hij niet meer.',
      ],
      vertelFen: '8/8/8/8/8/8/4P3/8',
      meedoen: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/4P3/8/8/8/8',
          from: 'e5',
          vraag: 'Waar kan deze pion heen? Tik het veld aan.',
        },
      ],
      zelf: [
        {
          kind: 'move',
          fen: '8/8/8/4P3/8/8/8/8',
          from: 'e5',
          goed: ['e6'],
          vraag: 'Zet de pion een stapje vooruit.',
          foutTip: 'Vooruit is naar boven, want jij speelt met wit.',
        },
        {
          kind: 'quiz',
          vraag: 'Mag een pion achteruit?',
          opties: [
            { label: 'nee, nooit', emoji: '🚫', goed: true },
            { label: 'ja, als het moet', emoji: '↩️' },
          ],
        },
      ],
      toets: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/2P5/8/8/8',
          from: 'c4',
          vraag: 'Deze pion is al onderweg. Waar kan hij heen?',
        },
        {
          kind: 'quiz',
          vraag: 'Een stuk staat pal voor je pion. Wat kan de pion doen?',
          opties: [
            { label: 'niets, hij zit vast', emoji: '🛑', goed: true },
            { label: 'het stuk slaan', emoji: '⚔️' },
            { label: 'eromheen lopen', emoji: '↪️' },
          ],
          foutTip: 'Recht vooruit slaat een pion nooit. Hij zit dus echt vast.',
        },
      ],
      themas: ['pion', 'bordvisie'],
    },
    {
      id: 'pion-2',
      wereldId: 'pion',
      titel: 'De eerste keer twee',
      doel: 'Je kind kent de dubbelstap vanaf de startrij.',
      vertel: [
        'Eén ding mag een pion maar één keer in zijn leven.',
        'Vanaf zijn startplek mag hij twee velden vooruit. Een lekkere sprint.',
        'Daarna is het weer één stapje per keer.',
      ],
      vertelFen: '8/8/8/8/8/8/4P3/8',
      meedoen: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/8/8/4P3/8',
          from: 'e2',
          vraag: 'Deze pion staat nog op zijn startplek. Waar kan hij heen?',
        },
      ],
      zelf: [
        {
          kind: 'move',
          fen: '8/8/8/8/8/8/4P3/8',
          from: 'e2',
          goed: ['e4'],
          vraag: 'Doe de dubbele stap.',
        },
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/2n5/8/2P5/8',
          from: 'c2',
          vraag: 'Er staat iets op zijn tweede veld. Waar kan hij nu heen?',
        },
      ],
      toets: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/8/4n3/8/4P3/8',
          from: 'e2',
          vraag: 'Het paard staat twee velden voor hem. Waar kan de pion heen?',
        },
        {
          kind: 'quiz',
          vraag: 'Hoe vaak mag een pion twee velden vooruit?',
          opties: [
            { label: 'alleen de allereerste keer', emoji: '1️⃣', goed: true },
            { label: 'elke keer', emoji: '♾️' },
            { label: 'nooit', emoji: '🚫' },
          ],
        },
      ],
      themas: ['pion', 'dubbelstap'],
    },
    {
      id: 'pion-3',
      wereldId: 'pion',
      titel: 'Lopen is niet slaan',
      doel: 'Je kind weet dat de pion recht loopt maar schuin slaat.',
      vertel: [
        'Nu het gekste van de pion. Let goed op.',
        'Hij loopt recht vooruit. Maar hij slaat schuin!',
        'Dus: recht is lopen, schuin is pakken. Bij alle andere stukken is dat hetzelfde.',
      ],
      vertelFen: '8/8/8/3p1p2/4P3/8/8/8',
      vertelWijs: ['d5', 'f5'],
      meedoen: [
        {
          kind: 'tapMoves',
          fen: '8/8/8/3p1p2/4P3/8/8/8',
          from: 'e4',
          vraag: 'Twee zwarte pionnen staan schuin voor hem. Tik alle velden aan waar hij heen kan.',
        },
      ],
      zelf: [
        {
          kind: 'move',
          fen: '8/8/8/3p1p2/4P3/8/8/8',
          from: 'e4',
          goed: ['d5', 'f5'],
          vraag: 'Sla een zwarte pion.',
          foutTip: 'Slaan doet de pion schuin. Recht vooruit pakt hij niets.',
        },
        {
          kind: 'quiz',
          vraag: 'Twee pionnen staan pal tegenover elkaar. Wat kunnen ze doen?',
          opties: [
            { label: 'niets, ze zitten vast', emoji: '🛑', goed: true },
            { label: 'elkaar slaan', emoji: '⚔️' },
            { label: 'eromheen lopen', emoji: '↪️' },
          ],
          foutTip: 'Recht vooruit slaat een pion niet. Ze houden elkaar tegen.',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Hoe slaat een pion?',
          opties: [
            { label: 'schuin vooruit', emoji: '↗️', goed: true },
            { label: 'recht vooruit', emoji: '⬆️' },
            { label: 'alle kanten op', emoji: '🌈' },
          ],
        },
        {
          kind: 'captureAll',
          fen: '8/8/8/8/8/1p6/P7/8',
          from: 'a2',
          vraag: 'Sla de zwarte pion op.',
        },
      ],
      themas: ['pion', 'slaan'],
    },
    {
      id: 'pion-4',
      wereldId: 'pion',
      titel: 'Pion wordt dame',
      doel: 'Je kind promoveert een pion op de overkant.',
      vertel: [
        'En nu het mooiste van de pion.',
        'Haalt hij de overkant? Dan wordt hij een dame! Zomaar, midden in de partij.',
        "Daarom is zo'n klein pionnetje toch heel gevaarlijk.",
      ],
      vertelFen: '8/4P3/8/8/8/8/8/8',
      meedoen: [
        {
          kind: 'move',
          fen: '8/4P3/8/8/8/8/8/8',
          from: 'e7',
          goed: ['e8'],
          vraag: 'Zet de pion op de laatste rij. Kijk wat er gebeurt!',
        },
      ],
      zelf: [
        {
          kind: 'reach',
          fen: '8/8/8/8/8/8/4P3/8',
          from: 'e2',
          doel: 'e8',
          vraag: 'Loop helemaal naar de overkant. Stap voor stap.',
        },
        {
          kind: 'quiz',
          vraag: 'Wat wordt een pion meestal als hij de overkant haalt?',
          opties: [
            { label: 'een dame', emoji: '👑', goed: true },
            { label: 'een koning', emoji: '🤴' },
            { label: 'niets, hij blijft pion', emoji: '♟️' },
          ],
          foutTip: 'Een tweede koning bestaat niet. Bijna iedereen kiest de dame.',
        },
      ],
      toets: [
        {
          kind: 'reach',
          fen: '8/8/8/8/8/8/1P6/8',
          from: 'b2',
          doel: 'b8',
          vraag: 'Breng deze pion naar de overkant.',
        },
        {
          kind: 'move',
          fen: '8/3P4/8/8/8/8/8/8',
          from: 'd7',
          goed: ['d8'],
          vraag: 'Nog één stapje en hij is dame. Doe maar.',
        },
      ],
      themas: ['pion', 'promotie'],
    },
  ],
}
