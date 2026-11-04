"""Create the compact web fonts in src/assets/fonts/.

Requires fontTools and brotli (pip install fonttools brotli). The normal site
build does not need them; run this script only after changing fonts or adding
text whose characters fall outside the subset (src/build.py warns about that).

Pretendard (OFL-1.1) is downloaded from the npm registry. The subset keeps:
- the 2,350 common Hangul syllables of KS X 1001, plus every Hangul syllable
  currently used by the site, so new Korean text usually needs no rebuild;
- Basic Latin, Latin-1, Vietnamese letters and common punctuation/symbols.
The weight axis is limited to the 300-700 range that the stylesheets use.
Playfair Display is reduced to Latin and Vietnamese when its original is present.
"""
import io
import tarfile
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

root = Path(__file__).resolve().parent.parent
fonts = root / 'src' / 'assets' / 'fonts'
PRETENDARD = 'https://registry.npmjs.org/pretendard/-/pretendard-1.3.9.tgz'
MEMBER = 'package/dist/web/variable/woff2/PretendardVariable.woff2'
LICENSE = 'package/dist/LICENSE.txt'


def ks_x_1001_hangul():
    chars = []
    for lead in range(0xB0, 0xC9):
        for trail in range(0xA1, 0xFF):
            try:
                chars.append(bytes((lead, trail)).decode('euc-kr'))
            except UnicodeDecodeError:
                pass
    return {c for c in chars if '가' <= c <= '힣'}


def site_text():
    parts = []
    for path in (root / 'src').rglob('*'):
        if path.suffix in {'.html', '.js', '.json', '.py'}:
            parts.append(path.read_text(encoding='utf-8'))
    return ''.join(parts)


def latin_and_vietnamese():
    chars = {chr(c) for c in range(0x20, 0x7F)}
    chars |= {chr(c) for c in range(0xA0, 0x100)}
    chars |= {chr(c) for c in range(0x1EA0, 0x1F00)}  # Vietnamese precomposed
    chars |= set('ĂăĐđĨĩŨũƠơƯư')
    chars |= {chr(c) for c in range(0x0300, 0x0310)} | {'̣'}
    chars |= set('‐‑–—‘’‚“”„•…‹›€₫₩→←↑↓↗↘·×÷')
    return chars


def save(font, name, chars):
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = ['*']
    options.name_IDs = ['*']
    options.notdef_outline = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=''.join(sorted(chars)))
    subsetter.subset(font)
    font.flavor = 'woff2'
    target = fonts / name
    font.save(target)
    print(f'{name}: {target.stat().st_size // 1024} KB')


def main():
    text = site_text()
    used_hangul = {c for c in text if '가' <= c <= '힣'}
    with urllib.request.urlopen(PRETENDARD) as response:
        archive = tarfile.open(fileobj=io.BytesIO(response.read()), mode='r:gz')
    source = TTFont(io.BytesIO(archive.extractfile(MEMBER).read()), lazy=False)
    (fonts / 'Pretendard-OFL.txt').write_bytes(archive.extractfile(LICENSE).read())
    source = instancer.instantiateVariableFont(source, {'wght': (300, 700)})
    buffer = io.BytesIO()
    source.save(buffer)
    source = TTFont(io.BytesIO(buffer.getvalue()), lazy=False)
    symbols = {c for c in text if not c.isspace() and ord(c) < 0x3000 and not '가' <= c <= '힣'}
    hangul = ks_x_1001_hangul() | used_hangul
    save(source, 'Pretendard-subset.woff2', hangul | latin_and_vietnamese() | symbols)
    charset = root / 'src' / 'font-hangul.txt'
    charset.write_text(''.join(sorted(hangul)) + '\n', encoding='utf-8')
    print(f'{charset.relative_to(root)}: {len(hangul)} Hangul syllables')

    # The full Playfair Display file was removed after its first subset; re-run
    # only when a new original is placed at assets/fonts/Playfair-Display.woff2.
    playfair = fonts / 'Playfair-Display.woff2'
    if playfair.exists():
        save(TTFont(playfair), 'Playfair-Display-subset.woff2', latin_and_vietnamese())
        playfair.unlink()


if __name__ == '__main__':
    main()
