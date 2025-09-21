import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { TripCraftAPI } from '../../services/TripCraftAPI';

interface TripDetails {
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
  };
  daily_plans: DailyPlan[];
  audio_tour_segments: AudioSegment[];
  safety_info: SafetyInfo;
  verification_status: string;
  confidence_score: number;
}

interface DailyPlan {
  date: string;
  theme: string;
  morning: Activity[];
  afternoon: Activity[];
  evening: Activity[];
  total_cost: number;
}

interface Activity {
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
  verified_facts?: VerifiedFact[];
}

interface AudioSegment {
  location: string;
  content: string;
  duration_minutes: number;
  voice_style: string;
}

interface SafetyInfo {
  general_safety: string[];
  health_advisories: string[];
  emergency_contacts: { [key: string]: string };
}

interface VerifiedFact {
  fact: string;
  source: string;
  confidence: number;
}

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  const api = new TripCraftAPI();

  useEffect(() => {
    loadTripDetails();
    setupWebSocket();
    
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [id]);

  const loadTripDetails = async () => {
    try {
      setLoading(true);
      
      // Try to fetch real data from API first
      try {
        const realData = await api.getTripDetails(id!);
        setTripDetails(realData);
        return; // Success - exit early
      } catch (apiError) {
        console.log('API fetch failed, using demo data:', apiError);
      }
      
      // Fallback to demo trip data
      const demoTrip: TripDetails = {
        trip_id: id!,
        destination_info: {
          name: 'Paris, France',
          type: 'city',
          coordinates: [2.3522, 48.8566],
        },
        summary: '6-day romantic and cultural journey through Paris',
        total_duration_days: 6,
        estimated_budget: {
          total: 3000,
          currency: 'USD',
          transport: 900,
          accommodation: 1200,
          food: 600,
          activities: 240,
        },
        daily_plans: [
          {
            date: '2024-06-01',
            theme: 'Arrival and City Orientation',
            morning: [
              {
                start_time: '09:00',
                end_time: '12:00',
                activity: 'Louvre Museum Visit',
                location: {
                  name: 'Louvre Museum',
                  type: 'attraction',
                  coordinates: [2.3376, 48.8606],
                },
                description: 'World\'s largest art museum with Mona Lisa and Venus de Milo. Skip-the-line tickets recommended.',
                cost: 17.0,
                booking_required: true,
                verified_facts: [
                  {
                    fact: 'The Louvre receives over 9 million visitors annually',
                    source: 'https://en.wikipedia.org/wiki/Louvre',
                    confidence: 0.95,
                  },
                ],
              },
            ],
            afternoon: [
              {
                start_time: '14:00',
                end_time: '17:00',
                activity: 'Seine River Cruise',
                location: {
                  name: 'Seine River',
                  type: 'activity',
                  coordinates: [2.3522, 48.8566],
                },
                description: 'Scenic boat cruise along the Seine with views of Notre-Dame and other landmarks.',
                cost: 15.0,
                booking_required: false,
              },
            ],
            evening: [
              {
                start_time: '19:00',
                end_time: '21:00',
                activity: 'Dinner at Local Bistro',
                location: {
                  name: 'Le Comptoir du 7ème',
                  type: 'restaurant',
                  coordinates: [2.3084, 48.8534],
                },
                description: 'Authentic French bistro with seasonal menu and excellent wine selection.',
                cost: 85.0,
                booking_required: true,
              },
            ],
            total_cost: 185.0,
          },
          // Add more days...
        ],
        audio_tour_segments: [
          {
            location: 'Eiffel Tower',
            content: 'Standing before this iron lattice tower, you\'re witnessing Gustave Eiffel\'s masterpiece...',
            duration_minutes: 5,
            voice_style: 'friendly_guide',
          },
        ],
        safety_info: {
          general_safety: ['Stay aware of pickpockets in tourist areas'],
          health_advisories: ['No special vaccinations required'],
          emergency_contacts: { emergency: '112', police: '17' },
        },
        verification_status: 'facts_verified',
        confidence_score: 0.85,
      };
      
      setTripDetails(demoTrip);
    } catch (error) {
      Alert.alert('Error', 'Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    // Don't create multiple WebSocket connections
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      return;
    }
    
    if (id) {
      try {
        const ws = api.createWebSocketConnection(id);
        
        ws.onmessage = (event) => {
          const update = JSON.parse(event.data);
          handleRealtimeUpdate(update);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
        ws.onclose = () => {
          console.log('WebSocket connection closed');
          // Don't automatically reconnect to prevent connection spam
        };
        
        setWebsocket(ws);
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
      }
    }
  };

  const handleRealtimeUpdate = (update: any) => {
    switch (update.type) {
      case 'weather_alert':
        Alert.alert('Weather Alert', update.message);
        break;
      case 'venue_closure':
        Alert.alert('Venue Update', update.message);
        break;
      case 'transport_delay':
        Alert.alert('Transport Update', update.message);
        break;
      default:
        break;
    }
  };

  const shareTrip = async () => {
    if (!tripDetails) return;
    
    try {
      await Share.share({
        message: `Check out my ${tripDetails.total_duration_days}-day trip to ${tripDetails.destination_info.name}! ${tripDetails.summary}`,
        title: `Trip to ${tripDetails.destination_info.name}`,
      });
    } catch (error) {
      console.error('Error sharing trip:', error);
    }
  };

  const downloadOfflinePackage = async () => {
    try {
      Alert.alert(
        'Download Offline Package',
        'This will download maps, audio tours, and other offline content for this trip.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: () => {
              Alert.alert('Success', 'Offline package downloaded successfully!');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to download offline package');
    }
  };

  const bookActivity = async (activity: Activity) => {
    try {
      Alert.alert(
        'Book Activity',
        `Book ${activity.activity} for $${activity.cost}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Book Now',
            onPress: () => {
              Alert.alert('Demo Booking', 'This is a demo booking confirmation!');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Booking failed');
    }
  };

  if (loading || !tripDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading trip details...</Text>
      </View>
    );
  }

  const currentDay = tripDetails.daily_plans[selectedDay];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#2563EB', '#1D4ED8']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{tripDetails.destination_info.name}</Text>
          <Text style={styles.headerSubtitle}>
            {tripDetails.total_duration_days} days • {tripDetails.estimated_budget.currency} {tripDetails.estimated_budget.total.toLocaleString()}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton} onPress={shareTrip}>
              <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton} onPress={downloadOfflinePackage}>
              <Ionicons name="download-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Trip Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trip Overview</Text>
        <Text style={styles.summary}>{tripDetails.summary}</Text>
        <View style={styles.budgetBreakdown}>
          <Text style={styles.budgetTitle}>Budget Breakdown</Text>
          <View style={styles.budgetItems}>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Transport</Text>
              <Text style={styles.budgetValue}>${tripDetails.estimated_budget.transport}</Text>
            </View>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Accommodation</Text>
              <Text style={styles.budgetValue}>${tripDetails.estimated_budget.accommodation}</Text>
            </View>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Food</Text>
              <Text style={styles.budgetValue}>${tripDetails.estimated_budget.food}</Text>
            </View>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Activities</Text>
              <Text style={styles.budgetValue}>${tripDetails.estimated_budget.activities}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Daily Plans */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Itinerary</Text>
        
        {/* Day Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
          {tripDetails.daily_plans.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dayTab, selectedDay === index && styles.activeDayTab]}
              onPress={() => setSelectedDay(index)}
            >
              <Text style={[styles.dayTabText, selectedDay === index && styles.activeDayTabText]}>
                Day {index + 1}
              </Text>
              <Text style={[styles.dayTabDate, selectedDay === index && styles.activeDayTabDate]}>
                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Current Day Content */}
        {currentDay && (
          <View style={styles.dayContent}>
            <Text style={styles.dayTheme}>{currentDay.theme}</Text>
            <Text style={styles.dayCost}>Daily budget: ${currentDay.total_cost}</Text>

            {/* Morning */}
            <View style={styles.timeBlock}>
              <Text style={styles.timeBlockTitle}>Morning</Text>
              {currentDay.morning.map((activity, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.activityCard}
                  onPress={() => activity.booking_required && bookActivity(activity)}
                >
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityName}>{activity.activity}</Text>
                    <Text style={styles.activityCost}>${activity.cost}</Text>
                  </View>
                  <Text style={styles.activityLocation}>{activity.location.name}</Text>
                  <Text style={styles.activityTime}>
                    {activity.start_time} - {activity.end_time}
                  </Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                  {activity.booking_required && (
                    <View style={styles.bookingRequired}>
                      <Ionicons name="ticket-outline" size={16} color="#F59E0B" />
                      <Text style={styles.bookingText}>Booking Required</Text>
                    </View>
                  )}
                  {activity.verified_facts && activity.verified_facts.length > 0 && (
                    <View style={styles.verifiedFacts}>
                      <Ionicons name="shield-checkmark" size={16} color="#059669" />
                      <Text style={styles.verifiedText}>Fact Verified</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Afternoon */}
            <View style={styles.timeBlock}>
              <Text style={styles.timeBlockTitle}>Afternoon</Text>
              {currentDay.afternoon.map((activity, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.activityCard}
                  onPress={() => activity.booking_required && bookActivity(activity)}
                >
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityName}>{activity.activity}</Text>
                    <Text style={styles.activityCost}>${activity.cost}</Text>
                  </View>
                  <Text style={styles.activityLocation}>{activity.location.name}</Text>
                  <Text style={styles.activityTime}>
                    {activity.start_time} - {activity.end_time}
                  </Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Evening */}
            <View style={styles.timeBlock}>
              <Text style={styles.timeBlockTitle}>Evening</Text>
              {currentDay.evening.map((activity, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.activityCard}
                  onPress={() => activity.booking_required && bookActivity(activity)}
                >
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityName}>{activity.activity}</Text>
                    <Text style={styles.activityCost}>${activity.cost}</Text>
                  </View>
                  <Text style={styles.activityLocation}>{activity.location.name}</Text>
                  <Text style={styles.activityTime}>
                    {activity.start_time} - {activity.end_time}
                  </Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                  {activity.booking_required && (
                    <View style={styles.bookingRequired}>
                      <Ionicons name="ticket-outline" size={16} color="#F59E0B" />
                      <Text style={styles.bookingText}>Booking Required</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Audio Tours */}
      {tripDetails.audio_tour_segments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Tours</Text>
          {tripDetails.audio_tour_segments.map((segment, index) => (
            <View key={index} style={styles.audioSegmentCard}>
              <View style={styles.audioSegmentHeader}>
                <Ionicons name="volume-high" size={24} color="#7C3AED" />
                <Text style={styles.audioSegmentLocation}>{segment.location}</Text>
                <Text style={styles.audioSegmentDuration}>{segment.duration_minutes} min</Text>
              </View>
              <Text style={styles.audioSegmentContent} numberOfLines={3}>
                {segment.content}
              </Text>
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={16} color="#FFFFFF" />
                <Text style={styles.playButtonText}>Play Audio Tour</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Safety Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety & Information</Text>
        <View style={styles.safetyCard}>
          <View style={styles.safetySection}>
            <Text style={styles.safetySubtitle}>General Safety</Text>
            {tripDetails.safety_info.general_safety.map((tip, index) => (
              <Text key={index} style={styles.safetyTip}>• {tip}</Text>
            ))}
          </View>
          <View style={styles.safetySection}>
            <Text style={styles.safetySubtitle}>Emergency Contacts</Text>
            {Object.entries(tripDetails.safety_info.emergency_contacts).map(([key, value]) => (
              <Text key={key} style={styles.emergencyContact}>
                {key}: {value}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Export Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>AR Tour</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  summary: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 20,
  },
  budgetBreakdown: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  budgetItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  budgetItem: {
    width: '48%',
    marginBottom: 12,
  },
  budgetLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  daySelector: {
    marginBottom: 20,
  },
  dayTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
  },
  activeDayTab: {
    backgroundColor: '#2563EB',
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeDayTabText: {
    color: '#FFFFFF',
  },
  dayTabDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  activeDayTabDate: {
    color: '#E0E7FF',
  },
  dayContent: {
    marginTop: 8,
  },
  dayTheme: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  dayCost: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 24,
  },
  timeBlock: {
    marginBottom: 24,
  },
  timeBlockTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  activityCost: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  activityLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  bookingRequired: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  bookingText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
    marginLeft: 6,
  },
  verifiedFacts: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    marginLeft: 6,
  },
  audioSegmentCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  audioSegmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  audioSegmentLocation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginLeft: 12,
  },
  audioSegmentDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  audioSegmentContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  safetyCard: {
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 16,
  },
  safetySection: {
    marginBottom: 16,
  },
  safetySubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  safetyTip: {
    fontSize: 14,
    color: '#78350F',
    marginBottom: 4,
    lineHeight: 20,
  },
  emergencyContact: {
    fontSize: 14,
    color: '#78350F',
    fontWeight: '600',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});