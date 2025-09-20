#!/usr/bin/env python3
"""
scripts/init_qdrant.py - POI Seeder & Embedder

Seeds Qdrant with starter POIs for semantic search.
Uses free OpenTripMap API and local embeddings.
"""

import asyncio
import json
import csv
import os
import sys
import time
from typing import List, Dict, Any, Optional
from pathlib import Path
import uuid

import httpx
import asyncio
from qdrant_client import QdrantClient
from qdrant_client.http import models
from sentence_transformers import SentenceTransformer

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from config.settings import get_settings

class POISeeder:
    def __init__(self, qdrant_url: str = "http://localhost:6333", api_key: str = None):
        self.settings = get_settings()
        self.qdrant_client = QdrantClient(url=qdrant_url, api_key=api_key)
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.collection_name = "travel_pois"
        
        # Rate limiting for free APIs
        self.last_request_time = 0
        self.request_delay = 1.0  # 1 second between requests
        
        # Progress tracking
        self.total_processed = 0
        self.successful_inserts = 0
        
    async def rate_limit(self):
        """Simple rate limiting for free APIs"""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.request_delay:
            await asyncio.sleep(self.request_delay - elapsed)
        self.last_request_time = time.time()

    def setup_collection(self):
        """Setup Qdrant collection for POIs"""
        try:
            # Check if collection exists
            collections = self.qdrant_client.get_collections().collections
            if any(c.name == self.collection_name for c in collections):
                print(f"Collection '{self.collection_name}' already exists")
                return
            
            # Create collection
            self.qdrant_client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=384,  # all-MiniLM-L6-v2 embedding size
                    distance=models.Distance.COSINE
                )
            )
            print(f"Created collection: {self.collection_name}")
            
        except Exception as e:
            print(f"Error setting up collection: {e}")
            raise

    async def fetch_opentripmap_pois(self, city: str, radius: int = 10000, limit: int = 100) -> List[Dict]:
        """Fetch POIs from OpenTripMap (free API)"""
        await self.rate_limit()
        
        # OpenTripMap is free, no API key needed for basic usage
        base_url = "https://api.opentripmap.com/0.1/en/places"
        
        try:
            async with httpx.AsyncClient() as client:
                # First get city coordinates
                geocode_url = f"{base_url}/geoname"
                geocode_response = await client.get(geocode_url, params={"name": city})
                
                if geocode_response.status_code != 200:
                    print(f"Failed to geocode {city}")
                    return []
                
                city_data = geocode_response.json()
                if not city_data:
                    print(f"No geocoding results for {city}")
                    return []
                
                lat, lon = city_data["lat"], city_data["lon"]
                
                # Fetch POIs around the city
                pois_url = f"{base_url}/radius"
                params = {
                    "radius": radius,
                    "lon": lon,
                    "lat": lat,
                    "limit": limit,
                    "format": "json"
                }
                
                await self.rate_limit()
                pois_response = await client.get(pois_url, params=params)
                
                if pois_response.status_code != 200:
                    print(f"Failed to fetch POIs for {city}")
                    return []
                
                pois_data = pois_response.json()
                
                # Fetch detailed info for each POI
                detailed_pois = []
                for poi in pois_data.get("features", [])[:50]:  # Limit to 50 per city
                    try:
                        await self.rate_limit()
                        
                        poi_id = poi["properties"]["xid"]
                        detail_url = f"{base_url}/xid/{poi_id}"
                        detail_response = await client.get(detail_url)
                        
                        if detail_response.status_code == 200:
                            detail_data = detail_response.json()
                            detailed_pois.append({
                                "id": poi_id,
                                "name": detail_data.get("name", "Unknown"),
                                "lat": detail_data.get("point", {}).get("lat", 0),
                                "lon": detail_data.get("point", {}).get("lon", 0),
                                "description": detail_data.get("wikipedia_extracts", {}).get("text", "")[:500],
                                "url": detail_data.get("wikipedia", ""),
                                "city": city,
                                "tags": detail_data.get("kinds", "").split(","),
                                "rating": detail_data.get("rate", 0)
                            })
                    except Exception as e:
                        print(f"Error fetching POI details: {e}")
                        continue
                
                return detailed_pois
                
        except Exception as e:
            print(f"Error fetching OpenTripMap data for {city}: {e}")
            return []

    def load_fallback_pois(self) -> List[Dict]:
        """Load fallback POIs from CSV if API fails"""
        fallback_file = Path(__file__).parent / "fallback_pois.csv"
        
        if not fallback_file.exists():
            # Create a minimal fallback dataset
            fallback_data = [
                {"name": "Eiffel Tower", "city": "Paris", "lat": 48.8584, "lon": 2.2945, "description": "Iconic iron lattice tower", "tags": ["landmark", "architecture"], "rating": 5},
                {"name": "Colosseum", "city": "Rome", "lat": 41.8902, "lon": 12.4922, "description": "Ancient Roman amphitheater", "tags": ["historical", "architecture"], "rating": 5},
                {"name": "Big Ben", "city": "London", "lat": 51.4994, "lon": -0.1245, "description": "Famous clock tower", "tags": ["landmark", "architecture"], "rating": 4},
                {"name": "Sagrada Familia", "city": "Barcelona", "lat": 41.4036, "lon": 2.1744, "description": "Gaudi's masterpiece basilica", "tags": ["architecture", "religious"], "rating": 5},
                {"name": "Golden Gate Bridge", "city": "San Francisco", "lat": 37.8199, "lon": -122.4783, "description": "Iconic suspension bridge", "tags": ["landmark", "architecture"], "rating": 5}
            ]
            
            with open(fallback_file, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=["name", "city", "lat", "lon", "description", "tags", "rating"])
                writer.writeheader()
                for poi in fallback_data:
                    poi["tags"] = ",".join(poi["tags"])
                    writer.writerow(poi)
            
            return fallback_data
        
        # Read existing fallback file
        pois = []
        with open(fallback_file, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                row["tags"] = row["tags"].split(",")
                row["lat"] = float(row["lat"])
                row["lon"] = float(row["lon"])
                row["rating"] = int(row["rating"])
                pois.append(row)
        
        return pois

    def create_embedding(self, poi: Dict) -> List[float]:
        """Create embedding for POI"""
        # Combine text fields for embedding
        text_content = f"{poi['name']} {poi.get('description', '')} {poi['city']} {' '.join(poi.get('tags', []))}"
        embedding = self.embedding_model.encode(text_content)
        return embedding.tolist()

    def batch_insert_pois(self, pois: List[Dict], batch_size: int = 64):
        """Insert POIs into Qdrant in batches"""
        points = []
        
        for i, poi in enumerate(pois):
            try:
                embedding = self.create_embedding(poi)
                
                point = models.PointStruct(
                    id=str(uuid.uuid4()),   # valid unique UUID for Qdrant
                    vector=embedding,
                    payload={
                        "name": poi["name"],
                        "city": poi.get("city", ""),
                        "description": poi.get("description", ""),
                        "lat": poi.get("lat", 0),
                        "lon": poi.get("lon", 0),
                        "tags": poi.get("tags", []),
                        "rating": poi.get("rating", 0),
                        "url": poi.get("url", "")
                    }
                )
                points.append(point)
                
                # Insert batch
                if len(points) >= batch_size:
                    self.qdrant_client.upsert(
                        collection_name=self.collection_name,
                        points=points
                    )
                    self.successful_inserts += len(points)
                    print(f"Inserted batch of {len(points)} POIs (Total: {self.successful_inserts})")
                    points = []
                
            except Exception as e:
                print(f"Error processing POI {poi.get('name', 'Unknown')}: {e}")
                continue
        
        # Insert remaining points
        if points:
            self.qdrant_client.upsert(
                collection_name=self.collection_name,
                points=points
            )
            self.successful_inserts += len(points)
            print(f"Inserted final batch of {len(points)} POIs")

    async def seed_cities(self, cities: List[str]) -> None:
        """Seed Qdrant with POIs from multiple cities"""
        print(f"Seeding {len(cities)} cities: {', '.join(cities)}")
        
        all_pois = []
        
        for city in cities:
            print(f"\nFetching POIs for {city}...")
            
            try:
                # Try OpenTripMap first
                pois = await self.fetch_opentripmap_pois(city)
                
                if not pois:
                    print(f"No POIs found for {city} via API, using fallback data")
                    fallback_pois = self.load_fallback_pois()
                    city_pois = [poi for poi in fallback_pois if poi["city"].lower() == city.lower()]
                    pois.extend(city_pois)
                
                all_pois.extend(pois)
                print(f"Collected {len(pois)} POIs for {city}")
                
            except Exception as e:
                print(f"Error collecting POIs for {city}: {e}")
                continue
        
        if all_pois:
            print(f"\nInserting {len(all_pois)} POIs into Qdrant...")
            self.batch_insert_pois(all_pois)
            print(f"Successfully seeded {self.successful_inserts} POIs")
        else:
            print("No POIs to seed")

    def get_collection_stats(self) -> Dict:
        """Get collection statistics"""
        try:
            info = self.qdrant_client.get_collection(self.collection_name)
            return {
                "total_points": info.points_count,
                "vector_size": info.config.params.vectors.size,
                "status": info.status
            }
        except Exception as e:
            return {"error": str(e)}

async def main():
    """Main seeding function"""
    print("TripCraft AI - Qdrant POI Seeder")
    print("=" * 40)
    
    # Default cities to seed
    DEFAULT_CITIES = [
        "Paris", "London", "Rome", "Barcelona", "Amsterdam",
        "Tokyo", "New York", "San Francisco", "Sydney", "Bangkok"
    ]
    
    # Parse command line arguments
    import argparse
    parser = argparse.ArgumentParser(description="Seed Qdrant with travel POIs")
    parser.add_argument("--cities", nargs="+", default=DEFAULT_CITIES, help="Cities to seed")
    parser.add_argument("--qdrant-url", default="http://localhost:6333", help="Qdrant URL")
    parser.add_argument("--api-key", help="Qdrant API key (optional)")
    parser.add_argument("--reset", action="store_true", help="Reset collection before seeding")
    
    args = parser.parse_args()
    
    # Initialize seeder
    seeder = POISeeder(args.qdrant_url, args.api_key)
    
    # Setup collection
    if args.reset:
        try:
            seeder.qdrant_client.delete_collection(seeder.collection_name)
            print("Deleted existing collection")
        except:
            pass
    
    seeder.setup_collection()
    
    # Show initial stats
    stats = seeder.get_collection_stats()
    print(f"Collection stats before seeding: {stats}")
    
    # Seed cities
    await seeder.seed_cities(args.cities)
    
    # Show final stats
    stats = seeder.get_collection_stats()
    print(f"\nFinal collection stats: {stats}")
    print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(main())