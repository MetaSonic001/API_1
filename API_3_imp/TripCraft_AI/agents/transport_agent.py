"""
agents/transport_agent.py - Transportation Planning Agent
"""
from .base_agent import BaseAgent
from tools.mcp_tool import MCPTool
import json
from typing import Dict, Any


class TransportAgent(BaseAgent):
    def __init__(self):
        super().__init__("Transport Planner", "Find optimal transportation options")
        self.mcp_tool = MCPTool()
        
    async def execute(self, request: Dict[str, Any]) -> Dict[str, Any]:
        origin = request.get("origin", "")
        destination = request.get("destination", "")
        dates = request.get("dates", {})
        travelers = request.get("travelers", 1)
        budget = request.get("budget", 0)
        
        system_prompt = """You are a transportation planning expert. Find optimal flight, train, and local transport options.
        Consider: cost, duration, convenience, carbon footprint, and user preferences.
        Format as JSON with flights, local_transport, and recommendations."""
        
        # Use MCP for real transport data
        flight_results = await self.mcp_tool.call_mcp_tool("search_flights", {
            "origin": origin,
            "destination": destination,
            "departure_date": dates.get("start"),
            "return_date": dates.get("end"),
            "passengers": travelers
        })
        
        user_prompt = f"""
        Origin: {origin}
        Destination: {destination}
        Travel Dates: {dates}
        Travelers: {travelers}
        Budget: {budget}
        
        Flight Search Results:
        {json.dumps(flight_results, indent=2)}
        
        Provide comprehensive transportation plan including flights, local transport, and cost optimization.
        """
        
        response = await self.call_ollama(user_prompt, system_prompt)
        
        try:
            return json.loads(response) if response.strip().startswith('{') else {"content": response}
        except:
            return {"content": response}