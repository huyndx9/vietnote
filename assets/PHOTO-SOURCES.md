# Photo sources

Every photograph stored in this project must have a verifiable licence that
allows use on a public website. Record the source page, author and licence of
each new photo here, in `src/content/photos.json` (which drives the hero slides and the about page
"사진 출처" list).

Originals (max 2560 px) live in `src/photos/`; `scripts/optimize-images.py`
writes the resized `src/assets/<name>-<width>.webp` copies. Photos were only
resized and re-encoded, not otherwise altered. Licences were checked through
the Wikimedia Commons API (extmetadata) on 2026-11-04.

| File stem | Subject | Author | Source | Licence |
|---|---|---|---|---|
| halong-haneul-trac | Hạ Long Bay | Haneul Trac | https://www.pexels.com/photo/breathtaking-view-of-ha-long-bay-in-vietnam-36551013/ | Pexels License |
| hoian-chua-cau-night | Chùa Cầu, Hội An, full-moon night | Nguyen Phu Duc | https://commons.wikimedia.org/wiki/File:Ch%C3%B9a_c%E1%BA%A7u_H%E1%BB%99i_An_%C4%91%C3%AAm_r%E1%BA%B1m_(36311686293).jpg | CC0 1.0 |
| hanoi-the-huc-bridge-flowers | Thê Húc bridge, Hoàn Kiếm Lake | katiebordner | https://commons.wikimedia.org/wiki/File:Hoan_Kiem_Lake_in_Hanoi,_Vietnam_(26312972785).jpg | CC BY 2.0 (attribution required) |
| ban-gioc-waterfall | Bản Giốc waterfall | Phương Huy | https://commons.wikimedia.org/wiki/File:Th%C3%A1c_B%E1%BA%A3n_Gi%E1%BB%91c_-_%C4%90%C3%B4ng_B%E1%BA%AFc_2012_(1).JPG | Public domain |
| hanoi-long-bien-bridge | Long Biên bridge | Amenoc | https://commons.wikimedia.org/wiki/File:Long_Bien_bridge.jpg | CC0 1.0 |
| hanoi-turtle-tower-dusk | Turtle Tower, Hoàn Kiếm Lake, dusk | cloud.shepherd | https://commons.wikimedia.org/wiki/File:Ho%C3%A0n_Ki%E1%BA%BFm_Lake.jpg | CC BY 2.0 (attribution required) |

CC BY photos show author, source link and licence in the hero caption while
they are on screen, and all photos are listed on the about page.

## Removed on 2026-11-04

Five earlier slideshow photos were copied from
https://github.com/tiennh1995/vietnam_travel without an identified
photographer or licence; one carried a Zing.vn credit. They were removed and
replaced by the photos above. Do not restore them.
