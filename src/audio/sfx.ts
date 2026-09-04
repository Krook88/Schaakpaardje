'use client'

/**
 * Bordgeluiden. Bewust gesynthetiseerd met de Web Audio API in plaats van
 * geluidsbestanden: nul kilobytes, werkt offline, en we kunnen de toonhoogte
 * afstemmen op wat er gebeurt. Bij de audio-oplevering kunnen hier echte
 * opnames voor in de plaats komen — de aanroepen blijven hetzelfde.
 */

let ctx: AudioContext | null = null
let aan = true

export function setSfxEnabled(waarde: boolean) {
  aan = waarde
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
  tik: () => speel([{ hz: 320, duur: 0.07, vorm: 'triangle', volume: 0.1 }]),
  zet: () => speel([{ hz: 180, duur: 0.1, vorm: 'triangle' }]),
  slaan: () => speel([{ hz: 140, duur: 0.16, vorm: 'sawtooth', volume: 0.12, glij: 70 }]),
  goed: () =>
    speel([
      { hz: 523, duur: 0.12 },
      { hz: 659, duur: 0.12, vanaf: 0.1 },
      { hz: 784, duur: 0.2, vanaf: 0.2 },
    ]),
  fout: () => speel([{ hz: 220, duur: 0.18, vorm: 'sine', volume: 0.09, glij: 165 }]),
  ster: () =>
    speel([
      { hz: 880, duur: 0.1 },
      { hz: 1175, duur: 0.18, vanaf: 0.09 },
    ]),
  diploma: () =>
    speel([
      { hz: 523, duur: 0.15 },
      { hz: 659, duur: 0.15, vanaf: 0.14 },
      { hz: 784, duur: 0.15, vanaf: 0.28 },
      { hz: 1047, duur: 0.35, vanaf: 0.42 },
    ]),
  schaak: () =>
    speel([
      { hz: 700, duur: 0.1, vorm: 'square', volume: 0.08 },
      { hz: 700, duur: 0.1, vorm: 'square', volume: 0.08, vanaf: 0.15 },
    ]),
  promotie: () =>
    speel([
      { hz: 392, duur: 0.1 },
      { hz: 523, duur: 0.1, vanaf: 0.09 },
      { hz: 659, duur: 0.1, vanaf: 0.18 },
      { hz: 880, duur: 0.28, vanaf: 0.27 },
    ]),
}
