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

function zetBrowserNeer() {
  gezegd.length = 0
  const nep = {
    speak: (u: { text: string }) => gezegd.push(u.text),
    cancel: () => {},
    getVoices: () => [],
  }
  vi.stubGlobal('window', { speechSynthesis: nep })
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
