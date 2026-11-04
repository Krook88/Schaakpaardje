"""Iconen in de stijl van Pip en de wereldwapens, in plaats van systeememoji.

Schrijft naar public/illustraties/iconen/:
  les-<id>.svg   één icoon per les, hetzelfde idee als de emoji in `icoon`
  <naam>.svg     vaste iconen (minispel, slot, beker, fasen, punten op de startpagina...)

Alles 100x100, met dezelfde dikke zachte bruine lijn (#3b2414) als Pip, vlakke warme
kleuren en een crème omtrek eromheen, zodat elk icoon op licht én donker zijn eigen
rand heeft. De vorm blijft binnen een cirkel van straal 46 rond het midden: dan past
hij in een ronde houder van 64-76 px zonder dat er iets wordt afgesneden.

De lessen worden met een regex uit src/content/werelden/*.ts gelezen. Staat er een
les met een emoji waar hier geen tekening voor is, dan stopt het script en zegt het
welke les. Twee lessen met dezelfde emoji delen dezelfde tekening.

Draaien: python3 scripts/iconen-tekenen.py
"""
import math
import os
import re
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'public', 'illustraties', 'iconen')

L = '#3b2414'      # de lijn van Pip
HALO = '#fff8ec'   # de crème omtrek
W = 5              # lijndikte (op 100): op 32 px nog anderhalve pixel
GOUD, GOUDD = '#f0b429', '#d89b1c'
ORANJE = '#e8923a'
ROZE = '#ef7d8f'
ROOD = '#e0604f'
GROEN, GROEND = '#79a671', '#4e7a54'
BLAUW, BLAUWD = '#8ec3d6', '#6a8fc0'
ROOM = '#f6efe2'
WIT = '#fffdf8'
HOUT = '#a8703a'
SNUIT = '#f8cd96'
HUID2 = '#d99a62'
MANEN = '#5b3418'
GRIJS = '#cfd3d2'
STEEN = '#c9bfae'
LICHT_VELD, DONKER_VELD = '#f2ebdd', '#8fa98a'  # de velden van het bord (globals.css)


# ---------------------------------------------------------------- bouwstenen
def p(d, f, extra=''):
    return f'<path d="{d}" fill="{f}"{extra}/>'


def c(x, y, r, f, extra=''):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{f}"{extra}/>'


def rect(x, y, w, h, rx, f, extra=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{f}"{extra}/>'


def lijn(d, w=W, kl=L):
    return f'<path d="{d}" fill="none" stroke="{kl}" stroke-width="{w}"/>'


def dik(d, kleur, w):
    """Een gekleurde lijn met een bruine rand, zo dik als de omtrek van een vlak."""
    return lijn(d, w + 2 * W) + lijn(d, w, kleur)


def sil(vormen, kleur):
    """Losse vormen als één silhouet: één buitenrand, geen lijnen waar ze overlappen."""
    return (f'<g fill="{L}" stroke-width="{2 * W}">{vormen}</g>'
            f'<g fill="{kleur}" stroke="none">{vormen}</g>')


def glans(d):
    return lijn(d, 3.5, WIT)


def g(t, inhoud):
    return f'<g transform="{t}">{inhoud}</g>'


def sterpad(x, y, r, binnen=.5, punten=5):
    return 'M' + 'L'.join(
        f'{x + (r if i % 2 == 0 else r * binnen) * math.sin(i * math.pi / punten):.1f} '
        f'{y - (r if i % 2 == 0 else r * binnen) * math.cos(i * math.pi / punten):.1f}'
        for i in range(2 * punten)) + 'Z'


HART = 'M-8 14C-20 2-22-10-12-14C-6-16-2-12 0-8C2-12 6-16 12-14C22-10 20 2 8 14L0 22Z'
PION = 'M-18 0C-18-10-12-16-6-18C-10-22-11-28-8-31A12 12 0 1 1 8-31C11-28 10-22 6-18C12-16 18-10 18 0Z'


def halo_van(body):
    """De crème omtrek: dezelfde vormen, alles crème en 7,5 dikker."""
    h = re.sub(r'(fill|stroke)="(?!none)[^"]*"', rf'\1="{HALO}"', body)
    h = re.sub(r'stroke-width="([\d.]+)"', lambda m: f'stroke-width="{float(m.group(1)) + 7.5:g}"', h)
    return h.replace(' opacity=".7"', '')


def svg(titel, body):
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-labelledby="t">'
         f'<title id="t">{titel}</title>'
         f'<g stroke-linejoin="round" stroke-linecap="round">'
         f'<g fill="{HALO}" stroke="{HALO}" stroke-width="{W + 7.5:g}">{halo_van(body)}</g>'
         f'<g stroke="{L}" stroke-width="{W}">{body}</g></g></svg>')
    assert '<script' not in s and 'href' not in s and '<text' not in s
    return s


# ---------------------------------------------------------------- herbruikbare figuren
def pijl(rot=0, kleur=ORANJE):
    return g(f'rotate({rot} 50 50)', p('M16 40H50V22L84 50L50 78V60H16Z', kleur))


def hand(t, kleur, mouw=BLAUWD):
    """Open hand, handpalm naar je toe, vingers omhoog; pols op (0, 0)."""
    vormen = (rect(-15, -34, 30, 34, 10, '') + rect(-15, -52, 7.5, 30, 3.75, '') + rect(-7.5, -57, 7.5, 34, 3.75, '')
              + rect(0, -54, 7.5, 32, 3.75, '') + rect(7.5, -46, 7.5, 26, 3.75, '')
              + '<rect x="-4" y="-24" width="8" height="24" rx="4" transform="translate(-12 -8) rotate(-42)"/>')
    vormen = vormen.replace(' fill=""', '')
    return g(t, sil(vormen, kleur) + lijn('M-7.5-34V-48M0-34V-50M7.5-34V-44', 3)
             + rect(-16, -2, 32, 12, 4, mouw))


