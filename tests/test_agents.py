# tests/test_agents.py
import pytest
import os
import pandas as pd
import numpy as np
from datetime import datetime

from database import init_db, seed_data, get_connection
from agents.base_agent import AgentState
from agents.demand_agent import DemandForecastingAgent
from agents.inventory_agent import InventoryOptimizationAgent
from agents.quality_agent import SupplierQualityAgent
from agents.contract_agent import ContractIntelligenceAgent
from agents.production_agent import ProductionSchedulingAgent
from agents.logistics_agent import LogisticsAgent
from agents.risk_agent import RiskAgent
from orchestration.orchestrator import SupplyChainOrchestrator

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    # Setup test database
    init_db()
    seed_data(force=True)
    yield
    # Clean up test database if required (we can keep it for manual inspection too)
    if os.path.exists("supply_chain.db"):
        pass

def test_demand_forecasting_agent():
    agent = DemandForecastingAgent()
    assert agent.agent_id == "demand_agent"
    
    state = {"overrides": {"market_growth_multiplier": 1.0}}
    obs = agent.perceive(state)
    assert "orders" in obs
    assert "skus" in obs
    assert len(obs["skus"]) > 0
    
    decision = agent.decide(obs)
    assert "forecasts" in decision
    for sku in decision["forecasts"]:
        forecast_list = decision["forecasts"][sku]
        assert len(forecast_list) == 90
        assert "date" in forecast_list[0]
        assert "value" in forecast_list[0]
        assert "lower" in forecast_list[0]
        assert "upper" in forecast_list[0]
        
    # Test act phase
    success = agent.act(decision, state)
    assert success is True
    assert "demand_forecast" in state

def test_inventory_optimization_agent():
    agent = InventoryOptimizationAgent()
    assert agent.agent_id == "inventory_agent"
    
    # Pre-populate state with demand forecast
    demand_agent = DemandForecastingAgent()
    state = {"overrides": {"service_level_z": 1.65}}
    demand_obs = demand_agent.perceive(state)
    demand_decision = demand_agent.decide(demand_obs)
    demand_agent.act(demand_decision, state)
    
    obs = agent.perceive(state)
    assert "inventory" in obs
    assert "demand_forecast" in obs
    
    decision = agent.decide(obs)
    assert "inventory_recommendations" in decision
    for sku in decision["inventory_recommendations"]:
        rec = decision["inventory_recommendations"][sku]
        assert "calculated_safety_stock" in rec
        assert "calculated_reorder_point" in rec
        assert "calculated_eoq" in rec
        assert rec["action"] in ["REORDER", "HOLD"]
        
    success = agent.act(decision, state)
    assert success is True
    assert "inventory_status" in state

def test_supplier_quality_agent():
    agent = SupplierQualityAgent()
    assert agent.agent_id == "quality_agent"
    
    state = {}
    obs = agent.perceive(state)
    assert "inspections" in obs
    assert "suppliers" in obs
    
    decision = agent.decide(obs)
    assert "alerts" in decision
    assert "scorecards" in decision
    
    success = agent.act(decision, state)
    assert success is True
    assert "supplier_quality" in state

def test_contract_intelligence_agent():
    agent = ContractIntelligenceAgent()
    assert agent.agent_id == "contract_agent"
    
    # Needs supplier scorecard metrics populated in state
    quality_agent = SupplierQualityAgent()
    state = {}
    q_obs = quality_agent.perceive(state)
    q_dec = quality_agent.decide(q_obs)
    quality_agent.act(q_dec, state)
    
    obs = agent.perceive(state)
    assert "contracts" in obs
    assert "suppliers" in obs
    
    decision = agent.decide(obs)
    assert "contract_extractions" in decision
    
    success = agent.act(decision, state)
    assert success is True
    assert "contracts" in state

def test_production_scheduling_agent():
    agent = ProductionSchedulingAgent()
    assert agent.agent_id == "production_agent"
    
    # Requires demand forecast in state
    demand_agent = DemandForecastingAgent()
    state = {"overrides": {"capacity_factor": 1.0}}
    demand_obs = demand_agent.perceive(state)
    demand_decision = demand_agent.decide(demand_obs)
    demand_agent.act(demand_decision, state)
    
    obs = agent.perceive(state)
    assert "inventory" in obs
    assert "demand_forecast" in obs
    
    decision = agent.decide(obs)
    assert "production_schedule" in decision
    assert "line_utilization" in decision
    
    success = agent.act(decision, state)
    assert success is True
    assert "production_plan" in state

def test_logistics_agent():
    agent = LogisticsAgent()
    assert agent.agent_id == "logistics_agent"
    
    state = {"overrides": {"weather_risk_multiplier": 1.0}}
    obs = agent.perceive(state)
    assert "shipments" in obs
    assert "carriers" in obs
    
    decision = agent.decide(obs)
    assert "shipments" in decision
    assert "alerts" in decision
    
    success = agent.act(decision, state)
    assert success is True
    assert "shipment_status" in state

def test_risk_agent():
    agent = RiskAgent()
    assert agent.agent_id == "risk_agent"
    
    state = {
        "alerts": [
            {"alert_type": "QUALITY_VIOLATION", "material_id": "MAT_1001", "supplier_id": "SUPPLIER_ABC"}
        ],
        "overrides": {"geopolitical_risk_flag": "HIGH"}
    }
    obs = agent.perceive(state)
    assert "inventory" in obs
    assert "active_alerts" in obs
    
    decision = agent.decide(obs)
    assert "risks" in decision
    
    success = agent.act(decision, state)
    assert success is True
    assert "risks" in state

def test_orchestrator_planning_cycle():
    orchestrator = SupplyChainOrchestrator()
    overrides = {
        "service_level_z": 1.96,
        "weather_risk_multiplier": 1.2,
        "capacity_factor": 0.8,
        "geopolitical_risk_flag": "MEDIUM",
        "market_growth_multiplier": 1.08
    }
    
    result = orchestrator.run_cycle(overrides)
    assert result["status"] == "success"
    assert "cycle_id" in result
    assert "data" in result
    
    data = result["data"]
    assert "demand_forecast" in data
    assert "inventory_status" in data
    assert "supplier_quality" in data
    assert "contracts" in data
    assert "production_plan" in data
    assert "shipment_status" in data
    assert "risks" in data
