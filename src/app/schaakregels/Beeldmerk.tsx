import { GLYPH } from '@/board/pieces'
import type { Onderwerp } from '@/content/schaakregels'
import s from './Schaakregels.module.css'

/** Het stuk waar een pagina over gaat, als tegel. Een teken als het over geen stuk gaat. */
export function Beeldmerk({ onderwerp, groot }: { onderwerp: Onderwerp; groot?: boolean }) {
  return (
    <span aria-hidden="true" className={`${s.merk} ${groot ? s.merkGroot : ''}`}>
      {onderwerp.stuk ? <span className={s.stuk}>{GLYPH[onderwerp.stuk]}</span> : onderwerp.teken}
    </span>
  )
}
