import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  CloudSun, 
  Compass, 
  ArrowRight, 
  Star, 
  ChevronRight, 
  Mic, 
  Search, 
  Clock, 
  X, 
  Award, 
  TrendingUp, 
  Map, 
  Navigation,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { UserPreferences } from '../types';
import { allDestinations, PopularSpot, sampleHotels } from '../data/travelData';
import RealIndiaMap from './RealIndiaMap';

interface LandingPageProps {
  userPrefs: UserPreferences;
  onPageChange: (page: string) => void;
  searchDest: string;
  setSearchDest: (dest: string) => void;
  triggerInstantPlan: (destination: string, days: number, budget: number) => void;
}

export default function LandingPage({
  userPrefs,
  onPageChange,
  searchDest,
  setSearchDest,
  triggerInstantPlan
}: LandingPageProps) {
  // Navigation & Categorization
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [scrolledPastHero, setScrolledPastHero] = useState<boolean>(false);
  const [showVoiceSearch, setShowVoiceSearch] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceStage, setVoiceStage] = useState<'idle' | 'listening' | 'processing'>('idle');

  // Interactive Live Search States
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchSuggestions, setSearchSuggestions] = useState<PopularSpot[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tripverse_recent_searches');
      return saved ? JSON.parse(saved) : ["Taj Mahal, Agra", "Hampi Ruins, Karnataka", "Goa Beaches"];
    } catch {
      return ["Taj Mahal, Agra", "Hampi Ruins, Karnataka"];
    }
  });

  // Dynamic Map Focus State
  const [focusedDestName, setFocusedDestName] = useState<string>('');
  const [activeRouteStops, setActiveRouteStops] = useState<string[]>([]);

  // Hero Carousel State
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const autoSlideInterval = useRef<any>(null);

  // Monitor Scroll for Sticky Search Bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setScrolledPastHero(true);
      } else {
        setScrolledPastHero(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-Slide Hero Carousel (All 18 places can be rotating spotlights)
  const spotlightSpots = allDestinations.slice(0, 6);
  useEffect(() => {
    autoSlideInterval.current = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % spotlightSpots.length);
    }, 5500);
    return () => {
      if (autoSlideInterval.current) clearInterval(autoSlideInterval.current);
    };
  }, [spotlightSpots.length]);

  // Live Auto-Suggestion Filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      return;
    }
    const filtered = allDestinations.filter(dest => 
      dest.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchSuggestions(filtered);
  }, [searchQuery]);

  // Trigger Local Plan
  const handleSelectSuggestion = (destination: string, days = 4, budget = 65000) => {
    setSearchQuery(destination);
    setSearchDest(destination);
    setIsSearchFocused(false);
    setFocusedDestName(destination);
    
    // Add to Recent Searches
    const updated = [destination, ...recentSearches.filter(s => s !== destination)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('tripverse_recent_searches', JSON.stringify(updated));

    // Scroll smoothly to matching element if possible
    const matchId = destination.replace(/[\s,]/g, '-').toLowerCase();
    const element = document.getElementById(`dest-card-${matchId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Simulated AI voice search flow
  const handleStartVoiceSearch = () => {
    setShowVoiceSearch(true);
    setVoiceStage('listening');
    setVoiceTranscript("Listening to tourist vectors...");
    
    const targetPrompts = [
      "Find luxury hotel view options in Taj Mahal Agra",
      "Plan a serene sunset kettuvallam trip in Kerala Backwaters",
      "Draft a 4-day culture itinerary for Hampi Ruins",
      "Take me to the snowy valleys of Kashmir Srinagar"
    ];
    
    const randomPrompt = targetPrompts[Math.floor(Math.random() * targetPrompts.length)];
    
    setTimeout(() => {
      setVoiceStage('processing');
      setVoiceTranscript(`Transcribing: "${randomPrompt}"`);
    }, 1800);

    setTimeout(() => {
      // Find matching destination keyword
      let match = "Taj Mahal, Agra";
      if (randomPrompt.includes("Kerala")) match = "Kerala Backwaters, Alappuzha";
      else if (randomPrompt.includes("Hampi")) match = "Hampi Ruins, Karnataka";
      else if (randomPrompt.includes("Kashmir")) match = "Kashmir Valleys";

      handleSelectSuggestion(match);
      setShowVoiceSearch(false);
      setVoiceStage('idle');
    }, 3600);
  };

  // Popular pre-made route trails
  const predefinedRoutes = [
    {
      title: "Royal Golden Triangle Heritage Trail",
      stops: ["Taj Mahal, Agra", "Jaipur Forts, Rajasthan", "Qutub Minar, Delhi"],
      days: 6,
      budget: 85000,
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80",
      description: "Delhi's soaring towers, Agra's white-marble romance, and Pink Jaipur's desert forts."
    },
    {
      title: "Southern Spice & Tea Hill Valleys",
      stops: ["Kerala Backwaters, Alappuzha", "Munnar Tea Hills, Kerala", "Mysore Palace, Karnataka"],
      days: 8,
      budget: 95000,
      image: "https://images.unsplash.com/photo-1522083165195-342750297f05?auto=format&fit=crop&w=400&q=80",
      description: "Lush tea carpet valleys, private houseboats, and majestic golden palaces."
    },
    {
      title: "Sacred Shrines & Divine Temple Walk",
      stops: ["Golden Temple, Amritsar", "Meenakshi Temple, Madurai", "Konark Sun Temple, Odisha"],
      days: 5,
      budget: 55000,
      image: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=400&q=80",
      description: "Spiritual golden waters, towering dynamic gopurams, and colossal chariot carvings."
    }
  ];

  // Category Filter options
  const categories = ['All', 'Monument', 'Cultural Heritage', 'Hill Station', 'Beaches', 'Temple'];

  const filteredDestinations = activeCategory === 'All' 
    ? allDestinations 
    : allDestinations.filter(d => d.tag.includes(activeCategory) || (activeCategory === 'Beaches' && d.tag === 'Backwaters'));

  return (
    <div className="space-y-12 pb-20 text-slate-900 font-sans">
      
      {/* 1. PREMIUM GLASS STICKY TOP SEARCH BAR (VISIBLE ALWAYS ONCE SCROLLED OVER) */}
      <AnimatePresence>
        {scrolledPastHero && (
          <motion.div 
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-[900]"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-[30px] p-2 border border-orange-200/30 shadow-2xl shadow-orange-950/10 flex items-center justify-between gap-2.5">
              <div className="flex-1 flex items-center gap-2 pl-4">
                <Search className="h-4 w-4 text-orange-600 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Ask Tripverse: Taj Mahal, Leh Ladakh, Munnar, Goa..." 
                  className="bg-transparent border-0 outline-none text-xs w-full text-slate-800 font-bold placeholder-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-slate-100 rounded-full cursor-pointer">
                    <X className="h-3 w-3 text-slate-400" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-1.5 pr-2">
                <button 
                  onClick={handleStartVoiceSearch}
                  className="p-2 hover:bg-orange-50 rounded-full cursor-pointer text-orange-600 transition"
                  title="Voice Search"
                >
                  <Mic className="h-4.5 w-4.5" />
                </button>
                <button 
                  onClick={() => triggerInstantPlan(searchQuery || "Taj Mahal, Agra", 4, 65000)}
                  className="bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[10px] font-extrabold tracking-wider uppercase px-5 py-2.5 rounded-full shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all"
                >
                  Explore
                </button>
              </div>
            </div>

            {/* Sticky Dropdown Overlay */}
            <AnimatePresence>
              {isSearchFocused && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-lg rounded-2xl border border-slate-200 shadow-2xl p-4 space-y-3 max-h-[380px] overflow-y-auto"
                >
                  {searchSuggestions.length > 0 ? (
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5"><TrendingUp className="h-3 w-3" /> Attractions Found</span>
                      {searchSuggestions.map((dest, idx) => (
                        <button 
                          key={idx}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleSelectSuggestion(dest.destination, dest.duration, dest.budget)}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-left transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <img src={dest.image} class="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <div className="text-xs font-bold text-slate-900">{dest.destination}</div>
                              <div className="text-[10px] text-slate-500">{dest.location}</div>
                            </div>
                          </div>
                          <span className="text-[10px] bg-sky-50 text-sky-700 font-extrabold px-2.5 py-1 rounded-full uppercase">{dest.tag}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Recent Searches</span>
                        <div className="flex flex-wrap gap-1.5">
                          {recentSearches.map((term, i) => (
                            <button 
                              key={i} 
                              onClick={() => handleSelectSuggestion(term)}
                              className="px-3 py-1 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-700 text-[10px] font-semibold border border-slate-200 cursor-pointer transition flex items-center gap-1"
                            >
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span>{term}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Trending in Indian Tourism</span>
                        <div className="flex flex-wrap gap-1.5">
                          {["Leh Ladakh", "Kerala Backwaters", "Jaipur Forts", "Hampi", "Kashmir"].map((term, i) => (
                            <button 
                              key={i} 
                              onClick={() => handleSelectSuggestion(term)}
                              className="px-3 py-1 bg-amber-50 hover:bg-amber-100 rounded-full text-amber-800 text-[10px] font-bold border border-amber-200 cursor-pointer transition"
                            >
                              🇮🇳 {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-bold">
                    <span>Search airports, rail hubs or cities</span>
                    <button onClick={() => setIsSearchFocused(false)} className="hover:text-slate-600">Close Panel</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAJESTIC HERO TRAVEL BANNER */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-950 p-6 sm:p-12 lg:p-20 flex flex-col justify-end min-h-[500px] mt-2 group border border-slate-800">
        
        {/* Cinematic parallax sliding background */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img 
              key={carouselIndex}
              src={spotlightSpots[carouselIndex].image} 
              alt="Incredible India Spotlight"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.45, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          {/* Subtle golden sunset gradient filter */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
          {/* Saffron and Blue subtle radial lights */}
          <div className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Floating Clouds Background Illustration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[4]">
          <div className="absolute top-10 left-10 w-48 h-12 bg-white/5 blur-xl rounded-full animate-pulse decoration-none duration-[8000s]"></div>
          <div className="absolute top-32 right-20 w-72 h-16 bg-white/5 blur-2xl rounded-full animate-pulse decoration-none duration-[12000s]"></div>
        </div>

        {/* Floating Spotlight Card */}
        <div className="absolute top-6 right-6 z-10 hidden md:block w-72 bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl">
          <div className="text-[9px] font-bold text-amber-400 flex items-center gap-1 uppercase tracking-wider mb-1">
            <Award className="h-3 w-3 fill-amber-400" /> Active Destination Spotlight
          </div>
          <div className="text-xs font-extrabold text-white">{spotlightSpots[carouselIndex].destination}</div>
          <div className="text-[10px] text-slate-300 line-clamp-2 mt-1">{spotlightSpots[carouselIndex].description}</div>
          <div className="flex items-center justify-between text-[10px] font-black text-amber-400 mt-2">
            <span>⭐ {spotlightSpots[carouselIndex].rating} / 5</span>
            <span className="text-orange-400 font-mono">₹{spotlightSpots[carouselIndex].budget.toLocaleString('en-IN')} Est</span>
          </div>
        </div>

        {/* Hero Central Content */}
        <div className="relative z-10 max-w-2xl space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-[10px] font-extrabold text-orange-400 uppercase tracking-widest leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping"></span>
            Incredible India Luxury Curation
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-white select-none">
            Exploring India through a<br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-sky-400 bg-clip-text text-transparent italic">Luxury AI Companion</span>
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base max-w-lg leading-relaxed font-medium">
            Discover a country rich in ancient monuments, pristine shorelines, towering Himalayan massifs, and dynastic palaces. Beautifully aligned by our multi-agent travel suite and personalized to your unique style.
          </p>

          {/* Premium Glass Center Search Bar (Hovering) */}
          <div className="relative max-w-xl bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-[30px] shadow-2xl flex flex-col sm:flex-row gap-2 transition duration-300 hover:border-white/35">
            <div className="flex-1 flex items-center gap-2.5 px-4">
              <MapPin className="h-5 w-5 text-orange-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Where in India is your next dream escape?" 
                className="bg-transparent border-0 outline-none text-xs w-full text-white placeholder-slate-300 font-bold focus:ring-0"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-white/10 rounded-full cursor-pointer">
                  <X className="h-3.5 w-3.5 text-slate-300" />
                </button>
              )}
            </div>

            <div className="flex gap-1">
              <button 
                onClick={handleStartVoiceSearch}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
                title="Voice Assistant Search"
              >
                <Mic className="h-4.5 w-4.5" />
              </button>
              <button 
                onClick={() => triggerInstantPlan(searchQuery || "Taj Mahal, Agra", 4, 75000)}
                className="bg-gradient-to-r from-orange-600 via-amber-500 to-blue-600 text-white font-extrabold text-xs px-6 py-3 rounded-full flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
              >
                <span>Search</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Float autocomplete suggestion popover on hero banner */}
            <AnimatePresence>
              {isSearchFocused && !scrolledPastHero && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute top-18 left-0 right-0 bg-white shadow-2xl rounded-2xl border border-slate-200 p-4 z-50 text-slate-800 space-y-3 max-h-[290px] overflow-y-auto"
                >
                  {searchSuggestions.length > 0 ? (
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Matched Places</span>
                      {searchSuggestions.map((dest, i) => (
                        <button 
                          key={i}
                          onClick={() => handleSelectSuggestion(dest.destination)}
                          className="w-full flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-50 text-left transition"
                        >
                          <img src={dest.image} className="w-8 h-8 rounded object-cover" />
                          <div>
                            <div className="text-xs font-bold text-slate-800">{dest.destination}</div>
                            <div className="text-[10px] text-slate-500">{dest.location}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Trending Indian Vacations</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {["Taj Mahal", "Goa Beaches", "Munnar", "Kerala Backwaters", "Kashmir"].map((s, idx) => (
                            <button 
                              key={idx}
                              onClick={() => handleSelectSuggestion(s)}
                              className="px-3 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 rounded-full font-bold cursor-pointer text-slate-700 transition"
                            >
                              🏝️ {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="pt-2 border-t text-[9px] text-slate-400 font-bold flex justify-between">
                    <span>Press search to run AI travel generator</span>
                    <button onClick={() => setIsSearchFocused(false)} className="hover:text-slate-600">Close</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 3. DOCK GRID: TWO-LOBE INTERACTIVE ROW: MAP LEFT VS DIRECTORY BOARD RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-extrabold text-[#D97706] bg-amber-50 border border-amber-100 px-3 py-1 rounded-full tracking-widest">
              Live Coordinate Tracer
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Map className="h-5.5 w-5.5 text-blue-600" /> Real India Radar Map
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore ancient coordinates down to direct coordinates. Select stops on the map to trigger route traces or auto-scrolling preview.
            </p>
          </div>

          <RealIndiaMap 
            focusedDestinationName={focusedDestName}
            activeTripDestinations={activeRouteStops}
            height="340px"
            onSelectDestination={(dest) => {
              setFocusedDestName(dest.destination);
              handleSelectSuggestion(dest.destination);
            }}
          />

          {/* Quick Route Highlights buttons to draw active lines */}
          <div className="space-y-1.5 bg-sky-50/50 p-3 rounded-xl border border-sky-100">
            <div className="text-[10px] uppercase font-bold text-sky-800 flex items-center gap-1">
              <Navigation className="h-3 w-3 shrink-0" /> Click to Preview Popular Indian Circuits:
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button 
                onClick={() => {
                  setActiveRouteStops(["Taj Mahal, Agra", "Jaipur Forts, Rajasthan", "Qutub Minar, Delhi"]);
                  setFocusedDestName("Taj Mahal, Agra");
                }}
                className={`text-[9px] px-2.5 py-1 rounded-full font-bold transition flex items-center gap-1 cursor-pointer ${
                  activeRouteStops.includes("Taj Mahal, Agra") ? 'bg-blue-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                👑 Golden Triangle Route
              </button>
              <button 
                onClick={() => {
                  setActiveRouteStops(["Kerala Backwaters, Alappuzha", "Munnar Tea Hills, Kerala", "Mysore Palace, Karnataka"]);
                  setFocusedDestName("Kerala Backwaters, Alappuzha");
                }}
                className={`text-[9px] px-2.5 py-1 rounded-full font-bold transition flex items-center gap-1 cursor-pointer ${
                  activeRouteStops.includes("Kerala Backwaters, Alappuzha") ? 'bg-blue-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                🛶 South Spice & Hills Route
              </button>
              <button 
                onClick={() => {
                  setActiveRouteStops([]);
                  setFocusedDestName('');
                }}
                className="text-[9px] px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-full cursor-pointer transition"
              >
                Clear Polyline
              </button>
            </div>
          </div>
        </div>

        {/* AI Travel Match recommendations */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                Explorer Match Profile
              </div>
              <span className="text-xs font-bold text-slate-500">Welcome, {userPrefs.name}!</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">AI Travel Recommendations</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              Calibrated matching your taste: <span className="text-indigo-600">{userPrefs.travelStyle.join(', ')} escapes</span>, budget bracket <span className="font-extrabold text-slate-800">{userPrefs.budgetLevel} pricing</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-orange-50/40 rounded-2xl border border-orange-100 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[9px] text-orange-700 font-extrabold uppercase tracking-widest font-mono">🏆 Highest Match Score</span>
                <h4 className="font-extrabold text-sm text-slate-900 text-left">Hampi Ruins, Karnataka</h4>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">Rich heritage structures carved in boulders with high scenic cultural value.</p>
              </div>
              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className="font-bold text-orange-700">98% Match</span>
                <button 
                  onClick={() => triggerInstantPlan("Hampi Ruins, Karnataka", 4, 32000)}
                  className="font-black text-blue-600 flex items-center gap-0.5 hover:underline"
                >
                  Plan Now <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[9px] text-blue-700 font-extrabold uppercase tracking-widest font-mono">🌊 Nature Escape Match</span>
                <h4 className="font-extrabold text-sm text-slate-900 text-left">Munnar Tea Hills, Kerala</h4>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">Unwind among sprawling green mist tea carpets matching your relaxation styles.</p>
              </div>
              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className="font-bold text-blue-700">94% Match</span>
                <button 
                  onClick={() => triggerInstantPlan("Munnar Tea Hills, Kerala", 4, 34000)}
                  className="font-black text-blue-600 flex items-center gap-0.5 hover:underline"
                >
                  Plan Now <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white text-orange-600 border border-slate-200 shadow-sm rounded-xl text-lg">💡</div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800">Dynamic Winter/Monsoon Advice</div>
                <p className="text-[10px] text-slate-500 leading-tight">Monsoon breeze arriving in Kerala Backwaters; Ooty experiencing perfect misty skies.</p>
              </div>
            </div>
            <button 
              onClick={() => onPageChange('profile')}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-[10px] font-bold text-slate-700 rounded-xl border border-slate-200 shadow-sm cursor-pointer whitespace-nowrap transition"
            >
              Adjust Traveler Prefs
            </button>
          </div>
        </div>
      </div>

      {/* 4. CHRONICLES CAROUSEL OF ROYAL MONUMENTS - AUTOMATED HORIZONTAL SCROLLER */}
      <div className="space-y-5 pt-4">
        <div className="text-left">
          <span className="text-[10px] uppercase font-bold text-pink-600 tracking-wider">Historical Chronicles</span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Dynastic India Monuments</h2>
          <p className="text-xs text-slate-500 mt-1">Stately forts, sun temples, and royal tombs built across our ancient centuries</p>
        </div>

        {/* Elegant Carousel */}
        <div className="relative overflow-hidden py-1.5" id="historical-scroller">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hidden snap-x pointer-events-auto cursor-grab active:cursor-grabbing">
            {allDestinations.filter(d => d.tag === 'Monument' || d.tag === 'Temple' || d.tag === 'Cultural Heritage').map((spot, idx) => (
              <div 
                key={idx} 
                onClick={() => {
                  setFocusedDestName(spot.destination);
                  handleSelectSuggestion(spot.destination);
                }}
                className="w-72 shrink-0 snap-center bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-md group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <img 
                    src={spot.image} 
                    alt={spot.destination} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  <span className="absolute top-2.5 left-2.5 bg-slate-900/60 backdrop-blur-md text-amber-400 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide border border-white/10">
                    {spot.tag}
                  </span>
                  <div className="absolute bottom-2.5 left-2.5 text-left">
                    <div className="text-white text-xs font-black shadow-text leading-tight">{spot.destination}</div>
                    <div className="text-[9px] text-slate-200 shadow-text font-semibold">{spot.location}</div>
                  </div>
                </div>
                <div className="p-3.5 space-y-1 text-left">
                  <p className="text-[10px] text-slate-500 font-semibold italic line-clamp-1">"{spot.style}"</p>
                  <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-slate-100">
                    <span className="text-slate-500 font-bold">⭐ {spot.rating || 4.7} rating</span>
                    <span className="text-blue-600 font-extrabold uppercase text-[9px]">Explore on map</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. INCREDIBLE INDIA EXPLORER BROWSER - 18 DETAILED FULLSCREEN DESTINATION IMAGE SECTIONS */}
      <div className="space-y-6 pt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Interactive Explorer Board</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
              <span>National Tourism Portfolio</span>
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">{filteredDestinations.length} Places Live</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Immersive overview files, weather-aware chips, and premium concierge itineraries</p>
          </div>

          {/* Premium Filter Pills */}
          <div className="flex flex-wrap gap-1.5 justify-start">
            {categories.map((cat, i) => (
              <button 
                key={i}
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] font-extrabold px-3.5 py-1.5 rounded-full border tracking-wide transition-all cursor-pointer ${
                  activeCategory === cat 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {cat === 'All' ? 'All Escapes' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* 18 required detailed sections styled in premium cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDestinations.map((dest) => {
            const cardId = dest.destination.replace(/[\s,]/g, '-').toLowerCase();
            const isTargeted = focusedDestName === dest.destination;

            return (
              <div 
                key={dest.destination}
                id={`dest-card-${cardId}`}
                className={`bg-white rounded-3xl overflow-hidden border transition-all duration-300 transform flex flex-col justify-between ${
                  isTargeted 
                    ? 'border-orange-500 ring-2 ring-orange-400/20 shadow-2xl scale-[1.01]' 
                    : 'border-slate-200/60 hover:border-slate-300 hover:shadow-xl'
                }`}
              >
                {/* Cinematic zooming absolute responsive image */}
                <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                  <img 
                    src={dest.image} 
                    alt={dest.destination} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent"></div>
                  
                  {/* Absolute Floating items */}
                  <span className="absolute top-4 left-4 bg-orange-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20 shadow">
                    {dest.tag}
                  </span>

                  <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-amber-400 text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {dest.rating || 4.9}
                  </span>

                  <div className="absolute bottom-4 left-4 right-4 text-left space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-200">{dest.location}</span>
                    <h3 className="text-xl font-black text-white hover:text-slate-100 transition truncate">{dest.destination}</h3>
                  </div>
                </div>

                {/* Lower Card Description Details */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Weather Chip */}
                      <span className="inline-flex items-center gap-1 text-[10px] bg-sky-50 text-sky-700 border border-sky-100 font-extrabold px-2.5 py-1 rounded-md mb-0.5">
                        <CloudSun className="h-3 w-3 text-sky-600" />
                        {dest.weather || "24°C • Pleasant Clear"}
                      </span>
                      {/* Luxury Style tagline */}
                      <span className="text-[10px] font-bold text-slate-400 italic">
                        {dest.style}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {dest.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                      <span>Expedition Duration:</span>
                      <span className="font-bold text-slate-800">{dest.duration} Days Bespoke</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                      <span>Sovereign Cost Guideline:</span>
                      <span className="font-extrabold text-indigo-700 text-sm font-mono">₹{dest.budget.toLocaleString('en-IN')} Est</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1.5">
                      <button 
                        onClick={() => {
                          setFocusedDestName(dest.destination);
                          setSearchQuery(dest.destination);
                          setSearchDest(dest.destination);
                          window.scrollTo({ top: 320, behavior: 'smooth' });
                        }}
                        className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                      >
                        Pin to Map
                      </button>
                      <button 
                        onClick={() => triggerInstantPlan(dest.destination, dest.duration, dest.budget)}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-slate-950/10"
                      >
                        Explore Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. LUXURY PALACE STALWARTS RESORT PREVIEWS */}
      <div className="space-y-5 pt-6 text-left">
        <div>
          <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">Royal Hostels</span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Luxury Palace Resorts</h2>
          <p className="text-xs text-slate-500 mt-1">Taj-View terraces, floating island suites, and bespoke wellness sanctuaries</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleHotels.map((hot, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow hover:shadow-lg transition">
              <div className="relative h-44 bg-slate-100">
                <img src={hot.image} alt={hot.name} className="w-full h-full object-cover" />
                <span className="absolute top-2.5 left-2.5 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                  ⭐ {hot.rating} Royal Accredit
                </span>
                <span className="absolute bottom-2.5 right-2.5 bg-indigo-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md">
                  Taj Exclusive
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h4 className="font-extrabold text-sm text-slate-900">{hot.name}</h4>
                <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">📍 {hot.loc}</p>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-400 font-bold">Standard suite fare</span>
                  <span className="font-extrabold text-blue-600 font-mono">₹{hot.price.toLocaleString('en-IN')}/night</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. VOICE ASSISTANT MODAL SIMULATOR */}
      <AnimatePresence>
        {showVoiceSearch && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-800 text-white p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl"
            >
              <div className="flex justify-end">
                <button 
                  onClick={() => setShowVoiceSearch(false)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-full cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="relative flex items-center justify-center py-7">
                {/* Micro pulsating voice search rings */}
                <div className="absolute w-24 h-24 rounded-full bg-orange-600/20 animate-ping"></div>
                <div className="absolute w-16 h-16 rounded-full bg-orange-600/40 animate-pulse"></div>
                <div className="relative w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Mic className="h-5.5 w-5.5 text-white animate-bounce" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-extrabold tracking-tight">Tripverse India Voice Link</h3>
                <p className="text-xs text-slate-400 font-medium">Say a typical route or historical monument:</p>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs font-bold font-mono text-orange-400 min-h-[48px] flex items-center justify-center">
                  {voiceTranscript}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {voiceStage === 'listening' ? "🔴 Dynamic Listening..." : "⚡ Transcribing Speech Coordinates..."}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
