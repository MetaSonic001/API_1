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
import { TripCraftAPI } from '../../services/TripCraftAPI';

interface Trip {
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
  };
  dates: {
    start: string;
    end: string;
  };
  generated_at: string;
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  const api = new TripCraftAPI();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      
      // Load trips from local storage for now
      // In a real app, this would call the API
      const savedTrips = await AsyncStorage.getItem('userTrips');
      if (savedTrips) {
        setTrips(JSON.parse(savedTrips));
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
            },
            dates: {
              start: '2024-06-01',
              end: '2024-06-07',
            },
            generated_at: '2024-03-15T10:30:00Z',
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
          {
            trip_id: 'demo-tokyo-002',
            destination_info: {
              name: 'Tokyo, Japan',
              type: 'city',
              coordinates: [139.6917, 35.6895],
            },
            summary: '8-day adventure through modern and traditional Tokyo',
            total_duration_days: 8,
            estimated_budget: {
              total: 4500,
              currency: 'USD',
            },
            dates: {
              start: '2024-07-15',
              end: '2024-07-23',
            },
            generated_at: '2024-03-10T14:20:00Z',
            status: 'active',
            booking_status: {
              total_bookings: 12,
              confirmed_bookings: 10,
            },
            offline_package: {
              available: true,
              size_mb: 62,
              downloaded: true,
            },
          },
          {
            trip_id: 'demo-bali-003',
            destination_info: {
              name: 'Bali, Indonesia',
              type: 'region',
              coordinates: [115.0920, -8.4095],
            },
            summary: '10-day tropical paradise and cultural exploration',
            total_duration_days: 10,
            estimated_budget: {
              total: 2800,
              currency: 'USD',
            },
            dates: {
              start: '2024-02-01',
              end: '2024-02-11',
            },
            generated_at: '2024-01-20T09:15:00Z',
            status: 'completed',
            booking_status: {
              total_bookings: 15,
              confirmed_bookings: 15,
            },
            offline_package: {
              available: true,
              size_mb: 38,
              downloaded: true,
            },
          },
        ];
        setTrips(demoTrips);
        await AsyncStorage.setItem('userTrips', JSON.stringify(demoTrips));
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
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
              // In a real app, this would download the package
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
    <TouchableOpacity
      key={trip.trip_id}
      style={styles.tripCard}
      onPress={() => router.push(`/trip/${trip.trip_id}`)}
    >
      <Image
        source={{ uri: getDestinationImage(trip.destination_info.name) }}
        style={styles.tripImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.tripImageOverlay}
      >
        <View style={styles.tripImageContent}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) }]}>
            <Ionicons name={getStatusIcon(trip.status) as any} size={14} color="#FFFFFF" />
            <Text style={styles.statusText}>{trip.status.toUpperCase()}</Text>
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.tripContent}>
        <View style={styles.tripHeader}>
          <Text style={styles.tripDestination}>{trip.destination_info.name}</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => shareTrip(trip)}
          >
            <Ionicons name="share-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.tripSummary} numberOfLines={2}>{trip.summary}</Text>
        
        <View style={styles.tripDetails}>
          <View style={styles.tripDetail}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.tripDetailText}>{trip.total_duration_days} days</Text>
          </View>
          <View style={styles.tripDetail}>
            <Ionicons name="wallet-outline" size={16} color="#6B7280" />
            <Text style={styles.tripDetailText}>
              {trip.estimated_budget.currency} {trip.estimated_budget.total.toLocaleString()}
            </Text>
          </View>
        </View>
        
        <View style={styles.tripDates}>
          <Text style={styles.tripDateText}>
            {new Date(trip.dates.start).toLocaleDateString()} - {new Date(trip.dates.end).toLocaleDateString()}
          </Text>
        </View>
        
        {/* Booking Status */}
        {trip.booking_status && (
          <View style={styles.bookingProgress}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(trip.booking_status.confirmed_bookings / trip.booking_status.total_bookings) * 100}%`
                  }
                ]}
              />
            </View>
            <Text style={styles.bookingText}>
              {trip.booking_status.confirmed_bookings}/{trip.booking_status.total_bookings} bookings confirmed
            </Text>
          </View>
        )}
        
        {/* Trip Actions */}
        <View style={styles.tripActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="information-circle-outline" size={18} color="#2563EB" />
            <Text style={styles.actionButtonText}>Details</Text>
          </TouchableOpacity>
          
          {trip.offline_package?.available && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => downloadOfflinePackage(trip)}
            >
              <Ionicons 
                name={trip.offline_package.downloaded ? "checkmark-circle" : "download-outline"} 
                size={18} 
                color={trip.offline_package.downloaded ? "#059669" : "#7C3AED"} 
              />
              <Text style={[
                styles.actionButtonText,
                { color: trip.offline_package.downloaded ? "#059669" : "#7C3AED" }
              ]}>
                {trip.offline_package.downloaded ? 'Downloaded' : 'Offline'}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="calendar-outline" size={18} color="#F59E0B" />
            <Text style={styles.actionButtonText}>Calendar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#059669', '#047857']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>My Trips</Text>
        <Text style={styles.headerSubtitle}>
          {trips.length} trips planned • AI-powered itineraries
        </Text>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>Completed</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="airplane-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No trips found</Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'all'
                ? "Start planning your first trip!"
                : `No ${activeTab} trips to show.`}
            </Text>
            <TouchableOpacity
              style={styles.planTripButton}
              onPress={() => router.push('/plan')}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.planTripButtonText}>Plan New Trip</Text>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#059669',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  tripsContainer: {
    padding: 24,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  tripImage: {
    width: '100%',
    height: 200,
  },
  tripImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'space-between',
    padding: 16,
  },
  tripImageContent: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  tripContent: {
    padding: 20,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripDestination: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  shareButton: {
    padding: 8,
  },
  tripSummary: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tripDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripDetailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '600',
  },
  tripDates: {
    marginBottom: 16,
  },
  tripDateText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  bookingProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 3,
  },
  bookingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  tripActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  planTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  planTripButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});