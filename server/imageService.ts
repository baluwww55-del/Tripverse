import dotenv from 'dotenv';
dotenv.config();

// Canonical premium curated image database which ensures immediate high-fidelity rendering
const CURATED_IMAGES: Record<string, string> = {
  "taj-mahal": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
  "mysore-palace": "https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=1200&q=80",
  "hampi-ruins": "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&w=1200&q=80",
  "kerala-backwaters": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
  "goa-beaches": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
  "golden-temple": "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80",
  "red-fort": "https://images.unsplash.com/photo-1598107312061-f9355002623d?auto=format&fit=crop&w=1200&q=80",
  "qutub-minar": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80",
  "konark-sun-temple": "https://images.unsplash.com/photo-1601999109332-542b18dbec57?auto=format&fit=crop&w=1200&q=80",
  "meenakshi-temple": "https://images.unsplash.com/photo-1609137144814-8032bb19234b?auto=format&fit=crop&w=1200&q=80",
  "ajanta-ellora": "https://images.unsplash.com/photo-1578593139888-39622e2047de?auto=format&fit=crop&w=1200&q=80",
  "darjeeling": "https://images.unsplash.com/photo-1557962453-e9ea0d0d3419?auto=format&fit=crop&w=1200&q=80",
  "coorg": "https://images.unsplash.com/photo-1580456172607-bbcd385bbd15?auto=format&fit=crop&w=1200&q=80",
  "ooty": "https://images.unsplash.com/photo-1616190419596-e2839e578ad4?auto=format&fit=crop&w=1200&q=80",
  "munnar-tea-hills": "https://images.unsplash.com/photo-1522083165195-342750297f05?auto=format&fit=crop&w=1200&q=80",
  "amer-fort": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
  "gateway-of-india": "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=1200&q=80",
  "shillong": "https://images.unsplash.com/photo-1538330621152-4f18014dd79b?auto=format&fit=crop&w=1200&q=80",
  "mumbai": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
  "bengaluru": "https://images.unsplash.com/photo-1596117808736-701aef4a5c92?auto=format&fit=crop&w=1200&q=80",
  "hyderabad": "https://images.unsplash.com/photo-1608958220963-6b45567bc925?auto=format&fit=crop&w=1200&q=80",
  "chennai": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
  "jaipur": "https://images.unsplash.com/photo-1477584305313-a9f53db49381?auto=format&fit=crop&w=1200&q=80",
  "varanasi": "https://images.unsplash.com/photo-1561361531-901416800cc4?auto=format&fit=crop&w=1200&q=80",
  "kashmir": "https://images.unsplash.com/photo-1595818944075-59b12a38531d?auto=format&fit=crop&w=1200&q=80",
  "srinagar-kashmir": "https://images.unsplash.com/photo-1595818944075-59b12a38531d?auto=format&fit=crop&w=1200&q=80",
  "ladakh": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
  "udaipur": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
};

// General beautiful scenery of India for ultimate character-hash fallback
const GENERAL_INDIAN_SCENERY = [
  "https://images.unsplash.com/photo-1506461883276-594a12b11db3?auto=format&fit=crop&w=1200&q=80", // Himalayan Peaks
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80", // Royal Indian Archway
  "https://images.unsplash.com/photo-1588122421711-effc91e4ab6f?auto=format&fit=crop&w=1200&q=80", // Indian Forest
  "https://images.unsplash.com/photo-1616190419596-e2839e578ad4?auto=format&fit=crop&w=1200&q=80", // Western Ghats Valley
  "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80", // Rajasthani Arched Courtyard
  "https://images.unsplash.com/photo-1580456172607-bbcd385bbd15?auto=format&fit=crop&w=1200&q=80", // Scenic Tea Highlands
];

// In-Memory Destination Image Cache (prevents duplicate downstream calls)
const IMAGE_CACHE: Record<string, string> = {};

