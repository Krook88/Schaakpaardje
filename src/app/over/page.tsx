import type { Metadata } from 'next'
import Link from 'next/link'
import { ALLE_LESSEN, WERELDEN } from '@/content'
import { NAAM, OMSCHRIJVING, SITE } from '@/seo'

/**
 * De uitlegpagina, voor ouders en voor zoekmachines.
 *
 * Deze pagina is expres géén 'use client': hij staat volledig in de geëxporteerde HTML
 * en heeft geen JavaScript nodig om iets te tonen. Dat is precies wat er ontbrak — de
 * hele app is client-side en leverde bij het bouwen een lege pagina op, dus er viel
 * niets te vinden.
 *
 * En hij is niet alleen voor Google: een ouder die overweegt zijn kind hierop te zetten
 * wil weten wat het kost, of er reclame in zit en waar de gegevens blijven. Dat stond
 * nergens buiten de app om.
 */
export const metadata: Metadata = {
  title: 'Over Schaakmaatje — gratis leren schaken voor kinderen van 3 tot 10',
  description: OMSCHRIJVING,
  alternates: { canonical: `${SITE}/over/` },
  openGraph: {
    title: 'Over Schaakmaatje — gratis leren schaken voor kinderen',
    description: OMSCHRIJVING,
    url: `${SITE}/over/`,
  },
}

