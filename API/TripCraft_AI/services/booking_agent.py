"""
services/booking_agent.py - Mock Booking Service

Provides demo booking functionality using free OpenTripMap data.
No real payments, returns mock confirmations for testing.
"""

import uuid
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from enum import Enum
import json
import httpx
from dataclasses import dataclass

class BookingStatus(str, Enum):
    CONFIRMED = "confirmed"
    PENDING = "pending" 
    CANCELLED = "cancelled"
    FAILED = "failed"

class BookingType(str, Enum):
    ACCOMMODATION = "accommodation"
    ACTIVITY = "activity"
    TRANSPORT = "transport"
    DINING = "dining"

@dataclass
class BookingItem:
    item_type: BookingType
    name: str
    date: str
    price: float
    currency: str = "USD"
    details: Dict[str, Any] = None

@dataclass
class BookingConfirmation:
    booking_id: str
    provider: str
    status: BookingStatus
    item: BookingItem
    booking_url: str
    valid_until: datetime
    confirmation_code: str
    terms: str
    cancellation_policy: str

class MockBookingAgent:
    def __init__(self):
        self.provider_name = "TripCraft Demo Bookings"
        self.base_url = "https://demo.tripcraft.ai/bookings"
        
        # Mock provider data for realistic responses
        self.mock_providers = {
            "accommodation": ["BookingDemo", "StayMock", "HotelSim"],
            "activity": ["GetYourGuide-Demo", "Viator-Mock", "Civitatis-Sim"],
            "transport": ["FlightDemo", "TrainMock", "BusSim"],
            "dining": ["OpenTable-Demo", "Resy-Mock", "TableCheck-Sim"]
        }
        
        # Mock pricing multipliers by city (based on cost of living)
        self.city_multipliers = {
            "paris": 1.3, "london": 1.4, "tokyo": 1.2, "new york": 1.5,
            "rome": 1.1, "barcelona": 1.0, "amsterdam": 1.2, "sydney": 1.3,
            "bangkok": 0.6, "prague": 0.8, "budapest": 0.7, "lisbon": 0.9
        }

    def generate_deterministic_booking_id(self, item: BookingItem, user_email: str = "demo@tripcraft.ai") -> str:
        """Generate deterministic booking ID for consistent demos"""
        # Create consistent hash from item details + user
        data_string = f"{item.name}_{item.date}_{item.price}_{user_email}"
        hash_obj = hashlib.md5(data_string.encode())
        return f"TC_{hash_obj.hexdigest()[:8].upper()}"

    def calculate_mock_price(self, item: BookingItem, city: str = "") -> float:
        """Calculate realistic mock pricing"""
        base_prices = {
            BookingType.ACCOMMODATION: 120.0,  # per night
            BookingType.ACTIVITY: 35.0,      # per person
            BookingType.TRANSPORT: 85.0,     # per segment
            BookingType.DINING: 45.0         # per person
        }
        
        base_price = base_prices.get(item.item_type, 50.0)
        
        # Apply city multiplier
        city_key = city.lower().replace(" ", "")
        multiplier = self.city_multipliers.get(city_key, 1.0)
        
        # Add some variation based on item name hash
        name_hash = hash(item.name) % 100
        variation = 0.8 + (name_hash / 100) * 0.4  # 0.8 to 1.2 multiplier
        
        return round(base_price * multiplier * variation, 2)

    def get_mock_provider(self, item_type: BookingType) -> str:
        """Get random mock provider name"""
        providers = self.mock_providers.get(item_type.value, ["Generic-Demo"])
        # Use item name hash for consistent provider selection
        hash_val = hash(item_type.value) % len(providers)
        return providers[hash_val]

    def mock_book_item(
        self, 
        item: BookingItem, 
        user_email: str = "demo@tripcraft.ai",
        city: str = "",
        mode: str = "sandbox"
    ) -> BookingConfirmation:
        """
        Create mock booking confirmation
        
        Args:
            item: Item to book
            user_email: User email for deterministic IDs
            city: City for pricing adjustments
            mode: Always sandbox for demo
        
        Returns:
            BookingConfirmation object
        """
        
        # Generate deterministic booking ID
        booking_id = self.generate_deterministic_booking_id(item, user_email)
        
        # Calculate realistic price if not provided
        if not item.price:
            item.price = self.calculate_mock_price(item, city)
        
        # Get mock provider
        provider = self.get_mock_provider(item.item_type)
        
        # Generate confirmation code
        confirmation_code = f"DEMO{booking_id[-6:]}"
        
        # Set validity (24 hours for demo bookings)
        valid_until = datetime.now() + timedelta(hours=24)
        
        # Create booking URL
        booking_url = f"{self.base_url}/{booking_id}"
        
        # Generate realistic terms and cancellation policy
        terms, cancellation_policy = self._generate_booking_terms(item.item_type)
        
        return BookingConfirmation(
            booking_id=booking_id,
            provider=provider,
            status=BookingStatus.CONFIRMED,
            item=item,
            booking_url=booking_url,
            valid_until=valid_until,
            confirmation_code=confirmation_code,
            terms=terms,
            cancellation_policy=cancellation_policy
        )

    def _generate_booking_terms(self, item_type: BookingType) -> tuple[str, str]:
        """Generate realistic booking terms and cancellation policies"""
        
        common_terms = "This is a DEMO booking. No real payment has been processed. " \
                      "This confirmation is for demonstration purposes only."
        
        terms_by_type = {
            BookingType.ACCOMMODATION: {
                "terms": f"{common_terms} Check-in after 3:00 PM, check-out before 11:00 AM. Valid ID required.",
                "cancellation": "Free cancellation up to 24 hours before check-in. Late cancellation may incur charges."
            },
            BookingType.ACTIVITY: {
                "terms": f"{common_terms} Please arrive 15 minutes before start time. Weather-dependent activities may be rescheduled.",
                "cancellation": "Free cancellation up to 24 hours in advance. Same-day cancellations are non-refundable."
            },
            BookingType.TRANSPORT: {
                "terms": f"{common_terms} Please arrive 2 hours early for international flights, 1 hour for domestic. Valid passport required.",
                "cancellation": "Cancellation fees apply. Change fees may vary by fare type and timing."
            },
            BookingType.DINING: {
                "terms": f"{common_terms} Please arrive on time for your reservation. Large parties may have gratuity included.",
                "cancellation": "Free cancellation up to 2 hours before reservation time."
            }
        }
        
        policy = terms_by_type.get(item_type, {
            "terms": common_terms,
            "cancellation": "Standard cancellation policies apply."
        })
        
        return policy["terms"], policy["cancellation"]

    def cancel_booking(self, booking_id: str, reason: str = "") -> Dict[str, Any]:
        """Cancel a mock booking"""
        return {
            "booking_id": booking_id,
            "status": "cancelled",
            "cancellation_id": f"CXL_{uuid.uuid4().hex[:8].upper()}",
            "refund_amount": 0.0,  # Demo bookings have no refund
            "refund_currency": "USD",
            "refund_timeline": "N/A - Demo booking",
            "reason": reason or "User requested cancellation",
            "cancelled_at": datetime.now().isoformat(),
            "note": "This was a demo booking. No actual payment was processed."
        }

    def get_booking_status(self, booking_id: str) -> Dict[str, Any]:
        """Get mock booking status"""
        # For demo, all bookings are confirmed
        return {
            "booking_id": booking_id,
            "status": "confirmed",
            "provider": self.get_mock_provider(BookingType.ACTIVITY),
            "last_updated": datetime.now().isoformat(),
            "notes": "Demo booking - tracking simulation active",
            "checkin_available": datetime.now() + timedelta(hours=1) > datetime.now(),
            "support_contact": "demo-support@tripcraft.ai"
        }

    def bulk_book_itinerary(
        self, 
        items: List[Dict[str, Any]], 
        user_email: str = "demo@tripcraft.ai",
        city: str = ""
    ) -> List[BookingConfirmation]:
        """Book multiple items from an itinerary"""
        confirmations = []
        
        for item_data in items:
            try:
                # Convert dict to BookingItem
                booking_item = BookingItem(
                    item_type=BookingType(item_data.get("type", "activity")),
                    name=item_data["name"],
                    date=item_data.get("date", datetime.now().strftime("%Y-%m-%d")),
                    price=item_data.get("price", 0.0),
                    currency=item_data.get("currency", "USD"),
                    details=item_data.get("details", {})
                )
                
                confirmation = self.mock_book_item(booking_item, user_email, city)
                confirmations.append(confirmation)
                
            except Exception as e:
                # Log error but continue with other bookings
                print(f"Error booking item {item_data.get('name', 'Unknown')}: {e}")
                continue
        
        return confirmations

