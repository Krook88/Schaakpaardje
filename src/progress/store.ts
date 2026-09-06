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

/**
 * Waarmee een profiel begint, afhankelijk van de modus.
 *
 * Hier stond één rijtje voor iedereen. De app vroeg dus wel hoe oud je bent, rekende er
 * netjes een modus uit — en las die daarna nergens meer. Een driejarige en een
 * tienjarige kregen letterlijk hetzelfde scherm, hetzelfde tempo en dezelfde hulp.
 *
 * De verschillen zijn met opzet klein en allemaal een instélling: de ouder kan elk van
 * deze schuifjes daarna gewoon omzetten in het ouderscherm. Dit is een startpunt, geen
 * hek.
 */
export function standaardInstellingen(modus: Modus): Instellingen {
  switch (modus) {
    case 'pip':
      // Rustiger praten (0,8 is de langzaamste stand die het ouderscherm ook aanbiedt). Coördinaten zijn voor wie nog niet leest alleen ruis op het
      // bord, en de blunderwaarschuwing hoort hier gewoon aan te staan.
      return { ...STANDAARD_INSTELLINGEN, tempo: 0.8 }
    case 'ontdekker':
      return { ...STANDAARD_INSTELLINGEN }
    case 'schaker':
      // Coördinaten aan: voor deze leeftijd is notatie leerstof (wereld 12), geen ruis.
      // Blunderwaarschuwing uit: een tienjarige mag een stuk weggeven en het zélf
      // merken — dat is het moment waarop je leert kijken.
      return {
        ...STANDAARD_INSTELLINGEN,
        coordinaten: true,
        tempo: 1.2,
        blunderWaarschuwing: false,
      }
  }
}

/**
 * Tot welke `minLeeftijd` een wereld meteen openstaat.
 *
 * Zonder dit is de kaart strikt lineair: elke les eist twee sterren op de les ervóór,
 * alle achtenveertig. Een negenjarige moest dus eerst twaalf lessen over licht/donker
 * en rijen/lijnen doorploegen voordat de dame in beeld kwam — terwijl `minLeeftijd` op
 * elke wereld staat en nergens gelezen werd.
 *
 * Openzetten is niet overslaan: "Verder leren" blijft wijzen naar de eerste les die nog
 * geen twee sterren heeft, dus wie gewoon op de grote knop drukt loopt precies het pad
 * van hiervoor. Een oudere beginner mág alleen vooruitspringen, en kan altijd terug.
 *
 * Let op de bovengrens: Matklif heeft `minLeeftijd: 8` en staat dus voor niemand
 * vooruit open, ook niet voor een tienjarige. Mat blijft achter de hele reis zitten —
 * dat late uitstel ís de methode, en dat hoort geen leeftijdsknop te kunnen omzeilen.
 */
const VOORSPRONG: Record<Modus, number> = { pip: 0, ontdekker: 3, schaker: 6 }

/** Staat deze les vanaf dag één open, los van wat het kind al gedaan heeft? */
function vanafHetBegin(lesId: string, modus: Modus): boolean {
  const wereld = WERELDEN.find((w) => w.lessen.some((l) => l.id === lesId))
  return wereld ? wereld.minLeeftijd <= VOORSPRONG[modus] : false
}

export const AVATARS = ['🐴', '🦊', '🐻', '🐰', '🦉', '🐢', '🐝', '🦄'] as const

