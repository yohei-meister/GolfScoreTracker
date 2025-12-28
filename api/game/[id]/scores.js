import { storage } from "../../../server/storage.js";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  const { holeNumber, scores } = req.body;

  if (!holeNumber || !scores || !Array.isArray(scores)) {
    return res.status(400).json({ message: "Invalid score data" });
  }

  try {
    const game = await storage.updateScores(id, holeNumber, scores);
    
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    
    return res.json(game);
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ message: "Failed to update scores" });
  }
}

