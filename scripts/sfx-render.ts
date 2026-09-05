/**
 * De bordgeluiden ophalen bij ElevenLabs Sound Effects.
 *
 *   ELEVENLABS_API_KEY=... npm run sfx:render
 *   npm run sfx:render -- --dry     # alleen laten zien wat er gevraagd wordt
 *   npm run sfx:render -- --force   # alles opnieuw
 *
 * De app werkt hier prima zonder: `src/audio/sfx.ts` synthetiseert dezelfde geluiden
 * met de Web Audio API, en dat kost nul kilobytes. Maar die piepjes klinken als een
 * rekenmachine uit 1985, en voor een kind is het verschil tussen een piepje en een
 * houten stuk dat op een bord tikt behoorlijk groot.
 *
 * Net als bij Pips stem geldt: staat het bestand er, dan wordt het gebruikt; staat het
 * er niet, dan valt de app terug op de synthese. Je kunt er dus ook een paar doen.
 *
 * Over de prompts hieronder: het zijn geluiden die tientallen keren per les klinken.
 * Kort, zacht en zonder scherpe aanzet is daarom belangrijker dan spannend. Vooral
 * 'fout' — dat hoort een kind het vaakst, en het mag nooit als een afkeuring klinken.
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const UITVOER = join(process.cwd(), 'public', 'sfx')
const MANIFEST = join(UITVOER, 'manifest.json')

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const force = args.includes('--force')

type Geluid = { naam: string; prompt: string; seconden: number }

const GELUIDEN: Geluid[] = [
  {
    naam: 'tik',
    seconden: 0.5,
    prompt:
      'A single very short, soft wooden tick. Picking up a wooden chess piece from a wooden board. Dry, quiet, no reverb, no music.',
  },
  {
    naam: 'zet',
    seconden: 0.6,
    prompt:
      'A wooden chess piece being placed down firmly on a wooden board. One single soft knock. Warm and dry, no reverb, no music.',
  },
  {
    naam: 'slaan',
    seconden: 0.8,
    prompt:
      'One wooden chess piece knocking another off the board: a soft wooden clack with a tiny slide afterwards. Playful, not violent. No music.',
  },
  {
    naam: 'goed',
    seconden: 1.0,
    prompt:
      'A short, warm, friendly two-note rising chime on a soft marimba. Cheerful and gentle, for a small child who did something right. No reverb tail, no melody beyond two notes.',
  },
  {
    naam: 'fout',
    seconden: 0.8,
    prompt:
      'A soft, low, friendly wooden bloop going slightly downward. Gentle and encouraging, never harsh or buzzing. The sound of "not quite, try again" for a four-year-old. No music.',
  },
  {
    naam: 'ster',
    seconden: 1.2,
    prompt:
      'A light magical sparkle: a quick upward shimmer of tiny bells, as a gold star appears. Bright but soft, short, no long tail.',
  },
  {
    naam: 'schaak',
    seconden: 0.8,
    prompt:
      'Two short, bright alert notes on a soft wooden block: attention, something is happening. Friendly and light, not alarming. For a child. No music.',
  },
  {
    naam: 'promotie',
    seconden: 1.4,
    prompt:
      'A short rising magical flourish: a pawn becoming a queen. Four ascending sparkly notes, warm and joyful, ending cleanly. No long reverb.',
  },
  {
    naam: 'diploma',
    seconden: 2.0,
    prompt:
      'A short, happy little fanfare for a small child finishing something: warm brass and a light sparkle, cheerful and gentle. Two seconds, ending cleanly.',
  },
]

async function rendeer(g: Geluid, apiKey: string): Promise<number> {
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({
      text: g.prompt,
      duration_seconds: g.seconden,
      // Hoog: we willen de prompt volgen, niet de fantasie van het model.
      prompt_influence: 0.6,
    }),
  })
  if (!res.ok) throw new Error(`ElevenLabs gaf ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  writeFileSync(join(UITVOER, `${g.naam}.mp3`), buffer)
  return buffer.byteLength
}

async function main() {
  mkdirSync(UITVOER, { recursive: true })
  const manifest: Record<string, { bytes: number }> =
    existsSync(MANIFEST) && !force ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}

  const teDoen = GELUIDEN.filter(
    (g) => force || !manifest[g.naam] || !existsSync(join(UITVOER, `${g.naam}.mp3`)),
  )
  console.log(`${GELUIDEN.length} bordgeluiden, ${teDoen.length} nog op te halen.`)
  console.log('Sound Effects rekent per aanroep af, niet per teken — dit is dus goedkoop.')

  if (dry) {
    for (const g of teDoen) console.log(`  · ${g.naam} (${g.seconden}s): ${g.prompt.slice(0, 80)}…`)
    return
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    console.error('Zet ELEVENLABS_API_KEY in de omgeving.')
    process.exit(1)
  }

  for (const g of teDoen) {
    try {
      const bytes = await rendeer(g, apiKey)
      manifest[g.naam] = { bytes }
      console.log(`  ✓ ${g.naam}  ${(bytes / 1024).toFixed(0)} kB`)
    } catch (e) {
      console.error(`  ✗ ${g.naam}: ${(e as Error).message}`)
      break
    }
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2))
  }
  console.log('Klaar. Luister ze even na in public/sfx/ voor je bouwt.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
