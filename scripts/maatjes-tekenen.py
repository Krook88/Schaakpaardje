"""De acht maatjes (profielplaatjes) als getekende dieren, in de stijl van de bots
(scripts/bots-tekenen.py): zelfde silhouet-recept met dikke crème rand en bruine lijn,
vlakke warme kleuren, ogen met een lichtje, blosjes. Alleen kop en schouders, altijd blij.

Bewust anders dan de bots, zodat een kind zijn maatje niet met een tegenstander
verwart: andere kleuren en een eigen accessoire (sjaaltje, strik, schild, vleugels).
Het paard is bruin met een witte bles en zwarte manen, geen oranje: het mag niet op Pip lijken.

De emoji in src/progress/store.ts (AVATARS) wijzen via maatjeBeeld() in src/ui/beelden.tsx
naar public/illustraties/maatjes/maatje-<naam>.svg.

Draaien: python3 scripts/maatjes-tekenen.py
"""
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'illustraties', 'maatjes')
L, HALO, WANG = '#3b2414', '#fff8ec', '#f07a5c'
ROZE, GOUD, ROOM = '#f4a77c', '#f0b429', '#fdf3e1'
SCHOUDERS = 'M34 200C34 166 62 150 100 150C138 150 166 166 166 200Z'


def el(x, y, rx, ry, f='', rot=0):
    t = f' transform="rotate({rot} {x} {y})"' if rot else ''
    fill = f' fill="{f}"' if f else ''
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}"{fill}{t}/>'


def p(d, f=''):
    return f'<path d="{d}" fill="{f}"/>' if f else f'<path d="{d}"/>'


def lijn(d, w=5):
    return f'<path d="{d}" fill="none" stroke="{L}" stroke-width="{w}"/>'


def ogen(y=98, dx=20, rx=7.5, ry=9.5):
    return ''.join(f'<ellipse cx="{100 + s * dx}" cy="{y}" rx="{rx}" ry="{ry}" fill="{L}"/>'
                   f'<circle cx="{100 + s * dx - 2.5}" cy="{y - 3.5}" r="3" fill="#fff"/>' for s in (-1, 1))


def wangen(y=118, dx=34):
    return ''.join(el(100 + s * dx, y, 9, 6, WANG).replace('/>', ' opacity=".5"/>') for s in (-1, 1))


def lach(y=126, b=12):
    return lijn(f'M{100 - b} {y}Q100 {y + 11} {100 + b} {y}')


def neus(y=113, r=6):
    return el(100, y, r * 1.3, r, L)


def teken(naam, vormen, gezicht, kop, lijf, voor=''):
    """vormen: (vorm-zonder-fill, kleur) achter de kop. voor: over het geheel (accessoire
    op de schouders), met eigen lijn. lijf: (schouders, kop)."""
    x, y, rx, ry = kop
    kopvorm = f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}"/>'
    sil = f'<path d="{SCHOUDERS}"/>' + ''.join(v for v, _ in vormen) + kopvorm
    kleur = lambda v, f: v.replace('/>', f' fill="{f}"/>', 1)
    body = (f'<use href="#s" fill="{HALO}" stroke="{HALO}" stroke-width="27"/>'
            f'<use href="#s" fill="{L}" stroke="{L}" stroke-width="11"/>'
            + kleur(f'<path d="{SCHOUDERS}"/>', lijf[0]) + voor
            + ''.join(kleur(v, f) for v, f in vormen)
            + kleur(kopvorm, lijf[1]) + gezicht)
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">'
         f'<defs><g id="s">{sil}</g></defs>'
         f'<g stroke-linejoin="round" stroke-linecap="round">{body}</g></svg>')
    open(os.path.join(OUT, f'maatje-{naam}.svg'), 'w').write(s)


def sjaal(f, streep=None):
    """Een sjaaltje om de hals, over de schouders."""
    s = f'<path d="M58 160Q100 182 142 160L146 172Q100 196 54 172Z" fill="{f}" stroke="{L}" stroke-width="4"/>'
    s += f'<path d="M116 176L124 200L140 196L130 170Z" fill="{f}" stroke="{L}" stroke-width="4"/>'
    if streep:
        s += f'<path d="M120 186L136 182" stroke="{streep}" stroke-width="4" fill="none"/>'
    return s


