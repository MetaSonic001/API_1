"""
utils/helpers.py - Utility Functions
"""
from typing import Dict, Any, List, Optional
import re
import hashlib
from datetime import datetime, timedelta
import json

def clean_text(text: str) -> str:
    """Clean and normalize text input"""
    if not text:
        return ""
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    # Remove special characters that might cause issues
    text = re.sub(r'[^\w\s\-.,!?()]', '', text)
    
    return text

def generate_trip_id(destination: str, start_date: str, user_id: Optional[str] = None) -> str:
    """Generate unique trip identifier"""
    base_string = f"{destination}_{start_date}_{user_id or 'anonymous'}_{datetime.now().isoformat()}"
    return hashlib.md5(base_string.encode()).hexdigest()[:12]

def extract_location_info(location_input: str) -> Dict[str, Any]:
    """Extract structured location information from text"""
    # Simple location parsing - could be enhanced with geocoding
    return {
        "name": location_input.strip(),
        "type": "city",
        "coordinates": None,
        "country": None,
        "region": None
    }

def calculate_duration_days(start_date: str, end_date: str) -> int:
    """Calculate trip duration in days"""
    try:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        return max(1, (end - start).days)
    except:
        return 1

def merge_preferences(base_prefs: Dict[str, Any], new_prefs: Dict[str, Any]) -> Dict[str, Any]:
    """Merge travel preferences from multiple sources"""
    merged = base_prefs.copy()
    
    for key, value in new_prefs.items():
        if key in merged:
            if isinstance(merged[key], list) and isinstance(value, list):
                merged[key] = list(set(merged[key] + value))
            elif isinstance(merged[key], dict) and isinstance(value, dict):
                merged[key].update(value)
            else:
                merged[key] = value
        else:
            merged[key] = value
    
    return merged

def validate_budget(budget: Optional[float], currency: str = "USD") -> bool:
    """Validate budget constraints"""
    if budget is None:
        return True
    
    min_budgets = {
        "USD": 100,
        "EUR": 90,
        "GBP": 80,
        "INR": 8000
    }
    
    return budget >= min_budgets.get(currency, 100)

def format_duration_string(minutes: int) -> str:
    """Format duration in human-readable string"""
    if minutes < 60:
        return f"{minutes} minutes"
    elif minutes < 1440:  # Less than 24 hours
        hours = minutes // 60
        mins = minutes % 60
        return f"{hours}h {mins}m" if mins > 0 else f"{hours} hours"
    else:
        days = minutes // 1440
        remaining_hours = (minutes % 1440) // 60
        return f"{days} days {remaining_hours}h" if remaining_hours > 0 else f"{days} days"
