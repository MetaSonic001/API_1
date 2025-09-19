"""
Updated services/multimodal_service.py - Free speech recognition
"""
from typing import List, Dict, Any
from tools.embedding_tool import EmbeddingTool
import base64
import json
import httpx
import whisper  # Free OpenAI Whisper model
import tempfile
import os

class MultimodalService:
    def __init__(self):
        self.embedding_tool = EmbeddingTool()
        # Load free Whisper model for speech recognition
        self.whisper_model = whisper.load_model("base")  # Free model
        
    async def analyze_images(self, image_data_list: List[str]) -> Dict[str, Any]:
        """Analyze images using free models"""
        return await self.embedding_tool.analyze_moodboard(image_data_list)
    
    async def transcribe_voice(self, audio_data: str) -> str:
        """Transcribe voice using free Whisper model"""
        try:
            # Decode base64 audio
            audio_bytes = base64.b64decode(audio_data)
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
                temp_file.write(audio_bytes)
                temp_path = temp_file.name
            
            # Transcribe using Whisper
            result = self.whisper_model.transcribe(temp_path)
            
            # Clean up temp file
            os.unlink(temp_path)
            
            return result["text"]
            
        except Exception as e:
            # Fallback response
            return "Voice transcription temporarily unavailable"