def ogen():
    oog = lambda x: (f'<ellipse cx="{x}" cy="50" rx="14" ry="19" fill="{WIT}"/>'
                     + c(x - 5, 55, 7.5, L) + c(x - 7, 52, 2.4, WIT, ' stroke="none"'))
    return oog(35) + oog(65)


def kiemplant():
    return (p('M18 82C22 68 78 68 82 82Z', HOUT) + dik('M50 74V48', GROEND, 5)
            + p('M50 52C44 36 28 32 18 38C26 52 40 56 50 52Z', GROEN)
            + p('M50 48C54 28 70 20 84 26C78 44 64 52 50 48Z', GROEN)
            + lijn('M50 50C58 42 66 36 74 32', 3) + lijn('M48 52C40 46 32 42 26 41', 3))


def gezicht(haar, kroon, lang=False):
    achter = p('M24 58C22 38 34 28 50 28C66 28 78 38 76 58L80 84H20Z', haar) if lang else ''
    return (achter + c(50, 58, 25, SNUIT)
            + (p('M26 54C28 40 38 34 50 34C62 34 72 40 74 54C66 46 58 44 50 46C42 44 34 46 26 54Z', haar))
            + kroon + c(41, 60, 3.5, L, ' stroke="none"') + c(59, 60, 3.5, L, ' stroke="none"')
            + lijn('M42 70Q50 77 58 70', 4) + c(34, 68, 4, ROZE, ' stroke="none" opacity=".7"')
            + c(66, 68, 4, ROZE, ' stroke="none" opacity=".7"'))


def vork(x, y=24):
    return (p(f'M{x - 8} {y}V{y + 14}C{x - 8} {y + 21} {x - 3} {y + 23} {x - 3} {y + 26}V{y + 30}H{x + 3}V{y + 26}'
              f'C{x + 3} {y + 23} {x + 8} {y + 21} {x + 8} {y + 14}V{y}', GRIJS)
            + rect(x - 4, y + 28, 8, 24, 4, HOUT) + lijn(f'M{x - 2.7} {y}V{y + 12}M{x + 2.7} {y}V{y + 12}', 3))


def mes(x, y=24):
    return (p(f'M{x - 2} {y}C{x + 6} {y + 4} {x + 8} {y + 18} {x + 5} {y + 30}H{x - 4}V{y + 6}C{x - 4} {y + 3} {x - 3} {y + 1} {x - 2} {y}Z', GRIJS)
            + rect(x - 4.5, y + 28, 8.5, 24, 4, HOUT))


def zwaard(rot):
    return g(f'translate(50 50) rotate({rot}) scale(.92)',
             p('M-5 16V-34L0-42L5-34V16Z', GRIJS) + lijn('M0-34V12', 2.5)
             + rect(-14, 14, 28, 8, 4, GOUD) + rect(-4, 22, 8, 14, 3, HOUT) + c(0, 40, 4.5, GOUD))


def cijfer(d, x, rot, sc=1):
    return g(f'translate({x} 50) rotate({rot}) scale({sc})', rect(-12, -17, 24, 34, 6, ROOM) + lijn(d, 4.5))


KONING_D = (('M-6-56H6M0-63V-48', 'kruis'), 'M-14-34C-17-44-8-49 0-49C8-49 17-44 14-34Z',
            'M-18 0C-18-8-12-12-8-14L-11-34H11L8-14C12-12 18-8 18 0Z')
TOREN_D = 'M-14 0V-9H-10L-11-27H-15V-40H-9V-35H-3V-40H3V-35H9V-40H15V-27H11L10-9H14V0Z'


def koning_stuk(t, kleur=ROOM):
    return g(t, dik(KONING_D[0][0], kleur, 4) + p(KONING_D[1], kleur) + p(KONING_D[2], kleur) + lijn('M-9-16H9', 3))


def toren_stuk(t, kleur=ROOM):
    return g(t, p(TOREN_D, kleur) + lijn('M-10-27H10M-9-9H9', 3))


def pijlpunt(x, y, dx, dy, kleur, lang=10, breed=8):
    """Driehoekje met de punt op (x, y), in richting (dx, dy)."""
    n = math.hypot(dx, dy); dx, dy = dx / n, dy / n
    bx, by = x - dx * lang, y - dy * lang
    return p(f'M{x:.1f} {y:.1f}L{bx - dy * breed:.1f} {by + dx * breed:.1f}L{bx + dy * breed:.1f} {by - dx * breed:.1f}Z', kleur, ' stroke-width="4"')


def luidspreker(golven):
    return p('M16 40H30L50 22V78L30 60H16Z', BLAUW) + ''.join(lijn(d) for d in golven)


# ---------------------------------------------------------------- de tekeningen
def t_licht_donker():
    return (c(50, 50, 34, LICHT_VELD) + p('M50 16A34 34 0 0 0 50 84Z', DONKER_VELD)
            + c(50, 50, 34, 'none') + glans('M66 26Q74 32 76 40'))


