"""
agents/base_agent.py - Base Agent Class
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import httpx
import json
from config.settings import get_settings

class BaseAgent(ABC):
    def __init__(self, name: str, role: str, model: str = None):
        self.name = name
        self.role = role
        self.settings = get_settings()
        self.model = model or self.settings.OLLAMA_MODEL
        
    async def call_ollama(self, prompt: str, system_prompt: str = "") -> str:
        """Call Ollama API"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.settings.OLLAMA_BASE_URL}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "system": system_prompt,
                        "stream": False
                    },
                    timeout=60.0
                )
                if response.status_code == 200:
                    return response.json().get("response", "")
                return ""
        except Exception as e:
            print(f"Ollama API error: {e}")
            return ""
    
    @abstractmethod
    async def execute(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Execute agent task"""
        pass
