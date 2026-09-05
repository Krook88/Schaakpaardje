'use client'

/**
 * Profielen, instellingen en voortgang.
 *
 * Alles staat lokaal op het apparaat. Geen account, geen server, geen persoonsgegevens:
 * een voornaam en een leeftijdsgroep, meer heeft de app niet nodig. Zie docs/08.
 */
import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import { ALLE_LESSEN, WERELDEN } from '@/content'
import { DIPLOMAS, type DiplomaSoort } from '@/content/diplomas'

export type Modus = 'pip' | 'ontdekker' | 'schaker'

export type Profiel = {
  id: string
  naam: string
  leeftijd: number
  modus: Modus
  avatar: string
  gemaakt: string
}

export type LesResultaat = {
  sterren: 0 | 1 | 2 | 3
  fouten: number
  hints: number
  laatst: string
}

export type Instellingen = {
  spraak: boolean
  effecten: boolean
  tempo: 0.8 | 1 | 1.2
  ondertiteling: boolean
  coordinaten: boolean
  blunderWaarschuwing: boolean
}

export const STANDAARD_INSTELLINGEN: Instellingen = {
  spraak: true,
  effecten: true,
  tempo: 1,
  ondertiteling: true,
  coordinaten: false,
  blunderWaarschuwing: true,
}

/** Leeftijd bepaalt de modus; de ouder kan hem daarna zelf bijstellen. */
export function modusVoorLeeftijd(leeftijd: number): Modus {
  if (leeftijd <= 5) return 'pip'
  if (leeftijd <= 7) return 'ontdekker'
  return 'schaker'
}

export const AVATARS = ['🐴', '🦊', '🐻', '🐰', '🦉', '🐢', '🐝', '🦄'] as const

type State = {
  profielen: Profiel[]
  actiefId: string | null
  voortgang: Record<string, Record<string, LesResultaat>>
  instellingen: Record<string, Instellingen>
  stickers: Record<string, string[]>
  gespeeld: Record<string, { gewonnen: number; verloren: number; remise: number }>

  maakProfiel: (naam: string, leeftijd: number, avatar: string) => string
  kiesProfiel: (id: string) => void
  verwijderProfiel: (id: string) => void
  zetInstelling: <K extends keyof Instellingen>(sleutel: K, waarde: Instellingen[K]) => void
  bewaarLes: (lesId: string, resultaat: Omit<LesResultaat, 'laatst'>) => void
  bewaarPartij: (uitslag: 'gewonnen' | 'verloren' | 'remise') => void
  geefSticker: (sticker: string) => void
}

const nieuwId = () => Math.random().toString(36).slice(2, 10)

export const useProfielStore = create<State>()(
  persist(
    (set, get) => ({
      profielen: [],
      actiefId: null,
      voortgang: {},
      instellingen: {},
      stickers: {},
      gespeeld: {},

      maakProfiel(naam, leeftijd, avatar) {
        const id = nieuwId()
        const profiel: Profiel = {
          id,
          naam: naam.trim() || 'Schaker',
          leeftijd,
          modus: modusVoorLeeftijd(leeftijd),
          avatar,
          gemaakt: new Date().toISOString(),
        }
        set((s) => ({
          profielen: [...s.profielen, profiel],
          actiefId: id,
          voortgang: { ...s.voortgang, [id]: {} },
          instellingen: { ...s.instellingen, [id]: { ...STANDAARD_INSTELLINGEN } },
          stickers: { ...s.stickers, [id]: [] },
          gespeeld: { ...s.gespeeld, [id]: { gewonnen: 0, verloren: 0, remise: 0 } },
        }))
        return id
      },

      kiesProfiel(id) {
        set({ actiefId: id })
      },

      verwijderProfiel(id) {
        set((s) => {
          const { [id]: _v, ...voortgang } = s.voortgang
          const { [id]: _i, ...instellingen } = s.instellingen
          const { [id]: _s, ...stickers } = s.stickers
          const { [id]: _g, ...gespeeld } = s.gespeeld
          const profielen = s.profielen.filter((p) => p.id !== id)
          return {
            profielen,
            voortgang,
            instellingen,
            stickers,
            gespeeld,
            actiefId: s.actiefId === id ? (profielen[0]?.id ?? null) : s.actiefId,
          }
        })
      },

      zetInstelling(sleutel, waarde) {
        const id = get().actiefId
        if (!id) return
        set((s) => ({
          instellingen: {
            ...s.instellingen,
            [id]: { ...STANDAARD_INSTELLINGEN, ...s.instellingen[id], [sleutel]: waarde },
          },
        }))
      },

      bewaarLes(lesId, resultaat) {
        const id = get().actiefId
        if (!id) return
        set((s) => {
          const vanProfiel = s.voortgang[id] ?? {}
          const bestaand = vanProfiel[lesId]
          // Sterren gaan nooit omlaag: een keer goed blijft goed.
          const sterren = Math.max(bestaand?.sterren ?? 0, resultaat.sterren) as 0 | 1 | 2 | 3
          return {
            voortgang: {
              ...s.voortgang,
              [id]: {
                ...vanProfiel,
                [lesId]: {
                  sterren,
                  fouten: (bestaand?.fouten ?? 0) + resultaat.fouten,
                  hints: (bestaand?.hints ?? 0) + resultaat.hints,
                  laatst: new Date().toISOString(),
                },
              },
            },
          }
        })
      },

      bewaarPartij(uitslag) {
        const id = get().actiefId
        if (!id) return
        set((s) => {
          const huidig = s.gespeeld[id] ?? { gewonnen: 0, verloren: 0, remise: 0 }
          return { gespeeld: { ...s.gespeeld, [id]: { ...huidig, [uitslag]: huidig[uitslag] + 1 } } }
        })
      },

      geefSticker(sticker) {
        const id = get().actiefId
        if (!id) return
        set((s) => {
          const lijst = s.stickers[id] ?? []
          if (lijst.includes(sticker)) return {}
          return { stickers: { ...s.stickers, [id]: [...lijst, sticker] } }
        })
      },
    }),
    { name: 'schaakmaatje-v1' },
  ),
)

