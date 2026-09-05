'use client'

import Link from 'next/link'
import { Kop } from '@/ui/Kop'
import { Sterren } from '@/ui/Sterren'
import { WERELDEN } from '@/content'
import { isOntgrendeld, useToestandGeladen, useVoortgang, wereldIsAf } from '@/progress/store'

/**
 * Het pad. Bewust één lijn van boven naar beneden: een vertakte kaart is voor een
 * vijfjarige niet te lezen. Wat af is krijgt kleur, wat nog dicht zit een slotje.
 */
export default function Kaart() {
  const voortgang = useVoortgang()
  const geladen = useToestandGeladen()

  // Zonder deze pauze toont de voorgerenderde HTML alle lessen op slot, en flitst dat
  // even in beeld voordat de echte voortgang er is.
  if (!geladen) {
    return (
      <main className="page">
        <Kop titel="De kaart" terug="/" />
      </main>
    )
  }

  return (
    <main className="page">
      <Kop titel="De kaart" terug="/" />
      <div className="stack">
        {WERELDEN.map((wereld) => {
          const af = wereldIsAf(wereld.id, voortgang)
          return (
            <section key={wereld.id} className="card stack" style={{ gap: 12 }}>
              <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                <div className="row" style={{ minWidth: 0, flexWrap: 'nowrap' }}>
                  <span style={{ fontSize: 30, flexShrink: 0 }} aria-hidden="true">
                    {wereld.emoji}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ fontSize: '1.15rem' }}>
                      {wereld.nummer}. {wereld.naam}
                    </h2>
                    <p className="muted" style={{ fontSize: '0.9rem' }}>
                      {wereld.belofte}
                    </p>
                  </div>
                </div>
                {af && (
                  <span title="Deze wereld is uit" style={{ fontSize: 26 }}>
                    🏆
                  </span>
                )}
              </div>

              <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                {wereld.lessen.map((les) => {
                  const resultaat = voortgang[les.id]
                  const open = isOntgrendeld(les.id, voortgang)
                  const inhoud = (
                    <>
                      <span style={{ flex: 1, textAlign: 'left' }}>{les.titel}</span>
                      {open ? (
                        <Sterren aantal={resultaat?.sterren ?? 0} />
                      ) : (
                        <span aria-label="Nog op slot" style={{ fontSize: 24 }}>
                          🔒
                        </span>
                      )}
                    </>
                  )
                  return (
                    <li key={les.id}>
                      {open ? (
                        <Link
                          href={`/les/${les.id}/`}
                          className="btn"
                          style={{ width: '100%', justifyContent: 'space-between' }}
                        >
                          {inhoud}
                        </Link>
                      ) : (
                        <span
                          className="btn"
                          aria-disabled="true"
                          style={{
                            width: '100%',
                            justifyContent: 'space-between',
                            // Gedempte kleur in plaats van doorzichtigheid: op 0,5 haalde
                            // deze tekst het contrast van 4,5:1 in het lichte thema niet.
                            color: 'var(--muted)',
                            // En verder: geen knop meer. Geen schaduw, een gestippelde
                            // rand en een vlakkere achtergrond, zodat je zonder te lezen
                            // ziet dat hier niets te tikken valt.
                            background: 'var(--surface-2)',
                            border: '2px dashed var(--line)',
                            boxShadow: 'none',
                            cursor: 'default',
                          }}
                        >
                          {inhoud}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ol>

              {wereld.minispel && (
                <Link href={`/spel/${wereld.minispel}/`} className="btn btn--ghost">
                  🎲 Minispel: {wereld.minispel.replaceAll('-', ' ')}
                </Link>
              )}

              {wereld.diploma && af && (
                <Link href={`/diploma/${wereld.diploma}/`} className="btn btn--primary">
                  🏅 Bekijk je hoefijzer {wereld.diploma}
                </Link>
              )}
            </section>
          )
        })}
      </div>
    </main>
  )
}
