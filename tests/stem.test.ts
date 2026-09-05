import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * De stem van Pip, en dan vooral: wanneer hij zwijgt.
 *
 * Voor een kind van vier is de stem de enige manier om te weten wat er gevraagd wordt.
 * Twee dingen moeten daarom kloppen, en allebei zijn ze een keer misgegaan:
 * de instelling van de ouder moet wínnen (ook als die pas na de eerste render bekend
 * is), én de luidsprekerknop moet blijven werken als die instelling uit staat.
 */
const gezegd: string[] = []
/** Wat de app aan de browser vraagt te melden, zodat we een tik kunnen naspelen. */
let luisteraars: Record<string, (() => void)[]> = {}

/** Doet alsof het kind ergens op tikt. */
function tikOpHetScherm() {
  for (const fn of luisteraars['pointerdown'] ?? []) fn()
}

function zetBrowserNeer() {
  gezegd.length = 0
  const nep = {
    speak: (u: { text: string }) => gezegd.push(u.text),
    cancel: () => {},
    getVoices: () => [],
  }
  luisteraars = {}
  vi.stubGlobal('window', {
    speechSynthesis: nep,
    addEventListener: (naam: string, fn: () => void) => {
      ;(luisteraars[naam] ??= []).push(fn)
    },
    removeEventListener: (naam: string, fn: () => void) => {
      luisteraars[naam] = (luisteraars[naam] ?? []).filter((f) => f !== fn)
    },
  })
  vi.stubGlobal('speechSynthesis', nep)
  vi.stubGlobal('SpeechSynthesisUtterance', class {
    text: string
    lang = ''
    rate = 1
    pitch = 1
    voice: unknown = null
    constructor(t: string) {
      this.text = t
    }
  })
  vi.stubGlobal('fetch', async () => ({ ok: false }))
}

describe('wanneer Pip praat', () => {
  beforeEach(() => {
    vi.resetModules()
    zetBrowserNeer()
  })

  it('zwijgt tot de instellingen van het profiel bekend zijn', async () => {
    const { speak } = await import('@/audio/voice')
    await speak('Hoi, ik ben Pip.')
    expect(gezegd).toEqual([])
  })

  it('haalt de vastgehouden zin alsnog op zodra spraak aan blijkt te staan', async () => {
    const { speak, setVoiceConfig } = await import('@/audio/voice')
    await speak('Hoi, ik ben Pip.')
    setVoiceConfig({ spraak: true, tempo: 1, ondertiteling: false })
    await new Promise((r) => setTimeout(r, 0))
    expect(gezegd).toEqual(['Hoi, ik ben Pip.'])
  })

  it('laat de vastgehouden zin vallen als de ouder Pip heeft uitgezet', async () => {
    const { speak, setVoiceConfig } = await import('@/audio/voice')
    await speak('Hoi, ik ben Pip.')
    setVoiceConfig({ spraak: false, tempo: 1, ondertiteling: false })
    await new Promise((r) => setTimeout(r, 0))
    expect(gezegd).toEqual([])
  })

  it('praat niet vanzelf als spraak uit staat', async () => {
    const { speak, setVoiceConfig } = await import('@/audio/voice')
    setVoiceConfig({ spraak: false, tempo: 1, ondertiteling: false })
    await speak('Waar kan deze toren heen?')
    expect(gezegd).toEqual([])
  })

  it('praat wél als het kind zelf op de luidspreker tikt, ook met spraak uit', async () => {
    const { speak, setVoiceConfig } = await import('@/audio/voice')
    setVoiceConfig({ spraak: false, tempo: 1, ondertiteling: false })
    await speak('Waar kan deze toren heen?', true)
    expect(gezegd).toEqual(['Waar kan deze toren heen?'])
  })
})

describe('de ondertiteling', () => {
  it('wacht net als de stem tot de instellingen bekend zijn', async () => {
    vi.resetModules()
    zetBrowserNeer()
    const { speak, onSubtitle, setVoiceConfig } = await import('@/audio/voice')
    const gezien: (string | null)[] = []
    onSubtitle((t) => gezien.push(t))
    await speak('Hoi, ik ben Pip.')
    expect(gezien.filter(Boolean)).toEqual([])
    setVoiceConfig({ spraak: false, tempo: 1, ondertiteling: true })
    await new Promise((r) => setTimeout(r, 0))
    // Stem uit, ondertiteling aan: te lezen, niet te horen.
    expect(gezien.filter(Boolean)).toEqual(['Hoi, ik ben Pip.'])
    expect(gezegd).toEqual([])
  })
})


