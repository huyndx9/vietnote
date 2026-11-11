# VIETNOTE

Tạp chí du lịch Việt Nam bằng tiếng Hàn, dạng website tĩnh.
Bản công khai: https://huyndx9.github.io/vietnote/

## Có gì trong website

- Trang chủ Magazine Style với ảnh thật vịnh Hạ Long và bản đồ du lịch ngay sau ảnh hero.
- Các trang chính: điểm đến, lịch trình, ăn uống, góc người địa phương, hướng dẫn,
  bản đồ, cộng đồng, giới thiệu, sổ tay; 17 bài hiện có và 42 cẩm nang địa điểm có đường dẫn riêng.
- Bản đồ Leaflet với 42 điểm đến, lọc theo miền và sở thích, tìm kiếm không dấu.
- Tìm kiếm tiếng Hàn/Anh, lọc miền/thành phố, lưu yêu thích, chia sẻ,
  liên kết Google Maps, sao chép câu tiếng Việt.

## Cấu trúc thư mục

```
src/
  build.py              Script build (chỉ dùng thư viện chuẩn Python 3)
  content/              Nội dung: site.json, destinations.json, articles.json,
                        guides.json, itineraries.json, map-destinations.json,
                        eats.json (quán ăn/cafe), community.json
  templates/            HTML theo cú pháp string.Template ($ten hoặc ${ten})
  assets/               CSS/JS viết tay (bản dễ đọc), font, ảnh, thư viện vendor
  photos/               Ảnh gốc lớn (không triển khai)
  font-hangul.txt       Danh sách âm tiết Hangul có trong font subset
scripts/
  build-pages.py        Build bản GitHub Pages vào _site/
  subset-fonts.py       Tạo lại font subset
  optimize-images.py    Tạo các cỡ ảnh WebP cho srcset
dist/, _site/           Kết quả build — tự sinh, không commit
```

## Build và chạy trên máy

Cần Python 3, không cần cài thêm thư viện.

```bash
python3 src/build.py
```

```bash
python3 -m http.server 8000 --directory dist
```

Mở http://localhost:8000. Trên Windows có thể chạy `START-WINDOWS.bat` (tự build rồi
mở server). Không mở trực tiếp `index.html` bằng `file://`.

Bước build xóa và tạo lại `dist/`: chép `src/assets/` sang `dist/assets/`, sinh
`content.js` và `map-destinations.js` từ `src/content/`, rồi dựng mọi trang từ
template. Không sửa trực tiếp file trong `dist/` hay `_site/`.

## Chỉnh sửa

- **Nội dung bài viết**: sửa file JSON trong `src/content/`. Mỗi bài có trường
  `date` (dạng `YYYY-MM-DD`) hiển thị thành “편집일” trên trang chi tiết.
  Tiêu đề danh mục, phụ đề và ghi chú miễn trừ nằm trong `site.json`.
- **Điểm đến trên bản đồ**: `src/content/map-destinations.json` (teaser, `paragraphs`,
  `experiences`, `tip`). Số điểm đến hiển thị được tính từ file này.
- **HTML**: `src/templates/`. `layout.html` là khung chung (head, header, footer, script);
  `home.html` là phần thân trang chủ; `atlas.html` dùng chung cho trang bản đồ và trang chủ.
  Ký tự `$` trong template phải viết thành `$$`.
- **Giao diện và chức năng**: `src/assets/base.css`, `pages.css`, `typography.css`,
  `travel-map.css`, `theme.css`, `pages.js`, `travel-map.js`. Giữ bản dễ đọc; trang tự gắn
  `?v=<hash>` vào CSS/JS khi build nên trình duyệt luôn tải bản mới.
