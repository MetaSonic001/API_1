from fastapi import APIRouter, Query
from models.schemas import SafetyRequest, VerifyFactRequest
from agents.safety import safety_agent
from tools.search import web_search

router = APIRouter()

@router.post("/safety")
async def get_safety(request: SafetyRequest = Body(...)):
    return safety_agent.run(request.location)

@router.get("/verify")
async def verify_fact(fact: str = Query(...)):
    sources = web_search(fact)
    confidence = 0.8  # Mock; use embedding sim
    return {"sources": sources, "confidence": confidence}