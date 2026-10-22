import { describe, expect, it } from 'vitest'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import sitemap from '@/app/sitemap'
import { ALLE_LESSEN } from '@/content'
import { SCHAAKREGELS } from '@/content/schaakregels'
import { allePaginas } from '@/vindbaar'

/**
 * Kan Google alles vinden? De sitemap moet elke pagina met inhoud noemen, precies één
 * keer, en geen scherm dat zonder profiel leeg is. En elke pagina met een eigen
 * `page.tsx` buiten de app-schermen moet erin staan: een nieuwe ouderpagina die hier
 * ontbreekt, vindt Google veel later of niet.
 */
const APP_SCHERMEN = ['diploma', 'kaart', 'opfrissen', 'ouders', 'spel', 'spelen', 'stal']

describe('de sitemap', () => {
  const urls = sitemap().map((r) => r.url)

  it('elke les en elke schaakregel staat erin, precies één keer', () => {
    for (const les of ALLE_LESSEN) expect(urls).toContain(`https://schaakmaatje.nl/les/${les.id}/`)
    for (const o of SCHAAKREGELS) expect(urls).toContain(`https://schaakmaatje.nl/schaakregels/${o.slug}/`)
    expect(new Set(urls).size).toBe(urls.length)
  })

  it('geen app-scherm dat zonder profiel leeg is', () => {
    for (const scherm of APP_SCHERMEN) expect(urls.some((u) => u.includes(`/${scherm}/`)), scherm).toBe(false)
  })

  it('elke ouderpagina met een eigen page.tsx staat erin', () => {
    const mappen = readdirSync('src/app').filter(
      (n) => statSync(join('src/app', n)).isDirectory() && existsSync(join('src/app', n, 'page.tsx')),
    )
    for (const map of mappen.filter((m) => !APP_SCHERMEN.includes(m))) {
      expect(urls, map).toContain(`https://schaakmaatje.nl/${map}/`)
    }
  })

  it('geen prioriteit of wijzigfrequentie: Google negeert ze', () => {
    for (const r of sitemap()) {
      expect(r.priority).toBeUndefined()
      expect(r.changeFrequency).toBeUndefined()
    }
  })

  it('de leesbare pagina /sitemap/ en sitemap.xml komen uit dezelfde lijst', () => {
    expect(urls).toEqual(allePaginas().map((p) => `https://schaakmaatje.nl${p.pad}`))
  })
})
