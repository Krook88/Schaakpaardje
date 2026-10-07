/**
 * Staat op schaakmaatje.nl echt wat je gebouwd hebt?
 *
 *   npm run build
 *   npm run live
 *
 * Dit bestaat omdat er sinds oktober niets meer is dat die twee met elkaar vergelijkt.
 * De koppeling tussen GitHub en de hosting is eruit gehaald: je bouwt een zip en pakt
 * hem met SFTP uit. Dat werkt prima, maar er is geen enkel moment waarop iemand
 * controleert of het ook echt gelukt is. Een half mislukte upload, een map die je
 * vergeet, een browser die een oude pagina vasthoudt — je merkt het pas als iemand
 * klaagt, en bij een kinder-app klaagt niemand.
 *
 * Wat hij vergelijkt is de zíchtbare tekst, niet de bestanden. Dat is met opzet: elke
 * build geeft de codebestanden nieuwe namen, dus byte-voor-byte vergelijken zou altijd
 * verschillen tonen die niets betekenen. De tekst die een bezoeker leest hoort wél
 * precies hetzelfde te zijn.
 *
 * De opnames krijgen een eigen controle. Die staan met opzet niet in de zip (anders
 * overschrijf je wat er al staat), dus ze zijn hier niet te vergelijken. Wat hij wel
 * kan zeggen: hoeveel er op de server staan, en of dat er niet ineens veel minder zijn
 * dan de vorige keer. Nul is bijna altijd de fout waarbij een leeg manifest over het
 * echte heen is gegaan.
 */
