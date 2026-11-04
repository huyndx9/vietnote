# Photo sources

Every photograph stored in this project must have a verifiable licence that
allows use on a public website. Record the source page, author and licence of
each new photo here before publishing it.

## In use

- `src/photos/halong-haneul-trac.webp` and its responsive copies
  `dist/assets/halong-haneul-trac-*.webp`: Hạ Long Bay by Haneul Trac,
  https://www.pexels.com/photo/breathtaking-view-of-ha-long-bay-in-vietnam-36551013/
  (Pexels licence; credited in the site footer).

## Removed on 2026-11-04

Five slideshow photos (Hội An covered bridge, Thê Húc bridge, Bản Giốc
waterfall, Long Biên bridge at sunset, Hoàn Kiếm lake) were copied from
https://github.com/tiennh1995/vietnam_travel without an identified
photographer or licence; one carried a Zing.vn credit. They were removed from
the site and the repository. Do not restore them.

## Replacement plan

Use Wikimedia Commons images, preferring Public Domain or CC0. CC BY or CC BY-SA
images are acceptable only with the author, licence and source link shown on
the site. Add each replacement to `PHOTOS` in `scripts/optimize-images.py`, keep
the original in `src/photos/`, and add a `hero-slide` image in `src/home.html`.
The slideshow controls reappear automatically once there are two or more slides.
