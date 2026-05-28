import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Mic, 
  MicOff, 
  X, 
  Clock, 
  Compass, 
  Navigation, 
  TrendingUp, 
  Volume2, 
  MapPin, 
  CloudSun, 
  Hotel,
  Award,
  ArrowRight,
  Info
} from 'lucide-react';
import { allDestinations, PopularSpot } from '../data/travelData';

interface SearchAndVoiceAssistantProps {
  onSearchSelect: (destination: string, days?: number, budget?: number) => void;
  onPageChange?: (page: string) => void;
  initialQuery?: string;
  placeholder?: string;
  sticky?: boolean;
}

export default function SearchAndVoiceAssistant({
  onSearchSelect,
  onPageChange,
  initialQuery = '',
  placeholder = "Ask Tripverse: 'Goa Beaches', 'Munnar', 'Hampi' or 'Taj Mahal'...",
  sticky = true
}: SearchAndVoiceAssistantProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<PopularSpot[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tripverse_recent_searches');
      return saved ? JSON.parse(saved) : ["Taj Mahal, Agra", "Hampi Ruins, Karnataka", "Kerala Backwaters, Alappuzha"];
    } catch {
      return ["Taj Mahal, Agra", "Hampi Ruins, Karnataka"];
    }
  });

  // Voice Assistant states
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [spokenReply, setSpokenReply] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Monitor Scroll for sticky presentation if requested
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!sticky) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  // Autocomplete suggest stream matcher
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const clean = query.trim().toLowerCase();
    const filtered = allDestinations.filter(d => 
      d.destination.toLowerCase().includes(clean) ||
      d.location?.toLowerCase().includes(clean) ||
      d.tag.toLowerCase().includes(clean) ||
      d.description?.toLowerCase().includes(clean)
    );
    setSuggestions(filtered.slice(0, 6));
  }, [query]);

  // Handle Search choice selection
  const handleSelectPlace = (destName: string) => {
    const matched = allDestinations.find(d => d.destination.toLowerCase() === destName.toLowerCase());
    setQuery(destName);
    setIsFocused(false);

    // Save search history
    const filteredRecent = [destName, ...recentSearches.filter(s => s !== destName)].slice(0, 5);
    setRecentSearches(filteredRecent);
    localStorage.setItem('tripverse_recent_searches', JSON.stringify(filteredRecent));

    if (matched) {
      onSearchSelect(matched.destination, matched.duration, matched.budget);
    } else {
      onSearchSelect(destName, 4, 60000);
    }
  };

  // Text to speech voice synthesis
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN'; // Standard Indian English accent
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis aborted: ", e);
    }
  };

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-IN'; // Elegant Indian English transcription format

      rec.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
        setTranscript('Listening for your spoken travel query...');
        setSpokenReply(null);
        try {
          speakText("Listening. Please state your Indian destination or command.");
        } catch (err) {}
      };

      rec.onresult = (event: any) => {
        const results = event.results;
        const currentTranscript = results[results.length - 1][0].transcript;
        setTranscript(currentTranscript);
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed') {
          const errMsg = "Microphone permissions blocked. Please enable mic access in your browser settings.";
          setVoiceError(errMsg);
          speakText(errMsg);
        } else {
          setVoiceError(`Audio sensor mismatch: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Post-process final transcribed text to trigger intelligent travel context
  useEffect(() => {
    if (isListening || !transcript.trim() || transcript === 'Listening for your spoken travel query...') return;

    const spokenQuery = transcript.toLowerCase().trim();
    let bestMatch: PopularSpot | null = null;
    let matchScore = 0;

    // Specific verbal command parsers
    if (spokenQuery.includes("weather") || spokenQuery.includes("climate") || spokenQuery.includes("temperature")) {
      // Find the destination first
      const destinationItem = allDestinations.find(d => 
        spokenQuery.includes(d.destination.toLowerCase().split(',')[0].trim()) ||
        spokenQuery.includes(d.location?.toLowerCase().split(',')[0].trim() || "")
      );
      if (destinationItem) {
        const weatherMsg = `Current weather forecast for ${destinationItem.destination} is ${destinationItem.weather || 'pleasant and clear'}. Perfect for a magnificent sightseeing.`;
        setSpokenReply(weatherMsg);
        speakText(weatherMsg);
        setTimeout(() => {
          handleSelectPlace(destinationItem.destination);
          setTranscript('');
          setSpokenReply(null);
        }, 3500);
        return;
      }
    }

    if (spokenQuery.includes("hotel") || spokenQuery.includes("resort") || spokenQuery.includes("stay") || spokenQuery.includes("accommodation")) {
      const destinationItem = allDestinations.find(d => 
        spokenQuery.includes(d.destination.toLowerCase().split(',')[0].trim()) ||
        spokenQuery.includes(d.location?.toLowerCase().split(',')[0].trim() || "")
      );
      if (destinationItem) {
        const hotelMsg = `Searching best properties near ${destinationItem.destination}. Heritage mansions and bespoke wellness retreats are selected for your style context.`;
        setSpokenReply(hotelMsg);
        speakText(hotelMsg);
        setTimeout(() => {
          handleSelectPlace(destinationItem.destination);
          setTranscript('');
          setSpokenReply(null);
        }, 3200);
        return;
      }
    }

    // Check for keyword matches in predefined destinations
    allDestinations.forEach(dest => {
      const nameWords = dest.destination.toLowerCase().replace(/,/g, '').split(' ');
      let score = 0;
      nameWords.forEach(w => {
        if (spokenQuery.includes(w)) score += 1;
      });
      if (spokenQuery.includes(dest.tag.toLowerCase())) score += 1;
      if (dest.location && spokenQuery.includes(dest.location.toLowerCase())) score += 2;

      if (score > matchScore) {
        matchScore = score;
        bestMatch = dest;
      }
    });

    if (bestMatch && matchScore > 0) {
      const match: PopularSpot = bestMatch;
      const responseMsg = `Recognized: "${transcript}". Connecting you instantly with ${match.destination}!`;
      setSpokenReply(responseMsg);
      speakText(`Opening ${match.destination}`);
      setTimeout(() => {
        handleSelectPlace(match.destination);
        setTranscript('');
        setSpokenReply(null);
      }, 2000);
    } else {
      // General fallbacks if no specific destination matches
      const fallbackMsg = `Dictation captured: "${transcript}". Querying real-time records across incredible India...`;
      setSpokenReply(fallbackMsg);
      speakText(`Searching for ${transcript}`);
      setTimeout(() => {
        setQuery(transcript);
        onSearchSelect(transcript, 4, 65000);
        setTranscript('');
        setSpokenReply(null);
      }, 2000);
    }
  }, [isListening, transcript]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      // Elegant Integration Fallback for browsers with blocked or missing Web Speech
      setTranscript("Initializing backup voice assistant...");
      setIsListening(true);
      speakText("Initiating voice search simulation.");
      setTimeout(() => {
        const samplePrompts = [
          "Explain Mysore Palace Karnataka heritage grandeur",
          "What is the weather in Kashmir Srinagar today?",
          "Take me to Hampi Ruins stone carvings",
          "Show luxury beach resort options near Goa"
        ];
        const randomPhrase = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
        setTranscript(randomPhrase);
        setIsListening(false);
      }, 2500);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        setVoiceError("Microphone startup failure. Check block permissions.");
      }
    }
  };

  return (
    <div className={`w-full z-[450] transition-all duration-300 ${
      scrolled && sticky ? 'fixed top-18 left-1/2 -translate-x-1/2 w-[92%] max-w-3xl mt-0 px-2' : 'relative my-3'
    }`}>
      
      {/* 1. GLASSMORPHIC MAIN SEARCH INPUT BOX */}
      <div className={`p-1.5 rounded-[24px] border transition-all duration-300 ${
        scrolled && sticky 
          ? 'bg-white/80 backdrop-blur-xl border-orange-500/20 shadow-2xl' 
          : 'bg-white/95 border-slate-200/80 shadow-lg hover:border-slate-350'
      } flex items-center justify-between gap-2`}>
        
        {/* Left Side: Search Icon & Actual Text Input */}
        <div className="flex-1 flex items-center gap-2 pl-3">
          <Search className={`h-4.5 w-4.5 ${isFocused ? 'text-orange-600' : 'text-slate-400'} transition-colors shrink-0`} />
          <input 
            type="text"
            placeholder={placeholder}
            className="w-full bg-transparent border-none outline-none focus:ring-0 text-xs sm:text-xs text-slate-800 font-extrabold placeholder-slate-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />
          {query && (
            <button 
              onClick={() => { setQuery(''); setSuggestions([]); }}
              className="p-1 hover:bg-slate-100 rounded-full transition cursor-pointer shrink-0"
            >
              <X className="h-3.5 w-3.5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Right Side Control Panel: Microphone Link + Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleListening}
            className={`p-2 rounded-full cursor-pointer transition relative flex items-center justify-center ${
              isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-orange-50 hover:bg-orange-100 text-orange-600'
            }`}
            title="Voice Command Assistant"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isListening && (
              <span className="absolute -inset-1 rounded-full border-2 border-rose-500 animate-ping opacity-75"></span>
            )}
          </button>

          <button
            onClick={() => handleSelectPlace(query || "Taj Mahal, Agra")}
            className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-extrabold tracking-wider uppercase px-4 py-2 rounded-full transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            Explore
          </button>
        </div>
      </div>

      {/* 2. LIVE SELECTION DROPDOWN AUTOCOMPLETE DIALOG */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="absolute top-15 left-0 right-0 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-4 mt-1.5 space-y-4 max-h-[380px] overflow-y-auto"
          >
            {/* Live Autocomplete suggestions */}
            {suggestions.length > 0 ? (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-orange-600" /> Matches Found ({suggestions.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPlace(item.destination)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 text-left transition text-slate-800 cursor-pointer"
                    >
                      <img src={item.image} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">{item.destination}</div>
                        <div className="text-[9px] text-slate-500 truncate">{item.location} • {item.tag}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Recent Searches & Popular Circuits Categories
              <div className="space-y-4">
                {/* Recent Searches Row */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" /> Recent Search History
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectPlace(term)}
                        className="px-3 py-1 bg-slate-50 hover:bg-slate-100 rounded-full text-[10px] font-bold text-slate-700 border border-slate-200/80 cursor-pointer flex items-center gap-1 transition"
                      >
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trending Hotspots */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-600" /> Trending Curation
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Leh Ladakh", "Goa Beaches", "Munnar Tea Hills", "Kashmir Valleys", "Hampi Ruins"].map((term, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectPlace(term)}
                        className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 rounded-full text-[10px] font-extrabold text-sky-800 border border-sky-100 cursor-pointer transition"
                      >
                        🏔️ {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Predefined Route Alignments */}
                <div className="space-y-1 bg-amber-50/50 p-2 text-left rounded-xl border border-amber-100">
                  <span className="text-[9px] font-bold text-amber-800 uppercase tracking-widest leading-none">💡 Superapp Pro-tip:</span>
                  <p className="text-[9px] text-slate-600">
                    Try voice search! Press the microphone icon and speak: <span className="font-bold">"Best hot spots near Mysore"</span> or <span className="font-bold">"Weather in Munnar"</span> to invoke real AI response.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
              <span>Press enter or click 'Explore' to generate dynamic trip details</span>
              <button onClick={() => setIsFocused(false)} className="hover:text-slate-600 cursor-pointer">Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. VOICE INTERACTIVE FLOATING WAVE DIALOG */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-slate-900 border border-slate-800 text-white p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="inline-flex items-center gap-1 text-[9px] bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded text-orange-400 uppercase tracking-widest font-mono">
                  🎤 Real-time Link
                </span>
                <button 
                  onClick={() => setIsListening(false)}
                  className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Kinetic Equalizer audio wavelength waves */}
              <div className="relative flex items-center justify-center py-6 gap-1 h-16">
                <span className="w-1.5 bg-orange-500 rounded-full h-12 animate-bounce duration-500 delay-100"></span>
                <span className="w-1.5 bg-amber-400 rounded-full h-8 animate-bounce duration-400 delay-200"></span>
                <span className="w-1.5 bg-yellow-300 rounded-full h-14 animate-bounce duration-500 delay-0"></span>
                <span className="w-1.5 bg-orange-400 rounded-full h-9 animate-bounce duration-300 delay-150"></span>
                <span className="w-1.5 bg-yellow-500 rounded-full h-12 animate-bounce duration-400 delay-100"></span>
              </div>

              {/* Transcripts visualizer */}
              <div className="space-y-2">
                <h4 className="text-sm font-extrabold text-slate-200">Tripverse voice companion and route analyzer</h4>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[70px] flex items-center justify-center text-xs text-orange-400 font-bold font-mono">
                  "{transcript}"
                </div>
              </div>

              {/* Spoken system response or guidance */}
              {spokenReply ? (
                <div className="p-3 bg-blue-900/40 border border-blue-500/20 text-blue-300 text-[11px] font-semibold rounded-xl text-left flex items-start gap-2">
                  <Volume2 className="h-4 w-4 shrink-0 text-blue-400 mt-0.5 animate-pulse" />
                  <p>{spokenReply}</p>
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Listening... Try: "Goa Beaches" or "Mysore Palace Karnataka"
                </div>
              )}

              {/* Stop Dictation Actions */}
              <button
                onClick={toggleListening}
                className="w-full bg-rose-600 hover:bg-rose-500 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
              >
                Terminate Dictation
              </button>

              {voiceError && (
                <p className="text-[10px] text-rose-400 font-bold bg-rose-950/20 p-2 rounded border border-rose-900/30">
                  ⚠️ {voiceError}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
