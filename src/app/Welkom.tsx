import Link from 'next/link'
import styles from './Welkom.module.css'
import { ALLE_LESSEN, WERELDEN } from '@/content'

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

  return (
    <div className="stack" style={{ gap: 22 }}>
      <header className="stack" style={{ gap: 10, textAlign: 'center', alignItems: 'center' }}>
        <span aria-hidden="true" style={{ fontSize: 64, lineHeight: 1 }}>
          🐴
        </span>
        {/* clamp, want op een smalle telefoon raakte "Leer schaken met Pip" de rand. */}
        <h1 style={{ fontSize: 'clamp(1.6rem, 7.5vw, 2.1rem)', margin: 0, lineHeight: 1.15 }}>
          Leer schaken met Pip
        </h1>
        <p style={{ fontSize: '1.15rem', margin: 0, maxWidth: 460 }}>
          Een gratis Nederlandse schaakapp voor kinderen van 3 tot 10 jaar. Van het bord
          leren kennen tot je eerste echte partij, in {werelden} werelden en {lessen}{' '}
          lessen.
        </p>
        {/* Wie al overtuigd is hoeft niet langs drie schermafbeeldingen te scrollen om
            het formulier te vinden. Een gewone ankerlink, dus hij werkt ook zonder
            JavaScript en ook in de gebouwde HTML. */}
        <a href="#beginnen" className="btn btn--primary btn--big" style={{ marginTop: 4 }}>
          Beginnen →
        </a>
      </header>

      {/* Zien wat je krijgt, vóór je de naam van je kind invult. Op een telefoon
          schuiven ze opzij; vanaf een tablet staan ze naast elkaar. */}
      <ul className={styles.schermen}>
        {SCHERMEN.map((s) => (
          <li key={s.bron} className="stack" style={{ gap: 10 }}>
            <img
              src={s.bron}
              alt={s.titel}
              width={400}
              height={640}
              loading="lazy"
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

      <p className="muted" style={{ margin: 0, fontSize: '0.95rem' }}>
        Geen reclame, geen account, geen aankopen in de app. Alles blijft op dit
        apparaat staan en na de eerste keer werkt het ook zonder internet.{' '}
        <Link href="/over/">Lees meer voor ouders</Link> of bekijk{' '}
        <Link href="/lessen/">alle {lessen} lessen</Link>.
      </p>
    </div>
  )
}
