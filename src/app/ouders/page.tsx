'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Kop } from '@/ui/Kop'
import { Rekenslot } from '@/ui/Rekenslot'
import { Sterren } from '@/ui/Sterren'
import { KOFFIE } from '@/seo'
import { WERELDEN } from '@/content'
import {
  useGespeeld,
  useOefendagen,
  useLaatstGeoefend,
  useInstellingen,
  useProfiel,
  useProfielStore,
  useVoortgang,
  modusVoorLeeftijd,
  type Instellingen,
  type Modus,
} from '@/progress/store'

/**
 * Ouderscherm achter een rekenslot. Dat is geen beveiliging maar een drempel: het
 * voorkomt dat een kind per ongeluk instellingen omzet, en het is wat Apple en Google
 * van een kinder-app verwachten.
 */
const MODI: { id: Modus; naam: string; uitleg: string }[] = [
  {
    id: 'pip',
    naam: 'Pip · 3-5',
    uitleg:
      'Begint bij de eerste les en werkt het pad af. Drie tegenstanders in beeld, Pip praat rustig en waarschuwt voor een blunder.',
  },
  {
    id: 'ontdekker',
    naam: 'Ontdekker · 6-8',
    uitleg:
      'De Weide, Torenburcht en Loperbos staan meteen open, dus wachten hoeft niet. Vijf tegenstanders in beeld.',
  },
  {
    id: 'schaker',
    naam: 'Schaker · 8-10',
    uitleg:
      'Alle werelden tot en met Waardevallei staan meteen open. Alle tegenstanders in beeld, velden krijgen hun naam (a1, e4), geen blunderwaarschuwing, en Pip praat wat volwassener.',
  },
]

export default function Ouders() {
  const [open, setOpen] = useState(false)
  if (!open) {
    return (
      <main className="page">
        <Kop titel="Voor ouders" terug="/" />
        <Rekenslot onOpen={() => setOpen(true)} />
      </main>
    )
  }

  return <OuderPaneel />
}

