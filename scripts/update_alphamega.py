# -*- coding: utf-8 -*-
import json
import sys
import urllib.request
import urllib.parse

sys.stdout.reconfigure(encoding="utf-8")

PRODUCTS_PATH = r"C:\Users\xsxsa\Documents\Repo\mysuper\firestore-products.json"
BASE = "https://firestore.googleapis.com/v1/projects/mysuper-6e24c/databases/(default)/documents"

# Cheapest verified Alphamega SKU per list name. Barcodes are not published on the site.
MATCHES = {
    "nutella": {
        "name": "Nutella Κρέμα Φουντουκιού και Κακάο 200 g",
        "price": 2.99,
        "category": "Pantry",
    },
    "άσπρο ξύδι": {
        "name": "Platanis Λευκό Ξύδι 500 ml",
        "price": 0.95,
        "category": "Pantry",
    },
    "ξύδι": {
        "name": "Platanis Λευκό Ξύδι 500 ml",
        "price": 0.95,
        "category": "Pantry",
    },
    "χαρτομάντιλα κομοδίνου": {
        "name": "Αλφαμέγα Χαρτομάντηλα 2 φύλλα 2+1 Δώρο 150 τεμ.",
        "price": 3.00,
        "category": "Household",
    },
    "μπαταρία 2032": {
        "name": "Duracell 3V Lithium CR2032 2 τεμ.",
        "price": 1.99,
        "category": "Household",
    },
    "fanta zero": {
        "name": "Fanta Πορτοκαλάδα Zero 330 ml",
        "price": 0.80,
        "category": "Beverages",
    },
    "κρεμμύδι κόκκινο": {
        "name": "Κρεμμύδια Κόκκινα 500 g",
        "price": 0.93,
        "category": "Vegetables",
    },
    "σκόρδο": {
        "name": "Σκόρδο 80 g",
        "price": 0.54,
        "category": "Vegetables",
    },
    "ντομάτες": {
        "name": "Συσκευασμένες Τομάτες 1100 g",
        "price": 3.58,
        "category": "Vegetables",
    },
    "μπανάνα": {
        "name": "Μπανάνες Chiquita 1 kg",
        "price": 2.29,
        "category": "Fruits",
    },
    "καρότα": {
        "name": "Fresh Land Επιλεγμένα Καρότα 750 g",
        "price": 1.46,
        "category": "Vegetables",
    },
    "πορτοκαλί": {
        "name": "Πορτοκάλια για Χυμό 1.2 kg",
        "price": 1.79,
        "category": "Fruits",
    },
    "λεμόνι": {
        "name": "Εισαγόμενα Λεμόνια 500 g",
        "price": 1.43,
        "category": "Fruits",
    },
    "μακαρόνια": {
        "name": "Μιτσίδης Μακαρόνια Σπαγέττι 500 g",
        "price": 1.35,
        "category": "Pantry",
    },
    "μουστάρδα": {
        "name": "Deroni Μουστάρδα Κλασική 200 g",
        "price": 1.59,
        "category": "Pantry",
    },
    "μαγιονέζα": {
        "name": "Αλφαμέγα Μαγιονέζα 475 g",
        "price": 2.59,
        "category": "Pantry",
    },
    "philadelphia": {
        "name": "Philadelphia Original Τυρί Κρέμα 200 g",
        "price": 2.15,
        "category": "Dairy",
    },
    "φιλαδέλφεια": {
        "name": "Philadelphia Original Τυρί Κρέμα 200 g",
        "price": 2.15,
        "category": "Dairy",
    },
    "μοτσαρέλα": {
        "name": "AB Μαλακό τυρί Mozzarella σε Φέτες 200 g",
        "price": 2.19,
        "category": "Dairy",
    },
    "φέτα": {
        "name": "Αλάμπρα Φέτα Π.Ο.Π Χωρίς Λακτόζη 200 g",
        "price": 3.19,
        "category": "Dairy",
    },
    "γιαούρτι": {
        "name": "Αλφαμέγα Στραγγιστό Γιαούρτι 0% Λιπαρά 450 g",
        "price": 1.99,
        "category": "Dairy",
    },
    "γάλα": {
        "name": "Χαραλαμπίδης Κρίστης Φρέσκο Γάλα 3% 1 L",
        "price": 1.50,
        "category": "Dairy",
    },
    "κρέμα γάλακτος": {
        "name": "Arla Κρέμα Γάλακτος 35% Λιπαρά 200 ml",
        "price": 2.15,
        "category": "Dairy",
    },
    "ζαχαρη": {
        "name": "Αλφαμέγα Λευκή Κρυστάλλινη Ζάχαρη 1 kg",
        "price": 0.99,
        "category": "Pantry",
    },
    "σιμιγδάλι": {
        "name": "Μιτσίδης Σιμιγδάλι 1 kg",
        "price": 1.75,
        "category": "Pantry",
    },
    "cif": {
        "name": "Cif Cleanboost Κλασική Κρέμα Λεμόνι 500 ml",
        "price": 2.10,
        "category": "Cleaning",
    },
    "χαρτί κουζίνας": {
        "name": "Αλφαμέγα Χαρτί Κουζίνας 600 g",
        "price": 1.99,
        "category": "Household",
    },
    "χαρτί υγείας": {
        "name": "Αλφαμέγα Χαρτί Υγείας 4 Φύλλα 10 ρολά",
        "price": 3.99,
        "category": "Household",
    },
    "χαρτοπετσέτες": {
        "name": "Αλφαμέγα Άσπρες Χαρτοπετσέτες 33x33 cm 70 τεμ.",
        "price": 0.79,
        "category": "Household",
    },
    "σακούλες σκουπιδιών": {
        "name": "Αλφαμέγα Σακούλες τουαλέτας/γραφείου 9 L 20 τεμ.",
        "price": 0.59,
        "category": "Household",
    },
    "σακούλες μπάνιου": {
        "name": "Αλφαμέγα Σακούλες τουαλέτας/γραφείου 9 L 20 τεμ.",
        "price": 0.59,
        "category": "Household",
    },
    "σφουγγάρια": {
        "name": "Αλφαμέγα Σφουγγαράκια Κουζίνας 10 τεμ.",
        "price": 1.39,
        "category": "Household",
    },
    "οδοντόκρεμα": {
        "name": "Colgate Max Fresh Cooling Crystals 75 ml",
        "price": 2.55,
        "category": "Personal Care",
    },
    "ντομάτες κομμένες σάλτσα": {
        "name": "Μιτσίδης Ψιλοκομμένες Ντομάτες 400 g",
        "price": 1.20,
        "category": "Pantry",
    },
    "τοματοπολτος": {
        "name": "Mutti Ντοματοπολτός 140 g",
        "price": 1.39,
        "category": "Pantry",
    },
    "ρύζι": {
        "name": "3A Ρύζι Γλασσέ 1 kg",
        "price": 2.45,
        "category": "Pantry",
    },
    "μπασμάτι": {
        "name": "Αλφαμέγα Ρύζι Μπασμάτι 1 kg",
        "price": 2.99,
        "category": "Pantry",
    },
    "οινόπνευμα": {
        "name": "Conal 70% Vol Αντισηπτικό Οινόπνευμα Σπρέι 110 ml",
        "price": 1.79,
        "category": "Personal Care",
    },
    "αλεύρι": {
        "name": "Μιτσίδης Αλεύρι Φαρίνα Ζαχαροπλαστικής 1 kg",
        "price": 1.49,
        "category": "Bakery",
    },
    "farina tipo 00": {
        "name": "Μιτσίδης Αλεύρι Φαρίνα Ζαχαροπλαστικής 1 kg",
        "price": 1.49,
        "category": "Bakery",
    },
    "πιπεριές": {
        "name": "Συσκευασμένες Χρωματιστές Πιπεριές 700 g",
        "price": 4.17,
        "category": "Vegetables",
    },
    "πατάτες": {
        "name": "Φρέσκες Πατάτες 2 kg",
        "price": 1.98,
        "category": "Vegetables",
    },
    "χαρτομάντιλα πακέτο": {
        "name": "Kleenex Travel Tissues 3 Φύλλα 40 τεμ.",
        "price": 1.65,
        "category": "Household",
    },
    "αυγά": {
        "name": "Αλφαμέγα Βιολογικά Μεγάλα Αυγά 6 τεμ.",
        "price": 3.79,
        "category": "Dairy",
    },
}