def t_rij_lijn():
    vakken = ''
    for k in range(-2, 3):
        kl = LICHT_VELD if k % 2 == 0 else DONKER_VELD
        vakken += f'<rect x="{42 + 16 * k}" y="42" width="16" height="16" fill="{kl}" stroke="none"/>'
        if k:
            vakken += f'<rect x="42" y="{42 + 16 * k}" width="16" height="16" fill="{kl}" stroke="none"/>'
    kruis = 'M42 10H58V42H90V58H58V90H42V58H10V42H42Z'
    return p(kruis, LICHT_VELD) + vakken + p(kruis, 'none')


def t_kompas():
    return (c(50, 50, 36, ROOM) + c(50, 50, 27, 'none', ' stroke-width="3"')
            + lijn('M50 14V20M50 80V86M14 50H20M80 50H86', 3.5)
            + p('M50 24L59 50H41Z', ROOD) + p('M41 50H59L50 76Z', WIT) + c(50, 50, 4, L, ' stroke="none"'))


def t_toren_recht():
    pijltjes = (dik('M50 24V18', ORANJE, 5) + pijlpunt(50, 9, 0, -1, ORANJE, 11, 10)
                + dik('M50 80V82', ORANJE, 5) + pijlpunt(50, 91, 0, 1, ORANJE, 11, 10)
                + dik('M30 52H18', ORANJE, 5) + pijlpunt(9, 52, -1, 0, ORANJE, 11, 10)
                + dik('M70 52H82', ORANJE, 5) + pijlpunt(91, 52, 1, 0, ORANJE, 11, 10))
    return pijltjes + toren_stuk('translate(50 76) scale(1.15)')


def t_plus():
    return p('M40 16H60V40H84V60H60V84H40V60H16V40H40Z', GROEN) + glans('M46 24V34')


def t_muur():
    return (rect(16, 26, 68, 48, 7, '#d9774f')
            + lijn('M16 42H84M16 58H84M38 26V42M62 26V42M27 42V58M50 42V58M73 42V58M38 58V74M62 58V74', 3.5)
            + glans('M22 32H30'))


def t_bord_bestek():
    return c(50, 50, 24, WIT) + c(50, 50, 15, ROOM, ' stroke-width="3"') + vork(17, 26) + mes(84, 26)


def t_lichte_diagonaal():
    # 4x4 uit de hoek rechtsonder van het bord: rechtsonder licht, en de diagonaal
    # daarvandaan naar linksboven is helemaal licht. Daar blijft een loper altijd op.
    velden = ''.join(f'<rect x="{18 + 16 * i}" y="{18 + 16 * j}" width="16" height="16" fill="{DONKER_VELD}" stroke="none"/>'
                     for i in range(4) for j in range(4) if (i + j) % 2)
    return (rect(18, 18, 64, 64, 8, LICHT_VELD) + velden + rect(18, 18, 64, 64, 8, 'none')
            + dik('M26 26L74 74', GOUD, 4) + ''.join(c(26 + 16 * k, 26 + 16 * k, 4.5, GOUD, ' stroke-width="3"') for k in range(4)))


def t_palet():
    return (p('M50 16C26 16 12 34 14 54C16 74 34 86 52 84C62 83 63 74 57 70C51 66 54 57 63 59C75 62 86 57 86 43C86 26 70 16 50 16Z', '#f3d9b0')
            + c(34, 40, 6.5, ROOD) + c(51, 30, 6.5, GOUD) + c(69, 38, 6.5, BLAUW) + c(30, 61, 6.5, GROEN))


def t_vork_mes():
    groot = 'translate(50 50) scale(1.25) translate(-50 -46)'
    return g(f'rotate(-30 50 50) {groot}', vork(50, 20)) + g(f'rotate(30 50 50) {groot}', mes(50, 20))


def t_ster8():
    return dik('M50 20V80M20 50H80M29 29L71 71M71 29L29 71', GROEN, 10) + c(50, 50, 6, WIT, ' stroke-width="3"')


def t_afzetting():
    strepen = ''.join(p(f'M{a} 54H{a + 10}L{a + 20} 28H{a + 10}Z', ROOD, ' stroke="none"') for a in (17, 38, 59))
    return (rect(24, 50, 8, 28, 3, HOUT) + rect(68, 50, 8, 28, 3, HOUT)
            + rect(16, 74, 24, 8, 4, HOUT) + rect(60, 74, 24, 8, 4, HOUT)
            + rect(14, 28, 72, 26, 6, GOUD) + strepen + rect(14, 28, 72, 26, 6, 'none'))


def t_diamant():
    return (p('M28 22H72L88 42L50 84L12 42Z', BLAUW) + lijn('M12 42H88M38 22L32 42L50 84L68 42L62 22', 3)
            + glans('M30 30L24 38'))


def t_l_sprong():
    # Twee rechtdoor, één opzij: de staande arm (hartlijn x 38, van y 84 tot 24) is 60
    # lang, de liggende (y 24, van x 38 tot de punt op 68) 30 (schaakmeester, ronde 2).
    return p('M30 84V16H50V6L68 24L50 42V32H46V84Z', ORANJE) + glans('M36 74V28')


def t_takje():
    # Weinig maar dikke blaadjes: op 32 px blijft een takje met tien smalle
    # blaadjes een bruin streepje.
    blad = lambda x, y, r: g(f'translate({x} {y}) rotate({r})', f'<ellipse cx="15" cy="0" rx="15" ry="8.5" fill="{GROEN}"/>' + lijn('M5 0H22', 2.5))
    return g('translate(50 50) scale(.9) translate(-52 -44)', dik('M32 86C40 64 48 44 62 20', GROEND, 4)
             + blad(38, 66, -160) + blad(40, 62, -25) + blad(46, 46, -150) + blad(48, 42, -35) + blad(60, 22, -65))


