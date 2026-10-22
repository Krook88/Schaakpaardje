import Link from 'next/link'
import styles from './Welkom.module.css'
import { ALLE_LESSEN, WERELDEN } from '@/content'
import { SCHAAKREGELS, onderwerpMet } from '@/content/schaakregels'
import { Animatiebord } from '@/uitleg/Animatiebord'
import { bouwBeelden } from '@/uitleg/beelden'

/** Dezelfde basis als de rest van de app, voor als hij ooit in een submap staat. */
const BASIS = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/**
 * De landingspagina: wat is dit, en hoe ziet het eruit.
 *
 * Hier stond niets. Wie via Google of via een tip van iemand anders binnenkwam, kreeg
 * meteen "Hoe heet je?" en moest dus de naam en de leeftijd van zijn kind invullen om
 * erachter te komen wat de app doet. Er was geen enkel beeld van de app zelf, en dat
 * is precies waar een ouder naar zoekt: hoe ziet het eruit, en wat gaat mijn kind doen.
 *
 * Twee dingen maken dit een server-component en geen stuk van het gewone scherm:
 *
 * 1. Het staat hierdoor in de geëxporteerde index.html. De hele app is client-side, en
 *    daardoor bevatte de startpagina bij het bouwen 195 tekens tekst. Alles wat ik hier
 *    vanochtend aan uitleg toevoegde was voor een zoekmachine onzichtbaar, want het
 *    verscheen pas na hydratie.
 * 2. Het scheelt het kind niets. `Thuis` geeft dit door als `welkom` en toont het
 *    alleen zolang er geen profiel is. Een kind dat de app al gebruikt komt hier nooit.
 *
 * De schermafbeeldingen zijn echt: gemaakt met Playwright op de gebouwde app, niet
 * nagetekend. Ze verouderen dus zichtbaar, en dat is de bedoeling.
 */

const SCHERMEN: { bron: string; titel: string; uitleg: string }[] = [
  {
    bron: `${BASIS}/schermen/les.png`,
    titel: 'Pip legt uit, jij doet mee',
    uitleg: 'Hij vertelt wat je moet doen en het bord laat het zien. Goed? Dan zegt hij het.',
  },
  {
    bron: `${BASIS}/schermen/kaart.png`,
    titel: 'Een pad met halteplaatsen',
    uitleg: 'Elke bol is een les. Je ziet altijd waar je bent en wat er hierna komt.',
  },
  {
    bron: `${BASIS}/schermen/partij.png`,
    titel: 'Echte partijtjes',
    uitleg: 'Tegen zeven maatjes, van eentje die maar wat doet tot eentje die goed nadenkt.',
  },
]

const PUNTEN: [string, string, string][] = [
  ['🔊', 'Lezen hoeft nog niet', 'Pip spreekt elke opdracht uit. Elke knop heeft een plaatje.'],
  ['🌱', 'Begint bij nul', 'De eerste wereld gaat nog niet over schaken, maar over het bord.'],
  ['🤗', 'Je kunt niet verliezen', 'Geen levens, geen game-over, geen klok. Fout? Dan volgt een tip.'],
]

