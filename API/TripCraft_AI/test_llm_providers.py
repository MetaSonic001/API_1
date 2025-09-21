#!/usr/bin/env python3
"""
test_llm_providers.py - Test all LLM providers
"""
import asyncio
from services.llm_manager import llm_manager

async def test_providers():
    """Test all LLM providers"""
    print("🧪 Testing LLM Providers")
    print("=" * 50)
    
    # Test simple generation
    test_prompt = "Say hello and mention which AI model you are."
    
    print("📝 Test prompt:", test_prompt)
    print("\n🚀 Starting three-tier fallback test...")
    
    result = await llm_manager.generate_text(
        prompt=test_prompt,
        max_tokens=100,
        temperature=0.7
    )
    
    print(f"\n📊 Result:")
    print(f"✅ Success: {result['success']}")
    print(f"🤖 Provider: {result['provider']}")
    print(f"📄 Content: {result['content'][:200]}{'...' if len(result['content']) > 200 else ''}")
    
    if not result['success']:
        print(f"❌ Errors: {result['errors']}")
    
    # Test provider status
    print(f"\n🔍 Provider Status:")
    status = await llm_manager.get_provider_status()
    for provider, available in status.items():
        emoji = "✅" if available else "❌"
        print(f"  {emoji} {provider.title()}: {'Available' if available else 'Unavailable'}")

if __name__ == "__main__":
    asyncio.run(test_providers())