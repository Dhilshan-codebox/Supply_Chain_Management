# agents/quality_agent.py
import pandas as pd
import numpy as np
from agents.base_agent import BaseSupplyChainAgent
from database import get_connection

class SupplierQualityAgent(BaseSupplyChainAgent):
    def __init__(self):
        super().__init__(
            agent_id="quality_agent",
            role="Monitor incoming material inspection reports, compile supplier scorecards, and flag compliance violations"
        )
        self.quality_threshold = 0.94  # Alert if a batch score falls below 94%

    def perceive(self, state: dict) -> dict:
        conn = get_connection()
        # Fetch recent inspections
        inspections_df = pd.read_sql_query(
            "SELECT material_id, supplier_id, sku, received_date, specs_compliant, quality_score, inspection_notes FROM raw_materials",
            conn
        )
        # Fetch current supplier scorecards
        suppliers_df = pd.read_sql_query(
            "SELECT supplier_id, name, compliance_score, defect_rate, on_time_delivery, status FROM supplier_quality",
            conn
        )
        conn.close()
        
        return {
            "inspections": inspections_df,
            "suppliers": suppliers_df.to_dict('records')
        }

    def decide(self, observations: dict) -> dict:
        inspections_df = observations["inspections"]
        suppliers = observations["suppliers"]
        
        alerts = []
        updated_scorecards = {}
        
        # 1. Identify non-compliant batches and low quality trends
        for index, row in inspections_df.iterrows():
            if row['specs_compliant'] == 0 or row['quality_score'] < self.quality_threshold:
                alerts.append({
                    "alert_type": "QUALITY_VIOLATION",
                    "material_id": row['material_id'],
                    "supplier_id": row['supplier_id'],
                    "sku": row['sku'],
                    "quality_score": row['quality_score'],
                    "notes": row['inspection_notes'],
                    "received_date": row['received_date']
                })
                
        # 2. Recalculate supplier quality scorecards based on aggregate history
        for sup in suppliers:
            sup_id = sup['supplier_id']
            sup_inspections = inspections_df[inspections_df['supplier_id'] == sup_id]
            
            if not sup_inspections.empty:
                avg_compliance = float(sup_inspections['specs_compliant'].mean())
                avg_quality = float(sup_inspections['quality_score'].mean())
                defect_rate = float(1.0 - avg_compliance)
                
                # Dynamic performance assessment
                if avg_quality >= 0.95:
                    status = "Preferred"
                elif avg_quality >= 0.90:
                    status = "Active"
                elif avg_quality >= 0.82:
                    status = "Under Review"
                else:
                    status = "Suspended"
            else:
                avg_compliance = sup['compliance_score']
                defect_rate = sup['defect_rate']
                status = sup['status']
                
            updated_scorecards[sup_id] = {
                "name": sup['name'],
                "compliance_score": float(round(avg_compliance, 3)),
                "defect_rate": float(round(defect_rate, 3)),
                "on_time_delivery": sup['on_time_delivery'], # Keep historical delivery rates for now
                "status": status
            }
            
        return {
            "alerts": alerts,
            "scorecards": updated_scorecards
        }

    def act(self, decision: dict, state: dict) -> bool:
        scorecards = decision["scorecards"]
        alerts = decision["alerts"]
        
        conn = get_connection()
        cursor = conn.cursor()
        
        try:
            # Update the supplier scorecards in DB
            for sup_id, card in scorecards.items():
                cursor.execute("""
                    UPDATE supplier_quality
                    SET compliance_score = ?,
                        defect_rate = ?,
                        status = ?
                    WHERE supplier_id = ?
                """, (card['compliance_score'], card['defect_rate'], card['status'], sup_id))
                
            conn.commit()
            self.logger.info("Supplier quality scorecards updated in database.")
            
            # Save to orchestrator state
            state["supplier_quality"] = {
                "scorecards": scorecards,
                "alerts": alerts
            }
            # Add to alerts list
            if "alerts" not in state:
                state["alerts"] = []
            state["alerts"].extend(alerts)
            
            return True
        except Exception as e:
            conn.rollback()
            self.logger.error(f"Failed to update supplier quality records: {str(e)}")
            return False
        finally:
            conn.close()
