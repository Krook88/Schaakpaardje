import { Game } from '@/engine/game'

/**
 * Schaken op afstand, zoals schaken per brief.
 *
 * De hele partij zit in een link: welke zetten er gedaan zijn, en met welk plaatje
 * wit en zwart spelen. Na elke zet deelt een ouder de link (WhatsApp, mail), het
 * vriendje opent hem, zet terug en deelt weer. Er zit geen server tussen: de partij
 * staat achter het hekje (`#`) van de link, en dat deel stuurt een browser nooit naar
 * de server. De app zelf stuurt dus niets naar internet; dat doet de ouder, met een
 * link waar alleen zetten en twee plaatjes in staan. Geen naam, geen leeftijd.
 */
export type AfstandPartij = {
  /** De zetten tot nu toe, als "e2e4", "e7e8q". */
  zetten: string[]
  /** Het plaatje van wit, en van zwart zodra zwart een keer gezet heeft. */
  wit: string
  zwart: string | null
}

const VERSIE = 'v1'

/** Partij naar het stukje achter het hekje. */
export function codeer(p: AfstandPartij): string {
  const ruw = [VERSIE, p.wit, p.zwart ?? '', p.zetten.join(' ')].join('|')
  const bytes = new TextEncoder().encode(ruw)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Het stukje achter het hekje terug naar een partij, met de stelling erbij.
 *
 * Alles wordt opnieuw gespeeld met de echte regels. Een link die iemand heeft aangepast
 * of die half is overgekomen, levert `null` op in plaats van een onmogelijke stelling.
 */
export function leesIn(code: string): { partij: AfstandPartij; game: Game } | null {
  try {
    const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
    const ruw = new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
    const [versie, wit, zwart, zettenTekst] = ruw.split('|')
    if (versie !== VERSIE || !wit) return null
    const zetten = zettenTekst ? zettenTekst.split(' ').filter(Boolean) : []
    if (zetten.length > 600) return null
    const game = new Game()
    for (const z of zetten) {
      if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(z)) return null
      const gedaan = game.move(z.slice(0, 2) as never, z.slice(2, 4) as never, (z[4] ?? 'q') as never)
      if (!gedaan) return null
    }
    // Plaatjes zijn één emoji, geen tekst: een link mag geen naam of boodschap dragen.
    const isPlaatje = (s: string) => s.length > 0 && s.length <= 4 && !/[\p{L}\p{N}]/u.test(s)
    if (!isPlaatje(wit) || (zwart && !isPlaatje(zwart))) return null
    return { partij: { zetten, wit, zwart: zwart || null }, game }
  } catch {
    return null
  }
}

/** De zet in de vorm die in de link komt. */
export function zetCode(van: string, naar: string, promotie?: string): string {
  return `${van}${naar}${promotie && promotie !== 'q' ? promotie : ''}`
}
