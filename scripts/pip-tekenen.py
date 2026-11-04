import os
OUT='/home/user/Schaakpaardje/public/illustraties/proef'
K=dict(halo='#fff8ec',lijn='#3b2414',vacht='#e8923a',snuit='#f8cd96',manen='#5b3418',oorbinnen='#f4a77c',gras='#4e7a54',grasl='#79a671',wang='#f07a5c')

EARS={
 'normaal':('M94 58C86 36 92 18 104 8C116 20 122 38 117 56Z','M120 54C119 32 128 16 142 10C149 26 147 44 138 60Z'),
 'op':('M93 58C83 34 86 14 96 2C110 14 120 34 117 56Z','M120 54C122 30 134 12 150 6C155 24 150 44 138 60Z'),
 'denk':('M94 58C86 36 92 18 104 8C116 20 122 38 117 56Z','M122 56C130 38 146 28 164 28C162 44 152 56 138 62Z'),
 'voor':('M94 58C82 40 80 20 88 6C102 16 116 34 117 56Z','M120 54C117 32 124 14 136 6C146 22 146 42 138 60Z'),
}
def inner(ear):
    return {'normaal':('M100 52C96 38 99 26 104 18C110 26 113 38 111 50Z','M125 52C126 36 131 26 138 20C141 32 139 44 134 54Z'),
            'op':('M99 52C93 36 94 22 97 14C105 24 112 38 111 50Z','M125 52C128 34 136 22 146 16C147 30 143 44 134 54Z'),
            'denk':('M100 52C96 38 99 26 104 18C110 26 113 38 111 50Z','M128 54C135 42 145 36 156 34C152 44 145 52 136 56Z'),
            'voor':('M99 52C92 40 91 26 93 16C102 24 110 36 111 50Z','M125 52C124 36 128 24 134 16C139 28 139 42 134 54Z')}[ear]

NEK='M84 120C78 145 70 165 66 184L168 184C168 150 160 115 146 96Z'
MANEN='M100 46C128 28 160 36 168 62C180 74 180 96 172 106C184 120 184 140 176 150C186 162 186 178 180 186L150 186C152 150 146 120 132 96Z'
KUIF='M106 48C97 48 90 53 86 60C94 58 100 59 105 60C106 65 111 67 117 66C115 59 117 53 122 48Z'
HOOFD='<ellipse cx="112" cy="86" rx="48" ry="44"/>'
SNUIT='<ellipse cx="66" cy="117" rx="37" ry="28" transform="rotate(-16 66 117)"/>'

def pip(naam,titel,ear,face,rot,extra='',move=''):
    e1,e2=EARS[ear]; i1,i2=inner(ear)
    sil=f'<path d="{e1}"/><path d="{e2}"/><path d="{NEK}"/><path d="{MANEN}"/>{HOOFD}{SNUIT}'
    s=f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 200" role="img" aria-labelledby="t"><title id="t">{titel}</title>
