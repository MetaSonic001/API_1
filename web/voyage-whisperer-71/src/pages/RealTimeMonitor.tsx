import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Monitor, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin,
  Plane,
  Cloud,
  Calendar,
  RefreshCw,
  Zap,
  Globe,
  Bell,
  Info
} from "lucide-react";

interface TripUpdate {
  type: string;
  message: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
  action_required: boolean;
}

const RealTimeMonitor = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [updates, setUpdates] = useState<TripUpdate[]>([]);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [tripId] = useState("demo_123");
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Sample demo updates
  const demoUpdates: TripUpdate[] = [
    {
      type: "weather_alert",
      message: "Light rain expected tomorrow morning in Paris. Indoor activities recommended.",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      severity: "low",
      action_required: false
    },
    {
      type: "flight_delay",
      message: "Your connecting flight AF1234 is delayed by 45 minutes.",
      timestamp: new Date(Date.now() - 600000).toISOString(),
      severity: "medium",
      action_required: true
    },
    {
      type: "venue_closure",
      message: "Louvre Museum will be closed Monday due to maintenance. Alternative suggestions added.",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      severity: "high",
      action_required: true
    },
    {
      type: "new_recommendation",
      message: "Based on your preferences, we added a local cooking class to your itinerary.",
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      severity: "low",
      action_required: false
    }
  ];

  useEffect(() => {
    connectWebSocket();
    // Simulate demo updates
    setTimeout(() => setUpdates(demoUpdates), 2000);
    
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      const ws = api.connectWebSocket(tripId, {
        weather_alert: handleWeatherUpdate,
        flight_delay: handleFlightUpdate,
        venue_closure: handleVenueUpdate,
        new_recommendation: handleRecommendation,
        replan_complete: handleReplanComplete
      });

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionAttempts(0);
        toast({
          title: "Connected",
          description: "Real-time monitoring is now active for your trip.",
        });
      };

      ws.onclose = () => {
        setIsConnected(false);
        setConnectionAttempts(prev => prev + 1);
        
        // Auto-reconnect with exponential backoff
        if (connectionAttempts < 5) {
          setTimeout(() => {
            connectWebSocket();
          }, Math.min(1000 * Math.pow(2, connectionAttempts), 30000));
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
        toast({
          title: "Connection Error",
          description: "Failed to connect to real-time updates. Using demo mode.",
          variant: "destructive",
        });
      };

      setWebsocket(ws);
    } catch (error) {
      console.error("WebSocket connection failed:", error);
      setIsConnected(false);
    }
  };

  const handleWeatherUpdate = (data: any) => {
    const update: TripUpdate = {
      type: "weather_alert",
      message: data.message || "Weather conditions have changed for your destination.",
      timestamp: new Date().toISOString(),
      severity: data.severity || "low",
      action_required: false
    };
    setUpdates(prev => [update, ...prev]);
    
    toast({
      title: "Weather Alert",
      description: update.message,
    });
  };

  const handleFlightUpdate = (data: any) => {
    const update: TripUpdate = {
      type: "flight_delay",
      message: data.message || "Flight information has been updated.",
      timestamp: new Date().toISOString(),
      severity: "medium",
      action_required: true
    };
    setUpdates(prev => [update, ...prev]);
    
    toast({
      title: "Flight Update",
      description: update.message,
      variant: "destructive",
    });
  };

  const handleVenueUpdate = (data: any) => {
    const update: TripUpdate = {
      type: "venue_closure",
      message: data.message || "A venue in your itinerary has updated information.",
      timestamp: new Date().toISOString(),
      severity: "high",
      action_required: true
    };
    setUpdates(prev => [update, ...prev]);
    
    toast({
      title: "Venue Update",
      description: update.message,
      variant: "destructive",
    });
  };

  const handleRecommendation = (data: any) => {
    const update: TripUpdate = {
      type: "new_recommendation",
      message: data.message || "New recommendations have been added to your trip.",
      timestamp: new Date().toISOString(),
      severity: "low",
      action_required: false
    };
    setUpdates(prev => [update, ...prev]);
    
    toast({
      title: "New Recommendation",
      description: update.message,
    });
  };

  const handleReplanComplete = (data: any) => {
    toast({
      title: "Trip Updated",
      description: "Your itinerary has been automatically adjusted based on recent changes.",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-destructive";
      case "medium": return "text-warning";
      case "low": return "text-success";
      default: return "text-foreground";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high": return AlertTriangle;
      case "medium": return Clock;
      case "low": return Info;
      default: return Bell;
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case "weather_alert": return Cloud;
      case "flight_delay": return Plane;
      case "venue_closure": return MapPin;
      case "new_recommendation": return Zap;
      default: return Bell;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gradient-hero mb-4">
            Real-Time Trip Monitor
          </h1>
          <p className="text-xl text-foreground-muted max-w-3xl mx-auto">
            Stay updated with live monitoring of your trip. Get instant notifications 
            about weather, flights, venues, and personalized recommendations.
          </p>
        </div>

        {/* Connection Status */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isConnected ? (
                  <>
                    <Wifi className="h-6 w-6 text-success" />
                    <div>
                      <div className="font-semibold text-success">Connected</div>
                      <div className="text-sm text-foreground-muted">
                        Real-time monitoring active for Trip #{tripId}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-6 w-6 text-destructive" />
                    <div>
                      <div className="font-semibold text-destructive">Disconnected</div>
                      <div className="text-sm text-foreground-muted">
                        Attempting to reconnect... (Attempt {connectionAttempts + 1}/5)
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={connectWebSocket}
                  disabled={isConnected}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reconnect
                </Button>
                
                <div className="text-right">
                  <div className="text-sm text-foreground-muted">Updates</div>
                  <div className="text-2xl font-bold text-primary">{updates.length}</div>
                </div>
              </div>
            </div>
            
            {isConnected && (
              <div className="mt-4">
                <Progress value={100} className="h-2" />
                <div className="text-xs text-foreground-muted mt-1">
                  Monitoring: Weather • Flights • Venues • Events
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Updates */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Updates Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Live Updates</h2>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            </div>

            {updates.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Monitor className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Updates Yet</h3>
                  <p className="text-foreground-muted">
                    Your trip is being monitored. Updates will appear here as they happen.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {updates.map((update, index) => {
                  const UpdateIcon = getUpdateIcon(update.type);
                  const SeverityIcon = getSeverityIcon(update.severity);
                  
                  return (
                    <Card key={index} className="hover-lift">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="bg-gradient-primary/10 p-2 rounded-lg">
                            <UpdateIcon className="h-5 w-5 text-primary" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold capitalize">
                                  {update.type.replace('_', ' ')}
                                </h4>
                                <SeverityIcon className={`h-4 w-4 ${getSeverityColor(update.severity)}`} />
                              </div>
                              <div className="text-sm text-foreground-muted">
                                {formatTimestamp(update.timestamp)}
                              </div>
                            </div>
                            
                            <p className="text-foreground-muted mb-3">
                              {update.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant={update.severity === "high" ? "destructive" : "outline"}
                                className="capitalize"
                              >
                                {update.severity} Priority
                              </Badge>
                              
                              {update.action_required && (
                                <Button size="sm" variant="outline">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Take Action
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Monitoring Dashboard */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Monitoring Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cloud className="h-4 w-4 text-primary" />
                      <span className="text-sm">Weather</span>
                    </div>
                    <Badge variant="outline" className="text-success">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Plane className="h-4 w-4 text-primary" />
                      <span className="text-sm">Flights</span>
                    </div>
                    <Badge variant="outline" className="text-success">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm">Venues</span>
                    </div>
                    <Badge variant="outline" className="text-success">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm">Events</span>
                    </div>
                    <Badge variant="outline" className="text-success">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Force Refresh
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Full Itinerary
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
              </CardContent>
            </Card>

            {/* Demo Alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This is a demo of real-time monitoring. In a live environment, 
                updates would come from actual flight APIs, weather services, and venue data.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMonitor;