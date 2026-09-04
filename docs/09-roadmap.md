# 9. Roadmap, planning en werkwijze

Uitgangspunt: één ontwikkelaar (of jij + Claude) part-time, plus later een illustrator,
een stem en een schaakdidactisch meelezer. Doorlooptijden zijn "kalenderweken bij
~2 dagen per week"; met een fulltime team halveert dit ruwweg.

## Fase 0 — Fundament & verticale plak (week 1–3)
**Doel: één les werkt end-to-end, precies zoals in de eindversie.**
- Monorepo, Next.js PWA, Tailwind, CI, Vercel-preview per PR.
- `packages/engine`: chess.js-wrapper + legale-zet-API + eerste unit tests.
- `packages/board`: bordcomponent met kindthema, tik-tik én slepen, glow/hints.
- `packages/audio`: Howler + sprite-manifest + `scripts/tts-render.ts`.
- `packages/lesson-runner`: de 4-fasen-lus, sterren, hints.
- **Levering: Wereld 1, les 1 ("de toren loopt recht") volledig speelbaar met stem.**
- ✅ *Definition of done:* een 5-jarige doet deze les zonder hulp van een volwassene.

## Fase 1 — MVP: alle stukken (week 4–10)
- Werelden 0 t/m 6 (bord, toren, loper, dame, paard, koning, pion) = ~30 lessen.
- 6 minispellen, waaronder Pionnenspel en Hongerig paardje.
- Botniveaus 1–3 (eigen JS-bots), samen-spelen-modus.
- Profielen + lokale voortgang (Dexie), Pip-animaties (Rive), stickerkast.
- Ouderpoort + ouderscherm "wat kan je kind nu?".
- **Levering: bruikbare app voor 3–7 jaar; eerste test met 5–8 echte kinderen.**

## Fase 2 — Compleet schaken (week 11–18) — *content af*
- Werelden 7 t/m 12 (waarde, aanval/verdediging, schaak, mat, rokade, notatie).
- Stockfish-worker + botniveaus 4–8, blunderwaarschuwing, nabespreking.
- Puzzelmotor + thema-beheersing + spaced repetition + dagelijkse puzzel.
- Hoefijzer-diploma's brons/zilver, printbaar certificaat.
- Volledige offline-modus, toegankelijkheidsaudit.
- **Levering: publieke bèta (web), inschrijving via een landingspagina.**

## Fase 3 — Uitbreiding & stores (week 19–26)
- Werelden 13–14 (tactiek, eindspel) = Stap 2-instap.
- Capacitor-builds voor iOS/Android, storeteksten, kids-category-compliance.
- Optionele ouderaccount + cloudsync (Supabase EU), meerdere apparaten.
- Verdienmodel inbouwen (eenmalige aankoop / gezinslicentie).
- **Levering: 1.0 in de App Store en Play Store.**

## Fase 4 — School & schaal (week 27+)
- Klasmodus: leerkrachtdashboard, groepen, voortgang per leerling, lesplannen van 45 min.
- Toernooitjes binnen de klas/het gezin (asynchroon, veilig).
- Engelse en Duitse vertaling (de contentstructuur is er al op voorbereid).
- Gesprek met KNSB/regionale bond over erkenning van de diploma's.

## Werkwijze
- **Content-first per wereld:** eerst leerdoelen + opgaven op papier, dan audio, dan code.
- **Elke wereld eindigt met een kindertest** (2 kinderen, 20 minuten, hardop denken).
  Dat is de belangrijkste kwaliteitscheck in het hele project — belangrijker dan tests.
- **PR-cyclus met previewlink** zodat je elke wijziging op de tablet kan proberen.
- **Content-validatie in CI**: geen enkele opgave kan met een illegale FEN of ontbrekende
  audiosleutel in main terechtkomen.

## Ruwe kosten (indicatie, buiten eigen uren)
| Post | Bedrag |
|---|---|
| Illustraties + Pip-animaties (Rive) | €3.000 – €8.000 |
| Stem (TTS-licentie of stemacteur) | €150 – €3.000 |
| Muziek & sfx (licentievrij pakket) | €200 – €600 |
| Hosting/CI eerste jaar (Vercel + Supabase) | €0 – €600 |
| Developer-accounts Apple + Google | ~€120 |
| Juridisch (privacyverklaring, GPL-check) | €500 – €1.500 |
