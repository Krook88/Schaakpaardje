import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const p = await b.newPage({ viewport: { width: 420, height: 900 } })
const fouten = []
p.on('console', (m) => m.type() === 'error' && fouten.push(m.text()))
p.on('pageerror', (e) => fouten.push('PAGEERROR: ' + e.message))
const url = 'http://localhost:4173'

await p.goto(url, { waitUntil: 'networkidle' })
await p.getByRole('textbox').fill('Sanne')
await p.getByRole('button', { name: '7' }).click()
await p.getByRole('button', { name: 'Beginnen' }).click()
await p.waitForTimeout(400)
console.log('THUIS:', await p.locator('h1').first().textContent())
await p.screenshot({ path: '/tmp/s1-thuis.png' })

await p.goto(url + '/les/toren-1/', { waitUntil: 'networkidle' })
await p.getByRole('button', { name: /Verder|Ik ga het proberen/ }).click()
await p.getByRole('button', { name: /Verder|Ik ga het proberen/ }).click()
await p.getByRole('button', { name: /Ik ga het proberen/ }).click()
await p.waitForTimeout(300)
await p.screenshot({ path: '/tmp/s2-les.png' })
// alle torenzetten aantikken vanaf e4
const doel = ['e5','e6','e7','e8','e3','e2','e1','a4','b4','c4','d4','f4','g4','h4']
for (const sq of doel) { await p.locator(`[data-square="${sq}"]`).click(); await p.waitForTimeout(40) }
await p.waitForTimeout(600)
console.log('NA TIKKEN:', (await p.locator('body').innerText()).split('\n').slice(0,6).join(' | '))
await p.screenshot({ path: '/tmp/s3-nalessen.png' })

await p.goto(url + '/kaart/', { waitUntil: 'networkidle' })
await p.screenshot({ path: '/tmp/s4-kaart.png' })
await p.goto(url + '/spelen/kiki/', { waitUntil: 'networkidle' })
await p.locator('[data-square="e2"]').click()
await p.locator('[data-square="e4"]').click()
await p.waitForTimeout(1600)
await p.screenshot({ path: '/tmp/s5-partij.png' })
await p.goto(url + '/spel/hongerig-paardje/', { waitUntil: 'networkidle' })
await p.waitForTimeout(500)
await p.screenshot({ path: '/tmp/s6-minispel.png' })
await p.goto(url + '/ouders/', { waitUntil: 'networkidle' })
await p.screenshot({ path: '/tmp/s7-ouders.png' })

console.log('CONSOLEFOUTEN:', fouten.length ? fouten.slice(0,8) : 'geen')
await b.close()
