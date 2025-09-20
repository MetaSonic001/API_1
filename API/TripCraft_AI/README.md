# TripCraft AI - Complete Travel Planning System

A comprehensive **free and open-source** AI-powered travel planning system with multimodal inputs, real-time updates, immersive experiences, and enterprise-grade features.

## 🌟 Key Features

### Multi-Agent Intelligence
- **Orchestrator Agent**: Coordinates all specialized agents
- **Destination Agent**: Researches attractions, culture, and local insights with fact verification
- **Transport Agent**: Finds optimal flights, trains, and local transport
- **Accommodation Agent**: Discovers hotels, apartments, and unique stays
- **Dining Agent**: Curates restaurants and food experiences
- **Budget Agent**: Optimizes costs and finds deals
- **Audio Tour Agent**: Generates immersive storytelling content
- **Multimodal Agent**: Processes images, voice, and mixed inputs

### Multimodal Input Processing
- **Moodboard Analysis**: Upload travel inspiration images (free ResNet-50 model)
- **Voice Input**: Speak your travel desires (free Whisper transcription)
- **Text Planning**: Traditional form-based input
- **Calendar Integration**: Parse available dates and export to Google/Apple Calendar
- **Quick Modes**: "Surprise Me" and "Quick Start" options

### Real-time Capabilities
- **Live Monitoring**: WebSocket-based trip updates
- **Event Handling**: Weather, closures, delays, strikes
- **Auto-replanning**: Instant itinerary adjustments
- **Push Notifications**: Real-time alerts and suggestions

### Enterprise Features
- **Booking Integration**: Mock booking system for demos (no real payments)
- **Fact Verification**: Citation-backed information to reduce hallucinations
- **Offline Packages**: Downloadable ZIP files with maps, audio, and calendars
- **Calendar Export**: Full .ics files for Google/Apple Calendar integration
- **POI Database**: Seeded with real attractions from OpenTripMap
- **Resilient Architecture**: Multiple LLM fallbacks, never fails

### Immersive Experiences
- **Audio Tours**: Generated storytelling content for locations
- **AR-Ready Data**: Structured POI information for overlays
- **Safety Information**: Accessibility and safety advisories
- **Offline Support**: Complete offline packages for mobile apps

## 🏗️ Technology Stack (100% Free & Open Source)

- **Backend**: FastAPI + Python 3.9+
- **LLM**: Ollama (Gemma2, completely local and free)
- **Embeddings**: Sentence Transformers + Ollama embeddings
- **Vector DB**: Qdrant (self-hosted)
- **Image Analysis**: HuggingFace Transformers (ResNet-50)
- **Speech**: OpenAI Whisper (local, free model)
- **Web Scraping**: crawl4ai + DuckDuckGo Search
- **Real-time**: WebSockets
- **Search**: Free DuckDuckGo API
- **Maps**: Folium (OpenStreetMap based)
- **Containerization**: Docker + Docker Compose

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- 8GB RAM minimum (12GB recommended for all models)
- Git

### Option 1: Docker Setup (Recommended)

Docker automatically handles all dependencies and services.

1. **Clone Repository**
```bash
git clone <repository-url>
cd tripcraft-ai
```

2. **Start Everything with Docker**
```bash
# Start all services (Qdrant, Ollama, Redis)
docker-compose up -d

# Download required AI models (one-time, ~7GB)
./scripts/pull_models.sh

# Seed database with POIs (one-time)
python scripts/init_qdrant.py

# Install Python dependencies
pip install -r requirements.txt
```

3. **Run Application**
```bash
python main.py
```

### Option 2: Manual Setup (No Docker)

For those who prefer installing services manually or have system constraints.

#### Step 1: Install System Dependencies

**On Ubuntu/Debian:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and build tools
sudo apt install -y python3.9 python3.9-pip python3.9-dev python3.9-venv
sudo apt install -y build-essential curl wget git

# Install additional dependencies for audio processing
sudo apt install -y ffmpeg libsndfile1
```

**On macOS:**
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install python@3.9 ffmpeg curl wget git
```

