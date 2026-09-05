import { type World } from '../types'

/**
 * Wereld 11 — Rokadehaven.
 *
 * De rokade is de enige zet waarbij twee stukken tegelijk bewegen, en hij heeft vier
 * voorwaarden. Voor een kind is dat veel tegelijk. Wat helpt: het bord doet het werk.
 * Bij een regelZet-opgave licht de rokade alleen op als hij écht mag — mag hij niet,
 * dan is er niets aan te wijzen en dat is de duidelijkste uitleg die er is.
 *
 * Alle stellingen zijn met chess.js nagerekend op welke rokades er mogelijk zijn.
 */
export const wereld11: World = {
  id: 'rokade',
  nummer: 11,
  naam: 'Rokadehaven',
  emoji: '🏯',
  belofte: 'Breng je koning veilig achter een muurtje.',
  minLeeftijd: 8,
  minispel: 'breng-de-koning-veilig',
  lessen: [
    {
      id: 'rokade-1',
      wereldId: 'rokade',
      titel: 'Twee stukken tegelijk',
      doel: 'Je kind kan rokeren en weet waarom je het doet.',
      geleerd: 'Nu kun jij rokeren: twee stukken in één zet.',
      vertel: [
        'Nu een hele bijzondere zet: de rokade. Het is de enige zet met twee stukken tegelijk.',
        'Je koning stapt twee velden opzij, en de toren springt er meteen overheen.',
        'Waarom? Je koning staat veilig in een hoekje, en je toren komt naar het midden. Slim!',
      ],
      vertelFen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R',
      vertelWijs: ['e1', 'h1'],
      meedoen: [
        {
          kind: 'regelZet',
          fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
          eis: 'rokeer',
          vraag: 'Rokeer! Tik je koning aan en zet hem twee velden opzij.',
          foutTip: 'Pak de koning op e1 en zet hem op g1 of c1. De toren gaat vanzelf mee.',
        },
      ],
      zelf: [
        {
          kind: 'quiz',
          vraag: 'Welke twee stukken doen mee aan de rokade?',
          opties: [
            { label: 'de koning en een toren', emoji: '🤴', goed: true },
            { label: 'de koning en de dame', emoji: '👑' },
            { label: 'twee torens', emoji: '🏰' },
          ],
        },
        {
          kind: 'quiz',
          vraag: 'Waarom rokeer je?',
          opties: [
            { label: 'je koning staat veiliger en je toren doet mee', emoji: '🛡️', goed: true },
            { label: 'je krijgt er een extra beurt door', emoji: '⏭️' },
            { label: 'het moet van de regels', emoji: '📏' },
          ],
        },
        {
          kind: 'regelZet',
          fen: '4k3/8/8/8/8/8/8/R3K2R w K - 0 1',
          eis: 'rokeer',
          vraag: 'Hier mag er maar eentje. Zoek hem.',
          foutTip: 'Alleen de korte rokade mag hier nog. Zet je koning naar g1.',
        },
      ],
      toets: [
        {
          kind: 'regelZet',
          fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
          eis: 'rokeer',
          vraag: 'Rokeer nog een keer. Kort of lang, jij mag kiezen.',
        },
        {
          kind: 'quiz',
          vraag: 'Hoeveel velden gaat de koning bij het rokeren?',
          opties: [
            { label: 'twee', emoji: '2️⃣', goed: true },
            { label: 'één', emoji: '1️⃣' },
            { label: 'drie', emoji: '3️⃣' },
          ],
        },
      ],
      themas: ['rokade', 'koningsveiligheid'],
    },
    {
      id: 'rokade-2',
      wereldId: 'rokade',
      titel: 'Kort en lang',
      doel: 'Je kind kent het verschil tussen de korte en de lange rokade.',
      geleerd: 'Nu ken je de korte en de lange rokade.',
      vertel: [
        'Er zijn twee rokades. Aan de kant van de koning is het maar een klein stukje: dat is de korte.',
        'Aan de kant van de dame is het verder: dat is de lange rokade.',
        'Kort gaat sneller en is meestal veiliger. Lang zet je toren wel mooi in het midden.',
      ],
      vertelFen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R',
      vertelWijs: ['a1', 'h1'],
      meedoen: [
        {
          kind: 'quiz',
          vraag: 'Welke rokade is de korte?',
          opties: [
            { label: 'die aan de kant van de koning', emoji: '🤴', goed: true },
            { label: 'die aan de kant van de dame', emoji: '👑' },
          ],
          foutTip: 'Aan de koningskant staan minder velden tussen koning en toren. Dat is de korte.',
        },
      ],
      zelf: [
        {
          kind: 'regelZet',
          fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3KN1R w KQkq - 0 1',
          eis: 'rokeer',
          vraag: 'Je paard staat op f1. Welke rokade kan nu nog?',
          foutTip: 'Kort kan niet, want tussen koning en toren moet alles leeg zijn. Rokeer lang.',
        },
        {
          kind: 'quiz',
          vraag: 'Er staat een eigen stuk tussen je koning en je toren. Mag je rokeren?',
          opties: [
            { label: 'nee, alles ertussen moet leeg zijn', emoji: '🚫', goed: true },
            { label: 'ja, je springt er gewoon overheen', emoji: '🦘' },
          ],
        },
        {
          kind: 'quiz',
          vraag: 'Bij de lange rokade gaat de toren over de koning heen naar...',
          opties: [
            { label: 'het veld naast de koning', emoji: '➡️', goed: true },
            { label: 'de hoek', emoji: '🏰' },
          ],
          foutTip: 'De toren komt altijd vlak naast de koning te staan, aan de andere kant.',
        },
      ],
      toets: [
        {
          kind: 'regelZet',
          fen: '4k1r1/8/8/8/8/8/8/R3K2R w KQ - 0 1',
          eis: 'rokeer',
          vraag: 'De zwarte toren kijkt naar g1. Welke rokade mag er nu?',
          foutTip: 'Je koning mag niet door een aangevallen veld heen. Rokeer naar de andere kant.',
        },
        {
          kind: 'quiz',
          vraag: 'Wanneer rokeer je het liefst?',
          opties: [
            { label: 'vroeg in de partij, voordat het druk wordt', emoji: '⏱️', goed: true },
            { label: 'zo laat mogelijk', emoji: '🐌' },
            { label: 'nooit', emoji: '🚫' },
          ],
        },
      ],
      themas: ['rokade'],
    },
    {
      id: 'rokade-3',
      wereldId: 'rokade',
      titel: 'De vier voorwaarden',
      doel: 'Je kind weet wanneer rokeren niet mag.',
      geleerd: 'Nu weet je precies wanneer rokeren niet mag.',
      vertel: [
        'Rokeren mag niet altijd. Er zijn vier regels, en je moet ze alle vier onthouden.',
        'Eén: je koning en die toren mogen nog niet gezet hebben. Twee: ertussen moet alles leeg zijn.',
        'Drie: je mag niet rokeren als je schaak staat. En vier: je koning mag niet door een aangevallen veld heen.',
      ],
      vertelFen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R',
      meedoen: [
        {
          kind: 'quiz',
          vraag: 'Je koning heeft al een keer gezet. Mag je nog rokeren?',
          opties: [
            { label: 'nee, nooit meer', emoji: '🚫', goed: true },
            { label: 'ja, als hij weer terugstaat', emoji: '↩️' },
          ],
          foutTip: 'Eén keer zetten met je koning en de rokade is voorgoed weg.',
        },
      ],
      zelf: [
        {
          kind: 'quiz',
          vraag: 'Je staat schaak. Mag je uit het schaak rokeren?',
          opties: [
            { label: 'nee, dat mag niet', emoji: '🚫', goed: true },
            { label: 'ja, dat is een goede manier', emoji: '🛡️' },
          ],
          foutTip: 'Rokeren is geen manier om uit schaak te gaan. Weglopen, slaan of ertussen wél.',
        },
        {
          kind: 'quiz',
          vraag: 'Je toren wordt aangevallen. Mag je nog rokeren met die toren?',
          opties: [
            { label: 'ja, dat mag gewoon', emoji: '✅', goed: true },
            { label: 'nee, dan mag het niet', emoji: '🚫' },
          ],
          foutTip: 'Alleen de koning mag niet door vuur. Voor de toren geldt dat niet.',
        },
        {
          // "Mag het hier?" suggereerde dat er iets verboden was, terwijl beide
          // rokades gewoon mogen — en elk ander antwoord dan rokeren wordt afgekeurd,
          // dus "nee" kon het kind niet eens geven.
          kind: 'regelZet',
          fen: '4k2r/8/8/8/8/8/8/R3K2R w KQk - 0 1',
          eis: 'rokeer',
          vraag: 'Zijn toren staat op jouw toren te loeren. En toch mag het. Rokeer maar.',
          foutTip: 'De toren mag best aangevallen worden. Het gaat erom waar je koning langs komt.',
        },
      ],
      toets: [
        {
          kind: 'quiz',
          vraag: 'Welke van deze vier hoort er NIET bij de rokaderegels?',
          opties: [
            { label: 'je dame moet nog op haar plek staan', emoji: '👑', goed: true },
            { label: 'ertussen moet alles leeg zijn', emoji: '🕳️' },
            { label: 'je mag niet schaak staan', emoji: '⚡' },
          ],
          foutTip: 'De dame heeft er niets mee te maken. Het gaat om de koning en die ene toren.',
        },
        {
          kind: 'regelZet',
          fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
          eis: 'rokeer',
          vraag: 'Laatste keer: breng je koning in veiligheid.',
        },
      ],
      themas: ['rokade', 'regels'],
    },
  ],
}
