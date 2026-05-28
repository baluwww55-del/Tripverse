import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Database } from "./server/db.js";
import { generateAILineItinerary, generateSimulatedItinerary, processAgentChat } from "./server/ai.js";
import { getWeatherForecast } from "./server/weather.js";
import { locateDestinationImage } from "./server/imageService.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser limit expanded for rich trip payload exchanges
  app.use(express.json({ limit: '10mb' }));

  // Custom high-fidelity API request logger middleware for Admin Telemetry
  app.use((req, res, next) => {
    if (!req.url.startsWith('/api/')) {
      return next();
    }
    const startTimeName = Date.now();
    res.on('finish', () => {
      const responseTime = Date.now() - startTimeName;
      Database.addAPILog(req.method + " " + req.path, responseTime, res.statusCode);
    });
    next();
  });

  // REST API Routes

  // 1. Get/Set Preferences
  app.get("/api/preferences", (req, res) => {
    try {
      const pref = Database.getPreferences();
      res.json(pref);
    } catch (error) {
      res.status(500).json({ error: "Failed to load traveler preferences." });
    }
  });

  app.post("/api/preferences", (req, res) => {
    try {
      const updated = Database.updatePreferences(req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update preferences." });
    }
  });

  // 2. List & Operations on Saved Trips
  app.get("/api/trips", (req, res) => {
    try {
      const trips = Database.getSavedTrips();
      res.json(trips);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch saved itineraries." });
    }
  });

  app.post("/api/trips", (req, res) => {
    try {
      const trip = req.body;
      if (!trip.id) {
        trip.id = `trip-${Date.now()}`;
      }
      if (!trip.createdAt) {
        trip.createdAt = new Date().toISOString();
      }
      const saved = Database.saveTrip(trip);
      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: "Failed to save itinerary." });
    }
  });

  app.delete("/api/trips/:id", (req, res) => {
    try {
      const id = req.params.id;
      const done = Database.deleteTrip(id);
      res.json({ success: done });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove trip." });
    }
  });

  // 2.5 Active 5-Day Weather Intelligence Service
  app.get("/api/weather", async (req, res) => {
    try {
      const destination = (req.query.destination as string) || "bengaluru";
      const weatherData = await getWeatherForecast(destination);
      res.json(weatherData);
    } catch (error: any) {
      console.error("Weather service failure:", error);
      res.status(500).json({ error: "Failed to retrieve active weather forecast: " + error.message });
    }
  });

  // 2.6 Dynamic Destination Image Fetcher
  app.get("/api/images/search", async (req, res) => {
    try {
      const query = (req.query.q as string) || "Incredible India";
      const imageUrl = await locateDestinationImage(query);
      res.json({ url: imageUrl });
    } catch (error: any) {
      console.error("Image service failure:", error);
      res.status(500).json({ error: "Failed to retrieve real destination images: " + error.message });
    }
  });

  // 3. AI Trip Generator (Planner AI engine)
  app.post("/api/trips/generate", async (req, res) => {
    const { destination, daysCount, budget } = req.body;
    if (!destination || !daysCount || !budget) {
      return res.status(400).json({ error: "Parameters 'destination', 'daysCount', and 'budget' are essential." });
    }

    try {
      const parsedDays = parseInt(daysCount);
      const parsedBudget = parseFloat(budget);
      const userPrefs = Database.getPreferences();

      console.log(`[Planner AI] Launching build query for ${destination}, ${parsedDays} days, budget $${parsedBudget}`);
      const itineraryOut = await generateAILineItinerary(
        destination,
        parsedDays,
        parsedBudget,
        userPrefs
      );

      res.json(itineraryOut);
    } catch (error: any) {
      console.warn("[Planner AI] Primary generation had error, executing failsafe template generator:", error.message || error);
      try {
        const parsedDays = parseInt(daysCount);
        const parsedBudget = parseFloat(budget);
        const userPrefs = Database.getPreferences();
        const fallbackPlan = generateSimulatedItinerary(destination, parsedDays, parsedBudget, userPrefs);
        res.json(fallbackPlan);
      } catch (fallbackError: any) {
        console.error("Critical fallback failure:", fallbackError);
        res.status(500).json({ error: "Core itineray engine failsafe system failed." });
      }
    }
  });

  // 4. Multi-Agent Intelligent Chat Concierge
  app.get("/api/chat/history", (req, res) => {
    try {
      res.json(Database.getChatHistory());
    } catch (error) {
      res.status(500).json({ error: "Failed to load chat history." });
    }
  });

  app.post("/api/chat", async (req, res) => {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Message content cannot be blank." });
    }

    try {
      // Fetch preferences
      const userPrefs = Database.getPreferences();
      // Record user message to DB
      const userMsg = Database.addChatMessage({ sender: "user", text });

      // Build context history representation from past database records
      const rawHistory = Database.getChatHistory();
      const mappedHistory = rawHistory.slice(-10).map((msg) => ({
        role: msg.sender === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.text }]
      }));

      // Orchestrate agent routing & model response
      const { reply, activeAgent } = await processAgentChat(
        mappedHistory,
        text,
        userPrefs
      );

      // Record AI response with designated sub-agent tag
      const aiResponse = Database.addChatMessage({
        sender: "ai",
        agentType: activeAgent,
        text: reply
      });

      res.json({
        userMsg,
        aiResponse
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Guide AI was unable to synthesize a coordinate." });
    }
  });

  app.post("/api/chat/clear", (req, res) => {
    try {
      Database.clearChatHistory();
      res.json({ success: true, history: Database.getChatHistory() });
    } catch (error) {
      res.status(500).json({ error: "Failed to clean conversational logs." });
    }
  });

  // 5. Admin Metrics Telemetry
  app.get("/api/admin/metrics", (req, res) => {
    try {
      const logs = Database.getAPILogs();
      const trips = Database.getSavedTrips();
      const history = Database.getChatHistory();

      // Aggregate revenue and counts
      const overallRevenues = trips.reduce((acc, t) => acc + (t.budget || 0), 0);
      const totalAPICalls = logs.length;
      const averageLatency = logs.length > 0
        ? Math.round(logs.reduce((acc, l) => acc + l.responseTimeMs, 0) / logs.length)
        : 0;

      // Agent distribution count
      const agentDistribution = {
        coordinator: 0,
        planner: 0,
        guide: 0,
        userPersona: 0
      };

      history.forEach(m => {
        if (m.sender === 'ai') {
          if (m.agentType === 'planner') agentDistribution.planner++;
          else if (m.agentType === 'guide') agentDistribution.guide++;
          else if (m.agentType === 'user') agentDistribution.userPersona++;
          else agentDistribution.coordinator++;
        }
      });

      res.json({
        logs: logs.slice(-50), // Send last 50 entries
        metrics: {
          totalTripsCount: trips.length,
          totalRevenues: overallRevenues,
          totalAPICalls,
          averageLatencyMs: averageLatency,
          chatInteractionsCount: history.length,
          errorRatePercent: logs.length > 0 ? Math.round((logs.filter(l => l.status >= 400).length / logs.length) * 100) : 0
        },
        agentDistribution
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to assemble admin reports." });
    }
  });

  // Vite middleware for dev or raw static assets for production
  if (process.env.NODE_ENV !== "production") {
    console.log("[Vite] Deploying Vite middleware loader inside Express server...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VoyageAI Server successfully running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