def key_name(name: str) -> str:
    return (name or "").strip().lower()


def patch_product(doc_id: str, fields: dict) -> None:
    mask = "&".join(f"updateMask.fieldPaths={urllib.parse.quote(k)}" for k in fields)
    url = f"{BASE}/products/{doc_id}?{mask}"
    body = json.dumps({"fields": fields}).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="PATCH", headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r:
        r.read()


def add_category(name: str) -> None:
    url = f"{BASE}/categories"
    body = json.dumps(
        {
            "fields": {
                "name": {"stringValue": name},
            }
        }
    ).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="POST", headers={"Content-Type": "application/json"})
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


def barcode_field(raw):
    try:
        n = int(str(raw).split(".")[0])
    except (TypeError, ValueError):
        return None
    if n <= 0 or n < 100000:
        return None
    return {"integerValue": str(n)}


def main():
    products = json.load(open(PRODUCTS_PATH, encoding="utf-8"))
    updated = []
    flagged = []
    seen_flag = set()

    cats = existing_categories()
    needed = {m["category"] for m in MATCHES.values()}
    for cat in sorted(needed):
        if cat not in cats:
            add_category(cat)
            cats.add(cat)
            print("added category", cat)

    for p in products:
        k = key_name(p["name"])
        match = MATCHES.get(k)
        if not match:
            if k not in seen_flag:
                flagged.append(
                    {
                        "name": (p["name"] or "").strip(),
                        "current_price": p.get("price"),
                        "barcode": p.get("barcode"),
                        "fromList": p.get("fromList"),
                    }
                )
                seen_flag.add(k)
            continue

        fields = {
            "name": {"stringValue": match["name"]},
            "price": {"doubleValue": float(match["price"])},
            "category": {"stringValue": match["category"]},
        }
        bc = barcode_field(p.get("barcode"))
        if bc:
            fields["barcode"] = bc
        else:
            fields["barcode"] = {"integerValue": "0"}

        patch_product(p["id"], fields)
        updated.append(
            {
                "id": p["id"],
                "old": (p["name"] or "").strip(),
                "new": match["name"],
                "price": match["price"],
                "category": match["category"],
            }
        )
        print("updated", p["id"], match["name"], match["price"])

    out = {"updated": updated, "flagged": flagged}
    json.dump(
        out,
        open(r"C:\Users\xsxsa\Documents\Repo\mysuper\scripts\alphamega-update-result.json", "w", encoding="utf-8"),
        ensure_ascii=False,
        indent=2,
    )
    print("UPDATED", len(updated), "FLAGGED_UNIQUE", len(flagged))


if __name__ == "__main__":
    main()
