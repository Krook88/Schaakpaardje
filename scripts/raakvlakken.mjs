/**
 * Raakvlakken meten: elke knop en link die kleiner is dan de lat (48 px, of 64 px op
 * de schermen van het kind). Voor docs/volgende-niveau.md.
 *
 *   npx serve out -l 4173 &  node scripts/raakvlakken.mjs
 */
import { chromium } from 'playwright'
const BASIS = process.env.MEET_URL ?? 'http://localhost:4173'
// Schermen van het kind (64) en van de ouder/bezoeker (48).
const PAGINAS = [['/', 48], ['/les/weide-1/', 64], ['/kaart/', 64], ['/spelen/', 64], ['/ouders/', 48]]
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PAD ?? '/opt/pw-browsers/chromium' })
let totaal = 0
for (const [pad, lat] of PAGINAS) {
  const p = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await p.goto(BASIS + pad, { waitUntil: 'networkidle' })
  await p.waitForTimeout(500)
  const klein = await p.evaluate((lat) =>
    [...document.querySelectorAll('a, button, summary, [role=button]')]
      .filter((e) => !e.closest('[data-square]') && !e.matches('[data-square]'))
      .map((e) => ({ e, r: e.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && r.height > 0 && (r.width < lat || r.height < lat))
      // Links in lopende tekst tellen niet mee: daar geldt de tekstregel (WCAG 2.5.8, inline).
      .filter(({ e }) => !(e.tagName === 'A' && getComputedStyle(e).display === 'inline'))
      .map(({ e, r }) => `${Math.round(r.width)}×${Math.round(r.height)} ${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 30)}`), lat)
  totaal += klein.length
  console.log(`${pad} (lat ${lat}): ${klein.length}`)
  for (const k of klein) console.log('   ', k)
  await p.close()
}
await browser.close()
console.log(`totaal te klein: ${totaal}`)
