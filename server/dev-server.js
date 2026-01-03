import "dotenv/config";
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

// Helper to create a query object with id from params
function createQueryWithId(req) {
  // Express 5では req.query が読み取り専用のgetterの場合があるため、
  // 新しいオブジェクトを作成
  const query = { ...req.query };
  if (req.params.id) {
    query.id = req.params.id;
  }
  return query;
}

// Helper to wrap handler with query modification
function withQueryId(handler) {
  return (req, res) => {
    const queryWithId = createQueryWithId(req);

    // req.queryを一時的に置き換える（getterとして定義）
    Object.defineProperty(req, "query", {
      get: () => queryWithId,
      configurable: true,
      enumerable: true
    });

    return adaptHandler(handler)(req, res);
  };
}

// Routes
app.all("/api/game", adaptHandler(gameHandler));
app.all("/api/game/:id", withQueryId(gameIdHandler));
app.all("/api/game/:id/scores", withQueryId(scoresHandler));
app.all("/api/game/:id/complete", withQueryId(completeHandler));

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  const useEmulator =
    process.env.FIRESTORE_EMULATOR_HOST ||
    process.env.USE_FIREBASE_EMULATOR === "true";
  console.log(
    `Environment: ${useEmulator ? "Firebase Emulator" : "Firebase Production"}`
  );
  if (!useEmulator && process.env.FIREBASE_PROJECT_ID) {
    console.log(`Firebase Project: ${process.env.FIREBASE_PROJECT_ID}`);
  }
});
