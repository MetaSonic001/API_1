import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api, VoiceTranscription } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  Loader2,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Volume2,
  Activity
} from "lucide-react";

const VoicePlanner = () => {
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [transcription, setTranscription] = useState<VoiceTranscription | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout>();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording Started",
        description: "Speak clearly about your travel plans and preferences.",
      });
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      toast({
        title: "Recording Stopped",
        description: "Click 'Analyze Voice' to process your travel request.",
      });
    }
  };

  const analyzeVoice = async () => {
    if (!audioBlob) {
      toast({
        title: "No Recording",
        description: "Please record your voice first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const result = await api.transcribeVoice(audioBlob, 'en');
      setTranscription(result);

      toast({
        title: "Voice Analyzed!",
        description: `Transcribed with ${Math.round(result.confidence * 100)}% confidence.`,
      });
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to analyze voice recording. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gradient-hero mb-4">
            Voice Trip Planner
          </h1>
          <p className="text-xl text-foreground-muted max-w-3xl mx-auto">
            Simply speak your travel desires and let our AI understand your needs to create 
            the perfect itinerary
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recording Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mic className="mr-2 h-5 w-5" />
                Voice Recording
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recording Interface */}
              <div className="text-center space-y-6">
                {/* Recording Button */}
                <div className="relative">
                  <Button
                    size="lg"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-32 h-32 rounded-full transition-all duration-300 ${
                      isRecording 
                        ? 'bg-destructive hover:bg-destructive/90 animate-pulse-glow' 
                        : 'btn-hero shadow-glow'
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="h-12 w-12" />
                    ) : (
                      <Mic className="h-12 w-12" />
                    )}
                  </Button>
                  
                  {isRecording && (
                    <div className="absolute -inset-4 border-4 border-destructive/30 rounded-full animate-ping"></div>
                  )}
                </div>

                {/* Recording Status */}
                {isRecording && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-destructive">
                      <Activity className="h-4 w-4 animate-pulse" />
                      <span className="font-medium">Recording...</span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-primary">
                      {formatTime(recordingTime)}
                    </div>
                  </div>
                )}

                {!isRecording && !audioBlob && (
                  <div className="text-foreground-muted">
                    <p className="mb-2">Tap the microphone to start recording</p>
                    <p className="text-sm">
                      Try saying something like: "I want a 5-day romantic trip to Italy with great food and art museums, budget around $2000"
                    </p>
                  </div>
                )}

                {/* Audio Playback */}
                {audioBlob && !isRecording && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        variant="outline"
                        onClick={playRecording}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Play Recording
                      </Button>
                      <div className="text-sm text-foreground-muted">
                        Duration: {formatTime(recordingTime)}
                      </div>
                    </div>
                    
                    <Button
                      onClick={analyzeVoice}
                      disabled={isProcessing}
                      className="w-full btn-hero"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing Voice...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Analyze Voice
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Recording Tips */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Recording Tips
                </h4>
                <ul className="text-sm text-foreground-muted space-y-1">
                  <li>• Speak clearly and at a normal pace</li>
                  <li>• Mention destination, duration, budget, and interests</li>
                  <li>• Include any special requirements or preferences</li>
                  <li>• Keep recordings under 2 minutes for best results</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-6">
            {transcription ? (
              <>
                {/* Transcription */}
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Transcription</span>
                      <Badge variant="secondary">
                        {Math.round(transcription.confidence * 100)}% Confidence
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                      <p className="text-foreground italic">
                        "{transcription.transcription}"
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-foreground-muted">Language:</span>
                        <span className="ml-2 font-medium">{transcription.language_detected}</span>
                      </div>
                      <div>
                        <span className="text-foreground-muted">Processing:</span>
                        <span className="ml-2 font-medium">{transcription.processing_time_ms}ms</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Extracted Preferences */}
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle>Extracted Travel Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transcription.extracted_preferences.destination && (
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">Destination</div>
                            <div className="text-foreground-muted">
                              {transcription.extracted_preferences.destination}
                            </div>
                          </div>
                        </div>
                      )}

                      {transcription.extracted_preferences.duration && (
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-secondary" />
                          <div>
                            <div className="font-medium">Duration</div>
                            <div className="text-foreground-muted">
                              {transcription.extracted_preferences.duration}
                            </div>
                          </div>
                        </div>
                      )}

                      {transcription.extracted_preferences.budget && (
                        <div className="flex items-center space-x-3">
                          <DollarSign className="h-5 w-5 text-success" />
                          <div>
                            <div className="font-medium">Budget</div>
                            <div className="text-foreground-muted">
                              ${transcription.extracted_preferences.budget} {transcription.extracted_preferences.currency}
                            </div>
                          </div>
                        </div>
                      )}

                      {transcription.extracted_preferences.activities.length > 0 && (
                        <div className="flex items-start space-x-3">
                          <Users className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium mb-2">Interests & Activities</div>
                            <div className="flex flex-wrap gap-2">
                              {transcription.extracted_preferences.activities.map((activity, index) => (
                                <Badge key={index} variant="outline">
                                  {activity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <Button className="w-full btn-hero">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Create Trip from Voice
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Processing Stats */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {transcription.processing_time_ms}ms
                        </div>
                        <div className="text-sm text-foreground-muted">Processing Time</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-secondary">
                          {Math.round(transcription.confidence * 100)}%
                        </div>
                        <div className="text-sm text-foreground-muted">Accuracy</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Placeholder */
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <Mic className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Record Your Travel Plans</h3>
                  <p className="text-foreground-muted mb-4">
                    Speak naturally about where you want to go, what you want to do, 
                    and any preferences you have.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 text-left">
                    <h4 className="font-medium mb-2">Example:</h4>
                    <p className="text-sm text-foreground-muted italic">
                      "I'd like to plan a romantic 7-day honeymoon to Japan in spring. 
                      We love culture, great food, and beautiful scenery. Our budget is around $4000."
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoicePlanner;