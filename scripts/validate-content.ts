/** Contentcontrole als los script, zodat CI hem kan draaien zonder testrunner. */
import { alleZinnen, controleerContent, nietNagerekend } from '../src/content/validate'

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
