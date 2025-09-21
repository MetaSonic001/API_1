"""
services/llm_manager.py - Multi-Provider LLM Manager
Fallback order: Groq → Gemini → Ollama
"""
import asyncio
import httpx
import json
from typing import Optional, Dict, Any, List
from config.settings import get_settings
from utils.logger import setup_logger

logger = setup_logger()

class LLMManager:
    """Manages multiple LLM providers with intelligent fallback"""
    
    def __init__(self):
        self.settings = get_settings()
        self.last_successful_provider = None
        self._lock = asyncio.Lock()
        
    async def generate_text(
        self, 
        prompt: str, 
        system_prompt: str = "", 
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Generate text using the fallback chain: Groq → Gemini → Ollama
        Returns dict with content, provider, and success status
        """
        providers = ["groq", "gemini", "ollama"]
        errors = []
        
        # If we have a last successful provider, try it first
        if self.last_successful_provider and self.last_successful_provider in providers:
            providers.remove(self.last_successful_provider)
            providers.insert(0, self.last_successful_provider)
        
        for provider in providers:
            try:
                logger.info(f"🤖 Trying {provider.upper()} for text generation...")
                
                if provider == "groq":
                    result = await self._call_groq(prompt, system_prompt, max_tokens, temperature)
                elif provider == "gemini":
                    result = await self._call_gemini(prompt, system_prompt, max_tokens, temperature)
                elif provider == "ollama":
                    result = await self._call_ollama(prompt, system_prompt, max_tokens, temperature)
                
                if result:
                    self.last_successful_provider = provider
                    logger.info(f"✅ {provider.upper()} generation successful ({len(result)} chars)")
                    return {
                        "content": result,
                        "provider": provider,
                        "success": True,
                        "errors": errors
                    }
                    
            except Exception as e:
                error_msg = f"{provider} failed: {str(e)}"
                logger.warning(error_msg)
                errors.append(error_msg)
                continue
        
        # All providers failed
        logger.error("❌ All LLM providers failed")
        return {
            "content": "",
            "provider": None,
            "success": False,
            "errors": errors
        }
    
    async def _call_groq(self, prompt: str, system_prompt: str, max_tokens: int, temperature: float) -> Optional[str]:
        """Call Groq API"""
        if not self.settings.GROQ_API_KEY:
            raise Exception("Groq API key not configured")
        
        headers = {
            "Authorization": f"Bearer {self.settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": self.settings.GROQ_MODEL,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": False
        }
        
        timeout = httpx.Timeout(30.0, connect=5.0)  # Groq is fast
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{self.settings.GROQ_BASE_URL}/chat/completions",
                headers=headers,
                json=payload
            )
            
            response.raise_for_status()
            result = response.json()
            
            if "choices" in result and len(result["choices"]) > 0:
                content = result["choices"][0]["message"]["content"]
                
                # Check if generation was cut off (incomplete)
                finish_reason = result["choices"][0].get("finish_reason")
                if finish_reason == "length":
                    logger.warning("⚠️ Groq response was truncated due to length limit")
                    # Return partial content but mark as incomplete
                    return content + "\n[Response truncated - continuing with fallback...]"
                
                return content
            else:
                raise Exception("Invalid response format from Groq")
    
    async def _call_gemini(self, prompt: str, system_prompt: str, max_tokens: int, temperature: float) -> Optional[str]:
        """Call Google Gemini API"""
        if not self.settings.GOOGLE_API_KEY:
            raise Exception("Google API key not configured")
        
        # Combine system and user prompts for Gemini
        full_prompt = f"{system_prompt}\\n\\n{prompt}" if system_prompt else prompt
        
        payload = {
            "contents": [{
                "parts": [{"text": full_prompt}]
            }],
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": temperature,
                "topP": 0.9,
                "topK": 40
            }
        }
        
        timeout = httpx.Timeout(45.0, connect=5.0)  # Gemini can be slower
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{self.settings.GOOGLE_BASE_URL}/models/{self.settings.GOOGLE_MODEL}:generateContent?key={self.settings.GOOGLE_API_KEY}",
                json=payload,
                timeout=timeout
            )
            
            response.raise_for_status()
            result = response.json()
            
            if "candidates" in result and len(result["candidates"]) > 0:
                candidate = result["candidates"][0]
                
                # Check if generation was blocked or incomplete
                finish_reason = candidate.get("finishReason")
                if finish_reason in ["SAFETY", "RECITATION"]:
                    raise Exception(f"Gemini blocked generation: {finish_reason}")
                elif finish_reason == "MAX_TOKENS":
                    logger.warning("⚠️ Gemini response was truncated due to length limit")
                
                if "content" in candidate and "parts" in candidate["content"]:
                    content = candidate["content"]["parts"][0]["text"]
                    return content
                else:
                    raise Exception("Invalid content structure from Gemini")
            else:
                raise Exception("No candidates in Gemini response")
    
    async def _call_ollama(self, prompt: str, system_prompt: str, max_tokens: int, temperature: float) -> Optional[str]:
        """Call local Ollama API"""
        try:
            # Quick health check
            async with httpx.AsyncClient(timeout=3.0) as client:
                health = await client.get(f"{self.settings.OLLAMA_BASE_URL}/api/tags")
                if health.status_code != 200:
                    raise Exception("Ollama service not available")
            
            payload = {
                "model": self.settings.OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "num_predict": max_tokens,
                    "temperature": temperature,
                    "stop": ["</response>", "<|end|>"]
                }
            }
            
            if system_prompt:
                payload["system"] = system_prompt
            
            timeout = httpx.Timeout(120.0, connect=10.0)  # Ollama can be slow
            
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    f"{self.settings.OLLAMA_BASE_URL}/api/generate",
                    json=payload,
                    timeout=timeout
                )
                
                response.raise_for_status()
                result = response.json()
                
                if "response" in result:
                    return result["response"]
                else:
                    raise Exception("Invalid response from Ollama")
                    
        except httpx.ConnectError:
            raise Exception("Cannot connect to Ollama - ensure it's running")
        except httpx.TimeoutException:
            raise Exception("Ollama request timed out")
    
    async def get_provider_status(self) -> Dict[str, bool]:
        """Check status of all providers"""
        status = {}
        
        # Check Groq
        try:
            if self.settings.GROQ_API_KEY:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    response = await client.get(
                        f"{self.settings.GROQ_BASE_URL}/models",
                        headers={"Authorization": f"Bearer {self.settings.GROQ_API_KEY}"}
                    )
                    status["groq"] = response.status_code == 200
            else:
                status["groq"] = False
        except:
            status["groq"] = False
        
        # Check Gemini
        try:
            if self.settings.GOOGLE_API_KEY:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    response = await client.get(
                        f"{self.settings.GOOGLE_BASE_URL}/models?key={self.settings.GOOGLE_API_KEY}"
                    )
                    status["gemini"] = response.status_code == 200
            else:
                status["gemini"] = False
        except:
            status["gemini"] = False
        
        # Check Ollama
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                response = await client.get(f"{self.settings.OLLAMA_BASE_URL}/api/tags")
                status["ollama"] = response.status_code == 200
        except:
            status["ollama"] = False
        
        return status

# Global instance
llm_manager = LLMManager()