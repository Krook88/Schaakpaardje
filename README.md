# 🐴 Schaakmaatje

Nederlandse leer-app waarin kinderen van 3 tot 10 jaar leren schaken, met Pip het
schaakpaardje als sprekende mascotte, een modulepad in spelvorm en oefenpartijen op
verschillende niveaus.

> **Status:** fase 1 draait. Werelden 0 t/m 6 (bord, toren, loper, dame, paard, koning,
> pion) zijn speelbaar, met minispellen, drie tegenstanders, profielen en een ouderscherm.

## Aan de slag

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # typecheck + tests + build
npm run build        # statische export naar out/
```

De app is een **statische export**: geen server nodig. De inhoud van `out/` kan op elke
hosting, van een simpele webhosting tot Vercel.

### Pip laten praten

```bash
ELEVENLABS_API_KEY=... npm run audio:render        # spreekt alle zinnen in
npm run audio:render -- --dry                      # laat zien wat er nog moet
```

Zonder ingesproken audio gebruikt de app de Nederlandse stem van het apparaat zelf, zodat
alles meteen werkt. Voor een release horen de mp3's erin.

## Hoe het in elkaar zit

| Map | Wat er zit |
|---|---|
| `src/engine` | Schaakregels: meetkundige zetten voor de lessen, chess.js voor echte partijen, de bots |
| `src/content` | Alle werelden, lessen en opgaven als data — plus de contentcontrole |
| `src/lesson` | De lesmotor (4 fasen, hints, sterren) en het lesscherm |
| `src/board` | Het bord: tik-tik, glow, stippen, toegankelijk |
| `src/audio` | Pips stem en de bordgeluiden |
| `src/play` | Partijen tegen de bots en de minispellen |
| `src/progress` | Profielen, instellingen en voortgang (lokaal) |
| `scripts` | Audio renderen, content controleren, rooktest |
| `docs` | Het ontwikkelplan |

## Documentatie
- [PLAN.md](PLAN.md) — het volledige ontwikkelplan
- [docs/](docs/) — onderzoek, didactiek, curriculum, techstack, architectuur, UX,
  privacy, roadmap en risico's

## Uitgangspunten
- **Didactiek:** Nederlandse stappen-volgorde — makkelijk stuk eerst, mat bewust laat.
- **Vorm:** elke les *kijken → meedoen → zelf doen → sterrentoets*.
- **Geluid:** alles gesproken, vooraf gerenderd, werkt offline.
- **Privacy:** geen account, geen advertenties, geen chat, alles op het apparaat zelf.
