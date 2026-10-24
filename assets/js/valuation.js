/* ============================================================
   valuation.js — 3D coverflow portföy + anlık değerleme
   hesaplayıcı + ücretsiz değerleme formu (WhatsApp lead)
   ============================================================ */
(function () {
  "use strict";
  var OD = window.OD, $ = OD.$, $$ = OD.$$;
  var DATA = (window.OD_DATA && window.OD_DATA.listings) || [];
  var BRAND = (window.OD_DATA && window.OD_DATA.brand) || {};
  var PPM = (window.OD_DATA && window.OD_DATA.pricePerM2) || {};

  /* ---------- portföy (satılanlar) 3D coverflow ---------- */
  var sold = DATA.filter(function (x) { return x.status === "satildi"; });
  var stage = $("#stage");
  if (stage && sold.length) {
    var dots = $("#pDots"), cur = 0;
    sold.forEach(function (it, i) {
      var d = document.createElement("div"); d.className = "pcard";
      d.innerHTML = '<img src="' + it.images[0] + '" alt="' + it.title + '" loading="lazy" decoding="async">'
        + '<div class="band"><div><b>' + it.title + '</b><div style="color:#9fb0cb;font-size:.85rem">' + it.rooms + ' · ' + it.m2 + ' m² · ' + it.district + '</div></div><span class="tag tag-satildi">SATILDI</span></div>';
      d.addEventListener("click", function () { i === cur ? OD.openImg(it.images[0], it.title) : go(i); });
      stage.appendChild(d);
      var s = document.createElement("span"); if (i === 0) s.className = "on";
      s.addEventListener("click", function () { go(i); }); dots.appendChild(s);
    });
    var cards = stage.children;
    function go(n) {
      cur = (n + sold.length) % sold.length;
      for (var i = 0; i < cards.length; i++) {
        var o = (i - cur + sold.length) % sold.length; if (o > sold.length / 2) o -= sold.length;
        var abs = Math.abs(o);
        cards[i].style.transform = "translate(-50%,-50%) translateX(" + (o * 52) + "%) translateZ(" + (-abs * 260) + "px) rotateY(" + (o * -24) + "deg)";
        cards[i].style.opacity = abs > 1 ? "0" : "1";
        cards[i].style.zIndex = 10 - abs;
        cards[i].style.pointerEvents = o === 0 ? "auto" : "none";
      }
      for (var j = 0; j < dots.children.length; j++) dots.children[j].className = j === cur ? "on" : "";
    }
    go(0);
    $("#pvPrev").addEventListener("click", function () { go(cur - 1); });
    $("#pvNext").addEventListener("click", function () { go(cur + 1); });
    var tx = null;
    stage.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 44) go(cur + (dx < 0 ? 1 : -1)); tx = null; });
    if (!OD.RM) setInterval(function () { go(cur + 1); }, 6500);
  }

  /* ---------- anlık değerleme hesaplayıcı ---------- */
  var form = $("#calcForm");
  if (form) {
    var typeF = { konut: 1, arsa: 0.32, ticari: 1.15 };
    var condF = { "cok-iyi": 1.18, iyi: 1.06, orta: 0.95, kotu: 0.8 };
    var out = $("#calcOut");
    function calc() {
      var d = new FormData(form);
      var ppm = +PPM[d.get("dist")] || PPM["Diğer"] || 20000;
      var m2 = Math.max(1, +d.get("m2") || 0);
      var age = Math.max(0, +d.get("age") || 0);
      var tf = typeF[d.get("type")] || 1;
      var cf = condF[d.get("cond")] || 1;
      var ageF = Math.max(0.72, 1 - age * 0.006);
      var est = ppm * m2 * tf * cf * ageF;
      var lo = Math.round(est * 0.92 / 1e5) * 1e5, hi = Math.round(est * 1.08 / 1e5) * 1e5;
      var perM2 = Math.round(est / m2 / 100) * 100;
      /* kira çarpanı bilgisi: ORT ~240 ay (demo) */
      var estRent = Math.round(est / 240 / 500) * 500;
      out.innerHTML =
        '<div class="calcrow"><div><span class="cl">Tahmini değer aralığı</span><b class="cbig">' + lo.toLocaleString("tr-TR") + " – " + hi.toLocaleString("tr-TR") + ' ₺</b></div>'
        + '<div style="text-align:right"><span class="cl">m² bazında</span><b class="cbig sm">' + perM2.toLocaleString("tr-TR") + ' ₺/m²</b></div></div>'
        + '<div class="calcrow sub2"><span><i class="fas fa-key"></i> Tahmini aylık kira: <b>' + estRent.toLocaleString("tr-TR") + ' ₺</b></span>'
        + '<span class="hint">*Bilgilendirme amaçlı ön tahmindir; kesin değer yerinde inceleme ile belirlenir.</span></div>';
    }
    form.addEventListener("input", calc);
    calc();
  }

  /* ---------- iletişim: hızlı mesaj → WhatsApp ---------- */
  var qf = $("#quickForm");
  if (qf) {
    qf.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!qf.checkValidity()) { qf.reportValidity(); return; }
      var n = $("#kName").value.trim(), m = $("#kMsg").value.trim();
      window.open("https://wa.me/" + BRAND.whatsapp + "?text=" + encodeURIComponent("Merhaba " + (BRAND.name || "") + ", " + n + ".\n\n" + m), "_blank");
      var out = $("#kMsgOut"); if (out) { out.className = "fmsg ok"; out.textContent = "WhatsApp penceresi açıldı — göndermeniz yeterli."; }
      qf.reset();
    });
  }

  /* ---------- ücretsiz değerleme formu → WhatsApp ---------- */
  var vf = $("#vForm");
  if (vf) {
    var msg = $("#fMsg"), btn = $("#fBtn"), orig = btn.innerHTML;
    vf.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!vf.checkValidity()) { vf.reportValidity(); return; }
      var name = $("#fName").value.trim(), ph = $("#fPhone").value.trim(),
        ty = $("#fType2").value, m2 = $("#fM2").value.trim(),
        lo = $("#fLoc").value.trim(), no = $("#fNote").value.trim();
      btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch spin"></i> Gönderiliyor…';
      msg.textContent = ""; msg.className = "fmsg";
      setTimeout(function () {
        try {
          var L = JSON.parse(localStorage.getItem("odLeads") || "[]");
          L.push({ name: name, ph: ph, ty: ty, m2: m2, lo: lo, no: no, at: new Date().toISOString() });
          localStorage.setItem("odLeads", JSON.stringify(L));
          var t = "Merhaba Özel Bey, web sitesinden değerleme talebim var.\nAd: " + name + "\nTel: " + ph + "\nTür: " + ty + "\nm²: " + m2 + "\nKonum: " + lo + "\nNot: " + no;
          window.open("https://wa.me/" + BRAND.whatsapp + "?text=" + encodeURIComponent(t), "_blank");
          vf.reset(); btn.disabled = false; btn.innerHTML = orig;
          msg.className = "fmsg ok"; msg.textContent = "Talebiniz hazırlandı — WhatsApp penceresinden gönderin. Teşekkürler!";
        } catch (err) {
          btn.disabled = false; btn.innerHTML = orig;
          msg.className = "fmsg err"; msg.textContent = "Bir aksaklık oldu; direkt WhatsApp: " + BRAND.phoneHuman;
        }
      }, 800);
    });
  }
})();
