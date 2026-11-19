import { describe, expect, it } from 'vitest'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { pipBeeld, pipPraat } from '../src/ui/beelden'
import type { PipStemming } from '../src/ui/Pip'

/**
 * Pip beweegt binnen zijn eigen tekening (scripts/pip-tekenen.py): knipperen, oren,
 * een praatmond. Wie op zijn apparaat minder beweging heeft gekozen, moet een stilstaande
 * Pip krijgen; dat regelt een media query in elke SVG. Vergeet het script die bij een
 * nieuw bestand, dan beweegt Pip voor precies het kind dat daar last van heeft. De
 * doorloop kijkt in de browser of de animaties dan echt stilstaan; deze test vangt het
 * eerder, zonder browser.
 */
const MAP = join(process.cwd(), 'public', 'illustraties', 'pip')
const bestanden = readdirSync(MAP).filter((f) => f.endsWith('.svg'))
// Record: komt er een stemming bij, dan klaagt de typecheck hier tot hij erin staat.
const ALLE: Record<PipStemming, true> = { blij: true, juicht: true, verrast: true, denkt: true, moedigt: true, trots: true, slaapt: true }
const STEMMINGEN = Object.keys(ALLE) as PipStemming[]
const bestaat = (url: string) => existsSync(join(process.cwd(), 'public', url.replace(/^\//, '')))

describe('Pip-beelden', () => {
  it.each(bestanden)('%s staat stil bij minder beweging als hij beweegt', (f) => {
    const svg = readFileSync(join(MAP, f), 'utf8')
    if (!/animation\s*:|@keyframes/.test(svg)) return
    const rust = svg.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([^{}]*\{[^{}]*\})*\s*\}/)?.[0] ?? ''
    expect(rust, `${f} mist de media query voor minder beweging`).not.toBe('')
    expect(rust).toMatch(/\*\s*\{\s*animation\s*:\s*none\s*!important/)
  })

  // Geen SMIL (<animate>): dat laat zich niet door de media query stilzetten.
  it.each(bestanden)('%s beweegt alleen met CSS', (f) => {
    expect(readFileSync(join(MAP, f), 'utf8')).not.toMatch(/<animate|<set\b/)
  })

  it.each(STEMMINGEN)('Pip.tsx kan %s gewoon en pratend tonen', (s) => {
    expect(bestaat(pipBeeld(s, true)), pipBeeld(s, true)).toBe(true)
    expect(bestaat(pipPraat(s)), pipPraat(s)).toBe(true)
  })

  // De praatvariant laat de mond echt bewegen.
  it.each(STEMMINGEN)('%s praat met een bewegende mond', (s) => {
    const svg = readFileSync(join(process.cwd(), 'public', pipPraat(s)), 'utf8')
    expect(svg).toMatch(/class="m1"/)
    expect(svg).toMatch(/\.m1\{animation:/)
  })

  // De offline-voorraad (wereld 0–2) neemt alle Pips mee: klein houden.
  it.each(bestanden)('%s is kleiner dan 8 kB', (f) => {
    expect(statSync(join(MAP, f)).size).toBeLessThan(8 * 1024)
  })
})
