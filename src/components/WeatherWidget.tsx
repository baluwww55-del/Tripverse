import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  CloudDrizzle, 
  Wind, 
  Droplets, 
  Sunset, 
  MapPin, 
  Search, 
  AlertCircle,
  Calendar,
  Pin
} from 'lucide-react';
import { SavedTrip } from '../types';

interface WeatherForecastDay {
  day: string;
  tempMin: number;
  tempMax: number;
  condition: string;
  rainChance: number;
}

interface WeatherData {
  destination: string;
  currentTemp: number;
  currentCondition: string;
  humidity: number;
  windSpeed: number;
  sunsetTime: string;
  advisory: string;
  aiRecommendation: string;
  forecast: WeatherForecastDay[];
}

interface WeatherWidgetProps {
  savedTrips: SavedTrip[];
  defaultDestination?: string;
}

const getWeatherIcon = (condition: string) => {
  const cond = condition.toLowerCase();
  if (cond.includes('clear') || cond.includes('sunny') || cond.includes('bright')) {
    return <Sun className="h-6 w-6 text-amber-500 animate-spin-slow" />;
  }
  if (cond.includes('lightning') || cond.includes('thunder') || cond.includes('storm')) {
    return <CloudLightning className="h-6 w-6 text-purple-500" />;
  }
  if (cond.includes('rain') || cond.includes('shower') || cond.includes('drizzle')) {
    return <CloudRain className="h-6 w-6 text-blue-500" />;
  }
  if (cond.includes('drizzle') || cond.includes('mist') || cond.includes('fog')) {
    return <CloudDrizzle className="h-6 w-6 text-teal-500 animate-pulse" />;
  }
  return <Cloud className="h-6 w-6 text-slate-400" />;
};

