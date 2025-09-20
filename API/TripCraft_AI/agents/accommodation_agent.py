"""
agents/accommodation_agent.py - Accommodation Planning Agent
"""
from .base_agent import BaseAgent
from tools.mcp_tool import MCPTool
import json
from typing import Dict, Any

class AccommodationAgent(BaseAgent):
    def __init__(self):
        super().__init__("Accommodation Specialist", "Find perfect stays for every budget")
        self.mcp_tool = MCPTool()
        
    async def execute(self, request: Dict[str, Any]) -> Dict[str, Any]:
        destination = request.get("destination", "")
        dates = request.get("dates", {})
        travelers = request.get("travelers", 1)
        budget = request.get("budget", 0)
        travel_style = request.get("travel_style", "comfort")
        accessibility_needs = request.get("accessibility_needs", [])
        
        system_prompt = """You are an accommodation expert specializing in finding perfect stays.
        Consider: location, amenities, accessibility, value for money, and unique experiences.
        Format as JSON with hotel_options, alternative_stays, and location_benefits."""
        
        # Search accommodations via MCP
        accommodation_results = await self.mcp_tool.call_mcp_tool("search_accommodations", {
            "location": destination,
            "checkin": dates.get("start"),
            "checkout": dates.get("end"),
            "guests": travelers,
            "budget_per_night": budget / (dates.get("duration_days", 1) or 1) if budget else None
        })
        
        user_prompt = f"""
        Destination: {destination}
        Check-in/out: {dates}
        Guests: {travelers}
        Budget: {budget}
        Style: {travel_style}
        Accessibility: {accessibility_needs}
        
        Accommodation Search Results:
        {json.dumps(accommodation_results, indent=2)}
        
        Recommend diverse accommodation options matching user preferences and budget.
        """
        
        response = await self.call_ollama(user_prompt, system_prompt)
        
        try:
            return json.loads(response) if response.strip().startswith('{') else {"content": response}
        except:
            return {"content": response}
