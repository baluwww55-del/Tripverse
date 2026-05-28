import { GoogleGenAI, Type } from "@google/genai";

// Lazy-loaded GenAI client to avoid crashes if API key is missing
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export interface WeatherForecastDay {
  day: string;
  tempMin: number;
  tempMax: number;
  condition: string;
  rainChance: number; // percentage (0-100)
}

export interface WeatherResponse {
  destination: string;
  currentTemp: number;
  currentCondition: string;
  humidity: number;
  windSpeed: number; // km/h
  sunsetTime: string;
  advisory: string;
  aiRecommendation: string;
  forecast: WeatherForecastDay[];
}

const MOCK_WEATHER_DATA: Record<string, Omit<WeatherResponse, "destination">> = {
  "agra": {
    currentTemp: 32,
    currentCondition: "Clear Sunny",
    humidity: 45,
    windSpeed: 10,
    sunsetTime: "06:58 PM",
    advisory: "Spectacular glowing orange skies over the Yamuna context.",
    aiRecommendation: "☀ Best Taj sunset views starting around 05:45 PM. Dress in loose breathable handloom cotton today.",
    forecast: [
      { day: "Thur", tempMin: 22, tempMax: 33, condition: "Sunny", rainChance: 0 },
      { day: "Fri", tempMin: 23, tempMax: 34, condition: "Sunny", rainChance: 0 },
      { day: "Sat", tempMin: 24, tempMax: 35, condition: "Partly Cloudy", rainChance: 10 },
      { day: "Sun", tempMin: 23, tempMax: 33, condition: "Scattered Showers", rainChance: 40 },
      { day: "Mon", tempMin: 21, tempMax: 30, condition: "Light Rainy", rainChance: 60 }
    ]
  },
  "bengaluru": {
    currentTemp: 23,
    currentCondition: "Overcast Breeze",
    humidity: 75,
    windSpeed: 18,
    sunsetTime: "06:42 PM",
    advisory: "Cool westerly winds sweeping the Cubbon Park avenues.",
    aiRecommendation: "☔ Perfect weather for a hot cup of Malleshwaram filter coffee. Keep a light windbreaker or folding umbrella handy.",
    forecast: [
      { day: "Thur", tempMin: 19, tempMax: 26, condition: "Overcast", rainChance: 30 },
      { day: "Fri", tempMin: 18, tempMax: 25, condition: "Light Drifting Rain", rainChance: 50 },
      { day: "Sat", tempMin: 19, tempMax: 24, condition: "Thunder Showers", rainChance: 80 },
      { day: "Sun", tempMin: 19, tempMax: 26, condition: "Mild Breezy", rainChance: 40 },
      { day: "Mon", tempMin: 20, tempMax: 27, condition: "Partly Cloudy", rainChance: 20 }
    ]
  },
  "mysuru": {
    currentTemp: 26,
    currentCondition: "Pleasant",
    humidity: 62,
    windSpeed: 12,
    sunsetTime: "06:44 PM",
    advisory: "Serene cool twilight rolling onto Chamundi Hills.",
    aiRecommendation: "✨ Ideal conditions for seeing Mysore Palace illumination on Sunday evening (usually starting 7 PM).",
    forecast: [
      { day: "Thur", tempMin: 20, tempMax: 29, condition: "Clear", rainChance: 10 },
      { day: "Fri", tempMin: 19, tempMax: 28, condition: "Clear", rainChance: 10 },
      { day: "Sat", tempMin: 20, tempMax: 27, condition: "Partly Cloudy", rainChance: 30 },
      { day: "Sun", tempMin: 21, tempMax: 27, condition: "Scattered Showers", rainChance: 45 },
      { day: "Mon", tempMin: 19, tempMax: 28, condition: "Clear", rainChance: 10 }
    ]
  },
  "mumbai": {
    currentTemp: 31,
    currentCondition: "Humid Marine",
    humidity: 82,
    windSpeed: 16,
    sunsetTime: "07:05 PM",
    advisory: "Sticky coastal breezes rising over the Queen's Necklace Marine Drive.",
    aiRecommendation: "⚡ Avoid coastal bike routes after sunset if thunderstorm warnings spike. Grab local cutting chai inside.",
    forecast: [
      { day: "Thur", tempMin: 26, tempMax: 32, condition: "Humid Partly Cloudy", rainChance: 20 },
      { day: "Fri", tempMin: 27, tempMax: 31, condition: "Scattered Showers", rainChance: 60 },
      { day: "Sat", tempMin: 25, tempMax: 29, condition: "Heavy Rain & Winds", rainChance: 95 },
      { day: "Sun", tempMin: 25, tempMax: 30, condition: "Moderate Rains", rainChance: 80 },
      { day: "Mon", tempMin: 26, tempMax: 31, condition: "Overcast", rainChance: 50 }
    ]
  },
  "delhi": {
    currentTemp: 21,
    currentCondition: "Mild Haze",
    humidity: 50,
    windSpeed: 8,
    sunsetTime: "07:02 PM",
    advisory: "Faint morning mist with comfortable sunny afternoon spans.",
    aiRecommendation: "🏰 Excellent day for exploring Red Fort or Qutub Minar on foot. Consider early morning strolls to bypass heat spikes.",
    forecast: [
      { day: "Thur", tempMin: 14, tempMax: 24, condition: "Perfect Sunny", rainChance: 0 },
      { day: "Fri", tempMin: 15, tempMax: 25, condition: "Sunny", rainChance: 0 },
      { day: "Sat", tempMin: 16, tempMax: 27, condition: "Warm and Dusty", rainChance: 10 },
      { day: "Sun", tempMin: 17, tempMax: 26, condition: "Partly Cloudy", rainChance: 25 },
      { day: "Mon", tempMin: 15, tempMax: 23, condition: "Cool Breeze", rainChance: 10 }
    ]
  },
  "jaipur": {
    currentTemp: 29,
    currentCondition: "Bright Dry",
    humidity: 30,
    windSpeed: 13,
    sunsetTime: "07:11 PM",
    advisory: "Dry desert winds blowing around the Amer Fort ramparts.",
    aiRecommendation: "🏺 Bring sunglasses and a wide sunhat for exploring palace courtyards. Hydrate constantly with sweet Lassi.",
    forecast: [
      { day: "Thur", tempMin: 16, tempMax: 28, condition: "Sunny Desert Sky", rainChance: 0 },
      { day: "Fri", tempMin: 17, tempMax: 29, condition: "Sunny", rainChance: 0 },
      { day: "Sat", tempMin: 18, tempMax: 31, condition: "Hot and Clear", rainChance: 0 },
      { day: "Sun", tempMin: 19, tempMax: 30, condition: "Light Clouds", rainChance: 10 },
      { day: "Mon", tempMin: 17, tempMax: 29, condition: "Clear Sky", rainChance: 0 }
    ]
  },
  "goa": {
    currentTemp: 30,
    currentCondition: "Warm Coastal Sky",
    humidity: 79,
    windSpeed: 15,
    sunsetTime: "06:54 PM",
    advisory: "High moisture count making beach strolls atmospheric.",
    aiRecommendation: "🌊 Stunning Goa sunset anticipated down at Benaulim or Morjim beach today at 06:40 PM. Ideal water conditions.",
    forecast: [
      { day: "Thur", tempMin: 24, tempMax: 31, condition: "Warm Coast", rainChance: 10 },
      { day: "Fri", tempMin: 24, tempMax: 31, condition: "Partly Cloudy", rainChance: 30 },
      { day: "Sat", tempMin: 23, tempMax: 29, condition: "Heavy Coastal Rain", rainChance: 85 },
      { day: "Sun", tempMin: 23, tempMax: 28, condition: "Tropical Monsoons", rainChance: 90 },
      { day: "Mon", tempMin: 24, tempMax: 30, condition: "Light Scattered Showers", rainChance: 60 }
    ]
  },
  "kerala": {
    currentTemp: 28,
    currentCondition: "Tropical Shower",
    humidity: 85,
    windSpeed: 11,
    sunsetTime: "06:38 PM",
    advisory: "Charming tropical humidity rolling off the Alleppey Backwaters.",
    aiRecommendation: "🛶 Take a premium indoor houseboat cruise if rainfall intensifies. Savor warm local spices in hot food.",
    forecast: [
      { day: "Thur", tempMin: 23, tempMax: 29, condition: "Lush Showers", rainChance: 70 },
      { day: "Fri", tempMin: 23, tempMax: 28, condition: "Heavy Monsoons", rainChance: 90 },
      { day: "Sat", tempMin: 22, tempMax: 27, condition: "Monsoonly", rainChance: 85 },
      { day: "Sun", tempMin: 23, tempMax: 29, condition: "Intermittent Showers", rainChance: 60 },
      { day: "Mon", tempMin: 24, tempMax: 30, condition: "Overcast Green", rainChance: 40 }
    ]
  },
  "kashmir": {
    currentTemp: 14,
    currentCondition: "Chilly Mountain Mist",
    humidity: 68,
    windSpeed: 7,
    sunsetTime: "07:18 PM",
    advisory: "Chilly mountain conditions. Saffron mist rising above Dal Lake.",
    aiRecommendation: "☕ Cold morning! Snuggle up in a luxurious shikara boat with a steaming cup of regional almond saffron Kahwa tea.",
    forecast: [
      { day: "Thur", tempMin: 8, tempMax: 16, condition: "Chilly Mist", rainChance: 25 },
      { day: "Fri", tempMin: 7, tempMax: 15, condition: "Cool Drizzle", rainChance: 50 },
      { day: "Sat", tempMin: 9, tempMax: 17, condition: "Pleasant Valley", rainChance: 10 },
      { day: "Sun", tempMin: 10, tempMax: 18, condition: "Sunny Valley", rainChance: 0 },
      { day: "Mon", tempMin: 8, tempMax: 15, condition: "Chilly Breeze", rainChance: 30 }
    ]
  },
  "ladakh": {
    currentTemp: 11,
    currentCondition: "Crisp High Altitude Cold",
    humidity: 25,
    windSpeed: 20,
    sunsetTime: "07:28 PM",
    advisory: "Strong alpine draft. Ultraviolet values are maximum in the high desert.",
    aiRecommendation: "🧤 Heavy woolens or windproof downs are essential today. High altitude UV is high; use screen lotion.",
    forecast: [
      { day: "Thur", tempMin: 4, tempMax: 15, condition: "Brisk Clear", rainChance: 0 },
      { day: "Fri", tempMin: 2, tempMax: 13, condition: "Gale-force Winds", rainChance: 0 },
      { day: "Sat", tempMin: 3, tempMax: 14, condition: "Clear High Skies", rainChance: 10 },
      { day: "Sun", tempMin: 5, tempMax: 16, condition: "Sunny But Chilly", rainChance: 0 },
      { day: "Mon", tempMin: 3, tempMax: 12, condition: "Overcast Cold", rainChance: 20 }
    ]
  },
  "varanasi": {
    currentTemp: 26,
    currentCondition: "Atmospheric Foggy Rise",
    humidity: 65,
    windSpeed: 9,
    sunsetTime: "06:49 PM",
    advisory: "Deep spiritual ambience surrounding the ancient bathing Ghats.",
    aiRecommendation: "🕯 Stunning view conditions of evening Ganga Aarti at Dashashwamedh Ghat under crystal clear skies today.",
    forecast: [
      { day: "Thur", tempMin: 18, tempMax: 27, condition: "Mist to Sunny", rainChance: 0 },
      { day: "Fri", tempMin: 19, tempMax: 28, condition: "Sunny", rainChance: 0 },
      { day: "Sat", tempMin: 20, tempMax: 29, condition: "Clear Warm", rainChance: 10 },
      { day: "Sun", tempMin: 18, tempMax: 27, condition: "Light Overcast", rainChance: 30 },
      { day: "Mon", tempMin: 17, tempMax: 26, condition: "Pleasant", rainChance: 10 }
    ]
  },
  "hampi": {
    currentTemp: 31,
    currentCondition: "Tropical Sunny Peak",
    humidity: 40,
    windSpeed: 11,
    sunsetTime: "06:47 PM",
    advisory: "Golden heat radiating off the ancient Vijayanagara boulder plains.",
    aiRecommendation: "☀ Sunset at Hemakuta Hill is stellar tonight. Wear an airy linen shirt and rent a bike early to avoid exhaustion.",
    forecast: [
      { day: "Thur", tempMin: 22, tempMax: 33, condition: "Sunny Boulders", rainChance: 0 },
      { day: "Fri", tempMin: 23, tempMax: 34, condition: "Dry Sunny", rainChance: 0 },
      { day: "Sat", tempMin: 22, tempMax: 32, condition: "Spotted Clouds", rainChance: 20 },
      { day: "Sun", tempMin: 21, tempMax: 30, condition: "Scattered Showers", rainChance: 50 },
      { day: "Mon", tempMin: 20, tempMax: 31, condition: "Overcast Breeze", rainChance: 30 }
    ]
  },
  "coorg": {
    currentTemp: 21,
    currentCondition: "Deep Misty Green",
    humidity: 88,
    windSpeed: 10,
    sunsetTime: "06:45 PM",
    advisory: "Dense cloud banks laying over the fragrant cardamom forests.",
    aiRecommendation: "⛰ Road visibility on hairpin curves is very low due to thick mist. Hire professional local drivers with fog-lamps.",
    forecast: [
      { day: "Thur", tempMin: 16, tempMax: 23, condition: "Misty Overcast", rainChance: 40 },
      { day: "Fri", tempMin: 15, tempMax: 22, condition: "Light Coffee Rains", rainChance: 65 },
      { day: "Sat", tempMin: 16, tempMax: 21, condition: "Continuous Showers", rainChance: 85 },
      { day: "Sun", tempMin: 17, tempMax: 23, condition: "Humid Overcast", rainChance: 50 },
      { day: "Mon", tempMin: 15, tempMax: 22, condition: "Misty Morning", rainChance: 30 }
    ]
  },
  "ooty": {
    currentTemp: 16,
    currentCondition: "Chilly Pine Breeze",
    humidity: 78,
    windSpeed: 12,
    sunsetTime: "06:44 PM",
    advisory: "Crisp Nilgiri mountain chill. Early fog drifting across Ooty Lake.",
    aiRecommendation: "🚂 Outstanding day to ride the Toy Train. Keep warm gloves and dry wool layers near to tackle sudden altitude drafts.",
    forecast: [
      { day: "Thur", tempMin: 10, tempMax: 18, condition: "Crisp Chilly", rainChance: 10 },
      { day: "Fri", tempMin: 9, tempMax: 17, condition: "Overcast Fog", rainChance: 30 },
      { day: "Sat", tempMin: 8, tempMax: 16, condition: "Drizzle Mist", rainChance: 60 },
      { day: "Sun", tempMin: 11, tempMax: 18, condition: "Sunny Mountain", rainChance: 10 },
      { day: "Mon", tempMin: 10, tempMax: 17, condition: "Chilly Clear", rainChance: 10 }
    ]
  }
};

