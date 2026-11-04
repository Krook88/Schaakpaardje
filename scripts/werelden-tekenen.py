"""Wereldwapens en kaartstroken voor alle vijftien werelden.

Schrijft naar public/illustraties/:
  werelden/wereld-<id>.svg      rond wapen (200x200), op 64 px leesbaar
  kaart/kaart-<id>.svg          landschapsstrook 800x300, rustig midden voor het pad
  kaart/kaart-<id>-donker.svg   dezelfde strook in schemerkleuren

Elke wereld krijgt zijn eigen toon (de HSL-hue uit src/content/werelden/*.ts) als
hoofdkleur; het motief zelf is in room, goud en hout, met dezelfde bruine lijn als Pip.
Onderin elk wapen ligt hetzelfde geblokte schaakbordje: dat maakt ze familie.

De kaartstroken moeten op elk scherm passen: de CSS kiest de uitsnede (en mag ze
breed laten herhalen). Daarom staat alles wat een vorm heeft in de randzones
(x < MIDDEN[0] en x > MIDDEN[1]); het midden is alleen lucht en heuvels, die je
mag uitrekken zonder dat er iets scheef gaat. En elke heuvellijn begint en eindigt
op dezelfde hoogte, zodat twee stroken naast elkaar naadloos aansluiten.

Draaien: python3 scripts/werelden-tekenen.py
"""
import colorsys
import os
import re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'public', 'illustraties')
L = '#3b2414'
HALO = '#fff8ec'
MIDDEN = (250, 550)  # in de kaartstrook: hier staat niets dan heuvels en lucht


def hx(h, s, l):
    r, g, b = colorsys.hls_to_rgb((h % 360) / 360, l / 100, s / 100)
    return '#%02x%02x%02x' % (round(r * 255), round(g * 255), round(b * 255))


def pal(h, donker=False):
    if not donker:
        return dict(lucht=hx(h, 60, 93), ver=hx(h, 34, 82), mid=hx(h, 32, 69), dicht=hx(h, 30, 58),
                    diep=hx(h, 32, 45), acc=hx(h, 62, 56), accd=hx(h, 46, 38), steen='#f6efe2',
                    steend='#e2d4bb', raam=L, zon='#f6c453', wolk='#fffdf8', goud='#f0b429',
                    water='#8ec3d6', waterl='#c9e6ee', hout='#a8703a', groen='#6f9e63', d=False)
    return dict(lucht=hx(h, 30, 21), ver=hx(h, 22, 28), mid=hx(h, 22, 23), dicht=hx(h, 22, 18),
                diep=hx(h, 24, 13), acc=hx(h, 36, 42), accd=hx(h, 30, 28), steen='#c8baa2',
                steend='#a2947c', raam='#f6c453', zon='#f1e6c4', wolk=hx(h, 14, 30), goud='#d6a12c',
                water='#2f5563', waterl='#4d7b88', hout='#76502e', groen='#3f6440', d=True)


# ---------------------------------------------------------------- werelden lezen
def werelden():
    uit = []
    for f in os.listdir(os.path.join(ROOT, 'src', 'content', 'werelden')):
        t = open(os.path.join(ROOT, 'src', 'content', 'werelden', f)).read()
        g = lambda k: re.search(rf"^\s*{k}:\s*'?([^',\n]+)'?,", t, re.M).group(1)
        uit.append(dict(nr=int(re.match(r'w(\d+)', f).group(1)), id=g('id'), naam=g('naam'),
                        toon=int(g('toon')), belofte=g('belofte')))
    return sorted(uit, key=lambda w: w['nr'])


# ---------------------------------------------------------------- bouwstenen
def g(inhoud, t=''):
    return f'<g transform="{t}">{inhoud}</g>' if t else inhoud


def bord(P, y0=146, y1=192, w0=88, w1=164, cols=4, rows=2, cx=100, sw=3):
    """Een geblokt schaakbordje in licht perspectief: licht en donker, duidelijk."""
    def pt(i, j):
        t = j / rows
        y = y0 + (y1 - y0) * t
        w = w0 + (w1 - w0) * t
        return f'{cx - w / 2 + w * i / cols:.1f} {y:.1f}'
    # Donker waar (i + j) oneven is, met j = rows - 1 als voorste rij: dan is het veld
    # rechtsvoor (i = cols - 1, j = rows - 1) licht, zoals wereld 0 leert ("wit
    # rechtsonder"). Eerst stond hier == 0, en lag het bordje in alle 15 wapens
    # verkeerd om (schaakmeester, 37e review).
    donker = lambda i, j: (i + j) % 2 == 1
    assert not donker(cols - 1, rows - 1), 'het veld rechtsvoor moet licht zijn'
    vlakken = ''.join(f'M{pt(i, j)}L{pt(i + 1, j)}L{pt(i + 1, j + 1)}L{pt(i, j + 1)}Z'
                      for j in range(rows) for i in range(cols) if donker(i, j))
    rand = f'M{pt(0, 0)}L{pt(cols, 0)}L{pt(cols, rows)}L{pt(0, rows)}Z'
    return (f'<path d="{rand}" fill="{P["steen"]}"/><path d="{vlakken}" fill="{P["accd"]}"/>'
            f'<path d="{rand}" fill="none" stroke="{L}" stroke-width="{sw}" stroke-linejoin="round"/>')


