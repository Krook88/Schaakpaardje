import { type World } from '../types'

/**
 * Wereld 13 — Tactiekgrot.
 * De eerste wereld waarin een kind niet één stuk bekijkt maar een patroon: twee stukken
 * tegelijk aanvallen, of een stuk vastzetten omdat er iets duurders achter staat.
 *
 * De stellingen zijn niet verzonnen maar gezocht: een script heeft het bord afgezocht
 * naar posities waar precies één zet de vork of de penning oplevert.
 * tests/wereld10-14.test.ts rekent dat na — inclusief de eis dat het gepende stuk vóór
 * de zet nog wél kon bewegen, want anders zet je iets vast wat al vaststond.
 */
export const wereld13: World = {
  id: 'tactiek',
  nummer: 13,
  naam: 'Tactiekgrot',
  emoji: '🔱',
  toon: 320,
  belofte: 'Twee vliegen in één klap.',
  minLeeftijd: 9,
  minispel: 'tactiekduel',
  lessen: [
    {
      id: 'tactiek-1',
      wereldId: 'tactiek',
      titel: 'De dubbele aanval',
      icoon: '🔱',
      doel: 'Je kind valt met één zet twee stukken tegelijk aan.',
      geleerd: 'Nu val jij met één zet twee stukken tegelijk aan.',
      vertel: [
        'Nu een echte truc. Wat als je met één zet twee stukken tegelijk aanvalt?',
        'Hij kan er maar eentje redden. De andere is voor jou.',
        'Het paard is hier een kei in. Zo’n dubbele aanval heet ook wel een vork.',
      ],
      vertelFen: 'r3k3/8/N7/8/8/8/8/7K',
      vertelWijs: ['a8', 'e8'],
      meedoen: [
        {
          kind: 'move',
          fen: 'r3k3/8/N7/8/8/8/8/7K',
          from: 'a6',
          goed: ['c7'],
          vraag: 'Spring zo dat je de koning én de toren tegelijk aanvalt.',
          foutTip: 'Zoek een veld waar je vanaf allebei kunt komen. Denk aan de L.',
        },
      ],
      zelf: [
        {
          kind: 'move',
          fen: '1N5k/8/8/r3r3/8/8/8/6K1',
          from: 'b8',
          goed: ['c6'],
          vraag: 'Val met je paard beide torens tegelijk aan.',
          foutTip: 'Er is één veld van waaruit je allebei de torens raakt.',
        },
        {
          kind: 'quiz',
          vraag: 'Je valt twee stukken tegelijk aan. Wat kan je tegenstander doen?',
          opties: [
            { label: 'er maar eentje redden', emoji: '😬', goed: true },
            { label: 'allebei redden', emoji: '🤹' },
            { label: 'passen', emoji: '😴' },
          ],
        },
      ],
      toets: [
        {
          kind: 'move',
          fen: 'r3k3/8/4N3/8/8/8/8/7K',
          from: 'e6',
          goed: ['c7'],
          vraag: 'Zoek de vork.',
          foutTip: 'Welk veld raakt zowel de koning als de toren in de hoek?',
        },
        {
          kind: 'quiz',
          vraag: 'Welk stuk is het beste in dubbele aanvallen?',
          opties: [
            { label: 'het paard', emoji: '🐴', goed: true },
            { label: 'de toren', emoji: '🏰' },
            { label: 'de pion', emoji: '♟️' },
          ],
          foutTip: 'Het paard springt overal overheen en raakt vaak twee dingen tegelijk.',
        },
      ],
      themas: ['tactiek', 'dubbele aanval'],
    },
    {
      id: 'tactiek-2',
      wereldId: 'tactiek',
      titel: 'De penning',
      icoon: '📌',
      doel: 'Je kind zet een stuk vast doordat er iets kostbaars achter staat.',
      geleerd: 'Nu zet jij een stuk vast met een penning.',
      vertel: [
        'Nog een truc: de penning. Je zet een stuk vast zodat het niet meer weg kan.',
        'Hoe? Je zorgt dat er iets duurders achter staat. Zijn koning bijvoorbeeld.',
        'Gaat dat stuk opzij, dan staat de koning schaak. En dat mag niet. Dus hij zit vast.',
      ],
      vertelFen: '4k3/8/B1n5/8/8/8/8/7K',
      vertelWijs: ['c6', 'e8'],
      meedoen: [
        {
          kind: 'move',
          fen: '4k3/8/B1n5/8/8/8/8/7K',
          from: 'a6',
          goed: ['b5'],
          vraag: 'Zet je loper zo neer dat het paard niet meer weg kan.',
          foutTip: 'Zoek de diagonaal waarop het paard én de koning allebei staan.',
        },
      ],
      zelf: [
        {
          kind: 'move',
          fen: '4k3/8/8/4n3/R7/8/8/K7',
          from: 'a4',
          goed: ['e4'],
          vraag: 'Pen het paard met je toren.',
          foutTip: 'Het paard en de koning staan op dezelfde lijn. Ga daar met je toren op staan.',
        },
        {
          kind: 'quiz',
          vraag: 'Waarom kan een gepend stuk niet weg?',
          opties: [
            { label: 'dan zou de koning schaak komen te staan', emoji: '⚡', goed: true },
            { label: 'het is te zwaar', emoji: '🪨' },
            { label: 'het mag van de regels nooit meer bewegen', emoji: '🚫' },
          ],
        },
      ],
      toets: [
        {
          kind: 'move',
          fen: '4k3/1p6/2n5/8/8/3B4/8/7K',
          from: 'd3',
          goed: ['b5'],
          vraag: 'Zet het paard vast met je loper.',
          foutTip: 'Ga op de diagonaal staan waar het paard en de koning allebei op liggen.',
        },
        {
          kind: 'quiz',
          vraag: 'Wat doe je met een stuk dat vastzit?',
          opties: [
            { label: 'er nog een keer op aanvallen', emoji: '⚔️', goed: true },
            { label: 'het met rust laten', emoji: '😌' },
          ],
          foutTip: 'Het kan toch niet weg. Val het nog een keer aan, dan win je het.',
        },
      ],
      themas: ['tactiek', 'penning'],
    },
  ],
}
