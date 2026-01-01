import express from "express";
import cors from "cors";
import gameHandler from "../api/game.js";
import gameIdHandler from "../api/game/[id].js";
import scoresHandler from "../api/game/[id]/scores.js";
import completeHandler from "../api/game/[id]/complete.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Helper to adapt Vercel-style handlers to Express
function adaptHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error("Handler error:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };
}

// Routes
app.all("/api/game", adaptHandler(gameHandler));
app.all("/api/game/:id", (req, res) => {
  req.query = { id: req.params.id };
  adaptHandler(gameIdHandler)(req, res);
});
app.all("/api/game/:id/scores", (req, res) => {
  req.query = { id: req.params.id };
  adaptHandler(scoresHandler)(req, res);
});
app.all("/api/game/:id/complete", (req, res) => {
  req.query = { id: req.params.id };
  adaptHandler(completeHandler)(req, res);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.USE_FIREBASE_EMULATOR === "true" ? "Firebase Emulator" : "Production"}`);
});
