"""
Test the new three-tier LLM fallback system
"""
import asyncio
from services.llm_manager import llm_manager

async def test_llm_fallback():
    """Test all three LLM providers"""
    print("🚀 Testing Three-Tier LLM Fallback System")
    print("=" * 50)
    
    # Test 1: Provider status
    print("1. Checking provider status...")
    status = await llm_manager.get_provider_status()
    for provider, available in status.items():
        status_icon = "✅" if available else "❌"
        print(f"   {status_icon} {provider.upper()}: {'Available' if available else 'Unavailable'}")
    
    print(f"\nAvailable providers: {sum(status.values())}/3")
    
    # Test 2: Simple generation
    print("\n2. Testing simple text generation...")
    test_prompt = "Say hello and mention which AI assistant you are."
    
    result = await llm_manager.generate_text(
        prompt=test_prompt,
        max_tokens=50,
        temperature=0.1
    )
    
    if result["success"]:
        print(f"✅ Success with {result['provider'].upper()}")
        print(f"   Response: {result['content'][:100]}...")
    else:
        print("❌ All providers failed")
        print(f"   Errors: {result['errors']}")
    
    # Test 3: Travel planning prompt
    print("\n3. Testing travel planning prompt...")
    travel_prompt = """Generate a brief 2-day itinerary for Tokyo, Japan. 
Include:
- 2 main attractions per day
- 1 restaurant recommendation per day
- Brief transportation tips
Keep response under 200 words."""
    
    result = await llm_manager.generate_text(
        prompt=travel_prompt,
        max_tokens=300,
        temperature=0.7
    )
    
    if result["success"]:
        print(f"✅ Travel planning successful with {result['provider'].upper()}")
        print(f"   Response length: {len(result['content'])} characters")
        print(f"   Preview: {result['content'][:150]}...")
    else:
        print("❌ Travel planning failed")
        print(f"   Errors: {result['errors']}")
    
    print("\n" + "=" * 50)
    print("Test completed!")

if __name__ == "__main__":
    asyncio.run(test_llm_fallback())