function OuderPaneel() {
  const profiel = useProfiel()
  const voortgang = useVoortgang()
  const instellingen = useInstellingen()
  const zetInstelling = useProfielStore((s) => s.zetInstelling)
  const zetModus = useProfielStore((s) => s.zetModus)
  const zetLeeftijd = useProfielStore((s) => s.zetLeeftijd)
  const herstelInstellingen = useProfielStore((s) => s.herstelInstellingen)
  const verwijderProfiel = useProfielStore((s) => s.verwijderProfiel)
  const gespeeld = useGespeeld()
  const oefendagen = useOefendagen()
  const laatst = useLaatstGeoefend()

  const gedaan = Object.keys(voortgang).length
  const totaal = WERELDEN.flatMap((w) => w.lessen).length

  const schakel = (sleutel: keyof Instellingen, label: string, uitleg?: string) => (
    <label className="row" style={{ justifyContent: 'space-between', gap: 16 }}>
      <span style={{ flex: 1 }}>
        {label}
        {uitleg && (
          <>
            <br />
            <small className="muted">{uitleg}</small>
          </>
        )}
      </span>
      <input
        type="checkbox"
        checked={Boolean(instellingen[sleutel])}
        onChange={(e) => zetInstelling(sleutel, e.target.checked as never)}
        style={{ width: 44, height: 44, flexShrink: 0 }}
      />
    </label>
  )

  return (
    <main className="page">
      <Kop titel="Voor ouders" terug="/" />
      <div className="stack">
        <section className="card stack">
          <h2>Wat kan {profiel?.naam ?? 'je kind'} nu?</h2>
          {/* Elk deel een eigen lijstje-regel die niet afbreekt: in één zin brak "· 6" los
              van "partijen". En voor de ouder ook wanneer er laatst geoefend is; dat
              staat bewust niet bij het kind, zodat het geen druk wordt. */}
          <ul className="muted" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 2 }}>
            <li style={{ whiteSpace: 'nowrap' }}>{gedaan} van de {totaal} lessen gedaan</li>
            {gespeeld && (
              <li style={{ whiteSpace: 'nowrap' }}>
                {gespeeld.gewonnen + gespeeld.verloren + gespeeld.remise} partijen gespeeld
              </li>
            )}
            {oefendagen > 0 && (
              <li>
                Op {oefendagen} {oefendagen === 1 ? 'dag' : 'dagen'} geoefend
                {laatst && <>, laatst {laatsteDag(laatst)}</>}
              </li>
            )}
          </ul>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
            {WERELDEN.map((wereld) => {
              const lessen = wereld.lessen.filter((l) => voortgang[l.id])
              if (!lessen.length) return null
              return (
                <li key={wereld.id}>
                  <strong>
                    {wereld.emoji} {wereld.naam}
                  </strong>
                  <ul style={{ listStyle: 'none', margin: '6px 0 0', padding: 0, display: 'grid', gap: 4 }}>
                    {lessen.map((l) => (
                      <li key={l.id} className="row" style={{ justifyContent: 'space-between' }}>
                        <span style={{ flex: 1 }}>
                          <small>{l.doel}</small>
                        </span>
                        <Sterren aantal={voortgang[l.id].sterren} />
                      </li>
                    ))}
                  </ul>
                </li>
              )
            })}
            {gedaan === 0 && <li className="muted">Nog niets gedaan. De eerste les staat klaar.</li>}
          </ul>
        </section>

        {/* De leeftijdsmodus doet nu iets, dus hoort hij hier te staan.
            Hij werd bij het aanmaken van het profiel uit de leeftijd berekend en daarna
            nooit meer gelezen: een driejarige en een tienjarige kregen letterlijk
            hetzelfde scherm. Nu bepaalt hij drie dingen, en dus moet een ouder hem
            kunnen verzetten — een achtjarige die nog nooit geschaakt heeft is hier
            beter af op Ontdekker. */}
        <section className="card stack">
          <h2>Leeftijd</h2>
          <p className="muted" style={{ margin: 0 }}>
            Bepaalt waar {profiel?.naam ?? 'je kind'} mag beginnen op de kaart, hoeveel
            tegenstanders er meteen te zien zijn, en hoe Pip praat. Het verandert niets aan de
            lessen zelf, en niets aan wat er al gehaald is.
          </p>
          {/* De leeftijd werd één keer gevraagd bij het aanmaken en daarna nooit meer:
              een kind dat jarig was bleef voorgoed vijf. Verzetten schuift de modus mee,
              want daar is de leeftijd voor — en wie het daar niet mee eens is, kiest
              hieronder gewoon iets anders. */}
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                type="button"
                className="btn"
                onClick={() => zetLeeftijd(n)}
                aria-pressed={profiel?.leeftijd === n}
                aria-label={`${n} jaar`}
                style={{
                  minHeight: 52,
                  minWidth: 52,
                  padding: '0 12px',
                  borderColor: profiel?.leeftijd === n ? 'var(--accent)' : undefined,
                  background: profiel?.leeftijd === n ? 'var(--accent-soft)' : undefined,
                }}
              >
                {n}
              </button>
            ))}
          </div>

          <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Bij {profiel?.leeftijd ?? 6} jaar hoort{' '}
            <strong>{MODI.find((m) => m.id === modusVoorLeeftijd(profiel?.leeftijd ?? 6))?.naam}</strong>.
            Klopt dat niet voor jouw kind, kies dan zelf:
          </p>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            {MODI.map((m) => (
              <button
                key={m.id}
                type="button"
                className="btn"
                onClick={() => zetModus(m.id)}
                aria-pressed={profiel?.modus === m.id}
                style={{
                  minHeight: 56,
                  padding: '0 16px',
                  borderColor: profiel?.modus === m.id ? 'var(--accent)' : undefined,
                  background: profiel?.modus === m.id ? 'var(--accent-soft)' : undefined,
                }}
              >
                {m.naam}
              </button>
            ))}
          </div>
          <small className="muted">{MODI.find((m) => m.id === profiel?.modus)?.uitleg}</small>
        </section>

        <section className="card stack">
          <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
            <h2 style={{ margin: 0 }}>Instellingen</h2>
            {/* Van modus wisselen laat deze schuifjes expres staan — het kunnen jouw
                keuzes zijn. Maar dan moet er wel een weg terug zijn. */}
            <button
              type="button"
              className="btn btn--ghost"
              onClick={herstelInstellingen}
              style={{ minHeight: 44, fontSize: '0.9rem' }}
            >
              ↺ Standaard voor {MODI.find((m) => m.id === profiel?.modus)?.naam.split(' ·')[0]}
            </button>
          </div>
          {schakel(
            'spraak',
            'Pip praat vanzelf',
            'Zet uit als je in de trein zit. De luidsprekerknop bij Pip blijft het doen. Een kind dat nog niet leest heeft die nodig.',
          )}
          {schakel('ondertiteling', 'Ondertiteling', 'Laat zien wat Pip zegt.')}
          {schakel('effecten', 'Geluidjes')}
          {schakel('coordinaten', 'Velden benoemen (a1, e4)', 'Handig vanaf een jaar of acht.')}
          {schakel('blunderWaarschuwing', 'Waarschuwen voor een blunder', 'Pip vraagt of je het zeker weet.')}
          <label className="row" style={{ justifyContent: 'space-between' }}>
            <span>Spreektempo</span>
            <span className="row">
              {([0.8, 1, 1.2] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className="btn"
                  onClick={() => zetInstelling('tempo', t)}
                  aria-pressed={instellingen.tempo === t}
                  style={{
                    minHeight: 44, padding: '0 14px',
                    borderColor: instellingen.tempo === t ? 'var(--accent)' : undefined,
                  }}
                >
                  {t === 0.8 ? 'rustig' : t === 1 ? 'gewoon' : 'vlot'}
                </button>
              ))}
            </span>
          </label>
        </section>

        <section className="card stack">
          <h2>Privacy</h2>
          <p className="muted">
            Alles staat op dit apparaat: een voornaam, een leeftijd en de voortgang. Er gaat
            niets naar internet, er zijn geen advertenties, geen chat en geen account. Wil je
            alles wissen, dan kan dat hier.
          </p>
          {/* Achter het rekenslot, dus geen kind komt hier per ongeluk. Een regel tekst
              en geen knop: wie hem zoekt vindt hem, wie hem niet zoekt ziet hem amper. */}
          <p className="muted" style={{ margin: 0 }}>
            Schaakmaatje wordt in de avonduren gemaakt en betaald uit eigen zak.{' '}
            <a href={KOFFIE} target="_blank" rel="noopener noreferrer">
              Een kop koffie trakteren
            </a>{' '}
            mag, maar hoeft niet. Het levert je niets extra's op.
          </p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              if (profiel && confirm(`Alle gegevens van ${profiel.naam} wissen?`)) {
                verwijderProfiel(profiel.id)
              }
            }}
          >
            Profiel wissen
          </button>
        </section>

        {/* De uitleg voor ouders: hoe de app werkt, hoe lang per dag, tips voor thuis.
            Alleen hier en op de landingspagina, niet op het kindscherm: op /over/ staat
            de koffielink, en die hoort achter het rekenslot te blijven. */}
        <section className="card stack">
          <h2>Meer weten?</h2>
          <p className="muted" style={{ margin: 0 }}>
            Hoe een les werkt, hoe lang per dag genoeg is, tips om thuis aan een echt bord
            mee te doen, en hoe de app zich verhoudt tot de Stappenmethode.
          </p>
          <Link href="/over/" className="btn">
            Over Schaakmaatje
          </Link>
        </section>

        <Link href="/" className="btn btn--primary btn--big">
          Terug naar het spel
        </Link>
      </div>
    </main>
  )
}

/** "vandaag", "gisteren" of "dinsdag 7 oktober", voor de ouder. */
function laatsteDag(iso: string): string {
  const [j, m, d] = iso.split('-').map(Number)
  const dag = new Date(j, m - 1, d)
  const nu = new Date()
  const vandaag = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate())
  const verschil = Math.round((vandaag.getTime() - dag.getTime()) / 86_400_000)
  if (verschil === 0) return 'vandaag'
  if (verschil === 1) return 'gisteren'
  return dag.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })
}
