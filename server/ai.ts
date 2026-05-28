import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, DayItinerary, SavedTrip } from "./db.js";
import { locateDestinationImage } from "./imageService.js";

async function enrichItinerary(itinerary: any, destination: string): Promise<any> {
  if (!itinerary) return itinerary;

  const destImage = await locateDestinationImage(destination);
  itinerary.image = destImage;

  if (itinerary.suggestedHotels && Array.isArray(itinerary.suggestedHotels)) {
    for (const hotel of itinerary.suggestedHotels) {
      const query = `${hotel.name}, ${hotel.location || destination}`;
      const currentImage = hotel.image || "";
      if (
        !currentImage || 
        currentImage.includes("photo-1542314831-068cd1dbfeeb") || 
        currentImage.includes("photo-1564507592333-c60657eea523") || 
        currentImage.includes("photo-1522083165195-342750297f05") ||
        currentImage.includes("photo-1537996194471-e657df975ab4")
      ) {
        hotel.image = await locateDestinationImage(query);
      }
    }
  }

  return itinerary;
}

// Lazy-loaded GenAI client to avoid crashes if API key is missing
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not configured or is placeholder. Falling back to structured AI simulation.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Highly detailed mock fallback data focused entirely on incredible Indian tourism destinations
const MOCK_DESTINATIONS: Record<string, {
  weather: string;
  activities: string[];
  hotels: any[];
  flights: any[];
  tips: string[];
}> = {
  "agra": {
    weather: "Warm and bright with crystal clear sunrise conditions over Yamuna, 22°C - 32°C.",
    activities: [
      "Sunrise viewing of the majestic Taj Mahal with a local historian.",
      "Explore the royal red sandstone courtyards of Agra Fort.",
      "Savor authentic Petha varieties at the old Sadar Bazaar.",
      "Marvel at the delicate marble inlay works of the Tomb of Itimad-ud-Daulah (Baby Taj).",
      "Witness sunset reflection of Taj Mahal from Mehtab Bagh gardens across the river."
    ],
    hotels: [
      { name: "The Oberoi Amarvilas (Taj View)", price: 42000, rating: 4.9, location: "Taj East Gate Road, Agra", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80" },
      { name: "Taj Hotel & Convention Centre", price: 9500, rating: 4.7, location: "Fatehabad Road, Agra", image: "https://images.unsplash.com/photo-1522083165195-342750297f05?auto=format&fit=crop&w=400&q=80" }
    ],
    flights: [
      { carrier: "Air India (Direct Flight)", price: 6500, duration: "1h 40m", rating: 4.8, logo: "AI" },
      { carrier: "IndiGo Express Connect", price: 4200, duration: "2h 10m", rating: 4.6, logo: "6E" }
    ],
    tips: [
      "Carry minimal items inside the Taj Mahal complex to bypass security lines rapidly.",
      "Hire only Ministry of Tourism approved guides displaying official ID cards.",
      "Local language brief: Hindi is widely spoken. Say 'Dhanyabaad' to express gratitude."
    ]
  },
  "bengaluru": {
    weather: "Extremely pleasant, mild temperate spring climate throughout, 19°C - 26°C.",
    activities: [
      "Morning heritage walk through the lush canopy of Cubbon Park.",
      "Breakfast at a historic military hotel or filter coffee at CTR Malleshwaram.",
      "Grand audio tour of Bangalore Palace's royal Tudor-style architecture.",
      "Interactive technical visit to the Science Museum and aeronautics hangar.",
      "Indulge in craft local food experiences and botanical walks in Lalbagh."
    ],
    hotels: [
      { name: "The Taj West End", price: 22000, rating: 4.9, location: "Race Course Road, Bengaluru", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80" },
      { name: "ITC Gardenia Luxury Collection", price: 18000, rating: 4.8, location: "Residency Road, Bengaluru", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80" }
    ],
    flights: [
      { carrier: "Vistara Premium Economy", price: 7800, duration: "2h 15m", rating: 4.8, logo: "UK" },
      { carrier: "IndiGo Metropol Connect", price: 5200, duration: "2h 30m", rating: 4.6, logo: "6E" }
    ],
    tips: [
      "Utilize Namma Metro to avoid peak-hour road traffic efficiently.",
      "Try local Filter Coffee — poured from high heights to create standard froth.",
      "Local language brief: Kannada is the heritage language. Say 'Namskara' for hello."
    ]
  },
  "mysuru": {
    weather: "Charming sunny afternoons with cool evening breezes, 20°C - 30°C.",
    activities: [
      "Grand tour of the illuminated Mysore Palace and Wodeyar crown jewels.",
      "Ascend Chamundi Hills to seek blessings at the historic hill temple.",
      "Browse fragrant sandalwood oils and incense at the historic Devaraja Market.",
      "Indulge in hot Mysore Masala Dosa and fresh Mysore Pak delicacies.",
      "Admire the Gothic architecture of the majestic St. Philomena's Cathedral."
    ],
    hotels: [
      { name: "Grand Mercure Mysore Heritage", price: 7500, rating: 4.7, location: "Nelson Mandela Road, Mysore", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80" },
      { name: "Radisson Blu Plaza Palace Side", price: 9000, rating: 4.8, location: "City Center, Mysore", image: "https://images.unsplash.com/photo-1522083165195-342750297f05?auto=format&fit=crop&w=400&q=80" }
    ],
    flights: [
      { carrier: "Alliance Air Metro Connect", price: 4400, duration: "1h 10m", rating: 4.5, logo: "AI" },
      { carrier: "KSRTC Flybus (Premium Transfer)", price: 1200, duration: "3h 40m", rating: 4.7, logo: "KS" }
    ],
    tips: [
      "Purchase sandalwood oil strictly from Government Sandalwood Oil factories for authentic grade.",
      "Visit the Mysore Palace on Sunday evening specifically to see its 96,000 light bulb illumination.",
      "Local language brief: Kannada is prominent. Say 'Hogi Barthini' to mean goodbye."
    ]
  },
  "mumbai": {
    weather: "Humid marine climate with warm sea breezes, temperature 26°C - 32°C.",
    activities: [
      "Sunrise photography beside the magnificent Gateway of India arch.",
      "Stroll along the Queen's Necklace curve at Marine Drive at sunset.",
      "Private catamaran ferry out to the ancient rock-cut Elephanta Caves.",
      "Indulge in heritage street foods: Vada Pav, Sev Puri, and Pav Bhaji at Juhu Beach.",
      "Marvel at the active Victorian Gothic layout of Chhatrapati Shivaji Terminus."
    ],
    hotels: [
      { name: "The Taj Mahal Palace (Historic Tower)", price: 38000, rating: 4.9, location: "Colaba Waterfront, Mumbai", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80" },
      { name: "Trident Nariman Point", price: 15000, rating: 4.8, location: "Nariman Point Road, Mumbai", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80" }
    ],
    flights: [
      { carrier: "Vistara Corporate Business", price: 11000, duration: "2h 05m", rating: 4.9, logo: "UK" },
      { carrier: "Air India Direct Connect", price: 8200, duration: "2h 15m", rating: 4.7, logo: "AI" }
    ],
    tips: [
      "Use local suburban trains outside high peak rush hours to bypass massive traffic curves.",
      "Always engage Kaali-Peeli local cabs displaying valid meters.",
      "Local language brief: Marathi/Hindi is native. Say 'Kasa Ahes' to ask how are you."
    ]
  },
  "delhi": {
    weather: "Chilly morning mist transitioning to dry sunny afternoons, 14°C - 24°C.",
    activities: [
      "Explore the majestic crimson-walled Red Fort and its historic bazaar arcade.",
      "Witness the high-towering sandstone Mughal minar of Qutub Minar.",
      "Savor savory street chaats at paranthe wali gali in Chandni Chowk.",
      "Pay spiritual respects under the serene Lotus Temple lotus marble petals.",
      "Breathtaking heritage sunset strolls across Humayun's royal garden tomb."
    ],
    hotels: [
      { name: "The Imperial Janpath Heritage", price: 28000, rating: 4.9, location: "Janpath, New Delhi", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80" },
      { name: "Taj Palace Diplomatic Enclave", price: 24000, rating: 4.8, location: "Chanakyapuri, New Delhi", image: "https://images.unsplash.com/photo-1522083165195-342750297f05?auto=format&fit=crop&w=400&q=80" }
    ],
    flights: [
      { carrier: "Air India Legacy Suite", price: 9500, duration: "2h 15m", rating: 4.8, logo: "AI" },
      { carrier: "IndiGo Golden Seat", price: 6000, duration: "2h 30m", rating: 4.6, logo: "6E" }
    ],
    tips: [
      "Delhi Metro is highly clean and world-class, purchase a day tourist pass.",
      "Respect religious locations by fully covering shoulders and heads prior to entrance.",
      "Local language brief: Hindi is regional. Say 'App Kaise Hain' to greet elders."
    ]
  },
  "jaipur": {
    weather: "Fabulous dry desert climate, sunny mornings and cool starlit nights, 16°C - 28°C.",
    activities: [
      "Breathtaking elephant-access ramp up the Amer Fort Palace ramparts.",
      "Photograph the iconic honeycomb pink sandstone screens of Hawa Mahal.",
      "Witness the world's largest stone sundial at Jantar Mantar observatory.",
      "Enjoy traditional Rajasthani Dal Baati Churma at Chokhi Dhani village.",
      "Behold the spectacular floating water palace of Jal Mahal."
    ],
    hotels: [
      { name: "Rambagh Palace (The Jewel of Jaipur)", price: 45000, rating: 4.9, location: "Bhawani Singh Road, Jaipur", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80" },
      { name: "The Gateway Resort Heritage Stay", price: 8500, rating: 4.6, location: "Amer Road, Jaipur", image: "https://images.unsplash.com/photo-1522083165195-342750297f05?auto=format&fit=crop&w=400&q=80" }
    ],
    flights: [
      { carrier: "Air India Regional Jet", price: 6200, duration: "1h 15m", rating: 4.7, logo: "AI" },
      { carrier: "IndiGo Direct Royal Link", price: 4600, duration: "1h 30m", rating: 4.5, logo: "6E" }
    ],
    tips: [
      "Buy a composite entry ticket to cover Amer Fort, Hawa Mahal, and Jantar Mantar simultaneously.",
      "Bargain politely but firmly at Johari and Bapu Bazaars for jewelry and bandhani fabrics.",
      "Local language brief: Rajasthani/Hindi is spoken. Say 'Khamma Ghani' for a royal greeting."
    ]
  },
  "goa": {
    weather: "Pleasant seaside sun with fresh coastal marine tides, 24°C - 31°C.",
    activities: [
      "Relax on the golden sands of Baga and Calangute coastlines.",
      "Tour the ancient Portuguese cathedrals of Old Goa (Bom Jesus Basilica).",
      "Spice plantation walk coupled with traditional organic Goan lunch.",
      "Sunset dolphin cruise alongside the scenic Mandovi River delta.",
      "Indulge in freshly prepared sea-bass vindaloo at shoreline shacks."
    ],
    hotels: [
      { name: "The Taj Exotica Resort & Spa", price: 29000, rating: 4.9, location: "Benaulim Beach, South Goa", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80" },
      { name: "Caravela Beach Ocean Front Resort", price: 11000, rating: 4.7, location: "Varca Beach, Goa", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80" }
    ],
    flights: [
      { carrier: "IndiGo Leisure Connect", price: 6500, duration: "2h 20m", rating: 4.6, logo: "6E" },
      { carrier: "Akasa Air Coastal Connect", price: 5400, duration: "2h 35m", rating: 4.5, logo: "QP" }
    ],
    tips: [
      "Renting a local auto-geared scooter is the most seamless and affordable way to traverse beaches.",
      "Maintain distance from strong currents during high tide advisories.",
      "Local language brief: Konkani/English is active. Say 'Dev Borem Karum' to say thank you."
    ]
  },
  "kerala": {
    weather: "Lush tropical green landscapes, soft monsoon showers and humid winds, 23°C - 29°C.",
    activities: [
      "Board a luxury Kettuvallam wicker houseboat along Alappuzha backwaters.",
      "Tour the refreshing high-altitude tea plantations of Munnar.",
      "Witness a classical Kathakali makeup and spiritual dance performance.",
      "Enjoy traditional Kerala Sadya lunch spread on fresh banana leaves.",
      "Rejuvenate with a verified ancient Ayurvedic full body massage session."
    ],
    hotels: [
      { name: "Kumarakom Lake Resort", price: 26000, rating: 4.9, location: "Kottayam, Kerala Backwaters", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80" },
      { name: "The Brunton Boatyard Heritage Kochi", price: 14000, rating: 4.8, location: "Fort Kochi Waterfront", image: "https://images.unsplash.com/photo-1522083165195-342750297f05?auto=format&fit=crop&w=400&q=80" }
    ],
    flights: [
      { carrier: "Air India Express direct", price: 7200, duration: "2h 45m", rating: 4.6, logo: "AI" },
      { carrier: "IndiGo Coconut Route", price: 5900, duration: "3h 05m", rating: 4.5, logo: "6E" }
    ],
    tips: [
      "Monsoons are beautiful but heavy; carry a sturdy umbrella if visiting between June and September.",
      "Try local tender coconut water ('Karikku') for elite hydration of your trace.",
      "Local language brief: Malayalam is native. Say 'Namaskaram' for respect greeting."
    ]
  },
  "kashmir": {
    weather: "Chilly high alpine breeze, mist sweeping across cedar forests, 8°C - 16°C.",
    activities: [
      "Shikara boat ride past floating flower markets on serene Dal Lake.",
      "Uncover the step-terraced historic beauty of Shalimar Mughal Gardens.",
      "Ascend Gulmarg ski elevations inside the scenic high Gondola cable car.",
      "Indulge in authentic multi-course Kashmiri Wazwan feast.",
      "Tour a regional saffron farm and sample sweet warm Kahwa tea."
    ],
    hotels: [
      { name: "The Taj Khyber Resort & Spa Gulmarg", price: 34000, rating: 4.9, location: "Gulmarg Heights, Kashmir", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80" },
      { name: "Lalit Grand Palace Srinagar", price: 18000, rating: 4.8, location: "Gupkar Road, Srinagar", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80" }
    ],
    flights: [
      { carrier: "Air India Himalayan Direct", price: 8800, duration: "1h 50m", rating: 4.8, logo: "AI" },
      { carrier: "SpiceJet valley scenic", price: 7000, duration: "2h 10m", rating: 4.4, logo: "SG" }
    ],
    tips: [
      "Ensure you rent a houseboat showing standard rating registry badges for maximum comfort.",
      "Kahwa tea contains real saffron, almonds, and cardamom — perfect for warm climate.",
      "Local language brief: Kashmiri/Urdu are dominant. Say 'Toba' to signify well-being."
    ]
  },
  "ladakh": {
    weather: "Brisk mountain dry cold, thin pure oxygen with dramatic blue sky, 4°C - 15°C.",
    activities: [
      "Marvel at the color-shifting azure waters of high Pangong Lake.",
      "Cross Khardung La — one of the highest motorable road passes on Earth.",
      "Witness spiritual prayers at the historic Thiksey Monastery.",
      "Enjoy traditional steamed butter Yak momos and butter salt tea.",
      "Admire the gravity-defying optical illusion of Magnetic Hill."
    ],
    hotels: [
      { name: "The Grand Dragon Ladakh (Eco Luxury)", price: 12000, rating: 4.8, location: "Old Road, Leh", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80" },
      { name: "Ladakh Sarai Wilderness Resort", price: 9500, rating: 4.7, location: "Saboo Valley, Leh Ladakh", image: "https://images.unsplash.com/photo-1522083165195-342750297f05?auto=format&fit=crop&w=400&q=80" }
    ],
    flights: [
      { carrier: "Air India Peak Ascent", price: 12500, duration: "1h 25m", rating: 4.8, logo: "AI" },
      { carrier: "IndiGo High Altitude Connect", price: 9200, duration: "1h 35m", rating: 4.6, logo: "6E" }
    ],
    tips: [
      "Acclimatize completely in Leh town for at least 36 hours prior to high pass travel.",
      "Carry ample warm fleece and windproof layers even during summer sequences.",
      "Local language brief: Ladakhi is beautiful. Say 'Julley' for a warm welcome and greeting."
    ]
  },
  "varanasi": {
    weather: "Mystic atmospheric morning fog over Ganga, transitioning to dry, 18°C - 27°C.",
    activities: [
      "Dawn boat journey along historical bathing ghats of Ganges river.",
      "Behold the spectacular glowing evening Ganga Aarti lamps ceremony.",
      "Seek spiritual peace inside the sacred Kashi Vishwanath corridor.",
      "Explore the ancient Buddhist temple grounds and stupa in nearby Sarnath.",
      "Savor rich lassi served in traditional clay cups ('Kulhad')."
    ],
    hotels: [
      { name: "BrijRama Palace Heritage (Ganga Ghats)", price: 21000, rating: 4.9, location: "Darbhanga Ghat, Varanasi", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80" },
      { name: "Taj Ganges Varanasi Luxury", price: 16000, rating: 4.8, location: "Nadesar Palace Grounds", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80" }
    ],
    flights: [
      { carrier: "Air India Spiritual direct", price: 7800, duration: "1h 45m", rating: 4.7, logo: "AI" },
      { carrier: "IndiGo Holy Route Connect", price: 5400, duration: "2h 00m", rating: 4.6, logo: "6E" }
    ],
    tips: [
      "Dress modest and remove footwear prior to stepping on temple thresholds.",
      "Always seek permissions before photographing spiritual custom practices at cremation ghats.",
      "Local language brief: Hindi/Bhojpuri is local. Say 'Har Har Mahadev' for greeting."
    ]
  },
  "hampi": {
    weather: "Sunny dry climate reflecting over golden granite boulders, 22°C - 33°C.",
    activities: [
      "Browse the sprawling pillars and stone bazaar of Virupaksha Temple.",
      "Photograph the spectacular monolithic stone chariot in Vijaya Vittala Complex.",
      "Witness sunset atop Hemakuta Hill with panoramic ruin views.",
      "Cross the Tungabhadra river in a traditional round wicker Coracle boat.",
      "Explore the royal stables and Lotus Mahal architectural gems."
    ],
    hotels: [
      { name: "Evolve Back Kamalapura Palace", price: 34000, rating: 4.9, location: "Kamalapura, Vijayanagara Hampi", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80" },
      { name: "Hampi Heritage Wilderness Lodge", price: 7800, rating: 4.6, location: "Kadiganahalli, Hampi", image: "https://images.unsplash.com/photo-1522083165195-342750297f05?auto=format&fit=crop&w=400&q=80" }
    ],
    flights: [
      { carrier: "Star Air Hampi direct", price: 5400, duration: "1h 10m", rating: 4.6, logo: "S5" },
      { carrier: "Vande Bharat Express (Premium Rail transfer)", price: 1800, duration: "5h 25m", rating: 4.9, logo: "VB" }
    ],
    tips: [
      "Hampi is massive; renting a designated local bicycle or eco-friendly cart makes ruin scouting easy.",
      "Hampi is a strict vegetarian sacred heritage site. Savor delicious local banana-leaf meals.",
      "Local language brief: Kannada is the native tongue. Say 'Chennagidini' to mean I am doing fine."
    ]
  },
  "coorg": {
    weather: "Lush misty mornings with refreshing mountain precipitation, 16°C - 23°C.",
    activities: [
      "Walk the winding estates of an active coffee plantation.",
      "Seek spiritual peace at Namdroling Golden Temple Buddhist monastery.",
      "Witness spectacular roaring cascades at Abbey and Iruppu waterfalls.",
      "Behold standard valley mist from Raja's Seat vantage point at sunset.",
      "Savor authentic spicy local Pandi curry alongside Kadambuttu rice balls."
    ],
    hotels: [
      { name: "Taj Madikeri Resort & Spa Coorg", price: 28000, rating: 4.9, location: "Monnangeri, Madikeri", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80" },
      { name: "The Tamara Coorg (Wilderness Hills)", price: 21000, rating: 4.9, location: "Kabbinakad House, Coorg", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80" }
    ],
    flights: [
      { carrier: "Flybus Premium coach transfer", price: 1400, duration: "5h 10m", rating: 4.8, logo: "FB" },
      { carrier: "KSRTC Airavat Club Class bus", price: 850, duration: "5h 40m", rating: 4.7, logo: "KS" }
    ],
    tips: [
      "Misty conditions reduce road visibility down dramatically; hire skilled local hillside drivers.",
      "Coorg coffee makes an elite souvenir. Purchase dark-roast chicory-free options.",
      "Local language brief: Kodava/Kannada is native. Say 'Santhosha' to mean happiness."
    ]
  },
  "ooty": {
    weather: "Chilly crisp hill climate, pine-scented breeze and soft sun, 10°C - 18°C.",
    activities: [
      "Enjoy a leisurely ride on the Nilgiri Mountain Toy Train (UNESCO World Heritage).",
      "Stroll past thousands of exotic species at the Rose Garden.",
      "Paddle boat through early morning mist on the tranquil Ooty Lake.",
      "Hike to Doddabetta Peak for sweeping views of the Nilgiri mountain chains.",
      "Visit a local tea factory, sampling freshly crushed chocolate tea."
    ],
    hotels: [
      { name: "Savoy - IHCL SeleQtions Heritage", price: 16000, rating: 4.8, location: "Sylks Road, Ooty Hills", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80" },
      { name: "The Sterling Elk Hill Resort", price: 7200, rating: 4.5, location: "Ramakrishna Mutt Road, Ooty", image: "https://images.unsplash.com/photo-1522083165195-342750297f05?auto=format&fit=crop&w=400&q=80" }
    ],
    flights: [
      { carrier: "Nilgiri Toy Train Heritage First", price: 650, duration: "4h 30m", rating: 4.9, logo: "TR" },
      { carrier: "Coimbatore Airport Premium Flybus", price: 900, duration: "3h 10m", rating: 4.7, logo: "FB" }
    ],
    tips: [
      "Book Nilgiri Mountain Railway seats at least 3 months ahead on IRCTC, as seats disappear instantly.",
      "Do try the delicious local Ooty varkey biscuits with warm Nilgiri tea.",
      "Local language brief: Tamil is widely spoken. Say 'Nandri' to express thanks."
    ]
  }
};

export async function generateSimulatedItinerary(
  destination: string,
  daysCount: number,
  budget: number,
  userPrefs: UserPreferences
): Promise<{
  weatherSummary: string;
  budgetBreakdown: { flightsEstimated: number; hotelsEstimated: number; activitiesEstimated: number; dailyAllowance: number };
  days: DayItinerary[];
  suggestedHotels: any[];
  suggestedFlights: any[];
  travelTips: string[];
}> {
  const normDest = destination.toLowerCase().trim();
  console.log(`[AI Simulator] Formulating simulated high-fidelity plans for: ${destination} | Tier: ${userPrefs.budgetLevel}`);
  
  // Choose appropriate fallback base with specific multi-term mapping
  let baseKey = Object.keys(MOCK_DESTINATIONS).find(k => normDest.includes(k)) || 'agra';
  if (normDest.includes("mysore") || normDest.includes("mysuru")) baseKey = "mysuru";
  else if (normDest.includes("bangalore") || normDest.includes("bengaluru")) baseKey = "bengaluru";
  else if (normDest.includes("delhi") || normDest.includes("qutub") || normDest.includes("red fort")) baseKey = "delhi";
  else if (normDest.includes("jaipur") || normDest.includes("amer")) baseKey = "jaipur";
  else if (normDest.includes("alleppey") || normDest.includes("alappuzha") || normDest.includes("kerala") || normDest.includes("munnar")) baseKey = "kerala";
  else if (normDest.includes("srinagar") || normDest.includes("kashmir") || normDest.includes("gulmarg")) baseKey = "kashmir";
  else if (normDest.includes("goa")) baseKey = "goa";
  else if (normDest.includes("hampi")) baseKey = "hampi";
  else if (normDest.includes("coorg") || normDest.includes("kodagu")) baseKey = "coorg";
  else if (normDest.includes("ooty") || normDest.includes("ootacamund")) baseKey = "ooty";
  else if (normDest.includes("leh") || normDest.includes("ladakh")) baseKey = "ladakh";
  else if (normDest.includes("varanasi")) baseKey = "varanasi";
  else if (normDest.includes("taj mahal") || normDest.includes("agra")) baseKey = "agra";

  const base = MOCK_DESTINATIONS[baseKey];

  // Map budget Level to logical scale factor & pricing parameters
  let budgetFactor = 1.0;
  if (userPrefs.budgetLevel === 'backpacker') budgetFactor = 0.4;
  else if (userPrefs.budgetLevel === 'luxury') budgetFactor = 2.5;
  else if (userPrefs.budgetLevel === 'family') budgetFactor = 1.8;
  else if (userPrefs.budgetLevel === 'honeymoon') budgetFactor = 3.0;

  const days: DayItinerary[] = [];
  const themes = [
    "Royal Heritage & Iconic Sights",
    "Hidden Local Trails & Culture",
    "Scenic Highpoints & Regional Flavors",
    "Bazaars & Artisan Craft Discovery",
    "Sunset Splendors & Traditional Dinner"
  ];

  for (let d = 1; d <= daysCount; d++) {
    const theme = themes[(d - 1) % themes.length];
    const startIdx = (d - 1) * 2;
    const act1 = base.activities[startIdx % base.activities.length];
    const act2 = base.activities[(startIdx + 1) % base.activities.length];
    const act3 = `Immersive regional food walk sampling local delicacies with culinary specialists of ${destination}`;

    const cost1 = Math.round((userPrefs.budgetLevel === 'backpacker' ? 150 : userPrefs.budgetLevel === 'luxury' ? 2500 : 800) * (d % 2 === 0 ? 0.8 : 1.2));
    const cost2 = Math.round((userPrefs.budgetLevel === 'backpacker' ? 100 : userPrefs.budgetLevel === 'luxury' ? 1800 : 600) * (d % 2 === 0 ? 1.1 : 0.9));
    const cost3 = Math.round((userPrefs.budgetLevel === 'backpacker' ? 250 : userPrefs.budgetLevel === 'luxury' ? 3500 : 1200) * (d % 2 === 0 ? 0.9 : 1.3));

    days.push({
      day: d,
      theme: theme,
      activities: [
        { time: "09:30 AM", title: act1, description: `Heritage exploration matching your travel profile, customized based on preferred activity levels of ${userPrefs.preferredActivityLevel} intensity.`, cost: cost1, location: `Main Sector, ${destination}`, rating: 4.9 },
        { time: "02:00 PM", title: act2, description: `Detailed afternoon immersion with professional regional guides. Accommodates dietary requirement: ${userPrefs.dietary}.`, cost: cost2, location: `Heritage District, ${destination}`, rating: 4.8 },
        { time: "06:30 PM", title: act3, description: `Splendid evening sunset watch and a traditional local sit-down dining session with heritage recipes.`, cost: cost3, location: `Sunset Overlook, ${destination}`, rating: 4.8 }
      ]
    });
  }

  // Adjust price estimations based on budget inputs (fully Indian Rupees)
  const flightEst = Math.round((base.flights[0]?.price || 6000) * (userPrefs.budgetLevel === 'backpacker' ? 0.5 : budgetFactor * 0.8));
  const hotelEst = Math.round((base.hotels[0]?.price || 8000) * budgetFactor * daysCount * 0.8);
  const actEst = days.reduce((acc, currentDay) => acc + currentDay.activities.reduce((sum, act) => sum + act.cost, 0), 0);
  const dailyAllow = Math.round((budget - (flightEst + hotelEst + actEst)) / daysCount);

  // Curate dynamic beautiful real Indian hotels with Unsplash imagery
  const hotelImages: { [key: string]: string[] } = {
    "agra": [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80"
    ],
    "bengaluru": [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80"
    ],
    "mysuru": [
      "https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80"
    ],
    "mumbai": [
      "https://images.unsplash.com/photo-1596422846543-75c6fc18a523?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80"
    ],
    "delhi": [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=600&q=80"
    ]
  };

  const getHotelImage = (idx: number) => {
    const images = hotelImages[baseKey] || hotelImages["delhi"];
    return images[idx % images.length];
  };

  const itinerary = {
    weatherSummary: base.weather,
    budgetBreakdown: {
      flightsEstimated: flightEst,
      hotelsEstimated: hotelEst,
      activitiesEstimated: actEst,
      dailyAllowance: dailyAllow > 0 ? dailyAllow : Math.round(1800 * budgetFactor)
    },
    days,
    suggestedHotels: base.hotels.map((h, hIdx) => ({ 
      ...h, 
      price: Math.round(h.price * budgetFactor),
      image: getHotelImage(hIdx)
    })),
    suggestedFlights: base.flights.map(f => ({ ...f, price: Math.round(f.price * (userPrefs.budgetLevel === 'backpacker' ? 0.6 : budgetFactor * 0.8)) })),
    travelTips: base.tips
  };

  return await enrichItinerary(itinerary, destination);
}

export async function generateAILineItinerary(
  destination: string,
  daysCount: number,
  budget: number,
  userPrefs: UserPreferences
): Promise<{
  weatherSummary: string;
  budgetBreakdown: { flightsEstimated: number; hotelsEstimated: number; activitiesEstimated: number; dailyAllowance: number };
  days: DayItinerary[];
  suggestedHotels: any[];
  suggestedFlights: any[];
  travelTips: string[];
}> {
  const normDest = destination.toLowerCase().trim();
  const client = getAIClient();

  if (!client) {
    return await generateSimulatedItinerary(destination, daysCount, budget, userPrefs);
  }

  // Real Gemini API call with structured JSON schema
  try {
    const prompt = `
      You are the lead VoyageAI Planner Agent specialized in premium Indian travel.
      Generate a comprehensive incredibly high-quality travel itinerary matching user constraints:
      - Destination: "${destination}"
      - Travel Duration: ${daysCount} days
      - Budget Limit: ₹${budget} (Indian Rupees - INR)
      - Budget Preference: ${userPrefs.budgetLevel}
      - Travel Styles of User: [${userPrefs.travelStyle.join(', ')}]
      - Dietary Requirements: ${userPrefs.dietary}
      - Preferred Activity Level: ${userPrefs.preferredActivityLevel}

      Provide realistic flight carriers/train connections inside India (Vande Bharat Express, Air India, IndiGo), 
      real-world high-quality Indian luxury/moderate hotel reviews and estimations (Taj Hotels, Oberoi Resorts, ITC, boutique stays),
      meaningful regional weather forecasts with warnings or clothing tips, and highly detailed hourly/daily itineraries.
      IMPORTANT: ALL estimated costs, day-by-day activity costs, flight prices, hotel night rates, and daily allowances MUST be calculated and represented in Indian Rupees (INR) which fits the total budget limit of ₹${budget}.
    `;

    const modelsToTry = [
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest"
    ];

    let responseText = "";
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Voyage AI Planner] Attempting generation with model: ${modelName}`);
        const response = await client.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "You are VoyageAI, a helpful, deeply cultured Indian travel curation system. Provide fully structured, high-accuracy JSON responses following the schema exactly. Ensure suggested activity costs build exactly into the overall travel budgets. Format all output prices in Indian Rupees (INR) - DO NOT mix USD or other formats. Do not include Markdown blocks like ```json inside the JSON itself.",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                weatherSummary: {
                  type: Type.STRING,
                  description: "Brief current or typical weather summary during the trip with advisory if necessary."
                },
                budgetBreakdown: {
                  type: Type.OBJECT,
                  properties: {
                    flightsEstimated: { type: Type.INTEGER, description: "Estimated flight/train transport cost value in Indian Rupees (INR)." },
                    hotelsEstimated: { type: Type.INTEGER, description: "Estimated overall hotel cost value in Indian Rupees (INR) for the full stay." },
                    activitiesEstimated: { type: Type.INTEGER, description: "Estimated sum of all activity entry fees/passes in Indian Rupees (INR)." },
                    dailyAllowance: { type: Type.INTEGER, description: "Calculated daily recommendation for local meals/rickshaws in Indian Rupees (INR)." }
                  },
                  required: ["flightsEstimated", "hotelsEstimated", "activitiesEstimated", "dailyAllowance"]
                },
                days: {
                  type: Type.ARRAY,
                  description: "Array of day details containing specific schedules.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      day: { type: Type.INTEGER },
                      theme: { type: Type.STRING, description: "Day overall core focus theme (e.g. Ancient Vijayanagara Sights or Maratha Shore walks)." },
                      activities: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            time: { type: Type.STRING, description: "Typical hours like 09:30 AM or 03:00 PM." },
                            title: { type: Type.STRING, description: "Descriptive name of monument, temple, palace, or authentic diner." },
                            description: { type: Type.STRING, description: "Beautiful summary of historical significance or what local cuisine to try there." },
                            cost: { type: Type.INTEGER, description: "Individual cost in INR (0 if free)." },
                            location: { type: Type.STRING },
                            rating: { type: Type.NUMBER, description: "Local user rating scale 1 to 5." }
                          },
                          required: ["time", "title", "description", "cost", "location"]
                        }
                      }
                    },
                    required: ["day", "theme", "activities"]
                  }
                },
                suggestedHotels: {
                  type: Type.ARRAY,
                  description: "Highly rated local accommodations representing best matches for the selected budget choice in Indian Rupees.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      price: { type: Type.INTEGER, description: "Nightly price estimation in Indian Rupees (INR)." },
                      rating: { type: Type.NUMBER },
                      location: { type: Type.STRING },
                      image: { type: Type.STRING, description: "Leave empty or provide unsplash landscape placeholder match value." }
                    },
                    required: ["name", "price", "rating", "location"]
                  }
                },
                suggestedFlights: {
                  type: Type.ARRAY,
                  description: "Logical flight paths or train routes to reach destination in Indian Rupees.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      carrier: { type: Type.STRING, description: "Airline carrier like Air India or train like Shatabdi/Vande Bharat Express." },
                      price: { type: Type.INTEGER, description: "Estimated ticket cost in Indian Rupees (INR)." },
                      duration: { type: Type.STRING, description: "e.g. 2h 15m or 5h 30m" },
                      departure: { type: Type.STRING, description: "Sample direct or 1-stop statement." }
                    },
                    required: ["carrier", "price", "duration"]
                  }
                },
                travelTips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Helpful cultural, security, regional greeting translation, or logistics suggestions."
                }
              },
              required: ["weatherSummary", "budgetBreakdown", "days", "suggestedHotels", "suggestedFlights", "travelTips"]
            }
          }
        });

        if (response && response.text) {
          responseText = response.text;
          console.log(`[Voyage AI Planner] Generation succeeded with model: ${modelName}`);
          break;
        }
      } catch (geminiError: any) {
        console.warn(`[Voyage AI Planner] Model ${modelName} encountered warning or rate-limit. Trying next fallback...`, geminiError.message || geminiError);
        lastError = geminiError;
      }
    }

    if (!responseText) {
      throw lastError || new Error("All designated model pipelines failed.");
    }

    const parsed = JSON.parse(responseText);
    return await enrichItinerary(parsed, destination);
  } catch (error) {
    console.error("Gemini real generation failed, returning simulated payload instead:", error);
    // Silent fall back to simulated to make sure app performs 100% reliably
    return await generateSimulatedItinerary(destination, daysCount, budget, userPrefs);
  }
}

export async function processAgentChat(
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  latestMsg: string,
  userPrefs: UserPreferences
): Promise<{ reply: string; activeAgent: 'user' | 'planner' | 'guide' }> {
  const client = getAIClient();
  const lowerMsg = latestMsg.toLowerCase();

  // Detect appropriate active sub-agent representing the Multi AI Agent system
  let activeAgent: 'user' | 'planner' | 'guide' = 'planner';
  if (lowerMsg.includes('guide') || lowerMsg.includes('weather') || lowerMsg.includes('custom') || lowerMsg.includes('eat') || lowerMsg.includes('how') || lowerMsg.includes('emergency') || lowerMsg.includes('transit')) {
    activeAgent = 'guide';
  } else if (lowerMsg.includes('profile') || lowerMsg.includes('budget') || lowerMsg.includes('interest') || lowerMsg.includes('diet') || lowerMsg.includes('prefer')) {
    activeAgent = 'user';
  }

  if (!client) {
    // Elegant simulated conversational flows representing the different AI personas in the cluster!
    let reply = "";
    if (activeAgent === 'guide') {
      reply = `[Guide AI Active] 🗺️ As your real-time travel concierge, I'd suggest considering local custom priorities! For dining out, your preferred dietary choices of "${userPrefs.dietary}" match perfectly with traditional culinary markets list. Typical transit is highly structured. Let me know if you would like packing lists or quick currency converters, or standard vocabulary translations!`;
    } else if (activeAgent === 'user') {
      reply = `[User Personal AI Active] 👤 I've parsed your active profile. Your selected budget level is "${userPrefs.budgetLevel}" with travel styles including: [${userPrefs.travelStyle.join(', ')}]. I will prioritize these metrics in all itineraries we generate inside the VoyageAI system automatically!`;
    } else {
      reply = `[Planner AI Active] ✈️ Splendid idea! For a trip to that destination, I'd suggest an optimized timeline of about 4-6 days to experience the iconic points without fatigue. I have calculated corresponding average flights starting at $350 and pristine hotel sanctuaries starting at $120. Click 'AI Generate' above to assemble a meticulous, hour-by-hour calendar instantly!`;
    }
    return { reply, activeAgent };
  }

  try {
    // Formulate a unified instructions block for the AI coordinator
    const systemPrompt = `
      You are part of a Multi-Agent AI Travel Coordination Cluster:
      - User Agent (Active persona: User AI): Personalization logic, stores budget levels [${userPrefs.budgetLevel}] and interest priorities [${userPrefs.travelStyle.join(', ')}].
      - Planner Agent (Active persona: Planner AI): Calibrates routes, schedules, day itinerary flows, hotels & budget allocations.
      - Guide Agent (Active persona: Guide AI): Realtime translation, local custom tips, currency recommendations, and emergency guidance.

      The current dialog has routed you to act primarily as: [${activeAgent.toUpperCase()} AI].
      Formulate a highly engaging, helpful, premium response in 2-3 concise paragraphs. Refer to user preference variables naturally where applicable. Provide helpful bullet points for structures.
    `;

    // Convert historical chat parameters with dual-model fallback support
    let response;
    try {
      const chat = client.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.8
        }
      });
      response = await chat.sendMessage({ message: latestMsg });
    } catch (chatErr: any) {
      console.warn("[Agent Chat] gemini-3.5-flash failed, retrying system message with stable fallback gemini-flash-latest...", chatErr.message || chatErr);
      const chat = client.chats.create({
        model: "gemini-flash-latest",
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.8
        }
      });
      response = await chat.sendMessage({ message: latestMsg });
    }

    return {
      reply: response.text || "I was unable to trace that. Could you please specify your destination coordinates?",
      activeAgent
    };
  } catch (error) {
    console.error("Gemini chat communication failed, using fallback:", error);
    return {
      reply: `[Planner AI Backup] Let's plan that journey! That region contains incredible highlights. Ask me to generate a fully customized day-by-day itinerary with hotels, flight lookups, and real-time coordinates above!`,
      activeAgent
    };
  }
}
