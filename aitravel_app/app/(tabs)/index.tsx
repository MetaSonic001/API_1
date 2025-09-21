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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTripCraftAPI } from '../../hooks/useTripCraftAPI';

const { width } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: 'AI-Powered Intelligence',
    description: 'Multi-agent AI system creates personalized itineraries that perfectly match your unique travel style and preferences',
    image: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg',
    icon: 'bulb-outline',
    color: '#059669',
  },
  {
    id: 2,
    title: 'Multimodal Planning',
    description: 'Express your travel dreams through voice, images, or text - our AI understands and responds to all forms of input',
    image: 'https://images.pexels.com/photos/1309594/pexels-photo-1309594.jpeg',
    icon: 'layers-outline',
    color: '#7C3AED',
  },
  {
    id: 3,
    title: 'Immersive Experiences',
    description: 'Step into destinations with AR tours, real-time updates, and interactive guides that bring places to life',
    image: 'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg',
    icon: 'cube-outline',
    color: '#F59E0B',
  },
];

const FEATURED_DESTINATIONS = [
  {
    name: 'Paris, France',
    subtitle: 'City of Lights',
    image: 'https://images.pexels.com/photos/161853/eiffel-tower-paris-france-161853.jpeg',
    rating: 4.9,
    trips: 1250,
    color: '#EC4899',
  },
  {
    name: 'Tokyo, Japan',
    subtitle: 'Modern Metropolis',
    image: 'https://images.pexels.com/photos/161772/tokyo-tower-landmark-japan-161772.jpeg',
    rating: 4.8,
    trips: 980,
    color: '#06B6D4',
  },
  {
    name: 'New York, USA',
    subtitle: 'The Big Apple',
    image: 'https://images.pexels.com/photos/290386/pexels-photo-290386.jpeg',
    rating: 4.7,
    trips: 1850,
    color: '#F59E0B',
  },
  {
    name: 'Bali, Indonesia',
    subtitle: 'Paradise Island',
    image: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg',
    rating: 4.6,
    trips: 1420,
    color: '#10B981',
  },
];

