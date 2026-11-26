/* Mối Cam - Bộ dữ liệu mẫu (giả lập, KHÔNG phải số liệu thật).
   Mọi tên người, tên đơn vị trong file này đều là tên giả định để trình diễn. */
(function () {
  // Bộ sinh số giả ngẫu nhiên có hạt giống để dữ liệu ổn định mỗi lần mở
  function rng(seed) { return function () { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }

  var HOM_NAY = "2026-11-27";

  var VUNG = [
    { id: "tambinh", ten: "Tam Bình", tinh: "Vĩnh Long", htx: "HTX01", goc: 7400, bienDong: 0.022 },
    { id: "traon", ten: "Trà Ôn", tinh: "Vĩnh Long", htx: "HTX01", goc: 7200, bienDong: 0.026 },
    { id: "vungliem", ten: "Vũng Liêm", tinh: "Vĩnh Long", htx: "HTX01", goc: 7000, bienDong: 0.030 }
  ];

  // Sinh chuỗi giá tham chiếu loại 1 theo ngày, 2 năm gần nhất, có tính mùa vụ
  // (mùa rộ tháng 5 đến 8 giá thấp và dao động mạnh; giáp Tết giá cao)
  function sinhChuoiGia(v, seed) {
    var r = rng(seed), out = [], gia = v.goc, d = new Date(Date.UTC(2024, 10, 28));
    var ket = Date.parse(HOM_NAY + "T00:00:00Z");
    while (d.getTime() <= ket) {
      var thang = d.getUTCMonth() + 1;
      var muaRo = thang >= 5 && thang <= 8;
      var mucTieu = v.goc * (muaRo ? 0.62 : (thang === 12 || thang === 1 ? 1.12 : 0.95));
      var sigma = v.bienDong * (muaRo ? 1.6 : 1);
      var soc = r() < 0.015 ? (r() - 0.6) * 0.18 : 0; // thỉnh thoảng có cú sốc dội hàng
      var z = (r() + r() + r() + r() - 2) * 1.2;
      gia = gia + (mucTieu - gia) * 0.04 + gia * (sigma * z + soc);
      gia = Math.max(1500, Math.min(14000, gia));
      out.push({ ngay: d.toISOString().slice(0, 10), loai1: Math.round(gia / 50) * 50 });
      d = new Date(d.getTime() + 864e5);
    }
    return out;
  }
  var lichSuGia = {};
  VUNG.forEach(function (v, i) { lichSuGia[v.id] = sinhChuoiGia(v, 20261127 + i * 977); });

  window.MC_DATA = {
    homNay: HOM_NAY,
    vung: VUNG,
    lichSuGia: lichSuGia,           // giá loại 1; loại 2 = 78%, dạt = 32% của loại 1 (tỷ lệ mẫu)
    heSoLoai: { loai1: 1, loai2: 0.78, dat: 0.32 },

    htx: { id: "HTX01", ten: "HTX Cam Sành Xanh (giả lập)", dienThoai: "0270 000 000", thanhVien: 86 },

    // Tham số quy chế do HTX công bố (có thể chỉnh trong màn hình HTX)
    thamSo: {
      phanVi: 80,            // phân vị dùng tính biên độ (%)
      cuaSoNam: 2,           // số năm dữ liệu gần nhất
      quanSatToiThieu: 60,   // dưới mức này thì dùng dữ liệu cấp tỉnh
      bienDoMin: 3, bienDoMax: 20, lamTron: 0.5,
      ngayGiaCoDinhToiDa: 3, // đơn cắt trong vòng số ngày này được chốt giá cố định
      gioXacNhan2: 48,       // xác nhận lần 2 trước ngày cắt bao nhiêu giờ
      dungSaiMacDinh: 10,    // dung sai sản lượng mặc định (%)
      cocTheoHang: { moi: 10, thuong: 5, uytin: 3 }, // % giá trị đơn
      cocNongDanNgoaiHTX: 3,
      phatHuyTruocXN2: 30,   // % cọc mất khi hủy đơn phương trước xác nhận lần 2
      congHai: 600, xeCho: 300, // đ/kg (mẫu)
      thanhToanTrongGio: 24
    },

    // Tiêu chuẩn phân loại mẫu (HTX ban hành, chỉnh theo thực tế vùng)
    tieuChuan: [
      { ma: "loai1", ten: "Loại 1", duongKinh: "Từ 70 mm trở lên (lọt vòng 70 thì không đạt)", ngoaiQuan: "Vỏ nguyên, không dập; vết sẹo, rám tổng cộng không quá 10% diện tích vỏ", doChin: "Chín sinh lý, vỏ bắt đầu ngả vàng; ruột mọng nước, không khô múi" },
      { ma: "loai2", ten: "Loại 2", duongKinh: "Từ 60 đến dưới 70 mm", ngoaiQuan: "Không dập; vết sẹo, rám không quá 25% diện tích vỏ", doChin: "Như loại 1" },
      { ma: "dat", ten: "Trái dạt", duongKinh: "Từ 50 đến dưới 60 mm, hoặc trái đủ cỡ nhưng khuyết tật vỏ vượt mức loại 2", ngoaiQuan: "Không thối, không dập nát, không sâu đục", doChin: "Đủ chín" },
      { ma: "bo", ten: "Loại bỏ", duongKinh: "Dưới 50 mm", ngoaiQuan: "Thối, dập nát, sâu đục, rụng lâu ngày", doChin: "Không áp dụng" }
    ],
    quyTrinhKiemDinh: [
      "Phân loại bằng bộ thẻ đo cỡ chung (vòng 50, 60, 70 mm) do HTX phát cho cả hai bên.",
      "Lấy mẫu ngẫu nhiên 3 sọt cho mỗi tấn trước sự chứng kiến của hai bên, đếm số trái từng loại.",
      "Tỷ lệ từng loại trong mẫu được áp cho cả lô; ghi biên bản trên sàn kèm ảnh.",
      "Không đồng ý kết quả: bên yêu cầu gọi cán bộ HTX giám định lại trong ngày; kết quả giám định lại là kết quả cuối."
    ],

    nguoiMua: [
      { id: "NM01", ten: "Thương lái Tư Hòa", loai: "Thương lái", vung: "tambinh", sdt: "0901 111 001", hang: "uytin", donXong: 38, huySatNgay: 1, epGia: 0, sao: 4.8, xacMinh: true, nhuCau: "Mua xô loại 1, loại 2 đi chợ đầu mối" },
      { id: "NM02", ten: "Vựa trái cây Năm Phát", loai: "Vựa", vung: "traon", sdt: "0901 111 002", hang: "thuong", donXong: 64, huySatNgay: 3, epGia: 1, sao: 4.4, xacMinh: true, nhuCau: "Gom số lượng lớn, giao đi các tỉnh" },
      { id: "NM03", ten: "Bếp ăn công ty may Phú An", loai: "Bếp ăn tập thể", vung: "tambinh", sdt: "0901 111 003", hang: "uytin", donXong: 12, huySatNgay: 0, epGia: 0, sao: 4.9, xacMinh: true, nhuCau: "Trái cỡ vừa, giao đều mỗi tuần" },
      { id: "NM04", ten: "Chuỗi nước ép Mát Lành", loai: "F&B", vung: "vungliem", sdt: "0901 111 004", hang: "thuong", donXong: 9, huySatNgay: 0, epGia: 0, sao: 4.7, xacMinh: true, nhuCau: "Ép nước, nhận cả loại 2 và trái dạt" },
      { id: "NM05", ten: "Cơ sở mứt và trà Hai Thơm", loai: "Chế biến", vung: "vungliem", sdt: "0901 111 005", hang: "thuong", donXong: 15, huySatNgay: 1, epGia: 0, sao: 4.6, xacMinh: true, nhuCau: "Trái dạt làm mứt vỏ, trà túi lọc vỏ cam" },
      { id: "NM06", ten: "Cửa hàng trái cây Sạch Xanh", loai: "Cửa hàng", vung: "traon", sdt: "0901 111 006", hang: "moi", donXong: 0, huySatNgay: 0, epGia: 0, sao: 0, xacMinh: false, nhuCau: "Trái đẹp bán lẻ tại Cần Thơ" }
    ],

    nongDan: [
      { id: "ND-B7", ten: "Cô Bảy", vung: "tambinh", sdt: "0912 000 007", congVuon: 9, thanhVienHTX: true, donXong: 6, giaoDung: 100, sao: 4.9 },
      { id: "ND-B3", ten: "Chị Ba", vung: "traon", sdt: "0912 000 003", congVuon: 4, thanhVienHTX: true, donXong: 3, giaoDung: 100, sao: 4.8 },
      { id: "ND-T4", ten: "Chú Tư", vung: "vungliem", sdt: "0912 000 004", congVuon: 6, thanhVienHTX: false, donXong: 1, giaoDung: 100, sao: 4.5 }
    ],

    // Lứa cam nông dân khai báo (nguồn hàng cho người mua thấy)
    luaCam: [
      { id: "L01", nongDan: "ND-B7", ten: "Lứa cuối năm, khu sau nhà", kg: 5000, ngayChin: "2026-12-04", tyLe: { loai1: 55, loai2: 30, dat: 15 }, trangThai: "dang_ban" },
      { id: "L02", nongDan: "ND-B3", ten: "Vườn xen ổi", kg: 1200, ngayChin: "2026-12-06", tyLe: { loai1: 40, loai2: 40, dat: 20 }, trangThai: "dang_ban" },
      { id: "L03", nongDan: "ND-T4", ten: "Lứa giáp Tết", kg: 3000, ngayChin: "2026-12-20", tyLe: { loai1: 50, loai2: 35, dat: 15 }, trangThai: "dang_ban" }
    ],

    // Đơn cần mua do người mua đăng. cheDoGia: "codinh" | "biendo"
    donMua: [
      { id: "D101", nguoiMua: "NM01", vung: "tambinh", ngayDang: "2026-11-25", ngayCat: "2026-12-04", kg: 5000, dungSai: 10, nhanGom: false, loaiCan: ["loai1", "loai2"], gia: { loai1: 7700, loai2: 5900 }, giaDat: 2000, tyLeDatToiDa: 15, cheDoGia: "biendo", congHai: "nguoimua", xe: "nguoimua", ghiChu: "Đem người hái theo, lựa tại vườn bằng thẻ đo cỡ chung.", trangThai: "mo" },
      { id: "D102", nguoiMua: "NM03", vung: "tambinh", ngayDang: "2026-11-26", ngayCat: "2026-11-29", kg: 800, dungSai: 10, nhanGom: true, loaiCan: ["loai2"], gia: { loai2: 6200 }, giaDat: 0, tyLeDatToiDa: 0, cheDoGia: "codinh", congHai: "nongdan", xe: "nguoimua", ghiChu: "Cần trái cỡ vừa cho bữa ăn công nhân. Nhận gom nhiều vườn; đạt chất lượng sẽ đặt hằng tuần.", trangThai: "mo" },
      { id: "D103", nguoiMua: "NM04", vung: "vungliem", ngayDang: "2026-11-26", ngayCat: "2026-12-05", kg: 1500, dungSai: 10, nhanGom: true, loaiCan: ["loai2", "dat"], gia: { loai2: 6000 }, giaDat: 3200, tyLeDatToiDa: 100, cheDoGia: "biendo", congHai: "nongdan", xe: "nguoimua", ghiChu: "Ép nước nên nhận cả trái nhỏ; trái dạt không dập, không thối.", trangThai: "mo" },
      { id: "D104", nguoiMua: "NM05", vung: "vungliem", ngayDang: "2026-11-24", ngayCat: "2026-12-08", kg: 3000, dungSai: 15, nhanGom: true, loaiCan: ["dat"], gia: {}, giaDat: 2900, tyLeDatToiDa: 100, cheDoGia: "biendo", congHai: "nongdan", xe: "nguoimua", ghiChu: "Chỉ mua trái dạt làm mứt vỏ và trà túi lọc. Nhận gom nhiều vườn.", trangThai: "mo" },
      { id: "D105", nguoiMua: "NM02", vung: "traon", ngayDang: "2026-11-26", ngayCat: "2026-12-03", kg: 8000, dungSai: 10, nhanGom: false, loaiCan: ["loai1", "loai2"], gia: { loai1: 7300, loai2: 5600 }, giaDat: 1800, tyLeDatToiDa: 20, cheDoGia: "biendo", congHai: "nongdan", xe: "nguoimua", ghiChu: "Mua xô cả vườn, xe tải 8 tấn.", trangThai: "mo" },
      { id: "D106", nguoiMua: "NM06", vung: "traon", ngayDang: "2026-11-27", ngayCat: "2026-11-30", kg: 600, dungSai: 5, nhanGom: true, loaiCan: ["loai1"], gia: { loai1: 8200 }, giaDat: 0, tyLeDatToiDa: 0, cheDoGia: "codinh", congHai: "nongdan", xe: "nongdan", ghiChu: "Trái đẹp, da láng, giao tại điểm gom chợ Trà Ôn.", trangThai: "mo" }
    ],

    // Hợp đồng mẫu đã có sẵn để trình diễn các trạng thái
    hopDong: [
      { id: "HD-2401", don: "D105", nongDan: "ND-B3", kg: 1200, ngayKy: "2026-11-26", giaThamChieuLucKy: null, trangThai: "da_ky", coc: { trangThai: "da_nop" }, nhatKy: [["2026-11-26", "Hai bên ký hợp đồng điện tử"], ["2026-11-26", "Cọc của người mua đã vào tài khoản đảm bảo"]] },
      { id: "HD-2398", don: "D102", nongDan: "ND-B7", kg: 400, ngayKy: "2026-11-26", giaThamChieuLucKy: null, trangThai: "da_chot", coc: { trangThai: "da_nop" }, nhatKy: [["2026-11-26", "Hai bên ký hợp đồng điện tử"], ["2026-11-26", "Cọc đã vào tài khoản đảm bảo"], ["2026-11-27", "Người mua xác nhận lần 2. Được gọi người hái"]] }
    ],

    tranhChap: [
      { id: "TC-07", hopDong: "HD-2311", noiDung: "Bất đồng tỷ lệ trái dạt khi cân (bên mua ghi 28%, nông dân ghi 18%)", trangThai: "dang_xu_ly", ngay: "2026-11-25" }
    ],

    // Phát triển nguồn cầu: người mua HTX đang mời tham gia
    moiNguoiMua: [
      { ten: "Chuỗi trà sữa vùng Cần Thơ", loai: "F&B", buoc: "Đã liên hệ", ghiChu: "Quan tâm mứt vỏ cam làm topping" },
      { ten: "Trường mầm non tư thục (3 cơ sở)", loai: "Bếp ăn", buoc: "Đã đăng ký", ghiChu: "Cần 150 kg mỗi tuần" },
      { ten: "Cơ sở OCOP trà thảo mộc", loai: "Chế biến", buoc: "Đặt đơn đầu", ghiChu: "Thử 500 kg trái dạt" },
      { ten: "Siêu thị mini chuỗi địa phương", loai: "Cửa hàng", buoc: "Đã liên hệ", ghiChu: "Muốn hàng có tem truy xuất vườn" }
    ],

    // Kể chuyện và kích cầu
    cauChuyen: [
      { tieuDe: "24 mùa cam của Cô Bảy", tom: "Hai vợ chồng giữ 9 công cam sành. Điều cô mong nhất không phải giá thật cao, mà là người mua nói lời giữ lời.", nhan: "Chuyện nhà vườn" },
      { tieuDe: "Vì sao cam sành vỏ xanh mà ruột cam đậm", tom: "Vỏ dày, sần, giữ nước lâu; vị chua ngọt đậm hợp để ép nước, nấu sốt, làm mứt vỏ.", nhan: "Hiểu trái cam" },
      { tieuDe: "Một trái cam đi từ vườn tới ly nước", tom: "Hái, lựa bằng thẻ đo cỡ, cân, chở, ép. Mỗi khâu rõ ràng thì người trồng và người mua đều yên tâm.", nhan: "Hành trình" }
    ],
    congThuc: [
      { ten: "Nước cam sành mật ong", dung: "Trái loại 2", buoc: "Ép lấy nước, thêm mật ong và đá; dùng trong ngày." },
      { ten: "Mứt vỏ cam sành", dung: "Vỏ trái dạt", buoc: "Thái sợi vỏ, chần bớt đắng, sên với đường tới khi trong." },
      { ten: "Gà sốt cam sành", dung: "Nước cam và vỏ bào", buoc: "Áp chảo gà, nấu nước cam với tỏi và chút nước mắm tới sệt." },
      { ten: "Trà vỏ cam sành sấy", dung: "Vỏ trái dạt", buoc: "Sấy khô vỏ đã bỏ cùi trắng, pha cùng trà xanh hoặc gừng." }
    ],
    sanPhamDoiTac: [
      { ten: "Hộp quà Vĩnh Long: trà vỏ cam và mứt cam", doiTac: "Cơ sở mứt và trà Hai Thơm", phanKhuc: "Quà biếu tầm trung", nguyenLieu: "Trái dạt mua qua sàn" },
      { ten: "Nước ép cam sành nguyên chất", doiTac: "Chuỗi nước ép Mát Lành", phanKhuc: "Đồ uống hằng ngày", nguyenLieu: "Loại 2 và trái dạt" }
    ],
    keHoachTikTok: [
      { tuan: "Tuần 1", noiDung: "Một ngày ở vườn cam sành: từ 5 giờ sáng tới lúc cân", muc: "Kể chuyện nhà vườn" },
      { tuan: "Tuần 2", noiDung: "Thử 3 món từ một trái cam sành", muc: "Công thức" },
      { tuan: "Tuần 3", noiDung: "Thẻ đo cỡ: vì sao trái này là loại 1", muc: "Minh bạch chất lượng" },
      { tuan: "Tuần 4", noiDung: "Mở hộp quà trà vỏ cam của đối tác", muc: "Sản phẩm đối tác" }
    ],

    quyChe: [
      "Sàn kết nối nhà vườn với nhiều người mua. Sàn không mua bán thay ai, không tự giữ tiền.",
      "Mỗi đơn ghi rõ sản lượng cam kết kèm dung sai, tiêu chí phân loại theo bảng tiêu chuẩn của HTX, giá từng loại, tỷ lệ dạt tối đa, ngày cắt, ai trả công hái và xe.",
      "Khi nông dân nhận đơn, hai bên xác nhận hợp đồng điện tử. Hợp đồng được lưu làm giao dịch bằng văn bản.",
      "Người mua đặt cọc theo hạng uy tín. Cọc nằm ở tài khoản đảm bảo của đơn vị giữ cọc (ngân hàng hoặc tổ chức trung gian thanh toán được cấp phép, hoặc HTX), không bên nào tự rút được.",
      "Nông dân là thành viên HTX được HTX bảo lãnh nghĩa vụ; nông dân ngoài HTX đặt cọc cam kết nhỏ.",
      "Đơn ngắn (ngày cắt trong vòng 3 ngày) được chốt giá cố định. Đơn dài dùng biên độ giá tính theo công thức công khai của HTX cho đúng vùng, đúng mùa, đúng độ dài đơn.",
      "Giá tham chiếu lệch trong biên độ: giữ giá đã chốt. Lệch quá biên độ và còn trước xác nhận lần 2: bên bị bất lợi được đề nghị giá mới, bên kia đồng ý hoặc hủy đơn không phạt, cọc hoàn trả.",
      "Người mua phải xác nhận lần 2 trước ngày cắt 48 giờ. Chưa xác nhận thì nông dân chưa gọi người hái.",
      "Hủy đơn phương không có lý do hợp lệ: trước xác nhận lần 2 mất 30% cọc; sau xác nhận lần 2 mất toàn bộ cọc; sau khi đã hái mất toàn bộ cọc và trả công hái. Nông dân vi phạm chịu mức tương ứng.",
      "Phân loại tại vườn bằng thẻ đo cỡ chung và lấy mẫu ngẫu nhiên. Không đồng ý thì HTX giám định lại trong ngày.",
      "Người mua thanh toán phần còn lại trong 24 giờ sau khi cân; cọc được trừ vào tiền hàng.",
      "Thiên tai, ngập đường, dịch bệnh: được dời ngày hoặc hủy không phạt, cọc hoàn trả.",
      "Tranh chấp: hai bên thương lượng, rồi hòa giải qua HTX; tòa án là phương án cuối."
    ]
  };
})();
