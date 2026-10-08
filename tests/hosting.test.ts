import { describe, expect, it } from 'vitest'
import { win32, posix } from 'node:path'
import { zonderBlokhaken } from '../scripts/hosting-klaar'

/**
 * Waar moet een map met blokhaken heen?
 *
 * Deze test bestaat omdat het bouwen op Windows omviel en op Linux niet. De oude regel
 * rekende met lastIndexOf('/'), en op Windows levert join() backslashes op. Dan is er
 * geen schuine streep te vinden, hakt slice(0, −1) een willekeurig teken van het pad,
 * en komt er een doel uit als `out\_next\...\diploma\[soort\:\Users\kajro\...`.
 *
 * Het vervelende eraan: op de machine waar dit geschreven wordt valt het nooit op. Dus
 * wordt de Windows-variant hier echt nagespeeld, met win32 uit node:path.
 */
describe('mappen met blokhaken hernoemen', () => {
  it('werkt op Linux', () => {
    const uit = zonderBlokhaken('out/_next/static/chunks/app/les/[lesId]', posix)
    expect(uit.naam).toBe('[lesId]')
    expect(uit.schoon).toBe('lesId')
    expect(uit.doel).toBe('out/_next/static/chunks/app/les/lesId')
  })

  it('werkt ook op Windows, waar het pad backslashes heeft', () => {
    const uit = zonderBlokhaken('out\\_next\\static\\chunks\\app\\diploma\\[soort]', win32)
    expect(uit.naam).toBe('[soort]')
    expect(uit.schoon).toBe('soort')
    expect(uit.doel).toBe('out\\_next\\static\\chunks\\app\\diploma\\soort')
  })

  it('raakt de rest van het pad niet aan', () => {
    // Een map die zelf 'out' heet, ergens diep in het pad: niets mag verschuiven.
    const uit = zonderBlokhaken('a/out/b/out/[spelId]', posix)
    expect(uit.doel).toBe('a/out/b/out/spelId')
  })
})
