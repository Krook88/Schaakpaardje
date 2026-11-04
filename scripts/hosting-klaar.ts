/**
 * Blokhaken uit de gebouwde bestandsnamen halen.
 *
 * Next.js noemt de map van een dynamische route naar het routepatroon zelf, dus de
 * uitvoer bevat mappen als `_next/static/chunks/app/les/[lesId]`. De browser vraagt die
 * op als `%5BlesId%5D`, en dáár struikelt gewone gedeelde hosting over: Apache met
 * mod_security weigert zulke URL's, en menig SFTP-programma weigert de map überhaupt te
 * uploaden. Het resultaat op schaakmaatje.nl was een wit scherm met ChunkLoadError.
 *
 * Vercel heeft er geen last van; onze eigen hosting wel. Dus hernoemen we na het bouwen
 * `[lesId]` naar `lesId` en schrijven we de verwijzingen in de HTML bij.
 *
 * Let op wat we NIET aanraken: `_ssgManifest.js` bevat `/les/[lesId]` als routepatroon,
 * niet als bestandspad. Dat heeft de router nodig om te weten welke routes dynamisch
 * zijn. Daarom vervangen we alleen de URL-gecodeerde vorm (%5B…%5D), want dat is per
 * definitie een pad dat is opgevraagd, nooit een patroon.
 */
import { readdirSync, renameSync, readFileSync, writeFileSync, existsSync, statSync, rmSync } from 'node:fs'
import { join, type PlatformPath } from 'node:path'
import * as pad_ from 'node:path'
import { WERELDEN } from '../src/content'

const UIT = join(process.cwd(), 'out')
const TEKSTBESTANDEN = /\.(html|txt|json|webmanifest)$/

/** Alle bestanden onder een map, plat. */
function alleBestanden(map: string): string[] {
  const uit: string[] = []
  for (const naam of readdirSync(map)) {
    const pad = join(map, naam)
    if (statSync(pad).isDirectory()) uit.push(...alleBestanden(pad))
    else uit.push(pad)
  }
  return uit
}

/** Mappen met blokhaken in hun naam, diepste eerst zodat hernoemen geen pad breekt. */
function mappenMetBlokhaken(map: string): string[] {
  const uit: string[] = []
  for (const naam of readdirSync(map)) {
    const pad = join(map, naam)
    if (!statSync(pad).isDirectory()) continue
    uit.push(...mappenMetBlokhaken(pad))
    if (/^\[.+\]$/.test(naam)) uit.push(pad)
  }
  return uit
}

/**
 * Waar moet `.../[lesId]` heen, en hoe heet hij dan?
 *
 * Dit was een regel of drie binnen main(), en die rekende met `lastIndexOf('/')`. Op
 * Linux klopt dat; op Windows niet, want daar levert join() backslashes op. Dan geeft
 * lastIndexOf('/') een −1, hakt slice(0, −1) het laatste teken van het pad af, en komt
 * er een doel uit als `out\_next\...\diploma\[soort\:\Users\kajro\...`. Het
 * bouwen viel om met een ENOENT, en alleen bij degene die op Windows werkt.
 *
 * Vandaar nu dirname en basename, die weten zelf welk scheidingsteken hun systeem
 * gebruikt. En vandaar dat `p` meegegeven kan worden: zo kan de test de Windows-variant
 * echt naspelen, op een machine die geen Windows is.
 */
export function zonderBlokhaken(pad: string, p: PlatformPath = pad_) {
  const naam = p.basename(pad)
  const schoon = naam.slice(1, -1)
  return { naam, schoon, doel: p.join(p.dirname(pad), schoon) }
}

