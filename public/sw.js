/*
 * Service worker van Schaakmaatje.
 *
 * Doel: na het eerste bezoek werkt de app zonder internet. Dat is geen extraatje maar
 * een belofte uit het plan — kinderen spelen in de auto, op school met matige wifi, en
 * op een tablet die maar af en toe verbinding heeft.
 *
 * Aanpak: alles wat de app ophaalt en goed terugkomt, gaat in de cache. Daarna wordt
 * eerst de cache geprobeerd voor bestanden die toch nooit veranderen (die hebben een
 * hash in hun naam), en voor pagina's het netwerk met de cache als vangnet.
 */
// De versie hóórt bij elke uitrol te veranderen: zolang hij gelijk blijft, ruimt het
// activate-blok hieronder nooit iets op en blijven oude _next/static-brokken staan.
// Vervang de datum bij een release (of laat het bouwscript het doen).
const CACHE = 'schaakmaatje-2026-09-05'

// Wat er sowieso in moet, ook als het kind alleen de voorpagina heeft gezien.
const KERN = ['./', './manifest.webmanifest', './icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(KERN))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  // Oude versies opruimen, anders blijft een kind op een verouderde app hangen.
  event.waitUntil(
    caches
      .keys()
      .then((namen) => Promise.all(namen.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const verzoek = event.request
  if (verzoek.method !== 'GET') return
  const url = new URL(verzoek.url)
  if (url.origin !== self.location.origin) return

  // Bestanden met een hash in hun naam veranderen nooit: cache eerst, dat is direct.
  // Het audiomanifest hoort daar NIET bij: dat heet altijd manifest.json en wijst naar
  // de opnames. Cache-first zou betekenen dat een kind na een nieuwe opname op het oude
  // manifest blijft hangen, en dat Pip stilletjes terugvalt op de stem van het apparaat.
  // includes in plaats van startsWith: met een NEXT_PUBLIC_BASE_PATH staat de app in
  // een submap en begint het pad daarmee, niet met /audio/.
  const isAudioManifest = url.pathname.endsWith('/audio/manifest.json')
  const isBlijvend =
    !isAudioManifest &&
    (url.pathname.includes('/_next/static/') || url.pathname.includes('/audio/'))

  if (isBlijvend) {
    event.respondWith(
      caches.match(verzoek).then(
        (gevonden) =>
          gevonden ||
          fetch(verzoek).then((antwoord) => {
            bewaar(verzoek, antwoord.clone())
            return antwoord
          }),
      ),
    )
    return
  }

  // Pagina's: netwerk eerst zodat een nieuwe versie meteen zichtbaar is, met de cache
  // als vangnet zodra er geen verbinding is.
  event.respondWith(
    fetch(verzoek)
      .then((antwoord) => {
        bewaar(verzoek, antwoord.clone())
        return antwoord
      })
      .catch(async () => {
        const gevonden = await caches.match(verzoek)
        if (gevonden) return gevonden
        // Onbekende pagina zonder verbinding: geef de stal, daar kan het kind verder.
        if (verzoek.mode === 'navigate') {
          const start = await caches.match('./')
          if (start) return start
        }
        return new Response('Geen verbinding', { status: 503, statusText: 'offline' })
      }),
  )
})

function bewaar(verzoek, antwoord) {
  if (!antwoord || antwoord.status !== 200 || antwoord.type === 'opaque') return
  caches.open(CACHE).then((cache) => cache.put(verzoek, antwoord))
}
