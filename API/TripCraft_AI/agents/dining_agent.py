"""
agents/dining_agent.py - Culinary Experience Agent
"""
from .base_agent import BaseAgent
from tools.search_tool import SearchTool
from tools.mcp_tool import MCPTool
import json
from typing import Dict, Any

class DiningAgent(BaseAgent):
    def __init__(self):
        super().__init__("Culinary Guide", "Curate amazing food experiences")
        self.search_tool = SearchTool()
        self.mcp_tool = MCPTool()
        
    async def execute(self, request: Dict[str, Any]) -> Dict[str, Any]:
        destination = request.get("destination", "")
        dietary_restrictions = request.get("dietary_restrictions", [])
        budget = request.get("budget", 0)
        vibes = request.get("vibes", [])
        
        system_prompt = """You are a culinary expert and local food guide. Recommend:
        - Authentic local cuisine and specialties
        - Restaurant recommendations across all budgets
        - Food markets, street food, and unique dining experiences
        - Cultural significance of local dishes
        Format as JSON with restaurants, food_experiences, local_specialties, and cultural_context."""
        
        # Search for restaurant information
        food_results = await self.search_tool.search_web(
            f"{destination} restaurants local food {' '.join(dietary_restrictions)}", 
            num_results=5
        )
        
        # Get restaurant data via MCP
        restaurant_data = await self.mcp_tool.call_mcp_tool("search_restaurants", {
            "location": destination,
            "dietary_restrictions": dietary_restrictions,
            "budget_range": "varied"
        })
        
        user_prompt = f"""
        Destination: {destination}
        Dietary Restrictions: {dietary_restrictions}
        Budget: {budget}
        Vibes: {vibes}
        
        Food Search Results:
        {json.dumps(food_results, indent=2)}
        
        Restaurant Data:
        {json.dumps(restaurant_data, indent=2)}
        
        Create comprehensive culinary guide with restaurants, experiences, and cultural context.
        """
        
        response = await self.call_ollama(user_prompt, system_prompt)
        
        try:
            return json.loads(response) if response.strip().startswith('{') else {"content": response}
        except:
            return {"content": response}