import { readdirSync, readFileSync, statSync, existsSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const SITE = process.argv.find((a) => a.startsWith('--url='))?.slice(6) ?? 'https://schaakmaatje.nl'
const UIT = 'out'
/** Hoeveel pagina's we tegelijk ophalen. Beleefd blijven tegen gedeelde hosting. */
const TEGELIJK = 6
/** Waar we onthouden hoeveel opnames er vorige keer stonden. */
const GEHEUGEN = '.live-check.json'

if (!existsSync(UIT)) {
  console.error('Geen out/ gevonden. Draai eerst: npm run build')
  process.exit(1)
}

/* ---------------------------------------------------------------- *
 * De tekst die een bezoeker ziet, en verder niets.
 * ---------------------------------------------------------------- */
function zichtbareTekst(html) {
  const body = html.includes('<body') ? html.slice(html.indexOf('<body')) : html
  return body
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const titelVan = (html) => html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? ''
const canonicalVan = (html) => html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? ''

/** Alle gebouwde pagina's, als paden zoals de browser ze opvraagt. */
function gebouwdePaginas() {
  const uit = []
  const loop = (map) => {
    for (const naam of readdirSync(map)) {
      const pad = join(map, naam)
      if (statSync(pad).isDirectory()) loop(pad)
      else if (naam === 'index.html') {
        const rel = relative(UIT, pad).replace(/index\.html$/, '')
        uit.push('/' + rel.replace(/\\/g, '/'))
      }
    }
  }
  loop(UIT)
  return uit.sort()
}

/* ---------------------------------------------------------------- *
 * Ophalen, met een beetje geduld.
 * ---------------------------------------------------------------- */
async function haal(pad) {
  const url = SITE + pad
  for (let poging = 1; poging <= 3; poging++) {
    try {
      const antwoord = await fetch(url, { headers: { 'cache-control': 'no-cache' } })
      const tekst = antwoord.ok ? await antwoord.text() : ''
      return { status: antwoord.status, html: tekst }
    } catch (e) {
      if (poging === 3) return { status: 0, html: '', fout: String(e.message ?? e) }
      await new Promise((los) => setTimeout(los, 400 * poging))
    }
  }
}

/** Een handjevol tegelijk, zodat 84 pagina's geen vijf minuten duren. */
async function perGroep(lijst, n, werk) {
  const uit = []
  for (let i = 0; i < lijst.length; i += n) {
    uit.push(...(await Promise.all(lijst.slice(i, i + n).map(werk))))
  }
  return uit
}

/* ---------------------------------------------------------------- *
 * De controle zelf.
 * ---------------------------------------------------------------- */
const paginas = gebouwdePaginas()
console.log(`Vergelijken: ${paginas.length} pagina's op ${SITE}\n`)

const klachten = []
let gelijk = 0

const uitkomsten = await perGroep(paginas, TEGELIJK, async (pad) => {
  const hier = readFileSync(join(UIT, pad.slice(1), 'index.html'), 'utf8')
  const daar = await haal(pad)
  return { pad, hier, daar }
})

for (const { pad, hier, daar } of uitkomsten) {
  if (daar.status === 0) {
    klachten.push([pad, `niet bereikbaar (${daar.fout ?? 'geen antwoord'})`])
    continue
  }
  if (daar.status !== 200) {
    klachten.push([pad, `geeft ${daar.status}, hoort 200 te geven`])
    continue
  }
  const a = zichtbareTekst(hier)
  const b = zichtbareTekst(daar.html)
  if (a !== b) {
    // Zeg waar het uiteenloopt, niet alleen dát het uiteenloopt.
    let i = 0
    while (i < a.length && i < b.length && a[i] === b[i]) i++
    const knip = (s) => s.slice(Math.max(0, i - 25), i + 55).trim()
    klachten.push([
      pad,
      `andere tekst (${b.length} tekens live, ${a.length} gebouwd)\n` +
        `        gebouwd: …${knip(a)}…\n` +
        `        live:    …${knip(b)}…`,
    ])
    continue
  }
  if (titelVan(hier) !== titelVan(daar.html)) {
    klachten.push([pad, `andere titel: live "${titelVan(daar.html)}"`])
    continue
  }
  if (canonicalVan(hier) !== canonicalVan(daar.html)) {
    klachten.push([pad, `andere canonical: live "${canonicalVan(daar.html) || 'geen'}"`])
    continue
  }
  gelijk++
}

/* ---------------------------------------------------------------- *
 * De opnames. Niet te vergelijken, wel te tellen.
 * ---------------------------------------------------------------- */
async function opnames(soort) {
  const antwoord = await haal(`/${soort}/manifest.json`)
  if (antwoord.status === 404) return { aantal: 0, uitleg: 'geen manifest (404)' }
  if (antwoord.status !== 200) return { aantal: null, uitleg: `manifest geeft ${antwoord.status}` }
  try {
    return { aantal: Object.keys(JSON.parse(antwoord.html)).length, uitleg: null }
  } catch {
    return { aantal: null, uitleg: 'manifest is geen geldige JSON' }
  }
}

const vorige = existsSync(GEHEUGEN) ? JSON.parse(readFileSync(GEHEUGEN, 'utf8')) : {}
const nu = {}
console.log('Opnames op de server:')
for (const soort of ['audio', 'sfx']) {
  const { aantal, uitleg } = await opnames(soort)
  nu[soort] = aantal
  const eerder = vorige[soort]
  if (aantal === null) {
    klachten.push([`/${soort}/manifest.json`, uitleg])
    console.log(`  ?  ${soort}: ${uitleg}`)
  } else if (aantal === 0) {
    klachten.push([
      `/${soort}/`,
      'nul opnames. Waarschijnlijk is een leeg manifest over het echte heen gegaan; ' +
        `zet public/${soort}/ er opnieuw bij.`,
    ])
    console.log(`  ✗  ${soort}: nul opnames`)
  } else if (eerder && aantal < eerder) {
    klachten.push([`/${soort}/`, `${eerder} opnames vorige keer, nu ${aantal}. Er zijn er weg.`])
    console.log(`  ✗  ${soort}: ${aantal} (was ${eerder})`)
  } else {
    console.log(`  ✓  ${soort}: ${aantal} opnames${eerder ? ` (was ${eerder})` : ''}`)
  }
}
writeFileSync(GEHEUGEN, JSON.stringify(nu, null, 2))

/* ---------------------------------------------------------------- *
 * De uitslag.
 * ---------------------------------------------------------------- */
console.log()
if (!klachten.length) {
  console.log(`Alles klopt: ${gelijk} pagina's staan live precies zoals ze gebouwd zijn.`)
  process.exit(0)
}

console.log(`${gelijk} van de ${paginas.length} pagina's kloppen. ${klachten.length} niet:\n`)
for (const [pad, waarom] of klachten) console.log(`  ✗ ${pad}\n        ${waarom}`)
console.log(
  '\nMeestal betekent dit dat de zip nog niet (helemaal) is uitgepakt.' +
    '\nIs hij dat wel, probeer dan een harde herlaadbeurt: de service worker kan' +
    '\neen oude pagina vasthouden.',
)
process.exit(1)
