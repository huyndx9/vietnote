"""Create responsive WebP copies of the photographs listed in src/content/photos.json.

Requires Pillow (pip install pillow); the normal site build does not. Sources
live in src/photos/<stem>.(jpg|webp|png) and are not deployed. Output goes to
src/assets/<stem>-<width>.webp for every width in the photo's "widths" list,
plus a 1200x630 JPEG share image in src/assets/og/<stem>.jpg (Open Graph and
Twitter cards; JPEG because not every link preview reads WebP).

Usage: python3 scripts/optimize-images.py [stem ...]
Without arguments every photo is (re)generated; existing files are skipped
unless --force is given.
"""
import json
import sys
from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parent.parent
photos = json.loads((root / 'src' / 'content' / 'photos.json').read_text(encoding='utf-8'))['photos']
args = [a for a in sys.argv[1:] if not a.startswith('--')]
force = '--force' in sys.argv

OG_SIZE = (1200, 630)


def focus(position):
    """Horizontal and vertical focus (0-1) from a CSS object-position value."""
    words = {'left': 0, 'top': 0, 'center': .5, 'right': 1, 'bottom': 1}
    parts = (position or 'center center').split() + ['center']
    return [words.get(v, float(v.rstrip('%')) / 100 if v.endswith('%') else .5) for v in parts[:2]]


def share_image(source, position):
    """Crop to 1.91:1 around the photo's object-position and resize."""
    fx, fy = focus(position)
    ratio = OG_SIZE[0] / OG_SIZE[1]
    w, h = source.size
    cw, ch = (w, round(w / ratio)) if w / h < ratio else (round(h * ratio), h)
    left, top = round((w - cw) * fx), round((h - ch) * fy)
    return source.crop((left, top, left + cw, top + ch)).resize(OG_SIZE, Image.LANCZOS)


for photo in photos:
    stem = photo['stem']
    if args and stem not in args:
        continue
    source_path = next((p for p in (root / 'src' / 'photos').glob(stem + '.*')), None)
    if source_path is None:
        sys.exit(f'missing source photo for {stem} in src/photos/')
    source = Image.open(source_path).convert('RGB')
    for width in photo['widths']:
        target = root / 'src' / 'assets' / f'{stem}-{width}.webp'
        if target.exists() and not force:
            continue
        if width > source.width:
            sys.exit(f'{stem}: source is {source.width}px wide, cannot make {width}px')
        height = round(source.height * width / source.width)
        source.resize((width, height), Image.LANCZOS).save(target, 'WEBP', quality=78, method=6)
        print(f'{target.relative_to(root)}: {target.stat().st_size // 1024} KB')
    og = root / 'src' / 'assets' / 'og' / f'{stem}.jpg'
    if force or not og.exists():
        og.parent.mkdir(exist_ok=True)
        share_image(source, photo.get('position', '')).save(og, 'JPEG', quality=75, optimize=True, progressive=True)
        print(f'{og.relative_to(root)}: {og.stat().st_size // 1024} KB')
