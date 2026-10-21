import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ALLE_LESSEN, WERELDEN } from '@/content'
import { SITE, deelkaart } from '@/seo'
import s from '../over/Over.module.css'

/**
 * Van Pip naar de schaakclub: voor ouders.
 *
 * Aanleiding: in Google Search Console zochten ouders op "schaakclub den haag" en
 * "schaakclub amsterdam" en kwamen ze op /over/ terecht. Daar stond alleen dat de app de
 * club niet vervangt. Deze pagina maakt de volgende stap concreet: wanneer is je kind
 * eraan toe, hoe vind je een club, en wat vraag je daar.
 *
 * Geen lijst met clubs: die verandert en wij houden hem niet bij. De clubzoeker van de
 * KNSB doet dat wel. Alles wat hier over clubs staat, is wat een ouder daar zelf kan
 * navragen; over de Stappenmethode beloven we niets wat de app niet waarmaakt.
 */

/** De clubzoeker van de schaakbond (KNSB), met een filter op jeugd. */
const CLUBZOEKER = 'https://schaakbond.nl/spelers/volwassenen/zoek-een-schaakclub/'

const OMSCHRIJVING =
  'Wanneer is je kind klaar voor een schaakclub, hoe vind je een club met jeugd bij jou in de buurt, en wat vraag je bij de eerste keer? Voor ouders.'

export const metadata: Metadata = {
  title: 'Een schaakclub voor je kind vinden',
  description: OMSCHRIJVING,
  alternates: { canonical: `${SITE}/schaakclub/` },
  ...deelkaart({
    titel: 'Een schaakclub voor je kind vinden | Schaakmaatje',
    omschrijving: OMSCHRIJVING,
    url: `${SITE}/schaakclub/`,
  }),
}

/** Tekstvariant van een schaakstuk, zodat iOS er geen emoji van maakt. */
const T = '︎'

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

