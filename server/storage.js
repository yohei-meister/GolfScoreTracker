import { db } from "./firebase.js";
import { v4 as uuidv4 } from "uuid";

export class FirestoreStorage {
  constructor() {
    if (!db) {
      throw new Error("Firebase not initialized; FirestoreStorage is unavailable.");
    }
  }

  async getUser(id) {
    const userDoc = await db.collection("users").doc(id.toString()).get();
    if (!userDoc.exists) return undefined;
    return { id: userDoc.id, ...userDoc.data() };
  }

  async getUserByUsername(username) {
    const usersSnapshot = await db
      .collection("users")
      .where("username", "==", username)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) return undefined;
    const userDoc = usersSnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  }

  async createUser(insertUser) {
    const userRef = db.collection("users").doc();
    await userRef.set({
      ...insertUser,
      createdAt: new Date(),
    });
    return { id: userRef.id, ...insertUser };
  }

  async getCurrentGame() {
    const gamesSnapshot = await db
      .collection("games")
      .where("completed", "==", false)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (gamesSnapshot.empty) return undefined;

    const gameDoc = gamesSnapshot.docs[0];
    return this.hydrateGame(gameDoc.id);
  }

  async createGame(game) {
    const gameId = game.id || uuidv4();
    const gameRef = db.collection("games").doc(gameId);

    // Create game document
    await gameRef.set({
      courseId: game.courseId,
      courseName: game.courseName,
      holeCount: game.holeCount,
      currentHole: game.currentHole,
      completed: game.completed || false,
      createdAt: new Date(),
    });

    // Create players subcollection
    const playersRef = gameRef.collection("players");
    for (const player of game.players) {
      await playersRef.doc(player.id).set({
        name: player.name,
      });
    }

    // Create hole info subcollection
    const holesRef = gameRef.collection("holes");
    for (let i = 1; i <= game.holeCount; i++) {
      await holesRef.doc(i.toString()).set({
        holeNumber: i,
        par: 4,
        yards: 400,
      });
    }

    // Initialize scores subcollection (empty)
    // Scores will be added as they're recorded

    return this.hydrateGame(gameId);
  }

  async getGame(id) {
    return this.hydrateGame(id);
  }

  async updateGame(id, game) {
    const gameRef = db.collection("games").doc(id);
    const gameDoc = await gameRef.get();

    if (!gameDoc.exists) return undefined;

    await gameRef.update({
      currentHole: game.currentHole,
      completed: game.completed,
    });

    return this.hydrateGame(id);
  }

  async updateScores(id, holeNumber, scoreData) {
    const gameRef = db.collection("games").doc(id);
    const gameDoc = await gameRef.get();

    if (!gameDoc.exists) return undefined;

    // Delete existing scores for this hole
    const scoresSnapshot = await gameRef
      .collection("scores")
      .where("holeNumber", "==", holeNumber)
      .get();

    const batch = db.batch();
    scoresSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Add new scores
    const scoresRef = gameRef.collection("scores");
    for (const score of scoreData) {
      const scoreId = `${score.playerId}_${holeNumber}`;
      batch.set(scoresRef.doc(scoreId), {
        playerId: score.playerId,
        holeNumber: score.holeNumber,
        strokes: score.strokes,
      });
    }

    // Update current hole
    batch.update(gameRef, { currentHole: holeNumber });

    await batch.commit();

    return this.hydrateGame(id);
  }

  async completeGame(id) {
    const gameRef = db.collection("games").doc(id);
    const gameDoc = await gameRef.get();

    if (!gameDoc.exists) return undefined;

    await gameRef.update({ completed: true });

    return this.hydrateGame(id);
  }

  async getHoleInfo(gameId, holeNumber) {
    const gameRef = db.collection("games").doc(gameId);
    const holeDoc = await gameRef
      .collection("holes")
      .doc(holeNumber.toString())
      .get();

    if (!holeDoc.exists) return undefined;

    const data = holeDoc.data();
    return {
      number: data.holeNumber,
      par: data.par,
      yards: data.yards,
    };
  }

  async updateHoleInfo(gameId, holeNumber, par, yards) {
    const gameRef = db.collection("games").doc(gameId);
    await gameRef.collection("holes").doc(holeNumber.toString()).set(
      {
        holeNumber,
        par,
        yards,
      },
      { merge: true }
    );

    return this.getHoleInfo(gameId, holeNumber);
  }

  async hydrateGame(gameId) {
    const gameRef = db.collection("games").doc(gameId);
    const gameDoc = await gameRef.get();

    if (!gameDoc.exists) return undefined;

    const gameData = gameDoc.data();

    // Get players
    const playersSnapshot = await gameRef.collection("players").get();
    const players = playersSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));

    // Get scores
    const scoresSnapshot = await gameRef.collection("scores").get();
    const scores = scoresSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        playerId: data.playerId,
        holeNumber: data.holeNumber,
        strokes: data.strokes,
      };
    });

    return {
      id: gameDoc.id,
      courseId: gameData.courseId,
      courseName: gameData.courseName,
      holeCount: gameData.holeCount,
      players,
      scores,
      currentHole: gameData.currentHole,
      completed: gameData.completed || false,
    };
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
      (user) => user.username === username
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

    const filteredScores = game.scores.filter(
      (score) => score.holeNumber !== holeNumber
    );

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

// Use Firestore if available, otherwise fall back to in-memory storage
export const storage = db ? new FirestoreStorage() : new MemStorage();