**On Windows:**
```bash
# Install Python 3.9+ from python.org
# Install Git from git-scm.com
# Install ffmpeg: https://ffmpeg.org/download.html
```

#### Step 2: Setup Python Environment
```bash
# Clone repository
git clone <repository-url>
cd tripcraft-ai

# Create virtual environment
python3.9 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

#### Step 3: Install Qdrant (Vector Database)

**Option A: Download Binary (Recommended)**
```bash
# Linux/macOS
wget https://github.com/qdrant/qdrant/releases/latest/download/qdrant-x86_64-unknown-linux-musl.tar.gz
tar -xzf qdrant-x86_64-unknown-linux-musl.tar.gz
chmod +x qdrant

# Start Qdrant in background
./qdrant &

# Test connection
curl http://localhost:6333/health
```

**Option B: Build from Source**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Clone and build Qdrant
git clone https://github.com/qdrant/qdrant.git
cd qdrant
cargo build --release

# Run Qdrant
./target/release/qdrant &
cd ..
```

#### Step 4: Install Ollama (AI Models)

**On Linux:**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
ollama serve &

# Pull required models
ollama pull gemma2:2b
ollama pull nomic-embed-text
ollama pull llava:7b  # Optional for image analysis
```

**On macOS:**
```bash
# Download and install from https://ollama.com/download
# Or use Homebrew
brew install ollama

# Start Ollama
ollama serve &

# Pull models
ollama pull gemma2:2b
ollama pull nomic-embed-text
ollama pull llava:7b  # Optional
```

**On Windows:**
```bash
# Download installer from https://ollama.com/download
# Run installer and follow instructions
# Open Command Prompt and run:
ollama serve

# In another terminal:
ollama pull gemma2:2b
ollama pull nomic-embed-text
```

#### Step 5: Setup Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit configuration for manual setup
nano .env  # or use your preferred editor
```

Update .env for manual setup:
```bash
# Manual Setup Configuration
OLLAMA_BASE_URL=http://localhost:11434
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=  # Leave empty for local setup

# Optional services (leave empty if not using)
HUGGINGFACE_TOKEN=
GOOGLE_MAPS_API_KEY=

# Application settings
ENVIRONMENT=development
DEBUG=true
```

#### Step 6: Initialize Database
```bash
# Seed Qdrant with POI data
python scripts/init_qdrant.py

# Verify seeding worked
curl http://localhost:6333/collections
```

#### Step 7: Start Application
```bash
# Ensure all services are running
# Check Qdrant
curl http://localhost:6333/health

# Check Ollama
curl http://localhost:11434/api/tags

# Start the FastAPI application
python main.py
```

### Verification Steps (Both Methods)

1. **Test API Health**
```bash
curl http://localhost:8000/health
```

2. **Run Comprehensive Test**
```bash
# Make smoke test script executable
chmod +x scripts/smoke_demo.sh

# Run end-to-end test
./scripts/smoke_demo.sh
```

3. **Access API Documentation**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

### Manual Setup Troubleshooting

**Qdrant Issues:**
```bash
# Check if port is available
netstat -tulpn | grep :6333

# Kill existing process if needed
pkill qdrant

# Restart Qdrant
./qdrant --config-path config/production.yaml
```

**Ollama Issues:**
```bash
# Check Ollama status
ps aux | grep ollama

# Restart Ollama
pkill ollama
ollama serve &

# Re-pull models if needed
ollama pull gemma2:2b
```

**Python Dependencies:**
```bash
# If some packages fail to install
pip install --upgrade setuptools wheel
pip install -r requirements.txt

# For audio processing issues
sudo apt install -y python3-dev libffi-dev libssl-dev
```

**Memory Issues:**
```bash
# Check available memory
free -h

# For systems with limited RAM, use smaller models:
ollama pull gemma:2b  # Even smaller model
```

### Performance Comparison

| Setup Method | Startup Time | RAM Usage | Maintenance | Recommended For |
|--------------|-------------|-----------|-------------|------------------|
| **Docker** | ~2 minutes | ~6GB | Low | Development, demos, production |
| **Manual** | ~10 minutes | ~4GB | Medium | Learning, customization, limited resources |

