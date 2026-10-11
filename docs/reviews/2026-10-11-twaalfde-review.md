# Twaalfde review, 11 oktober 2026

Scope: `ed2e5be`, het deelbeeld (og.png en og-vierkant.png met Pip en een lesscherm),
`max-image-preview:large` en plaatjes in de gestructureerde gegevens. Doel: Google toont
een foto bij de site. Reviewer: codebase-reviewer (geen schaakinhoud, geen schermen van
de app gewijzigd). `npm run check` groen.

## Oordeel

**GO.** Niets blokkerends of belangrijks. Geen pagina wordt per ongeluk indexeerbaar:
pagina's met een eigen `robots` houden `noindex`. De beloftes op het beeld staan al in
de site-omschrijving, en het lesscherm is een echte schermafbeelding.

## Klein

| | Bevinding | Status |
|---|---|---|
| K1 | Het script hing aan een vast Chromium-pad en aan de map waaruit je hem start. | **Opgelost**: `CHROMIUM_PAD` als die gezet is, anders die van Playwright; paden vanaf het script zelf; kopcommentaar noemt de afhankelijkheid van lettertypen. |
| K2 | Een indexeerbare pagina met een eigen `robots` verliest `max-image-preview` zonder dat iemand het ziet. | **Opgelost** in het commentaar: zo'n pagina moet de twee regels herhalen. Een gedeelde constante pas als zo'n pagina er komt. |
| K3 | Lesscherm in het vierkante beeld opgeschaald (400 naar 440 px). | **Opgelost**: 420 px. |
| K4 | `max-snippet:-1` niet in het commitbericht. | Ter kennisname: Googles standaard, nu genoemd in dit rapport. |