export default function DiscoverScreen() {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [quickStartLoading, setQuickStartLoading] = useState(false);

  const api = useTripCraftAPI();

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

  const handleQuickStart = async (destination: string) => {
    try {
      setQuickStartLoading(true);
      const response = await api.quickStartPlanning(destination);
      if (response.success) {
        router.push(`/plan?destination=${encodeURIComponent(destination)}`);
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to start quick planning');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start quick planning');
    } finally {
      setQuickStartLoading(false);
    }
  };

  const handleSurpriseMe = async () => {
    try {
      setQuickStartLoading(true);
      const response = await api.surpriseMePlanning(2000, 5);
      if (response.success) {
        router.push('/plan?mode=surprise');
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to generate surprise trip');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate surprise trip');
    } finally {
      setQuickStartLoading(false);
    }
  };

  if (isFirstTime) {
    const step = ONBOARDING_STEPS[currentStep];
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ImageBackground
          source={{ uri: step.image }}
          style={styles.onboardingBackground}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
            style={styles.onboardingOverlay}
          >
            <View style={styles.onboardingHeader}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={skipOnboarding}
              >
                <Text style={styles.skipText}>Skip Tour</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.onboardingContent}>
              <View style={[styles.iconContainer, { borderColor: step.color }]}>
                <LinearGradient
                  colors={[`${step.color}20`, `${step.color}40`]}
                  style={styles.iconGradient}
                >
                  <Ionicons name={step.icon as any} size={48} color={step.color} />
                </LinearGradient>
              </View>
              <Text style={styles.onboardingTitle}>{step.title}</Text>
              <Text style={styles.onboardingDescription}>{step.description}</Text>
            </View>

            <View style={styles.onboardingFooter}>
              <View style={styles.stepIndicator}>
                {ONBOARDING_STEPS.map((_, index) => (
                  <View key={index} style={styles.stepDotContainer}>
                    <View
                      style={[
                        styles.stepDot,
                        index === currentStep && styles.activeDot,
                        index < currentStep && styles.completedDot,
                      ]}
                    />
                  </View>
                ))}
              </View>
              
              <View style={styles.onboardingButtons}>
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={nextStep}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FFFFFF', '#F8FAFC']}
                    style={styles.nextButtonGradient}
                  >
                    <Text style={styles.nextButtonText}>
                      {currentStep === ONBOARDING_STEPS.length - 1 ? 'Start Exploring' : 'Continue'}
                    </Text>
                    <Ionicons 
                      name={currentStep === ONBOARDING_STEPS.length - 1 ? 'compass' : 'arrow-forward'} 
                      size={20} 
                      color="#059669" 
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Enhanced Hero Section */}
        <LinearGradient
          colors={['#0F766E', '#059669', '#06B6D4', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroDecorations}>
            <View style={[styles.decorativeShape, styles.shape1]} />
            <View style={[styles.decorativeShape, styles.shape2]} />
            <View style={[styles.decorativeShape, styles.shape3]} />
          </View>
          
          <View style={styles.heroContent}>
            <View style={styles.heroHeader}>
              <Text style={styles.welcomeText}>Welcome to the Future</Text>
              <Text style={styles.heroTitle}>AI Travel Crafting</Text>
              <Text style={styles.heroSubtitle}>
                Experience intelligent trip planning with multimodal inputs, real-time updates, and immersive AR experiences
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.mainCTAButton}
              onPress={() => router.push('/plan')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={styles.ctaGradient}
              >
                <View style={styles.ctaIcon}>
                  <Ionicons name="rocket" size={24} color="#059669" />
                </View>
                <View style={styles.ctaContent}>
                  <Text style={styles.ctaTitle}>Start Planning</Text>
                  <Text style={styles.ctaSubtitle}>Create your perfect trip</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Enhanced Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Quick Start Your Journey</Text>
              <Text style={styles.sectionSubtitle}>Choose your preferred planning method</Text>
            </View>
            <TouchableOpacity style={styles.helpButton}>
              <Ionicons name="help-circle-outline" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={[styles.quickActionCard, styles.primaryAction]}
              onPress={() => router.push('/plan?mode=voice')}
              activeOpacity={0.95}
            >
              <LinearGradient
                colors={['#EEF2FF', '#DBEAFE']}
                style={styles.actionCardGradient}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#4F46E5' }]}>
                  <Ionicons name="mic" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Voice Planning</Text>
                  <Text style={styles.actionDescription}>Speak your travel dreams naturally</Text>
                </View>
                <View style={styles.actionArrow}>
                  <Ionicons name="arrow-forward" size={16} color="#4F46E5" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionCard, styles.secondaryAction]}
              onPress={() => router.push('/plan?mode=moodboard')}
              activeOpacity={0.95}
            >
              <LinearGradient
                colors={['#ECFDF5', '#D1FAE5']}
                style={styles.actionCardGradient}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#059669' }]}>
                  <Ionicons name="images" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Visual Inspiration</Text>
                  <Text style={styles.actionDescription}>Create with mood boards & images</Text>
                </View>
                <View style={styles.actionArrow}>
                  <Ionicons name="arrow-forward" size={16} color="#059669" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.quickActionRow}>
              <TouchableOpacity
                style={[styles.quickActionCard, styles.compactAction, quickStartLoading && styles.actionDisabled]}
                onPress={handleSurpriseMe}
                disabled={quickStartLoading}
                activeOpacity={0.95}
              >
                <View style={[styles.compactActionIcon, { backgroundColor: '#DC2626' }]}>
                  {quickStartLoading ? (
                    <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
                  ) : (
                    <Ionicons name="gift" size={20} color="#FFFFFF" />
                  )}
                </View>
                <View style={styles.compactContent}>
                  <Text style={styles.compactTitle}>Surprise Me</Text>
                  <Text style={styles.compactDesc}>Random adventure</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.quickActionCard, styles.compactAction]}
                onPress={() => router.push('/ar')}
                activeOpacity={0.95}
              >
                <View style={[styles.compactActionIcon, { backgroundColor: '#7C3AED' }]}>
                  <Ionicons name="cube-outline" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.compactContent}>
                  <Text style={styles.compactTitle}>AR Tours</Text>
                  <Text style={styles.compactDesc}>Immersive exploration</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Enhanced Demo Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>See AI in Action</Text>
              <Text style={styles.sectionSubtitle}>Watch intelligent trip planning unfold</Text>
            </View>
            <TouchableOpacity 
              style={styles.demoCtaButton} 
              onPress={() => router.push('/demo')}
            >
              <Ionicons name="play" size={14} color="#FFFFFF" />
              <Text style={styles.demoCtaText}>Watch</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.demoCard}
            onPress={() => router.push('/demo')}
            activeOpacity={0.95}
          >
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1658967/pexels-photo-1658967.jpeg' }}
              style={styles.demoImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
              style={styles.demoOverlay}
            >
              <View style={styles.demoContent}>
                <View style={styles.playButtonContainer}>
                  <LinearGradient
                    colors={['#FFFFFF', '#F8FAFC']}
                    style={styles.playButton}
                  >
                    <Ionicons name="play" size={28} color="#059669" />
                  </LinearGradient>
                </View>
                <View style={styles.demoTextContent}>
                  <Text style={styles.demoTitle}>Interactive Demo Experience</Text>
                  <Text style={styles.demoSubtitle}>
                    Discover how our AI creates personalized itineraries in seconds
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Enhanced Featured Destinations */}


        {/* Enhanced AI Features */}
        <View style={[styles.section, styles.featuresSection]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Powered by Advanced AI</Text>
              <Text style={styles.sectionSubtitle}>Experience next-generation travel planning</Text>
            </View>
          </View>
          
          <View style={styles.featuresContainer}>
            <View style={[styles.featureCard, styles.primaryFeature]}>
              <LinearGradient
                colors={['#ECFDF5', '#D1FAE5']}
                style={styles.featureGradient}
              >
                <View style={styles.featureHeader}>
                  <View style={[styles.featureIconContainer, { backgroundColor: '#059669' }]}>
                    <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.featureTitle}>Fact-Verified Intelligence</Text>
                </View>
                <Text style={styles.featureDescription}>
                  Every recommendation is cross-referenced and verified with trusted sources for accuracy
                </Text>
                <View style={styles.featureBadge}>
                  <Text style={styles.featureBadgeText}>100% Verified</Text>
                </View>
              </LinearGradient>
            </View>
            
            <View style={styles.featureRow}>
              <View style={[styles.featureCard, styles.compactFeature]}>
                <View style={[styles.compactFeatureIcon, { backgroundColor: '#3B82F6' }]}>
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.compactFeatureTitle}>Live Updates</Text>
                <Text style={styles.compactFeatureDesc}>Real-time information</Text>
              </View>
              
              <View style={[styles.featureCard, styles.compactFeature]}>
                <View style={[styles.compactFeatureIcon, { backgroundColor: '#7C3AED' }]}>
                  <Ionicons name="download" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.compactFeatureTitle}>Offline Ready</Text>
                <Text style={styles.compactFeatureDesc}>Complete offline packages</Text>
              </View>
            </View>
            
            <View style={[styles.featureCard, styles.audioFeature]}>
              <LinearGradient
                colors={['#FEF2F2', '#FEE2E2']}
                style={styles.featureGradient}
              >
                <View style={styles.audioFeatureContent}>
                  <View style={[styles.featureIconContainer, { backgroundColor: '#DC2626' }]}>
                    <Ionicons name="volume-high" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.audioFeatureText}>
                    <Text style={styles.featureTitle}>Immersive Audio Tours</Text>
                    <Text style={styles.featureDescription}>AI-generated storytelling that brings destinations to life</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  
  // Onboarding Styles
  onboardingBackground: {
    flex: 1,
    width: width,
    height: '100%',
  },
  onboardingOverlay: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    justifyContent: 'space-between',
  },
  onboardingHeader: {
    alignItems: 'flex-end',
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  onboardingContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 2,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  onboardingDescription: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    opacity: 0.95,
    paddingHorizontal: 10,
    fontWeight: '400',
  },
  onboardingFooter: {
    alignItems: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  stepDotContainer: {
    marginHorizontal: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  completedDot: {
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  onboardingButtons: {
    width: '100%',
    alignItems: 'center',
  },
  nextButton: {
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
  },
  nextButtonText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },

  // Hero Section
  hero: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  heroDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeShape: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  shape1: {
    width: 120,
    height: 120,
    top: 20,
    right: -40,
  },
  shape2: {
    width: 80,
    height: 80,
    bottom: 60,
    left: -20,
  },
  shape3: {
    width: 60,
    height: 60,
    top: 140,
    left: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  heroHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
    fontWeight: '400',
  },
  mainCTAButton: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
  },
  ctaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ctaContent: {
    alignItems: 'flex-start',
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 2,
  },
  ctaSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // Section Styles
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 22,
  },
  seeAllText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  helpButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Quick Actions
  quickActionsContainer: {
    gap: 16,
  },
  quickActionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryAction: {
    // Will be styled by gradient
  },
  secondaryAction: {
    // Will be styled by gradient
  },
  actionCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  actionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  compactAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  compactActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  compactContent: {
    alignItems: 'flex-start',
    padding: 16,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  compactDesc: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  actionDisabled: {
    opacity: 0.6,
  },

  // Demo Section
  demoCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  demoCtaText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  demoCard: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  demoImage: {
    width: '100%',
    height: '100%',
  },
  demoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  demoContent: {
    alignItems: 'center',
  },
  playButtonContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  demoTextContent: {
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  demoSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.95,
    lineHeight: 20,
  },

  // Destinations
  destinationsScrollContainer: {
    paddingRight: 20,
  },
  destinationCard: {
    width: 240,
    marginRight: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  destinationImageContainer: {
    height: 160,
    position: 'relative',
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  destinationImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  destinationTopRow: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  destinationBottomContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  destinationSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.9,
  },
  destinationInfo: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destinationStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  quickPlanButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationDisabled: {
    opacity: 0.6,
  },

  // Features Section
  featuresSection: {
    marginBottom: 0,
  },
  featuresContainer: {
    gap: 16,
  },
  featureCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryFeature: {
    // Styled by gradient
  },
  featureGradient: {
    padding: 20,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 12,
  },
  featureBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  featureBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 12,
  },
  compactFeature: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  compactFeatureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  compactFeatureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'center',
  },
  compactFeatureDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  audioFeature: {
    // Styled by gradient
  },
  audioFeatureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioFeatureText: {
    flex: 1,
  },

  // CTA Section
  ctaSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  ctaContainer: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  ctaDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryCtaButton: {
    flex: 2,
    borderRadius: 16,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
  },
  primaryCtaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryCtaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  secondaryCtaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
});