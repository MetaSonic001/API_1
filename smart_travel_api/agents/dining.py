from agents.base import BaseAgent

DINING_INSTRUCTIONS = """
Curate restaurants/food tours. Use search for options.
Output JSON: {'restaurants': [{'name': str, 'cuisine': str, ...}]}
"""

dining_agent = BaseAgent("Dining", DINING_INSTRUCTIONS)

def run(self, input_text: str) -> str:
    search_results = web_search(input_text + " restaurants food tours")
    return super().run(str(search_results))
dining_agent.run = run.__get__(dining_agent)