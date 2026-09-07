/** Contentcontrole als los script, zodat CI hem kan draaien zonder testrunner. */
import {
  alleZinnen,
  controleerContent,
  nietNagerekend,
  stukkenVroegGenoemd,
} from '../src/content/validate'

const bevindingen = controleerContent()
if (bevindingen.length) {
  console.error(`${bevindingen.length} probleem(en) in de content:\n`)
  for (const b of bevindingen) console.error(`  ✗ ${b.waar}: ${b.probleem}`)
  process.exit(1)
}

const handwerk = nietNagerekend()
console.log(`Content is in orde. ${alleZinnen().length} zinnen om in te spreken.`)
console.log(
  `${handwerk.length} opgaven hebben geen 'bedoeling' en worden dus niet nagerekend.` +
    (process.argv.includes('--details') && handwerk.length
      ? `\n  ${handwerk.join('\n  ')}`
      : ''),
)

// Geen fout, wel iets om te weten: hier staat een stuk in een opgave voordat het zijn
// eigen wereld heeft gehad. Bij een zetopgave is dat meestal prima — je kunt niet leren
// slaan zonder iets om te slaan — maar het is de moeite waard om er af en toe naar te
// kijken. Alleen bij aanwijsopgaven weigert de controle het, want daar is de naam de
// opdracht zelf.
const vroeg = stukkenVroegGenoemd()
console.log(
  `${vroeg.length} opgaven noemen een stuk voor zijn eigen wereld (als doelwit, niet als opdracht).` +
    (process.argv.includes('--details') && vroeg.length ? `\n  ${vroeg.join('\n  ')}` : ''),
)
