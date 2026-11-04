"""Create responsive WebP copies of the photographs listed in src/content/photos.json.

Requires Pillow (pip install pillow); the normal site build does not. Sources
live in src/photos/<stem>.(jpg|webp|png) and are not deployed. Output goes to
src/assets/<stem>-<width>.webp for every width in the photo's "widths" list.

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
