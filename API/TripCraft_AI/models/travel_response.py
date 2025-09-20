"""
models/travel_response.py - Pydantic models for travel planning responses
"""
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ReplanningRequest(BaseModel):
    trip_id: str
    trigger_event: str  # weather, closure, delay, etc.
    event_details: Dict[str, Any]
    affected_date: Optional[date] = None
    user_preferences: Optional[Dict[str, Any]] = None

class LocationInfo(BaseModel):
    name: str
    coordinates: Optional[List[float]] = None
    type: str = "city"  # city, landmark, region, area

class POIInfo(BaseModel):
    name: str
    type: str
    description: str
    location: LocationInfo
    opening_hours: Optional[Dict[str, str]] = None
    price_range: Optional[str] = None
    rating: Optional[float] = None
    estimated_duration: Optional[int] = None  # minutes
    accessibility_info: List[str] = []

class TransportOption(BaseModel):
    type: str  # flight, train, bus, taxi
    provider: str
    departure_time: datetime
    arrival_time: datetime
    duration_minutes: int
    price: Optional[float] = None
    booking_url: Optional[str] = None
    carbon_footprint: Optional[str] = None

class AccommodationOption(BaseModel):
    name: str
    type: str  # hotel, airbnb, hostel
    location: LocationInfo
    price_per_night: Optional[float] = None
    amenities: List[str] = []
    rating: Optional[float] = None
    booking_url: Optional[str] = None
    accessibility_features: List[str] = []

class DiningOption(BaseModel):
    name: str
    cuisine_type: str
    location: LocationInfo
    price_range: str
    rating: Optional[float] = None
    specialties: List[str] = []
    opening_hours: Optional[Dict[str, str]] = None
    dietary_options: List[str] = []

class ActivityBlock(BaseModel):
    start_time: str
    end_time: str
    activity: str
    location: LocationInfo
    description: str
    cost: Optional[float] = None
    booking_required: bool = False
    alternatives: List[str] = []

class DayPlan(BaseModel):
    date: date
    theme: str
    morning: List[ActivityBlock]
    afternoon: List[ActivityBlock] 
    evening: List[ActivityBlock]
    total_cost: Optional[float] = None
    travel_time_minutes: int = 0

class AudioTourSegment(BaseModel):
    location: str
    content: str
    duration_minutes: int
    voice_style: str = "friendly_guide"
    background_sounds: Optional[str] = None

class BudgetBreakdown(BaseModel):
    total: float
    currency: str
    transport: float
    accommodation: float
    food: float
    activities: float
    shopping: float
    contingency: float

class SafetyInfo(BaseModel):
    general_safety: List[str]
    health_advisories: List[str]
    emergency_contacts: Dict[str, str]
    accessibility_notes: List[str]

class TravelPlanResponse(BaseModel):
    # Trip Overview
    trip_id: str
    destination_info: LocationInfo
    summary: str
    total_duration_days: int
    estimated_budget: BudgetBreakdown
    
    # Daily Itinerary
    daily_plans: List[DayPlan]
    
    # Options
    transport_options: List[TransportOption]
    accommodation_options: List[AccommodationOption]
    dining_recommendations: List[DiningOption]
    
    # Enhanced Features
    audio_tour_segments: List[AudioTourSegment] = []
    ar_ready_pois: List[POIInfo] = []
    safety_info: SafetyInfo
    
    # Real-time Features
    weather_forecast: Dict[str, Any] = {}
    live_events: List[Dict[str, Any]] = []
    alternative_plans: List[Dict[str, Any]] = []
    
    # Metadata
    generated_at: datetime
    confidence_score: float = Field(ge=0.0, le=1.0)
    sources: List[str] = []

class RealtimeUpdate(BaseModel):
    trip_id: str
    update_type: str
    message: str
    severity: str = "info"  # info, warning, critical
    action_required: bool = False
    suggested_changes: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.now)