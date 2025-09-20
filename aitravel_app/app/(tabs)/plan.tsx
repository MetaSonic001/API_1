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
import { TripCraftAPI } from '../../services/TripCraftAPI';

const { width } = Dimensions.get('window');

interface PlanningMode {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const PLANNING_MODES: PlanningMode[] = [
  {
    id: 'text',
    title: 'Classic Planning',
    description: 'Traditional form-based trip planning',
    icon: 'create-outline',
    color: '#2563EB',
  },
  {
    id: 'voice',
    title: 'Voice Planning',
    description: 'Speak your travel desires naturally',
    icon: 'mic-outline',
    color: '#059669',
  },
  {
    id: 'moodboard',
    title: 'Mood Board',
    description: 'Upload inspiration images',
    icon: 'images-outline',
    color: '#7C3AED',
  },
  {
    id: 'surprise_me',
    title: 'Surprise Me',
    description: 'Let AI pick your perfect destination',
    icon: 'gift-outline',
    color: '#DC2626',
  },
];

const TRAVEL_STYLES = [
  { id: 'backpacker', label: 'Backpacker', icon: 'backspace-outline' },
  { id: 'comfort', label: 'Comfort', icon: 'bed-outline' },
  { id: 'luxury', label: 'Luxury', icon: 'diamond-outline' },
  { id: 'family', label: 'Family', icon: 'people-outline' },
];

const VIBES = [
  { id: 'cultural', label: 'Cultural', emoji: '🏛️' },
  { id: 'adventure', label: 'Adventure', emoji: '🏔️' },
  { id: 'relaxing', label: 'Relaxing', emoji: '🏖️' },
  { id: 'romantic', label: 'Romantic', emoji: '💕' },
  { id: 'party', label: 'Party', emoji: '🎉' },
  { id: 'food', label: 'Foodie', emoji: '🍜' },
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
  
  // Voice & Moodboard states
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [voiceTranscription, setVoiceTranscription] = useState('');
  const [moodboardAnalysis, setMoodboardAnalysis] = useState<any>(null);

  const api = new TripCraftAPI();

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
        const result = await api.transcribeVoice(uri);
        setVoiceTranscription(result.transcription);
        
        // Auto-fill form with extracted preferences
        if (result.extracted_preferences) {
          const prefs = result.extracted_preferences;
          if (prefs.destination) setDestination(prefs.destination);
          if (prefs.budget) setBudget(prefs.budget.toString());
          if (prefs.duration) {
            // Calculate end date based on duration
            const start = new Date();
            const end = new Date(start);
            end.setDate(start.getDate() + parseInt(prefs.duration.replace(/\D/g, '')));
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(end.toISOString().split('T')[0]);
          }
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
        const analysis = await api.analyzeMoodboard(result.assets);
        setMoodboardAnalysis(analysis);
        
        // Auto-suggest destinations
        if (analysis.suggested_destinations && analysis.suggested_destinations.length > 0) {
          setDestination(analysis.suggested_destinations[0].name);
        }
        
        // Set vibes based on analysis
        if (analysis.analysis.vibes) {
          setSelectedVibes(analysis.analysis.vibes);
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
    try {
      setIsPlanning(true);
      
      const planRequest = {
        mode: selectedMode,
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
        budget: parseInt(budget),
        currency,
        budget_flexible: true,
        travel_style: travelStyle,
        vibes: selectedVibes,
        interests: selectedVibes,
        priorities: selectedVibes,
        pace_level: 2,
        accessibility_needs: [],
        dietary_restrictions: [],
        include_audio_tour: true,
        include_ar_ready: true,
        realtime_updates: true,
        include_verification: true,
        include_offline_package: true,
        calendar_export: true,
      };

      const tripPlan = await api.createTripPlan(planRequest);
      
      // Navigate to trip details
      router.push(`/trip/${tripPlan.trip_id}`);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to create trip plan');
    } finally {
      setIsPlanning(false);
    }
  };

  const renderModeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Choose Planning Mode</Text>
      <View style={styles.modesGrid}>
        {PLANNING_MODES.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.modeCard,
              selectedMode === mode.id && { borderColor: mode.color, borderWidth: 2 }
            ]}
            onPress={() => setSelectedMode(mode.id)}
          >
            <View style={[styles.modeIcon, { backgroundColor: mode.color }]}>
              <Ionicons name={mode.icon as any} size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.modeTitle}>{mode.title}</Text>
            <Text style={styles.modeDescription}>{mode.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderVoiceInput = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Voice Planning</Text>
      <View style={styles.voiceContainer}>
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingActive]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Ionicons 
            name={isRecording ? "stop" : "mic"} 
            size={32} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
        <Text style={styles.voiceInstructions}>
          {isRecording ? "Tap to stop recording" : "Tap to start recording"}
        </Text>
        {voiceTranscription && (
          <View style={styles.transcriptionCard}>
            <Text style={styles.transcriptionTitle}>What we heard:</Text>
            <Text style={styles.transcriptionText}>{voiceTranscription}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderMoodboardInput = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mood Board Planning</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={selectImages}>
        <Ionicons name="cloud-upload-outline" size={32} color="#2563EB" />
        <Text style={styles.uploadButtonText}>Upload Inspiration Images</Text>
        <Text style={styles.uploadButtonSubtext}>Select photos that inspire your trip</Text>
      </TouchableOpacity>
      
      {selectedImages.length > 0 && (
        <View style={styles.selectedImages}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedImages.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image.uri }}
                style={styles.selectedImage}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {moodboardAnalysis && (
        <View style={styles.analysisCard}>
          <Text style={styles.analysisTitle}>AI Analysis</Text>
          <Text style={styles.analysisText}>
            Detected vibes: {moodboardAnalysis.analysis.vibes.join(', ')}
          </Text>
          {moodboardAnalysis.suggested_destinations && (
            <View>
              <Text style={styles.analysisSubtitle}>Suggested Destinations:</Text>
              {moodboardAnalysis.suggested_destinations.map((dest: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.destinationSuggestion}
                  onPress={() => setDestination(dest.name)}
                >
                  <Text style={styles.destinationName}>{dest.name}</Text>
                  <Text style={styles.destinationConfidence}>
                    {Math.round(dest.confidence * 100)}% match
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
      <Text style={styles.sectionTitle}>Trip Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Destination</Text>
        <TextInput
          style={styles.textInput}
          value={destination}
          onChangeText={setDestination}
          placeholder="Where do you want to go?"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Origin</Text>
        <TextInput
          style={styles.textInput}
          value={origin}
          onChangeText={setOrigin}
          placeholder="Where are you traveling from?"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Start Date</Text>
          <TextInput
            style={styles.textInput}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="2024-06-01"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>End Date</Text>
          <TextInput
            style={styles.textInput}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="2024-06-07"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Travelers</Text>
          <TextInput
            style={styles.textInput}
            value={travelers}
            onChangeText={setTravelers}
            placeholder="2"
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Budget ({currency})</Text>
          <TextInput
            style={styles.textInput}
            value={budget}
            onChangeText={setBudget}
            placeholder="3000"
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Travel Style */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Travel Style</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TRAVEL_STYLES.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.styleChip,
                travelStyle === style.id && styles.styleChipSelected
              ]}
              onPress={() => setTravelStyle(style.id)}
            >
              <Ionicons 
                name={style.icon as any} 
                size={16} 
                color={travelStyle === style.id ? "#FFFFFF" : "#374151"} 
              />
              <Text style={[
                styles.styleChipText,
                travelStyle === style.id && styles.styleChipTextSelected
              ]}>
                {style.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Vibes */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>What vibes are you looking for?</Text>
        <View style={styles.vibesContainer}>
          {VIBES.map((vibe) => (
            <TouchableOpacity
              key={vibe.id}
              style={[
                styles.vibeChip,
                selectedVibes.includes(vibe.id) && styles.vibeChipSelected
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
        style={styles.planButton}
        onPress={createTripPlan}
        disabled={isPlanning}
      >
        {isPlanning ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="rocket" size={20} color="#FFFFFF" />
            <Text style={styles.planButtonText}>Create My Trip</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#2563EB', '#1D4ED8']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Plan Your Trip</Text>
        <Text style={styles.headerSubtitle}>
          AI-powered planning with multimodal inputs
        </Text>
      </LinearGradient>

      {renderModeSelector()}
      
      {selectedMode === 'voice' && renderVoiceInput()}
      {selectedMode === 'moodboard' && renderMoodboardInput()}
      
      {(selectedMode === 'text' || voiceTranscription || moodboardAnalysis) && renderBasicForm()}
      
      {renderPlanButton()}
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
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modeCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  modeDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  voiceContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  recordingActive: {
    backgroundColor: '#DC2626',
  },
  voiceInstructions: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  transcriptionCard: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    width: '100%',
  },
  transcriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 8,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  uploadButton: {
    backgroundColor: '#F8FAFC',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 12,
  },
  uploadButtonSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  selectedImages: {
    marginTop: 16,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  analysisCard: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 12,
  },
  analysisSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8,
  },
  destinationSuggestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
  },
  destinationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  destinationConfidence: {
    fontSize: 12,
    color: '#059669',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  styleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 12,
  },
  styleChipSelected: {
    backgroundColor: '#2563EB',
  },
  styleChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 6,
  },
  styleChipTextSelected: {
    color: '#FFFFFF',
  },
  vibesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  vibeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  vibeChipSelected: {
    backgroundColor: '#2563EB',
  },
  vibeEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  vibeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  vibeChipTextSelected: {
    color: '#FFFFFF',
  },
  planButtonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  planButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  planButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});