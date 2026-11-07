# agents/risk_agent.py
import pandas as pd
import numpy as np
from datetime import datetime
from agents.base_agent import BaseSupplyChainAgent
from database import get_connection

class RiskAgent(BaseSupplyChainAgent):
    def __init__(self):
        super().__init__(
            agent_id="risk_agent",
            role="Monitor comprehensive supply chain risks and compile the central risk index"
        )

    def perceive(self, state: dict) -> dict:
        conn = get_connection()
        # Fetch inventory holding costs & on hand quantities
        inventory_df = pd.read_sql_query("SELECT sku, name, quantity_on_hand, reorder_point, unit_cost, lead_time_days FROM inventory", conn)
        # Fetch supplier contracts
        contracts_df = pd.read_sql_query("SELECT supplier_id, payment_terms FROM contracts", conn)
        # Fetch historical orders to analyze concentration
        orders_df = pd.read_sql_query("SELECT sku, quantity FROM orders", conn)
        conn.close()
        
        # Get active alerts compiled from other agents so far in this run
        active_alerts = state.get("alerts", [])
        
        return {
            "inventory": inventory_df.to_dict('records'),
            "contracts": contracts_df.to_dict('records'),
            "historical_orders": orders_df,
            "active_alerts": active_alerts,
            "geopolitical_risk_flag": state.get("overrides", {}).get("geopolitical_risk_flag", "LOW")
        }

    def decide(self, observations: dict) -> dict:
        inventory = observations["inventory"]
        contracts = observations["contracts"]
        orders = observations["historical_orders"]
        alerts = observations["active_alerts"]
        geopolitical_level = observations["geopolitical_risk_flag"]
        
        risks = []
        
        # 1. Supplier Concentration Risk
        # Count contracts or transaction shares
        total_suppliers = len(contracts)
        if total_suppliers > 0:
            supplier_counts = {}
            for c in contracts:
                supplier_counts[c['supplier_id']] = supplier_counts.get(c['supplier_id'], 0) + 1
            max_share = max(supplier_counts.values()) / total_suppliers
            
            if max_share > 0.49: # More than half from one supplier
                risks.append({
                    "risk_id": "RSK_SUP_CONC",
                    "type": "SUPPLIER_CONCENTRATION",
                    "severity": "HIGH",
                    "details": f"Single supplier dominates {max_share:.0%} of active supply contracts.",
                    "mitigation": "Initiate sourcing cycles to onboard backup secondary suppliers for core raw materials."
                })
        
        # 2. Stockout Risk (based on active inventory and reorder points)
        stockout_skus = []
        excess_skus = []
        for item in inventory:
            sku = item['sku']
            qty = item['quantity_on_hand']
            rop = item['reorder_point']
            
            if qty <= 0:
                stockout_skus.append(sku)
            elif qty < rop * 0.5:
                # Critical low inventory
                stockout_skus.append(sku)
            elif qty > rop * 4.0:
                # Bloated inventory
                excess_skus.append(sku)
                
        if stockout_skus:
            risks.append({
                "risk_id": f"RSK_STOCKOUT_{int(datetime.utcnow().timestamp())}",
                "type": "STOCKOUT_ALERT",
                "severity": "CRITICAL",
                "details": f"Critical low inventory or active stockout on SKUs: {', '.join(stockout_skus)}.",
                "mitigation": "Expedite active shipments and prioritize production line runs for affected SKUs."
            })
            
        if excess_skus:
            risks.append({
                "risk_id": f"RSK_EXCESS_{int(datetime.utcnow().timestamp())}",
                "type": "INVENTORY_BLOAT",
                "severity": "MEDIUM",
                "details": f"Excess inventory holding costs accumulating on SKUs: {', '.join(excess_skus)}.",
                "mitigation": "Hold purchase orders and schedule markdown promotions to improve inventory turns."
            })
            
        # 3. Quality Violations Count Risk
        quality_violations = [a for a in alerts if a['alert_type'] == 'QUALITY_VIOLATION']
        if len(quality_violations) >= 2:
            risks.append({
                "risk_id": "RSK_QUAL_TREND",
                "type": "SUPPLIER_QUALITY_DEGRADATION",
                "severity": "HIGH",
                "details": f"Multiple raw material quality inspection failures ({len(quality_violations)} batches) detected recently.",
                "mitigation": "Issue corrective action request (CAR) to quality control team and freeze non-essential orders."
            })

        # 4. Geopolitical Risk
        if geopolitical_level in ["MEDIUM", "HIGH", "CRITICAL"]:
            severity = "CRITICAL" if geopolitical_level == "CRITICAL" else "HIGH"
            risks.append({
                "risk_id": "RSK_GEO_POL",
                "type": "GEOPOLITICAL_DISRUPTION",
                "severity": severity,
                "details": f"Geopolitical risk alerts active in shipping corridors. Flag: {geopolitical_level}.",
                "mitigation": "Reroute ocean lanes around affected zones and increase safety stock targets by 20%."
            })

        return {"risks": risks}

    def act(self, decision: dict, state: dict) -> bool:
        risks = decision["risks"]
        conn = get_connection()
        cursor = conn.cursor()
        
        try:
            # Wipe historical risks to keep it clean, or update current risks
            cursor.execute("DELETE FROM risks")
            
            # Store fresh risks
            for r in risks:
                cursor.execute("""
                    INSERT INTO risks (risk_id, type, severity, details, mitigation, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (r['risk_id'], r['type'], r['severity'], r['details'], r['mitigation'], datetime.utcnow().isoformat()))
                
            conn.commit()
            self.logger.info(f"Risk matrix updated in database. Saved {len(risks)} active system risks.")
            
            # Update state
            state["risks"] = risks
            
            # Add to alerts list
            if "alerts" not in state:
                state["alerts"] = []
                
            for r in risks:
                state["alerts"].append({
                    "alert_type": "RISK_ALERT",
                    "severity": r['severity'],
                    "type": r['type'],
                    "notes": r['details'],
                    "mitigation": r['mitigation']
                })
                
            return True
        except Exception as e:
            conn.rollback()
            self.logger.error(f"Failed to save risks in DB: {str(e)}")
            return False
        finally:
            conn.close()
