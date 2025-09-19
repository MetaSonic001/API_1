from fastapi import APIRouter, Body
from models.schemas import VoiceInput, MoodboardInput, CalendarInput, SurpriseRequest, FollowFeetRequest
from tools.stt import transcribe_voice
from tools.multimodal import interpret_image
from services.calendar import parse_ical
from services.vector_store import search_pois
from agents.orchestrator import orchestrate
from geopy.geocoders import Nominatim
geolocator = Nominatim(user_agent="smart_travel_app")

router = APIRouter()

@router.post("/voice")
async def voice_input(input: VoiceInput = Body(...)):
    # Assume audio_url downloaded to bytes; mock
    audio_bytes = requests.get(input.audio_url).content
    text = transcribe_voice(audio_bytes)
    return {"transcribed": text}

@router.post("/moodboard")
async def moodboard(input: MoodboardInput = Body(...)):
    return interpret_image(input.image_url)

@router.post("/calendar")
async def calendar_optin(input: CalendarInput = Body(...)):
    dates = parse_ical(input.ical_content)
    return {"free_dates": dates}

@router.post("/surprise")
async def surprise_mode(request: SurpriseRequest = Body(...)):
    query = "random travel surprise" + (f" near {request.location}" if request.location else "")
    pois = search_pois(query)
    plan = orchestrate({"interests": ["surprise"], "pois": pois})
    return {"plan": plan}

@router.post("/follow_feet")
async def follow_mode(request: FollowFeetRequest = Body(...)):
    # Reverse geocode for context
    reverse_geo = geolocator.reverse((request.lat, request.lon))
    location = reverse_geo.address if reverse_geo else "Unknown"
    query = f"near {request.lat},{request.lon} in {location}"
    pois = search_pois(query)
    plan = orchestrate({"location": location, "pois": pois})
    return {"instant_tour": plan, "location_name": location}
