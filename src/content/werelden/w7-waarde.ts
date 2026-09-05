import { type World } from '../types'

/**
 * Wereld 7 — Waardevallei.
 * Van "hoe loopt een stuk" naar "wat is het waard". Dit is de eerste wereld waarin
 * het kind een keuze moet maken in plaats van een regel toepassen: twee zetten mogen
 * allebei, maar eentje is beter.
 *
 * Alle stellingen zijn met de engine nagerekend: de goede antwoorden hieronder zijn
 * precies de slagzetten die het duurste stuk pakken.
 */
export const wereld7: World = {
  id: 'waarde',
  nummer: 7,
  naam: 'Waardevallei',
  emoji: '⚖️',
  belofte: 'Hier leer je wat de stukken waard zijn.',
  minLeeftijd: 6,
  minispel: 'weegschaal',
  lessen: [
    {
      id: 'waarde-1',
      wereldId: 'waarde',
      titel: 'Wat is een stuk waard?',
      doel: 'Je kind kent de waarde van de stukken en weet welke het duurst is.',
      geleerd: 'Nu weet je wat elk stuk waard is.',
      vertel: [
        'Niet elk stuk is even veel waard. Dat is handig om te weten.',
        'Een pion is er eentje waard. Een paard en een loper drie. Een toren vijf.',
        'En de dame? Negen! Zij is veruit de duurste. Wees dus zuinig op haar.',
      ],
      vertelFen: '8/8/2q5/8/4r3/1n6/8/6b1',
      vertelWijs: ['c6'],
      meedoen: [
        {
          kind: 'tapSquares',
          fen: '8/8/2q5/8/4r3/1n6/8/6b1',
          correct: ['c6'],
          bedoeling: { soort: 'waarde', waarde: 9 },
          vraag: 'Tik het duurste stuk op het bord aan.',
          foutTip: 'De dame is het duurste. Zij mag recht én schuin.',
        },
      ],
      zelf: [
        {
          kind: 'tapSquares',
          fen: '8/8/2q5/8/4r3/1n6/8/6b1',
          correct: ['e4'],
          bedoeling: { soort: 'waarde', waarde: 5 },
          vraag: 'En welk stuk is vijf waard? Tik het aan.',
          foutTip: 'De toren is vijf waard. Die loopt kaarsrecht.',
        },
        {
          kind: 'quiz',
          vraag: 'Wat is meer waard: een toren of een paard?',
          opties: [
            { label: 'de toren', emoji: '🏰', goed: true },
            { label: 'het paard', emoji: '🐴' },
            { label: 'even veel', emoji: '⚖️' },
          ],
          foutTip: 'Een toren is vijf waard, een paard drie. De toren dus.',
        },
        {
          kind: 'quiz',
          vraag: 'Wat is meer waard: een loper of een paard?',
          opties: [
            { label: 'even veel, allebei drie', emoji: '⚖️', goed: true },
            { label: 'de loper', emoji: '♗' },
            { label: 'het paard', emoji: '🐴' },
          ],
          foutTip: 'Die zijn allebei drie waard. Ze zijn even sterk.',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Hoeveel is de dame waard?',
          opties: [
            { label: 'negen', emoji: '9️⃣', goed: true },
            { label: 'vijf', emoji: '5️⃣' },
            { label: 'drie', emoji: '3️⃣' },
          ],
        },
        {
          kind: 'quiz',
          vraag: 'Hoeveel is een pion waard?',
          opties: [
            { label: 'één', emoji: '1️⃣', goed: true },
            { label: 'drie', emoji: '3️⃣' },
            { label: 'niets', emoji: '0️⃣' },
          ],
        },
        {
          kind: 'tapSquares',
          fen: '8/8/2q5/8/4r3/1n6/8/6b1',
          correct: ['b3', 'g1'],
          bedoeling: { soort: 'waarde', waarde: 3 },
          vraag: 'Tik de twee stukken aan die allebei drie waard zijn.',
          foutTip: 'Het paard en de loper: allebei drie.',
        },
      ],
      themas: ['waarde'],
    },
    {
      id: 'waarde-2',
      wereldId: 'waarde',
      titel: 'Pak wat gratis is',
      doel: 'Je kind ziet welk stuk het meeste oplevert en pakt dat.',
      geleerd: 'Nu pak jij altijd het duurste stuk dat je kunt krijgen.',
      vertel: [
        'Soms staat er een stuk van de tegenstander zomaar te wachten.',
        'Kun je kiezen? Pak dan het duurste. Een dame is meer waard dan een pion.',
        'Kijk dus eerst rond voordat je een zet doet.',
      ],
      vertelFen: '8/8/3q4/8/8/8/8/3R4',
      vertelWijs: ['d6'],
      meedoen: [
        {
          kind: 'move',
          fen: '8/8/3q4/8/8/8/8/3R4',
          from: 'd1',
          goed: ['d6'],
          bedoeling: 'duurste',
          vraag: 'De zwarte dame staat er gratis bij. Pak haar!',
          foutTip: 'De toren loopt recht omhoog, helemaal tot bij de dame.',
        },
      ],
      zelf: [
        {
          kind: 'move',
          fen: '8/8/3p4/8/r2Q4/8/8/8',
          from: 'd4',
          goed: ['a4'],
          bedoeling: 'duurste',
          vraag: 'Je kunt twee dingen pakken. Kies het duurste.',
          foutTip: 'Een toren is vijf waard, een pion maar één. Pak de toren.',
        },
        {
          kind: 'move',
          fen: '8/8/8/2b5/4N3/8/3p4/8',
          from: 'e4',
          goed: ['c5'],
          bedoeling: 'duurste',
          vraag: 'En hier? Pak weer het duurste.',
          foutTip: 'De loper is drie waard, de pion één. En niets dekt die loper.',
        },
      ],
      toets: [
        {
          kind: 'move',
          fen: '8/8/8/4q3/8/2B5/1p6/8',
          from: 'c3',
          goed: ['e5'],
          bedoeling: 'duurste',
          vraag: 'Pak het duurste stuk met je loper.',
          foutTip: 'De dame is negen waard, de pion één. Glijd schuin omhoog.',
        },
        {
          kind: 'quiz',
          vraag: 'Je kunt een pion pakken of een toren. Wat doe je?',
          opties: [
            { label: 'de toren pakken', emoji: '🏰', goed: true },
            { label: 'de pion pakken', emoji: '♟️' },
          ],
        },
      ],
      themas: ['waarde', 'slaan'],
    },
    {
      id: 'waarde-3',
      wereldId: 'waarde',
      titel: 'Ruilen doe je zo',
      doel: 'Je kind begrijpt wanneer een ruil goed uitpakt en wanneer niet.',
      geleerd: 'Nu kijk jij eerst of hij kan terugslaan.',
      vertel: [
        'Ruilen betekent: jij slaat zijn stuk, hij slaat daarna dat van jou.',
        'Ruil je een pion tegen een dame? Dan ben jij spekkoper.',
        'Maar geef je je dame voor een pion, dan is dat een slechte ruil. Tel dus even.',
      ],
      vertelFen: '8/8/8/3p4/8/3R4/8/8',
      meedoen: [
        {
          kind: 'quiz',
          vraag: 'Jij slaat zijn dame, hij slaat daarna jouw pion. Goede ruil?',
          opties: [
            { label: 'ja, heel goed', emoji: '🎉', goed: true },
            { label: 'nee, slecht', emoji: '😬' },
          ],
          foutTip: 'Jij wint negen, je verliest één. Dat is een prima ruil.',
        },
      ],
      zelf: [
        {
          kind: 'quiz',
          vraag: 'Jij slaat zijn pion, hij slaat daarna jouw toren. Goede ruil?',
          opties: [
            { label: 'nee, slecht', emoji: '😬', goed: true },
            { label: 'ja, goed', emoji: '🎉' },
          ],
          foutTip: 'Je wint één en verliest vijf. Dat kost je vier.',
        },
        {
          kind: 'quiz',
          vraag: 'Jij slaat zijn paard, hij slaat daarna jouw loper. Wie wint hierbij?',
          opties: [
            { label: 'niemand, dat is eerlijk', emoji: '⚖️', goed: true },
            { label: 'jij wint', emoji: '🙂' },
            { label: 'hij wint', emoji: '🙁' },
          ],
          foutTip: 'Paard en loper zijn allebei drie waard. Gelijk oversteken.',
        },
        {
          kind: 'move',
          fen: '8/8/8/3p4/8/3R4/8/8',
          from: 'd3',
          goed: ['d5'],
          vraag: 'Deze pion staat er onbeschermd bij. Pak hem.',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Wat moet je altijd doen vóór je iets slaat?',
          opties: [
            { label: 'kijken of hij kan terugslaan', emoji: '👀', goed: true },
            { label: 'meteen slaan, altijd', emoji: '⚔️' },
            { label: 'je dame naar voren zetten', emoji: '👑' },
          ],
          foutTip: 'Kijk eerst of hij kan terugslaan. Anders wordt je goede zet een slechte.',
        },
        {
          kind: 'quiz',
          vraag: 'Je kunt zijn toren pakken, maar dan slaat hij jouw paard terug. Doen?',
          opties: [
            { label: 'ja, vijf voor drie is winst', emoji: '🎉', goed: true },
            { label: 'nee, laat maar', emoji: '🙅' },
          ],
          foutTip: 'Je wint vijf en verliest drie. Twee winst, dus doen.',
        },
      ],
      themas: ['waarde', 'ruilen'],
    },
  ],
}
