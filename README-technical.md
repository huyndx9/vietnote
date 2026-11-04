# VIETNOTE

Static Korean-language Vietnam travel magazine.

## Pages

Home, destinations, itineraries, food, local journal, travel guides, about,
and a browser-local notebook. Seventeen detail pages have permanent URLs.

## Build

Run `python src/build.py` (Python 3 standard library only).
`src/home.html` is the retained homepage source. Content and additional page
markup are defined in `src/build.py`. Styles and behavior are under
`dist/assets/typography.css`, `pages.css`, and `pages.js`.
Serve `dist/` with any static web server. This project deploys through Sites.

## Fonts and photographs

- Body text uses Pretendard (OFL-1.1), a Korean-first typeface that also covers
  Vietnamese letters; display headings use Playfair Display (OFL-1.1).
  Both are subset into `dist/assets/fonts/*-subset.woff2` by
  `scripts/subset-fonts.py` (needs `pip install fonttools brotli`). The
  Pretendard subset holds the 2,350 common KS X 1001 Hangul syllables plus all
  syllables used on the site; `src/build.py` prints a warning when new text
  needs a syllable outside `src/font-hangul.txt`.
- Large source photographs live in `src/photos/` (not deployed).
  `scripts/optimize-images.py` (needs `pip install pillow`) writes responsive
  WebP sizes to `dist/assets/`; pages reference them with `srcset`.
- Only the homepage preloads the hero photograph.

## Behavior and current limits

- Search and regional/city filtering run locally, including Korean and English names.
- Bookmarks and correction notes use localStorage; they do not sync across devices.
- Correction notes are explicitly personal drafts; nothing is submitted to an operator.
- Share uses native sharing when available, with clipboard fallback.
- Map buttons open Google Maps search. No embedded map API key is needed.
- The DeepSeek panel accurately shows an unconnected state. No AI calls are made,
  and no API key is accepted by client-side code. Live AI requires a server route
  and a server-only DEEPSEEK_API_KEY secret in a subsequent integration.
- Itineraries are editorial suggestions, not bookable products. Variable entry,
  pricing, operating, and weather information must be checked with official sources.
- The hero photograph is Haneul Trac's Pexels photo 36551013 (credit in footer).
  Existing supporting photos are illustrative Unsplash assets inherited from the
  initial homepage; do not treat them as verified depictions of a particular venue.

## GitHub Pages

Run `python3 scripts/build-pages.py --base-path /vietnote/` to generate `_site/`.
The deployment bundle prefixes internal URLs with `/vietnote/`; `dist/` stays
suitable for local serving at the web root. Do not edit `_site/` directly.

The `Publish GitHub Pages` workflow deploys on pushes to `main`. In repository
Settings → Pages, choose **GitHub Actions**, then run the workflow if the initial
run preceded Pages activation. Expected URL after a successful deployment:
https://huyndx9.github.io/vietnote/ . GitHub Actions must be enabled.

Alternatively, the prepared `gh-pages` branch can be published by choosing
**Deploy from a branch**, **gh-pages**, **/ (root)**. That branch is a snapshot;
subsequent automatic deployments use the workflow above.

## Travel atlas editorial content

The atlas has 42 destination profiles in `src/map-destinations.json`. Edit the
Korean teaser, `paragraphs`, `experiences` and `tip` there, then rebuild with
`python3 src/build.py`. The page count is derived from this file. The longer
Korean introduction and tip appear in the expandable travel note on each card.
Region, interest and accent-insensitive search filters can be combined. Nearby
markers are grouped with the locally bundled Leaflet.markercluster plugin.