function main() {
  if (!existsSync(UIT)) {
    console.error('Geen out/ gevonden. Draai eerst next build.')
    process.exit(1)
  }

  const hernoemd: string[] = []
  for (const pad of mappenMetBlokhaken(UIT)) {
    const { naam, schoon, doel } = zonderBlokhaken(pad)
    if (existsSync(doel)) {
      console.error(`Kan ${naam} niet hernoemen: ${schoon} bestaat al.`)
      process.exit(1)
    }
    renameSync(pad, doel)
    hernoemd.push(schoon)
  }

  let aangepast = 0
  if (hernoemd.length) {
    for (const bestand of alleBestanden(UIT)) {
      if (!TEKSTBESTANDEN.test(bestand)) continue
      const oud = readFileSync(bestand, 'utf8')
      let nieuw = oud
      for (const naam of hernoemd) nieuw = nieuw.replaceAll(`%5B${naam}%5D`, naam)
      if (nieuw !== oud) {
        writeFileSync(bestand, nieuw)
        aangepast++
      }
    }
  }

  // Narekenen in plaats van hopen: blijft er ergens een blokhaak staan, dan is de
  // reparatie half gelukt en krijgt een kind straks alsnog een wit scherm.
  const restMappen = mappenMetBlokhaken(UIT)
  const restVerwijzingen = alleBestanden(UIT).filter(
    (b) => TEKSTBESTANDEN.test(b) && /%5B[^%]+%5D/.test(readFileSync(b, 'utf8')),
  )
  if (restMappen.length || restVerwijzingen.length) {
    console.error('Er staan nog blokhaken in de uitvoer:')
    restMappen.forEach((m) => console.error(`  map: ${m}`))
    restVerwijzingen.slice(0, 5).forEach((b) => console.error(`  verwijzing in: ${b}`))
    process.exit(1)
  }

  console.log(
    hernoemd.length
      ? `Hosting-klaar: ${hernoemd.length} mappen hernoemd (${hernoemd.join(', ')}), ${aangepast} bestanden bijgewerkt.`
      : 'Hosting-klaar: geen blokhaken gevonden.',
  )

  laatOpnamesMetRust()
  lessenVoorDeTeller()
  stempelDeCacheversie()
  vooraadOffline()
  controleerDeelplaatjes()
  controleerSitemap()
}

/**
 * Elke URL in sitemap.xml moet een echte pagina zijn die zichzelf als canonical noemt en
 * niet op noindex staat. Zo niet, dan zegt de sitemap tegen Google "indexeer dit" en de
 * pagina zelf "niet mij": Google gelooft dan geen van beide. Pas na het hernoemen van
 * de blokhaakmappen, want daarvoor staan de lespagina's nog op de verkeerde plek.
 */
export function sitemapFouten(uit: string): string[] {
  const bestand = join(uit, 'sitemap.xml')
  if (!existsSync(bestand)) return ['geen sitemap.xml']
  const urls = [...readFileSync(bestand, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])
  if (!urls.length) return ['sitemap.xml is leeg']
  const fouten: string[] = []
  for (const url of urls) {
    const pagina = join(uit, new URL(url).pathname, 'index.html')
    if (!existsSync(pagina)) {
      fouten.push(`${url}: bestaat niet`)
      continue
    }
    const html = readFileSync(pagina, 'utf8')
    const canonical = canonicalVan(html)
    if (canonical !== url) fouten.push(`${url}: canonical is ${canonical ?? 'leeg'}`)
    if (staatOpNoindex(html)) fouten.push(`${url}: staat op noindex`)
  }
  // En andersom: een pagina die zichzelf als canonical noemt en niet op noindex staat,
  // wil gevonden worden, dus hoort hij in de sitemap. Een nieuwe pagina dieper in de
  // boom (zoals /schaakclub/den-haag/) ontsnapte anders aan tests/sitemap.test.ts.
  const inSitemap = new Set(urls)
  const origin = new URL(urls[0]).origin
  for (const html of alleBestanden(uit).filter((b) => b.endsWith('index.html'))) {
    const tekst = readFileSync(html, 'utf8')
    const canonical = canonicalVan(tekst)
    if (!canonical || staatOpNoindex(tekst)) continue
    const eigen = `${origin}${html.slice(uit.length).replace(/index\.html$/, '')}`
    if (canonical === eigen && !inSitemap.has(eigen)) fouten.push(`${eigen}: wil gevonden worden, maar staat niet in de sitemap`)
  }
  // En wat de bezoeker ziet: de pagina /sitemap/ moet elke pagina uit sitemap.xml linken.
  const leesbaar = join(uit, 'sitemap', 'index.html')
  if (existsSync(leesbaar)) {
    const html = readFileSync(leesbaar, 'utf8')
    for (const url of urls) {
      const pad = new URL(url).pathname
      if (pad !== '/sitemap/' && !html.includes(`href="${pad}"`)) fouten.push(`${url}: ontbreekt op de pagina /sitemap/`)
    }
  }
  return fouten
}

/** De canonical van een pagina, ongeacht de volgorde van de attributen. */
function canonicalVan(html: string): string | undefined {
  const tag = html.match(/<link\b[^>]*\brel="canonical"[^>]*>/)?.[0]
  return tag?.match(/\bhref="([^"]+)"/)?.[1]
}

