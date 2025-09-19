"""
api/travel.py - Travel Planning API Endpoints
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.responses import JSONResponse
from typing import List, Optional
from models.travel_request import TravelPlanningRequest, TravelMode
from models.travel_response import TravelPlanResponse, ReplanningRequest
from services.travel_service import TravelPlanningService
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

# Initialize service
travel_service = TravelPlanningService()

@router.post("/plan", response_model=TravelPlanResponse)
async def create_travel_plan(
    request: TravelPlanningRequest,
    background_tasks: BackgroundTasks
) -> TravelPlanResponse:
    """Create a comprehensive travel plan"""
    try:
        logger.info(f"Creating travel plan for destination: {request.destination}")
        
        # Create travel plan
        response = await travel_service.create_travel_plan(request)
        
        # Add background task for additional processing if needed
        background_tasks.add_task(
            _post_process_plan, 
            response.trip_id, 
            request.realtime_updates
        )
        
        logger.info(f"Travel plan created successfully: {response.trip_id}")
        return response
        
    except Exception as e:
        logger.error(f"Error creating travel plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plan/{trip_id}")
async def get_travel_plan(trip_id: str) -> TravelPlanResponse:
    """Get existing travel plan by ID"""
    try:
        # Implementation would fetch from database
        raise HTTPException(status_code=404, detail="Plan not found")
    except Exception as e:
        logger.error(f"Error fetching travel plan {trip_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/plan/{trip_id}/replan")
async def replan_trip(trip_id: str, request: ReplanningRequest) -> JSONResponse:
    """Trigger trip replanning based on events"""
    try:
        result = await travel_service.realtime_service.trigger_replanning(
            trip_id, request.event_details
        )
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error replanning trip {trip_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plan/{trip_id}/updates")
async def get_realtime_updates(trip_id: str):
    """Get real-time updates for a trip"""
    try:
        updates = await travel_service.realtime_service.get_updates(trip_id)
        return {"updates": [update.dict() for update in updates]}
    except Exception as e:
        logger.error(f"Error getting updates for trip {trip_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quick-start")
async def quick_start_planning(location: Optional[str] = None):
    """Quick start planning based on current location"""
    try:
        # Create quick start request
        request = TravelPlanningRequest(
            mode=TravelMode.QUICK_START,
            destination=location or "Current Location",
            dates={"start": "today", "end": "today", "flexible": True},
            duration_days=1,
            vibes=["exploration"],
            include_audio_tour=True
        )
        
        response = await travel_service.create_travel_plan(request)
        return response
        
    except Exception as e:
        logger.error(f"Error in quick start planning: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/surprise-me")
async def surprise_me_planning(budget: Optional[float] = 1000, days: Optional[int] = 3):
    """Generate surprise travel plan"""
    try:
        # Create surprise request with random destination logic
        request = TravelPlanningRequest(
            mode=TravelMode.SURPRISE_ME,
            destination="Surprise Destination",
            dates={"start": "flexible", "end": "flexible", "flexible": True},
            duration_days=days,
            budget=budget,
            vibes=["adventure", "cultural"],
            include_audio_tour=True
        )
        
        response = await travel_service.create_travel_plan(request)
        return response
        
    except Exception as e:
        logger.error(f"Error in surprise planning: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def _post_process_plan(trip_id: str, realtime_enabled: bool):
    """Background task for post-processing travel plans"""
    try:
        if realtime_enabled:
            logger.info(f"Setting up real-time monitoring for trip {trip_id}")
        # Additional processing logic here
    except Exception as e:
        logger.error(f"Error in post-processing: {e}")