import React from 'react';
import { motion } from 'motion/react';
import { Compass, Sparkles, ChevronRight, Star } from 'lucide-react';
import { allDestinations } from '../data/travelData';

interface ExploreWorldProps {
  setSearchDest: (dest: string) => void;
  setSearchDays: (days: number) => void;
  setSearchBudget: (budget: number) => void;
  onPageChange: (page: string) => void;
  triggerGeneration: () => void;
}

export default function ExploreWorld({
  setSearchDest,
  setSearchDays,
  setSearchBudget,
  onPageChange,
  triggerGeneration
}: ExploreWorldProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-12"
    >
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <span className="p-2 rounded-xl bg-orange-50 text-orange-600 block shadow-sm"><Compass className="h-6 w-6" /></span>
          <span>Explore Incredible India</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Browse trending luxury and wellness destinations across India mapped by travel comfort metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {allDestinations.map((spot, idx) => (
          <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-lg flex flex-col sm:flex-row transform hover:scale-[1.01] transition-all duration-350">
            <div className="sm:w-1/2 relative h-56 sm:h-auto min-h-[220px]">
              <img src={spot.image} alt={spot.destination} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30"></div>
              <span className="absolute top-4 left-4 bg-orange-600 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                {spot.tag}
              </span>
            </div>
            
            <div className="p-6 sm:w-1/2 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center sm:gap-2">
                  <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 font-extrabold px-2.5 py-1 rounded-full uppercase shrink-0">
                    ⭐ {spot.rating || '4.9'} {spot.tag}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold truncate">{spot.location}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{spot.destination}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  {spot.description || `Immerse yourself in spectacular Indian landscapes during this bespoke travel experience with unique style traits.`}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="font-medium">Average Weather Forecast:</span>
                  <span className="font-extrabold text-slate-800">{spot.weather || 'Pleasant Core (24°C)'}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="font-medium">Curated Budget Guideline:</span>
                  <span className="font-extrabold text-[#D97706] text-sm font-mono">₹{spot.budget.toLocaleString('en-IN')}</span>
                </div>
                
                <button 
                  onClick={() => {
                    setSearchDest(spot.destination);
                    setSearchDays(spot.duration);
                    setSearchBudget(spot.budget);
                    onPageChange('planner');
                    // Timeout to let coordinates state process smoothly
                    setTimeout(() => {
                      triggerGeneration();
                    }, 50);
                  }}
                  className="w-full active-gradient text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-blue-500/10 hover:opacity-95"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Interactive Itinerary AI</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
