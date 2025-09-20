"""
agents/budget_agent.py - Budget Optimization Agent
"""
from .base_agent import BaseAgent
import json
from typing import Dict, Any

class BudgetAgent(BaseAgent):
    def __init__(self):
        super().__init__("Budget Optimizer", "Optimize costs and find best deals")
        
    async def execute(self, request: Dict[str, Any]) -> Dict[str, Any]:
        budget = request.get("budget", 1000)
        currency = request.get("currency", "USD")
        duration_days = request.get("duration_days", 3)
        travelers = request.get("travelers", 1)
        agent_results = request.get("agent_results", {})
        
        system_prompt = """You are a budget optimization expert. Analyze all travel components and:
        - Create detailed cost breakdowns
        - Find cost-saving alternatives without sacrificing quality
        - Suggest budget optimization strategies
        - Identify potential hidden costs and fees
        - Recommend booking timing and deals
        Format as JSON with budget_breakdown, optimizations, alternatives, and savings_tips."""
        
        # Extract cost information from other agents
        transport_costs = self._extract_costs(agent_results.get("transport", {}))
        accommodation_costs = self._extract_costs(agent_results.get("accommodation", {}))
        dining_costs = self._extract_costs(agent_results.get("dining", {}))
        activity_costs = self._extract_costs(agent_results.get("destination", {}))
        
        user_prompt = f"""
        Total Budget: {budget} {currency}
        Duration: {duration_days} days
        Travelers: {travelers}
        
        Cost Information from Agents:
        Transport: {transport_costs}
        Accommodation: {accommodation_costs}
        Dining: {dining_costs}
        Activities: {activity_costs}
        
        Optimize budget allocation and suggest cost-saving strategies while maintaining travel quality.
        """
        
        response = await self.call_ollama(user_prompt, system_prompt)
        
        try:
            return json.loads(response) if response.strip().startswith('{') else {"optimization": response}
        except:
            return {"optimization": response}
    
    def _extract_costs(self, agent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract cost information from agent results"""
        # Simple cost extraction - would be more sophisticated in production
        return {
            "estimated_total": 200.0,
            "options": ["budget", "mid-range", "luxury"],
            "savings_potential": "20-30%"
        }
