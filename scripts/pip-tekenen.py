"""Pip het schaakpaardje, in zeven stemmingen.

Schrijft naar public/illustraties/pip/:
  pip-<stemming>.svg       Pip op zijn voetstukje (200x200), voor de grote plekken.
  pip-knop-<stemming>.svg  Strak bijgesneden kop zonder voetstuk, rond afgesneden,
                           zodat het gezicht een ronde knop helemaal vult.

Draaien: python3 scripts/pip-tekenen.py
"""
import math
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'illustraties', 'pip')
K = dict(halo='#fff8ec', lijn='#3b2414', vacht='#e8923a', snuit='#f8cd96', manen='#5b3418',
         oorbinnen='#f4a77c', gras='#4e7a54', grasl='#79a671', wang='#f07a5c')
L = K['lijn']

EARS = {
    'normaal': ('M94 58C86 36 92 18 104 8C116 20 122 38 117 56Z', 'M120 54C119 32 128 16 142 10C149 26 147 44 138 60Z'),
    'op': ('M93 58C83 34 86 14 96 2C110 14 120 34 117 56Z', 'M120 54C122 30 134 12 150 6C155 24 150 44 138 60Z'),
    'denk': ('M94 58C86 36 92 18 104 8C116 20 122 38 117 56Z', 'M122 56C130 38 146 28 164 28C162 44 152 56 138 62Z'),
    'voor': ('M94 58C82 40 80 20 88 6C102 16 116 34 117 56Z', 'M120 54C117 32 124 14 136 6C146 22 146 42 138 60Z'),
    # slaapt: beide oren slap naar achteren
    'slap': ('M96 58C96 40 106 26 120 20C126 34 124 46 117 58Z', 'M122 56C132 42 148 36 166 38C162 52 152 60 138 64Z'),
}
INNER = {
    'normaal': ('M100 52C96 38 99 26 104 18C110 26 113 38 111 50Z', 'M125 52C126 36 131 26 138 20C141 32 139 44 134 54Z'),
    'op': ('M99 52C93 36 94 22 97 14C105 24 112 38 111 50Z', 'M125 52C128 34 136 22 146 16C147 30 143 44 134 54Z'),
    'denk': ('M100 52C96 38 99 26 104 18C110 26 113 38 111 50Z', 'M128 54C135 42 145 36 156 34C152 44 145 52 136 56Z'),
    'voor': ('M99 52C92 40 91 26 93 16C102 24 110 36 111 50Z', 'M125 52C124 36 128 24 134 16C139 28 139 42 134 54Z'),
    'slap': ('M102 54C102 42 108 32 117 27C119 36 117 46 113 54Z', 'M128 56C136 46 147 42 158 43C154 52 146 57 136 59Z'),
}

NEK = 'M84 120C78 145 70 165 66 184L168 184C168 150 160 115 146 96Z'
MANEN = 'M100 46C128 28 160 36 168 62C180 74 180 96 172 106C184 120 184 140 176 150C186 162 186 178 180 186L150 186C152 150 146 120 132 96Z'
KUIF = 'M106 48C97 48 90 53 86 60C94 58 100 59 105 60C106 65 111 67 117 66C115 59 117 53 122 48Z'
HOOFD = '<ellipse cx="112" cy="86" rx="48" ry="44"/>'
SNUIT = '<ellipse cx="66" cy="117" rx="37" ry="28" transform="rotate(-16 66 117)"/>'