export function Welkom() {
  const lessen = ALLE_LESSEN.length
  const werelden = WERELDEN.length
  const paard = onderwerpMet('paard')!.delen[0].animatie!

  return (
    <div className="stack" style={{ gap: 22 }}>
      <header className="stack" style={{ gap: 10, textAlign: 'center', alignItems: 'center' }}>
        <span aria-hidden="true" style={{ fontSize: 64, lineHeight: 1 }}>
          🐴
        </span>
        {/* De kop draagt de zoekterm ("schaken leren voor kinderen"); op "Pip" zoekt
            niemand. clamp, want op een smalle telefoon raakte de kop de rand. */}
        <p className="muted" style={{ margin: 0, fontWeight: 600 }}>Met Pip het schaakpaardje</p>
        <h1 style={{ fontSize: 'clamp(1.6rem, 7.5vw, 2.1rem)', margin: 0, lineHeight: 1.15 }}>
          Schaken leren voor kinderen
        </h1>
        <p style={{ fontSize: '1.15rem', margin: 0, maxWidth: 460 }}>
          Een gratis Nederlandse schaakapp voor kinderen van 3 tot 10 jaar. Van het bord
          leren kennen tot je eerste echte partij, in {werelden} werelden en {lessen}{' '}
          lessen.
        </p>
        {/* Meteen spelen, zonder formulier. Op 45 bezoeken van de startpagina begonnen
            er 24 aan een les: de weg liep via een sprong van 2500 px naar een formulier
            met naam, leeftijd en maatje. Een les speelt ook zonder profiel, en wat het
            kind haalt wordt bewaard tot het een naam kiest (zie GAST in de store). */}
        <Link href={`/les/${ALLE_LESSEN[0].id}/`} className="btn btn--primary btn--big" style={{ marginTop: 4 }}>
          <span aria-hidden="true">▶︎</span> Probeer de eerste les
        </Link>
        {/* Een gewone ankerlink naar het formulier, dus hij werkt ook zonder
            JavaScript en ook in de gebouwde HTML. */}
        <a href="#beginnen" style={{ fontSize: '1rem', display: 'inline-block', padding: '10px 6px' }}>
          Of maak eerst een profiel voor je kind
        </a>
      </header>

      {/* Zien wat je krijgt, vóór je de naam van je kind invult. Op een telefoon
          schuiven ze opzij; vanaf een tablet staan ze naast elkaar. */}
      <ul className={styles.schermen}>
        {SCHERMEN.map((s, i) => (
          <li key={s.bron} className="stack" style={{ gap: 10 }}>
            <img
              src={s.bron}
              alt={s.titel}
              width={400}
              height={640}
              // Het eerste plaatje is het grootste element in beeld: niet lui laden.
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : undefined}
              className={styles.plaatje}
            />
            <div>
              <strong style={{ display: 'block' }}>{s.titel}</strong>
              <span className="muted" style={{ fontSize: '0.92rem' }}>
                {s.uitleg}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <ul className={styles.punten}>
        {PUNTEN.map(([teken, kop, uitleg]) => (
          <li key={kop} className={styles.punt}>
            <span aria-hidden="true" className={styles.teken}>
              {teken}
            </span>
            <span>
              <strong style={{ display: 'block' }}>{kop}</strong>
              <span className="muted">{uitleg}</span>
            </span>
          </li>
        ))}
      </ul>

      {/* Eén bewegend bord laat beter zien wat je kind gaat doen dan een alinea. Het is
          hetzelfde bord als op de schaakregelpagina's, en het verwijst ernaar door. */}
      <section className={`stack ${styles.uitleg}`} style={{ gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: '1.35rem' }}>Schaken leren, stap voor stap</h2>
        <p style={{ margin: 0 }}>
          Kinderen leren schaken het best met één stuk tegelijk. Daarom begint Schaakmaatje
          bij het bord, en krijgt daarna elk stuk een eigen wereld: eerst de toren en de
          loper, dan de dame, het paard, de koning en de pion. Pas als alle stukken zitten,
          komen schaak, mat en rokade. Kijk maar hoe het paard springt:
        </p>
        <Animatiebord
          id="welkom-paard"
          titel="Het paard springt in een L"
          beschrijving={paard.beschrijving}
          beelden={bouwBeelden(paard)}
          kort
        />
        <p style={{ margin: 0 }}>
          Alle schaakregels staan zo op een bewegend bord, om zelf even op te frissen of
          samen te bekijken:
        </p>
        {/* Alleen de zes stukken; de rest staat één tik verder. Twaalf links onder elkaar
            duwden het aanmeldformulier op een telefoon twee schermen naar beneden. */}
        <ul className={styles.regels}>
          {SCHAAKREGELS.filter((o) => o.stuk).map((o) => (
            <li key={o.slug}>
              <Link href={`/schaakregels/${o.slug}/`}>{o.vraag.replace('Hoe loopt ', '').replace('?', '')}</Link>
            </li>
          ))}
          <li>
            <Link href="/schaakregels/">Alle schaakregels →</Link>
          </li>
        </ul>
      </section>

      <p className="muted" style={{ margin: 0, fontSize: '0.95rem' }}>
        Geen reclame, geen account, geen aankopen in de app. Alles blijft op dit
        apparaat staan en na de eerste keer werkt het ook zonder internet.{' '}
        <Link href="/over/">Lees meer voor ouders</Link> of bekijk{' '}
        <Link href="/lessen/">alle {lessen} lessen</Link>. Klaar voor het echte bord?{' '}
        <Link href="/schaakclub/">Zo vind je een schaakclub</Link>, of bekijk{' '}
        <Link href="/sitemap/">alle pagina&apos;s</Link>.
      </p>

      {/* Het doel van "Beginnen →". Het stond op het formulier, maar dat is een
          client-component en bestaat pas na hydratie: in de gebouwde HTML kwam het nul
          keer voor. Wie meteen tikte, kreeg niets, en pas bij de tweede tik werkte het.
          Hier staat het vanaf de eerste verf, ook zonder JavaScript. En het landt nu
          op "Speel je weer verder?" als die er is, in plaats van eroverheen naar een
          tweede profiel. */}
      <span id="beginnen" style={{ scrollMarginTop: 16 }} />
    </div>
  )
}