**Docker Advantages:**
- Automated dependency management
- Consistent environment across systems
- Easy cleanup and reset
- Production-ready configuration

**Manual Setup Advantages:**
- Lower memory usage
- Direct control over services
- Better for understanding system architecture
- Works on systems without Docker support

### Development Workflow (Manual Setup)

```bash
# Daily development routine
cd tripcraft-ai
source venv/bin/activate

# Check services (run in separate terminals)
./qdrant &              # Terminal 1
ollama serve &          # Terminal 2
python main.py          # Terminal 3

# Stop services
pkill qdrant ollama
```

### Production Deployment (Manual)

For production deployment without Docker:

```bash
# Use systemd services (Linux)
sudo nano /etc/systemd/system/qdrant.service
sudo nano /etc/systemd/system/ollama.service
sudo nano /etc/systemd/system/tripcraft.service

# Enable services
sudo systemctl enable qdrant ollama tripcraft
sudo systemctl start qdrant ollama tripcraft

# Use process managers
pip install gunicorn supervisor
```

Both setup methods provide the same functionality. Docker is recommended for most users due to easier setup and maintenance, while manual installation offers more control and potentially lower resource usage.

## 📡 API Endpoints

### Core Travel Planning

#### Create Comprehensive Travel Plan
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

**Enhanced Response with New Features:**
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
            "type": "attraction",
            "coordinates": [2.3376, 48.8606]
          },
          "description": "World's largest art museum with Mona Lisa and Venus de Milo. Skip-the-line tickets recommended.",
          "cost": 17.0,
          "booking_required": true,
          "verified_facts": [
            {
              "fact": "The Louvre receives over 9 million visitors annually",
              "source": "https://en.wikipedia.org/wiki/Louvre",
              "confidence": 0.95
            }
          ]
        }
      ],
      "afternoon": [...],
      "evening": [...],
      "total_cost": 185.0,
      "travel_time_minutes": 90
    }
  ],
  "transport_options": [...],
  "accommodation_options": [...],
  "dining_recommendations": [...],
  "audio_tour_segments": [
    {
      "location": "Eiffel Tower",
      "content": "Standing before this iron lattice tower, you're witnessing Gustave Eiffel's masterpiece...",
      "duration_minutes": 5,
      "voice_style": "friendly_guide",
      "citations": ["https://en.wikipedia.org/wiki/Eiffel_Tower"]
    }
  ],
  "safety_info": {
    "general_safety": ["Stay aware of pickpockets in tourist areas"],
    "health_advisories": ["No special vaccinations required"],
    "emergency_contacts": {"emergency": "112", "police": "17"},
    "accessibility_notes": ["Many museums have wheelchair access"]
  },
  "generated_at": "2024-03-15T10:30:00Z",
  "confidence_score": 0.85,
  "sources": ["OpenTripMap", "DuckDuckGo Search", "Vector Database"],
  "verification_status": "facts_verified"
}
```

### New Enterprise Endpoints

#### Book Trip Items (Demo)
```http
POST /api/v1/travel/plan/{trip_id}/book
Content-Type: application/json

{
  "items": [
    {
      "type": "activity",
      "name": "Eiffel Tower Skip-the-Line Tour",
      "date": "2024-06-15",
      "price": 35.0
    },
    {
      "type": "accommodation", 
      "name": "Hotel Plaza Paris",
      "date": "2024-06-15",
      "price": 150.0
    }
  ],
  "user_email": "traveler@example.com"
}
```

**Response:**
```json
{
  "trip_id": "abc123",
  "bookings": [
    {
      "booking_id": "TC_A7B4C9D2",
      "status": "confirmed",
      "item_name": "Eiffel Tower Skip-the-Line Tour",
      "price": 35.0,
      "confirmation_code": "DEMOA7B4C9",
      "provider": "GetYourGuide-Demo",
      "booking_url": "https://demo.tripcraft.ai/bookings/TC_A7B4C9D2",
      "valid_until": "2024-06-14T23:59:00Z",
      "cancellation_policy": "Free cancellation up to 24 hours in advance"
    }
  ],
  "total_bookings": 2,
  "note": "These are demo bookings for testing purposes"
}
```

#### Download Offline Package
```http
GET /api/v1/travel/plan/{trip_id}/download
```

Returns ZIP file containing:
- `itinerary.json` - Complete trip data
- `calendar.ics` - Calendar events
- `audio/` - Audio tour files
- `maps/` - Offline HTML maps
- `README.md` - Usage instructions
- `manifest.json` - Package metadata

#### Verify Trip Facts
```http
POST /api/v1/travel/plan/{trip_id}/verify
Content-Type: application/json

