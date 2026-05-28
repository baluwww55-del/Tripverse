import React from 'react';
import { motion } from 'motion/react';
import { Hotel, MapPin, Star, ThumbsUp, Users } from 'lucide-react';
import { sampleHotels } from '../data/travelData';

interface HotelsSearchProps {
  hotelTarget: string;
  setHotelTarget: (tar: string) => void;
  runSimulatedBooking: (type: 'hotel' | 'flight', name: string) => void;
  showNotification: (msg: string, type?: 'success' | 'error') => void;
  bookingStatus: { type: 'hotel' | 'flight', name: string, reference: string } | null;
  setBookingStatus: (status: any) => void;
}

export default function HotelsSearch({
  hotelTarget,
  setHotelTarget,
  runSimulatedBooking,
  showNotification,
  bookingStatus,
  setBookingStatus
}: HotelsSearchProps) {
  const customAmenities = [
    ["Infinity Pool", "Onsen Spa", "Free WiFi"],
    ["Private Beach", "Jungle Views", "Yoga Deck"],
    ["City Skyline", "Coffee Bar", "Workspace Lounge"]
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-12"
    >
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-50 text-blue-600 block shadow-sm"><Hotel className="h-6 w-6" /></span>
          <span>Boutique Hotels & Lodges</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Discover luxury resorts, verified ryokans, and wellness spaces selected for holiday comfort</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block ml-1">City or Landmark Coordinates</label>
            <input 
              type="text" 
              value={hotelTarget}
              onChange={(e) => setHotelTarget(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => showNotification(`Scanning boutique parameters in "${hotelTarget}"...`, 'success')}
              className="w-full active-gradient hover:opacity-95 text-white py-3 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-blue-500/10 transition duration-200"
            >
              Verify Stays
            </button>
          </div>
        </div>

        {/* Booking success overlay */}
        {bookingStatus && bookingStatus.type === 'hotel' && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg">✓</span>
              <div>
                <h5 className="font-bold text-xs uppercase tracking-wide">Reservation Voucher Generated</h5>
                <p className="text-[11px] text-emerald-600">Successfully reserved rooms at "{bookingStatus.name}". Reservation ID: <span className="font-mono text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 ml-1 shadow-sm">{bookingStatus.reference}</span></p>
              </div>
            </div>
            <button 
              onClick={() => setBookingStatus(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold underline"
            >
              Acknowledge
            </button>
          </div>
        )}

        {/* Airbnb style card grids */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
          {sampleHotels.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="relative h-44 w-full">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover animate-fade-in" />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm shadow px-2 py-1 rounded-md text-[10px] font-bold text-slate-800 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{item.rating}</span>
                  </div>
                  <span className="absolute bottom-3 left-3 bg-blue-600/90 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Verified Exclusive
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-bold text-base text-slate-900 leading-tight">{item.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium"><MapPin className="h-3 w-3 text-slate-400" /> {item.loc}</p>
                  </div>

                  {/* Amenities chips */}
                  <div className="flex flex-wrap gap-1">
                    {customAmenities[idx % customAmenities.length].map((ame, aIdx) => (
                      <span key={aIdx} className="bg-slate-50 border border-slate-150 text-slate-600 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                        {ame}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="text-left">
                  <span className="text-[9px] text-slate-400 uppercase font-black block leading-none">Starting from</span>
                  <span className="text-base font-extrabold text-blue-600">₹{item.price.toLocaleString('en-IN')}<span className="text-slate-500 font-medium text-xs">/night</span></span>
                </div>
                <button 
                  onClick={() => runSimulatedBooking('hotel', item.name)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer shadow-sm transition"
                >
                  Book Stay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
