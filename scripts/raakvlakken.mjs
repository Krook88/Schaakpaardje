/**
 * Raakvlakken meten: elke knop en link die kleiner is dan de lat (48 px, of 64 px op
 * de schermen van het kind). Voor docs/volgende-niveau.md.
 *
 *   npx serve out -l 4173 &  node scripts/raakvlakken.mjs
 */
import { chromium } from 'playwright'
const BASIS = process.env.MEET_URL ?? 'http://localhost:4173'
// Schermen van het kind (64) en van de ouder/bezoeker (48).
const PAGINAS = [
  ['/', 48], ['/les/weide-1/', 64], ['/kaart/', 64], ['/spelen/', 64], ['/spelen/mila/', 64],
  ['/spel/hongerig-paardje/', 64], ['/diploma/brons/', 64], ['/ouders/', 48],
]
// Na het laden ook nog: in de les door naar de eerste opgave (daar is Pip klein).
const DOOR = { '/les/weide-1/': /Verder|Ik ga het proberen/ }
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PAD ?? '/opt/pw-browsers/chromium' })
let totaal = 0
for (const breed of [360, 390]) for (const [pad, lat] of PAGINAS) {
  const p = await browser.newPage({ viewport: { width: breed, height: 800 } })
  await p.goto(BASIS + pad, { waitUntil: 'networkidle' })
  await p.waitForTimeout(500)
  if (DOOR[pad]) {
    for (let i = 0; i < 8; i++) {
      const k = p.getByRole('button', { name: DOOR[pad] })
      if (!(await k.count())) break
      await k.first().click()
      await p.waitForTimeout(300)
    }
  }
  const klein = await p.evaluate((lat) => [
    // Bordvelden: eigen lat van 44 (acht naast elkaar passen niet op 64).
    ...[...document.querySelectorAll('[data-square]')].slice(0, 1)
      .map((e) => e.getBoundingClientRect())
      .filter((r) => r.width < 44)
      .map((r) => `${Math.round(r.width)}×${Math.round(r.height)} bordveld (lat 44)`),
    ...[...document.querySelectorAll('a, button, summary, [role=button], input, select, label[for]')]
      .filter((e) => !e.closest('[data-square]') && !e.matches('[data-square]'))
      .filter((e) => !(e.matches('input') && e.type === 'hidden'))
      .map((e) => ({ e, r: e.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && r.height > 0 && (r.width < lat || r.height < lat))
      // Links in lopende tekst tellen niet mee: daar geldt de tekstregel (WCAG 2.5.8, inline).
      .filter(({ e }) => !(e.tagName === 'A' && getComputedStyle(e).display === 'inline' && e.closest('p')))
      .map(({ e, r }) => `${Math.round(r.width)}×${Math.round(r.height)} ${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 30)}`),
  ], lat)
  totaal += klein.length
  console.log(`${breed} ${pad} (lat ${lat}): ${klein.length}`)
  for (const k of klein) console.log('   ', k)
  await p.close()
}
await browser.close()
console.log(`totaal te klein: ${totaal}`)
