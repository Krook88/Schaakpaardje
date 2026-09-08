import { Thuis } from './Thuis'
import { Welkom } from './Welkom'

/**
 * De startpagina.
 *
 * Deze schil is met opzet géén 'use client'. Daardoor komt `Welkom` in de geëxporteerde
 * index.html terecht, en dat was precies het gat: de hele app draait in de browser, dus
 * de gebouwde startpagina bevatte 195 tekens tekst. Voor een zoekmachine, voor een
 * gedeelde link en voor een ouder die op een trage verbinding zit was er niets.
 *
 * `Thuis` doet daarna de rest en beslist wie de landingspagina te zien krijgt: een
 * bezoeker zonder profiel wel, een kind dat al speelt niet.
 */
export default function Start() {
  return <Thuis welkom={<Welkom />} />
}
