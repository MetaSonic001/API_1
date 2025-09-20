"""
services/offline_builder.py - Offline Package Creator

Creates downloadable ZIP packages with itinerary, maps, and audio content.
"""

import zipfile
import json
import io
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path
import base64
import folium
from PIL import Image
import requests

from models.travel_response import TravelPlanResponse
from utils.ics_export import itinerary_to_ics

class OfflinePackageBuilder:
    def __init__(self, max_package_size_mb: int = 50):
        self.max_package_size = max_package_size_mb * 1024 * 1024  # Convert to bytes
        
    def build_offline_package(
        self,
        itinerary: TravelPlanResponse,
        audio_files: Dict[str, bytes] = None,
        include_maps: bool = True
    ) -> bytes:
        """Build complete offline package as ZIP"""
        
        # Create in-memory ZIP
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Add manifest
            manifest = self._create_manifest(itinerary)
            zip_file.writestr('manifest.json', json.dumps(manifest, indent=2))
            
            # Add itinerary JSON
            itinerary_json = itinerary.json(indent=2)
            zip_file.writestr('itinerary.json', itinerary_json)
            
            # Add ICS calendar file
            ics_content = itinerary_to_ics(itinerary)
            zip_file.writestr('calendar.ics', ics_content)
            
            # Add audio files if provided
            if audio_files:
                for location, audio_data in audio_files.items():
                    safe_filename = self._sanitize_filename(f"{location}.mp3")
                    zip_file.writestr(f'audio/{safe_filename}', audio_data)
            
            # Add maps if requested
            if include_maps:
                maps = self._generate_maps(itinerary)
                for map_name, map_data in maps.items():
                    zip_file.writestr(f'maps/{map_name}', map_data)
            
            # Add README
            readme_content = self._generate_readme(itinerary)
            zip_file.writestr('README.md', readme_content)
            
            # Check size limit
            current_size = zip_buffer.tell()
            if current_size > self.max_package_size:
                # Compress audio files or remove some content
                print(f"Warning: Package size ({current_size/1024/1024:.1f}MB) exceeds limit")
        
        zip_buffer.seek(0)
        return zip_buffer.read()
    
    def _create_manifest(self, itinerary: TravelPlanResponse) -> Dict[str, Any]:
        """Create package manifest"""
        return {
            "package_type": "tripcraft_offline",
            "version": "1.0",
            "generated_at": datetime.now().isoformat(),
            "trip_id": itinerary.trip_id,
            "destination": itinerary.destination_info.name,
            "duration_days": itinerary.total_duration_days,
            "contents": {
                "itinerary": "itinerary.json",
                "calendar": "calendar.ics",
                "audio": "audio/",
                "maps": "maps/",
                "readme": "README.md"
            },
            "usage_instructions": "Import calendar.ics to your calendar app. View itinerary.json for detailed plans."
        }
    
    def _generate_maps(self, itinerary: TravelPlanResponse) -> Dict[str, bytes]:
        """Generate static maps for offline use"""
        maps = {}
        
        try:
            # Create overview map
            overview_map = self._create_overview_map(itinerary)
            maps["overview.html"] = overview_map.encode('utf-8')
            
            # Create daily maps
            for i, day_plan in enumerate(itinerary.daily_plans):
                day_map = self._create_day_map(day_plan, i + 1)
                maps[f"day_{i+1}.html"] = day_map.encode('utf-8')
                
        except Exception as e:
            print(f"Error generating maps: {e}")
            # Add fallback map
            maps["fallback.html"] = "<html><body><h1>Maps unavailable offline</h1></body></html>".encode('utf-8')
        
        return maps
    
    def _create_overview_map(self, itinerary: TravelPlanResponse) -> str:
        """Create overview map using folium"""
        # Default center (will be adjusted based on locations)
        center_lat, center_lon = 40.7128, -74.0060  # NYC as fallback
        
        if itinerary.destination_info.coordinates:
            center_lon, center_lat = itinerary.destination_info.coordinates
        
        # Create map
        m = folium.Map(location=[center_lat, center_lon], zoom_start=12)
        
        # Add markers for accommodations
        for accommodation in itinerary.accommodation_options[:3]:  # Top 3
            if accommodation.location.coordinates:
                lon, lat = accommodation.location.coordinates
                folium.Marker(
                    [lat, lon],
                    popup=f"🏨 {accommodation.name}",
                    icon=folium.Icon(color='blue', icon='bed')
                ).add_to(m)
        
        # Add markers for activities
        for day_plan in itinerary.daily_plans:
            for activity in (day_plan.morning + day_plan.afternoon + day_plan.evening):
                if activity.location.coordinates:
                    lon, lat = activity.location.coordinates
                    folium.Marker(
                        [lat, lon],
                        popup=f"📍 {activity.activity}",
                        icon=folium.Icon(color='green', icon='star')
                    ).add_to(m)
        
        return m._repr_html_()
    
    def _create_day_map(self, day_plan, day_number: int) -> str:
        """Create map for a specific day"""
        # Simple day map - would be enhanced in production
        return f"""
        <html>
        <head><title>Day {day_number} Map</title></head>
        <body>
            <h1>Day {day_number}: {day_plan.theme}</h1>
            <p>Interactive map would be generated here for offline use</p>
            <ul>
                {''.join([f'<li>{activity.activity} at {activity.location.name}</li>' 
                         for activity in day_plan.morning + day_plan.afternoon + day_plan.evening])}
            </ul>
        </body>
        </html>
        """
    
    def _generate_readme(self, itinerary: TravelPlanResponse) -> str:
        """Generate README for offline package"""
        return f"""# TripCraft AI - Offline Travel Package

## Trip Overview
- **Destination**: {itinerary.destination_info.name}
- **Duration**: {itinerary.total_duration_days} days
- **Generated**: {itinerary.generated_at.strftime("%Y-%m-%d %H:%M")}
- **Trip ID**: {itinerary.trip_id}

## Package Contents

### 📅 calendar.ics
Import this file into your calendar app (Google Calendar, Apple Calendar, etc.) to add all trip events.

### 📋 itinerary.json
Complete trip details in JSON format. Can be imported into travel apps.

### 🎧 audio/ folder
Audio tour content for locations (if available)

### 🗺️ maps/ folder
Offline maps for each day and overview

## Usage Instructions

1. **Import Calendar**: Open calendar.ics in your calendar app
2. **View Details**: Open itinerary.json for complete trip information
3. **Audio Tours**: Play audio files when visiting locations
4. **Maps**: Open HTML map files in any web browser

## Emergency Information
- **Emergency Contacts**: See itinerary.json for local emergency numbers
- **Embassy/Consulate**: Contact information included in safety section

## Notes
- This is an offline package - no internet required
- Maps are static - use with GPS navigation apps for directions
- Audio files are compressed for smaller package size

Generated by TripCraft AI - https://tripcraft.ai
"""
    
    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for ZIP archive"""
        import re
        # Remove/replace problematic characters
        safe_name = re.sub(r'[<>:"/\\|?*]', '_', filename)
        return safe_name[:255]  # Limit length