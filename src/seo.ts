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
