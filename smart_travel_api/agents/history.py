from agents.base import BaseAgent

HISTORY_INSTRUCTIONS = """
Historical content for audio tours. Conversational, detailed.
"""

history_agent = BaseAgent("History", HISTORY_INSTRUCTIONS)