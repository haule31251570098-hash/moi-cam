/* Mối Cam - Giao diện và điều hướng */
(function () {
  var M = window.MC, D = M.D, f = M.fmt, $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var S = function () { return M.S; };
  var so = function (n) { return Number(n).toLocaleString("vi-VN", { maximumFractionDigits: 1 }); };
  function toast(t) { var e = document.createElement("div"); e.className = "toast"; e.textContent = t; document.body.appendChild(e); setTimeout(function () { e.remove(); }, 2800); }
  function nhan(tt) { var x = M.TRANG_THAI[tt] || [tt, "xam"]; return '<span class="nhan ' + x[1] + '">' + x[0] + "</span>"; }
  function di(h) { location.hash = h; }
  var phien = function () { return S().phien; };

  // ---------- Khung ----------
  var MENU = {
    khach: [["#/", "🏠", "Trang chủ"], ["#/cau-chuyen", "🍊", "Câu chuyện"], ["#/tieu-chuan", "📏", "Tiêu chuẩn"], ["#/quy-che", "⚖️", "Quy chế"], ["#/dang-nhap", "👤", "Đăng nhập"]],
    nd: [["#/nd", "🏠", "Hôm nay"], ["#/nd/don", "🛒", "Tìm đơn"], ["#/nd/hop-dong", "📄", "Hợp đồng"], ["#/nd/vuon", "🌳", "Vườn"], ["#/quy-che", "⚖️", "Quy chế"]],
    nm: [["#/nm", "🏠", "Nguồn hàng"], ["#/nm/dang", "➕", "Đăng đơn"], ["#/nm/hop-dong", "📄", "Hợp đồng"], ["#/tieu-chuan", "📏", "Tiêu chuẩn"], ["#/quy-che", "⚖️", "Quy chế"]],
    htx: [["#/htx", "📊", "Tổng quan"], ["#/htx/gia", "💹", "Giá và biên độ"], ["#/htx/giam-sat", "🛡️", "Giám sát"], ["#/htx/cau", "📣", "Nguồn cầu"], ["#/htx/trinh-dien", "🧪", "Trình diễn"]]
  };
  function khung(html, hash) {
    var p = phien(), m = MENU[p ? p.vai : "khach"];
    var ten = !p ? "" : p.vai === "nd" ? M.nongDan(p.id).ten + " · Nông dân" : p.vai === "nm" ? M.nguoiMua(p.id).ten + " · Người mua" : D.htx.ten;
    $("#app").innerHTML =
      '<header class="top"><a class="logo" href="#/"><i></i>Mối Cam</a><span class="sp"></span>' +
      (p ? '<span class="vai">' + esc(ten) + '</span><button id="thoat">Thoát</button>' : '<a class="nut cam" style="min-height:38px;padding:6px 14px" href="#/dang-nhap">Đăng nhập</a>') + "</header>" +
      '<nav class="nav">' + m.map(function (x) { var on = hash === x[0] || (x[0] !== "#/" && x[0].length > 4 && hash.indexOf(x[0]) === 0 && !(x[0] === "#/nd" && hash !== "#/nd") && !(x[0] === "#/nm" && hash !== "#/nm") && !(x[0] === "#/htx" && hash !== "#/htx")); return '<a href="' + x[0] + '" class="' + (on ? "on" : "") + '"><b>' + x[1] + "</b>" + x[2] + "</a>"; }).join("") + "</nav>" +
      "<main>" + html + '<p class="chu-y">Bản mẫu của nhóm sinh viên môn Tư duy thiết kế (UEH). Dữ liệu, tên người và đơn vị đều là giả lập để trình diễn. Hôm nay theo hệ thống: ' + f.ngayDu(D.homNay) + ".</p></main>";
    var t = $("#thoat"); if (t) t.onclick = function () { S().phien = null; M.luu(); di("#/"); };
    window.scrollTo(0, 0);
  }

  // ---------- Thành phần dùng chung ----------
  function theGia(vId) {
    var g = M.giaThamChieu(vId), v = M.vung(vId);
    return '<div class="the"><div class="nho">Giá tham chiếu hôm nay · vùng ' + esc(v.ten) + "</div>" +
      '<div class="luoi" style="grid-template-columns:repeat(3,1fr);gap:8px;margin-top:6px">' +
      ["loai1", "loai2", "dat"].map(function (l) { return '<div><div class="nho">' + M.TEN_LOAI[l] + '</div><div class="so" style="font-size:1.25rem">' + g[l].toLocaleString("vi-VN") + '</div><div class="nho">đ/kg</div></div>'; }).join("") +
      '</div><div class="nho" style="margin-top:6px">' + (g.nguon ? "HTX công bố từ trung vị " + g.nguon.length + " báo giá" : "Theo chuỗi giá HTX ghi nhận") + (g.moPhong ? " · đang mô phỏng lệch " + f.pt(g.moPhong) : "") + "</div></div>";
  }
  function moTaDon(d) {
    var nm = M.nguoiMua(d.nguoiMua), con = d.kg - M.daNhan(d), T = M.soNgay(D.homNay, d.ngayCat);
    var gia = d.loaiCan.filter(function (l) { return l !== "dat"; }).map(function (l) { return M.TEN_LOAI[l] + " " + d.gia[l].toLocaleString("vi-VN"); });
    if (d.giaDat) gia.push("Dạt " + d.giaDat.toLocaleString("vi-VN"));
    return '<a class="the" style="display:block;text-decoration:none;color:inherit" href="#/don/' + d.id + '">' +
      '<div style="display:flex;justify-content:space-between;gap:8px;align-items:start"><div><b>' + esc(nm.ten) + '</b> <span class="nhan ' + (nm.xacMinh ? "" : "cam") + '">' + esc(nm.loai) + (nm.xacMinh ? " · đã xác minh" : " · chưa xác minh") + "</span></div>" +
      '<span class="nhan ' + (d.cheDoGia === "codinh" ? "xam" : "cam") + '">' + (d.cheDoGia === "codinh" ? "Giá chốt cứng" : "Giá theo biên độ ±" + so(M.bienDo(d.vung, d.ngayCat, T).b) + "%") + "</span></div>" +
      '<div style="margin-top:6px">Cần <b>' + f.kg(d.kg) + "</b> (dung sai ±" + d.dungSai + "%) · còn nhận " + f.kg(con) + " · cắt ngày <b>" + f.ngay(d.ngayCat) + "</b> · " + M.vung(d.vung).ten + "</div>" +
      '<div class="nho">' + (M.laMuaXo(d) ? "Mua xô cả vườn · " : "Chỉ mua " + d.loaiCan.map(function (l) { return M.TEN_LOAI[l]; }).join(" + ") + " · ") + gia.join(" · ") + " đ/kg · " + (d.congHai === "nguoimua" ? "người mua lo công hái" : "nông dân lo công hái") + (d.nhanGom ? " · nhận gom nhiều vườn" : "") + "</div></a>";
  }
  function bangTien(t, tieuDe, thucTe) {
    return '<div class="the xanh"><h3>' + (tieuDe || "Ước tính tiền về tay") + "</h3>" +
      t.dong.map(function (x) { return '<div class="dong"><span>' + M.TEN_LOAI[x.l] + " " + f.kg(x.kg) + " × " + x.gia.toLocaleString("vi-VN") + "</span><b>" + f.vnd(x.tien) + "</b></div>"; }).join("") +
      t.tru.map(function (x) { return '<div class="dong"><span>Trừ ' + x[0] + "</span><b>−" + f.vnd(x[1]) + "</b></div>"; }).join("") +
      (t.kgKhongMua ? '<div class="dong nho"><span>' + (thucTe ? "Không tính tiền (trái bỏ hoặc không đúng loại đơn mua)" : "Trái dạt vượt mức đơn nhận (bán cho đơn khác)") + "</span><span>" + f.kg(t.kgKhongMua) + "</span></div>" : "") +
      '<div class="dong tong"><span>' + (thucTe ? "Nông dân thực nhận" : "Tiền về tay") + "</span><span>" + f.vnd(t.tong) + "</span></div>" +
      '<p class="nho" style="margin:8px 0 0">' + (thucTe ? "Tính theo biên bản cân và phân loại tại vườn." : "Tiền về tay = tiền bán từng loại trái trừ chi phí bạn phải lo (công hái, xe). Đây là số ước tính theo tỷ lệ loại bạn khai; số tiền thật tính theo biên bản cân tại vườn. Cọc là tiền của người mua, không trừ vào phần của bạn.") + "</p></div>";
  }
  function giaiThichBienDo(bd, vId) {
    var ts = S().thamSo;
    return '<div class="the"><h3>Biên độ ±' + so(bd.b) + "% được tính ra sao</h3>" +
      '<div class="cong-thuc">B = phân vị ' + ts.phanVi + " của |Δ giá trong " + bd.T + " ngày|<br>dữ liệu: " + esc(bd.cap) + ", " + bd.tenMua + ", " + ts.cuaSoNam + " năm gần nhất</div>" +
      '<p class="nho">' + bd.n + " lần quan sát. Trong quá khứ, cứ 10 lần thì khoảng " + Math.round(ts.phanVi / 10) + " lần giá chỉ lệch trong " + so(bd.tho) + "% sau " + bd.T + " ngày. Làm tròn " + ts.lamTron + "%, giới hạn " + ts.bienDoMin + "% đến " + ts.bienDoMax + "%" + (bd.biKep ? " (đã bị giới hạn)" : "") + ". Lệch trung bình: " + so(bd.trungBinh) + "%.</p>" +
      '<p class="nho">Ý nghĩa: giá chung dao động trong mức này thì cả hai bên giữ giá đã chốt. Vượt mức này trước xác nhận lần 2 thì bên bị thiệt được đề nghị giá mới hoặc rút không phạt.</p></div>';
  }

  // ---------- Trang công khai ----------
  function trangChu() {
    var soNM = S().nguoiMua.length, loai = {}; S().nguoiMua.forEach(function (n) { loai[n.loai] = 1; });
    var don = S().donMua.filter(function (d) { return d.trangThai === "mo"; });
    return '<section class="hero"><h1>Cam chín là có người mua giữ lời</h1><p>Mối Cam nối nhà vườn cam sành với nhiều người mua cùng lúc: thương lái, vựa, bếp ăn, quán nước ép, cơ sở chế biến. Mỗi đơn đều ghi rõ sản lượng, cách phân loại, giá và tiền cọc, nên không ai bị bỏ ngang.</p>' +
      '<div class="nuts"><a class="nut cam" href="#/dang-nhap">Vào sàn</a><a class="nut phu" style="background:#fff" href="#/quy-che">Xem quy chế</a></div></section>' +
      '<div class="luoi"><div class="the"><div class="so">' + soNM + '</div><div class="nho">người mua thuộc ' + Object.keys(loai).length + " nhóm khác nhau</div></div>" +
      '<div class="the"><div class="so">' + don.length + '</div><div class="nho">đơn đang mở, tổng ' + f.kg(don.reduce(function (s, d) { return s + d.kg; }, 0)) + '</div></div><div class="the"><div class="so">' + D.vung.length + '</div><div class="nho">vùng có giá tham chiếu và biên độ riêng</div></div></div>' +
      '<h2>Một đơn đi qua 5 bước</h2><div class="the buoc">' +
      "<div><b>Người mua đăng đơn</b><br><span class=nho>Ghi sản lượng kèm dung sai, loại cần mua theo tiêu chuẩn HTX, giá từng loại, ngày cắt, ai lo công hái và xe.</span></div>" +
      "<div><b>Nông dân chọn đơn hợp lứa cam</b><br><span class=nho>Thấy ngay tiền về tay sau khi trừ chi phí. Nhiều người mua cùng tranh một lứa cam, không còn phải chờ một mối.</span></div>" +
      "<div><b>Ký điện tử, người mua đặt cọc</b><br><span class=nho>Cọc nằm ở tài khoản đảm bảo của đơn vị giữ cọc, không bên nào tự rút. Thành viên HTX được HTX bảo lãnh.</span></div>" +
      "<div><b>Xác nhận lần 2 trước 48 giờ</b><br><span class=nho>Chưa xác nhận thì chưa hái. Giá chung lệch quá biên độ thì được thương lượng lại hoặc rút không phạt.</span></div>" +
      "<div><b>Cân, phân loại, thanh toán</b><br><span class=nho>Thẻ đo cỡ chung, lấy mẫu trước mặt hai bên. Trả tiền trong 24 giờ, cọc trừ vào tiền hàng.</span></div></div>" +
      '<h2>Ba vai trên sàn</h2><div class="luoi">' +
      '<div class="the"><h3>🌳 Nông dân</h3><p class="nho">Khai lứa cam, chọn đơn, theo dõi hợp đồng và tiền. Không phải đặt tiền cọc nếu là thành viên HTX.</p></div>' +
      '<div class="the"><h3>🚚 Thương lái và người mua</h3><p class="nho">Thấy nguồn hàng theo ngày chín và vùng, chọn chốt giá cứng hay theo biên độ, có đường lui khi thị trường biến động mạnh.</p></div>' +
      '<div class="the"><h3>🏛️ Hợp tác xã</h3><p class="nho">Công bố giá tham chiếu, tính biên độ công khai, xác minh người mua, giữ cọc hoặc phối hợp ngân hàng, giám định khi có tranh chấp.</p></div></div>' +
      '<h2>Người mua đang tìm cam</h2>' + don.slice(0, 3).map(moTaDon).join("") +
      '<a class="the cam" style="display:block;text-decoration:none;color:inherit" href="#/cau-chuyen"><h3>🍊 Cam sành không chỉ để ăn tươi</h3><p class="nho">Nước ép, mứt vỏ, trà vỏ cam, món sốt cam. Câu chuyện vườn và sản phẩm đối tác giúp kéo thêm người mua về sàn.</p></a>';
  }
  function trangCauChuyen() {
    return "<h1>Câu chuyện cam sành</h1><p>Kênh kể chuyện do HTX vận hành cùng Đoàn thanh niên và sinh viên tình nguyện. Mục tiêu là tăng người mua cho cam sành, nhất là trái loại 2 và trái dạt dễ bị bỏ.</p>" +
      D.cauChuyen.map(function (c) { return '<div class="the"><span class="nhan cam">' + esc(c.nhan) + "</span><h3 style='margin-top:8px'>" + esc(c.tieuDe) + '</h3><p class="nho">' + esc(c.tom) + "</p></div>"; }).join("") +
      "<h2>Dùng cam sành thế nào</h2><div class='luoi'>" + D.congThuc.map(function (c) { return '<div class="the"><h3>' + esc(c.ten) + '</h3><div class="nhan">' + esc(c.dung) + '</div><p class="nho">' + esc(c.buoc) + "</p></div>"; }).join("") + "</div>" +
      "<h2>Sản phẩm của đối tác</h2><p class='nho'>Nhóm không tự sản xuất. Cơ sở chế biến, quán F&B, chủ thể OCOP làm sản phẩm và mua nguyên liệu qua sàn.</p>" +
      D.sanPhamDoiTac.map(function (p) { return '<div class="the xanh"><h3>' + esc(p.ten) + '</h3><div class="nho">Đối tác: ' + esc(p.doiTac) + " · Phân khúc: " + esc(p.phanKhuc) + " · Nguyên liệu: " + esc(p.nguyenLieu) + "</div></div>"; }).join("") +
      "<h2>Lịch đăng TikTok tháng đầu</h2><div class='the'>" + D.keHoachTikTok.map(function (k) { return '<div class="dong"><span><b>' + k.tuan + "</b> · " + esc(k.noiDung) + '</span><span class="nhan xam">' + esc(k.muc) + "</span></div>"; }).join("") + "</div>";
  }
  function trangTieuChuan() {
    return "<h1>Tiêu chuẩn phân loại cam sành</h1><p class='nho'>Bảng mẫu do HTX ban hành và điều chỉnh theo vùng. Mọi đơn trên sàn đều dẫn chiếu bảng này, nên người mua và nông dân hiểu chữ “loại 1” giống nhau.</p>" +
      '<div class="the cuon"><table><tr><th>Loại</th><th>Đường kính</th><th>Ngoại quan</th><th>Độ chín</th></tr>' +
      S().tieuChuan.map(function (t) { return "<tr><td><b>" + esc(t.ten) + "</b></td><td>" + esc(t.duongKinh) + "</td><td>" + esc(t.ngoaiQuan) + "</td><td>" + esc(t.doChin) + "</td></tr>"; }).join("") + "</table></div>" +
      "<h2>Kiểm định tại vườn</h2><div class='the buoc'>" + D.quyTrinhKiemDinh.map(function (x) { return "<div>" + esc(x) + "</div>"; }).join("") + "</div>" +
      '<div class="the cam"><h3>Cam kết sản lượng</h3><p class="nho">Mỗi đơn ghi sản lượng và dung sai (mặc định ±' + S().thamSo.dungSaiMacDinh + '%). Giao trong dung sai là đúng hợp đồng. Thiếu quá dung sai do nông dân thì phần thiếu tính như hủy một phần; người mua không nhận phần trong dung sai thì vẫn trả tiền phần đó.</p></div>';
  }
  function trangQuyChe() {
    var ts = S().thamSo;
    return "<h1>Quy chế giao dịch</h1>" + '<div class="the">' + D.quyChe.map(function (q, i) { return '<div class="dong" style="justify-content:flex-start"><b style="color:var(--cam);min-width:26px">' + (i + 1) + "</b><span>" + esc(q) + "</span></div>"; }).join("") + "</div>" +
      "<h2>Cọc và hủy đơn</h2><div class='the cuon'><table><tr><th>Thời điểm hủy</th><th>Người mua hủy</th><th>Nông dân hủy</th></tr>" +
      "<tr><td>Trước xác nhận lần 2, lý do hợp lệ (giá vượt biên độ, thiên tai)</td><td>Hoàn cọc, không phạt</td><td>Không phạt</td></tr>" +
      "<tr><td>Trước xác nhận lần 2, không lý do</td><td>Mất " + ts.phatHuyTruocXN2 + "% cọc cho nông dân</td><td>Trả người mua khoản tương đương " + ts.phatHuyTruocXN2 + "% cọc</td></tr>" +
      "<tr><td>Sau xác nhận lần 2</td><td>Mất 100% cọc</td><td>Trả khoản tương đương 100% cọc</td></tr>" +
      "<tr><td>Sau khi đã hái</td><td>Mất 100% cọc và trả công hái</td><td>Không áp dụng</td></tr></table></div>" +
      "<div class='the'><h3>Mức cọc theo hạng người mua</h3>" + [["moi", "Mới hoặc chưa xác minh"], ["thuong", "Thông thường"], ["uytin", "Uy tín"]].map(function (h) { return '<div class="dong"><span>' + h[1] + "</span><b>" + ts.cocTheoHang[h[0]] + "% giá trị đơn</b></div>"; }).join("") +
      '<div class="dong"><span>Nông dân ngoài HTX</span><b>' + ts.cocNongDanNgoaiHTX + '%</b></div><div class="dong"><span>Nông dân thành viên HTX</span><b>HTX bảo lãnh</b></div></div>' +
      "<h2>Biên độ giá tính thế nào</h2><div class='the'><div class='cong-thuc'>B(vùng, mùa, T) = phân vị " + ts.phanVi + " của |P(t+T) − P(t)| / P(t)</div>" +
      '<p class="nho">P là giá tham chiếu loại 1 HTX công bố mỗi ngày (trung vị ít nhất 3 báo giá). T là số ngày từ lúc ký tới ngày cắt. Chỉ dùng dữ liệu cùng vùng, cùng mùa, ' + ts.cuaSoNam + " năm gần nhất. Vùng mới chưa đủ " + ts.quanSatToiThieu + " quan sát thì mượn dữ liệu cấp tỉnh. Kết quả làm tròn " + ts.lamTron + "% và giữ trong khoảng " + ts.bienDoMin + "% đến " + ts.bienDoMax + "%. Đơn cắt trong " + ts.ngayGiaCoDinhToiDa + " ngày thì chốt giá cứng, không dùng biên độ.</p>" +
      '<div class="cuon"><table><tr><th>Vùng</th><th>Đơn 3 ngày</th><th>Đơn 7 ngày</th><th>Đơn 14 ngày</th></tr>' + D.vung.map(function (v) { return "<tr><td>" + v.ten + "</td>" + [3, 7, 14].map(function (T) { return "<td>±" + so(M.bienDo(v.id, M.congNgay(D.homNay, T), T).b) + "%</td>"; }).join("") + "</tr>"; }).join("") + "</table></div></div>" +
      '<div class="the xanh"><h3>Căn cứ pháp lý chính</h3><p class="nho">Bộ luật Dân sự 2015: hợp đồng mua bán tài sản, đặt cọc (Điều 328: bên đặt cọc từ chối thì mất cọc, bên nhận cọc từ chối thì trả cọc và một khoản tương đương, trừ khi có thỏa thuận khác; quy chế sàn là thỏa thuận khác có mức phạt theo giai đoạn), phạt vi phạm và bồi thường, sự kiện bất khả kháng. Luật Giao dịch điện tử 2023: hợp đồng điện tử có giá trị như văn bản. Luật Hợp tác xã 2023: HTX cung cấp dịch vụ cho thành viên. Giữ hộ tiền là dịch vụ trung gian thanh toán, phải do ngân hàng hoặc tổ chức được cấp phép thực hiện, hoặc HTX giữ như bên nhận cọc; trang web chỉ hiển thị trạng thái.</p></div>';
  }
  var vaiChon = "nd";
  function trangDangNhap() {
    var tk = { nd: S().nongDan.map(function (n) { return [n.id, n.ten + " · " + M.vung(n.vung).ten + (n.thanhVienHTX ? " · thành viên HTX" : " · ngoài HTX")]; }), nm: S().nguoiMua.map(function (n) { return [n.id, n.ten + " · " + n.loai]; }), htx: [["HTX01", D.htx.ten]] };
    return "<h1>Đăng nhập</h1><p class='nho'>Chọn vai của bạn. Bản mẫu dùng tài khoản dựng sẵn và mã OTP mô phỏng.</p>" +
      '<div class="vai-chon">' + [["nd", "🌳 Nông dân", "Bán cam, nhận đơn, theo dõi tiền"], ["nm", "🚚 Thương lái và người mua", "Thương lái, vựa, bếp ăn, F&B, cơ sở chế biến"], ["htx", "🏛️ Hợp tác xã", "Cập nhật giá, giám sát và điều hành sàn"]].map(function (v) { return '<button data-v="' + v[0] + '" class="' + (vaiChon === v[0] ? "on" : "") + '"><b>' + v[1] + '</b><br><span class="nho">' + v[2] + "</span></button>"; }).join("") + "</div>" +
      '<div class="the" style="margin-top:14px"><label>Tài khoản trình diễn</label><select id="tk">' + tk[vaiChon].map(function (x) { return '<option value="' + x[0] + '">' + esc(x[1]) + "</option>"; }).join("") + "</select>" +
      '<label>Số điện thoại</label><input id="sdt" inputmode="tel" value="0912 000 007"><label>Mã OTP (mô phỏng: 2468)</label><input id="otp" inputmode="numeric" value="2468">' +
      '<div class="nuts"><button class="nut full" id="vao">Vào sàn</button></div></div>';
  }

  // ---------- Nông dân ----------
  function ndHome() {
    var nd = M.nongDan(phien().id), lua = S().luaCam.filter(function (l) { return l.nongDan === nd.id && l.trangThai === "dang_ban"; });
    var hd = S().hopDong.filter(function (h) { return h.nongDan === nd.id && ["hoan_tat", "da_huy"].indexOf(h.trangThai) < 0; });
    var h = "<h1>Chào " + esc(nd.ten) + "</h1>" + theGia(nd.vung);
    if (hd.length) h += "<h2>Việc cần làm</h2>" + hd.map(function (x) { return '<a class="the cam" style="display:block;text-decoration:none;color:inherit" href="#/hd/' + x.id + '"><b>' + x.id + "</b> · " + esc(M.nguoiMua(M.donMua(x.don).nguoiMua).ten) + " · " + f.kg(x.kg) + "<br>" + nhan(x.trangThai) + "</a>"; }).join("");
    h += "<h2>Người mua hợp lứa cam của bạn</h2>";
    lua.forEach(function (l) {
      var g = M.ghepChoLua(l);
      h += '<div class="the"><b>' + esc(l.ten) + "</b> · " + f.kg(l.kg) + " · chín " + f.ngay(l.ngayChin) + '<div class="nho">Còn ' + f.kg(M.tongConLai(l)) + " chưa có người mua. Có " + g.length + " người mua phù hợp. Xếp theo tiền về tay và độ khớp ngày.</div></div>" +
        g.slice(0, 3).map(function (x) { return '<a class="the" style="display:block;text-decoration:none;color:inherit;margin-left:10px" href="#/don/' + x.don.id + "?lua=" + l.id + '"><b>' + esc(M.nguoiMua(x.don.nguoiMua).ten) + '</b> <span class="nhan">' + esc(M.nguoiMua(x.don.nguoiMua).loai) + "</span><div>" + (M.laMuaXo(x.don) ? "Mua xô " : "Lấy " + x.don.loaiCan.map(function (l) { return M.TEN_LOAI[l]; }).join(" + ") + " ") + f.kg(x.kg) + " · cắt " + f.ngay(x.don.ngayCat) + (x.lechNgay ? " (lệch " + x.lechNgay + " ngày)" : " (khớp ngày)") + '</div><div class="so" style="font-size:1.2rem">≈ ' + f.tr(x.tien.tong) + ' về tay</div></a>'; }).join("");
    });
    if (!lua.length) h += '<div class="the">Chưa có lứa cam nào đang bán. <a href="#/nd/vuon">Khai lứa cam</a></div>';
    return h;
  }
  function dsDon(loc) {
    var ds = S().donMua.filter(function (d) { return d.trangThai === "mo" && (!loc || loc === "tat" || d.vung === loc || M.nguoiMua(d.nguoiMua).loai === loc); });
    var loai = {}; S().nguoiMua.forEach(function (n) { loai[n.loai] = 1; });
    return "<h1>Đơn đang tìm cam</h1><p class='nho'>Nhiều người mua cùng lúc. Chọn đơn hợp ngày chín và loại trái của bạn.</p>" +
      '<select id="loc"><option value="tat">Tất cả</option>' + D.vung.map(function (v) { return '<option value="' + v.id + '"' + (loc === v.id ? " selected" : "") + ">Vùng " + v.ten + "</option>"; }).join("") + Object.keys(loai).map(function (l) { return '<option value="' + l + '"' + (loc === l ? " selected" : "") + ">" + l + "</option>"; }).join("") + "</select><div style='height:12px'></div>" +
      (ds.map(moTaDon).join("") || '<div class="the">Không có đơn phù hợp.</div>');
  }
  function chiTietDon(id, q) {
    var d = M.donMua(id); if (!d) return "<p>Không tìm thấy đơn.</p>";
    var nm = M.nguoiMua(d.nguoiMua), p = phien(), T = M.soNgay(D.homNay, d.ngayCat), con = d.kg - M.daNhan(d);
    var bd = d.cheDoGia === "biendo" ? M.bienDo(d.vung, d.ngayCat, T) : null;
    var h = '<a href="javascript:history.back()">← Quay lại</a><h1>Đơn ' + d.id + "</h1>" +
      '<div class="the"><b>' + esc(nm.ten) + '</b> <span class="nhan">' + esc(nm.loai) + "</span> " + (nm.xacMinh ? '<span class="nhan">HTX đã xác minh</span>' : '<span class="nhan cam">Chưa xác minh</span>') +
      '<div class="nho">' + (nm.donXong ? nm.donXong + " đơn xong · " + nm.huySatNgay + " lần hủy sát ngày · " + nm.sao + "★" : "Người mua mới") + " · Nhu cầu: " + esc(nm.nhuCau) + "</div></div>" +
      '<div class="the"><h3>Cam kết của đơn</h3>' +
      [["Sản lượng", f.kg(d.kg) + " (dung sai ±" + d.dungSai + "%) · còn nhận " + f.kg(con)], ["Ngày cắt", f.ngayDu(d.ngayCat) + " · xác nhận lần 2 trước " + S().thamSo.gioXacNhan2 + " giờ"], ["Loại mua", d.loaiCan.map(function (l) { return M.TEN_LOAI[l]; }).join(", ") + (d.tyLeDatToiDa && d.loaiCan.indexOf("dat") < 0 ? " · nhận dạt tối đa " + d.tyLeDatToiDa + "%" : "")],
       ["Giá", d.loaiCan.filter(function (l) { return l !== "dat"; }).map(function (l) { return M.TEN_LOAI[l] + " " + d.gia[l].toLocaleString("vi-VN"); }).concat(d.giaDat ? ["Dạt " + d.giaDat.toLocaleString("vi-VN")] : []).join(" · ") + " đ/kg"],
       ["Cách giữ giá", d.cheDoGia === "codinh" ? "Chốt giá cứng (đơn ngắn ngày)" : "Theo biên độ ±" + so(bd.b) + "% quanh giá tham chiếu"], ["Công hái", d.congHai === "nguoimua" ? "Người mua lo" : "Nông dân lo"], ["Xe chở", d.xe === "nguoimua" ? "Người mua lo" : "Nông dân lo"],
       ["Cọc người mua", M.phanTramCoc(d.nguoiMua) + "% giá trị, giữ ở tài khoản đảm bảo"], ["Phân loại", "Theo tiêu chuẩn HTX, thẻ đo cỡ chung"]].map(function (r) { return '<div class="dong"><span class="nho">' + r[0] + "</span><span style='text-align:right'>" + r[1] + "</span></div>"; }).join("") +
      '<p class="nho">' + esc(d.ghiChu) + "</p></div>";
    if (bd) h += giaiThichBienDo(bd, d.vung);
    if (p && p.vai === "nd") {
      var lua = S().luaCam.filter(function (l) { return l.nongDan === p.id && l.trangThai === "dang_ban"; });
      var chon = lua.filter(function (l) { return l.id === q.lua; })[0] || lua[0];
      if (!lua.length) return h + '<div class="the">Bạn cần <a href="#/nd/vuon">khai lứa cam</a> trước khi nhận đơn.</div>';
      var toiDa = M.kgGiaoDuoc(d, chon), kg = Math.max(0, Math.min(con, toiDa)), t = M.tinhTien(d, M.tyLeConLai(chon), kg);
      var tenLoai = d.loaiCan.map(function (l) { return M.TEN_LOAI[l]; }).join(" + ");
      var nd = M.nongDan(p.id);
      h += '<div class="the"><h3>Nhận đơn này</h3><label>Lứa cam</label><select id="lua">' + lua.map(function (l) { return '<option value="' + l.id + '"' + (l === chon ? " selected" : "") + ">" + esc(l.ten) + " · " + f.kg(l.kg) + " · chín " + f.ngay(l.ngayChin) + "</option>"; }).join("") + "</select>" +
        (toiDa <= 0 ? '<p class="nho">Lứa này không còn trái thuộc loại đơn cần (' + tenLoai + '). Chọn lứa khác hoặc tìm đơn khác.</p></div>' :
        '<label>' + (M.laMuaXo(d) ? "Số kg giao (mua xô, tính cả trái các loại)" : "Số kg " + tenLoai + " giao") + '</label><input id="kg" type="number" min="50" step="50" max="' + kg + '" value="' + kg + '">' +
        '<p class="nho">Lứa này còn khoảng ' + f.kg(toiDa) + (M.laMuaXo(d) ? " chưa có người mua." : " trái thuộc loại đơn cần. Trái loại khác bạn bán cho đơn khác.") + "</p></div>" + '<div id="tien">' + bangTien(t) + "</div>" +
        '<div class="the ' + (nd.thanhVienHTX ? "xanh" : "cam") + '"><p class="nho" style="margin:0">' + (nd.thanhVienHTX ? "Bạn là thành viên HTX nên không phải đặt cọc. HTX bảo lãnh nghĩa vụ giao hàng của bạn." : "Bạn chưa là thành viên HTX nên đặt cọc cam kết " + S().thamSo.cocNongDanNgoaiHTX + "% giá trị, hoàn lại khi giao xong.") + " Nếu người mua bỏ đơn không lý do, bạn nhận khoản bồi thường từ cọc của họ.</p></div>" +
        '<button class="nut cam full" id="nhan">Nhận đơn và ký hợp đồng điện tử</button>');
    } else if (!p) h += '<a class="nut full" href="#/dang-nhap">Đăng nhập để nhận đơn</a>';
    return h;
  }
  function dsHopDong(loc) {
    var ds = S().hopDong.filter(loc).slice().reverse();
    return "<h1>Hợp đồng</h1>" + (ds.map(function (h) { var d = M.donMua(h.don); return '<a class="the" style="display:block;text-decoration:none;color:inherit" href="#/hd/' + h.id + '"><div style="display:flex;justify-content:space-between"><b>' + h.id + "</b>" + nhan(h.trangThai) + "</div><div>" + esc(M.nguoiMua(d.nguoiMua).ten) + " ↔ " + esc(M.nongDan(h.nongDan).ten) + '</div><div class="nho">' + f.kg(h.kg) + " · cắt " + f.ngay(d.ngayCat) + " · cọc " + f.vnd(h.coc.tien) + "</div></a>"; }).join("") || '<div class="the">Chưa có hợp đồng.</div>');
  }
  function ndVuon() {
    var p = phien(), ds = S().luaCam.filter(function (l) { return l.nongDan === p.id; });
    return "<h1>Vườn và lứa cam</h1>" + ds.map(function (l) { return '<div class="the"><b>' + esc(l.ten) + '</b> <span class="nhan ' + (l.trangThai === "dang_ban" ? "" : "xam") + '">' + (l.trangThai === "dang_ban" ? "Đang bán" : "Đã bán") + "</span><div>" + f.kg(l.kg) + " · chín " + f.ngayDu(l.ngayChin) + '</div><div class="nho">Ước tỷ lệ: loại 1 ' + (l.tyLe.loai1 || 0) + "%, loại 2 " + (l.tyLe.loai2 || 0) + "%, dạt " + (l.tyLe.dat || 0) + '%</div><div class="nho">' + (function (c) { return "Còn chưa có người mua: loại 1 " + f.kg(c.loai1) + ", loại 2 " + f.kg(c.loai2) + ", dạt " + f.kg(c.dat); })(M.conLaiTheoLoai(l)) + "</div></div>"; }).join("") +
      '<div class="the"><h3>Khai lứa cam mới</h3><label>Tên lứa</label><input id="lten" value="Lứa mới"><div class="hang2"><div><label>Sản lượng (kg)</label><input id="lkg" type="number" value="2000"></div><div><label>Ngày chín</label><input id="lngay" type="date" value="' + M.congNgay(D.homNay, 10) + '"></div></div>' +
      '<div class="hang2" style="grid-template-columns:1fr 1fr 1fr"><div><label>% Loại 1</label><input id="l1" type="number" value="50"></div><div><label>% Loại 2</label><input id="l2" type="number" value="35"></div><div><label>% Dạt</label><input id="l3" type="number" value="15"></div></div>' +
      '<p class="nho">Không biết tỷ lệ? Dùng thẻ đo cỡ của HTX đo thử 50 trái ngẫu nhiên.</p><button class="nut full" id="themLua">Lưu lứa cam</button></div>';
  }

  // ---------- Hợp đồng chi tiết (dùng chung) ----------
  function chiTietHD(id) {
    var hd = M.hopDong(id); if (!hd) return "<p>Không tìm thấy hợp đồng.</p>";
    var d = M.donMua(hd.don), nm = M.nguoiMua(d.nguoiMua), nd = M.nongDan(hd.nongDan), p = phien() || {}, vai = p.vai;
    var tg = M.tinhTrangGia(hd), truoc = M.truocChot(hd), dong = ["hoan_tat", "da_huy"].indexOf(hd.trangThai) >= 0;
    var lua = M.luaCam(hd.lua) || { tyLe: M.tyLeMacDinh(d) };
    var h = '<a href="javascript:history.back()">← Quay lại</a><h1>' + hd.id + " " + nhan(hd.trangThai) + "</h1>" +
      '<div class="the"><div class="dong"><span class="nho">Người mua</span><b>' + esc(nm.ten) + '</b></div><div class="dong"><span class="nho">Nông dân</span><b>' + esc(nd.ten) + "</b></div>" +
      '<div class="dong"><span class="nho">Sản lượng</span><span>' + f.kg(hd.kg) + " ±" + d.dungSai + '%</span></div><div class="dong"><span class="nho">Ngày cắt</span><span>' + f.ngayDu(d.ngayCat) + "</span></div>" +
      '<div class="dong"><span class="nho">Giá</span><span>' + ["loai1", "loai2", "dat"].filter(function (l) { return hd.gia[l]; }).map(function (l) { return M.TEN_LOAI[l] + " " + hd.gia[l].toLocaleString("vi-VN"); }).join(" · ") + "</span></div>" +
      '<div class="dong"><span class="nho">Cọc</span><span>' + f.vnd(hd.coc.tien) + " (" + hd.coc.phanTram + "%) · " + M.TRANG_THAI_COC[hd.coc.trangThai] + "</span></div>" +
      '<div class="dong"><span class="nho">Bảo đảm phía nông dân</span><span>' + (hd.coc.baoLanh || "Cọc cam kết " + f.vnd(hd.coc.cocNongDan)) + "</span></div></div>";
    // Trạng thái giá
    if (!dong) {
      if (tg.coDinh) h += '<div class="the xanh">Đơn chốt giá cứng. Giá không đổi dù thị trường biến động.</div>';
      else {
        var w = Math.min(100, Math.abs(tg.lech) / hd.bienDo * 50);
        h += '<div class="the ' + (tg.trong ? "xanh" : "cam") + '"><h3>Giá chung so với lúc ký</h3><div>Tham chiếu lúc ký ' + hd.giaThamChieuLucKy.toLocaleString("vi-VN") + " → hôm nay " + tg.ref.toLocaleString("vi-VN") + " đ/kg (<b>" + f.pt(tg.lech) + "</b>). Biên độ ±" + so(hd.bienDo) + "%.</div>" +
          '<div class="thanh" style="margin:10px 0"><i style="left:' + (tg.lech < 0 ? 50 - w : 50) + "%;width:" + w + '%;background:' + (tg.trong ? "var(--xanh2)" : "var(--cam)") + '"></i></div>' +
          '<p class="nho" style="margin:0">' + (tg.trong ? "Trong biên độ: hai bên giữ đúng giá đã ký." : (truoc ? "Vượt biên độ. " + (tg.benBatLoi === "nguoimua" ? "Người mua" : "Nông dân") + " được đề nghị giá mới; bên kia đồng ý hoặc hủy không phạt, cọc hoàn trả." : "Vượt biên độ nhưng đã qua xác nhận lần 2, hai bên đã khóa giá.")) + "</p>";
        if (!tg.trong && truoc && !hd.deNghi && vai === (tg.benBatLoi === "nguoimua" ? "nm" : "nd")) {
          var heSo = tg.ref / hd.giaThamChieuLucKy, goiY = {}; ["loai1", "loai2", "dat"].forEach(function (l) { if (hd.gia[l]) goiY[l] = Math.round(hd.gia[l] * heSo / 50) * 50; });
          h += '<p class="nho">Gợi ý giá mới theo cùng tỷ lệ lệch: ' + Object.keys(goiY).map(function (l) { return M.TEN_LOAI[l] + " " + goiY[l].toLocaleString("vi-VN"); }).join(" · ") + '</p><button class="nut cam" data-act="deNghi" data-gia=\'' + JSON.stringify(goiY) + "'>Gửi đề nghị giá mới</button>";
        }
        if (hd.deNghi) {
          var benKia = hd.deNghi.ben === "nguoimua" ? "nd" : "nm";
          h += '<div class="the" style="margin-top:10px"><b>Đề nghị giá mới</b> từ ' + (hd.deNghi.ben === "nguoimua" ? "người mua" : "nông dân") + ": " + Object.keys(hd.deNghi.gia).map(function (l) { return M.TEN_LOAI[l] + " " + hd.deNghi.gia[l].toLocaleString("vi-VN"); }).join(" · ") +
            (vai === benKia ? '<div class="nuts"><button class="nut" data-act="dongYGia">Đồng ý giá mới</button><button class="nut phu" data-act="tuChoiGia">Không đồng ý, hủy không phạt</button></div>' : '<div class="nho">Đang chờ bên kia trả lời.</div>') + "</div>";
        }
        h += "</div>";
      }
    }
    // Hành động theo bước
    var a = "";
    if (hd.trangThai === "cho_coc" && vai === "nm") a += '<button class="nut cam" data-act="nopCoc">Nộp cọc ' + f.vnd(hd.coc.tien) + " vào tài khoản đảm bảo</button>";
    if (hd.trangThai === "cho_coc" && vai !== "nm") a += '<p class="nho">Đang chờ người mua nộp cọc. Chưa có cọc thì đơn chưa ràng buộc.</p>';
    if (hd.trangThai === "da_ky" && vai === "nm") a += '<button class="nut" data-act="xacNhan2">Xác nhận lần 2: chắc chắn đến cắt ngày ' + f.ngay(d.ngayCat) + "</button>";
    if (hd.trangThai === "da_ky" && vai === "nd") a += '<p class="nho">Chờ người mua xác nhận lần 2 trước ngày cắt ' + S().thamSo.gioXacNhan2 + " giờ. Chưa xác nhận thì chưa gọi người hái.</p>";
    if (hd.trangThai === "da_chot" && vai === "nd" && !hd.daHai) a += '<button class="nut" data-act="batDauHai">Báo đã bắt đầu hái</button>';
    if (hd.trangThai === "da_chot" && (vai === "nm" || vai === "nd")) a += '<button class="nut cam" data-act="moBienBan">Lập biên bản cân và phân loại</button>';
    if (hd.trangThai === "da_can") {
      var tt = M.tinhTien(d, hd.bienBan.tyLe, hd.bienBan.tong, hd.gia, true), conLai = tt.giaTri - hd.coc.tien;
      h += bangTien(tt, "Tiền hàng theo biên bản cân", true) + '<div class="the"><div class="dong"><span>Giá trị hàng</span><b>' + f.vnd(tt.giaTri) + '</b></div><div class="dong"><span>Trừ cọc đã giữ</span><b>−' + f.vnd(hd.coc.tien) + '</b></div><div class="dong tong"><span>Người mua chuyển thêm trong ' + S().thamSo.thanhToanTrongGio + " giờ</span><span>" + f.vnd(conLai) + "</span></div></div>";
      if (vai === "nm") a += '<button class="nut" data-act="thanhToan">Đã chuyển ' + f.vnd(conLai) + "</button>";
      if (vai === "nm" || vai === "nd") a += '<button class="nut phu" data-act="giamDinh">Không đồng ý phân loại, gọi HTX giám định</button>';
    }
    if (hd.trangThai === "da_thanh_toan" && vai === "nd") a += '<button class="nut" data-act="hoanTat">Tôi đã nhận đủ tiền</button>';
    if (hd.trangThai === "tranh_chap") a += '<p class="nho">HTX đang giám định lại trong ngày. Kết quả giám định lại là kết quả cuối.</p>' + (vai === "htx" ? '<button class="nut" data-act="moBienBan">Lập biên bản giám định lại</button>' : "");
    if (a) h += '<div class="the"><h3>Việc tiếp theo</h3><div class="nuts">' + a + "</div></div>";
    h += '<div id="bienban"></div>';
    // Hủy
    if (!dong && hd.trangThai !== "da_can" && hd.trangThai !== "da_thanh_toan" && (vai === "nm" || vai === "nd")) {
      var ben = vai === "nm" ? "nguoimua" : "nongdan", q = M.HD.hauQuaHuy(hd, ben, "khong_ly_do"), qb = M.HD.hauQuaHuy(hd, ben, "bat_kha_khang");
      h += '<details class="the"><summary><b>Không thể tiếp tục?</b></summary><p class="nho">Nếu hủy bây giờ không có lý do hợp lệ: ' + q.moTa + '</p><div class="nuts"><button class="nut do" data-act="huy" data-ly="khong_ly_do">Hủy đơn phương</button><button class="nut phu" data-act="huy" data-ly="bat_kha_khang">Báo bất khả kháng</button></div><p class="nho">Bất khả kháng (thiên tai, ngập đường, dịch bệnh) cần HTX xác nhận: ' + qb.moTa + "</p></details>";
    }
    if (hd.huy) h += '<div class="the do"><b>Kết quả hủy</b><p class="nho">' + hd.huy.hauQua.moTa + "</p></div>";
    h += '<div class="the"><h3>Nhật ký</h3><div class="tl">' + hd.nhatKy.map(function (x) { return "<div><b>" + f.ngay(x[0]) + "</b> · " + esc(x[1]) + "</div>"; }).join("") + "</div></div>";
    return h;
  }
  function formBienBan(hd) {
    var d = M.donMua(hd.don), lua = M.luaCam(hd.lua), tl = lua ? lua.tyLe : M.tyLeMacDinh(d), w = {}, mac = {};
    ["loai1", "loai2", "dat"].forEach(function (l) { w[l] = M.laMuaXo(d) || d.loaiCan.indexOf(l) >= 0 ? (tl[l] || 0) : 0; });
    var s = (w.loai1 + w.loai2 + w.dat) || 1;
    ["loai1", "loai2", "dat"].forEach(function (l) { mac[l] = Math.round(w[l] / s * 97); });
    mac.bo = 100 - mac.loai1 - mac.loai2 - mac.dat;
    return '<div class="the cam"><h3>Biên bản cân và phân loại</h3><p class="nho">Lấy mẫu 3 sọt mỗi tấn, đo bằng thẻ đo cỡ chung, hai bên cùng chứng kiến.</p><label>Tổng kg cân được</label><input id="bbkg" type="number" value="' + hd.kg + '">' +
      '<div class="hang2" style="grid-template-columns:repeat(4,1fr)"><div><label>% L1</label><input id="b1" type="number" value="' + mac.loai1 + '"></div><div><label>% L2</label><input id="b2" type="number" value="' + mac.loai2 + '"></div><div><label>% Dạt</label><input id="b3" type="number" value="' + mac.dat + '"></div><div><label>% Bỏ</label><input id="b4" type="number" value="' + mac.bo + '"></div></div>' +
      '<button class="nut full" data-act="luuBienBan" style="margin-top:10px">Lưu biên bản (hai bên ký)</button></div>';
  }

  // ---------- Người mua ----------
  function nmHome() {
    var p = phien(), nm = M.nguoiMua(p.id);
    var lua = S().luaCam.filter(function (l) { return l.trangThai === "dang_ban" && M.tongConLai(l) > 0; }).sort(function (a, b) { return a.ngayChin < b.ngayChin ? -1 : 1; });
    var don = S().donMua.filter(function (d) { return d.nguoiMua === p.id; });
    return "<h1>Nguồn hàng sắp chín</h1>" + (nm.xacMinh ? "" : '<div class="the cam">Tài khoản chưa được HTX xác minh: cọc ở mức ' + S().thamSo.cocTheoHang.moi + "%. Hoàn tất xác minh để hạ mức cọc.</div>") +
      '<div class="the cuon"><table><tr><th>Nhà vườn</th><th>Vùng</th><th>Còn chưa bán</th><th>Chín</th><th>Tỷ lệ L1/L2/Dạt</th></tr>' + lua.map(function (l) { var nd = M.nongDan(l.nongDan); return "<tr><td>" + esc(nd.ten) + (nd.thanhVienHTX ? ' <span class="nhan">HTX</span>' : "") + "<br><span class=nho>" + nd.sao + "★ · giao đúng " + nd.giaoDung + "%</span></td><td>" + M.vung(nd.vung).ten + "</td><td>" + f.kg(M.tongConLai(l)) + "</td><td>" + f.ngay(l.ngayChin) + "</td><td>" + (l.tyLe.loai1 || 0) + "/" + (l.tyLe.loai2 || 0) + "/" + (l.tyLe.dat || 0) + "%</td></tr>"; }).join("") + "</table></div>" +
      '<div class="the xanh"><b>Lợi ích cho người mua:</b> <span class="nho">thấy trước sản lượng và ngày chín, không phải chạy từng vườn dò hàng; hàng phân loại theo một chuẩn chung; chọn chốt giá cứng hay theo biên độ; giá chung đổi mạnh trước xác nhận lần 2 thì được thương lượng hoặc rút không phạt.</span></div>' +
      '<h2>Đơn của bạn</h2>' + (don.map(function (d) { var dn = M.daNhan(d); return '<a class="the" style="display:block;text-decoration:none;color:inherit" href="#/don/' + d.id + '"><b>' + d.id + "</b> · " + f.kg(d.kg) + " · cắt " + f.ngay(d.ngayCat) + '<div class="thanh" style="margin:8px 0"><i style="left:0;width:' + Math.min(100, dn / d.kg * 100) + '%"></i></div><span class="nho">Đã có nông dân nhận ' + f.kg(dn) + "</span></a>"; }).join("") || '<div class="the">Chưa có đơn. <a href="#/nm/dang">Đăng đơn đầu tiên</a></div>');
  }
  function nmDang() {
    var nm = M.nguoiMua(phien().id), g = M.giaThamChieu(nm.vung);
    return "<h1>Đăng đơn cần mua</h1><div class='the'>" +
      '<label>Vùng mua</label><select id="dvung">' + D.vung.map(function (v) { return '<option value="' + v.id + '"' + (v.id === nm.vung ? " selected" : "") + ">" + v.ten + "</option>"; }).join("") + "</select>" +
      '<div class="hang2"><div><label>Sản lượng (kg)</label><input id="dkg" type="number" value="2000" step="100"></div><div><label>Dung sai (%)</label><input id="dds" type="number" value="' + S().thamSo.dungSaiMacDinh + '"></div></div>' +
      '<label>Ngày cắt</label><input id="dngay" type="date" value="' + M.congNgay(D.homNay, 8) + '">' +
      '<label>Loại cần mua</label><select id="dloai"><option value="loai1,loai2">Loại 1 và Loại 2 (mua xô)</option><option value="loai1">Chỉ Loại 1</option><option value="loai2">Chỉ Loại 2</option><option value="loai2,dat">Loại 2 và trái dạt (ép, chế biến)</option><option value="dat">Chỉ trái dạt</option></select>' +
      '<div class="hang2" style="grid-template-columns:1fr 1fr 1fr"><div><label>Giá L1</label><input id="g1" type="number" value="' + g.loai1 + '"></div><div><label>Giá L2</label><input id="g2" type="number" value="' + g.loai2 + '"></div><div><label>Giá dạt</label><input id="g3" type="number" value="' + g.dat + '"></div></div>' +
      '<div class="hang2"><div><label>Công hái</label><select id="dch"><option value="nguoimua">Tôi lo</option><option value="nongdan">Nông dân lo</option></select></div><div><label>Xe chở</label><select id="dxe"><option value="nguoimua">Tôi lo</option><option value="nongdan">Nông dân lo</option></select></div></div>' +
      '<label>Ghi chú cho nhà vườn</label><textarea id="dgc" rows="2">Lựa tại vườn bằng thẻ đo cỡ chung.</textarea>' +
      '<label><input type="checkbox" id="dgom" style="width:auto;min-height:0" checked> Nhận gom từ nhiều vườn</label></div>' +
      '<div id="xemTruoc"></div><button class="nut cam full" id="dang">Đăng đơn</button>';
  }
  function xemTruocDon() {
    var v = $("#dvung").value, ngay = $("#dngay").value, T = M.soNgay(D.homNay, ngay), ts = S().thamSo, g = M.giaThamChieu(v);
    var gia1 = +$("#g1").value, lech = (gia1 - g.loai1) / g.loai1 * 100, kg = +$("#dkg").value;
    var pc = M.phanTramCoc(phien().id), coc = Math.round(kg * 0.85 * gia1 * pc / 100 / 1000) * 1000;
    var h = '<div class="the ' + (T <= ts.ngayGiaCoDinhToiDa ? "xanh" : "cam") + '">';
    if (T < 1) h += "Ngày cắt phải sau hôm nay.";
    else if (T <= ts.ngayGiaCoDinhToiDa) h += "<b>Chốt giá cứng</b>: ngày cắt trong " + ts.ngayGiaCoDinhToiDa + " ngày nên giá giữ nguyên tới lúc cân.";
    else { var bd = M.bienDo(v, ngay, T); h += "<b>Giữ giá theo biên độ ±" + so(bd.b) + "%</b> cho đơn " + T + " ngày ở vùng " + M.vung(v).ten + ', ' + bd.tenMua + '.<div class="nho">Tính từ ' + bd.n + " quan sát lịch sử (" + esc(bd.cap) + "). Giá chung lệch quá mức này trước xác nhận lần 2 thì bạn được đề nghị giá mới hoặc rút không phạt.</div>"; }
    h += '<div class="nho" style="margin-top:6px">Giá loại 1 của bạn ' + f.pt(lech) + " so với tham chiếu hôm nay. Cọc ước tính " + pc + "% ≈ " + f.vnd(coc) + ", trừ vào tiền hàng khi thanh toán.</div></div>";
    $("#xemTruoc").innerHTML = h;
  }

  // ---------- HTX ----------
  function htxHome() {
    var hd = S().hopDong, dangGiu = hd.filter(function (h) { return h.coc.trangThai === "dang_giu"; });
    var xong = hd.filter(function (h) { return h.trangThai === "hoan_tat"; }).length, huy = hd.filter(function (h) { return h.trangThai === "da_huy"; }).length;
    return "<h1>Bảng điều hành HTX</h1>" + '<div class="luoi"><div class="the"><div class="so">' + S().donMua.filter(function (d) { return d.trangThai === "mo"; }).length + '</div><div class="nho">đơn đang mở</div></div><div class="the"><div class="so">' + hd.length + '</div><div class="nho">hợp đồng · ' + xong + " hoàn tất · " + huy + " hủy</div></div>" +
      '<div class="the"><div class="so">' + f.tr(dangGiu.reduce(function (s, h) { return s + h.coc.tien; }, 0)) + '</div><div class="nho">cọc đang giữ (' + dangGiu.length + ' hợp đồng)</div></div><div class="the"><div class="so">' + S().tranhChap.filter(function (t) { return t.trangThai !== "xong"; }).length + '</div><div class="nho">tranh chấp chờ giám định</div></div></div>' +
      "<h2>Giá tham chiếu các vùng</h2>" + D.vung.map(function (v) { return theGia(v.id); }).join("") +
      '<div class="nuts"><a class="nut" href="#/htx/gia">Cập nhật giá hôm nay</a><a class="nut phu" href="#/htx/giam-sat">Giám sát giao dịch</a></div>';
  }
  function htxGia() {
    var ts = S().thamSo;
    return "<h1>Giá tham chiếu và biên độ</h1>" +
      '<div class="the"><h3>Công bố giá hôm nay</h3><p class="nho">Nhập ít nhất 3 báo giá loại 1 (vựa, chợ đầu mối, thương lái). Sàn lấy trung vị để một nguồn không kéo lệch được giá.</p><label>Vùng</label><select id="gvung">' + D.vung.map(function (v) { return '<option value="' + v.id + '">' + v.ten + "</option>"; }).join("") + "</select>" +
      [["Vựa tại xã", 7350], ["Chợ đầu mối", 7600], ["Thương lái quen", 7200]].map(function (x, i) { return '<div class="hang2"><div><label>Nguồn ' + (i + 1) + '</label><input class="gnoi" value="' + x[0] + '"></div><div><label>Giá L1 (đ/kg)</label><input class="ggia" type="number" value="' + x[1] + '"></div></div>'; }).join("") +
      '<button class="nut full" id="congBo" style="margin-top:10px">Công bố trung vị</button></div>' +
      '<div class="the"><h3>Tham số công thức biên độ</h3><p class="nho">Công khai cho mọi bên. Đổi tham số thì chỉ áp dụng cho đơn ký sau đó.</p><div class="hang2"><div><label>Phân vị (%)</label><input id="tpv" type="number" value="' + ts.phanVi + '"></div><div><label>Cửa sổ (năm)</label><input id="tcs" type="number" value="' + ts.cuaSoNam + '"></div><div><label>Biên độ tối thiểu (%)</label><input id="tmin" type="number" value="' + ts.bienDoMin + '"></div><div><label>Biên độ tối đa (%)</label><input id="tmax" type="number" value="' + ts.bienDoMax + '"></div></div><button class="nut phu full" id="luuTS" style="margin-top:10px">Lưu tham số</button></div>' +
      '<div class="the cuon"><h3>Bảng biên độ hiện hành</h3><table><tr><th>Vùng</th><th>Mùa</th><th>5 ngày</th><th>7 ngày</th><th>10 ngày</th><th>14 ngày</th><th>21 ngày</th></tr>' +
      D.vung.map(function (v) { return ["nghich", "ro"].map(function (m) { var ngay = m === "ro" ? "2027-06-15" : M.congNgay(D.homNay, 7); return "<tr><td>" + v.ten + "</td><td>" + (m === "ro" ? "Rộ" : "Nghịch") + "</td>" + [5, 7, 10, 14, 21].map(function (T) { var b = M.bienDo(v.id, ngay, T); return "<td>±" + so(b.b) + "%<br><span class=nho>n=" + b.n + "</span></td>"; }).join("") + "</tr>"; }).join(""); }).join("") + "</table></div>";
  }
  function htxGiamSat() {
    var ts = S().thamSo;
    return "<h1>Giám sát sàn</h1><h2>Xác minh người mua</h2>" + S().nguoiMua.map(function (n) { return '<div class="the"><div style="display:flex;justify-content:space-between;gap:8px"><div><b>' + esc(n.ten) + '</b> <span class="nhan">' + esc(n.loai) + '</span><div class="nho">' + n.donXong + " đơn xong · " + n.huySatNgay + " lần hủy sát ngày · cọc hiện " + M.phanTramCoc(n.id) + "%</div></div>" + (n.xacMinh ? '<span class="nhan">Đã xác minh</span>' : '<button class="nut" style="min-height:40px" data-xm="' + n.id + '">Xác minh</button>') + "</div></div>"; }).join("") +
      '<h2>Sổ cọc</h2><div class="the cuon"><p class="nho">Tiền cọc thực tế nằm ở tài khoản đảm bảo của ngân hàng hoặc tổ chức trung gian thanh toán được cấp phép (hoặc tài khoản HTX làm bên nhận cọc). Sổ này chỉ đối chiếu trạng thái.</p><table><tr><th>Hợp đồng</th><th>Người mua</th><th>Cọc</th><th>Trạng thái</th></tr>' + S().hopDong.map(function (h) { return '<tr><td><a href="#/hd/' + h.id + '">' + h.id + "</a></td><td>" + esc(M.nguoiMua(M.donMua(h.don).nguoiMua).ten) + "</td><td>" + f.vnd(h.coc.tien) + "</td><td>" + M.TRANG_THAI_COC[h.coc.trangThai] + "</td></tr>"; }).join("") + "</table></div>" +
      "<h2>Tranh chấp</h2>" + S().tranhChap.map(function (t) { return '<div class="the ' + (t.trangThai === "xong" ? "" : "do") + '"><b>' + t.id + "</b> · " + (M.hopDong(t.hopDong) ? '<a href="#/hd/' + t.hopDong + '">' + t.hopDong + "</a>" : t.hopDong) + " · " + f.ngay(t.ngay) + "<p class='nho'>" + esc(t.noiDung) + "</p>" + (t.trangThai === "xong" ? '<span class="nhan">Đã xử lý</span>' : '<button class="nut" data-tc="' + t.id + '">Ghi nhận đã giám định xong</button>') + "</div>"; }).join("") +
      "<h2>Tiêu chuẩn phân loại</h2><div class='the'>" + S().tieuChuan.map(function (t, i) { return "<label>" + t.ten + ' · đường kính</label><input class="tcdk" data-i="' + i + '" value="' + esc(t.duongKinh) + '">'; }).join("") + '<button class="nut phu full" id="luuTC" style="margin-top:10px">Lưu tiêu chuẩn</button></div>';
  }
  function htxCau() {
    return "<h1>Phát triển nguồn cầu</h1><p class='nho'>Thêm nhiều loại người mua là cách giảm ép giá bền nhất: mỗi lứa cam có nhiều nơi tranh mua, trái dạt cũng có chỗ đi.</p>" +
      '<div class="the cuon"><h3>Người mua đang mời</h3><table><tr><th>Đơn vị</th><th>Nhóm</th><th>Bước</th><th>Ghi chú</th></tr>' + S().moiNguoiMua.map(function (m) { return "<tr><td>" + esc(m.ten) + "</td><td>" + esc(m.loai) + '</td><td><span class="nhan cam">' + esc(m.buoc) + "</span></td><td>" + esc(m.ghiChu) + "</td></tr>"; }).join("") + "</table>" +
      '<div class="hang2" style="margin-top:8px"><input id="mten" placeholder="Tên đơn vị"><select id="mloai"><option>F&B</option><option>Bếp ăn</option><option>Chế biến</option><option>Cửa hàng</option><option>Thương lái</option></select></div><button class="nut phu full" id="themMoi" style="margin-top:8px">Thêm vào danh sách mời</button></div>' +
      '<div class="the"><h3>Ai làm phần kể chuyện và sản phẩm</h3><div class="dong"><span>Nông dân</span><span>Chỉ trồng, bán, cho quay vườn khi đồng ý</span></div><div class="dong"><span>HTX cùng Đoàn thanh niên xã, sinh viên</span><span>Quay, đăng TikTok và Facebook theo lịch</span></div><div class="dong"><span>Cơ sở chế biến, F&B, chủ thể OCOP</span><span>Làm trà vỏ cam, mứt, nước ép; mua nguyên liệu qua sàn</span></div><div class="dong"><span>Nhóm sinh viên</span><span>Thiết kế sàn, kịch bản nội dung, hộp quà mẫu</span></div></div>' +
      "<h2>Kế hoạch nội dung</h2><div class='the'>" + D.keHoachTikTok.map(function (k) { return '<div class="dong"><span><b>' + k.tuan + "</b> · " + esc(k.noiDung) + "</span></div>"; }).join("") + '</div><a class="nut phu full" href="#/cau-chuyen">Xem trang câu chuyện công khai</a>';
  }
  function htxTrinhDien() {
    return "<h1>Chế độ trình diễn</h1><p class='nho'>Dùng khi thuyết trình: giả lập giá chung đổi để xem cơ chế biên độ phản ứng thế nào với các hợp đồng.</p>" +
      D.vung.map(function (v) { var l = S().lechMoPhong[v.id] || 0; return '<div class="the"><b>' + v.ten + '</b> · lệch hiện tại <b id="lv-' + v.id + '">' + f.pt(l) + '</b><input type="range" min="-30" max="30" value="' + l + '" data-lech="' + v.id + '" style="padding:0"></div>'; }).join("") +
      '<div class="nuts"><button class="nut phu" id="xoaLech">Đưa giá về bình thường</button><button class="nut do" id="datLai">Khôi phục toàn bộ dữ liệu mẫu</button></div>' +
      '<div class="the xanh" style="margin-top:14px"><h3>Kịch bản gợi ý</h3><p class="nho">1. Đăng nhập Nông dân Chị Ba, mở HD-2401 (đơn 7 ngày, chưa xác nhận lần 2). 2. Quay lại đây kéo Trà Ôn xuống −20%. 3. Mở lại HD-2401 bằng tài khoản Vựa Năm Phát: thanh giá chuyển cam, người mua được đề nghị giá mới. 4. Đăng nhập Chị Ba để đồng ý hoặc từ chối (hủy không phạt). Làm tương tự với HD-2398 đã chốt để thấy giá bị khóa.</p></div>';
  }

  // ---------- Điều hướng ----------
  function route() {
    var raw = location.hash || "#/", parts = raw.split("?"), hash = parts[0], q = {};
    (parts[1] || "").split("&").forEach(function (kv) { var x = kv.split("="); if (x[0]) q[x[0]] = decodeURIComponent(x[1] || ""); });
    var p = phien(), seg = hash.replace(/^#\//, "").split("/"), html;
    var can = function (v) { if (!p || p.vai !== v) { di("#/dang-nhap"); return false; } return true; };
    if (hash === "#/" || hash === "#") html = p ? null : trangChu();
    if (hash === "#/" && p) { di(p.vai === "nd" ? "#/nd" : p.vai === "nm" ? "#/nm" : "#/htx"); return; }
    else if (seg[0] === "cau-chuyen") html = trangCauChuyen();
    else if (seg[0] === "tieu-chuan") html = trangTieuChuan();
    else if (seg[0] === "quy-che") html = trangQuyChe();
    else if (seg[0] === "dang-nhap") html = trangDangNhap();
    else if (seg[0] === "don") html = chiTietDon(seg[1], q);
    else if (seg[0] === "hd") { if (!p) { di("#/dang-nhap"); return; } html = chiTietHD(seg[1]); }
    else if (seg[0] === "nd") { if (!can("nd")) return; html = !seg[1] ? ndHome() : seg[1] === "don" ? dsDon(q.loc) : seg[1] === "hop-dong" ? dsHopDong(function (h) { return h.nongDan === p.id; }) : ndVuon(); }
    else if (seg[0] === "nm") { if (!can("nm")) return; html = !seg[1] ? nmHome() : seg[1] === "dang" ? nmDang() : dsHopDong(function (h) { return M.donMua(h.don).nguoiMua === p.id; }); }
    else if (seg[0] === "htx") { if (!can("htx")) return; html = !seg[1] ? htxHome() : seg[1] === "gia" ? htxGia() : seg[1] === "giam-sat" ? htxGiamSat() : seg[1] === "cau" ? htxCau() : htxTrinhDien(); }
    if (html == null) html = trangChu();
    khung(html, hash); ganSuKien(seg, q);
  }

  function ganSuKien(seg, q) {
    var on = function (sel, ev, fn) { var e = $(sel); if (e) e[ev] = fn; };
    // Đăng nhập
    document.querySelectorAll("[data-v]").forEach(function (b) { b.onclick = function () { vaiChon = b.dataset.v; route(); }; });
    on("#vao", "onclick", function () { if ($("#otp").value.trim() !== "2468") return toast("Mã OTP chưa đúng. Bản mẫu dùng 2468."); S().phien = { vai: vaiChon, id: $("#tk").value }; M.luu(); toast("Đăng nhập thành công"); di("#/"); });
    on("#loc", "onchange", function () { di("#/nd/don?loc=" + encodeURIComponent($("#loc").value)); });
    // Nhận đơn
    if (seg[0] === "don") on("#lua", "onchange", function () { di("#/don/" + seg[1] + "?lua=" + $("#lua").value); });
    if (seg[0] === "don" && $("#nhan")) {
      var d = M.donMua(seg[1]);
      var capNhat = function () { var l = M.luaCam($("#lua").value), kg = Math.max(0, +$("#kg").value || 0); $("#tien").innerHTML = bangTien(M.tinhTien(d, M.tyLeConLai(l), kg)); };
      $("#kg").oninput = capNhat;
      $("#nhan").onclick = function () {
        var kg = +$("#kg").value, con = d.kg - M.daNhan(d), l = M.luaCam($("#lua").value);
        if (!kg || kg < 50) return toast("Nhập số kg từ 50 trở lên");
        if (kg > con) return toast("Đơn chỉ còn nhận " + f.kg(con));
        var toiDaGiao = M.kgGiaoDuoc(d, l); if (kg > toiDaGiao) return toast("Lứa cam này chỉ còn khoảng " + f.kg(toiDaGiao) + " phù hợp đơn này");
        if (!confirm("Ký hợp đồng điện tử bán " + f.kg(kg) + " cho " + M.nguoiMua(d.nguoiMua).ten + "?")) return;
        var hd = M.taoHopDong(d.id, phien().id, kg, l.id); toast("Đã ký " + hd.id + ". Chờ người mua nộp cọc."); di("#/hd/" + hd.id);
      };
    }
    // Hợp đồng
    if (seg[0] === "hd") {
      var hd = M.hopDong(seg[1]);
      document.querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () {
          var a = b.dataset.act, H = M.HD;
          if (a === "nopCoc") H.nopCoc(hd);
          else if (a === "xacNhan2") { if (!confirm("Sau xác nhận lần 2, hủy đơn phương sẽ mất toàn bộ cọc. Xác nhận?")) return; H.xacNhan2(hd); }
          else if (a === "deNghi") H.deNghiGia(hd, phien().vai === "nm" ? "nguoimua" : "nongdan", JSON.parse(b.dataset.gia));
          else if (a === "dongYGia") H.dongYGia(hd);
          else if (a === "tuChoiGia") H.tuChoiGia(hd);
          else if (a === "batDauHai") H.batDauHai(hd);
          else if (a === "moBienBan") { $("#bienban").innerHTML = formBienBan(hd); ganSuKien(seg, q); $("#bienban").scrollIntoView({ behavior: "smooth" }); return; }
          else if (a === "luuBienBan") {
            var bb = { tong: +$("#bbkg").value, tyLe: { loai1: +$("#b1").value, loai2: +$("#b2").value, dat: +$("#b3").value, bo: +$("#b4").value } };
            var tong = bb.tyLe.loai1 + bb.tyLe.loai2 + bb.tyLe.dat + bb.tyLe.bo; if (Math.abs(tong - 100) > 0.5) return toast("Tổng các tỷ lệ phải bằng 100%");
            var dd = M.donMua(hd.don); if (Math.abs(bb.tong - hd.kg) / hd.kg * 100 > dd.dungSai) toast("Lưu ý: sản lượng lệch quá dung sai ±" + dd.dungSai + "%");
            if (hd.trangThai === "tranh_chap") S().tranhChap.forEach(function (t) { if (t.hopDong === hd.id) t.trangThai = "xong"; });
            H.lapBienBan(hd, bb);
          }
          else if (a === "giamDinh") H.yeuCauGiamDinh(hd, phien().vai === "nm" ? "nguoimua" : "nongdan");
          else if (a === "thanhToan") H.thanhToan(hd);
          else if (a === "hoanTat") H.hoanTat(hd);
          else if (a === "huy") { var ben = phien().vai === "nm" ? "nguoimua" : "nongdan", ly = b.dataset.ly, qh = H.hauQuaHuy(hd, ben, ly); if (!confirm(qh.moTa + "\n\nTiếp tục hủy?")) return; H.huy(hd, ben, ly); }
          M.luu(); route();
        };
      });
    }
    // Vườn
    on("#themLua", "onclick", function () {
      var t = { loai1: +$("#l1").value, loai2: +$("#l2").value, dat: +$("#l3").value }; if (t.loai1 + t.loai2 + t.dat !== 100) return toast("Tổng tỷ lệ phải bằng 100%");
      S().luaCam.push({ id: "L" + (S().luaCam.length + 10), nongDan: phien().id, ten: $("#lten").value || "Lứa mới", kg: +$("#lkg").value, ngayChin: $("#lngay").value, tyLe: t, trangThai: "dang_ban" }); M.luu(); toast("Đã lưu lứa cam. Người mua sẽ thấy trong nguồn hàng."); route();
    });
    // Đăng đơn
    if ($("#dang")) {
      ["#dvung", "#dngay", "#dkg", "#g1"].forEach(function (s) { $(s).oninput = xemTruocDon; $(s).onchange = xemTruocDon; }); xemTruocDon();
      $("#dang").onclick = function () {
        var ngay = $("#dngay").value, T = M.soNgay(D.homNay, ngay); if (T < 1) return toast("Ngày cắt phải sau hôm nay");
        var loai = $("#dloai").value.split(","), gia = {}; if (loai.indexOf("loai1") >= 0) gia.loai1 = +$("#g1").value; if (loai.indexOf("loai2") >= 0) gia.loai2 = +$("#g2").value;
        var d = { id: "D" + (++S().demDon), nguoiMua: phien().id, vung: $("#dvung").value, ngayDang: D.homNay, ngayCat: ngay, kg: +$("#dkg").value, dungSai: +$("#dds").value, nhanGom: $("#dgom").checked, loaiCan: loai.filter(function (l) { return l !== "dat"; }).length ? loai : ["dat"], gia: gia, giaDat: loai.indexOf("dat") >= 0 || loai.length > 1 ? +$("#g3").value : 0, tyLeDatToiDa: loai.indexOf("dat") >= 0 ? 100 : 15, cheDoGia: T <= S().thamSo.ngayGiaCoDinhToiDa ? "codinh" : "biendo", congHai: $("#dch").value, xe: $("#dxe").value, ghiChu: $("#dgc").value, trangThai: "mo" };
        S().donMua.push(d); M.luu(); toast("Đã đăng đơn " + d.id + ". Nông dân phù hợp sẽ thấy ngay."); di("#/don/" + d.id);
      };
    }
    // HTX
    on("#congBo", "onclick", function () {
      var noi = document.querySelectorAll(".gnoi"), gia = document.querySelectorAll(".ggia"), bg = [];
      gia.forEach(function (g, i) { if (+g.value > 0) bg.push({ noi: noi[i].value, gia: +g.value }); });
      if (bg.length < 3) return toast("Cần ít nhất 3 báo giá");
      var r = M.congBoGia($("#gvung").value, bg); toast("Đã công bố giá loại 1: " + r.loai1.toLocaleString("vi-VN") + " đ/kg"); route();
    });
    on("#luuTS", "onclick", function () { var ts = S().thamSo; ts.phanVi = Math.min(99, Math.max(50, +$("#tpv").value)); ts.cuaSoNam = Math.min(2, Math.max(1, +$("#tcs").value)); ts.bienDoMin = +$("#tmin").value; ts.bienDoMax = +$("#tmax").value; M.xoaCacheBD(); M.luu(); toast("Đã lưu tham số. Bảng biên độ được tính lại."); route(); });
    document.querySelectorAll("[data-xm]").forEach(function (b) { b.onclick = function () { var n = M.nguoiMua(b.dataset.xm); n.xacMinh = true; n.hang = "thuong"; M.luu(); toast("Đã xác minh " + n.ten); route(); }; });
    document.querySelectorAll("[data-tc]").forEach(function (b) { b.onclick = function () { S().tranhChap.forEach(function (t) { if (t.id === b.dataset.tc) t.trangThai = "xong"; }); M.luu(); route(); }; });
    on("#luuTC", "onclick", function () { document.querySelectorAll(".tcdk").forEach(function (i) { S().tieuChuan[+i.dataset.i].duongKinh = i.value; }); M.luu(); toast("Đã lưu tiêu chuẩn"); });
    on("#themMoi", "onclick", function () { if (!$("#mten").value) return; S().moiNguoiMua.push({ ten: $("#mten").value, loai: $("#mloai").value, buoc: "Đã liên hệ", ghiChu: "" }); M.luu(); route(); });
    document.querySelectorAll("[data-lech]").forEach(function (r) { r.oninput = function () { $("#lv-" + r.dataset.lech).textContent = f.pt(+r.value); }; r.onchange = function () { S().lechMoPhong[r.dataset.lech] = +r.value; M.luu(); toast("Giá chung vùng " + M.vung(r.dataset.lech).ten + " lệch " + f.pt(+r.value)); }; });
    on("#xoaLech", "onclick", function () { S().lechMoPhong = {}; M.luu(); route(); });
    on("#datLai", "onclick", function () { if (confirm("Khôi phục toàn bộ dữ liệu mẫu?")) { M.datLai(); toast("Đã khôi phục"); route(); } });
  }

  window.addEventListener("hashchange", route);
  route();
})();
