from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import Dict, List, Optional
from loguru import logger
from datetime import datetime

from app.models.requests import TravelRequest
from app.models.responses import TravelResponse
from app.agents.graph import travel_graph
from app.services.realtime_monitor import RealtimeMonitor
from app.core.security import get_current_user
from app.utils.validators import validate_travel_request

router = APIRouter()


@router.post("/plan", response_model=TravelResponse)
async def create_travel_plan(
    request: TravelRequest,
    background_tasks: BackgroundTasks,
    user_id: Optional[str] = Depends(get_current_user)
):
    """Create a comprehensive travel plan"""
    try:
        # Validate request
        validation_result = await validate_travel_request(request)
        if not validation_result.is_valid:
            raise HTTPException(status_code=400, detail=validation_result.errors)

        # Initialize travel graph
        inputs = request.dict()
        inputs["user_id"] = user_id
        inputs["session_id"] = f"{user_id}_{datetime.now().isoformat()}"

        # Run travel planning graph
        result = await travel_graph.run(inputs, inputs["session_id"])

        # Add to real-time monitoring
        monitor = RealtimeMonitor()
        background_tasks.add_task(
            monitor.add_session,
            result["session_id"],
            result["itinerary"]
        )

        return TravelResponse(**result)

    except Exception as e:
        logger.error(f"Error creating travel plan: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/plan/voice")
async def create_plan_from_voice(
    voice_file: bytes,
    background_tasks: BackgroundTasks,
    user_id: Optional[str] = Depends(get_current_user)
):
    """Create travel plan from voice input"""
    from app.services.voice_processor import VoiceProcessor

    try:
        # Process voice input
        voice_processor = VoiceProcessor()
        text_request = await voice_processor.process_voice(voice_file)

        # Convert to travel request
        travel_request = await voice_processor.extract_travel_details(text_request)

        # Create plan
        return await create_travel_plan(
            TravelRequest(**travel_request),
            background_tasks,
            user_id
        )

    except Exception as e:
        logger.error(f"Error processing voice input: {str(e)}")
        raise HTTPException(status_code=500, detail="Voice processing failed")


@router.post("/plan/moodboard")
async def create_plan_from_moodboard(
    images: List[bytes],
    background_tasks: BackgroundTasks,
    user_id: Optional[str] = Depends(get_current_user)
):
    """Create travel plan from moodboard images"""
    from app.services.image_processor import ImageProcessor

    try:
        # Process images
        image_processor = ImageProcessor()
        travel_preferences = await image_processor.analyze_moodboard_style(images)

        # Convert to travel request
        travel_request = TravelRequest(
            destination=travel_preferences.get("preferences", {}).get("destination"),
            duration=travel_preferences.get("preferences", {}).get("duration", 7),
            vibes=travel_preferences.get("preferences", {}).get("vibes", []),
            interests=travel_preferences.get("preferences", {}).get("interests", []),
            budget=travel_preferences.get("preferences", {}).get(
                "budget", {"amount": 1000, "currency": "USD"}
            )
        )

        # Create plan
        return await create_travel_plan(
            travel_request,
            background_tasks,
            user_id
        )

    except Exception as e:
        logger.error(f"Error processing moodboard: {str(e)}")
        raise HTTPException(status_code=500, detail="Image processing failed")


@router.get("/plan/{session_id}")
async def get_travel_plan(
    session_id: str,
    user_id: Optional[str] = Depends(get_current_user)
):
    """Get travel plan by session ID"""
    from app.utils.cache import get_cache

    try:
        result = await get_cache(f"itinerary:{session_id}")
        if not result:
            raise HTTPException(status_code=404, detail="Plan not found")

        return result

    except Exception as e:
        logger.error(f"Error retrieving travel plan: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/plan/{session_id}/update")
async def update_travel_plan(
    session_id: str,
    updates: Dict,
    user_id: Optional[str] = Depends(get_current_user)
):
    """Update travel plan with user modifications"""
    from app.utils.cache import get_cache
    from app.agents.graph import travel_graph

    try:
        # Update state and rerun graph
        inputs = await get_cache(f"itinerary:{session_id}")
        inputs.update(updates)
        result = await travel_graph.run(inputs, session_id)

        return result

    except Exception as e:
        logger.error(f"Error updating travel plan: {str(e)}")
        raise HTTPException(status_code=500, detail="Update failed")


@router.post("/plan/{session_id}/book")
async def book_travel_plan(
    session_id: str,
    user_id: Optional[str] = Depends(get_current_user)
):
    """Book all components of travel plan"""
    from app.services.booking_service import BookingService

    try:
        booking_service = BookingService()
        booking_result = await booking_service.book_itinerary(session_id, user_id)

        return booking_result

    except Exception as e:
        logger.error(f"Error booking travel plan: {str(e)}")
        raise HTTPException(status_code=500, detail="Booking failed")
