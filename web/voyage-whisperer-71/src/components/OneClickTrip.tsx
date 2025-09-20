import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api, TravelPlanRequest } from "@/lib/api";
import { 
  Zap, 
  Loader2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users,
  Sparkles
} from "lucide-react";

interface OneClickTripProps {
  onTripGenerated?: (plan: any) => void;
}

export const OneClickTrip = ({ onTripGenerated }: OneClickTripProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [quickTrips, setQuickTrips] = useState([
    {
      id: 1,
      title: "European Culture Week",
      destination: "Paris, France",
      duration: 7,
      budget: 2500,
      travelers: 2,
      theme: "cultural",
      description: "Art, museums, romantic dinners"
    },
    {
      id: 2, 
      title: "Tropical Paradise",
      destination: "Bali, Indonesia",
      duration: 10,
      budget: 3000,
      travelers: 2,
      theme: "relaxation",
      description: "Beaches, spas, local cuisine"
    },
    {
      id: 3,
      title: "Adventure Getaway", 
      destination: "New Zealand",
      duration: 14,
      budget: 4500,
      travelers: 2,
      theme: "adventure",
      description: "Hiking, nature, outdoor activities"
    },
    {
      id: 4,
      title: "City Break",
      destination: "Tokyo, Japan", 
      duration: 5,
      budget: 2000,
      travelers: 2,
      theme: "urban",
      description: "Modern culture, food tours, shopping"
    }
  ]);

  const generateInstantTrip = async (trip: any) => {
    setIsGenerating(true);
    
    try {
      const request: TravelPlanRequest = {
        mode: "text",
        destination: trip.destination,
        origin: "New York, NY", // Default origin
        dates: {
          start: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          end: new Date(Date.now() + (30 + trip.duration) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          flexible: true
        },
        duration_days: trip.duration,
        travelers: trip.travelers,
        adults: trip.travelers,
        children: 0,
        budget: trip.budget,
        currency: "USD",
        budget_flexible: true,
        travel_style: "comfort",
        vibes: [trip.theme],
        interests: [],
        priorities: [],
        pace_level: 2,
        accessibility_needs: [],
        dietary_restrictions: [],
        include_audio_tour: true,
        include_ar_ready: true,
        realtime_updates: true
      };

      const plan = await api.createTravelPlan(request);
      
      if (onTripGenerated) {
        onTripGenerated(plan);
      }
      
      toast({
        title: "Instant Trip Generated!",
        description: `Your ${trip.duration}-day ${trip.title} is ready to explore.`,
      });
    } catch (error) {
      toast({
        title: "Generation Error",
        description: "Failed to generate instant trip. Please try manual planning.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gradient-hero mb-2">
          One-Click Trip Planning
        </h3>
        <p className="text-foreground-muted">
          Skip the forms - choose a curated trip and go!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {quickTrips.map((trip) => (
          <Card key={trip.id} className="hover-lift cursor-pointer group">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg text-primary group-hover:text-primary-glow transition-colors">
                    {trip.title}
                  </h4>
                  <p className="text-sm text-foreground-muted">
                    {trip.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{trip.destination}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{trip.duration} days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${trip.budget}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{trip.travelers} travelers</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="capitalize">
                    {trip.theme}
                  </Badge>
                  
                  <Button
                    onClick={() => generateInstantTrip(trip)}
                    disabled={isGenerating}
                    className="btn-hero"
                    size="sm"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="mr-1 h-4 w-4" />
                        Go!
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            // Scroll to the manual form
            const formElement = document.querySelector('.trip-planner-form');
            if (formElement) {
              formElement.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Or Plan Manually Below
        </Button>
      </div>
    </div>
  );
};