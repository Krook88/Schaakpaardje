"""De zeven bots als dierengezichten, in de stijl van Pip (scripts/pip-tekenen.py).

Schrijft naar public/illustraties/bots/:
  bot-<id>.svg   kop en schouders, frontaal, vriendelijk (200x200). De id komt uit
                 src/engine/bots.ts.

Zelfde recept als Pip: één silhouet dat twee keer onder de tekening ligt, eerst als
dikke crème rand (22) en dan als bruine lijn (11), zodat elk dier op licht én donker
zijn eigen rand heeft. Daarop vlakke warme kleuren, ogen met een wit lichtje en een
blosje. Geen tekst, geen lettertype.

Draaien: python3 scripts/bots-tekenen.py
"""
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'illustraties', 'bots')
L, HALO, WANG, MOND = '#3b2414', '#fff8ec', '#f07a5c', '#6b2a17'
ROZE, GOUD, ROOD, ROOM = '#f4a77c', '#f0b429', '#e0503c', '#fdf3e1'

SCHOUDERS = 'M34 200C34 166 62 150 100 150C138 150 166 166 166 200Z'


def el(x, y, rx, ry, f, rot=0):
    t = f' transform="rotate({rot} {x} {y})"' if rot else ''
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{f}"{t}/>'


def p(d, f):
    return f'<path d="{d}" fill="{f}"/>'


def lijn(d, w=5):
    return f'<path d="{d}" fill="none" stroke="{L}" stroke-width="{w}"/>'


def ogen(y=98, dx=20, rx=7.5, ry=9.5):
    return ''.join(f'<ellipse cx="{100 + s * dx}" cy="{y}" rx="{rx}" ry="{ry}" fill="{L}"/>'
                   f'<circle cx="{100 + s * dx - 2.5}" cy="{y - 3.5}" r="3" fill="#fff"/>' for s in (-1, 1))


def wangen(y=118, dx=34, f=WANG):
    return el(100 - dx, y, 9, 6, f) .replace('/>', ' opacity=".5"/>') + el(100 + dx, y, 9, 6, f).replace('/>', ' opacity=".5"/>')


def lach(y=126, b=12):
    return lijn(f'M{100 - b} {y}Q100 {y + 11} {100 + b} {y}')


def neus(y=113, f=L, r=6):
    return el(100, y, r * 1.3, r, f)


def bot(id, vormen, gezicht, kop=(100, 104, 50, 46), lijf=None):
    """vormen: lijst (shape-zonder-fill, kleur) van achter naar voor, vóór de kop.
    lijf: kleur van de schouders."""
    x, y, rx, ry = kop
    kopvorm = f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}"/>'
    sil = f'<path d="{SCHOUDERS}"/>' + ''.join(v for v, _ in vormen) + kopvorm
    kleur = lambda v, f: v.replace('/>', f' fill="{f}"/>', 1)
    body = (f'<use href="#s" fill="{HALO}" stroke="{HALO}" stroke-width="22"/>'
            f'<use href="#s" fill="{L}" stroke="{L}" stroke-width="11"/>'
            + kleur(f'<path d="{SCHOUDERS}"/>', lijf[0])
            + ''.join(kleur(v, f) for v, f in vormen)
            + kleur(kopvorm, lijf[1]) + gezicht)
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">'
         f'<defs><g id="s">{sil}</g></defs>'
         f'<g stroke-linejoin="round" stroke-linecap="round">{body}</g></svg>')
    open(os.path.join(OUT, f'bot-{id}.svg'), 'w').write(s)


os.makedirs(OUT, exist_ok=True)

# Mila de Muis: grijs, grote ronde oren, roze neusje, snorharen.
G, GD = '#bdb3a8', '#a39789'
bot('mila', [('<circle cx="54" cy="64" r="30"/>', G), ('<circle cx="146" cy="64" r="30"/>', G),
             ('<circle cx="56" cy="66" r="18"/>', ROZE), ('<circle cx="144" cy="66" r="18"/>', ROZE)],
    ogen(98) + wangen() + el(100, 114, 7, 5.5, '#ef7d8f')
    + lijn('M80 116L58 112M80 121L58 124M120 116L142 112M120 121L142 124', 3)
    + lijn('M92 125Q100 132 108 125', 4.5), kop=(100, 106, 46, 42), lijf=(GD, G))

