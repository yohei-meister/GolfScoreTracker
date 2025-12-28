import { storage } from "../../server/storage.js";
import { gameSchema } from "../../shared/schema.js";
import { z } from "zod";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PUT, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    if (req.method === "PUT") {
      const gameData = gameSchema.parse(req.body);
      const game = await storage.updateGame(id, gameData);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      return res.json(game);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid game data", errors: error.errors });
    }
    console.error("API error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