/** Staat er ergens een robots-meta met noindex, ongeacht de volgorde van de attributen? */
function staatOpNoindex(html: string): boolean {
  return [...html.matchAll(/<meta\b[^>]*\bname="robots"[^>]*>/g)].some((m) => /noindex/.test(m[0]))
}

function controleerSitemap() {
  const fouten = sitemapFouten(UIT)
  if (fouten.length) {
    console.error('De sitemap klopt niet met de pagina\'s:')
    fouten.slice(0, 10).forEach((f) => console.error(`  ${f}`))
    if (fouten.length > 10) console.error(`  … en ${fouten.length - 10} meer`)
    process.exit(1)
  }
  const aantal = readFileSync(join(UIT, 'sitemap.xml'), 'utf8').split('<loc>').length - 1
  console.log(`Hosting-klaar: sitemap gecontroleerd, ${aantal} pagina's bestaan en mogen gevonden worden.`)
}

/**
 * Zet de datum van deze uitrol in de service worker.
 *
 * In `public/sw.js` stond `const CACHE = 'schaakmaatje-...'` met een datum erin en het
 * verzoek eronder om die met de hand bij te werken. Dat is precies één keer goed
 * gegaan: de versie die op schaakmaatje.nl staat is van 5 september, terwijl er sinds
 * die dag drie keer een nieuwe zip overheen is gegaan.
 *
 * Zolang die naam gelijk blijft, ruimt het activate-blok van de service worker niets
 * op en blijven alle oude `_next/static`-brokken van elke vorige uitrol op de tablet
 * van het kind staan. De app zelf raakt niet achterop — pagina's worden netwerk-eerst
 * opgehaald en de brokken hebben een hash in hun naam — maar het is rommel die nooit
 * meer weggaat, en op een schooltablet met weinig ruimte telt dat.
 *
 * Een taak die de mens bij elke uitrol moet onthouden, is een taak die vergeten wordt.
 * Dus doet het bouwscript het nu.
 */
function stempelDeCacheversie() {
  const pad = join(UIT, 'sw.js')
  if (!existsSync(pad)) return
  const inhoud = readFileSync(pad, 'utf8')
  // De datum plus het tijdstip: twee zips op dezelfde dag zijn eerder regel dan
  // uitzondering geweest, en dan moet de naam alsnog verschillen.
  const nu = new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '')
  const uit = inhoud.replace(/const CACHE = '[^']*'/, `const CACHE = 'schaakmaatje-${nu}'`)
  if (uit === inhoud) {
    console.error('Hosting-klaar: geen CACHE-regel gevonden in sw.js. Is hij hernoemd?')
    process.exit(1)
  }
  writeFileSync(pad, uit)
  console.log(`Hosting-klaar: service worker gestempeld als schaakmaatje-${nu}.`)
}

/**
 * Haal lege audiomappen uit de uitvoer, zodat ze de opnames op de server niet slopen.
 *
 * De mp3's staan met opzet niet in git — ze horen bij de release, niet bij de broncode.
 * Maar `public/audio/manifest.json` staat er wél in, als leeg `{}`, en die kwam dus in
 * elke zip terecht. Wie de zip over zijn webmap uitpakte, overschreef daarmee het
 * manifest van de opnames die er al stonden: de app dacht vanaf dat moment dat er niets
 * ingesproken was en viel terug op de stem van het apparaat. Twee minuten uploaden om
 * negenduizend credits aan opnames onbruikbaar te maken.
 *
 * Is er niets ingesproken, dan hoort er ook niets in de zip te zitten. Ontbreekt het
 * manifest, dan valt de app netjes terug op de apparaatstem — precies wat hij zonder
 * opnames toch al doet. Staan er wél opnames, dan blijft alles staan en gaat het
 * gewoon mee.
 */
function laatOpnamesMetRust() {
  for (const map of ['audio', 'sfx']) {
    const pad = join(UIT, map)
    const manifest = join(pad, 'manifest.json')
    if (!existsSync(manifest)) continue
    let leeg = false
    try {
      leeg = Object.keys(JSON.parse(readFileSync(manifest, 'utf8'))).length === 0
    } catch {
      leeg = true
    }
    if (!leeg) {
      console.log(`Hosting-klaar: ${map}/ bevat opnames en gaat mee.`)
      continue
    }
    rmSync(pad, { recursive: true, force: true })
    console.log(
      `Hosting-klaar: ${map}/ was leeg en is uit de uitvoer gehaald, zodat het ` +
        `de opnames op de server niet overschrijft.`,
    )
  }
}

