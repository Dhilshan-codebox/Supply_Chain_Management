# database.py
import sqlite3
import json
import os
import random
from datetime import datetime, timedelta
import numpy as np

DB_FILE = "supply_chain.db"

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # 1. Raw Materials Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS raw_materials (
        material_id TEXT PRIMARY KEY,
        supplier_id TEXT,
        sku TEXT,
        received_date TEXT,
        specs_compliant INTEGER,
        quality_score REAL,
        inspection_notes TEXT
    )""")
    
    # 2. Inventory Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS inventory (
        sku TEXT PRIMARY KEY,
        name TEXT,
        quantity_on_hand REAL,
        reorder_point REAL,
        safety_stock REAL,
        eoq REAL,
        holding_cost REAL,
        order_cost REAL,
        unit_cost REAL,
        lead_time_days INTEGER,
        warehouse_location TEXT,
        last_updated TEXT
    )""")
    
    # 3. Shipments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS shipments (
        shipment_id TEXT PRIMARY KEY,
        carrier TEXT,
        sku TEXT,
        quantity REAL,
        status TEXT,
        current_latitude REAL,
        current_longitude REAL,
        destination TEXT,
        eta TEXT,
        actual_delivery TEXT,
        created_date TEXT
    )""")
    
    # 4. Demand Forecast Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS demand_forecast (
        sku TEXT,
        forecast_date TEXT,
        forecast_value REAL,
        confidence_lower REAL,
        confidence_upper REAL,
        PRIMARY KEY (sku, forecast_date)
    )""")
    
    # 5. Orders (Historical Actual Sales)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        order_id TEXT PRIMARY KEY,
        sku TEXT,
        order_date TEXT,
        quantity REAL
    )""")
    
    # 6. Supplier Quality Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS supplier_quality (
        supplier_id TEXT PRIMARY KEY,
        name TEXT,
        compliance_score REAL,
        defect_rate REAL,
        on_time_delivery REAL,
        status TEXT
    )""")
    
    # 7. Contracts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS contracts (
        contract_id TEXT PRIMARY KEY,
        supplier_id TEXT,
        payment_terms TEXT,
        lead_time_days INTEGER,
        defect_penalty_pct REAL,
        late_delivery_penalty REAL,
        raw_text TEXT,
        embedding TEXT
    )""")
    
    # 8. Production Schedule Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS production_schedule (
        sku TEXT,
        plan_date TEXT,
        planned_output REAL,
        actual_output REAL,
        line_id TEXT,
        PRIMARY KEY (sku, plan_date)
    )""")
    
    # 9. Risks Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS risks (
        risk_id TEXT PRIMARY KEY,
        type TEXT,
        severity TEXT,
        details TEXT,
        mitigation TEXT,
        timestamp TEXT
    )""")
    
    # 10. Planning Cycles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS planning_cycles (
        cycle_id TEXT PRIMARY KEY,
        timestamp TEXT,
        state_json TEXT
    )""")
    
    conn.commit()
    conn.close()

def mock_vector_embedding(text):
    # Generates a simple mock embedding vector normalized
    random.seed(hash(text) % 100000)
    vec = [random.random() for _ in range(16)]
    norm = sum(x**2 for x in vec)**0.5
    return [x/norm for x in vec]

def cosine_similarity(v1, v2):
    return sum(a*b for a, b in zip(v1, v2))