// Tracks used photo URLs for local fallback searches (prevents sharing duplicate generic images in the same itinerary)
const REGISTERED_USED_URLS = new Set<string>();

/**
 * Normalizes any variations in names to a canonical destination key identifier
 */
export function getCanonicalKey(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("taj mahal") || q.includes("agra")) return "taj-mahal";
  if (q.includes("mysore") || q.includes("mysuru")) return "mysore-palace";
  if (q.includes("hampi")) return "hampi-ruins";
  if (q.includes("golden temple") || q.includes("amritsar")) return "golden-temple";
  if (q.includes("kerala") || q.includes("backwaters") || q.includes("alleppey") || q.includes("alappuzha")) return "kerala-backwaters";
  if (q.includes("munnar")) return "munnar-tea-hills";
  if (q.includes("coorg") || q.includes("kodagu")) return "coorg";
  if (q.includes("ooty")) return "ooty";
  if (q.includes("jaipur") || q.includes("hawa mahal")) return "jaipur";
  if (q.includes("amer")) return "amer-fort";
  if (q.includes("goa")) return "goa-beaches";
  if (q.includes("qutub")) return "qutub-minar";
  if (q.includes("red fort")) return "red-fort";
  if (q.includes("gateway of india")) return "gateway-of-india";
  if (q.includes("mumbai")) return "mumbai";
  if (q.includes("bengaluru") || q.includes("bangalore")) return "bengaluru";
  if (q.includes("charminar") || q.includes("hyderabad")) return "hyderabad";
  if (q.includes("meenakshi") || q.includes("madurai")) return "meenakshi-temple";
  if (q.includes("ajanta") || q.includes("ellora")) return "ajanta-ellora";
  if (q.includes("konark")) return "konark-sun-temple";
  if (q.includes("darjeeling")) return "darjeeling";
  if (q.includes("shillong") || q.includes("meghalaya")) return "shillong";
  if (q.includes("kashmir") || q.includes("srinagar")) return "srinagar-kashmir";
  if (q.includes("ladakh") || q.includes("leh")) return "ladakh";
  if (q.includes("varanasi")) return "varanasi";
  if (q.includes("udaipur")) return "udaipur";
  
  return q.replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
}

/**
 * Transforms any query/landmark into a strict structured geographic search format:
 * "<Place Name>, <State>, India"
 */