def t_wortel():
    return (p('M66 30C62 22 62 14 66 8C72 14 72 24 66 30Z', GROEN)
            + p('M66 30C72 22 80 20 88 24C84 32 76 34 66 30Z', GROEN)
            + p('M66 30C64 22 56 16 48 16C50 24 56 30 66 30Z', GROEN)
            + p('M54 30C64 22 80 34 72 44L30 82C25 86 18 80 23 75Z', ORANJE)
            + lijn('M48 44L54 49M40 54L45 58M33 64L37 67', 3))


def t_vlag():
    ruit = ''.join(f'<rect x="{32 + 12 * i}" y="{20 + 12 * j}" width="12" height="12" fill="{L}" stroke="none"/>'
                   for i in range(4) for j in range(3) if (i + j) % 2)
    return dik('M28 86V16', HOUT, 5) + rect(32, 20, 48, 36, 3, WIT) + ruit + rect(32, 20, 48, 36, 3, 'none')


def t_voetjes():
    voet = ('<path d="M0-12C8-12 10-4 9 4C8 12 6 20 0 20C-6 20-8 12-9 4C-10-4-8-12 0-12Z"/>'
            '<circle cx="-7" cy="-18" r="3.4"/><circle cx="-1.5" cy="-21" r="3.6"/><circle cx="4" cy="-19.5" r="3.2"/><circle cx="8.5" cy="-15" r="2.6"/>')
    return (g('translate(35 60) rotate(-14) scale(1.08)', sil(voet, '#c98a5a'))
            + g('translate(65 42) rotate(14) scale(1.08)', sil(voet, '#c98a5a')))


def t_smul():
    return (c(50, 50, 35, GOUD) + lijn('M30 42Q37 35 44 42M56 42Q63 35 70 42', 4.5)
            + p('M30 56Q50 80 70 56Z', '#7a3420') + g('rotate(-15 60 66)', f'<ellipse cx="60" cy="66" rx="8" ry="7" fill="{ROZE}" stroke-width="3"/>')
            + c(26, 54, 5, ROOD, ' stroke="none" opacity=".7"') + c(74, 54, 5, ROOD, ' stroke="none" opacity=".7"'))


def t_heen_weer():
    return p('M12 50L36 26V40H64V26L88 50L64 74V60H36V74Z', ORANJE)


def t_vooruit_snel():
    # Omhoog, niet opzij: een pion gaat nooit opzij (schaakmeester, ronde 2).
    return p('M50 46L78 78H22Z', ORANJE) + p('M50 14L78 46H22Z', ORANJE)


def t_schaar():
    return (p('M38 62L64 18C66 15 70 17 69 20L47 66Z', GRIJS) + p('M62 62L36 18C34 15 30 17 31 20L53 66Z', GRIJS)
            + dik('M44 70A9 9 0 1 1 26 70A9 9 0 1 1 44 70', ROOD, 6) + dik('M74 70A9 9 0 1 1 56 70A9 9 0 1 1 74 70', ROOD, 6)
            + c(50, 48, 3.5, L, ' stroke="none"'))


def t_kroon():
    return (p('M20 70L16 34L34 48L50 26L66 48L84 34L80 70Z', GOUD) + rect(18, 64, 64, 15, 5, GOUD)
            + c(16, 32, 5, ROZE) + c(50, 24, 5, ROZE) + c(84, 32, 5, ROZE) + c(50, 71.5, 4, ROOD, ' stroke-width="3"'))


def t_wolkje():
    puf = '<circle cx="30" cy="56" r="15"/><circle cx="44" cy="46" r="12"/><circle cx="42" cy="66" r="11"/>'
    return (dik('M50 38H78M54 54H86M48 70H72', BLAUW, 6) + sil(puf, '#e3f1f5'))


def t_puzzel():
    return g('translate(-4 2)', p('M18 30H38C34 20 40 12 46 12C52 12 58 20 54 30H74V44C84 40 90 46 90 52C90 58 84 64 74 60V82H18Z', GROEN)
                               + glans('M26 38V48'))


def t_getallen():
    een = 'M-4-8L1-12V12M-5 12H6'
    drie = 'M-6-9C-3-13 6-13 6-6C6-2 2-1 0-1C3-1 7 1 7 6C7 13-3 13-7 9'
    vijf = 'M6-12H-4L-5-2C-2-4 7-4 7 4C7 12-3 13-7 9'
    negen = 'M7-4C4 1-7 1-7-5C-7-12 7-13 7-4V3C7 10 1 13-6 10'
    # Pion 1, paard en loper 3, toren 5, dame 9.
    return (g('translate(0 4)', cijfer(een, 17, -8, .78)) + g('translate(0 -4)', cijfer(drie, 39, -3, .78))
            + g('translate(0 -4)', cijfer(vijf, 61, 3, .78)) + g('translate(0 4)', cijfer(negen, 83, 8, .78)))


def t_cadeau():
    return (rect(20, 44, 60, 38, 5, ROOD) + rect(16, 32, 68, 14, 5, ROOD) + rect(44, 32, 12, 50, 2, GOUD)
            + p('M50 32C40 16 24 20 30 32Z', GOUD) + p('M50 32C60 16 76 20 70 32Z', GOUD))


