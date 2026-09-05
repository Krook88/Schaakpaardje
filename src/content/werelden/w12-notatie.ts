import { START, type World } from '../types'

/**
 * Wereld 12 — Notatie-eiland.
 * Vanaf hier kan een kind een partij opschrijven en teruglezen, en dat is de deur naar
 * een boek, een clubpartij en een diploma. De veldnamen staan in deze wereld altijd aan
 * (`toonCoordinaten`), ook als de ouder ze verder heeft uitgezet.
 */
export const wereld12: World = {
  id: 'notatie',
  nummer: 12,
  naam: 'Notatie-eiland',
  emoji: '✏️',
  belofte: 'Hier leer je zetten opschrijven en teruglezen.',
  minLeeftijd: 8,
  minispel: 'schrijf-de-zet',
  diploma: 'zilver',
  lessen: [
    {
      id: 'notatie-1',
      wereldId: 'notatie',
      titel: 'Elk veld heeft een naam',
      doel: 'Je kind vindt een veld op naam, zoals e4 of h8.',
      geleerd: 'Nu vind jij elk veld op naam, zoals e4 en h8.',
      toonCoordinaten: true,
      vertel: [
        'Kijk eens naar de randen van het bord. Daar staan letters en cijfers.',
        'De letters lopen van a tot h, van links naar rechts. De cijfers van 1 tot 8, van beneden naar boven.',
        'Zo heeft elk veld een eigen naam. Eerst de letter, dan het cijfer. Bijvoorbeeld e4.',
      ],
      vertelFen: '8/8/8/8/4P3/8/8/8',
      vertelWijs: ['e4'],
      meedoen: [
        {
          kind: 'tapSquares',
          fen: '8/8/8/8/8/8/8/8',
          correct: ['e4'],
          vraag: 'Tik veld e4 aan. Zoek eerst de letter e, ga dan naar cijfer 4.',
          foutTip: 'Eerst de letter onderaan zoeken, dan omhoog tellen tot het cijfer.',
        },
      ],
      zelf: [
        {
          kind: 'tapSquares',
          fen: '8/8/8/8/8/8/8/8',
          correct: ['a1'],
          vraag: 'Tik a1 aan. Dat is de hoek linksonder.',
        },
        {
          kind: 'tapSquares',
          fen: '8/8/8/8/8/8/8/8',
          correct: ['h8'],
          vraag: 'En nu h8, de hoek helemaal aan de andere kant.',
        },
        {
          kind: 'tapSquares',
          fen: '8/8/8/8/8/8/8/8',
          correct: ['d5'],
          vraag: 'Tik d5 aan.',
          foutTip: 'De d is de vierde letter. Tel dan vijf omhoog.',
        },
      ],
      toets: [
        {
          kind: 'tapSquares',
          fen: '8/8/8/8/8/8/8/8',
          correct: ['c6', 'f3'],
          vraag: 'Tik twee velden aan: eerst c6, dan f3.',
        },
        {
          kind: 'quiz',
          vraag: 'Wat komt er eerst in de naam van een veld?',
          opties: [
            { label: 'de letter', emoji: '🔤', goed: true },
            { label: 'het cijfer', emoji: '🔢' },
          ],
        },
      ],
      themas: ['notatie', 'bord'],
    },
    {
      id: 'notatie-2',
      wereldId: 'notatie',
      titel: 'Zetten opschrijven',
      doel: 'Je kind leest en schrijft zetten als Pf3 en e4.',
      geleerd: 'Nu kun jij een zet opschrijven en teruglezen.',
      toonCoordinaten: true,
      vertel: [
        'Nu kun je elke zet opschrijven. Je schrijft welk stuk het is, en waar het heen gaat.',
        'De toren is T, het paard P, de loper L, de dame D en de koning K.',
        'Bij een pion schrijf je alleen het veld. Dus e4 betekent: een pion naar e4.',
      ],
      vertelFen: START,
      meedoen: [
        {
          kind: 'move',
          fen: START,
          from: 'e2',
          goed: ['e4'],
          vraag: 'Speel de zet e4. Dat is een pion naar e4.',
          foutTip: 'Bij een pionzet staat er alleen een veld. Pak de pion die daarheen kan.',
        },
      ],
      zelf: [
        {
          kind: 'move',
          fen: START,
          from: 'g1',
          goed: ['f3'],
          vraag: 'Speel Pf3: het paard naar f3.',
          foutTip: 'P is het paard. Er is er maar één die f3 kan halen.',
        },
        {
          kind: 'quiz',
          vraag: 'Wat betekent Ld3?',
          opties: [
            { label: 'een loper naar d3', emoji: '♗', goed: true },
            { label: 'een dame naar d3', emoji: '👑' },
            { label: 'een pion naar d3', emoji: '♟️' },
          ],
          foutTip: 'L is de loper. D zou de dame zijn.',
        },
        {
          kind: 'quiz',
          vraag: 'Hoe schrijf je "een pion naar d4" op?',
          opties: [
            { label: 'd4', emoji: '✏️', goed: true },
            { label: 'Pd4', emoji: '🐴' },
            { label: 'pion d4', emoji: '📝' },
          ],
          foutTip: 'Bij een pion schrijf je alleen het veld. Pd4 zou een paard zijn.',
        },
      ],
      toets: [
        {
          kind: 'move',
          fen: START,
          from: 'd2',
          goed: ['d4'],
          vraag: 'Speel d4.',
        },
        {
          kind: 'quiz',
          vraag: 'Welke letter hoort bij het paard?',
          opties: [
            { label: 'P', emoji: '🐴', goed: true },
            { label: 'K', emoji: '🤴' },
            { label: 'T', emoji: '🏰' },
          ],
        },
      ],
      themas: ['notatie'],
    },
    {
      id: 'notatie-3',
      wereldId: 'notatie',
      titel: 'Hoe begin je een partij?',
      doel: 'Je kind kent de drie openingsregels: centrum, ontwikkelen, rokeren.',
      geleerd: 'Nu weet je hoe je een partij begint.',
      toonCoordinaten: true,
      vertel: [
        'Nu je kunt opschrijven, leer je ook hoe je begint. Er zijn drie simpele regels.',
        'Eén: pak het midden. Twee: haal je paarden en lopers naar buiten. Drie: rokeer op tijd.',
        'En eentje die je juist níet moet doen: je dame heel vroeg naar buiten. Die wordt dan opgejaagd.',
      ],
      vertelFen: START,
      vertelWijs: ['d4', 'e4', 'd5', 'e5'],
      meedoen: [
        {
          kind: 'move',
          fen: START,
          from: 'e2',
          goed: ['e4'],
          vraag: 'Begin met een pion naar het midden. Speel e4.',
        },
      ],
      zelf: [
        {
          kind: 'quiz',
          vraag: 'Wat doe je in het begin van de partij?',
          opties: [
            { label: 'het midden pakken en je stukken ontwikkelen', emoji: '🎯', goed: true },
            { label: 'meteen met je dame aanvallen', emoji: '👑' },
            { label: 'alle pionnen vooruit', emoji: '🌊' },
          ],
          foutTip: 'Eerst het midden en je stukken naar buiten. De dame komt later.',
        },
        {
          kind: 'move',
          fen: START,
          from: 'b1',
          goed: ['c3'],
          vraag: 'Ontwikkel je paard naar het midden. Speel Pc3.',
          foutTip: 'Naar de rand is zonde: daar kan een paard veel minder.',
        },
        {
          kind: 'quiz',
          vraag: 'Mag je in het begin tien keer met hetzelfde stuk zetten?',
          opties: [
            { label: 'nee, haal eerst al je stukken naar buiten', emoji: '🚫', goed: true },
            { label: 'ja, als het een goed stuk is', emoji: '👍' },
          ],
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Welke van deze drie is géén goede openingsregel?',
          opties: [
            { label: 'je dame zo vroeg mogelijk naar buiten', emoji: '👑', goed: true },
            { label: 'het midden pakken', emoji: '🎯' },
            { label: 'op tijd rokeren', emoji: '🏯' },
          ],
          foutTip: 'Een vroege dame wordt opgejaagd door zijn kleine stukken. Dat kost je tijd.',
        },
        {
          kind: 'move',
          fen: START,
          from: 'g1',
          goed: ['f3'],
          vraag: 'Ontwikkel je koningspaard. Speel Pf3.',
        },
      ],
      themas: ['notatie', 'opening'],
    },
  ],
}
