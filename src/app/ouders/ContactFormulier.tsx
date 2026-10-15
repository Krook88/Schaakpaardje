'use client'

import { useState } from 'react'

const SOORTEN = [
  { id: 'fout', label: 'Een fout gezien' },
  { id: 'idee', label: 'Een idee' },
  { id: 'vraag', label: 'Een vraag' },
  { id: 'anders', label: 'Iets anders' },
] as const

type Stand = 'invullen' | 'bezig' | 'verstuurd' | 'fout' | 'druk'

/**
 * Een bericht van een ouder aan de maker. Alleen op het ouderscherm, achter het
 * rekenslot: een kind typt hier niets, en wat een kind intypt gaat nooit naar internet.
 *
 * Het gaat naar `public/teller/bericht.php`, die het naar info@schaakmaatje.nl mailt en
 * op het dashboard zet. Een e-mailadres is niet nodig, alleen als je antwoord wilt.
 */
export function ContactFormulier() {
  const [soort, setSoort] = useState<(typeof SOORTEN)[number]['id']>('idee')
  const [bericht, setBericht] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [stand, setStand] = useState<Stand>('invullen')

  if (stand === 'verstuurd') {
    return (
      <div className="stack">
        <p style={{ margin: 0 }}>
          Dank je wel! Je bericht is verstuurd.
          {email ? ' Als het een vraag is, komt het antwoord naar het adres dat je opgaf.' : ''}
        </p>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setBericht('')
            setStand('invullen')
          }}
        >
          Nog een bericht
        </button>
      </div>
    )
  }

  const verstuur = async (e: React.FormEvent) => {
    e.preventDefault()
    setStand('bezig')
    try {
      const r = await fetch('/teller/bericht.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soort, bericht, email: email.trim(), website }),
      })
      setStand(r.ok ? 'verstuurd' : r.status === 429 ? 'druk' : 'fout')
    } catch {
      setStand('fout')
    }
  }

  return (
    <form className="stack" onSubmit={verstuur}>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }} role="group" aria-label="Waar gaat het over?">
        {SOORTEN.map((s) => (
          <button
            key={s.id}
            type="button"
            className="btn"
            aria-pressed={soort === s.id}
            onClick={() => setSoort(s.id)}
            style={{
              minHeight: 44,
              borderColor: soort === s.id ? 'var(--accent)' : undefined,
              background: soort === s.id ? 'var(--accent-soft)' : undefined,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
      <label className="stack" style={{ gap: 4 }}>
        <span>Je bericht</span>
        <textarea
          value={bericht}
          onChange={(e) => setBericht(e.target.value)}
          required
          minLength={5}
          maxLength={2000}
          rows={5}
          placeholder="Bij welke les, en wat gebeurde er?"
          style={{ font: 'inherit', padding: 10, borderRadius: 10, border: '2px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)', width: '100%' }}
        />
      </label>
      <label className="stack" style={{ gap: 4 }}>
        <span>
          Je e-mailadres <small className="muted">(alleen als je antwoord wilt)</small>
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={120}
          autoComplete="email"
          style={{ font: 'inherit', padding: 10, borderRadius: 10, border: '2px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)', minHeight: 44 }}
        />
      </label>
      {/* Voor robots: een mens ziet dit veld niet en laat het leeg. */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }}
      />
      <small className="muted">
        Je bericht gaat naar info@schaakmaatje.nl. Een e-mailadres bewaren we alleen om te
        antwoorden, en na een jaar wordt het gewist.
      </small>
      {stand === 'fout' && (
        <p role="alert" style={{ margin: 0 }}>
          Versturen lukte niet. Probeer het later nog eens, of mail naar info@schaakmaatje.nl.
        </p>
      )}
      {stand === 'druk' && (
        <p role="alert" style={{ margin: 0 }}>
          Er komen nu veel berichten binnen. Probeer het over een uur nog eens.
        </p>
      )}
      <button type="submit" className="btn btn--primary" disabled={stand === 'bezig' || bericht.trim().length < 5}>
        {stand === 'bezig' ? 'Bezig met versturen…' : 'Versturen'}
      </button>
    </form>
  )
}