# Convenience functions for API endpoints
def mock_book_single_item(item_data: Dict[str, Any], user_email: str = "demo@tripcraft.ai") -> Dict[str, Any]:
    """Book a single item and return dict response"""
    agent = MockBookingAgent()
    
    booking_item = BookingItem(
        item_type=BookingType(item_data.get("type", "activity")),
        name=item_data["name"],
        date=item_data.get("date", datetime.now().strftime("%Y-%m-%d")),
        price=item_data.get("price", 0.0),
        currency=item_data.get("currency", "USD"),
        details=item_data.get("details", {})
    )
    
    confirmation = agent.mock_book_item(booking_item, user_email)
    
    return {
        "booking_id": confirmation.booking_id,
        "provider": confirmation.provider,
        "status": confirmation.status.value,
        "price": confirmation.item.price,
        "currency": confirmation.item.currency,
        "booking_url": confirmation.booking_url,
        "valid_until": confirmation.valid_until.isoformat(),
        "confirmation_code": confirmation.confirmation_code,
        "terms": confirmation.terms,
        "cancellation_policy": confirmation.cancellation_policy,
        "note": "This is a demo booking for testing purposes only"
    }

# Example usage
if __name__ == "__main__":
    agent = MockBookingAgent()
    
    # Test booking
    sample_item = BookingItem(
        item_type=BookingType.ACTIVITY,
        name="Eiffel Tower Skip-the-Line Tour",
        date="2024-06-15",
        price=35.0
    )
    
    confirmation = agent.mock_book_item(sample_item, "test@example.com", "Paris")
    print(f"Booking confirmed: {confirmation.booking_id}")
    print(f"Provider: {confirmation.provider}")
    print(f"Price: ${confirmation.item.price}")
    print(f"Valid until: {confirmation.valid_until}")
    
    # Test cancellation
    cancel_result = agent.cancel_booking(confirmation.booking_id, "Testing cancellation")
    print(f"Cancellation ID: {cancel_result['cancellation_id']}")