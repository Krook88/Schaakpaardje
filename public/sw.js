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
// Deze naam wordt bij het bouwen vervangen door de datum en het tijdstip van de
// uitrol; zie stempelDeCacheversie() in scripts/hosting-klaar.ts. Wat hier staat is
// dus alleen wat je in `npm run dev` ziet.
//
// Waarom het automatisch moet: zolang de naam gelijk blijft ruimt het activate-blok
// hieronder nooit iets op, en blijven de _next/static-brokken van elke vorige uitrol
// op de tablet staan. Met de hand bijwerken ging precies één keer goed — er stond op
// schaakmaatje.nl een versie van drie zips geleden.
const CACHE = 'schaakmaatje-dev'

// Wat er sowieso in moet, ook als het kind alleen de voorpagina heeft gezien.
const KERN = ['./', './manifest.webmanifest', './icon.svg', './icon-192.png', './apple-touch-icon.png', './offline/']

// Wereld 0 tot en met 2 (pagina's, hun RSC-bestanden en precies de JS/CSS die ze
// gebruiken), de kaart en hun minispellen. Bij het bouwen ingevuld door
// vooraadOffline() in scripts/hosting-klaar.ts; in `npm run dev` leeg.
// Waarom: "na het eerste bezoek werkt de app zonder internet" gold alleen voor wat het
// kind al gezien had. Wie de app thuis opende en in de auto les twee wilde doen, kreeg
// "Geen verbinding" (nulmeting volgende niveau).
const VOORAF = []

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(async (cache) => {
        // cache: 'reload': vers van de server, niet uit de HTTP-cache van de browser.
        // Anders kon een nieuwe uitrol de HTML van de vorige bewaren, met brokjes die
        // niet meer bestaan (33e review).
        await cache.addAll(KERN.map((pad) => new Request(pad, { cache: 'reload' })))
        // Eén voor één en zonder te falen: één ontbrekend bestand mag de installatie
        // (en dus de kern) niet tegenhouden.
        await Promise.all(VOORAF.map((pad) => voorraad(cache, pad).catch(() => {})))
      })
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
  // De teller en zijn dashboard: altijd van de server, nooit in de cache.
  if (url.pathname.includes('/teller/')) return
  // Live spelen gaat met POST en komt hier al niet langs; voor de zekerheid toch.
  if (url.pathname.includes('/live/index.php')) return

  // Bestanden met een hash in hun naam veranderen nooit: cache eerst, dat is direct.
  // Het audiomanifest hoort daar NIET bij: dat heet altijd manifest.json en wijst naar
  // de opnames. Cache-first zou betekenen dat een kind na een nieuwe opname op het oude
  // manifest blijft hangen, en dat Pip stilletjes terugvalt op de stem van het apparaat.
  // includes in plaats van startsWith: met een NEXT_PUBLIC_BASE_PATH staat de app in
  // een submap en begint het pad daarmee, niet met /audio/.
  const isAudioManifest =
    url.pathname.endsWith('/audio/manifest.json') || url.pathname.endsWith('/sfx/manifest.json')
  const isBlijvend =
    !isAudioManifest &&
    (url.pathname.includes('/_next/static/') ||
      url.pathname.includes('/audio/') ||
      url.pathname.includes('/sfx/') ||
      // Geen hash in de naam, maar de cache heet per uitrol anders: na een nieuwe uitrol
      // komen ze toch vers binnen.
      url.pathname.includes('/illustraties/'))

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
        // ignoreSearch: Next haalt de RSC-bestanden op met ?_rsc=..., en vooraf staan ze
        // er zonder. ignoreVary: dat verzoek heeft ook eigen headers. Alleen voor die
        // verzoeken, niet voor het openen van een pagina.
        const gevonden =
          (await caches.match(verzoek)) ||
          (verzoek.mode !== 'navigate'
            ? await caches.match(verzoek, { ignoreSearch: true, ignoreVary: true })
            : undefined)
        if (gevonden) return gevonden
        // Een pagina die niet in de voorraad zit (een les na wereld 2): naar de
        // offlinepagina met Pip en één knop naar de kaart. Eerst kreeg het kind hier de
        // startpagina voor ouders, onder de URL van de les (33e review). Een doorverwijzing,
        // zodat de adresbalk klopt en "Naar de kaart" goed uitkomt.
        if (verzoek.mode === 'navigate') {
          return Response.redirect(new URL('./offline/', self.registration.scope).href, 302)
        }
        return new Response('Geen verbinding', { status: 503, statusText: 'offline' })
      }),
  )
})

/**
 * Eén bestand in de nieuwe cache. Gehashte bestanden (_next/static, fonts) veranderen
 * nooit: staan ze nog in een vorige cache, dan nemen we ze daarvandaan mee in plaats van
 * bij elke uitrol 1,3 MB opnieuw te downloaden op schoolwifi.
 */
async function voorraad(cache, pad) {
  if (pad.includes('/_next/static/') || pad.includes('/fonts/')) {
    const oud = await caches.match(pad)
    if (oud) return cache.put(pad, oud)
  }
  return cache.add(new Request(pad, { cache: 'reload' }))
}

function bewaar(verzoek, antwoord) {
  if (!antwoord || antwoord.status !== 200 || antwoord.type === 'opaque') return
  caches.open(CACHE).then((cache) => cache.put(verzoek, antwoord))
}
