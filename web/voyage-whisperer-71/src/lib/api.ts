// TripCraft AI API Integration
const API_BASE_URL = 'http://localhost:8000';

export interface TravelPlanRequest {
  mode: "text" | "voice" | "moodboard" | "quick_start" | "surprise_me";
  destination: string;
  origin?: string;
  dates: {
    start: string;
    end: string;
    flexible: boolean;
  };
  duration_days: number;
  travelers: number;
  adults: number;
  children: number;
  budget: number;
  currency: string;
  budget_flexible: boolean;
  travel_style: "backpacker" | "comfort" | "luxury";
  vibes: string[];
  interests: string[];
  priorities: string[];
  pace_level: number;
  accessibility_needs: string[];
  dietary_restrictions: string[];
  include_audio_tour: boolean;
  include_ar_ready: boolean;
  realtime_updates: boolean;
}

export interface TravelPlanResponse {
  trip_id: string;
  destination_info: {
    name: string;
    type: string;
    coordinates: [number, number];
  };
  summary: string;
  total_duration_days: number;
  estimated_budget: {
    total: number;
    currency: string;
    transport: number;
    accommodation: number;
    food: number;
    activities: number;
    shopping: number;
    contingency: number;
  };
  daily_plans: Array<{
    date: string;
    theme: string;
    morning: Activity[];
    afternoon: Activity[];
    evening: Activity[];
    total_cost: number;
    travel_time_minutes: number;
  }>;
  audio_tour_segments: Array<{
    location: string;
    content: string;
    duration_minutes: number;
    voice_style: string;
    citations: string[];
  }>;
  safety_info: {
    general_safety: string[];
    health_advisories: string[];
    emergency_contacts: Record<string, string>;
    accessibility_notes: string[];
  };
  generated_at: string;
  confidence_score: number;
  sources: string[];
  verification_status: string;
}

export interface Activity {
  start_time: string;
  end_time: string;
  activity: string;
  location: {
    name: string;
    type: string;
    coordinates: [number, number];
  };
  description: string;
  cost: number;
  booking_required: boolean;
  verified_facts?: Array<{
    fact: string;
    source: string;
    confidence: number;
  }>;
}

export interface MoodboardAnalysis {
  analysis: {
    vibes: string[];
    activities: string[];
    styles: string[];
    themes: string[];
    confidence: number;
  };
  suggested_destinations: Array<{
    name: string;
    confidence: number;
    reasoning: string;
  }>;
  confidence_score: number;
  model_used: string;
  processing_time_ms: number;
}

export interface VoiceTranscription {
  transcription: string;
  extracted_preferences: {
    destination?: string;
    activities: string[];
    duration?: string;
    budget?: number;
    currency?: string;
  };
  confidence: number;
  processing_time_ms: number;
  language_detected: string;
}

