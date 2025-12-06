import { db } from "./db.js";
import { 
  users,
  games,
  players,
  holeInfo,
  scores
} from "../shared/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export class DatabaseStorage {
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username) {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser) {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getCurrentGame() {
    const gameResults = await db.select().from(games)
      .where(eq(games.completed, false))
      .orderBy(desc(games.createdAt))
      .limit(1);
    
    if (gameResults.length === 0) return undefined;
    
    return this.hydrateGame(gameResults[0].id);
  }

  async createGame(game) {
    const gameId = game.id || uuidv4();
    
    await db.insert(games).values({
      id: gameId,
      courseId: game.courseId,
      courseName: game.courseName,
      holeCount: game.holeCount,
      currentHole: game.currentHole,
      completed: game.completed
    });
    
    for (const player of game.players) {
      await db.insert(players).values({
        id: player.id,
        gameId: gameId,
        name: player.name
      });
    }
    
    for (let i = 1; i <= game.holeCount; i++) {
      await db.insert(holeInfo).values({
        gameId: gameId,
        holeNumber: i,
        par: 4,
        yards: 400
      });
    }
    
    return this.hydrateGame(gameId);
  }

  async getGame(id) {
    return this.hydrateGame(id);
  }

  async updateGame(id, game) {
    await db.update(games)
      .set({
        currentHole: game.currentHole,
        completed: game.completed
      })
      .where(eq(games.id, id));
    
    return this.hydrateGame(id);
  }

  async updateScores(id, holeNumber, scoreData) {
    await db.delete(scores)
      .where(and(
        eq(scores.gameId, id),
        eq(scores.holeNumber, holeNumber)
      ));
    
    for (const score of scoreData) {
      await db.insert(scores).values({
        gameId: id,
        playerId: score.playerId,
        holeNumber: score.holeNumber,
        strokes: score.strokes
      });
    }
    
    await db.update(games)
      .set({ currentHole: holeNumber })
      .where(eq(games.id, id));
    
    return this.hydrateGame(id);
  }

  async completeGame(id) {
    await db.update(games)
      .set({ completed: true })
      .where(eq(games.id, id));
    
    return this.hydrateGame(id);
  }
  
  async getHoleInfo(gameId, holeNumber) {
    const result = await db.select().from(holeInfo)
      .where(and(
        eq(holeInfo.gameId, gameId),
        eq(holeInfo.holeNumber, holeNumber)
      ));
    
    if (result.length === 0) return undefined;
    
    return {
      number: result[0].holeNumber,
      par: result[0].par,
      yards: result[0].yards
    };
  }
  
  async updateHoleInfo(gameId, holeNumber, par, yards) {
    const existingResult = await db.select().from(holeInfo)
      .where(and(
        eq(holeInfo.gameId, gameId),
        eq(holeInfo.holeNumber, holeNumber)
      ));
    
    if (existingResult.length > 0) {
      await db.update(holeInfo)
        .set({ par, yards })
        .where(and(
          eq(holeInfo.gameId, gameId),
          eq(holeInfo.holeNumber, holeNumber)
        ));
    } else {
      await db.insert(holeInfo).values({
        gameId,
        holeNumber,
        par,
        yards
      });
    }
    
    return this.getHoleInfo(gameId, holeNumber);
  }
  
  async hydrateGame(gameId) {
    const gameResults = await db.select().from(games).where(eq(games.id, gameId));
    if (gameResults.length === 0) return undefined;
    
    const gameRecord = gameResults[0];
    
    const playerResults = await db.select().from(players).where(eq(players.gameId, gameId));
    const scoreResults = await db.select().from(scores).where(eq(scores.gameId, gameId));
    
    const game = {
      id: gameRecord.id,
      courseId: gameRecord.courseId,
      courseName: gameRecord.courseName,
      holeCount: gameRecord.holeCount,
      players: playerResults.map(p => ({ id: p.id, name: p.name })),
      scores: scoreResults.map(s => ({
        playerId: s.playerId,
        holeNumber: s.holeNumber,
        strokes: s.strokes
      })),
      currentHole: gameRecord.currentHole,
      completed: gameRecord.completed
    };
    
    return game;
  }
}

export class MemStorage {
  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.currentGameId = undefined;
    this.currentId = 1;
  }

  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser) {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCurrentGame() {
    if (!this.currentGameId) return undefined;
    return this.games.get(this.currentGameId);
  }

  async createGame(game) {
    this.games.set(game.id, game);
    this.currentGameId = game.id;
    return game;
  }

  async getGame(id) {
    return this.games.get(id);
  }

  async updateGame(id, game) {
    const existing = this.games.get(id);
    if (!existing) return undefined;
    this.games.set(id, game);
    return game;
  }

  async updateScores(id, holeNumber, newScores) {
    const game = this.games.get(id);
    if (!game) return undefined;
    
    const filteredScores = game.scores.filter(score => score.holeNumber !== holeNumber);
    
    const updatedGame = {
      ...game,
      scores: [...filteredScores, ...newScores],
      currentHole: holeNumber
    };
    
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async completeGame(id) {
    const game = this.games.get(id);
    if (!game) return undefined;
    
    const completedGame = {
      ...game,
      completed: true
    };
    
    this.games.set(id, completedGame);
    if (this.currentGameId === id) {
      this.currentGameId = undefined;
    }
    
    return completedGame;
  }
  
  async getHoleInfo(gameId, holeNumber) {
    const game = this.games.get(gameId);
    if (!game) return undefined;
    
    return { number: holeNumber, par: 4, yards: 400 };
  }
  
  async updateHoleInfo(gameId, holeNumber, par, yards) {
    return { number: holeNumber, par, yards };
  }
}

export const storage = new MemStorage();
