"""
models/travel_request.py - Pydantic models for travel planning requests
"""
from datetime import datetime, date
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from enum import Enum

class TravelMode(str, Enum):
    VOICE = "voice"
    MOODBOARD = "moodboard" 
    TEXT = "text"
    QUICK_START = "quick_start"
    SURPRISE_ME = "surprise_me"

class TravelStyle(str, Enum):
    BACKPACKER = "backpacker"
    COMFORT = "comfort"
    LUXURY = "luxury"
    ECO_CONSCIOUS = "eco_conscious"

class TravelVibe(str, Enum):
    RELAXING = "relaxing"
    ADVENTURE = "adventure"
    ROMANTIC = "romantic"
    CULTURAL = "cultural"
    FOOD_FOCUSED = "food_focused"
    NATURE = "nature"
    PHOTOGRAPHY = "photography"

class InputType(str, Enum):
    TEXT = "text"
    VOICE = "voice"
    IMAGE = "image"
    CALENDAR = "calendar"

class TravelDates(BaseModel):
    start: Union[str, date]
    end: Union[str, date]
    flexible: bool = False

class LocationInfo(BaseModel):
    name: str
    coordinates: Optional[List[float]] = None
    type: str = "city"  # city, landmark, region

class MultimodalInput(BaseModel):
    input_type: InputType
    content: Union[str, Dict[str, Any]]  # text, base64 image, or voice data
    metadata: Optional[Dict[str, Any]] = None

class TravelPlanningRequest(BaseModel):
    # Core Information
    mode: TravelMode = TravelMode.TEXT
    destination: Union[str, LocationInfo]
    origin: Optional[Union[str, LocationInfo]] = None
    dates: TravelDates
    duration_days: int = Field(..., gt=0, le=30)
    
    # Group Information
    travelers: int = Field(default=1, ge=1, le=20)
    adults: int = Field(default=1, ge=1)
    children: int = Field(default=0, ge=0)
    age_groups: List[str] = []
    
    # Preferences
    budget: Optional[float] = None
    currency: str = "USD"
    budget_flexible: bool = True
    travel_style: Optional[TravelStyle] = None
    vibes: List[TravelVibe] = []
    interests: List[str] = []
    priorities: List[str] = []
    pace_level: int = Field(default=2, ge=0, le=5)
    
    # Multimodal Inputs
    multimodal_inputs: List[MultimodalInput] = []
    
    # Additional Context
    accessibility_needs: List[str] = []
    dietary_restrictions: List[str] = []
    previous_visits: bool = False
    loved_places: Optional[str] = None
    additional_info: Optional[str] = None
    
    # System Preferences
    include_audio_tour: bool = True
    include_ar_ready: bool = False
    realtime_updates: bool = True

class VoiceInput(BaseModel):
    audio_data: str  # base64 encoded
    language: str = "en"
    duration_seconds: Optional[float] = None

class MoodboardInput(BaseModel):
    images: List[str]  # base64 encoded images
    description: Optional[str] = None
    style_preferences: List[str] = []

class ReplanningRequest(BaseModel):
    trip_id: str
    trigger_event: str  # weather, closure, delay, etc.
    event_details: Dict[str, Any]
    affected_date: Optional[date] = None
    user_preferences: Optional[Dict[str, Any]] = None