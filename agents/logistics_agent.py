# agents/logistics_agent.py
import pandas as pd
import numpy as np
from datetime import datetime
from agents.base_agent import BaseSupplyChainAgent
from database import get_connection

class LogisticsAgent(BaseSupplyChainAgent):
    def __init__(self):
        super().__init__(
            agent_id="logistics_agent",
            role="Track active shipments, predict delivery delay risks, and suggest logistic routing adjustments"
        )
        self.delay_probability_threshold = 0.30

    def perceive(self, state: dict) -> dict:
        conn = get_connection()
        # Fetch active shipments (excluding delivered ones)
        shipments_df = pd.read_sql_query(
            "SELECT shipment_id, carrier, sku, quantity, status, current_latitude, current_longitude, destination, eta, created_date FROM shipments WHERE status != 'Delivered'",
            conn
        )
        # Fetch carrier historical performance metrics
        carriers_df = pd.read_sql_query(
            "SELECT supplier_id, name, compliance_score, defect_rate, on_time_delivery FROM supplier_quality",
            conn
        )
        conn.close()

        # Simulated weather risk from state (e.g., storm multiplier)
        weather_risk_mult = state.get("overrides", {}).get("weather_risk_multiplier", 1.0)
        
        return {
            "shipments": shipments_df.to_dict('records'),
            "carriers": carriers_df.to_dict('records'),
            "weather_risk_mult": weather_risk_mult
        }

    def decide(self, observations: dict) -> dict:
        shipments = observations["shipments"]
        carriers = {c['supplier_id']: c for c in observations["carriers"]} # Maps ID -> info
        weather_mult = observations["weather_risk_mult"]
        
        alerts = []
        shipment_assessments = {}
        
        # Coordinates for destination "Warehouse East" (assumed central warehouse in Chicago area)
        dest_lat, dest_lon = 41.8781, -87.6298
        
        for ship in shipments:
            ship_id = ship['shipment_id']
            status = ship['status']
            carrier = ship['carrier']
            
            # Simple distance calculation to destination (haversine approximation)
            lat = ship['current_latitude']
            lon = ship['current_longitude']
            
            # If coordinates are None, set defaults
            if lat is None: lat = 34.0522 # Los Angeles default
            if lon is None: lon = -118.2437
                
            dist = float(np.sqrt((lat - dest_lat)**2 + (lon - dest_lon)**2))
            
            # Carrier reliability factor (carrier name is mapped to LMN logs if matched)
            carrier_reliability = 0.95
            if carrier == "DHL_EXPRESS":
                carrier_reliability = 0.96
            elif carrier == "FEDEX_CARGO":
                carrier_reliability = 0.93
            elif carrier == "MAERSK_OCEAN":
                carrier_reliability = 0.84
                
            # Base delay probability
            base_delay_prob = (1.0 - carrier_reliability)
            
            # Adjust delay probability based on distance and status
            status_risk = 0.4 if status == "Delayed" else 0.05
            distance_risk = min(0.3, dist / 50.0) # farther is higher risk
            
            delay_prob = float(round((base_delay_prob + status_risk + distance_risk) * weather_mult, 3))
            delay_prob = min(1.0, max(0.0, delay_prob))
            
            # Estimate delay hours
            estimated_delay_hours = 0.0
            if delay_prob > self.delay_probability_threshold:
                estimated_delay_hours = float(round(delay_prob * 48.0, 1)) # up to 48 hours delay
                
            action = "KEEP_ROUTE"
            details = "On schedule."
            
            if delay_prob > 0.6:
                action = "REROUTE"
                details = "High delay probability. Suggesting emergency rail or alternative hub bypass."
            elif delay_prob > self.delay_probability_threshold:
                action = "EXPEDITE"
                details = "Moderate delay risk. Suggesting air freight upgrade request or priority lane."

            assessment = {
                "carrier": carrier,
                "sku": ship['sku'],
                "quantity": ship['quantity'],
                "delay_probability": delay_prob,
                "estimated_delay_hours": estimated_delay_hours,
                "recommended_action": action,
                "action_details": details,
                "current_eta": ship['eta']
            }
            
            shipment_assessments[ship_id] = assessment
            
            if delay_prob > self.delay_probability_threshold:
                alerts.append({
                    "alert_type": "LOGISTICS_DELAY",
                    "shipment_id": ship_id,
                    "carrier": carrier,
                    "delay_probability": delay_prob,
                    "estimated_delay_hours": estimated_delay_hours,
                    "notes": f"Status: {status}. Route Action: {action}. Details: {details}."
                })
                
        return {
            "shipments": shipment_assessments,
            "alerts": alerts
        }

    def act(self, decision: dict, state: dict) -> bool:
        shipments = decision["shipments"]
        alerts = decision["alerts"]
        
        conn = get_connection()
        cursor = conn.cursor()
        
        try:
            # For shipments flagged as Delayed, update their status in the DB
            for ship_id, assess in shipments.items():
                if assess['delay_probability'] > 0.5:
                    cursor.execute("""
                        UPDATE shipments
                        SET status = 'Delayed'
                        WHERE shipment_id = ? AND status = 'In Transit'
                    """, (ship_id,))
                    
            conn.commit()
            self.logger.info("Logistics delay assessments updated.")
            
            # Save into orchestrator state
            state["shipment_status"] = shipments
            
            # Add to alerts list
            if "alerts" not in state:
                state["alerts"] = []
            state["alerts"].extend(alerts)
            
            return True
        except Exception as e:
            conn.rollback()
            self.logger.error(f"Failed to update logistics shipments in DB: {str(e)}")
            return False
        finally:
            conn.close()
