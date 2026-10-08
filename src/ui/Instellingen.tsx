'use client'

import { useEffect } from 'react'
import { setVoiceConfig } from '@/audio/voice'
import { setSfxEnabled } from '@/audio/sfx'
import { useInstellingen } from '@/progress/store'

/**
 * Past de instellingen van het profiel toe op de audiolaag.
 *
 * Dit hoort in de layout en niet op één scherm. Stond het alleen op de stal, dan werkte
 * "Pip praat uit" niet zodra een kind rechtstreeks op een les binnenkomt — bij een
 * herlaadbeurt, vanuit de geïnstalleerde app, of offline vanuit de service worker. De
 * geluidjes werden elders per aanroep nog getoetst, de stem niet.
 */
export function Instellingen() {
  const instellingen = useInstellingen()
  useEffect(() => {
    setVoiceConfig({
      spraak: instellingen.spraak,
      tempo: instellingen.tempo,
      ondertiteling: instellingen.ondertiteling,
    })
    setSfxEnabled(instellingen.effecten)
  }, [instellingen])
  return null
}