def t_weegschaal():
    schaal = lambda x: lijn(f'M{x} 30L{x - 10} 56M{x} 30L{x + 10} 56', 3) + p(f'M{x - 13} 56H{x + 13}A13 9 0 0 1 {x - 13} 56Z', GOUD)
    return (p('M32 84L38 74H62L68 84Z', GOUD) + rect(46, 26, 8, 50, 3, GOUD) + dik('M22 30H78', GOUD, 5)
            + c(50, 24, 5, GOUD) + schaal(22) + schaal(78))


def t_rennende_pion():
    return (lijn('M12 42H26M8 56H24M14 70H26', 4.5)
            + lijn('M46 74L38 86M60 74L66 86', 5.5)
            + g('translate(54 76) rotate(12) scale(1.05)', p(PION, ROOM) + lijn('M-7-18H7', 3)))


def t_zwaarden():
    return zwaard(-40) + zwaard(40)


def t_schild():
    return (p('M50 14C62 22 72 24 82 24C82 54 72 74 50 86C28 74 18 54 18 24C28 24 38 22 50 14Z', BLAUWD)
            + p('M50 14C62 22 72 24 82 24C82 54 72 74 50 86Z', BLAUW, ' stroke="none"')
            + p('M50 14C62 22 72 24 82 24C82 54 72 74 50 86C28 74 18 54 18 24C28 24 38 22 50 14Z', 'none')
            + lijn('M50 16V84', 3) + glans('M26 32Q26 44 30 52'))


def t_bliksem():
    return p('M58 12L24 56H46L38 88L76 42H54L64 12Z', GOUD) + glans('M54 20L40 40')


def t_megafoon():
    return (p('M34 62L32 76H44L46 62Z', HOUT) + rect(12, 40, 14, 20, 4, GRIJS) + p('M24 40L66 20V80L24 60Z', ROOD)
            + f'<ellipse cx="66" cy="50" rx="8" ry="30" fill="#f7a08f"/>' + lijn('M82 38Q88 50 82 62', 4.5))


def t_deur():
    return (lijn('M20 85H80') + p('M30 84V36A20 20 0 0 1 70 36V84Z', HOUT)
            + rect(37, 32, 26, 20, 6, 'none', ' stroke-width="3"') + rect(37, 58, 26, 20, 4, 'none', ' stroke-width="3"')
            + c(62, 56, 4, GOUD, ' stroke-width="3"'))


def t_omgevallen_koning():
    # Een omgevallen koning: zo eindigt een partij als er mat staat.
    return (koning_stuk('translate(84 66) rotate(-90) scale(1.12)')
            + p(sterpad(30, 28, 9), GOUD, ' stroke-width="3.5"') + p(sterpad(52, 18, 6.5), GOUD, ' stroke-width="3.5"'))


def t_doelwit():
    return (c(46, 54, 32, ROOD) + c(46, 54, 22, WIT) + c(46, 54, 12, ROOD) + dik('M48 52L78 22', HOUT, 4)
            + p('M76 14L84 22L90 14L82 10Z', GOUD) + p('M78 24L86 18L88 26Z', GOUD))


def t_handdruk():
    # Twee handen uit twee mouwen, in het midden in elkaar: de voorste hand (licht)
    # vouwt zijn vingers om de achterste (donkerder), wiens duim er bovenop ligt.
    return g('translate(50 52) scale(1.08) translate(-50 -52)', p('M13 58L27 42L39 54L25 70Z', BLAUWD) + p('M87 58L73 42L61 54L75 70Z', ROOD)
            + p('M70 44C64 36 50 36 40 42L34 50C40 60 54 66 68 58Z', HUID2)
            + p('M28 48C34 40 44 38 52 42L66 50C70 53 70 60 64 62C58 66 48 66 40 62L32 58Z', SNUIT)
            + lijn('M50 46C54 50 54 58 50 64M58 50C62 54 62 60 58 64', 3)
            + p('M72 46C64 40 54 40 46 44C50 48 58 48 66 50Z', HUID2))


def t_rokade():
    # De koning gaat naar rechts, de toren springt over hem heen naar links: twee
    # pijlen die elkaar boven de stukken kruisen.
    a, b = 'M28 42Q44 36 66 20', 'M72 42Q56 36 34 20'
    return (koning_stuk('translate(30 88) scale(.6)') + toren_stuk('translate(71 88) scale(.92)')
            + dik(a, ORANJE, 5) + pijlpunt(74, 14, 1, -.75, ORANJE) + dik(b, BLAUWD, 5) + pijlpunt(26, 14, -1, -.75, BLAUWD))


def t_kasteel():
    return (p('M30 84V60H70V84Z', ROOM) + p('M44 84V74A6 6 0 0 1 56 74V84Z', HOUT)
            + p('M16 62C30 58 37 52 40 44H60C63 52 70 58 84 62Z', ROOD)
            + p('M38 44V32H62V44Z', ROOM) + rect(46, 35, 8, 7, 2, L, ' stroke="none"')
            + p('M26 32C38 30 44 24 46 18H54C56 24 62 30 74 32Z', ROOD) + lijn('M50 18V11', 4) + c(50, 10, 3.5, GOUD, ' stroke-width="3"'))


def t_liniaal():
    streepjes = ''.join(f'M{x} 38V{46 if i % 2 else 50}' for i, x in enumerate(range(20, 84, 9)))
    return g('rotate(-35 50 50)', rect(8, 38, 84, 24, 5, GOUD) + lijn(streepjes, 3))


