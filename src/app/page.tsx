'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pip } from '@/ui/Pip'
import { speak } from '@/audio/voice'
import { lesMet, WERELDEN } from '@/content'
import {
  AVATARS,
  sterrenTotaal,
  useProfiel,
  useProfielStore,
  useStickers,
  useToestandGeladen,
  useVoortgang,
  volgendeOpenLes,
  wereldIsAf,
} from '@/progress/store'

export default function Thuis() {
  const geladen = useToestandGeladen()
  const profielen = useProfielStore((s) => s.profielen)
  const profiel = useProfiel()
  const kiesProfiel = useProfielStore((s) => s.kiesProfiel)
  const maakProfiel = useProfielStore((s) => s.maakProfiel)
  const voortgang = useVoortgang()
  const stickers = useStickers()

  if (!geladen) return <main className="page" />

  if (!profiel) {
    return (
      <main className="page">
        <NieuwProfiel
          bestaand={profielen.map((p) => ({ id: p.id, naam: p.naam, avatar: p.avatar }))}
          onKies={kiesProfiel}
          onMaak={maakProfiel}
        />
      </main>
    )
  }

  const verder = volgendeOpenLes(voortgang)
  const verderLes = lesMet(verder.id)
  const totaal = sterrenTotaal(voortgang)
  const maxSterren = WERELDEN.flatMap((w) => w.lessen).length * 3
  const wereldenAf = WERELDEN.filter((w) => wereldIsAf(w.id, voortgang))

  return (
    <main className="page">
      <div className="stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="row">
            <span style={{ fontSize: 34 }} aria-hidden="true">
              {profiel.avatar}
            </span>
            <div>
              <h1 style={{ fontSize: '1.5rem' }}>Hoi {profiel.naam}!</h1>
              <p className="muted" style={{ fontSize: '0.9rem' }}>
                {/* Geen sterrenrij hier: die stond na drie sterren al vol, terwijl de tekst
                    ernaast "5 van de 141" zei. Voor een kind dat nog niet leest is dat
                    beeld het enige wat het ziet. Het getal blijft, voor de ouder; de
                    wereldrij hieronder is wat het kind ziet. */}
                ⭐ {totaal} van de {maxSterren} sterren
              </p>
            </div>
          </div>
          <Link href="/ouders/" className="btn btn--ghost" aria-label="Voor ouders">
            ⚙️
          </Link>
        </div>

        <Pip
          // Zonder deze afweging staat er "... met Wat is een stuk waard??"
          zegt={`Hoi ${profiel.naam}! Leuk dat je er bent. Zullen we verder gaan met ${
            verderLes?.titel ?? 'de eerste les'
          }${verderLes?.titel.endsWith('?') ? '' : '?'}`}
          stemming="blij"
        />

        {/* Voortgang zonder letters: elke wereld één plaatje, in kleur als hij uit is.
            Het loopt van links naar rechts vol, en dat is de hele boodschap. */}
        <div
          className="row"
          style={{ gap: 6, rowGap: 8 }}
          aria-label={`${wereldenAf.length} van de ${WERELDEN.length} werelden uit`}
        >
          {WERELDEN.map((w) => {
            const af = wereldIsAf(w.id, voortgang)
            return (
              <span
                key={w.id}
                title={`${w.nummer}. ${w.naam}`}
                aria-hidden="true"
                style={{
                  fontSize: 24,
                  filter: af ? 'none' : 'grayscale(1)',
                  opacity: af ? 1 : 0.4,
                }}
              >
                {w.emoji}
              </span>
            )
          })}
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          <Link href={`/les/${verder.id}/`} className="btn btn--primary btn--big" style={{ padding: 20 }}>
            ▶︎ Verder leren — {verder.titel}
          </Link>
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
            <Link href="/kaart/" className="btn btn--big">
              🗺️ De kaart
            </Link>
            <Link href="/spelen/" className="btn btn--big">
              ♟️ Een partijtje
            </Link>
          </div>
        </div>

        <section className="card stack">
          <h2 style={{ fontSize: '1.1rem' }}>Mijn stickers</h2>
          {stickers.length === 0 ? (
            <p className="muted">
              Nog geen stickers. Haal drie sterren bij een les, dan krijg je er eentje.
            </p>
          ) : (
            <div className="row" aria-label={`${stickers.length} stickers`}>
              {stickers.map((s) => (
                <span key={s} title={lesMet(s)?.titel ?? s} style={{ fontSize: 28 }}>
                  🏅
                </span>
              ))}
            </div>
          )}
        </section>

        {profielen.length > 1 && (
          <section className="card stack">
            <h2 style={{ fontSize: '1.1rem' }}>Wie speelt er?</h2>
            <div className="row">
              {profielen.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="btn"
                  onClick={() => kiesProfiel(p.id)}
                  aria-pressed={p.id === profiel.id}
                  style={p.id === profiel.id ? { borderColor: 'var(--accent)' } : undefined}
                >
                  {p.avatar} {p.naam}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function NieuwProfiel({
  bestaand,
  onKies,
  onMaak,
}: {
  bestaand: { id: string; naam: string; avatar: string }[]
  onKies: (id: string) => void
  onMaak: (naam: string, leeftijd: number, avatar: string) => string
}) {
  const [naam, setNaam] = useState('')
  const [leeftijd, setLeeftijd] = useState(6)
  const [avatar, setAvatar] = useState<string>(AVATARS[0])

  return (
    <div className="stack">
      <h1>Schaakmaatje</h1>
      <Pip zegt="Hoi! Ik ben Pip, het schaakpaardje. Hoe heet jij?" stemming="blij" />

      {bestaand.length > 0 && (
        <section className="card stack">
          <h2 style={{ fontSize: '1.1rem' }}>Speel je weer verder?</h2>
          <div className="row">
            {bestaand.map((p) => (
              <button key={p.id} type="button" className="btn btn--big" onClick={() => onKies(p.id)}>
                {p.avatar} {p.naam}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="card stack">
        <h2 style={{ fontSize: '1.1rem' }}>Nieuw hier</h2>
        <label className="stack" style={{ gap: 6 }}>
          <span>Hoe heet je?</span>
          <input
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            placeholder="Je naam"
            maxLength={16}
            style={{
              font: 'inherit', padding: '14px 16px', borderRadius: 12,
              border: '2px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)',
              minHeight: 56,
            }}
          />
        </label>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
          <legend>Hoe oud ben je?</legend>
          <div className="row">
            {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                type="button"
                className="btn"
                onClick={() => setLeeftijd(n)}
                aria-pressed={leeftijd === n}
                style={{
                  minWidth: 58,
                  borderColor: leeftijd === n ? 'var(--accent)' : undefined,
                  background: leeftijd === n ? 'var(--accent-soft)' : undefined,
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
          <legend>Kies een maatje</legend>
          <div className="row">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                className="btn"
                onClick={() => setAvatar(a)}
                aria-pressed={avatar === a}
                aria-label={`Kies ${a}`}
                style={{
                  fontSize: 26, minWidth: 58,
                  borderColor: avatar === a ? 'var(--accent)' : undefined,
                  background: avatar === a ? 'var(--accent-soft)' : undefined,
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          className="btn btn--primary btn--big"
          onClick={() => {
            onMaak(naam, leeftijd, avatar)
            void speak(`Hoi ${naam || 'schaker'}! Leuk je te ontmoeten. We beginnen bij het bord.`)
          }}
        >
          Beginnen →
        </button>
        <p className="muted" style={{ fontSize: '0.85rem' }}>
          Alles blijft op dit apparaat. Er gaat niets naar internet en je hoeft nergens een
          account voor te maken.
        </p>
      </section>
    </div>
  )
}
