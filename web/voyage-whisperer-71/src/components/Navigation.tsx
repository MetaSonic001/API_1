import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { 
  Menu, 
  Plane, 
  Camera, 
  Mic, 
  Monitor, 
  Calendar, 
  Headphones,
  Sparkles,
  HelpCircle
} from "lucide-react";

interface NavigationProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const Navigation = ({ isMobileMenuOpen, setIsMobileMenuOpen }: NavigationProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: Plane },
    { path: "/plan", label: "Plan Trip", icon: Sparkles },
    { path: "/moodboard", label: "Moodboard", icon: Camera },
    { path: "/voice", label: "Voice Plan", icon: Mic },
    { path: "/monitor", label: "Monitor", icon: Monitor },
    { path: "/demo", label: "Demo", icon: HelpCircle },
  ];

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="bg-gradient-primary p-2 rounded-lg group-hover:shadow-glow transition-all duration-300">
            <Plane className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-gradient-hero">TripCraft AI</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className={`flex items-center space-x-2 ${
                    isActive(item.path) 
                      ? "bg-gradient-primary text-primary-foreground shadow-travel" 
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;