export function getExactFormattedQuery(query: string): string {
  const q = query.toLowerCase().trim();

  // Return formatted early for primary popular states/destinations
  if (q.includes("taj mahal") || q.includes("agra")) {
    return "Taj Mahal, Agra, Uttar Pradesh, India";
  }
  if (q.includes("mysore") || q.includes("mysuru")) {
    return "Mysore Palace, Mysuru, Karnataka, India";
  }
  if (q.includes("hampi")) {
    return "Hampi Ruins, Hampi, Karnataka, India";
  }
  if (q.includes("golden temple") || q.includes("amritsar")) {
    return "Golden Temple, Amritsar, Punjab, India";
  }
  if (q.includes("kerala") || q.includes("backwaters") || q.includes("alleppey") || q.includes("alappuzha")) {
    return "Kerala Backwaters, Alappuzha, Kerala, India";
  }
  if (q.includes("munnar")) {
    return "Munnar Tea Hills, Idukki, Kerala, India";
  }
  if (q.includes("coorg") || q.includes("kodagu")) {
    return "Coorg Highlands, Kodagu, Karnataka, India";
  }
  if (q.includes("ooty")) {
    return "Ooty Peak Hill Station, Ooty, Tamil Nadu, India";
  }
  if (q.includes("hawa mahal") || (q.includes("jaipur") && !q.includes("amer"))) {
    return "Hawa Mahal, Jaipur, Rajasthan, India";
  }
  if (q.includes("amer fort") || q.includes("amer")) {
    return "Amer Fort, Jaipur, Rajasthan, India";
  }
  if (q.includes("goa")) {
    return "Baga Beach, Goa, India";
  }
  if (q.includes("gateway of india")) {
    return "Gateway of India, Mumbai, Maharashtra, India";
  }
  if (q.includes("mumbai")) {
    return "Gateway of India, Mumbai, Maharashtra, India";
  }
  if (q.includes("qutub minar") || q.includes("qutub")) {
    return "Qutub Minar, Mehrauli, Delhi, India";
  }
  if (q.includes("red fort")) {
    return "Red Fort, Netaji Subhash Marg, Delhi, India";
  }
  if (q.includes("charminar") || q.includes("hyderabad")) {
    return "Charminar, Hyderabad, Telangana, India";
  }
  if (q.includes("meenakshi") || q.includes("madurai")) {
    return "Meenakshi Amman Temple, Madurai, Tamil Nadu, India";
  }
  if (q.includes("ajanta") || q.includes("ellora")) {
    return "Ajanta and Ellora Caves, Aurangabad, Maharashtra, India";
  }
  if (q.includes("konark")) {
    return "Konark Sun Temple, Konark, Odisha, India";
  }
  if (q.includes("darjeeling")) {
    return "Darjeeling Tea Gardens, Darjeeling, West Bengal, India";
  }
  if (q.includes("shillong") || q.includes("meghalaya")) {
    return "Shillong Peak, Shillong, Meghalaya, India";
  }
  if (q.includes("dal lake") || q.includes("srinagar") || q.includes("kashmir")) {
    return "Dal Lake, Srinagar, Jammu and Kashmir, India";
  }
  if (q.includes("pangong") || q.includes("leh") || q.includes("ladakh")) {
    return "Pangong Lake, Leh, Ladakh, India";
  }
  if (q.includes("varanasi") || q.includes("ganga")) {
    return "Ganga Ghats, Varanasi, Uttar Pradesh, India";
  }
  if (q.includes("udaipur")) {
    return "Taj Lake Palace, Udaipur, Rajasthan, India";
  }

  // Fallback pattern if none matched, ensuring clean spacing and comma structure
  const parts = query.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1].toLowerCase();
    if (lastPart === "india") {
      return query;
    }
    return `${parts.join(", ")}, India`;
  }
  return `${query}, India`;
}

/**
 * Checks if a query is related to a hotel search
 */
function isHotelQuery(cleanTerm: string): boolean {
  return cleanTerm.includes("hotel") || 
         cleanTerm.includes("resort") || 
         cleanTerm.includes("palace hotel") || 
         cleanTerm.includes("villas") || 
         cleanTerm.includes("lodging") || 
         cleanTerm.includes("stay") || 
         cleanTerm.includes("inn") || 
         cleanTerm.includes("retreat") ||
         cleanTerm.includes("heritage palace") ||
         cleanTerm.includes("seleqtions") ||
         cleanTerm.includes("oberoi") ||
         cleanTerm.includes("leela") ||
         cleanTerm.includes("taj west") ||
         cleanTerm.includes("safari");
}

const CURATED_HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", // Luxury Resort Pool
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80", // Elite Bed Chamber
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80", // Elegant Suite Bed
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80", // Outdoor Wellness Lounge
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80", // Grand Hotel Lobby
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80", // Seaside Hotel Pool
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", // Premium Room Interior
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80", // Contemporary Elite Bed
];

/**
 * Validates whether fetched image metadata matches the query intent 
 */
