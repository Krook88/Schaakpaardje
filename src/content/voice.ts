/**
 * Wat Pip zegt buiten de lessen om: prijzen, aanmoedigen, hints, uitslagen.
 *
 * Per categorie staan meerdere varianten. Dat is geen luxe: kinderen spelen dezelfde
 * les tien keer, en één vaste zin gaat na drie keer irriteren. De speler kiest nooit
 * twee keer achter elkaar dezelfde variant.
 */

export const PIP = 'Pip'

export const PRIJS = [
  'Hoppa! Precies goed.',
  'Ja! Precies die.',
  'Goed hoor. Je ziet het.',
  'Helemaal goed, dat deed je knap.',
  'Yes! Volgende.',
] as const

export const PRIJS_LAATSTE = [
  'Top! Je hebt ze allemaal.',
  'Klaar! En alles goed.',
  'Dat was de laatste. Netjes!',
] as const

export const BIJNA = [
  'Bijna. Kijk nog eens goed.',
  'Nog niet. Probeer eens een ander veld.',
  'Hm, die kan niet. Kijk waar het stuk heen mag.',
  'Nee joh, niet erg. Nog een keer.',
] as const

export const AANMOEDIGING = [
  'Je kunt dit.',
  'Rustig kijken, dan zie je het.',
  'Neem de tijd hoor.',
] as const

export const HINT_AANGEBODEN = [
  'Zal ik een tipje geven?',
  'Wil je hulp van mij?',
] as const

export const HINT_KIJK_HIER = [
  'Kijk eens naar het veld dat oplicht.',
  'Ik laat een veld zien. Kijk daar eens.',
] as const

export const OPLOSSING = [
  'Ik laat het even voor. Kijk maar mee.',
  'Deze doen we samen. Zo dus.',
] as const

export const STER1 = ['Je hebt een ster! Nog eentje proberen?'] as const
export const STER2 = ['Twee sterren! De volgende les staat open.'] as const
export const STER3 = ['Drie sterren! Je krijgt er een sticker bij.'] as const

export const WERELD_AF = [
  'Deze hele wereld is uit! Wat ben jij goed bezig.',
  'Klaar met deze wereld. Hoefijzer verdiend!',
] as const

export const PARTIJ_START = [
  'Veel plezier. Denk eerst even na, dan pas zetten.',
  'Daar gaan we. Kijk goed wat je tegenstander doet.',
] as const

export const PARTIJ_GEWONNEN = [
  'Gewonnen! Mooi gespeeld.',
  'Je hebt gewonnen. Zullen we er nog een doen?',
] as const

export const PARTIJ_VERLOREN = [
  'Deze ging naar de ander. Volgende keer pak jij hem.',
  'Verloren, maar je hebt goede zetten gedaan.',
] as const

export const PARTIJ_REMISE = ['Gelijkspel! Niemand wint, allebei goed gespeeld.'] as const

export const BLUNDER_WAARSCHUWING = [
  'Weet je het zeker? Dan staat je stuk te pakken.',
  'Pas op, daar kan hij hem slaan.',
] as const

export const SCHAAK = ['Schaak! Je koning wordt aangevallen.'] as const
export const MAT_VOOR_JOU = ['Mat! De koning kan nergens meer heen.'] as const

/** Wordt gebruikt als er geen specifieke fout-tip in de opgave staat. */
export function foutTipVoorStuk(stuk: string): string {
  const tips: Record<string, string> = {
    toren: 'De toren loopt kaarsrecht. Nooit schuin.',
    loper: 'De loper loopt alleen schuin. Nooit recht.',
    dame: 'De dame mag recht en schuin. Maar niet met een knik.',
    paard: 'Het paard springt in een L: twee vooruit en één opzij.',
    koning: 'De koning zet maar één stapje tegelijk.',
    pion: 'De pion loopt recht vooruit, maar slaat schuin.',
  }
  return tips[stuk] ?? 'Kijk nog eens hoe dit stuk loopt.'
}
