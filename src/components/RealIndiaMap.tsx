import React, { useEffect, useRef, useState } from 'react';
import { allDestinations, PopularSpot } from '../data/travelData';
import { 
  Maximize2, Minimize2, Compass, Layers, Navigation, Sparkles, 
  Map, Sun, Cloud, Plane, Star, Play, Pause, X, ChevronRight, Eye, Info, Clock, MapPin, Map as MapIcon
} from 'lucide-react';

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
    exploreFromMap: (destName: string) => void;
  }
}

export default function RealIndiaMap({
  activeTripDestinations = [],
  focusedDestinationName,
  onSelectDestination,
  height = "380px",
  interactive = true
}: RealIndiaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [name: string]: any }>({});
  const polylineRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  
  // Real Map States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [baseLayer, setBaseLayer] = useState<'vector' | 'satellite'>('vector');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [is3d, setIs3d] = useState(false);
  const [tiltAngle, setTiltAngle] = useState(35); // Degrees
  const [rotateAngle, setRotateAngle] = useState(-5); // Degrees
  
  // Autopilot States
  const [isAutopilot, setIsAutopilot] = useState(false);
  const [autopilotIndex, setAutopilotIndex] = useState(0);
  const autopilotTimerRef = useRef<any>(null);

  // Focus Sidebar Detail State
  const [selectedDestination, setSelectedDestination] = useState<PopularSpot | null>(allDestinations[0]);

  // Load Leaflet Script and Styles
  useEffect(() => {
    if (window.L) {
      setIsLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      setIsLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // Filter spots according to selected smart category layers
  const getFilteredSpots = (): PopularSpot[] => {
    return allDestinations.filter((dest) => {
      if (activeCategory === 'all') return true;
      const tag = dest.tag.toLowerCase();
      const name = dest.destination.toLowerCase();
      
      if (activeCategory === 'monuments') {
        return tag.includes('monument') || tag.includes('cultural') || tag.includes('heritage');
      }
      if (activeCategory === 'beaches') {
        return tag.includes('beach') || tag.includes('backwater');
      }
      if (activeCategory === 'hill stations') {
        return tag.includes('hill') || tag.includes('adventure') || tag.includes('mist') || tag.includes('peak');
      }
      if (activeCategory === 'temples') {
        return tag.includes('temple') || tag.includes('shrine') || tag.includes('spiritual') || name.includes('temple') || name.includes('shrine') || name.includes('sahib');
      }
      if (activeCategory === 'forts') {
        return tag.includes('fort') || tag.includes('palace') || name.includes('fort') || name.includes('palace');
      }
      return true;
    });
  };

  const filteredSpots = getFilteredSpots();

  // Initialize Core Map Instance
  useEffect(() => {
    if (!isLoaded || !containerRef.current || mapInstanceRef.current) return;

    const map = window.L.map(containerRef.current, {
      center: [21.0, 78.9], // Balanced central focus for the beautiful Indian subcontinent
      zoom: 5,
      zoomControl: false, // Customized sleek floating controls mounted on top
      scrollWheelZoom: interactive,
      dragging: interactive,
      doubleClickZoom: interactive,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Put map instance onto window for global hook references matching popups
    (window as any).exploreFromMap = (destName: string) => {
      const match = allDestinations.find(d => d.destination === destName);
      if (match) {
        setSelectedDestination(match);
        if (onSelectDestination) {
          onSelectDestination(match);
        }
      }
    };

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLoaded]);

  // Handle Base Tile Swappings (Vector vs Immersive Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const url = baseLayer === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    const attrib = baseLayer === 'satellite'
      ? 'Tiles &copy; Esri World Satellites &mdash; Incredible India Datasets'
      : '&copy; CartoDB Positron &copy; OpenStreetMap contributors';

    tileLayerRef.current = window.L.tileLayer(url, {
      maxZoom: 18,
      attribution: attrib
    }).addTo(map);
  }, [baseLayer, isLoaded]);

  // Travel distance estimation functions
  const getNearestTransport = (dest: string): string => {
    const d = dest.toLowerCase();
    if (d.includes("taj")) return "✈️ Agra Air Base (12km) / 🚉 Agra Cantt Junction";
    if (d.includes("mysore")) return "✈️ Mysore Airport (YMY) / 🚉 Mysuru Central Rail";
    if (d.includes("hampi")) return "✈️ Vidyanagar (35km) / 🚉 Hospet Junction";
    if (d.includes("kerala") || d.includes("alappuzha")) return "✈️ Cochin Int'l Airport (80km) / 🚉 Alappuzha Station";
    if (d.includes("goa")) return "✈️ Manohar Int'l Mopa / 🚉 Margao Junction Station";
    if (d.includes("jaipur") || d.includes("amer")) return "✈️ Sanganer Int'l Airport (JAI) / 🚉 Jaipur Junction";
    if (d.includes("leh") || d.includes("ladakh")) return "✈️ Kushok Bakula Rimpochee Airport (LEH)";
    if (d.includes("kashmir")) return "✈️ Srinagar Airport (SXR) / 🚉 Banihal Railway";
    if (d.includes("golden") || d.includes("amritsar")) return "✈️ Sri Guru Ram Dass Jee Airport / 🚉 Amritsar Cantt";
    if (d.includes("minar") || d.includes("qutub") || d.includes("red fort") || d.includes("delhi")) return "✈️ India Gandhi Int'l (DEL) / 🚉 New Delhi Hub";
    if (d.includes("konark")) return "✈️ Biju Patnaik Airport (BHU) / 🚉 Puri Railway Station";
    if (d.includes("meenakshi") || d.includes("madurai")) return "✈️ Madurai Airport (IXM) / 🚉 Madurai Central";
    if (d.includes("ajanta") || d.includes("ellora")) return "✈️ Aurangabad Airport (IXU) / 🚉 Aurangabad Junction";
    if (d.includes("coorg")) return "✈️ Kannur Airport (CNN) / 🚉 Mysore Cantt Rail";
    if (d.includes("ooty")) return "✈️ Coimbatore Int'l (CJB) / 🚉 Udhagamandalam Steam Rail";
    if (d.includes("munnar")) return "✈️ Cochin Int'l (COK) / 🚉 Aluva Rail Terminal";
    if (d.includes("meghalaya") || d.includes("shillong")) return "✈️ Shillong Airport (SHL) / 🚉 Guwahati Station";
    if (d.includes("mumbai")) return "✈️ Chhatrapati Shivaji Int'l (BOM)";
    if (d.includes("bengaluru")) return "✈️ Kempegowda Int'l (BLR) / 🚉 Majestic Stn";
    if (d.includes("hyderabad")) return "✈️ Rajiv Gandhi Int'l (HYD) / 🚉 Secunderabad Junction";
    if (d.includes("chennai")) return "✈️ Chennai Int'l (MAA) / 🚉 Chennai Central";
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
    if (d.includes("taj")) return "✨ AI Recommendation: View Taj Mahal from Mehtab Bagh gardens at Sunset to capture stunning photos avoiding crowds.";
    if (d.includes("mysore")) return "✨ AI Recommendation: Weekend illumination of 97,000 royal lightbulbs starts precisely at 7:00 PM.";
    if (d.includes("hampi")) return "✨ AI Recommendation: Hire a handmade bamboo coracle boat at Sanapur Lake for dramatic granite views.";
    if (d.includes("kerala")) return "✨ AI Recommendation: Pre-book typical overnight wooden houseboats during November to February dry intervals.";
    if (d.includes("goa")) return "✨ AI Recommendation: Head down to Galgibaga beach in South Goa to find protected Olive Ridley turtle sanctuaries.";
    if (d.includes("jaipur")) return "✨ AI Recommendation: Visit Stepwell Panna Meena ka Kund at sunrise for magnificent geometric symmetry shots.";
    if (d.includes("leh")) return "✨ AI Recommendation: Compulsorily acclimatize in Leh for 24-48 hours before crossing high altitude mountain passes.";
    if (d.includes("kashmir")) return "✨ AI Recommendation: Board a traditional wooden Shikara at 5:00 AM to see the Floating Vegetable Market on Dal Lake.";
    if (d.includes("golden")) return "✨ AI Recommendation: Participate in the midnight Holy Scripture transit ceremony and taste the sacred Kara Prasad.";
    if (d.includes("konark")) return "✨ AI Recommendation: Ask guides to show you the astronomical sundial stone wheels that estimate time using precise shadows.";
    if (d.includes("meenakshi")) return "✨ AI Recommendation: Stand at the East Tower entrance before 9:00 PM for the grand Shiva-Parvati night procession.";
    if (d.includes("ajanta")) return "✨ AI Recommendation: Explore Cave 1 & 2 for highly detailed ancient Buddhist frescoes painted using vegetable dye.";
    if (d.includes("coorg")) return "✨ AI Recommendation: Visit the Dubare Elephant Camp during the morning slot (08:30 AM) to groom baby elephants.";
    if (d.includes("ooty")) return "✨ AI Recommendation: Ride the century-old Nilgiri steam toy train from Metupalayam up through high tea ravines.";
    if (d.includes("munnar")) return "✨ AI Recommendation: Explore the colonial Lockhart Tea factory museum to trace the 150-year-old process of tea dry sorting.";
    if (d.includes("meghalaya")) return "✨ AI Recommendation: Carry high-grip waterproof hiking boots for trekking the slippery root bridges in deep tropical rain valleys.";
    if (d.includes("mumbai")) return "✨ AI Recommendation: Experience the historic heritage walk starting at Victoria Terminus, leading to historical Fort colabs.";
    if (d.includes("bengaluru")) return "✨ AI Recommendation: Walk early inside Cubbon Park and taste legendary traditional South Indian filter coffee in Malleshwaram.";
    if (d.includes("hyderabad")) return "✨ AI Recommendation: Purchase authentic pearls inside Lad Bazaar and experience historical acoustic echoes of Golconda Fort domes.";
    if (d.includes("chennai")) return "✨ AI Recommendation: Walk the Marina seashore during twilight and sample freshly roasted local hot chickpeas from beach vendors.";
    return "✨ AI Recommendation: Arrive early morning to enjoy rich natural photogenic light and serene historical atmosphere.";
  };

  const getWeatherOverlay = (dest: string): string => {
    const d = dest.toLowerCase();
    if (d.includes("leh") || d.includes("ladakh")) return "❄️ 8°C Cold Breeze";
    if (d.includes("kashmir")) return "☁️ 14°C Overcast / Kehwa";
    if (d.includes("munnar") || d.includes("coorg") || d.includes("ooty") || d.includes("meghalaya")) return "🍃 19°C Cool Fog";
    if (d.includes("goa") || d.includes("kerala") || d.includes("mumbai") || d.includes("chennai")) return "☀️ 31°C Tropical Breeze";
    return "☀️ 28°C Clear Skies";
  };

  // Re-Render Interactive Pins when category layers / active trip path change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    // Clear existing markers
    Object.keys(markersRef.current).forEach((name) => {
      markersRef.current[name].remove();
    });
    markersRef.current = {};

    // Generate Beautiful Markers
    filteredSpots.forEach((dest) => {
      if (!dest.coordinates) return;

      const isSubActivity = activeTripDestinations.some(
        name => dest.destination.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(dest.destination.toLowerCase())
      );

      // Creative Luxury Airbnb Styled HTML Marker
      const pinColor = isSubActivity ? "#2563EB" : "#EA580C"; // Blue for active routes, Orange for general explore points
      const pulseBg = isSubActivity ? "rgba(37, 99, 235, 0.4)" : "rgba(234, 88, 12, 0.45)";
      
      const isCurrentlySelected = selectedDestination?.destination === dest.destination;
      const markerScale = isCurrentlySelected ? "scale(1.35) rotate(-3deg)" : "hover:scale-125";

      const markerHtml = `
        <div class="relative flex items-center justify-center transition-all duration-300" style="width: 32px; height: 32px; transform: ${markerScale};">
          <div class="absolute rounded-full animate-ping duration-[2s]" style="width: 24px; height: 24px; background-color: ${pulseBg};"></div>
          <div class="rounded-full shadow-lg border-2 border-white flex items-center justify-center text-white" style="width: 16px; height: 16px; background-color: ${pinColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.3)">
            <span class="text-[7px] font-black">${dest.tag.slice(0, 1)}</span>
          </div>
          <div class="absolute -bottom-6 bg-slate-900/90 py-0.5 px-2 rounded-md border border-slate-800 text-white text-[7px] font-black uppercase whitespace-nowrap tracking-wider shadow-sm opacity-90 select-none">
            ${dest.destination.split(',')[0]}
          </div>
        </div>
      `;

      const customIcon = window.L.divIcon({
        html: markerHtml,
        className: 'custom-modern-pin',
        iconSize: [32, 40],
        iconAnchor: [16, 16]
      });

      const marker = window.L.marker(dest.coordinates, { icon: customIcon }).addTo(map);

      // Cinematic Airbnb style popup
      const popupHtml = `
        <div class="p-0 select-none w-64 rounded-xl overflow-hidden font-sans text-slate-800 bg-white shadow-2xl border border-slate-100">
          <div class="relative h-32 w-full bg-slate-200">
            <img src="${dest.image}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"></div>
            <span class="absolute top-2 left-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
              ${dest.tag}
            </span>
            <span class="absolute top-2 right-2 bg-slate-950/80 text-white text-[8px] font-mono px-2 py-0.5 rounded-md border border-white/10">
              ${getWeatherOverlay(dest.destination)}
            </span>
            <div class="absolute bottom-2 left-2 right-2">
              <h4 class="font-extrabold text-[13px] text-white leading-tight drop-shadow-md">${dest.destination}</h4>
            </div>
          </div>
          <div class="p-3 space-y-2.5 bg-white">
            <div class="flex items-center justify-between text-[10px] text-slate-500 font-bold border-b border-slate-100 pb-1.5">
              <span class="text-amber-500 flex items-center gap-0.5">★ ${dest.rating || 4.9} Perfect score</span>
              <span class="text-emerald-700 font-extrabold italic">₹${dest.budget.toLocaleString('en-IN')} Est</span>
            </div>
            
            <p class="text-[10px] text-slate-600 leading-relaxed font-medium line-clamp-2">${dest.description}</p>
            
            <div class="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100 text-[9px] font-medium text-slate-500">
              <div class="flex items-center gap-1">
                <span>📍</span>
                <span class="truncate font-bold text-slate-700 font-sans">${getNearestTransport(dest.destination)}</span>
              </div>
              <div class="flex items-center gap-1 mt-1 border-t border-slate-200/50 pt-1 text-[9px]">
                <span>🚘</span>
                <span class="truncate font-semibold text-slate-600">${getDistanceEstimate(dest.destination)}</span>
              </div>
            </div>

            <div class="bg-amber-50/70 border border-amber-100 rounded-lg p-2 text-[9px] leading-relaxed text-amber-900 font-bold italic">
              ${getAiRecommendation(dest.destination)}
            </div>

            <button onclick="window.exploreFromMap('${dest.destination.replace(/'/g, "\\'")}')" class="w-full text-center mt-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] py-2 rounded-lg font-black uppercase tracking-wider transition-all duration-300 transform active:scale-95 cursor-pointer border-none outline-none shadow-sm shadow-blue-600/10">
              Explore Landmark
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        offset: [0, -5]
      });

      marker.on('click', () => {
        setSelectedDestination(dest);
        if (onSelectDestination) {
          onSelectDestination(dest);
        }
      });

      markersRef.current[dest.destination] = marker;
    });

  }, [activeCategory, isLoaded, selectedDestination, activeTripDestinations]);

  // Direct Search Fly To Camera Sync effect
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !focusedDestinationName || !isLoaded) return;

    const matchingDest = allDestinations.find(
      d => d.destination.toLowerCase().includes(focusedDestinationName.toLowerCase()) || focusedDestinationName.toLowerCase().includes(d.destination.toLowerCase())
    );

    if (matchingDest && matchingDest.coordinates) {
      setSelectedDestination(matchingDest);
      
      // Smart zoom based on type of view: zoom closer 11 on satellite, 9 on vector map
      const zoomDepth = baseLayer === 'satellite' ? 12 : 10;
      
      map.flyTo(matchingDest.coordinates, zoomDepth, {
        animate: true,
        duration: 2.2,
        easeLinearity: 0.2
      });

      const key = matchingDest.destination;
      // Delay popup slightly for premium visual flow
      setTimeout(() => {
        if (markersRef.current[key]) {
          markersRef.current[key].openPopup();
        }
      }, 1500);
    }
  }, [focusedDestinationName, isLoaded]);

  // Draw Polylines between spots inside the list of activeTripDestinations
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (activeTripDestinations.length === 0) return;

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
      // Connect vertices with sleek animated glowing vector tracks
      const line = window.L.polyline(coordinatesList, {
        color: '#2563EB',
        weight: 4,
        opacity: 0.9,
        dashArray: '10, 12',
        lineCap: 'round',
        lineJoin: 'round',
        shadowColor: '#2563EB',
        shadowBlur: 10
      }).addTo(map);

      polylineRef.current = line;

      // Fit bounds beautifully to render entire chain
      map.fitBounds(line.getBounds(), {
        padding: [60, 60],
        maxZoom: 7
      });
    } else if (coordinatesList.length === 1) {
      map.setView(coordinatesList[0], 7, { animate: true });
    }
  }, [activeTripDestinations, isLoaded]);

  // Recalculate canvas on toggle full-viewport modes to prevent Leaflet empty grey boxes
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 300);
    }
  }, [isFullscreen]);

  // Automated Panoramic Cruise Fly-To interval loop
  useEffect(() => {
    if (!isAutopilot) {
      if (autopilotTimerRef.current) {
        clearInterval(autopilotTimerRef.current);
        autopilotTimerRef.current = null;
      }
      return;
    }

    const map = mapInstanceRef.current;
    if (!map || filteredSpots.length === 0) return;

    // Run first step instantly
    const targetSpot = filteredSpots[autopilotIndex];
    if (targetSpot && targetSpot.coordinates) {
      setSelectedDestination(targetSpot);
      map.flyTo(targetSpot.coordinates, baseLayer === 'satellite' ? 12 : 10, {
        animate: true,
        duration: 2.2
      });
      setTimeout(() => {
        if (markersRef.current[targetSpot.destination]) {
          markersRef.current[targetSpot.destination].openPopup();
        }
      }, 1500);
    }

    autopilotTimerRef.current = setInterval(() => {
      const nextIndex = (autopilotIndex + 1) % filteredSpots.length;
      setAutopilotIndex(nextIndex);

      const nextSpot = filteredSpots[nextIndex];
      if (nextSpot && nextSpot.coordinates) {
        setSelectedDestination(nextSpot);
        map.flyTo(nextSpot.coordinates, baseLayer === 'satellite' ? 12 : 10, {
          animate: true,
          duration: 2.5
        });

        setTimeout(() => {
          if (markersRef.current[nextSpot.destination]) {
            markersRef.current[nextSpot.destination].openPopup();
          }
        }, 1800);
      }
    }, 7000); // 7 seconds per stop for deep cinematic flight scanning

    return () => {
      if (autopilotTimerRef.current) {
        clearInterval(autopilotTimerRef.current);
      }
    };
  }, [isAutopilot, autopilotIndex, activeCategory]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Custom styling to emulate 3D Tilt perspective transform directly on the map wrapper
  const mapPerspectiveStyle = is3d ? {
    transform: `perspective(1000px) rotateX(${tiltAngle}deg) rotateZ(${rotateAngle}deg)`,
    transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s ease',
    transformOrigin: 'center center',
  } : {
    transform: 'perspective(1000px) rotateX(0deg) rotateZ(0deg)',
    transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s ease',
    transformOrigin: 'center center',
  };

  return (
    <div className={`relative transition-all duration-500 font-sans ${
      isFullscreen 
        ? "fixed inset-0 z-[99999] bg-slate-950 flex flex-col md:flex-row h-screen w-screen p-0 m-0 overflow-hidden leading-normal"
        : "w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl bg-slate-50"
    }`} id="tripverse-interactive-globe-system">
      
      {/* FULLSCREEN SIDEBAR CONTROLLER DECK */}
      {isFullscreen && (
        <div className="w-full md:w-[380px] shrink-0 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between overflow-y-auto overflow-x-hidden text-slate-100 z-50 shadow-2xl relative select-none">
          <div className="p-5 space-y-5">
            {/* Header branding */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/20">
                  <Compass className="h-5.5 w-5.5 text-white animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-widest text-[#FFF]">TRIPVERSE 3D</h3>
                  <span className="text-[9px] text-orange-400 font-black tracking-widest uppercase">Subcontinent Satellite HUD</span>
                </div>
              </div>
              <button 
                onClick={toggleFullscreen}
                className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                <Minimize2 className="h-3.5 w-3.5" /> Close
              </button>
            </div>

            {/* Focused Spot Detail Section */}
            {selectedDestination ? (
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4 shadow-inner">
                <div className="relative h-40 w-full rounded-lg overflow-hidden bg-slate-800 border border-slate-800">
                  <img 
                    src={selectedDestination.image} 
                    alt={selectedDestination.destination} 
                    className="w-full h-full object-cover transition duration-700 hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  <span className="absolute bottom-2.5 left-2.5 bg-orange-600 font-black text-[9px] px-2.5 py-1 rounded tracking-widest uppercase">
                    {selectedDestination.tag}
                  </span>
                  <span className="absolute top-2.5 right-2.5 bg-slate-900/90 text-[8px] border border-slate-800 py-1 px-2 rounded-md font-mono flex items-center gap-1">
                    <Sun className="h-3 w-3 text-amber-400 shrink-0" /> {getWeatherOverlay(selectedDestination.destination)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-white">{selectedDestination.destination}</h4>
                    <span className="text-xs font-extrabold text-amber-550 flex items-center gap-0.5">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-550" /> {selectedDestination.rating || 4.9}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-orange-500" /> {selectedDestination.location}
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                    {selectedDestination.description}
                  </p>
                </div>

                {/* Local transit HUD telemetry stats */}
                <div className="space-y-2 pt-2 border-t border-slate-900 text-[10px]">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-semibold text-slate-500">Nearest Transport Links:</span>
                    <span className="font-bold text-slate-200 truncate max-w-[190px]">{getNearestTransport(selectedDestination.destination)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-semibold text-slate-500">Primary Transit Offset:</span>
                    <span className="font-bold text-slate-200">{getDistanceEstimate(selectedDestination.destination)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-semibold text-slate-500">Est. Luxury Budget Index:</span>
                    <span className="font-bold text-orange-400 font-mono">₹{selectedDestination.budget.toLocaleString('en-IN')} Est</span>
                  </div>
                </div>

                {/* AI Advisor Box */}
                <div className="bg-amber-950/30 border border-amber-900/40 p-3 rounded-lg text-[10px] leading-relaxed text-amber-300 italic">
                  {getAiRecommendation(selectedDestination.destination)}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                ★ Click on any pinned marker to query AI sub-satellite images and tourism info telemetry.
              </div>
            )}

            {/* Simulated telemetry tracker log */}
            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850 space-y-2">
              <span className="text-[8px] font-mono tracking-widest text-blue-400 uppercase font-black block">LIVE RADAR TELEMETRY LOG</span>
              <div className="space-y-1 font-mono text-[9px] text-slate-400">
                <div className="flex justify-between">
                  <span>🛰️ SATELLITE:</span>
                  <span className="text-emerald-550 font-bold">INSAT-3DR ONLINE</span>
                </div>
                <div className="flex justify-between">
                  <span>📍 GPS SENSORY:</span>
                  <span className="text-slate-300">WGS84 DECCAN MATRIX</span>
                </div>
                <div className="flex justify-between">
                  <span>🌊 WEATHER LAYERS:</span>
                  <span className="text-sky-400 font-bold">LIVE MONSOON DESK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Autopilot Robotic Controller bottom panel */}
          <div className="p-5 border-t border-slate-800 bg-slate-950 space-y-3 shrink-0 select-none">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Cinematic Autopilot</h5>
                <span className="text-[8px] text-slate-500 font-mono">Simulates high-altitude live flyover tours</span>
              </div>
              <button
                onClick={() => setIsAutopilot(!isAutopilot)}
                className={`py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1 cursor-pointer ${
                  isAutopilot 
                    ? "bg-red-600 hover:bg-red-500 text-white animate-pulse" 
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              >
                {isAutopilot ? (
                  <>
                    <Pause className="h-3 w-3 font-black" /> Cruise Active
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 fill-white" /> Start Autopilot Tour
                  </>
                )}
              </button>
            </div>

            {isAutopilot && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center gap-3 text-[10px] animate-fade-in select-none">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
                <div className="flex-1 text-slate-300 font-mono">
                  Cruising Stop {autopilotIndex + 1}/{filteredSpots.length}: <strong className="text-white block">{filteredSpots[autopilotIndex]?.destination.split(',')[0]}</strong>
                </div>
                <button 
                  onClick={() => {
                    const nextIndex = (autopilotIndex + 1) % filteredSpots.length;
                    setAutopilotIndex(nextIndex);
                  }}
                  className="p-1 hover:bg-slate-800 text-white rounded cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAP VIEWPORT GRID / RIGHT CONTAINER */}
      <div className="flex-1 flex flex-col relative bg-slate-100 overflow-hidden min-h-[300px]">
        
        {/* TOP FLOATING SMART TOURISM CATEGORY LAYERS */}
        <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap gap-1.5 pointer-events-auto items-center selection:bg-transparent">
          {/* Main search sync indicator if visible */}
          {focusedDestinationName && (
            <div className="bg-orange-600 font-black text-white text-[9px] uppercase tracking-wider px-3 py-2 rounded-xl shadow-md border border-orange-500 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 animate-bounce" /> Syncing: {focusedDestinationName.split(',')[0]}
            </div>
          )}

          {/* Luxury Floating Category Tabs */}
          <div className="flex flex-wrap items-center bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-200/80 shadow-lg gap-0.5 max-w-full overflow-x-auto">
            <button 
              onClick={() => setActiveCategory('all')}
              className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeCategory === 'all' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              🌐 India All
            </button>
            <button 
              onClick={() => setActiveCategory('monuments')}
              className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeCategory === 'monuments' ? 'bg-orange-600 text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              🏯 UNESCO & Monuments
            </button>
            <button 
              onClick={() => setActiveCategory('beaches')}
              className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeCategory === 'beaches' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              🏖️ Exotic Beaches
            </button>
            <button 
              onClick={() => setActiveCategory('hill stations')}
              className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeCategory === 'hill stations' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              🏔️ Hill Stations
            </button>
            <button 
              onClick={() => setActiveCategory('temples')}
              className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeCategory === 'temples' ? 'bg-amber-600 text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              🔱 Shrines & Temples
            </button>
            <button 
              onClick={() => setActiveCategory('forts')}
              className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeCategory === 'forts' ? 'bg-red-600 text-white' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              🛡️ Forts & Palaces
            </button>
          </div>
        </div>

        {/* COMPACT FLOATING INLINE BUTTONS (When not in fullscreen, show beautiful map zoom controls) */}
        {!isFullscreen && (
          <button 
            onClick={toggleFullscreen}
            className="absolute top-18 right-4 z-[400] bg-white/95 backdrop-blur-md hover:bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-700 hover:text-orange-600 font-extrabold text-[10px] uppercase tracking-wider tracking-widest flex items-center gap-1.5 transition shadow-lg pointer-events-auto cursor-pointer"
          >
            <Maximize2 className="h-4 w-4" /> Expand Immersive HUD Map
          </button>
        )}

        {/* THE CORE LEAFLET CANVAS WITH PERSPECTIVE TILT */}
        <div 
          className="flex-1 w-full bg-slate-200 transition-all duration-300 relative"
          style={{ height: isFullscreen ? '100%' : height }}
        >
          <div 
            ref={containerRef} 
            style={{ 
              height: '100%',
              ...mapPerspectiveStyle
            }} 
            className="w-full h-full z-10" 
            id="real-india-leaflet-map" 
          />

          {/* Satellite aligner loading screen */}
          {!isLoaded && (
            <div className="absolute inset-0 z-20 bg-slate-900 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 rounded-full border-4 border-orange-600 border-t-transparent animate-spin"></div>
              <span className="text-[11px] font-mono tracking-widest uppercase text-slate-400 font-extrabold text-slate-400">Aligning India Vector Satellites...</span>
            </div>
          )}
        </div>

        {/* BOTTOM FLOATING LAYER CONTROLS DECK (Satellite mode, 3D tilt, compass rotation) */}
        <div className="absolute bottom-4 left-4 right-4 z-[400] flex flex-wrap gap-2 items-center justify-between pointer-events-auto">
          {/* Map style base switcher */}
          <div className="flex bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-200/80 shadow-md gap-0.5">
            <button
              onClick={() => setBaseLayer('vector')}
              className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                baseLayer === 'vector' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              🗺️ Clean Vector Map
            </button>
            <button
              onClick={() => setBaseLayer('satellite')}
              className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                baseLayer === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              🛰️ Real Satellite Imagery
            </button>
          </div>

          {/* Simulated 3D interactive tilt cockpit */}
          <div className="flex items-center bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-200/80 shadow-md gap-1">
            <button
              onClick={() => {
                setIs3d(!is3d);
                if (!is3d) {
                  setTiltAngle(35);
                  setRotateAngle(-5);
                }
              }}
              className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                is3d ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Compass className={`h-3.5 w-3.5 ${is3d ? 'animate-spin-slow' : ''}`} /> {is3d ? '3D Aerial View' : 'Flat 2D View'}
            </button>

            {is3d && (
              <div className="flex items-center gap-1 px-1.5 animate-fade-in text-slate-700 text-[9px] font-mono select-none">
                <span className="font-bold border-l border-slate-200 pl-2">Angle:</span>
                <button 
                  onClick={() => setTiltAngle(prev => Math.max(15, prev - 10))}
                  className="px-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                  title="減少傾角"
                >
                  -
                </button>
                <span className="font-extrabold font-mono text-slate-900">{tiltAngle}°</span>
                <button 
                  onClick={() => setTiltAngle(prev => Math.min(50, prev + 10))}
                  className="px-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                  title="增加傾角"
                >
                  +
                </button>

                <span className="font-bold border-l border-slate-200 pl-2 ml-1">Spin:</span>
                <button 
                  onClick={() => setRotateAngle(prev => prev - 15)}
                  className="px-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                  title="左旋旋轉"
                >
                  ↺
                </button>
                <span className="font-extrabold font-mono text-slate-900">{rotateAngle}°</span>
                <button 
                  onClick={() => setRotateAngle(prev => prev + 15)}
                  className="px-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                  title="右旋旋轉"
                >
                  ↻
                </button>
                <button 
                  onClick={() => { setTiltAngle(35); setRotateAngle(-5); }}
                  className="px-1 ml-1 bg-slate-200 hover:bg-slate-300 rounded text-[8px] font-black cursor-pointer"
                >
                  RESET
                </button>
              </div>
            )}
          </div>

          {/* Legends tag */}
          <div className="hidden sm:flex bg-slate-900/90 text-[8px] tracking-wider uppercase font-black text-slate-300 px-3 py-2 rounded-xl border border-slate-800 shadow-sm gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
              <span>Monuments & Sights</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              <span>Plan Stops</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