os.makedirs(OUT, exist_ok=True)

# Paard: bruin (geen oranje, niet Pip), zwarte manen, witte bles, lichte snuit, groen dekje.
P, PD, PM = '#8a5a3c', '#6e4630', '#2f2219'
teken('paard', [(el(68, 52, 11, 24, rot=-18), P), (el(132, 52, 11, 24, rot=18), P),
                (el(68, 54, 5, 15, rot=-18), ROZE), (el(132, 54, 5, 15, rot=18), ROZE),
                (p('M78 62C86 44 114 44 122 62L112 76L100 66L88 76Z'), PM)],
      p('M92 64C96 60 104 60 108 64L104 118L96 118Z', '#fbf5ea')
      + el(100, 128, 30, 20, '#d9b89a') + ogen(96, 22) + wangen(114, 38)
      + el(89, 126, 4, 5, L) + el(111, 126, 4, 5, L) + lach(136, 10),
      kop=(100, 106, 46, 50), lijf=(PD, P), voor=sjaal('#5f9e6e'))

# Vos: lichter oranje dan Fien, crème snoet, blauw sjaaltje.
V, VD = '#f2a65a', '#de8f45'
teken('vos', [(p('M54 86L48 36L92 66Z'), V), (p('M146 86L152 36L108 66Z'), V),
              (p('M60 72L56 48L78 64Z'), ROOM), (p('M140 72L144 48L122 64Z'), ROOM)],
      p('M52 104C64 112 84 114 100 128C116 114 136 112 148 104C150 130 126 148 100 148C74 148 50 130 52 104Z', ROOM)
      + ogen(96) + wangen(116, 36) + neus(124) + lach(132, 9),
      kop=(100, 104, 50, 44), lijf=(VD, V), voor=sjaal('#4f8fc9', '#fdf3e1'))

# Beer: honingkleurig (Bram is donkerbruin), rood strikje.
B, BD, BS = '#d99a52', '#c08442', '#f6dcb0'
strik = (f'<path d="M100 162L76 150L76 176Z" fill="#e0503c" stroke="{L}" stroke-width="4"/>'
         f'<path d="M100 162L124 150L124 176Z" fill="#e0503c" stroke="{L}" stroke-width="4"/>'
         f'<circle cx="100" cy="162" r="7" fill="#c23e2c" stroke="{L}" stroke-width="4"/>')
teken('beer', [('<circle cx="60" cy="66" r="20"/>', B), ('<circle cx="140" cy="66" r="20"/>', B),
               ('<circle cx="60" cy="66" r="10"/>', BS), ('<circle cx="140" cy="66" r="10"/>', BS)],
      el(100, 122, 24, 18, BS) + ogen(98, 21) + wangen(118, 38) + neus(114, 7)
      + '<circle cx="96" cy="111" r="2.2" fill="#fff"/>' + lach(126, 10),
      kop=(100, 106, 50, 44), lijf=(BD, B), voor=strik)

# Konijn: lichtgrijs (Rens is bruin), één flapoor, paarse strik tussen de oren.
K, KD = '#d8d2d6', '#b9b0b7'
teken('konijn', [(el(80, 52, 14, 36, rot=-10), K), (el(126, 60, 14, 34, rot=40), K),
                 (el(80, 54, 7, 26, rot=-10), ROZE), (el(126, 61, 7, 24, rot=40), ROZE),
                 (p('M100 68L80 58L82 80Z'), '#9b6fc4'), (p('M100 68L120 58L118 80Z'), '#9b6fc4'),
                 ('<circle cx="100" cy="68" r="6"/>', '#7d55a6')],
      ogen(102) + wangen(120) + el(100, 122, 22, 15, '#f7f3f5')
      + f'<rect x="94" y="126" width="12" height="11" rx="3" fill="#fff" stroke="{L}" stroke-width="3"/>'
      + lijn('M100 126V137', 2.5) + el(100, 114, 6.5, 5, '#ef7d8f')
      + lijn('M86 124Q93 129 100 124Q107 129 114 124', 4),
      kop=(100, 110, 46, 42), lijf=('#9b6fc4', K))

