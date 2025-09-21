#!/usr/bin/env python3
"""
Test script to verify Ollama connectivity and performance
"""
import asyncio
import httpx
import time
from config.settings import get_settings

async def test_ollama_connection():
    """Test Ollama connectivity and basic functionality"""
    settings = get_settings()
    
    print("🔍 Testing Ollama connection...")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Test 1: Check if Ollama is running
            print("1. Checking Ollama service status...")
            response = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            if response.status_code == 200:
                models = response.json()
                print(f"✅ Ollama is running with {len(models['models'])} models")
                for model in models['models']:
                    print(f"   - {model['name']} ({model['details']['parameter_size']})")
            else:
                print("❌ Ollama service not responding")
                return False
                
            # Test 2: Test model loading with simple prompt
            print("\n2. Testing simple generation...")
            start_time = time.time()
            
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": "Hello, respond with just 'Hi!'",
                    "stream": False,
                    "options": {
                        "num_predict": 10,
                        "temperature": 0.1
                    }
                },
                timeout=30.0
            )
            
            end_time = time.time()
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Simple generation successful in {end_time - start_time:.2f}s")
                print(f"   Response: {result.get('response', 'No response')}")
            else:
                print(f"❌ Simple generation failed: {response.status_code}")
                print(f"   Error: {response.text}")
                return False
                
            # Test 3: Test complex travel prompt
            print("\n3. Testing travel planning prompt...")
            start_time = time.time()
            
            travel_prompt = """Generate a brief travel suggestion for Paris, France.
Include 2 attractions and 1 dining recommendation.
Keep the response under 100 words and format as JSON with keys: attractions, dining."""
            
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": travel_prompt,
                    "stream": False,
                    "options": {
                        "num_predict": 200,
                        "temperature": 0.7
                    }
                },
                timeout=60.0
            )
            
            end_time = time.time()
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Travel prompt successful in {end_time - start_time:.2f}s")
                print(f"   Response length: {len(result.get('response', ''))} characters")
            else:
                print(f"❌ Travel prompt failed: {response.status_code}")
                print(f"   Error: {response.text}")
                return False
                
            # Test 4: Test embedding model
            print("\n4. Testing embedding model...")
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/embeddings",
                json={
                    "model": settings.OLLAMA_EMBED_MODEL,
                    "prompt": "travel destination"
                },
                timeout=15.0
            )
            
            if response.status_code == 200:
                result = response.json()
                embedding = result.get('embedding', [])
                print(f"✅ Embedding successful, dimension: {len(embedding)}")
            else:
                print(f"❌ Embedding failed: {response.status_code}")
                
            return True
            
    except httpx.TimeoutException:
        print("❌ Request timed out - Ollama might be overloaded")
        return False
    except httpx.ConnectError:
        print("❌ Cannot connect to Ollama - check if it's running on http://localhost:11434")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

async def warm_up_ollama():
    """Warm up Ollama by loading the model"""
    settings = get_settings()
    
    print("\n🔥 Warming up Ollama...")
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Send a simple request to load the model into memory
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": "warm up",
                    "stream": False,
                    "options": {"num_predict": 1}
                }
            )
            
            if response.status_code == 200:
                print("✅ Model warmed up successfully")
            else:
                print(f"⚠️ Warm up warning: {response.status_code}")
                
    except Exception as e:
        print(f"⚠️ Warm up error: {e}")

if __name__ == "__main__":
    async def main():
        print("🚀 Ollama Diagnostics for TripCraft AI")
        print("=" * 50)
        
        # Test basic connectivity
        if await test_ollama_connection():
            print("\n🎉 All tests passed! Ollama is working correctly.")
            
            # Warm up the model
            await warm_up_ollama()
            
            print("\n💡 Tips for better performance:")
            print("   - Keep Ollama running in the background")
            print("   - Use smaller prompts when possible")
            print("   - Consider using streaming for long responses")
            print("   - Monitor GPU memory usage")
        else:
            print("\n❌ Some tests failed. Check Ollama installation and configuration.")
            
    asyncio.run(main())