def t_klembord():
    rijen = ''.join(lijn(f'M35 {y}L38 {y + 3}L43 {y - 3}', 3.5, GROEND) + lijn(f'M48 {y}H64', 3) for y in (40, 52, 64, 76))
    return rect(22, 16, 56, 74, 7, HOUT) + rect(29, 27, 42, 56, 3, WIT, ' stroke-width="3.5"') + rect(38, 11, 24, 12, 4, GRIJS) + rijen


def t_veldnaam():
    # Een naamkaartje met e4 erop, getekend als lijnen (geen lettertype).
    return (p('M30 26H80A6 6 0 0 1 86 32V68A6 6 0 0 1 80 74H30L14 50Z', ROOM) + c(26, 50, 4, 'none', ' stroke-width="3"')
            + lijn('M39 52H57A9 9 0 1 0 54 59', 5.5) + lijn('M76 66V36L62 56H80', 5.5))


def t_letters():
    return (rect(12, 26, 76, 48, 10, BLAUW) + c(29, 56, 7, 'none', ' stroke-width="4.5"') + lijn('M36 48V63', 4.5)
            + lijn('M44 36V63', 4.5) + c(51, 56, 7, 'none', ' stroke-width="4.5"') + lijn('M77 51A7 7 0 1 0 77 61', 4.5))


def t_potlood():
    return g('translate(50 50) rotate(40) scale(.8) translate(0 37)',
             p('M-10-70H10V-12H-10Z', GOUD) + lijn('M-3-70V-12', 3.5, GOUDD) + p('M-10-84H10V-70H-10Z', ROZE)
             + p('M-10-12H10L0 10Z', '#f3d9b0') + p('M-3.5-2H3.5L0 10Z', L))


def t_stoplicht():
    return rect(33, 12, 34, 76, 13, '#5b4636') + c(50, 29, 8, ROOD) + c(50, 50, 8, GOUD) + c(50, 71, 8, GROEN)


def t_splitspijl():
    # Eén stuk, twee doelen: een pijl die zich in tweeën splitst.
    lijnen = 'M50 86V58L34 40M50 58L66 40'
    koppen = '<path d="M20.7 25.1L43.9 28.5L21.5 48.5Z"/><path d="M79.3 25.1L56.1 28.5L78.5 48.5Z"/>'
    return (lijn(lijnen, 12 + 2 * W) + f'<g fill="{L}" stroke-width="{2 * W}">{koppen}</g>'
            + lijn(lijnen, 12, ORANJE) + f'<g fill="{ORANJE}" stroke="none">{koppen}</g>')


def t_drietand():
    vormen = ('<rect x="46" y="44" width="8" height="44" rx="3"/>'
              '<path d="M20 24C20 42 34 50 50 50C66 50 80 42 80 24H72C72 36 62 42 50 42C38 42 28 36 28 24Z"/>'
              '<rect x="46" y="22" width="8" height="26"/>'
              '<path d="M24 10L15 27H33Z"/><path d="M76 10L67 27H85Z"/><path d="M50 7L41 25H59Z"/>')
    return g('translate(50 50) scale(.9) translate(-50 -50)', sil(vormen, GOUD))


def t_punaise():
    return g('translate(54 46) rotate(35)',
             dik('M0 8V36', GRIJS, 3) + f'<ellipse cx="0" cy="6" rx="14" ry="5" fill="{ROOD}"/>'
             + p('M-8-10H8L5 4H-5Z', '#c4483a') + c(0, -22, 15, ROOD) + glans('M-8-28Q-6-34 0-35'))


def t_prins():
    return gezicht(MANEN, p('M32 36L29 16L40 24L50 12L60 24L71 16L68 36Z', GOUD) + c(50, 28, 3, ROZE, ' stroke-width="2.5"'))


def t_kroon_toren():
    return (toren_stuk('translate(72 82) scale(1.05)') + g('translate(38 52) scale(.72) translate(-50 -52)', t_kroon()))


def t_prinses():
    return gezicht('#c0622f', p('M36 36L38 22L44 30L50 18L56 30L62 22L64 36Z', GOUD) + c(50, 30, 3, ROZE, ' stroke-width="2.5"'), lang=True)


# ---------------------------------------------------------------- vaste iconen
def t_dobbelsteen():
    ogen5 = ''.join(c(x, y, 5.5, L, ' stroke="none"') for x, y in ((35, 35), (65, 35), (50, 50), (35, 65), (65, 65)))
    return g('rotate(-12 50 50)', rect(18, 18, 64, 64, 16, WIT) + ogen5)


def t_slot():
    return (dik('M34 46V34A16 16 0 0 1 66 34V46', GRIJS, 7) + rect(22, 44, 56, 42, 10, GOUD)
            + c(50, 60, 5, L, ' stroke="none"') + p('M47 62H53L55 74H45Z', L, ' stroke="none"'))


def t_beker():
    return (dik('M28 26H20C18 40 24 46 32 48M72 26H80C82 40 76 46 68 48', GOUD, 5)
            + p('M26 16H74V36C74 54 64 62 50 62C36 62 26 54 26 36Z', GOUD) + rect(44, 60, 12, 14, 2, GOUD)
            + rect(30, 72, 40, 13, 4, HOUT) + glans('M36 24V38'))


def t_medaille():
    return (p('M28 10H46L58 40H40Z', BLAUWD) + p('M72 10H54L42 40H60Z', ROOD)
            + c(50, 62, 25, GOUD) + c(50, 62, 17, 'none', f' stroke="{GOUDD}" stroke-width="3"')
            + p(sterpad(50, 62, 11), '#fff3c4', ' stroke-width="3"'))


