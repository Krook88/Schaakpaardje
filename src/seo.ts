import type { Metadata } from 'next'

/**
 * Alles wat met vindbaarheid te maken heeft, op één plek.
 *
 * De aanleiding is onaangenaam concreet: de startpagina bevatte nul tekens tekst in de
 * HTML die een zoekmachine binnenkrijgt. De app is volledig client-side, en het scherm
 * wacht op de opgeslagen profielen voordat het iets tekent — dus wat er in de
 * geëxporteerde index.html stond, was een leeg `<main>`. Google had letterlijk niets om
 * te indexeren behalve de titel.
 *
 * Zoekmachines voeren tegenwoordig wel JavaScript uit, maar met vertraging en met
 * minder budget dan voor gewone HTML, en de app rendert zonder localStorage alsnog het
 * aanmeldscherm — geen tekst over schaken. Daarom staat de inhoud waarmee we gevonden
 * willen worden nu in echte, statische pagina's: /over/ en /lessen/. Die hebben ook
 * zonder zoekmachine bestaansrecht, want een ouder die de app overweegt wil precies
 * dat weten voordat hij zijn kind erop zet.
 */

/** Waar de site staat. Zonder dit worden og:image en canonical relatieve paden. */
export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://schaakmaatje.nl'

export const NAAM = 'Schaakmaatje'

export const SLOGAN = 'Leer schaken met Pip het schaakpaardje'

/**
 * De omschrijving die onder de zoekresultaten komt te staan.
 *
 * Onder de 160 tekens, want daarboven kapt Google hem af. Hij noemt wat een ouder
 * intikt — leren schaken, kinderen, leeftijd — en niet wat wij van de app vinden.
 */
export const OMSCHRIJVING =
  'Gratis Nederlandse schaakapp voor kinderen van 3 tot 10 jaar. Pip het schaakpaardje leest alles voor, dus lezen hoeft nog niet. Zonder account, zonder reclame.'

/**
 * Een kop koffie, als iemand daar zin in heeft.
 *
 * Bewust alleen op de ouderpagina's — /over/ en het ouderscherm — en nooit in het
 * kindscherm. Een kind van vier tikt alles aan wat oplicht, en dat mag nooit ergens
 * uitkomen waar geld ligt. Het is ook geen knop maar een regel tekst: wie hem zoekt
 * vindt hem, wie hem niet zoekt wordt er niet toe verleid.
 *
 * Het is een fooi, geen aankoop: het levert de gever niets extra's op. Dat staat er
 * ook bij, want een donatielink zonder die zin leest al snel als een voorportaal.
 *
 * Er stond eerst "er komt nooit iets achter een betaling te staan". Dat is een belofte
 * die je maar één keer kunt breken, en het is nog niet zeker dat deze app voor altijd
 * gratis kan blijven. Wat er staat is nu waar in beide gevallen.
 */
export const KOFFIE = 'https://bunq.me/KRook'

/**
 * De deelkaart van een pagina: wat WhatsApp, Facebook en LinkedIn tonen als iemand de
 * link deelt.
 *
 * Next.js voegt het `openGraph`-blok van een pagina niet samen met dat van de layout,
 * het vervangt het. Elke pagina die een eigen titel voor de kaart zette, verloor
 * daarmee het plaatje, het type en de taal: 51 van de 52 pagina's die gevonden mogen
 * worden. Stuurde een ouder `/over/` door in de appgroep van school, dan verscheen er
 * een kale regel tekst. En deze app wordt eerder doorgegeven dan gezocht. De
 * Twitter-kaart erfde intussen wél, en noemde dus op elke lespagina de titel van de
 * startpagina. Twee verhalen in één `<head>`.
 *
 * Daarom bouwt elke pagina zijn kaart hier, compleet, in plaats van een stukje te
 * zetten en te hopen dat de rest blijft staan.
 */
export function deelkaart(kaart: {
  titel: string
  omschrijving: string
  /** Volledige URL van de pagina zelf. */
  url: string
}): Pick<Metadata, 'openGraph' | 'twitter'> {
  const plaatje = { url: '/og.png', width: 1200, height: 630, alt: `${NAAM}: ${SLOGAN}` }
  return {
    openGraph: {
      type: 'website',
      locale: 'nl_NL',
      siteName: NAAM,
      title: kaart.titel,
      description: kaart.omschrijving,
      url: kaart.url,
      images: [plaatje],
    },
    twitter: {
      card: 'summary_large_image',
      title: kaart.titel,
      description: kaart.omschrijving,
      images: [plaatje.url],
    },
  }
}
