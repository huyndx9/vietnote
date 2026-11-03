# VIETNOTE — Bản mới nhất để phát triển bằng Codex

Bản xuất ngày 04/11/2026, dựa trên phiên bản Sites số 6.
Source commit: f2af727b1f8317c39a4497829a3c62933641723d

## Đã có
- Trang chủ Magazine Style, ảnh chụp thật Hạ Long và typography đã chỉnh.
- 8 trang chính: trang chủ, điểm đến, lịch trình, ăn uống, góc người địa phương, hướng dẫn, giới thiệu, sổ tay.
- 17 trang chi tiết có đường dẫn riêng.
- Tìm kiếm tiếng Hàn/Anh, lọc miền/thành phố, lưu yêu thích, chia sẻ, liên kết Google Maps, sao chép câu tiếng Việt.
- Sổ tay và ghi chú sửa thông tin lưu trên trình duyệt.

## Chạy trên máy
1. Giải nén toàn bộ file ZIP.
2. Mở thư mục `vietnote` trong Codex.
3. Nếu máy đã có Python 3, chạy:
   `python -m http.server 8000 --directory dist`
4. Mở http://localhost:8000

Windows có thể dùng `py` thay `python`, hoặc chạy START-WINDOWS.bat.
Không mở trực tiếp index.html bằng file:// vì website dùng đường dẫn tuyệt đối.

## Chỉnh sửa
- `src/home.html`: nguồn trang chủ.
- `src/build.py`: nội dung và mẫu các trang mới.
- `dist/assets/pages.js`: chức năng dùng chung.
- `dist/assets/pages.css`: giao diện các trang mới.
- `dist/assets/typography.css`: kiểu chữ toàn website.
- Chạy `python src/build.py` sau khi sửa nội dung/mẫu trang.
- Các file trong `dist/` là website đã dựng, có thể triển khai ngay trên static hosting.

## Dùng với Codex
Dán nội dung trong CODEX-PROMPT.md để bắt đầu. Giữ thư mục này làm nguồn chính;
website đang có trên Sites không tự đồng bộ với thay đổi trong thư mục này.

## Chưa kết nối
- DeepSeek chỉ có giao diện và trạng thái chưa kết nối. Không có API key trong gói.
- Ghi chú sửa thông tin chưa gửi đến quản trị viên.
- Chưa có tài khoản, cơ sở dữ liệu hay đồng bộ sổ tay giữa thiết bị.
- Ảnh phụ và font còn tải từ nguồn ngoài; ảnh hero đã lưu trong dự án.
- Nội dung là bản biên tập khởi đầu, cần bổ sung trước khi dùng làm cẩm nang đầy đủ.

Ảnh hero thật: Haneul Trac / Pexels, đã ghi nguồn ở chân trang.
Không kèm Git history, thông tin xác thực hay cấu hình định danh Sites.
