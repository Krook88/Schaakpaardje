/**
 * Een eigen deelplaatje per wereld en per schaakregelpagina (public/og/).
 *
 *   npm run build && npx tsx scripts/deelbeelden.ts
 *
 * Alle pagina's deelden één algemeen plaatje. Wie in WhatsApp "Hoe loopt het paard?"
 * doorstuurt, zag dan geen paard maar het logo (nulmeting volgende niveau). Nu staat
 * erop waar de link over gaat: het wapen en de kleur van de wereld, of het stuk.
 * Een plaatje per wereld en niet per les: 15 in plaats van 49, en een les deelt het
 * beeld van zijn wereld. Bekijk ze vóór je commit (emoji hangen af van de machine).
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { WERELDEN } from '../src/content'
import { SCHAAKREGELS } from '../src/content/schaakregels'

const UIT = join(process.cwd(), 'public', 'og')
mkdirSync(UIT, { recursive: true })
const GLYPH: Record<string, string> = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }

const kaart = (o: { toon: number; beeld: string; kop: string; onder: string; label: string; glyph?: boolean }) => `
<!doctype html><html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; font-family: 'DejaVu Sans', sans-serif;
    background: hsl(${o.toon} 50% 93%); color: #22201b; position: relative; overflow: hidden; }
  .vak { position: absolute; inset: 0; display: grid; grid-template-columns: 420px 1fr; align-items: center; padding: 0 70px; gap: 40px; }
  .wapen { width: 380px; height: 380px; border-radius: 50%; display: grid; place-items: center;
    background: hsl(${o.toon} 55% 82%); border: 10px solid hsl(${o.toon} 40% 55%);
    font-size: ${o.glyph ? 250 : 210}px; line-height: 1; color: #22201b; }
  .label { font-size: 30px; font-weight: 700; color: hsl(${o.toon} 45% 30%); letter-spacing: 0.04em; text-transform: uppercase; }
  h1 { font-size: 76px; line-height: 1.05; margin: 14px 0 18px; }
  p { font-size: 34px; line-height: 1.3; color: #4a443a; }
  .voet { position: absolute; left: 0; right: 0; bottom: 0; height: 64px; display: flex; align-items: center; gap: 14px;
    padding: 0 70px; background: hsl(${o.toon} 40% 45%); color: #fff; font-size: 28px; font-weight: 700; }
</style></head><body>
  <div class="vak"><div class="wapen">${o.beeld}</div>
  <div><div class="label">${o.label}</div><h1>${o.kop}</h1><p>${o.onder}</p></div></div>
  <div class="voet">🐴 Schaakmaatje · gratis schaken leren met Pip</div>
</body></html>`

const browser = await chromium.launch(process.env.CHROMIUM_PAD ? { executablePath: process.env.CHROMIUM_PAD } : {})
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
const maak = async (naam: string, html: string) => {
  await page.setContent(html)
  await page.screenshot({ path: join(UIT, naam), type: 'png' })
}
for (const w of WERELDEN) {
  await maak(`wereld-${w.id}.png`, kaart({ toon: w.toon, beeld: w.emoji, label: `Wereld ${w.nummer}`, kop: w.naam, onder: w.belofte }))
}
for (const o of SCHAAKREGELS) {
  const glyph = o.stuk ? GLYPH[o.stuk] : undefined
  await maak(`regel-${o.slug}.png`, kaart({ toon: 32, beeld: glyph ?? o.teken ?? '♞', glyph: Boolean(glyph), label: 'Schaakregels voor kinderen', kop: o.vraag, onder: o.kort }))
}
await browser.close()
console.log(`Deelplaatjes: ${WERELDEN.length} werelden en ${SCHAAKREGELS.length} schaakregels in public/og/.`)
