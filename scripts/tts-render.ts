/**
 * Spreekt alle zinnen van Pip in met ElevenLabs.
 *
 *   ELEVENLABS_API_KEY=... npm run audio:render
 *   npm run audio:render -- --dry          # alleen laten zien wat er zou gebeuren
 *   npm run audio:render -- --proef        # een handvol zinnen, om de stem te keuren
 *   npm run audio:render -- --budget 9500  # stop voor je meer dan 9500 credits uitgeeft
 *   npm run audio:render -- --limit 20     # hoogstens twintig zinnen
 *   npm run audio:render -- --force        # alles opnieuw, ook wat er al staat
 *
 * De volgorde is niet willekeurig, en dat is de kern van dit script als je budget krap
 * is. Voorop staan de zinnen die élk kind hoort, hoe ver het ook komt: Pips reacties op
 * goed en fout, de begroetingen, de knoppen. Drieënvijftig zinnen, geen tweeduizend
 * tekens, en samen goed voor het overgrote deel van alles wat er op een dag klinkt.
 * Daarna komen de werelden op volgorde, want een kind begint nu eenmaal bij wereld 0.
 *
 * Zo levert de eerste tienduizend credits een app op waarin alles wat een kind het
 * eerste half jaar tegenkomt is ingesproken, en pas de verre werelden nog niet.
 *
 * Alleen nieuwe of gewijzigde zinnen worden gerenderd: de bestandsnaam is een hash van
 * de zin zelf, dus wie een zin aanpast krijgt automatisch een nieuw bestand en de oude
 * blijft ongebruikt achter (opruimen doet --prune).
 *
 * De gerenderde mp3's staan bewust NIET in git (zie .gitignore): ze horen bij de
 * release, niet bij de broncode. Zet ze bij het deployen in public/audio/.
 */
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
  unlinkSync,
} from 'node:fs'
import { join } from 'node:path'
import { alleZinnen } from '../src/content/validate'
import { vertelTekst } from '../src/content/types'
import { WERELDEN } from '../src/content'
import { zinSleutel } from '../src/audio/voice'
import * as pip from '../src/content/voice'

/**
 * De sleutel uit `.env.local` halen als hij niet al in de omgeving staat.
 *
 * De foutmelding verderop verwees hier al naar, maar niets las dat bestand ooit — wie
 * de sleutel er netjes in zette kreeg gewoon "zet ELEVENLABS_API_KEY in de omgeving".
 *
 * Het is bovendien de veiligere van de twee manieren. `export ELEVENLABS_API_KEY=sk_...`
 * belandt in je shell-geschiedenis en blijft daar staan; een bestand dat in .gitignore
 * staat niet. Handmatig ingelezen, want één regel eigen code is hier minder gedoe dan
 * een pakket erbij.
 */
