import type { Lesson, World } from './types'
import { wereld0 } from './werelden/w0-weide'
import { wereld1 } from './werelden/w1-toren'
import { wereld2 } from './werelden/w2-loper'
import { wereld3 } from './werelden/w3-dame'
import { wereld4 } from './werelden/w4-paard'
import { wereld5 } from './werelden/w5-koning'
import { wereld6 } from './werelden/w6-pion'

/**
 * Het pad. De volgorde is de Nederlandse stappen-volgorde: van makkelijk naar moeilijk
 * stuk, mat pas veel later (wereld 10, fase 2 van de roadmap).
 */
export const WERELDEN: World[] = [wereld0, wereld1, wereld2, wereld3, wereld4, wereld5, wereld6]

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