def t_envelop():
    return (rect(12, 24, 76, 54, 9, ROOM) + lijn('M15 28L50 56L85 28', 4)
            + g('translate(50 50) scale(.95)', p(HART, ROZE, ' stroke-width="4"') + glans('M-12-6Q-12-10-8-10')))


def t_lampje():
    return (p('M50 12C34 12 24 24 24 38C24 48 30 55 36 61V68H64V61C70 55 76 48 76 38C76 24 66 12 50 12Z', GOUD)
            + lijn('M42 46L46 52L50 46L54 52L58 46', 3, GOUDD) + lijn('M50 52V66', 3, GOUDD)
            + rect(36, 66, 28, 9, 4, GRIJS) + rect(40, 75, 20, 9, 4, GRIJS) + glans('M34 34Q36 24 44 20'))


def t_geluid():
    return luidspreker(['M62 38Q70 50 62 62'])


def t_voorlezen():
    return luidspreker(['M62 38Q70 50 62 62', 'M72 28Q86 50 72 72'])


def t_tandwiel():
    pts = []
    for i in range(8):
        a = i * math.pi / 4
        for da, r in ((-.24, 27), (-.15, 37), (.15, 37), (.24, 27)):
            pts.append(f'{50 + r * math.sin(a + da):.1f} {50 - r * math.cos(a + da):.1f}')
    return p('M' + 'L'.join(pts) + 'Z', STEEN) + c(50, 50, 11, WIT)


def t_bel():
    return (c(50, 12, 4.5, GOUD) + c(50, 74, 7, GOUD)
            + p('M50 15C36 15 28 27 28 41V56L19 68H81L72 56V41C72 27 64 15 50 15Z', GOUD) + glans('M37 30Q38 24 44 21'))


def t_bel_uit():
    # Geluid uit aan de vorm, niet alleen aan doorzichtigheid: dezelfde bel met een
    # schuine streep erdoor (codebase-review K3).
    return t_bel() + dik('M20 16L82 86', ROOD, 6)


def t_ster():
    return p(sterpad(50, 53, 38, .48), GOUD) + glans('M42 32L46 24')


def t_ster_vol():
    return p(sterpad(50, 54, 42, .5), GOUD) + glans('M42 30L46 22')


def t_ster_leeg():
    # Nog niet gehaald: alleen de omtrek, met een zacht vlak zodat hij op elke grond leest.
    return p(sterpad(50, 54, 42, .5), 'none', f' stroke-width="{W + 2}"')


HOEFIJZER = 'M-15 12C-24 2-22-18-10-22C-4-24 4-24 10-22C22-18 24 2 15 12L7 8C12 0 12-10 6-13C2-15-2-15-6-13C-12-10-12 0-7 8Z'


def medaille(kleur, donker):
    nagels = ''.join(c(x, y, 1.8, L, ' stroke="none"') for x, y in ((-16, -2), (-14, -13), (-6, -19), (6, -19), (14, -13), (16, -2)))
    return (p('M28 8H46L58 40H40Z', BLAUWD) + p('M72 8H54L42 40H60Z', ROOD)
            + c(50, 62, 26, kleur) + c(50, 62, 19, 'none', f' stroke="{donker}" stroke-width="3"')
            + g('translate(50 64) scale(1.05)', p(HOEFIJZER, WIT, ' stroke-width="3.5"') + nagels))


def t_meedoen():
    return hand('translate(35 84) rotate(-12) scale(.82)', SNUIT, ROOD) + hand('translate(65 84) rotate(12) scale(-.82 .82)', HUID2, BLAUWD)


def t_zelf():
    return (hand('translate(50 80) scale(1.15)', SNUIT, BLAUWD)
            + lijn('M76 22L84 16M80 34L89 32M70 14L73 6', 4))


def t_hart():
    return g('translate(50 44) scale(1.85)', p(HART, ROZE, ' stroke-width="2.7"') + lijn('M-12-6Q-12-10-8-10', 1.9, WIT))


# ---------------------------------------------------------------- welke tekening bij welke emoji
LES = {
    '🌗': t_licht_donker, '➡': lambda: pijl(0), '🧭': t_kompas,
    '➕': t_plus, '🧱': t_muur, '🍽': t_bord_bestek,
    '↗': lambda: pijl(-45), '🎨': t_palet, '🍴': t_vork_mes,
    '✳': t_ster8, '🚧': t_afzetting, '💎': t_diamant,
    '🔀': t_l_sprong, '🌿': t_takje, '🥕': t_wortel, '🏁': t_vlag,
    '👣': t_voetjes, '😋': t_smul, '↔': t_heen_weer,
    '⬆': lambda: pijl(-90), '⏩': t_vooruit_snel, '✂': t_schaar, '👑': t_kroon, '💨': t_wolkje, '🧩': t_puzzel,
    '🔢': t_getallen, '🎁': t_cadeau, '⚖': t_weegschaal,
    '👀': ogen, '🏃': t_rennende_pion, '⚔': t_zwaarden, '🛡': t_schild,
    '⚡': t_bliksem, '📣': t_megafoon, '🚪': t_deur,
    '🔚': t_omgevallen_koning, '🎯': t_doelwit, '🤝': t_handdruk,
    '🏯': t_kasteel, '📏': t_liniaal, '📋': t_klembord,
    '🔤': t_letters, '✏': t_potlood, '🚦': t_stoplicht,
    '🔱': t_drietand, '📌': t_punaise,
    '🤴': t_prins, '👸': t_prinses, '🌱': kiemplant,
}

