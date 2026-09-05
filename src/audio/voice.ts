'use client'

/**
 * De stem van Pip.
 *
 * In productie is elke zin een vooraf gerenderd mp3-bestand: geen wachttijd, werkt
 * offline, en we horen elke regel voordat een kind hem hoort. Zie scripts/tts-render.ts.
 *
 * De sleutel van een zin is een hash van de zin zelf. Daardoor bestaat het klassieke
 * probleem "sleutel in de code, geen bestand op de schijf" niet: wie een zin aanpast,
 * krijgt automatisch een nieuwe sleutel, en het renderscript ziet dat er één bijgekomen is.
 *
 * Zolang een zin nog niet ingesproken is, valt de app terug op de Nederlandse stem van
 * het apparaat zelf (Web Speech API). Daarmee is de app vanaf dag één te testen, maar de
 * kwaliteit verschilt per toestel — het is dus geen productie-oplossing.
 */

type Config = { spraak: boolean; tempo: number; ondertiteling: boolean }

const config: Config = { spraak: true, tempo: 1, ondertiteling: true }

let manifest: Record<string, unknown> | null = null
let manifestGeladen = false
let huidigeAudio: HTMLAudioElement | null = null
let ondertitelListener: ((tekst: string | null) => void) | null = null
let stemmenGeladen = false

/** Waar de app gehost wordt. Leeg = domeinwortel; zet NEXT_PUBLIC_BASE_PATH als de
 *  app in een submap staat. Zonder dit zoekt de browser audio onder de huidige route. */
const BASIS = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** Stabiele sleutel voor een zin (djb2, hex). Ook gebruikt door scripts/tts-render.ts. */
export function zinSleutel(tekst: string): string {
  let h = 5381
  const genormaliseerd = tekst.trim().replace(/\s+/g, ' ')
  for (let i = 0; i < genormaliseerd.length; i++) {
    h = ((h << 5) + h + genormaliseerd.charCodeAt(i)) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

export function setVoiceConfig(next: Partial<Config>) {
  Object.assign(config, next)
  if (!config.spraak) stopSpeaking()
}

export function getVoiceConfig(): Config {
  return { ...config }
}

export function onSubtitle(fn: ((tekst: string | null) => void) | null) {
  ondertitelListener = fn
}

async function laadManifest() {
  if (manifestGeladen) return
  manifestGeladen = true
  try {
    // Geen force-cache: de service worker doet voor dit bestand al netwerk-eerst
    // (public/sw.js), en force-cache pakt de HTTP-cache ook als die verlopen is.
    // Dan blijft een kind na een nieuwe opname op het oude manifest hangen en valt
    // elke nieuwe zin terug op de apparaatstem.
    const res = await fetch(`${BASIS}/audio/manifest.json`, { cache: 'no-cache' })
    if (res.ok) manifest = await res.json()
  } catch {
    manifest = null // nog niets ingesproken: we gebruiken de stem van het apparaat
  }
}

export function stopSpeaking() {
  if (huidigeAudio) {
    huidigeAudio.pause()
    huidigeAudio = null
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
  ondertitelListener?.(null)
}

function nederlandseStem(): SpeechSynthesisVoice | null {
  const stemmen = window.speechSynthesis.getVoices()
  const nl = stemmen.filter((v) => v.lang?.toLowerCase().startsWith('nl'))
  return nl.find((v) => /female|vrouw|ellen|lotte|fenna|colette/i.test(v.name)) ?? nl[0] ?? null
}

/** Kiest één van meerdere varianten. Nooit twee keer achter elkaar dezelfde. */
const laatsteKeuze = new Map<string, number>()
export function kies(varianten: readonly string[], groep = 'algemeen'): string {
  if (varianten.length === 1) return varianten[0]
  const vorige = laatsteKeuze.get(groep)
  let i = Math.floor(Math.random() * varianten.length)
  if (i === vorige) i = (i + 1) % varianten.length
  laatsteKeuze.set(groep, i)
  return varianten[i]
}

/**
 * Spreekt een zin uit. Breekt een lopende zin netjes af — wat het kind nú doet is
 * altijd belangrijker dan wat Pip nog aan het zeggen was.
 */
export async function speak(tekst: string): Promise<void> {
  if (!tekst) return
  stopSpeaking()
  if (config.ondertiteling) ondertitelListener?.(tekst)
  if (!config.spraak || typeof window === 'undefined') return

  await laadManifest()
  const sleutel = zinSleutel(tekst)

  if (manifest && sleutel in manifest) {
    try {
      const audio = new Audio(`${BASIS}/audio/${sleutel}.mp3`)
      audio.playbackRate = config.tempo
      huidigeAudio = audio
      await audio.play()
      return
    } catch {
      // val door naar de stem van het apparaat
    }
  }

  if (!('speechSynthesis' in window)) return
  if (!stemmenGeladen) {
    // Safari en Chrome leveren de stemmenlijst pas asynchroon aan.
    stemmenGeladen = true
    window.speechSynthesis.getVoices()
  }
  const zin = new SpeechSynthesisUtterance(tekst)
  zin.lang = 'nl-NL'
  zin.rate = 0.95 * config.tempo
  zin.pitch = 1.15
  const stem = nederlandseStem()
  if (stem) zin.voice = stem
  window.speechSynthesis.speak(zin)
}

/** Spreekt één willekeurige variant uit een lijstje uit. */
export function speakOne(varianten: readonly string[], groep?: string): Promise<void> {
  return speak(kies(varianten, groep))
}
