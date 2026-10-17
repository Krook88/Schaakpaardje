import type { PieceType } from '@/engine/board'
import type { Animatie } from '@/uitleg/beelden'

/**
 * De schaakregels, uitgelegd voor ouders, met een bewegend bord bij elke regel.
 *
 * Waarom dit bestaat: wie "hoe loopt het paard" of "wat is en passant" zoekt, is
 * precies de ouder voor wie deze app gemaakt is, en vond tot nu toe een andere site.
 * Elke pagina beantwoordt één zo'n vraag, met een bord dat het voordoet, en wijst
 * daarna naar de lessen waarin een kind het zelf oefent.
 *
 * Net als de lessen is dit data. De animaties zeggen alleen wát er gebeurt ("speel
 * e1-g1", "laat zien waar het paard heen kan"); waar een stuk heen kan, of een koning
 * schaak staat en of het mat of pat is, rekent de engine uit. `tests/schaakregels.test.ts`
 * speelt elke animatie na en weigert er een met een zet die niet kan.
 *
 * Deze pagina's zijn voor ouders. De volgorde voor het kind blijft die van de lessen: mat
 * komt daar pas in wereld 10. Dat een ouder hier al kan lezen wat mat is, verandert
 * daar niets aan, en de pagina over mat zegt dat er ook bij.
 */

export type Onderwerp = {
  slug: string
  /** De kop van de pagina, in de vorm van de vraag die iemand intikt. */
  vraag: string
  /** Voor in de zoekresultaten, zonder "| Schaakmaatje": dat zet het sjabloon erachter. */
  zoektitel: string
  /** Onder de 160 tekens. */
  omschrijving: string
  /** Eén regel voor het overzicht. */
  kort: string
  /** Beeldmerk: een stuk, of een teken als het over geen stuk in het bijzonder gaat. */
  stuk?: PieceType
  teken?: string
  /** Het antwoord in twee zinnen, bovenaan, voor wie niet verder leest. */
  antwoord: string
  delen: { kop: string; tekst: string[]; animatie?: Animatie }[]
  /** Zo oefen je het thuis aan een echt bord. */
  thuis: string
  vragen: [string, string][]
  /** De lessen waarin een kind dit zelf oefent. */
  lessen: string[]
}

