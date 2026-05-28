import React, { useState } from 'react';

interface CinematicImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function CinematicImage({ src, alt, className = "" }: CinematicImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Elegant fallback scenery of India if photo loading fails
  const fallbackUrl = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 font-sans group">
      {/* Cinematic Linear Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-955/90 via-slate-900/30 to-black/10 z-10 transition-opacity group-hover:opacity-85 pointer-events-none"></div>

      {/* Pulsing Skeleton Loader */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 z-20 animate-pulse">
          <div className="space-y-3 w-4/5">
            <div className="h-3 bg-white/10 rounded-full w-2/3"></div>
            <div className="h-2 bg-white/5 rounded-full w-1/2"></div>
          </div>
        </div>
      )}

      {/* Real Destination Photo with cinematic scale transition on hover */}
      <img
        src={hasError ? fallbackUrl : src}
        alt={alt}
        className={`${className} w-full h-full object-cover transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
        } group-hover:scale-105`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
