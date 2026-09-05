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
/**
 * De lopende ophaalactie, niet een simpele "al gedaan"-vlag.
 *
 * Met een vlag zette de eerste aanroep hem meteen op waar, waarna een tweede aanroep
 * die er vlak achteraan kwam meteen doorliep — met een manifest dat nog leeg was. Die
 * zin viel dan terug op de apparaatstem terwijl er een opname voor bestond. Door de
 * belofte zelf te bewaren wacht iedereen netjes op dezelfde ophaalactie.
 */
let manifestBelofte: Promise<void> | null = null

/**
 * Welke zin de laatste is. Elke aanroep neemt een nummertje.
 *
 * speak() breekt aan het begin de vorige zin af, maar daarna staat er een await: het
 * manifest ophalen. Twee zinnen die vlak na elkaar beginnen kwamen daardoor allebei
 * voorbij dat afbreken heen, want de eerste had zijn geluid nog niet geregistreerd
 * toen de tweede het probeerde te stoppen. Resultaat: twee of drie stemmen door elkaar.
 * Wie na een await merkt dat er alweer iemand anders aan de beurt is, houdt op.
 */
let beurt = 0

/**
 * Een opname die niet mocht spelen omdat het kind nog niets had aangeraakt.
 *
 * Browsers weigeren geluid tot de eerste tik — een terechte regel tegen sites die
 * ongevraagd beginnen te schreeuwen. De apparaatstem valt níet onder die regel, en
 * daardoor deed de app precies het verkeerde: hij sloeg de opname over en zette de
 * robot in. Nu wachten we op de eerste aanraking en spelen dan alsnog Pip af.
 */
let geblokkeerdeZin: string | null = null
let geblokkeerdeBeurt = 0
let luistertNaarTik = false

function wachtOpEersteTik() {
  if (luistertNaarTik || typeof window === 'undefined') return
  luistertNaarTik = true
  const los = () => {
    window.removeEventListener('pointerdown', los)
    window.removeEventListener('keydown', los)
    luistertNaarTik = false
    const zin = geblokkeerdeZin
    const vanBeurt = geblokkeerdeBeurt
    geblokkeerdeZin = null
    // Alleen als er ondertussen niets nieuwers gevraagd is. Anders overstemt een
    // begroeting van drie schermen terug wat er nú op het scherm staat.
    if (zin && vanBeurt === beurt) void speak(zin, true)
  }
  window.addEventListener('pointerdown', los, { once: true })
  window.addEventListener('keydown', los, { once: true })
}
let huidigeAudio: HTMLAudioElement | null = null
let ondertitelListener: ((tekst: string | null) => void) | null = null
let stemmenGeladen = false
/**
 * Zijn de instellingen van het profiel al toegepast?
 *
 * Ze komen uit localStorage en dus pas ná de eerste render binnen. Tot dat moment
 * stond hier de standaard "spraak aan", en die won: een kind van wie de ouder Pip had
 * uitgezet, kreeg bij binnenkomst op een les alsnog de eerste zin te horen. We houden
 * de zin daarom vast tot we weten wat er mag.
 */
let configToegepast = false
let wachtendeZin: string | null = null

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
  const eerdereKeer = configToegepast
  configToegepast = true
  const zin = wachtendeZin
  wachtendeZin = null
  if (!config.spraak && eerdereKeer) stopSpeaking()
  // De vastgehouden zin alsnog aanbieden: speak() past nu de echte regels toe, en die
  // bepalen of hij te horen is, alleen te lezen, of geen van beide.
  if (zin) void speak(zin)
}

export function getVoiceConfig(): Config {
  return { ...config }
}

export function onSubtitle(fn: ((tekst: string | null) => void) | null) {
  ondertitelListener = fn
}

function laadManifest(): Promise<void> {
  if (manifestBelofte) return manifestBelofte
  manifestBelofte = (async () => {
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
  })()
  return manifestBelofte
}

export function stopSpeaking() {
  geblokkeerdeZin = null
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
 *
 * `opVerzoek` is voor de luidsprekerknop: de instelling "Pip praat" zet het
 * automatische voorlezen uit, maar een kind dat zélf op de luidspreker tikt vraagt er
 * om. Zonder dit onderscheid was die knop dood voor precies het kind dat hem nodig
 * heeft — een van vier, dat de tekst eronder niet kan lezen.
 */
export async function speak(tekst: string, opVerzoek = false): Promise<void> {
  if (!tekst) return
  const mijnBeurt = ++beurt
  stopSpeaking()
  if (typeof window === 'undefined') return
  // Eerst de vraag "mag dit al?", pas daarna de ondertitel. Andersom verscheen de
  // ondertitel met de standaardinstelling in beeld voordat bekend was wat de ouder
  // had gekozen — dezelfde race die voor de stem al gerepareerd was.
  if (!opVerzoek && !configToegepast) {
    wachtendeZin = tekst
    return
  }
  if (config.ondertiteling) ondertitelListener?.(tekst)
  if (!opVerzoek && !config.spraak) return

  await laadManifest()
  // Tijdens het ophalen kan er alweer een nieuwe zin gestart zijn.
  if (mijnBeurt !== beurt) return
  const sleutel = zinSleutel(tekst)

  if (manifest && sleutel in manifest) {
    const audio = new Audio(`${BASIS}/audio/${sleutel}.mp3`)
    audio.playbackRate = config.tempo
    huidigeAudio = audio
    try {
      await audio.play()
      return
    } catch (e) {
      if (huidigeAudio === audio) huidigeAudio = null
      // Geweigerd omdat er nog niet getikt is? Dan niet de robot erin gooien, maar
      // wachten tot het kind iets aanraakt en dan alsnog Pip laten praten.
      if ((e as DOMException)?.name === 'NotAllowedError') {
        geblokkeerdeZin = tekst
        geblokkeerdeBeurt = mijnBeurt
        wachtOpEersteTik()
        return
      }
      // Iets anders mis met het bestand: dan is de apparaatstem beter dan stilte.
    }
  }

  if (mijnBeurt !== beurt) return
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