<defs><g id="s">{sil}</g></defs>
<g stroke-linejoin="round" stroke-linecap="round">
<g transform="{move}rotate({rot} 116 182)">
<use href="#s" xlink:href="#s" fill="{K['halo']}" stroke="{K['halo']}" stroke-width="22"/>
<use href="#s" xlink:href="#s" fill="{K['lijn']}" stroke="{K['lijn']}" stroke-width="11"/>
<g fill="{K['vacht']}"><path d="{e1}"/><path d="{e2}"/><path d="{NEK}"/></g>
<g fill="{K['oorbinnen']}"><path d="{i1}"/><path d="{i2}"/></g>
<path d="{MANEN}" fill="{K['manen']}"/>
<g fill="{K['vacht']}">{HOOFD}{SNUIT}</g>
<path d="M150 120C146 140 150 162 156 184" fill="none" stroke="{K['lijn']}" stroke-width="4" opacity=".35"/>
<ellipse cx="57" cy="121" rx="27" ry="20" transform="rotate(-16 57 121)" fill="{K['snuit']}"/>
<path d="{KUIF}" fill="{K['manen']}"/>
<ellipse cx="40" cy="110" rx="4.5" ry="6" transform="rotate(-30 40 110)" fill="{K['lijn']}"/>
<ellipse cx="120" cy="110" rx="11" ry="7" fill="{K['wang']}" opacity=".5"/>
{face}
</g>
<rect x="46" y="174" width="140" height="20" rx="10" fill="{K['gras']}" stroke="{K['halo']}" stroke-width="20" paint-order="stroke"/>
<rect x="46" y="174" width="140" height="20" rx="10" fill="{K['gras']}" stroke="{K['lijn']}" stroke-width="7"/>
<path d="M58 180H174" stroke="{K['grasl']}" stroke-width="4"/>
{extra}
</g></svg>'''
    s='\n'.join(l.strip() for l in s.splitlines())
    open(f'{OUT}/{naam}.svg','w').write(s)

L=K['lijn']
HART=('<path d="M32 64C20 52 18 40 28 36C34 34 38 38 40 42C42 38 46 34 52 36C62 40 60 52 48 64L40 72Z" fill="#ef7d8f" stroke="#fff8ec" stroke-width="12" style="paint-order:stroke"/>'
 '<path d="M32 64C20 52 18 40 28 36C34 34 38 38 40 42C42 38 46 34 52 36C62 40 60 52 48 64L40 72Z" fill="#ef7d8f" stroke="#3b2414" stroke-width="4"/>')
HOEF=('<g transform="rotate(-38 70 176)"><rect x="56" y="104" width="30" height="78" rx="15" fill="#fff8ec" stroke="#fff8ec" stroke-width="20"/>'
 '<rect x="56" y="104" width="30" height="78" rx="15" fill="#e8923a" stroke="#3b2414" stroke-width="7"/>'
 '<path d="M56 122V119A15 15 0 0 1 86 119V122Z" fill="#5b3418" stroke="#3b2414" stroke-width="7"/></g>')
import math
def pts(x,y,r): return 'M'+' '.join(f'{x+(r if i%2==0 else r*.45)*math.sin(i*math.pi/5):.1f} {y-(r if i%2==0 else r*.45)*math.cos(i*math.pi/5):.1f}' for i in range(10))+'Z'
def halo_ster(x,y,r): return f'<path d="{pts(x,y,r)}" fill="#fff8ec" stroke="#fff8ec" stroke-width="12"/>'
oog=lambda x=103,y=88,rx=9,ry=11: f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{L}"/><circle cx="{x-3}" cy="{y-4}" r="3.6" fill="#fff"/>'
brauw=lambda d: f'<path d="{d}" fill="none" stroke="{L}" stroke-width="5"/>'
lach=lambda d,w=5: f'<path d="{d}" fill="none" stroke="{L}" stroke-width="{w}"/>'
open_mond='<path d="M38 128Q54 154 78 131Q58 136 38 128Z" fill="#6b2a17" stroke="#3b2414" stroke-width="4"/><path d="M50 140Q60 146 68 138Q60 135 50 140Z" fill="#f07a6a"/>'
ster=lambda x,y,r,f='#f0b429': halo_ster(x,y,r)+'<path d="'+'M'+' '.join(f'{x+ (r if i%2==0 else r*.45)*__import__("math").sin(i*3.14159/5):.1f} {y-(r if i%2==0 else r*.45)*__import__("math").cos(i*3.14159/5):.1f}' for i in range(10))+f'Z" fill="{f}" stroke="{L}" stroke-width="4" style="paint-order:stroke"/>'

pip('pip-blij','Pip is blij','normaal', oog()+lach('M42 129Q56 141 74 132'), 0)
pip('pip-juicht','Pip juicht','op', lach('M92 92Q103 76 114 92',6)+brauw('M92 66Q103 59 114 65')+open_mond, -9,
    ster(26,62,11)+ster(52,34,7)+ster(176,22,8), '')
pip('pip-trots','Pip is trots','normaal',
    f'<path d="M93 90Q103 99 114 90" fill="none" stroke="{L}" stroke-width="6"/><path d="M93 90L89 86M114 90L118 86" stroke="{L}" stroke-width="3.5"/>'
    +brauw('M93 74Q103 70 114 75')+lach('M40 126Q56 144 76 130',6), -6,
    ster(108,154,15))
pip('pip-denkt','Pip denkt na','denk',
    oog(101,84,8,10)+brauw('M91 64Q101 56 112 64')+lach('M46 134Q53 130 60 134T72 133',4.5), 7,
    f'<g fill="#fff8ec" stroke="{L}" stroke-width="3.5"><circle cx="22" cy="58" r="5"/><circle cx="38" cy="46" r="6.5"/><circle cx="58" cy="34" r="8"/></g>')
pip('pip-moedigt','Pip moedigt je aan','voor',
    oog(104,88,9,11)+brauw('M92 70Q102 62 113 68')+'<path d="M40 127Q56 146 76 131Q58 134 40 127Z" fill="#6b2a17" stroke="#3b2414" stroke-width="4"/>', 6,
    HART)
pip('pip-verrast','Pip is verrast','op',
    f'<circle cx="104" cy="86" r="14" fill="#fff" stroke="{L}" stroke-width="4"/><circle cx="101" cy="87" r="6.5" fill="{L}"/><circle cx="99" cy="84" r="2.2" fill="#fff"/>'
    +brauw('M88 62Q103 48 118 60')+f'<ellipse cx="56" cy="134" rx="7" ry="9" fill="#6b2a17" stroke="{L}" stroke-width="4"/>', -4,
    '', 'translate(3 -4) ')
