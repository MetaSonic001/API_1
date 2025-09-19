import aiohttp
from config import OPEN_TRIPMAP_API_KEY

async def book_activity(activity: str, location: str):
    # Enhanced mock: Use OpenTripMap free API for real attraction data/pricing/availability
    url = f"https://api.opentripmap.com/0.1/en/places/name?name={activity}&countrycodes={location.split(',')[0][:2].lower()}&apikey={OPEN_TRIPMAP_API_KEY or ''}"
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            if resp.status == 200:
                data = await resp.json()
                # Mock booking based on real data
                return {
                    "confirmation": "mock_booked_via_opentripmap",
                    "details": data,
                    "price": data.get("rate", {}).get("min_price", 0),  # Real pricing if available
                    "availability": True
                }
            return {"error": "Availability check failed"}