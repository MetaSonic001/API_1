import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface DemoStep {
  id: number;
  title: string;
  description: string;
  image: string;
  action: string;
  features: string[];
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    title: 'Smart Input Methods',
    description: 'Choose how you want to plan your trip - voice, images, or traditional text input',
    image: 'https://images.pexels.com/photos/1058959/pexels-photo-1058959.jpeg',
    action: 'Try Voice Planning',
    features: ['Voice Recognition', 'Mood Board Analysis', 'Text Planning', 'Quick Start'],
  },
  {
    id: 2,
    title: 'AI Travel Planning',
    description: 'Our multi-agent AI system creates personalized itineraries based on your preferences',
    image: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg',
    action: 'See AI in Action',
    features: ['Multi-Agent System', 'Personalization', 'Real-time Optimization', 'Fact Verification'],
  },
  {
    id: 3,
    title: 'Real-time Updates',
    description: 'Stay informed with live weather, transport delays, and venue closures',
    image: 'https://images.pexels.com/photos/1309594/pexels-photo-1309594.jpeg',
    action: 'View Live Updates',
    features: ['Weather Alerts', 'Transport Updates', 'Venue Status', 'Auto Re-planning'],
  },
  {
    id: 4,
    title: 'AR Tours & Audio',
    description: 'Experience destinations through augmented reality and immersive audio tours',
    image: 'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg',
    action: 'Try AR Experience',
    features: ['3D Overlays', 'Audio Tours', 'Smart Navigation', 'Photo Mode'],
  },
  {
    id: 5,
    title: 'Offline & Booking',
    description: 'Download offline packages and book your entire trip with one tap',
    image: 'https://images.pexels.com/photos/1658967/pexels-photo-1658967.jpeg',
    action: 'Download Demo',
    features: ['Offline Maps', 'Demo Bookings', 'Calendar Export', 'Trip Sharing'],
  },
];

const DEMO_FEATURES = [
  {
    icon: 'brain-outline',
    title: 'AI-Powered Planning',
    description: 'Multi-agent system with specialized travel agents',
    color: '#2563EB',
  },
  {
    icon: 'mic-outline',
    title: 'Multimodal Input',
    description: 'Voice, images, and text planning options',
    color: '#059669',
  },
  {
    icon: 'refresh-outline',
    title: 'Real-time Updates',
    description: 'Live monitoring and automatic replanning',
    color: '#F59E0B',
  },
  {
    icon: 'camera-outline',
    title: 'AR Experience',
    description: 'Immersive tours with 3D visualization',
    color: '#7C3AED',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Fact Verified',
    description: 'All recommendations backed by citations',
    color: '#DC2626',
  },
  {
    icon: 'download-outline',
    title: 'Offline Ready',
    description: 'Complete packages for offline use',
    color: '#0891B2',
  },
];

export default function DemoScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        nextStep();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentStep]);

  const nextStep = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: currentStep < DEMO_STEPS.length - 1 ? currentStep + 1 : 0,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentStep(prev => prev < DEMO_STEPS.length - 1 ? prev + 1 : 0);
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    Animated.timing(slideAnim, {
      toValue: stepIndex,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const startDemo = () => {
    setIsPlaying(!isPlaying);
  };

  const handleActionPress = (step: DemoStep) => {
    switch (step.action) {
      case 'Try Voice Planning':
        router.push('/plan?mode=voice');
        break;
      case 'Try AR Experience':
        router.push('/ar');
        break;
      case 'See AI in Action':
        router.push('/plan');
        break;
      default:
        router.push('/plan');
    }
  };

  const currentDemoStep = DEMO_STEPS[currentStep];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#7C3AED', '#6D28D9']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interactive Demo</Text>
        <Text style={styles.headerSubtitle}>
          See how TripCraft AI creates amazing travel experiences
        </Text>
      </LinearGradient>

      {/* Demo Player */}
      <View style={styles.demoPlayer}>
        <Animated.View
          style={[
            styles.demoContent,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, DEMO_STEPS.length - 1],
                    outputRange: [0, -(DEMO_STEPS.length - 1) * width],
                  }),
                },
              ],
            },
          ]}
        >
          <Image
            source={{ uri: currentDemoStep.image }}
            style={styles.demoImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.demoImageOverlay}
          >
            <View style={styles.demoImageContent}>
              <Text style={styles.demoStepTitle}>{currentDemoStep.title}</Text>
              <Text style={styles.demoStepDescription}>{currentDemoStep.description}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Demo Controls */}
        <View style={styles.demoControls}>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={startDemo}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          
          <View style={styles.stepIndicators}>
            {DEMO_STEPS.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.stepIndicator,
                  index === currentStep && styles.activeStepIndicator,
                ]}
                onPress={() => goToStep(index)}
              />
            ))}
          </View>
          
          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Current Step Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Step {currentStep + 1}: {currentDemoStep.title}</Text>
        <Text style={styles.sectionDescription}>{currentDemoStep.description}</Text>
        
        <View style={styles.featuresGrid}>
          {currentDemoStep.features.map((feature, index) => (
            <View key={index} style={styles.featureChip}>
              <Text style={styles.featureChipText}>{feature}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleActionPress(currentDemoStep)}
        >
          <Text style={styles.actionButtonText}>{currentDemoStep.action}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Key Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Features</Text>
        <View style={styles.featuresContainer}>
          {DEMO_FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                <Ionicons name={feature.icon as any} size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Demo Journey */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Complete Demo Journey</Text>
        <View style={styles.journeyContainer}>
          {DEMO_STEPS.map((step, index) => (
            <TouchableOpacity
              key={step.id}
              style={[
                styles.journeyStep,
                index === currentStep && styles.activeJourneyStep,
              ]}
              onPress={() => goToStep(index)}
            >
              <View style={styles.journeyStepNumber}>
                <Text style={styles.journeyStepNumberText}>{step.id}</Text>
              </View>
              <View style={styles.journeyStepContent}>
                <Text style={styles.journeyStepTitle}>{step.title}</Text>
                <Text style={styles.journeyStepDescription}>{step.description}</Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={index === currentStep ? "#7C3AED" : "#9CA3AF"} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Call to Action */}
      <View style={styles.ctaSection}>
        <LinearGradient
          colors={['#2563EB', '#1D4ED8']}
          style={styles.ctaCard}
        >
          <Text style={styles.ctaTitle}>Ready to Plan Your Trip?</Text>
          <Text style={styles.ctaDescription}>
            Experience the full power of TripCraft AI and create your perfect itinerary
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/plan')}
          >
            <Ionicons name="rocket" size={20} color="#2563EB" />
            <Text style={styles.ctaButtonText}>Start Planning Now</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </ScrollView>
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
    paddingBottom: 32,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  demoPlayer: {
    marginHorizontal: 24,
    marginVertical: 24,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  demoContent: {
    height: 300,
    position: 'relative',
  },
  demoImage: {
    width: '100%',
    height: '100%',
  },
  demoImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 24,
  },
  demoImageContent: {
    marginBottom: 20,
  },
  demoStepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  demoStepDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 24,
  },
  demoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: '#7C3AED',
  },
  stepIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  activeStepIndicator: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  nextButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  featureChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  featureChipText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  journeyContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 4,
  },
  journeyStep: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  activeJourneyStep: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  journeyStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  journeyStepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  journeyStepContent: {
    flex: 1,
  },
  journeyStepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  journeyStepDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  ctaCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  ctaButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});