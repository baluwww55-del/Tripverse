import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, DollarSign, CloudSun, Compass, ArrowRight, Star, ChevronRight } from 'lucide-react';
import { UserPreferences } from '../types';
import { popularSpots } from '../data/travelData';

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-12 pb-12"
    >
      {/* Immersive Travel Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden glass p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row gap-8 items-center border border-slate-200/50 shadow-xl mt-2 bg-gradient-to-br from-orange-50/60 via-amber-50/40 to-white">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50/95 via-white/80 to-transparent z-0"></div>
        {/* Splendid luxury Taj Mahal at sunrise */}
        <div className="absolute inset-0 w-full h-full -z-10 bg-[url('https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10"></div>

        <div className="relative z-10 flex-1 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs font-semibold text-orange-700">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            Smart Concierge Model Loaded: Gemini 3.5 Flash (India Core)
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-slate-900">
            Plan Smarter.<br />
            <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-indigo-600 bg-clip-text text-transparent">Explore India.</span>
          </h1>
          
          <p className="text-slate-600 text-base sm:text-lg max-w-lg leading-relaxed font-medium">
            Tripverse connects intelligent local travel companions to calibrate personalized Indian itineraries, discover ancient roots, book Taj-View stays, and organize heritage railways across our beautiful sub-continent.
          </p>

          {/* Quick interactive shortcut tabs of MakeMyTrip */}
          <div className="flex flex-wrap gap-2 pt-2" id="mmt-booking-tabs">
            <button 
              onClick={() => onPageChange('planner')}
              className="px-4 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 shadow-sm text-xs transition duration-200"
            >
              🗺️ Smart Planner
            </button>
            <button 
              onClick={() => onPageChange('flights')}
              className="px-4 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 shadow-sm text-xs transition duration-200"
            >
              ✈️ Direct Flights
            </button>
            <button 
              onClick={() => onPageChange('hotels')}
              className="px-4 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 shadow-sm text-xs transition duration-200"
            >
              🏨 Boutique Palace Stays
            </button>
          </div>

          {/* Floating Search Widget */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl bg-white p-2 rounded-2xl border border-slate-200 shadow-md">
            <div className="flex-1 flex items-center gap-2.5 px-3">
              <MapPin className="h-5 w-5 text-orange-600 shrink-0" />
              <input 
                type="text" 
                placeholder="Where in India is your next dream escape?" 
                className="bg-transparent border-0 outline-none text-sm w-full text-slate-800 placeholder-slate-400 font-medium"
                value={searchDest}
                onChange={(e) => setSearchDest(e.target.value)}
              />
            </div>
            <button 
              onClick={() => triggerInstantPlan(searchDest, 4, 75000)}
              className="bg-gradient-to-r from-orange-600 to-amber-500 hover:opacity-95 text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/20 transition-all"
            >
              <span>Formulate Incredible Trip</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Micro info tag lines */}
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 pt-2">
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-orange-600" /> Multi-Day Traditional Timelines</span>
            <span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-emerald-600" /> Transparent INR Rupee Pricing</span>
            <span className="flex items-center gap-1.5"><CloudSun className="h-4 w-4 text-amber-500" /> Monsoon & UV Weather Alerts</span>
          </div>
        </div>

        {/* Dynamic Concierge Assistant Status Box */}
        <div className="relative z-10 w-full lg:w-96 space-y-4">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center justify-between border-b pb-2">
              <span>Bespoke Concierge Panel</span>
              <span className="text-emerald-600 flex items-center gap-1 font-extrabold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> SECURE</span>
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">SP</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Smart Planner</span>
                    <span className="text-[10px] text-blue-600 font-semibold">Active Match</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">Calibrates transfers, hours and slots</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">TG</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Trip Guide</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Ready</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">Advises cultural etiquette & landmarks</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs">TS</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Traveler Style Profile</span>
                    <span className="text-[10px] text-purple-600 font-semibold">Synced</span>
                  </div>
                  <p className="text-[10px] text-indigo-600 truncate font-semibold">Priority: {userPrefs.travelStyle.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Holidays Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Trending Indian Holidays</h2>
            <p className="text-sm text-slate-500">Luxury escapes automatically calibrated with curated activity layers</p>
          </div>
          <button 
            onClick={() => onPageChange('explore')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>See more escapes</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularSpots.map((spot, idx) => (
            <div 
              key={idx} 
              onClick={() => triggerInstantPlan(spot.destination, spot.duration, spot.budget)}
              className="bg-white rounded-2xl overflow-hidden group hover:shadow-xl border border-slate-200/60 cursor-pointer shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={spot.image} 
                  alt={spot.destination} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
                <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                  {spot.tag}
                </span>
                <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-amber-400 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  4.9
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h4 className="font-bold text-base text-slate-900 leading-tight">{spot.destination}</h4>
                <p className="text-[11px] text-slate-500 font-semibold">{spot.style}</p>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-150">
                  <span className="text-slate-500 font-medium">{spot.duration} Days Escape</span>
                  <span className="font-bold text-blue-600">Est: ₹{spot.budget.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
          <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">45,800+</div>
          <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">Planned Journeys</div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">Day-wise scheduled activities calculated matching user guidelines.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
          <div className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">99.4%</div>
          <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">Client Satisfaction</div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">Accurate transfers mapping dietary locks and transport styles.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
          <div className="text-3xl font-black bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">&lt; 3 Sec</div>
          <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">Concierge Dispatch</div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">Instant coordinate indexing leveraging Gemini 3.5 Flash engines.</p>
        </div>
      </div>
    </motion.div>
  );
}
