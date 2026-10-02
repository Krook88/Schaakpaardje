import Link from 'next/link'
import { vertelTekst, type Lesson, type World } from '@/content/types'

/**
 * Wat er van een les in de gebouwde HTML staat.
 *
 * De negenenveertig lespagina's bevatten samen nul tekens tekst: het lesscherm is een
 * client-component, dus wat Google binnenkrijgt is een leeg vlak met een kop. Daarmee
 * zijn het achtenveertig van de vierentachtig pagina's die niets te bieden hebben, en
 * ze stonden wel allemaal in de sitemap.
 *
 * Dat is zonde, want de inhoud ís er. Elke les heeft een titel, een doel ("wat kan mijn
 * kind hierna") en Pips eigen uitleg in de kijkfase. Dat is precies wat een ouder in
 * een zoekmachine typt: hoe loopt de toren, wat is rokade, hoe leer je een kind
 * schaken. Negenenveertig pagina's die elk één zo'n vraag beantwoorden zijn voor een
 * nieuwe site de enige realistische manier om gevonden te worden.
 *
 * Een kind ziet dit nooit. `LessonPlayer` toont het alleen in de fractie van een
 * seconde voordat de opgeslagen voortgang binnen is, en vervangt het daarna door het
 * lesscherm. Dezelfde constructie als `Welkom` op de startpagina.
 */
export function LesUitleg({
  les,
  wereld,
  nummer,
  aantal,
}: {
  les: Lesson
  wereld: World
  nummer: number
  aantal: number
}) {
  return (
    <article className="stack" style={{ maxWidth: 680 }}>
      <p className="muted" style={{ margin: 0 }}>
        <Link href="/lessen/">Alle lessen</Link> · {wereld.naam}, les {nummer} van {aantal}
      </p>

      <h1 style={{ fontSize: '1.7rem', margin: 0 }}>
        {les.titel}
      </h1>

      <p style={{ fontSize: '1.1rem', margin: 0 }}>{les.doel}</p>

      {/* Pips eigen uitleg. Dit is de les, letterlijk: dezelfde zinnen die hij een kind
          voorleest. Geen apart stuk tekst voor zoekmachines, want twee versies van
          dezelfde uitleg lopen altijd uit elkaar. */}
      <section className="card stack">
        <h2 style={{ fontSize: '1.15rem' }}>Wat Pip vertelt</h2>
        {les.vertel.map((zin, i) => (
          <p key={i} style={{ margin: 0 }}>
            {vertelTekst(zin)}
          </p>
        ))}
      </section>

      <p style={{ margin: 0 }}>
        Na deze les: <strong>{les.geleerd}</strong>
      </p>

      <p className="muted" style={{ margin: 0 }}>
        Deze les hoort bij {wereld.naam}. {wereld.belofte}
      </p>

      <p style={{ margin: 0 }}>
        <Link href="/">Begin met Schaakmaatje</Link>, gratis en zonder account.
      </p>
    </article>
  )
}
