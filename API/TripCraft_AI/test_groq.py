#!/usr/bin/env python3
"""
Test Groq Cloud API integration
"""
import asyncio
import sys
import os

# Add the project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.groq_client import groq_client

async def test_groq():
    """Test Groq API functionality"""
    print("🚀 Testing Groq Cloud API Integration")
    print("=" * 50)
    
    # Test 1: Health check
    print("1. Testing Groq API health...")
    health = await groq_client.check_health()
    if health:
        print("✅ Groq API is accessible")
    else:
        print("❌ Groq API health check failed")
        return False
    
    # Test 2: Simple generation
    print("\n2. Testing simple generation...")
    simple_prompt = "Hello! Please respond with just 'Hello back!'"
    
    result = await groq_client.generate(
        prompt=simple_prompt,
        max_tokens=50,
        temperature=0.1
    )
    
    if result:
        print(f"✅ Simple generation successful")
        print(f"   Response: {result[:100]}...")
    else:
        print("❌ Simple generation failed")
        return False
    
    # Test 3: Travel planning prompt
    print("\n3. Testing travel planning prompt...")
    travel_prompt = """Generate a brief travel recommendation for Paris, France.
    Include:
    - 2 must-see attractions
    - 1 restaurant recommendation
    - 1 travel tip
    
    Keep the response concise and under 150 words."""
    
    result = await groq_client.generate(
        prompt=travel_prompt,
        max_tokens=200,
        temperature=0.7
    )
    
    if result:
        print(f"✅ Travel prompt successful")
        print(f"   Response length: {len(result)} characters")
        print(f"   Preview: {result[:200]}...")
    else:
        print("❌ Travel prompt failed")
        return False
    
    # Test 4: With system prompt
    print("\n4. Testing with system prompt...")
    system_prompt = "You are a helpful travel assistant. Always be concise and practical."
    user_prompt = "What's the best time to visit Japan?"
    
    result = await groq_client.generate(
        prompt=user_prompt,
        system_prompt=system_prompt,
        max_tokens=100,
        temperature=0.5
    )
    
    if result:
        print(f"✅ System prompt test successful")
        print(f"   Response: {result[:150]}...")
    else:
        print("❌ System prompt test failed")
        return False
    
    print("\n🎉 All Groq tests passed! API is working correctly.")
    return True

if __name__ == "__main__":
    async def main():
        success = await test_groq()
        if not success:
            print("\n❌ Some tests failed. Check your Groq API configuration.")
            sys.exit(1)
        else:
            print("\n✨ Groq integration is ready for use!")
    
    asyncio.run(main())