from agents.base import BaseAgent
from services.vector_store import search_pois
from tools.search import web_search

DESTINATION_INSTRUCTIONS = """
Explore destination: Fetch attractions, events from Qdrant and web search.
Output JSON: {'attractions': [...], 'events': [...]}
"""

destination_agent = BaseAgent("Destination", DESTINATION_INSTRUCTIONS)

# Override run to use tools
def run(self, input_text: str) -> str:
    pois = search_pois(input_text)
    web_results = web_search(input_text + " attractions events")
    combined = str(pois) + str(web_results)
    return super().run(combined)
destination_agent.run = run.__get__(destination_agent)  # Bind