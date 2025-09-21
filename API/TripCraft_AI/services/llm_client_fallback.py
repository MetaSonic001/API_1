"""
services/llm_client_fallback.py - Resilient LLM Client
Three-tier fallback: Groq -> Gemini -> Ollama
"""

import asyncio
import httpx
from typing import Optional, Dict, Any, List
import json
from config.settings import get_settings
from services.llm_manager import llm_manager

class LLMClientFallback:
    def __init__(self):
        self.settings = get_settings()
        # Track which backend was used
        self.last_backend_used = None
    
    async def generate_text(
        self, 
        prompt: str, 
        context_docs: Optional[List[Dict]] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Generate text with automatic three-tier fallback"""
        
        # Prepare full prompt with context
        full_prompt = self._prepare_prompt(prompt, context_docs)
        
        # Use the comprehensive LLM manager
        result = await llm_manager.generate_text(
            prompt=full_prompt,
            max_tokens=max_tokens,
            temperature=temperature
        )
        
        # Track which backend was used
        if result["success"]:
            self.last_backend_used = result["provider"]
        
        return result
    
    def _prepare_prompt(self, prompt: str, context_docs: Optional[List[Dict]] = None) -> str:
        """Prepare prompt with context documents"""
        if not context_docs:
            return prompt
            
        # Add context documents to prompt
        context_text = ""
        for doc in context_docs[:3]:  # Limit to 3 docs to avoid token limits
            context_text += f"Context: {doc.get('content', '')[:500]}\n\n"
        
        return f"{context_text}User Request: {prompt}"
    
    async def get_backend_status(self) -> Dict[str, Any]:
        """Get status of all LLM backends"""
        status = await llm_manager.get_provider_status()
        return {
            "providers": status,
            "last_used": self.last_backend_used,
            "available_count": sum(status.values())
        }

# Global instance for backward compatibility
llm_client = LLMClientFallback()
