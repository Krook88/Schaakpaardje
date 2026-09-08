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
 * Ziet dit eruit als iets wat Pip zou zeggen, en niet als een sleutel of een klasse?
 *
 * `setZin('vraag' in opgave ? ...)` bevat het woord `vraag`; dat is geen zin. Een zin
 * heeft een spatie en eindigt op een punt, een vraagteken of een uitroepteken.
 */
function lijktOpEenZin(tekst: string): boolean {
  return tekst.length >= 8 && /\s/.test(tekst) && /[.!?]$/.test(tekst.trim())
}

/** De uitdrukking tussen haakjes of accolades, met de nesting mee. */
function tussenHaakjes(inhoud: string, open: number, sluit: string): string {
  const tegenhanger = sluit === ')' ? '(' : '{'
  let diep = 1
  for (let i = open + 1; i < inhoud.length; i++) {
    const teken = inhoud[i]
    if (teken === tegenhanger) diep++
    else if (teken === sluit) {
      diep--
      if (!diep) return inhoud.slice(open + 1, i)
    }
  }
  return ''
}

/**
 * Elke zin die naar Pip gaat, letterlijk of samengesteld.
 *
 * Waarom dit niet meer zoekt naar "een string direct achter setZin(": dat wás de vorige
 * aanpak, en die kon per constructie niets vinden. In deze codebase staat daar nooit een
 * letterlijke zin maar een variabele, een ternair of een sjabloon — `setZin(HINT_GEGEVEN)`,
 * `zegt={zin}`, `speak(`${vak.naam}. Die heb je!`)`. Het script meldde daarom bij élke
 * draai "elke vaste zin wordt ook ingesproken", ook op de dag dat alle vijftien
 * minispellen in de apparaatstem klonken. Een controle die altijd groen is, is erger dan
 * geen controle: hij werd in het commentaar aangehaald als het vangnet dat er niet was.
 *
 * Nu pakt hij de hele uitdrukking achter `speak(`, `setZin(` en `zegt=`, volgt hem één
 * stap terug als het een kale variabele is (`const zin = ...` in hetzelfde bestand), en
 * haalt daar alle zinnen uit — of ze nu tussen aanhalingstekens of tussen accenten
 * staan. Dat is nog steeds tekst lezen en geen echte ontleding, maar het vindt wél wat
 * het belooft te vinden: nagelopen op de stal, en die komt eruit.
 */
function zoekZinnen(): Vondst[] {
  const uit: Vondst[] = []
  const INGANGEN = /\b(?:speak|setZin)\s*\(|\bzegt=\{/g
  const TEKST = /(['"])((?:\\.|(?!\1)[^\r\n])*?)\1|`((?:\\.|[^`])*?)`/g

  for (const bestand of bestanden(BRON)) {
    // De bron van de zinnen zelf slaan we over: die wordt per definitie ingesproken.
    if (bestand.endsWith(join('content', 'voice.ts'))) continue
    const inhoud = readFileSync(bestand, 'utf8')
    const regelVan = (index: number) => inhoud.slice(0, index).split('\n').length

    INGANGEN.lastIndex = 0
    let ingang: RegExpExecArray | null
    while ((ingang = INGANGEN.exec(inhoud))) {
      const open = ingang.index + ingang[0].length - 1
      let expressie = tussenHaakjes(inhoud, open, ingang[0].endsWith('{') ? '}' : ')')

      // Een kale variabele: één stap terugvolgen naar waar hij gemaakt wordt.
      const kaal = expressie.trim().match(/^([A-Za-z_$][\w$]*)$/)
      if (kaal) {
        const maak = inhoud.indexOf(`const ${kaal[1]} =`)
        if (maak >= 0) {
          const eind = inhoud.indexOf('\n\n', maak)
          expressie = inhoud.slice(maak, eind < 0 ? inhoud.length : eind)
        }
      }

      TEKST.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = TEKST.exec(expressie))) {
        const sjabloon = m[3] !== undefined
        const tekst = (sjabloon ? m[3] : m[2]).trim()
        if (!lijktOpEenZin(tekst)) continue
        uit.push({
          bestand: bestand.slice(BRON.length + 1),
          regel: regelVan(ingang.index),
          tekst,
          samengesteld: sjabloon && tekst.includes('${'),
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