def heuvels(P):
    return (f'<path d="M14 110C48 90 82 92 110 102S168 98 192 92V200H14Z" fill="{P["ver"]}"/>'
            f'<path d="M8 130C52 114 98 116 132 126S180 122 196 118V200H8Z" fill="{P["mid"]}"/>')


def zon(P, x=146, y=60, r=18):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{P["zon"]}"/>'


def wolk(P, t):
    return f'<g transform="{t}" fill="{P["wolk"]}"><circle r="16"/><circle cx="20" cy="-8" r="20"/><circle cx="42" r="15"/><rect width="42" height="15" rx="7"/></g>'


def lijnstijl(inhoud, w=3.5):
    return f'<g stroke="{L}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round">{inhoud}</g>'


# ---------------------------------------------------------------- motieven
# Allemaal in een eigen 200-ruimte, midden x=100, grond op y=150.

def aar(P, t):
    return (f'<g transform="{t}"><path d="M0 0V-70" fill="none" stroke="#b9822a" stroke-width="6"/>'
            f'<g fill="{P["goud"]}"><ellipse cx="-8" cy="-36" rx="7" ry="12" transform="rotate(-28 -8 -36)"/>'
            f'<ellipse cx="8" cy="-44" rx="7" ry="12" transform="rotate(28 8 -44)"/>'
            f'<ellipse cx="-8" cy="-54" rx="7" ry="12" transform="rotate(-28 -8 -54)"/>'
            f'<ellipse cx="8" cy="-62" rx="7" ry="12" transform="rotate(28 8 -62)"/>'
            f'<ellipse cx="0" cy="-76" rx="7" ry="12"/></g></g>')


def m_weide(P):
    return lijnstijl(aar(P, 'translate(72 152) rotate(-20) scale(.9)') + aar(P, 'translate(128 152) rotate(20) scale(.9)')
                     + aar(P, 'translate(100 150)'))


def m_toren(P):
    s, sd = P['steen'], P['steend']
    return lijnstijl(
        f'<path d="M46 150V110H54V102H62V110H70V102H78V150Z" fill="{sd}"/>'
        f'<path d="M154 150V110H146V102H138V110H130V102H122V150Z" fill="{sd}"/>'
        f'<path d="M100 52V26" fill="none"/><path d="M100 27L124 34L100 42Z" fill="{P["acc"]}"/>'
        f'<path d="M76 150L80 76H72V52H84V60H94V52H106V60H116V52H128V76H120L124 150Z" fill="{s}"/>'
        f'<path d="M80 76H120" fill="none"/>'
        f'<rect x="94" y="88" width="12" height="18" rx="6" fill="{P["raam"]}"/>'
        f'<path d="M88 150V132A12 12 0 0 1 112 132V150Z" fill="{P["hout"]}"/>')


def den(P, x, y, s, f, loper=False):
    extra = (f'<circle cy="-94" r="7" fill="{P["steen"]}"/><path d="M-10-50L6-70" fill="none" stroke="{P["steen"]}" stroke-width="5"/>'
             if loper else '')
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M-6 0V-16H6V0Z" fill="{P["hout"]}"/>'
            f'<path d="M0-88L-22-50H-12L-32-14H32L12-50H22Z" fill="{f}"/>{extra}</g>')


def m_loper(P):
    return lijnstijl(den(P, 58, 150, .78, P['acc']) + den(P, 142, 150, .78, P['acc'])
                     + den(P, 100, 152, 1.08, P['accd'], loper=True))


def kroon_dame(P, x, y, s):
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M-20 0L-24-22L-12-12L0-28L12-12L24-22L20 0Z" fill="{P["goud"]}"/>'
            f'<g fill="{P["goud"]}"><circle cx="-24" cy="-24" r="4"/><circle cy="-31" r="4"/><circle cx="24" cy="-24" r="4"/></g>'
            f'<path d="M-20 0H20" fill="none"/></g>')


