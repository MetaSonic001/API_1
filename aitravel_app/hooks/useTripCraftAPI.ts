import { useState, useCallback, useRef, useEffect } from 'react';
import { TripCraftAPI } from '../services/TripCraftAPI';
import { 
  TravelPlanRequest, 
  TravelPlanResponse, 
  ReplanRequest, 
  ExternalEventRequest, 
  TripHealthResponse,
  APIResponse 
} from '../types/api';

export interface UseTripCraftAPIState {
  loading: boolean;
  error: string | null;
  data: any;
}

export interface UseTripCraftAPIReturn {
  // State
  loading: boolean;
  error: string | null;
  data: any;
  
  // Travel Planning Methods
  createTravelPlan: (request: TravelPlanRequest) => Promise<APIResponse<TravelPlanResponse>>;
  getTravelPlan: (tripId: string) => Promise<APIResponse<TravelPlanResponse>>;
  replanTrip: (tripId: string, request: ReplanRequest) => Promise<APIResponse<string>>;
  getRealtimeUpdates: (tripId: string) => Promise<APIResponse<string>>;
  quickStartPlanning: (location: string) => Promise<APIResponse<string>>;
  surpriseMePlanning: (budget?: number, days?: number) => Promise<APIResponse<string>>;
  bookTripItems: (tripId: string, items: any[], userEmail?: string) => Promise<APIResponse<string>>;
  downloadOfflinePackage: (tripId: string) => Promise<APIResponse<string>>;
  verifyTripFacts: (tripId: string, claims: string[]) => Promise<APIResponse<string>>;
  
  // Multimodal Methods
  analyzeMoodboard: (images: string[], description?: string) => Promise<APIResponse<string>>;
  transcribeVoice: (audio: File | Blob, language?: string) => Promise<APIResponse<string>>;
  processMultimodalInputs: (text?: string, images?: string[], audio?: File | Blob) => Promise<APIResponse<string>>;
  
  // Real-time Methods
  handleExternalEvent: (tripId: string, event: ExternalEventRequest) => Promise<APIResponse<string>>;
  getTripHealth: (tripId: string) => Promise<APIResponse<TripHealthResponse>>;
  
  // Convenience Methods
  createVoiceTravelPlan: (audioUri: string, language?: string) => Promise<APIResponse<TravelPlanResponse>>;
  createMoodboardTravelPlan: (images: string[], description?: string) => Promise<APIResponse<TravelPlanResponse>>;
  getTripWithHealth: (tripId: string) => Promise<{
    plan: APIResponse<TravelPlanResponse>;
    health: APIResponse<TripHealthResponse>;
  }>;
  
  // WebSocket
  createWebSocketConnection: (tripId: string) => WebSocket;
  
  // Utility Methods
  clearError: () => void;
  reset: () => void;
}

