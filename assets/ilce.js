/* Ilce sayfasi: canli m2, yillik istatistik kartlari, mahalle kirilimi, egri, ilanlar, kaydirma efektleri */
(function () {
  'use strict';
  var AD = document.body.dataset.ilce;
  var $ = function (s) { return document.querySelector(s); };
  var tl = function (n) { return (Number(n) || 0).toLocaleString('tr-TR'); };
  var AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  var trTarih = function (iso) { var t = new Date(iso + 'T00:00:00'); return t.getDate() + ' ' + AY[t.getMonth()] + ' ' + t.getFullYear(); };
  var esc = function (s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; };

  /* gorunur alana girince acilma (reveal + cubuklar) */
  var io = new IntersectionObserver(function (g) {
    g.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal, .market, .curve').forEach(function (el) { io.observe(el); });

  function sayac(el, hedef, sonek) {
    var t0 = null;
    function adim(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 900);
      p = 1 - Math.pow(1 - p, 3);
      el.textContent = tl(Math.round(hedef * p)) + (sonek || '');
      if (p < 1) requestAnimationFrame(adim);
    }
    requestAnimationFrame(adim);
  }

  fetch('assets/piyasa.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (!d || !d.ppm2 || !d.ppm2[AD]) return;
    var v = d.ppm2[AD], tarih = trTarih(d.guncellendi);
    sayac($('#ilceNo'), v, '');
    $('#ilcePpm').textContent = AD + 'ta satılık daire ilanlarında ortalama metrekare fiyatı: ' + tl(v) + ' TL/m². Son ölçüm: ' + tarih + '.';

    var ek = (d.ek || {})[AD] || {};
    var yillikKart = (ek.istat || []).filter(function (k) { return k.t === 'unitPrice' && k.r != null; })[0];
    var ff = $('#fFiyat');
    if (ff) sayac(ff, v, ' TL');
    var set = function (id, metin) { var el = document.getElementById(id); if (el && metin) el.textContent = metin; };
    set('fAmort', ek.amortisman != null ? ek.amortisman + ' yıl' : '—');
    set('fYas', ek.yasi != null ? ek.yasi + ' yıl' : '—');
    set('fIl', d.ppm2['Diğer'] ? tl(d.ppm2['Diğer']) + ' TL' : '—');

    var fq = $('#faqPpm');
    if (fq) fq.textContent = 'Son ölçümümüze göre ' + tl(v) + ' TL/m² (' + tarih + ').' +
      (yillikKart ? ' Emlakjet verilerine göre son bir yılda metrekare fiyatı %' + Math.round(Math.abs(yillikKart.r) * 100) + (yillikKart.r >= 0 ? ' arttı' : ' azaldı') + '.' : '');

    if (ek.istat && ek.istat.length) {
      document.getElementById('istatSec').hidden = false;
      $('#istatGrid').innerHTML = ek.istat.map(function (k) {
        var deger;
        if (k.t === 'unitPrice') deger = tl(k.a) + ' TL';
        else if (k.t === 'ratio') deger = '%' + k.a;
        else deger = k.a + (k.l.toLowerCase().indexOf('kira') > -1 ? ' TL' : ' yıl');
        var rozet = k.r == null ? '' : '<span class="delta ' + (k.r >= 0 ? 'up' : 'down') + '">' + (k.r >= 0 ? '↑' : '↓') + ' %' + (Math.round(Math.abs(k.r) * (Math.abs(k.r) <= 3 ? 1000 : 10)) / 10) + '</span>';
        return '<div class="fact big reveal"><b>' + deger + '</b>' + rozet + '<span>' + esc(k.l) + '</span></div>';
      }).join('');
      document.querySelectorAll('#istatGrid .reveal').forEach(function (el) { io.observe(el); });
      if (yillikKart) $('#istatNot').textContent = 'Kartlardaki ↑/↓ rozetleri, ilgili değerin son bir yıldaki değişimidir. Kaynak: Emlakjet ilan verileri, ' + tarih + '.';
    }

    var k1 = ['Fatsa', 'Altınordu', 'Ünye', 'Perşembe', 'Gülyalı', 'Korgan'].filter(function (k) { return d.ppm2[k]; });
    var max = Math.max.apply(null, k1.map(function (k) { return d.ppm2[k]; }));
    $('#ilceBars').innerHTML = k1.map(function (k) {
      var r = ((d.ek || {})[k] || {}).istat;
      var yr = r ? r.filter(function (x) { return x.t === 'unitPrice'; })[0] : null;
      return '<div class="mrow' + (k === AD ? ' hl' : '') + '"><span class="mname">' + k + '</span><span class="mbar"><i style="--w:' + ((d.ppm2[k] / max) * 100).toFixed(1) + '%"></i></span><b>' + tl(d.ppm2[k]) + ' TL' + (yr ? ' <small class="mini-delta' + (yr.r < 0 ? ' neg' : '') + '">' + (yr.r >= 0 ? '↑' : '↓') + Math.round(Math.abs(yr.r) * 100) + '</small>' : '') + '</b></div>';
    }).join('');

    var mah = (d.mahalle || {})[AD];
    if (mah && mah.length > 1) {
      document.getElementById('mahSec').hidden = false;
      var mmax = mah[0].m2;
      $('#mahBars').innerHTML = mah.map(function (m) {
        return '<div class="mrow"><span class="mname">' + esc(m.ad) + '</span><span class="mbar"><i style="--w:' + ((m.m2 / mmax) * 100).toFixed(1) + '%"></i></span><b>' + tl(m.m2) + ' TL' + (m.yillik != null ? ' <small class="mini-delta' + (m.yillik < 0 ? ' neg' : '') + '">' + (m.yillik >= 0 ? '↑' : '↓') + Math.abs(m.yillik) + '</small>' : '') + '</b></div>';
      }).join('');
      var orn = mah[0];
      $('#mahNot').textContent = mah.length + ' mahallede yayına hazır ilan var.' +
        (orn.ort ? ' Ortalama konut fiyatı ' + orn.ad + ': ' + tl(orn.ort) + ' TL.' : '') +
        (orn.ucuz ? ' Bu mahallede ilan aralığı ' + tl(orn.ucuz) + ' – ' + tl(orn.pahali) + ' TL.' : '');
      io.observe(document.getElementById('mahBars'));
    }
  }).catch(function () {});

  fetch('assets/piyasa-history.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (h) {
    h = Array.isArray(h) ? h : [];
    var p = h.filter(function (e) { return e[AD]; });
    var svg = document.querySelector('#curve svg');
    var note = $('#curveNote');
    if (p.length < 3) {
      svg.style.display = 'none';
      var son = p[p.length - 1];
      note.textContent = son
        ? 'Bugünkü ölçüm: ' + tl(son[AD]) + ' TL/m² (' + trTarih(son.t) + ') — her sabah yenilenir. Çizgi 3. ölçümden sonra belirir; her geçen gün 12 aya bir adım daha yaklaşır.'
        : 'Ölçümler her sabah 06:00\'da otomatik yapılır.';
      return;
    }
    var t0 = Date.parse(p[0].t), tN = Math.max(1, Date.parse(p[p.length - 1].t) - t0);
    var degerler = p.map(function (e) { return e[AD]; });
    var mn = Math.min.apply(null, degerler), mx = Math.max.apply(null, degerler), ac = Math.max(1, mx - mn);
    var pts = p.map(function (e, i) {
      var x = 8 + ((Date.parse(e.t) - t0) / tN) * 604;
      return x.toFixed(1) + ',' + (140 - ((degerler[i] - mn) / ac) * 128).toFixed(1);
    });
    $('#curveLine').setAttribute('points', pts.join(' '));
    var fill = document.getElementById('curveFill');
    if (fill) fill.setAttribute('points', '8,150 ' + pts.join(' ') + ' 612,150');
    var arsiv = p.filter(function (e) { return e.arsiv; }).length; var uretilme = p.some(function (e) { return e.uretilme; });
    note.textContent = p.length + ' ölçüm noktası · ' + trTarih(p[0].t) + ' → ' + trTarih(p[p.length - 1].t) +
      ' · en düşük ' + tl(mn) + ' · en yüksek ' + tl(mx) +
      (arsiv ? ' · takvim noktaları Emlakjet sayfa arşivinden' : (uretilme ? ' · ilk nokta Emlakjet\'in yıllık değişim oranından hesaplandı' : ''));
  }).catch(function () {});

  var tum = (window.OD_LISTINGS || []).filter(function (l) { return l.district === AD; });
  function kart(l) {
    var st = l.status === 'satildi' ? 'satildi' : (l.status === 'kiralik' ? 'kiralik' : 'satilik');
    var etiket = st === 'kiralik' ? 'Kiralık' : st === 'satildi' ? 'Satıldı' : 'Satılık';
    var fiyat = st === 'satildi' ? esc(l.outcome || 'Satıldı') : tl(l.price) + ' TL' + (st === 'kiralik' ? '<small>/ ay</small>' : '');
    var meta = [l.district, l.m2 != null ? l.m2 + ' m²' : '', l.rooms && l.rooms !== '—' ? l.rooms : '']
      .filter(Boolean).map(esc).join(' · ');
    return '<article class="card reveal" data-status="' + st + '">' +
      '<div class="ph"><img src="' + esc(l.img) + '" alt="' + esc(l.alt) + '" loading="lazy" width="1200" height="800">' +
      '<span class="tag ' + st + '">' + etiket + '</span></div>' +
      '<div class="body"><h3>' + esc(l.title) + '</h3><span class="meta">' + meta + '</span>' +
      '<span class="price">' + fiyat + '</span></div></article>';
  }
  var L = tum.filter(function (l) { return l.status !== 'satildi'; });
  var S = tum.filter(function (l) { return l.status === 'satildi'; });
  $('#ilceSayi').textContent = L.length
    ? L.length + ' aktif ilan. Fiyatları yukarıdaki ilçe ortalamasıyla kıyaslamayı bırak, birlikte bakalım.'
    : 'Şu an portföyde boşta ilan yok — WhatsApp\'tan yaz, sana özel bakalım.';
  $('#ilceGrid').innerHTML = L.length
    ? L.slice(0, 6).map(kart).join('')
    : '<p class="note">Portföyümüzde şu an ' + esc(AD) + ' ilanı yok; aşağıdaki satış örnekleri ve ilçe verileri duruyor. Benzer fırsatlar için WhatsApp\'tan yazın.</p>';
  if (S.length) {
    document.getElementById('soldSec').hidden = false;
    $('#ilceSold').innerHTML = S.slice(0, 6).map(kart).join('');
  }
  document.querySelectorAll('.card.reveal').forEach(function (el) { io.observe(el); });
})();
