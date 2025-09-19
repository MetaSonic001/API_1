# TripCraft AI - Comprehensive Travel Planning System

A complete **free and open-source** AI-powered travel planning system with multimodal inputs, real-time updates, and immersive experiences.

## 🌟 Key Features

### Multi-Agent Intelligence
- **Orchestrator Agent**: Coordinates all specialized agents
- **Destination Agent**: Researches attractions, culture, and local insights  
- **Transport Agent**: Finds optimal flights, trains, and local transport
- **Accommodation Agent**: Discovers hotels, apartments, and unique stays
- **Dining Agent**: Curates restaurants and food experiences
- **Budget Agent**: Optimizes costs and finds deals
- **Audio Tour Agent**: Generates immersive storytelling content
- **Multimodal Agent**: Processes images, voice, and mixed inputs

### Multimodal Input Processing
- **Moodboard Analysis**: Upload travel inspiration images
- **Voice Input**: Speak your travel desires (free Whisper transcription)
- **Text Planning**: Traditional form-based input
- **Calendar Integration**: Parse available dates
- **Quick Modes**: "Surprise Me" and "Quick Start" options

### Real-time Capabilities
- **Live Monitoring**: WebSocket-based trip updates
- **Event Handling**: Weather, closures, delays, strikes
- **Auto-replanning**: Instant itinerary adjustments
- **Push Notifications**: Real-time alerts and suggestions

### Immersive Experiences
- **Audio Tours**: Generated storytelling content for locations
- **AR-Ready Data**: Structured POI information for overlays
- **Safety Information**: Accessibility and safety advisories
- **Offline Support**: Cacheable content for mobile apps

## 🏗️ Technology Stack (100% Free & Open Source)

- **Backend**: FastAPI + Python 3.9+
- **LLM**: Ollama (Gemma2, completely local and free)
- **Embeddings**: Sentence Transformers + Ollama embeddings
- **Vector DB**: Qdrant (self-hosted)
- **Image Analysis**: HuggingFace Transformers (ResNet-50)
- **Speech**: OpenAI Whisper (local, free model)
- **Web Scraping**: crawl4ai
- **Real-time**: WebSockets

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Docker (for Qdrant)
- 8GB RAM minimum (for local models)

### Installation

1. **Clone Repository**
```bash
git clone <repository-url>
cd tripcraft-ai
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

3. **Setup Ollama (Completely Free)**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull required models (free)
ollama pull gemma2:2b
ollama pull nomic-embed-text
```

4. **Start Qdrant Vector Database**
```bash
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

5. **Configure Environment**
```bash
cp .env.example .env
# Edit .env if you have optional API keys
```

6. **Run Application**
```bash
python main.py
```

7. **Access API Documentation**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## 📡 API Endpoints

### Core Travel Planning

#### Create Travel Plan
```http
POST /api/v1/travel/plan
Content-Type: application/json

{
  "mode": "text",
  "destination": "Paris",
  "origin": "New York",
  "dates": {
    "start": "2024-06-01",
    "end": "2024-06-07",
    "flexible": false
  },
  "duration_days": 6,
  "travelers": 2,
  "adults": 2,
  "children": 0,
  "budget": 3000,
  "currency": "USD",
  "budget_flexible": true,
  "travel_style": "comfort",
  "vibes": ["cultural", "romantic"],
  "interests": ["history", "art", "food"],
  "priorities": ["museums", "local cuisine"],
  "pace_level": 2,
  "accessibility_needs": [],
  "dietary_restrictions": ["vegetarian"],
  "include_audio_tour": true,
  "include_ar_ready": false,
  "realtime_updates": true
}
```

**Response:**
```json
{
  "trip_id": "abc123",
  "destination_info": {
    "name": "Paris",
    "type": "city",
    "coordinates": [2.3522, 48.8566]
  },
  "summary": "6-day romantic and cultural journey through Paris",
  "total_duration_days": 6,
  "estimated_budget": {
    "total": 3000,
    "currency": "USD",
    "transport": 900,
    "accommodation": 1200,
    "food": 600,
    "activities": 240,
    "shopping": 60,
    "contingency": 300
  },
  "daily_plans": [
    {
      "date": "2024-06-01",
      "theme": "Arrival and City Orientation",
      "morning": [
        {
          "start_time": "09:00",
          "end_time": "12:00",
          "activity": "Louvre Museum Visit",
          "location": {
            "name": "Louvre Museum",
            "type": "attraction"
          },
          "description": "World's largest art museum...",
          "cost": 17.0,
          "booking_required": true
        }
      ],
      "afternoon": [...],
      "evening": [...],
      "total_cost": 185.0,
      "travel_time_minutes": 90
    }
  ],
  "transport_options": [
    {
      "type": "flight",
      "provider": "Air France",
      "departure_time": "2024-06-01T08:00:00Z",
      "arrival_time": "2024-06-01T20:30:00Z",
      "duration_minutes": 450,
      "price": 850.0,
      "carbon_footprint": "0.9 tons CO2"
    }
  ],
  "accommodation_options": [...],
  "dining_recommendations": [...],
  "audio_tour_segments": [
    {
      "location": "Eiffel Tower",
      "content": "Standing before this iron lattice tower...",
      "duration_minutes": 5,
      "voice_style": "friendly_guide"
    }
  ],
  "safety_info": {
    "general_safety": ["Stay aware of pickpockets"],
    "health_advisories": ["No special vaccinations required"],
    "emergency_contacts": {"emergency": "112"},
    "accessibility_notes": ["Many museums have wheelchair access"]
  },
  "generated_at": "2024-03-15T10:30:00Z",
  "confidence_score": 0.85,
  "sources": ["Web Search", "Vector Database"]
}
```

#### Quick Start Planning
```http
POST /api/v1/travel/quick-start?location=Current%20Location
```

#### Surprise Me Planning
```http
POST /api/v1/travel/surprise-me?budget=2000&days=5
```

#### Get Travel Plan
```http
GET /api/v1/travel/plan/{trip_id}
```

### Multimodal Input Processing

#### Analyze Moodboard
```http
POST /api/v1/multimodal/analyze-moodboard
Content-Type: multipart/form-data

