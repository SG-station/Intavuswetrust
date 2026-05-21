/**
 * Alstom Innovation Station — Concierge Avatar Backend
 *
 * Lightweight Express server that proxies requests to the Tavus API,
 * keeping the API key server-side.
 *
 * Endpoints:
 *   POST   /api/conversation       → create a new Tavus conversation
 *   DELETE /api/conversation/:id   → end an active conversation
 *   GET    /api/health             → health check
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const {
  TAVUS_API_KEY,
  TAVUS_REPLICA_ID,
  TAVUS_PERSONA_ID,
  TAVUS_GREETING,
  PORT = 3001,
  CLIENT_ORIGIN = "http://localhost:5173",
} = process.env;

// Support comma-separated origins: "http://localhost:5173,https://sg-station.github.io"
const allowedOrigins = CLIENT_ORIGIN.split(",").map((o) => o.trim());

if (!TAVUS_API_KEY) {
  console.error("❌ Missing TAVUS_API_KEY in .env");
  process.exit(1);
}
if (!TAVUS_REPLICA_ID || !TAVUS_PERSONA_ID) {
  console.error("❌ Missing TAVUS_REPLICA_ID or TAVUS_PERSONA_ID in .env");
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Postman, same-origin)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

const TAVUS_API_BASE = "https://tavusapi.com/v2";

/**
 * POST /api/conversation
 * Creates a new Tavus conversation with the configured replica + persona.
 * Returns the conversation_url that the client embeds in an iframe.
 */
app.post("/api/conversation", async (req, res) => {
  try {
    const body = {
      replica_id: TAVUS_REPLICA_ID,
      persona_id: TAVUS_PERSONA_ID,
      conversation_name: `Alstom Concierge — ${new Date().toISOString()}`,
      // Optional spoken greeting
      ...(TAVUS_GREETING ? { custom_greeting: TAVUS_GREETING } : {}),
      // Allow overriding from the client if needed (kept simple for V1)
      ...(req.body?.conversational_context
        ? { conversational_context: req.body.conversational_context }
        : {}),
      properties: {
        max_call_duration: 600,          // 10 min hard cap — protects the 100 min monthly quota
        participant_left_timeout: 30,    // end 30s after participant leaves
        participant_absent_timeout: 60,  // end 60s if no one joins
        enable_recording: false,
        enable_transcription: true,
      },
    };

    const response = await fetch(`${TAVUS_API_BASE}/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": TAVUS_API_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Tavus error:", response.status, data);
      return res.status(response.status).json({
        error: "tavus_error",
        details: data,
      });
    }

    console.log(`✅ Conversation created: ${data.conversation_id}`);
    res.json({
      conversation_id: data.conversation_id,
      conversation_url: data.conversation_url,
      status: data.status,
    });
  } catch (err) {
    console.error("Server error creating conversation:", err);
    res.status(500).json({ error: "server_error", message: err.message });
  }
});

/**
 * DELETE /api/conversation/:id
 * Ends an active conversation early.
 */
app.delete("/api/conversation/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`${TAVUS_API_BASE}/conversations/${id}/end`, {
      method: "POST",
      headers: {
        "x-api-key": TAVUS_API_KEY,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: "tavus_error",
        details: data,
      });
    }

    console.log(`🛑 Conversation ended: ${id}`);
    res.json({ ok: true });
  } catch (err) {
    console.error("Server error ending conversation:", err);
    res.status(500).json({ error: "server_error", message: err.message });
  }
});

/**
 * GET /api/health
 */
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    replica_id: TAVUS_REPLICA_ID,
    persona_id: TAVUS_PERSONA_ID,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Alstom Concierge backend running on http://localhost:${PORT}`);
  console.log(`   Replica:  ${TAVUS_REPLICA_ID}`);
  console.log(`   Persona:  ${TAVUS_PERSONA_ID}`);
  console.log(`   Allowed origin: ${CLIENT_ORIGIN}`);
});
