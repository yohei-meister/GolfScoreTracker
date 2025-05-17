import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { gameSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current game
  app.get("/api/game", async (req, res) => {
    try {
      const game = await storage.getCurrentGame();
      if (!game) {
        return res.status(404).json({ message: "No active game found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve game" });
    }
  });

  // Create new game
  app.post("/api/game", async (req, res) => {
    try {
      const gameData = gameSchema.parse(req.body);
      const game = await storage.createGame(gameData);
      res.status(201).json(game);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid game data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  // Update game
  app.put("/api/game/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const gameData = gameSchema.parse(req.body);
      const game = await storage.updateGame(id, gameData);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json(game);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid game data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update game" });
    }
  });

  // Update scores for a hole
  app.patch("/api/game/:id/scores", async (req, res) => {
    try {
      const { id } = req.params;
      const { holeNumber, scores } = req.body;
      
      if (!holeNumber || !scores || !Array.isArray(scores)) {
        return res.status(400).json({ message: "Invalid score data" });
      }
      
      const game = await storage.updateScores(id, holeNumber, scores);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to update scores" });
    }
  });

  // Complete game
  app.patch("/api/game/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      const game = await storage.completeGame(id);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete game" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
