import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  Camera, 
  Mic, 
  Globe, 
  Calendar, 
  Headphones,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Sparkles,
  Monitor,
  Download,
  Volume2,
  Image as ImageIcon,
  Zap
} from "lucide-react";

const Demo = () => {
  const [currentDemo, setCurrentDemo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSections = [
    {
      id: "planning",
      title: "AI Trip Planning",
      icon: Sparkles,
      color: "text-primary",
      description: "See how our multi-agent AI system creates personalized itineraries",
      features: [
        "Multi-agent AI coordination",
        "Real-time fact verification",
        "Personalized recommendations",
        "Budget optimization"
      ]
    },
    {
      id: "moodboard",
      title: "Visual Inspiration",
      icon: Camera,
      color: "text-secondary",
      description: "Upload travel images and get destination suggestions",
      features: [
        "Image analysis with ResNet-50",
        "Style and vibe detection",
        "Destination matching",
        "Visual preference learning"
      ]
    },
    {
      id: "voice",
      title: "Voice Planning",
      icon: Mic,
      color: "text-success",
      description: "Speak your travel dreams and get instant transcription",
      features: [
        "Free Whisper transcription",
        "Multi-language support",
        "Preference extraction",
        "Natural conversation"
      ]
    },
    {
      id: "realtime",
      title: "Live Updates",
      icon: Monitor,
      color: "text-primary",
      description: "Real-time monitoring and automatic trip adjustments",
      features: [
        "WebSocket live updates",
        "Weather monitoring",
        "Event notifications",
        "Auto-replanning"
      ]
    }
  ];

  const sampleTrip = {
    destination: "Tokyo, Japan",
    duration: "7 days",
    budget: "$3,200",
    travelers: "2 adults",
    confidence: "92%",
    activities: [
      { time: "09:00 AM", activity: "Senso-ji Temple Visit", cost: "$0", location: "Asakusa" },
      { time: "11:30 AM", activity: "Tokyo National Museum", cost: "$12", location: "Ueno" },
      { time: "02:00 PM", activity: "Sushi Making Class", cost: "$85", location: "Shibuya" },
      { time: "07:00 PM", activity: "Robot Restaurant Show", cost: "$65", location: "Shinjuku" }
    ]
  };

  const voiceTranscript = "I want to plan a romantic 7-day trip to Italy with my partner. We love art, great food, and historic sites. Our budget is around three thousand dollars and we're flexible with dates in spring.";

  const extractedPrefs = {
    destination: "Italy",
    duration: "7 days",
    style: "Romantic",
    interests: ["Art", "Food", "History"],
    budget: "$3,000",
    season: "Spring"
  };

  const moodboardResults = [
    { destination: "Santorini, Greece", match: "94%", reason: "White architecture and blue sea imagery" },
    { destination: "Amalfi Coast, Italy", match: "89%", reason: "Coastal romance and scenic views" },
    { destination: "Provence, France", match: "85%", reason: "Rustic charm and natural beauty" }
  ];

  const playDemo = (demoId: string) => {
    setCurrentDemo(demoId);
    setIsPlaying(true);
    
    // Simulate demo playback
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient-hero mb-4">
            TripCraft AI Demo
          </h1>
          <p className="text-xl text-foreground-muted max-w-3xl mx-auto">
            Experience the power of AI-driven travel planning with interactive demos 
            of all our key features
          </p>
        </div>

        {/* Demo Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {demoSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id} className="hover-lift cursor-pointer" onClick={() => playDemo(section.id)}>
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <div className="bg-gradient-primary/10 p-3 rounded-lg inline-block">
                      <Icon className={`h-8 w-8 ${section.color}`} />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                  <p className="text-sm text-foreground-muted mb-4">{section.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={currentDemo === section.id && isPlaying ? "animate-pulse" : ""}
                  >
                    {currentDemo === section.id && isPlaying ? (
                      <>
                        <Pause className="h-3 w-3 mr-1" />
                        Playing...
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Try Demo
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Interactive Demo Tabs */}
        <Tabs defaultValue="planning" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="planning" className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Planning</span>
            </TabsTrigger>
            <TabsTrigger value="moodboard" className="flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Moodboard</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center space-x-2">
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">Voice</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Features</span>
            </TabsTrigger>
          </TabsList>

          {/* Trip Planning Demo */}
          <TabsContent value="planning" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5" />
                  AI Trip Planning in Action
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Input Side */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Sample Input:</h4>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><strong>Destination:</strong> Tokyo, Japan</div>
                        <div><strong>Duration:</strong> 7 days</div>
                        <div><strong>Budget:</strong> $3,200 USD</div>
                        <div><strong>Travelers:</strong> 2 adults</div>
                        <div><strong>Style:</strong> Cultural + Food</div>
                        <div><strong>Pace:</strong> Moderate</div>
                      </div>
                    </div>
                    
                    <Button className="w-full btn-hero" disabled>
                      <Zap className="mr-2 h-4 w-4" />
                      Processing with Multi-Agent AI...
                    </Button>
                  </div>

                  {/* Output Side */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Generated Itinerary:</h4>
                      <Badge className="bg-gradient-primary text-primary-foreground">
                        {sampleTrip.confidence} Match
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {sampleTrip.activities.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <div className="font-medium">{activity.activity}</div>
                            <div className="text-sm text-foreground-muted">
                              {activity.time} • {activity.location}
                            </div>
                          </div>
                          <Badge variant="outline">{activity.cost}</Badge>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">15</div>
                        <div className="text-xs text-foreground-muted">Activities</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-secondary">8</div>
                        <div className="text-xs text-foreground-muted">Restaurants</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-success">12</div>
                        <div className="text-xs text-foreground-muted">Audio Tours</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moodboard Demo */}
          <TabsContent value="moodboard" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="mr-2 h-5 w-5" />
                  Visual Inspiration Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Upload Simulation */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Sample Moodboard Images:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-square bg-gradient-travel rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-white/80" />
                        </div>
                      ))}
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm text-foreground-muted">
                        AI detected: Coastal views, white architecture, romantic settings, Mediterranean style
                      </p>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">AI Destination Suggestions:</h4>
                    <div className="space-y-3">
                      {moodboardResults.map((result, index) => (
                        <div key={index} className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{result.destination}</h5>
                            <Badge className="bg-gradient-primary text-primary-foreground">
                              {result.match}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground-muted">{result.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voice Demo */}
          <TabsContent value="voice" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mic className="mr-2 h-5 w-5" />
                  Voice-to-Trip Planning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Voice Input */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Voice Input:</h4>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Volume2 className="h-5 w-5 text-primary" />
                        <span className="font-medium">Transcription:</span>
                      </div>
                      <p className="text-sm italic">"{voiceTranscript}"</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">94%</div>
                        <div className="text-xs text-foreground-muted">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-secondary">1.2s</div>
                        <div className="text-xs text-foreground-muted">Processing</div>
                      </div>
                    </div>
                  </div>

                  {/* Extracted Preferences */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Extracted Preferences:</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Destination:</span>
                        <Badge variant="outline">{extractedPrefs.destination}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Duration:</span>
                        <Badge variant="outline">{extractedPrefs.duration}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Style:</span>
                        <Badge variant="outline">{extractedPrefs.style}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Budget:</span>
                        <Badge variant="outline">{extractedPrefs.budget}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Season:</span>
                        <Badge variant="outline">{extractedPrefs.season}</Badge>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="flex flex-wrap gap-2">
                        {extractedPrefs.interests.map((interest, index) => (
                          <Badge key={index} className="bg-gradient-primary text-primary-foreground">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Demo */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Real-time Updates */}
              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Monitor className="mr-2 h-5 w-5" />
                    Live Trip Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">Weather Alert</span>
                      </div>
                      <Badge variant="outline">New</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Flight Delay</span>
                      </div>
                      <Badge variant="outline">Resolved</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="text-sm">New Recommendation</span>
                      </div>
                      <Badge variant="outline">Added</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Offline Features */}
              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="mr-2 h-5 w-5" />
                    Offline Packages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">12MB</div>
                        <div className="text-xs text-foreground-muted">Package Size</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-secondary">Complete</div>
                        <div className="text-xs text-foreground-muted">Offline Ready</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Maps & Navigation</span>
                        <Badge variant="outline">✓</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Audio Tours</span>
                        <Badge variant="outline">✓</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Emergency Contacts</span>
                        <Badge variant="outline">✓</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Calendar Events</span>
                        <Badge variant="outline">✓</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <Card className="glass-card max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Experience TripCraft AI?</h3>
              <p className="text-foreground-muted mb-6">
                These demos show just a glimpse of what our AI can do. Start planning your perfect trip today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-hero">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Planning Now
                </Button>
                <Button size="lg" variant="outline">
                  <Camera className="mr-2 h-5 w-5" />
                  Try Moodboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Demo;