function laadEnvLocal() {
  const pad = join(process.cwd(), '.env.local')
  if (!existsSync(pad)) return
  for (const regel of readFileSync(pad, 'utf8').split('\n')) {
    const schoon = regel.trim()
    if (!schoon || schoon.startsWith('#')) continue
    const isGelijk = schoon.indexOf('=')
    if (isGelijk < 1) continue
    const naam = schoon.slice(0, isGelijk).trim()
    // Aanhalingstekens eromheen zijn gebruikelijk en horen er niet bij te blijven.
    const waarde = schoon.slice(isGelijk + 1).trim().replace(/^["']|["']$/g, '')
    // Wat al in de omgeving staat wint: een expliciete export moet altijd voorgaan.
    if (!process.env[naam]) process.env[naam] = waarde
  }
}

laadEnvLocal()

/**
 * Pips stem: een vrouwenstem, ontworpen voor deze app — warm, rustig, en enthousiast
 * zonder schril te worden. Vervangen? Zet ELEVENLABS_VOICE_ID in de omgeving.
 *
 * Een stem-ID is geen geheim: zonder de bijbehorende API-sleutel kun je er niets mee.
 * Hij staat hier zodat het script zonder verdere instellingen het juiste doet.
 */
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'qU0HFuyMEybbemwxshYP'
const MODEL = process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2'
const UITVOER = join(process.cwd(), 'public', 'audio')
const MANIFEST = join(UITVOER, 'manifest.json')

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const force = args.includes('--force')
const prune = args.includes('--prune')
const proef = args.includes('--proef')
const getal = (vlag: string) => {
  const i = args.indexOf(vlag)
  const n = i >= 0 ? Number(args[i + 1]) : NaN
  return Number.isFinite(n) && n > 0 ? n : null
}
const limiet = getal('--limit')
/** Hoogstens zoveel tekens deze ronde. Eén teken is ongeveer één credit. */
const budget = getal('--budget')
/** Zie hieronder: het manifest van de draaiende site als startpunt. */
const tekst = (vlag: string) => {
  const i = args.indexOf(vlag)
  return i >= 0 ? args[i + 1] : null
}
const vanaf = tekst('--vanaf')

/**
 * De proefzinnen: een dwarsdoorsnede van wat Pip de hele dag zegt.
 *
 * Alles inspreken kost ruim dertigduizend credits, en dat wil je niet uitgeven aan een
 * stem die pas bij de vijftigste "bijna!" blijkt te irriteren. Deze zes dekken het
 * bereik: begroeten, uitleggen, opdracht geven, prijzen, corrigeren, belonen. Het zijn
 * echte zinnen uit de app, dus wat je hier rendert hoef je straks niet nog eens te doen.
 *
 * De corrigerende zin is de belangrijkste van de zes. Klinkt die teleurgesteld, dan
 * deugt de stem niet — hoe mooi de rest ook is.
 */
const PROEFZINNEN = [
  'Hoi! Ik ben Pip. Dit is een schaakbord.',
  'Kijk eens: een licht veld, een donker veld, een licht veld. Steeds om en om.',
  'Tik de vier donkere velden op de onderste rij aan.',
  'Hoppa! Precies goed.',
  'Bijna. Kijk nog eens goed.',
  'Drie sterren! Je krijgt er een sticker bij.',
]

type Blok = { naam: string; zinnen: string[] }

/**
 * Alles wat Pip kan zeggen, gegroepeerd en op volgorde van belang.
 *
 * Eerst zijn reacties: die klinken bij elke opgave, in elke wereld, elke dag opnieuw.
 * Daarna de werelden zoals een kind ze tegenkomt. Een zin die in twee werelden staat
 * hoort bij de eerste — die komt immers eerder langs.
 */
function blokken(): Blok[] {
  const gezien = new Set<string>()
  const nieuw = (zinnen: Iterable<string>) =>
    [...zinnen].filter((z) => {
      const schoon = z?.trim()
      if (!schoon || schoon.length < 2 || gezien.has(schoon)) return false
      gezien.add(schoon)
      return true
    })

  // De zinnen voor de oudste groep apart houden, en ná de gewone. Een kind hoort er
  // maar één van de twee sets, en welke hangt van de modus af — wie een budget opgeeft
  // moet dus eerst de set krijgen die iederéén hoort. In het overzicht hieronder zie je
  // meteen wat de tweede toon kost.
  const isOuder = (sleutel: string) => sleutel.endsWith('_OUDER')

  const verzamel = (kies: (sleutel: string) => boolean) => {
    const uit = new Set<string>()
    for (const [sleutel, waarde] of Object.entries(pip)) {
      if (!kies(sleutel)) continue
      if (typeof waarde === 'string') uit.add(waarde)
      else if (Array.isArray(waarde)) waarde.forEach((z) => typeof z === 'string' && uit.add(z))
    }
    uit.delete('Pip')
    return uit
  }

  const uit: Blok[] = [
    { naam: 'Pips reacties en schermzinnen', zinnen: nieuw(verzamel((k) => !isOuder(k))) },
    { naam: 'Pip tegen de oudste groep (8-10)', zinnen: nieuw(verzamel(isOuder)) },
  ]

  for (const wereld of WERELDEN) {
    const zinnen = new Set<string>([wereld.belofte])
    for (const les of wereld.lessen) {
      les.vertel.forEach((z) => zinnen.add(vertelTekst(z)))
      for (const o of [...les.meedoen, ...les.zelf, ...les.toets]) {
        if ('vraag' in o) zinnen.add(o.vraag)
        if ('foutTip' in o && o.foutTip) zinnen.add(o.foutTip)
      }
    }
    uit.push({ naam: `wereld ${wereld.nummer} — ${wereld.naam}`, zinnen: nieuw(zinnen) })
  }

  // Vangnet: staat er ergens nog een zin die alleZinnen() wel kent maar wij niet,
  // dan hoort hij er alsnog bij. Liever achteraan dan vergeten.
  const rest = nieuw(alleZinnen())
  if (rest.length) uit.push({ naam: 'overig', zinnen: rest })
  return uit
}

function alleTeksten(): string[] {
  return blokken().flatMap((b) => b.zinnen)
}

/**
 * Wat er al op de site staat, als startpunt.
 *
 * Dit is verreweg de grootste besparing die dit script kent, en de reden is saai: de
 * mp3's staan met opzet niet in git, dus op een verse kloon is `public/audio/` leeg.
 * Het script kijkt naar dat lege mapje, concludeert dat er niets is ingesproken, en
 * rendert vrolijk alles opnieuw — inclusief de zinnen waar je de vorige keer al voor
 * betaald hebt. Bij deze app is dat bijna tienduizend credits die je twee keer uitgeeft.
 *
 * Met `--vanaf https://schaakmaatje.nl` haalt hij eerst het manifest van de draaiende
 * site op en behandelt alles wat daarin staat als klaar. Er wordt dan alleen
 * ingesproken wat nieuw of veranderd is.
 *
 * De bestanden zelf hoeven daarvoor niet lokaal te staan: het manifest is een lijst van
 * hashes, en de app zoekt de mp3 op de server. Wat dit script schrijft is dus precies
 * de aanvulling — de nieuwe mp3's plus een manifest waar oud én nieuw in staat. Dat
 * mapje zet je erbij op de server; je gooit er niets voor weg.
 */
async function haalOnline(basis: string): Promise<Record<string, { tekst: string; bytes: number }>> {
  const url = `${basis.replace(/\/+$/, '')}/audio/manifest.json`
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.error(`Kon ${url} niet ophalen (${res.status}). Draai zonder --vanaf, of controleer het adres.`)
      process.exit(1)
    }
    const inhoud = (await res.json()) as Record<string, { tekst: string; bytes: number }>
    const aantal = Object.keys(inhoud).length
    if (!aantal) {
      console.error(`${url} is leeg. Dan valt er niets over te slaan — draai zonder --vanaf.`)
      process.exit(1)
    }
    return inhoud
  } catch (e) {
    console.error(`Kon ${url} niet ophalen: ${(e as Error).message}`)
    process.exit(1)
  }
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

  /*
   * Eerst kijken wat er gewoon op schijf ligt.
   *
   * De bestandsnaam ís de hash van de zin, dus een mp3 in dit mapje is het bewijs dat
   * die zin al ingesproken is — het manifest is daar niet voor nodig. Dat is maar goed
   * ook, want `public/audio/manifest.json` stond in git als leeg `{}` en werd bij elke
   * `git pull` over de echte heen gezet. Wie daarna dit script draaide had tweehonderd
   * opnames op schijf staan en sprak ze toch allemaal opnieuw in.
   *
   * Nu wordt het manifest hersteld uit wat er ligt. Het bestand blijft leidend, het
   * manifest is een afgeleide.
   */
  let hersteld = 0
  for (const tekst of teksten) {
    const sleutel = zinSleutel(tekst)
    const bestand = join(UITVOER, `${sleutel}.mp3`)
    if (manifest[sleutel] || !existsSync(bestand)) continue
    manifest[sleutel] = { tekst, bytes: statSync(bestand).size }
    hersteld++
  }
  if (hersteld) {
    console.log(`${hersteld} opnames teruggevonden in public/audio/ en weer in het manifest gezet.`)
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2))
  }

  /** Sleutels die op de server staan maar niet in dit mapje. */
  const online = new Set<string>()
  if (vanaf && !force) {
    const alDaar = await haalOnline(vanaf)
    for (const [sleutel, waarde] of Object.entries(alDaar)) {
      online.add(sleutel)
      manifest[sleutel] ??= waarde
    }
    console.log(`${online.size} zinnen staan al op ${vanaf} en worden overgeslagen.`)
  }

  let teDoen = teksten.filter((tekst) => {
    const sleutel = zinSleutel(tekst)
    if (force) return true
    if (!manifest[sleutel]) return true
    // Staat hij online, dan hoeft het bestand hier niet te liggen.
    return !online.has(sleutel) && !existsSync(join(UITVOER, `${sleutel}.mp3`))
  })

  if (proef) {
    const ontbreekt = PROEFZINNEN.filter((z) => !teksten.includes(z))
    if (ontbreekt.length) {
      console.error('Deze proefzinnen staan niet meer in de content:')
      ontbreekt.forEach((z) => console.error(`  · ${z}`))
      console.error('Pas PROEFZINNEN in dit script aan, anders spreek je iets in dat de app nooit opvraagt.')
      process.exit(1)
    }
    teDoen = PROEFZINNEN.filter((z) => force || teDoen.includes(z))
  }
  if (limiet !== null) teDoen = teDoen.slice(0, limiet)

  // Het budget snijdt af op de zinsgrens: liever negenhonderd credits over dan
  // halverwege stuklopen op een quotum en niet weten wat er wel en niet staat.
  let afgesneden = 0
  if (budget !== null) {
    const past: string[] = []
    let loop = 0
    for (const tekst of teDoen) {
      if (loop + tekst.length > budget) break
      past.push(tekst)
      loop += tekst.length
    }
    afgesneden = teDoen.length - past.length
    teDoen = past
  }

  const tekens = teDoen.reduce((n, t) => n + t.length, 0)
  const alles = teksten.reduce((n, t) => n + t.length, 0)
  console.log(`${teksten.length} zinnen in de content (${alles} tekens in totaal).`)
  console.log(`Nu aan de beurt: ${teDoen.length} zinnen, ${tekens} tekens.`)
  console.log(`Dat kost ongeveer ${tekens} credits bij ElevenLabs.`)
  if (proef) console.log('Proefmodus: alleen de zes keurzinnen.')
  if (limiet !== null) console.log(`Begrensd op ${limiet} zinnen.`)
  if (budget !== null) {
    console.log(`Budget: ${budget} credits — ${afgesneden} zinnen blijven voor een volgende keer.`)
  }

  // Waar de grens valt, per blok. Handig als het budget krap is: dan zie je precies
  // tot welke wereld je komt en wat de volgende ronde kost.
  if (dry) {
    console.log()
    let loop = 0
    // Alleen wat er nog te doen is. Stond hier `new Set(teksten)`, dan telde de tabel
    // ook de zinnen mee die al ingesproken zijn — en dan lees je dat wereld 1 nog
    // 1483 credits kost terwijl hij allang op de server staat.
    const nogTeDoen = new Set(teDoen)
    for (const blok of blokken()) {
      const open = blok.zinnen.filter((z) => nogTeDoen.has(z))
      const tekens = open.reduce((n, z) => n + z.length, 0)
      loop += tekens
      const merk = budget !== null && loop > budget ? '  ← valt buiten het budget' : ''
      console.log(`  ${blok.naam.padEnd(32)} ${String(tekens).padStart(5)} tekens, samen ${String(loop).padStart(6)}${merk}`)
    }
  }
  if (dry) {
    console.log()
    teDoen.slice(0, 6).forEach((t) => console.log(`  · ${t}`))
    if (teDoen.length > 6) console.log(`  … en nog ${teDoen.length - 6}`)
    return
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    console.error('Geen ELEVENLABS_API_KEY gevonden.')
    console.error('Zet hem in .env.local naast package.json:')
    console.error('  ELEVENLABS_API_KEY=sk_jouwsleutel')
    console.error('Of eenmalig in de omgeving: export ELEVENLABS_API_KEY=sk_jouwsleutel')
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

  if (prune && vanaf) {
    // Opruimen kijkt naar de bestanden die hier liggen, en met --vanaf is dat maar een
    // deel van de waarheid: de rest staat op de server. Dan zou hij het manifest
    // leegvegen voor zinnen die het prima doen.
    console.error('--prune en --vanaf gaan niet samen: opruimen kan alleen met alle bestanden erbij.')
    process.exit(1)
  }
  if (prune && !proef && limiet === null) {
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

  const over = teksten.filter((t) => !manifest[zinSleutel(t)]).length
  console.log(`Klaar. ${klaar} zinnen ingesproken, manifest bijgewerkt.`)
  if (vanaf) {
    console.log(
      `In public/audio/ staan nu alleen de nieuwe opnames plus een manifest waar oud én ` +
        `nieuw in staat. Zet die map erbij op de server — niets weggooien.`,
    )
  }
  if (over) {
    const tekens = teksten.filter((t) => !manifest[zinSleutel(t)]).reduce((n, t) => n + t.length, 0)
    console.log(`Nog ${over} zinnen te gaan (${tekens} credits). Draai dit script opnieuw wanneer je wilt.`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