# Waar de emoji het idee van de les niet goed vangt, tekenen we de les zelf
# (schaakmeester en conversie-reviewer, ronde 2). Dit gaat vóór LES.
PER_LES = {
    'weide-2': t_rij_lijn,           # Rijen en lijnen: een rij en een lijn die elkaar kruisen
    'toren-1': t_toren_recht,        # De toren loopt recht: het plusteken las als EHBO-kruis
    'loper-2': t_lichte_diagonaal,   # Altijd dezelfde kleur: een diagonaal van alleen lichte velden
    'rokade-1': t_rokade,            # Twee stukken tegelijk: koning en toren, pijlen kruisen
    'notatie-1': t_veldnaam,         # Elk veld heeft een naam: e4
    'tactiek-1': t_splitspijl,       # De dubbele aanval: één pijl, twee punten
    'eindspel-2': t_kroon_toren,     # Mat met dame en met toren
}

VAST = {
    'minispel': ('Minispel', t_dobbelsteen),
    'slot': ('Nog op slot', t_slot),
    'beker': ('Beker', t_beker),
    'sticker': ('Sticker', t_medaille),
    'deel': ('Delen', t_envelop),
    'hint': ('Hint', t_lampje),
    'geluid': ('Geluid', t_geluid),
    'instellingen': ('Instellingen', t_tandwiel),
    'bel': ('Bel', t_bel),
    'bel-uit': ('Bel uit', t_bel_uit),
    'ster-vol': ('Ster gehaald', t_ster_vol),
    'ster-leeg': ('Ster nog niet gehaald', t_ster_leeg),
    'medaille-brons': ('Bronzen medaille', lambda: medaille('#d08a4e', '#a5642f')),
    'medaille-zilver': ('Zilveren medaille', lambda: medaille('#d3d7da', '#9aa1a6')),
    'medaille-goud': ('Gouden medaille', lambda: medaille(GOUD, GOUDD)),
    'fase-kijken': ('Kijken', ogen),
    'fase-meedoen': ('Meedoen', t_meedoen),
    'fase-zelf': ('Zelf doen', t_zelf),
    'fase-toets': ('Toets', t_ster),
    'punt-voorlezen': ('Pip leest alles voor', t_voorlezen),
    'punt-begint-bij-nul': ('Je begint bij nul', kiemplant),
    'punt-niet-verliezen': ('Je kunt hier niet verliezen', t_hart),
}


def sleutel(emoji):
    return emoji.replace('️', '')


def lessen():
    """Elke les: het id dat het dichtst vóór een `icoon:` staat, plus titel en emoji."""
    uit = []
    map_ = os.path.join(ROOT, 'src', 'content', 'werelden')
    for f in sorted(os.listdir(map_), key=lambda f: int(re.match(r'w(\d+)', f).group(1)) if re.match(r'w\d+', f) else 99):
        if not f.endswith('.ts'):
            continue
        t = open(os.path.join(map_, f), encoding='utf-8').read()
        for m in re.finditer(r"^\s*icoon:\s*'([^']+)'", t, re.M):
            voor = t[:m.start()]
            ids = re.findall(r"^\s*id:\s*'([^']+)'", voor, re.M)
            titels = re.findall(r"^\s*titel:\s*'([^']+)'", voor, re.M)
            if not ids:
                sys.exit(f'{f}: een icoon zonder les-id ervoor ({m.group(1)})')
            uit.append(dict(id=ids[-1], titel=titels[-1] if titels else ids[-1], icoon=m.group(1), bestand=f))
    return uit


if __name__ == '__main__':
    ls = lessen()
    onbekend = set(PER_LES) - {l['id'] for l in ls}
    if onbekend:
        sys.exit(f'PER_LES noemt lessen die niet bestaan: {", ".join(sorted(onbekend))}')
    zonder = [l for l in ls if l['id'] not in PER_LES and sleutel(l['icoon']) not in LES]
    if zonder:
        sys.exit('Geen tekening voor deze les(sen); voeg er een toe aan LES in scripts/iconen-tekenen.py:\n'
                 + '\n'.join(f"  {l['id']} ({l['bestand']}): {l['icoon']}  {l['titel']}" for l in zonder))
    dubbel = [i for i in {l['id'] for l in ls} if sum(1 for l in ls if l['id'] == i) > 1]
    if dubbel:
        sys.exit(f'Les-id komt twee keer voor: {", ".join(dubbel)}')
    os.makedirs(OUT, exist_ok=True)
    geschreven = []
    for l in ls:
        geschreven.append((f"les-{l['id']}.svg", svg(f"Les: {l['titel']}", (PER_LES.get(l['id']) or LES[sleutel(l['icoon'])])())))
    for naam, (titel, f) in VAST.items():
        geschreven.append((f'{naam}.svg', svg(titel, f())))
    for naam, s in geschreven:
        assert len(s.encode()) < 6000, f'{naam} is {len(s.encode())} bytes, de grens is 6 kB'
        open(os.path.join(OUT, naam), 'w', encoding='utf-8').write(s)
    gedeeld = {}
    for l in ls:
        if l['id'] not in PER_LES:
            gedeeld.setdefault(sleutel(l['icoon']), []).append(l['id'])
    for e, ids in gedeeld.items():
        if len(ids) > 1:
            print('  zelfde tekening:', e, ', '.join(ids))
    print(len(geschreven), 'iconen getekend in', os.path.normpath(OUT))
