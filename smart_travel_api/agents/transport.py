from agents.base import BaseAgent
import asyncio
from tools.crawl import crawl_url

TRANSPORT_INSTRUCTIONS = """
Plan flights/trains/local transit. Crawl free sites for options.
Output JSON: {'options': [{'type': 'flight', 'price': float, ...}]}
"""

transport_agent = BaseAgent("Transport", TRANSPORT_INSTRUCTIONS)

async def run(self, input_text: str) -> str:
    crawl_result = await crawl_url("https://www.rome2rio.com/", "Extract transport options for " + input_text)
    return super().run(str(crawl_result))
transport_agent.run = run.__get__(transport_agent)