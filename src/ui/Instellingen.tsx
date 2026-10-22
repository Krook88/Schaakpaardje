'use client'

import { useEffect } from 'react'
import { setVoiceConfig } from '@/audio/voice'
import { setSfxEnabled } from '@/audio/sfx'
import { useInstellingen, useToestandGeladen } from '@/progress/store'

/**
 * Past de instellingen van het profiel toe op de audiolaag.
 *
 * Dit hoort in de layout en niet op één scherm. Stond het alleen op de stal, dan werkte
 * "Pip praat uit" niet zodra een kind rechtstreeks op een les binnenkomt — bij een
 * herlaadbeurt, vanuit de geïnstalleerde app, of offline vanuit de service worker. De
 * geluidjes werden elders per aanroep nog getoetst, de stem niet.
 *
 * Pas na het inlezen van de opgeslagen toestand. Bij de eerste render is er nog geen
 * profiel en dus gelden de gastinstellingen (geluid uit); werden die meteen toegepast,
 * dan viel Pips eerste zin op /spelen/ en de andere schermen weg bij een kind mét
 * profiel. Zolang er niets is toegepast, houdt voice.ts de zin vast.
 */
export function Instellingen() {
  const instellingen = useInstellingen()
  const geladen = useToestandGeladen()
  useEffect(() => {
    if (!geladen) return
    setVoiceConfig({
      spraak: instellingen.spraak,
      tempo: instellingen.tempo,
      ondertiteling: instellingen.ondertiteling,
    })
    setSfxEnabled(instellingen.effecten)
  }, [instellingen, geladen])
  return null
}