def m_dame(P):
    s, a = P['steen'], P['acc']
    return lijnstijl(
        f'<path d="M48 150V96H70V150Z" fill="{s}"/><path d="M130 150V96H152V150Z" fill="{s}"/>'
        f'<path d="M46 96C46 86 54 82 59 72C64 82 72 86 72 96Z" fill="{a}"/>'
        f'<path d="M128 96C128 86 136 82 141 72C146 82 154 86 154 96Z" fill="{a}"/>'
        f'<path d="M66 150V108H134V150Z" fill="{s}"/>'
        f'<path d="M78 108C78 90 92 84 100 66C108 84 122 90 122 108Z" fill="{a}"/>'
        f'<path d="M88 150V132A12 12 0 0 1 112 132V150Z" fill="{P["accd"]}"/>'
        f'<rect x="54" y="110" width="10" height="14" rx="5" fill="{P["raam"]}"/><rect x="136" y="110" width="10" height="14" rx="5" fill="{P["raam"]}"/>'
        + kroon_dame(P, 100, 62, 1.05))


# Een schaakpaard-silhouet (geen Pip): kop naar links, voet op (0, 0), 30 breed.
PAARDKOP = 'M-6 0C-6-9-3-14 1-18L-10-15C-14-15-16-19-14-23L-3-32L-1-37L3-33C12-31 16-20 14 0Z'


def paardenkop(P, x, y, s):
    """Crème paardenkop boven de staldeur, zoals een uithangbord."""
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="{PAARDKOP}" fill="{P["steen"]}"/>'
            f'<circle cx="-2" cy="-24" r="2.2" fill="{L}" stroke="none"/></g>')


def m_paard(P):
    return lijnstijl(
        f'<path d="M54 150V100L100 66L146 100V150Z" fill="{P["acc"]}"/>'
        f'<path d="M42 104L100 58L158 104L150 112L100 74L50 112Z" fill="{P["accd"]}"/>'
        f'<path d="M80 150V114H120V150Z" fill="{P["steen"]}"/>'
        f'<path d="M80 114L120 150M120 114L80 150" fill="none" stroke="{P["accd"]}" stroke-width="5"/>'
        f'<path d="M80 150V114H120V150" fill="none"/>'
        + paardenkop(P, 100, 110, .82) +
        f'<path d="M36 150V128H48V150ZM152 150V128H164V150Z" fill="{P["goud"]}"/>'
        f'<path d="M36 136H48M152 136H164" fill="none" stroke-width="2.5"/>')


def kroon_koning(P, x, y, s):
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M-6-30H6M0-36V-22" fill="none" stroke="{L}" stroke-width="9"/>'
            f'<path d="M-6-30H6M0-36V-22" fill="none" stroke="{P["goud"]}" stroke-width="4"/>'
            f'<path d="M-24 0L-26-22L-12-12L0-24L12-12L26-22L24 0Z" fill="{P["goud"]}"/><path d="M-24 0H24" fill="none"/>'
            f'<circle cy="-8" r="3.5" fill="#ef7d8f" stroke-width="2"/></g>')


def m_koning(P):
    s, a = P['steen'], P['acc']
    return lijnstijl(
        f'<path d="M58 150V110H66V104H74V110H82V104H90V110H110V104H118V110H126V104H134V110H142V150Z" fill="{P["steend"]}"/>'
        f'<path d="M42 150V90H70V150Z" fill="{s}"/><path d="M130 150V90H158V150Z" fill="{s}"/>'
        f'<path d="M38 90L56 60L74 90Z" fill="{a}"/><path d="M126 90L144 60L162 90Z" fill="{a}"/>'
        f'<path d="M82 150V90H118V150Z" fill="{s}"/><path d="M76 90L100 66L124 90Z" fill="{a}"/>'
        f'<path d="M90 150V134A10 10 0 0 1 110 134V150Z" fill="{P["hout"]}"/>'
        f'<rect x="95" y="100" width="10" height="16" rx="5" fill="{P["raam"]}"/>'
        + kroon_koning(P, 100, 58, .9))


PION = 'M-18 0C-18-10-12-16-6-18C-10-22-11-28-8-31A12 12 0 1 1 8-31C11-28 10-22 6-18C12-16 18-10 18 0Z'


def pion(P, x, y, s, kiem=True):
    k = (f'<path d="M0-52V-60" fill="none" stroke="{P["groen"]}" stroke-width="4"/>'
         f'<path d="M0-60C-4-70-14-70-16-64C-10-60-4-60 0-60ZM0-60C4-72 16-74 18-68C12-62 6-60 0-60Z" fill="{P["acc"]}" stroke-width="2.5"/>'
         if kiem else '')
    return f'<g transform="translate({x} {y}) scale({s})">{k}<path d="{PION}" fill="{P["steen"]}"/><path d="M-7-18H7" fill="none" stroke-width="2.5"/></g>'


