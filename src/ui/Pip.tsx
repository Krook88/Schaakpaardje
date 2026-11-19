'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { luisterOfPipKlinkt, onSubtitle, pipKlinkt, speak, stopSpeaking } from '@/audio/voice'
import styles from './Pip.module.css'
import { icoonBeeld, pipBeeld, pipPraat } from './beelden'

export type PipStemming = 'blij' | 'juicht' | 'verrast' | 'denkt' | 'moedigt' | 'trots' | 'slaapt'

/** Wat Pip met zijn hoofd doet bij elke stemming. Zie Pip.module.css. */
const BEWEGING: Record<PipStemming, string> = {
  blij: '',
  juicht: styles.juicht,
  verrast: styles.verrast,
  denkt: styles.denkt,
  moedigt: styles.moedigt,
  trots: styles.trots,
  slaapt: styles.slaapt,
}

/**
 * De mascotte met zijn tekstballon.
 *
 * Pip is een eigen tekening in zeven stemmingen (scripts/pip-tekenen.py, goedgekeurd
 * door Kaj op 4 nov 2026), geen emoji meer. De beweging blijft het werk doen dat een
 * stilstaand gezicht niet kan. Pip was
 * zes stemmingen lang exact hetzelfde plaatje met een ander speldje ernaast — hij
 * praatte wel, maar hij deed niets. Nu knikt hij als hij aanmoedigt, kantelt hij als
 * hij nadenkt, springt hij als je het goed hebt, en wiebelt hij zachtjes zolang hij
 * aan het woord is. Dat laatste is het belangrijkste: een kind ziet daaraan dat het
 * even moet luisteren, en ziet even goed wanneer het weer aan de beurt is.
 *
 * Binnen de tekening leeft hij ook (november 2026): hij knippert, flapt af en toe met
 * een oor, en zolang hij praat gaat zijn mond open en dicht. Dat zit in de SVG's zelf
 * (een ingebedde <style>), en staat stil voor wie minder beweging wil.
 */
// Alle stemmingen één keer vooraf ophalen: anders was de cirkel bij de eerste keer
// "juicht" heel even leeg terwijl het plaatje binnenkwam (37e review). De
// praatvarianten pas als de browser niets te doen heeft: op de startpagina praat Pip
// niet vanzelf, en daar telt elke byte bij het eerste bezoek (69e review, codebase K4).
let vooraf = false
function haalPipsOp() {
  if (vooraf || typeof window === 'undefined') return
  vooraf = true
  const stemmingen = ['blij', 'juicht', 'verrast', 'denkt', 'moedigt', 'trots', 'slaapt'] as PipStemming[]
  for (const s of stemmingen) new Image().src = pipBeeld(s, true)
  const praat = () => stemmingen.forEach((s) => (new Image().src = pipPraat(s)))
  if ('requestIdleCallback' in window) window.requestIdleCallback(praat, { timeout: 3000 })
  else setTimeout(praat, 1500)
}