images: [file1.jpg, file2.jpg]
description: "Looking for adventure and culture"
```

**Response:**
```json
{
  "analysis": {
    "vibes": ["mountain", "adventure", "cultural"],
    "activities": ["hiking", "museums"],
    "styles": ["backpacker"],
    "themes": ["outdoor", "exploration"],
    "confidence": 0.75
  },
  "suggested_destinations": ["Nepal", "Peru", "Morocco"],
  "confidence_score": 0.8
}
```

#### Transcribe Voice
```http
POST /api/v1/multimodal/transcribe-voice
Content-Type: multipart/form-data

audio: recording.wav
language: en
```

**Response:**
```json
{
  "transcription": "I want a week-long adventure trip to Asia with cultural experiences and local food",
  "extracted_preferences": {
    "destination": "Asia",
    "activities": ["adventure", "cultural", "culinary"],
    "duration": "7 days",
    "budget": null
  }
}
```

#### Process Multiple Inputs
```http
POST /api/v1/multimodal/process-multimodal
Content-Type: multipart/form-data

text_input: "Beach vacation in Southeast Asia"
images: [beach1.jpg, sunset2.jpg]
audio: voice_note.wav
```

### Real-time Updates

#### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:8000/api/v1/realtime/ws/trip_123');

// Listen for updates
ws.onmessage = function(event) {
    const update = JSON.parse(event.data);
    if (update.type === 'updates') {
        // Handle real-time updates
        console.log('Trip updates:', update.data);
    }
};

// Request updates
ws.send(JSON.stringify({
    type: 'get_updates'
}));

// Trigger replanning
ws.send(JSON.stringify({
    type: 'trigger_replan',
    event_details: {
        type: 'weather',
        description: 'Heavy rain forecasted'
    }
}));
```

#### Handle External Events
```http
POST /api/v1/realtime/events/{trip_id}
Content-Type: application/json

{
  "type": "weather_alert",
  "message": "Thunderstorm warning for tomorrow",
  "severity": "warning",
  "affected_time": "2024-06-02T14:00:00Z"
}
```

#### Trip Health Check
```http
GET /api/v1/realtime/health/{trip_id}
```

**Response:**
```json
{
  "trip_id": "trip_123",
  "status": "monitored",
  "last_update": "2024-03-15T10:45:00Z",
  "websocket_connected": true
}
```

## 📊 Data Models

### Travel Planning Request
```typescript
interface TravelPlanningRequest {
  mode: "text" | "voice" | "moodboard" | "quick_start" | "surprise_me";
  destination: string | LocationInfo;
  origin?: string | LocationInfo;
  dates: {
    start: string; // ISO date or "flexible"
    end: string;
    flexible: boolean;
  };
  duration_days: number; // 1-30
  travelers: number; // 1-20
  adults: number;
  children: number;
  age_groups: string[];
  budget?: number;
  currency: string; // "USD", "EUR", etc.
  budget_flexible: boolean;
  travel_style?: "backpacker" | "comfort" | "luxury" | "eco_conscious";
  vibes: ("relaxing" | "adventure" | "romantic" | "cultural" | "food_focused" | "nature" | "photography")[];
  interests: string[];
  priorities: string[];
  pace_level: number; // 0-5 (0=very slow, 5=very fast)
  multimodal_inputs: MultimodalInput[];
  accessibility_needs: string[];
  dietary_restrictions: string[];
  previous_visits: boolean;
  loved_places?: string;
  additional_info?: string;
  include_audio_tour: boolean;
  include_ar_ready: boolean;
  realtime_updates: boolean;
}
```

### Location Info
```typescript
interface LocationInfo {
  name: string;
  coordinates?: [longitude, latitude];
  type: "city" | "landmark" | "region" | "area";
}
```

### Activity Block
```typescript
interface ActivityBlock {
  start_time: string; // "HH:MM"
  end_time: string;
  activity: string;
  location: LocationInfo;
  description: string;
  cost?: number;
  booking_required: boolean;
  alternatives: string[];
}
```

