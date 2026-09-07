'use client'

import { useCallback, useRef } from 'react'
import { wachtTotUitgesproken } from '@/audio/voice'

/** Hoe lang een tip minstens blijft staan, ook als Pip niets zegt. */
const MINSTENS_MS = 2600
/** Adempauze tussen de tip en de opdracht, zodat het twee zinnen blijven. */
const ADEM_MS = 500

/**
 * Zeg de tip, en zet daarna de opdracht terug.
 *
 * Zonder dit verdween de opdracht voorgoed bij de eerste misser. Pips ballon is de
 * enige plek waar staat wat er moet gebeuren, en die werd overschreven door "Hm, die
 * kan niet. Kijk waar het stuk heen mag." Wat een kind daarna zag was een bord, een
 * kruisje en een zin die niet vertelt wat de bedoeling was. Ook de luidsprekerknop
 * hielp niet meer: die herhaalt wat er in de ballon staat, en dat was de tip.
 *
 * Een kind dat niet leest kan de opdracht nergens meer terugvinden — en juist het kind
 * dat een fout maakte, heeft hem het hardst nodig.
 *
 * De tip blijft staan tot Pip is uitgesproken én minstens tweeëneenhalve seconde, want
 * met de stem uit is hij anders weg voor je hem gelezen hebt. Daarna komt de opdracht
 * terug, en spreekt Pip hem opnieuw uit. Dat laatste is met opzet: dat is wat een mens
 * ook zou doen na "nee, dat kan niet".
 */
export function gebruikTip(setZin: (zin: string) => void) {
  const beurt = useRef(0)

  /** Onthoud dat er een tip loopt, zodat een nieuwe gebeurtenis hem kan afbreken. */
  const afbreken = useCallback(() => {
    beurt.current++
  }, [])

  const zegTip = useCallback(
    (tip: string, opdracht: string) => {
      const mijn = ++beurt.current
      setZin(tip)
      if (!opdracht) return
      void Promise.all([
        wachtTotUitgesproken(),
        new Promise((los) => setTimeout(los, MINSTENS_MS)),
      ]).then(() => {
        setTimeout(() => {
          // Alleen als er intussen niets anders gebeurd is: het kind kan het al goed
          // hebben gedaan, of naar de volgende opgave zijn gegaan.
          if (mijn === beurt.current) setZin(opdracht)
        }, ADEM_MS)
      })
    },
    [setZin],
  )

  return { zegTip, afbreken }
}
