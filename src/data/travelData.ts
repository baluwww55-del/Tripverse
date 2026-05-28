export interface PopularSpot {
  destination: string;
  duration: number;
  budget: number;
  style: string;
  image: string;
  tag: string;
  rating?: number;
  location?: string;
  weather?: string;
  description?: string;
  coordinates?: [number, number]; // Latitude, Longitude for map
}

export const allDestinations: PopularSpot[] = [
  {
    destination: "Taj Mahal, Agra",
    duration: 3,
    budget: 35000,
    style: "Suryodaya Sunrise & Mughal Architecture",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
    tag: "Monument",
    rating: 4.9,
    location: "Agra, Uttar Pradesh",
    weather: "28°C • Warm & Clear",
    description: "The crown jewel of Mughal architecture, a magnificent white marble mausoleum symbolizing eternal love, located at the banks of Yamuna River.",
    coordinates: [27.1751, 78.0421]
  },
  {
    destination: "Mysore Palace, Karnataka",
    duration: 3,
    budget: 28000,
    style: "Wodeyar Dynasty Heritage & Grand Durbar Halls",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=1200&q=80",
    tag: "Cultural Heritage",
    rating: 4.8,
    location: "Mysuru, Karnataka",
    weather: "24°C • Pleasant Breeze",
    description: "An incredibly grand Indo-Saracenic palace that lights up magnificently on weekends with nearly 100,000 lightbulbs.",
    coordinates: [12.3052, 76.6551]
  },
  {
    destination: "Hampi Ruins, Karnataka",
    duration: 4,
    budget: 32000,
    style: "Vijayanagara Stone Architecture & River Ruins",
    image: "https://images.unsplash.com/photo-1600100397561-4e6479017c60?auto=format&fit=crop&w=1200&q=80",
    tag: "Cultural Heritage",
    rating: 4.9,
    location: "Hampi, Karnataka",
    weather: "31°C • Warm & Architectural",
    description: "A UNESCO World Heritage Site with thousands of ancient monuments, monolithic sculptures, and sacred temples carved out of massive boulders.",
    coordinates: [15.3350, 76.4600]
  },
  {
    destination: "Kerala Backwaters, Alappuzha",
    duration: 5,
    budget: 45000,
    style: "Private Kettuvallam Houseboats & Ayurvedic Spas",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
    tag: "Backwaters",
    rating: 4.9,
    location: "Alappuzha, Kerala",
    weather: "27°C • Humid & Serene",
    description: "Navigate through tranquil emerald canals, standard palms, and rustic villages on a classical luxury handcrafted wooden barge.",
    coordinates: [9.4981, 76.3388]
  },
  {
    destination: "Goa Beaches",
    duration: 4,
    budget: 38000,
    style: "Sunset Coastal Shacks & Portuguese Chapeleiro Tours",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
    tag: "Beaches",
    rating: 4.7,
    location: "North & South Goa",
    weather: "29°C • Tropical Surf",
    description: "Relax on infinite golden sands, explore ancient UNESCO whitewashed churches, and experience coastal adventure sports.",
    coordinates: [15.2993, 74.1240]
  },
  {
    destination: "Jaipur Forts, Rajasthan",
    duration: 4,
    budget: 42000,
    style: "Amber Palace Elephants & Royal Astronomical Sights",
    image: "https://images.unsplash.com/photo-1477584305313-a9f53db49381?auto=format&fit=crop&w=1200&q=80",
    tag: "Fort",
    rating: 4.8,
    location: "Jaipur, Rajasthan",
    weather: "26°C • Sunny Desert",
    description: "Behold the towering Amber, Jaigarh, and Nahargarh Forts overlooking the majestic pink-hued historical capital of Rajasthan.",
    coordinates: [26.9124, 75.7873]
  },
  {
    destination: "Leh Ladakh Peak Escape",
    duration: 7,
    budget: 85000,
    style: "Pangong Azure Lakes & Silk Route Monasteries",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
    tag: "Adventure / Hill Station",
    rating: 4.9,
    location: "Leh, Ladakh",
    weather: "12°C • Crisp Alpines",
    description: "Cross high-altitude passes like Khardung La, witness dramatic barren mountains, and camp beside crystal-blue saline lakes.",
    coordinates: [34.1526, 77.5770]
  },
  {
    destination: "Kashmir Valleys",
    duration: 6,
    budget: 52000,
    style: "Dal Lake Shikara Gilded Boats & Saffron Valleys",
    image: "https://images.unsplash.com/photo-1595818944075-59b12a38531d?auto=format&fit=crop&w=1200&q=80",
    tag: "Hill Station",
    rating: 4.9,
    location: "Srinagar, Jammu & Kashmir",
    weather: "16°C • Mild Mountain air",
    description: "Explore Mughal terrace gardens, stay on ornate historical houseboats, and witness snow-covered pine peaks in Gulmarg.",
    coordinates: [34.0837, 74.7973]
  },
  {
    destination: "Golden Temple, Amritsar",
    duration: 2,
    budget: 20000,
    style: "Sri Harmandir Sahib Devotions & Langar Seva",
    image: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80",
    tag: "Temple",
    rating: 5.0,
    location: "Amritsar, Punjab",
    weather: "22°C • Cool & Spiritual",
    description: "The pre-eminent spiritual shrine of Sikhism, reflecting pure gold leafing over peaceful holy waters, open to everyone in eternal peace.",
    coordinates: [31.6200, 74.8765]
  },
  {
    destination: "Qutub Minar, Delhi",
    duration: 2,
    budget: 15000,
    style: "12th Century Afghan Tower & Archaeological Lawns",
    image: "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=80",
    tag: "Monument",
    rating: 4.7,
    location: "Mehrauli, New Delhi",
    weather: "28°C • Sunny",
    description: "The world's tallest brick minaret, surrounded by early Islamic heritage ruins and the mysterious non-rusting Iron Pillar of Delhi.",
    coordinates: [28.5245, 77.1855]
  },
  {
    destination: "Red Fort, Delhi",
    duration: 2,
    budget: 16000,
    style: "Lal Qila Mughal Empire Court Tours",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80",
    tag: "Monument",
    rating: 4.6,
    location: "Old Delhi",
    weather: "28°C • Sunny",
    description: "The massive red sandstone fortress from 1639 that served as the primary seat of the Mughal Emperors for nearly two centuries.",
    coordinates: [28.6562, 77.2410]
  },
  {
    destination: "Konark Sun Temple, Odisha",
    duration: 3,
    budget: 27000,
    style: "Solar Chariot Stone Wheels & Ancient Sea Coast",
    image: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=1200&q=80",
    tag: "Temple",
    rating: 4.8,
    location: "Konark, Odisha",
    weather: "29°C • Coastal Mild",
    description: "A monumental 13th-century sanctuary designed as a giant stone chariot of the Sun God, Surya, decorated with exquisite geometric carvings.",
    coordinates: [19.8876, 86.0945]
  },
  {
    destination: "Meenakshi Temple, Madurai",
    duration: 3,
    budget: 24000,
    style: "Sky-Scraping Gopuram Corridors & Hall of Thousand Pillars",
    image: "https://images.unsplash.com/photo-1609137144814-8032bb19234b?auto=format&fit=crop&w=1200&q=80",
    tag: "Temple",
    rating: 4.9,
    location: "Madurai, Tamil Nadu",
    weather: "32°C • Sunny",
    description: "An ancient multi-colored Dravidian temple complex displaying 14 soaring gateway towers with thousands of detailed stone figures of gods.",
    coordinates: [9.9195, 78.1193]
  },
  {
    destination: "Ajanta & Ellora Caves",
    duration: 4,
    budget: 33000,
    style: "Monolithic Kailash carving & Buddhist Frescoes",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
    tag: "Cultural Heritage",
    rating: 4.9,
    location: "Aurangabad, Maharashtra",
    weather: "27°C • Dry & Breezy",
    description: "Witness Ajanta's 2nd-century BC Buddhist rock cut murals and Ellora's Kailash Temple - the largest single rock cut architecture in the world.",
    coordinates: [20.0258, 75.1780]
  },
  {
    destination: "Darjeeling Hill Slopes",
    duration: 4,
    budget: 35000,
    style: "Toy Train Heritage Loops & Organic Tea Gardens",
    image: "https://images.unsplash.com/photo-1557962453-e9ea0d0d3419?auto=format&fit=crop&w=1200&q=80",
    tag: "Hill Station",
    rating: 4.8,
    location: "Darjeeling, West Bengal",
    weather: "15°C • Misty Valleys",
    description: "Drink authentic organic black tea, ride the narrow-gauge Steam Himalayan Railway with views of the colossal Kanchenjunga peaks.",
    coordinates: [27.0410, 88.2627]
  },
  {
    destination: "Coorg, Karnataka",
    duration: 3,
    budget: 28000,
    style: "Coffee Highlands Trekking & Abbey Waterfalls",
    image: "https://images.unsplash.com/photo-1580456172607-bbcd385bbd15?auto=format&fit=crop&w=1200&q=80",
    tag: "Hill Station",
    rating: 4.7,
    location: "Kodagu, Karnataka",
    weather: "20°C • Cool Mist",
    description: "Known as the Scotland of India, nested in the rich Western Ghats coffee wilderness with beautiful cascades and cardamom plantations.",
    coordinates: [12.4244, 75.7382]
  },
  {
    destination: "Ooty Peak Retreat",
    duration: 3,
    budget: 29000,
    style: "Nilgiri Mountain Rail & Eucalyptus Forests",
    image: "https://images.unsplash.com/photo-1616190419596-e2839e578ad4?auto=format&fit=crop&w=1200&q=80",
    tag: "Hill Station",
    rating: 4.7,
    location: "Ootacamund, Tamil Nadu",
    weather: "17°C • Mild & Refreshing",
    description: "Ride the blue and cream Nilgiri Mountain Toy Train, browse botanical cloud rose yards, and sail on peaceful high-pass waters.",
    coordinates: [11.4102, 76.6950]
  },
  {
    destination: "Munnar Tea Hills, Kerala",
    duration: 4,
    budget: 34000,
    style: "Shola Forest Wildlife & Spice Garden Walks",
    image: "https://images.unsplash.com/photo-1522083165195-342750297f05?auto=format&fit=crop&w=1200&q=80",
    tag: "Hill Station",
    rating: 4.9,
    location: "Munnar, Kerala",
    weather: "18°C • High Mountain Mist",
    description: "Wander through rolling green carpeted tea estates, visit rare Nilgiri Tahr mountain goats in Eravikulam, and breathe tea-scented air.",
    coordinates: [10.0889, 77.0595]
  }
];

// Preserving legacy popularSpots variable for standard compatibility
export const popularSpots: PopularSpot[] = allDestinations.slice(0, 4);

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
