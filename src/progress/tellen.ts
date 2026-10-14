/**
 * Anonieme tellingen, zodat Kaj ziet hoeveel de app gebruikt wordt en waar kinderen
 * afhaken.
 *
 * Afspraak (oktober 2026, besloten door Kaj): er gaat niets ÓVER een kind naar
 * internet. Geen naam, geen leeftijd, geen profiel, geen voortgang per kind, geen
 * cookie en geen eigen ID. Alleen losse tellingen zoals "les toren-1 is begonnen".
 *
 * Ze gaan naar de eigen teller op schaakmaatje.nl zelf (`public/teller/`, een klein
 * PHP-script op de eigen hosting): geen dienst van buiten, geen kosten. Die bewaart geen
 * IP-adres en weigert alles wat niet op zijn vaste lijst staat. Alleen op schaakmaatje.nl
 * zelf, dus niet in ontwikkeling, de doorloop of de tests. Een ouder kan het uitzetten
 * op het ouderscherm; dat geldt voor het hele apparaat.
 */

const DOMEIN = 'schaakmaatje.nl'
// Met index.php erbij: op de hosting gaf alleen /teller/ een 404 (geen DirectoryIndex).
const ADRES = '/teller/index.php'
const UIT_SLEUTEL = 'schaakmaatje-tellen'

/** Mag er geteld worden? Alleen op de echte site, en niet als een ouder het uitzette. */
export function tellenAan(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(UIT_SLEUTEL) !== 'uit'
  } catch {
    return true
  }
}

export function zetTellen(aan: boolean) {
  try {
    if (aan) localStorage.removeItem(UIT_SLEUTEL)
    else localStorage.setItem(UIT_SLEUTEL, 'uit')
  } catch {
    // Geen opslag: dan valt er ook niets te onthouden.
  }
}

function opDeSite(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === DOMEIN || h === `www.${DOMEIN}`
}

/**
 * Alleen eenvoudige waarden die niets over een kind zeggen: een les-id, een spel-id,
 * een uitslag, een grove tijdsklasse. Nooit een naam of iets wat een kind intypt.
 */
export type Eigenschappen = Record<string, string | number>

/** De schermen van de app. Een ander pad is door iemand ingetypt en gaat niet mee. */
const BEKEND = /^\/(|(les|lessen|kaart|spel|spelen|stal|ouders|over|diploma|opfrissen)(\/[a-z0-9-]+)?\/)$/

/**
 * Het pad zonder hekje en zonder vraagteken: in het hekje van een afstandslink staat de
 * partij. En alleen een bekend scherm; een zelf ingetypt adres wordt `/onbekend/`. De
 * teller controleert dit zelf nog eens.
 */
export function pad(pathname: string): string {
  return BEKEND.test(pathname) ? pathname : '/onbekend/'
}

function stuur(naam: string, props?: Eigenschappen, referrer?: string) {
  if (!opDeSite() || !tellenAan()) return
  try {
    void fetch(ADRES, {
      method: 'POST',
      // keepalive: het laatste bericht (speelduur) gaat vaak net als de tab sluit.
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: naam, url: pad(window.location.pathname), referrer, props }),
    }).catch(() => {})
  } catch {
    // Tellen mag nooit iets kapotmaken.
  }
}

let eersteScherm = true

/**
 * Een scherm is geopend. Bij het eerste scherm ook waar de bezoeker vandaan kwam
 * (Google, WhatsApp): dat zegt iets over de site, niets over het kind.
 */
export function telScherm() {
  const van = eersteScherm && typeof document !== 'undefined' ? document.referrer || undefined : undefined
  eersteScherm = false
  stuur('pageview', undefined, van)
}

/** Iets gebeurde: een les begon, een partij eindigde. */
export function tel(naam: string, props?: Eigenschappen) {
  stuur(naam, props)
}

/** Een speelduur in grove klassen: precieze seconden zeggen niets extra's. */
export function duurKlasse(ms: number): string {
  const min = ms / 60000
  if (min < 1) return 'minder dan 1 min'
  if (min < 5) return '1 tot 5 min'
  if (min < 15) return '5 tot 15 min'
  if (min < 30) return '15 tot 30 min'
  return '30 min of meer'
}

/** Hoeveel dagen er op dit apparaat geoefend is, in klassen: wie komt terug, en hoe vaak? */
export function dagenKlasse(dagen: number): string {
  if (dagen <= 1) return '1 dag'
  if (dagen <= 2) return '2 dagen'
  if (dagen <= 5) return '3 tot 5 dagen'
  if (dagen <= 10) return '6 tot 10 dagen'
  return 'meer dan 10 dagen'
}
