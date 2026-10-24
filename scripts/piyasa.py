#!/usr/bin/env python3
"""Emlakjet SSR sayfalarindan ilce bazli m2 ortalamalarini ceker.
Başarısız ilçede eski degeri korur; hic veri yoksa hata ile cikar (workflow commit yapmaz)."""
import datetime, json, os, re, sys, urllib.request

URUMLAR = {
    "Fatsa": "ordu-fatsa", "Altınordu": "ordu-altinordu", "Ünye": "ordu-unye",
    "Perşembe": "ordu-persembe", "Gülyalı": "ordu-gulyali", "Korgan": "ordu-korgan",
    "Diğer": "ordu",  # il ortalamasi
}
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36"}
RE_FIYAT = re.compile(r"ortalama metrekare fiyat\u0131 ([\d.]+) TL")
KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HEDEF = os.path.join(KOK, "assets", "piyasa.json")

def eski():
    try:
        return json.load(open(HEDEF, encoding="utf-8"))
    except Exception:
        return {"ppm2": {}}

def cek(slug):
    url = f"https://www.emlakjet.com/satilik-daire/{slug}"
    html = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read().decode("utf-8", "ignore")
    m = RE_FIYAT.search(html)
    return int(m.group(1).replace(".", "")) if m else None

def main():
    onceki = eski()
    ppm2, eksik = dict(onceki.get("ppm2", {})), []
    for ad, slug in URUMLAR.items():
        try:
            v = cek(slug)
        except Exception as e:
            print(f"  ! {ad}: {e}", file=sys.stderr); v = None
        if v and 5000 < v < 500000:
            ppm2[ad] = v
            print(f"  + {ad}: {v}")
        elif ad in ppm2:
            print(f"  = {ad}: eski {ppm2[ad]} korundu")
            eksik.append(ad)
        else:
            print(f"  x {ad}: veri yok", file=sys.stderr)
    if "Fatsa" not in ppm2:
        sys.exit("Fatsa verisi yok — yayin yapilmayacak.")
    json.dump({"guncellendi": datetime.date.today().isoformat(), "kaynak": "emlakjet.com", "ppm2": ppm2},
              open(HEDEF, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("yazildi:", HEDEF, ("(eksik: " + ",".join(eksik) + ")") if eksik else "")

main()
