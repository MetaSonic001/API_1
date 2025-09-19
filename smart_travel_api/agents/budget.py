from agents.base import BaseAgent

BUDGET_INSTRUCTIONS = """
Optimize budget. Sum costs, suggest adjustments.
Output JSON: {'total': float, 'breakdown': {...}, 'adjustments': [...]}
"""

budget_agent = BaseAgent("Budget", BUDGET_INSTRUCTIONS)