import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// Het beginscherm-icoon: elk icoon uit het manifest bestaat, er is een maskable van 512
// voor Android en een png van 180 voor iOS (dat negeert svg). Tekenen: scripts/app-icoon.mjs.
describe('app-icoon', () => {
  const manifest = JSON.parse(readFileSync(join('public', 'manifest.webmanifest'), 'utf8'))
  it('elk icoon uit het manifest bestaat', () => {
    for (const i of manifest.icons) expect(existsSync(join('public', i.src)), i.src).toBe(true)
  })
  it('heeft 192, 512 en een maskable', () => {
    const maten = manifest.icons.map((i: { sizes: string }) => i.sizes)
    expect(maten).toContain('192x192')
    expect(maten).toContain('512x512')
    expect(manifest.icons.some((i: { purpose: string }) => i.purpose === 'maskable')).toBe(true)
  })
  it('opent als app', () => {
    expect(manifest.display).toBe('standalone')
    expect(existsSync(join('public', 'apple-touch-icon.png'))).toBe(true)
  })
})
