"""Create responsive WebP copies of large source photographs.

Requires Pillow (pip install pillow); the normal site build does not. Sources
live in src/photos/ and are not deployed. Output goes to src/assets/ as
<name>-<width>.webp. Re-run after replacing or adding a source photograph and
update the matching srcset in src/templates/*.html or src/build.py.
"""
from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parent.parent
PHOTOS = {
    'halong-haneul-trac.webp': (640, 960, 1440, 1920, 2560),
}

for name, widths in PHOTOS.items():
    source = Image.open(root / 'src' / 'photos' / name).convert('RGB')
    stem = Path(name).stem
    for width in widths:
        height = round(source.height * width / source.width)
        target = root / 'src' / 'assets' / f'{stem}-{width}.webp'
        source.resize((width, height), Image.LANCZOS).save(target, 'WEBP', quality=78, method=6)
        print(f'{target.relative_to(root)}: {target.stat().st_size // 1024} KB')
