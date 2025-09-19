from agents.base import BaseAgent

SAFETY_INSTRUCTIONS = """
Provide safety advisories, accessibility, health notices.
Output JSON: {'advisories': [...], 'accessibility': {...}}
"""

safety_agent = BaseAgent("Safety", SAFETY_INSTRUCTIONS)

def run(self, input_text: str) -> str:
    search_results = web_search(input_text + " travel safety accessibility")
    return super().run(str(search_results))
safety_agent.run = run.__get__(safety_agent)