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
- Ảnh hero: Haneul Trac / Pexels (ảnh 36551013), có ghi nguồn ở chân trang. Nguồn và
  giấy phép từng ảnh ghi trong `src/assets/PHOTO-SOURCES.md`; nguồn dữ liệu bản đồ
  trong `src/MAP-SOURCE.md`.

## Hành vi và giới hạn hiện tại

- Tìm kiếm và lọc chạy hoàn toàn trên trình duyệt.
- Sổ tay và ghi chú sửa thông tin lưu trong localStorage, không đồng bộ giữa các thiết bị
  và không gửi đến quản trị viên.
- Chia sẻ dùng native share nếu có, nếu không thì sao chép liên kết.
- Nút bản đồ mở Google Maps; bản đồ Leaflet không cần API key hay tile bên ngoài.
- Trợ lý DeepSeek mới có giao diện và hiển thị rõ trạng thái chưa kết nối; không gọi AI,
  không nhận API key phía trình duyệt. Muốn dùng thật cần route phía máy chủ và secret
  `DEEPSEEK_API_KEY` chỉ nằm ở máy chủ.
- Lịch trình là gợi ý biên tập, không phải sản phẩm đặt chỗ. Thông tin nhập cảnh, giá,
  giờ mở cửa, thời tiết cần kiểm tra lại với nguồn chính thức.
- Một số ảnh phụ còn tải từ Unsplash, chỉ mang tính minh họa.
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