def kiem(P, x, y, s=1):
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M0 0V-10" fill="none" stroke="{P["groen"]}" stroke-width="3"/>'
            f'<path d="M0-10C-3-18-11-18-13-13C-8-10-3-10 0-10ZM0-10C3-19 12-20 14-15C9-11 5-10 0-10Z" fill="{P["acc"]}" stroke-width="2"/></g>')


def m_pion(P):
    return lijnstijl(kiem(P, 40, 150) + kiem(P, 160, 150) + pion(P, 64, 150, 1) + pion(P, 136, 150, 1)
                     + pion(P, 100, 152, 1.35))


def m_waarde(P):
    gd = P['goud']
    def schaal(x):
        return (f'<path d="M{x} 66L{x - 16} 102M{x} 66L{x + 16} 102" fill="none" stroke-width="2.5"/>'
                f'<path d="M{x - 22} 102H{x + 22}A22 14 0 0 1 {x - 22} 102Z" fill="{gd}"/>')
    return lijnstijl(
        f'<path d="M78 150L86 138H114L122 150Z" fill="{gd}"/><path d="M96 140V62H104V140Z" fill="{gd}"/>'
        f'<path d="M58 62H142" fill="none" stroke="{L}" stroke-width="11"/><path d="M58 62H142" fill="none" stroke="{gd}" stroke-width="5"/>'
        f'<circle cx="100" cy="56" r="7" fill="{gd}"/>' + schaal(62) + schaal(138)
        + pion(P, 62, 100, .5, kiem=False) + f'<circle cx="132" cy="97" r="5" fill="{P["steen"]}" stroke-width="2.5"/><circle cx="144" cy="97" r="5" fill="{P["steen"]}" stroke-width="2.5"/><circle cx="138" cy="89" r="5" fill="{P["steen"]}" stroke-width="2.5"/>')


def vallei(P):
    return (f'<path d="M0 64C30 64 64 110 100 128C136 110 170 64 200 64V200H0Z" fill="{P["ver"]}"/>'
            f'<path d="M0 110C40 112 70 134 100 140C130 134 160 112 200 110V200H0Z" fill="{P["mid"]}"/>')


def m_aanval(P):
    return lijnstijl(
        f'<path d="M14 150L66 72L92 106L122 50L186 150Z" fill="{P["diep"]}"/>'
        f'<path d="M122 50L108 76L118 72L124 82L134 72L142 78Z" fill="{P["steen"]}"/>'
        f'<path d="M66 72L56 88L64 86L70 92L78 84Z" fill="{P["steen"]}"/>'
        f'<path d="M92 150L104 128L96 116L110 100" fill="none" stroke="{P["steen"]}" stroke-width="4" stroke-dasharray="1 8"/>'
        + f'<path d="M30 150L44 140L52 150ZM150 150L162 136L174 150Z" fill="{P["accd"]}"/>')


def bliksem(P, t):
    return (wolk(P, t) + g(f'<path d="M14 6L2 30H12L4 52L30 20H18L26 6Z" fill="{P["goud"]}"/>', t))


def m_schaak(P):
    riet = ''.join(f'<path d="M{x} 144V{y}" fill="none" stroke="{P["groen"]}" stroke-width="3"/><rect x="{x - 3}" y="{y}" width="6" height="12" rx="3" fill="{P["hout"]}" stroke-width="2"/>'
                   for x, y in ((40, 116), (48, 108), (154, 112), (162, 120)))
    return lijnstijl(
        f'<ellipse cx="100" cy="134" rx="72" ry="20" fill="{P["water"]}"/>'
        f'<path d="M70 130H96M110 138H132" fill="none" stroke="{P["waterl"]}" stroke-width="3"/>'
        + riet + lijnstijl(bliksem(P, 'translate(70 52)'), 3))


def m_mat(P):
    vlag = ''.join(f'<rect x="{112 + 8 * i}" y="{36 + 8 * j}" width="8" height="8" fill="{L if (i + j) % 2 else P["steen"]}" stroke="none"/>'
                   for i in range(4) for j in range(3))
    return lijnstijl(
        f'<path d="M0 124H90V200H0Z" fill="{P["water"]}" stroke="none"/>'
        f'<path d="M18 132q8-5 16 0t16 0M40 142q8-5 16 0t16 0" fill="none" stroke="{P["waterl"]}" stroke-width="3"/>'
        f'<path d="M84 150L90 120L84 104L96 84L150 80L180 88L196 100V150Z" fill="{P["diep"]}"/>'
        f'<path d="M93 86L150 80L180 88L176 96L150 90L96 94Z" fill="{P["acc"]}"/>'
        f'<path d="M112 86V34" fill="none" stroke-width="5"/>'
        f'{vlag}<path d="M112 36H144V60H112Z" fill="none" stroke-width="3"/>')


