# main.py
import os
import uvicorn
import asyncio
import random
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import Dict, Any, Optional

from database import init_db, seed_data, get_connection
from orchestration.orchestrator import SupplyChainOrchestrator

app = FastAPI(title="End-to-End Intelligent Supply Chain AI Platform")

# Dynamic state tracking overrides
current_overrides = {
    "service_level_z": 1.65,
    "weather_risk_multiplier": 1.0,
    "capacity_factor": 1.0,
    "geopolitical_risk_flag": "LOW",
    "market_growth_multiplier": 1.05,
    "simulation_speed": 5.0 # In seconds
}

# Instantiate the orchestrator
orchestrator = SupplyChainOrchestrator()

# Initialize directories
os.makedirs("templates", exist_ok=True)
os.makedirs("static/css", exist_ok=True)
os.makedirs("static/js", exist_ok=True)

# Schema for override updates
class OverrideParams(BaseModel):
    service_level_z: Optional[float] = None
    weather_risk_multiplier: Optional[float] = None
    capacity_factor: Optional[float] = None
    geopolitical_risk_flag: Optional[str] = None
    market_growth_multiplier: Optional[float] = None
    simulation_speed: Optional[float] = None

class OverrideProduction(BaseModel):
    sku: str
    date: str
    planned_output: float

async def live_simulation_loop():
    """Background simulation thread updating shipments and generating sales."""
    print("[SIMULATOR] Real-time supply chain simulator worker thread started.")
    dest_lat, dest_lon = 41.8781, -87.6298
    
    while True:
        try:
            # Check interval
            speed = current_overrides.get("simulation_speed", 5.0)
            if speed <= 0:
                await asyncio.sleep(2.0)
                continue
                
            await asyncio.sleep(speed)
            
            conn = get_connection()
            cursor = conn.cursor()
            
            # 1. Update Shipment Coordinates
            cursor.execute("SELECT shipment_id, carrier, sku, quantity, status, current_latitude, current_longitude FROM shipments WHERE status IN ('In Transit', 'Delayed')")
            active_shipments = [dict(r) for r in cursor.fetchall()]
            
            weather_mult = current_overrides.get("weather_risk_multiplier", 1.0)
            
            replan_needed = False
            for ship in active_shipments:
                ship_id = ship['shipment_id']
                lat = ship['current_latitude'] or 34.0522
                lon = ship['current_longitude'] or -118.2437
                
                lat_diff = dest_lat - lat
                lon_diff = dest_lon - lon
                dist = (lat_diff**2 + lon_diff**2)**0.5
                
                if dist < 0.6:
                    # Shipment arrives!
                    cursor.execute("""
                        UPDATE shipments
                        SET status = 'Delivered',
                            actual_delivery = ?,
                            current_latitude = ?,
                            current_longitude = ?
                        WHERE shipment_id = ?
                    """, (datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"), dest_lat, dest_lon, ship_id))
                    
                    # Update inventory: Add quantity to warehouse inventory
                    cursor.execute("""
                        UPDATE inventory
                        SET quantity_on_hand = quantity_on_hand + ?,
                            last_updated = ?
                        WHERE sku = ?
                    """, (ship['quantity'], datetime.utcnow().isoformat(), ship['sku']))
                    
                    # Add Quality Inspection record
                    mat_id = f"MAT_AUTO_{int(datetime.utcnow().timestamp())}_{random.randint(100, 999)}"
                    # High compliance standard
                    compliant = 1 if random.random() < 0.95 else 0
                    quality_score = float(round(random.uniform(0.93, 1.0) if compliant else random.uniform(0.70, 0.90), 2))
                    notes = "Incoming shipment inspected. Compliant." if compliant else "Batch failed tolerances."
                    cursor.execute("""
                        INSERT INTO raw_materials (material_id, supplier_id, sku, received_date, specs_compliant, quality_score, inspection_notes)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (mat_id, "SUPPLIER_ABC" if "STEEL" in ship['sku'] else ("SUPPLIER_XYZ" if "PLASTIC" in ship['sku'] else "SUPPLIER_LMN"), ship['sku'], datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"), compliant, quality_score, notes))
                    
                    replan_needed = True
                    print(f"[SIMULATOR] Shipment {ship_id} successfully delivered! {ship['quantity']} units added to inventory. QC inspection generated.")
                else:
                    # Move closer
                    step_size = 0.5 / max(1.0, weather_mult)
                    # Direction vectors
                    lat_step = (lat_diff / dist) * min(dist, step_size)
                    lon_step = (lon_diff / dist) * min(dist, step_size)
                    
                    new_lat = float(round(lat + lat_step, 4))
                    new_lon = float(round(lon + lon_step, 4))
                    
                    cursor.execute("""
                        UPDATE shipments
                        SET current_latitude = ?,
                            current_longitude = ?
                        WHERE shipment_id = ?
                    """, (new_lat, new_lon, ship_id))
                    
            # 2. Simulate Sales Order Arrivals
            # Choose a random SKU and sell some stock
            cursor.execute("SELECT sku, name, quantity_on_hand, reorder_point FROM inventory")
            inventory_items = [dict(r) for r in cursor.fetchall()]
            
            if inventory_items and random.random() < 0.40:
                sku_item = random.choice(inventory_items)
                sku = sku_item['sku']
                qty_on_hand = sku_item['quantity_on_hand']
                
                # Demand size
                order_qty = float(random.randint(5, 20))
                if qty_on_hand >= order_qty:
                    new_qty = qty_on_hand - order_qty
                    
                    # Update inventory
                    cursor.execute("""
                        UPDATE inventory
                        SET quantity_on_hand = ?,
                            last_updated = ?
                        WHERE sku = ?
                    """, (new_qty, datetime.utcnow().isoformat(), sku))
                    
                    # Insert Order Record
                    order_id = f"ORD_LIVE_{int(datetime.utcnow().timestamp())}"
                    order_date = datetime.utcnow().strftime("%Y-%m-%d")
                    cursor.execute("""
                        INSERT INTO orders (order_id, sku, order_date, quantity)
                        VALUES (?, ?, ?, ?)
                    """, (order_id, sku, order_date, order_qty))
                    
                    print(f"[SIMULATOR] Live sales order received: {order_qty} units of {sku}. Stock level updated to {new_qty}.")
                    
                    # If stock dropped below reorder point, trigger replan to auto-reorder!
                    if new_qty <= sku_item['reorder_point']:
                        replan_needed = True
                        print(f"[SIMULATOR] SKU {sku} quantity ({new_qty}) dropped below reorder point ({sku_item['reorder_point']}). Re-planning cycle queued.")

            conn.commit()
            conn.close()
            
            # Trigger agent re-planning if critical event occurred
            if replan_needed:
                print("[SIMULATOR] Critical event detected. Running multi-agent coordination loop...")
                orchestrator.run_cycle(current_overrides)
                
        except Exception as e:
            print(f"[SIMULATOR ERROR] Loop exception: {str(e)}")
            await asyncio.sleep(5.0)

@app.on_event("startup")
def startup_event():
    # Make sure SQLite schema is constructed and pre-seeded
    init_db()
    seed_data(force=False)
    # Run an initial cycle to populate state
    orchestrator.run_cycle(current_overrides)
    # Start live simulation background task
    asyncio.create_task(live_simulation_loop())

# ----------------- HTML Frontend Serving -----------------

@app.get("/", response_class=HTMLResponse)
async def serve_dashboard(request: Request):
    templates = Jinja2Templates(directory="templates")
    return templates.TemplateResponse(request, "index.html", {"overrides": current_overrides})

# ----------------- REST API Endpoints -----------------

@app.post("/api/v1/planning-cycle")
async def trigger_planning_cycle():
    """Trigger a new synchronized planning cycle across all agents."""
    try:
        result = orchestrator.run_cycle(current_overrides)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestration failure: {str(e)}")

@app.get("/api/v1/agents/status")
async def get_agents_status():
    """Returns the current status of all agents in the platform."""
    return {
        agent_id: {
            "status": agent.state.status,
            "last_action": agent.state.last_action,
            "timestamp": agent.state.timestamp,
            "role": agent.role
        }
        for agent_id, agent in orchestrator.agents.items()
    }

@app.get("/api/v1/forecast")
async def get_demand_forecast():
    """Returns 90-day demand forecast details per SKU."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT sku, forecast_date, forecast_value, confidence_lower, confidence_upper FROM demand_forecast ORDER BY forecast_date ASC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    # Format by SKU
    data = {}
    for r in rows:
        sku = r['sku']
        if sku not in data:
            data[sku] = []
        data[sku].append({
            "date": r['forecast_date'],
            "value": r['forecast_value'],
            "lower": r['confidence_lower'],
            "upper": r['confidence_upper']
        })
    return data

@app.get("/api/v1/inventory")
async def get_inventory_status():
    """Returns SKU current quantity, target levels, safety stock and reorder recommendations."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT sku, name, quantity_on_hand, reorder_point, safety_stock, eoq, holding_cost, order_cost, unit_cost, lead_time_days, warehouse_location, last_updated FROM inventory")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

@app.get("/api/v1/shipments")
async def get_shipments():
    """Returns details of all active and historical shipments."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT shipment_id, carrier, sku, quantity, status, current_latitude, current_longitude, destination, eta, actual_delivery, created_date FROM shipments ORDER BY created_date DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

@app.get("/api/v1/suppliers")
async def get_supplier_scorecards():
    """Returns scorecard ratings, compliance scores and defect rates per supplier."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT supplier_id, name, compliance_score, defect_rate, on_time_delivery, status FROM supplier_quality")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

@app.get("/api/v1/production-schedule")
async def get_production_schedule():
    """Returns 30-day scheduled output requirements."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT sku, plan_date, planned_output, actual_output, line_id FROM production_schedule ORDER BY plan_date ASC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    # Format by SKU
    data = {}
    for r in rows:
        sku = r['sku']
        if sku not in data:
            data[sku] = []
        data[sku].append({
            "date": r['plan_date'],
            "planned_output": r['planned_output'],
            "actual_output": r['actual_output'],
            "line_id": r['line_id']
        })
    return data

@app.get("/api/v1/risks")
async def get_risks():
    """Returns the consolidated supply chain risk matrix details."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT risk_id, type, severity, details, mitigation, timestamp FROM risks ORDER BY severity DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

@app.post("/api/v1/override/parameters")
async def update_parameters(params: OverrideParams):
    """Override general orchestrator thresholds and variables."""
    global current_overrides
    if params.service_level_z is not None:
        current_overrides["service_level_z"] = params.service_level_z
    if params.weather_risk_multiplier is not None:
        current_overrides["weather_risk_multiplier"] = params.weather_risk_multiplier
    if params.capacity_factor is not None:
        current_overrides["capacity_factor"] = params.capacity_factor
    if params.geopolitical_risk_flag is not None:
        current_overrides["geopolitical_risk_flag"] = params.geopolitical_risk_flag
    if params.market_growth_multiplier is not None:
        current_overrides["market_growth_multiplier"] = params.market_growth_multiplier
        
    return {"status": "parameters updated", "current_overrides": current_overrides}

@app.post("/api/v1/override/production-plan")
async def override_production_plan(override: OverrideProduction):
    """Allows planning supervisors to override specific SKU line schedules."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT OR REPLACE INTO production_schedule (sku, plan_date, planned_output, actual_output, line_id)
            VALUES (
                ?, ?, ?, 
                COALESCE((SELECT actual_output FROM production_schedule WHERE sku = ? AND plan_date = ?), 0.0),
                COALESCE((SELECT line_id FROM production_schedule WHERE sku = ? AND plan_date = ?), 'LINE_GEN')
            )
        """, (override.sku, override.date, override.planned_output, override.sku, override.date, override.sku, override.date))
        conn.commit()
        return {"status": "production plan overridden successfully", "details": override}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to apply override: {str(e)}")
    finally:
        conn.close()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)
