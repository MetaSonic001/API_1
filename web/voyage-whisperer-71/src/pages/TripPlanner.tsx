import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { VoiceInput } from "@/components/VoiceInput";
import { SmartSuggestions } from "@/components/SmartSuggestions";
import { OneClickTrip } from "@/components/OneClickTrip";
import { api, TravelPlanRequest, TravelPlanResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Sparkles, 
  Loader2,
  Globe,
  Plane,
  Camera,
  Music,
  Utensils,
  Mountain,
  Building,
  Heart,
  Clock,
  ChevronDown,
  Wand2,
  Settings,
  Mic
} from "lucide-react";

const TripPlanner = () => {
  const { toast } = useToast();
  const [isPlanning, setIsPlanning] = useState(false);
  const [isCurating, setIsCurating] = useState(false);
  const [tripPlan, setTripPlan] = useState<TravelPlanResponse | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState<Partial<TravelPlanRequest>>({
    mode: "text",
    destination: "",
    origin: "",
    dates: {
      start: "",
      end: "",
      flexible: false
    },
    duration_days: 7,
    travelers: 2,
    adults: 2,
    children: 0,
    budget: 2000,
    currency: "USD",
    budget_flexible: true,
    travel_style: "comfort",
    vibes: [],
    interests: [],
    priorities: [],
    pace_level: 2,
    accessibility_needs: [],
    dietary_restrictions: [],
    include_audio_tour: true,
    include_ar_ready: false,
    realtime_updates: true
  });

  const vibeOptions = [
    { id: "adventure", label: "Adventure", icon: Mountain },
    { id: "cultural", label: "Cultural", icon: Building },
    { id: "romantic", label: "Romantic", icon: Heart },
    { id: "relaxation", label: "Relaxation", icon: Globe },
    { id: "culinary", label: "Culinary", icon: Utensils },
    { id: "nightlife", label: "Nightlife", icon: Music },
    { id: "photography", label: "Photography", icon: Camera },
  ];

  const handleVibeToggle = (vibeId: string) => {
    const currentVibes = formData.vibes || [];
    const updatedVibes = currentVibes.includes(vibeId)
      ? currentVibes.filter(v => v !== vibeId)
      : [...currentVibes, vibeId];
    
    setFormData(prev => ({ ...prev, vibes: updatedVibes }));
  };

  const handleAICuration = async () => {
    setIsCurating(true);
    
    try {
      // AI-powered smart defaults based on current inputs or random selection
      const destinations = ["Paris, France", "Tokyo, Japan", "Barcelona, Spain", "Bali, Indonesia", "New York, USA", "Rome, Italy"];
      const randomDestination = destinations[Math.floor(Math.random() * destinations.length)];
      const travelStyles: ("backpacker" | "comfort" | "luxury")[] = ["backpacker", "comfort", "luxury"];
      const randomStyle = travelStyles[Math.floor(Math.random() * travelStyles.length)];
      
      const smartData: Partial<TravelPlanRequest> = {
        destination: formData.destination || randomDestination,
        duration_days: formData.duration_days || (3 + Math.floor(Math.random() * 10)),
        budget: formData.budget || (1000 + Math.floor(Math.random() * 3000)),
        travelers: formData.travelers || (1 + Math.floor(Math.random() * 4)),
        adults: formData.adults || (1 + Math.floor(Math.random() * 4)),
        travel_style: formData.travel_style || randomStyle,
        vibes: formData.vibes?.length ? formData.vibes : 
               ["cultural", "adventure", "relaxation", "culinary"].slice(0, 1 + Math.floor(Math.random() * 2)),
        pace_level: formData.pace_level || (1 + Math.floor(Math.random() * 3)),
        include_audio_tour: true,
        include_ar_ready: Math.random() > 0.5,
        realtime_updates: true
      };
      
      setFormData(prev => ({ ...prev, ...smartData }));
      
      toast({
        title: "AI Curation Complete!",
        description: "Smart defaults have been applied. Review and adjust as needed.",
      });
    } catch (error) {
      toast({
        title: "Curation Error",
        description: "Failed to curate trip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCurating(false);
    }
  };

  const handlePlanTrip = async () => {
    if (!formData.destination) {
      toast({
        title: "Missing Information",
        description: "Please enter a destination to plan your trip.",
        variant: "destructive",
      });
      return;
    }

    setIsPlanning(true);
    
    try {
      const plan = await api.createTravelPlan(formData as TravelPlanRequest);
      setTripPlan(plan);
      
      toast({
        title: "Trip Planned Successfully!",
        description: `Your ${plan.total_duration_days}-day trip to ${plan.destination_info.name} is ready.`,
      });
    } catch (error) {
      toast({
        title: "Planning Error",
        description: "Failed to create trip plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlanning(false);
    }
  };

  if (tripPlan) {
    return (
      <div className="min-h-screen pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4">
          {/* Trip Header */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => setTripPlan(null)}
              className="mb-4"
            >
              ← Plan Another Trip
            </Button>
            
            <div className="glass-card p-8 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gradient-hero">
                  {tripPlan.destination_info.name}
                </h1>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {tripPlan.total_duration_days} Days
                </Badge>
              </div>
              
              <p className="text-lg text-foreground-muted mb-6">
                {tripPlan.summary}
              </p>
              
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    ${tripPlan.estimated_budget.total}
                  </div>
                  <div className="text-sm text-foreground-muted">Total Budget</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {tripPlan.confidence_score * 100}%
                  </div>
                  <div className="text-sm text-foreground-muted">Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {tripPlan.daily_plans.length}
                  </div>
                  <div className="text-sm text-foreground-muted">Daily Plans</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {tripPlan.audio_tour_segments.length}
                  </div>
                  <div className="text-sm text-foreground-muted">Audio Tours</div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Plans */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center">
              <Calendar className="mr-2 h-6 w-6" />
              Daily Itinerary
            </h2>
            
            {tripPlan.daily_plans.map((day, index) => (
              <Card key={index} className="hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{day.theme}</span>
                    <Badge variant="outline">
                      Day {index + 1} • ${day.total_cost}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {day.morning.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-primary mb-2">Morning</h4>
                        {day.morning.map((activity, i) => (
                          <div key={i} className="mb-3 p-3 bg-muted rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{activity.activity}</span>
                              <span className="text-sm text-foreground-muted">
                                ${activity.cost}
                              </span>
                            </div>
                            <div className="text-sm text-foreground-muted mb-1">
                              {activity.start_time} - {activity.end_time}
                            </div>
                            <p className="text-sm">{activity.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {day.afternoon.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-secondary mb-2">Afternoon</h4>
                        {/* Similar structure for afternoon activities */}
                      </div>
                    )}
                    
                    {day.evening.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-success mb-2">Evening</h4>
                        {/* Similar structure for evening activities */}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Button className="btn-hero">
              <Calendar className="mr-2 h-4 w-4" />
              Export Calendar
            </Button>
            <Button variant="outline" onClick={() => api.downloadOfflinePackage(tripPlan.trip_id)}>
              <Globe className="mr-2 h-4 w-4" />
              Download Offline
            </Button>
            <Button variant="outline">
              <Plane className="mr-2 h-4 w-4" />
              Book Activities
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gradient-hero mb-4">
            Plan Your Perfect Trip
          </h1>
          <p className="text-xl text-foreground-muted mb-6">
            Tell us about your dream destination and let our AI create your personalized itinerary
          </p>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={handleAICuration}
              disabled={isCurating}
              className="btn-hero"
              size="lg"
            >
              {isCurating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Curating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Curate with AI
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '/voice-planner'}
            >
              <Mic className="mr-2 h-5 w-5" />
              Use Voice Instead
            </Button>
          </div>
        </div>

        {/* One-Click Trip Planning */}
        <div className="mb-10">
          <OneClickTrip onTripGenerated={setTripPlan} />
        </div>

        <Card className="glass-card trip-planner-form">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Destination & Basic Info - Enhanced with Voice & Suggestions */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      Destination
                    </span>
                    <div className="flex items-center space-x-2">
                      <SmartSuggestions 
                        type="destination" 
                        onSelect={(value) => setFormData(prev => ({ ...prev, destination: value as string }))}
                      />
                      <VoiceInput 
                        onResult={(text) => setFormData(prev => ({ ...prev, destination: text }))}
                        placeholder="destination"
                      />
                    </div>
                  </Label>
                  <Input
                    placeholder="Where do you want to go?"
                    value={formData.destination}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    className="text-lg"
                  />
                </div>
                <div>
                  <Label className="text-base font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center">
                      <Plane className="mr-2 h-4 w-4" />
                      Departing From
                    </span>
                    <VoiceInput 
                      onResult={(text) => setFormData(prev => ({ ...prev, origin: text }))}
                      placeholder="origin city"
                    />
                  </Label>
                  <Input
                    placeholder="Your home city (optional)"
                    value={formData.origin}
                    onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                  />
                </div>
              </div>

              {/* Dates & Duration */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-base font-medium mb-2">Start Date</Label>
                  <Input
                    type="date"
                    value={formData.dates?.start}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dates: { ...prev.dates!, start: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label className="text-base font-medium mb-2">End Date</Label>
                  <Input
                    type="date"
                    value={formData.dates?.end}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dates: { ...prev.dates!, end: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label className="text-base font-medium mb-2 flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Duration (days)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.duration_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_days: Number(e.target.value) }))}
                  />
                </div>
              </div>

              {/* Essential Details */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-base font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Duration (days)
                    </span>
                    <SmartSuggestions 
                      type="duration" 
                      onSelect={(value) => setFormData(prev => ({ ...prev, duration_days: value as number }))}
                    />
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.duration_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_days: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label className="text-base font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Budget ({formData.currency})
                    </span>
                    <SmartSuggestions 
                      type="budget" 
                      onSelect={(value) => setFormData(prev => ({ ...prev, budget: value as number }))}
                    />
                  </Label>
                  <Input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label className="text-base font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Travelers
                    </span>
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.travelers}
                    onChange={(e) => setFormData(prev => ({ ...prev, travelers: Number(e.target.value) }))}
                  />
                </div>
              </div>

              {/* Travel Vibes - Quick Selection */}
              <div>
                <Label className="text-base font-medium mb-4 flex items-center justify-between">
                  <span>What kind of experience are you looking for?</span>
                  <SmartSuggestions 
                    type="activities" 
                    onSelect={(value) => {
                      const vibeMap: Record<string, string> = {
                        "Cultural Sites": "cultural",
                        "Food & Dining": "culinary", 
                        "Adventure Sports": "adventure",
                        "Museums": "cultural",
                        "Nightlife": "nightlife",
                        "Photography": "photography",
                        "Shopping": "cultural",
                        "Nature & Wildlife": "adventure"
                      };
                      const vibeId = vibeMap[value as string] || "cultural";
                      if (!formData.vibes?.includes(vibeId)) {
                        handleVibeToggle(vibeId);
                      }
                    }}
                  />
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {vibeOptions.map((vibe) => {
                    const Icon = vibe.icon;
                    const isSelected = formData.vibes?.includes(vibe.id);
                    return (
                      <Button
                        key={vibe.id}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        className={`flex items-center justify-center space-x-2 p-4 h-auto ${
                          isSelected ? "bg-gradient-primary text-primary-foreground" : ""
                        }`}
                        onClick={() => handleVibeToggle(vibe.id)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{vibe.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Options - Collapsible */}
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <span className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Advanced Options {!showAdvanced && "(Optional)"}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-6 mt-6">
                  {/* Dates */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-base font-medium mb-2">Start Date (Optional)</Label>
                      <Input
                        type="date"
                        value={formData.dates?.start}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          dates: { ...prev.dates!, start: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label className="text-base font-medium mb-2">End Date (Optional)</Label>
                      <Input
                        type="date"
                        value={formData.dates?.end}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          dates: { ...prev.dates!, end: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  {/* Travel Style & Pace */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-base font-medium mb-2 flex items-center justify-between">
                        <span>Travel Style</span>
                        <SmartSuggestions 
                          type="style" 
                          onSelect={(value) => setFormData(prev => ({ ...prev, travel_style: value as any }))}
                        />
                      </Label>
                      <Select
                        value={formData.travel_style}
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, travel_style: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="backpacker">Backpacker</SelectItem>
                          <SelectItem value="comfort">Comfort</SelectItem>
                          <SelectItem value="luxury">Luxury</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-base font-medium mb-4 block">
                        Travel Pace: {formData.pace_level === 1 ? "Relaxed" : formData.pace_level === 2 ? "Moderate" : "Fast-paced"}
                      </Label>
                      <Slider
                        value={[formData.pace_level || 2]}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, pace_level: value[0] }))}
                        max={3}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Special Requirements with Voice Input */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-base font-medium mb-2 flex items-center justify-between">
                        <span>Dietary Restrictions</span>
                        <VoiceInput 
                          onResult={(text) => {
                            const restrictions = text.split(',').map(s => s.trim()).filter(Boolean);
                            setFormData(prev => ({ ...prev, dietary_restrictions: restrictions }));
                          }}
                          placeholder="dietary restrictions"
                        />
                      </Label>
                      <Textarea
                        placeholder="e.g., vegetarian, gluten-free, kosher..."
                        rows={3}
                        onChange={(e) => {
                          const restrictions = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          setFormData(prev => ({ ...prev, dietary_restrictions: restrictions }));
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-base font-medium mb-2 flex items-center justify-between">
                        <span>Accessibility Needs</span>
                        <VoiceInput 
                          onResult={(text) => {
                            const needs = text.split(',').map(s => s.trim()).filter(Boolean);
                            setFormData(prev => ({ ...prev, accessibility_needs: needs }));
                          }}
                          placeholder="accessibility needs"
                        />
                      </Label>
                      <Textarea
                        placeholder="Any specific accessibility requirements..."
                        rows={3}
                        onChange={(e) => {
                          const needs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          setFormData(prev => ({ ...prev, accessibility_needs: needs }));
                        }}
                      />
                    </div>
                  </div>

                  {/* Enhanced Features */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Enhanced Features</Label>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="audio-tour"
                          checked={formData.include_audio_tour}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, include_audio_tour: !!checked }))
                          }
                        />
                        <Label htmlFor="audio-tour">Include Audio Tours</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="ar-ready"
                          checked={formData.include_ar_ready}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, include_ar_ready: !!checked }))
                          }
                        />
                        <Label htmlFor="ar-ready">AR-Ready Experience</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="realtime"
                          checked={formData.realtime_updates}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, realtime_updates: !!checked }))
                          }
                        />
                        <Label htmlFor="realtime">Real-time Updates</Label>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Plan Trip Button */}
              <div className="text-center pt-6">
                <Button
                  onClick={handlePlanTrip}
                  disabled={isPlanning}
                  size="lg"
                  className="btn-hero px-12 py-4 text-lg"
                >
                  {isPlanning ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Your Perfect Trip...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Plan My Trip
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripPlanner;