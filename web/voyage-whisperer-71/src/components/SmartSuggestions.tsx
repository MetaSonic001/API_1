import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MapPin, DollarSign, Calendar, Users } from "lucide-react";

interface SmartSuggestionsProps {
  type: "destination" | "budget" | "duration" | "activities" | "style";
  onSelect: (value: string | number) => void;
  className?: string;
}

const suggestions = {
  destination: [
    { label: "Paris, France", icon: "🇫🇷", desc: "Romance & Culture" },
    { label: "Tokyo, Japan", icon: "🇯🇵", desc: "Modern & Traditional" },
    { label: "New York, USA", icon: "🇺🇸", desc: "Urban Adventure" },
    { label: "Bali, Indonesia", icon: "🇮🇩", desc: "Tropical Paradise" },
    { label: "Barcelona, Spain", icon: "🇪🇸", desc: "Art & Architecture" },
    { label: "Thailand", icon: "🇹🇭", desc: "Exotic Culture" },
  ],
  budget: [
    { label: "Budget ($500-1500)", value: 1000 },
    { label: "Mid-range ($1500-3500)", value: 2500 },
    { label: "Luxury ($3500+)", value: 5000 },
  ],
  duration: [
    { label: "Weekend (2-3 days)", value: 3 },
    { label: "Week (5-7 days)", value: 7 },
    { label: "Extended (10-14 days)", value: 12 },
  ],
  activities: [
    "Cultural Sites", "Food & Dining", "Adventure Sports", "Museums", 
    "Nightlife", "Photography", "Shopping", "Nature & Wildlife"
  ],
  style: [
    { label: "Backpacker", desc: "Budget-friendly, authentic local experiences" },
    { label: "Comfort", desc: "Balance of comfort and value" },
    { label: "Luxury", desc: "Premium experiences and accommodations" },
  ]
};

export const SmartSuggestions = ({ type, onSelect, className = "" }: SmartSuggestionsProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSelect = (item: any) => {
    if (typeof item === 'object' && 'value' in item) {
      onSelect(item.value);
    } else if (typeof item === 'object' && 'label' in item) {
      onSelect(item.label);
    } else {
      onSelect(item);
    }
    setShowSuggestions(false);
  };

  const getIcon = () => {
    switch (type) {
      case "destination": return <MapPin className="h-3 w-3" />;
      case "budget": return <DollarSign className="h-3 w-3" />;
      case "duration": return <Calendar className="h-3 w-3" />;
      case "activities": return <Users className="h-3 w-3" />;
      default: return <Sparkles className="h-3 w-3" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShowSuggestions(!showSuggestions)}
        className="h-8 px-2 text-xs text-muted-foreground hover:text-primary"
      >
        {getIcon()}
        <span className="ml-1">Suggest</span>
      </Button>

      {showSuggestions && (
        <div className="absolute top-full left-0 z-50 mt-1 w-64 max-h-60 overflow-y-auto bg-background border border-border rounded-lg shadow-lg p-2">
          <div className="space-y-1">
            {suggestions[type]?.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left h-auto p-2"
                onClick={() => handleSelect(item)}
              >
                <div className="flex items-start space-x-2 w-full">
                  {typeof item === 'object' && 'icon' in item && (
                    <span className="text-lg">{item.icon}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {typeof item === 'object' ? item.label : item}
                    </div>
                    {typeof item === 'object' && 'desc' in item && (
                      <div className="text-xs text-muted-foreground">
                        {item.desc}
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};