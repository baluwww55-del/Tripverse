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

      // Creative Luxury Popup with image preview
      const popupHtml = `
        <div class="p-2 select-none w-52 font-sans text-slate-800 space-y-2">
          <div class="relative h-24 rounded-lg overflow-hidden bg-slate-100">
            <img src="${dest.image}" class="w-full h-full object-cover" />
            <span class="absolute top-1 left-1 bg-black/60 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              ${dest.tag}
            </span>
          </div>
          <div class="space-y-1">
            <h4 class="font-bold text-xs text-slate-900 leading-tight">${dest.destination}</h4>
            <div class="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
              <span>⭐ ${dest.rating || 4.8}</span>
              <span>₹${dest.budget.toLocaleString('en-IN')} Est</span>
            </div>
            <p class="text-[9px] text-slate-600 line-clamp-2 leading-tight">${dest.description}</p>
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
