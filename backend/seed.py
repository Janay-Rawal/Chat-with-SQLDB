"""
Run once to create and seed student.db with a realistic schema.
Usage: python seed.py
"""
import sqlite3
import random
from pathlib import Path
from datetime import datetime, timedelta

DB_PATH = Path(__file__).parent / "student.db"

# ── helpers ───────────────────────────────────────────────────────────────────

def rand_date(start: datetime, end: datetime) -> str:
    delta = end - start
    return (start + timedelta(days=random.randint(0, delta.days))).strftime("%Y-%m-%d")

def rand_ts(start: datetime, end: datetime) -> str:
    delta = end - start
    secs = random.randint(0, int(delta.total_seconds()))
    return (start + timedelta(seconds=secs)).strftime("%Y-%m-%d %H:%M:%S")

# ── data pools ────────────────────────────────────────────────────────────────

FIRST_NAMES = [
    "Aarav","Aditi","Aditya","Akira","Anika","Ananya","Arjun","Ayaan",
    "Divya","Elena","Ishaan","Janay","Kabir","Kavya","Meera","Neha",
    "Pooja","Priya","Rahul","Ravi","Riya","Rohan","Sanvi","Sneha",
    "Tanya","Tanvi","Vikram","Yash","Zara","Arun","Bhavna","Chetan",
    "Deepa","Farhan","Gauri","Harsh","Isha","Jai","Komal","Lakshmi",
]
LAST_NAMES = [
    "Sharma","Patel","Singh","Kumar","Gupta","Mehta","Shah","Joshi",
    "Rao","Nair","Reddy","Iyer","Pillai","Verma","Mishra","Tiwari",
    "Chopra","Malhotra","Kapoor","Bose","Das","Sen","Roy","Ghosh",
]
CITIES = ["Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Kolkata","Pune","Ahmedabad","Jaipur","Surat"]
CATEGORIES = ["Electronics","Clothing","Books","Home & Kitchen","Sports","Beauty","Toys","Automotive","Garden","Food"]
PRODUCT_ADJECTIVES = ["Premium","Classic","Ultra","Smart","Eco","Pro","Elite","Mini","Mega","Lite"]
STATUSES = ["pending","processing","shipped","delivered","cancelled","returned"]
PAYMENT_METHODS = ["credit_card","debit_card","upi","net_banking","cash_on_delivery"]

random.seed(42)

def make_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

def make_email(name: str) -> str:
    parts = name.lower().split()
    domains = ["gmail.com","yahoo.com","outlook.com","hotmail.com","company.in"]
    return f"{parts[0]}.{parts[1]}{random.randint(1,99)}@{random.choice(domains)}"

# ── schema ────────────────────────────────────────────────────────────────────

DDL = """
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS sales_summary;

CREATE TABLE categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE products (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    category_id  INTEGER NOT NULL REFERENCES categories(id),
    price        REAL NOT NULL,
    stock        INTEGER NOT NULL DEFAULT 0,
    rating       REAL DEFAULT 0.0,
    created_at   TEXT NOT NULL
);

CREATE TABLE customers (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    email        TEXT NOT NULL UNIQUE,
    city         TEXT NOT NULL,
    age          INTEGER NOT NULL,
    gender       TEXT NOT NULL,
    joined_at    TEXT NOT NULL
);

CREATE TABLE orders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id     INTEGER NOT NULL REFERENCES customers(id),
    status          TEXT NOT NULL DEFAULT 'pending',
    payment_method  TEXT NOT NULL,
    total_amount    REAL NOT NULL,
    ordered_at      TEXT NOT NULL,
    delivered_at    TEXT
);

CREATE TABLE order_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id    INTEGER NOT NULL REFERENCES orders(id),
    product_id  INTEGER NOT NULL REFERENCES products(id),
    quantity    INTEGER NOT NULL,
    unit_price  REAL NOT NULL
);

CREATE TABLE sales_summary (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    year         INTEGER NOT NULL,
    month        INTEGER NOT NULL,
    category     TEXT NOT NULL,
    total_sales  REAL NOT NULL,
    order_count  INTEGER NOT NULL,
    UNIQUE(year, month, category)
);
"""

# ── seed ──────────────────────────────────────────────────────────────────────

