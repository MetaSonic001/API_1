import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { VoiceInput } from "@/components/VoiceInput";
import { api, MoodboardAnalysis } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, 
  Upload, 
  X, 
  Sparkles, 
  Loader2,
  ImageIcon,
  MapPin,
  Zap,
  Globe,
  Mountain,
  Heart,
  Utensils,
  Building,
  Wand2,
  Mic
} from "lucide-react";

const MoodboardAnalyzer = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<MoodboardAnalysis | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  const generateSampleMoodboard = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI generating a sample moodboard
      const themes = [
        { theme: "Tropical Paradise", description: "Beach resorts, palm trees, crystal clear waters, sunset cocktails" },
        { theme: "European Culture", description: "Historic architecture, art museums, cobblestone streets, cozy cafes" },
        { theme: "Mountain Adventure", description: "Hiking trails, snow peaks, alpine lakes, outdoor camping" },
        { theme: "Urban Explorer", description: "Skyscrapers, street art, rooftop bars, food markets" },
        { theme: "Romantic Getaway", description: "Candlelit dinners, wine tastings, scenic viewpoints, luxury spas" }
      ];
      
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      setDescription(randomTheme.description);
      
      toast({
        title: "Sample Moodboard Generated!",
        description: `Created "${randomTheme.theme}" theme. Upload images or proceed with this description.`,
      });
    } catch (error) {
      toast({
        title: "Generation Error",
        description: "Failed to generate sample moodboard.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const newImages = Array.from(files).slice(0, 5 - images.length); // Max 5 images
    const newPreviews: string[] = [];

    newImages.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === newImages.length) {
            setImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (images.length === 0) {
      toast({
        title: "No Images Selected",
        description: "Please upload at least one image to analyze your moodboard.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await api.analyzeMoodboard(images, description);
      setAnalysis(result);

      toast({
        title: "Moodboard Analyzed!",
        description: `Found ${result.suggested_destinations.length} destination suggestions with ${Math.round(result.confidence_score * 100)}% confidence.`,
      });
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to analyze moodboard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getVibeIcon = (vibe: string) => {
    const icons: Record<string, any> = {
      mountain: Mountain,
      adventure: Mountain,
      cultural: Building,
      romantic: Heart,
      culinary: Utensils,
      urban: Building,
      outdoor: Globe,
      default: Sparkles
    };
    return icons[vibe] || icons.default;
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gradient-hero mb-4">
            Moodboard Analyzer
          </h1>
          <p className="text-xl text-foreground-muted max-w-3xl mx-auto mb-6">
            Upload your travel inspiration images and let our AI analyze them to suggest 
            perfect destinations that match your style
          </p>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={generateSampleMoodboard}
              disabled={isGenerating}
              className="btn-hero"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate Sample Theme
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="mr-2 h-5 w-5" />
                Upload Your Inspiration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Upload Area */}
              <div className="space-y-4">
                <Label>Travel Inspiration Images (up to 5)</Label>
                
                {/* Upload Button */}
                <div 
                  className={`border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors ${
                    images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => images.length < 5 && fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground-muted mb-2">
                    {images.length >= 5 
                      ? "Maximum 5 images reached" 
                      : "Click to upload or drag and drop"
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, WEBP up to 10MB each
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files)}
                />

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <Label className="flex items-center justify-between mb-2">
                  <span>Additional Context (Optional)</span>
                  <VoiceInput 
                    onResult={(text) => setDescription(text)}
                    placeholder="travel description"
                  />
                </Label>
                <Textarea
                  placeholder="Describe what kind of trip you're dreaming of..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Analyze Button */}
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || images.length === 0}
                className="w-full btn-hero"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Your Style...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze Moodboard
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-6">
            {analysis ? (
              <>
                {/* Analysis Summary */}
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Analysis Results</span>
                      <Badge variant="secondary">
                        {Math.round(analysis.confidence_score * 100)}% Confidence
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Travel Vibes Detected</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.analysis.vibes.map((vibe, index) => {
                            const Icon = getVibeIcon(vibe);
                            return (
                              <Badge key={index} variant="outline" className="flex items-center gap-1">
                                <Icon className="h-3 w-3" />
                                {vibe}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Suggested Activities</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.analysis.activities.map((activity, index) => (
                            <Badge key={index} variant="secondary">
                              {activity}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Travel Themes</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.analysis.themes.map((theme, index) => (
                            <Badge key={index} className="bg-gradient-primary text-primary-foreground">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Destination Suggestions */}
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      Recommended Destinations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.suggested_destinations.map((destination, index) => (
                        <div key={index} className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-lg">{destination.name}</h4>
                            <div className="text-right">
                              <div className="text-sm text-foreground-muted mb-1">Match</div>
                              <Progress 
                                value={destination.confidence * 100} 
                                className="w-20"
                              />
                            </div>
                          </div>
                          <p className="text-foreground-muted text-sm">
                            {destination.reasoning}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => {/* Navigate to plan with this destination */}}
                          >
                            <Zap className="mr-1 h-3 w-3" />
                            Plan Trip Here
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Processing Info */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {analysis.processing_time_ms}ms
                        </div>
                        <div className="text-sm text-foreground-muted">Processing Time</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-secondary">
                          {analysis.model_used}
                        </div>
                        <div className="text-sm text-foreground-muted">AI Model</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Placeholder */
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Upload Your Inspiration</h3>
                  <p className="text-foreground-muted">
                    Add some travel inspiration images to see AI-powered destination 
                    recommendations based on your visual preferences.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodboardAnalyzer;