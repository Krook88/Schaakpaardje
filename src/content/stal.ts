/**
 * Wat er in Pips stal komt te staan.
 *
 * De beloningen waren tot nu toe 207 keer hetzelfde plaatje: 144 identieke sterren en
 * 48 identieke medailles. Van alles wat een kind in maanden verzamelde waren er precies
 * drie dingen echt verschillend, en dat waren de diploma's.
 *
 * Dit is de verzameling die daar tegenover staat. Zestien stuks, in drie soorten, elk
 * met een eigen manier om hem te krijgen en een eigen zeldzaamheid:
 *
 *   stuk     (6)  je speelt de wereld van dat stuk uit
 *   maatje   (7)  je wint een keer van die tegenstander
 *   hoefijzer (3) een diploma
 *
 * Geen willekeur, geen dubbele, niets dat je kunt mislopen. Alles hangt aan iets wat het
 * kind echt gedaan heeft, en alles is één keer te krijgen. Wie een week wegblijft raakt
 * niets kwijt — dat is het verschil tussen een verzameling en een tredmolen.
 */
import { WERELDEN } from './index'

export type StalSoort = 'stuk' | 'maatje' | 'hoefijzer'

export type StalStuk = {
  id: string
  soort: StalSoort
  naam: string
  /** Het beeld zelf. Bij de stukken een echt schaakteken, bij de maatjes hun dier. */
  teken: string
  /** Kleurtoon, zodat een stuk de kleur van zijn eigen wereld draagt. */
  toon: number
  /** Wat een kind moet doen om hem te krijgen. Pip zegt dit als je op een leeg vak tikt. */
  hoe: string
}

/** De zes stukken, elk in de kleur van zijn eigen wereld. */
const STUKWERELDEN: { wereldId: string; teken: string; naam: string }[] = [
  { wereldId: 'toren', teken: '♜', naam: 'De toren' },
  { wereldId: 'loper', teken: '♝', naam: 'De loper' },
  { wereldId: 'dame', teken: '♛', naam: 'De dame' },
  { wereldId: 'paard', teken: '♞', naam: 'Het paard' },
  { wereldId: 'koning', teken: '♚', naam: 'De koning' },
  { wereldId: 'pion', teken: '♟', naam: 'De pion' },
]

const MAATJES: { botId: string; naam: string; teken: string; toon: number }[] = [
  { botId: 'mila', naam: 'Mila de Muis', teken: '🐭', toon: 320 },
  { botId: 'kiki', naam: 'Kip Kiki', teken: '🐣', toon: 50 },
  { botId: 'rens', naam: 'Rens het Konijn', teken: '🐰', toon: 15 },
  { botId: 'bas', naam: 'Bas de Hond', teken: '🐶', toon: 30 },
  { botId: 'fien', naam: 'Fien de Vos', teken: '🦊', toon: 22 },
  { botId: 'oscar', naam: 'Oscar de Uil', teken: '🦉', toon: 260 },
  { botId: 'bram', naam: 'Bram de Beer', teken: '🐻', toon: 25 },
]

const HOEFIJZERS: { soort: string; naam: string; teken: string; toon: number; hoe: string }[] = [
  { soort: 'brons', naam: 'Hoefijzer brons', teken: '🥉', toon: 25, hoe: 'Speel alle werelden uit tot en met Pionnenveld.' },
  { soort: 'zilver', naam: 'Hoefijzer zilver', teken: '🥈', toon: 210, hoe: 'Speel door tot en met Notatiedorp.' },
  { soort: 'goud', naam: 'Hoefijzer goud', teken: '🥇', toon: 45, hoe: 'Speel de hele reis uit, tot en met de Eindspelduinen.' },
]

/** Alles wat er te verzamelen valt, in de volgorde waarin het op de plank staat. */
export const STALSTUKKEN: StalStuk[] = [
  ...STUKWERELDEN.map(({ wereldId, teken, naam }) => {
    const wereld = WERELDEN.find((w) => w.id === wereldId)
    if (!wereld) throw new Error(`Stal verwijst naar een wereld die niet bestaat: ${wereldId}`)
    return {
      id: `stuk-${wereldId}`,
      soort: 'stuk' as const,
      naam,
      teken,
      toon: wereld.toon,
      hoe: `Speel ${wereld.naam} helemaal uit.`,
    }
  }),
  ...MAATJES.map((m) => ({
    id: `maatje-${m.botId}`,
    soort: 'maatje' as const,
    naam: m.naam,
    teken: m.teken,
    toon: m.toon,
    hoe: `Win een keer van ${m.naam}.`,
  })),
  ...HOEFIJZERS.map((h) => ({
    id: `hoefijzer-${h.soort}`,
    soort: 'hoefijzer' as const,
    naam: h.naam,
    teken: h.teken,
    toon: h.toon,
    hoe: h.hoe,
  })),
]

export const SOORTNAAM: Record<StalSoort, string> = {
  stuk: 'Mijn stukken',
  maatje: 'Mijn maatjes',
  hoefijzer: 'Mijn hoefijzers',
}
