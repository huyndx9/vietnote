Hãy đọc README.md, README-technical.md, src/build.py và các assets trước khi sửa.
Đây là bản VIETNOTE mới nhất, không phải file ZIP một trang cũ.

Giữ giao diện Magazine Style, ảnh chụp thật Hạ Long, typography đã chỉnh và các trang hiện có.
Trước tiên chạy dự án, kiểm tra menu, trang chi tiết, tìm kiếm, bộ lọc và sổ tay.
Chỉ sửa lỗi quan sát được; không dựng lại từ template hoặc thay bằng bản cũ.

Mục tiêu tiếp theo là kết nối trợ lý DeepSeek:
- Tạo endpoint phía máy chủ phù hợp nền tảng triển khai được chọn.
- Giữ DEEPSEEK_API_KEY ở biến môi trường phía máy chủ, tuyệt đối không đưa vào trình duyệt.
- Kiểm tra model và API theo tài liệu chính thức hiện hành trước khi tích hợp.
- Tư vấn du lịch Việt Nam bằng tiếng Hàn, ưu tiên nội dung VIETNOTE và dẫn link bài thật.
- Giới hạn độ dài câu hỏi, câu trả lời, lịch sử và tần suất để tiết kiệm chi phí.
- Xử lý thiếu API key và lỗi API rõ ràng; không giả lập câu trả lời AI.
- Không tự đổi framework nếu chưa cần. Khi phải chuyển cấu trúc, giữ toàn bộ chức năng và thiết kế.
- Không yêu cầu dán API key vào chat. Hướng dẫn cấu hình secret ở môi trường chạy.

Sau khi hoàn tất, báo phần đã làm, cách kiểm tra và những phần chưa kết nối.
