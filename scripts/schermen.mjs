/**
 * De schermafbeeldingen op de startpagina en in de deelkaart (public/schermen/).
 *
 *   npm run build && npx serve out -l 4173 &
 *   node scripts/schermen.mjs     # daarna: node scripts/deelbeeld.mjs
 *
 * Ze waren met de hand gemaakt en liepen achter op de app: het lesscherm liet nog
 * Pips speldje over zijn gezicht zien, een fout die al lang weg was (31e review). Nu
 * neem je ze opnieuw op wanneer een scherm verandert. Bekijk ze vóór je commit.
 */
import { chromium } from 'playwright'

const BASIS = process.env.SCHERM_URL ?? 'http://localhost:4173'
const UIT = new URL('../public/schermen/', import.meta.url).pathname
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PAD ?? '/opt/pw-browsers/chromium' })
const nieuw = async () => {
  const ctx = await browser.newContext({ viewport: { width: 400, height: 640 }, reducedMotion: 'reduce' })
  return [ctx, await ctx.newPage()]
}

// Het lesscherm: eerste opgave, twee velden al goed.
{
  const [ctx, p] = await nieuw()
  await p.goto(`${BASIS}/les/weide-1/`, { waitUntil: 'networkidle' })
  for (let i = 0; i < 10 && !(await p.getByRole('button', { name: /Ik ga het proberen/ }).count()); i++) {
    await p.getByRole('button', { name: /Verder/ }).first().click()
    await p.waitForTimeout(300)
  }
  await p.getByRole('button', { name: /Ik ga het proberen/ }).click()
  await p.waitForTimeout(600)
  for (const v of ['a1', 'c1']) await p.locator(`[data-square="${v}"]`).click()
  await p.waitForTimeout(500)
  await p.screenshot({ path: `${UIT}les.png` })
  await ctx.close()
}
// De kaart van een nieuwe bezoeker.
{
  const [ctx, p] = await nieuw()
  await p.goto(`${BASIS}/kaart/`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(400)
  await p.screenshot({ path: `${UIT}kaart.png` })
  await ctx.close()
}
// Een partij tegen de eerste bot.
{
  const [ctx, p] = await nieuw()
  await p.goto(`${BASIS}/spelen/mila/`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(800)
  const begin = p.getByRole('button', { name: /^Beginnen/ })
  if (await begin.count()) await begin.click()
  await p.waitForTimeout(800)
  await p.screenshot({ path: `${UIT}partij.png` })
  await ctx.close()
}
await browser.close()
console.log(`Schermafbeeldingen bijgewerkt in ${UIT}`)