# Kip Kiki: room, rode kam, gele snavel, lelletje.
bot('kiki', [('<path d="M78 66C70 46 82 34 92 44C92 26 110 24 112 42C118 28 136 36 126 58Z"/>', ROOD)],
    ogen(94, 22) + wangen(112, 36)
    + f'<path d="M86 108L114 108L100 128Z" fill="{GOUD}" stroke="{L}" stroke-width="4"/>'
    + f'<path d="M94 126Q100 144 106 126Z" fill="{ROOD}" stroke="{L}" stroke-width="4"/>'
    + lijn('M88 116L112 116', 3),
    kop=(100, 102, 46, 46), lijf=('#ecd9b6', ROOM))

# Rens het Konijn: lichtbruin, lange oren, witte snoet, twee tandjes.
B, BD = '#d6b38a', '#c09a6e'
bot('rens', [(el(79, 54, 14, 36, '', -8).replace(' fill=""', ''), B), (el(121, 54, 14, 36, '', 8).replace(' fill=""', ''), B),
             (el(79, 56, 7, 26, '', -8).replace(' fill=""', ''), ROZE), (el(121, 56, 7, 26, '', 8).replace(' fill=""', ''), ROZE)],
    ogen(102) + wangen(120) + el(100, 122, 22, 15, ROOM)
    + f'<rect x="94" y="126" width="12" height="11" rx="3" fill="#fff" stroke="{L}" stroke-width="3"/>'
    + lijn('M100 126V137', 2.5) + el(100, 114, 6.5, 5, '#ef7d8f') + lijn('M86 124Q93 129 100 124Q107 129 114 124', 4),
    kop=(100, 110, 46, 42), lijf=(BD, B))

# Bas de Hond: bruin, donkere flaporen, lichte snuit, grote neus, tongetje.
H, HD, HS = '#c98a4e', '#7a4a26', '#f3d4a6'
bot('bas', [(el(52, 96, 16, 34, '', 18).replace(' fill=""', ''), HD), (el(148, 96, 16, 34, '', -18).replace(' fill=""', ''), HD)],
    el(100, 122, 28, 20, HS) + ogen(94, 21) + wangen(116, 38) + neus(112, L, 8)
    + f'<path d="M93 132Q93 146 100 146Q107 146 107 132Z" fill="#ef7d8f" stroke="{L}" stroke-width="3.5"/>'
    + lijn('M84 128Q92 135 100 129Q108 135 116 128', 4.5) + '<circle cx="96" cy="109" r="2.4" fill="#fff"/>',
    kop=(100, 102, 48, 46), lijf=('#b57a42', H))

# Fien de Vos: oranjerood, puntoren, witte wangen, zwart neusje.
V, VD = '#e0702e', '#c75f24'
bot('fien', [('<path d="M54 86L46 34L92 66Z"/>', V), ('<path d="M146 86L154 34L108 66Z"/>', V),
             ('<path d="M58 72L54 46L78 64Z"/>', '#5b3418'), ('<path d="M142 72L146 46L122 64Z"/>', '#5b3418')],
    p('M52 104C64 112 84 114 100 128C116 114 136 112 148 104C150 130 126 148 100 148C74 148 50 130 52 104Z', ROOM)
    + ogen(96) + wangen(116, 36) + neus(124, L, 6) + lach(132, 9),
    kop=(100, 104, 50, 44), lijf=(VD, V))

# Oscar de Uil: bruin, oorpluimen, grote lichte oogschijven, oranje snavel.
U, UD, US = '#a07a56', '#7e5c3e', '#f3e2c4'
bot('oscar', [('<path d="M58 72L56 38L84 60Z"/>', U), ('<path d="M142 72L144 38L116 60Z"/>', U)],
    el(80, 98, 19, 19, US) + el(120, 98, 19, 19, US) + ogen(98, 20, 8.5, 10)
    + wangen(124, 38) + f'<path d="M92 112L108 112L100 128Z" fill="{GOUD}" stroke="{L}" stroke-width="4"/>'
    + lijn('M80 174Q86 168 92 174M108 174Q114 168 120 174M94 188Q100 182 106 188', 3.5),
    kop=(100, 102, 50, 46), lijf=(UD, U))

# Bram de Beer: donkerbruin, kleine ronde oren, lichte snuit.
R, RD, RS = '#9a6438', '#7f4f2b', '#e9c493'
bot('bram', [('<circle cx="60" cy="66" r="20"/>', R), ('<circle cx="140" cy="66" r="20"/>', R),
             ('<circle cx="60" cy="66" r="10"/>', RS), ('<circle cx="140" cy="66" r="10"/>', RS)],
    el(100, 122, 24, 18, RS) + ogen(98, 21) + wangen(118, 38) + neus(114, L, 7)
    + '<circle cx="96" cy="111" r="2.2" fill="#fff"/>' + lach(126, 10),
    kop=(100, 106, 50, 46), lijf=(RD, R))

print('Bots getekend in', os.path.normpath(OUT))
