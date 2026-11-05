import { maatjeBeeld } from './beelden'

/** De namen van de maatjes, voor de schermlezer en "Kies …". */
export const MAATJE_NAAM: Record<string, string> = {
  '🐴': 'paard', '🦊': 'vos', '🐻': 'beer', '🐰': 'konijn',
  '🦉': 'uil', '🐢': 'schildpad', '🐝': 'bij', '🦄': 'eenhoorn',
}

/**
 * Het maatje van een kind als tekening (public/illustraties/maatjes/, scripts/maatjes-
 * tekenen.py), in de stijl van Pip en de bots. Het profiel bewaart nog steeds de emoji:
 * zo houden bestaande profielen hun maatje. Een onbekende emoji blijft een emoji.
 */
export function Maatje({ emoji, maat = 32 }: { emoji: string; maat?: number }) {
  const src = maatjeBeeld(emoji)
  if (!src) return <span aria-hidden="true">{emoji}</span>
  return (
    // eslint-disable-next-line @next/next/no-img-element -- statische export, SVG
    <img src={src} alt="" aria-hidden="true" width={maat} height={maat} draggable={false} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
  )
}
