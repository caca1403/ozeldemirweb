/* ============================================================
   admin.js — Yönetim Paneli (yonetim.html)
   Depo: localStorage odList+ (eklenen), odList- (silinen repo id),
   odList~ (repo düzenleme patch'leri). Sitenin ana listesi bu
   katmanı assets/data/listings.js içinde birleştirir.
   ============================================================ */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var PIN = "ord2026"; /* kısa panel kilidi — tarayıcı tarafı, demo amaçlı */

  var adds = [], dels = [], eds = {};
  try {
    adds = JSON.parse(localStorage.getItem("odList+") || "[]");
    dels = JSON.parse(localStorage.getItem("odList-") || "[]");
    eds  = JSON.parse(localStorage.getItem("odList~") || "{}");
  } catch (e) {}

  function persist() {
    try {
      localStorage.setItem("odList+", JSON.stringify(adds));
      localStorage.setItem("odList-", JSON.stringify(dels));
      localStorage.setItem("odList~", JSON.stringify(eds));
      return true;
    } catch (e) {
      msg("Kayıt başarısız: tarayıcı depolama alanı doldu. Görselleri küçültün veya URL kullanın.", true);
      return false;
    }
  }

  function msg(t, err) {
    var el = $("aMsg");
    el.textContent = t;
    el.className = "fmsg " + (err ? "err" : "ok");
    if (!err) setTimeout(function () { el.textContent = ""; }, 4000);
  }

  /* ---------- PIN gate ---------- */
  if (sessionStorage.getItem("odAdmin") === "1") {
    $("gate").style.display = "none";
    $("app").style.display = "";
  } else {
    $("pinBtn").addEventListener("click", function () {
      if ($("pin").value === PIN) {
        sessionStorage.setItem("odAdmin", "1");
        $("gate").style.display = "none";
        $("app").style.display = "";
        render();
      } else msg("Şifre hatalı.", true);
    });
    $("pin").addEventListener("keydown", function (e) {
      if (e.key === "Enter") $("pinBtn").click();
    });
  }

  /* ---------- görsel sıkıştırma (max 1000px, jpeg) ---------- */
  var pendingImgs = [];
  $("aImgFile").addEventListener("change", function () {
    var files = Array.prototype.slice.call(this.files, 0, 4);
    pendingImgs = [];
    $("thumbs").innerHTML = "";
    files.forEach(function (f) {
      var rd = new FileReader();
      rd.onload = function () {
        var im = new Image();
        im.onload = function () {
          var s = Math.min(1, 1000 / im.width),
              c = document.createElement("canvas");
          c.width = Math.round(im.width * s);
          c.height = Math.round(im.height * s);
          c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
          pendingImgs.push(c.toDataURL("image/jpeg", 0.78));
          drawThumbs();
        };
        im.src = rd.result;
      };
      rd.readAsDataURL(f);
    });
  });
  function drawThumbs() {
    $("thumbs").innerHTML = pendingImgs
      .map(function (s, i) { return '<img src="' + s + '" alt="görsel ' + (i + 1) + '">'; })
      .join("");
  }

  /* ---------- tablo ---------- */
  var fmt = function (n) { return (+n).toLocaleString("tr-TR"); };
  function activeList() {
    return window.OD_DATA.listings.map(function (l) {
      var st = l.id.indexOf("OZ-") === 0 ? "YEREL" : dels.indexOf(l.id) > -1 ? "—" : eds[l.id] ? "REPO*" : "REPO";
      return { l: l, src: st };
    });
  }
  function render() {
    var rows = activeList();
    $("cnt").textContent = "(" + rows.length + ")";
    $("tbody").innerHTML = rows.map(function (r) {
      var l = r.l, local = l.id.indexOf("OZ-") === 0;
      return "<tr><td><b>" + l.title + "</b><br><span class='hint'>" + l.id + " · " + l.district + "</span></td>" +
        "<td>" + l.status + "</td><td>₺" + fmt(l.price) + "</td>" +
        "<td><span class='src " + (local ? "yerel" : "repo") + "'>" + r.src + "</span></td>" +
        "<td style='text-align:right;white-space:nowrap'>" +
        "<button class='rowbtn' data-edit='" + l.id + "' title='Düzenle'><i class='fas fa-pen'></i></button> " +
        "<button class='rowbtn del' data-del='" + l.id + "' title='Sil'><i class='fas fa-trash'></i></button></td></tr>";
    }).join("");
    exportJson();
  }

  /* ---------- export ---------- */
  function exportJson() {
    var out = { eklenenler: adds, duzenlenenler: eds, silinenler: dels };
    var txt = adds.length || Object.keys(eds).length || dels.length
      ? JSON.stringify(out, null, 2)
      : "// Henüz yerel değişiklik yok.";
    $("exportBox").textContent = txt;
  }
  $("copyBtn").addEventListener("click", function () {
    navigator.clipboard.writeText($("exportBox").textContent).then(function () {
      msg("JSON panoya kopyalandı — assets/data/listings.js dosyasına taşıyın.");
    });
  });

  /* ---------- form: kaydet / düzenle / sil ---------- */
  var editId = null;
  var F = ["aTitle", "aStatus", "aType", "aDist", "aPrice", "aM2", "aRooms", "aFloor", "aAge", "aHeat", "aFeats", "aDesc", "aImgUrl"];
  function readForm() {
    return {
      title: $("aTitle").value.trim(), status: $("aStatus").value, type: $("aType").value,
      district: $("aDist").value.trim(), price: +$("aPrice").value || 0, m2: +$("aM2").value || 0,
      rooms: $("aRooms").value.trim() || "—", floor: $("aFloor").value.trim() || "—", age: +$("aAge").value || 0,
      heating: $("aHeat").value.trim() || "—",
      feats: $("aFeats").value.split(",").map(function (s) { return s.trim(); }).filter(Boolean),
      desc: $("aDesc").value.trim()
    };
  }
  function fillForm(l) {
    $("aTitle").value = l.title; $("aStatus").value = l.status; $("aType").value = l.type;
    $("aDist").value = l.district; $("aPrice").value = l.price; $("aM2").value = l.m2 || "";
    $("aRooms").value = l.rooms || ""; $("aFloor").value = l.floor || ""; $("aAge").value = l.age || 0;
    $("aHeat").value = l.heating || ""; $("aFeats").value = (l.feats || []).join(", ");
    $("aDesc").value = l.desc || ""; $("aImgUrl").value = /^https?:/.test(l.images[0] || "") ? l.images[0] : "";
    pendingImgs = (l.images || []).filter(function (s) { return s.indexOf("data:") === 0; });
    drawThumbs();
  }
  function clearForm() {
    F.forEach(function (id) { $(id).value = ""; });
    $("aAge").value = 0; pendingImgs = []; drawThumbs();
    editId = null;
    $("formTitle").textContent = "Yeni İlan";
    $("saveBtn").innerHTML = "<i class='fas fa-floppy-disk'></i> İlanı Kaydet";
    $("cancelEdit").style.display = "none";
  }
  $("cancelEdit").addEventListener("click", clearForm);

  $("lForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var d = readForm();
    if (!d.title || !d.district || !d.price || !d.m2) { msg("Başlık, ilçe, fiyat ve m² zorunlu.", true); return; }
    var imgs = pendingImgs.slice();
    var url = $("aImgUrl").value.trim();
    if (url) imgs.unshift(url);
    if (!imgs.length) imgs.push("assets/img/properties/altinordu-daire.jpg");
    d.images = imgs;

    if (editId && editId.indexOf("OZ-") === 0) {
      var i = adds.findIndex(function (x) { return x.id === editId; });
      if (i > -1) adds[i] = Object.assign(adds[i], d);
    } else if (editId) {
      eds[editId] = d;
    } else {
      d.id = "OZ-" + Date.now().toString(36).toUpperCase();
      adds.push(d);
    }
    if (persist()) { msg("Kaydedildi: " + d.title); clearForm(); render(); }
  });

  $("tbody").addEventListener("click", function (e) {
    var eb = e.target.closest("[data-edit]"), db = e.target.closest("[data-del]");
    if (eb) {
      var id = eb.getAttribute("data-edit"),
          l = window.OD_DATA.listings.find(function (x) { return x.id === id; });
      if (!l) return;
      editId = id;
      fillForm(l);
      $("formTitle").textContent = "Düzenliyor: " + id;
      $("saveBtn").innerHTML = "<i class='fas fa-floppy-disk'></i> Güncelle";
      $("cancelEdit").style.display = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (db) {
      var did = db.getAttribute("data-del");
      if (!confirm("İlan silinsin mi? (Yerel değişiklik — export almayı unutmayın)")) return;
      if (did.indexOf("OZ-") === 0) adds = adds.filter(function (x) { return x.id !== did; });
      else { dels.push(did); delete eds[did]; }
      persist(); render();
    }
  });

  $("resetAll").addEventListener("click", function () {
    if (!confirm("Bu tarayıcıdaki tüm yerel ilan değişiklikleri silinsin mi?")) return;
    adds = []; dels = []; eds = {};
    localStorage.removeItem("odList+");
    localStorage.removeItem("odList-");
    localStorage.removeItem("odList~");
    clearForm(); render();
    msg("Yerel değişiklikler sıfırlandı.");
  });

  /* ---------- GitHub yayın (Contents API) — ilanı repoya yazar, herkese görünür olur ---------- */
  ["gRepo", "gBranch", "gTok"].forEach(function (id) {
    var v = localStorage.getItem("odGit" + id);
    if (v) $(id).value = v;
    $(id).addEventListener("change", function () { localStorage.setItem("odGit" + id, this.value); });
  });

  function gh(method, apiPath, body) {
    var repo = $("gRepo").value.trim();
    return fetch("https://api.github.com/repos/" + repo + "/" + apiPath, {
      method: method,
      headers: { Authorization: "Bearer " + $("gTok").value.trim(), Accept: "application/vnd.github+json" },
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(r.status === 401 ? "Token geçersiz/süresi dolmuş (401)."
          : r.status === 403 ? "Token'ın bu repoya yazma izni yok (403): Contents: Read and write verin."
          : (j.message || r.status));
        return j;
      });
    });
  }
  var b64 = function (txt) { return btoa(unescape(encodeURIComponent(txt))); };

  function publishFile(path, contentB64, message) {
    return gh("GET", "contents/" + encodeURIComponent(path).replace(/%2F/g, "/") + "?ref=" + encodeURIComponent($("gBranch").value.trim()))
      .then(function (cur) { return cur.sha; })
      .catch(function () { return null; }) /* yeni dosya */
      .then(function (sha) {
        var body = { message: message, content: contentB64, branch: $("gBranch").value.trim() };
        if (sha) body.sha = sha;
        return gh("PUT", "contents/" + encodeURIComponent(path).replace(/%2F/g, "/"), body);
      });
  }

  $("pubBtn").addEventListener("click", function () {
    if (!$("gTok").value.trim()) { pubMsg("Önce GitHub token'ınızı girin.", true); return; }
    if (!adds.length && !Object.keys(eds).length && !dels.length) { pubMsg("Yayınlanacak yerel değişiklik yok.", true); return; }
    var btn = this;
    btn.disabled = true; pubMsg("Yayınlanıyor…", false);

    /* 1) görselleri ayrı dosya olarak yükle, ilan verisinde yol kullan */
    var uploads = [];
    var pub = window.OD_DATA.listings.map(function (l) {
      var o = JSON.parse(JSON.stringify(l));
      o.images = (l.images || []).map(function (s, i) {
        if (s.indexOf("data:") === 0) {
          var p = "assets/img/properties/" + l.id + "-" + (i + 1) + ".jpg";
          uploads.push(publishFile(p, s.split(",")[1], "ilan görseli: " + l.id));
          return p;
        }
        return s;
      });
      return o;
    });

    /* 2) listings.js dosyasını baştan üret (overlay bloğu korunur) */
    var d = window.OD_DATA;
    var txt = "/* data/listings.js — Yönetim Paneli tarafından yayınlandı: " + new Date().toISOString() + " */\n"
      + "window.OD_DATA = {\n  brand: " + JSON.stringify(d.brand) + ",\n  pricePerM2: " + JSON.stringify(d.pricePerM2) + ",\n  listings: [\n"
      + pub.map(function (o) { return "    " + JSON.stringify(o); }).join(",\n")
      + "\n  ]\n};\n\n"
      + "(function(){try{var a=JSON.parse(localStorage.getItem('odList+')||'[]),r=JSON.parse(localStorage.getItem('odList-')||'[]'),e=JSON.parse(localStorage.getItem('odList~')||'{}');window.OD_DATA.base=window.OD_DATA.listings.slice();window.OD_DATA.listings=window.OD_DATA.listings.filter(function(x){return r.indexOf(x.id)<0;}).map(function(x){return e[x.id]?Object.assign({},x,e[x.id]):x;}).concat(a);}catch(err){}})();\n";

    Promise.all(uploads)
      .then(function () { return publishFile("assets/data/listings.js", b64(txt), "ilan yayınlandı (yönetim paneli)"); })
      .then(function () {
        adds = []; dels = []; eds = {};
        localStorage.removeItem("odList+"); localStorage.removeItem("odList-"); localStorage.removeItem("odList~");
        window.OD_DATA.listings = window.OD_DATA.base.slice();
        clearForm(); render();
        pubMsg("Yayınlandı ✓ GitHub Pages 1-2 dk içinde herkese gösterecek.", false);
      })
      .catch(function (e) { pubMsg("Yayın hatası: " + e.message, true); })
      .finally(function () { btn.disabled = false; });
  });

  function pubMsg(t, err) {
    var el = $("pubMsg");
    el.textContent = t;
    el.className = "fmsg " + (err ? "err" : "ok");
  }

  if (sessionStorage.getItem("odAdmin") === "1") render();
})();
