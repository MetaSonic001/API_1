from fastapi import APIRouter, Body
from models.schemas import TravelRequest, TravelResponse
from agents.orchestrator import orchestrate
from icalendar import Calendar
from services.event_bus import event_bus
from tools.multimodal import interpret_image
from services.booking import book_activity

router = APIRouter()

@router.post("/generate", response_model=TravelResponse)
async def generate_plan(request: TravelRequest = Body(...)):
    if request.image_url:
        vibes = interpret_image(request.image_url)
        request.interests.extend(vibes['vibes'])
    itinerary = orchestrate(request.dict())
    # Mock ICS
    cal = Calendar()
    cal.add('prodid', '-//Smart Travel//EN')
    cal.add('version', '2.0')
    # Add events from itinerary...
    ics = cal.to_ical().decode('utf-8')
    # Register for events
    trip_id = "mock_trip_id"  # Generate UUID
    event_bus.register_trip(trip_id, request.destination, itinerary)
    # Book example
    await book_activity("Eiffel Tower Tour", request.destination)
    return TravelResponse(itinerary=itinerary, ics=ics)