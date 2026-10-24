/* ============================================================
   data/listings.js — ilan verisi (tek doğruluk kaynağı)
   Yeni ilan eklemek için: OD_DATA.listings dizisine yeni nesne
   ekle; görselleri assets/img/properties/ altına koy.
   status: "satilik" | "kiralik" | "satildi"
   type  : "konut" | "arsa" | "ticari"
   price : TL (kiralıkta aylık kira). 0 = fiyat yok
   ============================================================ */
window.OD_DATA = {
  brand: {
    name: "Özel Demir",
    phone: "+905327983352",
    phoneHuman: "+90 532 798 33 52",
    whatsapp: "905327983352",
    instagram: "https://www.instagram.com/ozel.demir.737",
    facebook: "https://www.facebook.com/share/1CXTdbtjbb/",
    city: "Ordu",
    address: "Altınordu / Ordu"
  },
  /* değerleme hesaplayıcı — ₺/m² baz fiyatlar (demo; gerçek piyasa verisiyle güncelleyin) */
  pricePerM2: {
    "Altınordu": 38000, "Ünye": 27000, "Fatsa": 25000, "Perşembe": 30000,
    "Gülyalı": 23000, "Korgan": 19000, "Diğer": 21000
  },
  listings: [
    {
      id: "ORN-1001", status: "satildi", type: "konut",
      title: "Geniş Aile Dairesi", district: "Altınordu", rooms: "3+1", m2: 145,
      floor: "Bahçe katı", age: 8, heating: "Doğalgaz", goods: "Eşyalı değil",
      price: 4250000, date: "2025-11-02",
      images: ["assets/img/properties/altinordu-daire.jpg"],
      feats: ["Deniz manzarası", "Site içi", "2 balkon", "Otopark", "Asansör"],
      desc: "Ulaşım ve market-okul aksına yürüme mesafesinde, ferah planlı aile dairesi. Stratejik pazarlama ile 38 günde satıldı."
    },
    {
      id: "ORN-1002", status: "satildi", type: "konut",
      title: "Boztepe'de Müstakil Ev", district: "Boztepe", rooms: "5+2", m2: 240,
      floor: "2 katlı", age: 5, heating: "Yerden ısıtma", goods: "Eşyalı",
      price: 9800000, date: "2025-08-15",
      images: ["assets/img/properties/boztepe-mustakil.jpg"],
      feats: ["Geniş bahçe", "Barbekü alanı", "Garaj", "Güneş enerjisi", "Deprem yönetmeliğine uygun"],
      desc: "Şehir manzaralı, doğa içinde müstakil yaşam. Profesyonel fotoğraf + drone desteğiyle rekabet üstü fiyatta kapandı."
    },
    {
      id: "ORN-1003", status: "satildi", type: "ticari",
      title: "Yatırımlık Ticari + Konut", district: "Cumapazarı", rooms: "Dükkan + 2 daire", m2: 310,
      floor: "Zemin + 2 kat", age: 12, heating: "Bireysel", goods: "—",
      price: 7500000, date: "2025-06-20",
      images: ["assets/img/properties/cumapazari-yatirim.jpg"],
      feats: ["Cepheli dükkan", "Kira getirisi hazır", "Yola sıfır", "Kat mülkiyeti var"],
      desc: "Alt katı kiralık ticari, üst katları konut; karma kullanım ve düzenli kira geliri ile güçlü yatırım dosyası."
    },
    {
      id: "ORN-2001", status: "satilik", type: "konut",
      title: "Deniz Manzaralı 4+1 Daire", district: "Altınordu", rooms: "4+1", m2: 165,
      floor: "5. kat", age: 3, heating: "Merkezi", goods: "Az eşyalı",
      price: 5600000, date: "2026-10-10",
      images: ["https://images.pexels.com/photos/210617/pexels-photo-210617.jpeg?auto=compress&cs=tinysrgb&w=1200",
               "https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=1200"],
      feats: ["Deniz manzarası", "Yeni bina", "Ebeveyn banyo", "Kiler", "Otopark"],
      desc: "Sahil yürüyüşüne 3 dk. Yüksek tavan, çift cepheli, batıdan gün batımı manzaralı."
    },
    {
      id: "ORN-2002", status: "satilik", type: "arsa",
      title: "İmarlı Arsa (Konut İmarı)", district: "Perşembe", rooms: "—", m2: 620,
      floor: "—", age: 0, heating: "—", goods: "—",
      price: 3100000, date: "2026-09-28",
      images: ["https://images.pexels.com/photos/12391637/pexels-photo-12391637.jpeg?auto=compress&cs=tinysrgb&w=1200"],
      feats: ["TAKS 0.40 / KAKS 1.20", "Yola cephe", "Altyapı hazır", "Eğim az"],
      desc: "Yeni yerleşim aksında, çevre yolu bağlantısına 800 m. Proje geliştirmeye uygun imar dosyalı arsa."
    },
    {
      id: "ORN-2003", status: "kiralik", type: "konut",
      title: "Kiralık 2+1 Sıfır Daire", district: "Altınordu", rooms: "2+1", m2: 95,
      floor: "3. kat", age: 0, heating: "Doğalgaz", goods: "Boş",
      price: 22000, date: "2026-10-18",
      images: ["https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?auto=compress&cs=tinysrgb&w=1200",
               "https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=1200"],
      feats: ["Sıfır bina", "Asansör", "Otopark", "Deprem yönetmeliğine uygun"],
      desc: "Modern plan, geniş mutfak, şık banyo. Uzun süreli kiracıya tercih; referans ile hızlı sözleşme."
    }
  ]
};

/* ============================================================
   localStorage overlay — Yönetim Paneli (yonetim.html) katmanı
   odList+ : eklenen ilanlar | odList- : silinen repo ilan id'leri
   odList~ : repo ilanları için düzenleme patch'leri {id:{...}}
   Kalıcı yayına alırken: panelden JSON'u kopyalayıp yukarıdaki
   listings dizisine taşıyıp commit'leyin.
   ============================================================ */
(function () {
  try {
    var add = JSON.parse(localStorage.getItem("odList+") || "[]"),
        del = JSON.parse(localStorage.getItem("odList-") || "[]"),
        ed  = JSON.parse(localStorage.getItem("odList~") || "{}");
    window.OD_DATA.base = window.OD_DATA.listings.slice(); /* repo ham hali — panel yayınlar */
    window.OD_DATA.listings = window.OD_DATA.listings
      .filter(function (x) { return del.indexOf(x.id) < 0; })
      .map(function (x) { return ed[x.id] ? Object.assign({}, x, ed[x.id]) : x; })
      .concat(add);
  } catch (e) { /* bozuk veri → repo verisiyle devam */ }
})();