export function useTripCraftAPI(baseUrl?: string): UseTripCraftAPIReturn {
  const [state, setState] = useState<UseTripCraftAPIState>({
    loading: false,
    error: null,
    data: null,
  });

  const apiRef = useRef<TripCraftAPI>(new TripCraftAPI(baseUrl));

  // Update API instance if baseUrl changes
  useEffect(() => {
    if (baseUrl) {
      apiRef.current = new TripCraftAPI(baseUrl);
    }
  }, [baseUrl]);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setData = useCallback((data: any) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      data: null,
    });
  }, []);

  // Generic API call wrapper
  const apiCall = useCallback(async <T>(
    apiMethod: () => Promise<APIResponse<T>>,
    setDataOnSuccess: boolean = true
  ): Promise<APIResponse<T>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiMethod();
      
      if (response.success) {
        if (setDataOnSuccess) {
          setData(response.data);
        }
      } else {
        setError(response.error?.message || 'An error occurred');
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: {
          error: 'Network Error',
          message: errorMessage,
          code: 0,
        },
        timestamp: new Date().toISOString(),
      };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setData]);

  // Travel Planning Methods
  const createTravelPlan = useCallback((request: TravelPlanRequest) => {
    return apiCall(() => apiRef.current.createTravelPlan(request));
  }, [apiCall]);

  const getTravelPlan = useCallback((tripId: string) => {
    return apiCall(() => apiRef.current.getTravelPlan(tripId));
  }, [apiCall]);

  const replanTrip = useCallback((tripId: string, request: ReplanRequest) => {
    return apiCall(() => apiRef.current.replanTrip(tripId, request), false);
  }, [apiCall]);

  const getRealtimeUpdates = useCallback((tripId: string) => {
    return apiCall(() => apiRef.current.getRealtimeUpdates(tripId), false);
  }, [apiCall]);

  const quickStartPlanning = useCallback((location: string) => {
    return apiCall(() => apiRef.current.quickStartPlanning(location), false);
  }, [apiCall]);

  const surpriseMePlanning = useCallback((budget: number = 1000, days: number = 3) => {
    return apiCall(() => apiRef.current.surpriseMePlanning(budget, days), false);
  }, [apiCall]);

  const bookTripItems = useCallback((tripId: string, items: any[], userEmail: string = 'demo@tripcraft.ai') => {
    return apiCall(() => apiRef.current.bookTripItems(tripId, items, userEmail), false);
  }, [apiCall]);

  const downloadOfflinePackage = useCallback((tripId: string) => {
    return apiCall(() => apiRef.current.downloadOfflinePackage(tripId), false);
  }, [apiCall]);

  const verifyTripFacts = useCallback((tripId: string, claims: string[]) => {
    return apiCall(() => apiRef.current.verifyTripFacts(tripId, claims), false);
  }, [apiCall]);

  // Multimodal Methods
  const analyzeMoodboard = useCallback((images: string[], description?: string) => {
    return apiCall(() => apiRef.current.analyzeMoodboard({ images, description }), false);
  }, [apiCall]);

  const transcribeVoice = useCallback((audio: File | Blob, language: string = 'en') => {
    return apiCall(() => apiRef.current.transcribeVoice(audio, language), false);
  }, [apiCall]);

  const processMultimodalInputs = useCallback((text?: string, images?: string[], audio?: File | Blob) => {
    return apiCall(() => apiRef.current.processMultimodalInputs({ text_input: text, images, audio }), false);
  }, [apiCall]);

  // Real-time Methods
  const handleExternalEvent = useCallback((tripId: string, event: ExternalEventRequest) => {
    return apiCall(() => apiRef.current.handleExternalEvent(tripId, event), false);
  }, [apiCall]);

  const getTripHealth = useCallback((tripId: string) => {
    return apiCall(() => apiRef.current.getTripHealth(tripId), false);
  }, [apiCall]);

  // Convenience Methods
  const createVoiceTravelPlan = useCallback((audioUri: string, language: string = 'en') => {
    return apiCall(() => apiRef.current.createVoiceTravelPlan(audioUri, language));
  }, [apiCall]);

  const createMoodboardTravelPlan = useCallback((images: string[], description?: string) => {
    return apiCall(() => apiRef.current.createMoodboardTravelPlan(images, description));
  }, [apiCall]);

  const getTripWithHealth = useCallback((tripId: string) => {
    return apiRef.current.getTripWithHealth(tripId);
  }, []);

  // WebSocket
  const createWebSocketConnection = useCallback((tripId: string) => {
    return apiRef.current.createWebSocketConnection(tripId);
  }, []);

  return {
    // State
    loading: state.loading,
    error: state.error,
    data: state.data,
    
    // Travel Planning Methods
    createTravelPlan,
    getTravelPlan,
    replanTrip,
    getRealtimeUpdates,
    quickStartPlanning,
    surpriseMePlanning,
    bookTripItems,
    downloadOfflinePackage,
    verifyTripFacts,
    
    // Multimodal Methods
    analyzeMoodboard,
    transcribeVoice,
    processMultimodalInputs,
    
    // Real-time Methods
    handleExternalEvent,
    getTripHealth,
    
    // Convenience Methods
    createVoiceTravelPlan,
    createMoodboardTravelPlan,
    getTripWithHealth,
    
    // WebSocket
    createWebSocketConnection,
    
    // Utility Methods
    clearError,
    reset,
  };
}

// Specialized hooks for specific use cases
export function useTravelPlan(tripId?: string) {
  const api = useTripCraftAPI();
  const [tripData, setTripData] = useState<TravelPlanResponse | null>(null);

  const loadTrip = useCallback(async (id: string) => {
    const response = await api.getTravelPlan(id);
    if (response.success && response.data) {
      setTripData(response.data);
    }
    return response;
  }, [api]);

  useEffect(() => {
    if (tripId) {
      loadTrip(tripId);
    }
  }, [tripId]); // Remove loadTrip from dependencies to prevent infinite loop

  return {
    ...api,
    tripData,
    loadTrip,
  };
}

export function useRealtimeUpdates(tripId: string) {
  const api = useTripCraftAPI();
  const [updates, setUpdates] = useState<string[]>([]);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const startRealtimeUpdates = useCallback(() => {
    // Don't start if already connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const ws = api.createWebSocketConnection(tripId);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('WebSocket connected for trip:', tripId);
        setWsConnection(ws);
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          setUpdates(prev => [...prev, update]);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnection(null);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnection(null);
        wsRef.current = null;
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [api, tripId]);

  const stopRealtimeUpdates = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setWsConnection(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopRealtimeUpdates();
    };
  }, [stopRealtimeUpdates]);

  return {
    ...api,
    updates,
    startRealtimeUpdates,
    stopRealtimeUpdates,
    isConnected: wsConnection?.readyState === WebSocket.OPEN,
  };
}
