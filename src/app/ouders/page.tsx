'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Kop } from '@/ui/Kop'
import { Sterren } from '@/ui/Sterren'
import { WERELDEN } from '@/content'
import {
  useGespeeld,
  useInstellingen,
  useProfiel,
  useProfielStore,
  useVoortgang,
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
  // De som wordt pas in de browser gekozen: willekeur tijdens het prerenderen geeft
  // een hydratieverschil.
  //
  // Twee cijfers maal één, en geen tafeltjessom: 6 × 7 lost een kind van negen zo op,
  // en dan is de drempel er niet meer. Voor een volwassene is 27 × 8 net zo snel.
  const [som, setSom] = useState<{ a: number; b: number; antwoord: number } | null>(null)
  useEffect(() => {
    const a = 12 + Math.floor(Math.random() * 28)
    const b = 3 + Math.floor(Math.random() * 7)
    setSom({ a, b, antwoord: a * b })
  }, [])
  const [invoer, setInvoer] = useState('')
  const [misgelukt, setMisgelukt] = useState(false)

  if (!open) {
    if (!som) return <main className="page" />
    return (
      <main className="page">
        <Kop titel="Voor ouders" terug="/" />
        <div className="card stack">
          <h2>Even voor de grote mensen</h2>
          <p className="muted">Hoeveel is {som.a} × {som.b}?</p>
          <input
            id="rekenslot"
            inputMode="numeric"
            value={invoer}
            onChange={(e) => {
              setInvoer(e.target.value)
              setMisgelukt(false)
            }}
            aria-label={`Hoeveel is ${som.a} maal ${som.b}`}
            aria-invalid={misgelukt}
            style={{
              font: 'inherit', padding: '14px 16px', borderRadius: 12, minHeight: 56,
              border: `2px solid ${misgelukt ? 'var(--berry)' : 'var(--line)'}`,
              background: 'var(--surface)', color: 'var(--ink)',
            }}
          />
          {misgelukt && (
            <p style={{ color: 'var(--berry)', margin: 0 }} role="alert">
              Dat klopt niet helemaal. Probeer het nog eens.
            </p>
          )}
          <button
            type="button"
            className="btn btn--primary btn--big"
            onClick={() => {
              if (Number(invoer) === som.antwoord) {
                setOpen(true)
                return
              }
              setMisgelukt(true)
              setInvoer('')
              document.getElementById('rekenslot')?.focus()
            }}
          >
            Verder
          </button>
        </div>
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
  const verwijderProfiel = useProfielStore((s) => s.verwijderProfiel)
  const gespeeld = useGespeeld()

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
          <p className="muted">
            {gedaan} van de {totaal} lessen gedaan
            {gespeeld ? ` · ${gespeeld.gewonnen + gespeeld.verloren + gespeeld.remise} partijen gespeeld` : ''}
          </p>
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
          <h2>Instellingen</h2>
          {schakel(
            'spraak',
            'Pip praat vanzelf',
            'Zet uit als je in de trein zit. De luidsprekerknop bij Pip blijft het doen — een kind dat nog niet leest heeft die nodig.',
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

        <Link href="/" className="btn btn--primary btn--big">
          Terug naar het spel
        </Link>
      </div>
    </main>
  )
}
