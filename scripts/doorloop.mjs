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
import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

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

/**
 * Lost het rekenslot op dat op `p` openstaat. Geeft false als er geen som staat.
 * Eén plek, zodat de drie stappen die erlangs moeten niet uit elkaar lopen.
 */
async function losRekenslot(p) {
  const som = await p.getByText(/Hoeveel is \d+ × \d+/).innerText().catch(() => '')
  const m = som.match(/(\d+) × (\d+)/)
  if (!m) return false
  await p.getByRole('textbox').fill(String(Number(m[1]) * Number(m[2])))
  await p.getByRole('button', { name: 'Verder' }).click()
  return true
}

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
/** Hoeveel velden er in dit rondje van "Vind het veld" te vinden zijn ("0 van de N"). */
const teVinden = async () =>
  Number((await page.getByText(/van de \d+/).first().innerText().catch(() => '')).match(/van de (\d+)/)?.[1] ?? 0)

/** Een rondje met meer dan één veld: dan begint een toevallig goede tik geen nieuw rondje. */
async function rondjeMetMeerDanEen() {
  for (let i = 0; i < 10 && (await teVinden()) < 2; i++) {
    await page.getByRole('button', { name: /Ander rondje/ }).click()
    await page.waitForTimeout(700)
  }
  return (await teVinden()) >= 2
}

