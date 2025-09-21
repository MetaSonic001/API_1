"""
services/groq_client.py - Groq Cloud API Client
"""
import httpx
import asyncio
from typing import Optional, Dict, Any
from config.settings import get_settings

class GroqClient:
    """Fast Groq Cloud API client for LLM operations"""
    
    def __init__(self):
        self.settings = get_settings()
        self.base_url = self.settings.GROQ_BASE_URL
        self.api_key = self.settings.GROQ_API_KEY
        self.model = self.settings.GROQ_MODEL
        self.is_available = True
        self._lock = asyncio.Lock()
    
    async def check_health(self) -> bool:
        """Quick health check for Groq API"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(
                    f"{self.base_url}/models",
                    headers={"Authorization": f"Bearer {self.api_key}"}
                )
                self.is_available = response.status_code == 200
                return self.is_available
        except Exception as e:
            print(f"Groq health check failed: {e}")
            self.is_available = False
            return False
    
    async def generate(self, 
                      prompt: str, 
                      system_prompt: str = "", 
                      max_tokens: int = 1000,
                      temperature: float = 0.7) -> Optional[str]:
        """Generate text using Groq API (OpenAI compatible)"""
        
        if not self.is_available:
            if not await self.check_health():
                return None
        
        try:
            # Prepare messages in OpenAI format
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            payload = {
                "model": self.model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "stream": False,
                "stop": ["</response>", "<|end|>", "---"]
            }
            
            timeout = httpx.Timeout(30.0, connect=5.0)  # Groq is much faster
            
            async with httpx.AsyncClient(timeout=timeout) as client:
                print(f"🚀 Calling Groq API with {self.model}...")
                
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    if "choices" in result and len(result["choices"]) > 0:
                        content = result["choices"][0]["message"]["content"]
                        print(f"✅ Groq response received ({len(content)} chars)")
                        return content
                    else:
                        print("❌ No choices in Groq response")
                        return None
                        
                elif response.status_code == 429:
                    print("⚠️ Groq rate limit exceeded")
                    self.is_available = False
                    return None
                    
                else:
                    print(f"❌ Groq API error: {response.status_code}")
                    print(f"Response: {response.text}")
                    self.is_available = False
                    return None
                    
        except httpx.TimeoutException:
            print("⏱️ Groq request timed out")
            return None
        except Exception as e:
            print(f"❌ Groq API error: {e}")
            self.is_available = False
            return None
    
    async def generate_with_retry(self, 
                                 prompt: str, 
                                 system_prompt: str = "", 
                                 max_tokens: int = 1000,
                                 temperature: float = 0.7,
                                 retries: int = 2) -> Optional[str]:
        """Generate with retry logic"""
        
        for attempt in range(retries + 1):
            result = await self.generate(prompt, system_prompt, max_tokens, temperature)
            
            if result is not None:
                return result
            
            if attempt < retries:
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"🔄 Retrying Groq request in {wait_time}s (attempt {attempt + 1}/{retries + 1})")
                await asyncio.sleep(wait_time)
        
        print("❌ All Groq retry attempts failed")
        return None

# Global instance
groq_client = GroqClient()