def m_rokade(P):
    s = P['steen']
    return lijnstijl(
        f'<path d="M0 118H200V200H0Z" fill="{P["water"]}" stroke="none"/>'
        f'<path d="M86 128q8-5 16 0t16 0M60 142q8-5 16 0t16 0" fill="none" stroke="{P["waterl"]}" stroke-width="3"/>'
        f'<path d="M14 150V110H22V102H32V110H42V102H52V110H62V150Z" fill="{s}"/>'
        f'<path d="M22 124H54M30 136H62M14 136H22" fill="none" stroke-width="2.5"/>'
        f'<path d="M132 150L136 72H156L160 150Z" fill="{s}"/>'
        f'<path d="M135 92H157L158 108H134ZM133 124H159L160 140H132Z" fill="{P["acc"]}"/>'
        f'<path d="M132 72H160L146 54Z" fill="{P["accd"]}"/><rect x="138" y="58" width="16" height="14" fill="{P["goud"]}"/>'
        f'<path d="M132 72H160L146 50Z" fill="{P["accd"]}"/>'
        f'<path d="M72 120H118L110 132H80Z" fill="{P["hout"]}"/><path d="M94 118V82L116 116Z" fill="{s}"/><path d="M94 82L82 90L94 96" fill="{P["acc"]}"/>')


def palm(P, x, y, s):
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M0 0C2-20 6-36 14-52" fill="none" stroke="{L}" stroke-width="11"/>'
            f'<path d="M0 0C2-20 6-36 14-52" fill="none" stroke="{P["hout"]}" stroke-width="6"/>'
            f'<path d="M14-52C0-62-16-58-22-48C-8-52 4-52 14-52ZM14-52C20-68 38-70 46-60C32-58 22-56 14-52ZM14-52C30-54 42-44 42-32C32-42 22-48 14-52ZM14-52C4-46-2-36-2-26C6-36 10-44 14-52Z" fill="{P["groen"]}"/></g>')


def potlood(P, t):
    return g(f'<path d="M-9-70H9V-12H-9Z" fill="{P["goud"]}"/><path d="M-3-70V-12" fill="none" stroke="#d89b1c" stroke-width="3"/>'
             f'<path d="M-9-82H9V-70H-9Z" fill="#ef7d8f"/><path d="M-9-12H9L0 8Z" fill="#f3d9b0"/><path d="M-3-2H3L0 8Z" fill="{L}"/>', t)


def m_notatie(P):
    return lijnstijl(
        f'<path d="M0 120H200V200H0Z" fill="{P["water"]}" stroke="none"/>'
        f'<path d="M20 134q8-5 16 0t16 0M150 132q8-5 16 0t16 0" fill="none" stroke="{P["waterl"]}" stroke-width="3"/>'
        f'<path d="M34 146C50 112 150 112 166 146Z" fill="#ead39c"/>'
        + palm(P, 64, 128, 1) + potlood(P, 'translate(124 132) rotate(14)')
        + f'<path d="M132 70l4-4 4 4M132 70" fill="none"/>')


def kristal(P, x, y, s, r=0):
    return (f'<g transform="translate({x} {y}) rotate({r}) scale({s})"><path d="M0 0L-8-12L-4-30L4-34L9-12Z" fill="{P["acc"]}"/>'
            f'<path d="M-4-30L0-4L4-34" fill="none" stroke="{P["steen"]}" stroke-width="2.5"/></g>')


def m_tactiek(P):
    return lijnstijl(
        f'<path d="M10 150C14 94 56 56 100 54C144 56 186 94 190 150Z" fill="{P["diep"]}"/>'
        f'<path d="M44 96L56 90M140 84L152 92M120 66L132 70" fill="none" stroke="{P["accd"]}" stroke-width="4"/>'
        f'<path d="M66 150C66 116 80 96 100 96C120 96 134 116 134 150Z" fill="#2a1a10"/>'
        + kristal(P, 50, 150, 1, -10) + kristal(P, 62, 150, .7, 14) + kristal(P, 150, 150, 1.1, 8) + kristal(P, 138, 150, .65, -16)
        + kristal(P, 100, 150, .75) + f'<circle cx="92" cy="122" r="3" fill="{P["goud"]}" stroke="none"/><circle cx="108" cy="122" r="3" fill="{P["goud"]}" stroke="none"/>')


