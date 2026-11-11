"""Add detail layers (rivers, lakes, main roads) to src/assets/map-geography.js.

Source: Natural Earth 1:10m vector data (public domain), downloaded from the
nvkelso/natural-earth-vector GitHub mirror. Lines are clipped to a box around
Vietnam, roads are kept only where they run inside Vietnam, and every line is
simplified (Douglas-Peucker) and rounded to keep the asset small.

Usage: python3 scripts/map-layers.py [--cache DIR]
The existing "countries" layer is kept as it is.
"""
import argparse
import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / 'src' / 'assets' / 'map-geography.js'
MIRROR = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/'
BOX = (99.5, 7.0, 111.5, 24.5)  # west, south, east, north
TOLERANCE = 0.012  # degrees, about 1.3 km
RIVER_KO = {'Hong': '홍강', 'Mekong': '메콩강', 'Da': '다강', 'Ca': '까강', 'Ba': '바강',
            'Srepok': '스레뽁강', 'Krong': '끄롱강', 'Lancang': '메콩강'}


def load(name, cache):
    path = Path(cache) / f'{name}.geojson'
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(MIRROR + f'{name}.geojson') as r:
            path.write_bytes(r.read())
    return json.loads(path.read_text(encoding='utf-8'))


def lines(geometry):
    if not geometry:
        return []
    kind, coords = geometry['type'], geometry['coordinates']
    if kind == 'LineString':
        return [coords]
    if kind == 'MultiLineString':
        return coords
    if kind == 'Polygon':
        return coords
    if kind == 'MultiPolygon':
        return [ring for polygon in coords for ring in polygon]
    return []


def inside_box(pt):
    return BOX[0] <= pt[0] <= BOX[2] and BOX[1] <= pt[1] <= BOX[3]


def clip(line):
    """Split a line into the runs that lie inside the box."""
    runs, run = [], []
    for pt in line:
        if inside_box(pt):
            run.append(pt)
        elif run:
            runs.append(run)
            run = []
    if run:
        runs.append(run)
    return [r for r in runs if len(r) > 1]


def simplify(points, tol=TOLERANCE):
    if len(points) < 3:
        return points
    (x1, y1), (x2, y2) = points[0], points[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = (dx * dx + dy * dy) ** 0.5 or 1e-12
    worst, index = 0, 0
    for i in range(1, len(points) - 1):
        x, y = points[i]
        d = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / norm
        if d > worst:
            worst, index = d, i
    if worst <= tol:
        return [points[0], points[-1]]
    return simplify(points[:index + 1], tol)[:-1] + simplify(points[index:], tol)


def rounded(line):
    return [[round(x, 3), round(y, 3)] for x, y in line]


def point_in_polygons(pt, polygons):
    x, y = pt
    hit = False
    for ring in polygons:
        j = len(ring) - 1
        for i in range(len(ring)):
            xi, yi = ring[i]
            xj, yj = ring[j]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
                hit = not hit
            j = i
    return hit


def feature(props, parts):
    return {'type': 'Feature', 'properties': props,
            'geometry': {'type': 'MultiLineString', 'coordinates': parts}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cache', default=str(ROOT / '.cache' / 'natural-earth'))
    args = parser.parse_args()

    text = TARGET.read_text(encoding='utf-8')
    prefix = text[:text.index('=') + 1]
    geography = json.loads(text[text.index('=') + 1:].strip().rstrip(';'))
    vietnam = next(f for f in geography['countries']['features'] if f['properties']['name'] == 'Vietnam')
    vietnam_rings = lines(vietnam['geometry'])

    rivers = []
    for f in load('ne_10m_rivers_lake_centerlines', args.cache)['features']:
        name = f['properties'].get('name') or ''
        parts = [rounded(simplify(run)) for line in lines(f['geometry']) for run in clip(line)]
        parts = [p for p in parts if len(p) > 1]
        if parts:
            rivers.append(feature({'name': name, 'ko': RIVER_KO.get(name, ''),
                                   'rank': f['properties'].get('scalerank', 9)}, parts))

    lakes = []
    for f in load('ne_10m_lakes', args.cache)['features']:
        parts = [rounded(simplify(run, TOLERANCE / 2)) for line in lines(f['geometry']) for run in clip(line)]
        parts = [p for p in parts if len(p) > 2]
        if parts:
            lakes.append(feature({'name': f['properties'].get('name') or ''}, parts))

    roads = []
    for f in load('ne_10m_roads', args.cache)['features']:
        kind = f['properties'].get('type')
        if kind not in ('Major Highway', 'Secondary Highway', 'Road'):
            continue
        parts = []
        for line in lines(f['geometry']):
            for run in clip(line):
                mid = run[len(run) // 2]
                if point_in_polygons(mid, vietnam_rings):
                    parts.append(rounded(simplify(run, TOLERANCE / 3)))
        parts = [p for p in parts if len(p) > 1]
        if parts:
            roads.append(feature({'major': kind == 'Major Highway'}, parts))

    geography['rivers'] = {'type': 'FeatureCollection', 'features': rivers}
    geography['lakes'] = {'type': 'FeatureCollection', 'features': lakes}
    geography['roads'] = {'type': 'FeatureCollection', 'features': roads}
    TARGET.write_text(prefix + json.dumps(geography, ensure_ascii=False, separators=(',', ':')) + ';\n',
                      encoding='utf-8')
    print(f'{TARGET.relative_to(ROOT)}: {len(rivers)} rivers, {len(lakes)} lakes, {len(roads)} roads, '
          f'{TARGET.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
