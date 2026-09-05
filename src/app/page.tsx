'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pip } from '@/ui/Pip'
import { kies, speak } from '@/audio/voice'
import { KENNISMAKING, WELKOM, WELKOM_TERUG } from '@/content/voice'
import { lesMet, WERELDEN } from '@/content'
import { kiesOpfrisopgaven } from '@/lesson/opfrisser'
import { aantalBezit, verzameling } from '@/progress/verzameling'
import {
  AVATARS,
  sterrenTotaal,
  useProfiel,
  useProfielStore,
  useStickers,
  useToestandGeladen,
  useVerslagen,
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
  const verslagen = useVerslagen()

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
  // Alleen tonen als er echt iets ligt te verstoffen. Een knop die "niets te doen"
  // oplevert leert een kind de knop te negeren.
  const opfrissen = kiesOpfrisopgaven(voortgang).length
  const stalVakken = verzameling(voortgang, verslagen)
  const inStal = aantalBezit(stalVakken)

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
          // Geen naam en geen lestitel in de gesproken zin: die verschilt per kind en
          // per moment, en kan dus nooit ingesproken worden. Zo'n zin valt terug op de
          // stem van de tablet, precies tussen alle zinnen die Pip zelf zegt in — dat
          // hoor je meteen. De naam staat toch al groot in de kop hierboven, en welke
          // les het is staat op de knop eronder.
          zegt={kies(WELKOM_TERUG, 'welkom')}
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
          {/* De grootste knop van de app. Voor een niet-lezer moet hij op één beeld
              te herkennen zijn: het driehoekje van "start", plus het plaatje van
              precies die les. De tekst is er voor de ouder. */}
          <Link
            href={`/les/${verder.id}/`}
            className="btn btn--primary btn--big"
            style={{ padding: 18, gap: 14, minHeight: 88 }}
          >
            <span aria-hidden="true" style={{ fontSize: 38, lineHeight: 1 }}>
              ▶︎
            </span>
            <span aria-hidden="true" style={{ fontSize: 38, lineHeight: 1 }}>
              {verderLes?.icoon ?? '🐴'}
            </span>
            <span style={{ flex: 1, textAlign: 'left' }}>Verder leren — {verder.titel}</span>
          </Link>
          {opfrissen > 0 && (
            <Link
              href="/opfrissen/"
              className="btn btn--big"
              style={{ minHeight: 76, borderColor: 'var(--accent)' }}
            >
              <span aria-hidden="true" style={{ fontSize: 32 }}>
                🔄
              </span>
              <span style={{ flex: 1, textAlign: 'left' }}>
                Opfrissen — {opfrissen} van vorige week
              </span>
            </Link>
          )}

          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
            <Link href="/kaart/" className="btn btn--big" style={{ minHeight: 76 }}>
              <span aria-hidden="true" style={{ fontSize: 32 }}>
                🗺️
              </span>{' '}
              De kaart
            </Link>
            <Link href="/spelen/" className="btn btn--big" style={{ minHeight: 76 }}>
              <span aria-hidden="true" style={{ fontSize: 32 }}>
                ♟️
              </span>{' '}
              Een partijtje
            </Link>
          </div>
        </div>

        {/* De stal: wat er te verzamelen valt. Hier stond een raster van 48 identieke
            medailles — je zag dus niet wát je verdiend had, alleen hoevéél. */}
        <Link href="/stal/" className="card stack" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.1rem' }}>Mijn stal</h2>
            <span className="muted">
              {inStal} van de {stalVakken.length}
            </span>
          </div>
          <div className="row" style={{ gap: 8 }} aria-hidden="true">
            {stalVakken.map((v) => (
              <span
                key={v.id}
                title={v.bezit ? v.naam : `${v.naam} — ${v.hoe}`}
                style={{
                  fontSize: 24,
                  filter: v.bezit ? 'none' : 'grayscale(1)',
                  opacity: v.bezit ? 1 : 0.28,
                }}
              >
                {v.teken}
              </span>
            ))}
          </div>
          {stickers.length > 0 && (
            <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
              Plus {stickers.length} {stickers.length === 1 ? 'sticker' : 'stickers'} van perfecte lessen.
            </p>
          )}
        </Link>

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
      <Pip zegt={WELKOM} stemming="blij" />

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
            void speak(KENNISMAKING)
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