KONING = 'M-18 0C-18-8-12-12-8-14L-11-34H11L8-14C12-12 18-8 18 0Z'


def koning_stuk(P, x, y, s):
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M-6-56H6M0-63V-48" fill="none" stroke="{L}" stroke-width="9"/>'
            f'<path d="M-6-56H6M0-63V-48" fill="none" stroke="{P["steen"]}" stroke-width="4"/>'
            f'<path d="M-14-34C-17-44-8-49 0-49C8-49 17-44 14-34Z" fill="{P["steen"]}"/><path d="{KONING}" fill="{P["steen"]}"/><path d="M-9-16H9" fill="none" stroke-width="2.5"/></g>')


def cactus(P, x, y, s):
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M-7 0V-56A7 7 0 0 1 7-56V0Z" fill="{P["groen"]}"/>'
            f'<path d="M-7-22H-16A6 6 0 0 1-22-28V-40A5 5 0 0 1-12-40V-32H-7ZM7-30H15V-44A5 5 0 0 1 25-44V-30A8 8 0 0 1 17-22H7Z" fill="{P["groen"]}"/></g>')


def duinen(P):
    return (f'<path d="M0 96C40 80 80 86 120 104S180 106 200 98V200H0Z" fill="{P["ver"]}"/>'
            f'<path d="M0 124C30 112 70 110 104 124S170 132 200 120V200H0Z" fill="{P["mid"]}"/>'
            f'<path d="M120 104C100 112 96 120 104 124" fill="none" stroke="{P["dicht"]}" stroke-width="3"/>')


def m_eindspel(P):
    return lijnstijl(cactus(P, 56, 150, 1.1) + koning_stuk(P, 128, 150, 1.2) + pion(P, 156, 150, .6, kiem=False))


# ---------------------------------------------------------------- per wereld
# (motief, achtergrond van het wapen, zon?)
WAPEN = {
    'weide': (m_weide, heuvels, True),
    'toren': (m_toren, heuvels, True),
    'loper': (m_loper, heuvels, True),
    'dame': (m_dame, heuvels, False),
    'paard': (m_paard, heuvels, True),
    'koning': (m_koning, heuvels, False),
    'pion': (m_pion, heuvels, True),
    'waarde': (m_waarde, vallei, False),
    'aanval': (m_aanval, lambda P: '', True),
    'schaak': (m_schaak, heuvels, False),
    'mat': (m_mat, lambda P: '', True),
    'rokade': (m_rokade, lambda P: '', True),
    'notatie': (m_notatie, lambda P: '', True),
    'tactiek': (m_tactiek, lambda P: '', False),
    'eindspel': (m_eindspel, duinen, True),
}
ZONPLEK = {'toren': (152, 64), 'aanval': (56, 52), 'mat': (56, 56), 'rokade': (66, 58), 'notatie': (66, 56), 'eindspel': (140, 58)}


def wapen(w):
    P = pal(w['toon'])
    motief, achter, metzon = WAPEN[w['id']]
    zx, zy = ZONPLEK.get(w['id'], (146, 60))
    body = (f'<rect width="200" height="200" fill="{P["lucht"]}"/>' + (zon(P, zx, zy) if metzon else '')
            + achter(P) + motief(P) + bord(P))
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-labelledby="t"><title id="t">Wapen van {w["naam"]}</title>'
         f'<defs><clipPath id="c"><circle cx="100" cy="100" r="82"/></clipPath></defs>'
         f'<circle cx="100" cy="100" r="95" fill="{HALO}"/>'
         f'<g clip-path="url(#c)">{body}</g>'
         f'<circle cx="100" cy="100" r="83" fill="none" stroke="{L}" stroke-width="7"/></svg>')
    return s


# ---------------------------------------------------------------- kaartstroken
def plaats(inhoud, x, y, s):
    """Zet een motief (midden 100, grond 150) met zijn voet op (x, y)."""
    return f'<g transform="translate({x - 100 * s:.1f} {y - 150 * s:.1f}) scale({s})">{inhoud}</g>'


def sprietjes(P, xs):
    return f'<path d="{"".join(f"M{x} {y}q4-8 2-14M{x + 6} {y}q0-8 6-12" for x, y in xs)}" fill="none" stroke="{P["diep"]}" stroke-width="3" stroke-linecap="round"/>'


