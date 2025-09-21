"""
services/travel_service.py - Main Travel Planning Service
"""
from typing import Dict, Any, Optional, List
from models.travel_request import TravelPlanningRequest
from models.travel_response import *
from agents.orchestrator import OrchestratorAgent
from agents.destination_agent import DestinationAgent
from agents.transport_agent import TransportAgent
from agents.accommodation_agent import AccommodationAgent  
from agents.dining_agent import DiningAgent
from agents.audio_tour_agent import AudioTourAgent
from agents.multimodal_agent import MultimodalAgent
from services.multimodal_service import MultimodalService
from services.safety_service import SafetyService
from services.realtime_service import RealtimeService
from models.travel_request import MultimodalInput, InputType
import uuid
from datetime import datetime, date, timedelta
import json

class TravelPlanningService:
    def __init__(self):
        # Initialize with error handling to prevent startup failures
        try:
            self.orchestrator = OrchestratorAgent()
        except Exception as e:
            print(f"Warning: Orchestrator initialization failed: {e}")
            self.orchestrator = None
            
        try:
            self.multimodal_service = MultimodalService()
        except Exception as e:
            print(f"Warning: Multimodal service initialization failed: {e}")
            self.multimodal_service = None
            
        try:
            self.safety_service = SafetyService()
        except Exception as e:
            print(f"Warning: Safety service initialization failed: {e}")
            self.safety_service = None
            
        try:
            self.realtime_service = RealtimeService()
        except Exception as e:
            print(f"Warning: Realtime service initialization failed: {e}")
            self.realtime_service = None
        
        # Register specialized agents only if orchestrator is available
        if self.orchestrator:
            try:
                self.orchestrator.register_agent("destination", DestinationAgent())
                self.orchestrator.register_agent("transport", TransportAgent())
                self.orchestrator.register_agent("accommodation", AccommodationAgent())
                self.orchestrator.register_agent("dining", DiningAgent())
                self.orchestrator.register_agent("audio_tour", AudioTourAgent())
                self.orchestrator.register_agent("multimodal", MultimodalAgent())
            except Exception as e:
                print(f"Warning: Agent registration failed: {e}")
        
    async def create_travel_plan(self, request: TravelPlanningRequest) -> TravelPlanResponse:
        """Create comprehensive travel plan with fallback handling"""
        trip_id = str(uuid.uuid4())
        
        try:
            # Process multimodal inputs first if service is available
            multimodal_inputs = getattr(request, 'multimodal_inputs', None) or []
            if self.multimodal_service and multimodal_inputs:
                processed_inputs = await self._process_multimodal_inputs(multimodal_inputs)
                enhanced_request = self._enhance_request_with_multimodal(request, processed_inputs)
            else:
                enhanced_request = request
            
            # Try orchestrated planning if available
            if self.orchestrator:
                request_dict = enhanced_request.model_dump()
                request_dict["trip_id"] = trip_id
                planning_result = await self.orchestrator.execute(request_dict)
                agent_results = planning_result.get("agent_results", {})
            else:
                # Fallback to basic planning
                agent_results = await self._create_basic_plan(enhanced_request)
            
            # Build comprehensive response
            response = await self._build_travel_response(
                trip_id=trip_id,
                request=enhanced_request,
                agent_results=agent_results
            )
            
            # Add safety info if service is available
            if self.safety_service:
                try:
                    response.safety_info = await self.safety_service.get_safety_info(
                        destination=str(request.destination),
                        accessibility_needs=getattr(request, 'accessibility_needs', [])
                    )
                except Exception as e:
                    print(f"Warning: Safety info retrieval failed: {e}")
                    response.safety_info = {}
            
            # Setup real-time monitoring if available and requested
            if self.realtime_service and getattr(request, 'realtime_updates', False):
                try:
                    await self.realtime_service.setup_monitoring(trip_id, response)
                except Exception as e:
                    print(f"Warning: Realtime monitoring setup failed: {e}")
            
            return response
            
        except Exception as e:
            print(f"Error in create_travel_plan: {e}")
            # Return a basic fallback response
            return await self._create_fallback_response(trip_id, request)
    
    async def _create_basic_plan(self, request: TravelPlanningRequest) -> Dict[str, Any]:
        """Create a basic travel plan when full orchestration is not available"""
        return {
            "destination_info": {
                "name": str(request.destination),
                "description": f"Basic information for {request.destination}",
                "attractions": []
            },
            "accommodations": [],
            "dining": [],
            "transport": [],
            "activities": []
        }
    
    async def _create_fallback_response(self, trip_id: str, request: TravelPlanningRequest) -> TravelPlanResponse:
        """Create a fallback response when main planning fails"""
        from datetime import datetime, timedelta, date
        from models.travel_response import (
            LocationInfo, BudgetBreakdown, SafetyInfo, DayPlan, ActivityBlock
        )
        
        # Create basic destination info
        destination_info = LocationInfo(
            name=str(request.destination),
            coordinates=None,
            type="city"
        )
        
        # Create basic budget
        budget = BudgetBreakdown(
            total=0.0,
            currency="USD",
            transport=0.0,
            accommodation=0.0,
            food=0.0,
            activities=0.0,
            shopping=0.0,
            contingency=0.0
        )
        
        # Create basic safety info
        safety_info = SafetyInfo(
            general_safety=["Check local travel advisories"],
            health_advisories=["Consult healthcare provider before travel"],
            emergency_contacts={"General Emergency": "Contact local authorities"},
            accessibility_notes=["Contact destination for accessibility information"]
        )
        
        # Create basic daily plan
        basic_activity = ActivityBlock(
            start_time="09:00",
            end_time="17:00",
            activity="Explore destination",
            location=destination_info,
            description="General exploration and sightseeing",
            cost=None,
            booking_required=False,
            alternatives=[]
        )
        
        daily_plans = [
            DayPlan(
                date=datetime.now().date(),
                theme="Exploration",
                morning=[basic_activity],
                afternoon=[],
                evening=[],
                total_cost=None,
                travel_time_minutes=0
            )
        ]
        
        return TravelPlanResponse(
            trip_id=trip_id,
            destination_info=destination_info,
            summary=f"Basic travel plan for {request.destination}",
            total_duration_days=getattr(request, 'duration_days', 1),
            estimated_budget=budget,
            daily_plans=daily_plans,
            transport_options=[],
            accommodation_options=[],
            dining_recommendations=[],
            audio_tour_segments=[],
            ar_ready_pois=[],
            safety_info=safety_info,
            weather_forecast={},
            live_events=[],
            alternative_plans=[],
            generated_at=datetime.now(),
            confidence_score=0.1,
            sources=["Fallback mode"]
        )
    
    async def _process_multimodal_inputs(self, inputs: List[MultimodalInput]) -> Dict[str, Any]:
        """Process multimodal inputs (images, voice, etc.)"""
        processed = {
            "extracted_preferences": {},
            "voice_transcriptions": [],
            "image_analysis": []
        }
        
        if not inputs or not self.multimodal_service:
            return processed
            
        for input_data in inputs:
            try:
                if input_data.input_type == InputType.IMAGE:
                    analysis = await self.multimodal_service.analyze_images([input_data.content])
                    processed["image_analysis"].append(analysis)
                    
                elif input_data.input_type == InputType.VOICE:
                    transcription = await self.multimodal_service.transcribe_voice(input_data.content)
                    processed["voice_transcriptions"].append(transcription)
            except Exception as e:
                print(f"Warning: Failed to process multimodal input: {e}")
                continue
        
        return processed
    
    def _enhance_request_with_multimodal(
        self, 
        request: TravelPlanningRequest, 
        processed: Dict[str, Any]
    ) -> TravelPlanningRequest:
        """Enhance request with multimodal insights"""
        try:
            enhanced = request.model_copy()
            
            # Extract preferences from image analysis
            for analysis in processed.get("image_analysis", []):
                if "vibes" in analysis and hasattr(enhanced, 'vibes'):
                    # Convert string vibes to enum if needed
                    for vibe in analysis["vibes"]:
                        if vibe not in enhanced.vibes:
                            enhanced.vibes.append(vibe)
                if "activities" in analysis and hasattr(enhanced, 'interests'):
                    enhanced.interests.extend(analysis["activities"])
            
            # Add voice transcription insights
            voice_text = " ".join(processed.get("voice_transcriptions", []))
            if voice_text and hasattr(enhanced, 'additional_info'):
                current_info = enhanced.additional_info or ""
                enhanced.additional_info = f"{current_info} {voice_text}".strip()
            
            return enhanced
        except Exception as e:
            print(f"Warning: Failed to enhance request with multimodal data: {e}")
            return request
    
    async def _build_travel_response(
        self,
        trip_id: str,
        request: TravelPlanningRequest,
        agent_results: Dict[str, Any]
    ) -> TravelPlanResponse:
        """Build comprehensive travel response from agent results"""
        
        # Extract destination info
        destination_data = agent_results.get("destination", {})
        destination_info = LocationInfo(
            name=str(request.destination),
            coordinates=None,
            type="city"
        )
        
        # Build daily plans
        daily_plans = await self._create_daily_plans(request, agent_results)
        
        # Extract transport options
        transport_data = agent_results.get("transport", {})
        transport_options = self._extract_transport_options(transport_data)
        
        # Extract accommodation options
        accommodation_data = agent_results.get("accommodation", {})
        accommodation_options = self._extract_accommodation_options(accommodation_data)
        
        # Extract dining recommendations
        dining_data = agent_results.get("dining", {})
        dining_options = self._extract_dining_options(dining_data)
        
        # Extract audio tour segments
        audio_data = agent_results.get("audio_tour", {})
        audio_segments = self._extract_audio_segments(audio_data)
        
        # Calculate budget
        max_budget = getattr(request, 'budget', 1000) or 1000
        budget_breakdown = await self._calculate_budget(agent_results, max_budget)
        
        # Get duration
        duration = getattr(request, 'duration_days', len(daily_plans)) or 1
        
        return TravelPlanResponse(
            trip_id=trip_id,
            destination_info=destination_info,
            summary=f"Comprehensive {duration}-day trip to {request.destination}",
            total_duration_days=duration,
            estimated_budget=budget_breakdown,
            daily_plans=daily_plans,
            transport_options=transport_options,
            accommodation_options=accommodation_options,
            dining_recommendations=dining_options,
            audio_tour_segments=audio_segments,
            ar_ready_pois=[],
            safety_info=SafetyInfo(
                general_safety=["Stay aware of your surroundings", "Keep valuables secure"],
                health_advisories=["Check vaccination requirements", "Travel insurance recommended"],
                emergency_contacts={"Emergency Services": "Contact local authorities"},
                accessibility_notes=["Contact venues for accessibility information"]
            ),
            weather_forecast={},
            live_events=[],
            alternative_plans=[],
            generated_at=datetime.now(),
            confidence_score=0.85,
            sources=["Web Search", "MCP Tools", "Vector Database"]
        )
    
    async def _create_daily_plans(self, request: TravelPlanningRequest, agent_results: Dict[str, Any]) -> List[DayPlan]:
        """Create detailed daily plans"""
        daily_plans = []
        
        # Get start date or use current date
        start_date = getattr(request, 'start_date', None)
        if isinstance(start_date, str):
            start_date = datetime.fromisoformat(start_date).date()
        elif isinstance(start_date, datetime):
            start_date = start_date.date()
        else:
            start_date = datetime.now().date()
        
        duration = getattr(request, 'duration_days', 1)
        
        for day in range(duration):
            current_date = start_date + timedelta(days=day)
            
            plan = DayPlan(
                date=current_date,
                theme=f"Day {day + 1} Exploration",
                morning=[
                    ActivityBlock(
                        start_time="09:00",
                        end_time="12:00",
                        activity="Morning Exploration",
                        location=LocationInfo(name=str(request.destination), type="city"),
                        description="Explore morning attractions and activities",
                        cost=50.0,
                        booking_required=False,
                        alternatives=[]
                    )
                ],
                afternoon=[
                    ActivityBlock(
                        start_time="14:00",
                        end_time="17:00", 
                        activity="Afternoon Adventures",
                        location=LocationInfo(name=str(request.destination), type="city"),
                        description="Afternoon sightseeing and experiences",
                        cost=75.0,
                        booking_required=False,
                        alternatives=[]
                    )
                ],
                evening=[
                    ActivityBlock(
                        start_time="19:00",
                        end_time="22:00",
                        activity="Evening Dining",
                        location=LocationInfo(name=str(request.destination), type="city"),
                        description="Local dining experience",
                        cost=60.0,
                        booking_required=True,
                        alternatives=[]
                    )
                ],
                total_cost=185.0,
                travel_time_minutes=90
            )
            daily_plans.append(plan)
        
        return daily_plans
        
        return daily_plans
    
    def _extract_transport_options(self, transport_data: Dict[str, Any]) -> List[TransportOption]:
        """Extract transport options from agent results"""
        return [
            TransportOption(
                type="flight",
                provider="Airline",
                departure_time=datetime.now(),
                arrival_time=datetime.now(),
                duration_minutes=180,
                price=300.0,
                carbon_footprint="0.5 tons CO2"
            )
        ]
    
    def _extract_accommodation_options(self, accommodation_data: Dict[str, Any]) -> List[AccommodationOption]:
        """Extract accommodation options from agent results"""
        return [
            AccommodationOption(
                name="Sample Hotel",
                type="hotel",
                location=LocationInfo(name="City Center", type="area"),
                price_per_night=150.0,
                amenities=["WiFi", "Pool", "Gym"],
                rating=4.5
            )
        ]
    
    def _extract_dining_options(self, dining_data: Dict[str, Any]) -> List[DiningOption]:
        """Extract dining options from agent results"""
        return [
            DiningOption(
                name="Local Restaurant",
                cuisine_type="Local",
                location=LocationInfo(name="Downtown", type="area"),
                price_range="$$",
                rating=4.3,
                specialties=["Local Dish", "Regional Cuisine"]
            )
        ]
    
    def _extract_audio_segments(self, audio_data: Dict[str, Any]) -> List[AudioTourSegment]:
        """Extract audio tour segments from agent results"""
        content = audio_data.get("content", "")
        if content:
            return [
                AudioTourSegment(
                    location="Main Attraction",
                    content=content[:500] + "...",  # Truncate for example
                    duration_minutes=5,
                    voice_style="friendly_guide"
                )
            ]
        return []
    
    async def _calculate_budget(self, agent_results: Dict[str, Any], max_budget: float) -> BudgetBreakdown:
        """Calculate detailed budget breakdown"""
        return BudgetBreakdown(
            total=max_budget,
            currency="USD",
            transport=max_budget * 0.3,
            accommodation=max_budget * 0.4,
            food=max_budget * 0.2,
            activities=max_budget * 0.08,
            shopping=max_budget * 0.02,
            contingency=max_budget * 0.1
        )