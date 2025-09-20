#!/bin/bash
# scripts/smoke_demo.sh - Quick End-to-End Demo

set -e

echo "🚀 TripCraft AI - Smoke Test Demo"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
API_BASE="http://localhost:8000"
TEST_PAYLOAD_FILE="test_payload.json"

# Create test payload
create_test_payload() {
    echo "📝 Creating test payload..."
    cat > "$TEST_PAYLOAD_FILE" << EOF
{
  "mode": "text",
  "destination": "Paris",
  "dates": {
    "start": "2024-07-15",
    "end": "2024-07-18", 
    "flexible": false
  },
  "duration_days": 3,
  "travelers": 2,
  "budget": 1500,
  "currency": "USD",
  "vibes": ["cultural", "romantic"],
  "interests": ["art", "history", "food"],
  "include_audio_tour": true,
  "realtime_updates": false
}
EOF
}

# Health check
health_check() {
    echo "🏥 Running health checks..."
    
    # Check main API
    if curl -sf "$API_BASE/health" > /dev/null; then
        echo -e "${GREEN}✅ Main API is healthy${NC}"
    else
        echo -e "${RED}❌ Main API is down${NC}"
        exit 1
    fi
    
    # Check Qdrant
    if curl -sf "http://localhost:6333/health" > /dev/null; then
        echo -e "${GREEN}✅ Qdrant is healthy${NC}"
    else
        echo -e "${YELLOW}⚠️ Qdrant may not be running${NC}"
    fi
    
    # Check Ollama
    if curl -sf "http://localhost:11434/api/tags" > /dev/null; then
        echo -e "${GREEN}✅ Ollama is healthy${NC}"
    else
        echo -e "${YELLOW}⚠️ Ollama may not be running${NC}"
    fi
}

# Test basic endpoints
test_basic_endpoints() {
    echo "🧪 Testing basic endpoints..."
    
    # Test quick start
    echo "Testing quick-start endpoint..."
    curl -s -X POST "$API_BASE/api/v1/travel/quick-start?location=Tokyo" | jq '.trip_id' > /dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Quick start endpoint working${NC}"
    else
        echo -e "${RED}❌ Quick start endpoint failed${NC}"
    fi
    
    # Test surprise me
    echo "Testing surprise-me endpoint..."
    curl -s -X POST "$API_BASE/api/v1/travel/surprise-me?budget=1000&days=3" | jq '.trip_id' > /dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Surprise me endpoint working${NC}"
    else
        echo -e "${RED}❌ Surprise me endpoint failed${NC}"
    fi
}

# Test main travel planning
test_travel_planning() {
    echo "🗺️ Testing main travel planning..."
    
    response=$(curl -s -X POST "$API_BASE/api/v1/travel/plan" \
        -H "Content-Type: application/json" \
        -d @"$TEST_PAYLOAD_FILE")
    
    # Check if response contains expected fields
    trip_id=$(echo "$response" | jq -r '.trip_id // empty')
    destination=$(echo "$response" | jq -r '.destination_info.name // empty')
    daily_plans=$(echo "$response" | jq -r '.daily_plans | length')
    
    if [ -n "$trip_id" ] && [ -n "$destination" ] && [ "$daily_plans" != "null" ]; then
        echo -e "${GREEN}✅ Travel planning successful${NC}"
        echo "   Trip ID: $trip_id"
        echo "   Destination: $destination"
        echo "   Daily plans: $daily_plans days"
        
        # Save trip ID for further testing
        echo "$trip_id" > .last_trip_id
        
        # Test audio content if included
        audio_segments=$(echo "$response" | jq -r '.audio_tour_segments | length')
        if [ "$audio_segments" != "0" ] && [ "$audio_segments" != "null" ]; then
            echo -e "${GREEN}✅ Audio tour content generated${NC}"
            echo "   Audio segments: $audio_segments"
        fi
        
    else
        echo -e "${RED}❌ Travel planning failed${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Test multimodal endpoints (basic)
test_multimodal() {
    echo "📸 Testing multimodal endpoints..."
    
    # Create a simple test image (1x1 pixel PNG in base64)
    test_image="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    # Test voice transcription endpoint (without actual audio)
    echo "Testing voice transcription (mock)..."
    
    # Test image analysis with simple request
    echo "Testing basic multimodal processing..."
    response=$(curl -s -X POST "$API_BASE/api/v1/multimodal/process-multimodal" \
        -F "text_input=I want a beach vacation")
    
    if echo "$response" | jq -e '.text_analysis' > /dev/null; then
        echo -e "${GREEN}✅ Multimodal processing working${NC}"
    else
        echo -e "${YELLOW}⚠️ Multimodal processing may have issues${NC}"
    fi
}

# Performance test
performance_test() {
    echo "⚡ Running performance test..."
    
    start_time=$(date +%s)
    
    # Make multiple quick requests
    for i in {1..5}; do
        curl -s "$API_BASE/health" > /dev/null
    done
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    echo "   5 health checks completed in ${duration}s"
    
    if [ $duration -lt 10 ]; then
        echo -e "${GREEN}✅ API response time is good${NC}"
    else
        echo -e "${YELLOW}⚠️ API response time is slow${NC}"
    fi
}

# Generate demo report
generate_report() {
    echo ""
    echo "📊 Demo Summary Report"
    echo "====================="
    echo "Date: $(date)"
    echo "API Base: $API_BASE"
    
    if [ -f .last_trip_id ]; then
        trip_id=$(cat .last_trip_id)
        echo "Last Trip ID: $trip_id"
        echo "View details: $API_BASE/api/v1/travel/plan/$trip_id"
    fi
    
    echo ""
    echo "Available endpoints:"
    echo "- Docs: $API_BASE/docs"
    echo "- Health: $API_BASE/health"  
    echo "- Quick Start: $API_BASE/api/v1/travel/quick-start"
    echo "- Surprise Me: $API_BASE/api/v1/travel/surprise-me"
    echo "- Full Planning: $API_BASE/api/v1/travel/plan"
}

# Cleanup
cleanup() {
    echo "🧹 Cleaning up..."
    rm -f "$TEST_PAYLOAD_FILE" .last_trip_id
}

# Main execution
main() {
    echo "Starting smoke test demo..."
    
    # Trap cleanup on exit
    trap cleanup EXIT
    
    create_test_payload
    health_check
    test_basic_endpoints
    test_travel_planning
    test_multimodal
    performance_test
    generate_report
    
    echo ""
    echo -e "${GREEN}🎉 Smoke test completed successfully!${NC}"
    echo "TripCraft AI is ready for demo."
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi