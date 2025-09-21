import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import { useTripCraftAPI } from '../../hooks/useTripCraftAPI';
import { TravelPlanRequest } from '../../types/api';

const { width } = Dimensions.get('window');

interface PlanningMode {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string[];
}

const PLANNING_MODES: PlanningMode[] = [
  {
    id: 'text',
    title: 'Classic Planning',
    description: 'Traditional form-based trip planning',
    icon: 'create-outline',
    color: '#4F46E5',
    gradient: ['#4F46E5', '#7C3AED'],
  },
  {
    id: 'voice',
    title: 'Voice Planning',
    description: 'Speak your travel desires naturally',
    icon: 'mic-outline',
    color: '#059669',
    gradient: ['#059669', '#10B981'],
  },
  {
    id: 'moodboard',
    title: 'Mood Board',
    description: 'Upload inspiration images',
    icon: 'images-outline',
    color: '#7C3AED',
    gradient: ['#7C3AED', '#A855F7'],
  },
  {
    id: 'surprise_me',
    title: 'Surprise Me',
    description: 'Let AI pick your perfect destination',
    icon: 'gift-outline',
    color: '#DC2626',
    gradient: ['#DC2626', '#EF4444'],
  },
];

const TRAVEL_STYLES = [
  { id: 'backpacker', label: 'Backpacker', icon: 'trail-sign-outline', color: '#059669' },
  { id: 'comfort', label: 'Comfort', icon: 'bed-outline', color: '#3B82F6' },
  { id: 'luxury', label: 'Luxury', icon: 'diamond-outline', color: '#7C3AED' },
  { id: 'family', label: 'Family', icon: 'people-outline', color: '#F59E0B' },
];

const VIBES = [
  { id: 'cultural', label: 'Cultural', emoji: '🏛️', color: '#8B5CF6' },
  { id: 'adventure', label: 'Adventure', emoji: '🏔️', color: '#059669' },
  { id: 'relaxing', label: 'Relaxing', emoji: '🏖️', color: '#06B6D4' },
  { id: 'romantic', label: 'Romantic', emoji: '💕', color: '#EC4899' },
  { id: 'party', label: 'Party', emoji: '🎉', color: '#F59E0B' },
  { id: 'food', label: 'Foodie', emoji: '🍜', color: '#EF4444' },
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
];

