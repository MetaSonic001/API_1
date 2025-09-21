// API Type Definitions for TripCraft API

export interface TravelPlanRequest {
  mode: 'text' | 'voice' | 'image' | 'multimodal';
  destination: string;
  origin: string;
  dates: {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
    flexible: boolean;
  };
  duration_days: number;
  travelers: number;
  adults: number;
  children: number;
  age_groups: number[];
  budget: number;
  currency: string;
  budget_flexible: boolean;
  travel_style: 'backpacker' | 'budget' | 'mid-range' | 'luxury' | 'ultra-luxury';
  vibes: string[];
  interests: string[];
  priorities: string[];
  pace_level: number; // 1-5
  multimodal_inputs: any[];
  accessibility_needs: string[];
  dietary_restrictions: string[];
  previous_visits: boolean;
  loved_places: string;
  additional_info: string;
  include_audio_tour: boolean;
  include_ar_ready: boolean;
  realtime_updates: boolean;
}

export interface DestinationInfo {
  name: string;
  coordinates: number[];
  type: 'city' | 'country' | 'region' | 'landmark';
}

export interface EstimatedBudget {
  total: number;
  currency: string;
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  shopping: number;
  contingency: number;
}

export interface DailyPlan {
  day: number;
  date: string;
  activities: Activity[];
  meals: Meal[];
  transport: Transport[];
  accommodation?: Accommodation;
  weather?: WeatherInfo;
  notes?: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  location: {
    name: string;
    coordinates: number[];
    address: string;
  };
  duration: number; // minutes
  cost: number;
  currency: string;
  category: string;
  rating?: number;
  booking_required: boolean;
  ar_ready: boolean;
  audio_tour_available: boolean;
  time_slots?: string[];
  accessibility_info?: string;
}

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  location: {
    name: string;
    coordinates: number[];
    address: string;
  };
  cost: number;
  currency: string;
  cuisine: string;
  dietary_options: string[];
  rating?: number;
  booking_required: boolean;
  time_slots?: string[];
}

export interface Transport {
  id: string;
  type: 'flight' | 'train' | 'bus' | 'car' | 'walking' | 'metro' | 'taxi' | 'ride_share';
  from: {
    name: string;
    coordinates: number[];
  };
  to: {
    name: string;
    coordinates: number[];
  };
  departure_time: string;
  arrival_time: string;
  duration: number; // minutes
  cost: number;
  currency: string;
  booking_required: boolean;
  booking_url?: string;
  confirmation_number?: string;
}

export interface Accommodation {
  id: string;
  name: string;
  type: 'hotel' | 'hostel' | 'airbnb' | 'resort' | 'apartment';
  location: {
    name: string;
    coordinates: number[];
    address: string;
  };
  check_in: string;
  check_out: string;
  cost_per_night: number;
  currency: string;
  rating?: number;
  amenities: string[];
  booking_required: boolean;
  booking_url?: string;
  confirmation_number?: string;
}

export interface WeatherInfo {
  temperature: {
    min: number;
    max: number;
    unit: 'celsius' | 'fahrenheit';
  };
  condition: string;
  humidity: number;
  wind_speed: number;
  precipitation_chance: number;
  uv_index: number;
  sunrise: string;
  sunset: string;
}

export interface AudioTourSegment {
  id: string;
  title: string;
  description: string;
  location: {
    name: string;
    coordinates: number[];
  };
  duration: number; // minutes
  audio_url: string;
  transcript: string;
  language: string;
  voice: string;
}

export interface ARReadyPOI {
  id: string;
  name: string;
  description: string;
  location: {
    name: string;
    coordinates: number[];
  };
  ar_model_url: string;
  ar_anchor_type: 'image' | 'plane' | 'point';
  ar_anchor_data: any;
  interaction_type: 'view' | 'explore' | 'interact';
  content: {
    text: string;
    images: string[];
    audio: string[];
  };
}

export interface SafetyInfo {
  general_advice: string[];
  emergency_contacts: {
    police: string;
    medical: string;
    embassy: string;
  };
  local_laws: string[];
  health_considerations: string[];
  weather_warnings: string[];
  political_situation: string;
  covid_requirements?: {
    vaccination_required: boolean;
    test_required: boolean;
    quarantine_required: boolean;
    mask_mandate: boolean;
  };
}

export interface LiveEvent {
  id: string;
  title: string;
  description: string;
  location: {
    name: string;
    coordinates: number[];
  };
  start_time: string;
  end_time: string;
  cost: number;
  currency: string;
  category: string;
  booking_url?: string;
  capacity?: number;
  remaining_spots?: number;
}

export interface AlternativePlan {
  id: string;
  title: string;
  description: string;
  reason: string;
  changes: string[];
  estimated_cost_difference: number;
  confidence_score: number;
}

export interface TravelPlanResponse {
  trip_id: string;
  destination_info: DestinationInfo;
  summary: string;
  total_duration_days: number;
  estimated_budget: EstimatedBudget;
  daily_plans: DailyPlan[];
  transport_options: Transport[];
  accommodation_options: Accommodation[];
  dining_recommendations: Meal[];
  audio_tour_segments: AudioTourSegment[];
  ar_ready_pois: ARReadyPOI[];
  safety_info: SafetyInfo;
  weather_forecast: WeatherInfo[];
  live_events: LiveEvent[];
  alternative_plans: AlternativePlan[];
  generated_at: string;
  confidence_score: number;
  sources: string[];
}

export interface ReplanRequest {
  trip_id: string;
  trigger_event: string;
  event_details: Record<string, any>;
  affected_date: string; // YYYY-MM-DD
  user_preferences: Record<string, any>;
}

export interface QuickStartRequest {
  location: string;
}

export interface SurpriseMeRequest {
  budget?: number;
  days?: number;
}

export interface BookTripRequest {
  items: any[];
  user_email?: string;
}

export interface MoodboardAnalysisRequest {
  images: string[]; // base64 encoded images
  description?: string;
}

export interface VoiceTranscriptionRequest {
  audio: File | Blob;
  language?: string;
}

export interface MultimodalProcessRequest {
  text_input?: string;
  images?: string[]; // base64 encoded images
  audio?: File | Blob;
}

export interface ExternalEventRequest {
  event_type: string;
  event_data: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_areas: string[];
  estimated_duration: number; // hours
  alternative_suggestions: string[];
}

export interface TripHealthResponse {
  trip_id: string;
  status: 'healthy' | 'warning' | 'critical';
  issues: {
    type: 'weather' | 'transport' | 'accommodation' | 'safety' | 'booking';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affected_dates: string[];
    recommendations: string[];
  }[];
  last_updated: string;
  next_check: string;
}

export interface APIError {
  error: string;
  message: string;
  code: number;
  details?: any;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  timestamp: string;
}
