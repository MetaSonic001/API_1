from event_bus import EventBus  # Open-source library
import asyncio
from tools.weather import get_weather

bus = EventBus()  # Singleton event bus

# Subscribers example
@bus.on('weather')
async def handle_weather(data):
    # Trigger replan
    print(f"Replanning for weather: {data}")

async def poll():
    while True:
        for trip_id, info in trips.items():  # Assume global trips dict
            weather = await get_weather(info['location'])
            if "rain" in str(weather):  # Simplified
                bus.emit('weather', {'trip_id': trip_id, 'location': info['location'], 'original_plan': info['plan']})
        await asyncio.sleep(300)

# Start poller
asyncio.create_task(poll())

# Register: bus.on('event', callback)
# Publish: bus.emit('event', data)