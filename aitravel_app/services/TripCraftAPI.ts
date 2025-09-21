export class TripCraftAPI {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  // Core travel planning
  async createTripPlan(request: any) {
    const response = await fetch(`${this.baseUrl}/api/v1/travel/plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Get trip details
  async getTripDetails(tripId: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/travel/plan/${tripId}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Multimodal inputs
  async analyzeMoodboard(images: any[], description?: string) {
    const formData = new FormData();
    
    images.forEach((image, index) => {
      formData.append('images', {
        uri: image.uri,
        type: image.mimeType || 'image/jpeg',
        name: image.name || `image_${index}.jpg`,
      } as any);
    });
    
    if (description) {
      formData.append('description', description);
    }

    const response = await fetch(`${this.baseUrl}/api/v1/multimodal/analyze-moodboard`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async transcribeVoice(audioUri: string, language: string = 'en') {
    const formData = new FormData();
    
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/wav',
      name: 'recording.wav',
    } as any);
    
    formData.append('language', language);

    const response = await fetch(`${this.baseUrl}/api/v1/multimodal/transcribe-voice`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Booking system
  async bookTripItems(tripId: string, items: any[], userEmail: string) {
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
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Download offline package
  async downloadOfflinePackage(tripId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/v1/travel/plan/${tripId}/download`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.blob();
  }

  // Fact verification
  async verifyFacts(tripId: string, claims: string[]) {
    const response = await fetch(`${this.baseUrl}/api/v1/travel/plan/${tripId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ claims }),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // WebSocket connection for real-time updates
  createWebSocketConnection(tripId: string): WebSocket {
    const wsUrl = this.baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    const ws = new WebSocket(`${wsUrl}/api/v1/realtime/ws/${tripId}`);
    
    ws.onopen = () => {
      console.log(`WebSocket connected for trip ${tripId}`);
    };
    
    ws.onclose = () => {
      console.log(`WebSocket disconnected for trip ${tripId}`);
    };
    
    ws.onerror = (error) => {
      console.error(`WebSocket error for trip ${tripId}:`, error);
    };
    
    return ws;
  }

  // AR-specific endpoints
  async getARPOIData(tripId: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/ar/poi-data/${tripId}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // User management
  async getUserPreferences() {
    const response = await fetch(`${this.baseUrl}/api/v1/user/preferences`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async updateUserPreferences(preferences: any) {
    const response = await fetch(`${this.baseUrl}/api/v1/user/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Trip history
  async getTripHistory() {
    const response = await fetch(`${this.baseUrl}/api/v1/trips/history`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Notifications
  async registerForNotifications(deviceToken: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/notifications/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ device_token: deviceToken }),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Check offline package status
  async getOfflinePackageStatus(tripId: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/trips/${tripId}/offline-status`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  }
}