export default function Over() {
  const lessen = ALLE_LESSEN.length
  const werelden = WERELDEN.length

  return (
    <main className="page">
      <article className="stack" style={{ maxWidth: 720, margin: '0 auto' }}>
        <header className="stack" style={{ gap: 8 }}>
          <p className="muted" style={{ margin: 0 }}>
            <Link href="/">← Naar de app</Link>
          </p>
          <h1 style={{ fontSize: '1.9rem', margin: 0 }}>
            Leer schaken met Pip het schaakpaardje
          </h1>
          <p style={{ fontSize: '1.1rem', margin: 0 }}>
            {NAAM} is een gratis Nederlandse schaakapp voor kinderen van drie tot tien jaar.
            Pip leest alles voor, dus je kind hoeft nog niet te kunnen lezen om te beginnen.
          </p>
        </header>

        <section className="card stack">
          <h2>Voor wie is het?</h2>
          <p>
            Drie tot tien jaar is qua ontwikkeling geen doelgroep maar drie. Daarom kent de app
            drie standen, die de app kiest op basis van de leeftijd die je invult en die je
            daarna zelf kunt bijstellen.
          </p>
          <ul>
            <li>
              <strong>3 tot 5 jaar</strong> — nog geen schaakregels. Het bord leren kennen:
              licht en donker, rijen en lijnen, en één stuk tegelijk. Alles gesproken, geen
              letter nodig, tikken in plaats van slepen.
            </li>
            <li>
              <strong>6 tot 8 jaar</strong> — alle stukken, hoe ze lopen en slaan, de eerste
              hele partijtjes tegen een vriendelijke tegenstander.
            </li>
            <li>
              <strong>8 tot 10 jaar</strong> — schaak, mat, rokade, en pas dan de notatie
              (a1, e4) en de eerste tactiek. De veldnamen staan hier standaard aan.
            </li>
          </ul>
        </section>

        <section className="card stack">
          <h2>Hoe leert een kind hier schaken?</h2>
          <p>
            Elke les volgt dezelfde vier stappen, zodat een kind altijd weet waar het is:
            <strong> kijken</strong> (Pip doet het voor op het bord),
            <strong> meedoen</strong> (samen één zet),
            <strong> zelf doen</strong> en <strong> laat maar zien</strong>. Voor die laatste
            stap krijg je één, twee of drie sterren.
          </p>
          <p>
            De volgorde volgt de Nederlandse stappen-didactiek, met één eigenaardigheid die
            bewust is: <strong>schaakmat komt pas in wereld tien</strong>. De meeste apps
            beginnen ermee, maar een kind dat nog niet ziet hoe een toren loopt, kan met mat
            niets. Dat late uitstel is hier de methode, geen omissie.
          </p>
          <p>
            Er is geen manier om te verliezen. Geen levens, geen game-over, geen nul sterren
            en geen timer. Een fout antwoord levert een tip op en een nieuwe poging.
          </p>
        </section>

        <section className="card stack">
          <h2>Wat zit erin?</h2>
          <ul>
            <li>
              <strong>{werelden} werelden met {lessen} lessen</strong> — van het bord leren
              kennen tot het eindspel. <Link href="/lessen/">Bekijk alle lessen</Link>.
            </li>
            <li>
              <strong>Minispellen</strong> — pionnenspel, vang de vlag, torenjacht,
              paardensprong-parcours en het hongerige paardje.
            </li>
            <li>
              <strong>Partijtjes tegen zeven tegenstanders</strong>, van Mila de Muis die maar
              wat doet tot Bram de Beer die altijd zijn beste zet speelt. En samen spelen op
              één tablet.
            </li>
            <li>
              <strong>Een stal om te verzamelen</strong> — stukken, maatjes en hoefijzers die
              je verdient door verder te komen.
            </li>
            <li>
              <strong>Een ouderscherm</strong> met wat je kind nu kan, per les, in gewone taal.
            </li>
          </ul>
        </section>

        <section className="card stack">
          <h2>Wat kost het, en wat gebeurt er met de gegevens?</h2>
          <p>
            <strong>Niets, en niets.</strong> De app is gratis, er zit geen reclame in, er zijn
            geen aankopen in de app en er is geen account nodig.
          </p>
          <p>
            Alles blijft op het apparaat zelf staan: een voornaam, een leeftijd en de
            voortgang, in de browser van je kind. Er wordt niets naar internet gestuurd, er is
            geen chat en er zijn geen volgers of vrienden. De app werkt na de eerste keer ook
            zonder internet.
          </p>
        </section>

        <section className="card stack">
          <h2>Hoe begin ik?</h2>
          <p>
            Open de app, vul een voornaam en een leeftijd in, en kies een maatje. Dat is alles
            — er komt geen e-mailadres aan te pas. Op een telefoon of tablet kun je{' '}
            {NAAM} als app op het beginscherm zetten via het deelmenu van je browser.
          </p>
          <p>
            <Link href="/" className="btn btn--primary btn--big">
              Beginnen →
            </Link>
          </p>
        </section>

        <section className="card stack">
          <h2>Veelgestelde vragen</h2>
          <h3>Kan mijn kind dit als het nog niet kan lezen?</h3>
          <p>
            Ja, daar is de app op gebouwd. Pip spreekt elke opdracht uit, elke knop heeft een
            plaatje, en bij elke tekstballon staat een luidsprekerknop om het nog eens te
            horen. Vanaf drie jaar is er iemand nodig die meekijkt bij het aanmaken van het
            profiel; daarna kan een kind zelf verder.
          </p>
          <h3>Vanaf welke leeftijd heeft schaken zin?</h3>
          <p>
            Vanaf een jaar of vier kunnen kinderen de stukken en hun bewegingen leren. Wereld
            nul gaat nog helemaal niet over schaken maar over het bord: kleuren, rijen, lijnen
            en tellen tot acht. Dat is voor een driejarige te doen.
          </p>
          <h3>Vervangt dit de schaakclub?</h3>
          <p>
            Nee, en dat is ook niet de bedoeling. De winst zit in het spelen aan een echt bord,
            met iemand tegenover je. Deze app is de brug daarnaartoe: elke wereld eindigt met
            de opdracht om het met papa, mama of de juf te spelen.
          </p>
          <h3>Werkt het op een telefoon?</h3>
          <p>
            Ja, op telefoon, tablet en computer. Een tablet is het prettigst — het bord is dan
            groot genoeg voor kindervingers.
          </p>
        </section>
      </article>
    </main>
  )
}
