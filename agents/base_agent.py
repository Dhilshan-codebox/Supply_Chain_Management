# agents/base_agent.py
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from pydantic import BaseModel
from datetime import datetime
import logging

class AgentState(BaseModel):
    agent_id: str
    status: str  # 'idle', 'processing', 'waiting_for_input', 'completed', 'error'
    last_action: str
    context: Dict[str, Any]
    timestamp: str

class BaseSupplyChainAgent(ABC):
    def __init__(self, agent_id: str, role: str):
        self.agent_id = agent_id
        self.role = role
        self.state = AgentState(
            agent_id=agent_id,
            status="idle",
            last_action="initialized",
            context={},
            timestamp=datetime.utcnow().isoformat()
        )
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(f"agent_{agent_id}")
        self.memory: List[Dict[str, Any]] = []

    def log_state(self, status: str, action: str, context: Dict[str, Any] = None):
        self.state.status = status
        self.state.last_action = action
        if context is not None:
            self.state.context.update(context)
        self.state.timestamp = datetime.utcnow().isoformat()
        self.logger.info(f"[{self.agent_id}] Status: {status} | Action: {action}")

    @abstractmethod
    def perceive(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Gather information from the system and environment."""
        pass

    @abstractmethod
    def decide(self, observations: Dict[str, Any]) -> Dict[str, Any]:
        """Process observations to make decisions or recommendations."""
        pass

    @abstractmethod
    def act(self, decision: Dict[str, Any], state: Dict[str, Any]) -> bool:
        """Apply decisions, update databases or execute overrides."""
        pass

    def run_cycle(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Execute one complete Perceive-Decide-Act cycle."""
        self.log_state("processing", "Starting perception phase")
        try:
            observations = self.perceive(state)
            self.log_state("processing", "Decision phase", {"observations": observations})
            
            decision = self.decide(observations)
            self.log_state("processing", "Action phase", {"decision": decision})
            
            success = self.act(decision, state)
            if success:
                self.log_state("completed", "Cycle executed successfully")
            else:
                self.log_state("error", "Cycle execution returned failure state")
            
            # Return updates to merge back into orchestrator state
            return {
                "decision": decision,
                "success": success,
                "agent_id": self.agent_id,
                "timestamp": self.state.timestamp
            }
        except Exception as e:
            self.logger.error(f"[{self.agent_id}] Exception occurred: {str(e)}", exc_info=True)
            self.log_state("error", f"Cycle failed: {str(e)}")
            return {
                "decision": {"error": str(e)},
                "success": False,
                "agent_id": self.agent_id,
                "timestamp": self.state.timestamp
            }
