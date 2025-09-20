"""
tools/mcp_tool.py - MCP Server Integration
"""
import asyncio
import json
import subprocess
from typing import Dict, Any, List, Optional
import websockets
import httpx
from config.settings import get_settings


settings = get_settings()
print(settings.OLLAMA_MODEL)  # should print "gemma2:2b" from your .env

class MCPTool:
    def __init__(self):
        self.settings = get_settings()
        self.servers = {}
        
    async def start_mcp_servers(self, server_configs: List[str]):
        """Start MCP servers"""
        for config in server_configs:
            try:
                process = subprocess.Popen(
                    config.split(),
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
                self.servers[config] = process
            except Exception as e:
                print(f"Failed to start MCP server {config}: {e}")
    
    async def call_mcp_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call MCP tool function"""
        try:
            # Simulated MCP call - replace with actual MCP protocol implementation
            if tool_name == "search_accommodations":
                return await self._search_accommodations(arguments)
            elif tool_name == "get_directions":
                return await self._get_directions(arguments)
            elif tool_name == "search_restaurants":
                return await self._search_restaurants(arguments)
            else:
                return {"error": f"Unknown tool: {tool_name}"}
        except Exception as e:
            return {"error": str(e)}
    
    async def _search_accommodations(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Search for accommodations"""
        location = args.get('location', '')
        checkin = args.get('checkin', '')
        checkout = args.get('checkout', '')
        guests = args.get('guests', 2)
        
        # Simulated accommodation search
        return {
            "accommodations": [
                {
                    "name": "Sample Hotel",
                    "price": 150.0,
                    "rating": 4.5,
                    "location": location,
                    "amenities": ["WiFi", "Pool", "Gym"]
                }
            ]
        }
    
    async def _get_directions(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Get directions between locations"""
        origin = args.get('origin', '')
        destination = args.get('destination', '')
        mode = args.get('mode', 'walking')
        
        return {
            "routes": [
                {
                    "duration": "15 mins",
                    "distance": "1.2 km",
                    "mode": mode,
                    "steps": ["Head north on Main St", "Turn right on Oak Ave"]
                }
            ]
        }
    
    async def _search_restaurants(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """Search for restaurants"""
        location = args.get('location', '')
        cuisine = args.get('cuisine', '')
        price_range = args.get('price_range', '')
        
        return {
            "restaurants": [
                {
                    "name": "Local Bistro",
                    "cuisine": cuisine or "International",
                    "price_range": price_range or "$$",
                    "rating": 4.3,
                    "location": location
                }
            ]
        }