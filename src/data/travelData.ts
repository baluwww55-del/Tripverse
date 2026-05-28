export interface PopularSpot {
  destination: string;
  duration: number;
  budget: number;
  style: string;
  image: string;
  tag: string;
}

export const popularSpots: PopularSpot[] = [
  { 
    destination: "Taj Mahal, Agra", 
    duration: 3, 
    budget: 65000, // INR
    style: "Suryodaya Sunrise & Mughal Architecture Tours", 
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80", 
    tag: "Royal Heritage" 
  },
  { 
    destination: "Kerala Backwaters, Alappuzha", 
    duration: 5, 
    budget: 85000, 
    style: "Private Kettuvallam Houseboats & Ayurvedic Spas", 
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=600&q=80", 
    tag: "Tropical Serenity" 
  },
  { 
    destination: "Leh Ladakh Peaks", 
    duration: 7, 
    budget: 125000, 
    style: "Cold Deserts, High-Pass Monasteries & Azure Lakes", 
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80", 
    tag: "Adventure Ascent" 
  },
  { 
    destination: "Jaipur Palace, Rajasthan", 
    duration: 4, 
    budget: 72000, 
    style: "Maharaja Heritage Stays & Hot Air Balloon Rides", 
    image: "https://images.unsplash.com/photo-1477584305313-a9f53db49381?auto=format&fit=crop&w=600&q=80", 
    tag: "Imperial Splendor" 
  }
];

export const sampleFlights = [
  { carrier: "Air India Maharaja Club", price: 18500, duration: "2h 15m", logo: "AI", type: "First Class Luxury Cabin" },
  { carrier: "Vistara Premium Air", price: 12400, duration: "2h 30m", logo: "UK", type: "Gourmet Business Lounge" },
  { carrier: "IndiGo Stretch", price: 6200, duration: "2h 45m", logo: "6E", type: "Direct Seamless Connect" },
  { carrier: "Taj Private Jet Charters", price: 450000, duration: "1h 50m", logo: "TA", type: "Bespoke Royal Flight Suite" }
];

export const sampleHotels = [
  { name: "Taj Lake Palace, Udaipur", rating: 4.9, price: 42000, loc: "Floating Palace, Pichola Lake", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80" },
  { name: "The Oberoi Amarvilas, Agra", rating: 4.9, price: 38000, loc: "Taj-View Gardens, Agra", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80" },
  { name: "The Leela Palace Wellness Retreat, Munnar", rating: 4.8, price: 26000, loc: "Bespoke Tea Hills, Kerala", image: "https://images.unsplash.com/photo-1522083165195-342750297f05?auto=format&fit=crop&w=400&q=80" }
];
