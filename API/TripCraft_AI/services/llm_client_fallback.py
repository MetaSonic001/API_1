"""
services/llm_client_fallback.py - Resilient LLM Client
"""

import asyncio
import httpx
from typing import Optional, Dict, Any, List
import json
from tenacity import retry, stop_after_attempt, wait_exponential
from config.settings import get_settings

class LLMClientFallback:
    def __init__(self):
        self.settings = get_settings()
        self.ollama_url = self.settings.OLLAMA_BASE_URL
        self.hf_token = self.settings.HUGGINGFACE_TOKEN
        
        # Track which backend was used
        self.last_backend_used = None
    
    async def generate_text(
        self, 
        prompt: str, 
        context_docs: Optional[List[Dict]] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Generate text with automatic fallback"""
        
        # Prepare full prompt with context
        full_prompt = self._prepare_prompt(prompt, context_docs)
        
        # Try Ollama first
        try:
            result = await self._call_ollama(full_prompt, max_tokens, temperature)
            self.last_backend_used = "ollama"
            return {
                "text": result,
                "backend": "ollama",
                "success": True
            }
        except Exception as ollama_error:
            print(f"Ollama failed: {ollama_error}")
            
            # Fallback to HuggingFace
            if self.hf_token:
                try:
                    result = await self._call_huggingface(full_prompt, max_tokens, temperature)
                    self.last_backend_used = "huggingface"
                    return {
                        "text": result,
                        "backend": "huggingface", 
                        "success": True
                    }
                except Exception as hf_error:
                    print(f"HuggingFace failed: {hf_error}")
            
            # Final fallback - simple template response
            fallback_response = self._generate_fallback_response(prompt)
            self.last_backend_used = "fallback"
            return {
                "text": fallback_response,
                "backend": "fallback",
                "success": False,
                "error": f"All backends failed. Ollama: {ollama_error}"
            }
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def _call_ollama(self, prompt: str, max_tokens: int, temperature: float) -> str:
        """Call Ollama API with retry logic"""
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.settings.OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "num_predict": max_tokens,
                        "temperature": temperature
                    }
                }
            )
            response.raise_for_status()
            return response.json()["response"]
    
    async def _call_huggingface(self, prompt: str, max_tokens: int, temperature: float) -> str:
        """Call HuggingFace Inference API"""
        api_url = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"
        
        headers = {"Authorization": f"Bearer {self.hf_token}"}
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": max_tokens,
                "temperature": temperature,
                "return_full_text": False
            }
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(api_url, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                return result[0].get("generated_text", "")
            return str(result)
    
    def _prepare_prompt(self, prompt: str, context_docs: Optional[List[Dict]]) -> str:
        """Prepare prompt with context documents"""
        if not context_docs:
            return prompt
        
        context_text = "\n\nContext Documents:\n"
        for i, doc in enumerate(context_docs[:3], 1):  # Limit to 3 docs
            context_text += f"{i}. {doc.get('title', 'Document')}: {doc.get('content', '')[:200]}...\n"
        
        return f"{context_text}\n\nQuery: {prompt}\n\nResponse:"
    
    def _generate_fallback_response(self, prompt: str) -> str:
        """Generate simple fallback response when all backends fail"""
        if "itinerary" in prompt.lower():
            return "Unable to generate detailed itinerary due to service unavailability. Please try again later."
        elif "restaurant" in prompt.lower() or "food" in prompt.lower():
            return "Restaurant recommendations temporarily unavailable. Consider exploring local dining options."
        elif "hotel" in prompt.lower() or "accommodation" in prompt.lower():
            return "Accommodation search temporarily unavailable. Please check booking sites directly."
        else:
            return "Service temporarily unavailable. Please try again in a few moments."