- **Màu và kiểu giao diện (“Nắng Hội An”)**: bảng màu là các biến trong `:root` ở đầu
  `base.css` (vàng nắng, xanh biển, đỏ cam đèn lồng, mực đêm…); không viết mã màu trực tiếp
  trong quy tắc CSS mà dùng biến. `theme.css` nạp cuối cùng, chứa header, hero, dải chữ chạy,
  footer, thẻ bưu thiếp, ảnh khung vòm và các thành phần chung. Màu vùng thống nhất:
  Bắc vàng, Trung đỏ cam, Nam xanh biển. Chữ nhỏ trên nền màu dùng `--sea-band`/`--ink`
  để đạt độ tương phản WCAG AA.
- **Ảnh hero**: thứ tự slide theo thứ tự trong `photos.json` (ảnh có `"hero": false` bị bỏ
  qua); ảnh đầu tiên cũng là ảnh được preload.

## Đường dẫn và GitHub Pages

Mọi đường dẫn nội bộ được tạo với `BASE_PATH` ngay khi build, không thay chuỗi sau đó.

```bash
python3 scripts/build-pages.py --base-path /vietnote/
```

Lệnh trên tương đương `python3 src/build.py --base-path /vietnote/ --out _site`
và thêm `.nojekyll`. Trong HTML/template dùng `${base}`; trong Python dùng
`site.url('...')`; JS đọc base từ `<meta name="vietnote-base">`; CSS dùng đường dẫn
tương đối (ví dụ `url("fonts/...")`).

Workflow `Publish GitHub Pages` build và triển khai mỗi khi push lên `main`.
Trong Settings → Pages của repository, chọn **GitHub Actions**. Sau khi workflow
chạy thành công, kiểm tra trực tiếp https://huyndx9.github.io/vietnote/ .

## SEO và xem trước liên kết

Build tự sinh các phần sau, không cần sửa tay:

- `sitemap.xml` (mọi trang được lập chỉ mục, kèm `lastmod` lấy từ trường `date`) và `robots.txt`.
- `<link rel="canonical">`, Open Graph và Twitter card cho từng trang, dựa trên `public_url` trong `src/content/site.json`.
- JSON-LD: `WebSite` (trang chủ), `Article` (bài viết, lịch trình, hướng dẫn), `TouristDestination`
  (42 trang địa điểm), `CollectionPage` (trang danh mục), `FAQPage` (cộng đồng), `ItemList` quán ăn/cafe,
  `AboutPage` và `BreadcrumbList`.
- Trang `notebook/` và `404.html` có `noindex` và không nằm trong sitemap.

Mỗi trang có meta description riêng: trường `meta_description` trong các file nội dung,
`description` của danh mục và mục `pages` trong `site.json`. Trang địa điểm dùng
`meta_description` trong `place-guides.json` nếu có, nếu không sẽ ghép từ teaser và thời gian
lưu trú. Build cảnh báo khi mô tả ngoài khoảng 40–160 ký tự hoặc bị trùng.

Ảnh xem trước là JPEG 1200×630 trong `src/assets/og/`, tạo bằng `scripts/optimize-images.py`
(cắt theo `position` của ảnh). Khi thêm ảnh mới vào `photos.json`, chạy lại script này.

GitHub Pages của dự án nằm ở `/vietnote/`, nên công cụ tìm kiếm không đọc `robots.txt` tại
`/vietnote/robots.txt` (chỉ đọc ở gốc tên miền). Hãy gửi
`https://huyndx9.github.io/vietnote/sitemap.xml` trong Google Search Console và Naver Search
Advisor. `robots.txt` sẽ có hiệu lực nếu sau này dùng tên miền riêng.

## Liên kết giữa các trang, quán ăn và cafe

