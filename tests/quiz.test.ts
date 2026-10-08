import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { antwoordQuiz, startOpgave } from '@/lesson/runner'
import { ALLE_LESSEN, alleOpgaven } from '@/content'
import type { Exercise } from '@/content/types'

const QUIZZEN = ALLE_LESSEN.flatMap(alleOpgaven).filter(
  (o): o is Extract<Exercise, { kind: 'quiz' }> => o.kind === 'quiz',
)

describe('quizantwoorden', () => {
  it('husselt de antwoorden echt door elkaar', () => {
    // In alle vierennegentig quizzen stond het goede antwoord vooraan: een kind dat
    // niet leest haalde drie sterren door steeds de bovenste knop te tikken. Daarom
    // schudt startOpgave ze. Dat betekent wel dat de opgave uit de content en de opgave
    // in de lesmotor een ándere volgorde hebben — zie de test hieronder.
    const verschoven = QUIZZEN.filter((q) => {
      const geschud = startOpgave(q).opgave
      if (geschud.kind !== 'quiz') return false
      return geschud.opties.some((o, i) => o.label !== q.opties[i].label)
    })
    expect(verschoven.length).toBeGreaterThan(QUIZZEN.length / 2)
  })

  it('rekent het goede antwoord goed, op de plek waar het geschud is beland', () => {
    for (const quiz of QUIZZEN) {
      const stand = startOpgave(quiz)
      if (stand.opgave.kind !== 'quiz') continue
      const goedIndex = stand.opgave.opties.findIndex((o) => o.goed)
      expect(antwoordQuiz(stand, goedIndex).goed, quiz.vraag).toBe(true)
      for (let i = 0; i < stand.opgave.opties.length; i++) {
        if (i !== goedIndex) expect(antwoordQuiz(stand, i).goed, `${quiz.vraag} / ${i}`).toBe(false)
      }
    }
  })

  it('laat "Opnieuw" dezelfde volgorde teruggeven', () => {
    // Opnieuw begint bij de ruwe opgave. Zou het bij de geschudde beginnen, dan schudt
    // startOpgave nóg een keer en verspringen de antwoorden onder het kind vandaan.
    for (const quiz of QUIZZEN) {
      const eerste = startOpgave(quiz).opgave
      const opnieuw = startOpgave(quiz).opgave
      if (eerste.kind !== 'quiz' || opnieuw.kind !== 'quiz') continue
      expect(opnieuw.opties.map((o) => o.label)).toEqual(eerste.opties.map((o) => o.label))
    }
  })
})
