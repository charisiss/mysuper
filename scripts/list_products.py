# -*- coding: utf-8 -*-
import json
import sys

sys.stdout.reconfigure(encoding="utf-8")
products = json.load(
    open(r"C:\Users\xsxsa\Documents\Repo\mysuper\firestore-products.json", encoding="utf-8")
)
print("total", len(products))
print("unique names", len({(p["name"] or "").strip() for p in products}))
print(
    "barcode nonzero",
    sum(1 for p in products if str(p.get("barcode") or "0") not in ("0", "None")),
)
print("---names---")
for p in sorted(products, key=lambda x: (x["name"] or "")):
    name = (p["name"] or "").replace("\n", " ")
    print(
        f"{p['fromList'] or '-':10} | {str(p.get('barcode')):16} | {p.get('price')} | {(p.get('category') or '-'):12} | {name}"
    )
