/**
 * Meting voor docs/volgende-niveau.md: past het bord, scrolt de pagina, hoe groot is
 * een veld — op telefoon, tablet en computer, staand en liggend.
 *
 *   npx serve out -l 4173 &
 *   node scripts/meet-niveau.mjs            # MEET_URL en CHROMIUM_PAD mogen anders
 *
 * Schermafbeeldingen gaan naar MEET_MAP (standaard een tijdelijke map), niet naar
 * docs/: kies daar zelf welke je bewaart.
 */
import { chromium } from 'playwright'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const URL = process.env.MEET_URL ?? 'http://localhost:4173'
const MAP = process.env.MEET_MAP ?? mkdtempSync(join(tmpdir(), 'meet-niveau-'))
const MATEN = [[360, 740], [390, 844], [768, 1024], [1024, 768], [1180, 820], [1440, 900], [844, 390]]

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PAD ?? '/opt/pw-browsers/chromium' })
for (const kleur of ['light', 'dark']) {
  for (const [w, h] of MATEN) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, colorScheme: kleur })
    await page.goto(`${URL}/les/weide-1/`, { waitUntil: 'networkidle' })
    for (const fase of ['kijken', 'opgave']) {
      if (fase === 'opgave') {
        const knop = page.getByRole('button', { name: /Verder|proberen/ })
        for (let i = 0; i < 8 && (await knop.count()); i++) {
          await knop.first().click()
          await page.waitForTimeout(300)
        }
      }
      const m = await page.evaluate(() => {
        const r = document.querySelector('[data-square]').closest('[role=group]').getBoundingClientRect()
        const el = document.documentElement
        return { veld: Math.round(r.width / 8), onder: Math.round(r.bottom), pagina: el.scrollHeight, breedteScroll: el.scrollWidth > innerWidth }
      })
      console.log(`${w}×${h} ${kleur} ${fase}`, JSON.stringify(m))
      await page.screenshot({ path: join(MAP, `${fase}-${w}x${h}-${kleur}.png`) })
    }
    await page.close()
  }
}
await browser.close()
console.log(`Schermafbeeldingen: ${MAP}`)