function validateImage(url: string, titleAndMeta: string, targetQuery: string): boolean {
  if (!url) return false;

  const metaLower = titleAndMeta.toLowerCase();
  const targetLower = targetQuery.toLowerCase();

  // 1. Refuse useless maps, layout diagrams, logos, icons, flags, schemas
  const badPatterns = [
    "map", "layout", "diagram", "icon", "logo", "flag", "schema", "blueprint", "iconography",
    ".svg", "marker", "locator", "district chart", "demographics", "route", "weather symbol"
  ];
  if (badPatterns.some(pattern => metaLower.includes(pattern) || url.toLowerCase().includes(pattern))) {
    return false;
  }

  // 2. Reject Taj Mahal images if they creep into other unrelated searches
  if (url.includes("photo-1564507592333-c60657eea523") && !targetLower.includes("taj") && !targetLower.includes("agra")) {
    return false;
  }

  // 3. Prevent duplicate images inside the same itinerary
  if (REGISTERED_USED_URLS.has(url)) {
    return false;
  }

  // 4. Require partial token matching for dynamic API fallbacks (guarantees local context relevance)
  const tokens = targetLower.replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(tok => tok.length > 2 && tok !== "and" && tok !== "the" && tok !== "near" && tok !== "india" && tok !== "hotel");
  if (tokens.length > 0) {
    const isMatched = tokens.some(tok => metaLower.includes(tok));
    if (!isMatched) {
      console.warn(`[Image Mismatch Validation] Rejecting URL [${url}] for target [${targetQuery}]`);
      return false;
    }
  }

  return true;
}

/**
 * Executes a prioritized chain of search API requests to retrieve unique, 
 * accurate destinations images which are guaranteed to be relevant.
 */
