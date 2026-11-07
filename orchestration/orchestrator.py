# orchestration/orchestrator.py
import json
import logging
from datetime import datetime
from database import get_connection
from agents.demand_agent import DemandForecastingAgent
from agents.inventory_agent import InventoryOptimizationAgent
from agents.quality_agent import SupplierQualityAgent
from agents.contract_agent import ContractIntelligenceAgent
from agents.production_agent import ProductionSchedulingAgent
from agents.logistics_agent import LogisticsAgent
from agents.risk_agent import RiskAgent

class SupplyChainOrchestrator:
    def __init__(self):
        self.logger = logging.getLogger("orchestrator")
        # Instantiate the 7 agents
        self.agents = {
            "demand_agent": DemandForecastingAgent(),
            "inventory_agent": InventoryOptimizationAgent(),
            "quality_agent": SupplierQualityAgent(),
            "contract_agent": ContractIntelligenceAgent(),
            "production_agent": ProductionSchedulingAgent(),
            "logistics_agent": LogisticsAgent(),
            "risk_agent": RiskAgent()
        }

    def run_cycle(self, overrides: dict = None) -> dict:
        """Executes a complete coordinated planning cycle across all agents."""
        self.logger.info("Initializing new Supply Chain planning cycle...")
        
        # Initial shared state
        state = {
            "demand_forecast": {},
            "inventory_status": {},
            "supplier_quality": {},
            "contracts": {},
            "production_plan": {},
            "shipment_status": {},
            "risks": [],
            "alerts": [],
            "timestamp": datetime.utcnow().isoformat(),
            "overrides": overrides or {}
        }

        # DAG-like sequential execution flow
        # 1. Demand Agent: Forecast demand
        self.logger.info("Executing Demand Forecasting Agent...")
        demand_result = self.agents["demand_agent"].run_cycle(state)
        
        # 2. Inventory Agent: Calculate replenishment parameters and recommendations
        self.logger.info("Executing Inventory Optimization Agent...")
        inventory_result = self.agents["inventory_agent"].run_cycle(state)
        
        # 3. Quality Agent: Audit supplier inspections
        self.logger.info("Executing Supplier Quality Agent...")
        quality_result = self.agents["quality_agent"].run_cycle(state)
        
        # 4. Contract Agent: Parse agreements and terms
        self.logger.info("Executing Contract Intelligence Agent...")
        contract_result = self.agents["contract_agent"].run_cycle(state)
        
        # 5. Production Agent: Schedule manufacturing lines
        self.logger.info("Executing Production Scheduling Agent...")
        production_result = self.agents["production_agent"].run_cycle(state)
        
        # 6. Logistics Agent: Evaluate shipment tracking delays
        self.logger.info("Executing Logistics Agent...")
        logistics_result = self.agents["logistics_agent"].run_cycle(state)
        
        # 7. Risk Agent: Synthesize vulnerabilities into Risk Heat Map
        self.logger.info("Executing Risk Detection Agent...")
        risk_result = self.agents["risk_agent"].run_cycle(state)

        # Persistence of Cycle logs
        conn = get_connection()
        cursor = conn.cursor()
        
        cycle_id = f"CYC_{int(datetime.utcnow().timestamp())}"
        state_serialized = json.dumps(state)
        
        try:
            cursor.execute("""
                INSERT INTO planning_cycles (cycle_id, timestamp, state_json)
                VALUES (?, ?, ?)
            """, (cycle_id, state["timestamp"], state_serialized))
            conn.commit()
            self.logger.info(f"Planning cycle {cycle_id} written to database logs.")
        except Exception as e:
            conn.rollback()
            self.logger.error(f"Failed to write planning cycle logs to DB: {str(e)}")
        finally:
            conn.close()

        # Return consolidated state
        return {
            "cycle_id": cycle_id,
            "status": "success",
            "timestamp": state["timestamp"],
            "data": state
        }
