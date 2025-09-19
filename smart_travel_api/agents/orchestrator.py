from langgraph.graph import StateGraph, START, END
from agents.planner import planner_agent
from agents.destination import destination_agent
from agents.transport import transport_agent
from agents.accommodation import accommodation_agent
from agents.dining import dining_agent
from agents.budget import budget_agent
from agents.audio import audio_agent
from agents.safety import safety_agent
import asyncio
from typing import TypedDict, Dict

class AgentState(TypedDict):
    request: Dict
    plan: str
    dest: str
    transport: str
    accom: str
    dining: str
    budget: str
    audio: str
    safety: str

def orchestrate(request: Dict):
    graph = StateGraph(AgentState)
    def planner_node(state: AgentState) -> AgentState:
        plan = planner_agent.run(str(state['request']))
        return {"plan": plan}

    def destination_node(state: AgentState) -> AgentState:
        dest = destination_agent.run(state['plan'])
        return {"dest": dest}

    def transport_node(state: AgentState) -> AgentState:
        transport = transport_agent.run(state['plan'] + state['dest'])
        return {"transport": transport}

    def accommodation_node(state: AgentState) -> AgentState:
        accom = accommodation_agent.run(state['plan'] + state['dest'])
        return {"accom": accom}

    def dining_node(state: AgentState) -> AgentState:
        dining = dining_agent.run(state['plan'] + state['dest'])
        return {"dining": dining}

    def budget_node(state: AgentState) -> AgentState:
        budget = budget_agent.run(str(state))
        return {"budget": budget}

    def audio_node(state: AgentState) -> AgentState:
        audio = audio_agent.run(state['dest'])
        return {"audio": audio}

    def safety_node(state: AgentState) -> AgentState:
        safety = safety_agent.run(state['dest'])
        return {"safety": safety}

    graph.add_node("planner", planner_node)
    graph.add_node("destination", destination_node)
    graph.add_node("transport", transport_node)
    graph.add_node("accommodation", accommodation_node)
    graph.add_node("dining", dining_node)
    graph.add_node("budget", budget_node)
    graph.add_node("audio", audio_node)
    graph.add_node("safety", safety_node)

    graph.add_edge("planner", "destination")
    graph.add_edge("destination", "transport")
    graph.add_edge("transport", "accommodation")
    graph.add_edge("accommodation", "dining")
    graph.add_edge("dining", "budget")
    graph.add_edge("budget", "audio")
    graph.add_edge("audio", "safety")
    graph.add_edge("safety", END)

    graph.set_entry_point("planner")

    compiled_graph = graph.compile()
    return compiled_graph.invoke({"request": request})