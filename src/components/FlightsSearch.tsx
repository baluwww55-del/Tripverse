import React from 'react';
import { motion } from 'motion/react';
import { Plane, Landmark, ArrowRight, Star, Clock } from 'lucide-react';
import { sampleFlights } from '../data/travelData';

interface FlightsSearchProps {
  flightOrigin: string;
  setFlightOrigin: (org: string) => void;
  flightTarget: string;
  setFlightTarget: (tar: string) => void;
  runSimulatedBooking: (type: 'hotel' | 'flight', name: string) => void;
  showNotification: (msg: string, type?: 'success' | 'error') => void;
  bookingStatus: { type: 'hotel' | 'flight', name: string, reference: string } | null;
  setBookingStatus: (status: any) => void;
}

export default function FlightsSearch({
  flightOrigin,
  setFlightOrigin,
  flightTarget,
  setFlightTarget,
  runSimulatedBooking,
  showNotification,
  bookingStatus,
  setBookingStatus
}: FlightsSearchProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-12"
    >
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-50 text-blue-600 block shadow-sm"><Plane className="h-6 w-6" /></span>
          <span>Bespoke Flight Finder</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Live simulated ticket tracker connecting high-end premium and executive airlines</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block ml-1">Departure Hub</label>
            <input 
              type="text" 
              value={flightOrigin}
              onChange={(e) => setFlightOrigin(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block ml-1">Destination Hub</label>
            <input 
              type="text" 
              value={flightTarget}
              onChange={(e) => setFlightTarget(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => {
                showNotification(`Filtering executive flight rosters from ${flightOrigin} to ${flightTarget}...`, 'success');
              }}
              className="w-full active-gradient hover:opacity-95 text-white py-3 rounded-xl text-xs font-bold font-semibold cursor-pointer shadow-md shadow-blue-500/10 transition duration-200"
            >
              Verify Real-time Seats
            </button>
          </div>
        </div>

        {/* Booking success badge */}
        {bookingStatus && bookingStatus.type === 'flight' && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg">✓</span>
              <div>
                <h5 className="font-bold text-xs uppercase tracking-wide">Boarding Pass Issued</h5>
                <p className="text-[11px] text-emerald-600">Locked carrier "{bookingStatus.name}". Boarding pass confirmation code: <span className="font-mono text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 ml-1 shadow-sm">{bookingStatus.reference}</span></p>
              </div>
            </div>
            <button 
              onClick={() => setBookingStatus(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold underline"
            >
              Okay
            </button>
          </div>
        )}

        {/* Flight Ticket Styles (MakeMyTrip Inspired) */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest block ml-1">Simulated Prime Seat Listings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleFlights.map((airline, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-sm flex justify-between items-center transition-all duration-200 gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-[10px] font-black flex items-center justify-center text-blue-700 shrink-0">
                      {airline.logo}
                    </span>
                    <h4 className="font-bold text-sm text-slate-800 truncate">{airline.carrier}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-400" /> {airline.duration}</span>
                    <span>•</span>
                    <span className="text-blue-600 font-semibold">{airline.type}</span>
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <div className="text-slate-400 text-[10px] font-semibold uppercase">One Way Ticket</div>
                  <div className="text-lg font-extrabold text-blue-600">${airline.price}</div>
                  <button 
                    onClick={() => runSimulatedBooking('flight', airline.carrier)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold px-4 py-1.5 rounded-lg cursor-pointer mt-1.5 shadow-sm transition"
                  >
                    Lock Seat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