- **Quán ăn và cafe theo địa điểm**: `src/content/eats.json`. Mục `places` ghi danh sách quán
  theo id địa điểm (`type`: `food` hoặc `cafe`, `name` tên tiếng Việt, `ko` phiên âm tiếng Hàn,
  `dish` món nên thử, `area` khu vực). Hai trường tuỳ chọn: `place_id` (Place ID của Google,
  dạng `ChIJ…`) để nút "지도에서 보기" mở đúng quán, và `address` (địa chỉ như Google ghi) hiện
  trên thẻ cho khách đưa tài xế. Lấy Place ID: mở quán trên Google Maps, chia sẻ link, rồi tra
  bằng công cụ Place ID Finder của Google (developers.google.com/maps/documentation/places/web-service/place-id).
  Quán chưa có `place_id` thì link tìm theo tên + thành phố. Thêm quán vào đây là trang `places/<id>/` tự hiện khối
  "맛집과 카페" (kèm link Google Maps và JSON-LD `ItemList`), trang 음식과 카페 tự cập nhật mục
  "지역별 맛집·카페", và tìm kiếm tìm được theo tên quán. Mục `nearby` cho địa điểm không có quán
  riêng mượn danh sách của thành phố lưu trú (ví dụ Bà Nà → Đà Nẵng). Địa điểm chưa có dữ liệu
  hiện danh sách món và nút tìm trên Google Maps. Không ghi giá, giờ mở cửa hay số nhà; hãy kiểm
  tra quán còn hoạt động trước khi thêm.
- **Liên kết chéo**: trường `guides` (danh sách id địa điểm) trong `itineraries.json`,
  `articles.json`, `destinations.json` nối bài viết với cẩm nang địa điểm theo cả hai chiều:
  bài viết hiện thẻ địa điểm và dòng "함께 보기"; trang địa điểm hiện khối "READ NEXT" gồm các
  lịch trình/bài viết có nhắc tới nó. Build báo lỗi nếu id không tồn tại.

## Trang cộng đồng (커뮤니티)

`community/` gồm câu hỏi thường gặp (`src/content/community.json`, có JSON-LD `FAQPage`, mỗi
câu trả lời dẫn về bài hướng dẫn tương ứng), quy tắc chung và khu thảo luận. Cấu hình trong mục
`community` của `site.json`:

- `channels`: danh sách `{ "label", "url", "note" }` (ví dụ KakaoTalk open chat, Naver Cafe,
  Instagram). Để trống thì không hiện.
- `giscus`: điền `repo`, `repo_id`, `category`, `category_id` lấy từ https://giscus.app sau khi
  bật Discussions cho repository và cài ứng dụng giscus. Khi còn trống, trang hiện "게시판은 준비
  중이에요". Người bình luận cần tài khoản GitHub.

Mã xác minh Google Search Console / Naver Search Advisor: điền vào `verification.google` /
`verification.naver` trong `site.json`; build chèn thẻ meta vào trang chủ.

## Font và ảnh

- Chữ thân bài dùng Pretendard (OFL-1.1), font ưu tiên tiếng Hàn và có đủ dấu tiếng
  Việt, đã cắt gọn trong `src/assets/fonts/Pretendard-subset.woff2`.
- Phông hiển thị (OFL-1.1): Black Han Sans cho tiêu đề lớn tiếng Hàn, Bricolage Grotesque
  cho logo và tiêu đề Latin, Nanum Pen Script cho dòng ghi chú viết tay. Chúng nằm trong
  `src/assets/fonts/<tên phông>/`. Black Han Sans và Bricolage chia nhỏ theo dải Unicode
  (`display-fonts.css`) nên mỗi trang chỉ tải phần chứa ký tự đang dùng; tạo lại bằng
  `python3 scripts/vendor-display-fonts.py` (cần npm). Build cảnh báo nếu tiêu đề dùng âm tiết
  mà Black Han Sans không có.
- Nanum Pen Script chỉ chứa đúng các ký tự của dòng ghi chú viết tay (class `hand`,
  `hero-hand`, `footer-hand`), khoảng 15 KB. Khi sửa hoặc thêm ghi chú viết tay, nếu build báo
  `WARNING: handwriting font lacks …`, chạy `pip install fonttools brotli` rồi
  `python3 src/build.py && python3 scripts/subset-hand-font.py && python3 src/build.py`.
- Pretendard giữ 2.350 âm tiết Hangul thông dụng (KS X 1001) và mọi âm tiết đang dùng.
  Nếu build báo `WARNING: Pretendard subset lacks …`, chạy
  `pip install fonttools brotli` rồi `python3 scripts/subset-fonts.py`.