export async function getWeatherForecast(destination: string): Promise<WeatherResponse> {
  const normDest = destination.trim().toLowerCase();
  const client = getAIClient();

  if (client) {
    try {
      console.log(`[Weather AI] Fetching live smart weather telemetry for ${destination}...`);
      const prompt = `
        Create a realistic 5-day weather forecast forecast object for: "${destination}"
        This is a destination in or near India. Generate authentic temperature patterns, humidity metrics (%), weather condition, wind speed (km/h), typical sunset formatting, a precise travel advisory, and a professional AI travel recommendation (e.g., advising on sunset timings, clothes to wear, or weather-induced traffic/transit limitations like: "Avoid bike travel due to rain").
        Output the response in EXACTLY the following JSON format conforming to this structure:
        
        {
          "destination": "${destination}",
          "currentTemp": 27,
          "currentCondition": "Partly Cloudy",
          "humidity": 68,
          "windSpeed": 12,
          "sunsetTime": "06:45 PM",
          "advisory": "Clean and warm conditions.",
          "aiRecommendation": "Perfect time for viewing sunset at monument. Light cotton layers are recommended.",
          "forecast": [
            { "day": "Mon", "tempMin": 22, "tempMax": 31, "condition": "Sunny", "rainChance": 10 },
            { "day": "Tue", "tempMin": 21, "tempMax": 30, "condition": "Partly Cloudy", "rainChance": 20 },
            { "day": "Wed", "tempMin": 20, "tempMax": 28, "condition": "Scattered Showers", "rainChance": 60 },
            { "day": "Thu", "tempMin": 19, "tempMax": 26, "condition": "Heavier Rain", "rainChance": 85 },
            { "day": "Fri", "tempMin": 21, "tempMax": 29, "condition": "Clear Sky", "rainChance": 10 }
          ]
        }

        Make sure the forecast contains exactly 5 entries matching sequential short days (e.g. "Mon", "Tue", "Wed", "Thu", "Fri"). Return dry valid JSON without markdown wrapping.
      `;

      let response;
      try {
        response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "You are VoyageAI Weather Engine. Always return valid structured weather information conforming precisely to the requested schema. Ensure coordinates align with authentic Indian geography.",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                destination: { type: Type.STRING },
                currentTemp: { type: Type.INTEGER },
                currentCondition: { type: Type.STRING },
                humidity: { type: Type.INTEGER },
                windSpeed: { type: Type.INTEGER },
                sunsetTime: { type: Type.STRING },
                advisory: { type: Type.STRING },
                aiRecommendation: { type: Type.STRING },
                forecast: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      day: { type: Type.STRING },
                      tempMin: { type: Type.INTEGER },
                      tempMax: { type: Type.INTEGER },
                      condition: { type: Type.STRING },
                      rainChance: { type: Type.INTEGER }
                    },
                    required: ["day", "tempMin", "tempMax", "condition", "rainChance"]
                  }
                }
              },
              required: ["destination", "currentTemp", "currentCondition", "humidity", "windSpeed", "sunsetTime", "advisory", "aiRecommendation", "forecast"]
            }
          }
        });
      } catch (geminiError: any) {
        console.warn("[Weather AI] gemini-3.5-flash failed or experienced high demand. Trying fallback model gemini-flash-latest...", geminiError.message || geminiError);
        response = await client.models.generateContent({
          model: "gemini-flash-latest",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "You are VoyageAI Weather Engine. Always return valid structured weather information conforming precisely to the requested schema. Ensure coordinates align with authentic Indian geography.",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                destination: { type: Type.STRING },
                currentTemp: { type: Type.INTEGER },
                currentCondition: { type: Type.STRING },
                humidity: { type: Type.INTEGER },
                windSpeed: { type: Type.INTEGER },
                sunsetTime: { type: Type.STRING },
                advisory: { type: Type.STRING },
                aiRecommendation: { type: Type.STRING },
                forecast: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      day: { type: Type.STRING },
                      tempMin: { type: Type.INTEGER },
                      tempMax: { type: Type.INTEGER },
                      condition: { type: Type.STRING },
                      rainChance: { type: Type.INTEGER }
                    },
                    required: ["day", "tempMin", "tempMax", "condition", "rainChance"]
                  }
                }
              },
              required: ["destination", "currentTemp", "currentCondition", "humidity", "windSpeed", "sunsetTime", "advisory", "aiRecommendation", "forecast"]
            }
          }
        });
      }

      const parsed = JSON.parse(response.text.trim());
      return parsed;

    } catch (err) {
      console.warn("[Weather AI] Gemini call erred. Resorting to simulated intelligence fallback:", err);
    }
  }

  // Fallback simulator matches key sub-stems
  const baseKey = Object.keys(MOCK_WEATHER_DATA).find(k => normDest.includes(k) || k.includes(normDest)) || "bengaluru";
  const baseData = MOCK_WEATHER_DATA[baseKey];

  return {
    destination: destination.charAt(0).toUpperCase() + destination.slice(1),
    ...baseData
  };
}