{
  "claims": [
    "The Eiffel Tower was built in 1889",
    "The Louvre is the world's largest museum"
  ]
}
```

**Response:**
```json
{
  "trip_id": "abc123",
  "verified_claims": [
    {
      "claim": "The Eiffel Tower was built in 1889",
      "citations": [
        {
          "url": "https://en.wikipedia.org/wiki/Eiffel_Tower",
          "title": "Eiffel Tower - Wikipedia",
          "confidence": 0.95,
          "domain": "wikipedia.org"
        }
      ]
    }
  ]
}
```

### Multimodal Input Processing

#### Analyze Moodboard
```http
POST /api/v1/multimodal/analyze-moodboard
Content-Type: multipart/form-data

images: [file1.jpg, file2.jpg, file3.jpg]
description: "Looking for adventure and culture"
```

**Enhanced Response:**
```json
{
  "analysis": {
    "vibes": ["mountain", "adventure", "cultural", "urban"],
    "activities": ["hiking", "museums", "photography"],
    "styles": ["backpacker", "eco_conscious"],
    "themes": ["outdoor", "exploration", "history"],
    "confidence": 0.82
  },
  "suggested_destinations": [
    {"name": "Nepal", "confidence": 0.89, "reasoning": "Mountain imagery detected"},
    {"name": "Peru", "confidence": 0.85, "reasoning": "Adventure and cultural elements"},
    {"name": "Morocco", "confidence": 0.78, "reasoning": "Cultural architecture patterns"}
  ],
  "confidence_score": 0.8,
  "model_used": "resnet-50",
  "processing_time_ms": 1250
}
```

#### Transcribe Voice (Free Whisper)
```http
POST /api/v1/multimodal/transcribe-voice
Content-Type: multipart/form-data

audio: recording.wav
language: en
```

**Response:**
```json
{
  "transcription": "I want a week-long adventure trip to Southeast Asia with cultural experiences and amazing local food, budget around two thousand dollars",
  "extracted_preferences": {
    "destination": "Southeast Asia",
    "activities": ["adventure", "cultural", "culinary"],
    "duration": "7 days",
    "budget": 2000,
    "currency": "USD"
  },
  "confidence": 0.94,
  "processing_time_ms": 3200,
  "language_detected": "en"
}
```

### Real-time Updates & Monitoring

#### WebSocket Connection for Live Updates
```javascript
const ws = new WebSocket('ws://localhost:8000/api/v1/realtime/ws/trip_123');

// Enhanced message handling
ws.onmessage = function(event) {
    const update = JSON.parse(event.data);
    
    switch(update.type) {
        case 'weather_alert':
            handleWeatherUpdate(update);
            break;
        case 'venue_closure':
            handleVenueUpdate(update);
            break;
        case 'transport_delay':
            handleTransportUpdate(update);
            break;
        case 'replan_complete':
            handleReplanComplete(update);
            break;
    }
};

// Request fact verification
ws.send(JSON.stringify({
    type: 'verify_facts',
    claims: ['Restaurant opens at 7 PM']
}));

// Trigger replanning
ws.send(JSON.stringify({
    type: 'trigger_replan',
    event_details: {
        type: 'weather',
        description: 'Heavy rain forecasted',
        affected_date: '2024-06-02'
    }
}));
```

## 📊 Enhanced Data Models

### Travel Planning Request (Updated)
```typescript
interface TravelPlanningRequest {
  // Core fields (same as before)
  mode: "text" | "voice" | "moodboard" | "quick_start" | "surprise_me";
  destination: string | LocationInfo;
  
