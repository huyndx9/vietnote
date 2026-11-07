# VIETNOTE

Tạp chí du lịch Việt Nam bằng tiếng Hàn, dạng website tĩnh.
Bản công khai: https://huyndx9.github.io/vietnote/

## Có gì trong website

- Trang chủ Magazine Style với ảnh thật vịnh Hạ Long và bản đồ du lịch ngay sau ảnh hero.
- Các trang chính: điểm đến, lịch trình, ăn uống, góc người địa phương, hướng dẫn,
  bản đồ, giới thiệu, sổ tay; 17 bài hiện có và 42 cẩm nang địa điểm có đường dẫn riêng.
- Bản đồ Leaflet với 42 điểm đến, lọc theo miền và sở thích, tìm kiếm không dấu.
- Tìm kiếm tiếng Hàn/Anh, lọc miền/thành phố, lưu yêu thích, chia sẻ,
  liên kết Google Maps, sao chép câu tiếng Việt.

## Cấu trúc thư mục

```
src/
  build.py              Script build (chỉ dùng thư viện chuẩn Python 3)
  content/              Nội dung: site.json, destinations.json, articles.json,
                        guides.json, itineraries.json, map-destinations.json
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
  `travel-map.css`, `pages.js`, `travel-map.js`. Giữ bản dễ đọc; trang tự gắn
  `?v=<hash>` vào CSS/JS khi build nên trình duyệt luôn tải bản mới.

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

## Font và ảnh

- Chữ thân bài dùng Pretendard (OFL-1.1), font ưu tiên tiếng Hàn và có đủ dấu tiếng
  Việt; tiêu đề lớn dùng Playfair Display (OFL-1.1). Cả hai đã được cắt gọn trong
  `src/assets/fonts/*-subset.woff2`.
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
