import aiohttp
from geopy.geocoders import Nominatim  # Free Nominatim

geolocator = Nominatim(user_agent="smart_travel_app")

async def get_weather(location: str):
    # Geocode location
    geo = geolocator.geocode(location)
    if not geo:
        return {}
    lat, lon = geo.latitude, geo.longitude
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            return await resp.json() if resp.status == 200 else {}