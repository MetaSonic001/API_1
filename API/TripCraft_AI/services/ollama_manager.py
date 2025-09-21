"""
services/ollama_manager.py - Ollama Model Management
"""
import asyncio
import httpx
from typing import Optional
from config.settings import get_settings

class OllamaManager:
    """Manages Ollama model warming and health checks"""
    
    def __init__(self):
        self.settings = get_settings()
        self.is_warmed_up = False
        self._lock = asyncio.Lock()
    
    async def ensure_model_ready(self) -> bool:
        """Ensure the model is loaded and ready for use"""
        async with self._lock:
            if self.is_warmed_up:
                return True
                
            try:
                print("🔥 Warming up Ollama model...")
                async with httpx.AsyncClient(timeout=15.0) as client:
                    # Check if service is available
                    health = await client.get(f"{self.settings.OLLAMA_BASE_URL}/api/tags", timeout=5.0)
                    if health.status_code != 200:
                        print("❌ Ollama service not available")
                        return False
                    
                    # Warm up the model with a simple request
                    response = await client.post(
                        f"{self.settings.OLLAMA_BASE_URL}/api/generate",
                        json={
                            "model": self.settings.OLLAMA_MODEL,
                            "prompt": "Hi",
                            "stream": False,
                            "options": {"num_predict": 1, "temperature": 0}
                        },
                        timeout=10.0
                    )
                    
                    if response.status_code == 200:
                        self.is_warmed_up = True
                        print("✅ Ollama model ready")
                        return True
                    else:
                        print(f"❌ Model warm-up failed: {response.status_code}")
                        return False
                        
            except Exception as e:
                print(f"❌ Model warm-up error: {e}")
                return False
    
    async def check_health(self) -> bool:
        """Quick health check for Ollama service"""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                response = await client.get(f"{self.settings.OLLAMA_BASE_URL}/api/tags")
                return response.status_code == 200
        except:
            return False
    
    async def generate_optimized(self, prompt: str, system_prompt: str = "", max_tokens: int = 500) -> Optional[str]:
        """Generate text with optimized settings for travel planning"""
        
        # Ensure model is ready
        if not await self.ensure_model_ready():
            return None
            
        try:
            timeout = httpx.Timeout(90.0, connect=5.0)  # 90s total, 5s connect
            
            async with httpx.AsyncClient(timeout=timeout) as client:
                payload = {
                    "model": self.settings.OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "num_predict": max_tokens,
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "top_k": 40,
                        "repeat_penalty": 1.1,
                        "stop": ["</response>", "<|end|>", "---"]
                    }
                }
                
                if system_prompt:
                    payload["system"] = system_prompt
                
                print(f"🤖 Generating response (max {max_tokens} tokens)...")
                response = await client.post(
                    f"{self.settings.OLLAMA_BASE_URL}/api/generate",
                    json=payload
                )
                
                if response.status_code == 200:
                    result = response.json()
                    response_text = result.get("response", "")
                    print(f"✅ Response generated ({len(response_text)} chars)")
                    return response_text
                else:
                    print(f"❌ Generation failed: {response.status_code}")
                    return None
                    
        except httpx.TimeoutException:
            print("⏱️ Generation timed out")
            return None
        except Exception as e:
            print(f"❌ Generation error: {e}")
            return None

# Global instance
ollama_manager = OllamaManager()