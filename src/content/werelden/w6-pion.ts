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
  toon: 105,
  belofte: 'Klein maar dapper. En hij kan dame worden!',
  minLeeftijd: 6,
  minispel: 'pionnenspel',
  diploma: 'brons',
  lessen: [
    {
      id: 'pion-1',
      wereldId: 'pion',
      titel: 'Altijd vooruit',
      icoon: '⬆️',
      doel: 'Je kind weet dat de pion één veld vooruit loopt en nooit terug.',
      geleerd: 'Nu weet je dat een pion alleen vooruit gaat en nooit terug.',
      vertel: [
        'Dit is de pion. Het kleinste stukje, maar wel dapper.',
        'Hij loopt één veld vooruit. Nooit opzij, nooit achteruit.',
        'Een pion gaat altijd door. Terug kan hij niet meer.',
      ],
      vertelFen: '8/8/8/4P3/8/8/8/8',
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
          vraag: 'Welke kant loopt jouw pion op?',
          opties: [
            { label: 'recht vooruit, naar boven', emoji: '⬆️', goed: true },
            { label: 'opzij', emoji: '↔️' },
            { label: 'alle kanten op', emoji: '🌈' },
          ],
          foutTip: 'De pion loopt recht vooruit. Opzij en achteruit kan hij niet.',
        },
      ],
      themas: ['pion', 'bordvisie'],
    },
    {
      id: 'pion-2',
      wereldId: 'pion',
      titel: 'De eerste keer twee',
      icoon: '⏩',
      doel: 'Je kind kent de dubbelstap vanaf de startrij.',
      geleerd: 'Nu ken je de dubbele stap van de pion.',
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
      icoon: '✂️',
      doel: 'Je kind weet dat de pion recht loopt maar schuin slaat.',
      geleerd: 'Nu weet je het gekste van de pion: recht lopen, schuin slaan.',
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
      themas: ['pion', 'slaan'],
    },
    {
      id: 'pion-4',
      wereldId: 'pion',
      titel: 'Pion wordt dame',
      icoon: '👑',
      doel: 'Je kind promoveert een pion op de overkant.',
      geleerd: 'Nu maak jij van een pion een dame!',
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
    {
      // De laatste pionregel. Hij stond er niet, maar de bots speelden hem wél: Kiki
      // en Rens pakken een gratis pion en het kind ziet er eentje verdwijnen door een
      // zet die volgens alles wat het geleerd heeft niet kan. Deze les gebruikt
      // 'regelZet', want en passant is een echte regel — de meetkundige motor kent
      // hem niet, en kan hem ook niet kennen: hij hangt af van de vorige zet.
      id: 'pion-5',
      wereldId: 'pion',
      titel: 'In het voorbijgaan',
      icoon: '💨',
      doel: 'Je kind slaat een pion en passant.',
      geleerd: 'Nu ken je en passant, de laatste rare regel van de pion.',
      vertel: [
        'Nog één rare regel van de pion. Deze heet en passant, dat is Frans voor "in het voorbijgaan".',
        'Staat jouw pion al ver vooruit, en springt zijn pion er met een dubbelstap langs? Dan mag je hem toch pakken.',
        'Je slaat schuin, naar het lege veld waar hij overheen sprong. En dat mag alleen meteen, anders is de kans weg.',
      ],
      vertelFen: '4k3/8/8/3pP3/8/8/8/4K3',
      vertelWijs: ['d6'],
      meedoen: [
        {
          kind: 'regelZet',
          fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1',
          eis: 'enPassant',
          vraag: 'Zijn pion sprong er net langs. Pak hem in het voorbijgaan!',
          foutTip: 'Sla schuin naar het lege veld waar hij overheen sprong. Hij gaat er alsnog af.',
        },
      ],
      zelf: [
        {
          kind: 'regelZet',
          fen: '4k3/8/8/5pP1/8/8/8/4K3 w - f6 0 1',
          eis: 'enPassant',
          vraag: 'Nog een keer. Sla en passant.',
          foutTip: 'Schuin naar het lege veld erachter. Zijn pion staat ernaast, maar je gaat er niet heen.',
        },
        {
          kind: 'quiz',
          vraag: 'Wanneer mag je en passant slaan?',
          opties: [
            { label: 'meteen, of nooit meer', emoji: '⏱️', goed: true },
            { label: 'wanneer je maar wilt', emoji: '♾️' },
            { label: 'alleen met een dame', emoji: '👑' },
          ],
          foutTip: 'Je hebt precies één zet de tijd. Doe je iets anders, dan is de kans voorbij.',
        },
      ],
      toets: [
        {
          kind: 'regelZet',
          fen: '4k3/8/8/1pP5/8/8/8/4K3 w - b6 0 1',
          eis: 'enPassant',
          vraag: 'Laatste keer: sla zijn pion in het voorbijgaan.',
        },
        {
          kind: 'quiz',
          vraag: 'Welk stuk kan en passant slaan?',
          opties: [
            { label: 'alleen een pion', emoji: '\u265f\ufe0f', goed: true },
            { label: 'elk stuk', emoji: '\ud83c\udf08' },
            { label: 'alleen de dame', emoji: '\ud83d\udc51' },
          ],
          foutTip: 'Het is een pionregel. Alleen een pion kan een pion in het voorbijgaan pakken.',
        },
      ],
      themas: ['pion', 'en passant'],
    },
  ],
}
