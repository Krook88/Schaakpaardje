'use client'

import { useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { Pip } from '@/ui/Pip'
import { GeluidKnop } from '@/ui/GeluidKnop'
import { alGetikt, kies } from '@/audio/voice'
import { EERSTE_KEER, WELKOM, pipZinnen } from '@/content/voice'
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
  useOefendagen,
  useVoortgang,
  volgendeOpenLes,
  wereldIsAf,
  type LesResultaat,
} from '@/progress/store'

/**
 * De app zelf. Krijgt de landingspagina als `welkom` binnen.
 *
 * Waarom dat een prop is en geen import: `Welkom` is een server-component en dit
 * bestand is er een van de browser. Door hem hierlangs door te geven staat zijn HTML
 * in de geëxporteerde index.html (waar Google hem ziet), terwijl React hem na hydratie
 * weghaalt zodra er een profiel blijkt te zijn. Een kind dat de app al gebruikt krijgt
 * hem dus nooit te zien.
 */
/**
 * Het formulier staat onderaan de landingspagina, zo'n 1450 pixels diep. Na de tik op
 * "Beginnen" wisselt de inhoud, maar de browser houdt de scrollpositie vast. Op een
 * telefoon begon het allereerste scherm van een nieuw kind dus halverwege de
 * rondleiding, met Pips "Hoi Noor!" erboven buiten beeld. Op het testformaat van
 * 430×930 scheelde het maar 65 pixels, daarom viel het niet op.
 */
function naarBoven() {
  window.scrollTo(0, 0)
}