  // Enhanced features
  include_verification: boolean;      // Enable fact checking
  include_offline_package: boolean;  // Generate offline ZIP
  booking_demo_mode: boolean;        // Enable demo bookings
  calendar_export: boolean;          // Generate .ics file
  audio_tour_style: "friendly" | "professional" | "local";
  
  // Quality controls
  min_confidence_score: number;      // Minimum confidence for recommendations
  max_response_time_seconds: number; // Timeout preference
  fallback_preferences: string[];    // Backup options if primary fails
}
```

### Enhanced Response Models
```typescript
interface TravelPlanResponse {
  // All existing fields plus:
  
  verification_report: {
    facts_checked: number;
    average_confidence: number;
    low_confidence_items: string[];
    sources_consulted: string[];
  };
  
  booking_options: {
    demo_bookings_available: boolean;
    estimated_booking_time: string;
    booking_providers: string[];
  };
  
  offline_package: {
    available: boolean;
    size_mb: number;
    download_url: string;
    expires_at: string;
  };
  
  calendar_export: {
    ics_url: string;
    events_count: number;
    timezone: string;
  };
  
  system_info: {
    model_used: string;
    processing_time_ms: number;
    backend_used: "ollama" | "huggingface" | "fallback";
    cache_hit_rate: number;
  };
}
```

## 🔧 Enhanced Configuration

### Complete Environment Variables (.env)
```bash
# Core Settings
ENVIRONMENT=development
DEBUG=true

# AI Models (All Free & Local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma2:2b
OLLAMA_EMBED_MODEL=nomic-embed-text

# Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=  # Optional for local

# Optional Free APIs (All have free tiers)
HUGGINGFACE_TOKEN=  # Free tier: 30,000 chars/month
GOOGLE_MAPS_API_KEY=  # Free tier: $200 credit/month

# Performance Tuning
MAX_CONCURRENT_REQUESTS=10
CACHE_TTL_SECONDS=3600
VECTOR_SEARCH_LIMIT=50
AUDIO_GENERATION_TIMEOUT=120

# Feature Flags
ENABLE_FACT_VERIFICATION=true
ENABLE_DEMO_BOOKINGS=true
ENABLE_OFFLINE_PACKAGES=true
ENABLE_CALENDAR_EXPORT=true
ENABLE_REAL_TIME_UPDATES=true

# Rate Limiting
RATE_LIMIT_CALLS=100
RATE_LIMIT_PERIOD=3600

# Models & Processing
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
MULTIMODAL_MODEL=microsoft/resnet-50
WHISPER_MODEL=base
MAX_PACKAGE_SIZE_MB=50
```

## 🏃‍♂️ Development Workflow

### Enhanced Development Commands
```bash
# Complete setup
make setup              # Install everything
make dev               # Start development mode
make test              # Run all tests
make demo              # Run demo script

# Individual services
make qdrant-start      # Start vector database
make ollama-start      # Start LLM server
make models-pull       # Download AI models
make db-seed          # Seed with POIs

# Maintenance
make clean            # Clean caches
make backup           # Backup data
make logs            # Show all logs
make health          # Health check all services

# Testing specific features
make test-booking     # Test booking system
make test-verification # Test fact checking
make test-multimodal  # Test image/voice processing
make test-offline     # Test package generation
```

### Docker Compose Services
```yaml
services:
  app:           # FastAPI application
  qdrant:        # Vector database
  ollama:        # Local LLM server
  redis:         # Caching layer
  nginx:         # Load balancer (production)
