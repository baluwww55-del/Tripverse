import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Sparkles, User, Mail, Lock, Check, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { signInWithGoogle } from '../firebase';

interface LoginPageProps {
  onLoginSuccess: (email: string, name: string) => void;
}

const CAROUSEL_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=85",
    location: "Taj Mahal, Agra",
    title: "Explore Incredible India",
    subtitle: "Sacred Yamuna sunrises washing over pure white marble",
    theme: "Mughal Splendor & Eternal Romance"
  },
  {
    url: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=85",
    location: "Backwaters, Kerala",
    title: "Discover India Intelligently",
    subtitle: "Glide gently past emerald lagoons in artisan houseboats",
    theme: "Ayurvedic Luxury & Golden Palm Trees"
  },
  {
    url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=85",
    location: "Goa Tropical Coasts",
    title: "Aesthetic Coastal Escapes",
    subtitle: "Sunset marine breezes warming old Portuguese stone villas",
    theme: "Saffron Sands & Sea Horizon Diners"
  },
  {
    url: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=85",
    location: "Leh Ladakh Passages",
    title: "Your Journey Begins Here",
    subtitle: "Traverse high altitude cold deserts & deep sapphire lakes",
    theme: "Himalayan Mysticism & Buddhist Silence"
  },
  {
    url: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=1200&q=85",
    location: "Amber Palace, Jaipur",
    title: "Royal Rajputana Legacies",
    subtitle: "Immerse in the timeless opulence of regal mirror temples",
    theme: "Majestic Forts & Hot Air Balloon Safaris"
  },
  {
    url: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=85",
    location: "Kashmir Valleys",
    title: "Heaven on Earth",
    subtitle: "Snow-crowned spruce peaks towering over floating Shikaras",
    theme: "Alpine Springs & Saffron Meadows"
  }
];

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emailInput, setEmailInput] = useState("balu.www.55@gmail.com");
  const [nameInput, setNameInput] = useState("Balu");
  const [passwordInput, setPasswordInput] = useState("••••••••");
  const [rememberMe, setRememberMe] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatusText, setAuthStatusText] = useState("");

  // Auto-swipe image carousel every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleManualNext = () => {
    setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  };

  const handleManualPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAuthSimulation(nameInput, emailInput);
  };

  const triggerAuthSimulation = (name: string, email: string) => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    setAuthStatusText("Calibrating Incredible India route gateways...");
    
    setTimeout(() => {
      setAuthStatusText("Resolving Balu's personalized travel profile...");
      setTimeout(() => {
        setAuthStatusText("Namaste! Authentication completed.");
        setTimeout(() => {
          onLoginSuccess(email, name);
          setIsAuthenticating(false);
        }, 600);
      }, 800);
    }, 800);
  };

  const handleGoogleSignIn = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    setAuthStatusText("Opening Google Auth Workspace Popup...");
    try {
      const user = await signInWithGoogle();
      setAuthStatusText(`Namaste, ${user.displayName || 'Explorer'}! Syncing profiles...`);
      setTimeout(() => {
        onLoginSuccess(user.email || 'balu.www.55@gmail.com', user.displayName || 'Balu');
        setIsAuthenticating(false);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setAuthStatusText("Auth failed. Returning to safe gate.");
      setIsAuthenticating(false);
      alert(`Google Auth failed: ${err.message || err}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen flex flex-col lg:flex-row bg-slate-950 text-slate-100 overflow-hidden select-none">
      
      {/* LEFT SIDE (60% Desktop, Full on Mobile Carousel) */}
      <div className="relative w-full lg:w-[60%] h-[40vh] lg:h-full overflow-hidden flex flex-col justify-between p-6 sm:p-8 lg:p-12">
        
        {/* Fullscreen Background Carousel using Framer Motion */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1.01 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url('${CAROUSEL_IMAGES[currentIndex].url}')` }}
            />
          </AnimatePresence>
          {/* Saffron & Dark Royal Sunset Cinematic Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-slate-950/30 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-transparent to-blue-900/10 z-10" />
        </div>

        {/* Carousel Header Content */}
        <div className="relative z-20 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-indigo-700 flex items-center justify-center text-white shadow-xl">
            <Compass className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xl font-black tracking-tight text-white">TRIPVERSE</span>
              <span className="text-[9px] font-bold text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-full uppercase tracking-widest border border-amber-400/30">AI India Core</span>
            </div>
            <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider block mt-0.5">Luxury Indian Tourism Companion</span>
          </div>
        </div>

        {/* Floating Custom Particle effects overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 400 - 200, 
                y: Math.random() * 500 + 100, 
                opacity: Math.random() * 0.4 + 0.1 
              }}
              animate={{ 
                y: [0, -400], 
                opacity: [0.1, 0.4, 0] 
              }}
              transition={{ 
                duration: 9 + Math.random() * 6, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full bg-amber-400/60 blur-[1px]"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: "5%"
              }}
            />
          ))}
        </div>

        {/* Slide Specific Content Overlay */}
        <div className="relative z-20 space-y-4 max-w-xl text-left mt-auto lg:mb-4">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-2"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-600/80 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-widest text-[#FFF] border border-orange-400/30">
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                <span>{CAROUSEL_IMAGES[currentIndex].theme}</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white uppercase drop-shadow-lg">
                {CAROUSEL_IMAGES[currentIndex].title}
              </h2>
              
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed drop-shadow-md font-medium">
                {CAROUSEL_IMAGES[currentIndex].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Location Pin Card */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-lg bg-orange-600/30 p-1.5 rounded-full text-orange-400">📍</span>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Featured Destination</span>
                <span className="text-xs sm:text-sm font-bold text-white">{CAROUSEL_IMAGES[currentIndex].location}</span>
              </div>
            </div>

            {/* Slider Manual Controls */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleManualPrev}
                className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 hover:border-white/20 text-slate-300 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                {String(currentIndex + 1).padStart(2, '0')} / {String(CAROUSEL_IMAGES.length).padStart(2, '0')}
              </span>
              <button 
                onClick={handleManualNext}
                className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 hover:border-white/20 text-slate-300 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (40% Desktop, Full on Mobile - Authentication card page) */}
      <div className="relative w-full lg:w-[40%] flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 overflow-y-auto bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800/80">
        
        {/* Soft Royal-Amber background glow for warm feel */}
        <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[20%] left-[10%] w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md space-y-6 relative z-10 p-1">
          
          {/* Namaste / Indian Heritage Welcome Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-16 w-16 bg-slate-950 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-inner">
                  {/* Lotus Outline Art representation using elegant compass and sparkles */}
                  <Compass className="h-8 w-8 text-orange-500 animate-pulse" />
                </div>
                <span className="absolute -bottom-1 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">Namaste</span>
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase pt-2">
              Namaste 🇮🇳
            </h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider leading-relaxed">
              Unlock Royal Palaces, Golden Houseboats & Multi-Agent Planning
            </p>
          </div>

          {/* FROSTED GLASS LOGIN CARD */}
          <div className="glass-dark border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
            
            {/* Top decorative orange-saffron-blue soft border lines */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-white to-emerald-500 opacity-80" />

            {/* Auth Form state */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {/* Traveler Full Name input */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center justify-between">
                  <span>Traveler Full Name</span>
                  <span className="text-amber-500 text-[9px] font-black lowercase tracking-normal bg-amber-500/10 px-1.5 py-0.2 rounded">Customizable</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input 
                    type="text" 
                    required 
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your name" 
                    className="w-full bg-slate-950/80 text-white text-xs font-semibold rounded-xl border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 py-3.5 pl-10 pr-4 outline-none transition-all placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Email / Username field */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center justify-between">
                  <span>Email Account ID</span>
                  <span className="text-orange-500 text-[9px]">Verified Google-Link</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input 
                    type="email" 
                    required 
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="example@gmail.com" 
                    className="w-full bg-slate-950/80 text-white text-xs font-semibold rounded-xl border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 py-3.5 pl-10 pr-4 outline-none transition-all placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input 
                    type="password" 
                    required 
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-slate-950/80 text-white text-xs font-semibold rounded-xl border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 py-3.5 pl-10 pr-4 outline-none transition-all placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Remember me & Forgot Link */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-400 font-medium cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/10 text-orange-600 bg-slate-950 focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer"
                  />
                  <span>Save credentials</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => alert("Password reset link has been dispatched to your pre-verified email box!")}
                  className="text-amber-500 hover:text-amber-400 font-bold hover:underline transition"
                >
                  Forgot Key?
                </button>
              </div>

              {/* Premium Graduated Saffron Hover Login Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full relative py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-[#FFF] text-xs font-black tracking-widest uppercase hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 overflow-hidden"
                >
                  {isAuthenticating ? (
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{authStatusText || "Sojourn loading..."}</span>
                    </div>
                  ) : (
                    <>
                      <span>Enter Incredible Portal</span>
                      <span>🇮🇳</span>
                    </>
                  )}
                  {/* Subtle shining light sweep over Saffron button */}
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/10 opacity-30 group-hover:animate-shine" />
                </button>
              </div>
            </form>

            <div className="relative my-4 flex py-1 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-3 text-[9px] text-slate-500 font-black uppercase tracking-widest">Or Google Gateway</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            {/* Authenticating Google Sign In button simulation */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className="w-full py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold flex items-center justify-center gap-2.5 cursor-pointer hover:shadow transition-all active:scale-[0.99] border border-slate-200"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.69 3.42-4.51 6.76-4.51z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.88 3.39-8.5z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.24 14.55c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.39 7.16C.5 8.93 0 10.91 0 13s.5 4.07 1.39 5.84l3.85-2.99c-.11-.42-.15-.86-.15-1.3s.04-.88.15-1.3z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.9 1.09-3.34 0-6.16-2.17-7.16-5.12L1.39 16.2C3.37 20.33 7.35 23 12 23z"
                />
              </svg>
              <span>Sign-In with Google Workspace</span>
            </button>
          </div>

          {/* Footer of Auth panel */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-2 font-semibold">
            <span>Don't have an India ID? <button onClick={() => alert("Creating custom Indian residency accounts is currently open through validated mobile OTP!")} className="text-orange-500 hover:underline font-bold">Register</button></span>
            <span><button onClick={() => alert("Emergency Indian Tourism support line: 1363 (24x7 Helpline)")} className="text-slate-400 hover:underline">Helpdesk Support</button></span>
          </div>

          <div className="text-center pt-2">
            <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-widest block">Incredible India 🇮🇳 Smart Travel Agent</span>
            <span className="text-[9px] text-slate-700 block mt-1">Calibrated under Ministry of Tourism guidelines © 2026</span>
          </div>

        </div>
      </div>
    </div>
  );
}
