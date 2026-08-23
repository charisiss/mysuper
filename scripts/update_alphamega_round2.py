# -*- coding: utf-8 -*-
"""Keep nicknames in `name`. Store Alphamega title in `fullName`."""
import json
import sys
import urllib.parse
import urllib.request

sys.stdout.reconfigure(encoding="utf-8")

PRODUCTS_PATH = r"C:\Users\xsxsa\Documents\Repo\mysuper\firestore-products.json"
OUT_PATH = r"C:\Users\xsxsa\Documents\Repo\mysuper\scripts\alphamega-update-result.json"
BASE = "https://firestore.googleapis.com/v1/projects/mysuper-6e24c/databases/(default)/documents"

# Cheapest verified Alphamega SKU per nickname. Do not invent barcodes.
MATCHES = {
    "coca cola": {
        "fullName": "Coca-Cola Original Taste 1 L",
        "price": 1.59,
        "category": "Beverages",
    },
    "πορτοκαλάδα": {
        "fullName": "Fanta Πορτοκαλάδα 330 ml",
        "price": 0.80,
        "category": "Beverages",
    },
    "χυμός": {
        "fullName": "Agros 100% Χυμός Μήλο 1 L",
        "price": 1.19,
        "category": "Beverages",
    },
    "γάλα κακάο": {
        "fullName": "Λανίτης Kiddo Γάλα Σοκολάτας 250 ml",
        "price": 0.79,
        "category": "Dairy",
    },
    "σοκολατούχο γάλα": {
        "fullName": "Λανίτης Kiddo Γάλα Σοκολάτας 1 L",
        "price": 2.05,
        "category": "Dairy",
    },
    "ηλιέλαιο": {
        "fullName": "Αλφαμέγα Ηλιέλαιο 1 L",
        "price": 2.39,
        "category": "Pantry",
    },
    "λάδι": {
        "fullName": "Melody Εξαιρετικό Παρθένο Ελαιόλαδο 1 L",
        "price": 7.49,
        "category": "Pantry",
    },
    "duck": {
        "fullName": "Duck Deep Action Gel Marine Ocean 750 ml",
        "price": 1.89,
        "category": "Cleaning",
    },
    "αζαξ": {
        "fullName": "Ajax Boost Καθαριστικό Πατώματος Σόδα & Λεμόνι 1 L",
        "price": 1.89,
        "category": "Cleaning",
    },
    "τόνος": {
        "fullName": "Πλώρη Τόνος σε Ηλιέλαιο Τεμαχισμένος 3x80 g",
        "price": 3.29,
        "category": "Pantry",
    },
    "βούτυρο": {
        "fullName": "Lurpak Βούτυρο Ανάλατο 225 g",
        "price": 3.65,
        "category": "Dairy",
    },
    "μελι": {
        "fullName": "Αλφαμέγα Μέλι 475 g",
        "price": 3.19,
        "category": "Pantry",
    },
    "ρίγανη": {
        "fullName": "Carnation Spices Ρίγανη 30 g",
        "price": 1.35,
        "category": "Pantry",
    },
    "bbq": {
        "fullName": "Heinz Σάλτσα Μπάρμπεκιου Κλασική 480 g",
        "price": 3.99,
        "category": "Pantry",
    },
    "ψωμί τοστ": {
        "fullName": "Αλφαμέγα Ψωμί Ολικής Αλέσεως σε Φέτες 500 g",
        "price": 1.69,
        "category": "Bakery",
    },
    "κοτομπουκιες": {
        "fullName": "Αλφαμέγα Κοτομπουκιές 500 g",
        "price": 4.49,
        "category": "Frozen",
    },
    "ζαμπον": {
        "fullName": "Αλφαμέγα Χαμ 150 g",
        "price": 1.99,
        "category": "Dairy",
    },
    "μπέικον": {
        "fullName": "Χρυσοδάλια Μπέικον σε Φέτες 150 g",
        "price": 1.95,
        "category": "Dairy",
    },
    "λουκάνικα": {
        "fullName": "Αλφαμέγα Λουκάνικα Τύπου Φρανκφούρτης 250 g",
        "price": 1.99,
        "category": "Dairy",
    },
    "σαλάμι": {
        "fullName": "Αλφαμέγα Σαλάμι Τύπου Ουγγαρίας 100 g",
        "price": 2.19,
        "category": "Dairy",
    },
    "πτι μπερ": {
        "fullName": "Παπαδοπούλου Μπισκότα Πτι-Μπερ 225 g",
        "price": 1.15,
        "category": "Pantry",
    },
    "τορτίγια": {
        "fullName": "Αλφαμέγα 6 Τορτίγιας Ολικής Αλέσεως 360 g",
        "price": 1.99,
        "category": "Bakery",
    },
    "απορρυπαντικό": {
        "fullName": "Eureka Massalias Κλασικό Υγρό Απορρυπαντικό 57 πλύσεις 2.592 L",
        "price": 6.75,
        "category": "Cleaning",
    },
    "noodles": {
        "fullName": "Mama Ανατολικά Στιγμιαία Νούντλς Πικάντικη Πιπεριά 90 g",
        "price": 1.29,
        "category": "Pantry",
    },
    "baking powder": {
        "fullName": "Royal Baking Powder 113 g",
        "price": 1.49,
        "category": "Pantry",
    },
    "σαπούνι": {
        "fullName": "Palmolive Naturals Κρεμοσάπουνο Γάλα & Μέλι Ανταλλακτικό 900 ml",
        "price": 3.39,
        "category": "Personal Care",
    },
}


