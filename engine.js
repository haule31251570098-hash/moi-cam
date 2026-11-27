/* Mối Cam - Lõi nghiệp vụ: lưu trạng thái, giá tham chiếu, biên độ, tính tiền, cọc, hợp đồng */
(function () {
  var D = window.MC_DATA;
  var KEY = "moicam_v3";
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  // ---------------- Lưu trạng thái ----------------
  function macDinh() {
    return {
      phien: null,
      donMua: clone(D.donMua), hopDong: clone(D.hopDong), luaCam: clone(D.luaCam),
      nguoiMua: clone(D.nguoiMua), nongDan: clone(D.nongDan), tranhChap: clone(D.tranhChap),
      thamSo: clone(D.thamSo), tieuChuan: clone(D.tieuChuan), moiNguoiMua: clone(D.moiNguoiMua),
      giaCongBo: {},      // { vung: { ngay, loai1, nguon: [..] } } giá HTX công bố hôm nay
      lechMoPhong: {},    // { vung: % } dùng trong chế độ trình diễn
      demDon: 200, demHD: 2500
    };
  }
  var S;
  try { S = JSON.parse(localStorage.getItem(KEY)) || macDinh(); } catch (e) { S = macDinh(); }
  function luu() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function datLai() { var p = S.phien; S = macDinh(); S.phien = p; luu(); }

  // ---------------- Tiện ích ----------------
  var soNgay = function (a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 864e5); };
  var congNgay = function (a, n) { return new Date(Date.parse(a + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10); };
  var thang = function (s) { return Number(s.slice(5, 7)); };
  var muaVu = function (ngay) { var t = thang(ngay); return t >= 5 && t <= 8 ? "ro" : "nghich"; };
  var TEN_MUA = { ro: "mùa rộ (tháng 5 đến 8)", nghich: "mùa nghịch (tháng 9 đến 4)" };
  var TEN_LOAI = { loai1: "Loại 1", loai2: "Loại 2", dat: "Trái dạt" };
  var tim = function (ds, id) { return ds.filter(function (x) { return x.id === id; })[0]; };
  var vung = function (id) { return tim(D.vung, id); };
  var nguoiMua = function (id) { return tim(S.nguoiMua, id); };
  var nongDan = function (id) { return tim(S.nongDan, id); };
  var donMua = function (id) { return tim(S.donMua, id); };
  var hopDong = function (id) { return tim(S.hopDong, id); };
  var luaCam = function (id) { return tim(S.luaCam, id); };

  // ---------------- Giá tham chiếu ----------------
  function giaThamChieu(vId) {
    var ds = D.lichSuGia[vId], cuoi = ds[ds.length - 1];
    var cb = S.giaCongBo[vId];
    var l1 = cb && cb.ngay === D.homNay ? cb.loai1 : cuoi.loai1;
    var lech = S.lechMoPhong[vId] || 0;
    l1 = Math.round(l1 * (1 + lech / 100) / 50) * 50;
    var h = D.heSoLoai;
    return { ngay: D.homNay, loai1: l1, loai2: Math.round(l1 * h.loai2 / 50) * 50, dat: Math.round(l1 * h.dat / 50) * 50, nguon: cb && cb.ngay === D.homNay ? cb.nguon : null, moPhong: lech };
  }
  function trungVi(arr) { var a = arr.slice().sort(function (x, y) { return x - y; }); var m = Math.floor(a.length / 2); return a.length % 2 ? a[m] : Math.round((a[m - 1] + a[m]) / 2); }
  function congBoGia(vId, baoGia) { // baoGia: [{noi, gia}]
    var g = trungVi(baoGia.map(function (x) { return x.gia; }));
    S.giaCongBo[vId] = { ngay: D.homNay, loai1: Math.round(g / 50) * 50, nguon: baoGia };
    S.lechMoPhong[vId] = 0; luu(); return S.giaCongBo[vId];
  }

  // ---------------- Biên độ theo công thức ----------------
  // B(vùng, mùa, T) = phân vị q của |P(t+T) - P(t)| / P(t), t thuộc mùa đó trong W năm gần nhất của vùng đó.
  // Thiếu dữ liệu (n < n_min) thì gộp dữ liệu cấp tỉnh. Làm tròn và giới hạn trong [Bmin, Bmax].
  var cacheBD = {};
  function quanSat(chuoi, mua, T, tuNgay) {
    var out = [];
    for (var i = 0; i + T < chuoi.length; i++) {
      if (chuoi[i].ngay < tuNgay || muaVu(chuoi[i].ngay) !== mua) continue;
      out.push(Math.abs(chuoi[i + T].loai1 - chuoi[i].loai1) / chuoi[i].loai1 * 100);
    }
    return out;
  }
  function phanVi(arr, q) { var a = arr.slice().sort(function (x, y) { return x - y; }); var k = Math.max(1, Math.ceil(q / 100 * a.length)); return a[k - 1]; }
  function bienDo(vId, ngayCat, T) {
    var ts = S.thamSo; T = Math.max(1, T);
    var mua = muaVu(ngayCat), k = [vId, mua, T, ts.phanVi, ts.cuaSoNam, ts.quanSatToiThieu, ts.bienDoMin, ts.bienDoMax].join("|");
    if (cacheBD[k]) return cacheBD[k];
    var tuNgay = congNgay(D.homNay, -365 * ts.cuaSoNam);
    var obs = quanSat(D.lichSuGia[vId], mua, T, tuNgay), cap = "vùng " + vung(vId).ten;
    if (obs.length < ts.quanSatToiThieu) {
      obs = []; D.vung.forEach(function (v) { obs = obs.concat(quanSat(D.lichSuGia[v.id], mua, T, tuNgay)); });
      cap = "tỉnh " + vung(vId).tinh + " (gộp do vùng thiếu dữ liệu)";
    }
    var tho = obs.length ? phanVi(obs, ts.phanVi) : ts.bienDoMax;
    var b = Math.round(tho / ts.lamTron) * ts.lamTron;
    var kep = Math.min(ts.bienDoMax, Math.max(ts.bienDoMin, b));
    var tb = obs.reduce(function (s, x) { return s + x; }, 0) / (obs.length || 1);
    var r = { b: kep, tho: tho, n: obs.length, cap: cap, mua: mua, tenMua: TEN_MUA[mua], T: T, trungBinh: tb, biKep: kep !== b };
    cacheBD[k] = r; return r;
  }
  function xoaCacheBD() { cacheBD = {}; }

  // ---------------- Tiền ----------------
  function giaDon(don, l) { return l === "dat" ? (don.giaDat || 0) : ((don.gia || {})[l] || 0); }
  // Hai kiểu đơn:
  //  - Mua xô (có cả Loại 1 và Loại 2): kg là tổng trái hái cả vườn, chia loại theo tỷ lệ; trái dạt nhận tới mức tối đa của đơn.
  //  - Mua lựa (chỉ một vài loại): kg là số kg của đúng các loại đơn mua; phần trái còn lại của lứa bán cho đơn khác.
  function laMuaXo(d) { return d.loaiCan.indexOf("loai1") >= 0 && d.loaiCan.indexOf("loai2") >= 0; }
  function duocMua(d, l) { if (l === "bo") return false; if (l === "dat") return (d.loaiCan.indexOf("dat") >= 0 || laMuaXo(d)) && giaDon(d, "dat") > 0; return d.loaiCan.indexOf(l) >= 0; }
  // Tiền về tay của nông dân = tổng (kg từng loại × giá loại đó) − chi phí nông dân phải lo (công hái, xe).
  // thucTe = false: ước tính theo tỷ lệ loại nông dân khai. thucTe = true: theo biên bản cân (tyLe có cả % bỏ, kg là tổng cân).
  // Chi phí công hái, xe của từng nông dân (nông dân tự cập nhật ở trang Vườn); chưa khai thì dùng mức HTX
  function chiPhiNd(ndId) {
    var nd = ndId ? nongDan(ndId) : null, c = nd && nd.chiPhi;
    return { congHai: c && c.congHai >= 0 ? c.congHai : S.thamSo.congHai, xe: c && c.xe >= 0 ? c.xe : S.thamSo.xeCho, rieng: !!c };
  }
  function tinhTien(don, tyLe, kg, giaGhiDe, thucTe, ndId) {
    var cp = chiPhiNd(ndId);
    var g = giaGhiDe || { loai1: giaDon(don, "loai1"), loai2: giaDon(don, "loai2"), dat: giaDon(don, "dat") };
    var dong = [], tong = 0, kgBan = 0, kgKhongMua = 0, phan = {};
    if (!thucTe && !laMuaXo(don)) {
      var s = don.loaiCan.reduce(function (a, l) { return a + (tyLe[l] || 0); }, 0);
      don.loaiCan.forEach(function (l) { phan[l] = s ? kg * (tyLe[l] || 0) / s : 0; });
    } else ["loai1", "loai2", "dat", "bo"].forEach(function (l) { phan[l] = kg * (tyLe[l] || 0) / 100; });
    ["loai1", "loai2", "dat", "bo"].forEach(function (l) {
      var k = Math.round((phan[l] || 0) * 100) / 100;
      if (!k) return;
      if (!duocMua(don, l) || !g[l]) { kgKhongMua += k; return; }
      if (l === "dat") { var toiDa = kg * (don.tyLeDatToiDa || 0) / 100; if (k > toiDa) { kgKhongMua += k - toiDa; k = toiDa; } }
      if (k <= 0) return;
      dong.push({ l: l, kg: k, gia: g[l], tien: k * g[l] }); tong += k * g[l]; kgBan += k;
    });
    var tru = [];
    if (don.congHai === "nongdan") { var t1 = kgBan * cp.congHai; tru.push(["Công hái " + cp.congHai.toLocaleString("vi-VN") + " đ/kg (nông dân trả)", t1]); tong -= t1; }
    if (don.xe === "nongdan") { var t2 = kgBan * cp.xe; tru.push(["Xe chở " + cp.xe.toLocaleString("vi-VN") + " đ/kg (nông dân lo)", t2]); tong -= t2; }
    return { dong: dong, tru: tru, tong: tong, kgBan: kgBan, kgKhongMua: kgKhongMua, giaTri: dong.reduce(function (s, x) { return s + x.tien; }, 0) };
  }
  function tyLeMacDinh(don) { return don.loaiCan.length === 1 && don.loaiCan[0] === "dat" ? { dat: 100 } : { loai1: 55, loai2: 30, dat: 15 }; }
  function phanTramCoc(nmId) { var nm = nguoiMua(nmId); var h = !nm.xacMinh ? "moi" : nm.hang; return S.thamSo.cocTheoHang[h] || S.thamSo.cocTheoHang.moi; }

  // ---------------- Lứa cam: phần còn chưa có người mua ----------------
  // Trừ dần theo các hợp đồng đã ký trên lứa: mua xô lấy đều mọi loại, mua lựa chỉ lấy các loại đơn mua.
  function conLaiTheoLoai(lua) {
    var tl = lua.tyLe, con = {};
    ["loai1", "loai2", "dat"].forEach(function (l) { con[l] = lua.kg * (tl[l] || 0) / 100; });
    S.hopDong.forEach(function (h) {
      if (h.lua !== lua.id || h.trangThai === "da_huy") return;
      var d = donMua(h.don);
      if (laMuaXo(d)) ["loai1", "loai2", "dat"].forEach(function (l) { con[l] -= h.kg * (tl[l] || 0) / 100; });
      else { var s = d.loaiCan.reduce(function (a, l) { return a + (tl[l] || 0); }, 0); d.loaiCan.forEach(function (l) { if (s) con[l] -= h.kg * (tl[l] || 0) / s; }); }
    });
    ["loai1", "loai2", "dat"].forEach(function (l) { con[l] = Math.max(0, Math.round(con[l])); });
    return con;
  }
  function tongConLai(lua) { var c = conLaiTheoLoai(lua); return c.loai1 + c.loai2 + c.dat; }
  function tyLeConLai(lua) { var c = conLaiTheoLoai(lua), t = c.loai1 + c.loai2 + c.dat; return t ? { loai1: c.loai1 / t * 100, loai2: c.loai2 / t * 100, dat: c.dat / t * 100 } : { loai1: 0, loai2: 0, dat: 0 }; }
  // Số kg tối đa lứa này giao được cho đơn
  function kgGiaoDuoc(d, lua) { var c = conLaiTheoLoai(lua); return laMuaXo(d) ? c.loai1 + c.loai2 + c.dat : d.loaiCan.reduce(function (a, l) { return a + (c[l] || 0); }, 0); }

  // ---------------- Kết nối: gợi ý ghép ----------------
  function ghepChoLua(lua) {
    var tl = tyLeConLai(lua);
    return S.donMua.filter(function (d) { return d.trangThai === "mo"; }).map(function (d) {
      var lech = Math.abs(soNgay(lua.ngayChin, d.ngayCat));
      var kg = Math.min(d.kg - daNhan(d), kgGiaoDuoc(d, lua));
      var t = tinhTien(d, tl, kg, null, false, lua.nongDan);
      var diem = t.tong / 1e6 - lech * 0.6 + (d.vung === nongDan(lua.nongDan).vung ? 1 : 0);
      return { don: d, kg: kg, tien: t, lechNgay: lech, diem: diem };
    }).filter(function (x) { return x.kg > 0 && x.lechNgay <= 6 && x.tien.kgBan > 0; }).sort(function (a, b) { return b.diem - a.diem; });
  }
  function daNhan(d) { return S.hopDong.filter(function (h) { return h.don === d.id && h.trangThai !== "da_huy"; }).reduce(function (s, h) { return s + h.kg; }, 0); }
  function ghepChoDon(d) {
    return S.luaCam.filter(function (l) { return l.trangThai === "dang_ban" && tongConLai(l) > 0 && Math.abs(soNgay(l.ngayChin, d.ngayCat)) <= 6; });
  }

  // ---------------- Hợp đồng ----------------
  function taoHopDong(donId, ndId, kg, luaId) {
    var d = donMua(donId), nd = nongDan(ndId), lua = luaCam(luaId);
    var T = soNgay(D.homNay, d.ngayCat);
    var ref = giaThamChieu(d.vung);
    var bd = d.cheDoGia === "biendo" ? bienDo(d.vung, d.ngayCat, T) : null;
    var t = tinhTien(d, lua ? tyLeConLai(lua) : tyLeMacDinh(d), kg, null, false, ndId);
    var tienCoc = Math.round(t.giaTri * phanTramCoc(d.nguoiMua) / 100 / 1000) * 1000;
    var hd = {
      id: "HD-" + (++S.demHD), don: donId, nongDan: ndId, lua: luaId || null, kg: kg, ngayKy: D.homNay,
      gia: { loai1: giaDon(d, "loai1"), loai2: giaDon(d, "loai2"), dat: giaDon(d, "dat") },
      giaThamChieuLucKy: ref.loai1, bienDo: bd ? bd.b : null, trangThai: "cho_coc",
      coc: { tien: tienCoc, phanTram: phanTramCoc(d.nguoiMua), trangThai: "cho_nop", baoLanh: nd.thanhVienHTX ? "HTX bảo lãnh nghĩa vụ của nông dân" : null, cocNongDan: nd.thanhVienHTX ? 0 : Math.round(t.giaTri * S.thamSo.cocNongDanNgoaiHTX / 100 / 1000) * 1000 },
      nhatKy: [[D.homNay, "Nông dân nhận đơn, hai bên xác nhận hợp đồng điện tử"]]
    };
    S.hopDong.push(hd); luu(); return hd;
  }
  // Chuẩn hóa các hợp đồng mẫu thiếu trường
  S.hopDong.forEach(function (h) {
    var d = donMua(h.don); if (!d) return;
    if (h.coc.trangThai === "da_nop") h.coc.trangThai = "dang_giu";
    if (!h.gia) h.gia = { loai1: giaDon(d, "loai1"), loai2: giaDon(d, "loai2"), dat: giaDon(d, "dat") };
    if (!h.giaThamChieuLucKy) h.giaThamChieuLucKy = giaThamChieu(d.vung).loai1;
    if (h.bienDo === undefined) h.bienDo = d.cheDoGia === "biendo" ? bienDo(d.vung, d.ngayCat, Math.max(1, soNgay(h.ngayKy, d.ngayCat))).b : null;
    if (!h.coc.tien) { var t = tinhTien(d, tyLeMacDinh(d), h.kg, null, false, h.nongDan); h.coc.tien = Math.round(t.giaTri * phanTramCoc(d.nguoiMua) / 100 / 1000) * 1000; h.coc.phanTram = phanTramCoc(d.nguoiMua); var nd = nongDan(h.nongDan); h.coc.baoLanh = nd.thanhVienHTX ? "HTX bảo lãnh nghĩa vụ của nông dân" : null; h.coc.cocNongDan = 0; }
  });

  function tinhTrangGia(hd) {
    var d = donMua(hd.don), ref = giaThamChieu(d.vung).loai1;
    var lech = (ref - hd.giaThamChieuLucKy) / hd.giaThamChieuLucKy * 100;
    if (d.cheDoGia === "codinh") return { lech: lech, ref: ref, coDinh: true, trong: true };
    var trong = Math.abs(lech) <= hd.bienDo + 1e-9;
    return { lech: lech, ref: ref, coDinh: false, trong: trong, benBatLoi: trong ? null : (lech < 0 ? "nguoimua" : "nongdan") };
  }
  var truocChot = function (hd) { return ["cho_coc", "da_ky"].indexOf(hd.trangThai) >= 0; };
  function ghi(hd, s) { hd.nhatKy.push([D.homNay, s]); luu(); }

  var HD = {
    nopCoc: function (hd) { hd.coc.trangThai = "dang_giu"; hd.trangThai = "da_ky"; ghi(hd, "Cọc " + fmt.vnd(hd.coc.tien) + " đã vào tài khoản đảm bảo"); },
    xacNhan2: function (hd) { hd.trangThai = "da_chot"; ghi(hd, "Người mua xác nhận lần 2. Điều kiện đơn khóa lại, nông dân được gọi người hái"); },
    deNghiGia: function (hd, ben, giaMoi) { hd.deNghi = { ben: ben, gia: giaMoi }; ghi(hd, (ben === "nguoimua" ? "Người mua" : "Nông dân") + " đề nghị điều chỉnh giá do giá chung lệch quá biên độ"); },
    dongYGia: function (hd) { hd.giaCu = hd.gia; hd.gia = hd.deNghi.gia; hd.giaThamChieuLucKy = tinhTrangGia(hd).ref; ghi(hd, "Hai bên đồng ý giá mới; giá tham chiếu mốc được cập nhật"); hd.deNghi = null; luu(); },
    tuChoiGia: function (hd) { hd.deNghi = null; HD.huy(hd, "he_thong", "vuot_bien_do"); },
    batDauHai: function (hd) { hd.daHai = true; ghi(hd, "Nông dân báo đã bắt đầu hái"); },
    lapBienBan: function (hd, bb) { hd.bienBan = bb; hd.trangThai = "da_can"; ghi(hd, "Lập biên bản cân và phân loại: " + fmt.kg(bb.tong) + " (" + ["loai1", "loai2", "dat", "bo"].map(function (l) { return TEN_LOAI[l] ? TEN_LOAI[l] + " " + bb.tyLe[l] + "%" : "bỏ " + bb.tyLe.bo + "%"; }).join(", ") + ")"); },
    yeuCauGiamDinh: function (hd, ben) { hd.trangThai = "tranh_chap"; S.tranhChap.push({ id: "TC-" + (S.tranhChap.length + 8), hopDong: hd.id, noiDung: (ben === "nongdan" ? "Nông dân" : "Người mua") + " không đồng ý biên bản phân loại, yêu cầu HTX giám định lại", trangThai: "dang_xu_ly", ngay: D.homNay }); ghi(hd, "Yêu cầu HTX giám định lại"); },
    thanhToan: function (hd) { hd.trangThai = "da_thanh_toan"; ghi(hd, "Người mua chuyển phần còn lại sau khi trừ cọc"); },
    hoanTat: function (hd) { hd.trangThai = "hoan_tat"; hd.coc.trangThai = "da_tru_tien_hang"; ghi(hd, "Nông dân xác nhận đã nhận đủ tiền. Cọc được trừ vào tiền hàng. Hợp đồng hoàn tất"); },
    // Hủy hợp đồng và tính hậu quả cọc
    hauQuaHuy: function (hd, ben, lyDo) {
      var hopLe = lyDo === "bat_kha_khang" || (lyDo === "vuot_bien_do" && truocChot(hd) && !tinhTrangGia(hd).trong);
      var phan = 0, congHai = 0, giaiDoan;
      if (hopLe) { phan = 0; giaiDoan = "Lý do hợp lệ"; }
      else if (truocChot(hd)) { phan = S.thamSo.phatHuyTruocXN2; giaiDoan = "Trước xác nhận lần 2"; }
      else { phan = 100; giaiDoan = hd.daHai ? "Sau khi đã hái" : "Sau xác nhận lần 2"; if (hd.daHai) congHai = hd.kg * S.thamSo.congHai; }
      var tienPhat = Math.round(hd.coc.tien * phan / 100);
      var moTa;
      if (hopLe) moTa = "Hủy không phạt. Cọc " + fmt.vnd(hd.coc.tien) + " hoàn trả người mua. Không trừ uy tín.";
      else if (ben === "nguoimua") moTa = "Người mua mất " + fmt.vnd(tienPhat) + " (" + phan + "% cọc) chuyển cho nông dân" + (congHai ? ", trả thêm công hái " + fmt.vnd(congHai) : "") + ". Phần cọc còn lại hoàn trả. Trừ điểm uy tín.";
      else moTa = "Nông dân trả người mua khoản tương đương " + fmt.vnd(tienPhat) + " (" + phan + "% cọc)" + (hd.coc.baoLanh ? ", HTX tạm ứng theo bảo lãnh rồi trừ dần vào lần bán sau" : "") + ". Cọc của người mua hoàn trả đủ. Trừ điểm uy tín.";
      return { hopLe: hopLe, phan: phan, tienPhat: tienPhat, congHai: congHai, giaiDoan: giaiDoan, moTa: moTa };
    },
    huy: function (hd, ben, lyDo) {
      var q = HD.hauQuaHuy(hd, ben === "he_thong" ? "nguoimua" : ben, lyDo);
      hd.trangThai = "da_huy"; hd.huy = { ben: ben, lyDo: lyDo, hauQua: q };
      hd.coc.trangThai = hd.coc.trangThai === "cho_nop" ? "khong_phat_sinh" : (q.tienPhat ? (ben === "nguoimua" ? "chuyen_boi_thuong" : "hoan_tra_kem_boi_thuong") : "da_hoan");
      if (!q.hopLe) { var nm = ben === "nguoimua" ? nguoiMua(donMua(hd.don).nguoiMua) : null; if (nm) nm.huySatNgay++; }
      ghi(hd, "Hủy hợp đồng (" + q.giaiDoan + "). " + q.moTa);
    }
  };

  // ---------------- Định dạng ----------------
  var fmt = {
    vnd: function (n) { return Math.round(n).toLocaleString("vi-VN") + " đ"; },
    tr: function (n) { return (n / 1e6).toLocaleString("vi-VN", { maximumFractionDigits: 1 }) + " triệu"; },
    kg: function (n) { return n >= 1000 && n % 100 === 0 ? (n / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 }) + " tấn" : Math.round(n).toLocaleString("vi-VN") + " kg"; },
    ngay: function (s) { return s.slice(8, 10) + "/" + s.slice(5, 7); },
    ngayDu: function (s) { return s.slice(8, 10) + "/" + s.slice(5, 7) + "/" + s.slice(0, 4); },
    pt: function (n, d) { return (n >= 0 ? "+" : "") + n.toLocaleString("vi-VN", { maximumFractionDigits: d === undefined ? 1 : d }) + "%"; }
  };

  var TRANG_THAI = {
    cho_coc: ["Chờ nộp cọc", "cam"], da_ky: ["Đã ký, chờ xác nhận lần 2", "cam"], da_chot: ["Đã chốt, được hái", "xanh"],
    da_can: ["Đã cân, chờ thanh toán", "xanh"], da_thanh_toan: ["Đã thanh toán, chờ xác nhận", "xanh"], hoan_tat: ["Hoàn tất", "xam"],
    da_huy: ["Đã hủy", "do"], tranh_chap: ["Đang giám định", "do"]
  };
  var TRANG_THAI_COC = { cho_nop: "Chờ nộp", dang_giu: "Đang giữ ở tài khoản đảm bảo", da_tru_tien_hang: "Đã trừ vào tiền hàng", da_hoan: "Đã hoàn trả người mua", chuyen_boi_thuong: "Đã chuyển bồi thường cho nông dân", hoan_tra_kem_boi_thuong: "Hoàn trả, nông dân bồi thường thêm", khong_phat_sinh: "Không phát sinh" };

  window.MC = {
    D: D, get S() { return S; }, luu: luu, datLai: datLai, fmt: fmt, TEN_LOAI: TEN_LOAI, TEN_MUA: TEN_MUA, TRANG_THAI: TRANG_THAI, TRANG_THAI_COC: TRANG_THAI_COC,
    soNgay: soNgay, congNgay: congNgay, muaVu: muaVu, vung: vung, nguoiMua: nguoiMua, nongDan: nongDan, donMua: donMua, hopDong: hopDong, luaCam: luaCam,
    giaThamChieu: giaThamChieu, congBoGia: congBoGia, trungVi: trungVi, bienDo: bienDo, xoaCacheBD: xoaCacheBD,
    tinhTien: tinhTien, chiPhiNd: chiPhiNd, laMuaXo: laMuaXo, conLaiTheoLoai: conLaiTheoLoai, tongConLai: tongConLai, tyLeConLai: tyLeConLai, kgGiaoDuoc: kgGiaoDuoc, tyLeMacDinh: tyLeMacDinh, phanTramCoc: phanTramCoc, giaDon: giaDon,
    ghepChoLua: ghepChoLua, ghepChoDon: ghepChoDon, daNhan: daNhan, taoHopDong: taoHopDong, tinhTrangGia: tinhTrangGia, truocChot: truocChot, HD: HD
  };
})();