export default function Schaakclub() {
  // Uit de content, niet overgetypt: verschuift er een wereld, dan klopt de tekst nog.
  const pionnen = WERELDEN.findIndex((w) => w.id === 'pion')
  const mat = WERELDEN.findIndex((w) => w.id === 'mat')

  return (
    <main className={s.pagina}>
      <p style={{ margin: 0 }}>
        <Link href="/" className={s.terug}>
          ← Naar de app
        </Link>
      </p>

      <section>
        <p className={s.oogje}>Voor ouders</p>
        <h1 style={{ fontSize: 'clamp(1.9rem, 6.2vw, 3rem)', lineHeight: 1.05 }}>
          Een schaakclub voor je kind vinden
        </h1>
        <p className={s.lead} style={{ maxWidth: '46ch' }}>
          Schaakmaatje is een aanloop. Echt schaken leer je aan een bord, met een ander kind
          tegenover je. Zo vind je een club in de buurt, en zo weet je wanneer je kind eraan
          toe is.
        </p>
        {/* Eerst de app proberen is de hoofdknop: wie hier via Google binnenkomt, kent
            Schaakmaatje nog niet. De clubzoeker staat ernaast als tweede knop. */}
        <div className={s.knoppen}>
          <Link href={`/les/${ALLE_LESSEN[0].id}/`} className="btn btn--primary btn--big">
            <span aria-hidden="true">▶︎</span> Probeer eerst Schaakmaatje, gratis
          </Link>
          <a href={CLUBZOEKER} className="btn btn--big" target="_blank" rel="noopener noreferrer">
            Zoek een club bij de schaakbond ↗
          </a>
        </div>
      </section>

      <section>
        <Kop stuk="♙">Waarom een club?</Kop>
        <div className={s.tekst}>
          <p>
            Op een club speelt je kind tegen andere kinderen, aan een echt bord. Het leert
            winnen, en ook verliezen, van iemand die tegenover je zit. Dat kan een app niet
            nadoen.
          </p>
          <p>
            Er is een trainer die ziet wat je kind doet en waar het vastloopt. Op de meeste
            Nederlandse clubs leren kinderen met de Stappenmethode, en na elke stap kunnen ze
            een examen doen voor een diploma: na Stap 1 het Stap 1-diploma, op veel clubs het
            pionnendiploma genoemd. Veel clubs spelen ook mee in een jeugdcompetitie, met teams
            van kinderen van ongeveer dezelfde leeftijd of sterkte.
          </p>
        </div>
      </section>

      <section>
        <Kop stuk="♔">Wanneer is je kind eraan toe?</Kop>
        <div className={s.tekst}>
          <p>
            Er is geen vaste leeftijd. Veel clubs hebben een jeugdgroep vanaf een jaar of vijf
            of zes, maar dat verschilt per club; vraag het gewoon. Belangrijker dan de
            leeftijd is of je kind het leuk vindt om aan een bord te zitten en tegen een ander
            te spelen.
          </p>
          <p>
            Wie in Schaakmaatje de werelden tot en met {WERELDEN[pionnen].naam} (wereld{' '}
            {pionnen}) gedaan heeft, weet hoe alle stukken lopen, op de rokade na. Schaak en
            mat komen daarna, dus een hele partij spelen kan het nog niet. Toch is het een goed
            moment om een club te proberen: je kind hoeft niet eerst de hele app uit te spelen.
          </p>
          <p>
            Eén ding gaat op de club anders. In Stap 1 komt mat ongeveer halverwege; in
            Schaakmaatje pas in wereld {mat}, {WERELDEN[mat].naam}. Dat is geen probleem: de
            trainer begint bij het begin, en je kind herkent dan al veel van wat er komt.
          </p>
        </div>
      </section>

      <section>
        <Kop stuk="♘">Een club in de buurt vinden</Kop>
        <div className={s.tekst}>
          <p>
            De schaakbond (KNSB) heeft een{' '}
            <a href={CLUBZOEKER} target="_blank" rel="noopener noreferrer">
              clubzoeker
            </a>
            . Zoek op je woonplaats en kies voor jeugd. Of je nu in Amsterdam, Den Haag,
            Rotterdam of een dorp woont: er zijn honderden clubs, en veel ervan hebben een
            jeugdafdeling.
          </p>
          <p>
            Vraag ook op school. Sommige basisscholen hebben schaakles of doen mee aan een
            schoolschaaktoernooi, en dan weet de juf of meester vaak welke club in de buurt
            jeugd heeft.
          </p>
        </div>
      </section>

      <section>
        <Kop stuk="♗">Wat vraag je bij de club?</Kop>
        <ul className={s.tekst} style={{ paddingLeft: 22 }}>
          <li>Is er een jeugdgroep, en op welke dag en hoe laat?</li>
          <li>Mag mijn kind een paar keer meedoen voor we lid worden?</li>
          <li>Met welke methode trainen jullie, en kan mijn kind er diploma&apos;s halen?</li>
          <li>Vanaf welke leeftijd mag een kind meedoen, en in welke groep komt het?</li>
          <li>Wat kost het lidmaatschap?</li>
          <li>Blijft er een ouder bij, of kun je je kind brengen en halen?</li>
        </ul>
      </section>

      <section>
        <Kop stuk="♕">En thuis?</Kop>
        <div className={s.tekst}>
          <p>
            Blijf ook thuis spelen. Een kind dat tussen twee clubavonden een partijtje speelt,
            onthoudt meer van de training. Aan een echt bord met jou, of in Schaakmaatje: tegen
            Pips maatjes, of samen op één tablet.
          </p>
          <p>
            Meer over hoe de app werkt staat op <Link href="/over/">de pagina voor ouders</Link>
            , en hoe de stukken lopen bij <Link href="/schaakregels/">de schaakregels</Link>.
          </p>
          <p>
            <Link href={`/les/${ALLE_LESSEN[0].id}/`} className="btn btn--primary btn--big">
              <span aria-hidden="true">▶︎</span> Probeer de eerste les
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
