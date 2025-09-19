# Smart Travel API

An open-source, AI-powered backend service designed to revolutionize personalized travel planning.

## Overview

The Smart Travel API acts as the intelligent core for travel applications, enabling users to create dynamic, end-to-end trip itineraries tailored to their budgets, interests, preferences, and real-time conditions. Built with a multi-agent AI system, it leverages lightweight Hugging Face models to collaborate on tasks like destination exploration, transport planning, budget optimization, and immersive audio tours.

### Purpose

This API solves common pain points in travel planning:
- Static recommendations
- Manual adjustments for weather/delays  
- Fragmented booking experiences

It provides a seamless, adaptive solution where AI agents work together to generate hyper-personalized plans that evolve with user inputs and external factors.

**Target Users:** Mobile/web apps for individual travelers, families, or groups  
**Focus:** Accessibility, safety, and immersion  
**Architecture:** Fully extensible for production use

> **Note:** This is an MVP (Minimum Viable Product) implementation, focusing on core functionality while leaving room for enhancements like full-scale bookings or advanced social features.

## Features

### 🎯 Personalized Itinerary Generation
- Creates day-by-day plans including activities, transport, accommodations, dining, and costs
- Tailors to user budgets, interests, and vibes via moodboard analysis
- Exports plans as iCal (.ics) for easy calendar integration

### 🎤 Multimodal Input Support
- **Voice Prompts:** Transcribe spoken inputs using Whisper
- **Moodboard/Image Interpretation:** Analyze uploaded images with CLIP to detect vibes
- **Calendar Integration:** Parse .ics files to identify free dates
- **Quick Modes:** "Surprise Me" and "Follow My Feet" for instant planning

### 🔄 Dynamic Replanning
- Monitors real-time conditions (weather via Open-Meteo)
- Automatically triggers itinerary adjustments
- Uses event bus to handle delays, closures, or cancellations

### 🎧 Immersive Audio Tours
- Generates detailed, conversational tour narratives
- Includes TTS audio output as base64-encoded WAV files
- Specialist agents ensure focused content (culinary, historical, etc.)

### 📱 Bookings and Utilities
- **Mock Bookings:** Fetches real availability/pricing from OpenTripMap
- **Safety & Accessibility:** Provides advisories and wheelchair-friendly routes
- **Fact Verification:** Checks historical/architectural facts with citations
- **POI Search:** Semantic search in Qdrant vector DB

### 📊 Data-Driven Recommendations
- POIs scraped dynamically and stored in Qdrant for fast retrieval
- Supports real-time web data via duckduckgo-search and Playwright

## Advantages

✅ **Personalization at Scale:** Multi-agent collaboration ensures deeply tailored plans  
✅ **Dynamic & Adaptive:** Real-time replanning makes it resilient to changes  
✅ **Multimodal & User-Friendly:** Supports creative inputs (voice, images, calendars)  
✅ **Immersive Experiences:** Audio tours transform plans into guided adventures  
✅ **Open-Source & Cost-Effective:** No proprietary dependencies, uses free APIs  
✅ **Efficient & Performant:** Dockerized, ~1-2s response times on modest hardware  
✅ **Extensible:** Modular design allows easy scaling  
✅ **Safety-Focused:** Built-in verification and advisories  
✅ **MVP-Ready:** Fully functional with sample data

## Current Limitations

While the API is a complete MVP, some features are simplified for scope and open-source constraints:

- **Real Bookings:** Currently mocks with OpenTripMap data (no actual transactions)
- **Advanced Social Features:** No user invites or group preference resolution
- **Post-Trip Features:** No automated trip diary generation
- **AR Overlays & Offline Caching:** Frontend handles AR rendering
- **Push Notifications:** No Web Push integration
- **Authentication & Security:** No JWT/OAuth (endpoints are open)
- **Scalability:** Single-instance Docker, no load balancing
- **Audio Quality:** Basic TTS (may sound robotic)

> These are intentional MVP limitations—focus on core planning/replanning/audio—while providing hooks for extension.

