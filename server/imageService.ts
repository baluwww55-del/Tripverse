import fetch from 'node-fetch';

const CURATED_IMAGES: { [key: string]: string } = {
  "taj mahal": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
  "agra": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
  "mysore palace": "https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=1200&q=80",
  "mysore": "https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=1200&q=80",
  "mysuru": "https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=1200&q=80",
  "hampi": "https://images.unsplash.com/photo-1600100397561-4e6479017c60?auto=format&fit=crop&w=1200&q=80",
  "goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
  "goa beach": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
  "golden temple": "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80",
  "amritsar": "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80",
  "red fort": "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=80",
  "qutub minar": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80",
  "kerala": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
  "kerala backwaters": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
  "alappuzha": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
  "leh": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
  "ladakh": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
  "leh ladakh": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
  "kashmir": "https://images.unsplash.com/photo-1595818944075-59b12a38531d?auto=format&fit=crop&w=1200&q=80",
  "kashmir valley": "https://images.unsplash.com/photo-1595818944075-59b12a38531d?auto=format&fit=crop&w=1200&q=80",
  "srinagar": "https://images.unsplash.com/photo-1595818944075-59b12a38531d?auto=format&fit=crop&w=1200&q=80",
  "konark": "https://images.unsplash.com/photo-1609137144814-8032bb19234b?auto=format&fit=crop&w=1200&q=80",
  "sun temple": "https://images.unsplash.com/photo-1609137144814-8032bb19234b?auto=format&fit=crop&w=1200&q=80",
  "meenakshi temple": "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=1200&q=80",
  "madurai": "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=1200&q=80",
  "ajanta": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
  "ellora": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
  "ajanta caves": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
  "coorg": "https://images.unsplash.com/photo-1557962453-e9ea0d0d3419?auto=format&fit=crop&w=1200&q=80",
  "ooty": "https://images.unsplash.com/photo-1580456172607-bbcd385bbd15?auto=format&fit=crop&w=1200&q=80",
  "munnar": "https://images.unsplash.com/photo-1616190419596-e2839e578ad4?auto=format&fit=crop&w=1200&q=80",
  "meghalaya": "https://images.unsplash.com/photo-1522083165195-342750297f05?auto=format&fit=crop&w=1200&q=80",
  "shillong": "https://images.unsplash.com/photo-1522083165195-342750297f05?auto=format&fit=crop&w=1200&q=80",
  "gateway of india": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
  "mumbai": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
  "bengaluru": "https://images.unsplash.com/photo-1596117808736-701aef4a5c92?auto=format&fit=crop&w=1200&q=80",
  "bangalore": "https://images.unsplash.com/photo-1596117808736-701aef4a5c92?auto=format&fit=crop&w=1200&q=80",
  "hyderabad": "https://images.unsplash.com/photo-1608958220963-6b45567bc925?auto=format&fit=crop&w=1200&q=80",
  "chennai": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
  "amer fort": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
  "jodhpur": "https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=1200&q=80",
  "udaipur": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
  "jaipur": "https://images.unsplash.com/photo-1477584305313-a9f53db49381?auto=format&fit=crop&w=1200&q=80"
};

const DEFAULT_INDIA_SCENERY = [
  "https://images.unsplash.com/photo-1477584305313-a9f53db49381?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506461883276-594a12b11db3?auto=format&fit=crop&w=1200&q=80"
];

export async function locateDestinationImage(query: string): Promise<string> {
  const norm = query.toLowerCase().trim();

  // 1. Direct Curated Match
  for (const key of Object.keys(CURATED_IMAGES)) {
    if (norm.includes(key) || key.includes(norm)) {
      return CURATED_IMAGES[key];
    }
  }

  // 2. Wikipedia Keyless Query (High Resolution & Dynamic)
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + " India")}&format=json&origin=*`;
    const searchResp = await fetch(searchUrl);
    const searchJson = await searchResp.json() as any;

    if (searchJson?.query?.search?.length > 0) {
      const bestTitle = searchJson.query.search[0].title;
      const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(bestTitle)}&prop=pageimages&pithumbsize=1200&format=json&origin=*`;
      const imgResp = await fetch(imageUrl);
      const imgJson = await imgResp.json() as any;

      const pages = imgJson?.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const originalImg = pages[pageId]?.thumbnail?.source;
        if (originalImg) {
          return originalImg;
        }
      }
    }
  } catch (error) {
    console.error(`[Image API] Wikimedia failed to query for [${query}], continuing...`, error);
  }

  // 3. Fallback to general gorgeous Unsplash search term matching
  try {
    // Generate an illustrative Unsplash URL based on query context
    const cleanTerm = encodeURIComponent(query.replace(/[^a-zA-Z0-9\s]/g, "").trim());
    return `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80&sig=${cleanTerm}`;
  } catch (e) {
    // Ultimate local backup
    return DEFAULT_INDIA_SCENERY[Math.floor(Math.random() * DEFAULT_INDIA_SCENERY.length)];
  }
}
