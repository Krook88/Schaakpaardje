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
 * De opnames krijgen een eigen controle, en die telt niet maar kijkt. Tellen was te
 * zwak: 678 opnames bij 673 zinnen ziet eruit alsof alles er is, terwijl het net zo
 * goed vijf weesbestanden plus twee ontbrekende zinnen kan zijn. De naam van een
 * opname is een hash van de zin zelf, dus we kunnen precies nagaan welke zin geen
 * bestand heeft. Daar gaat hij dus langs alle zinnen die Pip hoort te zeggen.
 */
import { execSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync, existsSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { alleZinnen } from '../src/content/validate'
import { zinSleutel } from '../src/audio/voice'
import * as pip from '../src/content/voice'

/**
 * Elke zin die een opname hoort te hebben.
 *
 * Precies dezelfde verzameling als scripts/tts-render.ts inspreekt. Hij wordt hier
 * opnieuw opgebouwd uit dezelfde bronnen in plaats van overgetypt, want een tweede
 * lijst loopt altijd een keer uit de pas met de eerste.
 */
function teSprekenZinnen(): string[] {
  const uit = new Set<string>(alleZinnen())
  for (const waarde of Object.values(pip)) {
    if (typeof waarde === 'string') uit.add(waarde)
    else if (Array.isArray(waarde)) waarde.forEach((z) => typeof z === 'string' && uit.add(z))
  }
  uit.delete('Pip')
  return [...uit]
}

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
function zichtbareTekst(html: string): string {
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

const titelVan = (html: string) => html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? ''
const canonicalVan = (html: string) => html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? ''

/** Alle gebouwde pagina's, als paden zoals de browser ze opvraagt. */
function gebouwdePaginas(): string[] {
  const uit: string[] = []
  const loop = (map: string) => {
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
type Antwoord = { status: number; html: string; fout?: string }

async function haal(pad: string): Promise<Antwoord> {
  const url = SITE + pad
  for (let poging = 1; poging <= 3; poging++) {
    try {
      const antwoord = await fetch(url, { headers: { 'cache-control': 'no-cache' } })
      const tekst = antwoord.ok ? await antwoord.text() : ''
      return { status: antwoord.status, html: tekst }
    } catch (e) {
      if (poging === 3) return { status: 0, html: '', fout: String((e as Error).message ?? e) }
      await new Promise((los) => setTimeout(los, 400 * poging))
    }
  }
  return { status: 0, html: '', fout: 'opgegeven' }
}

/** Een handjevol tegelijk, zodat 84 pagina's geen vijf minuten duren. */
async function perGroep<T, U>(lijst: T[], n: number, werk: (t: T) => Promise<U>): Promise<U[]> {
  const uit: U[] = []
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

const klachten: [string, string][] = []
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
    const knip = (s: string) => s.slice(Math.max(0, i - 25), i + 55).trim()
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
async function manifestVan(soort: string) {
  const antwoord = await haal(`/${soort}/manifest.json`)
  if (antwoord.status === 404) return { sleutels: null as string[] | null, uitleg: 'geen manifest (404)' }
  if (antwoord.status !== 200) return { sleutels: null, uitleg: `manifest geeft ${antwoord.status}` }
  try {
    return { sleutels: Object.keys(JSON.parse(antwoord.html)), uitleg: null }
  } catch {
    return { sleutels: null, uitleg: 'manifest is geen geldige JSON' }
  }
}

const vorige = existsSync(GEHEUGEN) ? JSON.parse(readFileSync(GEHEUGEN, 'utf8')) : {}
const nu: Record<string, number | null> = {}

console.log('Opnames op de server:')

const { sleutels, uitleg } = await manifestVan('audio')
nu.audio = sleutels?.length ?? null
if (!sleutels) {
  klachten.push(['/audio/manifest.json', uitleg!])
  console.log(`  ?  audio: ${uitleg}`)
} else if (!sleutels.length) {
  klachten.push([
    '/audio/',
    'nul opnames. Waarschijnlijk is een leeg manifest over het echte heen gegaan; ' +
      'zet public/audio/ er opnieuw bij.',
  ])
  console.log('  ✗  audio: nul opnames')
} else {
  // Niet tellen maar nagaan: welke zin heeft geen bestand?
  const aanwezig = new Set(sleutels)
  const zinnen = teSprekenZinnen()
  const stil = zinnen.filter((zin) => !aanwezig.has(zinSleutel(zin)))
  const wees = sleutels.length - (zinnen.length - stil.length)

  if (stil.length) {
    klachten.push([
      '/audio/',
      `${stil.length} van de ${zinnen.length} zinnen hebben geen opname en klinken dus\n` +
        `        in de apparaatstem. Draai: npm run audio:render -- --vanaf ${SITE}\n` +
        stil.slice(0, 5).map((z) => `        · "${z}"`).join('\n') +
        (stil.length > 5 ? `\n        · en nog ${stil.length - 5}` : ''),
    ])
    console.log(`  ✗  audio: ${zinnen.length - stil.length} van de ${zinnen.length} zinnen ingesproken`)
  } else {
    console.log(`  ✓  audio: alle ${zinnen.length} zinnen ingesproken`)
  }
  // Weesbestanden zijn geen fout: een aangepaste zin krijgt een nieuwe naam en de
  // oude blijft achter. Ze kosten alleen ruimte, dus melden en verder niets.
  if (wees > 0) console.log(`     (${wees} opname${wees === 1 ? '' : 's'} van zinnen die niet meer bestaan)`)
}

const sfx = await manifestVan('sfx')
nu.sfx = sfx.sleutels?.length ?? null
if (!sfx.sleutels) {
  klachten.push(['/sfx/manifest.json', sfx.uitleg!])
  console.log(`  ?  sfx: ${sfx.uitleg}`)
} else if (!sfx.sleutels.length) {
  klachten.push(['/sfx/', 'nul bordgeluiden. Zet public/sfx/ er opnieuw bij.'])
  console.log('  ✗  sfx: nul geluiden')
} else {
  const eerder = vorige.sfx
  if (eerder && sfx.sleutels.length < eerder) {
    klachten.push(['/sfx/', `${eerder} geluiden vorige keer, nu ${sfx.sleutels.length}. Er zijn er weg.`])
    console.log(`  ✗  sfx: ${sfx.sleutels.length} (was ${eerder})`)
  } else {
    console.log(`  ✓  sfx: ${sfx.sleutels.length} geluiden`)
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
console.log(`\n${welkeKantLooptAchter()}`)
process.exit(1)

/**
 * Wie loopt er achter: de server, of de build op deze computer?
 *
 * Hier stond altijd "de zip is nog niet uitgepakt". Op 7 oktober was het precies
 * andersom: de server had de nieuwe tekst en de eigen kopie was zonder `git pull`
 * gebouwd. Het advies stuurde dan naar een upload die al gelukt was. Een build die
 * achterloopt op GitHub is na te vragen, dus dat doen we eerst.
 */
function welkeKantLooptAchter(): string {
  try {
    execSync('git fetch --quiet', { stdio: 'ignore', timeout: 15000 })
    const achter = Number(
      execSync('git rev-list --count HEAD..@{u}', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(),
    )
    if (achter > 0) {
      return (
        `Je eigen kopie loopt ${achter} ${achter === 1 ? 'commit' : 'commits'} achter op GitHub.\n` +
        'Dan is het de build hier die oud is, niet de server. Doe eerst:\n' +
        '    git pull\n    npm run build\n    npm run live'
      )
    }
  } catch {
    // Geen git, geen netwerk of geen upstream: dan weten we het niet, en zeggen we
    // hieronder wat je zelf kunt bekijken.
  }
  return (
    'Kijk hierboven welke kant de oude tekst heeft.\n' +
    '  live is oud     : de zip staat nog niet (helemaal) op de server.\n' +
    '  gebouwd is oud  : deze build mist de laatste wijzigingen. git pull en opnieuw bouwen.'
  )
}