/**
 * Is de opgeslagen toestand al ingelezen?
 *
 * Tijdens het bouwen bestaat localStorage niet, dus wat er in de voorgerenderde HTML
 * staat is de toestand van een kind zonder profiel: alle lessen op slot en geen enkel
 * diploma. Zonder deze vlag ziet een kind dat even, en gooit React de boom daarna weg —
 * met een hydratieklacht erbij. Elk scherm dat de voortgang leest, wacht hierop.
 */
export function useToestandGeladen(): boolean {
  const [geladen, setGeladen] = useState(false)
  useEffect(() => setGeladen(true), [])
  return geladen
}

/* ---------- afgeleide vragen ----------
 *
 * Let op: deze selectors bouwen een nieuw object. Zustand v5 draait op
 * useSyncExternalStore en zou daar in een oneindige lus door raken, dus ze gaan
 * altijd door useShallow heen. Vandaar hooks in plaats van kale functies.
 */

export function actiefProfiel(state: State): Profiel | null {
  return state.profielen.find((p) => p.id === state.actiefId) ?? null
}

export function useProfiel(): Profiel | null {
  return useProfielStore(actiefProfiel)
}

export function instellingenVan(state: State): Instellingen {
  const id = state.actiefId
  return { ...STANDAARD_INSTELLINGEN, ...(id ? state.instellingen[id] : undefined) }
}

export function useInstellingen(): Instellingen {
  return useProfielStore(useShallow(instellingenVan))
}

export function voortgangVan(state: State): Record<string, LesResultaat> {
  const id = state.actiefId
  return (id && state.voortgang[id]) || LEGE_VOORTGANG
}

const LEGE_VOORTGANG: Record<string, LesResultaat> = {}

export function useVoortgang(): Record<string, LesResultaat> {
  return useProfielStore(useShallow(voortgangVan))
}

const LEGE_LIJST: string[] = []

export function useStickers(): string[] {
  return useProfielStore(useShallow((s) => (s.actiefId ? (s.stickers[s.actiefId] ?? LEGE_LIJST) : LEGE_LIJST)))
}

export function useGespeeld() {
  return useProfielStore(
    useShallow((s) => (s.actiefId ? s.gespeeld[s.actiefId] : undefined)),
  )
}

/**
 * Een les gaat open zodra de vorige twee sterren heeft. Twee, niet drie: het pad moet
 * doorlopen, niet perfectioneren. Drie sterren levert een sticker op, geen toegang.
 */
export function isOntgrendeld(lesId: string, voortgang: Record<string, LesResultaat>): boolean {
  const index = ALLE_LESSEN.findIndex((l) => l.id === lesId)
  if (index <= 0) return true
  const vorige = ALLE_LESSEN[index - 1]
  return (voortgang[vorige.id]?.sterren ?? 0) >= 2
}

export function wereldIsAf(wereldId: string, voortgang: Record<string, LesResultaat>): boolean {
  const wereld = WERELDEN.find((w) => w.id === wereldId)
  if (!wereld) return false
  return wereld.lessen.every((l) => (voortgang[l.id]?.sterren ?? 0) >= 2)
}

/** Is dit diploma verdiend? Dat is zo zodra alle werelden tot en met `tot` af zijn. */
export function diplomaBehaald(
  soort: DiplomaSoort,
  voortgang: Record<string, LesResultaat>,
): boolean {
  const diploma = DIPLOMAS.find((d) => d.soort === soort)
  if (!diploma) return false
  return WERELDEN.filter((w) => w.nummer <= diploma.tot).every((w) => wereldIsAf(w.id, voortgang))
}

export function sterrenTotaal(voortgang: Record<string, LesResultaat>): number {
  return Object.values(voortgang).reduce((som, r) => som + r.sterren, 0)
}

/** De eerste les die nog niet af is — de knop "verder waar je was". */
export function volgendeOpenLes(voortgang: Record<string, LesResultaat>) {
  return (
    ALLE_LESSEN.find((l) => (voortgang[l.id]?.sterren ?? 0) < 2 && isOntgrendeld(l.id, voortgang)) ??
    ALLE_LESSEN[0]
  )
}
