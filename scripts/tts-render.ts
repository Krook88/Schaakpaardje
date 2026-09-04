/**
 * Spreekt alle zinnen van Pip in met ElevenLabs.
 *
 *   ELEVENLABS_API_KEY=... npm run audio:render
 *   npm run audio:render -- --dry     # alleen laten zien wat er zou gebeuren
 *   npm run audio:render -- --force   # alles opnieuw, ook wat er al staat
 *
 * Alleen nieuwe of gewijzigde zinnen worden gerenderd: de bestandsnaam is een hash van
 * de zin zelf, dus wie een zin aanpast krijgt automatisch een nieuw bestand en de oude
 * blijft ongebruikt achter (opruimen doet --prune).
 *
 * De gerenderde mp3's staan bewust NIET in git (zie .gitignore): ze horen bij de
 * release, niet bij de broncode. Zet ze bij het deployen in public/audio/.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { alleZinnen } from '../src/content/validate'
import { zinSleutel } from '../src/audio/voice'
import * as pip from '../src/content/voice'

/** Pips stem. Vervangen? Zet ELEVENLABS_VOICE_ID in de omgeving. */
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'W53kY7bMM00QTmJradZg'
const MODEL = process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2'
const UITVOER = join(process.cwd(), 'public', 'audio')
const MANIFEST = join(UITVOER, 'manifest.json')

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const force = args.includes('--force')
const prune = args.includes('--prune')

/** Alles wat Pip kan zeggen: de lescontent plus de losse feedbackzinnen. */
function alleTeksten(): string[] {
  const uit = new Set<string>(alleZinnen())
  for (const waarde of Object.values(pip)) {
    if (typeof waarde === 'string') uit.add(waarde)
    else if (Array.isArray(waarde)) waarde.forEach((z) => typeof z === 'string' && uit.add(z))
  }
  uit.delete('Pip')
  return [...uit].filter((z) => z.trim().length > 1)
}

async function rendeer(tekst: string, sleutel: string, apiKey: string): Promise<number> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: tekst,
        model_id: MODEL,
        // Rustig en warm: kinderstemmen mogen niet schril of gehaast klinken.
        voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true },
      }),
    },
  )
  if (!res.ok) {
    throw new Error(`ElevenLabs gaf ${res.status}: ${(await res.text()).slice(0, 200)}`)
  }
  const buffer = Buffer.from(await res.arrayBuffer())
  writeFileSync(join(UITVOER, `${sleutel}.mp3`), buffer)
  return buffer.byteLength
}

async function main() {
  const teksten = alleTeksten()
  mkdirSync(UITVOER, { recursive: true })

  const manifest: Record<string, { tekst: string; bytes: number }> =
    existsSync(MANIFEST) && !force ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}

  const teDoen = teksten.filter((tekst) => {
    const sleutel = zinSleutel(tekst)
    if (force) return true
    return !manifest[sleutel] || !existsSync(join(UITVOER, `${sleutel}.mp3`))
  })

  const tekens = teDoen.reduce((n, t) => n + t.length, 0)
  console.log(`${teksten.length} zinnen in de content, ${teDoen.length} nog in te spreken.`)
  console.log(`Dat is ${tekens} tekens — bij ElevenLabs ongeveer ${tekens} credits.`)
  if (dry) {
    teDoen.slice(0, 10).forEach((t) => console.log(`  · ${t}`))
    if (teDoen.length > 10) console.log(`  … en nog ${teDoen.length - 10}`)
    return
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    console.error('Zet ELEVENLABS_API_KEY in de omgeving (bijvoorbeeld in .env.local).')
    process.exit(1)
  }

  let klaar = 0
  for (const tekst of teDoen) {
    const sleutel = zinSleutel(tekst)
    try {
      const bytes = await rendeer(tekst, sleutel, apiKey)
      manifest[sleutel] = { tekst, bytes }
      klaar++
      console.log(`  ✓ ${sleutel}  ${tekst.slice(0, 60)}`)
    } catch (e) {
      console.error(`  ✗ ${tekst.slice(0, 60)}: ${(e as Error).message}`)
      break // bij een fout (quotum, sleutel) heeft doorgaan geen zin
    }
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2))
  }

  if (prune) {
    const geldig = new Set(teksten.map(zinSleutel))
    for (const bestand of readdirSync(UITVOER)) {
      if (!bestand.endsWith('.mp3')) continue
      const sleutel = bestand.replace(/\.mp3$/, '')
      if (!geldig.has(sleutel)) {
        unlinkSync(join(UITVOER, bestand))
        delete manifest[sleutel]
        console.log(`  – opgeruimd: ${bestand}`)
      }
    }
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2))
  }

  console.log(`Klaar. ${klaar} zinnen ingesproken, manifest bijgewerkt.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
