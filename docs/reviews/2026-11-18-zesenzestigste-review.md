# Sixty-sixth review: 'Les begonnen' with apparaat and binnen (2026-11-18)

Scope: f77e5dc. Two extra anonymous properties on 'Les begonnen': `apparaat: nieuw|bekend` and `binnen: ja|nee`. Kaj approved them; the conversion reviewer proposed them in the sixty-fourth review. The dashboard uses them in the funnel, in "Waar verbeteren?" and next to "Geopend". Reviewers: codebase and conversion. The chess master and layout were left out: no lesson or child-facing screen changed. The parents' screen only got one sentence, which the conversion reviewer checked.

**Verdict after processing: GO.** `npm run check` is green. The doorloop passes 81/81 when run on its own.

## Blocking
- **Doorloop: the live-play rule failed** (codebase 1). *No defect in this change:* three runs failed and all three ran at the same time as another doorloop. Each starts its own PHP server for live play, so they got in each other's way. Run on its own, the rule passes four out of four times, and the whole doorloop passes 81/81, and with this round 82/82. The failure cause also differed per run, which fits.

## Important
- **Funnel and rule 5 compared a few measured days with a whole period** (conversion 1). *Fixed:* they use `apparaat` only once the previous period already contained it. That means the whole current period falls after publication. This is read from the data rather than from a date (codebase 8): publishing is done by hand and can come later.
- **Rule 1 compared starts with stops, and "direct binnen" flipped the advice** (conversion 2). *Fixed:* the condition is gone. It is now only a mention, with the measured starts as the denominator. It only counts "direct binnen op een nieuw apparaat", because on a known device "direct binnen" is almost always a reloaded tab.
- **The funnel mixed new and all devices** (conversion 3). *Fixed:* once measured, "Eerste les geopend" also counts only new devices.
- **`binnen` meant "same path as at load", not "first screen"** (codebase 2). *Fixed:* `telScherm()` notes when the visit leaves the landing screen, and after that the lesson is no longer "binnen". A reloaded page (`performance` navigation type `reload`) also doesn't count.
- **No test for `binnen: nee`** (codebase 3). *Fixed:* unit tests for leaving the screen and for a reload, plus a doorloop step that goes to the lesson via the app and expects `binnen: nee`.

## Small
- The parents' screen didn't mention `binnen` (conversion 4). *Fixed:* "of er op dit apparaat al eens geoefend is, en of de les het eerste scherm was".
- The tooltip isn't visible on a phone (conversion 5). *Fixed:* "3 direct" is now shown in small text under the number, and the legend explains it.
- Starts counted as visits (conversion 6). *Fixed:* the label says "Keer een les geopend", and the explanation says one visit can open several lessons.
- Mixed denominator in the extra sentence (conversion 7). *Fixed:* `gemeten`.
- `binnenPad` depends on the module being read in early (codebase 4). *Left as is:* moving it into `telScherm()` would make it depend on the order of effects. The lesson can count before the layout counts its pageview, and then the first lesson would wrongly get `nee`. Today `tellen.ts` is loaded statically from the layout. That reasoning now sits in the comment.
- The calculation of the highest number of practice days was in two places (codebase 5). *Fixed:* `hoogsteOefendagen()` in `tellen.ts`, used by both.
- The counter accepted any value (codebase 6). *Fixed:* `VASTE_WAARDEN` in `opslag.php` for the properties from November 2026, with a test.
- The transition rule had no end date (codebase 7). *Fixed:* the comment says it can go one month after publication.

## Fine according to the reviewers
- Privacy: two separate yes/no values, no ID, nothing a child types, and both fixed lists updated.
- The order of the sorted keys in the transition rule.
- Trailing slash, the service worker, offline, and prerendering.
- All three entry routes measure correctly in the browser.
