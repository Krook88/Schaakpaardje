// Tekent de app-iconen (beginscherm telefoon en computer) uit Pip: een groen vlak met
// zijn getekende kop. Draai: node scripts/app-icoon.mjs (na een wijziging aan Pip).
// - icon-192.png, icon-512.png: afgeronde hoeken, voor Android/Chrome en de computer.
// - icon-maskable-512.png: tot de rand groen, Pip binnen de veilige 80%-cirkel.
// - apple-touch-icon.png (180): tot de rand, iOS rondt zelf af.
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
const pip = readFileSync('public/illustraties/pip/pip-blij.svg').toString('base64')
const groen = '#4e7a54'
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PAD ?? '/opt/pw-browsers/chromium' })
for (const [naam, maat, rond, pipDeel] of [
  ['icon-192.png', 192, 0.19, 0.78],
  ['icon-512.png', 512, 0.19, 0.78],
  ['icon-maskable-512.png', 512, 0, 0.62],
  ['apple-touch-icon.png', 180, 0, 0.74],
]) {
  const p = await b.newPage({ viewport: { width: maat, height: maat } })
  const pm = Math.round(maat * pipDeel)
  await p.setContent(`<body style="margin:0;background:transparent"><div style="width:${maat}px;height:${maat}px;border-radius:${Math.round(maat * rond)}px;background:${groen};display:grid;place-items:center"><img src="data:image/svg+xml;base64,${pip}" style="width:${pm}px;height:${pm}px"></div></body>`)
  await p.waitForTimeout(100)
  await p.screenshot({ path: `public/${naam}`, omitBackground: true })
  await p.close()
}
await b.close()
console.log('App-iconen getekend in public/')
