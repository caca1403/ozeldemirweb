/* Ilce sayfasi: canli m2, yillik istatistik kartlari, mahalle kirilimi, egri, ilanlar */
(function () {
  'use strict';
  var AD = document.body.dataset.ilce;
  var $ = function (s) { return document.querySelector(s); };
  var tl = function (n) { return (Number(n) || 0).toLocaleString('tr-TR'); };
  var AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  var trTarih = function (iso) { var t = new Date(iso + 'T00:00:00'); return t.getDate() + ' ' + AY[t.getMonth()] + ' ' + t.getFullYear(); };
  var esc = function (s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; };
  var rozet = function (r) {
    if (r == null) return '';
    var yuzde = Math.round(Math.abs(r) * (Math.abs(r) <= 3 ? 100 : 1) * 10) / 10;
    var yon = r >= 0 ? 'up' : 'down';
    return '<span class="delta ' + yon + '">' + (r >= 0 ? '↑' : '↓') + ' %' + yuzde + '</span>';
  };

  fetch('assets/piyasa.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (!d || !d.ppm2 || !d.ppm2[AD]) return;
    var v = d.ppm2[AD], tarih = trTarih(d.guncellendi);
    $('#ilceNo').textContent = tl(v);
    $('#ilcePpm').textContent = AD + 'ta satılık daire ilanlarında ortalama metrekare fiyatı: ' + tl(v) + ' TL/m². Son ölçüm: ' + tarih + '.';

    var fFiyat = $('#fFiyat'); if (fFiyat) fFiyat.textContent = tl(v) + ' TL';
    var ek = (d.ek || {})[AD] || {};
    var set = function (id, metin) { var el = document.getElementById(id); if (el && metin) el.textContent = metin; };
    set('fAmort', ek.amortisman != null ? ek.amortisman + ' yıl' : '—');
    set('fYas', ek.yasi != null ? ek.yasi + ' yıl' : '—');
    set('fIl', d.ppm2['Diğer'] ? tl(d.ppm2['Diğer']) + ' TL' : '—');

    /* son 1 yil istatistik kartlari */
    if (ek.istat && ek.istat.length) {
      document.getElementById('istatSec').hidden = false;
      $('#istatGrid').innerHTML = ek.istat.map(function (k) {
        var deger;
        if (k.t === 'unitPrice') deger = tl(k.a) + ' TL';
        else if (k.t === 'ratio') deger = '%' + k.a;
        else deger = k.a + (k.l.toLowerCase().indexOf('kira') > -1 ? ' TL' : ' yıl');
        return '<div class="fact big"><b>' + deger + '</b>' + rozet(k.r) + '<span>' + esc(k.l) + '</span></div>';
      }).join('');
      var yillik = ek.istat.filter(function (k) { return k.t === 'unitPrice' && k.r != null; })[0];
      if (yillik) $('#istatNot').textContent = 'Kartlardaki ↑/↓ rozetleri, ilgili değerin son bir yıldaki değişimidir. Kaynak: Emlakjet ilan verileri, ' + tarih + '.';
    }

    /* karsilastirma cubuklari */
    var k1 = ['Fatsa', 'Altınordu', 'Ünye', 'Perşembe', 'Gülyalı', 'Korgan'].filter(function (k) { return d.ppm2[k]; });
    var max = Math.max.apply(null, k1.map(function (k) { return d.ppm2[k]; }));
    $('#ilceBars').innerHTML = k1.map(function (k) {
      var r = ((d.ek || {})[k] || {}).istat;
      var yr = r ? r.filter(function (x) { return x.t === 'unitPrice'; })[0] : null;
      return '<div class="mrow' + (k === AD ? ' hl' : '') + '"><span class="mname">' + k + '</span><span class="mbar"><i style="--w:' + ((d.ppm2[k] / max) * 100).toFixed(1) + '%"></i></span><b>' + tl(d.ppm2[k]) + ' TL' + (yr ? ' <small class="mini-delta' + (yr.r < 0 ? ' neg' : '') + '">' + (yr.r >= 0 ? '↑' : '↓') + Math.round(Math.abs(yr.r) * 100) + '</small>' : '') + '</b></div>';
    }).join('');

    /* mahalle kirilimi */
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
        : 'Ölçümler yarın sabah başlıyor — her sabah 06:00\u0027da otomatik.';
      return;
    }
    var degerler = p.map(function (e) { return e[AD]; });
    var mn = Math.min.apply(null, degerler), mx = Math.max.apply(null, degerler), ac = Math.max(1, mx - mn);
    var pts = degerler.map(function (y, i) {
      var x = 8 + (i / (degerler.length - 1)) * 604;
      return x.toFixed(1) + ',' + (140 - ((y - mn) / ac) * 128).toFixed(1);
    });
    $('#curveLine').setAttribute('points', pts.join(' '));
    var fill = document.getElementById('curveFill');
    if (fill) fill.setAttribute('points', '8,150 ' + pts.join(' ') + ' 612,150');
    var dv = Math.round((degerler[degerler.length - 1] / degerler[0] - 1) * 1000) / 10;
    note.textContent = p.length + ' ölçüm · ' + trTarih(p[0].t) + ' → ' + trTarih(p[p.length - 1].t) +
      ' · en düşük ' + tl(mn) + ' · en yüksek ' + tl(mx) + ' · ilkine göre %' + (dv > 0 ? '+' : '') + dv;
  }).catch(function () {});

  var tum = (window.OD_LISTINGS || []).filter(function (l) { return l.district === AD; });
  function kart(l) {
    var st = l.status === 'satildi' ? 'satildi' : (l.status === 'kiralik' ? 'kiralik' : 'satilik');
    var etiket = st === 'kiralik' ? 'Kiralık' : st === 'satildi' ? 'Satıldı' : 'Satılık';
    var fiyat = st === 'satildi' ? esc(l.outcome || 'Satıldı') : tl(l.price) + ' TL' + (st === 'kiralik' ? '<small>/ ay</small>' : '');
    var meta = [l.district, l.m2 != null ? l.m2 + ' m²' : '', l.rooms && l.rooms !== '—' ? l.rooms : '']
      .filter(Boolean).map(esc).join(' · ');
    return '<article class="card" data-status="' + st + '">' +
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
})();
