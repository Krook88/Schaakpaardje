import { describe, expect, it } from 'vitest'
import { ALLE_LESSEN, START } from '@/content'
import { SCHAAKREGELS, onderwerpBijLes } from '@/content/schaakregels'
import { applyMove, isLightSquare, parseBoard, PIECE_VALUE, toPlacement, type BoardMap, type PieceType } from '@/engine/board'
import { Game } from '@/engine/game'
import { VOOR_KINDEREN } from '@/seo'
import { bouwBeelden, type Animatie, type Beeld } from '@/uitleg/beelden'

/**
 * De uitlegpagina's leren een ouder de schaakregels, en via die ouder het kind. Een fout
 * hier is dus net zo erg als een fout in een les. Daarom speelt deze test elke animatie
 * na: elke zet moet kunnen, elk schaak, mat en pat moet echt zo zijn, en wat de tekst
 * over het bord beweert, rekent hij na waar dat kan.
 */

const ANIMATIES: Animatie[] = SCHAAKREGELS.flatMap((o) =>
  o.delen.flatMap((d) => (d.animatie ? [d.animatie] : [])),
)

function animatie(id: string): Animatie {
  const a = ANIMATIES.find((x) => x.id === id)
  if (!a) throw new Error(`Geen animatie ${id}`)
  return a
}

/** Het bord van een beeld, terug als BoardMap. */
function bord(b: Beeld): BoardMap {
  const uit: BoardMap = {}
  for (const st of b.stukken) if (st.veld) uit[st.veld] = { type: st.stuk, color: st.kleur }
  return uit
}

