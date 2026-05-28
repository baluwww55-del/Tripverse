import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, DollarSign, Sparkles, RefreshCw, CloudSun, Bookmark, Download, Map as MapIcon, Hotel, Plane, Clock } from 'lucide-react';
import { DayItinerary, UserPreferences, SavedTrip } from '../types';
import { addActivityToCalendar, fetchGoogleChatSpaces, shareItineraryToGoogleChat, GoogleChatSpace } from '../workspace';
import RealIndiaMap from './RealIndiaMap';

interface SmartPlannerProps {
  searchDest: string;
  setSearchDest: (dest: string) => void;
  searchDays: number;
  setSearchDays: (days: number) => void;
  searchBudget: number;
  setSearchBudget: (budget: number) => void;
  userPrefs: UserPreferences;
  isGenerating: boolean;
  triggerGeneration: () => void;
  generatedPlan: any | null;
  bookingStatus: { type: 'hotel' | 'flight', name: string, reference: string } | null;
  setBookingStatus: (status: any) => void;
  handleSaveTrip: (plan: any) => void;
  simulatePrint: () => void;
  runSimulatedBooking: (type: 'hotel' | 'flight', name: string) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onPageChange: (page: string) => void;
  selectedTripView?: SavedTrip | null;
  setSelectedTripView?: (trip: SavedTrip | null) => void;
  currentPage?: string;
}

