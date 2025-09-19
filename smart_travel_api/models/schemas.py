from pydantic import BaseModel
from typing import List, Optional, Dict

class TravelRequest(BaseModel):
    destination: str
    duration: int
    budget: float
    interests: List[str]
    starting_location: Optional[str] = None
    travel_dates: Optional[Dict[str, str]] = None  # {"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"}
    vibes: Optional[List[str]] = None
    priorities: Optional[List[str]] = None
    image_url: Optional[str] = None  # For moodboard

class AudioTourRequest(BaseModel):
    location: str
    interests: List[str]
    duration: int  # minutes

class ReplanEvent(BaseModel):
    type: str  # e.g., "weather", "delay"
    location: str
    original_plan: Dict

class VoiceInput(BaseModel):
    audio_url: str  # Or handle upload

class MoodboardInput(BaseModel):
    image_url: str

class CalendarInput(BaseModel):
    ical_content: str

class SurpriseRequest(BaseModel):
    location: Optional[str] = None

class FollowFeetRequest(BaseModel):
    lat: float
    lon: float

class SafetyRequest(BaseModel):
    location: str

class VerifyFactRequest(BaseModel):
    fact: str

class TravelResponse(BaseModel):
    itinerary: Dict
    ics: str
    # Add more as needed