```

## 📱 Frontend Integration Guide

### Complete Integration Example
```javascript
class TripCraftClient {
  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.websocket = null;
  }
  
  // Create comprehensive trip plan
  async createTripPlan(request) {
    const response = await fetch(`${this.baseUrl}/api/v1/travel/plan`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        ...request,
        include_verification: true,
        include_offline_package: true,
        calendar_export: true
      })
    });
    return await response.json();
  }
  
  // Upload and analyze moodboard
  async analyzeMoodboard(images, description) {
    const formData = new FormData();
    images.forEach(img => formData.append('images', img));
    if (description) formData.append('description', description);
    
    const response = await fetch(`${this.baseUrl}/api/v1/multimodal/analyze-moodboard`, {
      method: 'POST',
      body: formData
    });
    return await response.json();
  }
  
  // Book trip items (demo)
  async bookTripItems(tripId, items, userEmail) {
    const response = await fetch(`${this.baseUrl}/api/v1/travel/plan/${tripId}/book`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({items, user_email: userEmail})
    });
    return await response.json();
  }
  
  // Download offline package
  async downloadOfflinePackage(tripId) {
    const response = await fetch(`${this.baseUrl}/api/v1/travel/plan/${tripId}/download`);
    const blob = await response.blob();
    
    // Trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trip_${tripId}.zip`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  
  // Real-time monitoring
  connectWebSocket(tripId, callbacks) {
    this.websocket = new WebSocket(`ws://localhost:8000/api/v1/realtime/ws/${tripId}`);
    
    this.websocket.onmessage = (event) => {
      const update = JSON.parse(event.data);
      callbacks[update.type]?.(update);
    };
    
    return this.websocket;
  }
  
  // Verify trip facts
  async verifyFacts(tripId, claims) {
    const response = await fetch(`${this.baseUrl}/api/v1/travel/plan/${tripId}/verify`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({claims})
    });
    return await response.json();
  }
}
```

## 🚨 Enhanced Error Handling

The API returns comprehensive error information:
```json
{
  "detail": "Fact verification failed for 2 out of 5 claims",
  "type": "verification_error",
  "error_code": "FACT_CHECK_PARTIAL_FAILURE",
  "failed_claims": ["Restaurant opens 24/7", "Free entry on Sundays"],
  "retry_after_seconds": 60,
  "fallback_available": true,
  "support_contact": "support@tripcraft.ai"
}
```

## 📈 Performance & Scaling

### Enhanced Performance Metrics
- **Model Loading**: ~30 seconds initial startup
- **Trip Planning**: 15-45 seconds (depends on complexity)
- **Fact Verification**: 5-15 seconds per claim
- **Audio Generation**: 10-30 seconds per segment
- **Offline Package**: 5-10 seconds creation
- **WebSocket Latency**: <100ms for real-time updates

### Resource Requirements
- **Development**: 8GB RAM, 4 CPU cores, 20GB storage
- **Production**: 16GB RAM, 8 CPU cores, 100GB storage
- **GPU Support**: Optional but recommended for faster processing

### Scaling Options
- **Horizontal**: Multiple FastAPI instances behind load balancer
- **Vertical**: GPU acceleration for AI models
- **Caching**: Redis for frequent requests
- **CDN**: Static assets and offline packages

## 🔐 Security & Privacy

### Enhanced Security Features
- **Local Processing**: All AI runs locally, no data sent externally
- **API Rate Limiting**: Configurable per-endpoint limits
- **Input Validation**: Comprehensive request sanitization
- **CORS Configuration**: Proper cross-origin controls
- **Audit Logging**: All actions logged for monitoring

### Privacy Controls
- **No External APIs**: Core functionality works without internet
- **Optional Services**: External APIs clearly marked as optional
- **Data Retention**: Configurable cache expiration
- **User Control**: Users control what data is processed

## 📄 Project Structure (Complete)

```
TripCraft AI/
├── 📋 Configuration & Setup
│   ├── docker-compose.yml          # Container orchestration
│   ├── Dockerfile                  # App containerization
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example               # Environment template
│   └── Makefile                   # Development commands
│
├── 🚀 Startup Scripts
│   ├── scripts/
│   │   ├── pull_models.sh         # AI model downloader
│   │   ├── init_qdrant.py         # POI database seeder
│   │   ├── smoke_demo.sh          # End-to-end testing
│   │   └── fallback_pois.csv      # Backup POI data
│
├── 🤖 AI Components
│   ├── prompts/
│   │   ├── itinerary_prompt.txt   # Travel planning prompt
│   │   ├── audio_prompt.txt       # Audio tour generation
│   │   └── verify_prompt.txt      # Fact verification
│   │
│   ├── agents/                    # Multi-agent system
│   │   ├── base_agent.py         # Agent foundation
│   │   ├── orchestrator.py       # Agent coordinator
│   │   ├── destination_agent.py  # Attraction research
│   │   ├── transport_agent.py    # Flight/transport
│   │   ├── accommodation_agent.py # Hotels/stays
│   │   ├── dining_agent.py       # Restaurants/food
│   │   ├── budget_agent.py       # Cost optimization
│   │   ├── audio_tour_agent.py   # Audio content
│   │   └── multimodal_agent.py   # Image/voice processing
│
├── 🛠️ Core Tools
│   ├── tools/
│   │   ├── search_tool.py         # Web scraping (crawl4ai)
│   │   ├── vector_store.py        # Qdrant interface
│   │   ├── embedding_tool.py      # Text/image embeddings
│   │   └── mcp_tool.py           # MCP server integration
│
├── 💼 Business Services
│   ├── services/
│   │   ├── travel_service.py      # Main orchestration
│   │   ├── booking_agent.py       # Demo booking system
│   │   ├── verify_service.py      # Fact checking
│   │   ├── offline_builder.py     # Package creation
│   │   ├── llm_client_fallback.py # Resilient LLM client
│   │   ├── multimodal_service.py  # Image/voice processing
│   │   ├── realtime_service.py    # Live updates
│   │   └── safety_service.py      # Safety information
│
├── 🌐 API Layer
│   ├── api/
│   │   ├── travel.py              # Travel planning endpoints
│   │   ├── multimodal.py          # Image/voice endpoints
│   │   └── realtime.py            # WebSocket endpoints
│
├── 📦 Data Models
│   ├── models/
│   │   ├── travel_request.py      # Request schemas
│   │   └── travel_response.py     # Response schemas
│
├── 🔧 Utilities
│   ├── utils/
│   │   ├── ics_export.py          # Calendar export
│   │   ├── logger.py              # Logging setup
│   │   └── helpers.py             # Utility functions
│
├── ⚙️ Configuration
│   ├── config/
│   │   └── settings.py            # App configuration
│
├── 📚 Documentation
│   ├── docs/
│   │   └── operational.md         # Operations manual
│   ├── README.md                  # This file
│   └── QDRANT_SETUP.md           # Database setup guide
│
├── 📊 Data & Logs
│   ├── data/                      # Cache and temporary files
│   └── logs/                      # Application logs
│
└── 🚀 Application
    └── main.py                    # FastAPI entry point