def kaart(w, donker):
    h, i = w['toon'], w['id']
    P = pal(h, donker)
    lucht = f'<rect width="800" height="300" fill="{P["lucht"]}"/>'
    if donker:
        sterren = ''.join(f'<circle cx="{x}" cy="{y}" r="{r}"/>' for x, y, r in
                          ((60, 40, 2), (150, 90, 1.5), (240, 30, 2.2), (330, 70, 1.4), (420, 26, 1.8), (500, 84, 1.5),
                           (560, 36, 2), (730, 50, 1.6), (770, 110, 1.4), (300, 120, 1.2), (90, 130, 1.3)))
        lucht += f'<g fill="#fff3d6" opacity=".8">{sterren}</g>'
        lucht += f'<circle cx="640" cy="70" r="28" fill="{P["zon"]}"/><circle cx="652" cy="62" r="24" fill="{P["lucht"]}"/>'
    else:
        lucht += (f'<circle cx="640" cy="70" r="46" fill="{P["zon"]}" opacity=".25"/><circle cx="640" cy="70" r="34" fill="{P["zon"]}"/>'
                  + wolk(P, 'translate(110 60)') + wolk(P, 'translate(196 34) scale(.55)'))
    # verre rand: heuvels, bergen of duinen
    if i == 'aanval':
        ver = f'<path d="M0 150L70 96L120 140L190 70L250 140C330 156 470 156 550 140L610 116L680 80L760 140L800 150V300H0Z" fill="{P["ver"]}"/>'
        ver += f'<path d="M190 70L176 92L188 88L196 98L206 86ZM680 80L666 102L678 98L686 108L696 96Z" fill="{P["steen"]}" opacity=".9"/>'
    elif i == 'tactiek':
        ver = f'<path d="M0 140L50 120L110 130L160 96L240 140C330 152 470 152 560 140L640 100L720 120L800 140V300H0Z" fill="{P["ver"]}"/>'
    else:
        ver = f'<path d="M0 136C90 108 190 112 290 130S510 132 590 122 730 104 800 136V300H0Z" fill="{P["ver"]}"/>'
    water = ''
    if i in ('schaak', 'rokade', 'notatie', 'mat'):
        water = (f'<path d="M0 176H800V230H0Z" fill="{P["water"]}"/>'
                 f'<path d="M120 192q10-6 20 0t20 0M176 204q10-6 20 0t20 0M600 200q10-6 20 0t20 0M680 186q10-6 20 0t20 0" fill="none" stroke="{P["waterl"]}" stroke-width="3" stroke-linecap="round"/>')
    mid = f'<path d="M0 196C110 176 230 178 340 192S560 186 660 184 760 180 800 196V300H0Z" fill="{P["mid"]}"/>'
    if i == 'eindspel':
        mid = f'<path d="M0 192C120 166 220 168 300 186S600 172 700 182 770 180 800 192V300H0Z" fill="{P["mid"]}"/>'
    dicht = f'<path d="M0 242C130 226 260 230 400 242S640 234 800 242V300H0Z" fill="{P["dicht"]}"/>'
    voor = f'<path d="M0 280C200 268 600 270 800 280V300H0Z" fill="{P["diep"]}"/>'
    vakje = f'<g transform="translate(196 250) scale(1 .42) rotate(45)" opacity=".5"><rect x="-30" y="-30" width="60" height="60" fill="{P["steen"]}"/><path d="M-30-30h20v20h-20zM10-30h20v20H10zM-10-10h20v20h-20zM-30 10h20v20h-20zM10 10h20v20H10z" fill="{P["accd"]}"/></g>'

    links, rechts = RAND[i](P)
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" role="img" aria-labelledby="t">'
         f'<title id="t">Landschap van {w["naam"]}{" in de schemering" if donker else ""}</title>'
         + lucht + ver + water + mid + vakje + dicht + links + rechts + sprietjes(P, ((186, 258), (226, 264), (580, 250), (614, 256))) + voor + '</svg>')
    return s


def rand_weide(P):
    bl = lambda x, y: f'<g transform="translate({x} {y})"><path d="M0 0V-14" stroke="{P["groen"]}" stroke-width="3"/><circle cy="-16" r="6" fill="#ef7d8f" stroke="{L}" stroke-width="1.8"/></g>'
    return (plaats(m_weide(P), 70, 270, .8) + bl(170, 250) + bl(228, 262),
            plaats(m_weide(P), 730, 268, .7) + bl(610, 246))


def eenvoudig(motief, sl=.95, sr=.7, extra=lambda P: ('', '')):
    def f(P):
        el, er = extra(P)
        return (plaats(motief(P), 100, 262, sl) + el, plaats(motief(P), 710, 250, sr) + er)
    return f


