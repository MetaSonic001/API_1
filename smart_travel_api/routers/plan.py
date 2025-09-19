from fastapi import APIRouter, Body, Request, Depends
from models.schemas import TravelRequest, TravelResponse
from agents.orchestrator import orchestrate
from icalendar import Calendar
from tools.multimodal import interpret_image
from services.booking import book_activity

router = APIRouter()

# Dependency to get the event bus from app state
def get_event_bus(request: Request):
    return request.app.state.event_bus

@router.post("/generate", response_model=TravelResponse)
async def generate_plan(
    request_data: TravelRequest = Body(...),
    event_bus=Depends(get_event_bus)  # <-- inject event bus here
):
    # Interpret image if provided
    if request_data.image_url:
        vibes = interpret_image(request_data.image_url)
        request_data.interests.extend(vibes['vibes'])

    # Generate itinerary
    itinerary = orchestrate(request_data.dict())

    # Mock ICS
    cal = Calendar()
    cal.add('prodid', '-//Smart Travel//EN')
    cal.add('version', '2.0')
    # Add events from itinerary...
    ics = cal.to_ical().decode('utf-8')

    # Register trip with event bus
    trip_id = "mock_trip_id"  # TODO: generate a proper UUID
    event_bus.register_trip(trip_id, request_data.destination, itinerary)

    # Book example activity
    await book_activity("Eiffel Tower Tour", request_data.destination)

    return TravelResponse(itinerary=itinerary, ics=ics)