# Uil: blauwgrijs (Oscar is bruin), gele oogschijven, oranje snavel.
U, UD, US = '#7f9bb3', '#66819a', '#fbe7a8'
teken('uil', [(p('M58 72L54 40L84 60Z'), U), (p('M142 72L146 40L116 60Z'), U)],
      el(80, 98, 19, 19, US) + el(120, 98, 19, 19, US) + ogen(98, 20, 8.5, 10)
      + wangen(124, 38) + f'<path d="M92 112L108 112L100 128Z" fill="#f08a3a" stroke="{L}" stroke-width="4"/>'
      + lijn('M80 174Q86 168 92 174M108 174Q114 168 120 174M94 188Q100 182 106 188', 3.5),
      kop=(100, 102, 50, 46), lijf=(UD, U))

# Schildpad: groene kop, schild op de schouders met zeshoekjes.
S, SD, SH = '#8cc47a', '#5f8f4e', '#c7934f'
schild = (f'<path d="M34 200C34 166 62 150 100 150C138 150 166 166 166 200Z" fill="{SH}" stroke="{L}" stroke-width="5"/>'
          + lijn('M60 200L66 172L100 162L134 172L140 200M66 172L44 186M134 172L156 186M100 162V150', 4))
teken('schildpad', [],
      el(100, 116, 26, 16, '#cfe6b8') + ogen(98, 22) + wangen(118, 36)
      + el(94, 110, 2.5, 2, L) + el(106, 110, 2.5, 2, L) + lach(124, 12),
      kop=(100, 104, 48, 44), lijf=(SD, S), voor=schild)

# Bij: gele kop, voelsprieten, gestreepte schouders, doorschijnende vleugeltjes.
Y = '#f6c945'
bij = (''.join(f'<ellipse cx="{100 + s * 60}" cy="160" rx="22" ry="14" fill="#e6f3fb" stroke="{L}" stroke-width="4" transform="rotate({s * -25} {100 + s * 60} 160)"/>' for s in (-1, 1))
       + f'<path d="M40 182H160M36 196H164" stroke="{L}" stroke-width="9" fill="none"/>')
teken('bij', [(el(76, 48, 3.5, 18, rot=-30), L), (el(124, 48, 3.5, 18, rot=30), L),
              ('<circle cx="67" cy="33" r="8"/>', L), ('<circle cx="133" cy="33" r="8"/>', L)],
      ogen(100, 21) + wangen(120, 36) + lach(126, 12),
      kop=(100, 106, 48, 46), lijf=(Y, Y), voor=bij)

# Eenhoorn: wit met lila manen, gouden hoorn, roze snuit.
E, ED = '#fbf7fb', '#e9dcef'
teken('eenhoorn', [(el(70, 56, 10, 20, rot=-20), E), (el(130, 56, 10, 20, rot=20), E),
                   (el(70, 58, 5, 12, rot=-20), ROZE), (el(130, 58, 5, 12, rot=20), ROZE),
                   (p('M92 66L100 18L108 66Z'), GOUD),
                   (p('M76 66C82 52 96 50 100 60C104 50 118 52 124 66L112 78L100 70L88 78Z'), '#c79be0')],
      lijn('M95 50L105 44M94 38L104 32', 3)
      + el(100, 128, 28, 18, '#f9d3dd') + ogen(98, 22) + wangen(116, 38)
      + el(90, 126, 3.5, 4.5, L) + el(110, 126, 3.5, 4.5, L) + lach(136, 10),
      kop=(100, 106, 46, 48), lijf=(ED, E), voor=sjaal('#f08fb0', '#fff8ec'))

print('Maatjes getekend in', os.path.normpath(OUT))