RAND = {
    'weide': rand_weide,
    'toren': eenvoudig(m_toren),
    'loper': lambda P: (lijnstijl(den(P, 40, 268, 1, P['accd']) + den(P, 100, 264, 1.25, P['acc']) + den(P, 160, 270, .8, P['accd'])),
                        lijnstijl(den(P, 650, 256, .8, P['acc']) + den(P, 710, 258, 1.1, P['accd']) + den(P, 765, 262, .9, P['acc']))),
    'dame': eenvoudig(m_dame),
    'paard': eenvoudig(m_paard, .9, .65),
    'koning': eenvoudig(m_koning),
    'pion': lambda P: (lijnstijl(pion(P, 60, 268, 1) + pion(P, 110, 270, 1.3) + kiem(P, 170, 262) + kiem(P, 222, 262, .8)),
                       lijnstijl(pion(P, 690, 258, 1.1) + pion(P, 745, 262, .9) + kiem(P, 630, 252) + kiem(P, 584, 256, .8))),
    'waarde': eenvoudig(m_waarde, .9, .6),
    'aanval': lambda P: (plaats(m_aanval(P), 100, 268, .9), plaats(m_aanval(P), 720, 256, .6)),
    'schaak': lambda P: (lijnstijl(bliksem(P, 'translate(80 40) scale(1.1)'), 3) + plaats(lijnstijl(
        ''.join(f'<path d="M{x} 150V{y}" fill="none" stroke="{P["groen"]}" stroke-width="3"/><rect x="{x - 3}" y="{y}" width="6" height="12" rx="3" fill="{P["hout"]}" stroke-width="2"/>' for x, y in ((80, 116), (90, 106), (100, 120), (112, 110)))), 100, 268, 1.2),
                         plaats(lijnstijl(''.join(f'<path d="M{x} 150V{y}" fill="none" stroke="{P["groen"]}" stroke-width="3"/><rect x="{x - 3}" y="{y}" width="6" height="12" rx="3" fill="{P["hout"]}" stroke-width="2"/>' for x, y in ((80, 116), (92, 108), (104, 118)))), 720, 262, 1.1)),
    'mat': lambda P: (plaats(lijnstijl(f'<path d="M40 150L52 118L46 104L62 88L110 86L130 100L150 150Z" fill="{P["diep"]}"/>'), 90, 264, 1),
                      plaats(m_mat(P).replace(f'<path d="M0 124H90V200H0Z" fill="{P["water"]}" stroke="none"/>', ''), 690, 270, 1.15)),
    'rokade': lambda P: (plaats(m_rokade(P).replace(f'<path d="M0 118H200V200H0Z" fill="{P["water"]}" stroke="none"/>', ''), 110, 262, 1),
                         plaats(lijnstijl(f'<path d="M72 120H118L110 132H80Z" fill="{P["hout"]}"/><path d="M94 118V82L116 116Z" fill="{P["steen"]}"/><path d="M94 82L82 90L94 96" fill="{P["acc"]}"/>'), 700, 222, .9)),
    'notatie': lambda P: (plaats(lijnstijl(f'<path d="M34 150C50 116 150 116 166 150Z" fill="#ead39c"/>' + palm(P, 70, 132, 1) + palm(P, 120, 136, .7)), 110, 262, 1),
                          plaats(lijnstijl(f'<path d="M50 150C60 124 140 124 150 150Z" fill="#ead39c"/>' + potlood(P, 'translate(104 138) rotate(14)')), 710, 256, .9)),
    'tactiek': lambda P: (plaats(m_tactiek(P), 100, 268, .9), lijnstijl(kristal(P, 680, 252, 1.1, -8) + kristal(P, 702, 254, .8, 12) + kristal(P, 750, 258, 1, 4))),
    'eindspel': lambda P: (lijnstijl(cactus(P, 70, 266, 1.2) + cactus(P, 150, 262, .7)),
                           lijnstijl(koning_stuk(P, 700, 256, 1.3) + pion(P, 740, 258, .7, kiem=False) + cactus(P, 640, 248, .6))),
}


if __name__ == '__main__':
    for d in ('werelden', 'kaart'):
        os.makedirs(os.path.join(OUT, d), exist_ok=True)
    ws = werelden()
    assert len(ws) == 15, len(ws)
    for w in ws:
        open(os.path.join(OUT, 'werelden', f'wereld-{w["id"]}.svg'), 'w').write(wapen(w))
        open(os.path.join(OUT, 'kaart', f'kaart-{w["id"]}.svg'), 'w').write(kaart(w, False))
        open(os.path.join(OUT, 'kaart', f'kaart-{w["id"]}-donker.svg'), 'w').write(kaart(w, True))
    print(len(ws), 'werelden getekend in', os.path.normpath(OUT))