- Ảnh gốc lớn đặt ở `src/photos/`. Sau khi thay ảnh, chạy `pip install pillow` rồi
  `python3 scripts/optimize-images.py` để tạo các cỡ WebP trong `src/assets/`.
- Chỉ trang chủ preload ảnh hero.
- Mọi ảnh đều lưu trong dự án (Pexels và Wikimedia Commons: CC0, Public domain,
  CC BY). `src/content/photos.json` là danh sách duy nhất: tác giả, giấy phép, ảnh nào
  lên slideshow (`hero`), ảnh nào gắn với điểm đến trên bản đồ (`places`). Trong content
  JSON, trường `photo` ghi tên ảnh (stem) thay vì URL. Build tạo `srcset`, dòng ghi
  nguồn và mục "사진 출처". Thêm ảnh: bỏ file gốc vào `src/photos/`, thêm mục vào
  photos.json, chạy `python3 scripts/optimize-images.py`. Chi tiết ở
  `src/assets/PHOTO-SOURCES.md`; nguồn dữ liệu bản đồ trong `src/MAP-SOURCE.md`.
- Trang chủ có thêm dải 3 lịch trình mẫu và khối "언제 갈까요" theo miền
  (`src/content/seasons.json`, chỉ là xu hướng chung, kèm lời nhắc xem dự báo).
- Dưới đoạn "A country of a thousand untold stories" là dải trượt 13 chương lịch sử
  (từ truyền thuyết Hùng Vương đến hôm nay), mỗi chương có ảnh, mô tả ngắn, nơi đến
  được hôm nay và link trang điểm đến. Không tự chạy: vuốt, kéo, nút ← →, thanh mốc
  năm hoặc phím mũi tên. Nội dung trong `src/content/history.json` (sửa chữ, đổi ảnh
  bằng stem trong photos.json, xóa một mục để bỏ chương).
- Trang 여행지 liệt kê đủ 42 điểm đến của bản đồ (lọc Bắc/Trung/Nam, tìm kiếm).

## Điện thoại ở chế độ "trang web cho máy tính"
- Một số trình duyệt (Chrome có bật "데스크톱 사이트", trình duyệt trong ứng dụng) bỏ qua
  thẻ viewport và dựng trang rộng khoảng 980px, nên điện thoại hiện bố cục máy tính bị thu nhỏ.
- `src/desktop_mode.py` xử lý tự động: đoạn script trong `<head>` nhận ra màn hình cảm ứng
  nhỏ đang hiển thị bố cục rộng, gắn class `rds` và phóng trang về đúng bề rộng màn hình;
  lúc build, mỗi khối `@media` theo bề rộng được nhân bản theo bề rộng thiết bị, đơn vị
  `vw`/`vh` đổi sang biến. Ở chế độ bình thường giao diện không thay đổi.
- Khi viết CSS mới cứ dùng `@media (max-width: …)` và `vw`/`vh` như thường; build tự xử lý.

## Hành vi và giới hạn hiện tại

- Tìm kiếm và lọc chạy hoàn toàn trên trình duyệt.
- Sổ tay và ghi chú sửa thông tin lưu trong localStorage, không đồng bộ giữa các thiết bị
  và không gửi đến quản trị viên.
- Chia sẻ dùng native share nếu có, nếu không thì sao chép liên kết.
- Nút bản đồ mở Google Maps; bản đồ Leaflet không cần API key hay tile bên ngoài.
- Trợ lý DeepSeek: khi `ai_endpoint` trong `site.json` còn trống, khung chat hiển thị
  "chưa kết nối" và chỉ gợi ý bài viết. Xem mục "Kết nối chatbot DeepSeek" bên dưới.
- Lịch trình là gợi ý biên tập, không phải sản phẩm đặt chỗ. Thông tin nhập cảnh, giá,
  giờ mở cửa, thời tiết cần kiểm tra lại với nguồn chính thức.
- Chưa có tài khoản hay cơ sở dữ liệu.

