from agents.base import BaseAgent
from tools.browser import browse_url

ACCOM_INSTRUCTIONS = """
Suggest accommodations. Browse free sites like Booking.com alternatives or mock.
Output JSON: {'hotels': [{'name': str, 'price': float, ...}]}
"""

accommodation_agent = BaseAgent("Accommodation", ACCOM_INSTRUCTIONS)

async def run(self, input_text: str) -> str:
    browse_result = await browse_url("https://www.hostelworld.com/search?search_keywords=" + input_text.split()[0])
    return super().run(str(browse_result))
accommodation_agent.run = run.__get__(accommodation_agent)