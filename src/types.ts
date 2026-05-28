export interface UserPreferences {
  name: string;
  email: string;
  budgetLevel: 'budget' | 'moderate' | 'luxury';
  travelStyle: string[];
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

export interface AdminMetrics {
  logs: APILog[];
  metrics: {
    totalTripsCount: number;
    totalRevenues: number;
    totalAPICalls: number;
    averageLatencyMs: number;
    chatInteractionsCount: number;
    errorRatePercent: number;
  };
  agentDistribution: {
    coordinator: number;
    planner: number;
    guide: number;
    userPersona: number;
  };
}
