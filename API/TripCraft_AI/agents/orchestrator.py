"""
agents/orchestrator.py - Main Orchestrator Agent
"""
from .base_agent import BaseAgent
from typing import Dict, Any, List
import asyncio
import json

class OrchestratorAgent(BaseAgent):
    def __init__(self):
        super().__init__("TripCraft Orchestrator", "Coordinate all travel planning agents")
        self.agents = {}
        
    def register_agent(self, agent_type: str, agent):
        """Register specialized agent"""
        self.agents[agent_type] = agent
    
    async def execute(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Orchestrate multi-agent travel planning"""
        
        system_prompt = """You are the TripCraft AI Orchestrator. Coordinate specialized agents to create comprehensive travel plans.
        Analyze the request and determine which agents to call and in what order. Ensure all aspects are covered."""
        
        user_prompt = f"""
        Travel Planning Request: {json.dumps(request, indent=2)}
        
        Available Agents:
        - destination: Research attractions, activities, local insights
        - transport: Find flights, trains, local transportation
        - accommodation: Search hotels, apartments, unique stays
        - dining: Restaurant recommendations, food experiences
        - budget: Optimize costs, find deals, budget breakdown
        - audio_tour: Generate immersive audio content
        - multimodal: Process images, voice, mood analysis
        
        Create a coordination plan and execute agents in optimal order.
        """
        
        coordination_plan = await self.call_ollama(user_prompt, system_prompt)
        
        # Execute agents based on coordination plan
        results = {}
        
        # Core agents execution in parallel where possible
        core_tasks = []
        
        if "destination" in self.agents:
            core_tasks.append(self._execute_agent("destination", request))
        if "transport" in self.agents:
            core_tasks.append(self._execute_agent("transport", request))
        if "accommodation" in self.agents:
            core_tasks.append(self._execute_agent("accommodation", request))
        if "dining" in self.agents:
            core_tasks.append(self._execute_agent("dining", request))
            
        core_results = await asyncio.gather(*core_tasks, return_exceptions=True)
        
        # Process core results
        agent_names = ["destination", "transport", "accommodation", "dining"]
        for i, result in enumerate(core_results):
            if not isinstance(result, Exception) and i < len(agent_names):
                results[agent_names[i]] = result
        
        # Execute dependent agents
        if "budget" in self.agents:
            budget_request = {**request, "agent_results": results}
            results["budget"] = await self._execute_agent("budget", budget_request)
            
        if "audio_tour" in self.agents and request.get("include_audio_tour"):
            audio_request = {**request, "agent_results": results}
            results["audio_tour"] = await self._execute_agent("audio_tour", audio_request)
        
        return {
            "coordination_plan": coordination_plan,
            "agent_results": results,
            "status": "completed"
        }
    
    async def _execute_agent(self, agent_type: str, request: Dict[str, Any]) -> Dict[str, Any]:
        """Execute specific agent"""
        try:
            if agent_type in self.agents:
                return await self.agents[agent_type].execute(request)
            return {"error": f"Agent {agent_type} not found"}
        except Exception as e:
            return {"error": str(e)}