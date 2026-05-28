import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Bookmark, DollarSign, Clock, Activity, ArrowRight, User } from 'lucide-react';
import { SavedTrip, UserPreferences } from '../types';
import WeatherWidget from './WeatherWidget';

interface TravelDashboardProps {
  savedTrips: SavedTrip[];
  userPrefs: UserPreferences;
  onPageChange: (page: string) => void;
  setSelectedTripView: (trip: SavedTrip | null) => void;
}

export default function TravelDashboard({
  savedTrips,
  userPrefs,
  onPageChange,
  setSelectedTripView
}: TravelDashboardProps) {

  const cumulativeBudget = savedTrips.reduce((acc, t) => acc + (t.budget || 0), 0);
  const cumulativeDays = savedTrips.reduce((acc, t) => acc + (t.daysCount || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-12"
    >
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-50 text-blue-600 block shadow-sm"><LayoutDashboard className="h-6 w-6" /></span>
          <span>Travel Command Center</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Unified holiday dashboard detailing cumulative balances, weather summaries, and historical schedules</p>
      </div>

      {/* Modern High-End Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
            <Bookmark className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{savedTrips.length}</div>
            <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Archived Journeys</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">${cumulativeBudget}</div>
            <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Total Allocation</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{cumulativeDays} Days</div>
            <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Cumulative Duration</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">Synchronized</div>
            <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Concierge Link</div>
          </div>
        </div>
      </div>

      {/* 5-Day Interactive Weather Intelligence Area */}
      <WeatherWidget savedTrips={savedTrips} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left pane: Archived Route Sequences */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Archived Route Sequences</h3>
          
          {savedTrips.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">
              No travel sequences logged yet. Use the Smart Planner to design your first custom escape!
            </div>
          ) : (
            <div className="space-y-4">
              {savedTrips.map((trip) => (
                <div 
                  key={trip.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-150 hover:border-blue-300 transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-900 leading-tight">{trip.destination}</h4>
                    <p className="text-xs text-slate-500 font-medium">Dates: {trip.startDate} to {trip.endDate} • {trip.daysCount} Days</p>
                  </div>
                  
                  <div className="flex gap-2.5 items-center w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-sm font-black text-blue-600">${trip.budget}</span>
                    <button 
                      onClick={() => {
                        setSelectedTripView(trip);
                        onPageChange('saved');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] px-4 py-2 rounded-xl font-bold cursor-pointer transition shadow-sm"
                    >
                      Bespoke Itinerary
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right pane: Traveler Signature */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <User className="h-4.5 w-4.5 text-blue-600" />
            <span>Smart Personal Signature</span>
          </h3>
          
          <div className="space-y-4 text-xs font-medium text-slate-600">
            <div className="flex justify-between items-center py-2 border-b border-slate-105">
              <span>Primary Traveler:</span>
              <span className="font-extrabold text-slate-900">{userPrefs.name}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-105">
              <span>Verified Email:</span>
              <span className="text-blue-600 font-semibold">{userPrefs.email}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-105">
              <span>Budget Class:</span>
              <span className="bg-blue-50 text-blue-600 font-extrabold px-3 py-1 rounded-full uppercase text-[9px] border border-blue-100">
                {userPrefs.budgetLevel}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-105">
              <span>Style Focus:</span>
              <span className="text-right text-indigo-600 font-extrabold capitalize">{userPrefs.travelStyle.join(', ')}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-105">
              <span>Dietary Requirement:</span>
              <span className="text-emerald-600 font-extrabold">{userPrefs.dietary}</span>
            </div>

            <button 
              onClick={() => onPageChange('profile')}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-2.5 rounded-xl font-bold uppercase text-[9px] tracking-wider transition-all cursor-pointer shadow-sm text-center"
            >
              Configure Travel Specifications
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
