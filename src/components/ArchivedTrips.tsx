import React from 'react';
import { motion } from 'motion/react';
import { Bookmark, Trash2, Download, Map as MapIcon, Calendar, Star, DollarSign } from 'lucide-react';
import { SavedTrip } from '../types';

interface ArchivedTripsProps {
  savedTrips: SavedTrip[];
  selectedTripView: SavedTrip | null;
  setSelectedTripView: (trip: SavedTrip | null) => void;
  handleDeleteTrip: (id: string, e: React.MouseEvent) => void;
  simulatePrint: () => void;
  runSimulatedBooking: (type: 'hotel' | 'flight', name: string) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onPageChange: (page: string) => void;
}

export default function ArchivedTrips({
  savedTrips,
  selectedTripView,
  setSelectedTripView,
  handleDeleteTrip,
  simulatePrint,
  runSimulatedBooking,
  canvasRef,
  onPageChange
}: ArchivedTripsProps) {

  // Visual Route Drawing trigger inside specific calendar modal
  React.useEffect(() => {
    if (selectedTripView) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Background Grid - very soft gray
      ctx.strokeStyle = "rgba(15, 23, 42, 0.04)";
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 25) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let j = 0; j < height; j += 25) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
      }

      // Contour guide
      ctx.strokeStyle = "rgba(37, 99, 235, 0.05)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(width * 0.40, height * 0.50, 60, 0, Math.PI * 2);
      ctx.stroke();

      // Route parameters
      const startX = width * 0.15;
      const startY = height * 0.70;
      const mid1X = width * 0.45;
      const mid1Y = height * 0.35;
      const mid2X = width * 0.70;
      const mid2Y = height * 0.65;
      const endX = width * 0.88;
      const endY = height * 0.25;

      // Draw dashed path
      ctx.strokeStyle = "#2563EB";
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(mid1X, mid1Y, mid2X, mid2Y, endX, endY);
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      const nodes = [
        { x: startX, y: startY, label: "Port Entrance", color: "#10B981" },
        { x: mid1X, y: mid1Y, label: "Lodge Stay", color: "#2563EB" },
        { x: mid2X, y: mid2Y, label: "Activity Point", color: "#F59E0B" },
        { x: endX, y: endY, label: "Expedition Peak", color: "#EC4899" }
      ];

      nodes.forEach((n) => {
        ctx.fillStyle = "rgba(37, 99, 235, 0.1)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#334155";
        ctx.font = "bold 9px 'Inter', sans-serif";
        ctx.fillText(n.label, n.x - 22, n.y - 12);
      });
    }
  }, [selectedTripView]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 block shadow-sm"><Bookmark className="h-6 w-6" /></span>
            <span>Refined Archives</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Explore full day-by-day maps of travel schedules archived persistently inside the database</p>
        </div>
        {selectedTripView && (
          <button 
            onClick={() => setSelectedTripView(null)}
            className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2 px-4 rounded-xl text-slate-700 font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
          >
            📂 All Saved Trips
          </button>
        )}
      </div>

      {selectedTripView ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Detailed itinerary */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title header */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 py-1.5 px-4 bg-emerald-50 border-l border-b border-emerald-200 text-emerald-700 text-[10px] uppercase font-black tracking-widest rounded-bl-2xl">
                Archived
              </div>
              <h2 className="text-2xl font-black text-slate-900">{selectedTripView.destination}</h2>
              <p className="text-xs text-slate-500 font-medium pb-2">Estimated stay duration: {selectedTripView.startDate} to {selectedTripView.endDate} ({selectedTripView.daysCount} Days)</p>
              
              <button 
                onClick={simulatePrint}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
              >
                <Download className="h-4 w-4 text-blue-600" />
                <span>Simulate PDF Print Export</span>
              </button>
            </div>

            {/* Day timelines */}
            <div className="space-y-6">
              {selectedTripView.itinerary?.map((dayObj: any) => (
                <div key={dayObj.day} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md relative">
                  <span className="absolute top-0 right-0 py-1.5 px-4 bg-blue-50 text-blue-700 text-xs font-black border-l border-b border-blue-200 rounded-bl-2xl">
                    Day {dayObj.day}
                  </span>
                  
                  <div className="space-y-4">
                    <h3 className="text-base font-extrabold text-slate-800">{dayObj.theme}</h3>
                    
                    <div className="space-y-5 border-l-2 border-slate-200 pl-4 ml-1">
                      {dayObj.activities?.map((act: any, idx: number) => (
                        <div key={idx} className="space-y-1 relative">
                          <span className="absolute -left-[22.5px] top-1.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-sm"></span>
                          <div className="text-[10px] font-mono font-bold text-blue-600 flex items-center gap-1.5">
                            <span>{act.time}</span>
                            <span>•</span>
                            <span className="text-slate-400 font-medium">{act.location}</span>
                          </div>
                          <h4 className="text-xs font-extrabold text-slate-800">{act.title}</h4>
                          <p className="text-xs text-slate-500 leading-normal font-medium">{act.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right hand details cards */}
          <div className="space-y-6">
            
            {/* Embedded Tracker Map */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <MapIcon className="h-4.5 w-4.5 text-blue-600" />
                <span>GIS Route Tracer Map</span>
              </h3>
              
              <div className="relative rounded-2xl overflow-hidden border border-slate-150 shadow-inner">
                <canvas 
                  ref={canvasRef} 
                  width={300} 
                  height={180} 
                  className="w-full h-auto block"
                />
              </div>
            </div>

            {/* Recommended Stays Match */}
            {selectedTripView.hotels?.length > 0 && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none border-b border-slate-100 pb-2">Hotel Reservation Matches</h3>
                
                <div className="space-y-2.5">
                  {selectedTripView.hotels.map((h: any, hIdx: number) => (
                    <div key={hIdx} className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 border border-slate-150">
                      <h4 className="font-extrabold text-slate-850 leading-tight">{h.name}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold">{h.location || "Historic district"} • ~${h.price}/night</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flight Schedules matches */}
            {selectedTripView.flights?.length > 0 && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none border-b border-slate-100 pb-2">Archived Flight Links</h3>
                
                <div className="space-y-2.5">
                  {selectedTripView.flights.map((f: any, fIdx: number) => (
                    <div key={fIdx} className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 border border-slate-150">
                      <h4 className="font-bold text-slate-850 leading-tight">{f.carrier}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold">Travel duration: {f.duration} • Est: ${f.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        
        /* Saved list grid */
        <div className="space-y-4">
          {savedTrips.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-md space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto shadow-sm">
                <Bookmark className="h-6 w-6" />
              </div>
              <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto">You do not have any archived itineraries yet. Generate beautiful vacation plans using the Smart Planner and tap 'Archive Trip'!</p>
              
              <button 
                onClick={() => onPageChange('planner')}
                className="inline-flex active-gradient text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow shadow-blue-500/20"
              >
                Plan custom itinerary
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {savedTrips.map((trip) => (
                <div 
                  key={trip.id}
                  onClick={() => setSelectedTripView(trip)}
                  className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-blue-300 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer space-y-4 flex flex-col justify-between transform hover:-translate-y-1"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 leading-tight">{trip.destination}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-bold">{trip.startDate} — {trip.daysCount} Days Plan</p>
                      </div>
                      
                      <button 
                        onClick={(e) => handleDeleteTrip(trip.id, e)}
                        className="p-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-100 transition shadow-sm cursor-pointer"
                        title="Delete legacy folder"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs pt-2.5 border-t border-slate-100 font-medium text-slate-600">
                      <div className="flex justify-between">
                        <span>Estimation Budget:</span>
                        <span className="font-extrabold text-blue-600">${trip.budget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profile Class:</span>
                        <span className="font-extrabold text-slate-700 capitalize">{trip.budgetLevel}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedTripView(trip)}
                    className="w-full bg-slate-50 hover:bg-blue-50 border border-slate-150 py-2.5 rounded-xl text-xs text-blue-600 hover:text-blue-700 font-bold tracking-tight transition text-center shadow-xs"
                  >
                    View Day-wise Itinerary
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