export function Thuis({ welkom }: { welkom: ReactNode }) {
  const geladen = useToestandGeladen()
  const profielen = useProfielStore((s) => s.profielen)
  const profiel = useProfiel()
  const kiesProfiel = useProfielStore((s) => s.kiesProfiel)
  const maakProfiel = useProfielStore((s) => s.maakProfiel)
  const voortgang = useVoortgang()
  const stickers = useStickers()
  const verslagen = useVerslagen()
  const oefendagen = useOefendagen()
  // Praat Pip hier vanzelf? Alleen als er al getikt was toen dit scherm verscheen,
  // dus als je terugkomt van een les. Wie de site net opent, schrikt anders bij de
  // eerste tik van een pratend paardje. Eén keer vastgelegd: anders gaat hij alsnog
  // praten zodra er later iets op dit scherm verandert.
  const [vanzelf] = useState(alGetikt)

  // Vóór de opgeslagen profielen binnen zijn.
  //
  // Dit is precies wat er in de geëxporteerde index.html staat, en dus wat een
  // zoekmachine en een gedeelde link te zien krijgen. Hier stond eerst een leeg vlak,
  // daarna drie regels tekst; nu de hele landingspagina met schermafbeeldingen.
  if (!geladen) {
    return (
      <main className="page">
        <div style={{ maxWidth: 760, margin: '0 auto' }}>{welkom}</div>
      </main>
    )
  }

  if (!profiel) {
    return (
      <main className="page">
        <div className="stack" style={{ maxWidth: 760, margin: '0 auto', gap: 26 }}>
          {welkom}
          <NieuwProfiel
            bestaand={profielen.map((p) => ({ id: p.id, naam: p.naam, avatar: p.avatar }))}
            onKies={(id) => {
              kiesProfiel(id)
              naarBoven()
            }}
            onMaak={(naam, leeftijd, avatar) => {
              const id = maakProfiel(naam, leeftijd, avatar)
              naarBoven()
              return id
            }}
          />
        </div>
      </main>
    )
  }

  const verder = volgendeOpenLes(voortgang, profiel.modus)
  const verderLes = lesMet(verder.id)
  const totaal = sterrenTotaal(voortgang)
  const maxSterren = WERELDEN.flatMap((w) => w.lessen).length * 3
  const wereldenAf = WERELDEN.filter((w) => wereldIsAf(w.id, voortgang))
  // Alleen tonen als er echt iets ligt te verstoffen. Een knop die "niets te doen"
  // oplevert leert een kind de knop te negeren.
  const opfrissen = kiesOpfrisopgaven(voortgang).length
  // Nog geen enkele les gedaan: dan is dit het allereerste scherm dat dit kind ziet.
  const eersteKeer = Object.keys(voortgang).length === 0
  // Elke les met minstens twee sterren: dan is er geen "volgende les" meer, en
  // `volgendeOpenLes` valt terug op de allereerste.
  const allesAf = WERELDEN.flatMap((w) => w.lessen).every((l) => (voortgang[l.id]?.sterren ?? 0) >= 2)
  const stalVakken = verzameling(voortgang, verslagen)
  const inStal = aantalBezit(stalVakken)

  return (
    <main className="page">
      <div className="stack">
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
          <div className="row" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
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
                {/* Alleen omhoog, nooit terug naar nul: zie `oefendagen` in de store. */}
                {oefendagen > 0 && (
                  <>
                    {' · '}
                    <span aria-hidden="true">📅</span> {oefendagen}{' '}
                    {oefendagen === 1 ? 'dag' : 'dagen'} geoefend
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="row" style={{ gap: 6, flexWrap: 'nowrap', flexShrink: 0 }}>
            <GeluidKnop />
            <Link href="/ouders/" className="btn btn--ghost" aria-label="Voor ouders">
              ⚙️
            </Link>
          </div>
        </div>

        <Pip
          // Geen naam en geen lestitel in de gesproken zin: die verschilt per kind en
          // per moment, en kan dus nooit ingesproken worden. Zo'n zin valt terug op de
          // stem van de tablet, precies tussen alle zinnen die Pip zelf zegt in — dat
          // hoor je meteen. De naam staat toch al groot in de kop hierboven, en welke
          // les het is staat op de knop eronder.
          zegt={
            eersteKeer
              ? EERSTE_KEER
              : kies(pipZinnen(profiel.modus === 'schaker').WELKOM_TERUG, 'welkom')
          }
          stemming="blij"
          // Wie de site net opent, hoort Pip pas als hij op hem tikt. Wie terugkomt van
          // een les, heeft al getikt en hoort hem wel vanzelf. Zie `vanzelf` hierboven.
          vanzelf={vanzelf}
        />

        {/* De rondleiding, alleen zolang er nog niets gedaan is.
            Wie hier voor het eerst komt kreeg vier knoppen en een lege stal, zonder
            dat ergens stond wat dit is of wat je moet doen. Voor de ouder ernaast is
            dat net zo goed onduidelijk als voor het kind. Zodra de eerste les gedaan
            is verdwijnt hij vanzelf: uitleg die blijft staan als je het al weet is
            geen uitleg meer maar meubilair. */}
        {eersteKeer && <Rondleiding />}

        {/* Voortgang zonder letters: elke wereld één plaatje, in kleur als hij uit is.
            Het loopt van links naar rechts vol, en dat is de hele boodschap.

            Alleen: hier stonden vijftien werelden waarvan er bij een nieuw kind
            vijftien grijs waren, met daaronder een stal van zestien grijze silhouetten
            en tweemaal een nul. Het allereerste scherm van de app was daarmee een
            inventaris van alles wat je níet hebt. Nu tonen we wat af is, waar je nú
            bent, en een glimp van wat er komt — de rest wordt één telletje. Het groeit
            dus mee met het kind in plaats van het te begroeten met een lege kast. */}
        <Wereldrij voortgang={voortgang} hier={verderLes?.wereldId} />

        <div style={{ display: 'grid', gap: 14 }}>
          {/* De grootste knop van de app. Voor een niet-lezer moet hij op één beeld
              te herkennen zijn: het driehoekje van "start", plus het plaatje van
              precies die les. De tekst is er voor de ouder. */}
          {/* Alles gehaald: dan stuurde deze knop je terug naar les 1, alsof je nog
              moest beginnen. Nu wijst hij naar wat er na de lessen komt: echt spelen. */}
          {allesAf ? (
            <Link
              href="/spelen/"
              className="btn btn--primary btn--big"
              style={{ padding: 18, gap: 14, minHeight: 88 }}
            >
              <span aria-hidden="true" style={{ fontSize: 38, lineHeight: 1 }}>
                🏆
              </span>
              <span style={{ flex: 1, textAlign: 'left' }}>
                Alle lessen gehaald! Speel een partij tegen een maatje
              </span>
            </Link>
          ) : (
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
            {/* "Verder leren" klopt niet als je nog nergens was. */}
            <span style={{ flex: 1, textAlign: 'left' }}>
              {eersteKeer ? 'De eerste les' : 'Verder leren'}: {verder.titel}
            </span>
          </Link>
          )}
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
                Opfrissen: {opfrissen} van vorige week
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
            medailles — je zag dus niet wát je verdiend had, alleen hoevéél. En daarna
            een raster van zestien grijze silhouetten, wat bij nul verdiend precies even
            leeg aanvoelt. Nu staat voorop wat je hébt, en daarachter alleen het
            eerstvolgende dat te halen valt: een worst, geen leegte. */}
        <Link href="/stal/" className="card stack" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.1rem' }}>Mijn stal</h2>
            <span className="muted">
              {inStal > 0 ? `${inStal} van de ${stalVakken.length}` : 'Nog leeg'}
            </span>
          </div>
          <Stalrij vakken={stalVakken} />
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

        {/* Voor de ouder die later terugkomt en wil teruglezen hoe het werkt. Klein en
            grijs onderaan: een kind van vier wordt hier niet naartoe getrokken, een
            ouder vindt het wel. Op /over/ staat de koffielink, maar als regel tekst,
            niet als knop die oplicht. */}
        <footer
          className="muted"
          style={{ textAlign: 'center', fontSize: '0.92rem', paddingBlock: 18, lineHeight: 2.4 }}
        >
          Voor ouders: <Link href="/over/">hoe Schaakmaatje werkt</Link> ·{' '}
          <Link href="/lessen/">alle lessen</Link>
        </footer>
      </div>
    </main>
  )
}

/**
 * De werelden als een pad: wat af is, waar je nu bent, en een glimp van wat komt.
 *
 * Meer dan een glimp heeft geen zin. Vijftien grijze plaatjes zeggen een kind van vier
 * niets over wat het te wachten staat; ze zeggen alleen "dit is allemaal nog niet van
 * jou". De twee die eraan komen zijn genoeg om nieuwsgierig te maken, en het getal
 * erachter is er voor wie al telt.
 */
function Wereldrij({
  voortgang,
  hier,
}: {
  voortgang: Record<string, LesResultaat>
  hier?: string
}) {
  const af = WERELDEN.filter((w) => wereldIsAf(w.id, voortgang))
  const huidig = WERELDEN.find((w) => w.id === hier)
  const getoond = [...af]
  if (huidig && !getoond.includes(huidig)) getoond.push(huidig)
  const rest = WERELDEN.filter((w) => !getoond.includes(w))
  const straks = rest.slice(0, 2)
  const verborgen = rest.length - straks.length

  return (
    <div
      className="row"
      style={{ gap: 8, rowGap: 8 }}
      aria-label={`${af.length} van de ${WERELDEN.length} werelden uit`}
    >
      {getoond.map((w) => (
        <span
          key={w.id}
          title={`${w.nummer}. ${w.naam}`}
          aria-hidden="true"
          style={{
            fontSize: 26,
            // Waar je nú bent krijgt een rondje om zich heen: dat is het enige plekje
            // op dit scherm dat "hier" zegt zonder een woord te gebruiken.
            ...(w.id === hier
              ? {
                  outline: '3px solid var(--accent)',
                  outlineOffset: 3,
                  borderRadius: '50%',
                }
              : null),
          }}
        >
          {w.emoji}
        </span>
      ))}
      {straks.map((w) => (
        <span
          key={w.id}
          title={`${w.nummer}. ${w.naam}`}
          aria-hidden="true"
          style={{ fontSize: 26, filter: 'grayscale(1)', opacity: 0.38 }}
        >
          {w.emoji}
        </span>
      ))}
      {verborgen > 0 && (
        <span className="muted" aria-hidden="true" style={{ fontSize: '0.85rem' }}>
          +{verborgen}
        </span>
      )}
    </div>
  )
}

/** Wat je verzameld hebt, en daarachter het eerstvolgende dat te halen valt. */
function Stalrij({ vakken }: { vakken: { id: string; teken: string; naam: string; hoe: string; bezit: boolean }[] }) {
  const heeft = vakken.filter((v) => v.bezit)
  const mist = vakken.filter((v) => !v.bezit)
  const volgend = mist.slice(0, heeft.length ? 2 : 3)
  const verborgen = mist.length - volgend.length

  return (
    <div className="row" style={{ gap: 8 }} aria-hidden="true">
      {heeft.map((v) => (
        <span key={v.id} title={v.naam} style={{ fontSize: 26 }}>
          {v.teken}
        </span>
      ))}
      {volgend.map((v) => (
        <span
          key={v.id}
          title={`${v.naam}. ${v.hoe}`}
          style={{ fontSize: 26, filter: 'grayscale(1)', opacity: 0.32 }}
        >
          {v.teken}
        </span>
      ))}
      {verborgen > 0 && (
        <span className="muted" style={{ fontSize: '0.85rem' }}>
          +{verborgen}
        </span>
      )}
    </div>
  )
}

/**
 * De rondleiding op het eerste scherm.
 *
 * Drie regels, in de volgorde waarin de knoppen eronder staan, elk met hetzelfde
 * plaatje als de knop waar hij over gaat. Dat plaatje is voor een kind dat niet leest
 * de hele koppeling; de tekst is voor wie ernaast zit.
 *
 * Bewust geen doorklikbare tour met stipjes en "volgende": die moet je wegklikken
 * voordat je iets kunt, en een kind van vier klikt hem weg zonder hem te lezen.
 */
function Rondleiding() {
  const stappen: [string, string][] = [
    ['▶︎', 'Met de grote knop begin je de volgende les. Pip legt alles voor je uit.'],
    ['🗺️', 'Op de kaart zie je alle lessen achter elkaar, en waar jij nu bent.'],
    ['♟️', 'Bij een partijtje speel je een echt spelletje tegen een maatje.'],
  ]
  return (
    <section className="card stack" aria-label="Zo werkt het">
      <h2 style={{ fontSize: '1.1rem' }}>Zo werkt het</h2>
      {stappen.map(([teken, uitleg]) => (
        <div key={uitleg} className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
          <span aria-hidden="true" style={{ fontSize: 26, lineHeight: 1.2, width: 32 }}>
            {teken}
          </span>
          <p style={{ margin: 0, flex: 1 }}>{uitleg}</p>
        </div>
      ))}
    </section>
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
  // Zonder naam werd je stilletjes "Schaker", en dan stond er "Hoi Schaker!" boven een
  // kind dat gewoon vergeten was te typen. Nu vraagt de eerste tik om een naam; wie
  // echt geen naam wil (of nog niet kan typen) tikt nog een keer en heet Schaker.
  const [vraagNaam, setVraagNaam] = useState(false)
  const naamVeld = useRef<HTMLInputElement>(null)
  const [leeftijd, setLeeftijd] = useState(6)
  const [avatar, setAvatar] = useState<string>(AVATARS[0])

  return (
    <div className="stack">
      {/* Geen tweede <h1> hier: de kop staat nu in Welkom, en het introblok dat hier
          stond ook. Dat blok was tekst zonder beeld en het verscheen pas na hydratie,
          dus een zoekmachine zag er niets van. Wat er nu boven staat is dezelfde uitleg
          met echte schermafbeeldingen, en die staat wél in de gebouwde HTML. */}
      {/* Niet vanzelf praten: dit is het eerste wat een nieuwe bezoeker ziet. Eerst
          vertellen dat Pip praat, dan mag je hem zelf aanzetten. Na "Beginnen" praat hij
          wel uit zichzelf, want dan is er gekozen om te starten. */}
      <Pip zegt={WELKOM} stemming="blij" vanzelf={false} />
      <p className="muted" style={{ margin: 0 }}>
        Pip leest alles voor, dus lezen hoeft nog niet. Zet het geluid van je apparaat
        aan en tik op de luidspreker <span aria-hidden="true">🔊</span> om hem te horen. Na
        &ldquo;Beginnen&rdquo; praat hij vanzelf.
      </p>

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
            ref={naamVeld}
            onChange={(e) => setNaam(e.target.value)}
            placeholder="Je naam"
            aria-describedby={vraagNaam ? 'naam-vraag' : undefined}
            maxLength={16}
            style={{
              font: 'inherit', padding: '14px 16px', borderRadius: 12,
              border: '2px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)',
              minHeight: 56,
            }}
          />
          {vraagNaam && !naam.trim() && (
            <small id="naam-vraag" style={{ color: 'var(--accent)' }}>
              Typ hier je naam. Of tik nog een keer op Beginnen, dan noemt Pip je Schaker.
            </small>
          )}
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
            // Alleen het profiel aanmaken, niets zeggen: de stal die hierna verschijnt
            // begroet het kind zelf. Zeiden ze allebei iets, dan praatten er twee
            // zinnen door elkaar heen.
            if (!naam.trim() && !vraagNaam) {
              setVraagNaam(true)
              naamVeld.current?.focus()
              naamVeld.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
              return
            }
            onMaak(naam, leeftijd, avatar)
          }}
        >
          Beginnen →
        </button>
        <p className="muted" style={{ fontSize: '0.85rem' }}>
          Alles blijft op dit apparaat. Er gaat niets naar internet en je hoeft nergens een
          account voor te maken.
        </p>
        {/* Voor de ouder die eerst wil weten waar hij zijn kind op zet — en meteen de
            enige link vanaf de startpagina naar de twee pagina's die zonder de app te
            lezen zijn. Zonder zo'n link staan ze los in de sitemap en verder nergens. */}
        <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
          <Link href="/over/">Over Schaakmaatje</Link> · <Link href="/lessen/">Alle lessen</Link>
        </p>
      </section>
    </div>
  )
}
