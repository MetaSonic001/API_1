"""
agents/multimodal_agent.py - Multimodal Processing Agent
"""
from .base_agent import BaseAgent
from tools.embedding_tool import EmbeddingTool
from services.multimodal_service import MultimodalService
import json
from typing import Dict, Any


class MultimodalAgent(BaseAgent):
    def __init__(self):
        super().__init__("Multimodal Processor", "Process images, voice, and mixed inputs")
        self.embedding_tool = EmbeddingTool()
        self.multimodal_service = MultimodalService()
        
    async def execute(self, request: Dict[str, Any]) -> Dict[str, Any]:
        multimodal_inputs = request.get("multimodal_inputs", [])
        
        if not multimodal_inputs:
            return {"status": "no_multimodal_inputs"}
        
        system_prompt = """You are a multimodal travel preference analyzer. Process images, voice, and other inputs to extract:
        - Travel preferences and vibes
        - Activity interests and styles
        - Budget indications and luxury preferences
        - Destination suggestions based on visual cues
        Format as JSON with extracted_preferences, confidence_scores, and recommendations."""
        
        processed_inputs = []
        
        for input_data in multimodal_inputs:
            if input_data.get("input_type") == "image":
                # Process moodboard images
                image_analysis = await self.multimodal_service.analyze_images([input_data["content"]])
                processed_inputs.append({
                    "type": "image",
                    "analysis": image_analysis
                })
            
            elif input_data.get("input_type") == "voice":
                # Process voice input
                transcription = await self.multimodal_service.transcribe_voice(input_data["content"])
                processed_inputs.append({
                    "type": "voice",
                    "transcription": transcription
                })
        
        user_prompt = f"""
        Multimodal Inputs:
        {json.dumps(processed_inputs, indent=2)}
        
        Analyze all inputs and extract comprehensive travel preferences, combining insights from images and voice.
        """
        
        response = await self.call_ollama(user_prompt, system_prompt)
        
        try:
            return json.loads(response) if response.strip().startswith('{') else {"analysis": response}
        except:
            return {"analysis": response}