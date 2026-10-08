import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ALLE_LESSEN, WERELDEN } from '@/content'
import { MINISPELLEN } from '@/play/minispellen'
import { KOFFIE, SITE, deelkaart } from '@/seo'
import s from './Over.module.css'

/** Dezelfde basis als de rest van de app, voor als hij ooit in een submap staat. */
const BASIS = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const OVER_OMSCHRIJVING =
  'Schaken leren voor kinderen van 3 tot 10, ook kleuters die nog niet lezen: Pip praat alles voor. Geen reclame, geen account, alles blijft op het apparaat.'

/**
 * De uitlegpagina, voor ouders en voor zoekmachines.
 *
 * Een server-component, dus hij staat volledig in de geëxporteerde HTML en heeft geen
 * JavaScript nodig. De vragen onderaan klappen uit met `<details>`, ook zonder script.
 *
 * In de zesde review opnieuw opgezet. De oude pagina was eerlijke tekst in zes gelijke
 * kaarten, zonder beeld en zonder hoogtepunt, en Kaj noemde hem terecht mat. Hij beloofde
 * bovendien drie dingen die niet klopten: een opdracht voor aan een echt bord na elke
 * wereld (bestaat niet), een minispel "paardensprong-parcours" (bestaat niet) en een Bram
 * die "altijd" zijn beste zet speelt (hij doet het rustig aan als hij ver voor staat).
 *
 * "Gratis" staat hier als iets van nu, niet als belofte voor altijd: het is nog niet zeker
 * dat de app gratis kan blijven. Wat wél blijft: geen reclame, geen account, niets van het
 * kind naar internet.
 */
export const metadata: Metadata = {
  title: 'Over Schaakmaatje: schaken leren voor kinderen van 3 tot 10 jaar',
  description: OVER_OMSCHRIJVING,
  alternates: { canonical: `${SITE}/over/` },
  ...deelkaart({
    titel: 'Over Schaakmaatje: schaken leren voor kinderen van 3 tot 10',
    omschrijving: OVER_OMSCHRIJVING,
    url: `${SITE}/over/`,
  }),
}

/**
 * De vragen onderaan, en dezelfde vragen voor Google. Eén lijst, want een FAQPage die
 * iets anders zegt dan de pagina negeert Google, en twee met de hand bijgehouden kopieën
 * lopen altijd een keer uit elkaar.
 */
const VRAGEN: [string, string][] = [
  [
    'Kan mijn kind dit als het nog niet kan lezen?',
    'Ja, daar is de app voor gemaakt. Pip zegt elke opdracht hardop, de knoppen hebben plaatjes, en met de luidspreker bij Pip hoor je een zin nog een keer. Alleen bij het aanmaken van het profiel moet er even iemand meekijken.',
  ],
  [
    'Vanaf welke leeftijd kan een kind leren schaken?',
    'De eerste wereld is al voor kleuters van drie. Daar gaat het nog niet om schaakregels maar om het bord: licht en donker, rijen en lijnen, en hoe je het bord neerlegt. De toren en de loper komen direct daarna en zijn ook voor kleuters bedoeld. Mat staat pas vanaf een jaar of acht op het programma.',
  ],
  [
    'Hoe lang mag mijn kind per keer spelen?',
    'Een les duurt een paar minuten. Voor een kleuter is drie tot zes minuten achter elkaar genoeg, voor een kind van zes of zeven acht tot twaalf minuten, en vanaf acht jaar vijftien tot vijfentwintig. Stoppen halverwege een les kan: de volgende keer gaat je kind verder waar het was.',
  ],
  [
    'Kan mijn kind verliezen?',
    'In de lessen niet. Er zijn geen levens, geen game-over en nooit nul sterren. Een fout levert een tip op en een nieuwe poging. In een partijtje kun je wel verliezen, net als aan een echt bord, maar de tegenstanders doen rustig aan als ze ver voorstaan, en een zet terugnemen mag altijd.',
  ],
  [
    'Is dit hetzelfde als het pionnendiploma?',
    'Nee. De app is geïnspireerd op de Stappenmethode die schaakclubs gebruiken, maar heeft een eigen volgorde: mat komt hier veel later. De hoefijzers die je kind verdient zijn geen officiële diploma\'s. Voor het pionnendiploma ga je naar een club of schaakles op school.',
  ],
  [
    'Vervangt dit de schaakclub?',
    'Nee. Schaken leer je echt aan een bord met iemand tegenover je, en op een club leert je kind ook winnen en verliezen van een ander kind. De app is een aanloop: wie binnenkomt, kent de stukken en de regels al. Speel daarom ook thuis; op deze pagina staan tips.',
  ],
  [
    'Is het gratis?',
    'Op dit moment wel, en er valt niets te kopen in de app. Wat zeker zo blijft: er komt geen reclame in, je hebt geen account nodig en er gaat niets van je kind naar internet.',
  ],
  [
    'Werkt het op een telefoon?',
    'Ja, op telefoon, tablet en computer. Een tablet is het prettigst, want dan is het bord groot genoeg voor kindervingers. Wat je kind één keer geopend heeft, werkt daarna ook zonder internet.',
  ],
]

