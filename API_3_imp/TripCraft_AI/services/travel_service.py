"""
services/travel_service.py - Main Travel Planning Service
"""
from typing import Dict, Any, Optional
from models.travel_request import TravelPlanningRequest
from models.travel_response import TravelPlanResponse
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
from models.travel_request import MultimodalInput  # <-- Add this import
from models.travel_request import InputType  # <-- Add this import for InputType
import uuid
from datetime import datetime
import json

class TravelPlanningService:
    def __init__(self):
        self.orchestrator = OrchestratorAgent()
        self.multimodal_service = MultimodalService()
        self.safety_service = SafetyService()
        self.realtime_service = RealtimeService()
        
        # Register specialized agents
        self.orchestrator.register_agent("destination", DestinationAgent())
        self.orchestrator.register_agent("transport", TransportAgent())
        self.orchestrator.register_agent("accommodation", AccommodationAgent())
        self.orchestrator.register_agent("dining", DiningAgent())
        self.orchestrator.register_agent("audio_tour", AudioTourAgent())
        self.orchestrator.register_agent("multimodal", MultimodalAgent())
        
    async def create_travel_plan(self, request: TravelPlanningRequest) -> TravelPlanResponse:
        """Create comprehensive travel plan"""
        trip_id = str(uuid.uuid4())
        
        # Process multimodal inputs first
        processed_inputs = await self._process_multimodal_inputs(request.multimodal_inputs)
        
        # Merge multimodal insights with request
        enhanced_request = self._enhance_request_with_multimodal(request, processed_inputs)
        
        # Convert to dict for agent processing
        request_dict = enhanced_request.model_dump()
        request_dict["trip_id"] = trip_id
        
        # Execute orchestrated planning
        planning_result = await self.orchestrator.execute(request_dict)
        
        # Extract agent results
        agent_results = planning_result.get("agent_results", {})
        
        # Build comprehensive response
        response = await self._build_travel_response(
            trip_id=trip_id,
            request=enhanced_request,
            agent_results=agent_results
        )
        
        # Add safety and accessibility information
        response.safety_info = await self.safety_service.get_safety_info(
            destination=str(request.destination),
            accessibility_needs=request.accessibility_needs
        )
        
        # Setup real-time monitoring if requested
        if request.realtime_updates:
            await self.realtime_service.setup_monitoring(trip_id, response)
        
        return response
    
    async def _process_multimodal_inputs(self, inputs: List[MultimodalInput]) -> Dict[str, Any]:
        """Process multimodal inputs (images, voice, etc.)"""
        processed = {
            "extracted_preferences": {},
            "voice_transcriptions": [],
            "image_analysis": []
        }
        
        for input_data in inputs:
            if input_data.input_type == InputType.IMAGE:
                analysis = await self.multimodal_service.analyze_images([input_data.content])
                processed["image_analysis"].append(analysis)
                
            elif input_data.input_type == InputType.VOICE:
                transcription = await self.multimodal_service.transcribe_voice(input_data.content)
                processed["voice_transcriptions"].append(transcription)
        
        return processed
    
    def _enhance_request_with_multimodal(
        self, 
        request: TravelPlanningRequest, 
        processed: Dict[str, Any]
    ) -> TravelPlanningRequest:
        """Enhance request with multimodal insights"""
        enhanced = request.model_copy()
        
        # Extract preferences from image analysis
        for analysis in processed.get("image_analysis", []):
            if "vibes" in analysis:
                enhanced.vibes.extend(analysis["vibes"])
            if "activities" in analysis:
                enhanced.interests.extend(analysis["activities"])
        
        # Add voice transcription insights
        voice_text = " ".join(processed.get("voice_transcriptions", []))
        if voice_text:
            enhanced.additional_info = f"{enhanced.additional_info or ''} {voice_text}".strip()
        
        return enhanced
    
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
        budget_breakdown = await self._calculate_budget(agent_results, request.budget or 1000)
        
        return TravelPlanResponse(
            trip_id=trip_id,
            destination_info=destination_info,
            summary=f"Comprehensive {request.duration_days}-day trip to {request.destination}",
            total_duration_days=request.duration_days,
            estimated_budget=budget_breakdown,
            daily_plans=daily_plans,
            transport_options=transport_options,
            accommodation_options=accommodation_options,
            dining_recommendations=dining_options,
            audio_tour_segments=audio_segments,
            safety_info=SafetyInfo(
                general_safety=[],
                health_advisories=[],
                emergency_contacts={},
                accessibility_notes=[]
            ),
            generated_at=datetime.now(),
            confidence_score=0.85,
            sources=["Web Search", "MCP Tools", "Vector Database"]
        )
    
    async def _create_daily_plans(self, request: TravelPlanningRequest, agent_results: Dict[str, Any]) -> List[DayPlan]:
        """Create detailed daily plans"""
        daily_plans = []
        
        for day in range(request.duration_days):
            plan = DayPlan(
                date=datetime.now().date(),  # Should be calculated from start date
                theme=f"Day {day + 1} Exploration",
                morning=[
                    ActivityBlock(
                        start_time="09:00",
                        end_time="12:00",
                        activity="Morning Exploration",
                        location=LocationInfo(name=str(request.destination), type="city"),
                        description="Explore morning attractions and activities",
                        cost=50.0
                    )
                ],
                afternoon=[
                    ActivityBlock(
                        start_time="14:00",
                        end_time="17:00", 
                        activity="Afternoon Adventures",
                        location=LocationInfo(name=str(request.destination), type="city"),
                        description="Afternoon sightseeing and experiences",
                        cost=75.0
                    )
                ],
                evening=[
                    ActivityBlock(
                        start_time="19:00",
                        end_time="22:00",
                        activity="Evening Dining",
                        location=LocationInfo(name=str(request.destination), type="city"),
                        description="Local dining experience",
                        cost=60.0
                    )
                ],
                total_cost=185.0,
                travel_time_minutes=90
            )
            daily_plans.append(plan)
        
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