# services/event_bus.py
from event_bus import EventBus
import asyncio
from tools.weather import get_weather

bus = EventBus()
trips = {}

@bus.on('weather')
async def handle_weather(data):
    print(f"Replanning for weather: {data}")

async def poll():
    while True:
        for trip_id, info in trips.items():
            weather = await get_weather(info['location'])
            if "rain" in str(weather):
                bus.emit(
                    'weather',
                    {
                        'trip_id': trip_id,
                        'location': info['location'],
                        'original_plan': info['plan']
                    }
                )
        await asyncio.sleep(300)

def start_event_bus():
    # only schedules the task; must be called when loop is running
    asyncio.create_task(poll())
    print("Event bus started, polling for events...")
    return bus
