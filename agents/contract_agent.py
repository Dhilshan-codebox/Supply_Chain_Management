# agents/contract_agent.py
import re
import json
from agents.base_agent import BaseSupplyChainAgent
from database import get_connection, search_contract

class ContractIntelligenceAgent(BaseSupplyChainAgent):
    def __init__(self):
        super().__init__(
            agent_id="contract_agent",
            role="Analyze supplier contracts, extract terms, and assess compliance risks"
        )

    def perceive(self, state: dict) -> dict:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT contract_id, supplier_id, payment_terms, lead_time_days, defect_penalty_pct, late_delivery_penalty, raw_text FROM contracts")
        contracts = [dict(row) for row in cursor.fetchall()]
        
        # Fetch current supplier compliance metrics to evaluate risks
        cursor.execute("SELECT supplier_id, compliance_score, defect_rate, on_time_delivery FROM supplier_quality")
        suppliers = {row['supplier_id']: dict(row) for row in cursor.fetchall()}
        conn.close()
        
        return {
            "contracts": contracts,
            "suppliers": suppliers
        }

    def decide(self, observations: dict) -> dict:
        contracts = observations["contracts"]
        suppliers = observations["suppliers"]
        
        extractions = {}
        
        for con in contracts:
            sup_id = con['supplier_id']
            text = con['raw_text']
            
            # Simulated NLP term extraction from raw_text
            payment_terms = con['payment_terms']
            lead_time = con['lead_time_days']
            defect_penalty = con['defect_penalty_pct']
            late_penalty = con['late_delivery_penalty']
            
            # Simple heuristic regex searches to simulate RAG extraction
            payment_match = re.search(r"Net \d+", text, re.IGNORECASE)
            if payment_match:
                payment_terms = payment_match.group(0)
                
            lead_match = re.search(r"lead time is (\d+) days", text, re.IGNORECASE)
            if lead_match:
                lead_time = int(lead_match.group(1))

            # Risk calculation: compare contract SLAs to actual performance
            sup_perf = suppliers.get(sup_id, {"compliance_score": 1.0, "defect_rate": 0.0, "on_time_delivery": 1.0})
            
            risk_reasons = []
            risk_score = 0.0
            
            # Risk 1: Actual defect rate exceeds contract limits
            if sup_perf['defect_rate'] > defect_penalty:
                risk_score += 0.3
                risk_reasons.append(f"Supplier defect rate ({sup_perf['defect_rate']:.1%}) exceeds contracted limit.")
                
            # Risk 2: On-time delivery is low
            if sup_perf['on_time_delivery'] < 0.90:
                risk_score += 0.4
                risk_reasons.append(f"On-time delivery ({sup_perf['on_time_delivery']:.1%}) is significantly below standards.")
                
            # Risk 3: Stringent penalty terms in place for a low-performance supplier
            if late_penalty > 100.0 and sup_perf['on_time_delivery'] < 0.93:
                risk_score += 0.2
                risk_reasons.append("High late-delivery penalty combined with low delivery reliability.")

            extractions[sup_id] = {
                "contract_id": con['contract_id'],
                "extracted_payment_terms": payment_terms,
                "contracted_lead_time": lead_time,
                "defect_penalty_rate": defect_penalty,
                "late_penalty_daily": late_penalty,
                "risk_score": float(round(min(1.0, risk_score), 2)),
                "risk_reasons": risk_reasons,
                "terms_summary": f"Payment: {payment_terms} | Lead Time: {lead_time}d | Defect Penalty: {defect_penalty:.1%}"
            }
            
        return {"contract_extractions": extractions}

    def act(self, decision: dict, state: dict) -> bool:
        extractions = decision["contract_extractions"]
        
        # Save contract analysis to state
        state["contracts"] = extractions
        
        # Add high-risk contract warnings to the alerts list
        if "alerts" not in state:
            state["alerts"] = []
            
        for sup_id, data in extractions.items():
            if data['risk_score'] >= 0.5:
                state["alerts"].append({
                    "alert_type": "CONTRACT_RISK",
                    "supplier_id": sup_id,
                    "contract_id": data['contract_id'],
                    "risk_score": data['risk_score'],
                    "notes": "; ".join(data['risk_reasons'])
                })
                self.logger.warning(f"High risk detected on contract {data['contract_id']} for {sup_id}: {data['risk_reasons']}")
                
        return True
