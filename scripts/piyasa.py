#!/usr/bin/env python3
"""Emlakjet SSR sayfalarindan ilce + Fatsa mahalle istatistiklerini ceker.
Başarısız ilçede/eskisini korur; Fatsa fiyati yoksa hata ile cikar (workflow commit yapmaz)."""
import datetime, json, os, re, sys, urllib.request
from zoneinfo import ZoneInfo

def bugun_tr():
    return datetime.datetime.now(ZoneInfo('Europe/Istanbul')).date().isoformat()

URUMLAR = {
    "Fatsa": "ordu-fatsa", "Altınordu": "ordu-altinordu", "Ünye": "ordu-unye",
    "Perşembe": "ordu-persembe", "Gülyalı": "ordu-gulyali", "Korgan": "ordu-korgan",
    "Diğer": "ordu",  # il ortalamasi
}
MAHALLE_ILCE = ("Fatsa", "ordu-fatsa")  # mahalle kirilimi cikan ilce
MAHALLE_LIMIT = 15
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36"}
RE_FIYAT = re.compile(r"ortalama metrekare fiyat\u0131 ([\d.]+) TL")
RE_AMORT = re.compile(r"amortisman s\u00fcresi (\d+) y")
RE_YAS = re.compile(r"bina ya\u015f\u0131 ortalamas\u0131 yakla\u015f\u0131k (\d+) y\u0131l")
# sayfa ici Next.js gomulu veri: 6'li istatistik kartinin yillik degisim orani
RE_KART = re.compile(r'\\"label\\":\\"([^"\\]{3,40})\\",\\"amount\\":(\d+),\\"type\\":\\"(\w+)\\"(?:,\\"annualChangeRatio\\":(-?[\d.]+))?')
RE_ORT = re.compile(r"fiyatlar\u0131 ortalama ([\d.]+) TL. Fiyat ortalamas\u0131, ge\u00e7ti\u011fimiz aya g\u00f6re %(\d+) (artm\u0131\u015f|azalm\u0131)\u015ft")
RE_UCUZ = re.compile(r"en ucuz fiyat ([\d.]+) TL, en pahal\u0131 fiyat ([\d.]+) TL")
RE_AY = re.compile(r"en d\u00fck\u00fck oldu\u011fu ay ([A-Za\u011f\u0130\u00d6\u00dc\u00c7\u015e\u015f\u0131\u00f6\u00fc\u00e7\u011f\u0130\u015e\u00dc \u0131]{3,20}) ay\u0131d\u0131r")
RE_TAHMIN = re.compile(r"(\d{4}) y\u0131l\u0131 sonuna kadar %(\d+) oran\u0131nda artmas\u0131 beklen")
KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HEDEF = os.path.join(KOK, "assets", "piyasa.json")


def eski():
    try:
        return json.load(open(HEDEF, encoding="utf-8"))
    except Exception:
        return {"ppm2": {}}


def sayfa(slug):
    url = f"https://www.emlakjet.com/satilik-daire/{slug}"
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read().decode("utf-8", "ignore")


def sayi(s):
    return int(s.replace(".", ""))


def kartlar(html):
    gorulen, cikti = set(), []
    for m in RE_KART.finditer(html):
        etiket = m.group(1)
        if etiket in gorulen:
            continue
        gorulen.add(etiket)
        cikti.append({"l": etiket, "a": int(m.group(2)), "t": m.group(3),
                      "r": float(m.group(4)) if m.group(4) is not None else None})
    return cikti[:6]


def ilce_verisi(html):
    out = {}
    m = RE_FIYAT.search(html); out["fiyat"] = sayi(m.group(1)) if m else None
    m = RE_AMORT.search(html); out["amortisman"] = int(m.group(1)) if m else None
    m = RE_YAS.search(html); out["yasi"] = int(m.group(1)) if m else None
    out["istat"] = kartlar(html)
    return out