## Dùng với Codex

Dán nội dung trong `CODEX-PROMPT.md` để bắt đầu.

## Cẩm nang địa điểm trên bản đồ

Mỗi thẻ bản đồ dẫn tới `places/<id>/`. Trang được dựng từ
`src/content/map-destinations.json` (lời dẫn) và `src/content/place-guides.json`
(đường đi, chỗ ở, món ăn, thời lượng và gợi ý lịch trình riêng). Nội dung chung
cho khách Hàn nằm trong `src/place_guides.py`, giao diện trong
`src/templates/place-guide.html`. Build kiểm tra mỗi địa điểm đều có cẩm nang.

Các bài có 13 phần, mục lục, lưu sổ tay, chia sẻ, câu tiếng Việt để sao chép,
liên kết Google Maps và địa điểm liên quan. Nội dung là hướng dẫn biên tập;
không khẳng định đã trực tiếp đến thăm hoặc cung cấp giá/giờ mở cửa trực tiếp.
Khi bổ sung địa điểm, cập nhật cả hai file JSON và kiểm tra nguồn thông tin.

## Kết nối chatbot DeepSeek

API key không được nằm trong website (mọi file JS đều công khai). Key được lưu làm
secret của một Cloudflare Worker nhỏ (`worker/`); website chỉ gọi Worker đó.

### Cách 1 — chỉ dùng trình duyệt (khuyên dùng)

1. Tạo tài khoản miễn phí tại https://dash.cloudflare.com/sign-up, rồi mở mục
   (workflow tự đăng ký tên miền `*.workers.dev` nếu tài khoản chưa có).
2. Mở https://dash.cloudflare.com/profile/api-tokens → **Create Token** → mẫu
   **Edit Cloudflare Workers** → **Use template** → **Continue to summary** →
   **Create Token** → sao chép token.
3. Mở https://github.com/huyndx9/vietnote/settings/secrets/actions →
   **New repository secret**, tạo 2 secret:
   - `CLOUDFLARE_API_TOKEN` = token ở bước 2
   - `DEEPSEEK_API_KEY` = API key DeepSeek
4. Mở https://github.com/huyndx9/vietnote/actions/workflows/pages.yml →
   **Run workflow** → **Run workflow**. Khoảng 2 phút sau chatbot hoạt động trên
   https://huyndx9.github.io/vietnote/ .

Từ đó mỗi lần push lên `main`, workflow tự triển khai Worker, cập nhật key và đưa URL
Worker vào website. Đổi key: sửa secret `DEEPSEEK_API_KEY` rồi chạy lại workflow.
Nếu token thấy nhiều tài khoản Cloudflare, thêm secret `CLOUDFLARE_ACCOUNT_ID`.
Khi chưa có `CLOUDFLARE_API_TOKEN`, website vẫn được triển khai với trợ lý ở trạng
thái "chưa kết nối".

### Cách 2 — chạy trên máy

Cần Node.js LTS và tài khoản Cloudflare. Chạy `python3 scripts/setup-ai.py` (Windows:
nhấp đúp `SETUP-AI-WINDOWS.bat`), dán API key khi được hỏi. Script đăng nhập
Cloudflare, triển khai Worker, lưu key, ghi URL vào `ai_endpoint` của
`src/content/site.json` và build lại; sau đó commit `site.json` và push.
`--test` hỏi thử Worker; `--endpoint URL` chỉ ghi URL có sẵn.

### Ghi chú

- Lời dặn cho AI (system prompt) và giới hạn độ dài: `worker/index.js`. Website được
  phép gọi Worker: `ALLOWED_ORIGINS` trong `worker/wrangler.toml`.
- Thứ tự ưu tiên URL: biến môi trường `VIETNOTE_AI_ENDPOINT` (workflow đặt) rồi
  `ai_endpoint` trong `site.json`.
- Nên đặt hạn mức chi tiêu trong tài khoản DeepSeek; kiểm tra Origin không chặn được
  người gọi Worker trực tiếp.