def key_name(name: str) -> str:
    return (name or "").strip().lower()


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


def main():
    products = json.load(open(PRODUCTS_PATH, encoding="utf-8"))
    try:
        prev = json.load(open(OUT_PATH, encoding="utf-8"))
        already = {u["id"] for u in prev.get("updated") or []}
    except OSError:
        already = set()
        prev = {"updated": [], "flagged": []}

    updated = list(prev.get("updated") or [])
    cats = existing_categories()
    needed = {m["category"] for m in MATCHES.values()}
    for cat in sorted(needed):
        if cat not in cats:
            add_category(cat)
            cats.add(cat)
            print("added category", cat)

    matched_keys = set(MATCHES)
    this_round = []

    for p in products:
        k = key_name(p["name"])
        match = MATCHES.get(k)
        if not match:
            continue
        if p["id"] in already and k not in matched_keys:
            continue

        nickname = (p["name"] or "").strip()
        fields = {
            "name": {"stringValue": nickname},
            "fullName": {"stringValue": match["fullName"]},
            "price": {"doubleValue": float(match["price"])},
            "category": {"stringValue": match["category"]},
        }
        patch_product(p["id"], fields)
        rec = {
            "id": p["id"],
            "old": nickname,
            "new": match["fullName"],
            "price": match["price"],
            "category": match["category"],
        }
        this_round.append(rec)
        if not any(u.get("id") == p["id"] for u in updated):
            updated.append(rec)
        print("updated", p["id"], nickname, "->", match["fullName"], match["price"])

    matched_now = {key_name(u["old"]) for u in updated}
    flagged = []
    seen = set()
    for p in products:
        k = key_name(p["name"])
        if k in seen:
            continue
        seen.add(k)
        if k in MATCHES or k in matched_now:
            continue
        flagged.append(
            {
                "name": (p["name"] or "").strip(),
                "current_price": p.get("price"),
                "barcode": p.get("barcode"),
                "fromList": p.get("fromList"),
            }
        )

    out = {"updated": updated, "flagged": flagged, "round2": this_round}
    json.dump(out, open(OUT_PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("ROUND2", len(this_round), "TOTAL_UPDATED", len(updated), "FLAGGED", len(flagged))


if __name__ == "__main__":
    main()
