# -*- coding: utf-8 -*-
"""Import matched-supermarket-products CSV into Firestore. Keep nicknames."""
import csv
import json
import re
import sys
import urllib.parse
import urllib.request

sys.stdout.reconfigure(encoding="utf-8")

CSV_PATH = r"c:\Users\xsxsa\Downloads\matched-supermarket-products-complete.csv"
UNMATCHED_PATH = r"C:\Users\xsxsa\Documents\Repo\mysuper\unmatched-products.csv"
BASE = "https://firestore.googleapis.com/v1/projects/mysuper-6e24c/databases/(default)/documents"

CATEGORY_BY_NAME = {
    "kloron": "Cleaning",
    "popcorn": "Pantry",
    "αμμωνία": "Cleaning",
    "αντισηπτικό": "Personal Care",
    "αφρός μαλλιών": "Personal Care",
    "γλυκοπατάτες": "Vegetables",
    "δημητριακά": "Pantry",
    "διπλογεμιστά": "Pantry",
    "κεφαλοτύρι": "Dairy",
    "κιμάς 1kg": "Meat",
    "κοτόπουλο σνίτσελ": "Frozen",
    "κοτόπουλο στήθος": "Meat",
    "κόκκινο κρασί": "Beverages",
    "κρεμμύδι": "Vegetables",
    "μάσκα μαλλιών": "Personal Care",
    "μαλακτικό ρούχων": "Cleaning",
    "μαρούλι": "Vegetables",
    "μεμβράνη": "Household",
    "μερέντα": "Pantry",
    "μοσχάρι 500g": "Meat",
    "μπάρες δημητριακών": "Pantry",
    "ξηρή μαγιά": "Bakery",
    "παρμεζάνα": "Dairy",
    "πατάτες baby": "Vegetables",
    "πλαστικό wrap": "Household",
    "σως μουστάρδας": "Pantry",
}


def patch_product(doc_id: str, fields: dict) -> None:
    mask = "&".join(f"updateMask.fieldPaths={urllib.parse.quote(k)}" for k in fields)
    url = f"{BASE}/products/{doc_id}?{mask}"
    body = json.dumps({"fields": fields}).encode("utf-8")
    req = urllib.request.Request(
        url, data=body, method="PATCH", headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as r:
        r.read()


def add_category(name: str) -> None:
    url = f"{BASE}/categories"
    body = json.dumps({"fields": {"name": {"stringValue": name}}}).encode("utf-8")
    req = urllib.request.Request(
        url, data=body, method="POST", headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as r:
        r.read()


def existing_categories() -> set[str]:
    url = f"{BASE}/categories?pageSize=200"
    with urllib.request.urlopen(url) as r:
        data = json.loads(r.read().decode("utf-8"))
    names = set()
    for d in data.get("documents") or []:
        n = ((d.get("fields") or {}).get("name") or {}).get("stringValue")
        if n:
            names.add(n)
    return names


def is_ean(code: str) -> bool:
    digits = "".join(ch for ch in (code or "") if ch.isdigit())
    return len(digits) >= 8 and not (len(digits) <= 6)


def parse_price(raw: str):
    text = (raw or "").strip().replace(",", ".")
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def is_vague_match(full_name: str, code: str, price: str) -> bool:
    name = (full_name or "").strip().lower()
    if not name:
        return True
    if "category" in name:
        return True
    if name in {"λεμόνι / lemon juice", "lemon juice"}:
        return True
    has_sku = bool((code or "").strip() or (price or "").strip())
    has_size = bool(re.search(r"\d+\s*(g|kg|ml|l|τεμ)", name, re.IGNORECASE))
    return not has_sku and not has_size


def main():
    with open(CSV_PATH, encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))

    to_import = []
    still_unmatched = []
    for row in rows:
        full_name = (row.get("matched_product_name") or "").strip()
        confidence = (row.get("match_confidence") or "").strip()
        code = (row.get("matched_product_code") or "").strip()
        matched_price = (row.get("matched_price_eur") or "").strip()
        if not full_name or confidence.lower() in {"not verified", "low"}:
            still_unmatched.append(row)
            continue
        if is_vague_match(full_name, code, matched_price):
            still_unmatched.append(row)
            continue
        to_import.append(row)

    cats = existing_categories()
    needed = {CATEGORY_BY_NAME.get((r["name"] or "").strip().lower(), "Groceries") for r in to_import}
    for cat in sorted(needed):
        if cat not in cats:
            add_category(cat)
            cats.add(cat)
            print("added category", cat)

    imported = []
    for row in to_import:
        doc_id = (row.get("id") or "").strip()
        nickname = (row.get("name") or "").strip()
        full_name = (row.get("matched_product_name") or "").strip()
        price = parse_price(row.get("matched_price_eur") or "")
        category = CATEGORY_BY_NAME.get(nickname.lower(), (row.get("category") or "").strip() or "Groceries")
        fields = {
            "name": {"stringValue": nickname},
            "fullName": {"stringValue": full_name},
            "category": {"stringValue": category},
        }
        if price is not None:
            fields["price"] = {"doubleValue": price}
        ean = (row.get("matched_product_code") or row.get("barcode") or "").strip()
        if is_ean(ean) and len("".join(ch for ch in ean if ch.isdigit())) >= 8:
            digits = "".join(ch for ch in ean if ch.isdigit())
            if len(digits) >= 8:
                fields["barcode"] = {"integerValue": str(int(digits))}

        patch_product(doc_id, fields)
        imported.append(
            {
                "id": doc_id,
                "name": nickname,
                "fullName": full_name,
                "price": price,
                "category": category,
            }
        )
        print("imported", nickname, "->", full_name, price if price is not None else "(price kept)")

    with open(UNMATCHED_PATH, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["name", "barcode", "price", "category", "fromList", "quantity", "id"])
        for row in still_unmatched:
            writer.writerow(
                [
                    (row.get("name") or "").strip(),
                    row.get("barcode") or "",
                    row.get("price") or "",
                    row.get("category") or "",
                    row.get("fromList") or "",
                    row.get("quantity") or "",
                    row.get("id") or "",
                ]
            )

    print("IMPORTED", len(imported), "STILL_UNMATCHED", len(still_unmatched))


if __name__ == "__main__":
    main()
