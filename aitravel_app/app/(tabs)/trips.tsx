import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTripCraftAPI } from '../../hooks/useTripCraftAPI';
import { TravelPlanResponse } from '../../types/api';

interface Trip extends TravelPlanResponse {
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  booking_status?: {
    total_bookings: number;
    confirmed_bookings: number;
  };
  offline_package?: {
    available: boolean;
    size_mb: number;
    downloaded: boolean;
  };
}

export default function TripsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  const api = useTripCraftAPI();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      // Load trips from local storage first
      const savedTrips = await AsyncStorage.getItem('userTrips');
      if (savedTrips) {
        const parsedTrips = JSON.parse(savedTrips);
        setTrips(parsedTrips);
      } else {
        // Demo trips for showcase
        const demoTrips: Trip[] = [
          {
            trip_id: 'demo-paris-001',
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
              shopping: 0,
              contingency: 60,
            },
            daily_plans: [],
            transport_options: [],
            accommodation_options: [],
            dining_recommendations: [],
            audio_tour_segments: [],
            ar_ready_pois: [],
            safety_info: {
              general_advice: ['Stay aware of pickpockets in tourist areas'],
              emergency_contacts: { police: '17', medical: '15', embassy: '+33 1 43 12 22 22' },
              local_laws: ['No smoking in public places'],
              health_considerations: ['No special vaccinations required'],
              weather_warnings: [],
              political_situation: 'Stable',
            },
            weather_forecast: [],
            live_events: [],
            alternative_plans: [],
            generated_at: '2024-03-15T10:30:00Z',
            confidence_score: 0.85,
            sources: [],
            status: 'planning',
            booking_status: {
              total_bookings: 8,
              confirmed_bookings: 3,
            },
            offline_package: {
              available: true,
              size_mb: 45,
              downloaded: false,
            },
          },
          // Add more demo trips...
        ];
        setTrips(demoTrips);
        await AsyncStorage.setItem('userTrips', JSON.stringify(demoTrips));
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  };

  const downloadOfflinePackage = async (trip: Trip) => {
    try {
      Alert.alert(
        'Download Offline Package',
        `This will download ${trip.offline_package?.size_mb}MB of offline content for ${trip.destination_info.name}. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: async () => {
              const response = await api.downloadOfflinePackage(trip.trip_id);
              if (response.success) {
                const updatedTrips = trips.map(t =>
                  t.trip_id === trip.trip_id
                    ? {
                        ...t,
                        offline_package: { ...t.offline_package!, downloaded: true }
                      }
                    : t
                );
                setTrips(updatedTrips);
                await AsyncStorage.setItem('userTrips', JSON.stringify(updatedTrips));
                Alert.alert('Success', 'Offline package downloaded successfully!');
              } else {
                Alert.alert('Error', response.error?.message || 'Failed to download offline package');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to download offline package');
    }
  };

  const shareTrip = async (trip: Trip) => {
    try {
      await Share.share({
        message: `Check out my ${trip.total_duration_days}-day trip to ${trip.destination_info.name}! ${trip.summary}`,
        title: `Trip to ${trip.destination_info.name}`,
      });
    } catch (error) {
      console.error('Error sharing trip:', error);
    }
  };

  const getDestinationImage = (destination: string): string => {
    // Return appropriate stock image based on destination
    if (destination.includes('Paris')) {
      return 'https://images.pexels.com/photos/161853/eiffel-tower-paris-france-161853.jpeg';
    } else if (destination.includes('Tokyo')) {
      return 'https://images.pexels.com/photos/161772/tokyo-tower-landmark-japan-161772.jpeg';
    } else if (destination.includes('Bali')) {
      return 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg';
    }
    return 'https://images.pexels.com/photos/1058959/pexels-photo-1058959.jpeg';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'planning': return '#F59E0B';
      case 'active': return '#059669';
      case 'completed': return '#6B7280';
      case 'cancelled': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'planning': return 'create-outline';
      case 'active': return 'airplane-outline';
      case 'completed': return 'checkmark-circle-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const filteredTrips = trips.filter(trip => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return trip.status === 'active' || trip.status === 'planning';
    if (activeTab === 'completed') return trip.status === 'completed';
    return true;
  });

  const renderTripCard = (trip: Trip) => (
    <View key={trip.trip_id} style={styles.tripCardContainer}>
      <TouchableOpacity
        style={styles.tripCard}
        onPress={() => router.push(`/trip/${trip.trip_id}`)}
        activeOpacity={0.95}
      >
        <View style={styles.tripImageContainer}>
          <Image
            source={{ uri: getDestinationImage(trip.destination_info.name) }}
            style={styles.tripImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.tripImageOverlay}
          >
            <View style={styles.imageTopRow}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) }]}>
                <Ionicons name={getStatusIcon(trip.status) as any} size={12} color="#FFFFFF" />
                <Text style={styles.statusText}>{trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}</Text>
              </View>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={(e) => {
                  e.stopPropagation();
                  shareTrip(trip);
                }}
              >
                <Ionicons name="share-outline" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.imageBottomRow}>
              <Text style={styles.tripDestination}>{trip.destination_info.name}</Text>
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{trip.total_duration_days} days</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        <View style={styles.tripContent}>
          <Text style={styles.tripSummary} numberOfLines={2}>{trip.summary}</Text>
          
          <View style={styles.tripMetrics}>
            <View style={styles.metricItem}>
              <View style={styles.metricIcon}>
                <Ionicons name="wallet-outline" size={14} color="#059669" />
              </View>
              <Text style={styles.metricText}>
                {trip.estimated_budget.currency} {trip.estimated_budget.total.toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.metricItem}>
              <View style={styles.metricIcon}>
                <Ionicons name="calendar-outline" size={14} color="#7C3AED" />
              </View>
              <Text style={styles.metricText}>
                {new Date(trip.dates?.start || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </View>
          
          {/* Enhanced Booking Progress */}
          {trip.booking_status && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Booking Progress</Text>
                <Text style={styles.progressValue}>
                  {trip.booking_status.confirmed_bookings}/{trip.booking_status.total_bookings}
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min((trip.booking_status.confirmed_bookings / trip.booking_status.total_bookings) * 100, 100)}%`
                      }
                    ]}
                  />
                </View>
                <Text style={styles.progressPercent}>
                  {Math.round((trip.booking_status.confirmed_bookings / trip.booking_status.total_bookings) * 100)}%
                </Text>
              </View>
            </View>
          )}
          
          {/* Enhanced Actions Row */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryAction]}
              onPress={(e) => {
                e.stopPropagation();
                router.push(`/trip/${trip.trip_id}`);
              }}
            >
              <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>View Details</Text>
            </TouchableOpacity>
            
            <View style={styles.secondaryActions}>
              {trip.offline_package?.available && (
                <TouchableOpacity
                  style={[
                    styles.secondaryActionButton,
                    trip.offline_package.downloaded && styles.downloadedButton
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    downloadOfflinePackage(trip);
                  }}
                >
                  <Ionicons 
                    name={trip.offline_package.downloaded ? "checkmark-circle" : "download-outline"} 
                    size={16} 
                    color={trip.offline_package.downloaded ? "#059669" : "#6B7280"} 
                  />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  // Add calendar functionality
                }}
              >
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  // Add more options
                }}
              >
                <Ionicons name="ellipsis-horizontal" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#0F766E', '#059669', '#06B6D4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Adventures</Text>
            <Text style={styles.headerSubtitle}>
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'} • AI-crafted experiences
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/plan')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Enhanced Filter Tabs */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabContainer}>
          {[
            { key: 'all', label: 'All Trips', count: trips.length },
            { key: 'active', label: 'Active', count: trips.filter(t => t.status === 'active' || t.status === 'planning').length },
            { key: 'completed', label: 'Completed', count: trips.filter(t => t.status === 'completed').length }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View style={[styles.tabBadge, activeTab === tab.key && styles.activeTabBadge]}>
                  <Text style={[styles.tabBadgeText, activeTab === tab.key && styles.activeTabBadgeText]}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#059669']}
            tintColor="#059669"
          />
        }
      >
        {api.loading ? (
          <View style={styles.loadingState}>
            <View style={styles.loadingIcon}>
              <Ionicons name="airplane-outline" size={48} color="#D1D5DB" />
            </View>
            <Text style={styles.loadingText}>Loading your adventures...</Text>
          </View>
        ) : filteredTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="map-outline" size={64} color="#E5E7EB" />
            </View>
            <Text style={styles.emptyStateTitle}>
              {activeTab === 'all' ? 'No trips yet' : `No ${activeTab} trips`}
            </Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'all'
                ? "Ready to explore the world? Let's plan your first adventure!"
                : `You don't have any ${activeTab} trips at the moment.`}
            </Text>
            <TouchableOpacity
              style={styles.planTripButton}
              onPress={() => router.push('/plan')}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.planTripButtonText}>Plan Your First Trip</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.tripsContainer}>
            {filteredTrips.map(renderTripCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabsWrapper: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: '#059669',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    minWidth: 20,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTabBadgeText: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  tripsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tripCardContainer: {
    marginBottom: 20,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  tripImageContainer: {
    position: 'relative',
    height: 180,
  },
  tripImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
  tripImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: 'space-between',
  },
  imageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shareButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  imageBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tripDestination: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  durationBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backdropFilter: 'blur(10px)',
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tripContent: {
    padding: 20,
  },
  tripSummary: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '400',
  },
  tripMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  metricText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressValue: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '700',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    minWidth: 35,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryAction: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  secondaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryActionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  downloadedButton: {
    backgroundColor: '#ECFDF5',
  },
  actionButton: {
    // Base styles for action buttons
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 280,
  },
  planTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  planTripButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  loadingState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  loadingIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
});