export const SCHAAKREGELS: Onderwerp[] = [
  {
    slug: 'schaakbord-opzetten',
    vraag: 'Hoe zet je een schaakbord op?',
    zoektitel: 'Schaakbord opzetten: zo staan de stukken goed',
    omschrijving:
      'Hoe leg je een schaakbord neer en waar staan de stukken? Met een bewegend bord: licht veld rechtsonder, dame op haar eigen kleur.',
    kort: 'Licht veld rechtsonder, en waar elk stuk begint.',
    teken: '▦',
    antwoord:
      'Leg het bord zo neer dat rechtsonder een licht veld ligt. Zet dan de torens in de hoeken, de paarden en lopers ernaast, de dame op haar eigen kleur en de koning ernaast; de pionnen komen op de rij ervoor.',
    delen: [
      {
        kop: 'Eerst het bord: licht veld rechtsonder',
        tekst: [
          'Een schaakbord heeft 64 velden, om en om licht en donker. Het kan maar op één manier goed liggen: met een licht veld in de hoek rechtsonder, aan de kant van allebei de spelers.',
          'Het lijkt een detail, maar ligt het bord een kwartslag gedraaid, dan staan straks de koning en de dame verkeerd en klopt er van de opening niets meer. Ook bij volwassenen gaat dit vaker mis dan je denkt.',
        ],
        animatie: {
          id: 'bord-neerleggen',
          titel: 'Welke hoek is licht?',
          beschrijving: 'Een leeg schaakbord. Het veld rechtsonder, h1, licht op als licht veld; linksonder, a1, is donker.',
          fen: '8/8/8/8/8/8/8/8',
          stappen: [
            { tekst: 'Een leeg bord: 64 velden, om en om licht en donker.' },
            { tekst: 'Rechtsonder, aan jouw kant, hoort een licht veld.', markeer: ['h1'] },
            { tekst: 'Linksonder ligt dan een donker veld.', markeer: ['a1'] },
            { tekst: 'Voor de speler aan de overkant geldt hetzelfde: ook die heeft rechts een licht veld.', markeer: ['a8'] },
          ],
        },
      },
      {
        kop: 'Dan de stukken',
        tekst: [
          'Wit staat onderaan, zwart bovenaan. Op de achterste rij staan van buiten naar binnen: toren, paard, loper. In het midden blijven twee velden over voor de dame en de koning.',
          'De dame gaat op haar eigen kleur: de witte dame op het lichte veld, de zwarte dame op het donkere. Zo staan de twee dames precies tegenover elkaar, en de koningen ook. Daarna komen de acht pionnen op de rij ervoor.',
        ],
        animatie: {
          id: 'stukken-opzetten',
          titel: 'De stukken op hun plek',
          beschrijving: 'De stukken worden één groep tegelijk op het bord gezet, tot de beginstelling compleet is.',
          fen: '8/8/8/8/8/8/8/8',
          stappen: [
            { tekst: 'De torens staan in de hoeken.', plaats: { a1: 'R', h1: 'R', a8: 'r', h8: 'r' } },
            { tekst: 'De paarden ernaast.', plaats: { b1: 'N', g1: 'N', b8: 'n', g8: 'n' } },
            { tekst: 'Dan de lopers.', plaats: { c1: 'B', f1: 'B', c8: 'b', f8: 'b' } },
            { tekst: 'De dame op haar eigen kleur: wit op licht, zwart op donker.', plaats: { d1: 'Q', d8: 'q' } },
            { tekst: 'De koning op het laatste vrije veld, naast de dame.', plaats: { e1: 'K', e8: 'k' } },
            {
              tekst: 'En de pionnen op de rij ervoor. Klaar om te spelen!',
              plaats: {
                a2: 'P', b2: 'P', c2: 'P', d2: 'P', e2: 'P', f2: 'P', g2: 'P', h2: 'P',
                a7: 'p', b7: 'p', c7: 'p', d7: 'p', e7: 'p', f7: 'p', g7: 'p', h7: 'p',
              },
            },
          ],
        },
      },
    ],
    thuis:
      'Laat je kind het bord neerleggen en vraag: is rechtsonder licht? Haal daarna alle stukken eraf en laat het ze terugzetten. Het rijmpje "de dame op haar eigen kleur" helpt bij de laatste twee.',
    vragen: [
      ['Wie begint bij schaken?', 'Wit doet altijd de eerste zet. Daarna zijn wit en zwart om de beurt.'],
      [
        'Staat de koning links of rechts van de dame?',
        'Dat volgt vanzelf als de dame op haar eigen kleur staat: de koning krijgt het andere middenveld. Bij wit staat de koning dan rechts van de dame, bij zwart (van zwart uit gezien) links.',
      ],
    ],
    lessen: ['weide-1', 'weide-3', 'opstelling'],
  },
  {
    slug: 'toren',
    vraag: 'Hoe loopt de toren?',
    zoektitel: 'Hoe loopt de toren bij schaken? Uitleg voor kinderen',
    omschrijving:
      'De toren loopt recht: omhoog, omlaag en opzij, zo ver als hij wil. Bekijk het op een bewegend bord en lees hoe je het je kind leert.',
    kort: 'Recht vooruit, achteruit en opzij, zo ver als hij wil.',
    stuk: 'r',
    antwoord:
      'De toren loopt recht: vooruit, achteruit, naar links en naar rechts, zo veel velden als hij wil. Hij kan niet over andere stukken heen, en hij slaat door op het veld van een vijandelijk stuk te gaan staan.',
    delen: [
      {
        kop: 'Recht, zo ver als hij wil',
        tekst: [
          'De toren is het makkelijkste stuk om mee te beginnen, en daarom komt hij in de app als eerste. Hij gaat in rechte lijnen, nooit schuin, en hij mag zo ver doorlopen als hij wil.',
          'Op een leeg bord kan een toren altijd naar veertien velden, waar hij ook staat: zeven in zijn rij en zeven in zijn lijn.',
        ],
        animatie: {
          id: 'toren-recht',
          titel: 'De toren loopt recht',
          beschrijving: 'Een witte toren op d4. Alle velden in zijn rij en lijn lichten op; daarna gaat hij naar d8 en naar h8.',
          fen: '8/8/8/8/3R4/8/8/8',
          stappen: [
            { tekst: 'De toren staat op d4.', markeer: ['d4'] },
            { tekst: 'Hij loopt recht: omhoog, omlaag, naar links en naar rechts. Zo ver als hij wil.', bereik: 'd4' },
            { tekst: 'In één zet helemaal naar boven.', zet: 'd4-d8' },
            { tekst: 'En dan in één zet naar de hoek.', zet: 'd8-h8' },
            { tekst: 'Ook vanuit de hoek kan hij weer naar veertien velden.', bereik: 'h8' },
          ],
        },
      },
      {
        kop: 'Niet door stukken heen, wel slaan',
        tekst: [
          'Staat er een eigen stuk in de weg, dan stopt de toren ervoor. Staat er een stuk van de tegenstander, dan mag hij dat slaan: hij gaat op dat veld staan en het andere stuk gaat van het bord.',
          'Slaan is bij schaken nooit verplicht. Je mag het doen, maar je hoeft niet.',
        ],
        animatie: {
          id: 'toren-slaan',
          titel: 'Stoppen en slaan',
          beschrijving: 'Een witte toren op d4 met een eigen pion op b4 en een zwarte pion op d6. De toren stopt voor de eigen pion en slaat de zwarte.',
          fen: '8/8/3p4/8/1P1R4/8/8/8',
          stappen: [
            { tekst: 'Links staat een eigen pion, boven een zwarte pion.', markeer: ['b4', 'd6'] },
            { tekst: 'Voor de eigen pion stopt de toren. De zwarte pion kan hij slaan.', bereik: 'd4' },
            { tekst: 'Hij slaat: de toren gaat op d6 staan en de pion is van het bord.', zet: 'd4-d6' },
          ],
        },
      },
    ],
    thuis:
      'Zet een toren alleen op een leeg bord en leg op een paar velden een rozijntje. Hoeveel zetten heeft de toren nodig om ze allemaal op te eten? Je kind merkt vanzelf dat hij in één zet heel ver kan.',
    vragen: [
      ['Hoeveel is een toren waard?', 'Een toren is vijf punten waard, als je een pion op één punt zet. Na de dame is hij het sterkste stuk.'],
      ['Mag de toren schuin?', 'Nee, nooit. Schuin is van de loper. De dame mag allebei.'],
    ],
    lessen: ['toren-1', 'toren-2', 'toren-3'],
  },
  {
    slug: 'loper',
    vraag: 'Hoe loopt de loper?',
    zoektitel: 'Hoe loopt de loper bij schaken? Uitleg voor kinderen',
    omschrijving:
      'De loper loopt schuin, zo ver als hij wil, en blijft altijd op dezelfde kleur. Bekijk het op een bewegend bord, met tips voor thuis.',
    kort: 'Schuin, zo ver als hij wil, en altijd op zijn eigen kleur.',
    stuk: 'b',
    antwoord:
      'De loper loopt schuin, zo veel velden als hij wil. Omdat schuin lopen je altijd op dezelfde kleur houdt, komt een loper op een donker veld nooit op een licht veld, en andersom.',
    delen: [
      {
        kop: 'Schuin, zo ver als hij wil',
        tekst: [
          'De loper gaat over de schuine lijnen van het bord, in alle vier de richtingen. Net als de toren mag hij zo ver doorlopen als hij wil, zolang er niets in de weg staat.',
        ],
        animatie: {
          id: 'loper-schuin',
          titel: 'De loper gaat schuin',
          beschrijving: 'Een witte loper op c1 laat zijn schuine lijnen zien, gaat naar h6 en dan naar f8, en blijft steeds op donkere velden.',
          fen: '8/8/8/8/8/8/8/2B5',
          stappen: [
            { tekst: 'De loper staat op c1, een donker veld.', markeer: ['c1'] },
            { tekst: 'Hij loopt schuin, zo ver als hij wil.', bereik: 'c1' },
            { tekst: 'In één zet naar h6.', zet: 'c1-h6' },
            { tekst: 'En terug de andere kant op, naar f8.', zet: 'h6-f8' },
            { tekst: 'Kijk waar hij heen kan: allemaal donkere velden. Dat blijft altijd zo.', bereik: 'f8' },
          ],
        },
      },
      {
        kop: 'Altijd op dezelfde kleur',
        tekst: [
          'Iedere speler heeft twee lopers: één op de lichte velden en één op de donkere. Samen kunnen ze overal komen, maar elk afzonderlijk maar op de helft van het bord.',
          'Voor een kind is dit een mooie ontdekking. Laat het zelf proberen een loper naar een veld van de andere kleur te krijgen: het lukt nooit.',
        ],
        animatie: {
          id: 'loper-kleur',
          titel: 'Twee lopers, twee kleuren',
          beschrijving: 'Twee witte lopers op c1 en f1. De ene bestrijkt alleen donkere velden, de andere alleen lichte.',
          fen: '8/8/8/8/8/8/8/2B2B2',
          stappen: [
            { tekst: 'Deze loper staat op een donker veld en komt alleen op donkere velden.', bereik: 'c1' },
            { tekst: 'Deze staat op een licht veld en komt alleen op lichte velden.', bereik: 'f1' },
            { tekst: 'Daarom heb je er twee: samen komen ze overal.', markeer: ['c1', 'f1'] },
          ],
        },
      },
    ],
    thuis:
      'Leg een paar rozijntjes op het bord, op lichte én donkere velden, en laat je kind ze met één loper opeten. Na een tijdje ziet het zelf: de helft is onbereikbaar. Dan mag de tweede loper.',
    vragen: [
      ['Hoeveel is een loper waard?', 'Drie punten, net als een paard.'],
      ['Kan een loper over stukken heen springen?', 'Nee. Alleen het paard kan springen. De loper stopt voor een eigen stuk en kan een stuk van de tegenstander slaan.'],
    ],
    lessen: ['loper-1', 'loper-2', 'loper-3'],
  },
  {
    slug: 'dame',
    vraag: 'Hoe loopt de dame?',
    zoektitel: 'Hoe loopt de dame bij schaken? Uitleg voor kinderen',
    omschrijving:
      'De dame loopt recht én schuin, zo ver als ze wil: ze is de toren en de loper samen. Bekijk het op een bewegend bord.',
    kort: 'Recht én schuin: de toren en de loper in één.',
    stuk: 'q',
    antwoord:
      'De dame loopt recht en schuin, zo veel velden als ze wil. Ze kan dus alles wat de toren en de loper samen kunnen, en daarom is ze het sterkste stuk op het bord.',
    delen: [
      {
        kop: 'De toren en de loper samen',
        tekst: [
          'Wie de toren en de loper kent, kent de dame al. Ze mag elke zet kiezen: als een toren of als een loper. Midden op een leeg bord kan ze naar 27 velden.',
        ],
        animatie: {
          id: 'dame-recht-schuin',
          titel: 'Recht én schuin',
          beschrijving: 'Een witte dame op d4 laat al haar velden zien, gaat schuin naar a7 en dan recht naar g7.',
          fen: '8/8/8/8/3Q4/8/8/8',
          stappen: [
            { tekst: 'De dame staat midden op het bord.', markeer: ['d4'] },
            { tekst: 'Ze loopt recht én schuin, zo ver als ze wil.', bereik: 'd4' },
            { tekst: 'Schuin, als een loper.', zet: 'd4-a7' },
            { tekst: 'En recht, als een toren.', zet: 'a7-g7' },
          ],
        },
      },
      {
        kop: 'Ook de dame stopt',
        tekst: [
          'Hoe sterk ze ook is, de dame kan niet door stukken heen. In de beginstelling kan ze nog nergens heen: haar eigen stukken staan om haar heen. Pas als er een pion opzij gaat, komt er een weg vrij.',
          'Omdat ze zo veel waard is, wil je haar niet zomaar kwijtraken. Een kind dat net de dame kent, haalt haar graag meteen naar voren; dat is precies de dame die de tegenstander het eerst opjaagt.',
        ],
        animatie: {
          id: 'dame-stopt',
          titel: 'Een weg vrij maken',
          beschrijving: 'De beginstelling. De dame op d1 kan nergens heen; na de pionzet e2-e4 kan ze schuin tot h5.',
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
          stappen: [
            { tekst: 'In de beginstelling staat de dame ingesloten door haar eigen stukken.', markeer: ['d1'] },
            { tekst: 'Een pion gaat twee velden vooruit.', zet: 'e2-e4' },
            { tekst: 'Nu is er een schuine weg vrij, tot helemaal aan de rand.', bereik: 'd1' },
          ],
        },
      },
    ],
    thuis:
      'Zet de dame op een leeg bord en laat je kind met een vinger alle velden aanwijzen waar ze heen kan. Begin met de rechte lijnen (de toren), dan de schuine (de loper). Daarna hoeft niemand meer uit te leggen wat de dame is.',
    vragen: [
      ['Hoeveel is de dame waard?', 'Negen punten. Ze is het duurste stuk op het bord; alleen de koning is belangrijker, en die kun je niet ruilen.'],
      ['Waarom heet het de dame en niet de koningin?', 'In het Nederlands zeg je dame. Koningin is niet fout, maar op de schaakclub en in boeken heet ze dame, en haar letter in de notatie is een D.'],
    ],
    lessen: ['dame-1', 'dame-2', 'dame-3'],
  },
  {
    slug: 'paard',
    vraag: 'Hoe loopt het paard?',
    zoektitel: 'Hoe loopt het paard bij schaken? De L-sprong uitgelegd',
    omschrijving:
      'Het paard springt in een L: twee velden recht en één opzij, ook over andere stukken heen. Bekijk de paardensprong op een bewegend bord.',
    kort: 'Twee recht en één opzij: de L-sprong, ook over stukken heen.',
    stuk: 'n',
    antwoord:
      'Het paard springt in de vorm van een L: twee velden recht en dan één opzij. Het is het enige stuk dat over andere stukken heen kan springen.',
    delen: [
      {
        kop: 'De L-sprong',
        tekst: [
          'Het paard is het stuk waar kinderen het langst over doen, en dat is helemaal normaal. Het loopt niet in een lijn maar springt: twee velden vooruit, achteruit of opzij, en dan één veld haaks daarop. Samen vormt dat een L.',
          'Midden op het bord heeft het paard zo acht sprongen. Handig om te weten: bij elke sprong landt het paard op een veld van de andere kleur.',
        ],
        animatie: {
          id: 'paard-l',
          titel: 'Het paard springt in een L',
          beschrijving: 'Een wit paard op d4. Het pad van de L-sprong naar e6 licht op, het paard springt, en daarna verschijnen zijn acht nieuwe sprongen.',
          fen: '8/8/8/8/3N4/8/8/8',
          stappen: [
            { tekst: 'Het paard staat op d4.', markeer: ['d4'] },
            { tekst: 'Twee velden recht vooruit, dan één opzij. Dat is een L.', markeer: ['d5', 'd6', 'e6'] },
            { tekst: 'Hop! Het paard landt op e6.', zet: 'd4-e6' },
            { tekst: 'Van hieruit kan het weer acht kanten op.', bereik: 'e6' },
            { tekst: 'Het landt altijd op een veld van de andere kleur dan waar het stond.', zet: 'e6-g5' },
          ],
        },
      },
      {
        kop: 'In de hoek maar twee sprongen',
        tekst: [
          'Aan de rand van het bord valt de helft van de sprongen weg, en in de hoek blijven er maar twee over. Daarom zeggen schakers: een paard aan de rand is een schande. Een paard hoort in het midden.',
        ],
        animatie: {
          id: 'paard-hoek',
          titel: 'Een paard in de hoek',
          beschrijving: 'Een wit paard op a1 kan maar naar twee velden; na twee sprongen richting het midden kan het naar acht.',
          fen: '8/8/8/8/8/8/8/N7',
          stappen: [
            { tekst: 'In de hoek heeft het paard maar twee sprongen.', bereik: 'a1' },
            { tekst: 'Een sprong richting het midden.', zet: 'a1-b3' },
            { tekst: 'En nog een.', zet: 'b3-d4' },
            { tekst: 'In het midden: acht sprongen.', bereik: 'd4' },
          ],
        },
      },
      {
        kop: 'Over de heg',
        tekst: [
          'Het paard is het enige stuk dat over andere stukken heen springt, van wie ze ook zijn. Daarom kan het al aan het begin van de partij meedoen, terwijl de andere stukken nog achter hun pionnen staan.',
        ],
        animatie: {
          id: 'paard-springt',
          titel: 'Over de pionnen heen',
          beschrijving: 'De beginstelling. Het paard op g1 kan over de pionnen heen naar f3 of h3, en springt naar f3.',
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
          stappen: [
            { tekst: 'In de beginstelling staan de pionnen voor de stukken.', markeer: ['g1'] },
            { tekst: 'Het paard springt er gewoon overheen.', bereik: 'g1' },
            { tekst: 'Naar f3, mooi richting het midden.', zet: 'g1-f3' },
          ],
        },
      },
    ],
    thuis:
      'Laat je kind vanaf één veld alle sprongen van het paard aanwijzen. In het midden zijn het er acht, in de hoek maar twee. Leg daarna een paar rozijntjes neer: welke kan het paard in twee sprongen bereiken?',
    vragen: [
      ['Hoeveel is een paard waard?', 'Drie punten, net als een loper.'],
      [
        'Mag het paard ook eerst één opzij en dan twee recht?',
        'Dat is dezelfde sprong. Het paard verplaatst zich niet over de velden ertussen maar springt in één keer naar het eindveld; de L is alleen een manier om dat veld te vinden.',
      ],
    ],
    lessen: ['paard-1', 'paard-2', 'paard-3', 'paard-4'],
  },
  {
    slug: 'koning',
    vraag: 'Hoe loopt de koning?',
    zoektitel: 'Hoe loopt de koning bij schaken? Uitleg voor kinderen',
    omschrijving:
      'De koning zet één stapje per zet, alle kanten op, en twee koningen staan nooit naast elkaar. Bekijk het op een bewegend bord.',
    kort: 'Eén stapje, alle kanten op. Nooit naast de andere koning.',
    stuk: 'k',
    antwoord:
      'De koning zet één stap per zet, in elke richting: recht en schuin. Hij mag nooit op een veld gaan staan dat de tegenstander aanvalt, en daarom kunnen twee koningen nooit naast elkaar staan.',
    delen: [
      {
        kop: 'Eén stapje, alle kanten op',
        tekst: [
          'De koning is het belangrijkste stuk, maar niet het sterkste. Hij mag alle kanten op, net als de dame, maar steeds maar één veld.',
        ],
        animatie: {
          id: 'koning-stap',
          titel: 'De koning zet één stap',
          beschrijving: 'Een witte koning op e4 laat de acht velden om hem heen zien en zet twee stapjes.',
          fen: '8/8/8/8/4K3/8/8/8',
          stappen: [
            { tekst: 'De koning staat op e4.', markeer: ['e4'] },
            { tekst: 'Hij mag één stap, alle kanten op: acht velden.', bereik: 'e4' },
            { tekst: 'Een stapje schuin.', zet: 'e4-f5' },
            { tekst: 'En een stapje recht.', zet: 'f5-f6' },
          ],
        },
      },
      {
        kop: 'Koningen blijven van elkaar af',
        tekst: [
          'Een koning mag nooit op een veld gaan staan dat de tegenstander aanvalt. Naast de andere koning wordt hij aangevallen, door die koning zelf. Dus komen twee koningen nooit naast elkaar: er zit altijd minstens één veld tussen.',
        ],
        animatie: {
          id: 'koning-afstand',
          titel: 'Twee koningen',
          beschrijving: 'Een witte koning op d3 en een zwarte op d5. De velden c4, d4 en e4 tussen hen in zijn verboden voor wit.',
          fen: '8/8/8/3k4/8/3K4/8/8 w - - 0 1',
          regels: 'echt',
          stappen: [
            { tekst: 'Twee koningen, met één rij ertussen.', markeer: ['d3', 'd5'] },
            {
              tekst: 'Wit mag niet naar c4, d4 of e4: dan zou hij naast de zwarte koning staan.',
              bereik: 'd3',
              verboden: ['c4', 'd4', 'e4'],
            },
            { tekst: 'Opzij mag wel.', zet: 'd3-e3' },
          ],
        },
      },
    ],
    thuis:
      'Speel het koningsspel: elk een koning en een paar pionnen. Laat je kind met zijn koning een pion pakken die nergens door gedekt wordt. Al snel merkt het dat de koningen op afstand blijven.',
    vragen: [
      ['Kun je de koning slaan?', 'Nee. Bij schaken wordt de koning nooit echt geslagen. Wordt hij aangevallen, dan staat hij schaak en moet dat meteen opgelost worden. Kan dat niet, dan is het mat en is de partij afgelopen.'],
      ['Mag de koning ook twee velden?', 'Alleen bij de rokade, een speciale zet samen met een toren. Verder altijd één veld.'],
    ],
    lessen: ['koning-1', 'koning-2', 'koning-3'],
  },
  {
    slug: 'pion',
    vraag: 'Hoe loopt de pion?',
    zoektitel: 'Hoe loopt de pion bij schaken? Lopen, slaan en promoveren',
    omschrijving:
      'De pion loopt recht vooruit, slaat schuin en wordt een dame op de overkant. De eerste keer mag hij twee velden. Bekijk het op een bewegend bord.',
    kort: 'Recht vooruit, schuin slaan, en op de overkant wordt hij een dame.',
    stuk: 'p',
    antwoord:
      'De pion loopt één veld recht vooruit, en vanaf zijn beginplek mag hij ook twee. Hij slaat schuin vooruit, nooit recht, en hij gaat nooit terug. Haalt hij de overkant, dan wordt hij een ander stuk, meestal een dame.',
    delen: [
      {
        kop: 'Vooruit, en de eerste keer twee',
        tekst: [
          'De pion is het kleinste stuk en heeft de meeste regels. De eerste: hij gaat alleen vooruit, nooit terug en nooit opzij. Staat hij nog op zijn beginplek, dan mag hij kiezen tussen één en twee velden. Daarna is het steeds één.',
        ],
        animatie: {
          id: 'pion-vooruit',
          titel: 'Altijd vooruit',
          beschrijving: 'Een witte pion op e2 kan naar e3 of e4, gaat naar e4, en kan daarna nog maar één veld.',
          fen: '8/8/8/8/8/8/4P3/8',
          stappen: [
            { tekst: 'Vanaf zijn beginplek mag de pion één of twee velden vooruit.', bereik: 'e2' },
            { tekst: 'Hij kiest twee.', zet: 'e2-e4' },
            { tekst: 'Daarna nog maar één tegelijk.', bereik: 'e4' },
            { tekst: 'Stapje voor stapje naar de overkant.', zet: 'e4-e5' },
          ],
        },
      },
      {
        kop: 'Recht lopen, schuin slaan',
        tekst: [
          'Dit is de regel waar het vaakst iets misgaat. Een pion slaat niet recht vooruit, maar schuin vooruit. Staat er een stuk recht voor hem, dan staat hij gewoon vast.',
        ],
        animatie: {
          id: 'pion-slaan',
          titel: 'Lopen is niet slaan',
          beschrijving: 'Een witte pion op e4 met een zwarte pion recht ervoor op e5 en een zwart paard schuin ervoor op d5. De pion kan niet vooruit, maar slaat het paard.',
          fen: '8/8/8/3np3/4P3/8/8/8',
          stappen: [
            { tekst: 'Recht voor de pion staat een zwarte pion. Daar kan hij niet langs.', markeer: ['e5'] },
            { tekst: 'Maar schuin voor hem staat een paard, en schuin slaat hij wel.', bereik: 'e4' },
            { tekst: 'Hij slaat het paard.', zet: 'e4-d5' },
          ],
        },
      },
      {
        kop: 'Pion wordt dame',
        tekst: [
          'Haalt een pion de overkant, dan mag hij niet blijven staan als pion. Hij wordt meteen een dame, toren, loper of paard; je kiest zelf. Bijna altijd kies je een dame, want die is het sterkst. Je mag dus best twee dames hebben.',
          'Er is nog één bijzondere pionregel: slaan en passant. Die heeft een eigen pagina.',
        ],
        animatie: {
          id: 'pion-promotie',
          titel: 'Op de overkant',
          beschrijving: 'Een witte pion op e7 zet naar e8 en wordt daar een dame.',
          fen: '8/4P3/8/8/8/8/8/8',
          stappen: [
            { tekst: 'De pion is bijna aan de overkant.', markeer: ['e8'] },
            { tekst: 'Nog één stap, en hij wordt een dame!', zet: 'e7-e8', wordt: 'q' },
            { tekst: 'Een dame kan meteen alle kanten op.', bereik: 'e8' },
          ],
        },
      },
    ],
    thuis:
      'Speel samen het pionnenspel: alleen de pionnen op hun beginplek. Wie het eerst de overkant haalt, wint. Je kind oefent zo vanzelf het schuin slaan, en ziet dat een pion die vastzit niets meer kan.',
    vragen: [
      ['Hoeveel is een pion waard?', 'Eén punt. Het is de maat waarmee je de andere stukken telt.'],
      ['Mag een pion achteruit?', 'Nee, nooit. Dat is het enige stuk dat nooit terug kan.'],
    ],
    lessen: ['pion-1', 'pion-2', 'pion-3', 'pion-4'],
  },
  {
    slug: 'waarde-van-de-stukken',
    vraag: 'Hoeveel zijn de schaakstukken waard?',
    zoektitel: 'Waarde van de schaakstukken: pion 1, paard 3, toren 5, dame 9',
    omschrijving:
      'Een pion is 1 punt, paard en loper 3, de toren 5 en de dame 9. Zo leer je je kind ruilen, met een bewegend bord.',
    kort: 'Pion 1, paard en loper 3, toren 5, dame 9.',
    teken: '⚖',
    antwoord:
      'Als je een pion op één punt zet, is een paard drie punten waard, een loper ook drie, een toren vijf en de dame negen. De koning heeft geen waarde: hem kun je niet ruilen.',
    delen: [
      {
        kop: 'Pak wat het meest oplevert',
        tekst: [
          'De punten zijn geen regel uit het spel; ze tellen niet mee voor wie er wint. Het is een hulpmiddel: als je kunt kiezen wat je slaat, of als er geruild wordt, laten de punten zien wie er beter van wordt.',
          'Voor een kind is de eerste stap eenvoudig: kun je twee stukken slaan, kies dan het duurste.',
        ],
        animatie: {
          id: 'waarde-kiezen',
          titel: 'Een pion of een toren?',
          beschrijving: 'Een wit paard op d4 kan een zwarte pion op c6 of een zwarte toren op e6 slaan. Het slaat de toren.',
          fen: '8/8/2p1r3/8/3N4/8/8/8',
          stappen: [
            { tekst: 'Het paard kan twee stukken slaan.', bereik: 'd4' },
            { tekst: 'Een pion is één punt. Een toren is vijf.', markeer: ['c6', 'e6'] },
            { tekst: 'Het paard pakt de toren.', zet: 'd4-e6' },
          ],
        },
      },
      {
        kop: 'Ruilen',
        tekst: [
          'Een ruil is als allebei de spelers een stuk slaan. Geef je een paard en krijg je een paard terug, dan is het gelijk op. Geef je een loper voor een toren, dan win je twee punten. Geef je een dame voor een paard, dan verlies je er zes.',
          'Daarom kijk je vóór elke slagzet: staat het stuk dat ik pak gedekt? Dan kost het je misschien je eigen stuk.',
        ],
      },
    ],
    thuis:
      'Speel een partij en vraag bij elke ruil hardop: wie kreeg er meer? Tel de punten op de vingers. Na een paar partijen doet je kind het vanzelf.',
    vragen: [
      ['Is een loper meer waard dan een paard?', 'Ze zijn allebei drie punten. In open stellingen is de loper vaak iets sterker, in dichte stellingen het paard, maar voor een kind is gelijk precies goed.'],
      ['Wat is de koning waard?', 'De koning kun je niet ruilen en niet slaan. Staat hij mat, dan is de partij voorbij. Daarom krijgt hij geen punten.'],
    ],
    lessen: ['waarde-1', 'waarde-2', 'waarde-3'],
  },
  {
    slug: 'en-passant',
    vraag: 'Wat is en passant?',
    zoektitel: 'En passant slaan bij schaken: uitleg met bewegend bord',
    omschrijving:
      'En passant is een pion die een andere pion slaat in het voorbijgaan. Zo werkt het, wanneer het mag, en op een bewegend bord.',
    kort: 'Een pion slaan in het voorbijgaan: de lastigste pionregel.',
    teken: '⇢',
    antwoord:
      'Zet een pion twee velden vooruit en landt hij naast een pion van de tegenstander, dan mag die hem slaan alsof hij maar één veld was gegaan. Dat heet en passant, in het voorbijgaan, en het mag alleen direct de zet erna.',
    delen: [
      {
        kop: 'Slaan in het voorbijgaan',
        tekst: [
          'De dubbelstap van de pion is bedacht om het spel te versnellen, niet om langs een vijandelijke pion te glippen. En passant zorgt daarvoor: wie met twee stappen naast een pion van de ander landt, kan geslagen worden alsof hij er maar één deed.',
          'De slaande pion gaat schuin naar het veld dat overgeslagen werd. De geslagen pion verdwijnt, al staat er niets op het veld waar de slaande pion heen gaat. Het is de enige zet in het schaken waarbij dat zo is.',
        ],
        animatie: {
          id: 'en-passant',
          titel: 'En passant',
          beschrijving: 'Een witte pion op e5. Zwart speelt d7-d5, en wit slaat en passant: de witte pion gaat naar d6 en de zwarte pion op d5 verdwijnt.',
          fen: 'k7/3p4/8/4P3/8/8/8/K7 b - - 0 1',
          regels: 'echt',
          stappen: [
            { tekst: 'De witte pion staat op e5. Zwart is aan zet.', markeer: ['e5'] },
            { tekst: 'Zwart zet zijn pion twee velden vooruit, precies naast de witte pion.', zet: 'd7-d5' },
            { tekst: 'Wit mag nu doen alsof die pion maar één stap deed, en hem slaan op d6.', bereik: 'e5' },
            { tekst: 'De witte pion gaat naar d6, en de zwarte pion verdwijnt van het bord.', zet: 'e5-d6' },
          ],
        },
      },
      {
        kop: 'Wanneer mag het?',
        tekst: [
          'Alleen als aan alle drie voldaan is: de pion van de tegenstander deed net een dubbelstap; hij landde direct naast jouw pion; en je slaat meteen, de zet erna. Wacht je één zet, dan is de kans voorbij.',
          'Alleen een pion kan en passant slaan, en alleen een pion kan en passant geslagen worden.',
        ],
      },
    ],
    thuis:
      'Zet alleen een witte pion op e5 en een zwarte op d7, en speel het na zoals hierboven. Laat je kind daarna de zwarte pion één stap zetten (naar d6): dan is het gewoon schuin slaan. Zo ziet het dat en passant hetzelfde oplevert.',
    vragen: [
      ['Is en passant verplicht?', 'Nee. Net als elke andere slagzet mag het, maar het hoeft niet. Alleen als het je enige geldige zet is, moet je hem doen.'],
      ['Waarom kennen veel mensen deze regel niet?', 'Omdat hij zelden voorkomt. Daarom komt hij in de app als laatste pionregel, als de rest van de pion goed zit.'],
    ],
    lessen: ['pion-5'],
  },
  {
    slug: 'rokade',
    vraag: 'Hoe werkt de rokade?',
    zoektitel: 'Rokeren bij schaken: korte en lange rokade uitgelegd',
    omschrijving:
      'Bij de rokade zet je de koning en een toren in één zet. Zo gaan de korte en de lange rokade, en wanneer het niet mag. Met bewegend bord.',
    kort: 'De koning en de toren in één zet, en de vier voorwaarden.',
    teken: '♔♖',
    antwoord:
      'Bij de rokade gaat de koning twee velden opzij, naar een toren toe, en springt die toren over de koning heen naast hem. Het is de enige zet waarbij je twee stukken tegelijk verzet, en het brengt de koning in veiligheid.',
    delen: [
      {
        kop: 'Kort en lang',
        tekst: [
          'Er zijn twee rokades. De korte gaat naar de kant van de koning, waar maar twee velden tussen koning en toren zitten. De lange gaat naar de kant van de dame, met drie velden ertussen.',
          'In beide gevallen gaat de koning precies twee velden opzij. De toren komt aan de andere kant naast hem te staan. Zet altijd eerst de koning, dan de toren: zo is op de club meteen duidelijk dat het een rokade is en geen torenzet.',
        ],
        animatie: {
          id: 'rokade-kort-lang',
          titel: 'Korte en lange rokade',
          beschrijving: 'Wit rokeert kort: de koning gaat van e1 naar g1, de toren van h1 naar f1. Daarna rokeert zwart lang: de koning naar c8, de toren naar d8.',
          fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
          regels: 'echt',
          stappen: [
            { tekst: 'Tussen de koning en de torens staat niets meer.', markeer: ['e1', 'h1'] },
            { tekst: 'Korte rokade: de koning gaat twee velden opzij, en de toren springt over hem heen.', zet: 'e1-g1' },
            { tekst: 'Lange rokade, aan de kant van de dame: ook nu gaat de koning twee velden.', zet: 'e8-c8' },
            { tekst: 'Allebei de koningen staan nu achter een rij pionnen, weg uit het midden.', markeer: ['g1', 'c8'] },
          ],
        },
      },
      {
        kop: 'Wanneer mag het niet?',
        tekst: [
          'Rokeren mag alleen als aan vier voorwaarden voldaan is. De koning en die toren hebben in de partij nog niet gezet. Er staat niets tussen de koning en de toren. De koning staat niet schaak. En de koning gaat niet over een veld, of naar een veld, dat de tegenstander aanvalt.',
          'Die laatste is de lastigste. Let op: het gaat om de koning. Over welke velden de toren gaat, maakt niet uit.',
        ],
        animatie: {
          id: 'rokade-verboden',
          titel: 'Kort mag hier niet',
          beschrijving: 'Een zwarte toren op f8 valt f1 aan. De witte koning kan daardoor niet kort rokeren, maar wel lang.',
          fen: '1k3r2/8/8/8/8/8/8/R3K2R w KQ - 0 1',
          regels: 'echt',
          stappen: [
            { tekst: 'De zwarte toren houdt f1 in de gaten.', markeer: ['f8', 'f1'] },
            {
              tekst: 'De koning mag niet over een aangevallen veld, dus kort rokeren kan nu niet. Lang wel.',
              bereik: 'e1',
              verboden: ['g1'],
            },
            { tekst: 'Wit rokeert lang.', zet: 'e1-c1' },
          ],
        },
      },
    ],
    thuis:
      'Zet alleen de koningen en de torens op hun beginplek en laat je kind om de beurt kort en lang rokeren. Zet daarna een vijandelijke toren op de f- of de d-lijn en vraag: mag het nu nog?',
    vragen: [
      ['Waarom zou je rokeren?', 'In het midden is de koning kwetsbaar. Met de rokade zet je hem in één zet in de hoek, achter zijn pionnen, en komt de toren meteen in het spel. Het is een van de drie openingsregels: centrum, ontwikkelen, rokeren.'],
      ['Mag je rokeren als de toren aangevallen wordt?', 'Ja. De voorwaarden gaan over de koning: hij mag niet schaak staan en niet over of naar een aangevallen veld. De toren mag wel aangevallen zijn.'],
    ],
    lessen: ['rokade-1', 'rokade-2', 'rokade-3'],
  },
  {
    slug: 'schaak-en-mat',
    vraag: 'Wat is schaak en wat is schaakmat?',
    zoektitel: 'Schaak en schaakmat: het verschil uitgelegd voor kinderen',
    omschrijving:
      'Schaak is een aanval op de koning; schaakmat is schaak waar je niet meer uit kunt. Het verschil, de drie uitwegen en een bewegend bord.',
    kort: 'Schaak is een aanval op de koning, mat is er niet meer uit kunnen.',
    teken: '♚',
    antwoord:
      'Een koning staat schaak als een stuk van de tegenstander hem aanvalt. Dat moet je meteen oplossen: weglopen, de aanvaller slaan of er iets tussen zetten. Lukt geen van drieën, dan staat hij schaakmat en is de partij afgelopen.',
    delen: [
      {
        kop: 'Schaak: de koning wordt aangevallen',
        tekst: [
          'Bij schaken wordt de koning nooit echt geslagen. Valt een stuk hem aan, dan staat hij schaak, en de speler moet daar met zijn volgende zet iets aan doen. Iets anders spelen mag niet.',
          'Er zijn drie uitwegen: de koning loopt weg naar een veilig veld, je slaat het stuk dat schaak geeft, of je zet een stuk tussen de aanvaller en de koning. Bij een paard kan dat laatste niet, want dat springt.',
        ],
        animatie: {
          id: 'schaak',
          titel: 'Schaak, en weglopen',
          beschrijving: 'Een witte toren gaat naar a8 en geeft schaak aan de zwarte koning op e8. De koning loopt weg naar e7.',
          fen: '4k3/8/8/8/8/8/8/R3K3 w - - 0 1',
          regels: 'echt',
          stappen: [
            { tekst: 'De witte toren gaat naar de bovenste rij.', zet: 'a1-a8', verwacht: 'schaak' },
            { tekst: 'De zwarte koning wordt aangevallen: hij staat schaak. Hij kan alleen nog naar voren.', bereik: 'e8' },
            { tekst: 'Hij loopt weg. Het schaak is opgelost.', zet: 'e8-e7' },
          ],
        },
      },
      {
        kop: 'Schaakmat: er is geen uitweg',
        tekst: [
          'Staat de koning schaak en werkt geen van de drie uitwegen, dan is het schaakmat, of kortweg mat. Wie mat zet, wint de partij.',
          'Een bekend voorbeeld is het mat op de achterste rij: de koning staat veilig achter zijn eigen pionnen, maar die pionnen sluiten hem ook in. Eén toren op de achterste rij is dan genoeg.',
        ],
        animatie: {
          id: 'mat-achterste-rij',
          titel: 'Mat op de achterste rij',
          beschrijving: 'De zwarte koning op g8 staat achter drie pionnen. De witte toren gaat naar a8 en zet mat.',
          fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
          regels: 'echt',
          stappen: [
            { tekst: 'De zwarte koning staat achter zijn drie pionnen.', markeer: ['g8', 'f7', 'g7', 'h7'] },
            { tekst: 'De toren gaat naar a8: schaak.', zet: 'a1-a8', verwacht: 'mat' },
            { tekst: 'Weglopen kan niet, slaan kan niet, ertussen kan niet. Schaakmat!', markeer: ['f7', 'g7', 'h7'] },
          ],
        },
      },
      {
        kop: 'Waarom het in de app zo laat komt',
        tekst: [
          'In Schaakmaatje komt mat pas in wereld 10, als een kind alle stukken kent, weet wat ze waard zijn en kan aanvallen en verdedigen. Dat is met opzet: mat zien vraagt dat je van álle stukken tegelijk overziet waar ze heen kunnen. Een kind dat nog nadenkt over hoe een loper loopt, heeft daar weinig aan.',
        ],
      },
    ],
    thuis:
      'Speel een partij en zeg hardop "schaak" als je schaak geeft. Vraag je kind dan welke van de drie uitwegen het kiest. Mat oefenen kan het beste pas als de stukken goed zitten; daar heeft de app een eigen wereld voor.',
    vragen: [
      ['Moet je "schaak" zeggen?', 'Nee, dat hoeft niet volgens de regels. Thuis en bij kinderen is het wel gewoon en aardig, want dan ziet de ander het ook.'],
      ['Wat is het verschil tussen mat en pat?', 'Bij mat staat de koning schaak en kan hij er niet uit; dat is winst. Bij pat staat hij níét schaak, maar heeft de speler geen enkele zet meer; dat is gelijkspel.'],
    ],
    lessen: ['schaak-1', 'schaak-2', 'schaak-3', 'mat-1', 'mat-2'],
  },
  {
    slug: 'pat',
    vraag: 'Wat is pat bij schaken?',
    zoektitel: 'Pat bij schaken: wat het is en hoe je het voorkomt',
    omschrijving:
      'Pat is gelijkspel: je staat niet schaak, maar je kunt geen enkele zet meer doen. Zo ziet het eruit, en zo voorkom je het. Met bewegend bord.',
    kort: 'Niet schaak, maar geen zet meer: gelijkspel.',
    teken: '½',
    antwoord:
      'Pat is als de speler die aan zet is niet schaak staat, maar ook geen enkele geldige zet meer heeft. Dan is de partij afgelopen in remise, gelijkspel, ook als de ander veel meer stukken heeft.',
    delen: [
      {
        kop: 'Wel opgesloten, niet aangevallen',
        tekst: [
          'Pat lijkt op mat, maar het verschil is groot. Bij mat staat de koning schaak. Bij pat niet: hij wordt niet aangevallen, maar elk veld waar hij heen zou kunnen, wordt wél aangevallen, en andere stukken die kunnen zetten zijn er niet.',
          'Het overkomt vooral de speler die ver voor staat. Met een dame tegen een kale koning is pat de grootste valkuil, en voor een kind voelt het onterecht. Daarom loont het om het te kennen.',
        ],
        animatie: {
          id: 'pat',
          titel: 'Zo wordt het pat',
          beschrijving: 'Wit heeft een dame en een koning tegen een kale zwarte koning op a8. De dame gaat naar b6: zwart staat niet schaak maar kan nergens heen. Pat.',
          fen: 'k7/8/8/1Q6/8/8/8/6K1 w - - 0 1',
          regels: 'echt',
          stappen: [
            { tekst: 'Wit staat ver voor: een dame tegen een kale koning.', markeer: ['a8'] },
            { tekst: 'De dame gaat naar b6.', zet: 'b5-b6', verwacht: 'pat' },
            { tekst: 'Zwart staat niet schaak, maar elk veld rond zijn koning wordt aangevallen. Hij kan geen zet doen: pat, gelijkspel.', markeer: ['a7', 'b7', 'b8'] },
          ],
        },
      },
      {
        kop: 'Zo wordt het wél mat',
        tekst: [
          'Met een dame alleen kun je niet mat zetten: je hebt je eigen koning nodig. Breng die eerst dichterbij. Dan pas geeft de dame het laatste schaak, en is er geen uitweg meer.',
        ],
        animatie: {
          id: 'mat-met-dame',
          titel: 'Koning erbij, dan mat',
          beschrijving: 'De witte koning staat op b6, vlak bij de zwarte koning op a8. De dame gaat naar h8 en zet mat.',
          fen: 'k7/8/1K6/8/8/8/7Q/8 w - - 0 1',
          regels: 'echt',
          stappen: [
            { tekst: 'Nu staat de witte koning vlak bij de zwarte.', markeer: ['b6'] },
            { tekst: 'De dame gaat naar de achterste rij.', zet: 'h2-h8', verwacht: 'mat' },
            { tekst: 'Schaak, en de koning kan nergens heen: mat.', markeer: ['a7', 'b7'] },
          ],
        },
      },
    ],
    thuis:
      'Speel met je kind koning en dame tegen koning. Laat het winnen met de dame, en tel samen de velden die de zwarte koning nog heeft voordat je de laatste zet doet. Nul velden en geen schaak? Dan wordt het pat.',
    vragen: [
      ['Wie wint er bij pat?', 'Niemand. Pat is remise: de partij eindigt gelijk, hoeveel stukken iemand ook over heeft.'],
      ['Wanneer leert mijn kind pat in de app?', 'In wereld 10, samen met mat. Pas als je mat kent, heeft het zin om het verschil met pat te leren.'],
    ],
    lessen: ['mat-3'],
  },
]

export function onderwerpMet(slug: string): Onderwerp | undefined {
  return SCHAAKREGELS.find((o) => o.slug === slug)
}

/** Het onderwerp waar deze les bij hoort, voor de link "lees hoe het zit" op de lespagina. */
export function onderwerpBijLes(lesId: string): Onderwerp | undefined {
  return SCHAAKREGELS.find((o) => o.lessen.includes(lesId))
}