export function Pip({
  zegt,
  stemming = 'blij',
  klein = false,
  groot = false,
  vanzelf = true,
  onKlaar,
}: {
  zegt?: string
  stemming?: PipStemming
  klein?: boolean
  /** Bij de kennismaking: Pip groot in beeld, niet een rondje naast de ballon (39e review). */
  groot?: boolean
  /**
   * Zegt Pip zijn zin zodra hij in beeld komt? Op de welkomstpagina niet: daar komt
   * een ouder voor het eerst binnen, en een paardje dat ineens begint te praten (of,
   * omdat de browser geluid tegenhoudt, bij de eerste tik op wat dan ook) laat
   * schrikken. Daar staat de zin in de ballon en spreekt Pip pas als je op hem of op
   * de luidspreker tikt.
   */
  vanzelf?: boolean
  onKlaar?: () => void
}) {
  const [ondertitel, setOndertitel] = useState<string | null>(null)
  /**
   * Praat Pip nu hoorbaar? Dat weet de stem zelf (audio/voice.ts): pas als het geluid
   * echt klinkt, niet al tijdens het laden, en bij elke route, ook "nog eens horen".
   * Op de server en bij het eerste tekenen: nee.
   */
  const pratend = useSyncExternalStore(luisterOfPipKlinkt, pipKlinkt, () => false)
  /**
   * Een teller die bij elke nieuwe zin of stemming omhoog gaat, als sleutel op het
   * gezicht. Zonder dat blijft een CSS-animatie staan waar hij stond: twee goede
   * antwoorden achter elkaar zijn allebei 'juicht', en dan springt Pip alleen de
   * eerste keer. Alleen het gezicht krijgt een nieuwe sleutel, niet de knop eromheen —
   * anders raakt de toetsenbordfocus kwijt midden in een les.
   */
  const [puls, setPuls] = useState(0)

  useEffect(haalPipsOp, [])
  useEffect(() => {
    onSubtitle(setOndertitel)
    return () => onSubtitle(null)
  }, [])

  useEffect(() => {
    setPuls((p) => p + 1)
  }, [zegt, stemming])

  useEffect(() => {
    if (!zegt || !vanzelf) return
    void speak(zegt)
    return () => stopSpeaking()
  }, [zegt, vanzelf])

  const tekst = ondertitel ?? zegt ?? null

  return (
    <div className={`${styles.wrap} ${klein ? styles.klein : ''} ${groot ? styles.groot : ''}`}>
      <button
        type="button"
        className={styles.pip}
        // Vast haakje voor schermen die het gezicht willen verbergen en de ballon houden
        // (wereld af dwars: daar juicht Pip al groot naast het wapen).
        data-pip-gezicht=""
        onClick={() => {
          if (zegt) void speak(zegt, true)
          onKlaar?.()
        }}
        aria-label={zegt ? `Pip zegt: ${zegt}. Tik om het nog eens te horen.` : 'Pip'}
      >
        {/* De getekende Pip (public/illustraties/pip/) in plaats van één emoji met een
            speldje ernaast: de stemming zit nu in zijn gezicht. De beweging blijft. */}
        <span className={`${styles.wiebel} ${pratend ? styles.pratend : ''}`} aria-hidden="true">
        <span key={puls} className={`${styles.gezicht} ${BEWEGING[stemming]}`} aria-hidden="true">
          {/* Twee tekeningen op elkaar: de gewone en die met de bewegende mond
              (scripts/pip-tekenen.py). Zolang Pip praat staat de praatvariant zichtbaar.
              Allebei steeds geladen en getekend, in plaats van de src te wisselen: dan
              kan er bij het begin of eind van een zin nooit een leeg rondje flitsen,
              ook niet als de browser het plaatje uit zijn geheugen had gegooid. Het
              knipperen en de oren zitten in beide. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- statische export, SVG */}
          <img src={pipBeeld(stemming, true)} alt="" className={`${styles.tekening} ${pratend ? styles.weg : ''}`} draggable={false} />
          {/* eslint-disable-next-line @next/next/no-img-element -- statische export, SVG */}
          <img src={pipPraat(stemming)} alt="" data-pip-praat="" className={`${styles.tekening} ${pratend ? '' : styles.weg}`} draggable={false} />
        </span>
        </span>
      </button>
      {tekst && (
        <p className={styles.ballon} aria-live="polite">
          {tekst}
          {zegt && (
            // Een kind van vier leest deze ballon niet. Het hoort hem, en als het even
            // niet oplette moet het hem opnieuw kunnen horen zonder te weten dat Pip
            // zelf ook aanklikbaar is. Vandaar een luidspreker die eruitziet als een
            // knop: één beeld, geen woord.
            <button
              type="button"
              className={styles.luister}
              onClick={() => void speak(zegt, true)}
              aria-label="Zeg het nog eens"
              title="Zeg het nog eens"
            >
              {/* Silhouet in de kleur van --accent-ink: wit op het donkere oranje van licht, donker
                  op het lichte oranje van donker (wit haalde daar maar 2,5:1, 38e review). */}
              <img src={icoonBeeld('geluid')} alt="" width={30} height={30} className={styles.luisterIcoon} />
            </button>
          )}
        </p>
      )}
    </div>
  )
}
