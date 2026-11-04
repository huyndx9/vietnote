# Interactive atlas sources

The atlas uses Leaflet 1.9.4 (BSD-2-Clause) for geographic projection, vector
rendering, dragging, keyboard navigation, zoom controls and a metric scale.
The original distribution and license are retained in dist/assets/vendor/leaflet.
Reference implementation/documentation: https://leafletjs.com/examples/geojson/

Local vector data in dist/assets/map-geography.js:
- Natural Earth 1:10m admin-0 country polygons, Vietnam and regional context:
  https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_0_countries.geojson
- Natural Earth 1:50m river centerlines, Mekong, Hong and Chao Phraya:
  https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_rivers_lake_centerlines.geojson

Natural Earth is public domain:
https://www.naturalearthdata.com/about/terms-of-use/

Countries are clipped to 94–120°E, 3–29°N and coordinates rounded to four
places for a compact local asset. Labels are editorial geographic labels.
The map presents travel geography; Natural Earth does not provide street-level
routing detail. Search links open Google Maps for the named destination.
No external tiles, API key or tracking requests are needed to render the map.
Hội An's marker has a visible leader offset to keep it separate from Đà Nẵng.

Leaflet vendor files must remain byte-for-byte intact during deployment URL
rewriting. The Pages build prefixes URLs only in first-party assets.

Hoàng Sa (Paracel Islands) and Trường Sa (Spratly Islands) have bilingual
geographic labels and symbolic points at representative island locations.
These points are not island footprints or an exhaustive inventory, and do not
depict maritime boundaries. The default overview includes both archipelagos.
Regional search/filters continue to focus the matching travel destinations.