def seed_data(force=False):
    # Check if already seeded
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM inventory")
    count = cursor.fetchone()[0]
    if count > 0 and not force:
        conn.close()
        return
    
    # Clear tables
    cursor.execute("DELETE FROM raw_materials")
    cursor.execute("DELETE FROM inventory")
    cursor.execute("DELETE FROM shipments")
    cursor.execute("DELETE FROM demand_forecast")
    cursor.execute("DELETE FROM orders")
    cursor.execute("DELETE FROM supplier_quality")
    cursor.execute("DELETE FROM contracts")
    cursor.execute("DELETE FROM production_schedule")
    cursor.execute("DELETE FROM risks")
    cursor.execute("DELETE FROM planning_cycles")
    
    # 1. Seeding Suppliers
    suppliers = [
        ("SUPPLIER_ABC", "Alloy Metal Corp", 0.96, 0.03, 0.98, "Preferred"),
        ("SUPPLIER_XYZ", "Plastix Industrial", 0.93, 0.05, 0.94, "Active"),
        ("SUPPLIER_LMN", "LogiParts Supply", 0.88, 0.08, 0.89, "Under Review"),
    ]
    cursor.executemany("""
        INSERT INTO supplier_quality (supplier_id, name, compliance_score, defect_rate, on_time_delivery, status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, suppliers)
    
    # 2. Seeding SKUs / Inventory
    skus = [
        ("SKU_STEEL_PANEL", "Reinforced Steel Panel", 120.0, 150.0, 50.0, 200.0, 1.5, 50.0, 25.0, 5, "Zone A-1", datetime.utcnow().isoformat()),
        ("SKU_PLASTIC_SHELL", "Polycarbonate Housing Shell", 80.0, 200.0, 75.0, 350.0, 0.5, 30.0, 8.0, 7, "Zone B-4", datetime.utcnow().isoformat()),
        ("SKU_CHIP_MODULE", "Microcontroller Hub Module", 45.0, 80.0, 30.0, 100.0, 3.0, 120.0, 75.0, 14, "Zone C-2", datetime.utcnow().isoformat()),
        ("SKU_CABLING_HARNESS", "High-Flex Cabling Harness", 300.0, 250.0, 100.0, 400.0, 0.2, 40.0, 4.5, 4, "Zone A-3", datetime.utcnow().isoformat())
    ]
    cursor.executemany("""
        INSERT INTO inventory (sku, name, quantity_on_hand, reorder_point, safety_stock, eoq, holding_cost, order_cost, unit_cost, lead_time_days, warehouse_location, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, skus)
    
    # 3. Seeding Contracts Text & Mock Vector embeddings for RAG
    contracts = [
        ("CON_ABC_01", "SUPPLIER_ABC", "Net 30", 5, 0.02, 150.0, 
         "Standard supply agreement for Alloy Metal Corp. Payment terms are strictly Net 30. Standard lead time is 5 days. Quality requirements state a compliance rate of 95% or higher. Defect penalty is 2% of batch value. Late delivery penalty is $150 per day.",
         json.dumps(mock_vector_embedding("Alloy Metal Corp Net 30 payment lead time 5 days defect penalty 2% late delivery penalty $150"))),
        ("CON_XYZ_01", "SUPPLIER_XYZ", "Net 45", 7, 0.04, 100.0,
         "Industrial supply contract for Plastix Industrial. Payment terms are Net 45. Delivery lead time is 7 business days. Acceptable compliance limit is 92%. Defect penalty is 4% of invoice. Late delivery penalty is $100 per delay day.",
         json.dumps(mock_vector_embedding("Plastix Industrial Net 45 payment lead time 7 days defect penalty 4% late delivery penalty $100"))),
        ("CON_LMN_01", "SUPPLIER_LMN", "Net 60", 14, 0.05, 50.0,
         "Parts acquisition contract with LogiParts Supply. Payment terms are Net 60 days. Standard lead time is 14 days due to overseas shipping. Quality target is 90% compliance. Defect penalty is 5%. Late delivery penalty is $50 per day.",
         json.dumps(mock_vector_embedding("LogiParts Supply Net 60 payment lead time 14 days defect penalty 5% late delivery penalty $50")))
    ]
    cursor.executemany("""
        INSERT INTO contracts (contract_id, supplier_id, payment_terms, lead_time_days, defect_penalty_pct, late_delivery_penalty, raw_text, embedding)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, contracts)
    
    # 4. Seeding 90 Days of Historical Orders (Demand)
    now = datetime.utcnow()
    historical_orders = []
    # Seed demand per SKU for the past 90 days
    sku_baselines = {
        "SKU_STEEL_PANEL": (30, 8),
        "SKU_PLASTIC_SHELL": (50, 15),
        "SKU_CHIP_MODULE": (15, 4),
        "SKU_CABLING_HARNESS": (70, 20)
    }
    
    random.seed(42)
    for day_offset in range(90, 0, -1):
        order_date = (now - timedelta(days=day_offset)).strftime("%Y-%m-%d")
        day_of_week = (now - timedelta(days=day_offset)).weekday()
        # Weekly seasonality multiplier (peaks on Tue/Wed, low on weekends)
        season_mult = 1.3 if day_of_week in [1, 2, 3] else (0.6 if day_of_week in [5, 6] else 1.0)
        
        for sku, (base, dev) in sku_baselines.items():
            quantity = int(max(0, random.normalvariate(base, dev) * season_mult))
            order_id = f"ORD_{sku}_{day_offset}"
            historical_orders.append((order_id, sku, order_date, quantity))
            
    cursor.executemany("""
        INSERT INTO orders (order_id, sku, order_date, quantity)
        VALUES (?, ?, ?, ?)
    """, historical_orders)
    
    # 5. Seeding Raw Materials Inspections (derived from history)
    raw_materials = []
    # Let's seed 30 past receipts
    for i in range(30):
        mat_id = f"MAT_{1000 + i}"
        supplier = random.choice(["SUPPLIER_ABC", "SUPPLIER_XYZ", "SUPPLIER_LMN"])
        sku = "SKU_STEEL_PANEL" if supplier == "SUPPLIER_ABC" else ("SKU_PLASTIC_SHELL" if supplier == "SUPPLIER_XYZ" else "SKU_CHIP_MODULE")
        received_date = (now - timedelta(days=random.randint(1, 45))).strftime("%Y-%m-%d %H:%M:%S")
        
        # Determine compliance based on supplier quality profile
        comp_prob = 0.96 if supplier == "SUPPLIER_ABC" else (0.92 if supplier == "SUPPLIER_XYZ" else 0.82)
        compliant = 1 if random.random() < comp_prob else 0
        quality_score = float(round(random.uniform(0.92, 1.0) if compliant else random.uniform(0.70, 0.90), 2))
        notes = "Meets specifications." if compliant else "Dimensional tolerances out of range."
        raw_materials.append((mat_id, supplier, sku, received_date, compliant, quality_score, notes))
        
    cursor.executemany("""
        INSERT INTO raw_materials (material_id, supplier_id, sku, received_date, specs_compliant, quality_score, inspection_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, raw_materials)
    
    # 6. Seeding Active & Historical Shipments
    shipments = [
        ("SHIP_001", "DHL_EXPRESS", "SKU_STEEL_PANEL", 150.0, "In Transit", 34.0522, -118.2437, "Warehouse East", (now + timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S"), None, (now - timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S")),
        ("SHIP_002", "FEDEX_CARGO", "SKU_PLASTIC_SHELL", 300.0, "Delayed", 29.7604, -95.3698, "Warehouse East", (now + timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S"), None, (now - timedelta(days=5)).strftime("%Y-%m-%d %H:%M:%S")),
        ("SHIP_003", "MAERSK_OCEAN", "SKU_CHIP_MODULE", 80.0, "In Transit", 20.0000, 110.0000, "Warehouse East", (now + timedelta(days=10)).strftime("%Y-%m-%d %H:%M:%S"), None, (now - timedelta(days=4)).strftime("%Y-%m-%d %H:%M:%S")),
        ("SHIP_004", "DHL_EXPRESS", "SKU_CABLING_HARNESS", 250.0, "Delivered", 40.7128, -74.0060, "Warehouse East", (now - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S"), (now - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S"), (now - timedelta(days=3)).strftime("%Y-%m-%d %H:%M:%S"))
    ]
    cursor.executemany("""
        INSERT INTO shipments (shipment_id, carrier, sku, quantity, status, current_latitude, current_longitude, destination, eta, actual_delivery, created_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, shipments)
    
    # 7. Seeding Historical Production Plan vs Actual
    production = []
    for day_offset in range(30, 0, -1):
        plan_date = (now - timedelta(days=day_offset)).strftime("%Y-%m-%d")
        for sku in ["SKU_STEEL_PANEL", "SKU_PLASTIC_SHELL"]:
            planned = random.choice([40, 50, 60])
            # 90-105% adherence
            adherence = random.uniform(0.85, 1.05) if random.random() > 0.05 else 0.50 # occasional bottleneck
            actual = int(planned * adherence)
            line = "LINE_01" if sku == "SKU_STEEL_PANEL" else "LINE_02"
            production.append((sku, plan_date, planned, actual, line))
            
    cursor.executemany("""
        INSERT INTO production_schedule (sku, plan_date, planned_output, actual_output, line_id)
        VALUES (?, ?, ?, ?, ?)
    """, production)
    
    conn.commit()
    conn.close()
    print("Database initialized and seeded successfully.")

def search_contract(query, supplier_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT raw_text, embedding FROM contracts WHERE supplier_id = ?", (supplier_id,))
    rows = cursor.fetchall()
    
    if not rows:
        conn.close()
        return None
        
    query_emb = mock_vector_embedding(query)
    results = []
    
    for row in rows:
        text = row['raw_text']
        emb = json.loads(row['embedding'])
        sim = cosine_similarity(query_emb, emb)
        results.append((sim, text))
        
    results.sort(reverse=True, key=lambda x: x[0])
    conn.close()
    
    return results[0][1] if results else None

if __name__ == "__main__":
    init_db()
    seed_data(force=True)
