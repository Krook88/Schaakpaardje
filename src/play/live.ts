import { type Game } from '@/engine/game'
import { AVATARS } from '@/progress/store'
import { speelNa } from './afstand'

/**
 * Live spelen met een vriendje: ieder op een eigen scherm, de zetten komen vanzelf over.
 *
 * Een ouder maakt één speellink en deelt die één keer. Daarna gaan de zetten via een
 * klein PHP-script op de eigen hosting (`public/live/`), dat ze als een brievenbus
 * bewaart. Wat daar staat: de zetten, de twee plaatjes, en per kant een sleutel. Geen
 * naam, geen profiel, geen IP-adres. Na een dag zonder zet is de partij weg.
 *
 * De code van de partij staat achter het hekje van de link, zodat hij niet in de
 * tellingen of logboeken van de webserver belandt. De sleutel van je eigen kant staat
 * alleen op dit apparaat. Wie de link opent zonder sleutel en er is al een tweede
 * speler, kijkt alleen mee.
 *
 * De server kent geen schaakregels. Elk scherm speelt alle zetten opnieuw met chess.js;
 * staat er iets onmogelijks, dan geldt de partij als kapot.
 *
 * Kijken is long polling: het scherm zegt wat het al weet, en de server antwoordt pas als
 * er iets verandert (of na hooguit twintig seconden). Zo komt een zet meteen over, zonder
 * dat er elke seconde een verzoek heen en weer gaat. Zie public/live/index.php.
 */
export type Kant = 'w' | 'b'

/** Wat de server terugstuurt. */
export type LiveStand = {
  wit: string
  zwart: string | null
  zetten: string[]
  ronde: number
  /** De zetten van de ronde ervoor, voor wie het einde daarvan nog niet zag. */
  vorige: string[]
  jij: Kant | null
  /** Waar het vriendje is: nog niet binnen, er, of al een tijdje niet gezien. */
  ander: 'nog-niet' | 'er' | 'weg' | null
}

/** Een stand die gecontroleerd is, met de partij erbij. */
export type LivePartij = LiveStand & { game: Game }

