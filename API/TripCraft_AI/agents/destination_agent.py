"""
agents/destination_agent.py - Destination Research Agent
"""
from .base_agent import BaseAgent
from tools.search_tool import SearchTool
from tools.vector_store import VectorStore
from tools.embedding_tool import EmbeddingTool
import json
from typing import Dict, Any


class DestinationAgent(BaseAgent):
    def __init__(self):
        super().__init__("Destination Explorer", "Research destinations and attractions")
        self.search_tool = SearchTool()
        self.vector_store = VectorStore()
        self.embedding_tool = EmbeddingTool()
        
    async def execute(self, request: Dict[str, Any]) -> Dict[str, Any]:
        destination = request.get("destination", "")
        interests = request.get("interests", [])
        vibes = request.get("vibes", [])
        duration_days = request.get("duration_days", 3)
        
        system_prompt = """You are a destination research specialist. Provide comprehensive information about travel destinations including:
        - Top attractions and hidden gems
        - Cultural experiences and local insights  
        - Seasonal considerations and best times to visit
        - Transportation within the destination
        - Local customs and etiquette
        Format response as structured JSON with attractions, experiences, practical_info, and local_insights."""
        
        # Search for current destination information
        search_results = await self.search_tool.search_web(
            f"{destination} attractions activities {' '.join(interests)}", 
            num_results=5
        )
        
        # Search vector store for similar experiences
        query_embedding = await self.embedding_tool.encode_text(f"{destination} {' '.join(vibes)}")
        similar_experiences = await self.vector_store.search_experiences(query_embedding[0], limit=5)
        
        user_prompt = f"""
        Destination: {destination}
        Interests: {interests}
        Travel Vibes: {vibes}
        Duration: {duration_days} days
        
        Web Search Results:
        {json.dumps(search_results, indent=2)}
        
        Similar Experiences:
        {json.dumps(similar_experiences, indent=2)}
        
        Create comprehensive destination guide with attractions, experiences, and practical information.
        """
        
        response = await self.call_ollama(user_prompt, system_prompt)
        
        try:
            return json.loads(response) if response.strip().startswith('{') else {"content": response}
        except:
            return {"content": response}