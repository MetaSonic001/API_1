import { 
  TravelPlanRequest, 
  TravelPlanResponse, 
  ReplanRequest, 
  QuickStartRequest, 
  SurpriseMeRequest, 
  BookTripRequest, 
  MoodboardAnalysisRequest, 
  VoiceTranscriptionRequest, 
  MultimodalProcessRequest, 
  ExternalEventRequest, 
  TripHealthResponse,
  APIResponse 
} from '../types/api';

export class TripCraftAPI {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://68285f115d7b.ngrok-free.app/api/v1') {
    this.baseUrl = baseUrl;
  }

  // Helper method for making API requests
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API Error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          error: 'Network Error',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 0,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Helper method for FormData requests
  private async makeFormDataRequest<T>(
    endpoint: string, 
    formData: FormData
  ): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API Error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          error: 'Network Error',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 0,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ===========================================
  // TRAVEL PLANNING APIs (1-9)
  // ===========================================

  /**
   * 1. Create Travel Plan
   * POST /travel/plan
   */
  async createTravelPlan(request: TravelPlanRequest): Promise<APIResponse<TravelPlanResponse>> {
    console.log(request)
    return this.makeRequest<TravelPlanResponse>('/travel/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  }

  /**
   * 2. Get Travel Plan
   * GET /travel/plan/{trip_id}
   */
  async getTravelPlan(tripId: string): Promise<APIResponse<TravelPlanResponse>> {
    return this.makeRequest<TravelPlanResponse>(`/travel/plan/${tripId}`);
  }

  /**
   * 3. Replan Trip
   * POST /travel/plan/{trip_id}/replan
   */
  async replanTrip(tripId: string, request: ReplanRequest): Promise<APIResponse<string>> {
    return this.makeRequest<string>(`/travel/plan/${tripId}/replan`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * 4. Get Realtime Updates
   * GET /travel/plan/{trip_id}/updates
   */
  async getRealtimeUpdates(tripId: string): Promise<APIResponse<string>> {
    return this.makeRequest<string>(`/travel/plan/${tripId}/updates`);
  }

  /**
   * 5. Quick Start Planning
   * POST /travel/quick-start?location={string}
   */
  async quickStartPlanning(location: string): Promise<APIResponse<string>> {
    return this.makeRequest<string>(`/travel/quick-start?location=${encodeURIComponent(location)}`, {
      method: 'POST',
    });
  }

  /**
   * 6. Surprise Me Planning
   * POST /travel/surprise-me?budget={int}&days={int}
   */
  async surpriseMePlanning(budget: number = 1000, days: number = 3): Promise<APIResponse<string>> {
    return this.makeRequest<string>(`/travel/surprise-me?budget=${budget}&days=${days}`, {
      method: 'POST',
    });
  }

  /**
   * 7. Book Trip Items
   * POST /travel/plan/{trip_id}/book?user_email={string}
   */
  async bookTripItems(
    tripId: string, 
    items: any[], 
    userEmail: string = 'demo@tripcraft.ai'
  ): Promise<APIResponse<string>> {
    return this.makeRequest<string>(`/travel/plan/${tripId}/book?user_email=${encodeURIComponent(userEmail)}`, {
      method: 'POST',
      body: JSON.stringify(items),
    });
  }

  /**
   * 8. Download Offline Package
   * GET /travel/plan/{trip_id}/download
   */
  async downloadOfflinePackage(tripId: string): Promise<APIResponse<string>> {
    return this.makeRequest<string>(`/travel/plan/${tripId}/download`);
  }

  /**
   * 9. Verify Trip Facts
   * POST /travel/plan/{trip_id}/verify
   */
  async verifyTripFacts(tripId: string, claims: string[]): Promise<APIResponse<string>> {
    return this.makeRequest<string>(`/travel/plan/${tripId}/verify`, {
      method: 'POST',
      body: JSON.stringify(claims),
    });
  }

  // ===========================================
  // MULTIMODAL APIs (10-12)
  // ===========================================

  /**
   * 10. Analyze Moodboard
   * POST /multimodal/analyze-moodboard
   */
  async analyzeMoodboard(request: MoodboardAnalysisRequest): Promise<APIResponse<string>> {
    const formData = new FormData();
    
    // Add images as base64 strings
    request.images.forEach((image, index) => {
      formData.append('images', image);
    });
    
    if (request.description) {
      formData.append('description', request.description);
    }

    return this.makeFormDataRequest<string>('/multimodal/analyze-moodboard', formData);
  }

  /**
   * 11. Transcribe Voice
   * POST /multimodal/transcribe-voice
   */
  async transcribeVoice(audio: File | Blob, language: string = 'en'): Promise<APIResponse<string>> {
    const formData = new FormData();
    formData.append('audio', audio);
    formData.append('language', language);

    return this.makeFormDataRequest<string>('/multimodal/transcribe-voice', formData);
  }

  /**
   * 12. Process Multimodal Inputs
   * POST /multimodal/process-multimodal
   */
  async processMultimodalInputs(request: MultimodalProcessRequest): Promise<APIResponse<string>> {
    const formData = new FormData();
    
    if (request.text_input) {
      formData.append('text_input', request.text_input);
    }
    
    if (request.images) {
      request.images.forEach((image, index) => {
        formData.append('images', image);
      });
    }
    
    if (request.audio) {
      formData.append('audio', request.audio);
    }

    return this.makeFormDataRequest<string>('/multimodal/process-multimodal', formData);
  }

  // ===========================================
  // REAL-TIME UPDATES APIs (13-14)
  // ===========================================

  /**
   * 13. Handle External Event
   * POST /realtime/events/{trip_id}
   */
  async handleExternalEvent(tripId: string, event: ExternalEventRequest): Promise<APIResponse<string>> {
    return this.makeRequest<string>(`/realtime/events/${tripId}`, {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  /**
   * 14. Get Trip Health
   * GET /realtime/health/{trip_id}
   */
  async getTripHealth(tripId: string): Promise<APIResponse<TripHealthResponse>> {
    return this.makeRequest<TripHealthResponse>(`/realtime/health/${tripId}`);
  }

  // ===========================================
  // CONVENIENCE METHODS
  // ===========================================

  /**
   * Create a travel plan with voice input
   */
  async createVoiceTravelPlan(
    audioUri: string, 
    language: string = 'en'
  ): Promise<APIResponse<TravelPlanResponse>> {
    // First transcribe the voice
    const transcriptionResponse = await this.transcribeVoice(
      { uri: audioUri } as any, 
      language
    );
    
    if (!transcriptionResponse.success) {
      return transcriptionResponse as any;
    }

    // Parse the transcribed text into a travel plan request
    // This would need to be implemented based on your voice processing logic
    const planRequest: TravelPlanRequest = {
      mode: 'voice',
      destination: '',
      origin: '',
      dates: {
        start: '',
        end: '',
        flexible: false,
      },
      duration_days: 0,
      travelers: 1,
      adults: 1,
      children: 0,
      age_groups: [],
      budget: 0,
      currency: 'USD',
      budget_flexible: true,
      travel_style: 'mid-range',
      vibes: [],
      interests: [],
      priorities: [],
      pace_level: 3,
      multimodal_inputs: [],
      accessibility_needs: [],
      dietary_restrictions: [],
      previous_visits: false,
      loved_places: '',
      additional_info: transcriptionResponse.data || '',
      include_audio_tour: true,
      include_ar_ready: false,
      realtime_updates: true,
    };

    return this.createTravelPlan(planRequest);
  }

  /**
   * Create a travel plan with moodboard analysis
   */
  async createMoodboardTravelPlan(
    images: string[], 
    description?: string
  ): Promise<APIResponse<TravelPlanResponse>> {
    // First analyze the moodboard
    const analysisResponse = await this.analyzeMoodboard({ images, description });
    
    if (!analysisResponse.success) {
      return analysisResponse as any;
    }

    // Parse the analysis into a travel plan request
    const planRequest: TravelPlanRequest = {
      mode: 'image',
      destination: '',
      origin: '',
      dates: {
        start: '',
        end: '',
        flexible: false,
      },
      duration_days: 0,
      travelers: 1,
      adults: 1,
      children: 0,
      age_groups: [],
      budget: 0,
      currency: 'USD',
      budget_flexible: true,
      travel_style: 'mid-range',
      vibes: [],
      interests: [],
      priorities: [],
      pace_level: 3,
      multimodal_inputs: images,
      accessibility_needs: [],
      dietary_restrictions: [],
      previous_visits: false,
      loved_places: '',
      additional_info: analysisResponse.data || '',
      include_audio_tour: true,
      include_ar_ready: false,
      realtime_updates: true,
    };

    return this.createTravelPlan(planRequest);
  }

  /**
   * Get comprehensive trip information including health status
   */
  async getTripWithHealth(tripId: string): Promise<{
    plan: APIResponse<TravelPlanResponse>;
    health: APIResponse<TripHealthResponse>;
  }> {
    const [planResponse, healthResponse] = await Promise.all([
      this.getTravelPlan(tripId),
      this.getTripHealth(tripId),
    ]);

    return {
      plan: planResponse,
      health: healthResponse,
    };
  }

  /**
   * Subscribe to real-time updates using WebSocket
   */
  createWebSocketConnection(tripId: string): WebSocket {
    const wsUrl = this.baseUrl.replace('https://', 'wss://').replace('http://', 'ws://');
    return new WebSocket(`${wsUrl}/realtime/ws/${tripId}`);
  }
}