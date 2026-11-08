# Interactive atlas sources

The atlas uses Leaflet 1.9.4 (BSD-2-Clause) for geographic projection, vector
rendering, dragging, keyboard navigation, zoom controls and a metric scale.
The original distribution and license are retained in src/assets/vendor/leaflet.
Reference implementation/documentation: https://leafletjs.com/examples/geojson/

Local vector data in src/assets/map-geography.js:
- Natural Earth 1:10m admin-0 country polygons, Vietnam and regional context:
  https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_0_countries.geojson
- Natural Earth 1:10m river centerlines (Hồng, Đà, Mekong, Cả, Ba, Srêpốk ...):
  https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_rivers_lake_centerlines.geojson
- Natural Earth 1:10m roads, major and secondary highways inside Vietnam:
  https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_roads.geojson
  Rivers and roads are produced by scripts/map-layers.py (clip, Douglas-Peucker
  simplification, rounding). Re-run it to refresh them; countries are kept.
- Korean editorial labels for seas, deltas, highlands, mountain ranges, the
  Fansipan summit, two rivers and major cities are placed by hand in
  travel-map.js and appear progressively as the map is zoomed in.
- Map labels are in Korean. Vietnamese names remain in search (diacritics are
  normalised) and in Google Maps links. Province boundaries are not drawn:
  Natural Earth still has the 63 provinces from before the July 2025 merger.

Natural Earth is public domain:
https://www.naturalearthdata.com/about/terms-of-use/

Countries are clipped to 94–120°E, 3–29°N and coordinates rounded to four
places for a compact local asset. Labels are editorial geographic labels.
The map presents travel geography; Natural Earth does not provide street-level
routing detail. Search links open Google Maps for the named destination.
No external tiles, API key or tracking requests are needed to render the map.
Hội An's marker has a visible leader offset to keep it separate from Đà Nẵng.

Leaflet vendor files are copied byte-for-byte into the build output. The base
path for GitHub Pages is applied when pages are generated, so no deployed file
is rewritten afterwards.

Hoàng Sa (Paracel Islands) and Trường Sa (Spratly Islands) have bilingual
geographic labels and symbolic points at representative island locations.
These points are not island footprints or an exhaustive inventory, and do not
depict maritime boundaries. The default overview includes both archipelagos.
Regional search/filters continue to focus the matching travel destinations.

Destination content is maintained in src/content/map-destinations.json. The standard
build generates map-destinations.js and the total displayed on the page. Each
profile has a Korean editorial teaser, two original introductory paragraphs,
three suggested experiences, and a practical preparation tip. These are travel
suggestions, not first-person reports or verified current operating conditions.
Coordinates locate the named city/attraction approximately; routing uses the
named Google Maps destination. Images are shown only where an existing local
photo corresponds to the destination.

Leaflet.markercluster 1.5.3 (MIT license retained in assets/vendor/markercluster)
groups nearby destination markers. Island geography labels are separate from
this layer and remain on the map when destination filters change. Interest
filters combine with region filters. Search normalizes Vietnamese diacritics.
