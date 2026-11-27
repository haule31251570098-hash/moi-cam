# Mối Cam · Sàn kết nối cam sành

Bản mẫu web (mobile-first) của nhóm sinh viên môn Tư duy thiết kế, UEH. Dữ liệu, tên người và đơn vị đều là giả lập.

## Ba vai đăng nhập (OTP mô phỏng: 2468)
- **Nông dân**: khai lứa cam, xem người mua phù hợp, nhận đơn, theo dõi hợp đồng và tiền về tay.
- **Thương lái và người mua** (thương lái, vựa, bếp ăn, F&B, chế biến): xem nguồn hàng sắp chín, đăng đơn có cam kết, nộp cọc, xác nhận lần 2, lập biên bản cân, thanh toán.
- **Hợp tác xã**: công bố giá tham chiếu (trung vị ≥3 báo giá), chỉnh tham số biên độ, xác minh người mua, sổ cọc, giám định tranh chấp, tiêu chuẩn phân loại, phát triển nguồn cầu, chế độ trình diễn.

## Cơ chế chính
- Cam kết sản lượng có dung sai, phân loại theo bảng tiêu chuẩn HTX (Loại 1 ≥70 mm, Loại 2 60–<70 mm, Dạt 50–<60 mm, Bỏ <50 mm), lấy mẫu 3 sọt/tấn, HTX giám định lại.
- Biên độ giá: `B(vùng, mùa, T) = phân vị 80 của |ΔP trong T ngày|`, dữ liệu cùng vùng, cùng mùa, 2 năm; thiếu 60 quan sát thì dùng cấp tỉnh; làm tròn 0,5%, giới hạn 3–20%. Đơn ≤3 ngày chốt giá cứng.
- Cọc: người mua 10/5/3% theo hạng; thành viên HTX được HTX bảo lãnh, ngoài HTX cọc 3%. Hủy trước xác nhận lần 2 mất 30%, sau đó mất 100%, đã hái thêm công hái. Lý do hợp lệ (vượt biên độ, bất khả kháng) không phạt.
- Tiền cọc thật do ngân hàng/tổ chức trung gian thanh toán được cấp phép hoặc HTX giữ; web chỉ hiển thị trạng thái.
- Tiền về tay (ước tính) = tổng (kg từng loại × giá loại đó) − chi phí nông dân phải lo (công hái 600 đ/kg, xe 300 đ/kg nếu đơn ghi nông dân lo). Ước tính theo tỷ lệ loại nông dân khai; tiền thật tính theo biên bản cân. Đơn mua xô tính trên cả vườn; đơn mua lựa chỉ tính các loại đơn mua, phần còn lại của lứa bán cho đơn khác. Cọc là tiền của người mua, trừ vào phần người mua còn phải trả, không trừ vào tiền của nông dân.

## Chạy
Mở `index.html` hoặc bật GitHub Pages (nhánh `main`, thư mục gốc). Không cần cài đặt.