const VRAGEN_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: VRAGEN.map(([vraag, antwoord]) => ({
    '@type': 'Question',
    name: vraag,
    acceptedAnswer: { '@type': 'Answer', text: antwoord },
  })),
}

/** Tekstvariant van een schaakstuk, zodat iOS er geen emoji van maakt. */
const T = '︎'

/** De beginstelling, van a8 tot h1. 'w' ervoor is een wit stuk. */
const OPSTELLING = [
  ...'♜♞♝♛♚♝♞♜'.split(''),
  ...Array(8).fill('♟'),
  ...Array(32).fill(''),
  ...Array(8).fill('w♟'),
  ...'♜♞♝♛♚♝♞♜'.split('').map((g) => 'w' + g),
]

function Kop({ stuk, children }: { stuk: string; children: ReactNode }) {
  return (
    <div className={s.kop}>
      <span aria-hidden="true" className={s.stuk}>
        {stuk}
        {T}
      </span>
      <h2>{children}</h2>
    </div>
  )
}

export default function Over() {
  const lessen = ALLE_LESSEN.length
  const werelden = WERELDEN.length
  const spellen = MINISPELLEN.map((m) => m.naam)

  return (
    <main className={s.pagina}>
      <script
        type="application/ld+json"
        // Eigen constante hierboven, geen invoer van buiten.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(VRAGEN_LD) }}
      />
      <p style={{ margin: 0 }}>
        <Link href="/" className={s.terug}>
          ← Naar de app
        </Link>
      </p>

      <section className={s.held}>
        <div>
          <p className={s.oogje}>Voor ouders</p>
          <h1>
            Schaken leren met <em>Pip</em>, het schaakpaardje
          </h1>
          <p className={s.lead}>
            Een Nederlandse schaakapp voor kinderen van 3 tot 10. Pip zegt elke opdracht
            hardop, dus je kind hoeft nog niet te kunnen lezen.
          </p>
          <ul className={s.feiten}>
            <li>Pip leest alles voor</li>
            <li>Geen reclame</li>
            <li>Geen account</li>
            <li>Niets naar internet</li>
          </ul>
          <div className={s.knoppen}>
            <Link href="/" className="btn btn--primary btn--big">
              Beginnen →
            </Link>
            <Link href="/lessen/">Bekijk alle {lessen} lessen</Link>
          </div>
        </div>
        <figure className={s.scherm} style={{ margin: 0 }}>
          <img
            src={`${BASIS}/schermen/les.png`}
            alt="Een les: Pip legt uit hoe de toren loopt, en het bord laat de velden zien waar hij heen kan."
            width={400}
            height={640}
          />
        </figure>
      </section>

      <section>
        <Kop stuk="♞">De eerste les, voor een kind van vier</Kop>
        <div className={s.tekst}>
          <p>
            De eerste les gaat nog helemaal niet over schaken. Pip zegt: &ldquo;Hoi! Ik ben
            Pip. Dit is een schaakbord.&rdquo; Dan lichten drie velden één voor één op:
            licht, donker, licht. Daarna komt de vraag: &ldquo;Tik de vier donkere velden
            helemaal onderaan aan.&rdquo; Het veld linksonder licht alvast op, zodat je
            kind weet waar het moet beginnen.
          </p>
          <p>
            Tikt het een verkeerd veld aan, dan zegt Pip: &ldquo;Zoek de groene velden, en
            alleen die helemaal onderaan.&rdquo; Daarna probeert je kind het gewoon nog een
            keer. Zo gaat elke les, in vier stappen:
          </p>
        </div>
        <ol className={s.stappen} style={{ marginTop: 22 }}>
          <li>
            <span>
              <strong>Kijken</strong>Pip doet het voor op het bord.
            </span>
          </li>
          <li>
            <span>
              <strong>Meedoen</strong>Samen één opdracht.
            </span>
          </li>
          <li>
            <span>
              <strong>Zelf doen</strong>Een paar opdrachten, met tips als het niet lukt.
            </span>
          </li>
          <li>
            <span>
              <strong>Laat maar zien</strong>Eén, twee of drie sterren. Nooit nul.
            </span>
          </li>
        </ol>
        <p className={s.tekst} style={{ marginTop: 22 }}>
          Bij twee sterren gaat de volgende les open. Met één ster doe je hem nog een keer.
          Levens zijn er niet, en er loopt geen klok.
        </p>
      </section>

      <section>
        <Kop stuk="♙">Voor welke leeftijd?</Kop>
        <p className={s.tekst} style={{ marginBottom: 18 }}>
          Een kind van drie en een kind van tien hebben weinig gemeen. Daarom vraagt de app
          bij het begin hoe oud je kind is, en past daar een paar dingen op aan. In het
          ouderscherm kun je dat altijd veranderen.
        </p>
        <ul className={s.drie}>
          <li className={s.band}>
            <span aria-hidden="true" className={s.glyph}>
              ♙{T}
            </span>
            <b>3 tot 5</b>
            <span>
              Begint bij de allereerste les: het bord, dan de toren en de loper. Pip praat
              rustig, en er staan drie makkelijke tegenstanders klaar.
            </span>
          </li>
          <li className={s.band}>
            <span aria-hidden="true" className={s.glyph}>
              ♘{T}
            </span>
            <b>6 en 7</b>
            <span>
              De eerste drie werelden staan meteen open, zodat je kind niet wacht op wat het
              misschien al weet. Vijf tegenstanders.
            </span>
          </li>
          <li className={s.band}>
            <span aria-hidden="true" className={s.glyph}>
              ♔{T}
            </span>
            <b>8 tot 10</b>
            <span>
              Alles open tot en met wat de stukken waard zijn. De velden krijgen hun naam
              (a1, e4) en Pip praat vlotter.
            </span>
          </li>
        </ul>
        <p className={s.uitspraak} style={{ marginTop: 36 }}>
          Schaakmat komt pas in wereld tien, ook voor een tienjarige. Dat is geen gat in de
          stof. Dat is de methode.
        </p>
        <p className={s.tekst} style={{ marginTop: 14 }}>
          Een kind dat nog moet nadenken over hoe een loper loopt, heeft weinig aan mat. Dus
          eerst alle stukken, wat ze waard zijn, aanvallen en verdedigen, en schaak. Dan pas
          mat.
        </p>
      </section>

      <section>
        <Kop stuk="♗">Hoe lang per dag?</Kop>
        <div className={s.duur}>
          <b>Een paar minuten per les</b>
          <div className={s.tekst}>
            <p>
              De app is gebouwd rond korte stukjes. Daarna is de aandacht op, en dat is
              prima.
            </p>
            <ul className={s.tijden}>
              <li>
                <strong>3 tot 5 jaar</strong> drie tot zes minuten achter elkaar
              </li>
              <li>
                <strong>6 en 7 jaar</strong> acht tot twaalf minuten
              </li>
              <li>
                <strong>vanaf 8</strong> vijftien tot vijfentwintig minuten
              </li>
            </ul>
            <p>
              Stopt je kind midden in een les omdat het eten is, dan gaat het de volgende
              keer verder waar het was. Een week niets doen kost niets. Er is geen reeks die
              je moet volhouden, en je raakt niets kwijt.
            </p>
          </div>
        </div>
      </section>

      <section className={s.strook}>
        <div className={s.tekst}>
          <h2>Thuis aan een echt bord</h2>
          <p>
            Schaken leer je uiteindelijk aan een bord, met iemand tegenover je. Je kunt
            makkelijk aansluiten bij waar je kind in de app is:
          </p>
          <ul className={s.thuis}>
            <li>
              In de eerste wereld: laat je kind het bord neerleggen. Rechtsonder hoort een
              licht veld. Het gaat bij volwassenen vaker mis dan je denkt.
            </li>
            <li>
              Na de toren: zet hem alleen op een leeg bord en leg op een paar velden een
              rozijntje. Hoeveel zetten heeft hij nodig om ze allemaal op te eten? Doe
              hetzelfde met een loper, dan merkt je kind dat sommige rozijntjes onbereikbaar
              zijn. Een loper blijft altijd op zijn eigen kleur.
            </li>
            <li>
              Bij het paard: laat je kind vanaf één veld alle sprongen aanwijzen. In het
              midden zijn het er acht, in de hoek maar twee.
            </li>
            <li>
              Na de pionnen: speel samen het pionnenspel, met alleen pionnen en koningen.
              Wie het eerst de overkant haalt, wint. Laat je kind daarna het hele bord
              opzetten.
            </li>
            <li>
              Na de waarde van de stukken: speel een partij en vraag bij elke ruil hardop wie
              er meer kreeg.
            </li>
          </ul>
          <p className={s.klein}>
            Speel je al hele partijen, prima. Maak er alleen nog geen les van hoe je mat
            zet. Dat komt in de app in wereld 10, als de rest erin zit.
          </p>
        </div>
        <div className={s.bord} aria-hidden="true">
          {OPSTELLING.map((g, i) => (
            <span key={i} className={g.startsWith('w') ? s.wit : undefined}>
              {g ? g.replace('w', '') + T : ''}
            </span>
          ))}
        </div>
      </section>

      <section>
        <Kop stuk="♖">En de Stappenmethode?</Kop>
        <div className={s.tekst}>
          <p>
            Op de meeste Nederlandse schaakclubs leren kinderen schaken met de
            Stappenmethode, en na Stap 1 halen ze daar het pionnendiploma. Schaakmaatje is
            op die aanpak geïnspireerd: de makkelijke stukken eerst, veel korte oefeningen,
            en spelletjes in plaats van lange uitleg. Maar het is niet de Stappenmethode, en
            het vervangt Stap 1 niet.
          </p>
          <p>
            Het grootste verschil is mat. In Stap 1 komt mat ongeveer halverwege. Hier pas in
            wereld 10, als les 36 van de {lessen}. En waar Stap 1 de loop van de stukken in
            één les doet, krijgt hier elk stuk een eigen wereld. Dat is langzamer, en voor
            een kleuter precies goed. De dubbele aanval en mat met de dame komen daardoor
            ook later dan bij de club.
          </p>
          <p>
            De hoefijzers zijn van de app zelf. Het zijn geen officiële diploma&apos;s, en
            ze zeggen niet of je kind het pionnendiploma zou halen. Wil je kind dat diploma,
            dan is een club of schaakles op school de weg. Als aanloop daarnaartoe is de app
            goed te gebruiken.
          </p>
        </div>
      </section>

      <section>
        <Kop stuk="♕">Wat zit erin?</Kop>
        <ul className={s.tegels}>
          <li>
            <span aria-hidden="true" className={s.ico}>
              🗺️
            </span>
            <strong>
              {werelden} werelden, {lessen} lessen
            </strong>
            Van het bord leren kennen tot het eindspel. Elk stuk heeft een eigen wereld.
          </li>
          <li>
            <span aria-hidden="true" className={s.ico}>
              🎯
            </span>
            <strong>{spellen.length} minispellen</strong>
            Eén bij elke wereld, met zes niveaus. De opgaven worden steeds nieuw gemaakt,
            dus ze raken niet op.
          </li>
          <li>
            <span aria-hidden="true" className={s.ico}>
              🐭
            </span>
            <strong>Zeven tegenstanders</strong>
            Van Mila de Muis, die maar wat doet, tot Bram de Beer, die het verst vooruit
            denkt. Staan ze ruim voor, dan doen ze rustig aan.
          </li>
          <li>
            <span aria-hidden="true" className={s.ico}>
              🤝
            </span>
            <strong>Samen spelen</strong>
            Met z&apos;n tweeën op één tablet, tegen elkaar.
          </li>
          <li>
            <span aria-hidden="true" className={s.ico}>
              🧺
            </span>
            <strong>Een stal</strong>
            Een stuk voor elke stukwereld, een maatje voor elke tegenstander die je
            verslaat, en hoefijzers. Wat erin staat, blijft erin.
          </li>
          <li>
            <span aria-hidden="true" className={s.ico}>
              👀
            </span>
            <strong>Een ouderscherm</strong>
            Per les in gewone taal wat je kind nu kan. Achter een rekensommetje, zodat je
            kind er niet per ongeluk in komt.
          </li>
        </ul>
        <p className={s.klein} style={{ marginTop: 14 }}>
          De minispellen: {spellen.join(', ')}.
        </p>
      </section>

      <section>
        <Kop stuk="♜">Wat kost het, en waar blijven de gegevens?</Kop>
        <div className={s.nullen}>
          <div className={s.nul}>
            <b>Geen reclame</b>
            Geen account, geen e-mailadres, geen chat, geen volgers.
          </div>
          <div className={s.nul}>
            <b>Niets</b>
            gaat er van je kind naar internet. Een voornaam, een leeftijd en de voortgang
            blijven op dit apparaat. Wissen kan in het ouderscherm.
          </div>
        </div>
        <p className={s.fooi} style={{ marginTop: 16 }}>
          Op dit moment is Schaakmaatje gratis, en er valt niets te kopen in de app. Het
          wordt in de avonduren gemaakt en betaald uit eigen zak, en de stem van Pip kost
          geld per ingesproken zin. Vind je het de moeite waard, dan mag je{' '}
          <a href={KOFFIE} target="_blank" rel="noopener noreferrer">
            een kop koffie trakteren
          </a>
          . Dat hoeft niet, en het levert je niets extra&apos;s op.
        </p>
      </section>

      <section>
        <Kop stuk="♚">Veelgestelde vragen</Kop>
        <div className={s.vragen}>
          {VRAGEN.map(([vraag, antwoord]) => (
            <details key={vraag}>
              <summary>{vraag}</summary>
              <p>{antwoord}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={s.slot}>
        <span aria-hidden="true" className={s.pipkop}>
          🐴
        </span>
        <h2>Zin om te beginnen?</h2>
        <p style={{ maxWidth: '40ch', margin: 0 }}>
          Een voornaam, een leeftijd en een maatje. Geen e-mailadres. Bij een kleuter is het
          handig om dat eerste stukje samen te doen. Op een telefoon of tablet zet je
          Schaakmaatje via het deelmenu van je browser op het beginscherm.
        </p>
        <Link href="/" className="btn btn--primary btn--big">
          Beginnen →
        </Link>
      </section>
    </main>
  )
}
