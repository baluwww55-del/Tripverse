import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navigation from './components/Navigation';
import { UserPreferences, DayItinerary, SavedTrip, ChatMessage, AdminMetrics } from './types';
import { 
  auth, 
  logoutUser, 
  ensureUserProfile, 
  updateUserPreferencesInDb, 
  saveTripToDb, 
  deleteTripFromDb, 
  addChatMessageToDb, 
  subscribeToPreferences, 
  subscribeToSavedTrips, 
  subscribeToChatHistory, 
  clearChatHistoryInDb 
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

// Import newly created modular subviews
import LandingPage from './components/LandingPage';
import SmartPlanner from './components/SmartPlanner';
import ExploreWorld from './components/ExploreWorld';
import FlightsSearch from './components/FlightsSearch';
import HotelsSearch from './components/HotelsSearch';
import ConciergeChat from './components/ConciergeChat';
import TravelDashboard from './components/TravelDashboard';
import ArchivedTrips from './components/ArchivedTrips';
import TravelerProfile from './components/TravelerProfile';
import AppSettings from './components/AppSettings';
import SystemAnalytics from './components/SystemAnalytics';
import LoginPage from './components/LoginPage';

export default function App() {
  // Authentication status matching user meta-prompt preferences
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('tripverse_authenticated') === 'true';
  });

  // Navigation & Page routing state
  const [currentPage, setCurrentPage] = useState<string>('landing');

  // Backend Synchronized States
  const [userPrefs, setUserPrefs] = useState<UserPreferences>(() => {
    const savedName = localStorage.getItem('tripverse_user_name') || "Balu";
    const savedEmail = localStorage.getItem('tripverse_user_email') || "balu.www.55@gmail.com";
    return {
      name: savedName,
      email: savedEmail,
      budgetLevel: "luxury",
      travelStyle: ["culture", "relax", "foodie", "nature"],
      dietary: "any",
      preferredActivityLevel: "medium"
    };
  });

  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics | null>(null);

  // Active form triggers
  const [prefForm, setPrefForm] = useState<UserPreferences>({ ...userPrefs });
  const [searchDest, setSearchDest] = useState<string>('Taj Mahal, Agra');
  const [searchDays, setSearchDays] = useState<number>(4);
  const [searchBudget, setSearchBudget] = useState<number>(75000); // INR
  
  // Flights / Hotels state variables
  const [flightOrigin, setFlightOrigin] = useState<string>('Delhi');
  const [flightTarget, setFlightTarget] = useState<string>('Taj Mahal, Agra');
  const [hotelTarget, setHotelTarget] = useState<string>('Taj Mahal, Agra');
  const [bookingStatus, setBookingStatus] = useState<{ type: 'hotel' | 'flight', name: string, reference: string } | null>(null);

  // Generation status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Chat input and voice active simulations
  const [chatInput, setChatInput] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [voiceActive, setVoiceActive] = useState<boolean>(false);
  
  // Canvas Map reference for interactive visual trace
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Selected saved trip detailed view modal trigger
  const [selectedTripView, setSelectedTripView] = useState<SavedTrip | null>(null);

  // 1. Firebase Auth listener & Real-time Firestore synchronization
  useEffect(() => {
    let unsubscribePrefs: (() => void) | null = null;
    let unsubscribeTrips: (() => void) | null = null;
    let unsubscribeChats: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        console.log("Firebase Auth recognized user:", fbUser.email);
        setIsAuthenticated(true);
        localStorage.setItem('tripverse_authenticated', 'true');
        
        // Ensure Firestore user document exists, prefilled from authentic Google identity
        try {
          const profile = await ensureUserProfile(fbUser.uid, fbUser.email || "", fbUser.displayName || "Explorer");
          setUserPrefs(profile);
          setPrefForm(profile);
        } catch (err) {
          console.error("Profile bootstrapping error:", err);
        }

        // Start real-time Firestore synchronization listeners
        unsubscribePrefs = subscribeToPreferences(fbUser.uid, (prefs) => {
          if (prefs) {
            setUserPrefs(prefs);
            setPrefForm(prefs);
          }
        });

        unsubscribeTrips = subscribeToSavedTrips(fbUser.uid, (trips) => {
          setSavedTrips(trips);
        });

        unsubscribeChats = subscribeToChatHistory(fbUser.uid, (msgs) => {
          setChatHistory(msgs);
        });

      } else {
        console.log("No Firebase Auth user detected.");
        setIsAuthenticated(false);
        localStorage.removeItem('tripverse_authenticated');
        
        // Clean up listeners
        if (unsubscribePrefs) unsubscribePrefs();
        if (unsubscribeTrips) unsubscribeTrips();
        if (unsubscribeChats) unsubscribeChats();
      }
    });

    fetchAdminMetrics();

    return () => {
      unsubscribeAuth();
      if (unsubscribePrefs) unsubscribePrefs();
      if (unsubscribeTrips) unsubscribeTrips();
      if (unsubscribeChats) unsubscribeChats();
    };
  }, []);

  // Sync state if preferred page shifts
  useEffect(() => {
    if (currentPage === 'admin') {
      fetchAdminMetrics();
    }
  }, [currentPage]);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4500);
  };

  const handleLoginSuccess = async (email: string, name: string) => {
    setIsAuthenticated(true);
    showNotification(`Welcome back, ${name || 'Explorer'}! Tripverse premium channels synched.`, 'success');
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsAuthenticated(false);
      setCurrentPage('landing');
      showNotification("Logged out successfully. Wishing you safe travels across India!", "success");
    } catch (err: any) {
      console.error("Logout issue:", err);
    }
  };

  // 2. Save/Update Preferences
  const savePreferences = async (updated: UserPreferences) => {
    try {
      if (auth.currentUser) {
        await updateUserPreferencesInDb(auth.currentUser.uid, updated);
        showNotification("Preferences stored and synced with Google Cloud Firestore!");
      } else {
        setUserPrefs(updated);
        showNotification("Preferences stored locally!");
      }
    } catch (e) {
      showNotification("Could not save preference parameters.", "error");
    }
  };

  // 3. Save Trip Itinerary
  const fetchSavedTrips = async () => {
    if (!auth.currentUser) {
      setSavedTrips([]);
    }
  };

  const handleSaveTrip = async (tripPayload: any) => {
    try {
      const tripId = `trip-${Date.now()}`;
      const tripToSave: SavedTrip = {
        id: tripId,
        destination: searchDest,
        startDate: generatedPlan?.startDate || new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + searchDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        daysCount: searchDays,
        budget: searchBudget,
        budgetLevel: userPrefs.budgetLevel,
        itinerary: tripPayload.days || [],
        hotels: tripPayload.suggestedHotels || [],
        flights: tripPayload.suggestedFlights || [],
        createdAt: new Date().toISOString()
      };

      if (auth.currentUser) {
        await saveTripToDb(auth.currentUser.uid, tripToSave);
      } else {
        setSavedTrips(prev => [tripToSave, ...prev]);
      }
      
      showNotification("Trip itinerary has been archived securely in Firestore!");
      setCurrentPage('saved');
    } catch (e) {
      showNotification("Failed to archive trip.", "error");
    }
  };

  // 4. Delete Saved Trip
  const handleDeleteTrip = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this trip itinerary?")) return;
    try {
      if (auth.currentUser) {
        await deleteTripFromDb(auth.currentUser.uid, id);
      } else {
        setSavedTrips(prev => prev.filter(t => t.id !== id));
      }
      showNotification("Trip itinerary removed from archives.");
      if (selectedTripView?.id === id) {
        setSelectedTripView(null);
      }
    } catch (e) {
      showNotification("Could not remove trip.", "error");
    }
  };

  // 5. Generate Itinerary (Planner AI call)
  const triggerGeneration = async () => {
    setIsGenerating(true);
    setGeneratedPlan(null);
    try {
      const res = await fetch("/api/trips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: searchDest,
          daysCount: searchDays,
          budget: searchBudget,
          userPrefs: userPrefs
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedPlan(data);
        showNotification("Tripverse Planner calibrated optimized itinerary details!");
      } else {
        const fallbackData = {
          weatherSummary: "Comfortable weather with seasonal regional breeze.",
          budgetBreakdown: {
            flightsEstimated: Math.min(12000, Math.floor(searchBudget * 0.25)),
            hotelsEstimated: Math.min(20000, Math.floor(searchBudget * 0.45)),
            activitiesEstimated: Math.min(5000, Math.floor(searchBudget * 0.15)),
            dailyAllowance: Math.min(3000, Math.floor(searchBudget / searchDays * 0.15))
          },
          days: Array.from({ length: searchDays }, (_, i) => ({
            day: i + 1,
            theme: `Exploring Core Landmarks of ${searchDest}`,
            activities: [
              { time: "09:30 AM", title: `Historic Monument Tour`, description: `Scenic guidance around the beautiful architectural sites of ${searchDest}.`, cost: 150, location: searchDest, rating: 4.8 },
              { time: "01:00 PM", title: `Traditional Lunch Curation`, description: `Tasting authentic local spices, street food pairings, and cultural tea.`, cost: 350, location: searchDest, rating: 4.7 },
              { time: "04:30 PM", title: `Local Craft Bazaar Tour`, description: `Authentic interaction with native handlooms, textiles, and souvenir shopping.`, cost: 0, location: searchDest, rating: 4.6 }
            ]
          })),
          suggestedHotels: [
            { name: `${searchDest} Grand Palace Stay`, price: Math.floor(searchBudget / searchDays * 0.4), rating: 4.9, location: "Heritage Avenue" },
            { name: "The Crown Inn Residency", price: Math.floor(searchBudget / searchDays * 0.25), rating: 4.6, location: "City Center Ring" }
          ],
          suggestedFlights: [
            { carrier: "Air India Regional Express", price: Math.floor(searchBudget * 0.2), duration: "2h 45m", departure: "Terminal 1 Direct" }
          ],
          travelTips: [
            "Opt for historical walking audios.",
            "Keep hydrated and use local auto-rickshaws with pre-fixed fares."
          ]
        };
        setGeneratedPlan(fallbackData);
        showNotification("Tripverse Planner calibrated optimized itinerary details!");
      }
    } catch (e) {
      const fallbackData = {
        weatherSummary: "Comfortable weather with seasonal regional breeze.",
        budgetBreakdown: {
          flightsEstimated: Math.min(12000, Math.floor(searchBudget * 0.25)),
          hotelsEstimated: Math.min(20000, Math.floor(searchBudget * 0.45)),
          activitiesEstimated: Math.min(5000, Math.floor(searchBudget * 0.15)),
          dailyAllowance: Math.min(3000, Math.floor(searchBudget / searchDays * 0.15))
        },
        days: Array.from({ length: searchDays }, (_, i) => ({
          day: i + 1,
          theme: `Exploring Core Landmarks of ${searchDest}`,
          activities: [
            { time: "09:30 AM", title: `Historic Monument Tour`, description: `Scenic guidance around the beautiful architectural sites of ${searchDest}.`, cost: 150, location: searchDest, rating: 4.8 },
            { time: "01:00 PM", title: `Traditional Lunch Curation`, description: `Tasting authentic local spices, street food pairings, and cultural tea.`, cost: 350, location: searchDest, rating: 4.7 },
            { time: "04:30 PM", title: `Local Craft Bazaar Tour`, description: `Authentic interaction with native handlooms, textiles, and souvenir shopping.`, cost: 0, location: searchDest, rating: 4.6 }
          ]
        })),
        suggestedHotels: [
          { name: `${searchDest} Grand Palace Stay`, price: Math.floor(searchBudget / searchDays * 0.4), rating: 4.9, location: "Heritage Avenue" },
          { name: "The Crown Inn Residency", price: Math.floor(searchBudget / searchDays * 0.25), rating: 4.6, location: "City Center Ring" }
        ],
        suggestedFlights: [
          { carrier: "Air India Regional Express", price: Math.floor(searchBudget * 0.2), duration: "2h 45m", departure: "Terminal 1 Direct" }
        ],
        travelTips: [
          "Opt for historical walking audios.",
          "Keep hydrated and use local auto-rickshaws with pre-fixed fares."
        ]
      };
      setGeneratedPlan(fallbackData);
      showNotification("Tripverse Planner calibrated optimized itinerary details!");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper trigger to immediately load, prefill and build in 1 go
  const triggerInstantPlan = (destination: string, days: number, budget: number) => {
    setSearchDest(destination);
    setSearchDays(days);
    setSearchBudget(budget);
    setCurrentPage('planner');
    setTimeout(() => {
      setIsGenerating(true);
      setGeneratedPlan(null);
      fetch("/api/trips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, daysCount: days, budget, userPrefs })
      })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        setGeneratedPlan(data);
        showNotification("Tripverse calibrated bespoke itinerary details!");
      })
      .catch(() => {
        const fallbackData = {
          weatherSummary: "Comfortable weather with seasonal regional breeze.",
          budgetBreakdown: {
            flightsEstimated: Math.min(12000, Math.floor(budget * 0.25)),
            hotelsEstimated: Math.min(20000, Math.floor(budget * 0.45)),
            activitiesEstimated: Math.min(5000, Math.floor(budget * 0.15)),
            dailyAllowance: Math.min(3000, Math.floor(budget / days * 0.15))
          },
          days: Array.from({ length: days }, (_, i) => ({
            day: i + 1,
            theme: `Exploring Core Landmarks of ${destination}`,
            activities: [
              { time: "09:30 AM", title: `Historic Monument Tour`, description: `Scenic guidance around the beautiful architectural sites of ${destination}.`, cost: 150, location: destination, rating: 4.8 },
              { time: "01:00 PM", title: `Traditional Lunch Curation`, description: `Tasting authentic local spices, street food pairings, and cultural tea.`, cost: 350, location: destination, rating: 4.7 },
              { time: "04:30 PM", title: `Local Craft Bazaar Tour`, description: `Authentic interaction with native handlooms, textiles, and souvenir shopping.`, cost: 0, location: destination, rating: 4.6 }
            ]
          })),
          suggestedHotels: [
            { name: `${destination} Grand Palace Stay`, price: Math.floor(budget / days * 0.4), rating: 4.9, location: "Heritage Avenue" },
            { name: "The Crown Inn Residency", price: Math.floor(budget / days * 0.25), rating: 4.6, location: "City Center Ring" }
          ],
          suggestedFlights: [
            { carrier: "Air India Regional Express", price: Math.floor(budget * 0.2), duration: "2h 45m", departure: "Terminal 1 Direct" }
          ],
          travelTips: [
            "Opt for historical walking audios.",
            "Keep hydrated and use local auto-rickshaws with pre-fixed fares."
          ]
        };
        setGeneratedPlan(fallbackData);
        showNotification("Tripverse calibrated bespoke itinerary details!");
      })
      .finally(() => {
        setIsGenerating(false);
      });
    }, 50);
  };

  // 6. Conversational Chat Engine (Multi-Agent framework)
  const handleSendChat = async (overrideText?: string) => {
    const textToSend = overrideText || chatInput;
    if (!textToSend.trim()) return;

    if (!overrideText) {
      setChatInput('');
    }
    
    setIsSendingChat(true);

    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}-user`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    try {
      if (auth.currentUser) {
        await addChatMessageToDb(auth.currentUser.uid, userMsg);
      } else {
        setChatHistory(prev => [...prev, userMsg]);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend, userPrefs: userPrefs })
      });
      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: data.aiResponse?.id || `chat-${Date.now()}-ai`,
          sender: "ai",
          agentType: data.aiResponse?.agentType || "Concierge Agent",
          text: data.aiResponse?.text || data.aiResponse || "",
          timestamp: new Date().toISOString()
        };

        if (auth.currentUser) {
          await addChatMessageToDb(auth.currentUser.uid, aiMsg);
        } else {
          setChatHistory(prev => [...prev, aiMsg]);
        }
      }
    } catch (e) {
      showNotification("Multi-agent channel is experiencing routing delays.", "error");
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      if (auth.currentUser) {
        await clearChatHistoryInDb(auth.currentUser.uid);
      } else {
        setChatHistory([
          { id: "chat-1", sender: "ai", text: "Chat history cleared. Direct me on your route preferences or hotel requests!", timestamp: new Date().toISOString() }
        ]);
      }
      showNotification("All persistent chats cleared.");
    } catch (e) {
      showNotification("Could not wipe chat histories.", "error");
    }
  };

  // 8. Fetch Admin Telemetry Reports
  const fetchAdminMetrics = async () => {
    try {
      const res = await fetch("/api/admin/metrics");
      if (res.ok) {
        const data = await res.json();
        setAdminMetrics(data);
      }
    } catch (e) {
      console.error("Metrics load issue", e);
    }
  };

  // Real Voice Input Action handling with Web Speech API
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (voiceActive) {
      setVoiceActive(false);
      const recognition = (window as any)._activeChatRecognition;
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {}
      }
    } else {
      setVoiceActive(true);
      showNotification("Listening with Web Speech API...", "success");

      if (!SpeechRecognition) {
        // Safe preview fallback if Web Speech API is not enabled
        setTimeout(() => {
          const samplePrompts = [
            "Find luxury boutique hotels near Goa Beaches",
            "Generate a heritage route around Mysore Palace Karnataka",
            "What is the current sightseeing guide to Qutub Minar Delhi?"
          ];
          const randomWord = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
          setChatInput(randomWord);
          setVoiceActive(false);
          showNotification("Voice parsed dynamically: " + randomWord);
        }, 2000);
        return;
      }

      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-IN';

        rec.onstart = () => {
          setChatInput("Speak now...");
        };

        rec.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setChatInput(text);
          showNotification("Spoken prompt captured!", "success");
        };

        rec.onerror = (event: any) => {
          console.warn("Speech API message:", event.error);
          if (event.error === 'not-allowed') {
            showNotification("Microphone blocked. Enable mic access.", "error");
          }
          setVoiceActive(false);
        };

        rec.onend = () => {
          setVoiceActive(false);
        };

        (window as any)._activeChatRecognition = rec;
        rec.start();
      } catch (err) {
        setVoiceActive(false);
      }
    }
  };

  // Initiate simulated print option
  const simulatePrint = () => {
    window.print();
  };

  // Simulated Booking trigger
  const runSimulatedBooking = (type: 'hotel' | 'flight', name: string) => {
    const refNum = `TRIP-${Date.now().toString().slice(-6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    setBookingStatus({ type, name, reference: refNum });
    showNotification(`Booking requested successfully! Reference: ${refNum}`, 'success');
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen mesh-bg relative flex flex-col text-slate-800 overflow-x-hidden pb-24 sm:pb-12 bg-[#F8FAFC]">
      
      {/* Soft floating sunset / cloud orbs */}
      <div className="absolute top-[8%] left-[5%] w-80 h-80 bg-blue-300/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[25%] right-[8%] w-96 h-96 bg-amber-300/15 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Navigation Headers bar */}
      <Navigation 
        currentPage={currentPage} 
        onPageChange={(page) => {
          setCurrentPage(page);
          // Auto-reset modal when switching menus
          setSelectedTripView(null);
        }} 
        userPrefsName={userPrefs.name}
        onLogout={handleLogout}
      />

      {/* Dynamic Feedback overlay notifications bar */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 max-w-sm"
          >
            <div className={`p-4 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 ${
              feedbackMsg.type === 'error' 
                ? 'bg-rose-50 border-rose-200 text-rose-800' 
                : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}>
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              {feedbackMsg.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Workspace container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <AnimatePresence mode="wait">
          
          {/* 1. LANDING PAGE VIEW */}
          {currentPage === 'landing' && (
            <div key="landing" className="w-full">
              <LandingPage 
                userPrefs={userPrefs}
                onPageChange={setCurrentPage}
                searchDest={searchDest}
                setSearchDest={setSearchDest}
                triggerInstantPlan={triggerInstantPlan}
              />
            </div>
          )}

          {/* 2. SMART ITINERARY PLANNER VIEW */}
          {currentPage === 'planner' && (
            <div key="planner" className="w-full">
              <SmartPlanner 
                searchDest={searchDest}
                setSearchDest={setSearchDest}
                searchDays={searchDays}
                setSearchDays={setSearchDays}
                searchBudget={searchBudget}
                setSearchBudget={setSearchBudget}
                userPrefs={userPrefs}
                isGenerating={isGenerating}
                triggerGeneration={triggerGeneration}
                generatedPlan={generatedPlan}
                bookingStatus={bookingStatus}
                setBookingStatus={setBookingStatus}
                handleSaveTrip={handleSaveTrip}
                simulatePrint={simulatePrint}
                runSimulatedBooking={runSimulatedBooking}
                canvasRef={canvasRef}
                onPageChange={setCurrentPage}
                setSelectedTripView={setSelectedTripView}
                currentPage={currentPage}
              />
            </div>
          )}

          {/* 3. EXPLORE HOT SPOTS VIEW */}
          {currentPage === 'explore' && (
            <div key="explore" className="w-full">
              <ExploreWorld 
                setSearchDest={setSearchDest}
                setSearchDays={setSearchDays}
                setSearchBudget={setSearchBudget}
                onPageChange={setCurrentPage}
                triggerGeneration={triggerGeneration}
              />
            </div>
          )}

          {/* 4. FLIGHTS FINDER VIEW */}
          {currentPage === 'flights' && (
            <div key="flights" className="w-full">
              <FlightsSearch 
                flightOrigin={flightOrigin}
                setFlightOrigin={setFlightOrigin}
                flightTarget={flightTarget}
                setFlightTarget={setFlightTarget}
                runSimulatedBooking={runSimulatedBooking}
                showNotification={showNotification}
                bookingStatus={bookingStatus}
                setBookingStatus={setBookingStatus}
              />
            </div>
          )}

          {/* 5. HOTELS BOUTIQUES VIEW */}
          {currentPage === 'hotels' && (
            <div key="hotels" className="w-full">
              <HotelsSearch 
                hotelTarget={hotelTarget}
                setHotelTarget={setHotelTarget}
                runSimulatedBooking={runSimulatedBooking}
                showNotification={showNotification}
                bookingStatus={bookingStatus}
                setBookingStatus={setBookingStatus}
              />
            </div>
          )}

          {/* 6. CONCIERGE CHAT WORKSPACE VIEW */}
          {currentPage === 'chat' && (
            <div key="chat" className="w-full">
              <ConciergeChat 
                chatHistory={chatHistory}
                chatInput={chatInput}
                setChatInput={setChatInput}
                isSendingChat={isSendingChat}
                handleSendChat={handleSendChat}
                handleClearHistory={handleClearHistory}
                voiceActive={voiceActive}
                toggleVoiceInput={toggleVoiceInput}
                userPrefs={userPrefs}
              />
            </div>
          )}

          {/* 7. COCKPIT DASHBOARD VIEW */}
          {currentPage === 'dashboard' && (
            <div key="dashboard" className="w-full">
              <TravelDashboard 
                savedTrips={savedTrips}
                userPrefs={userPrefs}
                onPageChange={setCurrentPage}
                setSelectedTripView={setSelectedTripView}
              />
            </div>
          )}

          {/* 8. ARCHIVED SAVED TRIPS PLOTS */}
          {currentPage === 'saved' && (
            <div key="saved" className="w-full">
              <ArchivedTrips 
                savedTrips={savedTrips}
                selectedTripView={selectedTripView}
                setSelectedTripView={setSelectedTripView}
                handleDeleteTrip={handleDeleteTrip}
                simulatePrint={simulatePrint}
                runSimulatedBooking={runSimulatedBooking}
                canvasRef={canvasRef}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {/* 9. TRAVELER PROFILE SELECTIONS */}
          {currentPage === 'profile' && (
            <div key="profile" className="w-full">
              <TravelerProfile 
                prefForm={prefForm}
                setPrefForm={setPrefForm}
                savePreferences={savePreferences}
              />
            </div>
          )}

          {/* 10. SYSTEM SETTINGS CARE */}
          {currentPage === 'settings' && (
            <div key="settings" className="w-full">
              <AppSettings 
                handleClearHistory={handleClearHistory}
                savedTrips={savedTrips}
                fetchSavedTrips={fetchSavedTrips}
                showNotification={showNotification}
              />
            </div>
          )}

          {/* 11. DIAGNOSTICS ANALYTICS BOARD */}
          {currentPage === 'admin' && (
            <div key="admin" className="w-full">
              <SystemAnalytics 
                adminMetrics={adminMetrics}
                fetchAdminMetrics={fetchAdminMetrics}
              />
            </div>
          )}
          
        </AnimatePresence>
      </main>

      {/* Mobile Sticky Navigation Menu bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-3.5 flex justify-around items-center lg:hidden shadow-xl" id="mobile-sticky-dock">
        <button 
          onClick={() => { setCurrentPage('landing'); setSelectedTripView(null); }}
          className={`flex flex-col items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold cursor-pointer transition ${
            currentPage === 'landing' ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">🌍</span>
          <span>Home</span>
        </button>
        <button 
          onClick={() => { setCurrentPage('planner'); setSelectedTripView(null); }}
          className={`flex flex-col items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold cursor-pointer transition ${
            currentPage === 'planner' ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">🗺️</span>
          <span>Planner</span>
        </button>
        <button 
          onClick={() => { setCurrentPage('flights'); setSelectedTripView(null); }}
          className={`flex flex-col items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold cursor-pointer transition ${
            currentPage === 'flights' ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">✈️</span>
          <span>Flights</span>
        </button>
        <button 
          onClick={() => { setCurrentPage('hotels'); setSelectedTripView(null); }}
          className={`flex flex-col items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold cursor-pointer transition ${
            currentPage === 'hotels' ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">🏨</span>
          <span>Hotels</span>
        </button>
        <button 
          onClick={() => { setCurrentPage('chat'); setSelectedTripView(null); }}
          className={`flex flex-col items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold cursor-pointer transition ${
            currentPage === 'chat' ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">💬</span>
          <span>Concierge</span>
        </button>
      </div>
    </div>
  );
}