def seed():
    if DB_PATH.exists():
        DB_PATH.unlink()

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.executescript(DDL)

    START = datetime(2022, 1, 1)
    END   = datetime(2024, 12, 31)

    # ── categories (10)
    for cat, desc in zip(CATEGORIES, [
        "Consumer electronics and gadgets",
        "Apparel, footwear and accessories",
        "Books, e-books and stationery",
        "Kitchen appliances and home décor",
        "Fitness equipment and outdoor gear",
        "Skincare, haircare and cosmetics",
        "Toys, games and hobby items",
        "Car accessories and spare parts",
        "Plants, seeds and garden tools",
        "Packaged food and beverages",
    ]):
        cur.execute("INSERT INTO categories (name, description) VALUES (?, ?)", (cat, desc))

    # ── products (100)
    for i in range(100):
        cat_id  = random.randint(1, 10)
        adj     = random.choice(PRODUCT_ADJECTIVES)
        cat_name = CATEGORIES[cat_id - 1].split()[0]
        name    = f"{adj} {cat_name} {chr(65 + i % 26)}{i // 26 + 1}"
        price   = round(random.uniform(99, 49999), 2)
        stock   = random.randint(0, 500)
        rating  = round(random.uniform(2.5, 5.0), 1)
        created = rand_date(START, END)
        cur.execute(
            "INSERT INTO products (name, category_id, price, stock, rating, created_at) VALUES (?,?,?,?,?,?)",
            (name, cat_id, price, stock, rating, created)
        )

    # ── customers (150)
    emails_used = set()
    for _ in range(150):
        name = make_name()
        email = make_email(name)
        while email in emails_used:
            email = make_email(name)
        emails_used.add(email)
        city   = random.choice(CITIES)
        age    = random.randint(18, 65)
        gender = random.choice(["M", "F", "Other"])
        joined = rand_date(START, END)
        cur.execute(
            "INSERT INTO customers (name, email, city, age, gender, joined_at) VALUES (?,?,?,?,?,?)",
            (name, email, city, age, gender, joined)
        )

    # ── orders + order_items (400 orders, 1-5 items each)
    for _ in range(400):
        cust_id = random.randint(1, 150)
        status  = random.choice(STATUSES)
        payment = random.choice(PAYMENT_METHODS)
        ordered = rand_ts(START, END)
        delivered = None
        if status == "delivered":
            d = datetime.strptime(ordered[:10], "%Y-%m-%d") + timedelta(days=random.randint(3, 14))
            delivered = d.strftime("%Y-%m-%d")

        num_items = random.randint(1, 5)
        total = 0.0
        item_rows = []
        for _ in range(num_items):
            prod_id = random.randint(1, 100)
            qty = random.randint(1, 4)
            cur.execute("SELECT price FROM products WHERE id = ?", (prod_id,))
            row = cur.fetchone()
            unit_price = row[0] if row else 999.0
            total += unit_price * qty
            item_rows.append((prod_id, qty, unit_price))

        total = round(total, 2)
        cur.execute(
            "INSERT INTO orders (customer_id, status, payment_method, total_amount, ordered_at, delivered_at) VALUES (?,?,?,?,?,?)",
            (cust_id, status, payment, total, ordered, delivered)
        )
        order_id = cur.lastrowid
        for prod_id, qty, unit_price in item_rows:
            cur.execute(
                "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?,?,?,?)",
                (order_id, prod_id, qty, unit_price)
            )

    # ── sales_summary (monthly aggregates 2022-2024 x 10 categories)
    for year in range(2022, 2025):
        for month in range(1, 13):
            for cat in CATEGORIES:
                sales = round(random.uniform(10000, 500000), 2)
                count = random.randint(10, 300)
                cur.execute(
                    "INSERT OR IGNORE INTO sales_summary (year, month, category, total_sales, order_count) VALUES (?,?,?,?,?)",
                    (year, month, cat, sales, count)
                )

    conn.commit()

    # ── verify
    print("✅ Database seeded successfully!\n")
    for table in ["categories","products","customers","orders","order_items","sales_summary"]:
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        print(f"  {table:<20} {cur.fetchone()[0]:>5} rows")

    conn.close()


if __name__ == "__main__":
    seed()