def pip(stemming, titel, ear, face, rot, extra='', move='', knop_extra=None, knop_move=''):
    """knop_extra: wat er in de knopversie bij komt (None = hetzelfde als extra)."""
    e1, e2 = EARS[ear]
    i1, i2 = INNER[ear]
    sil = f'<path d="{e1}"/><path d="{e2}"/><path d="{NEK}"/><path d="{MANEN}"/>{HOOFD}{SNUIT}'
    kop = f'''<g transform="{move}rotate({rot} 116 182)">
<use href="#s" fill="{K['halo']}" stroke="{K['halo']}" stroke-width="22"/>
<use href="#s" fill="{L}" stroke="{L}" stroke-width="11"/>
<g fill="{K['vacht']}"><path d="{e1}"/><path d="{e2}"/><path d="{NEK}"/></g>
<g fill="{K['oorbinnen']}"><path d="{i1}"/><path d="{i2}"/></g>
<path d="{MANEN}" fill="{K['manen']}"/>
<g fill="{K['vacht']}">{HOOFD}{SNUIT}</g>
<path d="M150 120C146 140 150 162 156 184" fill="none" stroke="{L}" stroke-width="4" opacity=".35"/>
<ellipse cx="57" cy="121" rx="27" ry="20" transform="rotate(-16 57 121)" fill="{K['snuit']}"/>
<path d="{KUIF}" fill="{K['manen']}"/>
<ellipse cx="40" cy="110" rx="4.5" ry="6" transform="rotate(-30 40 110)" fill="{L}"/>
<ellipse cx="120" cy="110" rx="11" ry="7" fill="{K['wang']}" opacity=".5"/>
{face}
</g>'''
    voet = f'''<rect x="46" y="174" width="140" height="20" rx="10" fill="{K['gras']}" stroke="{K['halo']}" stroke-width="20" paint-order="stroke"/>
<rect x="46" y="174" width="140" height="20" rx="10" fill="{K['gras']}" stroke="{L}" stroke-width="7"/>
<path d="M58 180H174" stroke="{K['grasl']}" stroke-width="4"/>'''

    def schrijf(naam, viewbox, body, titelextra=''):
        s = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" role="img" aria-labelledby="t"><title id="t">{titel}{titelextra}</title>
