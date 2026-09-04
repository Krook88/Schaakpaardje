/**
 * De drie hoefijzers. Bewust géén 'use client'-module: de diplomapagina wordt tijdens
 * het bouwen gegenereerd, en een servercomponent kan niets importeren uit een
 * clientmodule (dan krijgt hij een verwijzing in plaats van de waarde zelf).
 */
export const DIPLOMAS = [
  { soort: 'brons' as const, naam: 'Hoefijzer Brons', tot: 6, wat: 'Alle stukken en hun zetten' },
  { soort: 'zilver' as const, naam: 'Hoefijzer Zilver', tot: 12, wat: 'Schaak, mat, rokade en notatie' },
  { soort: 'goud' as const, naam: 'Hoefijzer Goud', tot: 14, wat: 'Tactiek en eindspel' },
]

export type DiplomaSoort = (typeof DIPLOMAS)[number]['soort']
