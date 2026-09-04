---
name: release-review
description: Draait de volledige release-review van Schaakmaatje. Roept de releasecoördinator aan, die de schaakmeester, de layout-reviewer en de codebase-reviewer laat kijken en er één oordeel van maakt. Gebruik dit vóór elke release, of wanneer de gebruiker om "de review" of "een release-check" vraagt.
---

# Release-review

Elke release van Schaakmaatje gaat langs drie reviewers. Jij regelt dat niet zelf: je
start de **releasecoördinator**, en die doet de rest.

## Wat je doet

1. Zorg dat de werkmap schoon is en de controles lokaal draaien:
   ```bash
   npm run typecheck && npm test && npm run validate:content && npm run build
   ```
   Faalt hier iets, meld dat en stop — dan hoeft er niemand te reviewen.

2. Start de coördinator met de Agent-tool:
   ```
   subagent_type: release-coordinator
   ```
   Geef mee: welke commits of bestanden er veranderd zijn sinds de vorige review in
   `docs/reviews/`, en waar de release voor bedoeld is (bijvoorbeeld "fase 1, werelden
   0 t/m 6").

3. Wacht zijn rapport af en geef het door aan de gebruiker: **het oordeel**, de
   blokkerende punten, en wat er nu besloten moet worden. Ga niet zelf alvast dingen
   oplossen — eerst weten wat er ligt.

4. Pas daarna, en alleen als de gebruiker dat wil, los je de bevindingen op. Werk van
   blokkerend naar klein, en houd het rapport in `docs/reviews/` bij welke punten je
   hebt afgehandeld.

## Regels
- Een release zonder review gaat niet live. Ook een kleine niet.
- Blokkerende bevindingen van de schaakmeester wegen het zwaarst: iets dat een kind
  verkeerd aanleert, moet het later afleren.
- Het rapport hoort in de repo (`docs/reviews/`), zodat de volgende review weet wat de
  vorige vond.