<defs><g id="s">{sil}</g>{'' if 'clip-path' not in body else '<clipPath id="k"><circle cx="103" cy="84" r="94"/></clipPath>'}</defs>
<g stroke-linejoin="round" stroke-linecap="round">
{body}
</g></svg>'''
        s = '\n'.join(l.strip() for l in s.splitlines())
        open(os.path.join(OUT, naam + '.svg'), 'w').write(s)

    schrijf(f'pip-{stemming}', '0 0 200 200', kop + voet + extra)
    # Knop: kop iets groter, rond afgesneden op de knop; het voetstuk valt weg.
    ke = extra if knop_extra is None else knop_extra
    schrijf(f'pip-knop-{stemming}', '9 -10 188 188',
            f'<g clip-path="url(#k)"><g transform="{knop_move or "translate(0 0)"}">{kop}</g></g>{ke}')


def pts(x, y, r):
    return 'M' + ' '.join(
        f'{x + (r if i % 2 == 0 else r * .45) * math.sin(i * math.pi / 5):.1f} {y - (r if i % 2 == 0 else r * .45) * math.cos(i * math.pi / 5):.1f}'
        for i in range(10)) + 'Z'


def ster(x, y, r, f='#f0b429'):
    return (f'<path d="{pts(x, y, r)}" fill="{K["halo"]}" stroke="{K["halo"]}" stroke-width="12"/>'
            f'<path d="{pts(x, y, r)}" fill="{f}" stroke="{L}" stroke-width="4" style="paint-order:stroke"/>')


def hart(x, y, s):
    d = 'M-8 14C-20 2-22-10-12-14C-6-16-2-12 0-8C2-12 6-16 12-14C22-10 20 2 8 14L0 22Z'
    return (f'<g transform="translate({x} {y}) scale({s}) rotate(-12)">'
            f'<path d="{d}" fill="#ef7d8f" stroke="{K["halo"]}" stroke-width="12"/>'
            f'<path d="{d}" fill="#ef7d8f" stroke="{L}" stroke-width="4"/>'
            f'<path d="M-12-6Q-12-10-8-10" fill="none" stroke="#fff" stroke-width="3"/></g>')


def zet(x, y, s):
    """Een getekende Z (geen lettertype nodig)."""
    d = f'M{x} {y}h{s}l-{s} {s}h{s}'
    return (f'<path d="{d}" fill="none" stroke="{K["halo"]}" stroke-width="{s * .55 + 8:.1f}"/>'
            f'<path d="{d}" fill="none" stroke="#6a7fb5" stroke-width="{s * .3 + 1:.1f}"/>')


def oog(x=103, y=88, rx=9, ry=11):
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{L}"/><circle cx="{x - 3}" cy="{y - 4}" r="3.6" fill="#fff"/>'


def lijn(d, w=5):
    return f'<path d="{d}" fill="none" stroke="{L}" stroke-width="{w}"/>'


OPEN_MOND = ('<path d="M38 128Q54 154 78 131Q58 136 38 128Z" fill="#6b2a17" stroke="#3b2414" stroke-width="4"/>'
             '<path d="M50 140Q60 146 68 138Q60 135 50 140Z" fill="#f07a6a"/>')
GROTE_LACH = ('<path d="M36 126Q52 158 82 130Q60 138 36 126Z" fill="#6b2a17" stroke="#3b2414" stroke-width="4"/>'
              '<path d="M40 128Q60 136 80 131L78 135Q60 140 42 132Z" fill="#fff"/>'
              '<path d="M52 144Q62 150 70 141Q61 139 52 144Z" fill="#f07a6a"/>')
DENKBELLEN = (f'<g fill="#fff8ec" stroke="{L}" stroke-width="3.5"><circle cx="22" cy="58" r="5"/>'
              f'<circle cx="38" cy="46" r="6.5"/><circle cx="58" cy="34" r="8"/></g>')

os.makedirs(OUT, exist_ok=True)

# Blij: rustig, recht, open oog, kleine glimlach. Geen wenkbrauw, geen versiering.
pip('blij', 'Pip is blij', 'normaal', oog() + lijn('M42 129Q56 141 74 132'), 0)

pip('juicht', 'Pip juicht', 'op',
    lijn('M92 92Q103 76 114 92', 6) + lijn('M92 66Q103 59 114 65') + OPEN_MOND, -9,
    ster(26, 62, 11) + ster(52, 34, 7) + ster(176, 22, 8),
    knop_extra=ster(34, 40, 10) + ster(172, 22, 8), knop_move='translate(7 -3)')

pip('trots', 'Pip is trots', 'normaal',
    f'<path d="M93 90Q103 99 114 90" fill="none" stroke="{L}" stroke-width="6"/><path d="M93 90L89 86M114 90L118 86" stroke="{L}" stroke-width="3.5"/>'
    + lijn('M93 74Q103 70 114 75') + lijn('M40 126Q56 144 76 130', 6), -6,
    ster(108, 154, 15))

pip('denkt', 'Pip denkt na', 'denk',
    oog(101, 84, 8, 10) + lijn('M91 64Q101 56 112 64') + lijn('M46 134Q53 130 60 134T72 133', 4.5), 7,
    DENKBELLEN,
    knop_extra=f'<g fill="#fff8ec" stroke="{L}" stroke-width="3.5"><circle cx="26" cy="52" r="5"/><circle cx="40" cy="38" r="6.5"/><circle cx="58" cy="24" r="8"/></g>')

# Moedigt: kop naar voren gebogen (naar het kind toe), opgetrokken wenkbrauw,
# grote lach met tandjes, en een groot hartje.
pip('moedigt', 'Pip moedigt je aan', 'voor',
    oog(104, 90, 9.5, 11.5) + lijn('M90 66Q100 50 116 60', 6) + GROTE_LACH, -10,
    hart(28, 38, 1.3), move='translate(-2 4) ',
    knop_extra=hart(40, 28, 1.05), knop_move='translate(12 -8)')

pip('verrast', 'Pip is verrast', 'op',
    f'<circle cx="104" cy="86" r="14" fill="#fff" stroke="{L}" stroke-width="4"/><circle cx="101" cy="87" r="6.5" fill="{L}"/><circle cx="99" cy="84" r="2.2" fill="#fff"/>'
    + lijn('M88 62Q103 48 118 60') + f'<ellipse cx="56" cy="134" rx="7" ry="9" fill="#6b2a17" stroke="{L}" stroke-width="4"/>', -4,
    '', 'translate(3 -4) ')

# Slaapt: kop zakt een beetje, oog dicht (boogje naar beneden), slappe oren, zzz.
pip('slaapt', 'Pip slaapt', 'slap',
    lijn('M93 88Q103 96 114 88', 5.5) + lijn('M92 90L88 94M100 93L99 98M108 93L110 97', 3)
    + lijn('M46 132Q56 136 66 132', 4.5), -7,
    zet(20, 58, 12) + zet(40, 34, 16) + zet(66, 6, 20),
    move='translate(0 4) ',
    knop_extra=zet(26, 52, 11) + zet(42, 28, 14) + zet(64, 0, 17))

print('Pip getekend in', os.path.normpath(OUT))
