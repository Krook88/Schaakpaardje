/**
 * De plaatjes die Google, WhatsApp en Facebook bij een link van Schaakmaatje tonen.
 *
 *   node scripts/deelbeeld.mjs
 *
 * Het oude plaatje was alleen tekst op een lichte achtergrond. Google liet bij de site
 * daarom geen foto zien in de zoekresultaten: tekst is geen beeld van wat de site ís.
 * Nu staan Pip en een echt lesscherm erop.
 *
 * Twee maten: 1200×630 voor de deelkaart (og:image) en 1200×1200 voor Google, dat in
 * de resultaten vaak een vierkant uitsnijdt. Het lesscherm komt uit `public/schermen`,
 * dezelfde afbeelding als op /over. De uitkomst staat in git; dit script hoeft alleen
 * opnieuw als het lesscherm of de tekst verandert.
 */
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const CHROMIUM = process.env.CHROMIUM_PAD ?? '/opt/pw-browsers/chromium'
const scherm = `data:image/png;base64,${readFileSync('public/schermen/les.png').toString('base64')}`

const stijl = `
  * { box-sizing: border-box; margin: 0; }
  body { font-family: 'DejaVu Sans', sans-serif; background: #f5f0e6; color: #22201b; }
  .doek { position: relative; overflow: hidden; display: flex; align-items: center; }
  .pip {
    display: grid; place-items: center; width: 132px; height: 132px; border-radius: 50%;
    background: #e3ecdf; border: 5px solid #d9cfbd; font-size: 82px; line-height: 1;
  }
  h1 { font-size: 86px; font-weight: 800; letter-spacing: -1px; }
  .slogan { color: #b45c16; font-size: 38px; font-weight: 700; line-height: 1.2; }
  .feiten { color: #5f5a50; font-size: 30px; font-weight: 600; }
  .telefoon {
    background: #fffdf8; border: 10px solid #2f2c27; border-radius: 40px; overflow: hidden;
    box-shadow: 0 24px 60px rgba(40, 30, 10, 0.28);
  }
  .telefoon img { display: block; width: 100%; }
  .bord { position: absolute; left: 0; right: 0; bottom: 0; height: 44px; display: flex; }
  .bord span { flex: 1; background: #f0e8da; }
  .bord span:nth-child(even) { background: #8fa98a; }
`
const bordrand = `<div class="bord">${'<span></span>'.repeat(16)}</div>`

const breed = `
  <style>${stijl}
    .doek { width: 1200px; height: 630px; padding: 0 70px 44px; gap: 50px; }
    .tekst { flex: 1; display: flex; flex-direction: column; gap: 20px; }
    .telefoon { width: 300px; transform: rotate(3deg) translateY(36px); }
  </style>
  <div class="doek">
    <div class="tekst">
      <div class="pip">🐴</div>
      <h1>Schaakmaatje</h1>
      <p class="slogan">Leer schaken met Pip<br>het schaakpaardje</p>
      <p class="feiten">Gratis · 3 tot 10 jaar · Pip leest alles voor</p>
    </div>
    <div class="telefoon"><img src="${scherm}" alt=""></div>
    ${bordrand}
  </div>`

const vierkant = `
  <style>${stijl}
    .doek { width: 1200px; height: 1200px; padding: 64px 60px 0; flex-direction: column; gap: 18px; text-align: center; }
    .kop { display: flex; align-items: center; gap: 28px; }
    h1 { font-size: 100px; }
    .slogan { font-size: 46px; }
    .feiten { font-size: 32px; }
    .telefoon { width: 440px; margin-top: 30px; transform: rotate(2deg); }
  </style>
  <div class="doek">
    <div class="kop"><div class="pip">🐴</div><h1>Schaakmaatje</h1></div>
    <p class="slogan">Leer schaken met Pip het schaakpaardje</p>
    <p class="feiten">Gratis · 3 tot 10 jaar · Pip leest alles voor</p>
    <div class="telefoon"><img src="${scherm}" alt=""></div>
    ${bordrand}
  </div>`

const browser = await chromium.launch({ executablePath: CHROMIUM })
for (const [naam, html, hoogte] of [
  ['og.png', breed, 630],
  ['og-vierkant.png', vierkant, 1200],
]) {
  const page = await browser.newPage({ viewport: { width: 1200, height: hoogte } })
  await page.setContent(html, { waitUntil: 'load' })
  await page.screenshot({ path: `public/${naam}` })
  await page.close()
  console.log(`public/${naam}`)
}
await browser.close()
