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
| hanoi-turtle-tower-dusk | 호안끼엠 호수의 거북탑 · Tháp Rùa | cloud.shepherd | https://commons.wikimedia.org/wiki/File:Ho%C3%A0n_Ki%E1%BA%BFm_Lake.jpg | CC BY 2.0 | slideshow, atlas: hanoi, history |
| hoian-old-town-bicycle | 호이안 구시가지 · Hội An Ancient Town | Thong Vo, Titi Wanderer | https://commons.wikimedia.org/wiki/File:Ti%E1%BB%87m153%2Bxe%C4%90%E1%BA%A1p%26c%C3%A2y.jpg | CC0 1.0 | history |
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
| hue-imperial-city | 후에 황성 · Hoàng thành Huế | SerChevalerie | https://commons.wikimedia.org/wiki/File:Hue_Imperial_City,_February_2025.jpg | CC0 1.0 | atlas: hue, history |
| sapa-rice-terraces | 사파의 계단식 논 · Sa Pa | Eerin25 | https://commons.wikimedia.org/wiki/File:Rice_terraces_in_Sapa,_Vietnam.jpg | CC0 1.0 | atlas: sapa |
| ninhbinh-trang-an | 닌빈 짱안 · Tràng An | Jakub Hałun | https://commons.wikimedia.org/wiki/File:Trang_An_Landscape_Complex,_Ninh_Binh_Province,_Vietnam,_20240202_1340_5144.jpg | CC BY 4.0 | atlas: ninhbinh |
| muine-red-dunes | 무이네 붉은 모래 언덕 · Mũi Né | Benoît Prieur | https://commons.wikimedia.org/wiki/File:Sand_dune_Mui_N%C3%A9_2003.jpg | CC0 1.0 | atlas: muine |
| phongnha-cave-entrance | 퐁냐 동굴 입구 · Phong Nha | Genghiskhanviet | https://commons.wikimedia.org/wiki/File:Phongnhakebang2.jpg | Public domain | atlas: phongnha |
| saigon-notre-dame | 호찌민시 노트르담 성당 · Saigon | son do | https://commons.wikimedia.org/wiki/File:Saigon_Notre-Dame_Cathedral_(14242681624).jpg | CC BY 2.0 | atlas: saigon |
| phutho-hung-temple-thuong | 덴훙 상궁 · Đền Thượng, Phú Thọ | Viethavvh | https://commons.wikimedia.org/wiki/File:Thuong_temple.JPG | Public domain | history |
| dong-son-bronze-drum | 동선 청동북 · Trống đồng Đông Sơn | Gary Todd | https://commons.wikimedia.org/wiki/File:Dong_Son_Bronze_Drum_08.jpg | CC0 1.0 | history |
| co-loa-an-duong-vuong-temple | 꼬로아 안즈엉브엉 사당 · Cổ Loa | Julez A. | https://commons.wikimedia.org/wiki/File:An_Duong_Vuong_Temple_Gate_Co_Loa.jpg | CC BY-SA 4.0 | history |
| me-linh-hai-ba-trung-temple | 하이바쯩 사당 · Mê Linh | Ltn12345 | https://commons.wikimedia.org/wiki/File:Hai_B%C3%A0_Tr%C6%B0ng_Temple_(M%C3%AA_Linh)_20230123_(12).png | CC BY-SA 4.0 | history |
| nhatrang-po-nagar-towers | 포나가르 참 탑 · Tháp Bà Ponagar | Ms Sarah Welch | https://commons.wikimedia.org/wiki/File:04052023_Ponagar_Hindu_temples_complex,_Nha_Trang_Vietnam_-_21.jpg | CC0 1.0 | history |
| bach-dang-river-mouth | 바익당 강 하구 · Cửa sông Bạch Đằng | Viethavvh | https://commons.wikimedia.org/wiki/File:Cua_song_Bach_Dang.JPG | Public domain | history |
| saigon-tran-hung-dao-temple | 쩐흥다오 사당 · Đền Trần Hưng Đạo | Bùi Thụy Đào Nguyên | https://commons.wikimedia.org/wiki/File:%C4%90%E1%BB%81n_Tr%E1%BA%A7n_H%C6%B0ng_%C4%90%E1%BA%A1o_(S%C3%A0i_G%C3%B2n).jpg | CC BY-SA 3.0 | history |
| hanoi-temple-of-literature | 하노이 문묘 · Văn Miếu | Daderot | https://commons.wikimedia.org/wiki/File:Main_gate_-_Temple_of_Literature,_Hanoi_-_DSC04519.JPG | CC0 1.0 | history |
| saigon-independence-palace | 통일궁 · Dinh Độc Lập | Balon Greyjoy | https://commons.wikimedia.org/wiki/File:20190923_Independence_Palace-10.jpg | CC0 1.0 | history |
| saigon-landmark81-thuthiem | 랜드마크 81 · Thủ Thiêm | Cuong Tran | https://commons.wikimedia.org/wiki/File:Landmark_81_viewed_from_Thu_Thiem.png | CC0 1.0 | history |
| place-quynhon | 꾸이년 · Quy Nhơn | Boconganh Phan | https://commons.wikimedia.org/wiki/File:Ky_Co_-_Nhon_Ly_-_Quy_Nhon_-_Binh_Dinh_-_Viet_Nam.jpg | Public domain | atlas: quynhon |
| place-cantho | 껀터 · 메콩델타 · Cần Thơ | Vyacheslav Argenberg | https://commons.wikimedia.org/wiki/File:Can_Tho,_Vietnam,_Floating_Market,_Boats.jpg | CC BY 4.0 | atlas: cantho |
| place-condao | 꼰다오 · Côn Đảo | Phương Huy | https://commons.wikimedia.org/wiki/File:Ch%C3%B9a_V%C3%A2n_S%C6%A1n_%E1%BB%9F_C%C3%B4n_%C4%90%E1%BA%A3o_(2).jpg | Public domain | atlas: condao |
| place-catba | 깟바섬 · Cát Bà | Jakub Hałun | https://commons.wikimedia.org/wiki/File:Cat_Ba_Island,_Vietnam,_20240131_1407_4670.jpg | CC BY 4.0 | atlas: catba |
| place-mucangchai | 무깡짜이 · Mù Cang Chải | Doan Tuan danny_pham93 | https://commons.wikimedia.org/wiki/File:Terraces_in_Che_Cu_Nha_commune,_Mu_Cang_Chai_(Unsplash).jpg | CC0 1.0 | atlas: mucangchai |
| place-maichau | 마이쩌우 · Mai Châu | Viethavvh | https://commons.wikimedia.org/wiki/File:Mai_Chau_2008.jpg | Public domain | atlas: maichau |
| place-babe | 바베 호수 · Hồ Ba Bể | Arian Zwegers | https://commons.wikimedia.org/wiki/File:Ba_Be_lake,_local_bus_(6223604145).jpg | CC BY 2.0 | atlas: babe |
| place-dienbien | 디엔비엔푸 · Điện Biên Phủ | Adam Jones from Kelowna, BC, Canada | https://commons.wikimedia.org/wiki/File:Countryside_on_Edge_of_Town_-_Dien_Bien_Phu_-_Vietnam_(48159158386).jpg | CC BY-SA 2.0 | atlas: dienbien |
| place-mocchau | 목쩌우 · Mộc Châu | Linh Pham linharex | https://commons.wikimedia.org/wiki/File:M%E1%BB%99c_Ch%C3%A2u_District,_Vietnam_(Unsplash).jpg | CC0 1.0 | atlas: mocchau |
| place-donghoi | 동허이 · Đồng Hới | Genghiskhan | https://commons.wikimedia.org/wiki/File:Donghoi2.jpg | Public domain | atlas: donghoi |
| place-quangtri | 꽝찌 · 히엔르엉 다리 · Cầu Hiền Lương, Quảng Trị | Rolf Müller | https://commons.wikimedia.org/wiki/File:Benhairiver1.jpg | CC BY-SA 3.0 | atlas: quangtri |
| place-bachma | 박마 국립공원 · Vườn quốc gia Bạch Mã | Andre Hospers | https://commons.wikimedia.org/wiki/File:Bach_Ma_Natinal_Park_Franse_villa.jpg | CC BY 4.0 | atlas: bachma |
| place-bana | 바나힐 · 골든브리지 · Bà Nà Hills, Cầu Vàng | lumoplank | https://commons.wikimedia.org/wiki/File:Ba_Na_Hills_-_BaNa1519.jpg | CC0 1.0 | atlas: bana |
| place-myson | 미선 유적 · Thánh địa Mỹ Sơn | Chainwit. | https://commons.wikimedia.org/wiki/File:2024_-_M%E1%BB%B9_S%C6%A1n_Group_B,_C_and_D_-_img_01.jpg | CC BY 4.0 | atlas: myson |
| place-lyson | 리선섬 · Lý Sơn | minhphuc_99kdd | https://commons.wikimedia.org/wiki/File:Ly_Son_Islands_(14817868968).jpg | Public domain | atlas: lyson |
| place-mangden | 망덴 · Măng Đen | Đào Phúc Quang Vũ | https://commons.wikimedia.org/wiki/File:Cuoc-song-nguoi-dong-bao-tai-lang-kon-pring-thi-tran-mang-den-kon-tum-10.jpg | CC BY-SA 4.0 | atlas: mangden |
| place-buonmathuot | 부온마투옷 · Buôn Ma Thuột | Sketyl none | https://commons.wikimedia.org/wiki/File:Dray_Nur_Waterfall_(49483462012).jpg | CC BY 2.0 | atlas: buonmathuot |
| place-phuyen | 푸옌 · 겐다디아 · Gành Đá Đĩa, Phú Yên | Việt Nguyễn | https://commons.wikimedia.org/wiki/File:Gh%E1%BB%81nh_%C4%91%C3%A1_%C4%91%C4%A9a_ph%C3%BA_y%C3%AAn.jpeg | CC0 1.0 | atlas: phuyen |
| place-vinhhy | 빈히만 · Vịnh Vĩnh Hy | Huy Phương | https://commons.wikimedia.org/wiki/File:V%E1%BB%8Bnh_V%C4%A9nh_Hy,_Ninh_Ch%E1%BB%AF.jpg | Public domain | atlas: vinhhy |
| place-vungtau | 붕따우 · Vũng Tàu | NDTK08 | https://commons.wikimedia.org/wiki/File:Bai_Truoc_Vung_Tau.jpg | CC BY 4.0 | atlas: vungtau |
| place-tayninh | 떠이닌 · 바덴산 · Núi Bà Đen, Tây Ninh | Cuong Tran | https://commons.wikimedia.org/wiki/File:Dau_Tieng_Lake_-_50766650163.png | Public domain | atlas: tayninh |
| place-bentre | 벤째 · Bến Tre | Balon Greyjoy | https://commons.wikimedia.org/wiki/File:20190924_coconut_pile-1.jpg | CC0 1.0 | atlas: bentre |
| place-chaudoc | 쩌우독 · Châu Đốc | trungydang | https://commons.wikimedia.org/wiki/File:B%E1%BB%9D_s%C3%B4ng_Ch%C3%A2u_%C4%90%E1%BB%91c,_ch%C3%A2u_Ph%C3%BA_B,An_giang_-_panoramio.jpg | CC BY 3.0 | atlas: chaudoc |
| place-hatien | 하띠엔 · Hà Tiên | Kien Mike | https://commons.wikimedia.org/wiki/File:Bi%E1%BB%83n_H%C3%A0_Ti%C3%AAn_(52351874122).jpg | Public domain | atlas: hatien |
| place-namdu | 남주 군도 · Quần đảo Nam Du | trungydang | https://commons.wikimedia.org/wiki/File:Bai_Cay_Men,Dao_nam_du.Xa_An_S%C6%A1n,huyen_Ki%C3%AAn_H%E1%BA%A3i,_t%E1%BB%89nh_Ki%C3%AAn_Giang,_Vi%E1%BB%87t_Nam,02-07-2016-Dyt_-_panoramio.jpg | CC BY 3.0 | atlas: namdu |
| place-camau | 까마우 · 무이까마우 · Mũi Cà Mau | Colalumbu | https://commons.wikimedia.org/wiki/File:Muicamau.jpg | CC BY-SA 4.0 | atlas: camau |
| place-puluong | 푸루옹 · Pù Luông | Thái Nhi | https://commons.wikimedia.org/wiki/File:CacvandongvienMarathonoPuLuong.jpg | CC0 1.0 | atlas: puluong |

CC BY photos show author, source link and licence in the hero caption or
under cover images, and every photo is listed on the about page.

## Removed on 2026-11-04

Five earlier slideshow photos were copied from
https://github.com/tiennh1995/vietnam_travel without an identified
photographer or licence; one carried a Zing.vn credit. They were removed and
replaced. Do not restore them. Unsplash hotlinks (several showing places
outside Vietnam or the wrong city) were replaced on 2026-11-05.

All 42 atlas destinations have a photo (2026-11-08). The Bà Nà Golden Bridge
photo is CC0 on Commons, but the giant-hands sculpture may itself be
protected; replace place-bana if that is a concern.
