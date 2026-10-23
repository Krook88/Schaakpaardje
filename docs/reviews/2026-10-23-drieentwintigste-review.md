# Drieëntwintigste review, 23 oktober 2026

Scope: `3d6c32a` en de herstelcommit erna op `claude/wizardly-cray-9vevs8`. Zoekmachines tellen
niet meer mee in de teller.

Aanleiding: het dashboard toonde 58 begonnen lessen, bijna elke les precies één keer, ook in
werelden die voor een kind op slot zitten. Daarbij 25 bezoeken om 01:00 UTC en 0 profielen.
Dat was Googlebot: die voert JavaScript uit en opende na de nieuwe sitemap elke les.

Reviewers: codebase-reviewer en conversie-reviewer. Schaakmeester en layout zijn overgeslagen:
geen schaakinhoud, geen schermen voor kinderen.

## Oordeel

**GO.** Niets blokkerends.
- **Privacy:** in orde. De User-Agent wordt alleen gelezen om te weigeren, nooit bewaard, en de app stuurt hem niet mee.
- **Werking:** de code draait op PHP 7.4. Echte gebruikers worden niet uitgesloten: `navigator.webdriver` staat alleen aan bij automatisering, en telefoons met "bot" in de merknaam (Cubot) tellen wel.
- **Vindbaarheid:** niet geraakt. Googlebot kan de pagina's gewoon blijven lezen.

## Bevindingen

| | Bevinding | Status |
|---|---|---|
| K1 (belangrijk) | De bottellingen van vóór de filter bleven 30 tot 90 dagen in de cijfers en drukten "Af %". | **Opgelost**: `SCHOON_VANAF` in dashboard.php. Eerdere dagen telt het dashboard niet mee, de dagbestanden blijven bestaan. Er is een test (die faalt zonder de grens). |
| K2 (belangrijk) | De trechter stond niet op het dashboard. | **Opgelost**, alleen op het dashboard en zonder nieuwe telling: de sectie "Van binnenkomst naar profiel" (nieuw apparaat → eerste les begonnen → af → profiel) en "Waar komt een nieuw apparaat binnen?" (uit het pad van `Bezoek`). |
| K3 (belangrijk) | "Les begonnen" betekent alleen dat de pagina openging, niet dat er gespeeld werd. | **Open, ligt bij Kaj**: zou een nieuwe telling `Eerste opgave` vragen. |
| K4 | "0 profielen" zegt weinig zonder context. | **Open, ligt bij Kaj**: zou een eigenschap `na` (klasse) bij `Profiel gemaakt` vragen. |
| K5 / C1 | Er ontbraken kruipers: GoogleOther, Storebot, Read-Aloud, GPTBot, ClaudeBot, Amazonbot, PerplexityBot, OAI-SearchBot. | **Opgelost**: toegevoegd aan beide lijsten. |
| C2 | "yandex" paste ook op de Yandex-zoekapp. | **Opgelost**: `yandexbot\|yandexrender`. |
| C3 | Een handmatige test met curl gaf stil 204, wat op een kapotte teller leek. | **Opgelost**: antwoordkop `X-Teller: genegeerd` en een regel commentaar; getest. |
| K6 | De datum in de dashboardtekst kon uiteenlopen met de echte grens. | **Opgelost**: de tekst gebruikt `SCHOON_VANAF`. |

Het contactformulier en live spelen filteren bewust niet op bots. Een ouder met een vreemde
User-Agent zou anders zonder melding zijn bericht kwijtraken.
