/**
 * De app spelen als kind, en controleren of hij zich gedraagt.
 *
 *   npm run build
 *   npm run doorloop
 *
 * Dit bestaat omdat er een hele soort fouten is die de gewone controles niet zien.
 * `npm run check` kijkt naar types, naar de content en naar losse functies — en dat
 * werkt: de contentcontrole heeft echte fouten in de stellingen gevonden. Maar vijf
 * fouten op één avond kwamen er ongehinderd doorheen, en het waren stuk voor stuk
 * fouten die pas ontstaan als je de app daadwerkelijk gebruikt:
 *
 *   · Het lesscherm tekende de antwoorden van een quiz in een andere volgorde dan de
 *     lesmotor ze nakeek. Een kind dat het goede plaatje aantikte kreeg te horen dat
 *     het fout was. Beide lijsten bestonden, beide waren geldig, en het verschil zat
 *     in één woord in de JSX. Geen enkele test die naar functies kijkt, ziet dat.
 *   · De opdracht in Pips ballon werd overschreven door de fouttip en kwam nooit
 *     terug. Dat is pas te zien nadat je expres een fout hebt gemaakt.
 *   · Een minispel had geen einde: bij niveau zes bleef het rondjes uitdelen.
 *
 * Vandaar deze doorloop. Hij maakt geen schermafbeeldingen om naar te kijken — dat
 * doet de layout-reviewer — maar hij bewéért dingen, en valt om als ze niet kloppen.
 * De regels hieronder zijn allemaal geleerd van een echte fout.
 */
import { chromium } from 'playwright'

const URL = process.env.DOORLOOP_URL ?? 'http://localhost:4173'
const CHROMIUM = process.env.CHROMIUM_PAD ?? '/opt/pw-browsers/chromium'

const uitkomsten = []
const meld = (naam, goed, uitleg = '') => {
  uitkomsten.push({ naam, goed, uitleg })
  console.log(`${goed ? '  ✓' : '  ✗'} ${naam}${uitleg ? ` — ${uitleg}` : ''}`)
}

const browser = await chromium.launch({ executablePath: CHROMIUM })
const context = await browser.newContext({ viewport: { width: 420, height: 950 } })
const page = await context.newPage()

/**
 * Fouten in de console zijn altijd fout, ook als het scherm er goed uitziet.
 *
 * Met één uitzondering, en die is met opzet: staan er geen opnames klaar, dan bestaan
 * `audio/manifest.json` en `sfx/manifest.json` niet en geeft de browser een 404. Dat is
 * precies de bedoeling — de app valt dan netjes terug op de stem van het apparaat, en
 * die lege manifesten meeleveren zou de opnames op de server juist onbruikbaar maken
 * (zie scripts/hosting-klaar.ts). Zou ik ze hier laten meetellen, dan zou de doorloop
 * altijd rood staan en gaat er niemand meer naar kijken.
 */
const VERWACHTE_404 = /(audio|sfx)\/manifest\.json/
const consolefouten = []
page.on(
  'console',
  (m) => m.type() === 'error' && !VERWACHTE_404.test(m.location()?.url ?? '') && consolefouten.push(m.text()),
)
page.on('pageerror', (e) => consolefouten.push(`PAGEERROR: ${e.message}`))

const ballon = async () =>
  (await page.locator('[class*=ballon]').first().innerText().catch(() => '')).split('\n')[0].trim()

async function nieuwProfiel(leeftijd = 6) {
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.getByRole('textbox').first().fill('Testkind')
  const jaar = page.getByRole('button', { name: String(leeftijd), exact: true })
  if (await jaar.count()) await jaar.click()
  await page.getByRole('button', { name: /Beginnen/ }).click()
  await page.waitForTimeout(700)
}

/* ------------------------------------------------------------------ *
 * 1. De opdracht komt terug na een fout.
 *
 * Pips ballon is de enige plek waar staat wat er moet gebeuren. Werd hij
 * overschreven door de fouttip, dan kon een kind dat niet leest nergens meer
 * terugvinden wat de bedoeling was — en juist wie een fout maakte heeft dat nodig.
 * ------------------------------------------------------------------ */