/**
 * De lessen in de volgorde van de app, voor het dashboard van de teller (teller/
 * dashboard.php). Zonder dit staan daar alleen id's als "toren-1", in willekeurige volgorde.
 */
function lessenVoorDeTeller() {
  const map = join(UIT, 'teller')
  if (!existsSync(map)) return
  const lessen = WERELDEN.flatMap((w) => w.lessen.map((l) => ({ id: l.id, titel: l.titel, wereld: w.naam })))
  writeFileSync(join(map, 'lessen.json'), JSON.stringify(lessen))
  console.log(`Hosting-klaar: ${lessen.length} lessen klaargezet voor het dashboard van de teller.`)
}

// Alleen draaien als het script zelf gestart wordt, niet als de test hem importeert.
if (process.argv[1]?.includes('hosting-klaar')) main()

/**
 * Wereld 0 tot en met 2 offline, al bij het eerste bezoek.
 *
 * De service worker bewaarde alleen wat het kind al gezien had. Hier zoeken we per
 * pagina (startpagina, kaart, elke les van wereld 0–2 en hun minispellen) de HTML, het
 * RSC-bestand voor navigeren binnen de app, en alle _next/static-bestanden en lettertypen
 * die erin genoemd worden, en zetten die lijst in out/sw.js. Afgeleid uit de uitvoer
 * zelf, dus een nieuwe les of een ander brokje komt vanzelf mee.
 */
