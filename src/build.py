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
import os
import re
import shutil
from datetime import date
from xml.sax.saxutils import escape as xml_escape
from pathlib import Path
from string import Template
from urllib.parse import quote
from place_guides import sections as guide_sections, REGIONS
from desktop_mode import DETECT_SCRIPT, transform as desktop_mode_css

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
        self.photos = load_json('photos.json')['photos']
        self.public_url = self.config['public_url'].rstrip('/') + '/'
        self.sitemap = []  # (absolute URL, lastmod or None) for every indexable page
        self.descriptions = {}  # meta description -> page, to catch duplicates

    # ---- helpers -------------------------------------------------------
    def render(self, name, **values):
        if name not in self.templates:
            text = (TEMPLATES / f'{name}.html').read_text(encoding='utf-8')
            self.templates[name] = Template(text)
        return self.templates[name].substitute(base=self.base, **values)

    def hero_slides(self):
        """Hero slideshow images from photos.json; each carries its own credit."""
        slides = []
        for i, p in enumerate(x for x in self.photos if x.get('hero', True)):
            srcset = ','.join(f'{self.url("assets/" + p["stem"] + "-" + str(w) + ".webp")} {w}w' for w in p['widths'])
            first = i == 0
            src = self.url(f'assets/{p["stem"]}-{1440 if first else 960}.webp')
            credit = f'사진: {p["author"]} / {p["source"]} · {p["license"]}'
            style = f' style="object-position:{p["position"]}"' if p.get('position') else ''
            extra = ' fetchpriority="high"' if first else ' aria-hidden="true" decoding="async" fetchpriority="low"'
            slides.append(
                f'<img class="hero-slide{" is-active" if first else ""}" src="{src}" srcset="{srcset}" sizes="96vw" '
                f'width="{p["width"]}" height="{p["height"]}" alt="{h(p["alt"])}" data-place="{h(p["place"])}" '
                f'data-credit="{h(credit)}" data-credit-url="{h(p["url"])}"{extra}{style}>')
        return '\n'.join(slides)

    def hero_credit(self):
        p = self.photos[0]
        return (f'<span id="heroPlace">{h(p["place"])}</span><a class="hero-credit" id="heroCredit" href="{h(p["url"])}" '
                f'target="_blank" rel="noopener noreferrer">사진: {h(p["author"])} / {h(p["source"])} · {h(p["license"])}</a>')

    def photo(self, stem):
        return next((p for p in self.photos if p['stem'] == stem), None)

    def img(self, ref, alt, sizes, lazy=True, cls=''):
        """<img> for a photos.json stem (responsive WebP) or a plain URL."""
        p = self.photo(ref) if ref and '/' not in ref else None
        attrs = f' class="{cls}"' if cls else ''
        attrs += ' loading="lazy" decoding="async"' if lazy else ''
        if not p:
            return f'<img src="{h(ref)}" alt="{h(alt)}"{attrs}>'
        srcset = ','.join(f'{self.url("assets/" + p["stem"] + "-" + str(w) + ".webp")} {w}w' for w in p['widths'])
        mid = 960 if 960 in p['widths'] else p['widths'][-1]
        style = f' style="object-position:{p["position"]}"' if p.get('position') else ''
        return (f'<img src="{self.url("assets/" + p["stem"] + "-" + str(mid) + ".webp")}" srcset="{srcset}" sizes="{sizes}" '
                f'width="{p["width"]}" height="{p["height"]}" alt="{h(alt or p["alt"])}"{attrs}{style}>')

    def photo_caption(self, ref):
        """Author, source and licence line under a cover photo."""
        p = self.photo(ref) if ref and '/' not in ref else None
        if not p:
            return ''
        return (f'<p class="photo-caption">사진: <a href="{h(p["url"])}" target="_blank" rel="noopener noreferrer">{h(p["author"])} / {h(p["source"])}</a>'
                f' · <a href="{h(p["license_url"])}" target="_blank" rel="noopener noreferrer">{h(p["license"])}</a></p>')

    def place_photo(self, place_id):
        return next((p['stem'] for p in self.photos if place_id in p.get('places', [])), None)

    def photo_url(self, ref, width=640):
        """Single URL for browser-rendered cards (search, notebook)."""
        p = self.photo(ref) if ref and '/' not in ref else None
        if not p:
            return ref
        w = width if width in p['widths'] else p['widths'][0]
        return self.url(f'assets/{p["stem"]}-{w}.webp')

    def home_images(self):
        """Homepage card photos (stems from photos.json)."""
        card = '(max-width: 760px) 46vw, 23vw'
        return dict(
            img_hanoi=self.img('hanoi-turtle-tower-dusk', '하노이 호안끼엠 호수의 거북탑', card),
            img_hoian=self.img('hoian-old-town-bicycle', '호이안 구시가지의 노란 집과 자전거', card),
            img_danang=self.img('danang-dragon-bridge', '다낭 한강 위의 용다리', card),
            img_phuquoc=self.img('phuquoc-beach', '푸꾸옥의 하얀 모래 해변', card),
            img_story=self.img('hanoi-train-street', '하노이 기찻길 골목의 일상', '(max-width: 760px) 92vw, 48vw'),
            img_pho=self.img('pho-bo-bowl', '허브와 숙주를 곁들인 소고기 쌀국수', '(max-width: 760px) 92vw, 38vw'),
            img_coffee=self.img('vietnamese-phin-coffee', '핀 필터로 내리는 베트남 커피', '(max-width: 760px) 46vw, 27vw'),
            img_lantern=self.img('hoian-lantern-shop', '호이안의 등불 가게', '(max-width: 760px) 46vw, 27vw'))

    def home_history(self):
        """Homepage history roll: horizontally scrolling chapters from the Hùng kings to today."""
        chapters = load_json('history.json')['chapters']
        places = {d['id']: d for d in self.destinations}
        marks, cards = [], []
        for i, c in enumerate(chapters):
            n = f'{i + 1:02d}'
            marks.append(f'<li><button type="button" data-history-index="{i}" aria-label="{h(c["period"])} · {h(c["title"])}"'
                         f'{" aria-current=" + chr(34) + "true" + chr(34) if i == 0 else ""}>{h(c["mark"])}</button></li>')
            p = self.photo(c['photo']) if c.get('photo') else None
            figure = ''
            if p:
                credit = f'사진: {h(p["author"])} · {h(p["license"])}'
                figure = (f'<figure class="history-photo">{self.img(c["photo"], p["alt"], "(max-width: 760px) 82vw, (max-width: 1200px) 42vw, 30vw")}'
                          f'<figcaption><a href="{h(p["url"])}" target="_blank" rel="noopener noreferrer">{credit}</a></figcaption></figure>')
            visit = ' · '.join(f'<a href="https://www.google.com/maps/search/?api=1&amp;query={quote(pl["query"])}" target="_blank" rel="noopener">{h(pl["name"])}</a>'
                               for pl in c['places'])
            guides = ''.join(f'<a class="history-guide" href="{places[g]["url"]}">{h(places[g]["title"])} 여행 가이드 ↗</a>'
                             for g in c['guides'][:2] if g in places)
            cards.append(
                f'<li class="history-card" id="history-{h(c["id"])}" aria-roledescription="slide" aria-label="{n} / {len(chapters)}">'
                f'{figure}<div class="history-body"><div class="history-period"><span>{n}</span>{h(c["period"])}</div>'
                f'<small class="history-kicker">{h(c["kicker"])}</small><h3>{h(c["title"])}</h3><p>{h(c["teaser"])}</p>'
                f'<p class="history-visit"><strong>지금 가볼 곳</strong>{visit}</p>{guides}</div></li>')
        return ('<section class="history-roll wrap" id="history" aria-roledescription="carousel" aria-label="베트남 역사 이야기">'
                '<div class="history-bar"><ol class="history-timeline">' + ''.join(marks) + '</ol>'
                '<div class="history-nav"><span id="historyStatus" aria-live="polite">01 / ' + str(len(chapters)) + '</span>'
                '<button type="button" id="historyPrev" aria-label="이전 이야기" disabled>←</button>'
                '<button type="button" id="historyNext" aria-label="다음 이야기">→</button></div></div>'
                '<ol class="history-track" id="historyTrack" tabindex="0" aria-label="좌우로 넘겨 보세요">' + ''.join(cards) + '</ol>'
                '<p class="history-note">전승과 기록된 역사를 구분해 소개해요. 연대와 해석은 학계와 자료에 따라 다를 수 있어요.</p></section>')

    def home_routes(self):
        """Homepage strip of the three sample itineraries."""
        order = ['hanoi-3days', 'danang-4days', 'phuquoc-4days']
        by_id = {x['id']: x for x in self.items if x['category'] == 'itineraries'}
        cards = []
        for i in order:
            x = by_id[i]
            nights = x['days'] - 1
            days = ''.join(f'<li>{h(sec["title"])}</li>' for sec in x['sections'])
            cards.append(
                f'<article class="route-card"><a class="route-photo" href="{x["url"]}">{self.img(x["photo"], x["title"], "(max-width: 760px) 92vw, 31vw")}'
                f'<span class="route-length">{nights}박 {x["days"]}일</span></a>'
                f'<div class="route-body"><div class="meta">{h(x["city"])}</div><h3><a href="{x["url"]}">{h(x["title"])}</a></h3>'
                f'<ol class="route-days">{days}</ol><a class="textlink" href="{x["url"]}">일정 자세히 보기 ↗</a></div></article>')
        return ('<section class="section wrap home-routes" id="routes"><div class="section-head"><div>'
                '<div class="section-no">02 / SUGGESTED ROUTES</div><h2 class="section-title serif">Ready-made journeys.</h2>'
                '<div class="section-sub">처음이라면 이렇게 시작해 보세요. 쉬는 시간까지 넣어 둔 추천 일정이에요.</div></div>'
                f'<a class="textlink" href="{self.url("itineraries/")}">전체 일정 ↗</a></div>'
                '<div class="route-grid">' + ''.join(cards) + '</div></section>')

    def photo_credits(self):
        items = ''.join(
            f'<li><strong>{h(p["title"])}</strong><span>사진: <a href="{h(p["url"])}" target="_blank" rel="noopener">'
            f'{h(p["author"])} / {h(p["source"])}</a> · <a href="{h(p["license_url"])}" target="_blank" rel="noopener">{h(p["license"])}</a></span></li>'
            for p in self.photos)
        return ('<section id="photo-credits" class="photo-credits"><div class="section-no">PHOTO CREDITS</div><h2>사진 출처</h2>'
                '<p>VIETNOTE에 직접 저장해 사용하는 사진과 저작자, 라이선스입니다. 사진은 화면 크기에 맞게 크기만 조정했습니다. '
                '외부 사이트에서 불러오는 이미지는 없습니다.</p><ul>' + items + '</ul></section>')

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
        self.destinations = load_json('map-destinations.json')
        self.guide_notes = load_json('place-guides.json')
        if set(self.guide_notes) != {p['id'] for p in self.destinations}:
            raise ValueError('Every atlas destination must have a complete guide')
        self.place_articles=[]
        for p in self.destinations:
            p['url']=self.url(f"places/{p['id']}/")
            sections=guide_sections(p,self.guide_notes[p['id']])
            self.place_articles.append(dict(id='place-'+p['id'],title=p['title']+' 여행 가이드',category='destinations',desc=p['teaser'],photo=self.place_photo(p['id']),vi=p['vi'],region=REGIONS[p['region']],city=p['title'],keywords=p['vi'],url=p['url'],sections=sections))
        public = []
        for x in self.items + self.place_articles:
            entry = {k: x[k] for k in keys if k in x}
            if entry.get('photo'):
                entry['photo'] = self.photo_url(entry['photo'])
            searchable = x['sections'][:1] if x['id'].startswith('place-') else x['sections']
            entry['sections'] = [[s['title'], s['body']] for s in searchable]
            public.append(entry)
        self.write('assets/content.js',
                   'window.VIETNOTE_CONTENT=' + json.dumps(public, ensure_ascii=False) + ';\n')
        for p in self.destinations:  # atlas previews read photos from photos.json
            stem = self.place_photo(p['id'])
            if stem:
                p['photo'], p['photo_alt'] = self.photo_url(stem), self.photo(stem)['alt']
        seasons = load_json('seasons.json')
        region_ids = {r['id'] for r in seasons['regions']}
        if not {p['region'] for p in self.destinations} <= region_ids:
            raise ValueError('Missing seasonal data for an atlas region')
        for r in seasons['regions']:
            if len(r['months']) != 12 or any(m not in seasons['legend'] for m in r['months']):
                raise ValueError(f'Invalid monthly seasonal data: {r["id"]}')
        self.write('assets/map-destinations.js', 'window.VIETNOTE_DESTINATIONS=' +
                   json.dumps(self.destinations, ensure_ascii=False, separators=(',', ':')) + ';\n' +
                   'window.VIETNOTE_SEASONS=' + json.dumps(seasons, ensure_ascii=False, separators=(',', ':')) + ';\n')

    # ---- page parts ----------------------------------------------------
    def page(self, path, title, main, description, home=False, atlas=False,
             og_type='website', image=None, schema=(), lastmod=None, index=True):
        """Write one HTML page. `description` is the page's own meta description;
        `image` a photos.json stem for link previews; `schema` JSON-LD objects."""
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
            desktop_mode_script=DETECT_SCRIPT,
            title=h(f'VIETNOTE — {title}' if home else f'{title} — VIETNOTE'),
            description=h(description),
            seo_head=self.seo_head(path, title if not home else self.config['site_name'] + ' — ' + title,
                                   description, og_type, image, schema, lastmod, index),
            preload=preload,
            # VIETNOTE_AI_ENDPOINT is set by the Pages workflow after it deploys worker/.
            ai_endpoint=h(os.environ.get('VIETNOTE_AI_ENDPOINT') or self.config.get('ai_endpoint', '')),
            base_css=self.asset('base.css'),
            pages_css=self.asset('pages.css'),
            typography_css=self.asset('typography.css'),
            extra_head='\n'.join(f'<link rel="stylesheet" href="{self.asset(s)}">' for s in styles),
            header=self.render('header', nav=nav),
            main=main,
            footer=self.render('footer'),
            scripts='\n'.join(f'<script src="{self.asset(s)}"></script>' for s in scripts),
        ))

    # ---- search engines and link previews ------------------------------
    def canonical(self, path):
        """Public absolute URL of an output file such as 'food/index.html'."""
        return self.public_url + re.sub(r'(^|/)index\.html$', r'\1', path)

    def share_image(self, stem):
        """Absolute URL of the 1200x630 JPEG made by scripts/optimize-images.py."""
        stem = stem if stem and self.photo(stem) else self.config['default_image']
        if not (ASSETS / 'og' / f'{stem}.jpg').exists():
            raise FileNotFoundError(f'src/assets/og/{stem}.jpg missing - run scripts/optimize-images.py')
        return self.public_url + f'assets/og/{stem}.jpg', self.photo(stem)['alt']

    def seo_head(self, path, title, description, og_type, image, schema, lastmod, index):
        if index and not 40 <= len(description) <= 160:
            print(f'WARNING: {path}: meta description has {len(description)} characters (aim for 40-160)')
        if index and description in self.descriptions:
            print(f'WARNING: {path} repeats the meta description of {self.descriptions[description]}')
        self.descriptions.setdefault(description, path)
        if not index:
            return '<meta name="robots" content="noindex">'
        url = self.canonical(path)
        self.sitemap.append((url, lastmod))
        image_url, image_alt = self.share_image(image)
        meta = [
            ('property', 'og:type', og_type), ('property', 'og:site_name', self.config['site_name']),
            ('property', 'og:locale', 'ko_KR'), ('property', 'og:title', title),
            ('property', 'og:description', description), ('property', 'og:url', url),
            ('property', 'og:image', image_url), ('property', 'og:image:width', '1200'),
            ('property', 'og:image:height', '630'), ('property', 'og:image:alt', image_alt),
            ('name', 'twitter:card', 'summary_large_image'), ('name', 'twitter:title', title),
            ('name', 'twitter:description', description), ('name', 'twitter:image', image_url),
            ('name', 'twitter:image:alt', image_alt)]
        if og_type == 'article' and lastmod:
            meta.append(('property', 'article:modified_time', lastmod))
        lines = [f'<link rel="canonical" href="{h(url)}">']
        lines += [f'<meta {kind}="{key}" content="{h(value)}">' for kind, key, value in meta]
        for data in schema:
            text = json.dumps(dict({'@context': 'https://schema.org'}, **data), ensure_ascii=False)
            lines.append('<script type="application/ld+json">' + text.replace('</', '<\\/') + '</script>')
        return '\n'.join(lines)

    def publisher(self):
        return {'@type': 'Organization', 'name': self.config['site_name'], 'url': self.public_url}

    def breadcrumbs(self, *trail):
        """BreadcrumbList from (name, output path) pairs, starting after the homepage."""
        items = [('홈', 'index.html'), *trail]
        return {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': i + 1, 'name': name, 'item': self.canonical(path)}
            for i, (name, path) in enumerate(items)]}

    def article_schema(self, x, path, description):
        data = {'@type': 'Article', 'headline': x['title'], 'description': description,
                'inLanguage': 'ko', 'mainEntityOfPage': self.canonical(path),
                'image': self.share_image(x.get('photo'))[0],
                'datePublished': x['date'], 'dateModified': x['date'],
                'author': {'@type': 'Person', 'name': self.config['author'], 'url': self.public_url + 'about/'},
                'publisher': self.publisher()}
        if x['category'] == 'destinations':
            data['about'] = {'@type': 'TouristDestination', 'name': x['title'],
                             'containedInPlace': {'@type': 'Country', 'name': 'Vietnam'}}
        return data

    def write_sitemap(self):
        rows = ''.join(
            f'  <url><loc>{xml_escape(url)}</loc>' + (f'<lastmod>{lastmod}</lastmod>' if lastmod else '') + '</url>\n'
            for url, lastmod in sorted(self.sitemap))
        self.write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n'
                   '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + rows + '</urlset>\n')
        self.write('robots.txt', f'User-agent: *\nAllow: /\n\nSitemap: {self.public_url}sitemap.xml\n')

    def card(self, x):
        if x['photo']:
            image = self.img(x['photo'], f'{x["title"]} 관련 풍경', '(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 30vw')
        elif x.get('vi'):
            image = f'<div class="guide-art place-art"><span>{h(x["title"].split(" · ")[0].replace(" 여행 가이드", ""))}</span></div>'
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
            if cat == 'destinations':
                items = self.place_articles  # all atlas destinations, not only the four early city pages
            options = ['전체'] + info.get('filters', sorted({x['city'] for x in items if x.get('city')}))
            filters = ''.join(
                f'<button class="filter-chip{" active" if i == 0 else ""}" data-filter="{h(v)}" '
                f'aria-pressed="{"true" if i == 0 else "false"}">{h(v)}</button>'
                for i, v in enumerate(options))
            main = self.render('listing', label=h(info['label']), heading=h(info['en']),
                               subtitle=h(info['subtitle']), filters=filters,
                               cards='\n'.join(self.card(x) for x in items))
            path = f'{cat}/index.html'
            listing = {'@type': 'CollectionPage', 'name': info['label'], 'description': info['description'],
                       'url': self.canonical(path), 'inLanguage': 'ko', 'isPartOf': self.canonical('index.html'),
                       'mainEntity': {'@type': 'ItemList', 'itemListElement': [
                           {'@type': 'ListItem', 'position': i + 1, 'url': self.public_url + x['url'][len(self.base):],
                            'name': x['title']} for i, x in enumerate(items)]}}
            self.page(path, info['label'], main, info['description'],
                      image=next((x['photo'] for x in items if x.get('photo')), None),
                      schema=[listing, self.breadcrumbs((info['label'], path))])

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
                cover = f'<div class="article-cover">{self.img(x["photo"], f"{x["title"]} 관련 풍경", "(max-width: 760px) 92vw, 80vw", lazy=False)}</div>' + self.photo_caption(x['photo'])
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
            path = f'{folder}/{x["id"]}/index.html'
            description = x['meta_description']
            self.page(path, x['title'], main, description, og_type='article', image=x.get('photo'),
                      lastmod=x['date'],
                      schema=[self.article_schema(x, path, description),
                              self.breadcrumbs((label, f'{x["category"]}/index.html'), (x['title'], path))])

    def build_place_guides(self):
        for p,article in zip(self.destinations,self.place_articles):
            g=self.guide_notes[p['id']]
            toc=''.join(f'<a href="#{section["id"]}">{h(section["title"])}</a>' for section in article['sections'])
            blocks=[]
            for section in article['sections']:
                body=''.join(f'<p>{h(text)}</p>' for text in section['body'].split('\n\n'))
                if section['id']=='phrases':
                    phrases=[('이 주소로 가 주세요','Cho tôi đến địa chỉ này.'),('고수를 빼 주세요','Không cho rau mùi.'),('맵지 않게 해 주세요','Không cay.'),('얼마인가요?','Bao nhiêu tiền?'),('도와주세요','Làm ơn giúp tôi.'),('감사합니다','Cảm ơn.')]
                    body+='<div class="phrase-cards">'+''.join(f'<button class="phrase" data-copy="{h(vi)}"><span>{h(ko)}</span><strong>{h(vi)}</strong><small>눌러서 복사하기</small></button>' for ko,vi in phrases)+'</div>'
                blocks.append(f'<section id="{section["id"]}"><h2>{h(section["title"])}</h2>{body}</section>')
            neighbors=sorted((r for r in self.destinations if r['id']!=p['id']),key=lambda r:(r['region']!=p['region'],(r['lat']-p['lat'])**2+(r['lon']-p['lon'])**2))[:3]
            related=''.join(f'<a href="{r["url"]}"><small>{h(REGIONS[r["region"]])}</small><strong>{h(r["title"])}</strong><p>{h(r["teaser"])}</p><span>여행 가이드 읽기 ↗</span></a>' for r in neighbors)
            photograph=self.photo(self.place_photo(p['id'])) if self.place_photo(p['id']) else None
            cover=''
            if photograph:
                image=photograph
                srcset=','.join(f'{self.url("assets/"+image["stem"]+"-"+str(w)+".webp")} {w}w' for w in image['widths'])
                cover=(f'<figure class="guide-cover"><img src="{self.url("assets/"+image["stem"]+"-1440.webp")}" srcset="{srcset}" sizes="92vw" width="{image["width"]}" height="{image["height"]}" alt="{h(image["alt"])}" loading="lazy">'
                       f'<figcaption>사진: <a href="{h(image["url"])}" target="_blank" rel="noopener noreferrer">{h(image["author"])} / {h(image["source"])}</a> · <a href="{h(image["license_url"])}" target="_blank" rel="noopener noreferrer">{h(image["license"])}</a></figcaption></figure>')
            edited=date.fromisoformat(g['date'])
            main=self.render('place-guide',date_iso=edited.isoformat(),date=edited.strftime('%Y.%m.%d'),cover=cover,name_vi=h(p['vi']),short_name=h(p['title'].split(' · ')[0]),title=h(p['title']),teaser=h(p['teaser']),region=h(REGIONS[p['region']]),duration=h(g['duration']),gateway=h(g['gateway']),save_id=h(article['id']),maps_url='https://www.google.com/maps/search/?api=1&amp;query='+quote(p['vi']+' Vietnam'),toc=toc,sections=''.join(blocks),related=related)
            path=f'places/{p["id"]}/index.html'
            description=g.get('meta_description') or (
                f'{p["title"]} 여행 가이드 · {p["teaser"]} 추천 체류 {g["duration"]}, 가는 법과 숙소·음식·예산·안전 정보까지 정리했어요.')
            place={'@type':'TouristDestination','name':p['title'],'alternateName':p['vi'],'description':p['teaser'],
                   'url':self.canonical(path),'inLanguage':'ko',
                   'geo':{'@type':'GeoCoordinates','latitude':p['lat'],'longitude':p['lon']},
                   'containedInPlace':{'@type':'Country','name':'Vietnam'}}
            if photograph:
                place['image']=self.share_image(photograph['stem'])[0]
            self.page(path,p['title']+' 여행 가이드',main,description,og_type='article',image=self.place_photo(p['id']),
                      lastmod=g['date'],schema=[place,self.breadcrumbs(('여행 지도','map/index.html'),(p['title'],path))])

    def build_static_pages(self):
        pages = self.config['pages']
        self.page('notebook/index.html', pages['notebook']['title'], self.render('notebook'),
                  pages['notebook']['description'], index=False)  # personal, browser-only content
        about = pages['about']
        self.page('about/index.html', about['title'], self.render('about', photo_credits=self.photo_credits()),
                  about['description'],
                  schema=[{'@type': 'AboutPage', 'name': about['title'], 'description': about['description'],
                           'url': self.canonical('about/index.html'), 'inLanguage': 'ko',
                           'mainEntity': {'@type': 'Person', 'name': self.config['author']}},
                          self.breadcrumbs((about['title'], 'about/index.html'))])
        atlas = pages['map']
        self.page('map/index.html', atlas['title'], self.render('map', atlas=self.atlas('h1')),
                  atlas['description'], atlas=True,
                  schema=[self.breadcrumbs((atlas['title'], 'map/index.html'))])
        self.page('404.html', pages['404']['title'], self.render('not-found'), pages['404']['description'],
                  index=False)

    def build_home(self):
        atlas = ('<section class="page-wrap map-page home-map" id="travel-map" aria-label="베트남 여행 지도">'
                 + self.atlas('h2') + '</section>')
        main = self.render('home', atlas=atlas, **self.home_images(), hero_slides=self.hero_slides(), hero_credit=self.hero_credit(), routes=self.home_routes(), history=self.home_history())
        home = self.config['pages']['home']
        website = {'@type': 'WebSite', 'name': self.config['site_name'], 'url': self.public_url,
                   'description': home['description'], 'inLanguage': 'ko', 'publisher': self.publisher()}
        self.page('index.html', home['title'], main, home['description'], home=True, atlas=True,
                  schema=[website, self.publisher()])

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
        # Keep the phone layout when a phone browser forces "desktop site" (see desktop_mode.py).
        for sheet in (self.out / 'assets').glob('*.css'):
            sheet.write_text(desktop_mode_css(sheet.read_text(encoding='utf-8')), encoding='utf-8')
        self.load_items()
        self.write_data_scripts()
        self.build_listings()
        self.build_articles()
        self.build_place_guides()
        self.build_static_pages()
        self.build_home()
        self.write_sitemap()
        self.check_font_coverage()
        print(f'Built {self.out.relative_to(ROOT)}/ with base path {self.base}: '
              f'{len(self.items)} detail pages, {len(self.place_articles)} place guides, {len(self.categories)} listings, '
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