```

## 🤝 Contributing

The system is designed for easy extension:

### Adding New Agents
```python
# agents/weather_agent.py
from .base_agent import BaseAgent

class WeatherAgent(BaseAgent):
    def __init__(self):
        super().__init__("Weather Specialist", "Provide weather forecasts")
    
    async def execute(self, request):
        # Implementation here
        pass
```

### Adding New API Endpoints
```python
# api/weather.py
@router.get("/weather/{location}")
async def get_weather(location: str):
    # Implementation here
    pass
```

### Adding New Tools
```python
# tools/weather_tool.py
class WeatherTool:
    async def get_forecast(self, location: str, days: int):
        # Implementation here
        pass
```

## 📞 Support & Troubleshooting

### Common Issues & Solutions

**Models won't download:**
```bash
# Check Ollama connection
curl http://localhost:11434/api/tags

# Restart Ollama
docker-compose restart ollama

# Manual model pull
ollama pull gemma2:2b
```

**Vector search not working:**
```bash
# Check Qdrant
curl http://localhost:6333/health

# Reseed database
python scripts/init_qdrant.py --reset
```

**Memory issues:**
```bash
# Check memory usage
docker stats

# Restart with limits
docker-compose down
# Edit memory limits in docker-compose.yml
docker-compose up -d
```

### Support Channels
- **Documentation**: Complete setup and API docs included
- **Docker Logs**: `docker-compose logs -f app`
- **Health Checks**: Built-in monitoring endpoints
- **Demo Script**: Automated testing and validation

## 📄 License

MIT License - Free for commercial and personal use.

This is a complete, enterprise-grade travel planning system using only free and open-source technologies. All AI processing happens locally, ensuring privacy and eliminating ongoing costs while providing advanced features like fact verification, offline packages, and real-time updates.

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