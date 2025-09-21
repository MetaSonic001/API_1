"""
api/travel.py - Travel Planning API Endpoints
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File, Request
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from models.travel_request import TravelPlanningRequest, TravelMode
from models.travel_response import TravelPlanResponse, ReplanningRequest
from services.travel_service import TravelPlanningService
from utils.logger import get_logger
from fastapi.responses import Response
import time
from collections import defaultdict

logger = get_logger(__name__)
router = APIRouter()

# Initialize service
travel_service = TravelPlanningService()

# Simple rate limiting
rate_limit_store = defaultdict(list)
RATE_LIMIT_REQUESTS = 10  # requests per minute
RATE_LIMIT_WINDOW = 60  # seconds

def check_rate_limit(client_ip: str) -> bool:
    """Simple rate limiting check"""
    now = time.time()
    # Clean old requests
    rate_limit_store[client_ip] = [req_time for req_time in rate_limit_store[client_ip] 
                                   if now - req_time < RATE_LIMIT_WINDOW]
    
    # Check if under limit
    if len(rate_limit_store[client_ip]) >= RATE_LIMIT_REQUESTS:
        return False
    
    # Add current request
    rate_limit_store[client_ip].append(now)
    return True

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
async def get_travel_plan(trip_id: str, request: Request) -> TravelPlanResponse:
    """Get existing travel plan by ID"""
    try:
        # Get client IP for rate limiting
        client_ip = request.client.host if request.client else "unknown"
        
        # Block spam IP temporarily
        spam_ips = ["103.139.247.91"]
        if client_ip in spam_ips:
            logger.warning(f"Blocked spam IP: {client_ip}")
            raise HTTPException(status_code=403, detail="IP blocked due to excessive requests")
        
        # TEMPORARILY DISABLED - Check rate limit
        # if not check_rate_limit(client_ip):
        #     logger.warning(f"Rate limit exceeded for {client_ip} requesting {trip_id}")
        #     raise HTTPException(status_code=429, detail="Too many requests")
        
        logger.info(f"Fetching travel plan: {trip_id} from IP: {client_ip}")
        
        # Check if it's a demo plan
        if trip_id.startswith("demo-"):
            return await _get_demo_plan(trip_id)
        
        # For now, return a basic error since storage isn't implemented
        # In a real implementation, this would fetch from database
        logger.warning(f"Travel plan storage not implemented yet for: {trip_id}")
        raise HTTPException(status_code=404, detail=f"Plan {trip_id} not found - storage not implemented")
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error fetching travel plan {trip_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

async def _get_demo_plan(trip_id: str) -> TravelPlanResponse:
    """Return a demo travel plan for testing"""
    from datetime import datetime, timedelta, date
    from models.travel_response import (
        LocationInfo, BudgetBreakdown, SafetyInfo, DayPlan, 
        ActivityBlock, AccommodationOption, DiningOption, TransportOption
    )
    
    demo_plans = {
        "demo-paris-001": {
            "destination": "Paris, France",
            "summary": "A 3-day cultural and culinary adventure in the City of Light",
            "start_date": datetime.now().date(),
            "end_date": (datetime.now() + timedelta(days=3)).date(),
        }
    }
    
    if trip_id in demo_plans:
        plan_data = demo_plans[trip_id]
        
        # Create destination info
        destination_info = LocationInfo(
            name=plan_data["destination"],
            coordinates=[48.8566, 2.3522],  # Paris coordinates
            type="city"
        )
        
        # Create budget breakdown
        budget = BudgetBreakdown(
            total=750.0,
            currency="EUR",
            transport=150.0,
            accommodation=300.0,
            food=200.0,
            activities=75.0,
            shopping=25.0,
            contingency=0.0
        )
        
        # Create safety info
        safety_info = SafetyInfo(
            general_safety=["Keep belongings secure", "Be aware of pickpockets in tourist areas"],
            health_advisories=["No special health requirements"],
            emergency_contacts={"Police": "17", "Medical": "15", "Fire": "18"},
            accessibility_notes=["Most metro stations have elevator access", "Museums offer wheelchair access"]
        )
        
        # Create activity blocks
        eiffel_activity = ActivityBlock(
            start_time="09:00",
            end_time="11:00",
            activity="Visit Eiffel Tower",
            location=LocationInfo(name="Eiffel Tower", coordinates=[48.8584, 2.2945], type="landmark"),
            description="Iconic iron tower with city views",
            cost=25.0,
            booking_required=True,
            alternatives=["Trocadéro Gardens viewpoint"]
        )
        
        louvre_activity = ActivityBlock(
            start_time="14:00",
            end_time="17:00",
            activity="Louvre Museum",
            location=LocationInfo(name="Louvre Museum", coordinates=[48.8606, 2.3376], type="museum"),
            description="World's largest art museum",
            cost=17.0,
            booking_required=True,
            alternatives=["Musée d'Orsay"]
        )
        
        # Create daily plans
        daily_plans = [
            DayPlan(
                date=plan_data["start_date"],
                theme="Iconic Paris",
                morning=[eiffel_activity],
                afternoon=[louvre_activity],
                evening=[],
                total_cost=42.0,
                travel_time_minutes=60
            )
        ]
        
        # Create accommodation options
        accommodations = [
            AccommodationOption(
                name="Hotel Malte Opera",
                type="hotel",
                location=LocationInfo(name="Opera District", coordinates=[48.8706, 2.3355], type="area"),
                price_per_night=120.0,
                amenities=["WiFi", "24h Reception", "Breakfast"],
                rating=4.2,
                accessibility_features=["Elevator", "Wheelchair accessible rooms"]
            )
        ]
        
        # Create dining options
        dining = [
            DiningOption(
                name="L'Ami Jean",
                cuisine_type="French",
                location=LocationInfo(name="7th Arrondissement", coordinates=[48.8584, 2.3055], type="area"),
                price_range="€€€",
                rating=4.5,
                specialties=["Coq au vin", "Duck confit"],
                dietary_options=["Vegetarian options available"]
            )
        ]
        
        # Create transport options
        transport = [
            TransportOption(
                type="train",
                provider="RER B",
                departure_time=datetime.now(),
                arrival_time=datetime.now() + timedelta(minutes=45),
                duration_minutes=45,
                price=12.0,
                carbon_footprint="Low"
            )
        ]
        
        return TravelPlanResponse(
            trip_id=trip_id,
            destination_info=destination_info,
            summary=plan_data["summary"],
            total_duration_days=3,
            estimated_budget=budget,
            daily_plans=daily_plans,
            transport_options=transport,
            accommodation_options=accommodations,
            dining_recommendations=dining,
            audio_tour_segments=[],
            ar_ready_pois=[],
            safety_info=safety_info,
            weather_forecast={},
            live_events=[],
            alternative_plans=[],
            generated_at=datetime.now(),
            confidence_score=0.85,
            sources=["Demo data"]
        )
    else:
        raise HTTPException(status_code=404, detail=f"Demo plan {trip_id} not found")

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
        # Quick start implementation
        return {"message": "Quick start feature coming soon"}
    except Exception as e:
        logger.error(f"Error in quick start: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rate-limit-status")
async def get_rate_limit_status(request: Request):
    """Get current rate limit status for client"""
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # Count recent requests
    recent_requests = [req_time for req_time in rate_limit_store[client_ip] 
                      if now - req_time < RATE_LIMIT_WINDOW]
    
    return {
        "client_ip": client_ip,
        "requests_in_last_minute": len(recent_requests),
        "rate_limit": RATE_LIMIT_REQUESTS,
        "window_seconds": RATE_LIMIT_WINDOW,
        "requests_remaining": max(0, RATE_LIMIT_REQUESTS - len(recent_requests))
    }
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

@router.post("/plan/{trip_id}/book")
async def book_trip_items(
    trip_id: str,
    items: List[Dict[str, Any]],
    user_email: str = "demo@tripcraft.ai"
) -> JSONResponse:
    """Book multiple items from a trip plan"""
    try:
        from services.booking_agent import MockBookingAgent
        
        booking_agent = MockBookingAgent()
        confirmations = booking_agent.bulk_book_itinerary(items, user_email)
        
        return JSONResponse(content={
            "trip_id": trip_id,
            "bookings": [
                {
                    "booking_id": conf.booking_id,
                    "status": conf.status.value,
                    "item_name": conf.item.name,
                    "price": conf.item.price,
                    "confirmation_code": conf.confirmation_code
                }
                for conf in confirmations
            ],
            "total_bookings": len(confirmations),
            "note": "These are demo bookings for testing purposes"
        })
        
    except Exception as e:
        logger.error(f"Error booking trip items: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plan/{trip_id}/download")
async def download_offline_package(trip_id: str) -> Response:
    """Download offline travel package"""
    try:
        from services.offline_builder import OfflinePackageBuilder
        
        # This would normally fetch the trip from database
        # For demo, return a simple package
        builder = OfflinePackageBuilder()
        
        # Create minimal package
        zip_content = b"Demo offline package content"
        
        return Response(
            content=zip_content,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename=trip_{trip_id}.zip"}
        )
        
    except Exception as e:
        logger.error(f"Error creating offline package: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/plan/{trip_id}/verify")
async def verify_trip_facts(trip_id: str, claims: List[str]) -> JSONResponse:
    """Verify factual claims in trip plan"""
    try:
        from services.verify_service import FactVerificationService
        
        verification_service = FactVerificationService()
        citations = await verification_service.verify_claims(claims, top_k=3)
        
        return JSONResponse(content={
            "trip_id": trip_id,
            "verified_claims": [
                {
                    "claim": claim,
                    "citations": [
                        {
                            "url": cite.url,
                            "title": cite.title,
                            "confidence": cite.confidence_score,
                            "domain": cite.domain
                        }
                        for cite in claim_citations
                    ]
                }
                for claim, claim_citations in zip(claims, citations)
            ]
        })
        
    except Exception as e:
        logger.error(f"Error verifying trip facts: {e}")
        raise HTTPException(status_code=500, detail=str(e))



async def _post_process_plan(trip_id: str, realtime_enabled: bool):
    """Background task for post-processing travel plans"""
    try:
        if realtime_enabled:
            logger.info(f"Setting up real-time monitoring for trip {trip_id}")
        # Additional processing logic here
    except Exception as e:
        logger.error(f"Error in post-processing: {e}")