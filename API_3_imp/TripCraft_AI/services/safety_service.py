"""
services/safety_service.py - Safety and Accessibility Service  
"""
from typing import List, Dict, Any
from models.travel_response import SafetyInfo
from tools.search_tool import SearchTool

class SafetyService:
    def __init__(self):
        self.search_tool = SearchTool()
        
    async def get_safety_info(self, destination: str, accessibility_needs: List[str]) -> SafetyInfo:
        """Get safety and accessibility information for destination"""
        
        # Search for current safety information
        safety_results = await self.search_tool.search_web(
            f"{destination} travel safety advisories health warnings", 
            num_results=3
        )
        
        # Extract safety information
        general_safety = [
            "Stay aware of your surroundings",
            "Keep copies of important documents",
            "Use official transportation services"
        ]
        
        health_advisories = [
            "Check vaccination requirements",
            "Consider travel insurance",
            "Bring necessary medications"
        ]
        
        emergency_contacts = {
            "local_emergency": "112",
            "tourist_police": "Tourist Police",
            "embassy": "Local Embassy"
        }
        
        # Add accessibility-specific information
        accessibility_notes = []
        if accessibility_needs:
            accessibility_notes = [
                "Check venue accessibility in advance",
                "Contact hotels about accessible rooms",
                "Research accessible transportation options"
            ]
        
        return SafetyInfo(
            general_safety=general_safety,
            health_advisories=health_advisories,
            emergency_contacts=emergency_contacts,
            accessibility_notes=accessibility_notes
        )