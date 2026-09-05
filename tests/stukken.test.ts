import { describe, expect, it } from 'vitest'
import { GLYPH } from '@/board/pieces'
import { STALSTUKKEN } from '@/content/stal'

/**
 * Op een iPhone stonden alle pionnen zwart, ook die van wit.
 *
 * ♟ (U+265F) heeft een emoji-variant en iOS kiest die standaard; een emoji negeert
 * `color`, dus wit en zwart werden hetzelfde. In de pionlessen leek je eigen pion
 * daardoor die van de tegenstander. U+FE0E vraagt om de lettervorm en lost het op —
 * en dat is precies het soort ding dat je bij de volgende opschoning per ongeluk weer
 * weghaalt, want het is onzichtbaar in de broncode.
 */
describe('schaakstukken blijven letters, geen emoji', () => {
  it('vraagt bij elk bordstuk om de lettervorm', () => {
    for (const [soort, teken] of Object.entries(GLYPH)) {
      expect(teken, `${soort} moet U+FE0E achter zich hebben`).toContain('\uFE0E')
    }
  })

  it('doet hetzelfde met de stukken in de stal', () => {
    for (const vak of STALSTUKKEN.filter((v) => v.soort === 'stuk')) {
      expect(vak.teken, `${vak.id}`).toContain('\uFE0E')
    }
  })

  it('houdt wit en zwart uit elkaar met kleur, niet met een ander teken', () => {
    // Zouden wit en zwart verschillende tekens krijgen (♙ tegenover ♟), dan zou het
    // hierboven niet uitmaken. Ze delen er één, dus de kleur moet het werk doen.
    expect(new Set(Object.values(GLYPH)).size).toBe(6)
  })
})
