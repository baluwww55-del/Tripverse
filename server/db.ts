import fs from 'fs';
import path from 'path';

// Define the file to write database to
const DB_FILE = path.join(process.cwd(), 'database-store.json');

export interface UserPreferences {
  name: string;
  email: string;
  budgetLevel: 'budget' | 'moderate' | 'luxury';
  travelStyle: string[]; // e.g. ["adventure", "culture", "relax", "foodie"]
  dietary: string;
  preferredActivityLevel: 'low' | 'medium' | 'high';
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  cost: number;
  location: string;
  rating: number;
}

export interface DayItinerary {
  day: number;
  theme: string;
  activities: Activity[];
}

export interface SavedTrip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  budget: number;
  budgetLevel: string;
  itinerary: DayItinerary[];
  hotels: any[];
  flights: any[];
  createdAt: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  agentType?: 'user' | 'planner' | 'guide';
  text: string;
  timestamp: string;
}

export interface APILog {
  endpoint: string;
  timestamp: string;
  responseTimeMs: number;
  status: number;
}

export interface AppDatabase {
  preferences: UserPreferences;
  savedTrips: SavedTrip[];
  chatHistory: ChatMessage[];
  apiLogs: APILog[];
}

// Default initial data
const defaultDb: AppDatabase = {
  preferences: {
    name: "Traveler",
    email: "balu.www.55@gmail.com",
    budgetLevel: "moderate",
    travelStyle: ["culture", "relax", "foodie"],
    dietary: "any",
    preferredActivityLevel: "medium"
  },
  savedTrips: [
    {
      id: "trip-bali-1",
      destination: "Bali, Indonesia",
      startDate: "2026-07-10",
      endDate: "2026-07-15",
      daysCount: 5,
      budget: 1500,
      budgetLevel: "moderate",
      createdAt: "2026-05-28T10:00:00Z",
      hotels: [
        { name: "Sayan Luxury Sanctuary", price: 180, rating: 4.8, location: "Ubud, Bali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80" },
        { name: "Seminyak Beach Resort", price: 120, rating: 4.6, location: "Seminyak, Bali", image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=400&q=80" }
      ],
      flights: [
        { carrier: "Singapore Airlines", price: 420, duration: "6h 40m", rating: 4.9, logo: "SQ" },
        { carrier: "AirAsia", price: 210, duration: "7h 15m", rating: 4.2, logo: "AK" }
      ],
      itinerary: [
        {
          day: 1,
          theme: "Cultural Heart of Ubud",
          activities: [
            { time: "09:00 AM", title: "Sacred Monkey Forest Sanctuary", description: "Walk among pristine nutmeg forests and observe playful long-tailed macaques.", cost: 10, location: "Ubud forest", rating: 4.5 },
            { time: "01:00 PM", title: "Traditional Balinese Lunch at Bebek Bengil", description: "Savor the crispy duck with paddy-field views.", cost: 25, location: "Central Ubud", rating: 4.6 },
            { time: "04:30 PM", title: "Ubud Royal Palace & Saraswati Walk", description: "Stunning lotus ponds and traditional wooden details.", cost: 0, location: "Central Ubud", rating: 4.7 }
          ]
        },
        {
          day: 2,
          theme: "Rice Terrace & Spiritual Water Purification",
          activities: [
            { time: "08:00 AM", title: "Tegalalang Rice Terrace Trek", description: "Immerse in lush terraced slopes and typical Subak irrigation networks.", cost: 5, location: "Tegalalang", rating: 4.8 },
            { time: "11:30 AM", title: "Tirta Empul Holy Water Temple", description: "Experience a spiritual cleansing ritual in sacred volcanic spring waters.", cost: 12, location: "Manukaya Village", rating: 4.9 }
          ]
        }
      ]
    }
  ],
  chatHistory: [
    { id: "chat-1", sender: "ai", text: "Welcome to VoyageAI! I am your lead coordinator AI. I can connect you with Planner AI to craft a detailed calendar, or Guide AI to answer local cultural queries. Where would you like to explore?", timestamp: "2026-05-28T15:00:00Z" }
  ],
  apiLogs: [
    { endpoint: "/api/trips/generate", timestamp: "2026-05-28T14:22:00Z", responseTimeMs: 1450, status: 200 },
    { endpoint: "/api/chat", timestamp: "2026-05-28T15:00:10Z", responseTimeMs: 820, status: 200 }
  ]
};

// Global active in-memory cache synchronized with the JSON file
let dbInstance: AppDatabase = { ...defaultDb };

export function loadDatabase(): AppDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbInstance = JSON.parse(content);
    } else {
      saveDatabase(defaultDb);
    }
  } catch (error) {
    console.error("Failed to load databases file, using defaults", error);
    dbInstance = { ...defaultDb };
  }
  return dbInstance;
}

export function saveDatabase(data: AppDatabase): void {
  try {
    dbInstance = data;
    // Format JSON with 2-space indentation
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Failed to save database file", error);
  }
}

// Initialize on require
loadDatabase();

export const Database = {
  getPreferences(): UserPreferences {
    return dbInstance.preferences;
  },
  updatePreferences(pref: Partial<UserPreferences>): UserPreferences {
    dbInstance.preferences = { ...dbInstance.preferences, ...pref };
    saveDatabase(dbInstance);
    return dbInstance.preferences;
  },
  getSavedTrips(): SavedTrip[] {
    return dbInstance.savedTrips;
  },
  saveTrip(trip: SavedTrip): SavedTrip {
    // Check if trip already exists, if so update it, else add it
    const index = dbInstance.savedTrips.findIndex(t => t.id === trip.id);
    if (index >= 0) {
      dbInstance.savedTrips[index] = trip;
    } else {
      dbInstance.savedTrips.push(trip);
    }
    saveDatabase(dbInstance);
    return trip;
  },
  deleteTrip(id: string): boolean {
    const originalLength = dbInstance.savedTrips.length;
    dbInstance.savedTrips = dbInstance.savedTrips.filter(t => t.id !== id);
    saveDatabase(dbInstance);
    return dbInstance.savedTrips.length < originalLength;
  },
  getChatHistory(): ChatMessage[] {
    return dbInstance.chatHistory;
  },
  addChatMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const fullMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };
    dbInstance.chatHistory.push(fullMsg);
    // Keep max 100 chat messages to avoid bloat
    if (dbInstance.chatHistory.length > 100) {
      dbInstance.chatHistory.shift();
    }
    saveDatabase(dbInstance);
    return fullMsg;
  },
  clearChatHistory(): void {
    dbInstance.chatHistory = [
      { id: "chat-1", sender: "ai", text: "Welcome back! How can I assist you with your next journeys today?", timestamp: new Date().toISOString() }
    ];
    saveDatabase(dbInstance);
  },
  getAPILogs(): APILog[] {
    return dbInstance.apiLogs;
  },
  addAPILog(endpoint: string, responseTimeMs: number, status: number): void {
    const log: APILog = {
      endpoint,
      timestamp: new Date().toISOString(),
      responseTimeMs,
      status
    };
    dbInstance.apiLogs.push(log);
    // Keep max 500 lines
    if (dbInstance.apiLogs.length > 500) {
      dbInstance.apiLogs.shift();
    }
    saveDatabase(dbInstance);
  }
};