## Prerequisites

- **Docker:** For easy deployment
- **Qdrant:** Vector DB (`docker run -p 6333:6333 qdrant/qdrant`)
- **Hugging Face Token:** Get a read token from [huggingface.co](https://huggingface.co)
- **OpenTripMap API Key:** (Optional) Free at [opentripmap.com](https://opentripmap.com)

## Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd smart-travel-api
```

### 2. Configure Environment
Copy `.env.template` to `.env` and fill:
```env
QDRANT_URL=http://localhost:6333
HF_TOKEN=hf_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
OPEN_TRIPMAP_API_KEY=your_key  # Optional
```

### 3. Populate Qdrant Database
```bash
python database/init_qdrant.py
```
This scrapes ~500 POIs and embeds them (takes ~5-10 minutes first time).

### 4. Run the API

#### Via Docker (Recommended)
```bash
docker build -t smart-travel .
docker run -p 8000:80 --env-file .env smart-travel
```

#### Locally (Development)
```bash
pip install -r requirements.txt
playwright install --with-deps
uvicorn main:app --reload --port 8000
```

### 5. Access the API
- **API:** http://localhost:8000
- **Interactive Docs:** http://localhost:8000/docs

## API Reference

### Core Endpoints

#### `POST /plan/generate`
Generate personalized itinerary.

**Request:**
```json
{
  "destination": "Paris",
  "duration": 3,
  "budget": 1000.0,
  "interests": ["culture", "food"],
  "starting_location": "New York",
  "travel_dates": {
    "start": "2025-09-20",
    "end": "2025-09-23"
  },
  "vibes": ["romantic"],
  "priorities": ["sightseeing"],
  "image_url": "optional_moodboard_url"
}
```

**Response:**
```json
{
  "itinerary": {
    "days": [...],
    "total_cost": 850.0
  },
  "ics": "calendar_export_string"
}
```

#### `POST /audio/generate`
Generate audio tour with TTS.

**Request:**
```json
{
  "location": "Paris",
  "interests": ["history", "culture"],
  "duration": 10
}
```

**Response:**
```json
{
  "tour_text": "conversational_narrative",
  "audio_base64": "base64_encoded_wav"
}
```

#### `POST /replan/trigger`
Trigger replanning for events.

**Request:**
```json
{
  "type": "weather",
  "location": "Paris",
  "original_plan": {...}
}
```

### Input Processing Endpoints

- `POST /inputs/voice` - Transcribe voice to text
- `POST /inputs/moodboard` - Interpret images for vibes
- `POST /inputs/calendar` - Parse .ics for free dates
- `POST /inputs/surprise` - Generate random plan
- `POST /inputs/follow_feet` - GPS-based instant tour

### Utility Endpoints

- `POST /utils/safety` - Get safety advisories
- `GET /utils/verify` - Verify facts with sources

## Development Setup

### Prerequisites for Local Development
```bash
pip install -r requirements.txt
playwright install --with-deps
```

### Before Running
1. Start Qdrant container
2. Run `init_qdrant.py` at least once
3. Ensure `HF_TOKEN` is valid
4. Check Docker logs for debugging: `docker logs <container-id>`

## Roadmap

### Immediate Next Steps (2-4 weeks)
- **Data Enhancement:** Expand POI scraping, implement refresh cron job
- **Real Bookings:** Integrate Amadeus API for flights/hotels
- **User Authentication:** Add JWT and PostgreSQL for user profiles
- **Event Bus Upgrades:** Switch to webhook-based or Redis pub/sub

### Future Features
- **Frontend Integration:** React UI with WebSockets for live updates
- **Performance Optimization:** GPU deployment, caching optimization
- **Social Features:** Group invites, experience marketplace
- **Post-Trip:** Automated diary generation with photo analysis
- **Testing & Monitoring:** Unit tests, logging, and monitoring

### Production Readiness
- Load testing and performance optimization
- GDPR compliance for user data
- Legal disclaimers and security hardening