type State = {
  profielen: Profiel[]
  actiefId: string | null
  voortgang: Record<string, Record<string, LesResultaat>>
  instellingen: Record<string, Instellingen>
  stickers: Record<string, string[]>
  /**
   * Waar het kind in een les gebleven is, per les.
   *
   * Een les is acht à tien stappen. Wie er bij stap zeven mee ophoudt — omdat het eten
   * is, of omdat de knop linksboven verleidelijk dichtbij zit — begon daarna weer
   * helemaal vooraan. Voor een vijfjarige is dat precies één keer, en daarna nooit meer.
   */
  hervatpunt: Record<string, Record<string, string>>
  /**
   * Van welke tegenstanders dit kind ooit gewonnen heeft.
   *
   * `gespeeld` telde alleen op hoeveel partijen er gewonnen waren, niet van wie. Voor
   * de stal moeten we het per tegenstander weten: elk maatje komt één keer bij je
   * wonen, en dan blijft hij.
   */
  verslagen: Record<string, string[]>
  gespeeld: Record<string, { gewonnen: number; verloren: number; remise: number }>

  maakProfiel: (naam: string, leeftijd: number, avatar: string) => string
  kiesProfiel: (id: string) => void
  verwijderProfiel: (id: string) => void
  zetInstelling: <K extends keyof Instellingen>(sleutel: K, waarde: Instellingen[K]) => void
  /**
   * De ouder zet de leeftijd bij, en de modus schuift mee.
   *
   * De leeftijd werd één keer gevraagd en daarna nooit meer: een kind dat jarig was
   * bleef voorgoed vijf. Verzetten past ook de modus aan, want dat is waar de leeftijd
   * voor dient; wie daarna een andere modus wil, kiest die er los bij.
   */
  zetLeeftijd: (leeftijd: number) => void
  /** De ouder verzet de modus van het actieve profiel. Verandert geen voortgang. */
  zetModus: (modus: Modus) => void
  /** Alle schuifjes terug naar wat bij de huidige modus hoort. */
  herstelInstellingen: () => void
  bewaarLes: (lesId: string, resultaat: Omit<LesResultaat, 'laatst'>) => void
  bewaarHervatpunt: (lesId: string, fase: string | null) => void
  bewaarOpfrissing: (lesId: string) => void
  bewaarOverwinning: (botId: string) => void
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
      hervatpunt: {},
      verslagen: {},
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
          instellingen: { ...s.instellingen, [id]: standaardInstellingen(profiel.modus) },
          stickers: { ...s.stickers, [id]: [] },
          gespeeld: { ...s.gespeeld, [id]: { gewonnen: 0, verloren: 0, remise: 0 } },
        }))
        return id
      },

      kiesProfiel(id) {
        set({ actiefId: id })
      },

      zetLeeftijd(leeftijd) {
        set((s) => {
          if (!s.actiefId) return s
          return {
            profielen: s.profielen.map((p) =>
              p.id === s.actiefId
                ? { ...p, leeftijd, modus: modusVoorLeeftijd(leeftijd) }
                : p,
            ),
          }
        })
      },

      zetModus(modus) {
        set((s) => {
          if (!s.actiefId) return s
          return {
            profielen: s.profielen.map((p) => (p.id === s.actiefId ? { ...p, modus } : p)),
          }
        })
      },

      /**
       * Terug naar de standaard van de huidige modus.
       *
       * Van modus wisselen laat de instellingen expres staan: het kunnen keuzes van de
       * ouder zijn, en die overschrijf je niet stilzwijgend. Maar dan moet er wel een
       * weg terug zijn — anders houdt een profiel dat op vijf jaar is aangemaakt tot in
       * lengte van dagen het rustige tempo en de veldnamen uit, ook als het kind
       * inmiddels negen is.
       */
      herstelInstellingen() {
        set((s) => {
          const id = s.actiefId
          if (!id) return s
          const modus = s.profielen.find((p) => p.id === id)?.modus ?? 'pip'
          return { instellingen: { ...s.instellingen, [id]: standaardInstellingen(modus) } }
        })
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

      /**
       * Deze les is net opgefrist.
       *
       * Alleen de datum schuift op: de sterren, de fouten en de hints van de échte les
       * blijven staan. Zo zakt de les weer terug in de rij en komt er iets anders
       * bovendrijven — dat is het hele mechaniek van herhalen op afstand. En een
       * opfrisser mag nooit een cijfer veranderen: het is oefenen, geen toets.
       */
      bewaarOpfrissing(lesId) {
        const id = get().actiefId
        if (!id) return
        set((s) => {
          const vanProfiel = s.voortgang[id] ?? {}
          const bestaand = vanProfiel[lesId]
          if (!bestaand) return {}
          return {
            voortgang: {
              ...s.voortgang,
              [id]: { ...vanProfiel, [lesId]: { ...bestaand, laatst: new Date().toISOString() } },
            },
          }
        })
      },

      bewaarOverwinning(botId) {
        const id = get().actiefId
        if (!id) return
        set((s) => {
          const lijst = s.verslagen[id] ?? []
          if (lijst.includes(botId)) return {}
          return { verslagen: { ...s.verslagen, [id]: [...lijst, botId] } }
        })
      },

      bewaarHervatpunt(lesId, fase) {
        const id = get().actiefId
        if (!id) return
        set((s) => {
          const vanProfiel = { ...(s.hervatpunt[id] ?? {}) }
          if (fase) vanProfiel[lesId] = fase
          else delete vanProfiel[lesId]
          return { hervatpunt: { ...s.hervatpunt, [id]: vanProfiel } }
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

/** De modus van het actieve profiel. Zonder profiel de voorzichtigste: pip. */
export function useModus(): Modus {
  return useProfielStore((s) => actiefProfiel(s)?.modus ?? 'pip')
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

/** Waar was dit kind gebleven in deze les? Leeg als het nog niet begonnen is. */
export function useHervatpunt(lesId: string): string | null {
  return useProfielStore((s) => (s.actiefId ? (s.hervatpunt[s.actiefId]?.[lesId] ?? null) : null))
}

const LEGE_VERSLAGEN: string[] = []

/** Van wie heeft dit kind al eens gewonnen? */
export function useVerslagen(): string[] {
  return useProfielStore(
    useShallow((s) => (s.actiefId ? (s.verslagen[s.actiefId] ?? LEGE_VERSLAGEN) : LEGE_VERSLAGEN)),
  )
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
export function isOntgrendeld(
  lesId: string,
  voortgang: Record<string, LesResultaat>,
  modus: Modus = 'pip',
): boolean {
  const index = ALLE_LESSEN.findIndex((l) => l.id === lesId)
  if (index <= 0) return true
  // Standaard 'pip': wie de modus niet meegeeft krijgt het strikt lineaire pad, en
  // niemand gaat dus per ongeluk open door een vergeten argument.
  if (vanafHetBegin(lesId, modus)) return true
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

/**
 * De eerste les die nog niet af is — de knop "verder waar je was".
 *
 * Dit blijft de eerste les in de vaste volgorde, ook als er voor een oudere beginner
 * werelden vooruit openstaan. Dat is de bedoeling: de grote knop volgt het pad, de
 * kaart geeft de vrijheid.
 */
export function volgendeOpenLes(voortgang: Record<string, LesResultaat>, modus: Modus = 'pip') {
  return (
    ALLE_LESSEN.find(
      (l) => (voortgang[l.id]?.sterren ?? 0) < 2 && isOntgrendeld(l.id, voortgang, modus),
    ) ?? ALLE_LESSEN[0]
  )
}
