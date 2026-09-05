/**
 * Spreekt het script alles in wat de app ook echt zegt?
 *
 *   npm run audio:dekking
 *
 * De sleutel van een opname is een hash van de zin zelf. Dat is prettig — wie een zin
 * aanpast krijgt vanzelf een nieuw bestand — maar het betekent ook dat een zin die
 * nérgens in `alleZinnen()` zit, nooit een opname krijgt en dus voor altijd door de
 * apparaatstem wordt uitgesproken. Dat verschil hoor je meteen: de ene zin is Pip, de
 * volgende is een robot.
 *
 * Zulke zinnen glippen er makkelijk in, want ze staan in een scherm en niet in de
 * content. Deze controle vindt ze, zodat je het weet vóór je dertigduizend credits
 * uitgeeft in plaats van erna.
 *
 * Twee soorten bevindingen:
 *
 *   VAST         een letterlijke zin in een scherm die niet ingesproken wordt.
 *                Op te lossen: verhuis hem naar src/content/voice.ts, dan pakt het
 *                renderscript hem vanzelf mee.
 *
 *   SAMENGESTELD een zin met een naam of lestitel erin (`Hoi ${naam}!`). Die kán niet
 *                ingesproken worden, want de tekst staat pas vast op het moment zelf.
 *                Dat is geen fout, maar je moet het weten: deze blijven altijd de
 *                apparaatstem gebruiken.
 *
 * Het is een tekstuele controle, geen echte ontleding van de code. Hij kan iets missen
 * dat heel exotisch geschreven is; hij verzint niets.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { alleZinnen } from '../src/content/validate'
import * as pip from '../src/content/voice'

const BRON = join(process.cwd(), 'src')

/** Precies wat scripts/tts-render.ts inspreekt. */
function ingesproken(): Set<string> {
  const uit = new Set<string>(alleZinnen())
  for (const waarde of Object.values(pip)) {
    if (typeof waarde === 'string') uit.add(waarde)
    else if (Array.isArray(waarde)) waarde.forEach((z) => typeof z === 'string' && uit.add(z))
  }
  return uit
}

function bestanden(map: string): string[] {
  const uit: string[] = []
  for (const naam of readdirSync(map)) {
    const pad = join(map, naam)
    if (statSync(pad).isDirectory()) uit.push(...bestanden(pad))
    else if (/\.tsx?$/.test(pad)) uit.push(pad)
  }
  return uit
}

type Vondst = { bestand: string; regel: number; tekst: string; samengesteld: boolean }

/**
 * Alles wat als gesproken tekst het scherm in gaat: `zegt=`, `setZin(` en `speak(`.
 * De aanhalingstekens mogen enkel, dubbel of backtick zijn.
 */
const PATRONEN = [
  /\bzegt=\{?\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g,
  /\bsetZin\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g,
  /\bspeak\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g,
]

function zoekZinnen(): Vondst[] {
  const uit: Vondst[] = []
  for (const bestand of bestanden(BRON)) {
    // De bron van de zinnen zelf slaan we over: die wordt per definitie ingesproken.
    if (bestand.endsWith(join('content', 'voice.ts'))) continue
    const inhoud = readFileSync(bestand, 'utf8')
    for (const patroon of PATRONEN) {
      patroon.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = patroon.exec(inhoud))) {
        const tekst = m[2].trim()
        if (tekst.length < 6) continue
        uit.push({
          bestand: bestand.slice(BRON.length + 1),
          regel: inhoud.slice(0, m.index).split('\n').length,
          tekst,
          samengesteld: tekst.includes('${'),
        })
      }
    }
  }
  return uit
}

function main() {
  const bekend = ingesproken()
  const vondsten = zoekZinnen()

  const vast = vondsten.filter((v) => !v.samengesteld && !bekend.has(v.tekst))
  const samengesteld = vondsten.filter((v) => v.samengesteld)

  console.log(`${bekend.size} zinnen worden ingesproken.`)
  console.log(`${vondsten.length} gesproken zinnen gevonden in de schermen.`)
  console.log()

  if (vast.length) {
    console.log(`${vast.length} zin(nen) worden uitgesproken maar NIET ingesproken:`)
    for (const v of vast) console.log(`  ✗ ${v.bestand}:${v.regel}  "${v.tekst}"`)
    console.log('  → verhuis ze naar src/content/voice.ts, dan pakt het renderscript ze mee.')
    console.log()
  } else {
    console.log('Elke vaste zin in de schermen wordt ook ingesproken.')
    console.log()
  }

  if (samengesteld.length) {
    console.log(`${samengesteld.length} zin(nen) worden ter plekke samengesteld en blijven de apparaatstem gebruiken:`)
    for (const v of samengesteld) console.log(`  · ${v.bestand}:${v.regel}  "${v.tekst.slice(0, 70)}"`)
    console.log()
  }

  if (vast.length) process.exit(1)
}

main()
