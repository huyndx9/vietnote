# Photo sources

Every photograph stored in this project must have a verifiable licence that
allows use on a public website. `src/content/photos.json` is the authoritative
record (author, source page, licence, where each photo is used); the build
renders the hero slides, card images, cover captions and the about page
"사진 출처" list from it. Keep this table in sync when photos change.

Originals live in `src/photos/`; `scripts/optimize-images.py` reads
photos.json and writes the resized `src/assets/<stem>-<width>.webp` copies.
Photos were only cropped at the edges (Da Nang: a curled corner), resized and
re-encoded. Licences were checked through the Wikimedia Commons API
(extmetadata) on 2026-11-04/05. History-roll photos show real sites and museum objects; photos of
modern paintings, dioramas and statues were avoided because the artwork
itself may still be under copyright. A photo by an account that looked like a
re-upload service was rejected in favour of one by an identified photographer.

The site no longer loads any image from Unsplash or other external hosts.

| Stem | Subject | Author | Source | Licence | Used for |
|---|---|---|---|---|---|
| halong-haneul-trac | 하롱베이 · Hạ Long Bay | Haneul Trac | https://www.pexels.com/photo/breathtaking-view-of-ha-long-bay-in-vietnam-36551013/ | Pexels License | slideshow, atlas: halong |
| hoian-chua-cau-night | 호이안 내원교 · Chùa Cầu, Hội An | Nguyen Phu Duc | https://commons.wikimedia.org/wiki/File:Ch%C3%B9a_c%E1%BA%A7u_H%E1%BB%99i_An_%C4%91%C3%AAm_r%E1%BA%B1m_(36311686293).jpg | CC0 1.0 | slideshow, atlas: hoian |
| hanoi-the-huc-bridge-flowers | 호안끼엠 호수와 테훅 다리 · Hoàn Kiếm Lake | katiebordner | https://commons.wikimedia.org/wiki/File:Hoan_Kiem_Lake_in_Hanoi,_Vietnam_(26312972785).jpg | CC BY 2.0 | slideshow |
| ban-gioc-waterfall | 반족 폭포 · Thác Bản Giốc | Phương Huy | https://commons.wikimedia.org/wiki/File:Th%C3%A1c_B%E1%BA%A3n_Gi%E1%BB%91c_-_%C4%90%C3%B4ng_B%E1%BA%AFc_2012_(1).JPG | Public domain | slideshow, atlas: bangioc |
| hanoi-long-bien-bridge | 롱비엔 다리 · Cầu Long Biên | Amenoc | https://commons.wikimedia.org/wiki/File:Long_Bien_bridge.jpg | CC0 1.0 | slideshow |
| hanoi-turtle-tower-dusk | 호안끼엠 호수의 거북탑 · Tháp Rùa | cloud.shepherd | https://commons.wikimedia.org/wiki/File:Ho%C3%A0n_Ki%E1%BA%BFm_Lake.jpg | CC BY 2.0 | slideshow, atlas: hanoi, history roll |
| hoian-old-town-bicycle | 호이안 구시가지 · Hội An Ancient Town | Thong Vo, Titi Wanderer | https://commons.wikimedia.org/wiki/File:Ti%E1%BB%87m153%2Bxe%C4%90%E1%BA%A1p%26c%C3%A2y.jpg | CC0 1.0 | history roll |
| hoian-lantern-shop | 호이안의 등불 · Hội An lanterns | dronepicr | https://commons.wikimedia.org/wiki/File:Hoi_An_Laternen_und_Lampions_(39543426861).jpg | CC BY 2.0 |  |
| danang-dragon-bridge | 다낭 용다리 · Cầu Rồng, Đà Nẵng | Gary Todd | https://commons.wikimedia.org/wiki/File:Han_River,_Da_Nang,_Vietnam.jpg | CC0 1.0 | atlas: danang |
| phuquoc-beach | 푸꾸옥 해변 · Phú Quốc | Quangpraha | https://commons.wikimedia.org/wiki/File:Phuquoc-3058734.jpg | CC0 1.0 | atlas: phuquoc |
| hanoi-train-street | 하노이 기찻길 골목 · Hanoi Train Street | Radek Kucharski from Warsaw, Poland | https://commons.wikimedia.org/wiki/File:Hanoi_Train_Street_(51955804948).jpg | CC BY 2.0 |  |
| pho-bo-bowl | 소고기 쌀국수 · Phở bò | Hermann Luyken | https://commons.wikimedia.org/wiki/File:2016.10.14.133502_Noodle_soup_beef_Pho_Bac_Vietnamese_restaurant_Seattle_Washington_USA.jpg | CC0 1.0 |  |
| vietnamese-phin-coffee | 베트남 핀 커피 · Cà phê phin | McKay Savage from London, UK | https://commons.wikimedia.org/wiki/File:Vietnam_08_-_132_-_Vietnamese_coffee_(3185747640).jpg | CC BY 2.0 |  |
| hagiang-golden-terraces | 하장의 계단식 논 · Hà Giang | minhphuc_99kdd | https://commons.wikimedia.org/wiki/File:Rice_terraces_in_Ha_Giang,_Vietnam_-_2012_-_121_(10062070653).jpg | Public domain |  |
| hagiang-rice-terraces | 하장의 산과 논 · Hà Giang | minhphuc_99kdd | https://commons.wikimedia.org/wiki/File:Rice_terraces_in_Ha_Giang,_Vietnam_-_2012_-_128_(10061901123).jpg | Public domain | atlas: hagiang |
| nhatrang-beach | 나트랑 해변 · Nha Trang | Quangpraha | https://commons.wikimedia.org/wiki/File:Nha-trang-3039566.jpg | CC0 1.0 | atlas: nhatrang |
| dalat-xuan-huong-lake | 달랏 쑤언흐엉 호수 · Đà Lạt | Diane Selwyn | https://commons.wikimedia.org/wiki/File:Xuan_Huong_Lake_05.jpg | Public domain | atlas: dalat |
| hue-imperial-city | 후에 황성 · Hoàng thành Huế | SerChevalerie | https://commons.wikimedia.org/wiki/File:Hue_Imperial_City,_February_2025.jpg | CC0 1.0 | atlas: hue, history roll |
| sapa-rice-terraces | 사파의 계단식 논 · Sa Pa | Eerin25 | https://commons.wikimedia.org/wiki/File:Rice_terraces_in_Sapa,_Vietnam.jpg | CC0 1.0 | atlas: sapa |
| ninhbinh-trang-an | 닌빈 짱안 · Tràng An | Jakub Hałun | https://commons.wikimedia.org/wiki/File:Trang_An_Landscape_Complex,_Ninh_Binh_Province,_Vietnam,_20240202_1340_5144.jpg | CC BY 4.0 | atlas: ninhbinh |
| muine-red-dunes | 무이네 붉은 모래 언덕 · Mũi Né | Benoît Prieur | https://commons.wikimedia.org/wiki/File:Sand_dune_Mui_N%C3%A9_2003.jpg | CC0 1.0 | atlas: muine |
| phongnha-cave-entrance | 퐁냐 동굴 입구 · Phong Nha | Genghiskhanviet | https://commons.wikimedia.org/wiki/File:Phongnhakebang2.jpg | Public domain | atlas: phongnha |
| saigon-notre-dame | 호찌민시 노트르담 성당 · Saigon | son do | https://commons.wikimedia.org/wiki/File:Saigon_Notre-Dame_Cathedral_(14242681624).jpg | CC BY 2.0 | atlas: saigon |
| phutho-hung-temple-thuong | 덴훙 상궁 · Đền Thượng, Phú Thọ | Viethavvh | https://commons.wikimedia.org/wiki/File:Thuong_temple.JPG | Public domain | history roll |
| dong-son-bronze-drum | 동선 청동북 · Trống đồng Đông Sơn | Gary Todd | https://commons.wikimedia.org/wiki/File:Dong_Son_Bronze_Drum_08.jpg | CC0 1.0 | history roll |
| co-loa-an-duong-vuong-temple | 꼬로아 안즈엉브엉 사당 · Cổ Loa | Julez A. | https://commons.wikimedia.org/wiki/File:An_Duong_Vuong_Temple_Gate_Co_Loa.jpg | CC BY-SA 4.0 | history roll |
| me-linh-hai-ba-trung-temple | 하이바쯩 사당 · Mê Linh | Ltn12345 | https://commons.wikimedia.org/wiki/File:Hai_B%C3%A0_Tr%C6%B0ng_Temple_(M%C3%AA_Linh)_20230123_(12).png | CC BY-SA 4.0 | history roll |
| nhatrang-po-nagar-towers | 포나가르 참 탑 · Tháp Bà Ponagar | Ms Sarah Welch | https://commons.wikimedia.org/wiki/File:04052023_Ponagar_Hindu_temples_complex,_Nha_Trang_Vietnam_-_21.jpg | CC0 1.0 | history roll |
| bach-dang-river-mouth | 바익당 강 하구 · Cửa sông Bạch Đằng | Viethavvh | https://commons.wikimedia.org/wiki/File:Cua_song_Bach_Dang.JPG | Public domain | history roll |
| saigon-tran-hung-dao-temple | 쩐흥다오 사당 · Đền Trần Hưng Đạo | Bùi Thụy Đào Nguyên | https://commons.wikimedia.org/wiki/File:%C4%90%E1%BB%81n_Tr%E1%BA%A7n_H%C6%B0ng_%C4%90%E1%BA%A1o_(S%C3%A0i_G%C3%B2n).jpg | CC BY-SA 3.0 | history roll |
| hanoi-temple-of-literature | 하노이 문묘 · Văn Miếu | Daderot | https://commons.wikimedia.org/wiki/File:Main_gate_-_Temple_of_Literature,_Hanoi_-_DSC04519.JPG | CC0 1.0 | history roll |
| saigon-independence-palace | 통일궁 · Dinh Độc Lập | Balon Greyjoy | https://commons.wikimedia.org/wiki/File:20190923_Independence_Palace-10.jpg | CC0 1.0 | history roll |
| saigon-landmark81-thuthiem | 랜드마크 81 · Thủ Thiêm | Cuong Tran | https://commons.wikimedia.org/wiki/File:Landmark_81_viewed_from_Thu_Thiem.png | CC0 1.0 | history roll |

CC BY photos show author, source link and licence in the hero caption or
under cover images, and every photo is listed on the about page.

## Removed on 2026-11-04

Five earlier slideshow photos were copied from
https://github.com/tiennh1995/vietnam_travel without an identified
photographer or licence; one carried a Zing.vn credit. They were removed and
replaced. Do not restore them. Unsplash hotlinks (several showing places
outside Vietnam or the wrong city) were replaced on 2026-11-05.