async function opdrachtKomtTerug() {
  await page.goto(`${URL}/spel/vind-het-veld/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  // Een "mis"-tik kan toevallig het laatste goede veld raken; dan begon er een nieuw
  // rondje met een andere opdracht en faalde deze regel zonder dat er iets mis was.
  if (!(await rondjeMetMeerDanEen())) return meld('opdracht komt terug na een fout', false, 'geen rondje met meer dan één veld')
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
  const schermen = ['/', '/kaart/', '/lessen/', '/over/', '/schaakregels/', '/schaakregels/paard/', '/schaakclub/', '/stal/', '/spelen/', '/opfrissen/', '/les/weide-1/']
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
 * 4b. Het uitlegbord speelt, en stopt als je pauze drukt.
 *
 * De schaakregelpagina's leggen alles uit met een bord dat zichzelf afspeelt. Een
 * bord dat blijft stilstaan valt in de contentcontrole niet op, want de stappen staan
 * gewoon in de HTML; en een pauzeknop die niets doet ook niet. Bij de rokade moet
 * bovendien de toren meeverhuizen, en dat zie je alleen als het bord echt speelt.
 * ------------------------------------------------------------------ */
async function uitlegbordSpeelt() {
  const naam = 'het uitlegbord speelt af en pauzeert'
  await page.goto(`${URL}/schaakregels/rokade/`, { waitUntil: 'networkidle' })
  const bord = page.locator('#rokade-kort-lang')
  await bord.scrollIntoViewIfNeeded()
  const stap = () => bord.locator('li[aria-current="step"]').innerText()
  const eerst = await stap()
  await page.waitForTimeout(4500)
  const later = await stap()
  if (eerst === later) return meld(naam, false, 'na 4,5 seconde nog steeds de eerste stap')
  await bord.getByRole('button', { name: 'Pauze' }).click()
  const stil = await stap()
  await page.waitForTimeout(7000)
  if ((await stap()) !== stil) return meld(naam, false, 'het bord liep door na pauze')
  // Met de hand naar de korte rokade: de toren hoort nu op f1 te staan, niet meer op h1.
  await bord.getByRole('button', { name: /Korte rokade/ }).click()
  await page.waitForTimeout(800)
  const torens = await bord.evaluate((el) => {
    const b = el.querySelector('[role="img"]').getBoundingClientRect()
    return [...el.querySelectorAll('[role="img"] > span[aria-hidden]')]
      .filter((s) => s.textContent.startsWith('♜') && getComputedStyle(s).opacity !== '0')
      .map((s) => {
        const r = s.getBoundingClientRect()
        return `${'abcdefgh'[Math.round((r.left - b.left) / r.width)]}${8 - Math.round((r.top - b.top) / r.height)}`
      })
  })
  const goed = torens.includes('f1') && !torens.includes('h1')
  meld(naam, goed, goed ? '' : `torens op ${torens.join(', ')}`)
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
  if (!(await rondjeMetMeerDanEen())) return meld(naam, false, 'geen rondje met meer dan één veld gevonden (of de teller "x van de N" staat er niet meer)')
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

/* ------------------------------------------------------------------ *
 * 9. Na een gespeeld minispel telt de dag als geoefend.
 *
 * De teller zit in de opslag en is daar getest, maar de koppeling vanuit het
 * minispelscherm niet. Draait direct na `minispelEindigt`, dat zes rondjes haalt.
 * ------------------------------------------------------------------ */
async function dagTeltNaMinispel() {
  const naam = 'na een minispel staat er een dag geoefend'
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  const tekst = await page.locator('main').first().innerText()
  const goed = /📅\s*1 dag/.test(tekst)
  meld(naam, goed, goed ? '' : 'geen "📅 1 dag" op het beginscherm')
}

/* ------------------------------------------------------------------ *
 * 10. Samen spelen: de uitslag hoort bij een kleur, niet bij "jij".
 *
 * Won zwart, dan kreeg het kind van dit profiel "verloren" te horen, ook als het zelf
 * zwart speelde. Nu kiest het tweede kind wie het is, draait het bord mee, en staat
 * er wie er wint. Gespeeld met het snelste mat dat er is.
 * ------------------------------------------------------------------ */
async function samenSpelenKentDeWinnaar() {
  const naam = 'samen spelen: zet blijft staan, bord draait, winnaar heeft een naam, telt één keer'
  await page.goto(`${URL}/spelen/samen/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await page.getByRole('button', { name: 'Kies 🦊' }).click()
  await page.getByRole('button', { name: 'Beginnen', exact: true }).click()
  await page.waitForTimeout(400)
  const zet = async (a, z) => {
    await page.locator(`[data-square="${a}"]`).click()
    await page.locator(`[data-square="${z}"]`).click()
    await page.waitForTimeout(1300)
  }
  // Tik direct na de zet nog eens op dezelfde plekken, zoals een kind dat denkt dat het
  // niet lukte. Eerst draaide het bord meteen en deed dat de zet van het andere kind.
  const plek = async (v) => {
    const b = await page.locator(`[data-square="${v}"]`).boundingBox()
    return [b.x + b.width / 2, b.y + b.height / 2]
  }
  const [ax, ay] = await plek('d2')
  const [bx, by] = await plek('d4')
  await page.locator('[data-square="d2"]').click()
  await page.locator('[data-square="d4"]').click()
  await page.mouse.click(ax, ay)
  await page.mouse.click(bx, by)
  await page.waitForTimeout(1300)
  // Na één witte zet hoort zwart aan zet te zijn. Draaide het bord meteen, dan werd de
  // tweede tik op een gedraaid bord e7-e5, en was wit weer aan de beurt.
  const beurt = await page.getByText(/is aan zet \((wit|zwart)\)/).first().innerText().catch(() => '')
  if (!/\(zwart\)/.test(beurt)) return meld(naam, false, `een dubbele tik na de zet deed ook de zet van zwart ("${beurt}")`)
  const gedraaid = (await page.locator('[data-square]').first().getAttribute('data-square')) === 'h1'
  if (!gedraaid) return meld(naam, false, 'het bord draaide niet naar zwart')
  // Snelste mat, met wit dat al d4 speelde: 1.d4 e5 2.g4 ... wit heeft geen snel mat
  // tegen zich, dus speel opnieuw vanaf het begin.
  await page.getByRole('button', { name: /Nog een keer/ }).first().click()
  await page.waitForTimeout(500)
  await zet('f2', 'f3')
  await zet('e7', 'e5')
  await zet('g2', 'g4')
  await zet('d8', 'h4')
  const kop = (await page.locator('.card h2').first().innerText().catch(() => '')).replace(/\s+/g, ' ')
  if (!/🦊 Vos wint/.test(kop)) return meld(naam, false, `de uitslag zei "${kop}"`)
  // Terugnemen na mat en opnieuw mat zetten is nog steeds één partij.
  await page.getByRole('button', { name: /Terugnemen/ }).click()
  await page.waitForTimeout(1300)
  await zet('d8', 'h4')
  const telling = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('schaakmaatje-v1')).state
    const g = s.gespeeld[s.actiefId] ?? {}
    return (g.gewonnen ?? 0) + (g.verloren ?? 0) + (g.remise ?? 0)
  })
  meld(naam, telling === 1, `na terugnemen en opnieuw mat stonden er ${telling} partijen`)
}

/* ------------------------------------------------------------------ *
 * 11. Op afstand: één zet, dan op slot; versturen achter het rekenslot; de link
 * werkt aan de andere kant, en een kapotte link geeft een uitweg.
 * ------------------------------------------------------------------ */