export default function SmartPlanner({
  searchDest,
  setSearchDest,
  searchDays,
  setSearchDays,
  searchBudget,
  setSearchBudget,
  userPrefs,
  isGenerating,
  triggerGeneration,
  generatedPlan,
  bookingStatus,
  setBookingStatus,
  handleSaveTrip,
  simulatePrint,
  runSimulatedBooking,
  canvasRef,
  onPageChange,
  selectedTripView,
  setSelectedTripView,
  currentPage
}: SmartPlannerProps) {

  // Google Workspace Integration States
  const [chatSpaces, setChatSpaces] = useState<GoogleChatSpace[]>([]);
  const [showSpacesList, setShowSpacesList] = useState<boolean>(false);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState<boolean>(false);
  const [chatStatusMessage, setChatStatusMessage] = useState<string>("");

  const getDayDateString = (dayNum: number): string => {
    try {
      const baseDateStr = activePlan?.startDate || new Date().toISOString().split('T')[0];
      const baseDate = new Date(baseDateStr);
      const targetDate = new Date(baseDate.getTime() + (dayNum - 1) * 24 * 60 * 60 * 1000);
      return targetDate.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const handleCalendarPublish = async (dayNum: number, act: any) => {
    const actDate = getDayDateString(dayNum);
    const result = await addActivityToCalendar(actDate, act, activePlan?.destination || searchDest);
    alert(result.message);
  };

  const handleChatPublishToggle = async () => {
    if (showSpacesList) {
      setShowSpacesList(false);
      return;
    }

    setIsLoadingSpaces(true);
    setChatStatusMessage("Loading your Google Chat Spaces...");
    const res = await fetchGoogleChatSpaces();
    setIsLoadingSpaces(false);

    if (res.success) {
      setChatSpaces(res.spaces);
      if (res.spaces.length === 0) {
        setChatStatusMessage("No Google Chat Spaces discovered in your account. Please create/join a Space first.");
      } else {
        setChatStatusMessage("");
      }
      setShowSpacesList(true);
    } else {
      alert(res.message);
    }
  };

  const executeChatShare = async (space: GoogleChatSpace) => {
    setChatStatusMessage(`Sharing itinerary to ${space.displayName}...`);
    const res = await shareItineraryToGoogleChat(
      space.name,
      space.displayName,
      activePlan?.destination || searchDest,
      activePlan?.daysCount || searchDays,
      activePlan?.budget || searchBudget
    );
    setChatStatusMessage("");
    setShowSpacesList(false);
    alert(res.message);
  };

  // Redraw path when variables or page settings align
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear with light background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Warm Background Grid - very soft gray
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

    // Topographical contours simulation in warm light blue
    ctx.strokeStyle = "rgba(37, 99, 235, 0.05)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(width * 0.35, height * 0.45, 45, 0, Math.PI * 2);
    ctx.arc(width * 0.75, height * 0.55, 75, 0, Math.PI * 2);
    ctx.stroke();

    // Coordinates points
    const startX = width * 0.15;
    const startY = height * 0.70;
    const mid1X = width * 0.40;
    const mid1Y = height * 0.30;
    const mid2X = width * 0.72;
    const mid2Y = height * 0.60;
    const endX = width * 0.88;
    const endY = height * 0.25;

    // Path Curve
    ctx.strokeStyle = "#2563EB";
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(mid1X, mid1Y, mid2X, mid2Y, endX, endY);
    ctx.stroke();
    ctx.setLineDash([]); // reset

    const nodes = [
      { x: startX, y: startY, label: "Airport Depot", color: "#10B981" },
      { x: mid1X, y: mid1Y, label: "Hotel Base", color: "#2563EB" },
      { x: mid2X, y: mid2Y, label: "Scenic Highlight", color: "#F59E0B" },
      { x: endX, y: endY, label: "Summit Point", color: "#EC4899" }
    ];

    nodes.forEach((n) => {
      // Outer pulse ring
      ctx.fillStyle = "rgba(37, 99, 235, 0.1)";
      ctx.beginPath();
      ctx.arc(n.x, n.y, 11, 0, Math.PI * 2);
      ctx.fill();

      // Core point
      ctx.fillStyle = n.color;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Tag Label
      ctx.fillStyle = "#334155";
      ctx.font = "bold 9px 'Inter', sans-serif";
      ctx.fillText(n.label, n.x - 22, n.y - 12);
    });

  }, [currentPage, generatedPlan, selectedTripView]);

  const activePlan = selectedTripView || generatedPlan;

  // Extract all active itinerary stop/activity names to pinpoint and trace on leaflet
  const activeStops: string[] = [];
  if (activePlan) {
    if (activePlan.destination) {
      activeStops.push(activePlan.destination);
    }
    if (activePlan.days) {
      activePlan.days.forEach((day: any) => {
        day.activities?.forEach((act: any) => {
          if (act.location && !activeStops.includes(act.location)) {
            activeStops.push(act.location);
          }
        });
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-12"
    >
      {/* Search Itinerary Configurations bar */}
      {!selectedTripView && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block ml-1">Destination Target</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-600" />
              <input 
                type="text" 
                value={searchDest}
                onChange={(e) => setSearchDest(e.target.value)}
                placeholder="e.g. Chanakyapuri, Delhi or Taj Residency, Agra"
                className="w-full bg-slate-50 border border-slate-200 py-3.5 pl-10 pr-4 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">
              <span>Duration</span>
              <span className="text-blue-600 font-extrabold">{searchDays} Days</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={searchDays}
              onChange={(e) => setSearchDays(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">
              <span>Total Budget Limit</span>
              <span className="text-emerald-600 font-extrabold">₹{searchBudget.toLocaleString('en-IN')}</span>
            </div>
            <input 
              type="range" 
              min="5000" 
              max="300000" 
              step="5000"
              value={searchBudget}
              onChange={(e) => setSearchBudget(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="pt-3 lg:pt-0">
            <button 
              onClick={triggerGeneration}
              disabled={isGenerating}
              className="w-full active-gradient text-white py-3.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-semibold"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Configuring custom routes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Build custom schedule</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Booking confirmations success box */}
      {bookingStatus && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between gap-4 animate-fade-in shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-emerald-600 text-base font-extrabold bg-emerald-100 w-7 h-7 rounded-full flex items-center justify-center">✓</span>
            <div>
              <h5 className="font-bold text-xs uppercase tracking-wide">Autonomous Reservation Complete</h5>
              <p className="text-[11px] text-emerald-600">Locked booking for "{bookingStatus.name}". Virtual reference: <strong className="text-slate-900 font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-xs">{bookingStatus.reference}</strong></p>
            </div>
          </div>
          <button onClick={() => setBookingStatus(null)} className="text-emerald-700 hover:text-emerald-800 font-bold text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Loading States animations */}
      {isGenerating && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-md space-y-4 text-center">
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 border-t-blue-600 animate-spin"></div>
          </div>
          <p className="text-sm font-semibold tracking-wide text-slate-800">Concierge Agent is detailing hours, checking weather projections, and sorting hotel options...</p>
          <p className="text-xs text-slate-500 italic max-w-sm mx-auto">"Matching dietary codes [{userPrefs.dietary}] and activity metrics of {userPrefs.preferredActivityLevel} intensity"</p>
        </div>
      )}

      {!isGenerating && !activePlan && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-md text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center rounded-2xl mx-auto border border-blue-100 shadow-sm">
            <Calendar className="h-6 w-6 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 leading-tight">Your Bespoke Schedule Awaits</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">Choose your vacation coordinates and days budget limit variables above, then trigger our AI custom itinerary builder!</p>
        </div>
      )}

      {/* Rich Generated Complete Board */}
      {!isGenerating && activePlan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Timeline lists */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header / Actions elements */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm">
                  <CloudSun className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Destination Climate Forecast</h4>
                  <p className="text-xs font-bold text-slate-800 mt-1">{activePlan.weatherSummary || "Spring Mild Atmosphere (18° - 24°C)"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto relative">
                <button 
                  onClick={handleChatPublishToggle}
                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer"
                  title="Share itinerary to Google Chat spaces"
                >
                  <span>💬 Chat Share</span>
                </button>

                {showSpacesList && (
                  <div className="absolute top-12 right-0 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 space-y-3 text-slate-100 text-left">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Share to Google Chat</span>
                      <button onClick={() => setShowSpacesList(false)} className="text-slate-400 hover:text-white text-xs leading-none">✕</button>
                    </div>
                    {isLoadingSpaces ? (
                      <div className="text-[10px] text-slate-400 py-2">Contacting Workspace API...</div>
                    ) : chatSpaces.length === 0 ? (
                      <div className="text-[10px] text-rose-300 py-1">{chatStatusMessage || "No Chat Spaces discovered."}</div>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {chatSpaces.map((sp) => (
                          <button
                            key={sp.name}
                            onClick={() => executeChatShare(sp)}
                            className="w-full text-left p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold block truncate transition cursor-pointer"
                          >
                            👥 {sp.displayName || sp.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!selectedTripView && (
                  <button 
                    onClick={() => handleSaveTrip(activePlan)}
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    <Bookmark className="h-4 w-4" />
                    <span>Archive Journey</span>
                  </button>
                )}
                <button 
                  onClick={simulatePrint}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-800 shadow-sm transition"
                  title="Export PDF copy"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Day list cards */}
            <div className="space-y-6">
              {activePlan.days?.map((dayObj: any) => (
                <div key={dayObj.day} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md relative overflow-hidden">
                  
                  {/* Day count banner */}
                  <div className="absolute top-0 right-0 py-2 px-5 bg-blue-50 border-l border-b border-blue-200 text-blue-700 text-xs font-black rounded-bl-2xl">
                    Day {dayObj.day}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#2563EB] font-black">Focus Theme</span>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">{dayObj.theme}</h3>
                    </div>

                    {/* Timeline line details */}
                    <div className="space-y-5 border-l-2 border-slate-200 ml-1.5 pl-4 pt-1">
                      {dayObj.activities?.map((act: any, actIdx: number) => (
                        <div key={actIdx} className="relative space-y-1">
                          
                          {/* Circle bullet index */}
                          <span className="absolute -left-[22.5px] top-1.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-sm"></span>
                          
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-semibold leading-none w-full">
                            <span className="text-blue-600 font-mono font-bold flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {act.time}</span>
                            <span>•</span>
                            <span className="text-slate-700 flex items-center gap-0.5"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {act.location}</span>
                            
                            {act.cost > 0 && (
                              <span className="bg-blue-50 border border-blue-100 text-blue-700 text-[9px] px-2 rounded font-bold uppercase">Budget: ₹{act.cost.toLocaleString('en-IN')}</span>
                            )}

                            <button
                              onClick={() => handleCalendarPublish(dayObj.day, act)}
                              className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-[9px] font-extrabold uppercase tracking-wide text-amber-700 transition cursor-pointer"
                              title="Add attraction event to Google Calendar"
                            >
                              <span>🗓️ Sync Calendar</span>
                            </button>
                          </div>
                          
                          <h4 className="font-extrabold text-sm text-slate-800 pt-0.5 leading-tight">{act.title}</h4>
                          <p className="text-xs text-slate-600 leading-normal font-medium">{act.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: Interactive Map Canvas, budget allocations, hotels */}
          <div className="space-y-6">
            
            {/* Visual Route Real Leaflet Map */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <MapIcon className="h-4.5 w-4.5 text-blue-600" />
                <span>Geographical Route Alignment</span>
              </h3>
              
              <div className="relative rounded-2xl overflow-hidden shadow-inner">
                <RealIndiaMap 
                  activeTripDestinations={activeStops} 
                  focusedDestinationName={activePlan?.destination}
                  height="260px"
                />
              </div>
            </div>

            {/* Budget Splits progress charts style */}
            {activePlan.budgetBreakdown && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none border-b border-slate-100 pb-2">Estimated Budget Split</h3>
                
                <div className="space-y-3.5 text-xs font-semibold text-slate-600">
                  <div>
                    <div className="flex justify-between mb-1 text-slate-500">
                      <span>Transport allocation</span>
                      <span className="font-extrabold text-slate-800">₹{activePlan.budgetBreakdown.flightsEstimated.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-slate-500">
                      <span>Luxe Heritage Stays</span>
                      <span className="font-extrabold text-slate-800">₹{activePlan.budgetBreakdown.hotelsEstimated.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-slate-500">
                      <span>Attractions & Sights passes</span>
                      <span className="font-extrabold text-slate-800">₹{activePlan.budgetBreakdown.activitiesEstimated.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center bg-slate-50 -mx-5 -mb-5 p-4 rounded-b-3xl">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Suggested Allowance</span>
                    <span className="text-base font-black text-blue-600 font-mono">₹{activePlan.budgetBreakdown.dailyAllowance.toLocaleString('en-IN')}/day</span>
                  </div>
                </div>
              </div>
            )}

            {/* Hotels suggestion match tags */}
            {activePlan.suggestedHotels?.length > 0 && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Hotel Reservation Matches</h3>
                
                <div className="space-y-2.5">
                  {activePlan.suggestedHotels.map((hot: any, hotIdx: number) => (
                    <div key={hotIdx} className="flex gap-2.5 items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-150">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-800 truncate leading-tight">{hot.name}</h4>
                        <p className="text-[10px] text-slate-500 truncate font-semibold">{hot.location || "Historic district"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-extrabold text-blue-600 font-mono">₹{hot.price.toLocaleString('en-IN')}/night</div>
                        <button 
                          onClick={() => runSimulatedBooking('hotel', hot.name)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer mt-1"
                        >
                          Book Stay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curated flight matches */}
            {activePlan.suggestedFlights?.length > 0 && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Curated Flight Connections</h3>
                
                <div className="space-y-2.5">
                  {activePlan.suggestedFlights.map((fl: any, flIdx: number) => (
                    <div key={flIdx} className="flex gap-2.5 items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-150">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-800 truncate leading-tight">{fl.carrier}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold">Duration: {fl.duration || "Non Stop"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-extrabold text-emerald-600 font-mono">₹{fl.price.toLocaleString('en-IN')}</div>
                        <button 
                          onClick={() => runSimulatedBooking('flight', fl.carrier)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer mt-1"
                        >
                          Book Seat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