export default function PlanScreen() {
  const [selectedMode, setSelectedMode] = useState<string>('text');
  const [isPlanning, setIsPlanning] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form states
  const [destination, setDestination] = useState('');
  const [origin, setOrigin] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState('2');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [travelStyle, setTravelStyle] = useState('comfort');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  
  // Voice & Moodboard states
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [voiceTranscription, setVoiceTranscription] = useState('');
  const [moodboardAnalysis, setMoodboardAnalysis] = useState<any>(null);

  const api = useTripCraftAPI();

  useEffect(() => {
    setupAudio();
  }, []);

  const setupAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Audio setup failed:', error);
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        // Transcribe voice
        const result = await api.transcribeVoice({ uri } as any);
        if (result.success && result.data) {
          setVoiceTranscription(result.data);
        }
      }
      setRecording(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to process voice recording');
    }
  };

  const selectImages = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        setSelectedImages(result.assets);
        
        // Analyze moodboard
        const imageUris = result.assets.map(asset => asset.uri);
        const analysis = await api.analyzeMoodboard(imageUris);
        if (analysis.success && analysis.data) {
          setMoodboardAnalysis(analysis.data);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze images');
    }
  };

  const toggleVibe = (vibeId: string) => {
    setSelectedVibes(prev => 
      prev.includes(vibeId) 
        ? prev.filter(v => v !== vibeId)
        : [...prev, vibeId]
    );
  };

  const createTripPlan = async () => {
    const planRequest: TravelPlanRequest = {
      mode: selectedMode as 'text' | 'voice' | 'image' | 'multimodal',
      destination,
      origin,
      dates: {
        start: startDate,
        end: endDate,
        flexible: false,
      },
      duration_days: Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24)),
      travelers: parseInt(travelers),
      adults: parseInt(travelers),
      children: 0,
      age_groups: [],
      budget: parseInt(budget) || 0,
      currency,
      budget_flexible: true,
      travel_style: travelStyle as 'backpacker' | 'budget' | 'mid-range' | 'luxury' | 'ultra-luxury',
      vibes: selectedVibes,
      interests: selectedVibes,
      priorities: selectedVibes,
      pace_level: 2,
      multimodal_inputs: selectedMode === 'moodboard' ? selectedImages.map(img => img.uri) : [],
      accessibility_needs: [],
      dietary_restrictions: [],
      previous_visits: false,
      loved_places: '',
      additional_info: voiceTranscription || '',
      include_audio_tour: true,
      include_ar_ready: true,
      realtime_updates: true,
    };
    console.log(planRequest);
    
    const response = await api.createTravelPlan(planRequest);
    
    if (response.success && response.data) {
      // Navigate to trip details
      router.push(`/trip/${response.data.trip_id}`);
    } else {
      console.log(response.error);
      Alert.alert('Error', response.error?.message || 'Failed to create trip plan');
    }
  };

  const getCurrentCurrency = () => {
    return CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  };

  const renderModeSelector = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Choose Your Planning Style</Text>
        <Text style={styles.sectionSubtitle}>How would you like to plan your trip?</Text>
      </View>
      
      <View style={styles.modesGrid}>
        {PLANNING_MODES.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.modeCard,
              selectedMode === mode.id && styles.modeCardSelected
            ]}
            onPress={() => setSelectedMode(mode.id)}
          >
            <LinearGradient
              colors={selectedMode === mode.id ? mode.gradient : ['#F8FAFC', '#F1F5F9']}
              style={styles.modeCardGradient}
            >
              <View style={[
                styles.modeIconContainer,
                { backgroundColor: selectedMode === mode.id ? 'rgba(255,255,255,0.2)' : '#FFFFFF' }
              ]}>
                <Ionicons 
                  name={mode.icon as any} 
                  size={24} 
                  color={selectedMode === mode.id ? '#FFFFFF' : mode.color} 
                />
              </View>
              <Text style={[
                styles.modeTitle,
                { color: selectedMode === mode.id ? '#FFFFFF' : '#111827' }
              ]}>
                {mode.title}
              </Text>
              <Text style={[
                styles.modeDescription,
                { color: selectedMode === mode.id ? 'rgba(255,255,255,0.9)' : '#6B7280' }
              ]}>
                {mode.description}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderVoiceInput = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Voice Planning</Text>
        <Text style={styles.sectionSubtitle}>Tell us about your dream trip</Text>
      </View>
      
      <View style={styles.voiceContainer}>
        <View style={styles.voiceVisualizer}>
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordingActive]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Ionicons 
              name={isRecording ? "stop" : "mic"} 
              size={36} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.pulseRing} />
              <View style={styles.pulseRing2} />
            </View>
          )}
        </View>
        
        <Text style={styles.voiceInstructions}>
          {isRecording ? "Listening... Tap to stop" : "Tap the microphone to start"}
        </Text>
        
        <Text style={styles.voiceHint}>
          Try saying: "I want to visit Japan for 7 days in spring, looking for cultural experiences and great food"
        </Text>

        {voiceTranscription && (
          <View style={styles.transcriptionCard}>
            <View style={styles.transcriptionHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
              <Text style={styles.transcriptionTitle}>Voice Captured</Text>
            </View>
            <Text style={styles.transcriptionText}>{voiceTranscription}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderMoodboardInput = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Visual Inspiration</Text>
        <Text style={styles.sectionSubtitle}>Upload images that inspire your trip</Text>
      </View>
      
      <TouchableOpacity style={styles.uploadButton} onPress={selectImages}>
        <View style={styles.uploadIconContainer}>
          <Ionicons name="cloud-upload-outline" size={32} color="#7C3AED" />
        </View>
        <Text style={styles.uploadButtonText}>Upload Inspiration Images</Text>
        <Text style={styles.uploadButtonSubtext}>Select photos that capture your travel dreams</Text>
        <View style={styles.uploadTags}>
          <View style={styles.uploadTag}>
            <Text style={styles.uploadTagText}>Architecture</Text>
          </View>
          <View style={styles.uploadTag}>
            <Text style={styles.uploadTagText}>Landscapes</Text>
          </View>
          <View style={styles.uploadTag}>
            <Text style={styles.uploadTagText}>Food</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      {selectedImages.length > 0 && (
        <View style={styles.selectedImagesSection}>
          <Text style={styles.selectedImagesTitle}>Selected Images ({selectedImages.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedImages}>
            {selectedImages.map((image, index) => (
              <View key={index} style={styles.selectedImageContainer}>
                <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                >
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {moodboardAnalysis && (
        <View style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <Ionicons name="sparkles" size={20} color="#7C3AED" />
            <Text style={styles.analysisTitle}>AI Analysis Complete</Text>
          </View>
          <Text style={styles.analysisText}>
            Detected vibes: {moodboardAnalysis.analysis.vibes.join(', ')}
          </Text>
          {moodboardAnalysis.suggested_destinations && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.analysisSubtitle}>Suggested Destinations:</Text>
              {moodboardAnalysis.suggested_destinations.map((dest: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.destinationSuggestion}
                  onPress={() => setDestination(dest.name)}
                >
                  <View style={styles.destinationInfo}>
                    <Text style={styles.destinationName}>{dest.name}</Text>
                    <View style={styles.confidenceBar}>
                      <View style={[styles.confidenceFill, { width: `${dest.confidence * 100}%` }]} />
                    </View>
                  </View>
                  <Text style={styles.destinationConfidence}>
                    {Math.round(dest.confidence * 100)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderBasicForm = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trip Details</Text>
        <Text style={styles.sectionSubtitle}>Fill in your travel preferences</Text>
      </View>
      
      {/* Destination & Origin */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          <Ionicons name="location" size={16} color="#374151" /> Destination
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={destination}
            onChangeText={setDestination}
            placeholder="Where do you want to go?"
            placeholderTextColor="#9CA3AF"
          />
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.inputIcon} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          <Ionicons name="home" size={16} color="#374151" /> Departing From
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={origin}
            onChangeText={setOrigin}
            placeholder="Your current location"
            placeholderTextColor="#9CA3AF"
          />
          <Ionicons name="location" size={20} color="#9CA3AF" style={styles.inputIcon} />
        </View>
      </View>

      {/* Dates */}
      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>
            <Ionicons name="calendar" size={16} color="#374151" /> Start Date
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="2024-06-01"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>
            <Ionicons name="calendar" size={16} color="#374151" /> End Date
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="2024-06-07"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </View>

      {/* Travelers & Budget */}
      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>
            <Ionicons name="people" size={16} color="#374151" /> Travelers
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={travelers}
              onChangeText={setTravelers}
              placeholder="2"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>
            <Ionicons name="card" size={16} color="#374151" /> Budget
          </Text>
          <View style={styles.budgetContainer}>
            <TouchableOpacity 
              style={styles.currencySelector}
              onPress={() => setShowCurrencyModal(true)}
            >
              <Text style={styles.currencyText}>{getCurrentCurrency().symbol}</Text>
              <Ionicons name="chevron-down" size={16} color="#6B7280" />
            </TouchableOpacity>
            <TextInput
              style={styles.budgetInput}
              value={budget}
              onChangeText={setBudget}
              placeholder="3000"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </View>

      {/* Travel Style */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          <Ionicons name="diamond" size={16} color="#374151" /> Travel Style
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {TRAVEL_STYLES.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.styleChip,
                travelStyle === style.id && [styles.styleChipSelected, { borderColor: style.color }]
              ]}
              onPress={() => setTravelStyle(style.id)}
            >
              <View style={[
                styles.styleChipIcon,
                { backgroundColor: travelStyle === style.id ? style.color : '#F3F4F6' }
              ]}>
                <Ionicons 
                  name={style.icon as any} 
                  size={16} 
                  color={travelStyle === style.id ? "#FFFFFF" : style.color} 
                />
              </View>
              <Text style={[
                styles.styleChipText,
                travelStyle === style.id && { color: style.color }
              ]}>
                {style.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Vibes */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          <Ionicons name="heart" size={16} color="#374151" /> What vibes are you looking for?
        </Text>
        <Text style={styles.vibesSubtitle}>Select all that apply</Text>
        <View style={styles.vibesContainer}>
          {VIBES.map((vibe) => (
            <TouchableOpacity
              key={vibe.id}
              style={[
                styles.vibeChip,
                selectedVibes.includes(vibe.id) && [
                  styles.vibeChipSelected,
                  { backgroundColor: vibe.color, borderColor: vibe.color }
                ]
              ]}
              onPress={() => toggleVibe(vibe.id)}
            >
              <Text style={styles.vibeEmoji}>{vibe.emoji}</Text>
              <Text style={[
                styles.vibeChipText,
                selectedVibes.includes(vibe.id) && styles.vibeChipTextSelected
              ]}>
                {vibe.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPlanButton = () => (
    <View style={styles.planButtonContainer}>
      <TouchableOpacity
        style={[styles.planButton, api.loading && styles.planButtonDisabled]}
        onPress={createTripPlan}
        disabled={api.loading}
      >
        <LinearGradient
          colors={api.loading ? ['#9CA3AF', '#6B7280'] : ['#4F46E5', '#7C3AED']}
          style={styles.planButtonGradient}
        >
          {api.loading ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.planButtonText}>Creating Your Trip...</Text>
            </>
          ) : (
            <>
              <Ionicons name="rocket" size={20} color="#FFFFFF" />
              <Text style={styles.planButtonText}>Create My Perfect Trip</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
      
      <Text style={styles.planButtonSubtext}>
        AI will analyze your preferences and create a personalized itinerary
      </Text>
    </View>
  );

  const renderCurrencyModal = () => (
    <Modal
      visible={showCurrencyModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCurrencyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          {CURRENCIES.map((curr) => (
            <TouchableOpacity
              key={curr.code}
              style={[styles.currencyOption, currency === curr.code && styles.currencyOptionSelected]}
              onPress={() => {
                setCurrency(curr.code);
                setShowCurrencyModal(false);
              }}
            >
              <Text style={styles.currencySymbol}>{curr.symbol}</Text>
              <View style={styles.currencyDetails}>
                <Text style={styles.currencyCode}>{curr.code}</Text>
                <Text style={styles.currencyLabel}>{curr.label}</Text>
              </View>
              {currency === curr.code && <Ionicons name="checkmark" size={20} color="#4F46E5" />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6', '#60A5FA']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Plan Your Dream Trip</Text>
          <Text style={styles.headerSubtitle}>
            Powered by AI • Personalized for you
          </Text>
        </View>
        
        {/* Decorative elements */}
        <View style={styles.headerDecoration1} />
        <View style={styles.headerDecoration2} />
      </LinearGradient>

      {renderModeSelector()}
      
      {selectedMode === 'voice' && renderVoiceInput()}
      {selectedMode === 'moodboard' && renderMoodboardInput()}
      
      {(selectedMode === 'text' || voiceTranscription || moodboardAnalysis) && renderBasicForm()}
      
      {renderPlanButton()}
      {renderCurrencyModal()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Header Styles
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  headerDecoration1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecoration2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  // Section Styles
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },

  // Mode Selector Styles
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modeCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modeCardSelected: {
    elevation: 6,
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  modeCardGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 140,
  },
  modeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  modeDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Voice Input Styles
  voiceContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  voiceVisualizer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    zIndex: 2,
  },
  recordingActive: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  recordingIndicator: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    transform: [{ scale: 1 }],
  },
  pulseRing2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    transform: [{ scale: 1 }],
  },
  voiceInstructions: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  voiceHint: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  transcriptionCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    width: '100%',
  },
  transcriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  transcriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 8,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },

  // Moodboard Styles
  uploadButton: {
    backgroundColor: '#FAFBFF',
    borderWidth: 2,
    borderColor: '#E0E7FF',
    borderStyle: 'dashed',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 8,
  },
  uploadButtonSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  uploadTags: {
    flexDirection: 'row',
    gap: 8,
  },
  uploadTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  uploadTagText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
  },
  selectedImagesSection: {
    marginTop: 20,
  },
  selectedImagesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  selectedImages: {
    flexDirection: 'row',
  },
  selectedImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisCard: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C3AED',
    marginLeft: 8,
  },
  analysisText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 16,
  },
  suggestionsSection: {
    marginTop: 8,
  },
  analysisSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 12,
  },
  destinationSuggestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    width: 100,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 2,
  },
  destinationConfidence: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },

  // Form Styles
  inputGroup: {
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    position: 'relative',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
    paddingRight: 45,
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: 18,
  },
  budgetContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    overflow: 'hidden',
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F3F4F6',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginRight: 4,
  },
  budgetInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },

  // Style Chips
  horizontalScroll: {
    marginHorizontal: -4,
  },
  styleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 25,
    marginHorizontal: 4,
  },
  styleChipSelected: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
  },
  styleChipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  styleChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  // Vibes
  vibesSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  vibesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vibeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 20,
  },
  vibeChipSelected: {
    borderWidth: 2,
  },
  vibeEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  vibeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  vibeChipTextSelected: {
    color: '#FFFFFF',
  },

  // Plan Button
  planButtonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  planButton: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    marginBottom: 12,
  },
  planButtonDisabled: {
    elevation: 2,
    shadowOpacity: 0.1,
  },
  planButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  planButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  planButtonSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  // Currency Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  currencyOptionSelected: {
    backgroundColor: '#EEF2FF',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4F46E5',
    width: 40,
    textAlign: 'center',
  },
  currencyDetails: {
    flex: 1,
    marginLeft: 16,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  currencyLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
});