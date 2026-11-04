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
 *
 * Draai dit opnieuw als een wereldnaam, belofte, vraag of `kort` verandert: de tekst
 * staat in het plaatje gebakken. Alleen dan: elke generatie is ~2 MB in git.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { WERELDEN } from '../src/content'
import { SCHAAKREGELS } from '../src/content/schaakregels'

const UIT = join(process.cwd(), 'public', 'og')
mkdirSync(UIT, { recursive: true })
const GLYPH: Record<string, string> = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }

const escape = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/** Geen weesje: de laatste twee woorden blijven bij elkaar. En "L-sprong" breekt niet. */
const zet = (t: string) => escape(t).replace(/L-/g, 'L\u2011').replace(/ (\S+)$/, '\u00a0$1')
// Een kop die langer is, krijgt een kleinere letter, zodat hij met marge in twee regels past.
const kopMaat = (t: string) => (t.length > 26 ? 56 : t.length > 18 ? 62 : t.length > 13 ? 68 : 76)
// Een klein geblokt bord (8×8, licht rechtsonder) voor de pagina over het opzetten.
const BORDJE = `<svg viewBox="0 0 8 8" width="230" height="230" shape-rendering="crispEdges">${Array.from({ length: 64 }, (_, i) => {
  const x = i % 8
  const y = Math.floor(i / 8)
  return `<rect x="${x}" y="${y}" width="1" height="1" fill="${(x + y) % 2 ? '#7d9a76' : '#f1e8da'}"/>`
}).join('')}<rect x="0" y="0" width="8" height="8" fill="none" stroke="#5a4a36" stroke-width="0.12"/></svg>`

const kaart = (o: { toon: number; beeld: string; kop: string; onder: string; label: string; glyph?: boolean }) => `
<!doctype html><html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; font-family: 'DejaVu Sans', sans-serif;
    background: hsl(${o.toon} 50% 93%); color: #22201b; position: relative; overflow: hidden; }
  .vak { position: absolute; inset: 0 0 64px; display: grid; grid-template-columns: 420px 1fr; align-items: center; padding: 0 70px 0 70px; gap: 40px; }
  .vak > div:last-child { padding-right: 0; max-width: 600px; }
  .wapen { width: 380px; height: 380px; border-radius: 50%; display: grid; place-items: center;
    background: hsl(${o.toon} 55% 82%); border: 10px solid hsl(${o.toon} 40% 55%);
    font-size: ${o.glyph ? 250 : 210}px; line-height: 1; color: #22201b; }
  .label { font-size: 30px; font-weight: 700; color: hsl(${o.toon} 45% 30%); letter-spacing: 0.04em; text-transform: uppercase; }
  h1 { font-size: ${kopMaat(o.kop)}px; line-height: 1.05; margin: 14px 0 18px; }
  p { font-size: 34px; line-height: 1.3; color: #4a443a; }
  .voet { position: absolute; left: 0; right: 0; bottom: 0; height: 64px; display: flex; align-items: center; gap: 14px;
    padding: 0 70px; background: hsl(${o.toon} 45% 30%); color: #fff; font-size: 28px; font-weight: 700; }
</style></head><body>
  <div class="vak"><div class="wapen">${o.beeld}</div>
  <div><div class="label">${escape(o.label)}</div><h1>${zet(o.kop)}</h1><p>${zet(o.onder)}</p></div></div>
  <div class="voet">🐴 Schaakmaatje · gratis schaken leren met Pip · 3–10 jaar</div>
</body></html>`

const browser = await chromium.launch(process.env.CHROMIUM_PAD ? { executablePath: process.env.CHROMIUM_PAD } : {})
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
const maak = async (naam: string, html: string) => {
  await page.setContent(html)
  await page.screenshot({ path: join(UIT, naam), type: 'png' })
}
for (const w of WERELDEN) {
  // Met U+FE0F: zonder dat tekende ⚡ (Schaakmeer) als dun zwart lijntje.
  const emoji = w.emoji.endsWith('\uFE0F') ? w.emoji : `${w.emoji}\uFE0F`
  await maak(`wereld-${w.id}.png`, kaart({ toon: w.toon, beeld: emoji, label: `Wereld ${w.nummer}`, kop: w.naam, onder: w.belofte }))
}
for (const o of SCHAAKREGELS) {
  const glyph = o.stuk ? GLYPH[o.stuk] : undefined
  // Twee tekens die weinig zeiden (34e review): een raster voor het bord, een pijl voor
  // en passant. Nu een echt bordje en de pion waar het over gaat.
  const beeld = o.slug === 'schaakbord-opzetten' ? BORDJE : o.slug === 'en-passant' ? GLYPH.p : (glyph ?? o.teken ?? '♞')
  await maak(`regel-${o.slug}.png`, kaart({ toon: 32, beeld, glyph: Boolean(glyph) || o.slug === 'en-passant', label: 'Schaakregels voor kinderen', kop: o.vraag, onder: o.kort }))
}
await maak('schaakclub.png', kaart({ toon: 140, beeld: '🏆', label: 'Voor ouders', kop: 'Een schaakclub voor je kind vinden', onder: 'Klaar voor het echte bord? Zo vind je een club in de buurt.' }))
await browser.close()
console.log(`Deelplaatjes: ${WERELDEN.length} werelden en ${SCHAAKREGELS.length} schaakregels in public/og/.`)
