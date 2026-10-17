/**
 * Gestructureerde gegevens (schema.org) in de HTML, voor zoekmachines.
 *
 * De `<` wordt geëscaped: deze gegevens bevatten tekst uit de content, en een `</script>`
 * daarin zou het blok voortijdig afsluiten. Dat staat er nu nergens, maar een les die
 * ooit uitlegt hoe je `<` noteert, zou het anders stilletjes breken.
 */
export function Gegevens({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
