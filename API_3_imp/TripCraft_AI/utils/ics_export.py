"""
utils/ics_export.py - ICS (calendar) exporter

Generate .ics calendar files from travel itineraries for Google/Apple Calendar import.
Uses free icalendar library.
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List
import uuid
import pytz
from icalendar import Calendar, Event, vText
from models.travel_response import TravelPlanResponse, DayPlan, ActivityBlock

class ICSExporter:
    def __init__(self, timezone: str = "UTC"):
        self.timezone = pytz.timezone(timezone)
    
    def itinerary_to_ics(self, itinerary: TravelPlanResponse) -> str:
        """Convert travel itinerary to ICS calendar format"""
        
        # Create calendar
        cal = Calendar()
        cal.add('prodid', '-//TripCraft AI//Travel Planner//EN')
        cal.add('version', '2.0')
        cal.add('calscale', 'GREGORIAN')
        cal.add('method', 'PUBLISH')
        
        # Add calendar properties
        cal.add('x-wr-calname', f"Trip to {itinerary.destination_info.name}")
        cal.add('x-wr-caldesc', itinerary.summary)
        cal.add('x-wr-timezone', str(self.timezone))
        
        # Process each day plan
        for day_plan in itinerary.daily_plans:
            self._add_day_events(cal, day_plan, itinerary)
        
        # Add transport events
        for transport in itinerary.transport_options[:2]:  # Add first 2 options
            self._add_transport_event(cal, transport, itinerary)
        
        return cal.to_ical().decode('utf-8')
    
    def _add_day_events(self, cal: Calendar, day_plan: DayPlan, itinerary: TravelPlanResponse):
        """Add daily activities to calendar"""
        
        # Combine all activities for the day
        all_activities = day_plan.morning + day_plan.afternoon + day_plan.evening
        
        for activity in all_activities:
            event = Event()
            
            # Generate unique ID
            event.add('uid', str(uuid.uuid4()))
            
            # Set event details
            event.add('summary', activity.activity)
            event.add('description', self._format_activity_description(activity, day_plan))
            
            # Set location
            if activity.location.coordinates:
                event.add('location', f"{activity.location.name}")
                event.add('geo', f"{activity.location.coordinates[1]};{activity.location.coordinates[0]}")
            else:
                event.add('location', activity.location.name)
            
            # Set timing
            start_datetime = self._parse_activity_time(day_plan.date, activity.start_time)
            end_datetime = self._parse_activity_time(day_plan.date, activity.end_time)
            
            event.add('dtstart', start_datetime)
            event.add('dtend', end_datetime)
            
            # Add metadata
            event.add('categories', ['Travel', day_plan.theme])
            if activity.cost:
                event.add('x-cost', f"${activity.cost:.2f}")
            if activity.booking_required:
                event.add('x-booking-required', 'true')
            
            # Add alarm 30 minutes before
            alarm = event.add('valarm')
            alarm.add('action', 'DISPLAY')
            alarm.add('description', f"Reminder: {activity.activity}")
            alarm.add('trigger', timedelta(minutes=-30))
            
            cal.add_component(event)
    
    def _add_transport_event(self, cal: Calendar, transport, itinerary: TravelPlanResponse):
        """Add transport booking to calendar"""
        event = Event()
        
        event.add('uid', str(uuid.uuid4()))
        event.add('summary', f"{transport.type.title()}: {transport.provider}")
        
        description = f"""