export default function WeatherWidget({ savedTrips, defaultDestination }: WeatherWidgetProps) {
  // Determine pinned destination from localStorage
  const [pinnedDest, setPinnedDest] = useState<string | null>(() => {
    try {
      return localStorage.getItem("pinned_weather_destination");
    } catch {
      return null;
    }
  });

  // Determine primary destination
  const primarySavedDest = savedTrips.length > 0 ? savedTrips[0].destination : undefined;
  
  // Custom helper to decide the initial selected destination prioritizing the user's pinned choice
  const getInitialDestination = () => {
    if (pinnedDest) return pinnedDest;
    if (defaultDestination) return defaultDestination;
    if (primarySavedDest) return primarySavedDest;
    return "Taj Mahal, Agra";
  };

  const [selectedDest, setSelectedDest] = useState<string>(getInitialDestination);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If saving state changes default trip, auto-update ONLY if there is no pinned preference
    if (primarySavedDest && !defaultDestination && !pinnedDest) {
      setSelectedDest(primarySavedDest);
    }
  }, [primarySavedDest, pinnedDest, defaultDestination]);

  const handleTogglePin = (destinationName: string) => {
    try {
      if (pinnedDest?.toLowerCase() === destinationName.toLowerCase()) {
        localStorage.removeItem("pinned_weather_destination");
        setPinnedDest(null);
      } else {
        localStorage.setItem("pinned_weather_destination", destinationName);
        setPinnedDest(destinationName);
      }
    } catch (e) {
      console.error("Local storage pin save fail:", e);
    }
  };

  const fetchWeather = async (dest: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/weather?destination=${encodeURIComponent(dest)}`);
      if (!response.ok) {
        throw new Error("Unable to contact Weather Intelligence System.");
      }
      const data = await response.json();
      setWeather(data);
    } catch (err: any) {
      setError(err.message || "Weather query failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedDest);
  }, [selectedDest]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSelectedDest(searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-6" id="weather-dashboard-widget">
      
      {/* Widget Header & Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <Cloud className="h-5 w-5 text-sky-500" />
            <span>Voyage Weather Outlook (5-Day)</span>
          </h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Live conditions linked with AI-driven travel recommendations</p>
        </div>

        {/* Dynamic drop-down & search bar combo */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedDest}
            onChange={(e) => setSelectedDest(e.target.value)}
            className="bg-slate-50 border border-slate-250 py-1.5 px-3 rounded-xl text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm w-full sm:w-auto"
          >
            {savedTrips.length > 0 && (
              <optgroup label="Saved Holiday Destinations">
                {savedTrips.map((t) => {
                  const isPinned = pinnedDest?.toLowerCase() === t.destination.toLowerCase();
                  return (
                    <option key={t.id} value={t.destination}>
                      {isPinned ? "📌 " : ""}{t.destination} ({t.daysCount} Days)
                    </option>
                  );
                })}
              </optgroup>
            )}
            {pinnedDest && !savedTrips.some(t => t.destination.toLowerCase() === pinnedDest.toLowerCase()) && 
             !["agra", "bengaluru", "goa", "kashmir", "ladakh", "srinagar", "leh", "srinagar, kashmir", "leh, ladakh"].includes(pinnedDest.toLowerCase()) && (
              <optgroup label="Pinned Default">
                <option value={pinnedDest}>📌 {pinnedDest}</option>
              </optgroup>
            )}
            <optgroup label="Quick Check Fallbacks">
              <option value="Agra">{pinnedDest?.toLowerCase() === "agra" ? "📌 " : ""}Agra, UP</option>
              <option value="Bengaluru">{pinnedDest?.toLowerCase() === "bengaluru" ? "📌 " : ""}Bengaluru, KA</option>
              <option value="Goa">{pinnedDest?.toLowerCase() === "goa" ? "📌 " : ""}Goa Beaches</option>
              <option value="Kashmir">{(pinnedDest?.toLowerCase() === "kashmir" || pinnedDest?.toLowerCase() === "srinagar, kashmir") ? "📌 " : ""}Srinagar, Kashmir</option>
              <option value="Ladakh">{(pinnedDest?.toLowerCase() === "ladakh" || pinnedDest?.toLowerCase() === "leh, ladakh") ? "📌 " : ""}Leh, Ladakh</option>
            </optgroup>
          </select>

          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-48">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Check another city..."
              className="w-full bg-slate-50 border border-slate-200 py-1.5 pl-8 pr-3 rounded-xl text-[11px] font-semibold text-slate-850 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-slate-400" />
          </form>
        </div>
      </div>

      {/* Main Weather Display Area */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="weather-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-16 flex flex-col items-center justify-center space-y-3"
          >
            <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-sky-500 animate-spin"></div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">Consulting Weather Telemetry Database...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="weather-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 flex flex-col items-center justify-center text-center space-y-2 bg-rose-50 rounded-2xl border border-rose-100 p-4"
          >
            <AlertCircle className="h-8 w-8 text-rose-500" />
            <p className="text-xs font-bold text-rose-800 uppercase tracking-wide">Telemetry Route Offline</p>
            <p className="text-xs text-rose-600 font-medium max-w-sm">{error}</p>
            <button
              onClick={() => fetchWeather(selectedDest)}
              className="mt-3 bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-extrabold px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-all"
            >
              Retry Connection
            </button>
          </motion.div>
        ) : weather ? (
          <motion.div
            key="weather-ready"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Top row - Current & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Big Stats Card */}
              <div className="md:col-span-1 bg-gradient-to-br from-slate-50 to-[#F1F5F9] border border-slate-150 p-5 rounded-3xl flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-slate-500">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="h-4 w-4 shrink-0 text-sky-500" />
                      <span className="text-xs font-bold truncate tracking-wide max-w-[120px] sm:max-w-[150px]" title={weather.destination}>
                        {weather.destination}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTogglePin(weather.destination)}
                      className={`p-1 w-7 h-7 flex items-center justify-center rounded-xl transition-all duration-250 cursor-pointer border shrink-0 ${
                        pinnedDest?.toLowerCase() === weather.destination.toLowerCase()
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm hover:bg-amber-600'
                          : 'bg-white text-slate-400 border-slate-200 hover:text-slate-650 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                      title={pinnedDest?.toLowerCase() === weather.destination.toLowerCase() ? "Pinned as default loader" : "Pin destination as your default dashboard weather"}
                      aria-label="Pin default destination"
                    >
                      <Pin className={`h-3.5 w-3.5 ${pinnedDest?.toLowerCase() === weather.destination.toLowerCase() ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-slate-900 font-mono tracking-tighter">{weather.currentTemp}°</span>
                    <span className="text-lg font-bold text-slate-400 italic font-mono">C</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {getWeatherIcon(weather.currentCondition)}
                    <span className="text-xs font-bold text-slate-800">{weather.currentCondition}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-200/60 pt-3.5">
                  <div className="text-center">
                    <div className="flex justify-center text-slate-400 mb-0.5"><Droplets className="h-3.5 w-3.5" /></div>
                    <div className="text-[10px] font-bold text-slate-800 font-mono">{weather.humidity}%</div>
                    <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Humidity</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center text-slate-400 mb-0.5"><Wind className="h-3.5 w-3.5" /></div>
                    <div className="text-[10px] font-bold text-slate-800 font-mono">{weather.windSpeed} km/h</div>
                    <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Wind</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center text-slate-400 mb-0.5"><Sunset className="h-3.5 w-3.5 text-amber-500 animate-pulse" /></div>
                    <div className="text-[10px] font-bold text-slate-800 font-mono truncate">{weather.sunsetTime || "6:30 PM"}</div>
                    <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Sunset</div>
                  </div>
                </div>
              </div>

              {/* Right Columns: 5-Day forecast Row */}
              <div className="md:col-span-2 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5 mb-3">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>5-Day Calendar Forecast</span>
                  </h4>
                  <div className="grid grid-cols-5 gap-2.5">
                    {weather.forecast.map((day, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50/50 p-2.5 rounded-2xl border border-slate-150/70 hover:border-sky-200 hover:bg-white transition-all duration-200 text-center flex flex-col justify-between h-32"
                      >
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">{day.day}</span>
                        <div className="my-1.5 flex justify-center">{getWeatherIcon(day.condition)}</div>
                        
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-700 leading-none">{day.tempMax}° / <span className="text-slate-400">{day.tempMin}°</span></span>
                          <span className="text-[8px] font-semibold text-slate-400 truncate mt-1 leading-none">{day.condition}</span>
                        </div>

                        {day.rainChance > 20 ? (
                          <div className="text-[8px] font-black text-blue-500 mt-1 leading-none font-mono tracking-tighter">☔ {day.rainChance}%</div>
                        ) : (
                          <div className="text-[8px] font-semibold text-slate-400 mt-1 leading-none font-mono">⛅ 0%</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-3 flex gap-2.5 items-center mt-3 sm:mt-0">
                  <div className="p-1 px-2.5 rounded-lg bg-white border border-sky-100 text-[10px] font-black uppercase text-sky-600 shadow-xs shrink-0 font-mono">
                    ALERT
                  </div>
                  <p className="text-[11px] text-slate-605 font-semibold leading-relaxed truncate">
                    {weather.advisory || "Favorable holiday transit corridors expected throughout the region."}
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom: Customized AI Recommendations Block */}
            <div className="bg-[#FFFBEB] border border-[#FDE68A] p-4 rounded-3xl space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#D97706] uppercase tracking-wider">
                <span className="animate-ping h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                <span>VoyageAI Smart Forecast Recommendation</span>
              </div>
              <p className="text-xs font-bold text-slate-700 leading-relaxed font-sans">
                {weather.aiRecommendation || "Take comfortable light wool layers. Ideal weather for sunset strolls along scenic historical avenues."}
              </p>
            </div>

          </motion.div>
        ) : null}
      </AnimatePresence>

    </div>
  );
}
