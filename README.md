# Özel Demir — Gayrimenkul Danışmanlığı (Ordu)

Tek sayfalık, bağımlılıksız (build/tooling yok) statik emlak danışmanı sitesi.
GitHub Pages üzerinde yayınlanır; `python3 -m http.server` ile lokal çalıştırılır.

## Özellikler
- İlan arşivi: arama + durum/kategori/ilçe filtreleri + sıralama + "daha fazla"
- Favoriler (localStorage) — detayda ve kartta tek dokunuş
- İlan detay modalı: fotoğraf galerisi, spesifikasyonlar, WhatsApp ile ilana özel mesaj, paylaşma (`navigator.share` / kopyala), `#/ilan/ID` derin bağlantısı
- Anlık değerleme hesaplayıcısı (bölgesel ₺/m² çarpan modeli)
- Ücretsiz değerleme formu + hızlı mesaj formu → WhatsApp lead (localStorage yedeği)
- 3D coverflow portföy (satılanlar), animasyonlu sayaçlar, scroll-reveal, dark/light tema
- Sertifikalar lightbox'ı, blog modalları, SSS akordeonu, harita, SEO meta + JSON-LD

## Klasör Yapısı
```
ozeldemirweb/
├── index.html              # tek sayfa — tüm bölümler
├── 404.html                # GitHub Pages özel 404
├── robots.txt / sitemap.xml / .nojekyll
├── assets/
│   ├── css/
│   │   ├── base.css        # token'lar, reset, tipografi, yardımcılar
│   │   ├── layout.css      # navbar, hero, footer, yüzen butonlar
│   │   ├── components.css  # buton, kart, form, rozet
│   │   └── sections.css    # bölüm bazlı stiller (ilan, portföy, hesap…)
│   ├── js/
│   │   ├── app.js          # tema, nav, sayaç, reveal, SSS, modal, blog
│   │   ├── listings.js     # arama/filtre/favori/detay galeri
│   │   └── valuation.js    # coverflow, değerleme hesaplayıcı, formlar
│   ├── data/listings.js    # İLAN VERİSİ — yeni ilan buraya eklenir
│   └── img/
│       ├── bio.png
│       ├── properties/     # ilan fotoğrafları
│       └── certificates/   # belge fotoğrafları
└── LICENSE
```

## Yeni ilan ekleme
**Yönetim Paneli + GitHub token (kalıcı, herkese görünür):** `yonetim.html` → şifre `ord2026`
→ ilanı ekle → "GitHub ile Yayınla" kutusuna token gir (fine-grained, bu repo,
Contents: Read and write) → **Yayınla**. Panel dosyaları repoya yazar; GitHub Pages
1-2 dk içinde siteyi günceller. Token yalnızca yayınlayan kişinin tarayıcısında durur.

**Panel – yerel önizleme:** ilanı ekleyin, aynı tarayıcıda anında görünür; kalıcı
yayın için ya token ile yayınlayın ya da "Repo JSON export" ile aşağıdaki manuel yolu izleyin.

**Manuel yol:**
1. Fotoğrafı `assets/img/properties/` altına koy.
2. `assets/data/listings.js` içindeki `listings` dizisine yeni nesne ekle
   (`id`, `status: satilik|kiralik|satildi`, `type: konut|arsa|ticari`, `price`, `images[]` …).
3. Filtrelerdeki ilçe listesi veriden otomatik türer; ek işlem gerekmez.

## Değerleme çarpanları
`assets/data/listings.js` → `pricePerM2` tablosundan güncellenir (demo veridir;
gerçek piyasa verisiyle periyodik güncellenmelidir).

## Yayın
Depoyu `caca1403.github.io/ozeldemirweb` olarak push'la; Pages kök dizinden servis eder.
