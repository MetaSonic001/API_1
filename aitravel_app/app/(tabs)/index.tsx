import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: 'AI-Powered Travel Planning',
    description: 'Let our multi-agent AI system create personalized itineraries tailored to your preferences',
    image: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg',
    icon: 'brain-outline',
  },
  {
    id: 2,
    title: 'Multimodal Input',
    description: 'Plan your trip using voice commands, mood boards, or traditional text input',
    image: 'https://images.pexels.com/photos/1309594/pexels-photo-1309594.jpeg',
    icon: 'mic-outline',
  },
  {
    id: 3,
    title: 'AR Tours & Real-time Updates',
    description: 'Experience immersive AR tours and get real-time updates about your destinations',
    image: 'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg',
    icon: 'camera-outline',
  },
];

const FEATURED_DESTINATIONS = [
  {
    name: 'Paris, France',
    image: 'https://images.pexels.com/photos/161853/eiffel-tower-paris-france-161853.jpeg',
    rating: 4.9,
    trips: 1250,
  },
  {
    name: 'Tokyo, Japan',
    image: 'https://images.pexels.com/photos/161772/tokyo-tower-landmark-japan-161772.jpeg',
    rating: 4.8,
    trips: 980,
  },
  {
    name: 'New York, USA',
    image: 'https://images.pexels.com/photos/290386/pexels-photo-290386.jpeg',
    rating: 4.7,
    trips: 1850,
  },
];

export default function DiscoverScreen() {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      if (hasSeenOnboarding) {
        setIsFirstTime(false);
      }
    } catch (error) {
      console.error('Error checking first time:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setIsFirstTime(false);
    } catch (error) {
      console.error('Error saving onboarding:', error);
    }
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  if (isFirstTime) {
    const step = ONBOARDING_STEPS[currentStep];
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ImageBackground
          source={{ uri: step.image }}
          style={styles.onboardingBackground}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.onboardingOverlay}
          >
            <View style={styles.onboardingHeader}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={skipOnboarding}
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.onboardingContent}>
              <View style={styles.iconContainer}>
                <Ionicons name={step.icon as any} size={60} color="#FFFFFF" />
              </View>
              <Text style={styles.onboardingTitle}>{step.title}</Text>
              <Text style={styles.onboardingDescription}>{step.description}</Text>
            </View>

            <View style={styles.onboardingFooter}>
              <View style={styles.stepIndicator}>
                {ONBOARDING_STEPS.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.stepDot,
                      index === currentStep && styles.activeDot,
                    ]}
                  />
                ))}
              </View>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={nextStep}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" />
      
      {/* Hero Section */}
      <LinearGradient
        colors={['#2563EB', '#1D4ED8']}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Plan Your Perfect Trip</Text>
          <Text style={styles.heroSubtitle}>
            AI-powered travel planning with multimodal inputs and real-time updates
          </Text>
          <TouchableOpacity
            style={styles.planTripButton}
            onPress={() => router.push('/plan')}
          >
            <Ionicons name="add-circle" size={24} color="#2563EB" />
            <Text style={styles.planTripText}>Start Planning</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/plan?mode=voice')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="mic" size={24} color="#2563EB" />
            </View>
            <Text style={styles.quickActionText}>Voice Plan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/plan?mode=moodboard')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="images" size={24} color="#059669" />
            </View>
            <Text style={styles.quickActionText}>Mood Board</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/plan?mode=surprise')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="gift" size={24} color="#DC2626" />
            </View>
            <Text style={styles.quickActionText}>Surprise Me</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/ar')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="camera" size={24} color="#7C3AED" />
            </View>
            <Text style={styles.quickActionText}>AR Tours</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Demo Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <TouchableOpacity onPress={() => router.push('/demo')}>
            <Text style={styles.seeAllText}>Demo</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.demoCard}
          onPress={() => router.push('/demo')}
        >
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1658967/pexels-photo-1658967.jpeg' }}
            style={styles.demoImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.demoOverlay}
          >
            <View style={styles.demoContent}>
              <Ionicons name="play-circle" size={40} color="#FFFFFF" />
              <Text style={styles.demoTitle}>Interactive Demo</Text>
              <Text style={styles.demoSubtitle}>
                See how TripCraft AI creates amazing itineraries
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Featured Destinations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Destinations</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FEATURED_DESTINATIONS.map((destination, index) => (
            <TouchableOpacity
              key={index}
              style={styles.destinationCard}
              onPress={() => router.push(`/plan?destination=${encodeURIComponent(destination.name)}`)}
            >
              <Image
                source={{ uri: destination.image }}
                style={styles.destinationImage}
              />
              <View style={styles.destinationInfo}>
                <Text style={styles.destinationName}>{destination.name}</Text>
                <View style={styles.destinationStats}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.destinationRating}>{destination.rating}</Text>
                  <Text style={styles.destinationTrips}>({destination.trips} trips)</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI-Powered Features</Text>
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark" size={32} color="#059669" />
            <Text style={styles.featureTitle}>Fact Verified</Text>
            <Text style={styles.featureDescription}>All recommendations are fact-checked with citations</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="refresh" size={32} color="#2563EB" />
            <Text style={styles.featureTitle}>Real-time Updates</Text>
            <Text style={styles.featureDescription}>Live weather, closures, and transport updates</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="download" size={32} color="#7C3AED" />
            <Text style={styles.featureTitle}>Offline Ready</Text>
            <Text style={styles.featureDescription}>Download complete offline packages with maps</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="volume-high" size={32} color="#DC2626" />
            <Text style={styles.featureTitle}>Audio Tours</Text>
            <Text style={styles.featureDescription}>AI-generated immersive storytelling content</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  onboardingBackground: {
    flex: 1,
    width: width,
    height: '100%',
  },
  onboardingOverlay: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  onboardingHeader: {
    alignItems: 'flex-end',
    marginTop: 50,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  onboardingContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  onboardingDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  onboardingFooter: {
    alignItems: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  nextButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: 24,
  },
  planTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
  },
  planTripText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  demoCard: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  demoImage: {
    width: '100%',
    height: '100%',
  },
  demoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  demoContent: {
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  demoSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  destinationCard: {
    width: 200,
    marginRight: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  destinationImage: {
    width: '100%',
    height: 120,
  },
  destinationInfo: {
    padding: 12,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  destinationStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destinationRating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
    marginRight: 8,
  },
  destinationTrips: {
    fontSize: 12,
    color: '#6B7280',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  feature: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});