const ADRES = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/live/index.php`

/** Een code zoals de server ze maakt. Alles anders is geen speellink. */
export function isKamer(code: string): boolean {
  return /^[a-z2-9]{10}$/.test(code)
}

/**
 * Een stand van de server nakijken en naspelen. `null` als er iets niet klopt: een
 * onmogelijke zet, of iets anders dan een plaatje uit de app (dat kwam dan bij een kind
 * op het scherm).
 */
export function leesStand(s: unknown): LivePartij | null {
  if (!s || typeof s !== 'object') return null
  const st = s as Partial<LiveStand>
  const isPlaatje = (p: unknown) => typeof p === 'string' && (AVATARS as readonly string[]).includes(p)
  if (!isPlaatje(st.wit) || (st.zwart !== null && !isPlaatje(st.zwart))) return null
  if (!Array.isArray(st.zetten) || typeof st.ronde !== 'number') return null
  const vorige = Array.isArray(st.vorige) ? st.vorige.filter((z): z is string => typeof z === 'string') : []
  if (st.jij !== null && st.jij !== 'w' && st.jij !== 'b') return null
  const gespeeld = speelNa(st.zetten)
  if (!gespeeld) return null
  const ander = st.ander === 'nog-niet' || st.ander === 'er' || st.ander === 'weg' ? st.ander : null
  return {
    wit: st.wit as string,
    zwart: (st.zwart as string | null) ?? null,
    zetten: gespeeld.netjes,
    ronde: st.ronde,
    vorige,
    jij: st.jij ?? null,
    ander,
    game: gespeeld.game,
  }
}

/**
 * Is `nieuw` echt nieuwer dan wat er al staat? Antwoorden kunnen in een andere volgorde
 * binnenkomen dan ze vertrokken (een traag mobiel net, of een kijkverzoek dat vertrok
 * vóór de eigen zet). Een oudere stand zou een zet van het bord halen en het kind weer
 * "aan zet" maken. Codebase-review van 16 oktober, punt 1.
 */
export function isNieuwer(oud: LiveStand | null, nieuw: LiveStand): boolean {
  if (!oud) return true
  if (nieuw.ronde !== oud.ronde) return nieuw.ronde > oud.ronde
  if (nieuw.zetten.length !== oud.zetten.length) return nieuw.zetten.length > oud.zetten.length
  return nieuw.ander !== oud.ander || nieuw.zwart !== oud.zwart || nieuw.jij !== oud.jij
}

/**
 * Wat een verzoek opleverde.
 * - `druk`: de server wil nu even geen nieuwe partij (te veel tegelijk). Dat is iets voor
 *   een ouder, niet "geen verbinding".
 * - `kapot`: de server antwoordde, maar met een partij die niet kan.
 */
export type Antwoord =
  | { soort: 'goed'; stand: LivePartij; sleutel?: string; kamer?: string }
  | { soort: 'vol'; stand: LivePartij | null }
  | { soort: 'achter'; stand: LivePartij | null }
  | { soort: 'weg' }
  | { soort: 'kapot' }
  | { soort: 'druk' }
  | { soort: 'geen-verbinding' }

/** Hoe lang een gewoon verzoek mag duren. Daarna geldt het als geen verbinding. */
const GEDULD = 8000
/** Een kijkverzoek wacht op de server hooguit twintig seconden; dit is ruim daarboven. */
const GEDULD_KIJKEN = 30000

/** Statuscode en antwoord naar een soort. Los, zodat het zonder netwerk te testen is. */
export function lees(status: number, data: Record<string, unknown> | null, doe: string): Antwoord {
  if (status === 404) return { soort: 'weg' }
  if (status === 429 || status === 503) return { soort: 'druk' }
  if (status === 409) {
    const stand = leesStand(data?.stand)
    return doe === 'meedoen' ? { soort: 'vol', stand } : { soort: 'achter', stand }
  }
  if (status !== 200 || !data) return { soort: 'geen-verbinding' }
  const stand = leesStand('stand' in data ? data.stand : data)
  if (!stand) return { soort: 'kapot' }
  return {
    soort: 'goed',
    stand,
    sleutel: typeof data.sleutel === 'string' ? data.sleutel : undefined,
    kamer: typeof data.kamer === 'string' && isKamer(data.kamer) ? data.kamer : undefined,
  }
}

async function vraag(body: Record<string, unknown>, extra?: { signal?: AbortSignal; geduld?: number }): Promise<Antwoord> {
  // Zonder time-out kan een verzoek op half wegvallende wifi minutenlang blijven hangen,
  // en zit het bord al die tijd op slot. Codebase-review van 16 oktober, punt 2.
  const klok = new AbortController()
  const tijd = setTimeout(() => klok.abort(), extra?.geduld ?? GEDULD)
  const stop = () => klok.abort()
  extra?.signal?.addEventListener('abort', stop)
  try {
    const r = await fetch(ADRES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: klok.signal,
    })
    const data = (await r.json().catch(() => null)) as Record<string, unknown> | null
    return lees(r.status, data, String(body.doe))
  } catch {
    return { soort: 'geen-verbinding' }
  } finally {
    clearTimeout(tijd)
    extra?.signal?.removeEventListener('abort', stop)
  }
}

/** Een sleutel zoals de server ze maakt: 24 tekens, met echt toeval. */
export function nieuweSleutel(): string {
  const tekens = 'abcdefghjkmnpqrstuvwxyz23456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => tekens[b % tekens.length]).join('')
}

export const live = {
  nieuw: (plaatje: string) => vraag({ doe: 'nieuw', plaatje }),
  meedoen: (kamer: string, plaatje: string, sleutel: string) => vraag({ doe: 'meedoen', kamer, plaatje, sleutel }),
  /** Met `bekend` wacht de server tot er iets anders is dan dit (long polling). */
  kijk: (kamer: string, sleutel?: string, bekend?: LiveStand, signal?: AbortSignal) =>
    vraag(
      {
        doe: 'kijk',
        kamer,
        sleutel,
        bekend: bekend && { ronde: bekend.ronde, na: bekend.zetten.length, zwart: bekend.zwart !== null, ander: bekend.ander },
      },
      { signal, geduld: bekend ? GEDULD_KIJKEN : GEDULD },
    ),
  zet: (kamer: string, sleutel: string, ronde: number, na: number, zet: string) =>
    vraag({ doe: 'zet', kamer, sleutel, ronde, na, zet }),
  opnieuw: (kamer: string, sleutel: string, ronde: number) => vraag({ doe: 'opnieuw', kamer, sleutel, ronde }),
}

/**
 * De sleutels van dit apparaat, per partij. Zo kan een kind verversen of de app even
 * wegklikken en daarna gewoon verder spelen, aan dezelfde kant.
 */
const SLEUTELS = 'schaakmaatje-live-sleutels'

export function mijnSleutel(kamer: string): string | undefined {
  try {
    const lijst = JSON.parse(localStorage.getItem(SLEUTELS) ?? '{}') as Record<string, string>
    return typeof lijst[kamer] === 'string' ? lijst[kamer] : undefined
  } catch {
    return undefined
  }
}

/** De partij waar dit apparaat het laatst een sleutel voor kreeg: om verder te kunnen. */
export function laatsteKamer(): { kamer: string; sleutel: string } | null {
  try {
    const lijst = Object.entries(JSON.parse(localStorage.getItem(SLEUTELS) ?? '{}') as Record<string, string>)
    const laatste = lijst.at(-1)
    return laatste && isKamer(laatste[0]) && typeof laatste[1] === 'string' ? { kamer: laatste[0], sleutel: laatste[1] } : null
  } catch {
    return null
  }
}

export function bewaarSleutel(kamer: string, sleutel: string) {
  try {
    const lijst = JSON.parse(localStorage.getItem(SLEUTELS) ?? '{}') as Record<string, string>
    delete lijst[kamer]
    // Alleen de laatste twintig: een partij leeft toch maar een dag.
    const nieuw = Object.fromEntries([...Object.entries(lijst).slice(-19), [kamer, sleutel]])
    localStorage.setItem(SLEUTELS, JSON.stringify(nieuw))
  } catch {
    /* geen opslag: dan werkt het tot het verversen */
  }
}
