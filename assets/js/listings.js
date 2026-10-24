/* ============================================================
   listings.js — ilan arama, filtre, sırala, favori, detay galeri
   Veri: window.OD_DATA.listings (assets/data/listings.js)
   ============================================================ */
(function () {
  "use strict";
  var OD = window.OD, $ = OD.$, $$ = OD.$$;
  var DATA = (window.OD_DATA && window.OD_DATA.listings) || [];
  var BRAND = (window.OD_DATA && window.OD_DATA.brand) || {};

  var FAV_KEY = "odFavs";
  var favs = {};
  try { favs = JSON.parse(localStorage.getItem(FAV_KEY) || "{}"); } catch (e) { favs = {}; }
  function saveFavs() { try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch (e) {} }
  function favCount() { return Object.keys(favs).filter(function (k) { return favs[k]; }).length; }
  function syncFavBadge() {
    var c = $("#favCount"); if (!c) return;
    var n = favCount(); c.textContent = n;
    var btn = $("#favBtn"); if (btn) btn.style.display = n ? "" : "none";
    var gf = $("#favOnly"); if (gf) $(".n", gf).textContent = n;
  }
  window.OD.toggleFav = function (id) {
    favs[id] = !favs[id]; if (!favs[id]) delete favs[id]; saveFavs(); syncFavBadge();
    $$('.fav[data-fav="' + id + '"]').forEach(function (b) {
      b.classList.toggle("on", !!favs[id]);
      b.innerHTML = favs[id] ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
    });
    if (state.onlyFav) render();
  };

  /* ---- durumlar ---- */
  var statusMap = { satilik: ["Satılık", "tag-satilik"], kiralik: ["Kiralık", "tag-kiralik"], satildi: ["Satıldı", "tag-satildi"] };
  function fmtPrice(it) {
    if (!it.price) return "Fiyatı sorunuz";
    var s = it.price.toLocaleString("tr-TR") + " ₺";
    return it.status === "kiralik" ? '<small>aylık</small> ' + s : s;
  }
  function thumb(it) { return it.images[0]; }

  /* ---- filtre durumu ---- */
  var state = { q: "", status: "all", type: "all", district: "all", sort: "new", onlyFav: false, shown: 6 };

  function match(it) {
    if (state.onlyFav && !favs[it.id]) return false;
    if (state.status !== "all" && it.status !== state.status) return false;
    if (state.type !== "all" && it.type !== state.type) return false;
    if (state.district !== "all" && it.district !== state.district) return false;
    if (state.q) {
      var hay = (it.title + " " + it.district + " " + it.rooms + " " + (it.feats || []).join(" ") + " " + (it.desc || "")).toLowerCase();
      if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
    }
    return true;
  }
  function sortList(a, b) {
    if (state.sort === "price-asc") return (a.price || 0) - (b.price || 0);
    if (state.sort === "price-desc") return (b.price || 0) - (a.price || 0);
    if (state.sort === "m2-desc") return (b.m2 || 0) - (a.m2 || 0);
    return new Date(b.date) - new Date(a.date);
  }

  function cardHTML(it) {
    var st = statusMap[it.status] || ["—", ""];
    return '<article class="listing rv on" data-id="' + it.id + '">'
      + '<div class="ph"><img loading="lazy" decoding="async" src="' + thumb(it) + '" alt="' + it.title + '">'
      + '<span class="tag ' + st[1] + '">' + st[0] + '</span>'
      + '<button class="fav' + (favs[it.id] ? " on" : "") + '" data-fav="' + it.id + '" aria-label="Favorilere ekle">'
      + '<i class="' + (favs[it.id] ? "fas" : "far") + ' fa-heart"></i></button></div>'
      + '<div class="bd"><div class="price">' + fmtPrice(it) + '</div>'
      + '<h3>' + it.title + '</h3>'
      + '<div class="loc"><i class="fas fa-location-dot"></i>' + it.district + ' / ' + (BRAND.city || "Ordu") + '</div>'
      + '<div class="specs">'
      + (it.rooms !== "—" ? '<span class="spec"><i class="fas fa-bed"></i>' + it.rooms + '</span>' : "")
      + '<span class="spec"><i class="fas fa-ruler-combined"></i>' + it.m2 + ' m²</span>'
      + (it.type === "konut" ? '<span class="spec"><i class="fas fa-stairs"></i>' + it.floor + '</span>' : "")
      + (it.type === "konut" ? '<span class="spec"><i class="fas fa-fire"></i>' + it.heating + '</span>' : "")
      + '</div></div></article>';
  }

  function render() {
    var grid = $("#grid"); if (!grid) return;
    var list = DATA.filter(match).sort(sortList);
    var total = list.length;
    list = list.slice(0, state.shown);
    if (!total) {
      grid.innerHTML = '<div class="empty"><i class="fas fa-magnifying-glass"></i><p>Aradığınız kriterlere uygun ilan bulunamadı.<br>Filtreleri gevşetip tekrar deneyin.</p></div>';
    } else {
      grid.innerHTML = list.map(cardHTML).join("");
    }
    var res = $("#resultCount");
    if (res) res.textContent = total + " ilan";
    var lm = $("#loadMore");
    if (lm) lm.parentElement.style.display = DATA.filter(match).length > state.shown ? "" : "none";
    bindCards();
  }

  function bindCards() {
    $$("#grid .listing").forEach(function (c) {
      c.addEventListener("click", function (e) { if (e.target.closest(".fav")) return; openDetail(c.dataset.id); });
    });
    $$("#grid .fav").forEach(function (b) {
      b.addEventListener("click", function (e) { e.stopPropagation(); window.OD.toggleFav(b.dataset.fav); });
    });
  }

  /* ---- detay + galeri modal ---- */
  var cur = null, gi = 0;
  function openDetail(id) {
    var it = DATA.filter(function (x) { return x.id === id; })[0]; if (!it) return;
    cur = it; gi = 0;
    var box = $("#dBody"); if (!box) return;
    var st = statusMap[it.status] || ["—", ""];
    box.innerHTML =
      '<div class="mgal"><img id="dImg" src="' + it.images[0] + '" alt="' + it.title + '">'
      + (it.images.length > 1 ? '<button class="mnav l" id="dPrev" aria-label="Önceki"><i class="fas fa-chevron-left"></i></button><button class="mnav r" id="dNext" aria-label="Sonraki"><i class="fas fa-chevron-right"></i></button><span class="mcount" id="dCount">1/' + it.images.length + '</span>' : "")
      + '</div>'
      + (it.images.length > 1 ? '<div class="mthumbs" id="dThumbs">' + it.images.map(function (s, i) { return '<img class="' + (i ? "" : "on") + '" data-i="' + i + '" src="' + s + '" alt="görsel ' + (i + 1) + '">'; }).join("") + '</div>' : "")
      + '<span class="tag ' + st[1] + '">' + st[0] + '</span> <span class="chip">' + it.id + '</span>'
      + '<h2 style="margin:12px 0 4px;font-size:1.5rem">' + it.title + '</h2>'
      + '<div class="loc" style="color:var(--muted)"><i class="fas fa-location-dot"></i>' + it.district + ' / ' + (BRAND.city || "Ordu") + '</div>'
      + '<div class="price" style="font-size:1.7rem;font-weight:800;color:var(--p);margin:14px 0">' + fmtPrice(it) + '</div>'
      + '<p style="color:var(--muted)">' + (it.desc || "") + '</p>'
      + '<div class="dspecs">'
      + (it.rooms !== "—" ? '<div class="dspec"><i class="fas fa-bed"></i><b>' + it.rooms + '</b><span>Oda</span></div>' : "")
      + '<div class="dspec"><i class="fas fa-ruler-combined"></i><b>' + it.m2 + '</b><span>m²</span></div>'
      + (it.floor !== "—" ? '<div class="dspec"><i class="fas fa-stairs"></i><b>' + it.floor + '</b><span>Kat</span></div>' : "")
      + (it.type === "konut" ? '<div class="dspec"><i class="fas fa-calendar"></i><b>' + it.age + '</b><span>Bina yaşı</span></div>' : "")
      + (it.heating !== "—" ? '<div class="dspec"><i class="fas fa-fire"></i><b>' + it.heating + '</b><span>Isıtma</span></div>' : "")
      + '</div>'
      + (it.feats && it.feats.length ? '<div class="specs">' + it.feats.map(function (f) { return '<span class="spec"><i class="fas fa-check"></i>' + f + '</span>'; }).join("") + '</div>' : "")
      + '<div class="dactions">'
      + '<a class="btn btn-wa" target="_blank" rel="noopener" href="https://wa.me/' + (BRAND.whatsapp || "") + '?text=' + encodeURIComponent("Merhaba, " + it.id + " (" + it.title + ") ilanınız hakkında bilgi almak istiyorum.") + '"><i class="fab fa-whatsapp"></i> WhatsApp\'tan sor</a>'
      + '<a class="btn btn-o" href="tel:' + (BRAND.phone || "") + '"><i class="fas fa-phone"></i> Ara</a>'
      + '<button class="btn btn-o" id="dFav"><i class="' + (favs[it.id] ? "fas" : "far") + ' fa-heart"></i> ' + (favs[it.id] ? "Favorimde" : "Favorile") + '</button>'
      + '<button class="btn btn-o" id="dShare"><i class="fas fa-share-nodes"></i> Paylaş</button>'
      + '</div>';
    if (it.images.length > 1) {
      $("#dPrev").addEventListener("click", function () { showG(-1); });
      $("#dNext").addEventListener("click", function () { showG(1); });
      $$("#dThumbs img").forEach(function (t) { t.addEventListener("click", function () { setG(+t.dataset.i); }); });
    }
    $("#dFav").addEventListener("click", function () {
      window.OD.toggleFav(it.id); var on = favs[it.id];
      $("#dFav").innerHTML = '<i class="' + (on ? "fas" : "far") + ' fa-heart"></i> ' + (on ? "Favorimde" : "Favorile");
    });
    $("#dShare").addEventListener("click", function () {
      var link = location.href.split("#")[0] + "#/ilan/" + it.id;
      if (navigator.share) { navigator.share({ title: it.title, text: it.title + " — " + it.district, url: link }).catch(function () {}); }
      else { navigator.clipboard.writeText(link).then(function () { $("#dShare").innerHTML = '<i class="fas fa-check"></i> Kopyalandı'; setTimeout(function () { $("#dShare").innerHTML = '<i class="fas fa-share-nodes"></i> Paylaş'; }, 1800); }); }
    });
    window.OD._openModal(document.getElementById("mDetail"));
  }
  function setG(i) { if (!cur) return; gi = (i + cur.images.length) % cur.images.length; $("#dImg").src = cur.images[gi]; var c = $("#dCount"); if (c) c.textContent = (gi + 1) + "/" + cur.images.length; $$("#dThumbs img").forEach(function (t) { t.classList.toggle("on", +t.dataset.i === gi); }); }
  function showG(d) { setG(gi + d); }
  addEventListener("keydown", function (e) { if (!cur || !$("#mDetail") || $("#mDetail").style.display !== "block") return; if (e.key === "ArrowRight") showG(1); if (e.key === "ArrowLeft") showG(-1); });

  /* ---- filtre UI bağlama ---- */
  function init() {
    var q = $("#q"); if (q) q.addEventListener("input", function () { state.q = q.value; state.shown = 6; render(); });
    var tp = $("#fTypeSel"); if (tp) tp.addEventListener("change", function () { state.type = tp.value; state.shown = 6; render(); });
    var dc = $("#fDistrict"); if (dc) fillDistricts(dc);
    if (dc) dc.addEventListener("change", function () { state.district = dc.value; state.shown = 6; render(); });
    var so = $("#sort"); if (so) so.addEventListener("change", function () { state.sort = so.value; render(); });
    $$(".fchip[data-status]").forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".fchip[data-status]").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on"); state.status = b.dataset.status; state.shown = 6; render();
      });
    });
    var fo = $("#favOnly"); if (fo) fo.addEventListener("click", function () { fo.classList.toggle("on"); state.onlyFav = fo.classList.contains("on"); state.shown = 6; render(); });
    var lm = $("#loadMore"); if (lm) lm.addEventListener("click", function () { state.shown += 6; render(); });
    $$(".reset").forEach(function (r) { r.addEventListener("click", function () {
      state = { q: "", status: "all", type: "all", district: "all", sort: "new", onlyFav: false, shown: 6 };
      if (q) q.value = ""; if (tp) tp.value = "all"; if (dc) dc.value = "all"; if (so) so.value = "new";
      $$(".fchip[data-status]").forEach(function (x) { x.classList.toggle("on", x.dataset.status === "all"); });
      if (fo) fo.classList.remove("on");
      render();
    }); });

    /* hero arama kutusu grid'e bağlar */
    var hq = $("#heroQ");
    if (hq) hq.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { if (q) q.value = hq.value; state.q = hq.value; render(); document.getElementById("ilanlar") && document.getElementById("ilanlar").scrollIntoView({ behavior: "smooth" }); }
    });

    render();
    syncFavBadge();
    routeDetail();
  }

  function fillDistricts(sel) {
    var seen = {}, out = [];
    DATA.forEach(function (it) { if (!seen[it.district]) { seen[it.district] = 1; out.push(it.district); } });
    out.sort().forEach(function (d) { var o = document.createElement("option"); o.value = d; o.textContent = d; sel.appendChild(o); });
  }

  /* paylaşılan derin bağlantı: #/ilan/ID */
  function routeDetail() {
    var m = location.hash.match(/#\/ilan\/(.+)$/);
    if (m) openDetail(m[1]);
  }
  addEventListener("hashchange", routeDetail);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