### Audio Tour Segment
```typescript
interface AudioTourSegment {
  location: string;
  content: string; // Generated narrative text
  duration_minutes: number;
  voice_style: "friendly_guide" | "historian" | "local_expert";
  background_sounds?: string;
}
```

### Realtime Update
```typescript
interface RealtimeUpdate {
  trip_id: string;
  update_type: "weather" | "transport" | "closure" | "event" | "general";
  message: string;
  severity: "info" | "warning" | "critical";
  action_required: boolean;
  suggested_changes?: any;
  timestamp: string; // ISO datetime
}
```

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Ollama (Free Local LLM)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma2:2b
OLLAMA_EMBED_MODEL=nomic-embed-text

# Qdrant Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=  # Optional

# Optional Free Tier APIs
HUGGINGFACE_TOKEN=  # Optional, free tier available
GOOGLE_MAPS_API_KEY=  # Optional, has free quota

# Application Settings
ENVIRONMENT=development
DEBUG=true
RATE_LIMIT_CALLS=100
RATE_LIMIT_PERIOD=3600

# Free Models
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
MULTIMODAL_MODEL=microsoft/resnet-50
```

## 🏃‍♂️ Development

### Running in Development
```bash
# Start with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or use the main script
python main.py
```

### Testing Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Create simple travel plan
curl -X POST "http://localhost:8000/api/v1/travel/plan" \
  -H "Content-Type: application/json" \
  -d '{"destination": "Tokyo", "duration_days": 5, "budget": 2000}'

# Quick start
curl -X POST "http://localhost:8000/api/v1/travel/quick-start?location=Paris"

# Surprise planning
curl -X POST "http://localhost:8000/api/v1/travel/surprise-me?budget=1500&days=4"
```

## 📱 Frontend Integration Guide

### Basic Travel Planning Flow
1. **Input Collection**: Use multimodal endpoints for rich input
2. **Plan Creation**: Call `/travel/plan` with comprehensive request
3. **Real-time Updates**: Connect WebSocket for live monitoring  
4. **Plan Display**: Render structured itinerary data
5. **Audio Integration**: Use generated text for TTS via Twilio

### WebSocket Integration
```javascript
class TripMonitor {
  constructor(tripId) {
    this.tripId = tripId;
    this.ws = new WebSocket(`ws://localhost:8000/api/v1/realtime/ws/${tripId}`);
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    this.ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      this.handleUpdate(update);
    };
  }
  
  requestUpdates() {
    this.ws.send(JSON.stringify({ type: 'get_updates' }));
  }
  
  triggerReplan(eventDetails) {
    this.ws.send(JSON.stringify({
      type: 'trigger_replan',
      event_details: eventDetails
    }));
  }
}
```

### Image Upload for Moodboard
```javascript
async function uploadMoodboard(files, description) {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));
  if (description) formData.append('description', description);
  
  const response = await fetch('/api/v1/multimodal/analyze-moodboard', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}
```

## 🔄 System Architecture

### Agent Collaboration Flow
```
User Input → Orchestrator → [Destination, Transport, Accommodation, Dining] → Budget → Audio Tour → Response
                ↓
          Multimodal Processing (Images/Voice)
                ↓
          Vector Search (Similar Experiences)
                ↓
          Real-time Monitoring Setup
```

### Data Flow
1. **Input Processing**: Multimodal inputs analyzed and structured
2. **Agent Coordination**: Orchestrator manages parallel agent execution
3. **Data Integration**: Results merged into comprehensive plan
4. **Enhancement**: Safety, accessibility, audio content added
5. **Real-time Setup**: Monitoring initialized for live updates
6. **Response Generation**: Structured JSON returned to client

## 🚨 Error Handling

The API returns standard HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid input)
- `404`: Resource not found  
- `422`: Validation Error
- `500`: Internal Server Error

Error responses include detailed messages:
```json
{
  "detail": "Validation error: destination is required",
  "type": "validation_error"
}
```

## 📈 Performance & Scaling

### Local Resource Requirements
- **RAM**: 8GB minimum (for local models)
- **Storage**: 10GB for models and data
- **CPU**: 4+ cores recommended

### Production Considerations
- Use GPU acceleration for faster model inference
- Implement Redis for session management
- Add database for persistent trip storage
- Configure load balancer for multiple instances
- Use CDN for static assets

## 🔐 Security Notes

- API keys stored in environment variables only
- No sensitive data logged
- Rate limiting implemented
- CORS configured (adjust for production)
- All models run locally (no data sent to external services)

## 📄 License

MIT License - Free for commercial and personal use.

## 🤝 Contributing

Contributions welcome! The system is designed to be modular:
- Add new agents in `/agents/`
- Extend API endpoints in `/api/`
- Add new tools in `/tools/`
- Enhance services in `/services/`

## 📞 Support

This is a complete, self-contained system using only free and open-source technologies. All AI processing happens locally, ensuring privacy and eliminating ongoing costs.