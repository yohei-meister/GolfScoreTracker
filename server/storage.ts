import { 
  type Game, 
  type Player, 
  type Score,
  type User,
  type InsertUser, 
  users
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game methods
  getCurrentGame(): Promise<Game | undefined>;
  createGame(game: Game): Promise<Game>;
  getGame(id: string): Promise<Game | undefined>;
  updateGame(id: string, game: Game): Promise<Game | undefined>;
  updateScores(id: string, holeNumber: number, scores: Score[]): Promise<Game | undefined>;
  completeGame(id: string): Promise<Game | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<string, Game>;
  private currentGameId?: string;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.currentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Game methods
  async getCurrentGame(): Promise<Game | undefined> {
    if (!this.currentGameId) return undefined;
    return this.games.get(this.currentGameId);
  }

  async createGame(game: Game): Promise<Game> {
    this.games.set(game.id, game);
    this.currentGameId = game.id;
    return game;
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async updateGame(id: string, game: Game): Promise<Game | undefined> {
    const existing = this.games.get(id);
    if (!existing) return undefined;
    this.games.set(id, game);
    return game;
  }

  async updateScores(id: string, holeNumber: number, scores: Score[]): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;
    
    // Remove existing scores for this hole
    const filteredScores = game.scores.filter(score => score.holeNumber !== holeNumber);
    
    // Add new scores
    const updatedGame: Game = {
      ...game,
      scores: [...filteredScores, ...scores],
      currentHole: holeNumber
    };
    
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async completeGame(id: string): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;
    
    const completedGame: Game = {
      ...game,
      completed: true
    };
    
    this.games.set(id, completedGame);
    if (this.currentGameId === id) {
      this.currentGameId = undefined;
    }
    
    return completedGame;
  }
}

export const storage = new MemStorage();