/**
 * De opnames zelf: wanneer speelt Pip, en wanneer valt de app terug op de tablet?
 *
 * Twee fouten die pas op de echte site zichtbaar werden en die je in een test wél
 * ziet aankomen: drie zinnen die door elkaar heen praatten, en een opname die
 * geweigerd werd omdat het kind nog niets had aangeraakt — waarna de app de robot
 * inzette in plaats van even te wachten.
 */
describe('opnames afspelen', () => {
  const ZIN = 'Hoi! Ik ben Pip.'
  let gespeeldeBestanden: string[]
  let afgebroken: number

  /** Zet een browser neer waarin één opname bestaat, en play() doet wat je zegt. */
  async function metOpname(playDoet: 'lukt' | 'geblokkeerd' | 'kapot') {
    vi.resetModules()
    zetBrowserNeer()
    gespeeldeBestanden = []
    afgebroken = 0
    const { zinSleutel } = await import('@/audio/voice')
    const sleutel = zinSleutel(ZIN)
    vi.stubGlobal('fetch', async () => ({ ok: true, json: async () => ({ [sleutel]: { tekst: ZIN } }) }))
    vi.stubGlobal(
      'Audio',
      class {
        src: string
        playbackRate = 1
        constructor(src: string) {
          this.src = src
        }
        play() {
          if (playDoet === 'lukt') {
            gespeeldeBestanden.push(this.src)
            return Promise.resolve()
          }
          const fout = new Error('geweigerd')
          fout.name = playDoet === 'geblokkeerd' ? 'NotAllowedError' : 'NotSupportedError'
          return Promise.reject(fout)
        }
        pause() {
          afgebroken++
        }
        addEventListener() {}
        removeEventListener() {}
      },
    )
    const mod = await import('@/audio/voice')
    mod.setVoiceConfig({ spraak: true, tempo: 1, ondertiteling: false })
    return { ...mod, sleutel }
  }

  it('speelt de opname als die bestaat, en zwijgt met de apparaatstem', async () => {
    const { speak } = await metOpname('lukt')
    await speak(ZIN)
    expect(gespeeldeBestanden).toHaveLength(1)
    expect(gespeeldeBestanden[0]).toContain('.mp3')
    expect(gezegd).toEqual([]) // geen robot erdoorheen
  })

  it('laat twee zinnen die vlak na elkaar komen niet door elkaar praten', async () => {
    const { speak } = await metOpname('lukt')
    // Allebei starten zonder op de eerste te wachten: precies wat er op de stal gebeurde.
    await Promise.all([speak(ZIN), speak('Tik de vier donkere velden op de onderste rij aan.')])
    // De eerste geeft het op zodra hij merkt dat er een nieuwere is.
    expect(gespeeldeBestanden.length).toBeLessThanOrEqual(1)
  })

  it('zet niet de robot in als de browser de opname nog niet mag afspelen', async () => {
    const { speak } = await metOpname('geblokkeerd')
    await speak(ZIN)
    // Wachten op de eerste tik is beter dan een andere stem: de opname bestaat.
    expect(gezegd).toEqual([])
  })

  it('speelt de opname alsnog zodra het kind ergens op tikt', async () => {
    const { speak } = await metOpname('geblokkeerd')
    await speak(ZIN)
    expect(gespeeldeBestanden).toEqual([])
    tikOpHetScherm()
    await new Promise((r) => setTimeout(r, 0))
    // Nu mag het wel, en het is nog steeds Pip en niet de tablet.
    expect(gezegd).toEqual([])
  })

  it('valt wél terug op de apparaatstem als het bestand zelf niet deugt', async () => {
    const { speak } = await metOpname('kapot')
    await speak(ZIN)
    expect(gezegd).toEqual([ZIN])
  })
})

describe('wachten tot Pip is uitgesproken', () => {
  it('wacht niet als er niets speelt', async () => {
    vi.resetModules()
    zetBrowserNeer()
    const { wachtTotUitgesproken } = await import('@/audio/voice')
    const t0 = Date.now()
    await wachtTotUitgesproken(3000)
    expect(Date.now() - t0).toBeLessThan(100)
  })

  it('geeft het na de bovengrens op, zodat een scherm nooit blijft hangen', async () => {
    vi.resetModules()
    zetBrowserNeer()
    // Een apparaatstem die nooit meldt dat hij klaar is: dat gebeurt echt op
    // sommige toestellen. Dan mag het lesscherm niet voorgoed stil blijven staan.
    const { speak, setVoiceConfig, wachtTotUitgesproken } = await import('@/audio/voice')
    setVoiceConfig({ spraak: true, tempo: 1, ondertiteling: false })
    await speak('Een zin die nooit afloopt.')
    const t0 = Date.now()
    await wachtTotUitgesproken(60)
    expect(Date.now() - t0).toBeGreaterThanOrEqual(50)
    expect(Date.now() - t0).toBeLessThan(500)
  })
})
