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
 */
export type Kant = 'w' | 'b'

/** Wat de server terugstuurt. */
export type LiveStand = {
  wit: string
  zwart: string | null
  zetten: string[]
  ronde: number
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
  if (st.jij !== null && st.jij !== 'w' && st.jij !== 'b') return null
  const gespeeld = speelNa(st.zetten)
  if (!gespeeld) return null
  const ander = st.ander === 'nog-niet' || st.ander === 'er' || st.ander === 'weg' ? st.ander : null
  return {
    wit: st.wit as string,
    zwart: (st.zwart as string | null) ?? null,
    zetten: gespeeld.netjes,
    ronde: st.ronde,
    jij: st.jij ?? null,
    ander,
    game: gespeeld.game,
  }
}

/** Wat een verzoek opleverde. `geen-verbinding` is ook: de server gaf onzin terug. */
export type Antwoord =
  | { soort: 'goed'; stand: LivePartij; sleutel?: string; kamer?: string }
  | { soort: 'vol'; stand: LivePartij | null }
  | { soort: 'achter'; stand: LivePartij | null }
  | { soort: 'weg' }
  | { soort: 'geen-verbinding' }

async function vraag(body: Record<string, unknown>): Promise<Antwoord> {
  let r: Response
  try {
    r = await fetch(ADRES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
  } catch {
    return { soort: 'geen-verbinding' }
  }
  if (r.status === 404) return { soort: 'weg' }
  const data = (await r.json().catch(() => null)) as Record<string, unknown> | null
  if (r.status === 409) {
    const stand = leesStand(data?.stand)
    return body.doe === 'meedoen' ? { soort: 'vol', stand } : { soort: 'achter', stand }
  }
  if (r.status !== 200 || !data) return { soort: 'geen-verbinding' }
  const stand = leesStand('stand' in data ? data.stand : data)
  if (!stand) return { soort: 'geen-verbinding' }
  return {
    soort: 'goed',
    stand,
    sleutel: typeof data.sleutel === 'string' ? data.sleutel : undefined,
    kamer: typeof data.kamer === 'string' && isKamer(data.kamer) ? data.kamer : undefined,
  }
}

export const live = {
  nieuw: (plaatje: string) => vraag({ doe: 'nieuw', plaatje }),
  meedoen: (kamer: string, plaatje: string) => vraag({ doe: 'meedoen', kamer, plaatje }),
  kijk: (kamer: string, sleutel?: string) => vraag({ doe: 'kijk', kamer, sleutel }),
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
