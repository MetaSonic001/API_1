"""
agents/base_agent.py - Base Agent Class
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import httpx
import json
from config.settings import get_settings
from services.llm_manager import llm_manager

class BaseAgent(ABC):
    def __init__(self, name: str, role: str, model: str = None):
        self.name = name
        self.role = role
        self.settings = get_settings()
        self.model = model or self.settings.OLLAMA_MODEL
        
    async def call_ollama(self, prompt: str, system_prompt: str = "") -> str:
        """Call LLM API with three-tier fallback: Groq → Gemini → Ollama"""
        try:
            result = await llm_manager.generate_text(
                prompt=prompt,
                system_prompt=system_prompt,
                max_tokens=800,  # Reasonable limit for travel agents
                temperature=0.7
            )
            
            if result["success"]:
                return result["content"]
            else:
                print(f"All LLM providers failed: {result['errors']}")
                return ""
                
        except Exception as e:
            print(f"Base agent LLM error: {e}")
            return ""
    
    @abstractmethod
    async def execute(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Execute agent task"""
        pass
