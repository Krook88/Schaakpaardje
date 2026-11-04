'use client'

import { useEffect, useState } from 'react'
import { tel } from '@/progress/tellen'
import { SITE } from '@/seo'

/**
 * Een knop voor de ouder om Schaakmaatje door te sturen, op de momenten dat het kind
 * trots is (wereld af, diploma). Bewust vast:
 *
 * - Alleen de link naar de startpagina en een vaste zin. Nooit een naam, een
 *   voortgang of een profiel: wat over een kind gaat blijft op dit toestel (CLAUDE.md).
 * - Geen knop die terugkomt of zeurt, geen beloning voor delen. Een kind wordt hier
 *   niet onder druk gezet; het is een gewone knop onder het feest.
 *
 * Met de deelfunctie van het toestel (WhatsApp, Mail…) als die er is, anders wordt de
 * link gekopieerd. Lukt ook dat niet, dan staat de link er zichtbaar om over te nemen.
 */
export const DEELTEKST = 'Mijn kind leert schaken met Pip het schaakpaardje. Gratis, zonder reclame:'

type Uitkomst = 'niets' | 'gedeeld' | 'gekopieerd' | 'zelf'

export function DeelKnop({
  waar,
  label = 'Vertel een andere ouder',
  plaatje,
}: {
  /** Alleen voor de anonieme telling: wélk trots moment, nooit wélk kind. */
  waar: 'wereld' | 'diploma'
  label?: string
  /**
   * Een vast plaatje uit public/ dat mee mag (besluit Kaj, 4 nov 2026): het wereldwapen,
   * nooit iets met de naam van het kind. Alleen een pad naar een bestand dat voor
   * iedereen hetzelfde is; er wordt hier niets getekend of ingevuld.
   */
  plaatje?: string
}) {
  const [uitkomst, setUitkomst] = useState<Uitkomst>('niets')
  const url = `${SITE}/`
  // Vooraf ophalen, van de eigen site: haal je het pas bij de tik op, dan is Safari de
  // tik kwijt tegen de tijd dat share() komt, en weigert het.
  const [bestand, setBestand] = useState<File | null>(null)
  useEffect(() => {
    if (!plaatje) return
    let weg = false
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${plaatje}`)
      .then((r) => (r.ok ? r.blob() : null))
      .then((b) => {
        if (b && !weg) setBestand(new File([b], `schaakmaatje-${plaatje.split('/').pop()}`, { type: b.type || 'image/png' }))
      })
      .catch(() => {})
    return () => {
      weg = true
    }
  }, [plaatje])

  async function deel() {
    if (typeof navigator.share === 'function') {
      try {
        const metPlaatje = bestand && navigator.canShare?.({ files: [bestand] })
        await navigator.share(
          metPlaatje
            ? { title: 'Schaakmaatje', text: `${DEELTEKST} ${url}`, files: [bestand] }
            : { title: 'Schaakmaatje', text: DEELTEKST, url },
        )
        setUitkomst('gedeeld')
        tel('Gedeeld', { hoe: 'gedeeld', waar })
        return
      } catch (fout) {
        // Weggetikt door de ouder: dat is geen fout, en dan ook geen terugval.
        if ((fout as Error)?.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(`${DEELTEKST} ${url}`)
      setUitkomst('gekopieerd')
      tel('Gedeeld', { hoe: 'gekopieerd', waar })
    } catch {
      // Ook als Safari na een mislukte share de activatie kwijt is, of er geen
      // klembord is (http, oude webview): dan staat de link er gewoon zichtbaar.
      setUitkomst('zelf')
    }
  }

  return (
    <div className="stack center" style={{ gap: 6 }}>
      <button type="button" className="btn btn--ghost" onClick={deel} style={{ alignSelf: 'center' }} data-deelknop>
        <span aria-hidden="true" style={{ fontSize: 24, lineHeight: 1 }}>
          💌
        </span>{' '}
        {label}
      </button>
      <p className="muted" role="status" style={{ margin: 0, minHeight: '1.4em', fontSize: '0.9rem' }}>
        {uitkomst === 'gedeeld' && 'Bedankt voor het doorsturen!'}
        {uitkomst === 'gekopieerd' && 'De link is gekopieerd. Plak hem in een bericht.'}
        {uitkomst === 'zelf' && <>Stuur deze link door: {url}</>}
      </p>
    </div>
  )
}
