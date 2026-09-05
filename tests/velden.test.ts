import { describe, expect, it } from 'vitest'
import { lijn, pad, rij, wegen } from '@/content/velden'
import { WERELDEN } from '@/content'
import { vertelTekst, vertelWijzers } from '@/content/types'
import { geldigVeld } from '@/engine/puzzels'
import { isLightSquare } from '@/engine/board'

describe('wegen over het bord', () => {
  it('lijn loopt van beneden naar boven', () => {
    expect(lijn('e')).toEqual(['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'])
  })

  it('rij loopt van links naar rechts', () => {
    expect(rij(4)).toEqual(['a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4'])
  })

  it('pad laat het beginveld weg, want daar staat het stuk al', () => {
    expect(pad('e4', 'e7')).toEqual(['e5', 'e6', 'e7'])
    expect(pad('e4', 'a4')).toEqual(['d4', 'c4', 'b4', 'a4'])
    expect(pad('c1', 'f4')).toEqual(['d2', 'e3', 'f4'])
  })

  it('geeft niets terug voor een weg die het bord niet kent', () => {
    // Een paardensprong is geen weg maar een sprong: liever leeg dan een half pad
    // dat er op het scherm uitziet als een route.
    expect(pad('e4', 'f6')).toEqual([])
    expect(pad('e4', 'e4')).toEqual([])
  })

  it('plakt meerdere wegen aan elkaar in de volgorde waarin ze gaan', () => {
    expect(wegen(pad('e4', 'e6'), pad('e4', 'c4'))).toEqual(['e5', 'e6', 'd4', 'c4'])
  })
})

describe('wat Pip aanwijst tijdens het vertellen', () => {
  const zinnen = WERELDEN.flatMap((w) => w.lessen.flatMap((l) => l.vertel.map((z) => ({ l, z }))))

  it('wijst alleen bestaande velden aan, en geen enkel veld twee keer', () => {
    for (const { l, z } of zinnen) {
      const wijzers = vertelWijzers(z)
      for (const sq of wijzers) expect(geldigVeld(sq), `${l.id}: ${sq}`).toBe(true)
      expect(new Set(wijzers).size, `${l.id}: "${vertelTekst(z)}"`).toBe(wijzers.length)
    }
  })

  it('laat de eerste les het bord om en om zien: licht, donker, licht', () => {
    // Deze les gaat over niets anders dan de veldkleur. Wijst hij drie velden van
    // dezelfde kleur aan, dan leert een kind hier precies het tegenovergestelde.
    const les = WERELDEN[0].lessen[0]
    const wijzers = les.vertel.flatMap(vertelWijzers)
    expect(wijzers.map(isLightSquare)).toEqual([true, false, true])
  })

  it('laat de rij opzij lopen en de lijn omhoog klimmen', () => {
    const les = WERELDEN[0].lessen.find((l) => l.id === 'weide-2')!
    const rijZin = les.vertel.find((z) => vertelTekst(z).startsWith('Een rij'))!
    const lijnZin = les.vertel.find((z) => vertelTekst(z).startsWith('Een lijn'))!
    // Een rij houdt zijn cijfer vast en verandert van letter; een lijn andersom.
    const rijVelden = vertelWijzers(rijZin)
    expect(new Set(rijVelden.map((v) => v[1])).size).toBe(1)
    expect(new Set(rijVelden.map((v) => v[0])).size).toBe(8)
    const lijnVelden = vertelWijzers(lijnZin)
    expect(new Set(lijnVelden.map((v) => v[0])).size).toBe(1)
    expect(lijnVelden.map((v) => v[1])).toEqual(['1', '2', '3', '4', '5', '6', '7', '8'])
  })

  it('wijst geen veld aan waar een eigen stuk de weg verspert', () => {
    // De les "de toren stopt ervoor" wordt onzin als het spoor er dwars doorheen loopt.
    const les = WERELDEN[1].lessen.find((l) => l.id === 'toren-2')!
    const alles = les.vertel.flatMap(vertelWijzers)
    expect(alles).not.toContain('e6')
    expect(alles).not.toContain('c4')
  })
})
