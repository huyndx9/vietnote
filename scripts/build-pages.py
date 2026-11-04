"""Build a project-site bundle without changing the local dist/ URLs."""
import argparse
from pathlib import Path
import re
import shutil
import subprocess
import sys

root = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--base-path', default='/vietnote/')
args = parser.parse_args()
base = '/' + args.base_path.strip('/') + '/' if args.base_path.strip('/') else '/'
if not re.fullmatch(r'/(?:[A-Za-z0-9_.-]+/)*', base):
    parser.error('base path must contain URL-safe path segments')
subprocess.run([sys.executable, 'src/build.py'], cwd=root, check=True)
output = root / '_site'
if output.exists():
    shutil.rmtree(output)
shutil.copytree(root / 'dist', output)
for path in output.rglob('*'):
    if path.suffix in {'.html', '.js', '.css'} and 'vendor' not in path.relative_to(output).parts:
        text = path.read_text(encoding='utf-8')
        text = re.sub(r'''(["'])/(?!/)''', lambda m: m[1] + base, text)
        path.write_text(text, encoding='utf-8')
(output / '.nojekyll').touch()
print(f'GitHub Pages bundle: {output}, base path: {base}')
