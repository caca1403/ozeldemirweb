#!/usr/bin/env python3
"""python3 assets/img/qr/make_qr.py  —  pip install segno"""
import pathlib
import segno

HERE = pathlib.Path(__file__).parent
SITE = "https://caca1403.github.io/ozeldemirweb/"

TARGETS = {
    "qr-hub": SITE + "qr.html",
    "qr-whatsapp": "https://wa.me/905327983352?text=Merhaba%2C%20QR%20kodunuzdan%20geliyorum.",
    "qr-instagram": "https://www.instagram.com/ozel.demir.737",
    "qr-site": SITE,
}

for name, url in TARGETS.items():
    qr = segno.make(url, error="h")   # H: küçük baskıda bile okunur
    qr.save(HERE / f"{name}.svg", dark="#14231c", light="#ffffff", border=4)
    qr.save(HERE / f"{name}.png", dark="#14231c", light="#ffffff", border=4, scale=32, dpi=300)
    print(name, "->", url)