Transport Details:
- Provider: {transport.provider}
- Duration: {transport.duration_minutes} minutes
- Price: ${transport.price or 'TBD'}
- Carbon Footprint: {transport.carbon_footprint or 'Unknown'}
""".strip()
        
        if transport.booking_url:
            description += f"\n\nBooking: {transport.booking_url}"
        
        event.add('description', description)
        event.add('dtstart', transport.departure_time)
        event.add('dtend', transport.arrival_time)
        
        # Location details
        if transport.type == 'flight':
            event.add('location', 'Airport')
        else:
            event.add('location', f"{transport.type.title()} Station")
        
        event.add('categories', ['Travel', 'Transport'])
        
        # Add reminder 2 hours before for flights, 30 minutes for others
        reminder_minutes = -120 if transport.type == 'flight' else -30
        alarm = event.add('valarm')
        alarm.add('action', 'DISPLAY')
        alarm.add('description', f"Departure reminder: {transport.provider}")
        alarm.add('trigger', timedelta(minutes=reminder_minutes))
        
        cal.add_component(event)
    
    def _parse_activity_time(self, date, time_str: str) -> datetime:
        """Parse activity time string to datetime"""
        try:
            # Parse "HH:MM" format
            time_parts = time_str.split(':')
            hour = int(time_parts[0])
            minute = int(time_parts[1]) if len(time_parts) > 1 else 0
            
            # Combine with date
            dt = datetime.combine(date, datetime.min.time().replace(hour=hour, minute=minute))
            
            # Localize to timezone
            return self.timezone.localize(dt)
            
        except Exception:
            # Fallback to noon
            dt = datetime.combine(date, datetime.min.time().replace(hour=12))
            return self.timezone.localize(dt)
    
    def _format_activity_description(self, activity: ActivityBlock, day_plan: DayPlan) -> str:
        """Format activity description for calendar"""
        description_parts = [
            activity.description,
            f"\nTime: {activity.start_time} - {activity.end_time}",
            f"Location: {activity.location.name}"
        ]
        
        if activity.cost:
            description_parts.append(f"Cost: ${activity.cost:.2f}")
        
        if activity.booking_required:
            description_parts.append("⚠️ Advance booking required")
        
        if activity.alternatives:
            description_parts.append(f"Alternatives: {', '.join(activity.alternatives)}")
        
        return "\n".join(description_parts)
    
    def create_quick_ics(self, 
                        title: str, 
                        start_time: datetime, 
                        end_time: datetime,
                        description: str = "",
                        location: str = "") -> str:
        """Create a simple ICS event"""
        
        cal = Calendar()
        cal.add('prodid', '-//TripCraft AI//Travel Planner//EN')
        cal.add('version', '2.0')
        
        event = Event()
        event.add('uid', str(uuid.uuid4()))
        event.add('summary', title)
        event.add('description', description)
        event.add('dtstart', start_time)
        event.add('dtend', end_time)
        
        if location:
            event.add('location', location)
        
        cal.add_component(event)
        
        return cal.to_ical().decode('utf-8')

# Standalone function for easy import
def itinerary_to_ics(itinerary: TravelPlanResponse, timezone: str = "UTC") -> str:
    """
    Convert travel itinerary to ICS calendar format
    
    Args:
        itinerary: TravelPlanResponse object
        timezone: Target timezone for events
    
    Returns:
        ICS calendar content as string
    """
    exporter = ICSExporter(timezone)
    return exporter.itinerary_to_ics(itinerary)

# Example usage and testing
if __name__ == "__main__":
    from datetime import date
    from models.travel_response import *
    
    # Create sample itinerary for testing
    sample_itinerary = TravelPlanResponse(
        trip_id="test_123",
        destination_info=LocationInfo(name="Paris", type="city"),
        summary="3-day Paris adventure",
        total_duration_days=3,
        estimated_budget=BudgetBreakdown(
            total=1500, currency="USD", transport=500, accommodation=600,
            food=300, activities=100, shopping=50, contingency=150
        ),
        daily_plans=[
            DayPlan(
                date=date.today(),
                theme="Arrival Day",
                morning=[
                    ActivityBlock(
                        start_time="10:00",
                        end_time="12:00",
                        activity="Eiffel Tower Visit",
                        location=LocationInfo(name="Eiffel Tower", coordinates=[2.2945, 48.8584]),
                        description="Visit iconic iron tower with city views",
                        cost=25.0,
                        booking_required=True
                    )
                ],
                afternoon=[],
                evening=[]
            )
        ],
        transport_options=[
            TransportOption(
                type="flight",
                provider="Air France",
                departure_time=datetime.now(),
                arrival_time=datetime.now() + timedelta(hours=8),
                duration_minutes=480,
                price=450.0
            )
        ],
        accommodation_options=[],
        dining_recommendations=[],
        safety_info=SafetyInfo(
            general_safety=[], health_advisories=[], 
            emergency_contacts={}, accessibility_notes=[]
        ),
        generated_at=datetime.now(),
        confidence_score=0.9,
        sources=["Test"]
    )
    
    # Generate ICS
    exporter = ICSExporter("Europe/Paris")
    ics_content = exporter.itinerary_to_ics(sample_itinerary)
    
    # Save to file for testing
    with open("test_itinerary.ics", "w") as f:
        f.write(ics_content)
    
    print("Sample ICS file generated: test_itinerary.ics")
    print("First 500 characters:")
    print(ics_content[:500] + "...")