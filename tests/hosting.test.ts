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

/**
 * De controle op de sitemap na de build, op een klein nagemaakt out/. Tweeëntwintigste
 * review: hij moet falen als de sitemap en de pagina's niet bij elkaar passen, in beide
 * richtingen, en ook als de leesbare pagina /sitemap/ een link mist.
 */
describe('sitemap tegen de pagina\'s', async () => {
  const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const { join } = await import('node:path')
  const { sitemapFouten } = await import('../scripts/hosting-klaar')
  const S = 'https://schaakmaatje.nl'

  function maakUit(paginas: Record<string, string>, inSitemap: string[]) {
    const uit = mkdtempSync(join(tmpdir(), 'uit-'))
    for (const [pad, html] of Object.entries(paginas)) {
      mkdirSync(join(uit, pad), { recursive: true })
      writeFileSync(join(uit, pad, 'index.html'), html)
    }
    writeFileSync(join(uit, 'sitemap.xml'), `<urlset>${inSitemap.map((p) => `<url><loc>${S}${p}</loc></url>`).join('')}</urlset>`)
    return uit
  }
  const pagina = (pad: string, extra = '') => `<head><link rel="canonical" href="${S}${pad}"/>${extra}</head>`

  it('alles in orde: geen fouten', () => {
    const uit = maakUit({ '/': pagina('/'), '/les/a/': pagina('/les/a/'), '/sitemap/': pagina('/sitemap/', '<a href="/"></a><a href="/les/a/"></a>') }, ['/', '/les/a/', '/sitemap/'])
    expect(sitemapFouten(uit)).toEqual([])
    rmSync(uit, { recursive: true })
  })

  it('een pagina in de sitemap die niet bestaat, of op noindex staat', () => {
    const noindex = pagina('/kaart/', '<meta content="noindex" name="robots"/>')
    const uit = maakUit({ '/': pagina('/'), '/kaart/': noindex }, ['/', '/kaart/', '/weg/'])
    const fouten = sitemapFouten(uit).join('\n')
    expect(fouten).toContain('/weg/: bestaat niet')
    expect(fouten).toContain('/kaart/: staat op noindex')
    rmSync(uit, { recursive: true })
  })

  it('een pagina die gevonden wil worden maar niet in de sitemap staat, ook diep in de boom', () => {
    const uit = maakUit({ '/': pagina('/'), '/schaakclub/den-haag/': pagina('/schaakclub/den-haag/') }, ['/'])
    expect(sitemapFouten(uit).join('\n')).toContain('/schaakclub/den-haag/: wil gevonden worden')
    rmSync(uit, { recursive: true })
  })

  it('de leesbare pagina /sitemap/ mist een link', () => {
    const uit = maakUit({ '/': pagina('/'), '/les/a/': pagina('/les/a/'), '/sitemap/': pagina('/sitemap/', '<a href="/"></a>') }, ['/', '/les/a/', '/sitemap/'])
    expect(sitemapFouten(uit).join('\n')).toContain('/les/a/: ontbreekt op de pagina /sitemap/')
    rmSync(uit, { recursive: true })
  })
})