class TripCraftApi {
  private baseUrl: string;
  private websocket: WebSocket | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Create comprehensive travel plan
  async createTravelPlan(request: TravelPlanRequest): Promise<TravelPlanResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/travel/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating travel plan:', error);
      // Return demo data as fallback
      return this.getDemoTravelPlan();
    }
  }

  // Analyze moodboard images
  async analyzeMoodboard(images: File[], description?: string): Promise<MoodboardAnalysis> {
    try {
      const formData = new FormData();
      images.forEach(image => formData.append('images', image));
      if (description) {
        formData.append('description', description);
      }

      const response = await fetch(`${this.baseUrl}/api/v1/multimodal/analyze-moodboard`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing moodboard:', error);
      return this.getDemoMoodboardAnalysis();
    }
  }

  // Transcribe voice input
  async transcribeVoice(audioBlob: Blob, language: string = 'en'): Promise<VoiceTranscription> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('language', language);

      const response = await fetch(`${this.baseUrl}/api/v1/multimodal/transcribe-voice`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error transcribing voice:', error);
      return this.getDemoVoiceTranscription();
    }
  }

  // Connect to real-time WebSocket updates
  connectWebSocket(tripId: string, callbacks: Record<string, (data: any) => void>): WebSocket {
    try {
      const wsUrl = this.baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
      this.websocket = new WebSocket(`${wsUrl}/api/v1/realtime/ws/${tripId}`);

      this.websocket.onmessage = (event) => {
        const update = JSON.parse(event.data);
        callbacks[update.type]?.(update);
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return this.websocket;
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      // Return mock WebSocket for demo
      return this.getMockWebSocket(tripId, callbacks);
    }
  }

  // Book trip items (demo)
  async bookTripItems(tripId: string, items: any[], userEmail: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/travel/plan/${tripId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          user_email: userEmail,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error booking trip items:', error);
      return this.getDemoBookingResponse();
    }
  }

  // Download offline package
  async downloadOfflinePackage(tripId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/travel/plan/${tripId}/download`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      
      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trip_${tripId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading offline package:', error);
      // Show demo download notification
      alert('Demo: Offline package would be downloaded (contains itinerary, maps, audio tours)');
    }
  }

  // Demo/Fallback data methods
  private getDemoTravelPlan(): TravelPlanResponse {
    return {
      trip_id: "demo_123",
      destination_info: {
        name: "Paris, France",
        type: "city",
        coordinates: [2.3522, 48.8566]
      },
      summary: "7-day romantic and cultural journey through the City of Light",
      total_duration_days: 7,
      estimated_budget: {
        total: 2800,
        currency: "USD",
        transport: 600,
        accommodation: 1400,
        food: 500,
        activities: 200,
        shopping: 100,
        contingency: 0
      },
      daily_plans: [
        {
          date: "2024-06-01",
          theme: "Arrival and City Orientation",
          morning: [
            {
              start_time: "09:00",
              end_time: "12:00",
              activity: "Louvre Museum Visit",
              location: {
                name: "Louvre Museum",
                type: "attraction",
                coordinates: [2.3376, 48.8606]
              },
              description: "Explore the world's largest art museum, home to the Mona Lisa and Venus de Milo.",
              cost: 17,
              booking_required: true,
              verified_facts: [
                {
                  fact: "The Louvre receives over 9 million visitors annually",
                  source: "https://en.wikipedia.org/wiki/Louvre",
                  confidence: 0.95
                }
              ]
            }
          ],
          afternoon: [],
          evening: [],
          total_cost: 85,
          travel_time_minutes: 45
        }
      ],
      audio_tour_segments: [
        {
          location: "Eiffel Tower",
          content: "Standing before this iron lattice tower, you're witnessing Gustave Eiffel's masterpiece...",
          duration_minutes: 5,
          voice_style: "friendly_guide",
          citations: ["https://en.wikipedia.org/wiki/Eiffel_Tower"]
        }
      ],
      safety_info: {
        general_safety: ["Stay aware of pickpockets in tourist areas"],
        health_advisories: ["No special vaccinations required"],
        emergency_contacts: {"emergency": "112", "police": "17"},
        accessibility_notes: ["Many museums have wheelchair access"]
      },
      generated_at: new Date().toISOString(),
      confidence_score: 0.85,
      sources: ["Demo Data", "OpenTripMap", "Wikipedia"],
      verification_status: "demo_mode"
    };
  }

  private getDemoMoodboardAnalysis(): MoodboardAnalysis {
    return {
      analysis: {
        vibes: ["adventure", "cultural", "scenic", "romantic"],
        activities: ["hiking", "museums", "photography", "dining"],
        styles: ["comfort", "exploration"],
        themes: ["nature", "history", "architecture"],
        confidence: 0.82
      },
      suggested_destinations: [
        { name: "Swiss Alps", confidence: 0.89, reasoning: "Mountain and scenic imagery detected" },
        { name: "Tuscany, Italy", confidence: 0.85, reasoning: "Cultural and romantic elements" },
        { name: "Santorini, Greece", confidence: 0.78, reasoning: "Scenic architecture patterns" }
      ],
      confidence_score: 0.8,
      model_used: "demo-resnet-50",
      processing_time_ms: 1250
    };
  }

  private getDemoVoiceTranscription(): VoiceTranscription {
    return {
      transcription: "I want a week-long adventure trip to Southeast Asia with cultural experiences and amazing local food, budget around three thousand dollars",
      extracted_preferences: {
        destination: "Southeast Asia",
        activities: ["adventure", "cultural", "culinary"],
        duration: "7 days",
        budget: 3000,
        currency: "USD"
      },
      confidence: 0.94,
      processing_time_ms: 3200,
      language_detected: "en"
    };
  }

  private getMockWebSocket(tripId: string, callbacks: Record<string, (data: any) => void>): WebSocket {
    // Create a mock WebSocket for demo purposes
    const mockWs = {
      send: (data: string) => {
        console.log('Mock WebSocket send:', data);
      },
      close: () => {
        console.log('Mock WebSocket closed');
      },
      onmessage: null,
      onerror: null,
      onclose: null,
      onopen: null,
      readyState: 1, // OPEN
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3
    };

    // Simulate some demo updates
    setTimeout(() => {
      callbacks.weather_alert?.({
        type: 'weather_alert',
        message: 'Light rain expected tomorrow morning',
        affected_date: '2024-06-02'
      });
    }, 5000);

    return mockWs as unknown as WebSocket;
  }

  private getDemoBookingResponse() {
    return {
      trip_id: "demo_123",
      bookings: [
        {
          booking_id: "TC_DEMO123",
          status: "confirmed",
          item_name: "Louvre Museum Tour",
          price: 35.0,
          confirmation_code: "DEMO123",
          provider: "TripCraft-Demo",
          booking_url: "#",
          valid_until: "2024-06-15T23:59:00Z",
          cancellation_policy: "Free cancellation up to 24 hours in advance"
        }
      ],
      total_bookings: 1,
      note: "This is a demo booking for testing purposes"
    };
  }
}

export const api = new TripCraftApi();