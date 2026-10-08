import type { Lesson, World } from './types'
import { wereld0 } from './werelden/w0-weide'
import { wereld1 } from './werelden/w1-toren'
import { wereld2 } from './werelden/w2-loper'
import { wereld3 } from './werelden/w3-dame'
import { wereld4 } from './werelden/w4-paard'
import { wereld5 } from './werelden/w5-koning'
import { wereld6 } from './werelden/w6-pion'
import { wereld7 } from './werelden/w7-waarde'
import { wereld8 } from './werelden/w8-aanval'
import { wereld9 } from './werelden/w9-schaak'
import { wereld10 } from './werelden/w10-mat'
import { wereld11 } from './werelden/w11-rokade'
import { wereld12 } from './werelden/w12-notatie'
import { wereld13 } from './werelden/w13-tactiek'
import { wereld14 } from './werelden/w14-eindspel'

/**
 * Het pad. De volgorde is de Nederlandse stappen-volgorde: van makkelijk naar moeilijk
 * stuk, mat pas veel later (wereld 10, fase 2 van de roadmap).
 */
export const WERELDEN: World[] = [
  wereld0, wereld1, wereld2, wereld3, wereld4, wereld5, wereld6, wereld7, wereld8, wereld9,
  wereld10, wereld11, wereld12, wereld13, wereld14,
]

export const ALLE_LESSEN: Lesson[] = WERELDEN.flatMap((w) => w.lessen)

export function wereldMet(id: string): World | undefined {
  return WERELDEN.find((w) => w.id === id)
}

export function lesMet(id: string): Lesson | undefined {
  return ALLE_LESSEN.find((l) => l.id === id)
}

/** De les die na deze komt, over werelden heen. */
export function volgendeLes(id: string): Lesson | undefined {
  const i = ALLE_LESSEN.findIndex((l) => l.id === id)
  return i >= 0 ? ALLE_LESSEN[i + 1] : undefined
}

export * from './types'