async function opAfstandSpelen() {
  const naam = 'op afstand: een zet, op slot, link via het rekenslot, werkt bij het vriendje'
  await page.goto(`${URL}/spelen/afstand/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await page.locator('[data-square="e2"]').click()
  await page.locator('[data-square="e4"]').click()
  await page.waitForTimeout(300)
  if (!(await page.locator('[data-square="d2"]').isDisabled())) return meld(naam, false, 'na de zet kon er nog een zet bij')
  // Verversen (iOS doet dat zelf bij het wisselen van app) mag het slot niet opheffen:
  // anders deed het kind ook de zet van het vriendje.
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  if (!(await page.locator('[data-square="d2"]').isDisabled())) return meld(naam, false, 'na verversen kon het kind ook de zet van het vriendje doen')
  // En dan staat er dat je moet wachten, niet nog eens "versturen" als opdracht.
  const wacht = await page.locator('p.muted[aria-live=polite]').innerText().catch(() => '')
  if (!/Wachten op/.test(wacht)) return meld(naam, false, `na verversen geen wachtstand ("${wacht}")`)
  await page.getByRole('button', { name: /versturen/ }).click()
  await page.waitForTimeout(300)
  if (!(await losRekenslot(page))) return meld(naam, false, 'versturen ging niet langs het rekenslot')
  await page.waitForTimeout(400)
  const link = await page.getByRole('textbox', { name: 'Link met de zet' }).inputValue().catch(() => '')
  if (!/\/spelen\/afstand\/#[A-Za-z0-9_-]+$/.test(link)) return meld(naam, false, `geen bruikbare link ("${link}")`)
  // Aan de andere kant: een aparte browser met eigen opslag, zoals een tweede apparaat.
  // Een tabblad in dezelfde browser deelt de opslag, en herkent de link als eigen link.
  const anderApparaat = await browser.newContext({ viewport: { width: 420, height: 950 } })
  const ander = await anderApparaat.newPage()
  await ander.goto(link.replace(/^https?:\/\/[^/]+/, URL), { waitUntil: 'networkidle' })
  await ander.waitForTimeout(600)
  const beurt = await ander.locator('p.muted[aria-live=polite]').innerText().catch(() => '')
  const omgedraaid = (await ander.locator('[data-square]').first().getAttribute('data-square')) === 'h1'
  const e4 = (await ander.locator('[data-square="e4"]').innerText()).trim() !== ''
  await ander.goto(`${URL}/spelen/afstand/#rommel`, { waitUntil: 'networkidle' })
  await ander.waitForTimeout(400)
  const uitweg = await ander.getByRole('link', { name: /nieuwe partij/ }).count()
  await anderApparaat.close()
  const goed = /\(zwart\)/.test(beurt) && omgedraaid && e4 && uitweg > 0
  meld(naam, goed, goed ? '' : `beurt "${beurt}", gedraaid ${omgedraaid}, e4 ${e4}, uitweg ${uitweg}`)
}

/* ------------------------------------------------------------------ *
 * 12. De oudste groep kiest zelf waar een pion in verandert.
 *
 * Eerst werd een pion altijd een dame. Voor kinderen in de modus schaker (8 tot 10)
 * komt er nu een keuze; jongere kinderen houden de dame. Samen spelen, zodat beide
 * kanten met de hand gaan: wit loopt met de a-pion door en slaat op a8.
 * ------------------------------------------------------------------ */
async function promotieMetKeuze() {
  const naam = 'modus schaker: bij promotie kies je het stuk (hier een paard)'
  // De modus in de opslag zetten; de volgende pagina leest hem in.
  const zetModus = async (m) => {
    await page.goto(URL, { waitUntil: 'networkidle' })
    return page.evaluate((m) => {
      const j = JSON.parse(localStorage.getItem('schaakmaatje-v1'))
      const prof = j.state.profielen.find((p) => p.id === j.state.actiefId)
      const oud = prof.modus
      prof.modus = m
      localStorage.setItem('schaakmaatje-v1', JSON.stringify(j))
      return oud
    }, m)
  }
  const was = await zetModus('schaker')
  await page.goto(`${URL}/spelen/samen/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await page.getByRole('button', { name: 'Beginnen', exact: true }).click()
  await page.waitForTimeout(400)
  const zet = async (a, z) => {
    await page.locator(`[data-square="${a}"]`).click()
    await page.locator(`[data-square="${z}"]`).click()
    await page.waitForTimeout(300)
    // Zwart krijgt aan het eind terecht een waarschuwing: wit gaat promoveren, wat zwart
    // ook doet. Dan tikt het kind "Toch doen".
    if (await page.getByRole('alertdialog').count()) await page.getByRole('button', { name: 'Toch doen' }).click()
    await page.waitForTimeout(1000)
  }
  // Zwart springt heen en weer met een paard: veilig, dus geen blunderwaarschuwing die
  // de regel zou ophouden.
  for (const [a, z] of [['a2', 'a4'], ['g8', 'f6'], ['a4', 'a5'], ['f6', 'g8'], ['a5', 'a6'], ['g8', 'f6'], ['a6', 'b7'], ['f6', 'g8']]) await zet(a, z)
  // Op telefoonmaat: op het grote doorloopscherm paste de kiezer onder het bord nog net.
  const groot = page.viewportSize()
  await page.setViewportSize({ width: 360, height: 640 })
  await page.locator('[data-square="b7"]').click()
  await page.locator('[data-square="a8"]').click()
  await page.waitForTimeout(400)
  const dialoog = page.getByRole('dialog', { name: /Wat wordt je pion/ })
  const kiezer = await dialoog.count()
  // Hij moet ook in beeld staan: onder het bord viel hij op een telefoon buiten het
  // scherm, en met het bord op slot leek de app dan vast te lopen.
  const vak = kiezer ? await dialoog.boundingBox() : null
  const hoogte = page.viewportSize()?.height ?? 0
  const inBeeld = Boolean(vak && vak.y >= 0 && vak.y + vak.height <= hoogte)
  if (kiezer) await page.getByRole('button', { name: 'Paard', exact: true }).click()
  await page.waitForTimeout(500)
  if (groot) await page.setViewportSize(groot)
  const opA8 = (await page.locator('[data-square="a8"]').innerText()).trim()
  await zetModus(was)
  meld(
    naam,
    kiezer > 0 && inBeeld && opA8.startsWith('♞'),
    !kiezer ? 'er kwam geen keuze' : !inBeeld ? 'de keuze stond niet in beeld' : `op a8 staat "${opA8}"`,
  )
}

/**
 * 13. Het contactformulier zegt eerlijk dat versturen mislukte. Hier draait geen PHP, en
 * dan gaf de server 200 met de broncode terug: het formulier zei "Dank je wel" terwijl
 * het bericht nergens heen ging.
 */
async function contactformulierIsEerlijk() {
  const naam = 'contactformulier: zonder werkende server geen "verstuurd"'
  // Eerst de weg ernaartoe: de link onderaan de startpagina.
  await page.goto(URL, { waitUntil: 'networkidle' })
  const link = page.getByRole('link', { name: /^contact$/i }).first()
  if (!(await link.count())) return meld(naam, false, 'geen link naar contact op de startpagina')
  await link.click()
  await page.waitForURL(/\/contact\/$/)
  await page.getByLabel('Je bericht').fill('Een bericht uit de doorloop.')
  await page.getByRole('button', { name: 'Versturen' }).click()
  await page.waitForTimeout(800)
  const bedankt = await page.getByText('Dank je wel! Je bericht is verstuurd.').count()
  const fout = await page.getByRole('alert').filter({ hasText: 'Versturen lukte niet' }).count()
  meld(naam, !bedankt && fout > 0, bedankt ? 'het formulier zei "verstuurd"' : fout ? 'foutmelding verscheen' : 'geen melding')
}

/* ------------------------------------------------------------------ *
 * 14. Live met een vriendje: twee apparaten, één link, de zetten komen vanzelf over.
 *
 * Hier is PHP voor nodig (public/live/index.php). `npx serve` draait dat niet, dus
 * start de doorloop zelf PHP's eigen webserver op de gebouwde app. Zonder PHP op de
 * machine wordt dit stuk overgeslagen, en dat staat er dan ook.
 * ------------------------------------------------------------------ */
async function liveMetEenVriendje() {
  const naam = 'live: link via het rekenslot, zetten komen over, verversen, meekijken, nog een keer'
  if (spawnSync('php', ['-v']).status !== 0) return console.log(`  - ${naam} — overgeslagen, geen PHP`)
  const data = mkdtempSync(join(tmpdir(), 'live-doorloop-'))
  const poort = 4176
  const BASIS = `http://127.0.0.1:${poort}`
  // Meer werkers: elk scherm houdt een kijkverzoek open (long polling), en intussen moet
  // er een zet door kunnen. Zonder dit handelt PHP's eigen server één verzoek tegelijk af.
  const php = spawn('php', ['-S', `127.0.0.1:${poort}`, '-t', 'out'], {
    stdio: 'ignore',
    env: { ...process.env, LIVE_DATA: data, PHP_CLI_SERVER_WORKERS: '8' },
  })
  const apparaten = []
  const nieuwApparaat = async () => {
    const ctx = await browser.newContext({ viewport: { width: 420, height: 950 } })
    apparaten.push(ctx)
    // Tel wat Pip hardop zegt (apparaatstem of een opname van Pip, niet de bordgeluiden).
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
        if (/\/audio\//.test(this.src)) window.__gezegd.push(this.src)
        return play.call(this)
      }
    })
    const p = await ctx.newPage()
    p.on('pageerror', (e) => consolefouten.push(`LIVE PAGEERROR: ${e.message}`))
    return p
  }
  // Niet wachten op 'networkidle': met long polling staat er altijd een kijkverzoek open.
  /** Wachten tot iets klopt; de schermen kijken elke anderhalve seconde. */
  const wacht = async (fn, ms = 6000) => {
    for (const eind = Date.now() + ms; Date.now() < eind; ) {
      if (await fn().catch(() => false)) return true
      await new Promise((r) => setTimeout(r, 200))
    }
    return false
  }
  const stuk = async (p, veld) => (await p.locator(`[data-square="${veld}"]`).innerText()).trim() !== ''
  const magZetten = async (p, veld) => !(await p.locator(`[data-square="${veld}"]`).isDisabled())
  const zet = async (p, van, naar) => {
    await p.locator(`[data-square="${van}"]`).click()
    await p.locator(`[data-square="${naar}"]`).click()
  }
  try {
    for (let i = 0; i < 50; i++) {
      try {
        await fetch(`${BASIS}/`)
        break
      } catch {
        await new Promise((r) => setTimeout(r, 100))
      }
    }
    const a = await nieuwApparaat()
    await a.goto(`${BASIS}/spelen/live/`, { waitUntil: 'load' })
    await a.getByRole('button', { name: /Speellink maken/ }).click()
    if (!(await losRekenslot(a))) return meld(naam, false, 'de speellink ging niet langs het rekenslot')
    const veld = a.getByRole('textbox', { name: 'Speellink' })
    await veld.waitFor({ timeout: 5000 }).catch(() => {})
    const link = await veld.inputValue().catch(() => '')
    if (!/\/spelen\/live\/#[a-z2-9]{10}$/.test(link)) return meld(naam, false, `geen bruikbare speellink ("${link}")`)
    // Zonder vriendje nog geen zet: anders speelt het kind tegen niemand.
    if (await magZetten(a, 'e2')) return meld(naam, false, 'wit kon al zetten voor het vriendje er was')
    // Verversen terwijl je wacht: de link moet er nog staan, onder het bord (Kaj: eerst
    // het bord zien). Eerst was hij na verversen weg.
    await a.reload({ waitUntil: 'load' })
    const linkNa = a.getByRole('textbox', { name: 'Speellink' })
    if (!(await wacht(async () => (await linkNa.count()) > 0))) return meld(naam, false, 'na verversen was de speellink weg')
    const bordBoven = (await a.locator('[data-square]').first().boundingBox()).y
    if (bordBoven > (await linkNa.boundingBox()).y) return meld(naam, false, 'de speellink staat boven het bord')

    const b = await nieuwApparaat()
    await b.goto(link.replace(/^https?:\/\/[^/]+/, BASIS), { waitUntil: 'load' })
    const gedraaid = await wacht(async () => (await b.locator('[data-square]').first().getAttribute('data-square')) === 'h1')
    if (!gedraaid) return meld(naam, false, 'het vriendje kreeg het bord niet van de zwarte kant')
    if (!(await wacht(() => magZetten(a, 'e2')))) return meld(naam, false, 'wit merkte niet dat het vriendje er was')
    if (await a.getByRole('textbox', { name: 'Speellink' }).count()) return meld(naam, false, 'de speellink bleef staan toen het vriendje er was')

    // Pip praat niet na elke zet: "Nu jij!" staat alleen in de ballon (Kaj, 16 oktober).
    await a.waitForTimeout(800)
    const gezegdA = () => a.evaluate(() => window.__gezegd.length)
    const voorZetten = await gezegdA()
    await zet(a, 'e2', 'e4')
    if (!(await wacht(() => stuk(b, 'e4')))) return meld(naam, false, 'de zet van wit kwam niet over')
    if (!(await wacht(() => magZetten(b, 'e7')))) return meld(naam, false, 'zwart mocht niet zetten na wit')
    await zet(b, 'e7', 'e5')
    if (!(await wacht(() => stuk(a, 'e5')))) return meld(naam, false, 'de zet van zwart kwam niet over')
    await a.waitForTimeout(500)
    // Belangrijke zinnen mogen hardop (na verversen houdt de browser die vast tot de
    // eerste tik); de zinnen die bij elke zet terugkomen niet.
    const hardop = (await a.evaluate(() => window.__gezegd)).slice(voorZetten)
    const gewoon = hardop.filter((t) => /Nu jij|denkt je vriendje na/.test(t))
    if (gewoon.length) return meld(naam, false, `Pip zei bij gewone zetten iets hardop: ${JSON.stringify(gewoon)}`)

    // Verversen (iOS doet dat zelf bij het wisselen van app): zelfde kant, zelfde stand.
    await a.reload({ waitUntil: 'load' })
    if (!(await wacht(async () => (await stuk(a, 'e5')) && (await magZetten(a, 'f1')))))
      return meld(naam, false, 'na verversen was wit zijn partij kwijt')

    // Weglopen via "terug" en via de kaart terugkomen: de partij moet er nog zijn.
    // Layoutreview van 16 oktober, punt 1 (blokkerend).
    await a.goto(`${BASIS}/spelen/`, { waitUntil: 'load' })
    await a.getByRole('link', { name: /Live met een vriendje/ }).click()
    const verder = a.getByRole('button', { name: /▶️ Verder spelen/ })
    if (!(await wacht(async () => (await verder.count()) > 0))) return meld(naam, false, 'na weglopen en terugkomen was de partij niet terug te vinden')
    await verder.click()
    if (!(await wacht(async () => (await stuk(a, 'e5')) && (await magZetten(a, 'f1')))))
      return meld(naam, false, '"verder spelen" bracht wit niet terug in zijn partij')

    // Even geen verbinding, en dan weer wel: Pip mag niet blijven zeggen dat hij niemand
    // bereikt. Layoutreview van 16 oktober, punt 2.
    const ballonB = async () => (await b.locator('[class*=ballon]').first().innerText().catch(() => '')).split('\n')[0]
    await b.context().setOffline(true)
    // Een kijkverzoek dat al openstond, merkt pas iets als het afloopt (hooguit twintig
    // seconden wacht de server), dus ruim de tijd.
    const kwijt = await wacht(async () => /bereiken/.test(await ballonB()), 35000)
    await b.context().setOffline(false)
    const terugVerbinding = await wacht(async () => !/bereiken/.test(await ballonB()), 15000)
    if (!kwijt || !terugVerbinding) return meld(naam, false, `verbinding weg ${kwijt}, Pip daarna weer normaal ${terugVerbinding} ("${await ballonB()}")`)

    // Een derde met de link kijkt mee en kan niets aanraken.
    const c = await nieuwApparaat()
    await c.goto(link.replace(/^https?:\/\/[^/]+/, BASIS), { waitUntil: 'load' })
    if (!(await wacht(async () => /kijkt mee/.test(await c.locator('p.muted[aria-live=polite]').innerText()))))
      return meld(naam, false, 'een derde met de link kreeg geen meekijkstand')
    if (await magZetten(c, 'f1')) return meld(naam, false, 'een derde met de link kon zetten')

    // Herdersmat, dan nog een keer: kleuren wisselen.
    for (const [p, van, naar, ander, kijk] of [
      [a, 'f1', 'c4', b, 'c4'],
      [b, 'b8', 'c6', a, 'c6'],
      [a, 'd1', 'h5', b, 'h5'],
      [b, 'g8', 'f6', a, 'f6'],
    ]) {
      if (!(await wacht(() => magZetten(p, van)))) return meld(naam, false, `${van} kon niet zetten`)
      await zet(p, van, naar)
      if (!(await wacht(() => stuk(ander, kijk)))) return meld(naam, false, `${van}-${naar} kwam niet over`)
    }
    // Zwart is even weg (app weggeklikt) terwijl wit mat zet en meteen op "Nog een keer"
    // tikt. Zwart moet daarna tóch zien hoe het afliep, en pas dan door. Schaakreview
    // van 16 oktober, punt 1.
    if (!(await wacht(() => magZetten(a, 'h5')))) return meld(naam, false, 'wit kon de matzet niet doen')
    await b.context().setOffline(true)
    await zet(a, 'h5', 'f7')
    if (!(await wacht(async () => /wint/.test(await a.locator('p.muted[aria-live=polite]').innerText()))))
      return meld(naam, false, 'wit zag zijn eigen mat niet')
    await a.getByRole('button', { name: /🔁 Nog een keer/ }).click()
    await a.waitForTimeout(500)
    await b.context().setOffline(false)
    const zagMat = await wacht(async () => /wint/.test(await b.locator('p.muted[aria-live=polite]').innerText()), 10000)
    if (!zagMat) return meld(naam, false, 'zwart sprong naar de nieuwe partij zonder de mat te zien')
    if (!(await b.getByRole('button', { name: /▶️ Naar de nieuwe partij/ }).count())) return meld(naam, false, 'geen knop naar de nieuwe partij')
    await b.getByRole('button', { name: /▶️ Naar de nieuwe partij/ }).click()
    const gewisseld = await wacht(async () => (await a.locator('[data-square]').first().getAttribute('data-square')) === 'h1')
    const bWit = await wacht(() => magZetten(b, 'e2'))
    if (!(gewisseld && bWit)) return meld(naam, false, `na "nog een keer": wit nu zwart ${gewisseld}, zwart mag beginnen ${bWit}`)

    // Halverwege opnieuw: een kind dat nog niet kan matzetten moet eruit kunnen, en de
    // ander hoort dat er niemand verloren heeft. Schaakreview van 16 oktober, punt 2.
    await zet(b, 'e2', 'e4')
    if (!(await wacht(() => stuk(a, 'e4')))) return meld(naam, false, 'in de tweede partij kwam de zet niet over')
    await a.getByRole('button', { name: /↺ Nieuwe partij/ }).click()
    await a.getByRole('button', { name: /Ja, opnieuw/ }).click()
    const terug = await wacht(async () => (await b.locator('[data-square]').first().getAttribute('data-square')) === 'h1')
    const zinB = await b.locator('[class*=ballon]').first().innerText().catch(() => '')
    const goed = terug && /nieuwe partij/i.test(zinB) && (await wacht(() => magZetten(a, 'e2')))
    meld(naam, goed, goed ? '' : `halverwege opnieuw: bord gedraaid ${terug}, Pip zei "${zinB.split('\n')[0]}"`)
  } finally {
    for (const ctx of apparaten) await ctx.close()
    php.kill()
    rmSync(data, { recursive: true, force: true })
  }
}

/* ------------------------------------------------------------------ *
 * 15. Een tweede kind op hetzelfde apparaat.
 *
 * Het formulier om een profiel te maken stond alleen op het scherm zolang er nog
 * geen profiel was. Een broertje kon er dus niet bij, behalve door het eerste kind te
 * wissen. Gevraagd door Kaj. Nu via het ouderscherm, en daarna wissel je op de
 * startpagina.
 * ------------------------------------------------------------------ */
async function tweedeKind() {
  const naam = 'tweede kind: via het ouderscherm, formulier in beeld, terug kan, eigen maatje, wisselen'
  const naarFormulier = async () => {
    await page.goto(`${URL}/ouders/`, { waitUntil: 'networkidle' })
    if (!(await losRekenslot(page))) return 'geen rekenslot voor het ouderscherm'
    const knop = page.getByRole('button', { name: /Profiel voor nog een kind/ })
    if (!(await knop.count())) return 'geen knop voor een tweede kind in het ouderscherm'
    await knop.click()
    await page.waitForURL(/#nieuw-kind$/)
    // Het formulier zelf, niet de landingspagina erboven (review 16, L1).
    const kop = page.getByRole('heading', { name: 'Nieuw profiel' })
    await kop.waitFor({ timeout: 3000 }).catch(() => {})
    if (!(await kop.isVisible().catch(() => false))) return 'na de knop staat het formulier niet in beeld'
    return ''
  }

  // Eerst weglopen zonder iets te doen: het eerste kind moet gewoon actief blijven,
  // anders speelt het een les waarvan niets bewaard wordt (review 16, C1 en L2).
  let fout = await naarFormulier()
  if (fout) return meld(naam, false, fout)
  await page.getByRole('button', { name: /Terug naar .*Testkind/ }).click()
  if (!(await page.getByRole('heading', { name: 'Hoi Testkind!' }).count())) return meld(naam, false, '"terug" bracht het eerste kind niet terug')
  fout = await naarFormulier()
  if (fout) return meld(naam, false, fout)
  await page.goto(`${URL}/lessen/`, { waitUntil: 'networkidle' })
  await page.goto(URL, { waitUntil: 'networkidle' })
  if (!(await page.getByRole('heading', { name: 'Hoi Testkind!' }).count())) return meld(naam, false, 'na weglopen was het eerste kind niet meer actief')

  fout = await naarFormulier()
  if (fout) return meld(naam, false, fout)
  // Niet zelf een maatje kiezen: het formulier hoort er een te nemen dat nog vrij is (L3).
  await page.getByRole('textbox').first().fill('Broertje')
  await page.getByRole('button', { name: '9', exact: true }).click()
  await page.getByRole('button', { name: /Beginnen/ }).click()
  await page.waitForTimeout(700)
  if (!(await page.getByRole('heading', { name: 'Hoi Broertje!' }).count())) return meld(naam, false, 'het tweede profiel begon niet')
  const wie = page.locator('section', { hasText: 'Wie speelt er?' }).getByRole('button')
  const plaatjes = (await wie.allInnerTexts()).map((t) => t.trim().split(' ')[0])
  if (new Set(plaatjes).size !== plaatjes.length) return meld(naam, false, `twee kinderen met hetzelfde maatje: ${plaatjes.join(' ')}`)
  await wie.filter({ hasText: 'Testkind' }).click()
  await page.waitForTimeout(300)
  const terug = await page.getByRole('heading', { name: 'Hoi Testkind!' }).count()
  meld(naam, terug > 0, terug ? '' : 'wisselen naar het eerste kind lukte niet')
}

/* ------------------------------------------------------------------ *
 * Wie zonder profiel speelt, houdt zijn sterren.
 *
 * Op de startpagina staat "Probeer de eerste les", en via Google landt een ouder
 * rechtstreeks op een les. Zonder profiel gooide de opslag de sterren stilletjes weg
 * (`if (!id) return`). Nu: eerste les spelen als gast, bij de beloning een naam kiezen,
 * en dan staat het kind niet weer bij "De eerste les". Achttiende review, SEO2.
 * ------------------------------------------------------------------ */
async function gastHoudtZijnSterren() {
  const naam = 'eerste les zonder profiel: na een naam kiezen staan de sterren er nog'
  const ctx = await browser.newContext({ viewport: { width: 420, height: 950 } })
  const p = await ctx.newPage()
  try {
    await p.goto(URL, { waitUntil: 'networkidle' })
    await p.getByRole('link', { name: /Probeer de eerste les/ }).click()
    await p.waitForURL(/\/les\/weide-1\//)
    await p.waitForTimeout(700)
    for (let i = 0; i < 10 && !(await p.getByRole('button', { name: /Ik ga het proberen/ }).count()); i++) {
      await p.getByRole('button', { name: /Verder/ }).first().click().catch(() => {})
      await p.waitForTimeout(400)
    }
    await p.getByRole('button', { name: /Ik ga het proberen/ }).click()
    await p.waitForTimeout(600)
    // De antwoorden van weide-1, opgave voor opgave: meedoen, zelf (2), toets (2).
    const opgaven = [['a1', 'c1', 'e1', 'g1'], ['b1', 'd1', 'f1', 'h1'], ['a8', 'c8', 'e8', 'g8'], ['d4', 'e5'], ['d5', 'e4']]
    for (const velden of opgaven) {
      for (const veld of velden) {
        await p.locator(`[data-square="${veld}"]`).click()
        await p.waitForTimeout(250)
      }
      // Pip prijst, dan komt de volgende opgave (of de knop naar de volgende fase).
      await p.waitForTimeout(2500)
      for (let i = 0; i < 6; i++) {
        const door = p.getByRole('button', { name: /^(Verder|Ik ga het proberen)/ })
        if (!(await door.count())) break
        await door.first().click()
        await p.waitForTimeout(450)
      }
    }
    await p.getByText('Bewaar je sterren').waitFor({ timeout: 8000 }).catch(() => {})
    if (!(await p.getByText('Bewaar je sterren').count())) {
      return meld(naam, false, 'geen "Bewaar je sterren" bij de beloning (kloppen de antwoorden van weide-1 hierboven nog?)')
    }
    await p.getByRole('link', { name: 'Kies een naam' }).click()
    await p.waitForTimeout(800)
    await p.getByRole('textbox').first().fill('Gastkind')
    await p.getByRole('button', { name: /^Beginnen/ }).click()
    await p.waitForTimeout(800)
    const knop = await p.locator('a[href*="/les/"]').first().innerText().catch(() => '')
    const goed = /Verder leren/.test(knop)
    meld(naam, goed, goed ? '' : `de grote knop zegt "${knop.replace(/\s+/g, ' ')}"`)
  } finally {
    await ctx.close()
  }
}

console.log(`Doorloop tegen ${URL}\n`)
await pipZwijgtBijBinnenkomst()
await nieuwProfiel()
await opdrachtKomtTerug()
await minispelEindigt()
await dagTeltNaMinispel()
await quizRekentGoedGoed()
await onmogelijkeZetKrijgtRegelzin()
await opdrachtKomtTerugNaTipje()
await samenSpelenKentDeWinnaar()
await opAfstandSpelen()
await liveMetEenVriendje()
await promotieMetKeuze()
await contactformulierIsEerlijk()
await uitlegbordSpeelt()
await altijdEenUitweg()
await tweedeKind()
await gastHoudtZijnSterren()

meld('geen fouten in de console', consolefouten.length === 0, consolefouten.slice(0, 3).join(' | '))

await browser.close()

const gezakt = uitkomsten.filter((u) => !u.goed)
console.log(`\n${uitkomsten.length - gezakt.length} van de ${uitkomsten.length} in orde.`)
if (gezakt.length) process.exit(1)
