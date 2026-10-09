'use client'

import { useEffect, useId, useState } from 'react'

type Som = { a: number; b: number; antwoord: number }

/**
 * De som voor het rekenslot.
 *
 * Twee cijfers maal één, en met opzet geen tafeltjessom: 6 × 7 lost een kind van negen
 * zo op, en dan is de drempel er niet meer. Twee cijfers maal één leert een kind pas op
 * de basisschool in groep zes of zeven, en dan nog op papier.
 *
 * Wat wél is bijgesteld: de eenheden botsen niet meer. 32 × 9 vraagt onthouden en
 * overdragen — dat is voor een ouder geen drempel maar een klusje, en dat was precies
 * de klacht. Nu is het cijfer achter de tien altijd zo klein dat er niets overloopt:
 * 31 × 9 splits je in 270 en 9 en ben je klaar. Voor een kind dat de bewerking niet
 * kent verandert er niets — die kan hem sowieso niet.
 *
 * En als het toch een keer tegenzit, is er de knop "Andere som".
 */
function nieuweSom(): Som {
  const b = 3 + Math.floor(Math.random() * 7)
  // Eenheden die met b vermenigvuldigd onder de tien blijven, dus zonder overdracht.
  const eenheid = 1 + Math.floor(Math.random() * Math.floor(9 / b))
  // Vanaf twintig: 11 × 7 is voor een kind van negen nog wel te doen, 41 × 7 niet.
  const tiental = 2 + Math.floor(Math.random() * 4)
  const a = tiental * 10 + eenheid
  return { a, b, antwoord: a * b }
}

/**
 * Een drempel voor de grote mensen: een som die een kind van negen niet uit zijn hoofd
 * doet. Staat voor het ouderscherm, en voor alles wat iets buiten de app doet, zoals
 * een link versturen bij schaken op afstand.
 */
export function Rekenslot({
  titel = 'Even voor de grote mensen',
  uitleg,
  onOpen,
  onAnnuleer,
}: {
  titel?: string
  uitleg?: string
  onOpen: () => void
  /** Een weg terug zonder de som, waar dat zin heeft (zoals bij versturen). */
  onAnnuleer?: () => void
}) {
  const id = useId()
  // De som wordt pas in de browser gekozen: willekeur tijdens het prerenderen geeft
  // een hydratieverschil.
  const [som, setSom] = useState<Som | null>(null)
  useEffect(() => setSom(nieuweSom()), [])
  const [invoer, setInvoer] = useState('')
  const [misgelukt, setMisgelukt] = useState(false)

  /** Een andere som, en met een schone lei. */
  const andereSom = () => {
    setSom(nieuweSom())
    setInvoer('')
    setMisgelukt(false)
    document.getElementById(id)?.focus()
  }

  if (!som) return null
  return (
    <div className="card stack">
      <h2>{titel}</h2>
      {uitleg && <p style={{ margin: 0 }}>{uitleg}</p>}
      <p className="muted">Hoeveel is {som.a} × {som.b}?</p>
      <input
        id={id}
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
      <div className="rij" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn--primary btn--big"
          onClick={() => {
            if (Number(invoer) === som.antwoord) {
              onOpen()
              return
            }
            setMisgelukt(true)
            setInvoer('')
            document.getElementById(id)?.focus()
          }}
        >
          Verder
        </button>
        <button type="button" className="btn btn--big" onClick={andereSom}>
          ↻ Andere som
        </button>
        {onAnnuleer && (
          <button type="button" className="btn btn--big btn--ghost" onClick={onAnnuleer}>
            Toch niet
          </button>
        )}
      </div>
    </div>
  )
}