describe('de schaakregelpagina’s', () => {
  it('hebben elk een eigen adres en elke animatie een eigen anker', () => {
    const slugs = SCHAAKREGELS.map((o) => o.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    const ids = ANIMATIES.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('passen in de zoekresultaten', () => {
    for (const o of SCHAAKREGELS) {
      expect(o.omschrijving.length, o.slug).toBeLessThanOrEqual(160)
      // Met " | Schaakmaatje" erachter kapt Google rond de 65 tekens af.
      expect(o.zoektitel.length, o.slug).toBeLessThanOrEqual(65)
    }
  })

  it('verwijzen alleen naar lessen die bestaan', () => {
    const lessen = new Set(ALLE_LESSEN.map((l) => l.id))
    for (const o of SCHAAKREGELS) {
      expect(o.lessen.length, o.slug).toBeGreaterThan(0)
      for (const id of o.lessen) expect(lessen.has(id), `${o.slug} → ${id}`).toBe(true)
      if (o.oefenEerst) expect(lessen.has(o.oefenEerst), `${o.slug} → ${o.oefenEerst}`).toBe(true)
    }
  })

  it('geven een les hooguit één onderwerp', () => {
    const lessen = SCHAAKREGELS.flatMap((o) => o.lessen)
    expect(new Set(lessen).size).toBe(lessen.length)
    expect(onderwerpBijLes('paard-1')?.slug).toBe('paard')
  })
})

/**
 * Hetzelfde script nog een keer, maar zonder de bouwer: alleen de engine. Zo vergelijkt
 * de test wat het scherm tekent met wat er werkelijk op het bord staat, en niet de bouwer
 * met zichzelf. Hier ontsnapte een pion die al vóór zijn promotie als dame op het bord
 * stond: de zetten waren geldig, alleen het plaatje niet.
 */
function naspelen(a: Animatie): string[] {
  const spel = a.regels === 'echt' ? new Game(a.fen) : null
  let b = parseBoard(a.fen)
  return a.stappen.map((stap) => {
    for (const [veld, st] of Object.entries(stap.plaats ?? {})) {
      b = { ...b, [veld]: { type: st.toLowerCase() as PieceType, color: st === st.toUpperCase() ? 'w' : 'b' } }
    }
    if (stap.zet) {
      const [van, naar] = stap.zet.split('-')
      if (spel) {
        spel.move(van, naar, stap.wordt ?? 'q')
        b = parseBoard(spel.fen)
      } else {
        const kleur = b[van].color
        b = applyMove(b, van, naar)
        if (stap.wordt) b = { ...b, [naar]: { type: stap.wordt, color: kleur } }
      }
    }
    return toPlacement(b)
  })
}

describe('elke animatie', () => {
  it.each(ANIMATIES.map((a) => [a.id, a] as const))('%s tekent bij elke stap het echte bord', (_, a) => {
    expect(a.stappen.length).toBeGreaterThan(0)
    const echt = naspelen(a)
    bouwBeelden(a).forEach((b, i) => expect(toPlacement(bord(b)), `stap ${i + 1}`).toBe(echt[i]))
  })

  it.each(ANIMATIES.map((a) => [a.id, a] as const))('%s speelt zonder onmogelijke zet', (_, a) => {
    expect(() => bouwBeelden(a)).not.toThrow()
  })

  it.each(ANIMATIES.filter((a) => a.regels === 'echt').map((a) => [a.id, a] as const))(
    '%s begint in een geldige stelling',
    (_, a) => {
      // Wie níét aan zet is, mag niet schaak staan: dan had die zijn koning al kunnen
      // verliezen, en bestaat de stelling niet.
      const [plaats, aanZet] = a.fen.split(' ')
      const omgedraaid = new Game(`${plaats} ${aanZet === 'w' ? 'b' : 'w'} - - 0 1`)
      expect(omgedraaid.inCheck).toBe(false)
    },
  )

  it.each(ANIMATIES.map((a) => [a.id, a] as const))('%s noemt schaak, mat en pat alleen als het zo is', (_, a) => {
    const beelden = bouwBeelden(a)
    a.stappen.forEach((stap, i) => {
      const label = beelden[i].label
      const net = stap.zet !== undefined
      if (stap.verwacht === 'schaak') expect(label, `stap ${i + 1}`).toBe('Schaak!')
      if (stap.verwacht === 'mat') expect(label, `stap ${i + 1}`).toBe('Schaakmat!')
      if (stap.verwacht === 'pat') expect(label, `stap ${i + 1}`).toBe('Pat')
      // Andersom: een mat of pat dat niemand bedoelde, is een fout in de stelling.
      if (net && label) expect(stap.verwacht, `stap ${i + 1}`).toBeDefined()
    })
  })

  it.each(ANIMATIES.map((a) => [a.id, a] as const))('%s wijst geen verboden veld aan als bereikbaar', (_, a) => {
    const beelden = bouwBeelden(a)
    a.stappen.forEach((stap, i) => {
      if (stap.bereik) expect(beelden[i].stippen.length + beelden[i].ringen.length, `stap ${i + 1}`).toBeGreaterThan(0)
      for (const v of stap.verboden ?? []) {
        expect(stap.bereik, `stap ${i + 1}`).toBeDefined()
        expect([...beelden[i].stippen, ...beelden[i].ringen]).not.toContain(v)
      }
    })
  })
})

describe('de gestructureerde gegevens', () => {
  it('geven de leeftijd op een plek waar een validator hem leest', () => {
    // suggestedMinAge/-MaxAge bestaan alleen op PeopleAudience; op een EducationalAudience
    // werden ze op 61 pagina's genegeerd.
    expect(VOOR_KINDEREN.typicalAgeRange).toBe('3-10')
    expect(Object.keys(VOOR_KINDEREN.audience).sort()).toEqual(['@type', 'educationalRole'])
  })
})

describe('wat de tekst over het bord zegt', () => {
  it('een pion is een pion tot hij promoveert', () => {
    const b = bouwBeelden(animatie('pion-promotie'))
    expect(bord(b[0]).e7).toEqual({ type: 'p', color: 'w' })
    expect(bord(b[1]).e8).toEqual({ type: 'q', color: 'w' })
  })

  it('rechtsonder ligt een licht veld, linksonder een donker', () => {
    expect(isLightSquare('h1')).toBe(true)
    expect(isLightSquare('a1')).toBe(false)
    expect(isLightSquare('a8')).toBe(true)
  })

  it('het opzetten eindigt in de beginstelling, met de dame op haar eigen kleur', () => {
    const beelden = bouwBeelden(animatie('stukken-opzetten'))
    expect(toPlacement(bord(beelden.at(-1)!))).toBe(START)
    expect(isLightSquare('d1')).toBe(true)
    expect(isLightSquare('d8')).toBe(false)
  })

  it('een toren heeft op een leeg bord altijd veertien velden', () => {
    const b = bouwBeelden(animatie('toren-recht'))
    expect(b[1].stippen).toHaveLength(14)
    expect(b[4].stippen).toHaveLength(14)
  })

  it('de loper blijft op zijn kleur', () => {
    const schuin = bouwBeelden(animatie('loper-schuin'))
    expect(isLightSquare('c1')).toBe(false)
    expect(schuin[4].stippen.every((v) => !isLightSquare(v))).toBe(true)
    const kleur = bouwBeelden(animatie('loper-kleur'))
    expect(kleur[0].stippen.every((v) => !isLightSquare(v))).toBe(true)
    expect(kleur[1].stippen.every((v) => isLightSquare(v))).toBe(true)
  })

  it('de dame heeft midden op het bord 27 velden', () => {
    expect(bouwBeelden(animatie('dame-recht-schuin'))[1].stippen).toHaveLength(27)
  })

  it('het paard: acht sprongen in het midden, twee in de hoek, en elke sprong van kleur wisselen', () => {
    const l = bouwBeelden(animatie('paard-l'))
    expect(l[3].stippen).toHaveLength(8)
    expect(isLightSquare('e6')).not.toBe(isLightSquare('g5'))
    const hoek = bouwBeelden(animatie('paard-hoek'))
    expect(hoek[0].stippen).toHaveLength(2)
    expect(hoek[3].stippen).toHaveLength(8)
    expect(bouwBeelden(animatie('paard-springt'))[1].stippen.sort()).toEqual(['f3', 'h3'])
  })

  it('de koning heeft midden op het bord acht velden', () => {
    expect(bouwBeelden(animatie('koning-stap'))[1].stippen).toHaveLength(8)
  })

  it('de pion: twee vanaf de start, daarna één, en recht vooruit geblokkeerd', () => {
    const v = bouwBeelden(animatie('pion-vooruit'))
    expect(v[0].stippen.sort()).toEqual(['e3', 'e4'])
    expect(v[2].stippen).toEqual(['e5'])
    const s = bouwBeelden(animatie('pion-slaan'))
    expect(s[1].stippen).toEqual([])
    expect(s[1].ringen).toEqual(['d5'])
  })

  it('en passant: de pion gaat naar een leeg veld en de pion ernaast verdwijnt', () => {
    const b = bouwBeelden(animatie('en-passant'))
    expect(b[2].ringen).toContain('d6')
    const na = bord(b[3])
    expect(na.d6).toEqual({ type: 'p', color: 'w' })
    expect(na.d5).toBeUndefined()
  })

  it('rokade: de toren verhuist mee, en het is dezelfde toren', () => {
    const a = animatie('rokade-kort-lang')
    const b = bouwBeelden(a)
    const toren = (beeld: Beeld, veld: string) => beeld.stukken.find((s) => s.veld === veld)?.id
    expect(toren(b[1], 'f1')).toBe(toren(b[0], 'h1'))
    expect(toren(b[2], 'd8')).toBe(toren(b[1], 'a8'))
    const verboden = bouwBeelden(animatie('rokade-verboden'))
    expect(verboden[1].stippen).toContain('c1')
  })

  it('het duurste stuk pakken: de toren levert meer op dan de pion', () => {
    const b = bouwBeelden(animatie('waarde-kiezen'))
    const voor = bord(b[0])
    const duurste = [...b[0].ringen].sort((x, y) => PIECE_VALUE[voor[y].type] - PIECE_VALUE[voor[x].type])[0]
    expect(animatie('waarde-kiezen').stappen[2].zet).toBe(`d4-${duurste}`)
  })
})