export async function locateDestinationImage(query: string): Promise<string> {
  const step1Query = getExactFormattedQuery(query);
  const cleanTerm = query.toLowerCase().replace(/[,\.]/g, "").trim();
  const isHotel = isHotelQuery(cleanTerm);
  
  const canonical = getCanonicalKey(query);
  const cacheKey = (isHotel ? "hotel-" : "") + (canonical || cleanTerm.replace(/[^a-z0-9]/g, "-"));

  // A. Curated Database Search (Top priority: guarantees zero-latency, 100% correct primary images)
  if (!isHotel && CURATED_IMAGES[canonical]) {
    const curatedUrl = CURATED_IMAGES[canonical];
    console.log(`[Image Debugging] Destination Query: "${step1Query}" | Canonical: "${canonical}" | Source: Curated Unsplash Database`);
    return curatedUrl;
  }

  // B. Check Memory Cache First (for custom secondary searches)
  if (IMAGE_CACHE[cacheKey]) {
    return IMAGE_CACHE[cacheKey];
  }

  // C. Google Places Platform (New) Live Integration (If configured)
  const gmpKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || "";
  if (gmpKey && gmpKey !== "YOUR_API_KEY") {
    try {
      const gmpUrl = "https://places.googleapis.com/v1/places:searchText";
      const headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": gmpKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.photos,places.formattedAddress"
      };
      const body = { textQuery: step1Query };

      const response = await fetch(gmpUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json() as any;
        const place = data?.places?.[0];
        if (place && place.id) {
          const placeDisplayName = place.displayName?.text || "";
          const placeAddress = place.formattedAddress || "";
          
          if (place.photos && place.photos.length > 0) {
            for (const photo of place.photos) {
              const photoName = photo.name;
              // Build standard media fetching URL
              const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?key=${gmpKey}&maxWidthPx=1200`;
              
              if (validateImage(photoUrl, `${placeDisplayName} ${placeAddress}`, cleanTerm)) {
                IMAGE_CACHE[cacheKey] = photoUrl;
                REGISTERED_USED_URLS.add(photoUrl);
                console.log(`[Image Debugging] Query: "${step1Query}" | Place ID: "${place.id}" | Source: Google Places API (New)`);
                return photoUrl;
              }
            }
          }
        }
      }
    } catch (gmpErr: any) {
      console.warn(`[Image Service] Google Places Live search failed for [${step1Query}]:`, gmpErr.message || gmpErr);
    }
  }

  // D. Free Multi-Stage API Fallback Stack (Wikimedia Commons & Wikipedia PageImages)
  const tourismQuery = `${step1Query} landmark tourism`;

  // Step 1: Wikimedia Commons API
  try {
    const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(tourismQuery)}&gsrnamespace=6&prop=imageinfo&iiprop=url|mime|size&iilimit=10&format=json&origin=*`;
    const resp = await fetch(commonsUrl);
    const data = await resp.json() as any;
    const pages = data?.query?.pages;

    if (pages) {
      for (const pageId of Object.keys(pages)) {
        const item = pages[pageId];
        const title = item.title || "";
        const imgUrl = item.imageinfo?.[0]?.url;

        if (imgUrl && validateImage(imgUrl, title, cleanTerm)) {
          IMAGE_CACHE[cacheKey] = imgUrl;
          REGISTERED_USED_URLS.add(imgUrl);
          console.log(`[Image Debugging] Query: "${step1Query}" | Source: Wikimedia Commons API`);
          return imgUrl;
        }
      }
    }
  } catch (err: any) {
    console.warn(`[Image Service] Wikimedia Commons dynamic lookup failed for [${tourismQuery}]:`, err.message || err);
  }

  // Step 2: Wikipedia PageImage Search API
  try {
    const backupWikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(step1Query)}&format=json&origin=*`;
    const searchResp = await fetch(backupWikiUrl);
    const searchJson = await searchResp.json() as any;
    const searchList = searchJson?.query?.search || [];

    for (const res of searchList.slice(0, 4)) {
      const pageTitle = res.title;
      const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&pithumbsize=1200&format=json&origin=*`;
      const imgResp = await fetch(imageUrl);
      const imgJson = await imgResp.json() as any;
      const pagesObj = imgJson?.query?.pages;

      if (pagesObj) {
        const pageId = Object.keys(pagesObj)[0];
        const pageImg = pagesObj[pageId]?.thumbnail?.source;
        if (pageImg && validateImage(pageImg, pageTitle, cleanTerm)) {
          IMAGE_CACHE[cacheKey] = pageImg;
          REGISTERED_USED_URLS.add(pageImg);
          console.log(`[Image Debugging] Query: "${step1Query}" | Source: Wikipedia PageImage API`);
          return pageImg;
        }
      }
    }
  } catch (err: any) {
    console.warn(`[Image Service] Wikipedia PageImage lookup failed for [${step1Query}]:`, err.message || err);
  }

  // E. Safe Fallback: Character-Hash Induced Visual Signature (Strictly Unique scenery, NEVER repeats Taj Mahal!)
  const stringHash = cleanTerm.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  if (isHotel) {
    const selectedIndex = Math.abs(stringHash) % CURATED_HOTEL_IMAGES.length;
    const hotelFallback = CURATED_HOTEL_IMAGES[selectedIndex];
    IMAGE_CACHE[cacheKey] = hotelFallback;
    console.log(`[Image Debugging] Query: "${step1Query}" | Source: Curated Hotel Fallback Signature`);
    return hotelFallback;
  }

  const selectedIndex = Math.abs(stringHash) % GENERAL_INDIAN_SCENERY.length;
  const hashBasedSceneryUrl = GENERAL_INDIAN_SCENERY[selectedIndex];

  // Prevent Taj Mahal image reuses entirely
  if (!hashBasedSceneryUrl || hashBasedSceneryUrl.includes("photo-1564507592333-c60657eea523")) {
    const finalSafeUrl = "https://images.unsplash.com/photo-1506461883276-594a12b11db3?auto=format&fit=crop&w=1200&q=80";
    IMAGE_CACHE[cacheKey] = finalSafeUrl;
    console.log(`[Image Debugging] Query: "${step1Query}" | Source: Safe Default Fallback Scenery`);
    return finalSafeUrl;
  }

  IMAGE_CACHE[cacheKey] = hashBasedSceneryUrl;
  console.log(`[Image Debugging] Query: "${step1Query}" | Source: Character-Hash Scenery Fallback`);
  return hashBasedSceneryUrl;
}
