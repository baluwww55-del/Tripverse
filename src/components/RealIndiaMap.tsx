import React, { useEffect, useRef, useState } from 'react';
import { allDestinations, PopularSpot } from '../data/travelData';

interface RealIndiaMapProps {
  activeTripDestinations?: string[]; // destinations in current active itinerary
  focusedDestinationName?: string; // a destination to zoom to and highlight
  onSelectDestination?: (dest: PopularSpot) => void;
  height?: string;
  interactive?: boolean;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function RealIndiaMap({
  activeTripDestinations = [],
  focusedDestinationName,
  onSelectDestination,
  height = "400px",
  interactive = true
}: RealIndiaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [name: string]: any }>({});
  const polylineRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Leaflet CDN script and style
  useEffect(() => {
    if (window.L) {
      setIsLoaded(true);
      return;
    }

    // Insert Leaflet stylesheet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Insert Leaflet script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      setIsLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Do not remove in case sibling maps need it, but clean up references if needed
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!isLoaded || !containerRef.current || mapInstanceRef.current) return;

    // CartoDB Positron offers an elegant, clean grey visual styled like Google Travel / Airbnb maps
    const map = window.L.map(containerRef.current, {
      center: [21.5, 78.9], // Central India
      zoom: 5,
      zoomControl: interactive,
      scrollWheelZoom: interactive,
      dragging: interactive,
      doubleClickZoom: interactive
    });

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Direct explore callback via map
    (window as any).exploreFromMap = (destName: string) => {
      const match = allDestinations.find(d => d.destination === destName);
      if (match && onSelectDestination) {
        onSelectDestination(match);
      }
    };

    // Helper variables for supreme travel info
    const getNearestTransport = (dest: string): string => {
      const d = dest.toLowerCase();
      if (d.includes("taj")) return "✈️ Agra Air Base (12km) / 🚉 Agra Cantt Junction";
      if (d.includes("mysore")) return "✈️ Mysore Airport (YMY) / 🚉 Mysuru Central Rail";
      if (d.includes("hampi")) return "✈️ Vidyanagar (35km) / 🚉 Hospet Junction";
      if (d.includes("kerala") || d.includes("alappuzha")) return "✈️ Cochin Int'l Airport (80km) / 🚉 Alappuzha Station";
      if (d.includes("goa")) return "✈️ Manohar Int'l Mopa / 🚉 Margao Junction Station";
      if (d.includes("jaipur")) return "✈️ Sanganer Int'l Airport (JAI) / 🚉 Jaipur Junction";
      if (d.includes("leh") || d.includes("ladakh")) return "✈️ Kushok Bakula Rimpochee Airport (LEH)";
      if (d.includes("kashmir")) return "✈️ Srinagar Airport (SXR) / 🚉 Banihal Railway";
      if (d.includes("golden") || d.includes("amritsar")) return "✈️ Sri Guru Ram Dass Jee Airport / 🚉 Amritsar Cantt";
      if (d.includes("minar") || d.includes("qutub") || d.includes("red fort") || d.includes("delhi")) return "✈️ Indira Gandhi Int'l (DEL) / 🚉 New Delhi Hub";
      if (d.includes("konark")) return "✈️ Biju Patnaik Airport (BHU) / 🚉 Puri Railway Station";
      if (d.includes("meenakshi") || d.includes("madurai")) return "✈️ Madurai Airport (IXM) / 🚉 Madurai Central";
      if (d.includes("ajanta") || d.includes("ellora")) return "✈️ Aurangabad Airport (IXU) / 🚉 Aurangabad Junction";
      if (d.includes("coorg")) return "✈️ Kannur Airport (CNN) / 🚉 Mysore Cantt Rail";
      if (d.includes("ooty")) return "✈️ Coimbatore Int'l (CJB) / 🚉 Udhagamandalam Steam Rail";
      if (d.includes("munnar")) return "✈️ Cochin Int'l (COK) / 🚉 Aluva Rail Terminal";
      return "✈️ Local Regional Airport Hub & Express Railway Links";
    };

    const getDistanceEstimate = (dest: string): string => {
      const d = dest.toLowerCase();
      if (d.includes("taj")) return "🚗 5.2 km from Agra Cantt Station";
      if (d.includes("mysore")) return "🚗 1.8 km from City Bus Stand";
      if (d.includes("hampi")) return "🚗 14 km from Hospet Junction Railway";
      if (d.includes("kerala") || d.includes("alappuzha")) return "🚗 4.5 km from Alappuzha Beach";
      if (d.includes("goa")) return "🚗 12 km from Madgaon Hub";
      if (d.includes("jaipur")) return "🚗 8.3 km from Jaipur Junction";
      if (d.includes("leh") || d.includes("ladakh")) return "🚗 3 km from Leh Palace";
      if (d.includes("kashmir")) return "🚗 6.8 km from Lal Chowk Srinagar";
      if (d.includes("golden") || d.includes("amritsar")) return "🚗 2.1 km from Amritsar Junction";
      if (d.includes("minar") || d.includes("qutub")) return "🚗 0.5 km from Qutub Minar Metro";
      if (d.includes("red fort")) return "🚗 1.2 km from Chandni Chowk Metro";
      if (d.includes("konark")) return "🚗 35 km from Puri Railway Terminal";
      if (d.includes("meenakshi") || d.includes("madurai")) return "🚗 0.9 km from Madurai Junction";
      if (d.includes("ajanta") || d.includes("ellora")) return "🚗 28 km from Aurangabad Central";
      if (d.includes("coorg")) return "🚗 82 km from Subrahmanya Road Rail";
      if (d.includes("ooty")) return "🚗 1.5 km from Ooty Botanical Garden";
      if (d.includes("munnar")) return "🚗 2.2 km from Munnar Headworks Dam";
      return "🚗 4.5 km from Nearest Transit Hub";
    };

    const getAiRecommendation = (dest: string): string => {
      const d = dest.toLowerCase();
      if (d.includes("taj")) return "✨ AI Recommendation: View from Mehtab Bagh at Sunset to avoid crowd congestion.";
      if (d.includes("mysore")) return "✨ AI Recommendation: Weekend illumination of 97,000 bulbs starts exactly at 7:00 PM.";
      if (d.includes("hampi")) return "✨ AI Recommendation: Hire a coracle boat at Sanapur Lake for dramatic basalt scenery.";
      if (d.includes("kerala")) return "✨ AI Recommendation: Pre-book dynamic overnight Kettuvallam houseboats during October dry spell.";
      if (d.includes("goa")) return "✨ AI Recommendation: Head to Galgibaga beach to spot protected Olive Ridley turtle sanctuaries.";
      if (d.includes("jaipur")) return "✨ AI Recommendation: Visit Stepwell Panna Meena ka Kund at sunrise for pure geometric shots.";
      if (d.includes("leh")) return "✨ AI Recommendation: Acclimatize for 24 hours inside Leh bazaar before high altitude passes.";
      if (d.includes("kashmir")) return "✨ AI Recommendation: Try a local saffron Kehwa tea at a floating market stall on Dal Lake.";
      if (d.includes("golden")) return "✨ AI Recommendation: Relish the overnight community Langar kitchen, feeding 100,000 daily.";
      if (d.includes("konark")) return "✨ AI Recommendation: Stand between wheels of Konark's sun chariot to calculate time using sundial shadows.";
      if (d.includes("meenakshi")) return "✨ AI Recommendation: Attend the vibrant Night Ceremony starting precisely at 9:00 PM.";
      if (d.includes("ajanta")) return "✨ AI Recommendation: Cave 1 houses pristine Mahajanaka Jataka paintings. Bring high lumens flashlights.";
      if (d.includes("coorg")) return "✨ AI Recommendation: Visit Golden Temple Dubare forest early to see morning elephant bathing.";
      if (d.includes("ooty")) return "✨ AI Recommendation: Catch the Nilgiri Toy Train steam engine up to Coonoor gorge views.";
      if (d.includes("munnar")) return "✨ AI Recommendation: Walk through Lockhart Tea factory museum to see 150 years of dry-sorting machinery.";
      return "✨ AI Recommendation: Explore early morning to capture majestic warm photographic light.";
    };

    const getWeatherOverlay = (dest: string): string => {
      const d = dest.toLowerCase();
      if (d.includes("leh") || d.includes("ladakh")) return "❄️ 8°C Cold Breeze";
      if (d.includes("kashmir")) return "☁️ 14°C Overcast / Kehwa";
      if (d.includes("munnar") || d.includes("coorg") || d.includes("ooty")) return "🍃 19°C Cool Fog";
      if (d.includes("goa") || d.includes("kerala")) return "☀️ 31°C Tropical Breeze";
      return "☀️ 28°C Clear Skies";
    };

    // Render Pin Markers
    allDestinations.forEach((dest) => {
      if (!dest.coordinates) return;

      const isSubActivity = activeTripDestinations.some(
        name => dest.destination.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(dest.destination.toLowerCase())
      );

      // Create a premium pulsing HTML Marker
      const pinColor = isSubActivity ? "#2563EB" : "#EA580C"; // Blue for active plan routes, Orange for standard
      const pulseBg = isSubActivity ? "rgba(37, 99, 235, 0.2)" : "rgba(234, 88, 12, 0.2)";

      const markerHtml = `
        <div class="relative flex items-center justify-center" style="width: 24px; height: 24px;">
          <div class="absolute rounded-full animate-ping" style="width: 20px; height: 20px; background-color: ${pulseBg};"></div>
          <div class="rounded-full shadow-md border-2 border-white" style="width: 12px; height: 12px; background-color: ${pinColor};"></div>
        </div>
      `;

      const customIcon = window.L.divIcon({
        html: markerHtml,
        className: 'custom-map-pin',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = window.L.marker(dest.coordinates, { icon: customIcon }).addTo(map);

      // Creative Luxury Airbnb/Google Travel Style Popup
      const popupHtml = `
        <div class="p-0 select-none w-64 rounded-xl overflow-hidden font-sans text-slate-800 bg-white shadow-2xl">
          <div class="relative h-32 w-full bg-slate-100">
            <img src="${dest.image}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <span class="absolute top-2 left-2 bg-orange-600/90 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
              ${dest.tag}
            </span>
            <span class="absolute top-2 right-2 bg-slate-900/80 text-white text-[8px] font-mono px-2 py-1 rounded-md">
              ${getWeatherOverlay(dest.destination)}
            </span>
            <div class="absolute bottom-2 left-2 right-2">
              <h4 class="font-extrabold text-[13px] text-white leading-tight drop-shadow-sm">${dest.destination}</h4>
            </div>
          </div>
          <div class="p-3 space-y-2 bg-white">
            <div class="flex items-center justify-between text-[10px] text-slate-500 font-bold border-b border-slate-100 pb-1.5">
              <span class="text-amber-500 flex items-center gap-0.5">⭐ ${dest.rating || 4.9}</span>
              <span class="text-orange-600 font-extrabold italic">₹${dest.budget.toLocaleString('en-IN')} Est</span>
            </div>
            
            <p class="text-[10px] text-slate-600 leading-normal line-clamp-2">${dest.description}</p>
            
            <div class="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100 text-[9px] font-medium text-slate-500">
              <div class="flex items-center gap-1">
                <span>📍</span>
                <span class="truncate font-bold text-slate-700">${getNearestTransport(dest.destination)}</span>
              </div>
              <div class="flex items-center gap-1 mt-1 border-t border-slate-200/50 pt-1 text-[9px]">
                <span>🚘</span>
                <span class="truncate font-semibold text-slate-600">${getDistanceEstimate(dest.destination)}</span>
              </div>
            </div>

            <div class="bg-amber-50/70 border border-amber-100 rounded-lg p-2 text-[9px] leading-relaxed text-amber-900 font-bold italic">
              ${getAiRecommendation(dest.destination)}
            </div>

            <button onclick="window.exploreFromMap('${dest.destination.replace(/'/g, "\\'")}')" class="w-full text-center mt-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] py-2 rounded-lg font-black uppercase tracking-wider transition cursor-pointer border-none outline-none shadow-sm shadow-blue-600/10">
              Explore Destination
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        offset: [0, -5]
      });

      if (onSelectDestination) {
        marker.on('click', () => {
          onSelectDestination(dest);
        });
      }

      markersRef.current[dest.destination] = marker;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLoaded]);

  // Focus and Zoom Effect when focusedDestinationName changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !focusedDestinationName) return;

    // Find custom match
    const matchingDest = allDestinations.find(
      d => d.destination.toLowerCase().includes(focusedDestinationName.toLowerCase()) || focusedDestinationName.toLowerCase().includes(d.destination.toLowerCase())
    );

    if (matchingDest && matchingDest.coordinates) {
      map.setView(matchingDest.coordinates, 8, {
        animate: true,
        duration: 1.5
      });

      const key = matchingDest.destination;
      if (markersRef.current[key]) {
        // Delay popup trigger for smooth animation
        setTimeout(() => {
          markersRef.current[key].openPopup();
        }, 800);
      }
    }
  }, [focusedDestinationName, isLoaded]);

  // Draw Path (Polylines) between destinations in activeTripDestinations
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    // Clear previous polyline
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (activeTripDestinations.length === 0) return;

    // Map names to coordinates
    const coordinatesList: [number, number][] = [];
    activeTripDestinations.forEach(item => {
      const match = allDestinations.find(
        d => d.destination.toLowerCase().includes(item.toLowerCase()) || item.toLowerCase().includes(d.destination.toLowerCase())
      );
      if (match && match.coordinates) {
        coordinatesList.push(match.coordinates);
      }
    });

    if (coordinatesList.length > 1) {
      // Create a gorgeous blue travel line connecting coordinates
      const line = window.L.polyline(coordinatesList, {
        color: '#2563EB',
        weight: 3.5,
        opacity: 0.8,
        dashArray: '6, 6',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      polylineRef.current = line;

      // Fit bounds to show the entire track
      map.fitBounds(line.getBounds(), {
        padding: [40, 40],
        maxZoom: 7
      });
    } else if (coordinatesList.length === 1) {
      map.setView(coordinatesList[0], 7, { animate: true });
    }
  }, [activeTripDestinations, isLoaded]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-inner bg-slate-50">
      <div ref={containerRef} style={{ height }} className="z-10 w-full" id="real-india-leaflet-map" />
      
      {!isLoaded && (
        <div className="absolute inset-0 z-20 bg-slate-100/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-4 border-orange-600 border-t-transparent animate-spin"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Aligning India Vector Satellites...</span>
        </div>
      )}

      {/* Floating map controls */}
      <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/80 shadow-md flex flex-col gap-1 text-[10px] select-none pointer-events-auto">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-600 border border-white"></span>
          <span>Incredible Destination</span>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-white"></span>
          <span>Your Active Route Stops</span>
        </div>
      </div>
    </div>
  );
}
