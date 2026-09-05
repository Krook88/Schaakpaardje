'use client'

/**
 * Bordgeluiden.
 *
 * Twee lagen, in deze volgorde: staat er een opname in public/sfx/, dan speelt die.
 * Zo niet, dan synthetiseert de Web Audio API hetzelfde geluid. Die synthese kost nul
 * kilobytes en werkt altijd, maar klinkt als een rekenmachine uit 1985.
 *
 * Dezelfde afspraak als bij Pips stem, en om dezelfde reden: de app moet volledig
 * werken zonder dat er ook maar één bestand is ingesproken of opgenomen, en beter
 * worden zodra dat wel zo is. Je kunt dus ook een paar geluiden vervangen en de rest
 * laten zoals hij is. Zie scripts/sfx-render.ts.
 */

let ctx: AudioContext | null = null
let aan = true

/** Waar de app gehost wordt; zelfde afspraak als in voice.ts. */
const BASIS = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** Welke geluiden er als opname bestaan. Leeg tot het manifest binnen is. */
let opnames: Record<string, unknown> | null = null
let manifestGeladen = false

async function laadOpnames() {
  if (manifestGeladen || typeof window === 'undefined') return
  manifestGeladen = true
  try {
    const res = await fetch(`${BASIS}/sfx/manifest.json`, { cache: 'no-cache' })
    if (res.ok) opnames = await res.json()
  } catch {
    opnames = null // niets opgenomen: de synthese doet het werk
  }
}

/**
 * Probeert de opname. Lukt dat niet, dan geeft hij false terug en valt de aanroeper
 * terug op de synthese — een kind mag nooit in stilte staan omdat een bestand mist.
 */
function speelOpname(naam: string): boolean {
  if (!aan || !opnames || !(naam in opnames) || typeof window === 'undefined') return false
  try {
    const audio = new Audio(`${BASIS}/sfx/${naam}.mp3`)
    audio.volume = 0.7
    void audio.play().catch(() => {})
    return true
  } catch {
    return false
  }
}

export function setSfxEnabled(waarde: boolean) {
  aan = waarde
  if (waarde) void laadOpnames()
}

function audioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

type Toon = { hz: number; duur: number; vorm?: OscillatorType; volume?: number; vanaf?: number; glij?: number }

function speel(tonen: Toon[]) {
  if (!aan) return
  const context = audioCtx()
  if (!context) return
  const nu = context.currentTime
  for (const t of tonen) {
    const osc = context.createOscillator()
    const gain = context.createGain()
    osc.type = t.vorm ?? 'sine'
    const start = nu + (t.vanaf ?? 0)
    osc.frequency.setValueAtTime(t.hz, start)
    if (t.glij) osc.frequency.exponentialRampToValueAtTime(t.glij, start + t.duur)
    const vol = t.volume ?? 0.14
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + t.duur)
    osc.connect(gain).connect(context.destination)
    osc.start(start)
    osc.stop(start + t.duur + 0.02)
  }
}

export const sfx = {
  tik: () => speelOpname('tik') || speel([{ hz: 320, duur: 0.07, vorm: 'triangle', volume: 0.1 }]),
  zet: () => speelOpname('zet') || speel([{ hz: 180, duur: 0.1, vorm: 'triangle' }]),
  slaan: () => speelOpname('slaan') || speel([{ hz: 140, duur: 0.16, vorm: 'sawtooth', volume: 0.12, glij: 70 }]),
  goed: () => speelOpname('goed') || speel([
      { hz: 523, duur: 0.12 },
      { hz: 659, duur: 0.12, vanaf: 0.1 },
      { hz: 784, duur: 0.2, vanaf: 0.2 },
    ]),
  fout: () => speelOpname('fout') || speel([{ hz: 220, duur: 0.18, vorm: 'sine', volume: 0.09, glij: 165 }]),
  ster: () => speelOpname('ster') || speel([
      { hz: 880, duur: 0.1 },
      { hz: 1175, duur: 0.18, vanaf: 0.09 },
    ]),
  diploma: () => speelOpname('diploma') || speel([
      { hz: 523, duur: 0.15 },
      { hz: 659, duur: 0.15, vanaf: 0.14 },
      { hz: 784, duur: 0.15, vanaf: 0.28 },
      { hz: 1047, duur: 0.35, vanaf: 0.42 },
    ]),
  schaak: () => speelOpname('schaak') || speel([
      { hz: 700, duur: 0.1, vorm: 'square', volume: 0.08 },
      { hz: 700, duur: 0.1, vorm: 'square', volume: 0.08, vanaf: 0.15 },
    ]),
  promotie: () => speelOpname('promotie') || speel([
      { hz: 392, duur: 0.1 },
      { hz: 523, duur: 0.1, vanaf: 0.09 },
      { hz: 659, duur: 0.1, vanaf: 0.18 },
      { hz: 880, duur: 0.28, vanaf: 0.27 },
    ]),
}
