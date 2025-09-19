from fastapi import APIRouter, Body
from models.schemas import ReplanEvent
from agents.orchestrator import orchestrate
from tools.weather import get_weather

router = APIRouter()

@router.post("/trigger")
async def trigger_replan(event: ReplanEvent = Body(...)):
    if event.type == "weather":
        weather = await get_weather(event.location)
        adjustment = "indoor alternatives" if weather.get("current_weather", {}).get("temperature", 0) < 10 else ""  # Example
        new_plan = orchestrate({"original_plan": event.original_plan, "adjustment": adjustment})
        return {"new_plan": new_plan}
    # Other types...
    return {"error": "Unknown event"}