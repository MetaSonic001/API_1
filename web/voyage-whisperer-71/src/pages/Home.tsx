import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plane, 
  Camera, 
  Mic, 
  Globe, 
  Calendar, 
  Headphones,
  Sparkles,
  MapPin,
  Clock,
  Shield,
  Zap,
  Brain
} from "lucide-react";
import heroImage from "@/assets/hero-travel.jpg";

const Home = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Trip Planning",
      description: "Multi-agent AI system creates personalized itineraries",
      color: "text-primary"
    },
    {
      icon: Camera,
      title: "Moodboard Analysis",
      description: "Upload inspiration images to discover your perfect destination",
      color: "text-secondary"
    },
    {
      icon: Mic,
      title: "Voice Planning",
      description: "Speak your travel desires and let AI understand your needs",
      color: "text-success"
    },
    {
      icon: Globe,
      title: "Real-time Updates",
      description: "Live monitoring with instant adjustments for weather and events",
      color: "text-primary"
    },
    {
      icon: Calendar,
      title: "Smart Booking",
      description: "Integrated booking system with calendar synchronization",
      color: "text-secondary"
    },
    {
      icon: Headphones,
      title: "Audio Tours",
      description: "Immersive storytelling content for every destination",
      color: "text-success"
    }
  ];

  const stats = [
    { value: "10M+", label: "Destinations" },
    { value: "500K+", label: "Happy Travelers" },
    { value: "99.9%", label: "Success Rate" },
    { value: "24/7", label: "AI Support" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-secondary/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Your Next Adventure
              <span className="block text-gradient-hero bg-clip-text text-transparent">
                Starts Here
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              AI-powered travel planning that understands your style, adapts in real-time, 
              and creates unforgettable journeys tailored just for you.
            </p>
          </div>

          <div className="animate-fade-in-delay flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/plan">
              <Button size="lg" className="btn-hero text-lg px-8 py-4">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Planning
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="btn-glass text-lg px-8 py-4">
                <Plane className="mr-2 h-5 w-5" />
                See Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="glass-card p-4 rounded-xl">
            <MapPin className="h-8 w-8 text-secondary" />
          </div>
        </div>
        <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '1s' }}>
          <div className="glass-card p-4 rounded-xl">
            <Globe className="h-8 w-8 text-primary" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in-delay" 
                   style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-4xl md:text-5xl font-bold text-gradient-hero mb-2">
                  {stat.value}
                </div>
                <div className="text-foreground-muted text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Intelligent Travel Planning
            </h2>
            <p className="text-xl text-foreground-muted max-w-3xl mx-auto">
              Experience the future of travel with our advanced AI system that handles 
              every aspect of your journey planning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover-lift bg-card border-border/50 animate-fade-in-delay"
                      style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="bg-gradient-primary/10 p-3 rounded-lg inline-block">
                        <Icon className={`h-8 w-8 ${feature.color}`} />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-foreground-muted">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-travel">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Travel?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of travelers who trust TripCraft AI to create their perfect adventures.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/plan">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 shadow-xl">
                <Zap className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
            <Link to="/moodboard">
              <Button size="lg" variant="outline" className="btn-glass text-lg px-8 py-4">
                <Camera className="mr-2 h-5 w-5" />
                Try Moodboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;