# agents/inventory_agent.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from agents.base_agent import BaseSupplyChainAgent
from database import get_connection

class InventoryOptimizationAgent(BaseSupplyChainAgent):
    def __init__(self):
        super().__init__(
            agent_id="inventory_agent",
            role="Optimize inventory levels by calculating EOQ, safety stock, and reorder points"
        )

    def perceive(self, state: dict) -> dict:
        conn = get_connection()
        # Fetch current inventory details
        inventory_df = pd.read_sql_query(
            "SELECT sku, name, quantity_on_hand, reorder_point, safety_stock, eoq, holding_cost, order_cost, unit_cost, lead_time_days FROM inventory",
            conn
        )
        # Fetch actual historical orders to compute standard deviation of demand
        orders_df = pd.read_sql_query(
            "SELECT sku, quantity FROM orders WHERE order_date > date('now', '-90 days')",
            conn
        )
        conn.close()

        # Demand forecast from previous stage
        demand_forecast = state.get("demand_forecast", {})
        
        # Service level multiplier override from state if present (default to 95% = 1.65)
        service_level_z = state.get("overrides", {}).get("service_level_z", 1.65)
        
        return {
            "inventory": inventory_df.to_dict('records'),
            "historical_orders": orders_df,
            "demand_forecast": demand_forecast,
            "service_level_z": service_level_z
        }

    def decide(self, observations: dict) -> dict:
        inventory = observations["inventory"]
        orders_df = observations["historical_orders"]
        forecasts = observations["demand_forecast"]
        z = observations["service_level_z"]

        recommendations = {}

        for item in inventory:
            sku = item['sku']
            qty = item['quantity_on_hand']
            lead_time = item['lead_time_days']
            holding_cost = item['holding_cost']
            order_cost = item['order_cost']

            # 1. Fetch forecast demand for this SKU
            sku_forecast = forecasts.get(sku, [])
            if sku_forecast:
                # Average daily forecast demand
                forecast_vals = [f['value'] for f in sku_forecast]
                avg_daily_demand = np.mean(forecast_vals)
            else:
                # Fallback to historical daily average
                sku_orders = orders_df[orders_df['sku'] == sku]
                avg_daily_demand = sku_orders['quantity'].mean() if not sku_orders.empty else 10.0

            # Annualized demand (D)
            annual_demand = avg_daily_demand * 365.0

            # 2. Calculate EOQ
            # EOQ = sqrt( (2 * D * S) / H )
            if holding_cost > 0:
                eoq = float(np.sqrt((2 * annual_demand * order_cost) / holding_cost))
            else:
                eoq = item['eoq']
            eoq = float(round(max(1.0, eoq), 2))

            # 3. Calculate Safety Stock
            # Safety Stock = Z * std_dev(daily_demand) * sqrt(lead_time)
            sku_orders = orders_df[orders_df['sku'] == sku]
            if not sku_orders.empty and len(sku_orders) > 1:
                # Standard deviation of demand
                demand_std = sku_orders['quantity'].std()
            else:
                demand_std = 5.0
            
            if pd.isna(demand_std) or demand_std == 0:
                demand_std = 3.0

            safety_stock = float(round(z * demand_std * np.sqrt(lead_time), 2))

            # 4. Calculate Reorder Point (ROP)
            # ROP = (Average Daily Demand * Lead Time) + Safety Stock
            rop = float(round((avg_daily_demand * lead_time) + safety_stock, 2))

            # 5. Determine Replenishment Action
            # If quantity on hand is less than or equal to ROP, order EOQ
            if qty <= rop:
                action = "REORDER"
                order_qty = eoq
            else:
                action = "HOLD"
                order_qty = 0.0

            recommendations[sku] = {
                "name": item['name'],
                "current_quantity": qty,
                "calculated_safety_stock": safety_stock,
                "calculated_reorder_point": rop,
                "calculated_eoq": eoq,
                "action": action,
                "order_quantity": order_qty,
                "unit_cost": item['unit_cost']
            }

        return {"inventory_recommendations": recommendations}

    def act(self, decision: dict, state: dict) -> bool:
        recommendations = decision["inventory_recommendations"]
        conn = get_connection()
        cursor = conn.cursor()

        try:
            # Update the inventory table with the optimized values
            for sku, rec in recommendations.items():
                cursor.execute("""
                    UPDATE inventory
                    SET safety_stock = ?,
                        reorder_point = ?,
                        eoq = ?,
                        last_updated = ?
                    WHERE sku = ?
                """, (
                    rec['calculated_safety_stock'],
                    rec['calculated_reorder_point'],
                    rec['calculated_eoq'],
                    datetime.utcnow().isoformat(),
                    sku
                ))

                # If action is REORDER, insert a new shipment as 'Shipped' or 'In Transit' to represent the order creation
                if rec['action'] == "REORDER":
                    shipment_id = f"SHIP_AUTO_{int(datetime.utcnow().timestamp())}_{random_string(4)}"
                    # Randomize a carrier
                    carrier = np.random.choice(["DHL_EXPRESS", "FEDEX_CARGO", "MAERSK_OCEAN"])
                    # Standard ETA is today + lead time
                    eta = (datetime.utcnow() + timedelta(days=5)).strftime("%Y-%m-%d %H:%M:%S")
                    cursor.execute("""
                        INSERT INTO shipments (shipment_id, carrier, sku, quantity, status, current_latitude, current_longitude, destination, eta, actual_delivery, created_date)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        shipment_id,
                        carrier,
                        sku,
                        rec['order_quantity'],
                        "In Transit",
                        34.0522,  # Start latitude
                        -118.2437, # Start longitude
                        "Warehouse East",
                        eta,
                        None,
                        datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
                    ))
                    self.logger.info(f"Automatically triggered reorder shipment {shipment_id} for {rec['order_quantity']} units of {sku}")

            conn.commit()
            self.logger.info("Inventory parameters updated in database successfully.")
            
            # Save into orchestrator state
            state["inventory_status"] = recommendations
            return True
        except Exception as e:
            conn.rollback()
            self.logger.error(f"Failed to update inventory status: {str(e)}")
            return False
        finally:
            conn.close()

def random_string(length=4):
    import random
    import string
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
