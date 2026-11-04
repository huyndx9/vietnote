"""Build the VIETNOTE static site.

Content lives in src/content/*.json, HTML in src/templates/*.html
(string.Template syntax: $name or ${name}) and hand-written CSS/JS, fonts,
photos and vendor libraries in src/assets/. Everything is written to the
output directory (dist/ by default), which is generated and not committed.

    python3 src/build.py                                 # local, served at /
    python3 src/build.py --base-path /vietnote/ --out _site  # GitHub Pages
"""
import argparse
import hashlib
import html
import json
import re
import shutil
from datetime import date
from pathlib import Path
from string import Template
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
CONTENT = SRC / 'content'
TEMPLATES = SRC / 'templates'
ASSETS = SRC / 'assets'

# Scripts and stylesheets used by the travel atlas (map page and homepage).
MAP_STYLES = ('vendor/leaflet/leaflet.css', 'vendor/markercluster/MarkerCluster.css', 'travel-map.css')
MAP_SCRIPTS = ('vendor/leaflet/leaflet.js', 'vendor/markercluster/leaflet.markercluster.js',
               'map-geography.js', 'map-destinations.js', 'travel-map.js')
COMMON_SCRIPTS = ('content.js', 'pages.js')
HERO_SIZES = (640, 960, 1440, 1920, 2560)


def h(value):
    """Escape text for HTML element content and quoted attributes."""
    return html.escape(str(value), quote=True)


def load_json(name):
    return json.loads((CONTENT / name).read_text(encoding='utf-8'))


