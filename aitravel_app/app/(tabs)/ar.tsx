import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTripCraftAPI } from '../../hooks/useTripCraftAPI';
import { ARReadyPOI } from '../../types/api';

const { width } = Dimensions.get('window');

interface ARExperience {
  id: string;
  name: string;
  description: string;
  image: string;
  type: 'landmark' | 'museum' | 'restaurant' | 'viewpoint' | 'cultural';
  ar_ready: boolean;
  audio_available: boolean;
  estimated_duration: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  rating: number;
  distance?: number; // meters from current location
}

const AR_CATEGORIES = [
  { id: 'all', name: 'All', icon: 'grid-outline', color: '#6B7280' },
  { id: 'landmark', name: 'Landmarks', icon: 'location-outline', color: '#EF4444' },
  { id: 'museum', name: 'Museums', icon: 'library-outline', color: '#8B5CF6' },
  { id: 'restaurant', name: 'Food', icon: 'restaurant-outline', color: '#F59E0B' },
  { id: 'viewpoint', name: 'Views', icon: 'eye-outline', color: '#06B6D4' },
  { id: 'cultural', name: 'Culture', icon: 'people-outline', color: '#10B981' },
];

export default function ARScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [arExperiences, setArExperiences] = useState<ARExperience[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<ARExperience | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  const api = useTripCraftAPI();

  useEffect(() => {
    loadARExperiences();
    getCurrentLocation();
  }, []);

  const loadARExperiences = async () => {
    try {
      // Demo AR experiences - in a real app, this would come from the API
      const demos: ARExperience[] = [
        {
          id: 'eiffel-tower-ar',
          name: 'Eiffel Tower AR Experience',
          description: 'Explore the iconic Eiffel Tower with 3D models and historical information',
          image: 'https://images.pexels.com/photos/161853/eiffel-tower-paris-france-161853.jpeg',
          type: 'landmark',
          ar_ready: true,
          audio_available: true,
          estimated_duration: 15,
          difficulty: 'easy',
          rating: 4.9,
          distance: 250,
        },
        {
          id: 'louvre-ar',
          name: 'Louvre Museum AR Tour',
          description: 'Virtual tour of the Louvre with AR overlays on famous artworks',
          image: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg',
          type: 'museum',
          ar_ready: true,
          audio_available: true,
          estimated_duration: 30,
          difficulty: 'medium',
          rating: 4.8,
          distance: 1200,
        },
        {
          id: 'notre-dame-ar',
          name: 'Notre-Dame Cathedral',
          description: 'Discover the architectural details and history of Notre-Dame',
          image: 'https://images.pexels.com/photos/161772/tokyo-tower-landmark-japan-161772.jpeg',
          type: 'cultural',
          ar_ready: true,
          audio_available: true,
          estimated_duration: 20,
          difficulty: 'easy',
          rating: 4.7,
          distance: 800,
        },
        {
          id: 'montmartre-ar',
          name: 'Montmartre District',
          description: 'Explore the artistic neighborhood with AR-guided walking tour',
          image: 'https://images.pexels.com/photos/290386/pexels-photo-290386.jpeg',
          type: 'cultural',
          ar_ready: true,
          audio_available: true,
          estimated_duration: 45,
          difficulty: 'medium',
          rating: 4.6,
          distance: 2000,
        },
        {
          id: 'seine-river-ar',
          name: 'Seine River Walk',
          description: 'AR-enhanced walk along the Seine with historical points of interest',
          image: 'https://images.pexels.com/photos/1309594/pexels-photo-1309594.jpeg',
          type: 'viewpoint',
          ar_ready: true,
          audio_available: true,
          estimated_duration: 25,
          difficulty: 'easy',
          rating: 4.5,
          distance: 500,
        },
        {
          id: 'champs-elysees-ar',
          name: 'Champs-Élysées',
          description: 'Discover the famous avenue with AR shopping and dining guides',
          image: 'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg',
          type: 'restaurant',
          ar_ready: true,
          audio_available: false,
          estimated_duration: 35,
          difficulty: 'easy',
          rating: 4.4,
          distance: 1500,
        },
      ];
      setArExperiences(demos);
    } catch (error) {
      console.error('Error loading AR experiences:', error);
    }
  };

  const getCurrentLocation = async () => {
    // In a real app, this would use expo-location
    setCurrentLocation({ lat: 48.8566, lng: 2.3522 }); // Paris coordinates
  };

  const startARExperience = async (experience: ARExperience) => {
    try {
      if (!experience.ar_ready) {
        Alert.alert('Not Available', 'AR experience is not ready for this location');
        return;
      }

      setSelectedExperience(experience);
      setIsARActive(true);
      
      // In a real app, this would launch the AR camera
      Alert.alert(
        'AR Experience Started',
        `Starting ${experience.name}. Point your camera at the location to begin.`,
        [
          {
            text: 'Stop AR',
            onPress: () => setIsARActive(false),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to start AR experience');
    }
  };

  const playAudioGuide = async (experience: ARExperience) => {
    if (!experience.audio_available) {
      Alert.alert('Not Available', 'Audio guide is not available for this experience');
      return;
    }

    Alert.alert(
      'Audio Guide',
      `Playing audio guide for ${experience.name}`,
      [
        { text: 'Stop', onPress: () => console.log('Audio stopped') },
      ]
    );
  };

  const filteredExperiences = arExperiences.filter(exp => 
    selectedCategory === 'all' || exp.type === selectedCategory
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'checkmark-circle';
      case 'medium': return 'alert-circle';
      case 'hard': return 'warning';
      default: return 'help-circle';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'landmark': return 'location';
      case 'museum': return 'library';
      case 'restaurant': return 'restaurant';
      case 'viewpoint': return 'eye';
      case 'cultural': return 'people';
      default: return 'help-circle';
    }
  };

  const getTypeColor = (type: string) => {
    const category = AR_CATEGORIES.find(cat => cat.id === type);
    return category?.color || '#6B7280';
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    if (distance < 1000) return `${distance}m`;
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const renderARExperience = (experience: ARExperience) => (
    <TouchableOpacity
      key={experience.id}
      style={styles.experienceCard}
      onPress={() => startARExperience(experience)}
      activeOpacity={0.8}
    >
      <View style={styles.experienceImageContainer}>
        <Image
          source={{ uri: experience.image }}
          style={styles.experienceImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.experienceOverlay}
        >
          {/* Top Badges */}
          <View style={styles.experienceHeader}>
            <View style={styles.experienceBadges}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(experience.difficulty) }]}>
                <Ionicons name={getDifficultyIcon(experience.difficulty) as any} size={12} color="#FFFFFF" />
                <Text style={styles.difficultyText}>{experience.difficulty.toUpperCase()}</Text>
              </View>
              {experience.ar_ready && (
                <LinearGradient
                  colors={['#8B5CF6', '#A855F7']}
                  style={styles.arBadge}
                >
                  <Ionicons name="camera" size={12} color="#FFFFFF" />
                  <Text style={styles.badgeText}>AR READY</Text>
                </LinearGradient>
              )}
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{experience.rating}</Text>
            </View>
          </View>

          {/* Bottom Info */}
          <View style={styles.experienceImageInfo}>
            <View style={styles.experienceQuickInfo}>
              <View style={styles.quickInfoItem}>
                <Ionicons name="time" size={14} color="#FFFFFF" />
                <Text style={styles.quickInfoText}>{experience.estimated_duration}min</Text>
              </View>
              {experience.distance && (
                <View style={styles.quickInfoItem}>
                  <Ionicons name="walk" size={14} color="#FFFFFF" />
                  <Text style={styles.quickInfoText}>{formatDistance(experience.distance)} away</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.experienceContent}>
        <View style={styles.experienceTitleRow}>
          <View style={styles.titleSection}>
            <Text style={styles.experienceTitle} numberOfLines={1}>{experience.name}</Text>
            <View style={styles.typeIndicator}>
              <Ionicons 
                name={getTypeIcon(experience.type) as any} 
                size={14} 
                color={getTypeColor(experience.type)} 
              />
              <Text style={[styles.typeText, { color: getTypeColor(experience.type) }]}>
                {experience.type.charAt(0).toUpperCase() + experience.type.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.experienceDescription} numberOfLines={2}>
          {experience.description}
        </Text>

        <View style={styles.experienceActions}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => startARExperience(experience)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#8B5CF6', '#A855F7']}
              style={styles.primaryActionGradient}
            >
              <View style={styles.actionContent}>
                <Ionicons name="camera" size={18} color="#FFFFFF" />
                <Text style={styles.primaryActionText}>Start AR Experience</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          {experience.audio_available && (
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => playAudioGuide(experience)}
              activeOpacity={0.8}
            >
              <Ionicons name="volume-high" size={18} color="#8B5CF6" />
              <Text style={styles.secondaryActionText}>Audio Guide</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#1E1B4B', '#5B21B6', '#8B5CF6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>AR Experiences</Text>
            {isARActive && (
              <View style={styles.arActiveIndicator}>
                <View style={styles.arActiveDot} />
                <Text style={styles.arActiveText}>AR ACTIVE</Text>
              </View>
            )}
          </View>
          <Text style={styles.headerSubtitle}>
            Discover destinations through augmented reality
          </Text>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{arExperiences.length}</Text>
              <Text style={styles.statLabel}>Experiences</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{arExperiences.filter(e => e.ar_ready).length}</Text>
              <Text style={styles.statLabel}>AR Ready</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{arExperiences.filter(e => e.audio_available).length}</Text>
              <Text style={styles.statLabel}>Audio Tours</Text>
            </View>
          </View>
        </View>
        
        {/* Decorative Elements */}
        <View style={styles.headerDecoration1} />
        <View style={styles.headerDecoration2} />
        <View style={styles.headerDecoration3} />
      </LinearGradient>

      {/* Enhanced Category Filter */}
      <View style={styles.categorySection}>
        <Text style={styles.categorySectionTitle}>Categories</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {AR_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && [
                  styles.activeCategoryChip,
                  { backgroundColor: category.color }
                ]
              ]}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.categoryIconContainer,
                selectedCategory === category.id && styles.activeCategoryIcon
              ]}>
                <Ionicons 
                  name={category.icon as any} 
                  size={18} 
                  color={selectedCategory === category.id ? category.color : '#6B7280'} 
                />
              </View>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.activeCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* AR Experiences List */}
      <ScrollView 
        style={styles.experiencesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.experiencesContent}
      >
        {api.loading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
            <Text style={styles.loadingText}>Loading AR experiences...</Text>
            <Text style={styles.loadingSubtext}>Discovering magical moments near you</Text>
          </View>
        ) : filteredExperiences.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="camera-outline" size={64} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyStateTitle}>No AR experiences found</Text>
            <Text style={styles.emptyStateText}>
              Try selecting a different category or check back later for new experiences.
            </Text>
            <TouchableOpacity style={styles.emptyStateButton}>
              <Text style={styles.emptyStateButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.experiencesList}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {filteredExperiences.length} experience{filteredExperiences.length !== 1 ? 's' : ''} found
              </Text>
              <TouchableOpacity style={styles.sortButton}>
                <Ionicons name="funnel" size={16} color="#6B7280" />
                <Text style={styles.sortButtonText}>Sort</Text>
              </TouchableOpacity>
            </View>
            {filteredExperiences.map(renderARExperience)}
          </View>
        )}
      </ScrollView>

      {/* Enhanced AR Controls Overlay */}
      {isARActive && selectedExperience && (
        <View style={styles.arControlsOverlay}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.arControlsGradient}
          >
            <View style={styles.arControls}>
              <View style={styles.arControlsHeader}>
                <View style={styles.arStatusIndicator}>
                  <View style={styles.arStatusDot} />
                  <Text style={styles.arStatusText}>AR Active</Text>
                </View>
                <Text style={styles.arControlsTitle}>{selectedExperience.name}</Text>
              </View>
              
              <View style={styles.arControlButtons}>
                <TouchableOpacity style={styles.arControlButton} activeOpacity={0.8}>
                  <Ionicons name="camera" size={24} color="#FFFFFF" />
                  <Text style={styles.arControlButtonText}>Capture</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.arControlButton} activeOpacity={0.8}>
                  <Ionicons name="information-circle" size={24} color="#FFFFFF" />
                  <Text style={styles.arControlButtonText}>Info</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.arControlButton} activeOpacity={0.8}>
                  <Ionicons name="volume-high" size={24} color="#FFFFFF" />
                  <Text style={styles.arControlButtonText}>Audio</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.arControlButton, styles.arControlButtonDanger]}
                  onPress={() => setIsARActive(false)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                  <Text style={styles.arControlButtonText}>Exit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Enhanced Header Styles
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    zIndex: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
    fontWeight: '500',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
  },
  arActiveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.4)',
  },
  arActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  arActiveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerDecoration1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecoration2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerDecoration3: {
    position: 'absolute',
    top: 50,
    right: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // Enhanced Category Section
  categorySection: {
    backgroundColor: '#F8FAFC',
    paddingTop: 20,
    paddingBottom: 16,
  },
  categorySectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  categoryContainer: {
    paddingHorizontal: 20,
  },
  categoryContent: {
    paddingHorizontal: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  activeCategoryChip: {
    borderColor: 'transparent',
    elevation: 4,
    shadowOpacity: 0.15,
  },
  categoryIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  activeCategoryIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },

  // Experience List Styles
  experiencesContainer: {
    flex: 1,
  },
  experiencesContent: {
    paddingBottom: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
  },
  experiencesList: {
    paddingHorizontal: 24,
  },
  experienceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },

  // Enhanced Experience Image
  experienceImageContainer: {
    position: 'relative',
  },
  experienceImage: {
    width: '100%',
    height: 220,
  },
  experienceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 16,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  experienceBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  arBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  experienceImageInfo: {
    alignItems: 'flex-start',
  },
  experienceQuickInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  quickInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickInfoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Enhanced Content Area
  experienceContent: {
    padding: 20,
  },
  experienceTitleRow: {
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  experienceTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  experienceDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 20,
  },

  // Enhanced Action Buttons
  experienceActions: {
    gap: 12,
  },
  primaryAction: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  primaryActionGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  secondaryActionText: {
    color: '#8B5CF6',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 24,
  },
  loadingSpinner: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 50,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  emptyStateIcon: {
    padding: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 50,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Enhanced AR Controls
  arControlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  arControlsGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  arControls: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  arControlsHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  arStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.4)',
    marginBottom: 8,
  },
  arStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  arStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  arControlsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  arControlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  arControlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  arControlButtonDanger: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderColor: 'rgba(239,68,68,0.4)',
  },
  arControlButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
});