async function opdrachtKomtTerug() {
  await page.goto(`${URL}/spel/vind-het-veld/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  const opdracht = await ballon()
  if (!opdracht) return meld('opdracht komt terug na een fout', false, 'geen opdracht gevonden')

  // Net zo lang misklikken tot Pip reageert met een tip.
  let getipt = ''
  for (const veld of ['a1', 'a2', 'a3', 'b1', 'b2', 'h8', 'h7', 'g8', 'g7']) {
    await page.locator(`[data-square="${veld}"]`).click()
    await page.waitForTimeout(350)
    const nu = await ballon()
    if (nu && nu !== opdracht) {
      getipt = nu
      break
    }
  }
  if (!getipt) return meld('opdracht komt terug na een fout', false, 'geen enkele misklik gaf een tip')

  await page.waitForTimeout(4500)
  const terug = await ballon()
  meld(
    'opdracht komt terug na een fout',
    terug === opdracht,
    terug === opdracht ? '' : `bleef "${terug}" staan in plaats van "${opdracht}"`,
  )
}

/* ------------------------------------------------------------------ *
 * 2. Een minispel houdt een keer op.
 *
 * Zonder einde is het geen spel maar een lopende band: er is geen moment waarop een
 * kind klaar is, en dus ook geen moment om trots op te zijn.
 * ------------------------------------------------------------------ */
async function minispelEindigt() {
  await page.goto(`${URL}/spel/vind-het-veld/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  // Met het tipje kom je er altijd: hij wijst steeds een veld aan dat nog open staat.
  for (let rondje = 0; rondje < 12; rondje++) {
    if (await page.getByRole('button', { name: /Nog een keer/ }).count()) break
    for (let i = 0; i < 15; i++) {
      const tip = page.getByRole('button', { name: /Tipje/ })
      if (!(await tip.count()) || (await tip.isDisabled())) break
      await tip.click()
      await page.waitForTimeout(220)
      const veld = await page.locator('[class*=glow]').first().getAttribute('data-square').catch(() => null)
      if (!veld) break
      await page.locator(`[data-square="${veld}"]`).click()
      await page.waitForTimeout(300)
    }
    await page.waitForTimeout(2600)
  }
  const uit = await page.getByRole('button', { name: /Nog een keer/ }).count()
  meld('een minispel eindigt', uit > 0, uit ? '' : 'na twaalf rondjes nog geen eindscherm')
}

/* ------------------------------------------------------------------ *
 * 3. Het goede quizantwoord wordt goed gerekend.
 *
 * Het scherm tekende de antwoorden in de ene volgorde en de lesmotor keek de andere
 * na, omdat de antwoorden geschud worden. Wie het goede plaatje aantikte kreeg te
 * horen dat het fout was. In een app die geen kind mag straffen is dat de ergste
 * fout die er is, en hij is alleen zo te vinden: door hem echt aan te tikken.
 * ------------------------------------------------------------------ */
async function quizRekentGoedGoed() {
  await page.goto(`${URL}/les/weide-3/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  for (let i = 0; i < 8; i++) {
    const door = page.getByRole('button', { name: /^(Verder|Ik ga het proberen)/ })
    if (!(await door.count())) break
    await door.first().click()
    await page.waitForTimeout(450)
  }
  // Doorwerken tot de quiz "Welk veld is rechtsonder?" in beeld staat.
  const antwoorden = {
    'veld rechtsonder aan': ['h1'],
    'vier de hoeken': ['a1', 'h1', 'a8', 'h8'],
    'hoeken zijn licht': ['h1', 'a8'],
    'veld linksonder': ['a1'],
  }
  for (let ronde = 0; ronde < 10; ronde++) {
    const goed = page.getByRole('button', { name: /een licht veld/ })
    if (await goed.count()) {
      await goed.first().click()
      await page.waitForTimeout(1200)
      const na = await ballon()
      // Fout gerekend? Dan zegt Pip iets corrigerends in plaats van iets prijzends.
      const afgekeurd = /niet|bijna|nee|hm|kijk goed|wit rechts/i.test(na)
      return meld(
        'een goed quizantwoord telt als goed',
        !afgekeurd,
        afgekeurd ? `Pip zei "${na}" op het juiste antwoord` : '',
      )
    }
    const vraag = await ballon()
    const treffer = Object.entries(antwoorden).find(([stuk]) => vraag.includes(stuk))
    if (!treffer) break
    for (const veld of treffer[1]) {
      await page.locator(`[data-square="${veld}"]`).click()
      await page.waitForTimeout(250)
    }
    await page.waitForTimeout(2000)
  }
  meld('een goed quizantwoord telt als goed', false, 'de quiz nooit bereikt')
}

/* ------------------------------------------------------------------ *
 * 4. Geen enkel scherm is een doodlopende weg.
 *
 * Een kind dat niet leest kan niet bedenken dat het terug moet met de browserknop.
 * Overal moet minstens één knop of link staan die ergens heen gaat.
 * ------------------------------------------------------------------ */
async function altijdEenUitweg() {
  const schermen = ['/', '/kaart/', '/lessen/', '/over/', '/stal/', '/spelen/', '/opfrissen/', '/les/weide-1/']
  const zonder = []
  for (const pad of schermen) {
    await page.goto(URL + pad, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    const knoppen = await page.locator('a[href], button:not([disabled])').count()
    if (knoppen === 0) zonder.push(pad)
  }
  meld('elk scherm heeft een uitweg', zonder.length === 0, zonder.join(', '))
}

/* ------------------------------------------------------------------ *
 * 0. Een nieuwe bezoeker schrikt niet van een pratend paardje.
 *
 * Op de welkomstpagina begon Pip vanzelf te praten. Omdat de browser geluid
 * tegenhoudt tot er getikt is, gebeurde dat bij de eerste tik op wat dan ook: in
 * het naamveld, op een plaatje. Nu zwijgt hij daar tot je op de luidspreker tikt,
 * en praat hij pas vanzelf na "Beginnen". Gemeld door Kaj.
 * ------------------------------------------------------------------ */
async function pipZwijgtBijBinnenkomst() {
  const naam = 'nieuwe bezoeker hoort Pip pas als hij erom vraagt'
  const ctx = await browser.newContext({ viewport: { width: 420, height: 950 } })
  // Tel alles wat Pip zegt, via de apparaatstem én via opnames.
  await ctx.addInitScript(() => {
    window.__gezegd = []
    const s = window.speechSynthesis
    if (s) {
      const echt = s.speak.bind(s)
      s.speak = (u) => {
        window.__gezegd.push(u.text)
        echt(u)
      }
    }
    const play = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function () {
      window.__gezegd.push(this.src)
      return play.call(this)
    }
  })
  const p = await ctx.newPage()
  const gezegd = () => p.evaluate(() => window.__gezegd.length)
  await p.goto(URL, { waitUntil: 'networkidle' })
  await p.waitForTimeout(800)
  await p.getByRole('textbox').first().click()
  await p.getByRole('textbox').first().fill('Testkind')
  await p.waitForTimeout(800)
  const vooraf = await gezegd()
  await p.getByRole('button', { name: 'Zeg het nog eens' }).first().click()
  await p.waitForTimeout(500)
  const naLuidspreker = await gezegd()
  await p.getByRole('button', { name: /Beginnen/ }).click()
  await p.waitForTimeout(1200)
  const naBeginnen = await gezegd()
  // En wie later terugkomt, schrikt ook niet: de site opnieuw openen met het profiel
  // er al, en dan ergens op tikken. Ook gemeld door Kaj: "ik schrik iedere keer".
  await p.reload({ waitUntil: 'networkidle' })
  await p.waitForTimeout(800)
  await p.getByRole('heading', { name: /Hoi Testkind/ }).click()
  await p.waitForTimeout(800)
  const terugkomst = await gezegd()
  await ctx.close()
  if (vooraf > 0) return meld(naam, false, `Pip praatte al ${vooraf} keer voordat er iets gevraagd werd`)
  if (naLuidspreker === 0) return meld(naam, false, 'de luidspreker deed niets')
  if (naBeginnen <= naLuidspreker) return meld(naam, false, 'na Beginnen zei Pip niets')
  meld(naam, terugkomst === 0, terugkomst === 0 ? '' : `bij terugkomst praatte Pip vanzelf (${terugkomst} keer)`)
}

/* ------------------------------------------------------------------ *
 * 7. Een zet die niet mag, krijgt geen fouttip over een zet die wel mag.
 *
 * In "uit schaak: drie manieren" stapte een kind met zijn koning opzij, op de rij van
 * de toren. Dat mag niet, maar Pip zei "Dat was er iets tussen zetten" of zelfs "Je
 * koning is veilig". De fouttip van een opgave gaat over een zet die wél mag en de
 * verkeerde manier is. Zevende review, door alle drie de reviewers gevonden.
 * ------------------------------------------------------------------ */
async function onmogelijkeZetKrijgtRegelzin() {
  const naam = 'een zet waarna je nog schaak staat, krijgt de regel en niet de fouttip'
  await page.goto(`${URL}/les/schaak-3/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  // Door de uitleg heen: "Verder" tot de knop naar Meedoen er staat.
  for (let i = 0; i < 10 && !(await page.getByRole('button', { name: /Ik ga het proberen/ }).count()); i++) {
    await page.getByRole('button', { name: /Verder/ }).first().click().catch(() => {})
    await page.waitForTimeout(400)
  }
  await page.getByRole('button', { name: /Ik ga het proberen/ }).click()
  await page.waitForTimeout(600)
  // Meedoen: toren op a1 geeft schaak aan de koning op e1. Kd1 mag niet.
  await page.locator('[data-square="e1"]').click()
  await page.waitForTimeout(200)
  await page.locator('[data-square="d1"]').click()
  await page.waitForTimeout(500)
  const zin = await ballon()
  meld(naam, /nog steeds schaak/.test(zin), /nog steeds schaak/.test(zin) ? '' : `Pip zei "${zin}"`)
}

/* ------------------------------------------------------------------ *
 * 8. Na een tipje komt de opdracht terug.
 *
 * In "Vind het veld" verving het tipje de opdracht, en die kwam het hele rondje niet
 * meer terug. Het kind moest nog twee stukken vinden zonder te weten welke.
 * ------------------------------------------------------------------ */
async function opdrachtKomtTerugNaTipje() {
  const naam = 'opdracht komt terug na een tipje'
  await page.goto(`${URL}/spel/vind-het-veld/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  // Alleen een rondje met meer dan één veld te vinden: wijst het tipje het laatste
  // veld aan, dan begint er een nieuw rondje met een andere opdracht, en dan meet deze
  // regel iets anders dan bedoeld. Zo faalde hij eerst af en toe zonder dat er iets mis was.
  const teVinden = async () => Number((await page.getByText(/van de \d+/).first().innerText().catch(() => '')).match(/van de (\d+)/)?.[1] ?? 0)
  for (let i = 0; i < 10 && (await teVinden()) < 2; i++) {
    await page.getByRole('button', { name: /Ander rondje/ }).click()
    await page.waitForTimeout(700)
  }
  if ((await teVinden()) < 2) return meld(naam, false, 'geen rondje met meer dan één veld gevonden')
  const opdracht = await ballon()
  await page.getByRole('button', { name: /Tipje/ }).click()
  await page.waitForTimeout(300)
  const veld = await page.locator('[class*=glow]').first().getAttribute('data-square').catch(() => null)
  if (!veld) return meld(naam, false, 'het tipje wees niets aan')
  await page.locator(`[data-square="${veld}"]`).click()
  await page.waitForTimeout(5000)
  const terug = await ballon()
  // Was dit het laatste veld, dan is het rondje klaar en mag er iets anders staan.
  const klaar = await page.getByRole('button', { name: /Nog een keer/ }).count()
  const goed = klaar > 0 || terug === opdracht
  meld(naam, goed, goed ? '' : `"${terug}" in plaats van "${opdracht}"`)
}

console.log(`Doorloop tegen ${URL}\n`)
await pipZwijgtBijBinnenkomst()
await nieuwProfiel()
await opdrachtKomtTerug()
await minispelEindigt()
await quizRekentGoedGoed()
await onmogelijkeZetKrijgtRegelzin()
await opdrachtKomtTerugNaTipje()
await altijdEenUitweg()

meld('geen fouten in de console', consolefouten.length === 0, consolefouten.slice(0, 3).join(' | '))

await browser.close()

const gezakt = uitkomsten.filter((u) => !u.goed)
console.log(`\n${uitkomsten.length - gezakt.length} van de ${uitkomsten.length} in orde.`)
if (gezakt.length) process.exit(1)
