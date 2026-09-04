import { type World } from '../types'

/**
 * Wereld 10 — Matklif.
 *
 * Hier komt eindelijk mat, na tien werelden wachten. Dat uitstel is geen toeval maar de
 * kern van de Nederlandse stappen-didactiek: wie mat leert vóór hij bordvisie heeft,
 * leert een truc in plaats van het spel. Een kind dat hier aankomt, weet al dat een
 * aangevallen stuk drie uitwegen heeft — mat is simpelweg schaak waarbij alle drie
 * dichtzitten.
 *
 * Alle matstellingen zijn met chess.js nagerekend.
 */
export const wereld10: World = {
  id: 'mat',
  nummer: 10,
  naam: 'Matklif',
  emoji: '🏁',
  belofte: 'Schaakmat! Hier win je de partij.',
  minLeeftijd: 8,
  minispel: 'mat-in-1-regen',
  lessen: [
    {
      id: 'mat-1',
      wereldId: 'mat',
      titel: 'Wat is schaakmat?',
      doel: 'Je kind weet dat mat betekent: schaak waar je niet meer uit kunt.',
      vertel: [
        'Je weet nu wat schaak is, en dat er drie manieren zijn om eruit te komen.',
        'Maar wat als geen van die drie werkt? Niet weglopen, niet slaan, niets ertussen?',
        'Dan is het schaakmat. De partij is afgelopen en jij hebt gewonnen.',
      ],
      vertelFen: 'R6k/5ppp/8/8/8/8/8/6K1',
      vertelWijs: ['h8'],
      meedoen: [
        {
          kind: 'tapSquares',
          fen: 'R6k/5ppp/8/8/8/8/8/6K1',
          correct: ['h8'],
          vraag: 'Deze koning staat mat. Tik hem aan.',
          foutTip: 'De zwarte koning kan nergens heen: zijn eigen pionnen staan in de weg.',
        },
      ],
      zelf: [
        {
          kind: 'quiz',
          vraag: 'Wat is het verschil tussen schaak en mat?',
          opties: [
            { label: 'bij mat kun je er niet meer uit', emoji: '🏁', goed: true },
            { label: 'er is geen verschil', emoji: '🤷' },
            { label: 'mat is als je je dame verliest', emoji: '👑' },
          ],
          foutTip: 'Schaak los je op. Mat kun je niet oplossen: dan is de partij klaar.',
        },
        {
          kind: 'quiz',
          vraag: 'Wordt de koning bij mat van het bord gehaald?',
          opties: [
            { label: 'nee, het spel stopt gewoon', emoji: '🛑', goed: true },
            { label: 'ja, hij wordt geslagen', emoji: '💀' },
          ],
          foutTip: 'Een koning wordt nooit geslagen. Bij mat stopt de partij, dat is genoeg.',
        },
        {
          kind: 'tapSquares',
          fen: 'R6k/5ppp/8/8/8/8/8/6K1',
          correct: ['f7', 'g7', 'h7'],
          vraag: 'Waarom kan hij niet weg? Tik de drie eigen pionnen aan die in de weg staan.',
          foutTip: 'Zijn eigen pionnen! Die blokkeren de velden waar hij heen zou willen.',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Je staat schaak en kunt niets doen. Wat is dat?',
          opties: [
            { label: 'schaakmat, je hebt verloren', emoji: '🏁', goed: true },
            { label: 'pat, gelijkspel', emoji: '🤝' },
            { label: 'niets, je mag passen', emoji: '😴' },
          ],
        },
        {
          kind: 'quiz',
          vraag: 'Mag je passen als je niet weet wat je moet doen?',
          opties: [
            { label: 'nee, je moet altijd een zet doen', emoji: '🚫', goed: true },
            { label: 'ja, dan sla je een beurt over', emoji: '⏭️' },
          ],
          foutTip: 'Passen bestaat niet bij schaken. Je moet altijd zetten.',
        },
      ],
      themas: ['mat'],
    },
    {
      id: 'mat-2',
      wereldId: 'mat',
      titel: 'Mat in één',
      doel: 'Je kind vindt de zet die de partij in één keer wint.',
      vertel: [
        'Nu ga je zelf mat zetten. In één zet!',
        'Zoek een zet die schaak geeft, én waarbij hij nergens meer heen kan.',
        'Kijk dus niet alleen naar het schaak, maar ook naar zijn vluchtvelden.',
      ],
      vertelFen: '7k/5ppp/8/8/8/8/8/R5K1',
      meedoen: [
        {
          kind: 'regelZet',
          fen: '7k/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
          eis: 'matIn1',
          vraag: 'Zet mat in één zet met je toren.',
          foutTip: 'Zijn pionnen sluiten hem in. Geef schaak op de bovenste rij.',
        },
      ],
      zelf: [
        {
          kind: 'regelZet',
          fen: '6k1/8/6K1/8/8/8/8/R7 w - - 0 1',
          eis: 'matIn1',
          vraag: 'Zet mat met je toren. Je eigen koning helpt mee!',
          foutTip: 'Jouw koning bewaakt al zijn vluchtvelden. Geef schaak op de achterste rij.',
        },
        {
          kind: 'regelZet',
          fen: 'k7/8/1K6/8/8/8/8/7Q w - - 0 1',
          eis: 'matIn1',
          vraag: 'Zet mat met je dame.',
          foutTip: 'Er zijn twee goede zetten. Zorg dat je dame gedekt staat door je koning.',
        },
      ],
      toets: [
        {
          kind: 'regelZet',
          fen: '7k/5KP1/8/8/8/8/8/8 w - - 0 1',
          eis: 'matIn1',
          vraag: 'Nog eentje: zet mat in één zet.',
          foutTip: 'Je pion staat vlak voor de overkant. Maak er een dame van!',
        },
        {
          kind: 'quiz',
          vraag: 'Waar moet je op letten bij mat zetten?',
          opties: [
            { label: 'op zijn vluchtvelden', emoji: '👀', goed: true },
            { label: 'alleen op je eigen stukken', emoji: '🙈' },
            { label: 'op de klok', emoji: '⏰' },
          ],
        },
      ],
      themas: ['mat', 'schaak'],
    },
    {
      id: 'mat-3',
      wereldId: 'mat',
      titel: 'Pat en remise',
      doel: 'Je kind herkent pat en weet dat het gelijkspel is, geen winst.',
      vertel: [
        'Let op, want dit is een gemene. Soms sta je níet schaak, maar kun je ook niets.',
        'Geen enkele zet is mogelijk. Dat heet pat, en dan is het gelijkspel.',
        'Dus sta je bijna te winnen? Pas op dat je hem niet per ongeluk pat zet!',
      ],
      vertelFen: '7k/5Q2/6K1/8/8/8/8/8',
      vertelWijs: ['h8'],
      meedoen: [
        {
          kind: 'quiz',
          vraag: 'Zwart staat niet schaak, maar kan geen enkele zet doen. Wat is dat?',
          opties: [
            { label: 'pat, dus gelijkspel', emoji: '🤝', goed: true },
            { label: 'mat, wit wint', emoji: '🏁' },
            { label: 'zwart wint', emoji: '🖤' },
          ],
          foutTip: 'Geen schaak én geen zet: dat is pat. Niemand wint.',
        },
      ],
      zelf: [
        {
          kind: 'quiz',
          vraag: 'Wat is het verschil tussen pat en mat?',
          opties: [
            { label: 'bij mat sta je schaak, bij pat niet', emoji: '🧠', goed: true },
            { label: 'er is geen verschil', emoji: '🤷' },
            { label: 'pat is winst voor zwart', emoji: '🖤' },
          ],
        },
        {
          kind: 'tapSquares',
          fen: '7k/5Q2/6K1/8/8/8/8/8',
          correct: ['g8', 'h7'],
          vraag: 'De zwarte koning kan nergens heen. Tik de twee velden aan die hij zou willen.',
          foutTip: 'Naast zich: g8 en h7. Allebei worden ze bewaakt door de witte dame.',
        },
        {
          kind: 'quiz',
          vraag: 'Je hebt een dame meer en zet hem per ongeluk pat. Wat is de uitslag?',
          opties: [
            { label: 'gelijkspel, ook al stond je veel beter', emoji: '😤', goed: true },
            { label: 'je wint alsnog', emoji: '🏆' },
          ],
          foutTip: 'Daarom is pat zo gemeen. Laat hem altijd één zet over.',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Wanneer is een partij remise?',
          opties: [
            { label: 'bij pat, of als niemand meer kan winnen', emoji: '🤝', goed: true },
            { label: 'als je je dame kwijt bent', emoji: '👑' },
            { label: 'nooit, er is altijd een winnaar', emoji: '🏆' },
          ],
        },
        {
          kind: 'quiz',
          vraag: 'Sta je veel beter en wil je winnen? Waar let je dan op?',
          opties: [
            { label: 'dat hij altijd nog een zet kan doen', emoji: '👀', goed: true },
            { label: 'dat je zo snel mogelijk speelt', emoji: '⚡' },
          ],
        },
      ],
      themas: ['pat', 'remise', 'mat'],
    },
  ],
}
