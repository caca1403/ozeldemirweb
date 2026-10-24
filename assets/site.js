/* Özel Demir, sinematik site. Bagimlilik yok. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smoothstep = (p, e0, e1) => {
    const t = clamp((p - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  /* efektler her cihazda zorla acik (sahip istegi); hareket kisitliligi dinlenmiyor */
  const reduced = () => false;

  /* ilanlar: assets/listings.js tek kaynak, yonetim paneli localStorage taslagi */
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ozeldemir.listings.v1') || 'null');
      if (Array.isArray(saved)) return saved;
    } catch (e) { /* bozuk taslak: dosyadaki ilanlara don */ }
    return window.OD_LISTINGS || [];
  })();
  const grid = $('#listingGrid');
  const STATUS = { satilik: 'Satılık', kiralik: 'Kiralık', satildi: 'Satıldı' };
  const tl = (n) => (Number(n) || 0).toLocaleString('tr-TR');

  if (grid && L.length) {
    grid.innerHTML = L.map((l, i) => {
      const st = STATUS[l.status] ? l.status : 'satilik';
      const price = st === 'satildi'
        ? esc(l.outcome || 'Satıldı')
        : tl(l.price) + ' TL' + (st === 'kiralik' ? '<small>/ ay</small>' : '');
      const meta = [l.district, l.m2 != null ? l.m2 + ' m²' : '', l.rooms && l.rooms !== '—' ? l.rooms : l.type === 'arsa' ? 'arsa' : '']
        .filter(Boolean).map(esc).join(' · ');
      const delay = i % 3 ? ' d' + (i % 3) : '';
      return '<article class="card reveal' + delay + '" data-status="' + st + '" data-id="' + esc(l.id) + '">' +
        '<div class="ph"><img src="' + esc(l.img) + '" alt="' + esc(l.alt) + '" loading="lazy" width="1200" height="800">' +
        '<span class="tag ' + st + '">' + STATUS[st] + '</span></div>' +
        '<div class="body"><h3>' + esc(l.title) + '</h3><span class="meta">' + meta + '</span>' +
        '<span class="price">' + price + '</span></div>' +
        '<button class="card-open" type="button" aria-label="' + esc(l.title) + ' ilanını aç"></button></article>';
    }).join('');
  } else if (grid) {
    grid.innerHTML = '<p class="note">Şu an portföyde ilan yok. Yeni ilanlar için WhatsApp\'tan yazın.</p>';
  }

  /* nav */
  const nav = $('.nav');
  const onNav = () => nav.classList.toggle('solid', scrollY > 40);
  addEventListener('scroll', onNav, { passive: true });
  onNav();

  /* gorunume girme */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }
  }, { rootMargin: '0px 0px -12% 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  /* pirinc iplik */
  const thread = $('#threadPath');
  let threadP = -1;
  function drawThread() {
    if (!thread) return;
    const main = $('#main');
    const top = main.offsetTop;
    const p = clamp((scrollY + innerHeight * 0.5 - top) / main.offsetHeight, 0, 1);
    if (Math.abs(p - threadP) < 0.004) return;
    threadP = p;
    thread.style.strokeDashoffset = String(1 - p);
  }
  function pinFinal() {
    $$('.reveal').forEach((el) => el.classList.add('in'));
    if (thread) thread.style.strokeDashoffset = '0';
  }

  /* sayfa ilerlemesi */
  const pbar = $('#pbar');
  function pageProgress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
    if (pbar) pbar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
  }

  /* yatay hizmet seridi */
  const hsec = $('#hizmetler');
  const htrack = $('#hTrack');
  const hbar = $('#hBar');
  let hMax = 0, hLast = -1;

  function hMeasure() {
    if (reduced() || !htrack) return;
    const first = htrack.firstElementChild;
    const last = htrack.lastElementChild;
    if (!first || !last) return;
    const tr = htrack.getBoundingClientRect();
    const fr = first.getBoundingClientRect();
    const lr = last.getBoundingClientRect();
    /* mobilde paneller ortalanir; masaustunde son panel 80px boslukla biter */
    hMax = innerWidth <= 900
      ? Math.max(0, lr.left - fr.left)
      : Math.max(0, lr.right - tr.left - innerWidth + 80);
    hLast = -1;
  }
  function hUpdate() {
    if (reduced() || !hsec || !htrack) return;
    const total = hsec.offsetHeight - innerHeight;
    if (total <= 0) return;
    const p = clamp(-hsec.getBoundingClientRect().top / total, 0, 1);
    if (Math.abs(p - hLast) < 0.002) return;
    hLast = p;
    htrack.style.transform = 'translate3d(' + (-p * hMax).toFixed(1) + 'px,0,0)';
    if (hbar) hbar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
  }
  function hMode() {
    if (reduced()) {
      if (htrack) htrack.style.transform = '';
      if (hbar) hbar.style.transform = '';
      hLast = -1;
    } else {
      hMeasure();
      hUpdate();
    }
  }

  function syncMotion() {
    const off = reduced();
    document.documentElement.classList.toggle('reduced', off);
    if (wordsP) {
      wordsP.classList.toggle('dim', !off);
      if (off) words.forEach((w) => w.classList.add('lit'));
    }
    hMode();
    applyHeroMode();
    if (off) pinFinal();
  }

  /* hafif paralaks */
  const pxEls = $$('[data-parallax]');
  const cta = $('.cta');
  function parallax() {
    for (const el of pxEls) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) continue;
      const t = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.transform = 'translate3d(0,' + (-t * 26).toFixed(1) + 'px,0)';
    }
    if (cta) {
      const r = cta.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        const t = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        cta.style.setProperty('--ctaY', (-t * 34).toFixed(1) + 'px');
      }
    }
  }

  /* hero */
  const hero = $('#hero');
  const stage = $('.stage');
  const video = $('#heroVideo');
  const poster = $('.poster');
  const bands = $$('.band');
  const PORTRAIT = matchMedia('(orientation: portrait) and (max-width: 1024px)').matches;
  const VIDEO_URL = PORTRAIT ? 'assets/hero-scrub-mobile.mp4' : 'assets/hero-scrub.mp4';

  let scrubOn = false;
  let videoReady = false;
  let heroOnScreen = true;
  let started = false;
  let target = 0, shown = 0, rafId = null, lastTick = 0;
  let seekBusy = false, pendingTime = null;
  let loadStart = 0;

  bands.forEach((b) => {
    b.a = parseFloat(b.dataset.start) || 0;
    b.b = parseFloat(b.dataset.end) || 1;
    b.ramp = Math.min(0.025, (b.b - b.a) * 0.35);
    b.op = -1; b.k = -1; b.loadK = 0;
    b.classList.add('on');
  });

  function heroProgress() {
    const range = hero.offsetHeight - innerHeight;
    return range > 0 ? clamp(scrollY / range, 0, 1) : 0;
  }

  function requestSeek(t) {
    if (!video.duration) return;
    if (seekBusy) { pendingTime = t; return; }
    seekBusy = true;
    video.currentTime = t;
  }
  video.addEventListener('seeked', () => {
    seekBusy = false;
    if (pendingTime !== null) {
      const t = pendingTime;
      pendingTime = null;
      requestSeek(t);
    }
  });
  video.addEventListener('error', failVideo);

  function failVideo() {
    stage.classList.add('video-failed');
  }

  function applyBand(b, op, k) {
    if (Math.abs(op - b.op) > 0.004) {
      b.op = op;
      b.style.opacity = op.toFixed(3);
    }
    if (Math.abs(k - b.k) > 0.008) {
      b.k = k;
      b.style.setProperty('--k', k.toFixed(3));
    }
  }

  function updateCaptions(p) {
    for (let i = 0; i < bands.length; i++) {
      const b = bands[i];
      let op, k;
      if (i === 0) {
        op = 1 - smoothstep(p, b.b - b.ramp, b.b);
        k = Math.max(clamp((p - b.a) / b.ramp, 0, 1), b.loadK);
      } else if (i === bands.length - 1) {
        op = smoothstep(p, b.a, b.a + b.ramp);
        k = clamp((p - b.a) / b.ramp, 0, 1);
      } else {
        op = smoothstep(p, b.a, b.a + b.ramp) * (1 - smoothstep(p, b.b - b.ramp, b.b));
        k = clamp((p - b.a) / b.ramp, 0, 1);
      }
      applyBand(b, op, k);
    }
  }

  function tick(now) {
    const dt = Math.min(100, now - (lastTick || now));
    lastTick = now;
    shown += (target - shown) * (1 - Math.pow(1 - 0.16, dt / 16.667));
    if (Math.abs(target - shown) < 0.0005) {
      shown = target;
      rafId = null;
      lastTick = 0;
    } else {
      rafId = requestAnimationFrame(tick);
    }
    if (videoReady) requestSeek(shown * video.duration);
    updateCaptions(shown);
  }

  function onScroll() {
    target = heroProgress();
    hero.classList.toggle('scrolled', scrollY > 60);
    if (rafId === null && heroOnScreen && scrubOn) rafId = requestAnimationFrame(tick);
  }

  function loadRamp(now) {
    if (!loadStart) loadStart = now;
    const t = clamp((now - loadStart) / 1400, 0, 1);
    bands[0].loadK = 1 - Math.pow(1 - t, 3);
    updateCaptions(target);
    if (t < 1) requestAnimationFrame(loadRamp);
  }

  function initHeroOnce() {
    if (started) return;
    started = true;
    if (poster) poster.style.backgroundImage = "url('assets/hero-poster.jpg')";
    fetch(VIDEO_URL)
      .then((r) => { if (!r.ok) throw new Error('video'); return r.blob(); })
      .then((blob) => {
        video.src = URL.createObjectURL(blob);
        video.addEventListener('canplay', () => {
          videoReady = true;
          requestSeek(heroProgress() * video.duration);
          stage.classList.add('video-ready');
        }, { once: true });
        video.load();
      })
      .catch(failVideo);
    requestAnimationFrame(loadRamp);
  }

  function enableScrub() {
    if (scrubOn) return;
    scrubOn = true;
    initHeroOnce();
    addEventListener('scroll', onScroll, { passive: true });
    target = heroProgress();
    shown = target;
    bands.forEach((b) => { b.op = -1; b.k = -1; });
    updateCaptions(target);
    onScroll();
  }

  function disableScrub() {
    if (!scrubOn) return;
    scrubOn = false;
    removeEventListener('scroll', onScroll);
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function applyHeroMode() {
    if (reduced()) disableScrub();
    else enableScrub();
  }

  const heroIO = new IntersectionObserver((entries) => {
    heroOnScreen = entries[0].isIntersecting;
    if (heroOnScreen && scrubOn) onScroll();
  }, { rootMargin: '200px 0px' });
  heroIO.observe(hero);

  if (reduced()) pinFinal();
  applyHeroMode();
  onScroll();

  /* surec: ekranin ortasina en yakin adim aktif */
  const ssteps = $$('.sstep');
  let sLast = -1;
  function sUpdate() {
    if (!ssteps.length) return;
    const mid = innerHeight * 0.5;
    let best = 0, bestD = Infinity;
    ssteps.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best === sLast) return;
    sLast = best;
    ssteps.forEach((el, i) => el.classList.toggle('on', i === best));
  }

  /* piyasa: buyuk rakam sayaci */
  const bigstat = $('.bigstat');
  if (bigstat && !reduced()) {
    const no = $('.bigstat-no', bigstat);
    const target = Number(no.dataset.count) || 0;
    const bio = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return;
      bio.disconnect();
      const t0 = performance.now(), dur = 1400;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        no.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('tr-TR');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.35 });
    bio.observe(bigstat);
  }

  /* ilan filtreleri */
  const chips = $$('.chip');
  const cards = $$('.card');
  /* ilan detay penceresi */
  const modal = $('#listingModal');
  if (modal && grid) {
    const lmImg = $('#lmImg'), lmTitle = $('#lmTitle'), lmTag = $('#lmTag'), lmPrice = $('#lmPrice');
    const lmSpecs = $('#lmSpecs'), lmDesc = $('#lmDesc'), lmFeats = $('#lmFeats'), lmWa = $('#lmWa');
    let lastFocus = null;

    const openListing = (id) => {
      const l = L.find((x) => x.id === id);
      if (!l) return;
      lastFocus = document.activeElement;
      lmImg.src = l.img || '';
      lmImg.alt = l.alt || '';
      lmTitle.textContent = l.title || '';
      lmTag.textContent = STATUS[l.status] || '';
      lmTag.className = 'tag ' + (STATUS[l.status] ? l.status : 'satilik');
      lmPrice.textContent = l.status === 'satildi'
        ? (l.outcome || 'Satıldı')
        : tl(l.price) + ' TL' + (l.status === 'kiralik' ? ' / ay' : '');
      const specs = [
        ['İlçe', l.district], ['Oda', l.rooms], ['m²', String(l.m2)],
        ['Kat', l.floor], ['Bina yaşı', l.age ? l.age + ' yıl' : 'Yeni'],
        ['Isıtma', l.heating], ['Eşya', l.goods], ['İlan no', l.id]
      ].filter(([, v]) => v && v !== '—');
      lmSpecs.innerHTML = specs.map(([k, v]) => '<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>').join('');
      lmDesc.textContent = l.desc || '';
      lmFeats.innerHTML = (Array.isArray(l.feats) ? l.feats : []).map((f) => '<li>' + esc(f) + '</li>').join('');
      lmWa.href = 'https://wa.me/905327983352?text=' +
        encodeURIComponent('Merhaba, ' + l.title + ' (' + l.id + ') ilanı hakkında bilgi almak istiyorum.');
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      history.replaceState(null, '', '#ilan-' + l.id);
      $('.modal-x', modal).focus();
    };

    const closeListing = () => {
      if (modal.hidden) return;
      modal.hidden = true;
      document.body.style.overflow = '';
      history.replaceState(null, '', location.pathname + location.search);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (card) openListing(card.dataset.id);
    });
    modal.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) closeListing();
    });
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = $$('a[href],button:not([disabled])', modal);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') closeListing(); });
    if (location.hash.startsWith('#ilan-')) openListing(location.hash.slice(6));
    addEventListener('hashchange', () => {
      if (location.hash.startsWith('#ilan-')) openListing(location.hash.slice(6));
    });
  }

  /* kelime kelime acilan paragraf */
  const wordsP = $('[data-words]');
  const words = [];
  if (wordsP) {
    const txt = wordsP.textContent.trim();
    wordsP.textContent = '';
    txt.split(/\s+/).forEach((t) => {
      const w = document.createElement('span');
      w.className = 'w';
      w.textContent = t;
      wordsP.append(w, document.createTextNode(' '));
      words.push(w);
    });
    if (!reduced()) wordsP.classList.add('dim');
  }
  function wordsUpdate() {
    if (!words.length || !wordsP.classList.contains('dim')) return;
    const r = wordsP.getBoundingClientRect();
    const start = innerHeight * 0.9, end = innerHeight * 0.3;
    const p = clamp((start - r.top) / (start - end), 0, 1);
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('lit', i < n));
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      const f = chip.dataset.filter;
      cards.forEach((card) => {
        card.hidden = !(f === 'tumu' || card.dataset.status === f);
      });
    });
  });

  /* deger hesaplayici. Veri: Emlakjet, Ekim 2026, satilik daire ilan ortalamalari */
  const PPM2 = {
    Fatsa: 30018, Altınordu: 34628, Ünye: 34334, Perşembe: 38287,
    Gülyalı: 44642, Korgan: 23122, Diğer: 34172
  };
  const TYPE = {
    konut: { mult: 1, label: 'konut' },
    arsa: { mult: 0.38, label: 'arsa' },
    ticari: { mult: 1.25, label: 'ticari gayrimenkul' }
  };
  const AGE = [[1, 1.08], [5, 1.04], [10, 1], [20, 0.94], [30, 0.88], [40, 0.82], [999, 0.76]];
  const FLOOR = { zemin: 0.97, '1-3': 1, '4-8': 1.02, '9+': 1.03 };

  const form = $('#valForm');
  if (form) {
    const out = $('#valRange');
    const outNote = $('#valNote');
    const outLink = $('#valLink');
    const fmt = (n) => n.toLocaleString('tr-TR');
    const wa = (text) => 'https://wa.me/905327983352?text=' + encodeURIComponent(text);
    const syncType = () => {
      const k = form.type.value === 'konut';
      form.year.disabled = !k;
      form.floor.disabled = !k;
    };
    form.type.addEventListener('change', syncType);
    syncType();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const district = form.district.value;
      const m2 = Math.round(Number(form.m2.value));
      const type = form.type.value;
      const isKonut = type === 'konut';
      const year = Math.round(Number(form.year.value));
      const yearOk = isKonut && Number.isFinite(year) && year >= 1900 && year <= 2026;

      if (!m2 || m2 < 20 || m2 > 100000) {
        out.textContent = 'Metrekareyi kontrol edin.';
        outNote.textContent = '20 ile 100.000 arasında bir değer girin.';
        outLink.hidden = true;
        return;
      }

      let af = 1;
      if (yearOk) {
        const age = 2026 - year;
        for (const [lim, f] of AGE) { if (age <= lim) { af = f; break; } }
      }
      const ff = isKonut ? (FLOOR[form.floor.value] || 1) : 1;
      const base = PPM2[district] * TYPE[type].mult * m2 * af * ff;
      const lo = Math.round(base * 0.92 / 10000) * 10000;
      const hi = Math.round(base * 1.08 / 10000) * 10000;
      const floorText = form.floor.options[form.floor.selectedIndex].text;

      out.textContent = fmt(lo) + ' - ' + fmt(hi) + ' TL';
      outNote.textContent = district + ' · ' + m2 + ' m² · ' + TYPE[type].label +
        (yearOk ? ' · ' + year + ' · ' + floorText + '. kat' : '') +
        (isKonut
          ? '. Bölge ortalaması ' + fmt(PPM2[district]) + ' TL/m².' + (yearOk ? ' Yaş ve kat düzeltmesi uygulandı.' : '')
          : '. Bölge konut ortalaması ' + fmt(PPM2[district]) + ' TL/m² üzerinden tahmin.') +
        ' Ön hesaplama; kesin değer yerinde inceleme ile netleşir.';
      outLink.href = wa('Merhaba, ' + district + ' ilçesinde ' + m2 + ' m² ' + TYPE[type].label +
        (yearOk ? ' (' + year + ', ' + floorText + '. kat)' : '') +
        ' için değer öğrenmek istiyorum. Sitedeki ön hesaplama ' + fmt(lo) + ' - ' + fmt(hi) + ' TL aralığı verdi.');
      outLink.hidden = false;
    });
  }

  /* genel kaydirma: ilerleme, iplik, yatay serit, paralaks */
  let rUpdate = () => {};
  let gTick = false;
  function onScrollGlobal() {
    if (gTick) return;
    gTick = true;
    requestAnimationFrame(() => {
      gTick = false;
      pageProgress();
      drawThread();
      hUpdate();
      sUpdate();
      mfUpdate();
      rUpdate();
      parallax();
      wordsUpdate();
    });
  }
  addEventListener('scroll', onScrollGlobal, { passive: true });
  addEventListener('resize', () => { hMeasure(); hUpdate(); sUpdate(); mfUpdate(); rUpdate(); parallax(); }, { passive: true });
  addEventListener('load', () => { hMeasure(); hUpdate(); }, { once: true });


  /* bolum rayi: aktif numara + basa don */
  const rail = $('#rail');
  if (rail) {
    const rlinks = $$('a[data-r]', rail);
    const rid = rlinks.map((a) => a.dataset.r);
    const secs = rid.map((id) => document.getElementById(id));
    let rLast = '';
    rUpdate = () => {
      const base = innerHeight * 0.38;
      let idx = -1;
      secs.forEach((el, i) => { if (el && el.getBoundingClientRect().top <= base) idx = i; });
      const id = idx >= 0 ? rid[idx] : '';
      if (id === rLast) return;
      rLast = id;
      rlinks.forEach((a) => a.classList.toggle('on', a.dataset.r === id));
    };
    const rtop = $('#railTop');
    if (rtop) rtop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }));
    rUpdate();
  }

  /* manifesto: scroll ile kelime kelime acilir */
  const mf = $('#manifesto');
  const mfText = $('#mfText');
  let mfWords = [];
  if (mf && mfText) {
    const parts = mfText.textContent.trim().split(/\s+/);
    mfText.textContent = '';
    mfWords = parts.map((w, i) => {
      const sp = document.createElement('span');
      sp.className = 'mw';
      sp.textContent = w;
      mfText.appendChild(sp);
      if (i < parts.length - 1) mfText.appendChild(document.createTextNode(' '));
      return sp;
    });
  }
  function mfUpdate() {
    if (!mfWords.length) return;
    const r = mf.getBoundingClientRect();
    const span = r.height + innerHeight * 0.55;
    const p = clamp((innerHeight * 0.78 - r.top) / Math.max(1, span), 0, 1);
    const idx = Math.round(p * mfWords.length);
    mfWords.forEach((w, i) => {
      w.classList.toggle('on', i < idx);
      w.classList.toggle('hot', i === idx - 1);
    });
  }

  /* sertifika buyutme */
  const certs = $$('.certcard');
  const cm = $('#certModal');
  if (certs.length && cm) {
    const cmImg = $('#cmImg'), cmTitle = $('#cmTitle'), cmMeta = $('#cmMeta'), cmCount = $('#cmCount');
    let ci = 0, cLast = null;
    const cShow = (i) => {
      ci = (i + certs.length) % certs.length;
      const c = certs[ci];
      cmImg.src = c.dataset.img;
      cmImg.alt = c.dataset.title + ' belgesi';
      cmTitle.textContent = c.dataset.title;
      cmMeta.textContent = c.dataset.meta;
      cmCount.textContent = (ci + 1) + ' / ' + certs.length;
    };
    const cOpen = (i) => {
      cLast = document.activeElement;
      cShow(i);
      cm.hidden = false;
      document.body.style.overflow = 'hidden';
      $('.cm-x', cm).focus();
    };
    const cClose = () => {
      if (cm.hidden) return;
      cm.hidden = true;
      document.body.style.overflow = '';
      if (cLast && cLast.focus) cLast.focus();
    };
    certs.forEach((c, i) => c.addEventListener('click', () => cOpen(i)));
    cm.addEventListener('click', (e) => {
      if (e.target.closest('[data-cclose]')) cClose();
    });
    $('#cmPrev').addEventListener('click', () => cShow(ci - 1));
    $('#cmNext').addEventListener('click', () => cShow(ci + 1));
    addEventListener('keydown', (e) => {
      if (cm.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); cClose(); }
      else if (e.key === 'ArrowLeft') cShow(ci - 1);
      else if (e.key === 'ArrowRight') cShow(ci + 1);
      else if (e.key === 'Tab') {
        const f = $$('button:not([disabled])', cm);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  syncMotion();
  sUpdate();
  mfUpdate();
  onScrollGlobal();
  drawThread();
  parallax();
})();
