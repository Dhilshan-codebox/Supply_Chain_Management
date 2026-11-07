# agents/production_agent.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from agents.base_agent import BaseSupplyChainAgent
from database import get_connection

class ProductionSchedulingAgent(BaseSupplyChainAgent):
    def __init__(self):
        super().__init__(
            agent_id="production_agent",
            role="Schedule production output to satisfy forecasted demand and safety stocks, optimizing line utilization"
        )
        self.scheduling_horizon = 30  # days

    def perceive(self, state: dict) -> dict:
        conn = get_connection()
        # Fetch current inventory details
        inventory_df = pd.read_sql_query(
            "SELECT sku, quantity_on_hand, safety_stock FROM inventory", 
            conn
        )
        conn.close()

        # Demand forecast from previous stage (daily forecast values for 30 days)
        demand_forecast = state.get("demand_forecast", {})
        
        # Line configurations
        # Line 01 handles Panel, Line 02 handles Shell
        line_configs = {
            "SKU_STEEL_PANEL": {"line_id": "LINE_01", "max_daily_capacity": 80.0, "unit_prod_time_hours": 0.1},
            "SKU_PLASTIC_SHELL": {"line_id": "LINE_02", "max_daily_capacity": 120.0, "unit_prod_time_hours": 0.06},
            "SKU_CHIP_MODULE": {"line_id": "LINE_03", "max_daily_capacity": 50.0, "unit_prod_time_hours": 0.15},
            "SKU_CABLING_HARNESS": {"line_id": "LINE_04", "max_daily_capacity": 200.0, "unit_prod_time_hours": 0.04}
        }
        
        # Override capacity from state if present
        capacity_factor = state.get("overrides", {}).get("capacity_factor", 1.0)
        for sku in line_configs:
            line_configs[sku]["max_daily_capacity"] *= capacity_factor

        return {
            "inventory": inventory_df.to_dict('records'),
            "demand_forecast": demand_forecast,
            "line_configs": line_configs
        }

    def decide(self, observations: dict) -> dict:
        inventory = observations["inventory"]
        forecasts = observations["demand_forecast"]
        line_configs = observations["line_configs"]

        schedule = {}
        projected_utilization = {}
        
        start_date = datetime.utcnow().date() + timedelta(days=1)
        
        for item in inventory:
            sku = item['sku']
            qty = item['quantity_on_hand']
            safety_stock = item['safety_stock']
            
            if sku not in line_configs:
                continue
                
            cfg = line_configs[sku]
            line_id = cfg['line_id']
            max_cap = cfg['max_daily_capacity']
            unit_time = cfg['unit_prod_time_hours']
            
            sku_forecasts = forecasts.get(sku, [])
            
            # Index forecasts by date
            forecast_dict = {f['date']: f['value'] for f in sku_forecasts}
            
            sku_schedule = []
            current_projected_inv = qty
            total_capacity_used = 0.0
            
            for day_idx in range(self.scheduling_horizon):
                current_date_str = (start_date + timedelta(days=day_idx)).strftime("%Y-%m-%d")
                daily_demand = forecast_dict.get(current_date_str, 15.0)
                
                # Check for deficit below safety stock
                net_inv_before_prod = current_projected_inv - daily_demand
                
                planned_prod = 0.0
                if net_inv_before_prod < safety_stock:
                    # Determine how much to produce to restore safety stock
                    deficit = safety_stock - net_inv_before_prod
                    # Constrained by maximum daily production line capacity
                    planned_prod = float(round(min(deficit, max_cap), 2))
                    
                # Update projected inventory for next day
                current_projected_inv = net_inv_before_prod + planned_prod
                
                # Calculate hours utilized
                hours_used = planned_prod * unit_time
                total_capacity_used += hours_used
                
                sku_schedule.append({
                    "date": current_date_str,
                    "planned_output": planned_prod,
                    "projected_inventory": float(round(current_projected_inv, 2)),
                    "line_id": line_id,
                    "hours_used": float(round(hours_used, 2))
                })
                
            # Average daily capacity utilization (max capacity = 8 hours per day)
            avg_utilization = float(round((total_capacity_used / (self.scheduling_horizon * 8.0)) * 100, 2))
            
            schedule[sku] = sku_schedule
            projected_utilization[line_id] = avg_utilization
            
        return {
            "production_schedule": schedule,
            "line_utilization": projected_utilization
        }

    def act(self, decision: dict, state: dict) -> bool:
        schedule = decision["production_schedule"]
        conn = get_connection()
        cursor = conn.cursor()
        
        try:
            # We don't want to wipe all production history, but we do want to wipe future plans.
            # Wipe plans starting tomorrow
            tomorrow_str = (datetime.utcnow().date() + timedelta(days=1)).strftime("%Y-%m-%d")
            cursor.execute("DELETE FROM production_schedule WHERE plan_date >= ?", (tomorrow_str,))
            
            # Insert new production plan
            for sku, daily_plans in schedule.items():
                for p in daily_plans:
                    cursor.execute("""
                        INSERT OR REPLACE INTO production_schedule (sku, plan_date, planned_output, actual_output, line_id)
                        VALUES (?, ?, ?, ?, ?)
                    """, (sku, p['date'], p['planned_output'], 0.0, p['line_id'])) # Actual output starts as 0.0 for future plans
                    
            conn.commit()
            self.logger.info("Production schedule written to database successfully.")
            
            # Update state with schedule details
            state["production_plan"] = decision
            return True
        except Exception as e:
            conn.rollback()
            self.logger.error(f"Failed to update production schedule in DB: {str(e)}")
            return False
        finally:
            conn.close()