def mahalle_verileri(html_fiyatlar, slug_onek):
    slugs = []
    for s in re.findall(rf'href="/satilik-daire/({slug_onek}-[a-z\u00e7\u011f\u0131\u00f6\u015f\u00fc-]+-mahallesi)"', html_fiyatlar):
        if s not in slugs:
            slugs.append(s)
    sonuc = []
    for s in slugs[:MAHALLE_LIMIT]:
        try:
            html = sayfa(s)
        except Exception as e:
            print(f"    ! {s}: {e}", file=sys.stderr)
            continue
        ad = re.search(r"Fatsa ([A-Z\u00c7\u011e\u0130\u00d6\u00dc][\w\u00e7\u011f\u0131\u00f6\u015f\u00fc\u0130 ]+) Mahallesi", html)
        m2 = RE_FIYAT.search(html)
        if not ad or not m2:
            continue
        e = {"ad": ad.group(1).strip(), "m2": sayi(m2.group(1))}
        kart = next((k for k in kartlar(html) if k["t"] == "unitPrice"), None)
        if kart and kart.get("r") is not None:
            e["yillik"] = round(kart["r"] * 100, 1)
        m = RE_ORT.search(html)
        if m:
            e["ort"] = sayi(m.group(1))
            e["ay"] = int(m.group(2)) * (1 if m.group(3) == "artm\u0131\u015f" else -1)
        m = RE_UCUZ.search(html)
        if m:
            e["ucuz"], e["pahali"] = sayi(m.group(1)), sayi(m.group(2))
        m = RE_AY.search(html)
        if m:
            e["dusukAy"] = m.group(1)
        m = RE_TAHMIN.search(html)
        if m:
            e["tahmin"] = int(m.group(2))
        sonuc.append(e)
        print(f"    + {e['ad']}: {e['m2']} TL/m\u00b2")
    return sorted(sonuc, key=lambda x: -x["m2"])


def main():
    onceki = eski()
    ppm2, ek, eksik = dict(onceki.get("ppm2", {})), dict(onceki.get("ek", {})), []
    html_cache = {}
    for ad, slug in URUMLAR.items():
        v = None
        try:
            html = sayfa(slug)
            html_cache[slug] = html
            v = ilce_verisi(html)
        except Exception as e:
            print(f"  ! {ad}: {e}", file=sys.stderr)
        if v:
            if v.get("fiyat") and 5000 < v["fiyat"] < 500000:
                ppm2[ad] = v["fiyat"]
                print(f"  + {ad}: {v['fiyat']}")
            else:
                print(f"  = {ad}: fiyat eski {ppm2.get(ad)} korundu")
                eksik.append(ad)
            yeni_ek = {k: v[k] for k in ("amortisman", "yasi", "istat") if v.get(k)}
            if yeni_ek or ad in ek:
                ek[ad] = {**ek.get(ad, {}), **yeni_ek}
        else:
            print(f"  x {ad}: veri yok", file=sys.stderr)

    mahalle = dict(onceki.get("mahalle", {}))
    mad, mslug = MAHALLE_ILCE
    if mslug in html_cache:
        try:
            liste = mahalle_verileri(html_cache[mslug], mslug)
            if liste:
                mahalle[mad] = liste
            else:
                print("  ! mahalle: liste bos, eski korundu", file=sys.stderr)
        except Exception as e:
            print(f"  ! mahalle: {e}", file=sys.stderr)
    else:
        print("  ! mahalle: ilce sayfasi alinamadi, eski korundu", file=sys.stderr)

    if "Fatsa" not in ppm2:
        sys.exit("Fatsa verisi yok — yayin yapilmayacak.")
    json.dump({"guncellendi": bugun_tr(), "kaynak": "emlakjet.com",
               "ppm2": ppm2, "ek": ek, "mahalle": mahalle},
              open(HEDEF, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    hist_yol = os.path.join(KOK, "assets", "piyasa-history.json")
    try:
        hist = json.load(open(hist_yol, encoding="utf-8"))
    except Exception:
        hist = []
    bugun = bugun_tr()
    hist = [e for e in hist if e.get("t") != bugun]
    yet = {"t": bugun}
    yet.update({k: v for k, v in ppm2.items() if k != "Diğer"})
    hist.append(yet)
    hist.sort(key=lambda e: e.get("t", ""))
    json.dump(hist[-400:], open(hist_yol, "w", encoding="utf-8"), ensure_ascii=False)
    print("yazildi:", HEDEF, ("(eksik: " + ",".join(eksik) + ")") if eksik else "")


main()
