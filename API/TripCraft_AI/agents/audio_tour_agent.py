"""
agents/audio_tour_agent.py - Audio Tour Generation Agent
"""
from .base_agent import BaseAgent
import json
from typing import Dict, Any

class AudioTourAgent(BaseAgent):
    def __init__(self):
        super().__init__("Audio Tour Creator", "Generate immersive audio tour content")
        
    async def execute(self, request: Dict[str, Any]) -> Dict[str, Any]:
        destination = request.get("destination", "")
        interests = request.get("interests", [])
        agent_results = request.get("agent_results", {})
        duration_days = request.get("duration_days", 3)
        
        system_prompt = """You are an expert audio tour creator. Generate engaging, conversational audio content that:
        - Brings locations to life with stories and insights
        - Uses natural, friendly tour guide voice
        - Includes historical context, cultural insights, and interesting facts
        - Provides walking directions and timing
        - Adapts to user interests and available time
        Format as JSON with tour_segments, each containing location, content, duration, and voice_style."""
        
        # Extract relevant information from other agents
        destinations_info = agent_results.get("destination", {}).get("content", "")
        accommodations = agent_results.get("accommodation", {}).get("content", "")
        dining_info = agent_results.get("dining", {}).get("content", "")
        
        user_prompt = f"""
        Destination: {destination}
        User Interests: {interests}
        Trip Duration: {duration_days} days
        
        Destination Research:
        {destinations_info}
        
        Accommodation Info:
        {accommodations}
        
        Dining Information:
        {dining_info}
        
        Create engaging audio tour segments that guide users through the destination with storytelling and practical information.
        Each segment should be 2-5 minutes of natural, conversational content.
        """
        
        response = await self.call_ollama(user_prompt, system_prompt)
        
        try:
            return json.loads(response) if response.strip().startswith('{') else {"content": response}
        except:
            return {"content": response}