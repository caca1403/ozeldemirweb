/* ============================================================
   app.js — çekirdek arayüz davranışları
   tema, nav, progress, sayaç, reveal, uzmanlık, referans,
   SSS, blog modal, sertifika modal, yukarı-çık
   (ES module değil — file:// ve GitHub Pages'in ikisinde de çalışır)
   ============================================================ */
(function () {
  "use strict";
  var RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  window.OD = { $: $, $$: $$, RM: RM };

  /* ---------- tema ---------- */
  var root = document.documentElement;
  try { var t = localStorage.getItem("odTheme"); if (t) root.setAttribute("data-theme", t); } catch (e) {}
  function themeIcon() {
    var i = $("#tgl i"); if (!i) return;
    i.className = root.getAttribute("data-theme") === "dark" ? "fas fa-sun" : "fas fa-moon";
  }
  themeIcon();
  var tgl = $("#tgl");
  if (tgl) tgl.addEventListener("click", function () {
    var n = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", n);
    try { localStorage.setItem("odTheme", n); } catch (e) {}
    themeIcon();
  });

  /* ---------- nav: scroll + burger + aktif link + progress ---------- */
  var nav = $("#nav"), prog = $("#progress"), bar = $("#toTop");
  function onScroll() {
    var y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (nav) nav.classList.toggle("solid", y > 40);
    if (prog) prog.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    if (bar) bar.classList.toggle("show", y > 600);
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if (bar) bar.addEventListener("click", function () { scrollTo({ top: 0, behavior: "smooth" }); });

  var burger = $("#burger"), links = $("#navLinks");
  if (burger && links) {
    burger.addEventListener("click", function () {
      var o = links.classList.toggle("open");
      burger.setAttribute("aria-expanded", o);
      document.body.classList.toggle("lock", o);
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { links.classList.remove("open"); document.body.classList.remove("lock"); }
    });
  }

  /* aktif bölüm takibi */
  if ("IntersectionObserver" in window && links) {
    var secs = $$("main section[id]");
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        $$("a", links).forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- sayaçlar ---------- */
  function runCounter(el) {
    var target = +el.dataset.t || 0, d = 1500, step = Math.max(1, Math.floor(target / (d / 16))), cur = 0;
    var iv = setInterval(function () { cur += step; if (cur >= target) { cur = target; clearInterval(iv); } el.textContent = cur.toLocaleString("tr-TR"); }, 16);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); } });
    }, { threshold: .5 });
    $$(".counter").forEach(function (c) { cio.observe(c); });
  } else { $$(".counter").forEach(runCounter); }

  /* ---------- reveal ---------- */
  if ("IntersectionObserver" in window && !RM) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("on"); rio.unobserve(e.target); } });
    }, { threshold: .12 });
    $$(".rv").forEach(function (e) { rio.observe(e); });
  } else { $$(".rv").forEach(function (e) { e.classList.add("on"); }); }

  /* ---------- uzmanlık döngüsü ---------- */
  var et = $("#et");
  if (et) {
    var EX = ["Gayrimenkul Değerleme ve Yatırım Uzmanlığı", "Mortgage Brokerliği", "Müteahhitlik",
      "İş Analizi ve İş Takibi", "Emlak Komisyonculuğu", "Oto Alım–Satım Galericiliği",
      "Betonarme · Kalıp · Çatı", "Tarımsal Danışmanlık", "Konut & Ticari Yönetim"];
    var xi = 0; et.style.transition = "opacity .3s";
    setInterval(function () {
      xi = (xi + 1) % EX.length; et.style.opacity = 0;
      setTimeout(function () { et.textContent = EX[xi]; et.style.opacity = 1; }, 300);
    }, 3600);
  }

  /* ---------- referans slider (otomatik + sürükle durdur) ---------- */
  var sl = $("#tslider");
  if (sl) {
    var auto;
    function start() {
      auto = setInterval(function () {
        if (sl.scrollLeft + sl.clientWidth >= sl.scrollWidth - 8) sl.scrollTo({ left: 0, behavior: "smooth" });
        else sl.scrollBy({ left: sl.clientWidth * .92, behavior: "smooth" });
      }, 5200);
    }
    sl.addEventListener("pointerdown", function () { clearInterval(auto); });
    sl.addEventListener("mouseenter", function () { clearInterval(auto); });
    sl.addEventListener("mouseleave", start);
    start();
  }

  /* ---------- SSS ---------- */
  $$(".fq .q").forEach(function (q) {
    q.addEventListener("click", function () {
      var it = q.parentElement, a = $(".a", it), was = it.classList.contains("open");
      $$(".fq").forEach(function (o) { o.classList.remove("open"); $(".a", o).style.maxHeight = 0; });
      if (!was) { it.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* ---------- genel modallar (görsel + blog) ---------- */
  function openModal(el) { if (!el) return; el.style.display = "block"; document.body.classList.add("lock"); }
  function closeModal(el) { if (!el) return; el.style.display = "none"; document.body.classList.remove("lock"); }
  window.OD._openModal = openModal;
  window.OD.openImg = function (src, alt) {
    var m = $("#mImg"); if (!m) return;
    var img = $("#mImgSrc"); img.src = src; if (alt) img.alt = alt; openModal(m);
  };
  $$("[data-close]").forEach(function (x) { x.addEventListener("click", function () { closeModal(x.closest(".modal")); }); });
  $$(".modal").forEach(function (m) { m.addEventListener("click", function (e) { if (e.target === m) closeModal(m); }); });
  addEventListener("keydown", function (e) { if (e.key === "Escape") $$(".modal").forEach(closeModal); });

  /* ---------- blog ---------- */
  var ART = {
    trendler: { d: "Eylül 2026 · Piyasa", t: "2026 Emlak Piyasası Trendleri: Ordu ve Çevresinde Yol Haritası", p: ["2026 yılı, gayrimenkul piyasasında hem küresel ölçekte hem de Ordu ve çevresinde belirleyici değişimlerin yaşandığı bir dönem. Makro tarafta enflasyon, faiz politikaları ve konut arz-talep dengesi; mikro tarafta ulaşım yatırımları, kentsel dönüşüm projeleri ve yerel demografi yatırım kararlarını doğrudan etkiliyor.", "Kredi maliyetlerine ilişkin belirsizlik sürerken yatırımcılar nakit akışını öngörülebilir kılacak hibrit stratejilere yöneliyor: arsa + çelik konstrüksiyon birleşik yatırımlar ya da konut + alt kat ticari kombinasyonları hem kira getirisi hem sermaye kazancı potansiyeli sunabiliyor.", "Kentsel dönüşüm ve deprem güvenliği, sigorta ve finansmana erişim avantajı da getiriyor. Drone videosu, sanal tur ve hedefli sosyal medya kampanyaları pazara çıkış hızını artırıyor.", "Sonuç olarak başarılı strateji; mikro lokasyon analizi, finansman senaryosu stresi, enerji verimliliği, dijital görünürlük ve eksiksiz hukuki-teknik kontrol üzerine kurulmalı."], ul: ["Mahalle bazlı fiyat haritası çıkarın", "Enerji kimlik belgesi yüksek mülkleri öne çıkarın", "Kentsel dönüşüm kapsamını tapu kontrolüyle doğrulayın"] },
    danisman: { d: "Ağustos 2026 · Rehber", t: "Doğru Emlak Danışmanı Nasıl Seçilir? 7 Somut Kriter", p: ["Gayrimenkul alım-satımı finansal yaşamınızın en kritik kararlarından biri. İlk kriter yerel uzmanlık; ikinci kriter şeffaf iletişim; üçüncü pazarlama gücü.", "Dördüncü müzakere yetkinliği, beşinci referans ve itibar yönetimi; altıncı hukuki-teknik farkındalık, yedinci süreç yönetimidir."], ul: ["Mahalle bazlı m² fiyatlarını sorun", "Önceki satış sürelerini ve referansları isteyin", "Tapu/takyidat/DASK süreçlerine hakimiyetini test edin"] },
    deger: { d: "Temmuz 2026 · İpuçları", t: "Ev Satarken Değeri Zıplatmanın Yolları", p: ["Evi piyasa ile buluştururken ilk izlenim çoğu zaman nihai fiyattan hızlı belirleyici olur. Dış cephe ve peyzajla başlayan yolculuk, giriş holündeki aydınlık ve derli toplu atmosferle sürer.", "Küçük bütçeli dokunuşlar büyük sonuç doğurur. Pazarlama tarafında yüksek çözünürlüklü fotoğraflar, 3D sanal tur ve drone görüntüleri tıklanmayı artırır."], ul: ["Kulpları, armatürleri ve aydınlatmayı modernleştirin", "Derz/silikon yenileyin, profesyonel temizlik yaptırın", "Gün ışığını ön plana çıkaran fotoğraf çekimi planlayın"] }
  };
  $$(".post").forEach(function (p) {
    p.addEventListener("click", function () {
      var a = ART[p.dataset.a]; if (!a) return;
      var box = $("#mBlogBox"); if (!box) return;
      box.innerHTML = '<div class="date" style="font-size:.78rem;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">' + a.d + '</div>'
        + "<h3>" + a.t + "</h3>" + a.p.map(function (x) { return "<p>" + x + "</p>"; }).join("")
        + (a.ul ? "<ul>" + a.ul.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>" : "");
      openModal($("#mBlog"));
    });
  });

  /* ---------- sertifikalar ---------- */
  $$(".cert").forEach(function (c) {
    c.addEventListener("click", function () { OD.openImg(c.querySelector("img").src, c.getAttribute("aria-label") || "Sertifika"); });
  });
})();
