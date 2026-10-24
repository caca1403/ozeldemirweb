/* İlanlar — tek kaynak. Yeni ilan: diziye bir nesne ekle, fotoğrafı assets/img/ altına koy.
   status: satilik | kiralik | satildi · type: konut | arsa | ticari
   Solda price yerine outcome gösterilir. */
window.OD_LISTINGS = [
  {
    id: "ORN-1001", status: "satildi", type: "konut",
    title: "Geniş Aile Dairesi", district: "Altınordu", rooms: "3+1", m2: 145,
    floor: "Bahçe katı", age: 8, heating: "Doğalgaz", goods: "Eşyalı değil",
    price: 4250000, date: "2025-11-02", outcome: "38 günde satıldı",
    img: "assets/img/satilan-altinordu.jpg", alt: "Satılan geniş aile dairesi",
    feats: ["Deniz manzarası", "Site içi", "2 balkon", "Otopark", "Asansör"],
    desc: "Ulaşım ve market-okul aksına yürüme mesafesinde, ferah planlı aile dairesi. Stratejik pazarlama ile 38 günde satıldı."
  },
  {
    id: "ORN-1002", status: "satildi", type: "konut",
    title: "Boztepe'de Müstakil Ev", district: "Boztepe", rooms: "5+2", m2: 240,
    floor: "2 katlı", age: 5, heating: "Yerden ısıtma", goods: "Eşyalı",
    price: 9800000, date: "2025-08-15", outcome: "Rekabet üstü fiyat",
    img: "assets/img/satilan-boztepe.jpg", alt: "Satılan müstakil ev",
    feats: ["Geniş bahçe", "Barbekü alanı", "Garaj", "Güneş enerjisi", "Deprem yönetmeliğine uygun"],
    desc: "Şehir manzaralı, doğa içinde müstakil yaşam. Profesyonel fotoğraf + drone desteğiyle rekabet üstü fiyatta kapandı."
  },
  {
    id: "ORN-1003", status: "satildi", type: "ticari",
    title: "Yatırımlık Ticari + Konut", district: "Cumapazarı", rooms: "Dükkan + 2 daire", m2: 310,
    floor: "Zemin + 2 kat", age: 12, heating: "Bireysel", goods: "—",
    price: 7500000, date: "2025-06-20", outcome: "Kira getirili",
    img: "assets/img/satilan-cumapazari.jpg", alt: "Satılan ticari ve konut yapısı",
    feats: ["Cepheli dükkan", "Kira getirisi hazır", "Yola sıfır", "Kat mülkiyeti var"],
    desc: "Alt katı kiralık ticari, üst katları konut; karma kullanım ve düzenli kira geliri ile güçlü yatırım dosyası."
  },
  {
    id: "ORN-2001", status: "satilik", type: "konut",
    title: "Deniz Manzaralı 4+1 Daire", district: "Altınordu", rooms: "4+1", m2: 165,
    floor: "5. kat", age: 3, heating: "Merkezi", goods: "Az eşyalı",
    price: 5600000, date: "2026-10-10",
    img: "assets/img/satilik-deniz.jpg", alt: "Ordu sahilinde deniz manzarası",
    feats: ["Deniz manzarası", "Yeni bina", "Ebeveyn banyo", "Kiler", "Otopark"],
    desc: "Sahil yürüyüşüne 3 dk. Yüksek tavan, çift cepheli, batıdan gün batımı manzaralı."
  },
  {
    id: "ORN-2002", status: "satilik", type: "arsa",
    title: "İmarlı Arsa (Konut İmarı)", district: "Perşembe", rooms: "—", m2: 620,
    floor: "—", age: 0, heating: "—", goods: "—",
    price: 3100000, date: "2026-09-28",
    img: "assets/img/satilik-arsa.jpg", alt: "Yeşil arazi, imarlı arsa",
    feats: ["TAKS 0.40 / KAKS 1.20", "Yola cephe", "Altyapı hazır", "Eğim az"],
    desc: "Yeni yerleşim aksında, çevre yolu bağlantısına 800 m. Proje geliştirmeye uygun imar dosyalı arsa."
  },
  {
    id: "ORN-2003", status: "kiralik", type: "konut",
    title: "Kiralık 2+1 Sıfır Daire", district: "Altınordu", rooms: "2+1", m2: 95,
    floor: "3. kat", age: 0, heating: "Doğalgaz", goods: "Boş",
    price: 22000, date: "2026-10-18",
    img: "assets/img/kiralik-daire.jpg", alt: "Kiralık 2+1 sıfır daire",
    feats: ["Sıfır bina", "Asansör", "Otopark", "Deprem yönetmeliğine uygun"],
    desc: "Modern plan, geniş mutfak, şık banyo. Uzun süreli kiracıya tercih; referans ile hızlı sözleşme."
  }
];