class Site:
    def __init__(self, base, out):
        self.base = base
        self.out = out
        self.templates = {}
        self.hashes = {}
        self.config = load_json('site.json')
        self.categories = {c['id']: c for c in self.config['categories']}

    # ---- helpers -------------------------------------------------------
    def render(self, name, **values):
        if name not in self.templates:
            text = (TEMPLATES / f'{name}.html').read_text(encoding='utf-8')
            self.templates[name] = Template(text)
        return self.templates[name].substitute(base=self.base, **values)

    def url(self, path=''):
        """Site URL for a root-relative path such as 'food/'."""
        return self.base + path.lstrip('/')

    def asset(self, name):
        """Asset URL with a content hash so browsers refetch changed files."""
        if name not in self.hashes:
            digest = hashlib.sha256((self.out / 'assets' / name).read_bytes()).hexdigest()[:12]
            self.hashes[name] = digest
        return f'{self.url("assets/" + name)}?v={self.hashes[name]}'

    def write(self, path, text):
        target = self.out / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text, encoding='utf-8')

    # ---- content -------------------------------------------------------
    def load_items(self):
        """Merge the content files into one list of items with URLs."""
        items = []
        for d in load_json('destinations.json'):
            items.append(dict(d, category='destinations', title=f"{d['city']} · {d['name_en']}",
                              keywords=f"{d['name_en']} {d['city']}"))
        items += load_json('articles.json')
        items += [dict(g, category='guides', photo=None) for g in load_json('guides.json')]
        items += [dict(i, category='itineraries') for i in load_json('itineraries.json')]
        for x in items:
            folder = 'destinations' if x['category'] == 'destinations' else 'articles'
            x['url'] = self.url(f"{folder}/{x['id']}/")
            date.fromisoformat(x['date'])  # fail early on a malformed date
        self.items = items

    def write_data_scripts(self):
        """Browser copies of the content used by search, notebook and atlas."""
        keys = ('id', 'title', 'category', 'desc', 'photo', 'region', 'city', 'keywords', 'days', 'url')
        public = []
        for x in self.items:
            entry = {k: x[k] for k in keys if k in x}
            entry['sections'] = [[s['title'], s['body']] for s in x['sections']]
            public.append(entry)
        self.write('assets/content.js',
                   'window.VIETNOTE_CONTENT=' + json.dumps(public, ensure_ascii=False) + ';\n')
        self.destinations = load_json('map-destinations.json')
        self.write('assets/map-destinations.js', 'window.VIETNOTE_DESTINATIONS=' +
                   json.dumps(self.destinations, ensure_ascii=False, separators=(',', ':')) + ';\n')

    # ---- page parts ----------------------------------------------------
    def page(self, path, title, main, description=None, home=False, atlas=False):
        nav = ''.join(f'<a href="{self.url(c + "/")}">{h(v["label"])}</a>' for c, v in self.categories.items())
        nav += f'<a href="{"#travel-map" if home else self.url("map/")}">여행 지도</a>'
        styles = MAP_STYLES if atlas else ()
        scripts = COMMON_SCRIPTS + (MAP_SCRIPTS if atlas else ())
        preload = ''
        if home:
            srcset = ','.join(f'{self.url(f"assets/halong-haneul-trac-{w}.webp")} {w}w' for w in HERO_SIZES)
            preload = (f'<link rel="preload" as="image" href="{self.url("assets/halong-haneul-trac-1440.webp")}" '
                       f'imagesrcset="{srcset}" imagesizes="96vw" fetchpriority="high">')
        self.write(path, self.render(
            'layout',
            title=h(f'VIETNOTE — {title}' if home else f'{title} — VIETNOTE'),
            description=h(description or self.config['default_description']),
            preload=preload,
            base_css=self.asset('base.css'),
            pages_css=self.asset('pages.css'),
            typography_css=self.asset('typography.css'),
            extra_head='\n'.join(f'<link rel="stylesheet" href="{self.asset(s)}">' for s in styles),
            header=self.render('header', nav=nav),
            main=main,
            footer=self.render('footer'),
            scripts='\n'.join(f'<script src="{self.asset(s)}"></script>' for s in scripts),
        ))

    def card(self, x):
        if x['photo']:
            image = f'<img loading="lazy" src="{h(x["photo"])}" alt="{h(x["title"])} 관련 풍경">'
        else:
            image = f'<div class="guide-art">{h(x.get("icon", "✦"))}</div>'
        meta = self.categories[x['category']]['label'] + (f' · {x["region"]}' if 'region' in x else '')
        return self.render('card', id=h(x['id']), url=h(x['url']), city=h(x.get('city', '')),
                           image=image, meta=h(meta), title=h(x['title']), desc=h(x['desc']))

    def atlas(self, heading):
        return self.render('atlas', heading=heading, total=len(self.destinations))

    # ---- pages ---------------------------------------------------------
    def build_listings(self):
        for cat, info in self.categories.items():
            items = [x for x in self.items if x['category'] == cat]
            options = ['전체'] + info.get('filters', sorted({x['city'] for x in items if x.get('city')}))
            filters = ''.join(
                f'<button class="filter-chip{" active" if i == 0 else ""}" data-filter="{h(v)}" '
                f'aria-pressed="{"true" if i == 0 else "false"}">{h(v)}</button>'
                for i, v in enumerate(options))
            main = self.render('listing', label=h(info['label']), heading=h(info['en']),
                               subtitle=h(info['subtitle']), filters=filters,
                               cards='\n'.join(self.card(x) for x in items))
            self.page(f'{cat}/index.html', info['label'], main)

    def build_articles(self):
        disclaimers = self.config['disclaimers']
        for x in self.items:
            label = self.categories[x['category']]['label']
            toc = ''.join(f'<a href="#section-{i}">{h(s["title"])}</a>' for i, s in enumerate(x['sections']))
            sections = '\n'.join(
                f'<section id="section-{i}"><h2>{h(s["title"])}</h2>'
                f'<p>{h(s["body"]).replace(chr(10), "<br>")}</p></section>'
                for i, s in enumerate(x['sections']))
            extras = ''
            if x.get('phrases'):
                extras = '<div class="phrase-cards">' + ''.join(
                    f'<button class="phrase" data-copy="{h(p["vi"])}"><span>{h(p["ko"])}</span>'
                    f'<strong>{h(p["vi"])}</strong><small>눌러서 복사하기</small></button>'
                    for p in x['phrases']) + '</div>'
            map_link = ''
            if x.get('city'):
                query = quote(x['city'] + ' Vietnam')
                map_link = (f'<a class="action-button" target="_blank" rel="noopener" '
                            f'href="https://www.google.com/maps/search/?api=1&amp;query={query}">지도에서 위치 보기 ↗</a>')
            cover = ''
            if x['photo']:
                cover = f'<div class="article-cover"><img src="{h(x["photo"])}" alt="{h(x["title"])} 관련 풍경"></div>'
            related = [r for r in self.items if r['id'] != x['id'] and (
                r['category'] == x['category'] or (r.get('city') and r.get('city') == x.get('city')))][:3]
            edited = date.fromisoformat(x['date'])
            main = self.render(
                'article', id=h(x['id']), label=h(label), category_url=self.url(x['category'] + '/'),
                title=h(x['title']), desc=h(x['desc']), map_link=map_link,
                date_iso=edited.isoformat(), date=edited.strftime('%Y.%m.%d'),
                disclaimer=h(disclaimers.get(x['category'], disclaimers['default'])),
                cover=cover, toc=toc, sections=sections, extras=extras,
                related='\n'.join(self.card(r) for r in related))
            folder = 'destinations' if x['category'] == 'destinations' else 'articles'
            self.page(f'{folder}/{x["id"]}/index.html', x['title'], main, x['desc'])

    def build_static_pages(self):
        self.page('notebook/index.html', '내 여행 노트', self.render('notebook'))
        self.page('about/index.html', 'VIETNOTE 소개', self.render('about'))
        self.page('map/index.html', '베트남 여행 지도', self.render('map', atlas=self.atlas('h1')), atlas=True)
        self.page('404.html', '페이지를 찾을 수 없습니다', self.render('not-found'))

    def build_home(self):
        atlas = ('<section class="page-wrap map-page home-map" id="travel-map" aria-label="베트남 여행 지도">'
                 + self.atlas('h2') + '</section>')
        main = self.render('home', atlas=atlas)
        self.page('index.html', '베트남을 발견하는 새로운 시선', main,
                  '베트남의 여행지, 문화, 음식과 현지 이야기를 기록하는 여행 매거진 VIETNOTE.',
                  home=True, atlas=True)

    # ---- checks --------------------------------------------------------
    def check_font_coverage(self):
        """Warn when Korean text uses syllables missing from the subset font."""
        font_hangul = set((SRC / 'font-hangul.txt').read_text(encoding='utf-8'))
        used = {c for page in self.out.rglob('*') if page.suffix in ('.html', '.js')
                for c in page.read_text(encoding='utf-8') if '가' <= c <= '힣'}
        missing = ''.join(sorted(used - font_hangul))
        if missing:
            print('WARNING: Pretendard subset lacks', missing, '- run scripts/subset-fonts.py')

    def build(self):
        if self.out.exists():
            shutil.rmtree(self.out)
        shutil.copytree(ASSETS, self.out / 'assets')
        self.load_items()
        self.write_data_scripts()
        self.build_listings()
        self.build_articles()
        self.build_static_pages()
        self.build_home()
        self.check_font_coverage()
        print(f'Built {self.out.relative_to(ROOT)}/ with base path {self.base}: '
              f'{len(self.items)} detail pages, {len(self.categories)} listings, '
              f'home, map, notebook, about and 404.')


def normalise_base(value):
    base = '/' + value.strip('/') + '/' if value.strip('/') else '/'
    if not re.fullmatch(r'/(?:[A-Za-z0-9_.-]+/)*', base):
        raise argparse.ArgumentTypeError('base path must contain URL-safe path segments')
    return base


def main():
    parser = argparse.ArgumentParser(description='Build the VIETNOTE static site.')
    parser.add_argument('--base-path', type=normalise_base, default='/',
                        help='URL path the site is served from, e.g. /vietnote/ (default: /)')
    parser.add_argument('--out', default='dist', help='output directory relative to the project (default: dist)')
    args = parser.parse_args()
    Site(args.base_path, ROOT / args.out).build()


if __name__ == '__main__':
    main()
