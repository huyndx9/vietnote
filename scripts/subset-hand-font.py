"""Make a small Nanum Pen Script file holding only the handwritten notes' characters.

The handwriting font is used for a few short notes (class "hand", "hero-hand",
"footer-hand"). Its Fontsource package is split into ~90 unicode-range slices,
and a short Korean phrase touches many of them, so a page would download about
200 KB. This script merges the slices and keeps just the characters the notes
use (plus Latin, digits and punctuation), giving one file of a few KB.

Needs npm and `pip install fonttools brotli`; the normal build does not.
Run it after `python3 src/build.py` whenever a handwritten note changes:

    python3 src/build.py && python3 scripts/subset-hand-font.py && python3 src/build.py

The build warns when a note uses a character missing from src/font-hand.txt.
"""
import html
import json
import re
import subprocess
import tarfile
import tempfile
from pathlib import Path

from fontTools import subset
from fontTools.merge import Merger
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent.parent
PACKAGE = '@fontsource/nanum-pen-script@5.3.0'
TARGET = root / 'src' / 'assets' / 'fonts' / 'nanum-pen-script'
POOL = re.compile(r'<script type="application/json" id="routePool">(.*?)</script>', re.S)
NOTE = re.compile(r'<(\w+)[^>]*class="[^"]*\b(?:hand|hero-hand|footer-hand)\b[^"]*"[^>]*>(.*?)</\1>', re.S)


def note_text():
    text = ''
    for page in (root / 'dist').rglob('*.html'):
        for _, inner in NOTE.findall(page.read_text(encoding='utf-8')):
            text += html.unescape(re.sub(r'<[^>]+>', '', inner))
        # Route notes swapped in by pages.js write their city in the same hand.
        for pool in POOL.findall(page.read_text(encoding='utf-8')):
            text += ''.join(r['city'] for r in json.loads(pool))
    if not text:
        raise SystemExit('no handwritten notes found - run python3 src/build.py first')
    return text


def main():
    chars = set(note_text()) | {chr(c) for c in range(0x20, 0x7F)} | set('·…“”‘’')
    with tempfile.TemporaryDirectory() as tmp:
        tgz = subprocess.run(['npm', 'pack', PACKAGE, '--silent'], cwd=tmp, check=True,
                             capture_output=True, text=True).stdout.strip().splitlines()[-1]
        with tarfile.open(Path(tmp) / tgz) as archive:
            archive.extractall(tmp, filter='data')
        files = Path(tmp) / 'package' / 'files'
        # Only the slices that contain a needed character have to be merged.
        wanted = []
        for woff2 in sorted(files.glob('*-400-normal.woff2')):
            font = TTFont(woff2)
            if chars & {chr(c) for c in font.getBestCmap()}:
                ttf = Path(tmp) / (woff2.stem + '.ttf')
                font.flavor = None
                font.save(ttf)
                wanted.append(str(ttf))
        merged = Merger().merge(wanted) if len(wanted) > 1 else TTFont(wanted[0])
        options = subset.Options()
        options.flavor = 'woff2'
        options.layout_features = ['*']
        options.name_IDs = ['*']
        options.notdef_outline = True
        subsetter = subset.Subsetter(options)
        subsetter.populate(text=''.join(sorted(chars)))
        subsetter.subset(merged)
        merged.flavor = 'woff2'
        for old in TARGET.glob('*.woff2'):
            old.unlink()
        out = TARGET / 'NanumPenScript-subset.woff2'
        merged.save(out)
        covered = ''.join(sorted(chr(c) for c in merged.getBestCmap()))
    (root / 'src' / 'font-hand.txt').write_text(covered + '\n', encoding='utf-8')
    print(f'{out.relative_to(root)}: {out.stat().st_size // 1024} KB, {len(covered)} characters')


if __name__ == '__main__':
    main()
