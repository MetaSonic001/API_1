#!/usr/bin/env python3
"""
Quick test script to validate the demo plan creation
"""
import asyncio
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def test_demo_plan():
    try:
        from api.travel import _get_demo_plan
        
        print("Testing demo plan creation...")
        result = await _get_demo_plan('demo-paris-001')
        
        print('✅ Demo plan created successfully!')
        print(f'Trip ID: {result.trip_id}')
        print(f'Destination: {result.destination_info.name}')
        print(f'Daily plans: {len(result.daily_plans)}')
        print(f'Budget total: {result.estimated_budget.total} {result.estimated_budget.currency}')
        print(f'Safety info: {len(result.safety_info.general_safety)} safety tips')
        
        return True
        
    except Exception as e:
        print(f'❌ Error: {e}')
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_demo_plan())
    sys.exit(0 if success else 1)