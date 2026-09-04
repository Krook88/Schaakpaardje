/** Contentcontrole als los script, zodat CI hem kan draaien zonder testrunner. */
import { controleerContent } from '../src/content/validate'
import { alleZinnen } from '../src/content/validate'

const bevindingen = controleerContent()
if (bevindingen.length) {
  console.error(`${bevindingen.length} probleem(en) in de content:\n`)
  for (const b of bevindingen) console.error(`  ✗ ${b.waar}: ${b.probleem}`)
  process.exit(1)
}
console.log(`Content is in orde. ${alleZinnen().length} zinnen om in te spreken.`)
