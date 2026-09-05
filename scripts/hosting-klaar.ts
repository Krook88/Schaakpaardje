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
import { readdirSync, renameSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

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

function main() {
  if (!existsSync(UIT)) {
    console.error('Geen out/ gevonden. Draai eerst next build.')
    process.exit(1)
  }

  const hernoemd: string[] = []
  for (const pad of mappenMetBlokhaken(UIT)) {
    const naam = pad.slice(pad.lastIndexOf('/') + 1)
    const schoon = naam.slice(1, -1)
    const doel = join(pad.slice(0, pad.lastIndexOf('/')), schoon)
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
}

main()
