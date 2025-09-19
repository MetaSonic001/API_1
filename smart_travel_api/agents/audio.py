from agents.base import BaseAgent

AUDIO_INSTRUCTIONS = """
Generate audio tour text. Cohesive narrative for location/interests.
Output text string.
"""

audio_agent = BaseAgent("Audio", AUDIO_INSTRUCTIONS)