function vooraadOffline() {
  const sw = join(UIT, 'sw.js')
  if (!existsSync(sw)) return
  const werelden = WERELDEN.filter((w) => w.nummer <= 2)
  const paginas = [
    '',
    'kaart/',
    ...werelden.flatMap((w) => w.lessen.map((l) => `les/${l.id}/`)),
    ...werelden.flatMap((w) => (w.minispel ? [`spel/${w.minispel}/`] : [])),
  ]
  const basis = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/^\/|\/$/g, '')
  const relatief = (url: string) => {
    let u = url.replace(/^\//, '')
    if (basis && u.startsWith(basis + '/')) u = u.slice(basis.length + 1)
    return u
  }
  const bestanden = new Set<string>()
  const css = new Set<string>()
  for (const pagina of paginas) {
    const html = join(UIT, pagina, 'index.html')
    const txt = join(UIT, pagina, 'index.txt')
    if (!existsSync(html)) {
      console.error(`Hosting-klaar: ${pagina || '/'} ontbreekt voor offline.`)
      process.exit(1)
    }
    bestanden.add(pagina === '' ? './' : `./${pagina}`)
    const inhoud = readFileSync(html, 'utf8') + (existsSync(txt) ? readFileSync(txt, 'utf8') : '')
    if (existsSync(txt)) bestanden.add(`./${pagina}index.txt`)
    for (const m of inhoud.matchAll(/(?:\/[\w.-]+)*\/?_next\/static\/[^"'\s,\\)\]]+/g)) {
      const pad = relatief(m[0])
      bestanden.add(`./${pad.replace(/^.*?_next\//, '_next/')}`)
      if (pad.endsWith('.css')) css.add(pad.replace(/^.*?_next\//, '_next/'))
    }
    // In het RSC-bestand staan brokjes zonder _next ervoor: "static/chunks/…".
    for (const m of inhoud.matchAll(/"(static\/(?:chunks|css|media)\/[^"\\]+)\\?"/g)) bestanden.add(`./_next/${m[1]}`)
  }
  // Lettertypen en plaatjes die alleen vanuit de CSS genoemd worden.
  for (const c of css) {
    const pad = join(UIT, c)
    if (!existsSync(pad)) continue
    for (const m of readFileSync(pad, 'utf8').matchAll(/url\(([^)]+)\)/g)) {
      const u = m[1].replace(/["']/g, '')
      if (u.startsWith('data:')) continue
      bestanden.add(`./${relatief(u.startsWith('/') ? u : '_next/static/css/' + u).replace(/^\.\.\//, '_next/static/')}`)
    }
  }
  // De illustraties: alle Pips en wapens (klein, overal te zien) en de kaartstroken van
  // wereld 0–2. Ze staan in geen HTML of CSS, dus het zoeken hierboven vond ze niet, en
  // offline was Pip een lege cirkel (37e review).
  for (const map of ['pip', 'werelden']) {
    const pad = join(UIT, 'illustraties', map)
    if (existsSync(pad)) for (const f of readdirSync(pad)) bestanden.add(`./illustraties/${map}/${f}`)
  }
  for (const w of werelden) for (const d of ['', '-donker']) bestanden.add(`./illustraties/kaart/kaart-${w.id}${d}.svg`)
  // Alleen wat echt bestaat; een verkeerd pad zou de installatie stil een gat laten.
  const lijst = [...bestanden].filter((b) => b === './' || existsSync(join(UIT, b.replace(/^\.\//, '').replace(/\/$/, '/index.html'))))
  const weg = [...bestanden].filter((b) => !lijst.includes(b))
  // Genoemd maar niet gevonden is een fout in het zoeken, en dan heeft offline een gat.
  if (weg.length) {
    console.error(`Hosting-klaar: offline-voorraad noemt bestanden die niet bestaan: ${weg.slice(0, 5).join(', ')}`)
    process.exit(1)
  }
  // Elke pagina moet minstens HTML en RSC hebben; bij een Next-upgrade kan het zoeken
  // naar brokjes stil niets meer vinden.
  if (![...lijst].some((b) => b.includes('/_next/static/chunks/'))) {
    console.error('Hosting-klaar: geen enkel JS-brokje gevonden voor offline. Is de uitvoer van Next veranderd?')
    process.exit(1)
  }
  const inhoud = readFileSync(sw, 'utf8')
  const uit = inhoud.replace('const VOORAF = []', `const VOORAF = ${JSON.stringify(lijst)}`)
  if (uit === inhoud) {
    console.error('Hosting-klaar: geen VOORAF-regel gevonden in sw.js.')
    process.exit(1)
  }
  writeFileSync(sw, uit)
  const kb = Math.round(
    lijst.reduce((n, b) => {
      const p = join(UIT, b.replace(/^\.\//, '').replace(/\/$/, '/index.html'))
      return n + (b === './' ? statSync(join(UIT, 'index.html')).size : existsSync(p) ? statSync(p).size : 0)
    }, 0) / 1024,
  )
  console.log(`Hosting-klaar: ${paginas.length} pagina's van wereld 0–2 offline, ${lijst.length} bestanden, ${kb} kB${weg.length ? ` (${weg.length} genoemd maar niet gevonden: ${weg.slice(0, 4).join(', ')})` : ''}.`)
}

/**
 * Elk deelplaatje (og:image) moet echt bestaan. Een pagina die naar een plaatje wijst
 * dat er niet is, geeft in WhatsApp een kale link zonder beeld, en dat merk je pas als
 * een ouder hem doorstuurt.
 */
function controleerDeelplaatjes() {
  const fout: string[] = []
  let geteld = 0
  const basis = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/^\/|\/$/g, '')
  for (const b of alleBestanden(UIT)) {
    if (!b.endsWith('.html')) continue
    const html = readFileSync(b, 'utf8')
    // og:image én twitter:image, en in welke volgorde Next de attributen ook zet.
    for (const m of html.matchAll(/<meta[^>]*(?:property="og:image"|name="twitter:image")[^>]*>/g)) {
      const inhoud = m[0].match(/content="([^"]+)"/)?.[1]
      if (!inhoud) continue
      geteld++
      let pad = new URL(inhoud, 'https://schaakmaatje.nl').pathname.replace(/^\//, '')
      if (basis) {
        if (!pad.startsWith(basis + '/')) {
          fout.push(`${b.slice(UIT.length)} → ${inhoud} (zonder ${basis}/)`)
          continue
        }
        pad = pad.slice(basis.length + 1)
      }
      if (!existsSync(join(UIT, pad))) fout.push(`${b.slice(UIT.length)} → ${inhoud}`)
    }
  }
  if (geteld === 0) {
    console.error('Hosting-klaar: geen enkel deelplaatje gevonden in de HTML. Is de uitvoer van Next veranderd?')
    process.exit(1)
  }
  if (fout.length) {
    console.error(`Hosting-klaar: deelplaatjes die niet bestaan:\n  ${fout.slice(0, 5).join('\n  ')}`)
    process.exit(1)
  }
  console.log(`Hosting-klaar: ${geteld} deelplaatjes nagekeken, alle bestaan.`)
}
