"""Build the GitHub Pages bundle in _site/.

URLs are generated with the base path at build time by src/build.py, so no
text in the output is rewritten afterwards.
"""
import argparse
from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--base-path', default='/vietnote/')
args = parser.parse_args()
subprocess.run([sys.executable, 'src/build.py', '--base-path', args.base_path, '--out', '_site'],
               cwd=root, check=True)
(root / '_site' / '.nojekyll').touch()
